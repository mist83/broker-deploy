// agent.mullmania.com /hud — glanceable view of Claude Code + Codex sessions
// on the operator's desk Mac.
//
// State model is intentionally minimal:
//   - each row is either "live" (green dot, recent on-disk write) or
//     "idle" (gray dot, paused but still tracked)
//   - red ONLY appears for "snapshot pipeline broken" — never per-row
//   - the ☕ button is an unconditional keep-awake toggle (no agent-watching)
//
// Data source: /hud/snapshot.json — published every ~5s by Valet's worker.

const SNAPSHOT_URL = "/hud/snapshot.json";
const POLL_INTERVAL_MS = 2000;
const STALE_SECONDS = 60;     // snapshot file older than this → "stale" red
const TIMEOUT_MS = 4000;
const ERROR_THRESHOLD = 5;    // 5 * 2s = ~10s sustained fail before red

// Once an hour, force a hard reload so a deployed page change propagates
// even into already-open floating HUD windows. Without this, the WKWebView
// keeps running whatever JS it loaded when the window was first shown, and
// a deploy is only picked up by a manual "Reload (cloud)" or applet
// restart. The reload is cheap and the HUD has no state worth preserving.
const SELF_RELOAD_INTERVAL_MS = 60 * 60 * 1000;
setTimeout(() => { window.location.reload(); }, SELF_RELOAD_INTERVAL_MS);

const hud = document.getElementById("hud");
const modeEl = document.getElementById("hud-mode");
const emptySection = hud.querySelector(".hud-empty");
const emptyMark = document.getElementById("empty-mark");
const emptyText = document.getElementById("empty-text");
const emptyCounts = document.getElementById("empty-counts");
const listSection = hud.querySelector(".hud-list");
const listLabel = document.getElementById("list-label");
const listEl = document.getElementById("needs-you-list");
const footStamp = document.getElementById("foot-stamp");
const footThresholds = document.getElementById("foot-thresholds");
const footAge = document.getElementById("foot-age");
const btnClose = document.getElementById("btn-close");
const btnKeepAwake = document.getElementById("btn-keep-awake");

let consecutiveFailures = 0;

// --- formatting helpers -----------------------------------------------

function formatDuration(secondsIn) {
  const s = Math.max(0, Math.floor(Number(secondsIn) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  if (m < 60) return r === 0 ? `${m}m` : `${m}m${r < 10 ? "0" : ""}${r}s`;
  const h = Math.floor(m / 60);
  const rm = m - h * 60;
  return rm === 0 ? `${h}h` : `${h}h${rm < 10 ? "0" : ""}${rm}m`;
}

function shortProject(project) {
  const w = String(project || "").trim();
  if (!w) return "";
  const tilded = w.replace(/^\/Users\/[^/]+/, "~");
  const slash = tilded.lastIndexOf("/");
  if (slash < 0) return tilded;
  return tilded.slice(slash + 1) || tilded;
}

function shortSessionId(sessionId) {
  return String(sessionId || "").slice(0, 8);
}

function escapeHtml(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plural(n, one, many) { return n === 1 ? one : many; }

function formatStamp(epoch) {
  if (!epoch) return "—";
  const d = new Date(epoch * 1000);
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// --- row rendering ----------------------------------------------------

function rowHtml(session, state) {
  // state ∈ {"live","idle"}. Two clocks per row:
  //   started — birthtime of the jsonl (how old is this conversation?)
  //   elapsed — mtime of the jsonl (how long since the last write?)
  //
  // Label preference (most-meaningful first):
  //   1. session.title    — Claude's aiTitle ("Build the foo widget")
  //   2. session.project  — Codex's cwd ("/Users/mist83/Code/agent")
  //   3. short session id — last resort
  const label =
    (session.title && session.title.trim()) ||
    shortProject(session.project) ||
    shortSessionId(session.sessionId) || "—";
  const elapsed = formatDuration(session.secondsSinceActivity);
  const started = formatDuration(session.secondsSinceStart || 0);
  const showStarted = (session.secondsSinceStart || 0) >= 60;
  const startedSpan = showStarted
    ? `<span class="started" title="conversation started this long ago">${escapeHtml(started)}</span>`
    : `<span class="started"></span>`;
  const tooltip = (session.title || session.project || session.sessionId || "") +
    `\nstarted ${started} ago · last write ${elapsed} ago`;
  return `
    <li class="row row-${session.kind} row-${state}">
      <span class="dot"></span>
      <span class="kind">${session.kind}</span>
      <span class="label" title="${escapeHtml(tooltip)}">${escapeHtml(label)}</span>
      ${startedSpan}
      <span class="elapsed" title="time since last write">${escapeHtml(elapsed)}</span>
    </li>
  `;
}

// --- main render ------------------------------------------------------

// User-pickable sort. Default is `started` (oldest at top, brand new
// sessions append at the bottom) — that's the stable order: a session's
// startedAt never changes, so the list doesn't reshuffle as sessions
// pause and resume. The operator can cycle to a different sort via the
// header chip; choice persists in localStorage.
const SORT_MODES = ["started", "recent", "kind"];
const SORT_STORAGE_KEY = "valet-hud-sort";
let sortMode = (() => {
  try { return SORT_MODES.includes(localStorage.getItem(SORT_STORAGE_KEY))
    ? localStorage.getItem(SORT_STORAGE_KEY) : "started"; } catch { return "started"; }
})();

function sortLabel(mode) {
  switch (mode) {
    case "recent": return "recent";
    case "kind":   return "kind";
    default:       return "started";
  }
}

function applySort(rows, mode) {
  const STATE_RANK = { live: 0, idle: 1 };
  // Live always above idle within any sort — the dot color is the strongest
  // signal and we don't want active sessions sinking under idle ones.
  return rows.slice().sort((a, b) => {
    const rankDiff = STATE_RANK[a.state] - STATE_RANK[b.state];
    if (rankDiff !== 0) return rankDiff;
    if (mode === "recent") return a.s.secondsSinceActivity - b.s.secondsSinceActivity;
    if (mode === "kind") {
      const k = a.s.kind.localeCompare(b.s.kind);
      if (k !== 0) return k;
      return b.s.secondsSinceStart - a.s.secondsSinceStart;
    }
    // "started" — oldest at top. secondsSinceStart desc.
    return b.s.secondsSinceStart - a.s.secondsSinceStart;
  });
}

function render(snapshot) {
  const counts = snapshot.counts || {};
  const thresholds = snapshot.thresholds || {};
  const live = Array.isArray(snapshot.live) ? snapshot.live : [];
  const idle = Array.isArray(snapshot.idle) ? snapshot.idle : [];
  const now = Math.floor(Date.now() / 1000);
  const ageSec = Math.max(0, now - Number(snapshot.generatedAt || now));
  const isStale = ageSec > STALE_SECONDS;

  const rows = applySort(
    [
      ...live.map((s) => ({ s, state: "live" })),
      ...idle.map((s) => ({ s, state: "idle" })),
    ],
    sortMode,
  );

  if (isStale) {
    // Red surfaces ONLY for "the dashboard itself isn't being fed" —
    // never to describe an agent. Honest separation of concerns.
    hud.setAttribute("data-state", "stale");
    modeEl.textContent = `${formatDuration(ageSec)} stale`;
    emptySection.hidden = false;
    listSection.hidden = true;
    emptyMark.textContent = "!";
    emptyText.textContent = "desk Mac quiet";
    emptyCounts.textContent = "no recent publish";
  } else if (rows.length === 0) {
    hud.setAttribute("data-state", "ok");
    modeEl.textContent = "no sessions";
    emptySection.hidden = false;
    listSection.hidden = true;
    emptyMark.textContent = "·";
    emptyText.textContent = "nothing tracked";
    emptyCounts.textContent = "no agent sessions found";
  } else {
    hud.setAttribute("data-state", "ok");
    const liveCount = live.length;
    if (liveCount > 0) {
      modeEl.textContent = `${liveCount} live`;
    } else {
      modeEl.textContent = `${rows.length} tracked`;
    }
    // Compose the label with the sort selector so it's always visible.
    listLabel.innerHTML =
      `sessions <button class="sort-cycle" type="button" id="sort-cycle"` +
      ` title="click to cycle sort order">sort: ${sortLabel(sortMode)} ▾</button>`;
    emptySection.hidden = true;
    listSection.hidden = false;
    listEl.innerHTML = rows.map(({ s, state }) => rowHtml(s, state)).join("");
    const cycle = document.getElementById("sort-cycle");
    if (cycle) cycle.addEventListener("click", (e) => {
      e.preventDefault();
      const i = SORT_MODES.indexOf(sortMode);
      sortMode = SORT_MODES[(i + 1) % SORT_MODES.length];
      try { localStorage.setItem(SORT_STORAGE_KEY, sortMode); } catch {}
      render(snapshot);
    });
  }

  footStamp.textContent = formatStamp(snapshot.generatedAt);
  footThresholds.textContent = `live <${thresholds.liveSeconds || 300}s`;
  footAge.textContent = `pub ${formatDuration(ageSec)} ago`;

  // ☕ reflects the menu bar applet's persisted state, read out of the
  // snapshot endpoint. Click handler does optimistic visual update so the
  // user doesn't wait for the next poll to see feedback.
  if (snapshot.keepAwake) applyKeepAwakeVisual(snapshot.keepAwake);

  reportSizeToHost();
}

function renderError(message) {
  hud.setAttribute("data-state", "error");
  modeEl.textContent = "no snapshot";
  emptySection.hidden = false;
  listSection.hidden = true;
  emptyMark.textContent = "!";
  emptyText.textContent = "no snapshot";
  emptyCounts.textContent = message || "snapshot file unreachable";
  footStamp.textContent = "—";
  footThresholds.textContent = "—";
  footAge.textContent = "—";
  reportSizeToHost();
}

// --- size reporting (host auto-resize) --------------------------------

let lastReportedHeight = 0;
function reportSizeToHost() {
  try {
    if (!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.lecterHud)) {
      return;
    }
    requestAnimationFrame(() => {
      const card = document.getElementById("hud");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const height = Math.ceil(rect.height) + 24;
      // Tolerate sub-pixel jitter: only report when the delta is enough to
       // visibly move the window. Otherwise every 2s render triggers a window
       // resize which can shift the buttons 1-2px right exactly when the
       // operator is trying to click them.
       if (Math.abs(height - lastReportedHeight) < 4) return;
       lastReportedHeight = height;
      window.webkit.messageHandlers.lecterHud.postMessage({ height });
    });
  } catch (_) { /* not hosted, ignore */ }
}

// --- keep-awake button ------------------------------------------------

// Local override so a click can flip the icon immediately, before the
// next snapshot tick. Cleared once the snapshot confirms a matching state.
let keepAwakeOptimistic = null;

function applyKeepAwakeVisual(state) {
  if (!btnKeepAwake) return;
  // If we have an optimistic override and it matches what the snapshot
  // reports, clear it — server caught up.
  if (keepAwakeOptimistic !== null && state.enabled === keepAwakeOptimistic) {
    keepAwakeOptimistic = null;
  }
  const enabled = keepAwakeOptimistic !== null ? keepAwakeOptimistic : !!state.enabled;
  const held = enabled && !!state.held;
  btnKeepAwake.classList.toggle("is-active", enabled && !held);
  btnKeepAwake.classList.toggle("is-held", held);
  btnKeepAwake.title = enabled
    ? (held ? "Keep-awake on — Mac is being held awake. Click to turn off."
            : "Keep-awake on — will hold sleep when plugged in. Click to turn off.")
    : "Keep-awake off — Mac sleeps normally. Click to keep awake.";
}

function postToHost(payload) {
  try {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.lecterHud) {
      window.webkit.messageHandlers.lecterHud.postMessage(payload);
      return true;
    }
  } catch (_) {}
  return false;
}

if (btnClose) {
  btnClose.addEventListener("click", (e) => {
    e.preventDefault();
    if (!postToHost({ action: "close" })) window.close();
  });
}

if (btnKeepAwake) {
  btnKeepAwake.addEventListener("click", (e) => {
    e.preventDefault();
    // Optimistic flip. We deliberately do NOT route through
    // applyKeepAwakeVisual here — that function clears the optimistic
    // override whenever the passed-in state matches, which would cause
    // the next stale snapshot poll to flicker the button back off.
    // Instead, set the override and update the classes directly. The next
    // genuine snapshot (within ~2s) that REPORTS the new server state will
    // be the one that clears the override.
    const currentlyEnabled = btnKeepAwake.classList.contains("is-active")
      || btnKeepAwake.classList.contains("is-held");
    keepAwakeOptimistic = !currentlyEnabled;
    btnKeepAwake.classList.toggle("is-active", keepAwakeOptimistic);
    btnKeepAwake.classList.toggle("is-held", false);
    postToHost({ action: "toggleKeepAwake" });
  });
}

// --- poll loop --------------------------------------------------------

async function poll() {
  const ctl = new AbortController();
  const timeoutId = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(SNAPSHOT_URL, { cache: "no-store", signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const snapshot = await res.json();
    consecutiveFailures = 0;
    render(snapshot);
  } catch (err) {
    consecutiveFailures += 1;
    if (consecutiveFailures >= ERROR_THRESHOLD) renderError(String(err.message || err));
  } finally {
    clearTimeout(timeoutId);
  }
}

poll();
setInterval(poll, POLL_INTERVAL_MS);
