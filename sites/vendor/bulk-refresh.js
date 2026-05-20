const BUTTON_ID = 'bulk-refresh-page';
const BUTTON_LABEL = 'Refresh images';
const BUTTON_DONE_MS = 1800;
const OPERATOR_KEY_STORAGE_KEY = 'mullmania-launchpad-operator-key';
const BULK_REFRESH_SETTINGS_STORAGE_KEY = 'mullmania-launchpad-bulk-refresh-settings';
const BULK_REFRESH_PIN_IMAGE_FILTER_EVENT = 'mullmania:bulk-refresh-pin-image-filter';
const BATCH_TIMEOUT_MS = 90000;
const BULK_REFRESH_MAX_CONCURRENCY = 6;

const BULK_REFRESH_DEFAULTS = Object.freeze({
  width: 1024,
  height: 768,
  settleDelayMs: 5000,
  randomizeStyle: false,
});

const BULK_REFRESH_RESOLUTIONS = Object.freeze([
  { label: 'Compact · 640 x 480', value: '640x480', width: 640, height: 480 },
  { label: 'Default · 1024 x 768', value: '1024x768', width: 1024, height: 768 },
  { label: 'Wide · 1280 x 720', value: '1280x720', width: 1280, height: 720 },
  { label: 'Poster · 1600 x 900', value: '1600x900', width: 1600, height: 900 },
]);

const BULK_REFRESH_DELAYS = Object.freeze([
  { label: 'No extra wait', value: '0' },
  { label: '250 ms', value: '250' },
  { label: '750 ms', value: '750' },
  { label: '1500 ms', value: '1500' },
  { label: '3000 ms', value: '3000' },
  { label: '5000 ms', value: '5000' },
]);

const state = {
  running: false,
  button: null,
  restoreTimer: 0,
  observer: null,
  originalAlert: null,
  alertMessages: [],
  renderRequested: false,
  dialog: null,
  dialogEls: null,
  pendingTargets: [],
  pendingRows: [],
  pendingViewLabel: '',
  targetStates: new Map(),
};

bootstrap();

function bootstrap() {
  injectStyles();
  installInlineRefreshControls();
  mount();
  ensureModal();
  requestRenderIfNeeded();

  state.observer = new MutationObserver(() => {
    installInlineRefreshControls();
    mount();
    ensureModal();
    syncTargetStates();
    requestRenderIfNeeded();
  });
  state.observer.observe(document.documentElement, { childList: true, subtree: true });
}

function installInlineRefreshControls() {
  patchTableTemplate();
  patchGalleryTemplate();
}

function patchTableTemplate() {
  const template = document.getElementById('site-row-template');
  if (!template?.content || template.content.querySelector('.site-cell__refresh-preview')) {
    return;
  }

  const cell = template.content.querySelector('.cell-preview');
  const previewShell = cell?.querySelector('.preview-shell');
  if (!cell || !previewShell) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'preview-cell';
  previewShell.replaceWith(wrapper);
  wrapper.appendChild(previewShell);
  wrapper.appendChild(buildInlineRefreshButton('site-cell__refresh-preview site-preview-refresh-chip'));
}

function patchGalleryTemplate() {
  const template = document.getElementById('gallery-card-template');
  if (!template?.content || template.content.querySelector('.gallery-card__refresh-preview')) {
    return;
  }

  const frame = template.content.querySelector('.gallery-card__frame');
  const previewButton = frame?.querySelector('.gallery-card__preview');
  if (!frame || !previewButton) {
    return;
  }

  frame.insertBefore(buildInlineRefreshButton('gallery-card__refresh-preview gallery-preview-refresh-chip'), previewButton.nextSibling);
}

function buildInlineRefreshButton(className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `preview-refresh-button ${className}`;
  button.setAttribute('aria-label', 'Refresh cached image');
  button.title = 'Refresh cached image';
  button.innerHTML = '<i class="ti ti-refresh"></i>';
  return button;
}

function requestRenderIfNeeded() {
  if (document.querySelector('.site-cell__refresh-preview, .gallery-card__refresh-preview')) {
    return;
  }

  const hasVisibleRows = document.querySelector('#site-table-body tr.site-row, #gallery-grid .gallery-card');
  if (!hasVisibleRows || state.renderRequested) {
    return;
  }

  const searchInput = document.getElementById('search');
  if (!searchInput) {
    return;
  }

  state.renderRequested = true;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  window.setTimeout(() => {
    state.renderRequested = false;
  }, 500);
}

function mount() {
  const previewHeader = document.querySelector('.workspace-table__col--preview');
  if (!previewHeader) {
    return;
  }

  let button = document.getElementById(BUTTON_ID);
  if (!button) {
    button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'bulk-refresh-button bulk-refresh-button--preview-header';
    button.title = 'Refresh images for the current page';
    button.setAttribute('aria-label', 'Refresh images for the current page');
    button.innerHTML = [
      '<span class="bulk-refresh-button__icon" aria-hidden="true">',
      '<i class="ti ti-camera"></i>',
      '<i class="ti ti-refresh"></i>',
      '</span>',
      `<span class="bulk-refresh-button__label bulk-refresh-button__label--hidden">${BUTTON_LABEL}</span>`,
    ].join('');
    button.addEventListener('click', handleBulkRefreshClick);
  }

  if (button.parentElement !== previewHeader) {
    previewHeader.appendChild(button);
  }
  state.button = button;
}

function ensureModal() {
  if (state.dialog) {
    return;
  }

  const dialog = document.createElement('div');
  dialog.id = 'bulk-refresh-dialog';
  dialog.className = 'bulk-refresh-dialog is-hidden';
  dialog.setAttribute('aria-hidden', 'true');
  dialog.innerHTML = `
    <div class="bulk-refresh-dialog__backdrop" data-close-bulk-refresh="true"></div>
    <div class="bulk-refresh-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="bulk-refresh-title">
      <div class="bulk-refresh-dialog__header modal-header">
        <div class="bulk-refresh-dialog__title-block">
          <div class="bulk-refresh-dialog__title-row">
            <i class="ti ti-refresh"></i>
            <h2 id="bulk-refresh-title" class="modal-title">Refresh images</h2>
          </div>
        </div>
        <button id="bulk-refresh-close" type="button" class="modal-close" aria-label="Close bulk refresh">&times;</button>
      </div>
      <div class="bulk-refresh-dialog__body">
        <div id="bulk-refresh-summary" class="bulk-refresh-dialog__summary"></div>
        <div class="bulk-refresh-dialog__grid">
          <label class="field">
            <span>Resolution</span>
            <select id="bulk-refresh-resolution"></select>
          </label>
          <label class="field">
            <span>Settle Delay</span>
            <input id="bulk-refresh-delay" type="text" inputmode="numeric" autocomplete="off">
          </label>
        </div>
        <label class="bulk-refresh-dialog__toggle" for="bulk-refresh-random-style">
          <input id="bulk-refresh-random-style" type="checkbox">
          <span>Randomize Mullmania UI theme</span>
        </label>
        <div class="bulk-refresh-dialog__targets">
          <div class="bulk-refresh-dialog__target-head">
            <span>Site</span>
            <span>Delay</span>
            <span>Overwrite</span>
          </div>
          <div id="bulk-refresh-target-list" class="bulk-refresh-dialog__target-list"></div>
        </div>
      </div>
      <div class="bulk-refresh-dialog__footer">
        <div id="bulk-refresh-status" class="bulk-refresh-dialog__status" aria-live="polite"></div>
        <div class="bulk-refresh-dialog__actions">
          <button id="bulk-refresh-start" type="button" class="bulk-refresh-dialog__start">
            <i class="ti ti-player-play-filled"></i>
            <span>Start refresh</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  const dialogEls = {
    summary: dialog.querySelector('#bulk-refresh-summary'),
    resolution: dialog.querySelector('#bulk-refresh-resolution'),
    delay: dialog.querySelector('#bulk-refresh-delay'),
    randomStyle: dialog.querySelector('#bulk-refresh-random-style'),
    targetList: dialog.querySelector('#bulk-refresh-target-list'),
    status: dialog.querySelector('#bulk-refresh-status'),
    start: dialog.querySelector('#bulk-refresh-start'),
  };

  dialogEls.resolution.innerHTML = BULK_REFRESH_RESOLUTIONS.map((item) => (
    `<option value="${item.value}">${item.label}</option>`
  )).join('');
  dialog.querySelector('#bulk-refresh-close')?.addEventListener('click', closeBulkRefreshModal);
  dialog.querySelector('.bulk-refresh-dialog__backdrop')?.addEventListener('click', closeBulkRefreshModal);
  dialogEls.start?.addEventListener('click', handleBulkRefreshStart);
  dialogEls.resolution?.addEventListener('change', updateBulkRefreshSummary);
  dialogEls.delay?.addEventListener('input', handleBulkRefreshGlobalDelayInput);
  dialogEls.randomStyle?.addEventListener('change', updateBulkRefreshSummary);
  dialogEls.targetList?.addEventListener('input', handleBulkRefreshTargetInput);
  dialogEls.targetList?.addEventListener('change', handleBulkRefreshTargetInput);
  document.addEventListener('keydown', handleDialogKeydown);

  state.dialog = dialog;
  state.dialogEls = dialogEls;
}

function handleDialogKeydown(event) {
  if (event.key !== 'Escape' || state.dialog?.classList.contains('is-hidden')) {
    return;
  }

  event.preventDefault();
  closeBulkRefreshModal();
}

async function handleBulkRefreshClick() {
  if (state.running) {
    return;
  }

  installInlineRefreshControls();
  requestRenderIfNeeded();
  await sleep(30);

  const targets = getCurrentPageTargets();
  if (targets.length === 0) {
    flashButton('Nothing here');
    return;
  }

  if (!getOperatorKey()) {
    flashButton('Need key');
    return;
  }

  openBulkRefreshModal(targets);
}

function openBulkRefreshModal(targets) {
  ensureModal();
  state.pendingTargets = [...targets];
  state.pendingViewLabel = getCurrentViewLabel();

  const settings = loadBulkRefreshSettings();
  state.pendingRows = state.pendingTargets.map((siteId) => ({
    siteId,
    selected: true,
    force: true,
    settleDelayMs: settings.settleDelayMs,
    delayDirty: false,
  }));

  if (state.dialogEls?.resolution) {
    state.dialogEls.resolution.value = `${settings.width}x${settings.height}`;
  }
  if (state.dialogEls?.delay) {
    state.dialogEls.delay.value = formatDelayInput(settings.settleDelayMs);
  }
  if (state.dialogEls?.randomStyle) {
    state.dialogEls.randomStyle.checked = settings.randomizeStyle === true;
  }

  renderBulkRefreshTargetRows();
  updateBulkRefreshSummary();
  updateBulkRefreshStatus('');
  state.dialog.classList.remove('is-hidden');
  state.dialog.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => {
    state.dialogEls?.start?.focus();
  }, 0);
}

function closeBulkRefreshModal() {
  if (!state.dialog || state.running) {
    return;
  }

  state.dialog.classList.add('is-hidden');
  state.dialog.setAttribute('aria-hidden', 'true');
  updateBulkRefreshStatus('');
}

function handleBulkRefreshGlobalDelayInput() {
  const delayMs = parseDelayInput(state.dialogEls?.delay?.value, BULK_REFRESH_DEFAULTS.settleDelayMs);
  for (const row of state.pendingRows) {
    if (!row.delayDirty) {
      row.settleDelayMs = delayMs;
      const rowInput = state.dialogEls?.targetList?.querySelector(
        `[data-bulk-refresh-site-id="${escapeSelectorValue(row.siteId)}"] [data-bulk-refresh-row-delay]`,
      );
      if (rowInput) {
        rowInput.value = formatDelayInput(delayMs);
      }
    }
  }
  updateBulkRefreshSummary();
}

function handleBulkRefreshTargetInput(event) {
  const control = event.target instanceof Element ? event.target : null;
  const rowEl = control?.closest?.('[data-bulk-refresh-site-id]');
  const siteId = rowEl?.dataset?.bulkRefreshSiteId || '';
  if (!siteId) {
    return;
  }

  const row = state.pendingRows.find((item) => item.siteId === siteId);
  if (!row) {
    return;
  }

  if (control.matches('[data-bulk-refresh-row-selected]')) {
    row.selected = control.checked === true;
  } else if (control.matches('[data-bulk-refresh-row-force]')) {
    row.force = control.checked === true;
  } else if (control.matches('[data-bulk-refresh-row-delay]')) {
    row.settleDelayMs = parseDelayInput(control.value, BULK_REFRESH_DEFAULTS.settleDelayMs);
    row.delayDirty = true;
  }

  updateBulkRefreshSummary();
}

function updateBulkRefreshSummary() {
  if (!state.dialogEls?.summary) {
    return;
  }

  const targetCount = getSelectedTargetRows({ skipExisting: true }).length;
  const selectedCount = getSelectedTargetRows({ skipExisting: false }).length;
  const previewLabel = targetCount === 1 ? 'image' : 'images';
  const selectedLabel = selectedCount === targetCount
    ? ''
    : ` <span class="bulk-refresh-dialog__summary-muted">(${selectedCount} selected)</span>`;
  const themeLabel = state.dialogEls.randomStyle?.checked === true
    ? ' • random Mullmania theme'
    : '';

  state.dialogEls.summary.innerHTML = `<strong>${targetCount} ${previewLabel}</strong>${selectedLabel}${themeLabel}`;
  if (state.dialogEls.start) {
    state.dialogEls.start.disabled = state.running || targetCount === 0;
  }
}

function updateBulkRefreshStatus(message, tone = '') {
  if (!state.dialogEls?.status) {
    return;
  }

  state.dialogEls.status.textContent = message || '';
  state.dialogEls.status.className = `bulk-refresh-dialog__status${tone ? ` is-${tone}` : ''}`;
}

function renderBulkRefreshTargetRows() {
  if (!state.dialogEls?.targetList) {
    return;
  }

  state.dialogEls.targetList.innerHTML = state.pendingRows.map((row, index) => {
    const siteId = row.siteId;
    const label = getRefreshTargetLabel(siteId);
    const hasPreview = targetHasExistingPreview(siteId);
    return `
      <div class="bulk-refresh-dialog__target-row" data-bulk-refresh-site-id="${escapeHtml(siteId)}">
        <label class="bulk-refresh-dialog__target-check">
          <input
            type="checkbox"
            data-bulk-refresh-row-selected="true"
            ${row.selected ? 'checked' : ''}
            aria-label="Include ${escapeHtml(label)}"
          >
          <span class="bulk-refresh-dialog__target-name">
            <strong>${escapeHtml(label)}</strong>
            <span>${escapeHtml(siteId)}${hasPreview ? ' · has image' : ' · no image'}</span>
          </span>
        </label>
        <label class="bulk-refresh-dialog__row-delay">
          <span class="bulk-refresh-dialog__cell-label">Delay</span>
          <input
            type="text"
            inputmode="numeric"
            autocomplete="off"
            data-bulk-refresh-row-delay="true"
            value="${escapeHtml(formatDelayInput(row.settleDelayMs))}"
            aria-label="Settle delay for ${escapeHtml(label)}"
          >
        </label>
        <label class="bulk-refresh-dialog__row-force">
          <span class="bulk-refresh-dialog__cell-label">Overwrite</span>
          <input
            type="checkbox"
            data-bulk-refresh-row-force="true"
            ${row.force ? 'checked' : ''}
            aria-label="Overwrite image for ${escapeHtml(label)}"
          >
        </label>
      </div>
    `;
  }).join('');
}

function getLaunchpadBulkRefreshBridge() {
  const bridge = window.__launchpadBulkRefresh;
  return bridge && typeof bridge === 'object' ? bridge : null;
}

function parseRefreshSiteIds(value) {
  return String(value || '')
    .split(',')
    .map((siteId) => siteId.trim())
    .filter(Boolean);
}

function getRepresentedSiteIdsFromElement(element) {
  if (!element) {
    return [];
  }

  const explicitSiteIds = parseRefreshSiteIds(element.dataset.refreshSiteIds);
  if (explicitSiteIds.length > 0) {
    return explicitSiteIds;
  }

  const siteId = String(element.dataset.siteId || '').trim();
  return siteId ? [siteId] : [];
}

function getEligibleSiteIdsFromElements(elements, preferredView = '') {
  const bridge = getLaunchpadBulkRefreshBridge();
  const siteIds = [];

  for (const element of elements) {
    for (const siteId of getRepresentedSiteIdsFromElement(element)) {
      if (!siteId || siteIds.includes(siteId)) {
        continue;
      }

      if (bridge?.canRefreshSite) {
        if (!bridge.canRefreshSite(siteId)) {
          continue;
        }
      } else {
        const target = resolveRefreshTarget(siteId, preferredView);
        if (!target?.button || target.button.disabled) {
          continue;
        }
      }

      siteIds.push(siteId);
    }
  }

  return siteIds;
}

function isRefreshElementSelected(element) {
  return element?.classList?.contains('is-selected') || element?.getAttribute?.('aria-selected') === 'true';
}

function getRefreshTargetsForElements(elements, preferredView) {
  const selectedElements = elements.filter(isRefreshElementSelected);
  return getEligibleSiteIdsFromElements(
    selectedElements.length > 0 ? selectedElements : elements,
    preferredView,
  );
}

function getCurrentPageTargets() {
  const tableView = document.getElementById('table-view');
  if (tableView && !tableView.classList.contains('is-hidden')) {
    return getRefreshTargetsForElements(
      Array.from(document.querySelectorAll('#site-table-body tr.site-row')),
      'table',
    );
  }

  const galleryView = document.getElementById('gallery-view');
  if (galleryView && !galleryView.classList.contains('is-hidden')) {
    return getRefreshTargetsForElements(
      Array.from(document.querySelectorAll('#gallery-grid .gallery-card')),
      'gallery',
    );
  }

  return [];
}

function getCurrentViewLabel() {
  const tableView = document.getElementById('table-view');
  if (tableView && !tableView.classList.contains('is-hidden')) {
    return 'table';
  }

  const galleryView = document.getElementById('gallery-view');
  if (galleryView && !galleryView.classList.contains('is-hidden')) {
    return 'gallery';
  }

  return 'current';
}

function resolveRefreshTarget(siteId, preferredView = '') {
  if (!siteId) {
    return null;
  }

  if (preferredView !== 'gallery') {
    const row = document.querySelector(`#site-table-body tr.site-row[data-site-id="${escapeSelectorValue(siteId)}"]`);
    if (row) {
      return {
        siteId,
        previewEl: row.querySelector('.preview-shell'),
        button: row.querySelector('.site-cell__refresh-preview'),
        image: row.querySelector('.site-preview-img'),
      };
    }
  }

  if (preferredView !== 'table') {
    const card = document.querySelector(`#gallery-grid .gallery-card[data-site-id="${escapeSelectorValue(siteId)}"]`);
    if (card) {
      return {
        siteId,
        previewEl: card.querySelector('.gallery-card__preview'),
        button: card.querySelector('.gallery-card__refresh-preview'),
        image: card.querySelector('.gallery-card__img'),
      };
    }
  }

  return null;
}

function resolveAllRefreshTargets(siteId) {
  if (!siteId) {
    return [];
  }

  const targets = [];
  const elements = [
    ...Array.from(document.querySelectorAll('#site-table-body tr.site-row')),
    ...Array.from(document.querySelectorAll('#gallery-grid .gallery-card')),
  ];

  for (const element of elements) {
    if (!getRepresentedSiteIdsFromElement(element).includes(siteId)) {
      continue;
    }

    if (element.matches('tr.site-row')) {
      targets.push({
        siteId,
        previewEl: element.querySelector('.preview-shell'),
        button: element.querySelector('.site-cell__refresh-preview'),
        image: element.querySelector('.site-preview-img'),
      });
      continue;
    }

    if (element.matches('.gallery-card')) {
      targets.push({
        siteId,
        previewEl: element.querySelector('.gallery-card__preview'),
        button: element.querySelector('.gallery-card__refresh-preview'),
        image: element.querySelector('.gallery-card__img'),
      });
    }
  }

  return targets;
}

function getRefreshTargetLabel(siteId) {
  const escapedSiteId = escapeSelectorValue(siteId);
  const row = document.querySelector(`#site-table-body tr.site-row[data-site-id="${escapedSiteId}"]`);
  const rowTitle = row?.querySelector('.site-title, .site-name, [data-site-title]')?.textContent?.trim();
  if (rowTitle) {
    return rowTitle;
  }

  const card = document.querySelector(`#gallery-grid .gallery-card[data-site-id="${escapedSiteId}"]`);
  const cardTitle = card?.querySelector('.gallery-card__title, .gallery-card__name, [data-site-title]')?.textContent?.trim();
  if (cardTitle) {
    return cardTitle;
  }

  return siteId;
}

function getOperatorKey() {
  const settingsField = document.getElementById('settings-operator-key');
  const remembered = localStorage.getItem(OPERATOR_KEY_STORAGE_KEY) || '';
  const modalValue = state.dialogEls?.operatorKey?.value?.trim() || '';
  const value = modalValue || settingsField?.value?.trim() || remembered.trim();
  if (value && settingsField && !settingsField.value.trim()) {
    settingsField.value = value;
  }
  return value;
}

function loadBulkRefreshSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(BULK_REFRESH_SETTINGS_STORAGE_KEY) || '{}');
    const width = clampInteger(raw.width, 640, 1600, BULK_REFRESH_DEFAULTS.width);
    const height = clampInteger(raw.height, 360, 900, BULK_REFRESH_DEFAULTS.height);
    const settleDelayMs = clampInteger(raw.settleDelayMs, 0, 60000, BULK_REFRESH_DEFAULTS.settleDelayMs);
    const randomizeStyle = raw.randomizeStyle === true;
    const resolutionMatch = BULK_REFRESH_RESOLUTIONS.find((item) => item.width === width && item.height === height);
    if (!resolutionMatch) {
      return { ...BULK_REFRESH_DEFAULTS, randomizeStyle };
    }
    return { width, height, settleDelayMs, randomizeStyle };
  } catch (_) {
    return { ...BULK_REFRESH_DEFAULTS };
  }
}

function persistBulkRefreshSettings(settings) {
  try {
    localStorage.setItem(BULK_REFRESH_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {
    // ignore storage failures
  }
}

async function handleBulkRefreshStart() {
  if (state.running || !state.dialogEls) {
    return;
  }

  const targets = getSelectedTargetRows({ skipExisting: true });
  if (targets.length === 0) {
    updateBulkRefreshStatus(
      getSelectedTargetRows({ skipExisting: false }).length > 0
        ? 'Selected rows already have images and overwrite is off.'
        : 'Nothing selected to queue.',
      'warning',
    );
    return;
  }

  const resolution = parseResolutionValue(state.dialogEls.resolution?.value);
  const settleDelayMs = clampInteger(
    state.dialogEls.delay?.value,
    0,
    60000,
    BULK_REFRESH_DEFAULTS.settleDelayMs,
  );
  const captureOptions = {
    width: resolution.width,
    height: resolution.height,
    settleDelayMs,
    randomizeStyle: state.dialogEls.randomStyle?.checked === true,
  };

  persistBulkRefreshSettings(captureOptions);
  closeBulkRefreshModal();
  await runBulkRefresh(targets, captureOptions);
}

function getSelectedTargetRows(options = {}) {
  const skipExisting = options.skipExisting === true;
  return state.pendingRows
    .filter((row) => row.selected)
    .filter((row) => !skipExisting || row.force || !targetHasExistingPreview(row.siteId));
}

async function runBulkRefresh(targets, captureOptions) {
  if (state.running) {
    return;
  }

  state.running = true;
  beginAlertCapture();
  setButtonBusy(true, 0, targets.length);

  targets.forEach((target) => applyTargetState(target.siteId, 'queued'));
  pinImageFilterTargets(targets.map((target) => target.siteId));

  // Bridge path uses per-siteId busy locks so it parallelises safely; DOM
  // fallback shares alert-capture and button-polling state, so keep it serial.
  const bridge = getLaunchpadBulkRefreshBridge();
  const concurrency = bridge?.refreshSitePreview
    ? Math.max(1, Math.min(BULK_REFRESH_MAX_CONCURRENCY, targets.length))
    : 1;

  let failures = 0;
  let completed = 0;
  const queue = targets.slice();

  const runWorker = async () => {
    while (queue.length > 0) {
      const target = queue.shift();
      if (!target?.siteId) {
        return;
      }
      const siteId = target.siteId;
      applyTargetState(siteId, 'refreshing');
      try {
        await refreshQueuedSite(siteId, {
          ...captureOptions,
          force: target.force !== false,
          settleDelayMs: clampInteger(target.settleDelayMs, 0, 60000, captureOptions.settleDelayMs),
        });
        applyTargetState(siteId, 'idle');
      } catch (error) {
        failures += 1;
        console.error('Bulk preview refresh failed for', siteId, error);
        applyTargetState(siteId, 'error');
      }
      completed += 1;
      setButtonBusy(true, completed, targets.length);
    }
  };

  try {
    const workers = [];
    for (let i = 0; i < concurrency; i += 1) {
      workers.push(runWorker());
    }
    await Promise.all(workers);
  } finally {
    targets.forEach((target) => clearTransientTargetState(target.siteId));
    endAlertCapture();
    state.running = false;
    flashButton(failures > 0 ? `${targets.length - failures}/${targets.length} ok` : 'Done');
  }
}

function pinImageFilterTargets(siteIds) {
  window.dispatchEvent(new CustomEvent(BULK_REFRESH_PIN_IMAGE_FILTER_EVENT, {
    detail: {
      siteIds: Array.isArray(siteIds) ? siteIds.filter(Boolean) : [],
    },
  }));
}

function clearTransientTargetState(siteId) {
  if (state.targetStates.get(siteId) === 'error') {
    return;
  }

  applyTargetState(siteId, 'idle');
}

async function refreshQueuedSite(siteId, captureOptions) {
  const bridge = getLaunchpadBulkRefreshBridge();
  if (bridge?.refreshSitePreview) {
    const result = await raceWithTimeout(
      bridge.refreshSitePreview(siteId, captureOptions),
      BATCH_TIMEOUT_MS,
      'Preview refresh timed out.',
    );
    if (!result) {
      throw new Error('Preview refresh failed.');
    }
    return result;
  }

  const target = resolveRefreshTarget(siteId);
  if (!target?.button || target.button.disabled) {
    throw new Error('Refresh control unavailable.');
  }

  return triggerExistingRefresh(siteId, target, captureOptions);
}

function raceWithTimeout(promise, timeoutMs, timeoutMessage) {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    Promise.resolve(promise)
      .then((value) => {
        window.clearTimeout(timerId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timerId);
        reject(error);
      });
  });
}

async function triggerExistingRefresh(siteId, target, captureOptions) {
  const beforeUrl = readPreviewUrl(target.image);
  const alertCount = state.alertMessages.length;

  primeRefreshButton(target.button, captureOptions);
  target.button.click();

  const result = await waitForRefreshResult(siteId, beforeUrl, alertCount);
  if (!result.ok) {
    throw new Error(result.reason || 'Preview refresh failed.');
  }
}

function primeRefreshButton(button, captureOptions) {
  if (!button?.dataset || !captureOptions) {
    return;
  }

  button.dataset.bulkRefreshForce = captureOptions.force === false ? '0' : '1';
  button.dataset.bulkRefreshWidth = String(captureOptions.width);
  button.dataset.bulkRefreshHeight = String(captureOptions.height);
  button.dataset.bulkRefreshSettleDelayMs = String(captureOptions.settleDelayMs);
  button.dataset.bulkRefreshRandomStyle = captureOptions.randomizeStyle === true ? '1' : '0';
}

function targetHasExistingPreview(siteId) {
  const bridge = getLaunchpadBulkRefreshBridge();
  if (bridge?.hasPreview) {
    return bridge.hasPreview(siteId);
  }

  const target = resolveRefreshTarget(siteId) || resolveAllRefreshTargets(siteId)[0] || null;
  const image = target?.image || null;
  return Boolean(image?.dataset?.src);
}

async function waitForRefreshResult(siteId, beforeUrl, alertCount) {
  let sawBusy = false;
  const startedAt = Date.now();

  while (Date.now() - startedAt < BATCH_TIMEOUT_MS) {
    if (state.alertMessages.length > alertCount) {
      return { ok: false, reason: state.alertMessages[state.alertMessages.length - 1] || 'Preview refresh failed.' };
    }

    const current = resolveRefreshTarget(siteId);
    const button = current?.button || null;
    const image = current?.image || null;
    const previewUrl = readPreviewUrl(image);
    const previewState = image?.dataset?.previewState || '';
    const isLoaded = image?.classList?.contains('is-loaded') || previewState === 'loaded';

    if (button?.disabled) {
      sawBusy = true;
    }

    if (sawBusy && previewUrl && previewUrl !== beforeUrl && isLoaded) {
      applyTargetState(siteId, 'idle');
      return { ok: true };
    }

    if (sawBusy && button && !button.disabled && previewUrl === beforeUrl) {
      return { ok: false, reason: 'Preview did not change.' };
    }

    await sleep(180);
  }

  return { ok: false, reason: 'Preview refresh timed out.' };
}

function readPreviewUrl(image) {
  return String(image?.dataset?.src || image?.currentSrc || image?.src || '');
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function beginAlertCapture() {
  if (state.originalAlert) {
    return;
  }

  state.alertMessages = [];
  state.originalAlert = window.alert;
  window.alert = (message) => {
    const text = String(message || 'Preview refresh failed.');
    state.alertMessages.push(text);
    console.warn(text);
  };
}

function endAlertCapture() {
  if (!state.originalAlert) {
    return;
  }

  window.alert = state.originalAlert;
  state.originalAlert = null;
}

function setPreviewState(previewEl, nextState) {
  if (!previewEl) {
    return;
  }

  previewEl.classList.toggle('is-bulk-refresh-queued', nextState === 'queued');
  previewEl.classList.toggle('is-bulk-refreshing', nextState === 'refreshing' || nextState === 'busy');
  previewEl.classList.toggle('is-bulk-refresh-error', nextState === 'error');
}

function getAggregateTargetState(siteIds = []) {
  let hasQueued = false;
  let hasRefreshing = false;
  let hasError = false;

  for (const siteId of siteIds) {
    const nextState = state.targetStates.get(siteId);
    if (nextState === 'refreshing' || nextState === 'busy') {
      hasRefreshing = true;
    } else if (nextState === 'queued') {
      hasQueued = true;
    } else if (nextState === 'error') {
      hasError = true;
    }
  }

  if (hasRefreshing) return 'refreshing';
  if (hasQueued) return 'queued';
  if (hasError) return 'error';
  return 'idle';
}

function applyElementTargetState(element) {
  if (!element) {
    return;
  }

  const nextState = getAggregateTargetState(getRepresentedSiteIdsFromElement(element));
  const previewEl = element.matches('tr.site-row')
    ? element.querySelector('.preview-shell')
    : element.querySelector('.gallery-card__preview');
  const button = element.matches('tr.site-row')
    ? element.querySelector('.site-cell__refresh-preview')
    : element.querySelector('.gallery-card__refresh-preview');

  setPreviewState(previewEl, nextState);
  if (button) {
    const suppressButton = nextState === 'queued' || nextState === 'refreshing' || nextState === 'busy';
    button.classList.toggle('is-bulk-refresh-suppressed', suppressButton);
    button.setAttribute('aria-hidden', suppressButton ? 'true' : 'false');
  }
}

function applyTargetState(siteId, nextState) {
  if (!siteId) {
    return;
  }

  if (!nextState || nextState === 'idle') {
    state.targetStates.delete(siteId);
  } else {
    state.targetStates.set(siteId, nextState);
  }

  syncTargetStates();
}

function syncTargetStates() {
  const elements = [
    ...Array.from(document.querySelectorAll('#site-table-body tr.site-row')),
    ...Array.from(document.querySelectorAll('#gallery-grid .gallery-card')),
  ];

  for (const element of elements) {
    applyElementTargetState(element);
  }
}

function setButtonBusy(isBusy, completed = 0, total = 0) {
  if (!state.button) {
    return;
  }

  window.clearTimeout(state.restoreTimer);
  state.button.disabled = isBusy;
  state.button.classList.toggle('is-busy', isBusy);
  const label = state.button.querySelector('.bulk-refresh-button__label');
  if (label) {
    label.textContent = isBusy ? `${completed}/${total}` : BUTTON_LABEL;
  }
}

function flashButton(text) {
  if (!state.button) {
    return;
  }

  setButtonBusy(false);
  const label = state.button.querySelector('.bulk-refresh-button__label');
  if (!label) {
    return;
  }

  label.textContent = text;
  state.restoreTimer = window.setTimeout(() => {
    const currentLabel = state.button?.querySelector('.bulk-refresh-button__label');
    if (currentLabel && !state.running) {
      currentLabel.textContent = BUTTON_LABEL;
    }
  }, BUTTON_DONE_MS);
}

function parseResolutionValue(value) {
  const [rawWidth = '', rawHeight = ''] = String(value || `${BULK_REFRESH_DEFAULTS.width}x${BULK_REFRESH_DEFAULTS.height}`).split('x');
  const width = clampInteger(rawWidth, 640, 1600, BULK_REFRESH_DEFAULTS.width);
  const height = clampInteger(rawHeight, 360, 900, BULK_REFRESH_DEFAULTS.height);
  return { width, height };
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDelayInput(value, fallback = BULK_REFRESH_DEFAULTS.settleDelayMs) {
  return clampInteger(String(value || '').replace(/ms\b/i, ''), 0, 60000, fallback);
}

function formatDelayInput(value) {
  return `${clampInteger(value, 0, 60000, BULK_REFRESH_DEFAULTS.settleDelayMs)} ms`;
}

function clampInteger(value, min, max, fallback) {
  const parsed = parseInteger(value, fallback);
  return Math.min(max, Math.max(min, parsed));
}

function escapeSelectorValue(value) {
  if (window.CSS?.escape) {
    return window.CSS.escape(value);
  }

  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectStyles() {
  if (document.getElementById('bulk-refresh-inline-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'bulk-refresh-inline-styles';
  style.textContent = `
    .bulk-refresh-button.is-busy .ti-refresh {
      animation: bulk-refresh-spin 0.9s linear infinite;
    }

    .bulk-refresh-button--preview-header {
      float: right;
      position: relative;
      display: inline-grid;
      place-items: center;
      width: 24px;
      height: 24px;
      margin: -2px 0 -2px 6px;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: color-mix(in srgb, currentColor 56%, transparent);
      box-shadow: none;
      cursor: pointer;
      vertical-align: middle;
    }

    .bulk-refresh-button--preview-header:hover,
    .bulk-refresh-button--preview-header:focus-visible {
      background: color-mix(in srgb, currentColor 9%, transparent);
      color: currentColor;
      box-shadow: none;
    }

    .bulk-refresh-button--preview-header:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .bulk-refresh-button--preview-header:disabled {
      cursor: wait;
      opacity: 0.72;
    }

    .bulk-refresh-button__icon {
      position: relative;
      display: grid;
      place-items: center;
      width: 18px;
      height: 18px;
      line-height: 1;
    }

    .bulk-refresh-button__icon .ti-camera {
      font-size: 17px;
    }

    .bulk-refresh-button__icon .ti-refresh {
      position: absolute;
      right: -3px;
      bottom: -3px;
      display: grid;
      place-items: center;
      width: 11px;
      height: 11px;
      border-radius: 999px;
      background: var(--surface-header-bg, var(--bg-primary, #fff));
      font-size: 10px;
    }

    .bulk-refresh-button__label--hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .preview-cell {
      position: relative;
      display: inline-grid;
      place-items: center;
    }

    .gallery-preview-refresh-chip {
      position: absolute;
      left: 10px;
      bottom: 10px;
      z-index: 4;
      width: 30px;
      min-height: 30px;
      padding: 0;
      border: 0;
      border-radius: 9px;
      background: rgba(7, 23, 44, 0.74);
      color: #fff;
      box-shadow: var(--shadow-sm);
      opacity: 0;
      transform: translateY(4px);
      transition: opacity var(--transition-base), transform var(--transition-base), background-color var(--transition-base);
    }

    .site-preview-refresh-chip {
      display: none !important;
    }

    .gallery-card__frame:hover .gallery-preview-refresh-chip,
    .gallery-card__frame:focus-within .gallery-preview-refresh-chip,
    .gallery-preview-refresh-chip:focus-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .gallery-preview-refresh-chip:hover:not(:disabled) {
      border: 0;
      background: rgba(10, 110, 203, 0.92);
      color: #fff;
    }

    .gallery-preview-refresh-chip:disabled {
      cursor: progress;
    }

    .gallery-preview-refresh-chip.is-bulk-refresh-suppressed,
    .gallery-card__preview.is-bulk-refresh-queued + .gallery-preview-refresh-chip,
    .gallery-card__preview.is-bulk-refreshing + .gallery-preview-refresh-chip {
      opacity: 0 !important;
      transform: translateY(4px) !important;
      pointer-events: none !important;
    }

    .preview-shell.is-bulk-refresh-queued,
    .preview-shell.is-bulk-refreshing,
    .gallery-card__preview.is-bulk-refresh-queued,
    .gallery-card__preview.is-bulk-refreshing {
      position: relative;
      isolation: isolate;
    }

    .preview-shell.is-bulk-refresh-queued::before,
    .gallery-card__preview.is-bulk-refresh-queued::before,
    .preview-shell.is-bulk-refreshing::before,
    .gallery-card__preview.is-bulk-refreshing::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
    }

    .preview-shell.is-bulk-refresh-queued::before,
    .gallery-card__preview.is-bulk-refresh-queued::before {
      background: rgba(247, 250, 252, 0.56);
      backdrop-filter: saturate(0.84);
    }

    .preview-shell.is-bulk-refreshing::before,
    .gallery-card__preview.is-bulk-refreshing::before {
      background: rgba(239, 244, 249, 0.78);
      backdrop-filter: grayscale(0.12);
    }

    .preview-shell.is-bulk-refresh-queued::after,
    .gallery-card__preview.is-bulk-refresh-queued::after,
    .preview-shell.is-bulk-refreshing::after,
    .gallery-card__preview.is-bulk-refreshing::after {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 3;
      pointer-events: none;
    }

    .preview-shell.is-bulk-refresh-queued::after,
    .gallery-card__preview.is-bulk-refresh-queued::after {
      content: '...';
      color: #143655;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.24em;
      text-indent: 0.24em;
      transform: translate(-50%, -50%);
    }

    .preview-shell.is-bulk-refreshing::after,
    .gallery-card__preview.is-bulk-refreshing::after {
      content: '';
      width: 28px;
      height: 28px;
      margin: -17px 0 0 -17px;
      border: 3px solid rgba(20, 54, 85, 0.22);
      border-top-color: #143655;
      border-radius: 999px;
      animation: bulk-refresh-spin 0.9s linear infinite;
    }

    .preview-shell.is-bulk-refresh-queued .site-preview-img,
    .gallery-card__preview.is-bulk-refresh-queued .gallery-card__img {
      opacity: 0.42;
      filter: saturate(0.84);
    }

    .preview-shell.is-bulk-refreshing .site-preview-img,
    .gallery-card__preview.is-bulk-refreshing .gallery-card__img {
      opacity: 0.18;
      filter: grayscale(0.18) saturate(0.42) blur(0.6px);
    }

    .preview-shell.is-bulk-refresh-error,
    .gallery-card__preview.is-bulk-refresh-error {
      box-shadow: inset 0 0 0 2px rgba(141, 47, 31, 0.5);
    }

    .bulk-refresh-dialog {
      position: fixed;
      inset: 0;
      z-index: 2100;
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .bulk-refresh-dialog.is-hidden {
      display: none;
    }

    .bulk-refresh-dialog__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.46);
      backdrop-filter: blur(8px);
    }

    .bulk-refresh-dialog__panel {
      --bulk-refresh-accent: var(--launchpad-accent, var(--color-shell-accent, var(--color-secondary, var(--color-primary, #0a6ecb))));

      position: relative;
      width: min(100%, 780px);
      max-height: min(92vh, 820px);
      overflow: auto;
      border: 1px solid var(--border-color, rgba(148, 163, 184, 0.24));
      border-radius: 22px;
      background: color-mix(in srgb, var(--bg-primary, #ffffff) 96%, transparent);
      box-shadow: var(--shadow-lg, 0 28px 64px rgba(15, 23, 42, 0.24));
      color: var(--text-primary, #17324d);
    }

    .bulk-refresh-dialog__header,
    .bulk-refresh-dialog__footer {
      padding: 20px 22px;
    }

    .bulk-refresh-dialog__body {
      padding: 0 22px 22px;
      display: grid;
      gap: 16px;
    }

    .bulk-refresh-dialog__title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .bulk-refresh-dialog__summary {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      padding: 14px 16px;
      border-radius: 16px;
      background: color-mix(in srgb, var(--bulk-refresh-accent) 10%, var(--bg-secondary, #f8fafc));
      color: color-mix(in srgb, var(--bulk-refresh-accent) 64%, var(--text-primary, #17324d));
      font-size: 14px;
    }

    .bulk-refresh-dialog__summary strong {
      color: var(--text-primary, #12304d);
    }

    .bulk-refresh-dialog__summary-muted {
      color: var(--text-secondary, #5c6f84);
    }

    .bulk-refresh-dialog__summary-sep {
      color: color-mix(in srgb, var(--text-secondary, #5c6f84) 54%, transparent);
    }

    .bulk-refresh-dialog__grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bulk-refresh-dialog__toggle {
      display: inline-grid;
      grid-auto-flow: column;
      grid-auto-columns: max-content;
      gap: 10px;
      align-items: center;
      justify-content: start;
      color: var(--text-primary, #244463);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .bulk-refresh-dialog__toggle input {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--bulk-refresh-accent);
    }

    .bulk-refresh-dialog__grid select,
    .bulk-refresh-dialog__grid input,
    .bulk-refresh-dialog__row-delay input {
      width: 100%;
    }

    .bulk-refresh-dialog__targets {
      display: grid;
      min-height: 0;
      border: 1px solid var(--border-color, rgba(148, 163, 184, 0.32));
      border-radius: 14px;
      overflow: hidden;
      background: color-mix(in srgb, var(--bg-secondary, #f8fafc) 86%, transparent);
    }

    .bulk-refresh-dialog__target-head,
    .bulk-refresh-dialog__target-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 118px 92px;
      gap: 12px;
      align-items: center;
    }

    .bulk-refresh-dialog__target-head {
      padding: 10px 12px;
      border-bottom: 1px solid color-mix(in srgb, var(--border-color, #94a3b8) 72%, transparent);
      color: var(--text-secondary, #64748b);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .bulk-refresh-dialog__target-list {
      display: grid;
      max-height: min(34vh, 320px);
      overflow: auto;
    }

    .bulk-refresh-dialog__target-row {
      padding: 10px 12px;
      border-bottom: 1px solid color-mix(in srgb, var(--border-color, #94a3b8) 58%, transparent);
    }

    .bulk-refresh-dialog__target-row:last-child {
      border-bottom: 0;
    }

    .bulk-refresh-dialog__target-check,
    .bulk-refresh-dialog__row-force {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;
      cursor: pointer;
    }

    .bulk-refresh-dialog__target-check input,
    .bulk-refresh-dialog__row-force input {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--bulk-refresh-accent);
    }

    .bulk-refresh-dialog__target-name {
      display: grid;
      min-width: 0;
      gap: 2px;
    }

    .bulk-refresh-dialog__target-name strong,
    .bulk-refresh-dialog__target-name span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bulk-refresh-dialog__target-name strong {
      color: var(--text-primary, #102a43);
      font-size: 14px;
    }

    .bulk-refresh-dialog__target-name span {
      color: var(--text-secondary, #64748b);
      font-size: 12px;
    }

    .bulk-refresh-dialog__row-delay {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .bulk-refresh-dialog__cell-label {
      display: none;
    }

    .bulk-refresh-dialog__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-top: 1px solid color-mix(in srgb, var(--border-color, #94a3b8) 52%, transparent);
    }

    .bulk-refresh-dialog__status {
      min-height: 20px;
      color: var(--text-secondary, #5c6f84);
      font-size: 14px;
    }

    .bulk-refresh-dialog__status.is-warning {
      color: #8b3d26;
    }

    .bulk-refresh-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .bulk-refresh-dialog__start {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 720px) {
      .bulk-refresh-dialog {
        padding: 12px;
      }

      .bulk-refresh-dialog__panel {
        width: 100%;
      }

      .bulk-refresh-dialog__grid {
        grid-template-columns: 1fr;
      }

      .bulk-refresh-dialog__target-head {
        display: none;
      }

      .bulk-refresh-dialog__target-row {
        grid-template-columns: 1fr;
      }

      .bulk-refresh-dialog__cell-label {
        display: block;
        color: var(--text-secondary, #64748b);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .bulk-refresh-dialog__footer {
        flex-direction: column;
        align-items: stretch;
      }

      .bulk-refresh-dialog__actions {
        width: 100%;
      }

      .bulk-refresh-dialog__start {
        width: 100%;
        justify-content: center;
      }
    }

    @keyframes bulk-refresh-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
