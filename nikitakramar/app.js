const state = {
  claims: null,
  sources: null,
  activeExampleIndex: 0,
  rerollOffset: 0,
};

const SELECTORS = {
  sourceCount: '#source-count',
  scenarioRail: '#scenario-rail',
  scenarioInput: '#scenario-input',
  wwnkdPanel: '#wwnkd-panel',
  prepOutput: '#prep-output',
  copyPrep: '#copy-prep',
  machineList: '#machine-list',
  signalList: '#signal-list',
  ideaList: '#idea-list',
  receiptList: '#receipt-list',
  sourcesList: '#sources-list',
};

function element(selector) {
  return document.querySelector(selector);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sourceById() {
  return new Map(state.sources.sources.map((source) => [source.id, source]));
}

function sourceLink(sourceId) {
  const source = sourceById().get(sourceId);
  if (!source) return '';
  return `<a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>`;
}

function statusClass(status) {
  return String(status || '').replace(/\s+/g, '-');
}

function selectedScenario() {
  return state.claims.wwnkd.examples[state.activeExampleIndex] ?? state.claims.wwnkd.examples[0];
}

function classifyMove(scenarioText) {
  const scenario = scenarioText.toLowerCase();
  const moves = state.claims.wwnkd.moves;

  if (scenario.includes('fail') || scenario.includes('debug') || scenario.includes('agent run')) {
    return moves.find((move) => move.id === 'autopsy') ?? moves[0];
  }

  if (scenario.includes('pitch') || scenario.includes('sell')) {
    return moves.find((move) => move.id === 'anti-pitch') ?? moves[0];
  }

  if (scenario.includes('website') || scenario.includes('layer') || scenario.includes('llms') || scenario.includes('ncp')) {
    return moves.find((move) => move.id === 'context-layer') ?? moves[0];
  }

  if (scenario.includes('artifact') || scenario.includes('show')) {
    return moves.find((move) => move.id === 'working-artifact') ?? moves[0];
  }

  return moves[state.rerollOffset % moves.length];
}

function nextRerollMove(currentMove) {
  const moves = state.claims.wwnkd.moves;
  const currentIndex = moves.findIndex((move) => move.id === currentMove.id);
  state.rerollOffset = currentIndex + 1;
  return moves[state.rerollOffset % moves.length];
}

function formatPacket(move, scenarioText) {
  const sourceUrls = state.claims.receipts
    .map((receipt) => sourceById().get(receipt.sourceId)?.url)
    .filter(Boolean);

  return [
    `WWNKD packet: ${move.title}`,
    '',
    'Situation:',
    scenarioText,
    '',
    'Move:',
    move.body,
    '',
    'Steps:',
    ...move.steps.map((step) => `- ${step}`),
    '',
    'Receipts:',
    ...Array.from(new Set(sourceUrls)).map((url) => `- ${url}`),
    '',
    'Boundary:',
    '- This is a joke decision aid from public sources.',
    '- Do not write as Nikita or claim private knowledge.',
  ].join('\n');
}

function renderScenarioRail() {
  const rail = element(SELECTORS.scenarioRail);
  rail.innerHTML = state.claims.wwnkd.examples.map((example, index) => `
    <button class="intent-button ${index === state.activeExampleIndex ? 'is-active' : ''}" type="button" data-index="${index}">
      <span>0${index + 1}</span>
      <strong>${escapeHtml(example.label)}</strong>
      <em>${escapeHtml(example.short)}</em>
    </button>
  `).join('');

  rail.querySelectorAll('.intent-button').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeExampleIndex = Number(button.dataset.index);
      state.rerollOffset = state.activeExampleIndex;
      element(SELECTORS.scenarioInput).value = selectedScenario().text;
      renderWWNKD();
    });
  });
}

function renderWWNKD() {
  const scenarioText = element(SELECTORS.scenarioInput).value;
  const move = classifyMove(scenarioText);
  renderScenarioRail();
  renderMove(move, scenarioText);
}

function renderMove(move, scenarioText) {
  element(SELECTORS.wwnkdPanel).innerHTML = `
    <div class="panel-header">
      <div>
        <span class="status Playful-Inference">Playful inference</span>
        <h3>${escapeHtml(move.title)}</h3>
      </div>
      <button class="text-button" type="button" id="reroll">Re-roll</button>
    </div>
    <p class="intent-use">${escapeHtml(move.body)}</p>
    <div class="cockpit-block">
      <strong>WWNKD move</strong>
      <ol>
        ${move.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
    </div>
    <div class="cockpit-block caution">
      <strong>Joke boundary</strong>
      <p>${escapeHtml(state.claims.wwnkd.boundary)}</p>
    </div>
    <p class="confidence">Confidence: ${escapeHtml(move.confidence)}</p>
  `;

  element('#reroll').addEventListener('click', () => {
    renderMove(nextRerollMove(move), scenarioText);
  });

  element(SELECTORS.prepOutput).textContent = formatPacket(move, scenarioText);
}

function renderMachineLayer() {
  element(SELECTORS.machineList).innerHTML = state.claims.machineLayer.map((item) => `
    <a class="machine-item" href="${item.path}">
      <span class="machine-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
      <strong>${escapeHtml(item.name)}</strong>
      <em>${escapeHtml(item.description)}</em>
      <code>${escapeHtml(item.path)}</code>
    </a>
  `).join('');
}

function renderSignals() {
  element(SELECTORS.signalList).innerHTML = state.claims.signals.map((signal, index) => `
    <article class="signal-item">
      <span class="wire-number">0${index + 1}</span>
      <div>
        <span class="status Observed">Source signal</span>
        <h3>${escapeHtml(signal.title)}</h3>
        <p>${escapeHtml(signal.body)}</p>
        ${sourceLink(signal.sourceId)}
      </div>
    </article>
  `).join('');
}

function renderIdeas() {
  element(SELECTORS.ideaList).innerHTML = state.claims.ideas.map((idea, index) => `
    <article class="wire">
      <div>
        <span class="wire-number">0${index + 1}</span>
        <h3>${escapeHtml(idea.title)}</h3>
        <span class="status ${statusClass(idea.status)}">${escapeHtml(idea.kind)}</span>
      </div>
      <div>
        <p><strong>${escapeHtml(idea.short)}</strong></p>
        <p>${escapeHtml(idea.body)}</p>
        <p class="conversation">${escapeHtml(idea.opener)}</p>
        <div class="wire-sources">
          ${idea.sourceIds.map((sourceId) => sourceLink(sourceId)).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

function renderReceipts() {
  element(SELECTORS.receiptList).innerHTML = state.claims.receipts.map((receipt, index) => `
    <article class="evidence-row" style="transition-delay: ${Math.min(index * 45, 360)}ms">
      <div class="meta-stack">
        <span class="status ${statusClass(receipt.status)}">${escapeHtml(receipt.status)}</span>
        ${sourceLink(receipt.sourceId)}
      </div>
      <div>
        <p class="claim">${escapeHtml(receipt.claim)}</p>
        <p class="evidence">${escapeHtml(receipt.whyItMatters)}</p>
      </div>
      <p class="ask">${escapeHtml(receipt.ask)}</p>
    </article>
  `).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.evidence-row').forEach((row) => row.classList.add('is-visible'));
  });
}

function renderSources() {
  element(SELECTORS.sourcesList).innerHTML = state.sources.sources.map((source) => `
    <article class="source-item">
      <a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>
      <p>${escapeHtml(source.usedFor)}</p>
    </article>
  `).join('');
}

function wireCopyPrep() {
  element(SELECTORS.copyPrep).addEventListener('click', async () => {
    const button = element(SELECTORS.copyPrep);
    const text = element(SELECTORS.prepOutput).textContent;

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Select text';
    }

    setTimeout(() => {
      button.textContent = 'Copy';
    }, 1400);
  });
}

function wireScenarioInput() {
  element(SELECTORS.scenarioInput).addEventListener('input', () => {
    state.rerollOffset = 0;
    renderWWNKD();
  });
}

async function init() {
  const [claimsResponse, sourcesResponse] = await Promise.all([
    fetch('./data/claims.json'),
    fetch('./data/sources.json'),
  ]);

  if (!claimsResponse.ok || !sourcesResponse.ok) {
    throw new Error('Unable to load NCP source data.');
  }

  state.claims = await claimsResponse.json();
  state.sources = await sourcesResponse.json();

  element(SELECTORS.sourceCount).textContent = `${state.sources.sources.length} public`;
  element(SELECTORS.scenarioInput).value = selectedScenario().text;

  renderWWNKD();
  renderMachineLayer();
  renderSignals();
  renderIdeas();
  renderReceipts();
  renderSources();
  wireScenarioInput();
  wireCopyPrep();
}

init().catch((error) => {
  const main = document.querySelector('main');
  main.innerHTML = `<section class="section"><h1>NCP fell over</h1><p>${escapeHtml(error.message)}</p></section>`;
});
