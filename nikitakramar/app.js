const state = {
  claims: null,
  sources: null,
  filter: 'all',
  activeIntentId: null,
};

const sourceById = () => new Map(state.sources.sources.map((source) => [source.id, source]));

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sourceLink(sourceId) {
  const source = sourceById().get(sourceId);
  if (!source) return '';
  return `<a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>`;
}

function statusClass(status) {
  return String(status || '').replace(/\s+/g, '-');
}

function renderIntentRail() {
  const rail = document.querySelector('#intent-rail');
  rail.innerHTML = state.claims.intents.map((intent, index) => `
    <button class="intent-button ${intent.id === state.activeIntentId ? 'is-active' : ''}" type="button" data-intent="${intent.id}">
      <span>0${index + 1}</span>
      <strong>${escapeHtml(intent.label)}</strong>
      <em>${escapeHtml(intent.short)}</em>
    </button>
  `).join('');

  rail.querySelectorAll('.intent-button').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeIntentId = button.dataset.intent;
      renderCockpit();
    });
  });
}

function formatPrepPacket(intent) {
  const lines = [
    `NCP prep packet: ${intent.label}`,
    '',
    'Boundary:',
    '- This is context about Nikita from public sources.',
    '- Do not speak as Nikita or claim private knowledge.',
    '',
    'Use when:',
    `- ${intent.useWhen}`,
    '',
    'Opening move:',
    intent.opening,
    '',
    'Ask next:',
    ...intent.questions.map((question) => `- ${question}`),
    '',
    'Do not assume:',
    ...intent.doNotAssume.map((item) => `- ${item}`),
    '',
    `Sources: ${intent.sourceIds.map((sourceId) => sourceById().get(sourceId)?.url).filter(Boolean).join(', ')}`,
  ];
  return lines.join('\n');
}

function renderCockpit() {
  const intent = state.claims.intents.find((item) => item.id === state.activeIntentId) ?? state.claims.intents[0];
  state.activeIntentId = intent.id;
  renderIntentRail();

  const panel = document.querySelector('#intent-panel');
  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="status ${statusClass(intent.status)}">${escapeHtml(intent.status)}</span>
        <h3>${escapeHtml(intent.label)}</h3>
      </div>
      <span class="confidence">Confidence: ${escapeHtml(intent.confidence)}</span>
    </div>
    <p class="intent-use">${escapeHtml(intent.useWhen)}</p>
    <div class="cockpit-block">
      <strong>Opening move</strong>
      <p>${escapeHtml(intent.opening)}</p>
    </div>
    <div class="cockpit-block">
      <strong>Questions to ask</strong>
      <ol>
        ${intent.questions.map((question) => `<li>${escapeHtml(question)}</li>`).join('')}
      </ol>
    </div>
    <div class="cockpit-block caution">
      <strong>Do not assume</strong>
      <ul>
        ${intent.doNotAssume.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>
    <div class="wire-sources">
      ${intent.sourceIds.map((sourceId) => sourceLink(sourceId)).join('')}
    </div>
  `;

  document.querySelector('#prep-output').textContent = formatPrepPacket(intent);
}

function renderMachineLayer() {
  const list = document.querySelector('#machine-list');
  list.innerHTML = state.claims.machineLayer.map((item) => `
    <a class="machine-item" href="${item.path}">
      <span class="machine-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
      <strong>${escapeHtml(item.name)}</strong>
      <em>${escapeHtml(item.description)}</em>
      <code>${escapeHtml(item.path)}</code>
    </a>
  `).join('');
}

function renderSignals() {
  const list = document.querySelector('#signal-list');
  list.innerHTML = state.claims.signals.map((signal, index) => `
    <article class="signal-item">
      <span class="wire-number">0${index + 1}</span>
      <div>
        <span class="status ${statusClass(signal.status)}">${escapeHtml(signal.status)}</span>
        <h3>${escapeHtml(signal.title)}</h3>
        <p>${escapeHtml(signal.body)}</p>
        ${sourceLink(signal.sourceId)}
      </div>
    </article>
  `).join('');
}

function renderEvidence() {
  const list = document.querySelector('#evidence-list');
  const visible = state.filter === 'all'
    ? state.claims.evidence
    : state.claims.evidence.filter((claim) => claim.status === state.filter);

  list.innerHTML = visible.map((claim, index) => `
    <article class="evidence-row" style="transition-delay: ${Math.min(index * 45, 360)}ms">
      <div class="meta-stack">
        <span class="status ${statusClass(claim.status)}">${escapeHtml(claim.status)}</span>
        <span class="confidence">Confidence: ${escapeHtml(claim.confidence)}</span>
        ${sourceLink(claim.sourceId)}
      </div>
      <div>
        <p class="claim">${escapeHtml(claim.claim)}</p>
        <p class="evidence">${escapeHtml(claim.evidence)}</p>
      </div>
      <p class="ask">${escapeHtml(claim.ask)}</p>
    </article>
  `).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.evidence-row').forEach((row) => row.classList.add('is-visible'));
  });
}

function renderWires() {
  const list = document.querySelector('#wire-list');
  list.innerHTML = state.claims.liveWires.map((wire, index) => `
    <article class="wire">
      <div>
        <span class="wire-number">0${index + 1}</span>
        <h3>${escapeHtml(wire.title)}</h3>
        <span class="status ${statusClass(wire.status)}">${escapeHtml(wire.status)}</span>
      </div>
      <div>
        <p><strong>${escapeHtml(wire.short)}</strong></p>
        <p>${escapeHtml(wire.body)}</p>
        <p class="conversation">${escapeHtml(wire.conversation)}</p>
        <div class="wire-sources">
          ${wire.sourceIds.map((sourceId) => sourceLink(sourceId)).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

function renderGuardrails() {
  const list = document.querySelector('#guardrail-list');
  list.innerHTML = state.claims.guardrails.map((guardrail) => `
    <article class="guardrail-item">
      <span aria-hidden="true">+</span>
      <div>
        <strong>${escapeHtml(guardrail.rule)}</strong>
        <p>${escapeHtml(guardrail.reason)}</p>
      </div>
    </article>
  `).join('');
}

function renderUnknowns() {
  const list = document.querySelector('#unknown-list');
  list.innerHTML = state.claims.unknowns.map((unknown) => `
    <article class="unknown-item">
      <strong>${escapeHtml(unknown.claim)}</strong>
      <span>${escapeHtml(unknown.why)}</span>
    </article>
  `).join('');
}

function renderSources() {
  const list = document.querySelector('#sources-list');
  list.innerHTML = state.sources.sources.map((source) => `
    <article class="source-item">
      <a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>
      <p>${escapeHtml(source.usedFor)}</p>
    </article>
  `).join('');
}

function wireFilters() {
  document.querySelectorAll('.filter').forEach((button) => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll('.filter').forEach((filter) => {
        filter.classList.toggle('is-active', filter === button);
      });
      renderEvidence();
    });
  });
}

function wireCopyPrep() {
  const button = document.querySelector('#copy-prep');
  button.addEventListener('click', async () => {
    const text = document.querySelector('#prep-output').textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 1400);
    } catch {
      button.textContent = 'Select text';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 1400);
    }
  });
}

async function init() {
  const [claimsResponse, sourcesResponse] = await Promise.all([
    fetch('./data/claims.json'),
    fetch('./data/sources.json'),
  ]);

  if (!claimsResponse.ok || !sourcesResponse.ok) {
    throw new Error('Unable to load source-backed context data.');
  }

  state.claims = await claimsResponse.json();
  state.sources = await sourcesResponse.json();
  state.activeIntentId = state.claims.intents[0]?.id;

  document.querySelector('#source-count').textContent = `${state.sources.sources.length} public`;
  document.querySelector('#opening-line').textContent = state.claims.openingLine;
  renderCockpit();
  renderMachineLayer();
  renderSignals();
  renderEvidence();
  renderWires();
  renderGuardrails();
  renderUnknowns();
  renderSources();
  wireFilters();
  wireCopyPrep();
}

init().catch((error) => {
  const main = document.querySelector('main');
  main.innerHTML = `<section class="section"><h1>Data load failed</h1><p>${escapeHtml(error.message)}</p></section>`;
});
