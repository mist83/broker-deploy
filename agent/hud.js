// agent.mullmania.com /hud — glanceable view of Claude Code + Codex sessions
// that need attention on the operator's desk Mac.
//
// Data source: /hud/snapshot.json — written every ~5s by Valet's worker on the
// desk Mac. If the file is missing or stale, the HUD says so honestly rather
// than pretending everything is fine.

const SNAPSHOT_URL = "/hud/snapshot.json";
const POLL_INTERVAL_MS = 2000;
const STALE_SECONDS = 30;  // if snapshot is older than this, surface it
const TIMEOUT_MS = 4000;
// Tolerate transient blips (single S3/CloudFront miss, network jitter) before
// flashing red. 5 * 2s ≈ 10s of sustained failure before the user sees an
// error state — long enough that a normal hiccup doesn't twitch the UI.
const ERROR_THRESHOLD = 5;

const hud = document.getElementById("hud");
const modeEl = document.getElementById("hud-mode");
const emptySection = hud.querySelector(".hud-empty");
const emptyMark = document.getElementById("empty-mark");
const emptyText = document.getElementById("empty-text");
const emptyCounts = document.getElementById("empty-counts");
const listSection = hud.querySelector(".hud-list");
const listEl = document.getElementById("needs-you-list");
const footStamp = document.getElementById("foot-stamp");
const footThresholds = document.getElementById("foot-thresholds");
const footAge = document.getElementById("foot-age");

let consecutiveFailures = 0;

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

function rowHtml(session) {
  const label = shortProject(session.project) || shortSessionId(session.sessionId) || "—";
  const elapsed = formatDuration(session.secondsSinceActivity);
  const title = session.project || session.sessionId || "";
  return `
    <li class="row row-${session.kind}">
      <span class="dot"></span>
      <span class="kind">${session.kind}</span>
      <span class="label" title="${escapeHtml(title)}">${escapeHtml(label)}</span>
      <span class="elapsed">${escapeHtml(elapsed)}</span>
    </li>
  `;
}

function renderCounts(counts) {
  const parts = [];
  if (counts.claude > 0) parts.push(`${counts.claude} claude`);
  if (counts.codex > 0) parts.push(`${counts.codex} codex`);
  if (parts.length === 0) return "no live sessions";
  parts.push(`${counts.working} working`);
  return parts.join(" · ");
}

function plural(n, one, many) { return n === 1 ? one : many; }

function formatStamp(epoch) {
  if (!epoch) return "—";
  const d = new Date(epoch * 1000);
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function render(snapshot) {
  const counts = snapshot.counts || {};
  const thresholds = snapshot.thresholds || {};
  const needsYou = Array.isArray(snapshot.needsYou) ? snapshot.needsYou : [];
  const now = Math.floor(Date.now() / 1000);
  const ageSec = Math.max(0, now - Number(snapshot.generatedAt || now));
  const isStale = ageSec > STALE_SECONDS;

  if (isStale) {
    hud.setAttribute("data-state", "stale");
    modeEl.textContent = `${formatDuration(ageSec)} stale`;
    emptySection.hidden = false;
    listSection.hidden = true;
    emptyMark.textContent = "!";
    emptyText.textContent = "desk Mac quiet";
    emptyCounts.textContent = "no recent publish";
  } else if (needsYou.length === 0) {
    hud.setAttribute("data-state", "ok");
    modeEl.textContent = "idle watch";
    emptySection.hidden = false;
    listSection.hidden = true;
    emptyMark.textContent = "✓";
    emptyText.textContent = "all good";
    emptyCounts.textContent = renderCounts(counts);
  } else {
    hud.setAttribute("data-state", "needs-you");
    modeEl.textContent = `${needsYou.length} ${plural(needsYou.length, "asking", "asking")}`;
    emptySection.hidden = true;
    listSection.hidden = false;
    listEl.innerHTML = needsYou.map(rowHtml).join("");
  }

  footStamp.textContent = formatStamp(snapshot.generatedAt);
  footThresholds.textContent =
    `live <${thresholds.workingSeconds}s · stale >${thresholds.idleSeconds}s`;
  footAge.textContent = `pub ${formatDuration(ageSec)} ago`;

  reportSizeToHost();
}

// When this page is hosted inside the lecter floating window's WKWebView,
// the JXA shell registers a WKScriptMessageHandler named "lecterHud" that
// resizes the NSWindow to match the card's actual height. Posting after
// every render keeps the window snug as the HUD state changes (idle ↔
// "needs you" lists of different lengths). In a regular browser the
// handler is absent and this is a no-op.
let lastReportedHeight = 0;
function reportSizeToHost() {
  try {
    if (!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.lecterHud)) {
      return;
    }
    // Read after layout settles so we don't ping with a stale height.
    requestAnimationFrame(() => {
      const card = document.getElementById("hud");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      // Card height + body padding (12px top + 12px bottom).
      const height = Math.ceil(rect.height) + 24;
      if (height === lastReportedHeight) return;
      lastReportedHeight = height;
      window.webkit.messageHandlers.lecterHud.postMessage({ height });
    });
  } catch (_) { /* not hosted, ignore */ }
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
