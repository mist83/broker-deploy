const CONFIG_URL = './config.json';
const CATALOG_FALLBACK_URL = './catalog.json';
const PREVIEW_MANIFEST_URL = './previews/manifest.json';
const OPERATOR_KEY_STORAGE_KEY = 'mullmania-launchpad-operator-key';
const CATEGORY_BOARD_STORAGE_KEY = 'mullmania-launchpad-category-board';
const CATEGORY_BOARD_LOCAL_ASSIGNMENTS_STORAGE_KEY = 'mullmania-launchpad-category-board-assignments';

const SYSTEM_TAG_IDS = new Set([
  'curated',
  'github',
  'mullmania',
  'public-frontdoor',
  'repo-artifacts',
  'canon-deploy-ready',
  'dual-static',
  'private',
  'public',
]);

const DEFAULT_BUCKETS = Object.freeze([
  { id: 'frontend-ui', label: 'Frontend / UI', icon: 'ti ti-layout-dashboard', aliases: ['frontend-ui', 'shared-ui', 'frontend', 'css', 'design', 'editor'] },
  { id: 'tooling', label: 'Tooling', icon: 'ti ti-tool', aliases: ['tooling', 'developer-tooling', 'automation', 'library', 'framework-support'] },
  { id: 'data', label: 'Data', icon: 'ti ti-database', aliases: ['data', 'mullmania-data', 'generated-assets'] },
  { id: 'games', label: 'Games', icon: 'ti ti-device-gamepad-2', aliases: ['games', 'game', 'arcade', 'card-game', 'minigame', 'multiplayer'] },
  { id: 'fun-experiment', label: 'Fun / Experiment', icon: 'ti ti-confetti', aliases: ['fun-experiment', 'fun', 'experiment', 'experiments', 'playground', 'prototype'] },
  { id: 'simulation', label: 'Simulation', icon: 'ti ti-atom', aliases: ['simulation', 'physics', 'science-art'] },
  { id: 'docs', label: 'Docs', icon: 'ti ti-file-text', aliases: ['docs', 'documentation', 'demo-docs'] },
  { id: 'audio-visual', label: 'Audio / Visual', icon: 'ti ti-wave-sine', aliases: ['audio-visual', 'audio', 'music'] },
  { id: 'backend-api', label: 'Backend / API', icon: 'ti ti-cloud-code', aliases: ['backend-api', 'api', 'backend', 'lambda-api', 'lambda-backed'] },
]);
const DEFAULT_BUCKETS_BY_LABEL = new Map(DEFAULT_BUCKETS.map((bucket) => [bucket.label.toLowerCase(), bucket]));
const CATEGORY_TAG_IDS = new Set(DEFAULT_BUCKETS.map((bucket) => bucket.id));
const CATEGORY_TAG_ALIAS_BY_ID = new Map(DEFAULT_BUCKETS.flatMap((bucket) => (
  [bucket.id, ...(bucket.aliases || [])].map((alias) => [alias, bucket.id])
)));
const CATEGORY_BEHAVIORS = Object.freeze({
  any: { id: 'any', label: 'OR', limit: Infinity },
  single: { id: 'single', label: 'OR, max 1', limit: 1 },
  max2: { id: 'max2', label: 'OR, max 2', limit: 2 },
  all: { id: 'all', label: 'AND', limit: Infinity },
});
const DEFAULT_CATEGORY_SETS = Object.freeze([
  {
    id: 'tags',
    label: 'Tags',
    adapter: 'tags',
    behavior: 'any',
    categories: DEFAULT_BUCKETS,
  },
  {
    id: 'focus',
    label: 'Focus',
    adapter: 'local',
    behavior: 'max2',
    categories: [
      { id: 'now', label: 'Now', icon: 'ti ti-bolt', aliases: ['now'] },
      { id: 'next', label: 'Next', icon: 'ti ti-arrow-right', aliases: ['next'] },
      { id: 'later', label: 'Later', icon: 'ti ti-clock', aliases: ['later'] },
      { id: 'stuck', label: 'Stuck', icon: 'ti ti-alert-triangle', aliases: ['stuck'] },
    ],
  },
  {
    id: 'shape',
    label: 'Shape',
    adapter: 'local',
    behavior: 'max2',
    categories: [
      { id: 'app', label: 'App', icon: 'ti ti-app-window', aliases: ['app'] },
      { id: 'service', label: 'Service', icon: 'ti ti-server', aliases: ['service'] },
      { id: 'content', label: 'Content', icon: 'ti ti-file-text', aliases: ['content'] },
      { id: 'tool', label: 'Tool', icon: 'ti ti-tool', aliases: ['tool'] },
    ],
  },
]);

const state = {
  apiBaseUrl: '',
  entries: [],
  tagRegistry: [],
  previewManifest: {},
  board: loadStoredBoard(),
  localAssignments: loadLocalAssignments(),
  editorDraft: null,
  query: '',
  dragSiteId: '',
  busy: false,
  savingSiteId: '',
  error: '',
  flashMessage: '',
};

const elements = {
  root: document.getElementById('categorize-view'),
  summary: document.getElementById('sweep-summary'),
  generated: document.getElementById('sweep-generated'),
  status: document.getElementById('sweep-status'),
  lanes: document.getElementById('sweep-lanes'),
  addBucket: document.getElementById('category-add-bucket'),
  setSelect: document.getElementById('category-set-select'),
  behaviorSelect: document.getElementById('category-behavior-select'),
  editorModal: document.getElementById('category-editor-modal'),
  editorSet: document.getElementById('category-editor-set'),
  editorBehavior: document.getElementById('category-editor-behavior'),
  editorList: document.getElementById('category-editor-list'),
  editorNewLabel: document.getElementById('category-editor-new-label'),
  editorAdd: document.getElementById('category-editor-add'),
  editorSave: document.getElementById('category-editor-save'),
  editorStatus: document.getElementById('category-editor-status'),
};

let visibilityObserver = null;
let flashTimer = null;

init();

function init() {
  if (!elements.root || !elements.lanes) {
    return;
  }

  bindStaticEvents();
  visibilityObserver = new MutationObserver(handleVisibility);
  visibilityObserver.observe(elements.root, { attributes: true, attributeFilter: ['class'] });
  render();
  handleVisibility();
}

function bindStaticEvents() {
  document.addEventListener('input', (event) => {
    if (event.target !== getMastheadSearchInput()) {
      return;
    }
    syncQueryFromMasthead();
    render();
  });
  window.addEventListener('mullmania-search-change', () => {
    syncQueryFromMasthead();
    render();
  });

  elements.addBucket?.addEventListener('click', () => openCategoryEditor());
  elements.setSelect?.addEventListener('change', () => {
    setActiveCategorySet(elements.setSelect.value);
  });
  elements.behaviorSelect?.addEventListener('change', () => {
    setActiveCategoryBehavior(elements.behaviorSelect.value);
  });
  elements.editorSet?.addEventListener('change', () => {
    if (!state.editorDraft) {
      return;
    }
    state.editorDraft.activeSetId = elements.editorSet.value;
    renderCategoryEditor();
  });
  elements.editorBehavior?.addEventListener('change', () => {
    if (!state.editorDraft) {
      return;
    }
    const set = getDraftCategorySet(state.editorDraft.activeSetId);
    if (set) {
      set.behavior = normalizeBehaviorId(elements.editorBehavior.value);
    }
  });
  elements.editorAdd?.addEventListener('click', () => addDraftCategory());
  elements.editorNewLabel?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addDraftCategory();
    }
  });
  elements.editorSave?.addEventListener('click', () => saveCategoryEditor());
  elements.editorModal?.addEventListener('click', (event) => {
    const close = event.target instanceof Element ? event.target.closest('[data-close-category-editor]') : null;
    if (close) {
      closeCategoryEditor();
    }
  });

  elements.root.addEventListener('keydown', (event) => {
    if (!isVisible()) {
      return;
    }
    if (event.key === '/' && !isEditableTarget(event.target)) {
      event.preventDefault();
      getMastheadSearchInput()?.focus();
    }
  });
  elements.root.addEventListener('mouseover', (event) => {
    const card = event.target instanceof Element ? event.target.closest('[data-category-site]') : null;
    if (card instanceof HTMLElement) {
      setPeerHover(card.dataset.categorySite || '');
    }
  });
  elements.root.addEventListener('mouseout', (event) => {
    const card = event.target instanceof Element ? event.target.closest('[data-category-site]') : null;
    if (!(card instanceof HTMLElement)) {
      return;
    }
    if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) {
      return;
    }
    clearPeerHover(card.dataset.categorySite || '');
  });
  elements.root.addEventListener('focusin', (event) => {
    const card = event.target instanceof Element ? event.target.closest('[data-category-site]') : null;
    if (card instanceof HTMLElement) {
      setPeerHover(card.dataset.categorySite || '');
    }
  });
  elements.root.addEventListener('focusout', (event) => {
    const card = event.target instanceof Element ? event.target.closest('[data-category-site]') : null;
    if (!(card instanceof HTMLElement)) {
      return;
    }
    if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) {
      return;
    }
    clearPeerHover(card.dataset.categorySite || '');
  });

}

function handleVisibility() {
  if (!isVisible()) {
    state.dragSiteId = '';
    clearDragHighlights();
    return;
  }
  if (!state.entries.length && !state.busy) {
    void refreshBoard(false);
    return;
  }
  syncQueryFromMasthead();
  render();
}

function isVisible() {
  return elements.root instanceof HTMLElement && !elements.root.classList.contains('is-hidden');
}

function getMastheadSearchInput() {
  return document.getElementById('search');
}

function syncQueryFromMasthead() {
  const input = getMastheadSearchInput();
  state.query = String(input?.value || '').trim().toLowerCase();
}

async function refreshBoard(force = false) {
  if (state.busy && !force) {
    return;
  }
  state.busy = true;
  state.error = '';
  render();
  try {
    const config = await fetchOptionalJson(CONFIG_URL);
    state.apiBaseUrl = String(config?.apiBaseUrl || '').replace(/\/+$/, '');
    const [catalogPayload, tagPayload, previewPayload] = await Promise.all([
      loadCatalogPayload(),
      loadTagPayload(),
      loadPreviewManifest(),
    ]);
    state.entries = normalizeEntries(catalogPayload?.sites || catalogPayload || []);
    state.tagRegistry = normalizeTagRegistry(tagPayload?.tags || []);
    state.previewManifest = normalizePreviewManifest(previewPayload);
  } catch (error) {
    state.error = error instanceof Error ? error.message : 'Could not load category data.';
  } finally {
    state.busy = false;
    render();
  }
}

async function loadCatalogPayload() {
  if (state.apiBaseUrl) {
    return fetchJson(`${state.apiBaseUrl}/api/catalog`);
  }
  return fetchJson(CATALOG_FALLBACK_URL);
}

async function loadTagPayload() {
  if (!state.apiBaseUrl) {
    return { tags: [] };
  }
  try {
    return await fetchJson(`${state.apiBaseUrl}/api/catalog/tags`);
  } catch {
    return { tags: [] };
  }
}

async function loadPreviewManifest() {
  try {
    return await fetchJson(getPreviewManifestUrl());
  } catch {
    return {};
  }
}

function getPreviewManifestUrl() {
  if (state.apiBaseUrl) {
    return `${state.apiBaseUrl}/api/previews/manifest.json`;
  }
  return PREVIEW_MANIFEST_URL;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status}).`);
  }
  return data;
}

async function fetchOptionalJson(url) {
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
}

function normalizeEntries(rawEntries) {
  return (Array.isArray(rawEntries) ? rawEntries : [])
    .filter((entry) => entry && entry.hasHostedSite !== false)
    .map((entry) => {
      const siteId = String(entry.siteId || entry.id || '').trim();
      const host = String(entry.host || (siteId ? `${siteId}.mullmania.com` : '')).trim();
      const tags = normalizeTagList(entry.tags || []);
      return {
        ...entry,
        siteId,
        host,
        url: String(entry.url || (host ? `https://${host}/` : '')).trim(),
        displayName: String(entry.displayName || entry.title || siteId || host).trim(),
        description: String(entry.description || '').trim(),
        notes: Array.isArray(entry.notes) ? entry.notes.map((note) => String(note || '').trim()).filter(Boolean) : [],
        tags,
        searchText: [
          siteId,
          host,
          entry.displayName,
          entry.title,
          entry.description,
          ...(Array.isArray(entry.notes) ? entry.notes : []),
        ].map((value) => String(value || '').toLowerCase()).join(' '),
      };
    })
    .filter((entry) => entry.siteId)
    .sort((left, right) => left.siteId.localeCompare(right.siteId));
}

function normalizePreviewManifest(payload) {
  const source = payload?.entries || payload?.sites || payload?.previews || payload || {};
  const entries = Array.isArray(source)
    ? source.map((item) => [item?.siteId || item?.id, item])
    : Object.entries(source);
  return Object.fromEntries(entries
    .map(([siteId, value]) => {
      const normalizedSiteId = String(siteId || value?.siteId || '').trim();
      if (value && typeof value === 'object' && value.status && value.status !== 'ok') {
        return null;
      }
      const version = String(value?.version ?? '').trim();
      const path = String(value?.path || (normalizedSiteId ? `/api/previews/${normalizedSiteId}.png` : '')).trim();
      const rawUrl = String(value?.url || value?.previewUrl || (version && path ? `${path}?v=${encodeURIComponent(version)}` : path) || '').trim();
      const url = resolvePreviewUrl(rawUrl);
      return normalizedSiteId && url ? [normalizedSiteId, url] : null;
    })
    .filter(Boolean));
}

function resolvePreviewUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) {
    return raw;
  }
  if (raw.startsWith('/api/previews/') && state.apiBaseUrl) {
    return `${state.apiBaseUrl}${raw}`;
  }
  return raw;
}

function normalizeTagRegistry(rawTags) {
  const registry = new Map();
  for (const tag of Array.isArray(rawTags) ? rawTags : []) {
    const id = normalizeTagId(tag?.id || tag?.tagId || tag?.label || tag?.name);
    if (!id) {
      continue;
    }
    registry.set(id, {
      id,
      label: normalizeTagLabel(tag?.label || tag?.name || id),
    });
  }
  for (const entry of state.entries) {
    for (const tagId of entry.tags) {
      if (!registry.has(tagId)) {
        registry.set(tagId, { id: tagId, label: humanizeTagId(tagId) });
      }
    }
  }
  return Array.from(registry.values()).sort((left, right) => left.label.localeCompare(right.label));
}

function normalizeTagList(values) {
  return Array.from(new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => canonicalizeCategoryTagId(value))
      .filter(Boolean)
  )).sort((left, right) => getTagLabel(left).localeCompare(getTagLabel(right)));
}

function normalizeTagId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function canonicalizeCategoryTagId(value) {
  const normalized = normalizeTagId(value);
  return CATEGORY_TAG_ALIAS_BY_ID.get(normalized) || (CATEGORY_TAG_IDS.has(normalized) ? normalized : '');
}

function normalizeTagLabel(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function humanizeTagId(tagId) {
  return String(tagId || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getTagLabel(tagId) {
  const normalized = normalizeTagId(tagId);
  const category = getActiveCategories().find((item) => item.id === normalized);
  if (category) {
    return category.label;
  }
  return state.tagRegistry.find((tag) => tag.id === normalized)?.label || humanizeTagId(normalized);
}

function cloneCategorySet(set) {
  return {
    ...set,
    categories: (Array.isArray(set.categories) ? set.categories : []).map((category) => ({
      ...category,
      aliases: Array.isArray(category.aliases) ? [...category.aliases] : [category.id],
    })),
  };
}

function createDefaultBoard() {
  return {
    activeSetId: 'tags',
    sets: DEFAULT_CATEGORY_SETS.map(cloneCategorySet),
  };
}

function loadStoredBoard() {
  const fallback = createDefaultBoard();
  try {
    const stored = JSON.parse(localStorage.getItem(CATEGORY_BOARD_STORAGE_KEY) || 'null');
    if (Array.isArray(stored)) {
      const migrated = stored.map((bucket) => normalizeCategoryChoice(bucket, 'tags')).filter(Boolean);
      return {
        activeSetId: 'tags',
        sets: [
          { ...cloneCategorySet(DEFAULT_CATEGORY_SETS[0]), categories: migrated.length ? migrated : cloneCategorySet(DEFAULT_CATEGORY_SETS[0]).categories },
          ...DEFAULT_CATEGORY_SETS.slice(1).map(cloneCategorySet),
        ],
      };
    }

    const storedSets = Array.isArray(stored?.sets) ? stored.sets : [];
    const byId = new Map(fallback.sets.map((set) => [set.id, set]));
    for (const rawSet of storedSets) {
      const normalizedSet = normalizeCategorySet(rawSet);
      if (normalizedSet) {
        byId.set(normalizedSet.id, normalizedSet);
      }
    }
    const sets = DEFAULT_CATEGORY_SETS
      .map((set) => byId.get(set.id) || cloneCategorySet(set))
      .filter(Boolean);
    const activeSetId = sets.some((set) => set.id === stored?.activeSetId) ? stored.activeSetId : fallback.activeSetId;
    return { activeSetId, sets };
  } catch {
    return fallback;
  }
}

function persistBoard() {
  localStorage.setItem(CATEGORY_BOARD_STORAGE_KEY, JSON.stringify(state.board));
}

function loadLocalAssignments() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CATEGORY_BOARD_LOCAL_ASSIGNMENTS_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function persistLocalAssignments() {
  localStorage.setItem(CATEGORY_BOARD_LOCAL_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(state.localAssignments));
}

function normalizeBehaviorId(value) {
  return CATEGORY_BEHAVIORS[value] ? value : 'any';
}

function normalizeCategorySet(value) {
  const id = normalizeTagId(value?.id || value?.label || value?.name);
  const defaultSet = DEFAULT_CATEGORY_SETS.find((set) => set.id === id) || null;
  if (!id) {
    return null;
  }
  const adapter = defaultSet?.adapter || (value?.adapter === 'tags' ? 'tags' : 'local');
  const categories = (Array.isArray(value?.categories) ? value.categories : defaultSet?.categories || [])
    .map((category) => normalizeCategoryChoice(category, adapter))
    .filter(Boolean);
  return {
    id,
    label: normalizeTagLabel(value?.label || defaultSet?.label || humanizeTagId(id)),
    adapter,
    behavior: normalizeBehaviorId(value?.behavior || defaultSet?.behavior),
    categories,
  };
}

function normalizeCategoryChoice(value, adapter = getActiveCategorySet()?.adapter || 'local') {
  const label = normalizeTagLabel(value?.label || value?.name || value?.id || '');
  const defaultBucket = adapter === 'tags' ? DEFAULT_BUCKETS_BY_LABEL.get(label.toLowerCase()) || null : null;
  if (defaultBucket) {
    return { ...defaultBucket, aliases: [...defaultBucket.aliases] };
  }

  const id = adapter === 'tags'
    ? canonicalizeCategoryTagId(value?.id || label)
    : normalizeTagId(value?.id || label);
  if (!id || SYSTEM_TAG_IDS.has(id)) {
    return null;
  }
  const aliases = adapter === 'tags'
    ? normalizeTagList([id, ...(Array.isArray(value?.aliases) ? value.aliases : [])]).filter((tagId) => !SYSTEM_TAG_IDS.has(tagId))
    : Array.from(new Set([id, ...(Array.isArray(value?.aliases) ? value.aliases.map(normalizeTagId) : [])].filter(Boolean)));
  return {
    id,
    label: label || humanizeTagId(id),
    icon: String(value?.icon || 'ti ti-tag').trim() || 'ti ti-tag',
    aliases: aliases.length ? aliases : [id],
  };
}

function getActiveCategorySet() {
  return state.board.sets.find((set) => set.id === state.board.activeSetId) || state.board.sets[0] || cloneCategorySet(DEFAULT_CATEGORY_SETS[0]);
}

function getActiveCategories() {
  return getActiveCategorySet().categories || [];
}

function setActiveCategorySet(setId) {
  if (!state.board.sets.some((set) => set.id === setId)) {
    return;
  }
  state.board.activeSetId = setId;
  persistBoard();
  render();
}

function setActiveCategoryBehavior(behaviorId) {
  const set = getActiveCategorySet();
  set.behavior = normalizeBehaviorId(behaviorId);
  persistBoard();
  render();
}

function getBehaviorLimit(set = getActiveCategorySet()) {
  return CATEGORY_BEHAVIORS[normalizeBehaviorId(set?.behavior)]?.limit ?? Infinity;
}

function render() {
  if (!elements.generated || !elements.status || !elements.lanes) {
    return;
  }

  syncQueryFromMasthead();

  const filteredEntries = getFilteredEntries();
  const activeSet = getActiveCategorySet();
  const visibleCategoryIds = getVisibleCategoryIds();
  const sourceEntries = getSourceEntries(filteredEntries, visibleCategoryIds);
  const representedCount = state.entries.filter((entry) => hasAnyCategory(entry, visibleCategoryIds)).length;

  if (elements.summary) {
    elements.summary.textContent = state.error
      ? state.error
      : `${state.entries.length.toLocaleString()} apps · ${getActiveCategories().length} categories · ${representedCount.toLocaleString()} represented`;
  }
  syncBoardControls(activeSet);
  elements.generated.textContent = `${activeSet.label} · ${CATEGORY_BEHAVIORS[normalizeBehaviorId(activeSet.behavior)].label}`;
  elements.status.textContent = state.flashMessage || (state.savingSiteId ? `Saving ${state.savingSiteId}...` : '');
  elements.addBucket.disabled = state.busy;

  renderBoard(filteredEntries, sourceEntries);
}

function syncBoardControls(activeSet = getActiveCategorySet()) {
  if (elements.setSelect) {
    elements.setSelect.innerHTML = state.board.sets
      .map((set) => `<option value="${escapeHtml(set.id)}">${escapeHtml(set.label)}</option>`)
      .join('');
    elements.setSelect.value = activeSet.id;
  }
  if (elements.behaviorSelect) {
    elements.behaviorSelect.value = normalizeBehaviorId(activeSet.behavior);
  }
}

function getFilteredEntries() {
  if (!state.query) {
    return state.entries;
  }
  return state.entries.filter((entry) => entry.searchText.includes(state.query));
}

function normalizeDisplayGroupLabel(entry) {
  return String(entry?.displayName || entry?.title || entry?.siteId || entry?.host || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function getDisplayGroupKey(entry) {
  const label = normalizeDisplayGroupLabel(entry);
  return label ? label.toLowerCase() : '';
}

function getEntryGroupMembers(entry) {
  const key = getDisplayGroupKey(entry);
  if (!key) {
    return entry ? [entry] : [];
  }
  return state.entries
    .filter((candidate) => getDisplayGroupKey(candidate) === key)
    .sort(compareEntries);
}

function groupEntriesByName(entries) {
  const groups = new Map();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const key = getDisplayGroupKey(entry) || entry.siteId;
    const existing = groups.get(key);
    if (existing) {
      existing.visibleMembers.push(entry);
      continue;
    }
    const members = getEntryGroupMembers(entry);
    const representative = pickGroupRepresentative(members, entry);
    groups.set(key, {
      ...representative,
      siteId: representative.siteId,
      displayName: normalizeDisplayGroupLabel(representative),
      groupKey: key,
      groupMembers: members,
      visibleMembers: [entry],
      host: members.length > 1
        ? `${members.length.toLocaleString()} URLs`
        : representative.host,
      searchText: members.map((member) => member.searchText).join(' '),
    });
  }
  return Array.from(groups.values()).sort(compareEntries);
}

function pickGroupRepresentative(members, fallback) {
  return members.find((entry) => entry.currentHostedSite)
    || members.find((entry) => entry.isPublic)
    || members[0]
    || fallback;
}

function compareEntries(left, right) {
  return String(left?.displayName || left?.siteId || '').localeCompare(String(right?.displayName || right?.siteId || ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  }) || String(left?.siteId || '').localeCompare(String(right?.siteId || ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function getRepresentedEntries(entry) {
  return Array.isArray(entry?.groupMembers) && entry.groupMembers.length > 0 ? entry.groupMembers : [entry].filter(Boolean);
}

function getVisibleCategoryIds() {
  return new Set(getActiveCategories().flatMap((category) => category.aliases || [category.id]));
}

function getSourceEntries(filteredEntries, visibleCategoryIds) {
  return groupEntriesByName(filteredEntries);
}

function getBucketEntries(filteredEntries, bucket) {
  return groupEntriesByName(filteredEntries.filter((entry) => hasAnyCategory(entry, new Set(bucket.aliases || [bucket.id]))));
}

function hasAnyCategory(entry, categoryIds) {
  return getEntryCategoryIds(entry).some((categoryId) => categoryIds.has(categoryId));
}

function getEntryCategoryIds(entry, set = getActiveCategorySet()) {
  if (set.adapter === 'tags') {
    return entry.tags;
  }
  const setAssignments = state.localAssignments[set.id] || {};
  return Array.isArray(setAssignments[entry.siteId]) ? setAssignments[entry.siteId] : [];
}

function renderBoard(filteredEntries, sourceEntries) {
  if (state.busy && !state.entries.length) {
    elements.lanes.innerHTML = `
      <div class="sweep-empty-state">
        <i class="ti ti-loader-2"></i>
        <p>Loading category board...</p>
      </div>
    `;
    return;
  }

  if (state.error && !state.entries.length) {
    elements.lanes.innerHTML = `
      <div class="sweep-empty-state">
        <i class="ti ti-alert-circle"></i>
        <p>${escapeHtml(state.error)}</p>
      </div>
    `;
    return;
  }

  elements.lanes.innerHTML = '';
  const bucketStrip = document.createElement('div');
  bucketStrip.className = 'category-bucket-strip';
  bucketStrip.setAttribute('aria-label', 'Categories');

  elements.lanes.appendChild(buildSourceColumn(sourceEntries));
  for (const bucket of getActiveCategories()) {
    bucketStrip.appendChild(buildBucketColumn(bucket, getBucketEntries(filteredEntries, bucket)));
  }
  elements.lanes.appendChild(bucketStrip);
}

function buildSourceColumn(entries) {
  const section = document.createElement('section');
  section.className = 'sweep-lane category-lane category-lane--source';
  section.innerHTML = `
    <header class="sweep-lane__header">
      <div class="sweep-lane__title-row">
        <div class="sweep-lane__title-block">
          <i class="ti ti-list-search"></i>
          <h3>Source</h3>
        </div>
        <span class="sweep-lane__count">${entries.length.toLocaleString()}</span>
      </div>
      <p class="sweep-lane__meta">${escapeHtml(getSourceModeLabel())}</p>
    </header>
    <div class="sweep-lane__body" data-category-source="true"></div>
  `;
  const body = section.querySelector('.sweep-lane__body');
  appendCards(body, entries, { source: true });
  return section;
}

function buildBucketColumn(bucket, entries) {
  const section = document.createElement('section');
  section.className = 'sweep-lane category-lane category-lane--bucket';
  section.dataset.categoryBucket = bucket.id;
  section.innerHTML = `
    <header class="sweep-lane__header">
      <div class="sweep-lane__title-row">
        <div class="sweep-lane__title-block">
          <i class="${escapeHtml(bucket.icon || 'ti ti-tag')}"></i>
          <h3>${escapeHtml(bucket.label)}</h3>
        </div>
        <span class="sweep-lane__count">${entries.length.toLocaleString()}</span>
      </div>
      <p class="sweep-lane__meta">${escapeHtml(bucket.id)}</p>
    </header>
    <div class="sweep-lane__body" data-category-dropzone="${escapeHtml(bucket.id)}"></div>
  `;
  const body = section.querySelector('.sweep-lane__body');
  bindDropzone(body, bucket);
  appendCards(body, entries, { bucket });
  return section;
}

function appendCards(body, entries, options = {}) {
  if (!(body instanceof HTMLElement)) {
    return;
  }
  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'sweep-lane__empty';
    empty.innerHTML = `
      <i class="ti ti-arrows-transfer-down"></i>
      <span>${state.query ? 'No matches' : (options.source ? 'Empty' : 'Drop here')}</span>
    `;
    body.appendChild(empty);
    return;
  }
  entries.slice(0, 80).forEach((entry) => body.appendChild(buildCard(entry, options)));
  if (entries.length > 80) {
    const more = document.createElement('div');
    more.className = 'category-card-more';
    more.textContent = `+${(entries.length - 80).toLocaleString()} more`;
    body.appendChild(more);
  }
}

function buildCard(entry, options = {}) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = `sweep-card category-card${options.source ? ' category-card--source' : ' category-card--bucket'}`;
  card.draggable = true;
  card.dataset.categorySite = entry.groupKey || entry.siteId;
  card.dataset.categoryLeadSite = entry.siteId;
  const bucket = options.bucket || null;
  const previewUrl = getEntryPreviewUrl(entry);
  const title = entry.displayName || entry.siteId;
  const representedEntries = getRepresentedEntries(entry);
  const representedCount = representedEntries.length;
  const hostLabel = representedCount > 1
    ? `${representedCount.toLocaleString()} URLs`
    : (entry.host || `${entry.siteId}.mullmania.com`);
  card.innerHTML = `
    <span class="category-card__preview"></span>
    <div class="sweep-card__top">
      <span class="sweep-card__site">${escapeHtml(title)}</span>
      ${bucket ? `
        <span
          class="category-card__remove"
          data-category-remove="${escapeHtml(bucket.id)}"
          title="Remove ${escapeHtml(bucket.label)} from ${escapeHtml(title)}"
          aria-label="Remove ${escapeHtml(bucket.label)} from ${escapeHtml(title)}"
        >
          <i class="ti ti-x"></i>
        </span>
      ` : ''}
    </div>
    <div class="sweep-card__title">${escapeHtml(hostLabel)}</div>
  `;
  renderCardPreview(card.querySelector('.category-card__preview'), previewUrl, title);

  card.addEventListener('click', (event) => {
    const remove = event.target instanceof Element ? event.target.closest('[data-category-remove]') : null;
    if (remove instanceof HTMLElement && bucket) {
      event.stopPropagation();
      void removeEntryFromBucket(entry, bucket);
      return;
    }
  });

  card.addEventListener('dragstart', (event) => {
    state.dragSiteId = entry.groupKey || entry.siteId;
    card.classList.add('is-dragging');
    event.dataTransfer?.setData('text/plain', entry.groupKey || entry.siteId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  });

  card.addEventListener('dragend', () => {
    state.dragSiteId = '';
    card.classList.remove('is-dragging');
    clearDragHighlights();
  });

  return card;
}

function getEntryPreviewUrl(entry) {
  const manifestUrl = state.previewManifest[entry?.siteId] || '';
  const explicit = String(entry?.previewUrl || '').trim();
  const demoPoster = entry?.demo?.posterKind === 'generated-placeholder'
    ? ''
    : String(entry?.demo?.posterUrl || '').trim();
  return resolvePreviewUrl(manifestUrl || explicit || demoPoster);
}

function getCardInitial(value) {
  return String(value || '?').trim().charAt(0).toUpperCase() || '?';
}

function renderCardPreview(container, previewUrl, title) {
  if (!(container instanceof HTMLElement)) {
    return;
  }
  const initial = getCardInitial(title);
  const renderFallback = () => {
    container.innerHTML = `<span>${escapeHtml(initial)}</span>`;
  };
  if (!previewUrl) {
    renderFallback();
    return;
  }
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', renderFallback, { once: true });
  img.src = previewUrl;
  container.replaceChildren(img);
}

function setPeerHover(siteId) {
  const normalizedSiteId = String(siteId || '').trim();
  if (!normalizedSiteId || state.dragSiteId) {
    return;
  }
  elements.lanes?.querySelectorAll('[data-category-site]').forEach((element) => {
    element.classList.toggle('is-category-peer-hover', element.getAttribute('data-category-site') === normalizedSiteId);
  });
}

function clearPeerHover(siteId = '') {
  const normalizedSiteId = String(siteId || '').trim();
  elements.lanes?.querySelectorAll('[data-category-site]').forEach((element) => {
    if (!normalizedSiteId || element.getAttribute('data-category-site') === normalizedSiteId) {
      element.classList.remove('is-category-peer-hover');
    }
  });
}

function bindDropzone(body, bucket) {
  if (!(body instanceof HTMLElement)) {
    return;
  }
  body.addEventListener('dragover', (event) => {
    if (!state.dragSiteId) {
      return;
    }
    event.preventDefault();
    body.classList.add('is-drag-over');
  });
  body.addEventListener('dragleave', () => {
    body.classList.remove('is-drag-over');
  });
  body.addEventListener('drop', (event) => {
    event.preventDefault();
    body.classList.remove('is-drag-over');
    const siteId = event.dataTransfer?.getData('text/plain') || state.dragSiteId;
    if (siteId) {
      void addEntryToBucket(siteId, bucket);
    }
  });
}

async function addEntryToBucket(siteId, bucket) {
  const entries = findEntriesForCategoryToken(siteId);
  if (!entries.length || !bucket) {
    return;
  }
  const label = entries.length > 1 ? normalizeDisplayGroupLabel(entries[0]) : entries[0].siteId;
  const activeSet = getActiveCategorySet();
  const missingEntries = entries.filter((entry) => !hasAnyCategory(entry, new Set(bucket.aliases || [bucket.id])));
  if (!missingEntries.length) {
    setFlashMessage(`${label} is already in ${bucket.label}.`);
    return;
  }
  if (activeSet.adapter !== 'tags') {
    for (const entry of missingEntries) {
      addLocalEntryToBucket(entry, bucket, activeSet, { render: false });
    }
    setFlashMessage(`Added ${label} to ${bucket.label}.`);
    render();
    return;
  }
  let savedCount = 0;
  for (const entry of missingEntries) {
    const latest = findEntry(entry.siteId) || entry;
    const nextTags = applyCategoryBehaviorToIds(latest.tags, bucket, activeSet);
    const saved = await mutateEntryTag(latest, {
      action: 'add',
      tagId: bucket.id,
      label: bucket.label,
      nextTags,
      successMessage: `Added ${label} to ${bucket.label}.`,
      render: false,
    });
    if (saved) {
      savedCount += 1;
    }
  }
  setFlashMessage(savedCount > 1 ? `Added ${label} (${savedCount} URLs) to ${bucket.label}.` : `Added ${label} to ${bucket.label}.`);
}

async function removeEntryFromBucket(entry, bucket) {
  const activeSet = getActiveCategorySet();
  const entries = getRepresentedEntries(entry);
  const label = entries.length > 1 ? normalizeDisplayGroupLabel(entries[0]) : entry.siteId;
  const entriesWithMatches = entries
    .map((candidate) => {
      const entryCategoryIds = getEntryCategoryIds(candidate, activeSet);
      const matchingCategories = entryCategoryIds.filter((categoryId) => (bucket.aliases || [bucket.id]).includes(categoryId));
      return { entry: candidate, entryCategoryIds, matchingCategories };
    })
    .filter((item) => item.matchingCategories.length > 0);
  if (!entriesWithMatches.length) {
    setFlashMessage(`${label} is not in ${bucket.label}.`);
    return;
  }
  if (activeSet.adapter !== 'tags') {
    for (const item of entriesWithMatches) {
      setLocalEntryCategories(item.entry.siteId, activeSet.id, item.entryCategoryIds.filter((value) => !item.matchingCategories.includes(value)));
    }
    setFlashMessage(`Removed ${bucket.label} from ${label}.`);
    render();
    return;
  }
  let savedCount = 0;
  for (const item of entriesWithMatches) {
    for (const tagId of item.matchingCategories) {
      const latest = findEntry(item.entry.siteId) || item.entry;
      const saved = await mutateEntryTag(latest, {
        action: 'remove',
        tagId,
        label: getTagLabel(tagId),
        nextTags: latest.tags.filter((value) => value !== tagId),
        successMessage: `Removed ${getTagLabel(tagId)} from ${label}.`,
        render: false,
      });
      if (saved) {
        savedCount += 1;
      }
    }
  }
  setFlashMessage(savedCount > 1 ? `Removed ${bucket.label} from ${label} (${entriesWithMatches.length} URLs).` : `Removed ${bucket.label} from ${label}.`);
}

function applyCategoryBehaviorToIds(currentIds, bucket, activeSet = getActiveCategorySet()) {
  const categoryIds = new Set(getActiveCategories().map((category) => category.id));
  const limit = getBehaviorLimit(activeSet);
  let nextIds = Array.from(new Set(currentIds || []));
  const categoryMembership = nextIds.filter((id) => categoryIds.has(id));

  if (Number.isFinite(limit) && categoryMembership.length >= limit) {
    const removeCount = categoryMembership.length - limit + 1;
    const toRemove = new Set(categoryMembership.filter((id) => id !== bucket.id).slice(0, removeCount));
    nextIds = nextIds.filter((id) => !toRemove.has(id));
  }

  return activeSet.adapter === 'tags'
    ? normalizeTagList([...nextIds, bucket.id])
    : Array.from(new Set([...nextIds, bucket.id]));
}

function addLocalEntryToBucket(entry, bucket, activeSet = getActiveCategorySet(), options = {}) {
  const current = getEntryCategoryIds(entry, activeSet);
  const next = applyCategoryBehaviorToIds(current, bucket, activeSet);
  setLocalEntryCategories(entry.siteId, activeSet.id, next);
  if (options.render !== false) {
    setFlashMessage(`Added ${entry.siteId} to ${bucket.label}.`);
    render();
  }
}

function setLocalEntryCategories(siteId, setId, categories) {
  const normalized = Array.from(new Set((Array.isArray(categories) ? categories : []).map(normalizeTagId).filter(Boolean)));
  state.localAssignments[setId] = {
    ...(state.localAssignments[setId] || {}),
    [siteId]: normalized,
  };
  if (!normalized.length) {
    delete state.localAssignments[setId][siteId];
  }
  persistLocalAssignments();
}

function openCategoryEditor() {
  state.editorDraft = cloneBoard(state.board);
  elements.editorModal?.classList.remove('is-hidden');
  renderCategoryEditor();
}

function closeCategoryEditor() {
  state.editorDraft = null;
  elements.editorModal?.classList.add('is-hidden');
}

function cloneBoard(board) {
  return {
    activeSetId: board.activeSetId,
    sets: board.sets.map(cloneCategorySet),
  };
}

function getDraftCategorySet(setId) {
  return state.editorDraft?.sets.find((set) => set.id === setId) || null;
}

function renderCategoryEditor() {
  if (!state.editorDraft || !elements.editorModal) {
    return;
  }
  const activeSet = getDraftCategorySet(state.editorDraft.activeSetId) || state.editorDraft.sets[0];
  if (!activeSet) {
    return;
  }
  state.editorDraft.activeSetId = activeSet.id;

  if (elements.editorSet) {
    elements.editorSet.innerHTML = state.editorDraft.sets
      .map((set) => `<option value="${escapeHtml(set.id)}">${escapeHtml(set.label)}</option>`)
      .join('');
    elements.editorSet.value = activeSet.id;
  }
  if (elements.editorBehavior) {
    elements.editorBehavior.value = normalizeBehaviorId(activeSet.behavior);
  }
  if (elements.editorList) {
    elements.editorList.innerHTML = activeSet.categories.map((category) => `
      <div class="category-editor-row" data-editor-category="${escapeHtml(category.id)}">
        <i class="${escapeHtml(category.icon || 'ti ti-tag')}"></i>
        <input type="text" value="${escapeHtml(category.label)}" aria-label="Category name">
        <button type="button" class="icon-button" data-editor-remove="${escapeHtml(category.id)}" aria-label="Remove">
          <i class="ti ti-x"></i>
        </button>
      </div>
    `).join('');
    elements.editorList.querySelectorAll('[data-editor-category]').forEach((row) => {
      const categoryId = row.getAttribute('data-editor-category') || '';
      const input = row.querySelector('input');
      input?.addEventListener('input', () => {
        const category = activeSet.categories.find((item) => item.id === categoryId);
        if (category) {
          category.label = normalizeTagLabel(input.value);
        }
      });
    });
    elements.editorList.querySelectorAll('[data-editor-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        const categoryId = button.getAttribute('data-editor-remove') || '';
        activeSet.categories = activeSet.categories.filter((category) => category.id !== categoryId);
        renderCategoryEditor();
      });
    });
  }
  setCategoryEditorStatus(activeSet.adapter === 'tags' ? 'Tags' : 'Local');
}

function addDraftCategory() {
  if (!state.editorDraft || !elements.editorNewLabel) {
    return;
  }
  const activeSet = getDraftCategorySet(state.editorDraft.activeSetId);
  if (!activeSet) {
    return;
  }
  const label = normalizeTagLabel(elements.editorNewLabel.value);
  const category = normalizeCategoryChoice({ id: normalizeTagId(label), label, icon: 'ti ti-tag' }, activeSet.adapter);
  if (!category) {
    setCategoryEditorStatus('Not available.');
    return;
  }
  if (activeSet.categories.some((item) => item.id === category.id)) {
    setCategoryEditorStatus('Already there.');
    return;
  }
  activeSet.categories = [...activeSet.categories, category];
  elements.editorNewLabel.value = '';
  setCategoryEditorStatus('');
  renderCategoryEditor();
}

function setCategoryEditorStatus(message) {
  if (elements.editorStatus) {
    elements.editorStatus.textContent = message || '';
  }
}

function saveCategoryEditor() {
  if (!state.editorDraft) {
    return;
  }
  for (const set of state.editorDraft.sets) {
    set.behavior = normalizeBehaviorId(set.behavior);
    set.categories = set.categories
      .map((category) => normalizeCategoryChoice(category, set.adapter))
      .filter(Boolean);
  }
  state.board = cloneBoard(state.editorDraft);
  persistBoard();
  closeCategoryEditor();
  render();
}

async function mutateEntryTag(entry, options) {
  if (!state.apiBaseUrl) {
    setFlashMessage('Live API needed.');
    return false;
  }
  const operatorKey = localStorage.getItem(OPERATOR_KEY_STORAGE_KEY) || '';
  if (!operatorKey) {
    setFlashMessage('Operator key needed.');
    document.getElementById('open-settings')?.click();
    return false;
  }

  const previousTags = [...entry.tags];
  applyTagsToEntry(entry.siteId, options.nextTags);
  state.savingSiteId = entry.siteId;
  if (options.render !== false) {
    render();
  }

  try {
    const payload = await fetchJson(`${state.apiBaseUrl}/api/catalog/tags/site/${encodeURIComponent(entry.siteId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-key': operatorKey,
      },
      body: JSON.stringify({
        action: options.action,
        tagId: options.tagId,
        label: options.label,
        source: location.hostname,
      }),
    });
    applyTagsToEntry(entry.siteId, payload.siteTags || options.nextTags);
    state.tagRegistry = normalizeTagRegistry(payload.tags || state.tagRegistry);
    if (options.render !== false) {
      setFlashMessage(options.successMessage);
    }
    return true;
  } catch (error) {
    applyTagsToEntry(entry.siteId, previousTags);
    const message = error instanceof Error ? error.message : 'Could not save tag change.';
    setFlashMessage(message);
    return false;
  } finally {
    state.savingSiteId = '';
    if (options.render !== false) {
      render();
    }
  }
}

function applyTagsToEntry(siteId, tags) {
  const normalized = normalizeTagList(tags);
  state.entries = state.entries.map((entry) => (
    entry.siteId === siteId
      ? { ...entry, tags: normalized, searchText: rebuildSearchText(entry, normalized) }
      : entry
  ));
}

function rebuildSearchText(entry, tags) {
  return [
    entry.siteId,
    entry.host,
    entry.displayName,
    entry.title,
    entry.description,
    ...(Array.isArray(entry.notes) ? entry.notes : []),
    ...tags,
  ].map((value) => String(value || '').toLowerCase()).join(' ');
}

function buildTagCleanupSummary() {
  const counts = new Map();
  for (const entry of state.entries) {
    for (const tagId of entry.tags) {
      counts.set(tagId, (counts.get(tagId) || 0) + 1);
    }
  }
  const singletons = Array.from(counts.values()).filter((count) => count === 1).length;
  const hidden = Array.from(counts.keys()).filter((tagId) => SYSTEM_TAG_IDS.has(tagId)).length;
  return `${counts.size.toLocaleString()} tags · ${singletons.toLocaleString()} single-use · ${hidden.toLocaleString()} hidden operational tags`;
}

function getSourceModeLabel() {
  return state.query ? `Matching "${state.query}"` : 'All apps';
}

function findEntry(siteId) {
  return state.entries.find((entry) => entry.siteId === siteId) || null;
}

function findEntriesForCategoryToken(value) {
  const token = String(value || '').trim();
  if (!token) {
    return [];
  }
  const exact = findEntry(token);
  if (exact) {
    return [exact];
  }
  return state.entries
    .filter((entry) => getDisplayGroupKey(entry) === token)
    .sort(compareEntries);
}

function clearDragHighlights() {
  elements.lanes?.querySelectorAll('.is-drag-over').forEach((element) => element.classList.remove('is-drag-over'));
}

function setFlashMessage(message) {
  state.flashMessage = String(message || '');
  window.clearTimeout(flashTimer);
  if (state.flashMessage) {
    flashTimer = window.setTimeout(() => {
      state.flashMessage = '';
      render();
    }, 4200);
  }
  render();
}

function isEditableTarget(target) {
  return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, button, [contenteditable="true"]'));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
