const state = {
  claims: null,
  sources: null,
  scenarioIndex: 0,
};

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sourceMap() {
  return new Map(state.sources.sources.map((source) => [source.id, source]));
}

function sourceLink(sourceId) {
  const source = sourceMap().get(sourceId);
  if (!source) return '';
  return `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.shortTitle ?? source.title)}</a>`;
}

function renderHeroConsole() {
  const lines = [
    '> ncp scan --nikita',
    '',
    `signals: ${state.claims.signals.length}`,
    `ideas: ${state.claims.ideas.length}`,
    `receipts: ${state.claims.receipts.length}`,
    '',
    'best read:',
    state.claims.liveWire,
    '',
    'warning:',
    'do not turn the joke into a LinkedIn framework',
  ];

  $('#hero-console').textContent = lines.join('\n');
}

function renderSignals() {
  $('#signals').innerHTML = state.claims.signals.map((signal, index) => `
    <article class="signal">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div>
        <h3>${escapeHtml(signal.title)}</h3>
        <p>${escapeHtml(signal.body)}</p>
        <small>${sourceLink(signal.sourceId)}</small>
      </div>
    </article>
  `).join('');
}

function renderIdeas() {
  $('#idea-list').innerHTML = state.claims.ideas.map((idea, index) => `
    <article class="idea">
      <div class="idea-rank">${index + 1}</div>
      <div>
        <p class="kicker">${escapeHtml(idea.kind)}</p>
        <h3>${escapeHtml(idea.title)}</h3>
        <p class="idea-short">${escapeHtml(idea.short)}</p>
        <p>${escapeHtml(idea.body)}</p>
        <blockquote>${escapeHtml(idea.opener)}</blockquote>
        <div class="idea-sources">${idea.sourceIds.map(sourceLink).join('')}</div>
      </div>
    </article>
  `).join('');
}

function selectMove() {
  const scenario = $('#scenario').value.toLowerCase();
  const moves = state.claims.wwnkd.moves;

  if (scenario.includes('fail') || scenario.includes('debug') || scenario.includes('agent run')) {
    return moves.find((move) => move.id === 'autopsy') ?? moves[0];
  }
  if (scenario.includes('pitch') || scenario.includes('sell')) {
    return moves.find((move) => move.id === 'anti-pitch') ?? moves[0];
  }
  if (scenario.includes('site') || scenario.includes('web') || scenario.includes('llms') || scenario.includes('ncp')) {
    return moves.find((move) => move.id === 'context-layer') ?? moves[0];
  }

  const move = moves[state.scenarioIndex % moves.length];
  state.scenarioIndex += 1;
  return move;
}

function renderWWNKD() {
  const move = selectMove();
  $('#wwnkd-title').textContent = move.title;
  $('#wwnkd-body').textContent = move.body;
  $('#wwnkd-steps').innerHTML = move.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
  $('#wwnkd-confidence').textContent = `Confidence: ${move.confidence}. Joke level: high. Impersonation level: zero.`;
}

function renderScenarioButtons() {
  $('#scenario-buttons').innerHTML = state.claims.wwnkd.examples.map((example) => `
    <button type="button" class="chip">${escapeHtml(example.label)}</button>
  `).join('');

  $('#scenario-buttons').querySelectorAll('button').forEach((button, index) => {
    button.addEventListener('click', () => {
      $('#scenario').value = state.claims.wwnkd.examples[index].text;
      renderWWNKD();
    });
  });
}

function renderReceipts() {
  $('#receipts').innerHTML = state.claims.receipts.map((receipt) => `
    <article class="receipt">
      <strong>${escapeHtml(receipt.claim)}</strong>
      <p>${escapeHtml(receipt.whyItMatters)}</p>
      <span>${escapeHtml(receipt.status)}</span>
      ${sourceLink(receipt.sourceId)}
    </article>
  `).join('');
}

function renderSources() {
  $('#source-list').innerHTML = state.sources.sources.map((source) => `
    <article class="source">
      <a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>
      <p>${escapeHtml(source.usedFor)}</p>
    </article>
  `).join('');
}

function wireWWNKD() {
  $('#scenario').addEventListener('input', renderWWNKD);
  $('#reroll').addEventListener('click', renderWWNKD);
}

async function init() {
  const [claimsResponse, sourcesResponse] = await Promise.all([
    fetch('./data/claims.json'),
    fetch('./data/sources.json'),
  ]);

  if (!claimsResponse.ok || !sourcesResponse.ok) {
    throw new Error('Could not load NCP field notes.');
  }

  state.claims = await claimsResponse.json();
  state.sources = await sourcesResponse.json();

  renderHeroConsole();
  renderSignals();
  renderIdeas();
  renderScenarioButtons();
  renderWWNKD();
  renderReceipts();
  renderSources();
  wireWWNKD();
}

init().catch((error) => {
  $('#main').innerHTML = `<section class="section"><h1>NCP fell over.</h1><p>${escapeHtml(error.message)}</p></section>`;
});
