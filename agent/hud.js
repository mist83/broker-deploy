// agent.mullmania.com /hud — glanceable view of Claude Code + Codex sessions
// on the operator's desk Mac.
//
// State model is intentionally minimal:
//   - each row is either "live" (green dot, recent on-disk write) or
//     "idle" (gray dot, paused but still tracked)
//   - red ONLY appears for "snapshot pipeline broken" — never per-row
//   - keep-awake has no UI: while the host (lecter floating HUD) sees agent
//     activity in the last N minutes, it holds caffeinate. After N minutes
//     of total inactivity, the host quits itself.
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
const btnScreen = document.getElementById("btn-screen");
const screenSection = document.getElementById("hud-screen");
const screenImg = document.getElementById("hud-screen-img");
const screenCaption = document.getElementById("hud-screen-caption");

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

// Tracks which row (by sessionId) is currently expanded to show its synopsis.
// Only one at a time — keeps the card compact and matches "click to peek".
let expandedSessionId = null;

// Compact mode: collapse the 3-line synopsis into a single line of "agent
// preview · doing tool". Persisted in localStorage. Toggle button lives in
// the same row as the sort chip.
const COMPACT_STORAGE_KEY = "valet-hud-compact";
let compactMode = (() => {
  try { return localStorage.getItem(COMPACT_STORAGE_KEY) === "1"; } catch { return false; }
})();

// Alerts: when a session transitions live → idle (or just-finished an
// assistant turn and went quiet), surface that immediately — bring the
// HUD window forward, play a soft sound, show a notification. Mute via the
// 🔔 toggle. Per-session cooldown prevents spam.
const ALERT_STORAGE_KEY = "valet-hud-alerts";
let alertsEnabled = (() => {
  try { return localStorage.getItem(ALERT_STORAGE_KEY) !== "0"; } catch { return true; }
})();
const lastAlertAtBySid = new Map();              // sessionId → unix sec
const previousStateBySid = new Map();            // sessionId → "live" | "idle"
const ALERT_COOLDOWN_SEC = 60;

// Overflow: when the operator has more than this many sessions, collapse
// the list to the top few and offer a "show all" link. Sort order is
// already operator-controlled (sort chip), so "top N" honors that.
const ROW_COLLAPSE_THRESHOLD = 4;
let showAllRows = false; // session-scoped, not persisted — defaults to collapsed

// Screen-cast: opt-in remote view of the desk Mac's actual screen. Requires
// the worker to be publishing screen-<token>.jpg AND the page bookmark to
// carry ?token=<same token>. The token gates the discovery of the image
// URL — it's obscurity, not auth, but it keeps the image off easily-
// guessable URLs.
const SCREEN_STORAGE_KEY = "valet-hud-screen-visible";
let screenVisible = (() => {
  try { return localStorage.getItem(SCREEN_STORAGE_KEY) === "1"; } catch { return false; }
})();
const SCREEN_TOKEN = (() => {
  try { return new URLSearchParams(window.location.search).get("token") || ""; } catch { return ""; }
})();
const SCREEN_REFRESH_MS = 10_000;
let screenRefreshTimer = null;

// Dismissed sessions: snoozed until the session writes again. We store
// {sessionId → dismissedAtUnixSec}; a row is hidden only while its
// lastActivityAt <= dismissedAt. If the session has any new write after
// dismissal, the snooze auto-expires and the row reappears — which is
// what the operator wants: "if I kill an in-flight one, just remove it,
// but bring it back when it's alive again."
const DISMISS_STORAGE_KEY = "valet-hud-dismissed-v2";
let dismissedMap = (() => {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY) || "{}";
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? new Map(Object.entries(obj)) : new Map();
  } catch { return new Map(); }
})();
function saveDismissed() {
  try {
    const obj = Object.fromEntries(dismissedMap);
    localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}
function isDismissedFor(session) {
  const at = dismissedMap.get(session.sessionId);
  if (typeof at !== "number") return false;
  // Snooze expires the moment the session writes again.
  return Number(session.lastActivityAt || 0) <= at;
}

function synopsisHtml(syn) {
  if (!syn || (!syn.lastUser && !syn.lastAssistant && !syn.currentTool)) {
    return `<div class="syn-empty">No activity in the recent tail of the session file yet.</div>`;
  }
  if (compactMode) {
    // Single-line: agent text (truncated harder) then tool inline.
    const asst = (syn.lastAssistant || syn.lastUser || "").slice(0, 110);
    const tool = syn.currentTool
      ? `<span class="syn-inline-tool">⏵ ${escapeHtml(syn.currentTool.name)}${syn.currentTool.description ? " · " + escapeHtml(syn.currentTool.description) : ""}</span>`
      : "";
    return `<div class="syn-compact">${escapeHtml(asst)}${asst ? " " : ""}${tool}</div>`;
  }
  const parts = [];
  if (syn.lastUser) {
    parts.push(`<div class="syn-line syn-user"><span class="syn-label">you</span><span class="syn-text">${escapeHtml(syn.lastUser)}</span></div>`);
  }
  if (syn.lastAssistant) {
    parts.push(`<div class="syn-line syn-asst"><span class="syn-label">agent</span><span class="syn-text">${escapeHtml(syn.lastAssistant)}</span></div>`);
  }
  if (syn.currentTool) {
    const desc = syn.currentTool.description ? ` · ${syn.currentTool.description}` : "";
    parts.push(`<div class="syn-line syn-tool"><span class="syn-label">doing</span><span class="syn-text">${escapeHtml(syn.currentTool.name)}${escapeHtml(desc)}</span></div>`);
  }
  return parts.join("");
}

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
    `\nstarted ${started} ago · last write ${elapsed} ago · click for live synopsis`;
  const isExpanded = expandedSessionId === session.sessionId;
  const expandedSection = isExpanded
    ? `<div class="row-synopsis">${synopsisHtml(session.synopsis)}</div>`
    : "";
  const labelClass = "label" + (session.titleSynthetic ? " label-synthetic" : "");
  const dismissBtn =
    `<button class="row-dismiss" type="button" data-dismiss="${escapeHtml(session.sessionId)}"` +
    ` title="snooze this session — reappears the next time it writes">×</button>`;
  return `
    <li class="row row-${session.kind} row-${state}${isExpanded ? ' is-expanded' : ''}" data-session-id="${escapeHtml(session.sessionId)}">
      <span class="dot"></span>
      <span class="kind">${session.kind}</span>
      <span class="${labelClass}" title="${escapeHtml(tooltip)}">${escapeHtml(label)}</span>
      ${startedSpan}
      <span class="elapsed" title="time since last write">${escapeHtml(elapsed)}</span>
      ${dismissBtn}
      ${expandedSection}
    </li>
  `;
}

// --- main render ------------------------------------------------------

// User-pickable sort. Default is `started` (oldest at top, brand new
// sessions append at the bottom) — that's the stable order: a session's
// startedAt never changes, so the list doesn't reshuffle as sessions
// pause and resume. The operator can cycle to a different sort via the
// header chip; choice persists in localStorage.
const SORT_MODES = ["started", "recent", "kind", "name"];
const SORT_STORAGE_KEY = "valet-hud-sort";
let sortMode = (() => {
  try { return SORT_MODES.includes(localStorage.getItem(SORT_STORAGE_KEY))
    ? localStorage.getItem(SORT_STORAGE_KEY) : "started"; } catch { return "started"; }
})();

function sortLabel(mode) {
  switch (mode) {
    case "recent": return "recent";
    case "kind":   return "kind";
    case "name":   return "name";
    default:       return "started";
  }
}

function rowNameForSort(s) {
  return (s.title || s.project || s.sessionId || "").toLowerCase();
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
    if (mode === "name") {
      return rowNameForSort(a.s).localeCompare(rowNameForSort(b.s));
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
    ].filter(({ s }) => !isDismissedFor(s)),
    sortMode,
  );

  // Alert detection: compare each row's state to what we recorded last
  // render. A live→idle transition (or first-seen-idle for a session that
  // looks like it just finished an assistant turn) triggers a single
  // attention ping per cooldown window. Snoozed sessions never alert.
  const sessionsToAlert = [];
  const seenSidsThisRender = new Set();
  for (const { s, state } of rows) {
    seenSidsThisRender.add(s.sessionId);
    const prev = previousStateBySid.get(s.sessionId);
    previousStateBySid.set(s.sessionId, state);
    if (!alertsEnabled) continue;
    if (isDismissedFor(s)) continue;
    if (state !== "idle") continue;
    // Only alert when we WATCHED a live→idle transition. If we boot up
    // and the row's already idle, that's not an event — skip.
    if (prev !== "live") continue;
    const nowSec = Math.floor(Date.now() / 1000);
    const last = lastAlertAtBySid.get(s.sessionId) || 0;
    if (nowSec - last < ALERT_COOLDOWN_SEC) continue;
    lastAlertAtBySid.set(s.sessionId, nowSec);
    sessionsToAlert.push(s);
  }
  // Garbage-collect map entries for sessions that have disappeared.
  for (const sid of [...previousStateBySid.keys()]) {
    if (!seenSidsThisRender.has(sid)) previousStateBySid.delete(sid);
  }
  for (const s of sessionsToAlert) {
    const label = (s.title && s.title.trim()) || shortProject(s.project) || shortSessionId(s.sessionId);
    postToHost({ action: "alert", sessionId: s.sessionId, kind: s.kind, label });
  }

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
    // List label hosts the sort + compact + alert toggles. All stop event
    // bubbling so clicks on these chips don't also toggle a row beneath.
    listLabel.innerHTML =
      `<span>sessions</span>` +
      `<span class="list-tools">` +
        `<button class="sort-cycle" type="button" id="alert-toggle"` +
        ` title="${alertsEnabled ? "alerts on (click to mute attention pings)" : "alerts muted (click to enable)"}">${alertsEnabled ? "🔔" : "🔕"}</button>` +
        `<button class="sort-cycle" type="button" id="sort-cycle"` +
        ` title="click to cycle sort order">sort: ${sortLabel(sortMode)} ▾</button>` +
        `<button class="sort-cycle" type="button" id="compact-toggle"` +
        ` title="toggle compact synopsis (1 line vs 3)">${compactMode ? "expand" : "compact"}</button>` +
      `</span>`;
    emptySection.hidden = true;
    listSection.hidden = false;
    // Collapse rows beyond the threshold unless the operator explicitly
    // asked to see them all. Sort already determines what "top N" means.
    const overflow = rows.length > ROW_COLLAPSE_THRESHOLD;
    const visibleRows = overflow && !showAllRows
      ? rows.slice(0, ROW_COLLAPSE_THRESHOLD)
      : rows;
    const collapseHint = overflow
      ? `<li class="row-collapse" data-collapse-toggle="1">${
          showAllRows
            ? `show top ${ROW_COLLAPSE_THRESHOLD} (collapse)`
            : `+ ${rows.length - ROW_COLLAPSE_THRESHOLD} more · show all`
        }</li>`
      : "";
    listEl.innerHTML = visibleRows.map(({ s, state }) => rowHtml(s, state)).join("") + collapseHint;
    // If the previously-expanded row dropped off the list, collapse.
    if (expandedSessionId && !rows.some((r) => r.s.sessionId === expandedSessionId)) {
      expandedSessionId = null;
    }
    // Row click → expand/collapse. Dismiss button gets its own handler that
    // stops propagation so the row's click handler doesn't also fire.
    listEl.querySelectorAll(".row").forEach((row) => {
      row.addEventListener("click", (e) => {
        e.preventDefault();
        const sid = row.getAttribute("data-session-id");
        if (!sid) return;
        expandedSessionId = expandedSessionId === sid ? null : sid;
        render(snapshot);
      });
    });
    const collapseEl = listEl.querySelector(".row-collapse");
    if (collapseEl) collapseEl.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showAllRows = !showAllRows;
      render(snapshot);
    });
    listEl.querySelectorAll(".row-dismiss").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sid = btn.getAttribute("data-dismiss");
        if (!sid) return;
        // Snooze: stamp with NOW. The row reappears the moment the
        // session writes anything after this timestamp.
        dismissedMap.set(sid, Math.floor(Date.now() / 1000));
        if (expandedSessionId === sid) expandedSessionId = null;
        saveDismissed();
        render(snapshot);
      });
    });
    const cycle = document.getElementById("sort-cycle");
    if (cycle) cycle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const i = SORT_MODES.indexOf(sortMode);
      sortMode = SORT_MODES[(i + 1) % SORT_MODES.length];
      try { localStorage.setItem(SORT_STORAGE_KEY, sortMode); } catch {}
      render(snapshot);
    });
    const compactBtn = document.getElementById("compact-toggle");
    if (compactBtn) compactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      compactMode = !compactMode;
      try { localStorage.setItem(COMPACT_STORAGE_KEY, compactMode ? "1" : "0"); } catch {}
      render(snapshot);
    });
    const alertBtn = document.getElementById("alert-toggle");
    if (alertBtn) alertBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      alertsEnabled = !alertsEnabled;
      try { localStorage.setItem(ALERT_STORAGE_KEY, alertsEnabled ? "1" : "0"); } catch {}
      render(snapshot);
    });
  }

  footStamp.textContent = formatStamp(snapshot.generatedAt);
  footThresholds.textContent = `live <${thresholds.liveSeconds || 300}s`;
  footAge.textContent = `pub ${formatDuration(ageSec)} ago`;

  // Heartbeat: tell the host (lecter floating HUD) how recently any tracked
  // session wrote. Host decides whether to hold caffeinate and whether to
  // quit on inactivity. No-op when not hosted in WKWebView.
  const allSecs = [
    ...live.map((s) => Number(s.secondsSinceActivity)),
    ...idle.map((s) => Number(s.secondsSinceActivity)),
  ].filter((v) => Number.isFinite(v) && v >= 0);
  if (allSecs.length > 0) {
    postToHost({ action: "activityHeartbeat", secondsSinceActivity: Math.min(...allSecs) });
  }

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

// Screen image src is composed from the token in the page URL. Without a
// token nothing fetches — the worker writes screen-<token>.jpg and the
// bookmark for this page has ?token=<same>, so the same operator who set
// it up is the only one who can render the image.
function screenImageUrl() {
  if (!SCREEN_TOKEN) return "";
  return `/hud/screen-${encodeURIComponent(SCREEN_TOKEN)}.jpg?t=${Date.now()}`;
}

function startScreenAutoRefresh() {
  stopScreenAutoRefresh();
  refreshScreenImage();
  screenRefreshTimer = setInterval(refreshScreenImage, SCREEN_REFRESH_MS);
}
function stopScreenAutoRefresh() {
  if (screenRefreshTimer) clearInterval(screenRefreshTimer);
  screenRefreshTimer = null;
}
function refreshScreenImage() {
  const url = screenImageUrl();
  if (!url || !screenImg) return;
  screenImg.src = url;
}

function applyScreenVisibility() {
  if (!screenSection) return;
  if (!SCREEN_TOKEN) {
    // No token in the URL — the feature is dormant. Toggle still works
    // visually, but we explain why nothing's loading.
    screenSection.hidden = !screenVisible;
    if (screenVisible) {
      screenImg.removeAttribute("src");
      screenCaption.textContent = "screen-cast token missing — add ?token=<your-token> to the bookmark";
    }
    return;
  }
  screenSection.hidden = !screenVisible;
  if (screenVisible) {
    screenCaption.textContent = "live screen · refreshes every 10s";
    startScreenAutoRefresh();
  } else {
    stopScreenAutoRefresh();
    screenImg.removeAttribute("src");
  }
}

if (btnScreen) {
  btnScreen.addEventListener("click", (e) => {
    e.preventDefault();
    screenVisible = !screenVisible;
    try { localStorage.setItem(SCREEN_STORAGE_KEY, screenVisible ? "1" : "0"); } catch {}
    btnScreen.classList.toggle("is-active", screenVisible);
    applyScreenVisibility();
  });
  // Initial sync — class + visibility match persisted state.
  btnScreen.classList.toggle("is-active", screenVisible);
  applyScreenVisibility();
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
