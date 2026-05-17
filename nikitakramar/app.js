const state = {
  claims: null,
  sources: null,
  filter: 'all',
};

const sourceById = () => new Map(state.sources.sources.map((source) => [source.id, source]));

function sourceLink(sourceId) {
  const source = sourceById().get(sourceId);
  if (!source) return '';
  return `<a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>`;
}

function statusClass(status) {
  return String(status || '').replace(/\s+/g, '-');
}

function renderEvidence() {
  const list = document.querySelector('#evidence-list');
  const visible = state.filter === 'all'
    ? state.claims.evidence
    : state.claims.evidence.filter((claim) => claim.status === state.filter);

  list.innerHTML = visible.map((claim, index) => `
    <article class="evidence-row" style="transition-delay: ${Math.min(index * 45, 360)}ms">
      <div class="meta-stack">
        <span class="status ${statusClass(claim.status)}">${claim.status}</span>
        <span class="confidence">Confidence: ${claim.confidence}</span>
        ${sourceLink(claim.sourceId)}
      </div>
      <div>
        <p class="claim">${claim.claim}</p>
        <p class="evidence">${claim.evidence}</p>
      </div>
      <p class="ask">${claim.ask}</p>
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
        <h3>${wire.title}</h3>
        <span class="status ${statusClass(wire.status)}">${wire.status}</span>
      </div>
      <div>
        <p><strong>${wire.short}</strong></p>
        <p>${wire.body}</p>
        <p class="conversation">${wire.conversation}</p>
        <div class="wire-sources">
          ${wire.sourceIds.map((sourceId) => sourceLink(sourceId)).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

function renderUnknowns() {
  const list = document.querySelector('#unknown-list');
  list.innerHTML = state.claims.unknowns.map((unknown) => `
    <article class="unknown-item">
      <strong>${unknown.claim}</strong>
      <span>${unknown.why}</span>
    </article>
  `).join('');
}

function renderCuts() {
  const list = document.querySelector('#cut-list');
  list.innerHTML = state.claims.cuts.map((cut) => `
    <div class="cut-item">
      <strong>${cut.title}</strong>
      <span>${cut.reason}</span>
    </div>
  `).join('');
}

function renderSources() {
  const list = document.querySelector('#sources-list');
  list.innerHTML = state.sources.sources.map((source) => `
    <article class="source-item">
      <a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>
      <p>${source.usedFor}</p>
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

async function init() {
  const [claimsResponse, sourcesResponse] = await Promise.all([
    fetch('./data/claims.json'),
    fetch('./data/sources.json'),
  ]);

  if (!claimsResponse.ok || !sourcesResponse.ok) {
    throw new Error('Unable to load source-backed interpretation data.');
  }

  state.claims = await claimsResponse.json();
  state.sources = await sourcesResponse.json();

  document.querySelector('#opening-line').textContent = state.claims.openingLine;
  renderEvidence();
  renderWires();
  renderUnknowns();
  renderCuts();
  renderSources();
  wireFilters();
}

init().catch((error) => {
  const main = document.querySelector('main');
  main.innerHTML = `<section class="section"><h1>Data load failed</h1><p>${error.message}</p></section>`;
});
