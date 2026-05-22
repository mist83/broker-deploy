// agent.mullmania.com /hud — glanceable view of Claude Code + Codex sessions
// on the operator's desk Mac.
//
// State model is intentionally minimal:
//   - each row is either "live" (bright agent icon, recent on-disk write) or
//     "idle" (gray agent icon, paused but still tracked)
//   - red ONLY appears for "snapshot pipeline broken" — never per-row
//   - keep-awake is explicit: the floating host can keep the desk Mac awake
//     while agents are active, then release after the configured idle window.
//
// Data source: /hud/snapshot.json — published every ~5s by Valet's worker.

const SNAPSHOT_URL = "/hud/snapshot.json";
const POLL_INTERVAL_MS = 2000;
const STALE_SECONDS = 180;    // snapshot file older than this → "stale" red
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
const collapseToggleBtn = document.getElementById("row-collapse-toggle");
const footStamp = document.getElementById("foot-stamp");
const footThresholds = document.getElementById("foot-thresholds");
const footAge = document.getElementById("foot-age");
const btnClose = document.getElementById("btn-close");
const btnScreen = document.getElementById("btn-screen");
const btnQr = document.getElementById("btn-qr");
const sharePanel = document.getElementById("share-panel");
const shareUrl = document.getElementById("share-url");
const qrCode = document.getElementById("qr-code");
const shareClose = document.getElementById("share-close");
const screenSection = document.getElementById("hud-screen");
const screenImg = document.getElementById("hud-screen-img");
const screenCaption = document.getElementById("hud-screen-caption");
const screenPlaceholder = document.getElementById("hud-screen-placeholder");
const screenPlaceholderTitle = screenPlaceholder && screenPlaceholder.querySelector(".hud-screen-placeholder-title");
const screenPlaceholderText = screenPlaceholder && screenPlaceholder.querySelector(".hud-screen-placeholder-text");
const keepAwakeToggle = document.getElementById("keep-awake-toggle");
const keepAwakeStatus = document.getElementById("keep-awake-status");
const screenOverlay = document.getElementById("hud-screen-overlay");

let consecutiveFailures = 0;
let lastSnapshot = null;
let keepAwakeEnabled = false;
let keepAwakeWindowSeconds = 10 * 60;
let currentScreenCast = null;
let screenImageState = "waiting";
let screenBroadcastChanging = false;
let pendingScreenBroadcastEnabled = null;
let localScreenPreviewActive = false;
let localScreenPreviewCapturedAt = null;
let lastScreenImageLoadedAt = null;

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

function tablerIcon(name, className = "") {
  const cls = `ti${className ? " " + className : ""}`;
  const attrs = `class="${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  switch (name) {
    case "bell":
      return `<svg ${attrs}><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>`;
    case "bell-off":
      return `<svg ${attrs}><path d="M9.346 5.353c.21 -.129 .428 -.246 .654 -.353a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3m-1 3h-13a4 4 0 0 0 2 -3v-3a6.996 6.996 0 0 1 1.273 -3.707" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /><path d="M3 3l18 18" /></svg>`;
    case "brain":
      return `<svg ${attrs}><path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" /><path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" /><path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" /><path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" /><path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" /><path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" /></svg>`;
    case "cloud-off":
      return `<svg ${attrs}><path d="M9.58 5.548c.24 -.11 .495 -.19 .764 -.238a5.507 5.507 0 0 1 6.156 4.69h.5a4 4 0 0 1 3.579 5.787" /><path d="M17 17h-10a4 4 0 0 1 -.982 -7.875" /><path d="M3 3l18 18" /></svg>`;
    case "device-desktop":
      return `<svg ${attrs}><path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" /><path d="M7 20h10" /><path d="M9 16v4" /><path d="M15 16v4" /></svg>`;
    case "link":
      return `<svg ${attrs}><path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 1 1 7.072 7.072l-.535 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" /></svg>`;
    case "qrcode":
      return `<svg ${attrs}><path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M7 17l0 .01" /><path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M7 7l0 .01" /><path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M17 7l0 .01" /><path d="M14 14l3 0" /><path d="M20 14l0 .01" /><path d="M14 14l0 3" /><path d="M14 20l3 0" /><path d="M17 17l3 0" /><path d="M20 17l0 3" /></svg>`;
    case "eye":
      return `<svg ${attrs}><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>`;
    case "eye-off":
      return `<svg ${attrs}><path d="M10.585 10.587a2 2 0 0 0 2.829 2.826" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6a13.55 13.55 0 0 1 3.394 -3.62" /><path d="M9.88 5.914a8.77 8.77 0 0 1 2.12 -.264c3.6 0 6.6 2 9 6a13.566 13.566 0 0 1 -1.512 2.062" /><path d="M3 3l18 18" /></svg>`;
    case "x":
      return `<svg ${attrs}><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`;
    case "brand-openai":
    default:
      return `<svg ${attrs}><path d="M11.217 19.384a3.501 3.501 0 0 0 6.783 -1.217v-5.167l-6 -3.35" /><path d="M5.214 15.014a3.501 3.501 0 0 0 4.446 5.266l4.34 -2.534v-6.946" /><path d="M6 7.63c-1.391 -.236 -2.787 .395 -3.534 1.689a3.474 3.474 0 0 0 1.271 4.745l4.263 2.514l6 -3.348" /><path d="M12.783 4.616a3.501 3.501 0 0 0 -6.783 1.217v5.067l6 3.45" /><path d="M18.786 8.986a3.501 3.501 0 0 0 -4.446 -5.266l-4.34 2.534v6.946" /><path d="M18 16.302c1.391 .236 2.787 -.395 3.534 -1.689a3.474 3.474 0 0 0 -1.271 -4.745l-4.308 -2.514l-5.955 3.42" /></svg>`;
  }
}

function agentIconFor(kind) {
  return String(kind || "").toLowerCase() === "claude"
    ? tablerIcon("brain", "agent-svg")
    : tablerIcon("brand-openai", "agent-svg");
}

function agentName(kind) {
  const normalized = String(kind || "").toLowerCase();
  if (normalized === "claude") return "Claude";
  if (normalized === "codex") return "Codex / ChatGPT";
  return normalized || "agent";
}

function formatStamp(epoch) {
  if (!epoch) return "—";
  const d = new Date(epoch * 1000);
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function describeWindow(secondsIn) {
  const seconds = Math.max(60, Math.floor(Number(secondsIn) || 10 * 60));
  return formatDuration(seconds);
}

// Small fixed-profile QR encoder for the live HUD URL.
// Version 5-L fits the tokened agent URL and avoids sending the token to a
// third-party QR service.
function qrSvgForText(text) {
  const VERSION = 5;
  const SIZE = 17 + VERSION * 4;
  const DATA_CODEWORDS = 108;
  const ECC_CODEWORDS = 26;
  const bytes = Array.from(new TextEncoder().encode(String(text)));
  if (bytes.length > DATA_CODEWORDS - 4) throw new Error("URL too long for QR");

  const gfExp = new Array(512);
  const gfLog = new Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    gfExp[i] = x;
    gfLog[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) gfExp[i] = gfExp[i - 255];
  const gfMul = (a, b) => (a && b) ? gfExp[gfLog[a] + gfLog[b]] : 0;

  function reedSolomonGenerator(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], gfExp[i]);
      }
      poly = next;
    }
    return poly.slice(1);
  }

  function reedSolomonRemainder(data, degree) {
    const gen = reedSolomonGenerator(degree);
    const result = new Array(degree).fill(0);
    for (const b of data) {
      const factor = b ^ result.shift();
      result.push(0);
      for (let i = 0; i < degree; i++) result[i] ^= gfMul(gen[i], factor);
    }
    return result;
  }

  const bitBuffer = [];
  const appendBits = (value, length) => {
    for (let i = length - 1; i >= 0; i--) bitBuffer.push((value >>> i) & 1);
  };
  appendBits(0x4, 4); // byte mode
  appendBits(bytes.length, 8);
  for (const b of bytes) appendBits(b, 8);
  appendBits(0, Math.min(4, DATA_CODEWORDS * 8 - bitBuffer.length));
  while (bitBuffer.length % 8) bitBuffer.push(0);
  const data = [];
  for (let i = 0; i < bitBuffer.length; i += 8) {
    data.push(bitBuffer.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0));
  }
  for (let pad = 0; data.length < DATA_CODEWORDS; pad++) data.push(pad % 2 ? 0x11 : 0xec);
  const codewords = data.concat(reedSolomonRemainder(data, ECC_CODEWORDS));
  const dataBits = [];
  for (const b of codewords) appendDataBits(b, dataBits);

  function appendDataBits(value, out) {
    for (let i = 7; i >= 0; i--) out.push((value >>> i) & 1);
  }

  const base = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  const func = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  const setFunction = (cx, cy, dark) => {
    if (cx < 0 || cy < 0 || cx >= SIZE || cy >= SIZE) return;
    base[cy][cx] = !!dark;
    func[cy][cx] = true;
  };

  function drawFinder(cx, cy) {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const xx = cx + dx;
        const yy = cy + dy;
        const dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 &&
          (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        setFunction(xx, yy, dark);
      }
    }
  }

  function drawAlignment(cx, cy) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(SIZE - 7, 0);
  drawFinder(0, SIZE - 7);
  drawAlignment(30, 30);
  for (let i = 8; i < SIZE - 8; i++) {
    setFunction(i, 6, i % 2 === 0);
    setFunction(6, i, i % 2 === 0);
  }
  reserveFormatModules();
  setFunction(8, SIZE - 8, true);

  function reserveFormatModules() {
    for (let i = 0; i <= 8; i++) {
      if (i !== 6) {
        setFunction(8, i, false);
        setFunction(i, 8, false);
      }
    }
    for (let i = 0; i < 8; i++) {
      setFunction(SIZE - 1 - i, 8, false);
    }
    for (let i = 0; i < 7; i++) {
      setFunction(8, SIZE - 1 - i, false);
    }
  }

  const maskFns = [
    (cx, cy) => (cx + cy) % 2 === 0,
    (_cx, cy) => cy % 2 === 0,
    (cx) => cx % 3 === 0,
    (cx, cy) => (cx + cy) % 3 === 0,
    (cx, cy) => (Math.floor(cx / 3) + Math.floor(cy / 2)) % 2 === 0,
    (cx, cy) => ((cx * cy) % 2 + (cx * cy) % 3) === 0,
    (cx, cy) => (((cx * cy) % 2 + (cx * cy) % 3) % 2) === 0,
    (cx, cy) => (((cx + cy) % 2 + (cx * cy) % 3) % 2) === 0,
  ];

  function drawData(mask) {
    const out = base.map((row) => row.slice());
    let bitIndex = 0;
    let upward = true;
    for (let right = SIZE - 1; right >= 1; right -= 2) {
      if (right === 6) right--;
      for (let vert = 0; vert < SIZE; vert++) {
        const yy = upward ? SIZE - 1 - vert : vert;
        for (let j = 0; j < 2; j++) {
          const xx = right - j;
          if (func[yy][xx]) continue;
          let dark = bitIndex < dataBits.length ? dataBits[bitIndex++] === 1 : false;
          if (maskFns[mask](xx, yy)) dark = !dark;
          out[yy][xx] = dark;
        }
      }
      upward = !upward;
    }
    drawFormat(out, mask);
    return out;
  }

  function drawFormat(out, mask) {
    const bits = formatBits(mask);
    const set = (cx, cy, i) => { out[cy][cx] = ((bits >>> i) & 1) !== 0; };
    for (let i = 0; i <= 5; i++) set(8, i, i);
    set(8, 7, 6);
    set(8, 8, 7);
    set(7, 8, 8);
    for (let i = 9; i < 15; i++) set(14 - i, 8, i);
    for (let i = 0; i < 8; i++) set(SIZE - 1 - i, 8, i);
    for (let i = 8; i < 15; i++) set(8, SIZE - 15 + i, i);
  }

  function formatBits(mask) {
    const dataValue = (1 << 3) | mask; // L error correction, mask id
    let rem = dataValue << 10;
    for (let i = 14; i >= 10; i--) {
      if (((rem >>> i) & 1) !== 0) rem ^= 0x537 << (i - 10);
    }
    return ((dataValue << 10) | (rem & 0x3ff)) ^ 0x5412;
  }

  function penalty(mod) {
    let p = 0;
    for (let y = 0; y < SIZE; y++) p += linePenalty(mod[y]) + finderPenalty(mod[y]);
    for (let x = 0; x < SIZE; x++) {
      const col = mod.map((row) => row[x]);
      p += linePenalty(col) + finderPenalty(col);
    }
    for (let y = 0; y < SIZE - 1; y++) {
      for (let x = 0; x < SIZE - 1; x++) {
        const c = mod[y][x];
        if (mod[y][x + 1] === c && mod[y + 1][x] === c && mod[y + 1][x + 1] === c) p += 3;
      }
    }
    const dark = mod.flat().filter(Boolean).length;
    p += Math.floor(Math.abs(dark * 20 - SIZE * SIZE * 10) / (SIZE * SIZE)) * 10;
    return p;
  }

  function linePenalty(line) {
    let p = 0;
    let runColor = line[0];
    let run = 1;
    for (let i = 1; i <= line.length; i++) {
      if (i < line.length && line[i] === runColor) {
        run++;
      } else {
        if (run >= 5) p += run - 2;
        runColor = line[i];
        run = 1;
      }
    }
    return p;
  }

  function finderPenalty(line) {
    let p = 0;
    const pattern = [true, false, true, true, true, false, true];
    for (let i = 0; i <= line.length - 7; i++) {
      if (pattern.every((v, j) => line[i + j] === v)) {
        const before = i >= 4 && line.slice(i - 4, i).every((v) => !v);
        const after = i + 11 <= line.length && line.slice(i + 7, i + 11).every((v) => !v);
        if (before || after) p += 40;
      }
    }
    return p;
  }

  let best = drawData(0);
  let bestPenalty = penalty(best);
  for (let mask = 1; mask < 8; mask++) {
    const candidate = drawData(mask);
    const score = penalty(candidate);
    if (score < bestPenalty) {
      best = candidate;
      bestPenalty = score;
    }
  }

  const border = 4;
  const viewSize = SIZE + border * 2;
  let path = "";
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (best[y][x]) path += `M${x + border},${y + border}h1v1h-1z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" role="img" aria-label="QR code"><rect width="${viewSize}" height="${viewSize}" fill="#fff"/><path fill="#000" d="${path}"/></svg>`;
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
// alert toggle. Per-session cooldown prevents spam.
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
let pendingListScroll = null;
let collapsePointerHandledAt = 0;

// Screen-cast: opt-in remote view of the desk Mac's actual screen. Requires
// the worker to be publishing screen-<token>.jpg AND the page bookmark to
// carry ?token=<same token>. The token gates the discovery of the image
// URL — it's obscurity, not auth, but it keeps the image off easily-
// guessable URLs.
const SCREEN_STORAGE_KEY = "valet-hud-screen-visible";
let screenVisible = (() => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("screen") === "1") return true;
    return localStorage.getItem(SCREEN_STORAGE_KEY) === "1";
  } catch { return false; }
})();
const SCREEN_TOKEN = (() => {
  try { return new URLSearchParams(window.location.search).get("token") || ""; } catch { return ""; }
})();
const SCREEN_REFRESH_MS = 10_000;
let screenRefreshTimer = null;

// Hidden sessions: local HUD visibility only, never a task kill. Hidden
// rows reappear automatically the next time that session writes, so stale
// clutter can be cleared without losing a live agent.
const HIDDEN_STORAGE_KEY = "valet-hud-hidden-v1";
const LEGACY_DISMISS_STORAGE_KEY = "valet-hud-dismissed-v2";
const SHOW_HIDDEN_STORAGE_KEY = "valet-hud-show-hidden";
let hiddenMap = (() => {
  try {
    const raw = localStorage.getItem(HIDDEN_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_DISMISS_STORAGE_KEY) || "{}";
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return new Map();
    const clean = new Map();
    for (const [sid, value] of Object.entries(obj)) {
      const stamp = Number(value);
      if (sid && Number.isFinite(stamp)) clean.set(sid, stamp);
    }
    return clean;
  } catch { return new Map(); }
})();
let showHiddenRows = (() => {
  try { return localStorage.getItem(SHOW_HIDDEN_STORAGE_KEY) === "1"; } catch { return false; }
})();
function saveHidden() {
  try {
    const obj = Object.fromEntries(hiddenMap);
    localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}
function isHiddenFor(session) {
  const at = hiddenMap.get(session.sessionId);
  if (typeof at !== "number") return false;
  // Hide expires the moment the session writes again.
  return Number(session.lastActivityAt || 0) <= at;
}
function persistShowHidden() {
  try { localStorage.setItem(SHOW_HIDDEN_STORAGE_KEY, showHiddenRows ? "1" : "0"); } catch {}
}

function synopsisPreview(syn) {
  if (!syn) return "";
  const toolText = syn.currentTool
    ? `${syn.currentTool.name || ""}${syn.currentTool.description ? " · " + syn.currentTool.description : ""}`
    : "";
  const raw = syn.lastAssistant || syn.lastUser || toolText || "";
  const normalized = String(raw).replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
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

function rowHtml(session, state, index, hidden) {
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
    `\nstarted ${started} ago · last write ${elapsed} ago · click to peek at the recent session tail`;
  const isExpanded = expandedSessionId === session.sessionId;
  const preview = synopsisPreview(session.synopsis);
  const previewInline = isExpanded && preview
    ? `<span class="label-preview">${escapeHtml(preview)}</span>`
    : "";
  const expandedSection = isExpanded
    ? `<div class="row-synopsis">${synopsisHtml(session.synopsis)}</div>`
    : "";
  const labelClass = "label" + (session.titleSynthetic ? " label-synthetic" : "");
  const visibilityBtn =
    `<button class="row-visibility${hidden ? " is-hidden-row" : ""}" type="button"` +
    ` data-session-id="${escapeHtml(session.sessionId)}" data-visibility="${hidden ? "show" : "hide"}"` +
    ` aria-label="${hidden ? "Show this row in the HUD again" : "Hide this row in this HUD"}"` +
    ` title="${hidden ? "hidden locally — click to show again" : "hide locally — reappears when this session writes"}">` +
    `${tablerIcon(hidden ? "eye-off" : "eye")}</button>`;
  const kind = String(session.kind || "agent").toLowerCase();
  return `
    <li class="row row-${escapeHtml(kind)} row-${state}${hidden ? ' row-hidden' : ''}${isExpanded ? ' is-expanded' : ''}" data-session-id="${escapeHtml(session.sessionId)}" data-row-index="${index}" role="button" tabindex="0" aria-expanded="${isExpanded ? "true" : "false"}">
      <span class="agent-icon" title="${escapeHtml(agentName(kind))} · ${escapeHtml(state)}" aria-label="${escapeHtml(agentName(kind))} ${escapeHtml(state)}">${agentIconFor(kind)}</span>
      <span class="${labelClass}" title="${escapeHtml(tooltip)}"><span class="label-title">${escapeHtml(label)}</span>${previewInline}</span>
      ${startedSpan}
      <span class="elapsed" title="time since last write">${escapeHtml(elapsed)}</span>
      ${visibilityBtn}
      ${expandedSection}
    </li>
  `;
}

function scrollListAfterRender() {
  if (!pendingListScroll) return;
  const mode = pendingListScroll;
  pendingListScroll = null;
  requestAnimationFrame(() => {
    if (!listEl) return;
    if (mode === "top") {
      listEl.scrollTop = 0;
      return;
    }
    listEl.scrollTop = listEl.scrollHeight;
  });
}

function toggleRowCollapse() {
  showAllRows = !showAllRows;
  pendingListScroll = showAllRows ? "bottom" : "top";
  if (lastSnapshot) render(lastSnapshot);
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
  // Live always above idle within any sort — the icon color is the strongest
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

function renderKeepAwake(snapshot) {
  if (!keepAwakeToggle || !keepAwakeStatus) return;
  const ka = snapshot && snapshot.keepAwake && typeof snapshot.keepAwake === "object"
    ? snapshot.keepAwake
    : {};
  const thresholds = snapshot && snapshot.thresholds || {};
  keepAwakeWindowSeconds = Number(ka.inactivityTimeoutSec || thresholds.liveSeconds || keepAwakeWindowSeconds || 600);
  keepAwakeEnabled = !!ka.enabled;
  const held = !!ka.held;
  const windowLabel = describeWindow(keepAwakeWindowSeconds);

  keepAwakeToggle.setAttribute("aria-checked", keepAwakeEnabled ? "true" : "false");
  keepAwakeToggle.title = keepAwakeEnabled
    ? `Keep Mac awake while agents work, then release after ${windowLabel} without activity`
    : "Mac wake hold is off";

  if (keepAwakeEnabled && held) {
    keepAwakeStatus.textContent = `on now · releases after ${windowLabel} without activity`;
  } else if (keepAwakeEnabled) {
    keepAwakeStatus.textContent = `on · keeps awake while agents work and for ${windowLabel} after`;
  } else {
    keepAwakeStatus.textContent = "off · Mac can sleep normally";
  }
}

function renderScreenMeta(snapshot) {
  const incomingScreenCast = snapshot && snapshot.screenCast && typeof snapshot.screenCast === "object"
    ? snapshot.screenCast
    : currentScreenCast;
  currentScreenCast = incomingScreenCast;
  if (pendingScreenBroadcastEnabled !== null) {
    if (currentScreenCast && currentScreenCast.enabled === pendingScreenBroadcastEnabled) {
      pendingScreenBroadcastEnabled = null;
      screenBroadcastChanging = false;
    } else {
      currentScreenCast = {
        ...(currentScreenCast || {}),
        enabled: pendingScreenBroadcastEnabled,
        broadcasting: pendingScreenBroadcastEnabled
          ? !!(currentScreenCast && currentScreenCast.broadcasting)
          : false,
        pausedReason: pendingScreenBroadcastEnabled
          ? (currentScreenCast && currentScreenCast.pausedReason) || ""
          : "upload off",
      };
    }
  } else {
    screenBroadcastChanging = false;
  }
  applyScreenButtonState();
  applyScreenStateClasses();
  if (!screenVisible || !screenSection) return;
  if (screenPublisherOff()) {
    stopScreenAutoRefresh();
    if (!localScreenPreviewActive && (!screenImg || screenImg.hidden || !screenImg.getAttribute("src"))) {
      setScreenPlaceholder(
        "Screen upload is off",
        "Click the screen button to turn cloud upload back on from the desk Mac.",
      );
    }
    updateScreenCaption("off");
    return;
  }
  if (SCREEN_TOKEN && !screenRefreshTimer) {
    setScreenPlaceholder("Loading screen preview", "Checking the latest published frame from the desk Mac.");
    startScreenAutoRefresh();
    return;
  }
  updateScreenCaption(screenImageState);
}

function render(snapshot) {
  lastSnapshot = snapshot;
  const counts = snapshot.counts || {};
  const thresholds = snapshot.thresholds || {};
  const live = Array.isArray(snapshot.live) ? snapshot.live : [];
  const idle = Array.isArray(snapshot.idle) ? snapshot.idle : [];
  const now = Math.floor(Date.now() / 1000);
  const ageSec = Math.max(0, now - Number(snapshot.generatedAt || now));
  const isStale = ageSec > STALE_SECONDS;

  const allRows = applySort(
    [
      ...live.map((s) => ({ s, state: "live", hidden: isHiddenFor(s) })),
      ...idle.map((s) => ({ s, state: "idle", hidden: isHiddenFor(s) })),
    ],
    sortMode,
  );
  const hiddenCount = allRows.filter((r) => r.hidden).length;
  if (showHiddenRows && hiddenCount === 0) {
    showHiddenRows = false;
    persistShowHidden();
  }
  const rows = showHiddenRows ? allRows : allRows.filter((r) => !r.hidden);

  // Alert detection: compare each row's state to what we recorded last
  // render. A live→idle transition (or first-seen-idle for a session that
  // looks like it just finished an assistant turn) triggers a single
  // attention ping per cooldown window. Hidden sessions never alert.
  const sessionsToAlert = [];
  const seenSidsThisRender = new Set();
  for (const { s, state, hidden } of allRows) {
    seenSidsThisRender.add(s.sessionId);
    const prev = previousStateBySid.get(s.sessionId);
    previousStateBySid.set(s.sessionId, state);
    if (!alertsEnabled) continue;
    if (hidden) continue;
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

  if (isStale && allRows.length === 0) {
    // Red surfaces ONLY for "the dashboard itself isn't being fed" —
    // never to describe an agent. Honest separation of concerns.
    hud.setAttribute("data-state", "stale");
    modeEl.innerHTML = `${tablerIcon("cloud-off")}<span>${formatDuration(ageSec)}</span>`;
    emptySection.hidden = false;
    listSection.hidden = true;
    listSection.classList.remove("is-showing-all", "is-collapsed");
    if (collapseToggleBtn) collapseToggleBtn.hidden = true;
    emptyMark.innerHTML = tablerIcon("cloud-off");
    emptyText.textContent = "feed delayed";
    emptyCounts.textContent = `last publish ${formatDuration(ageSec)} ago`;
  } else if (allRows.length === 0) {
    hud.setAttribute("data-state", "ok");
    modeEl.textContent = "no sessions";
    emptySection.hidden = false;
    listSection.hidden = true;
    listSection.classList.remove("is-showing-all", "is-collapsed");
    if (collapseToggleBtn) collapseToggleBtn.hidden = true;
    emptyMark.textContent = "·";
    emptyText.textContent = "nothing tracked";
    emptyCounts.textContent = "no agent sessions found";
  } else {
    hud.setAttribute("data-state", isStale ? "stale" : "ok");
    const liveCount = live.length;
    if (isStale) {
      modeEl.innerHTML = `${tablerIcon("cloud-off")}<span>${formatDuration(ageSec)}</span>`;
    } else if (liveCount > 0) {
      modeEl.textContent = `${liveCount} live`;
    } else {
      modeEl.textContent = `${allRows.length} tracked`;
    }
    // List label hosts the sort + compact + alert toggles. All stop event
    // bubbling so clicks on these chips don't also toggle a row beneath.
    const hiddenToggle = (hiddenCount > 0 || showHiddenRows)
      ? `<button class="sort-cycle hidden-toggle${showHiddenRows ? " is-active" : ""}" type="button" id="hidden-toggle"` +
        ` aria-pressed="${showHiddenRows ? "true" : "false"}"` +
        ` title="${showHiddenRows ? "hide hidden rows" : `show ${hiddenCount} hidden ${plural(hiddenCount, "row", "rows")}`}">` +
        `${tablerIcon(showHiddenRows ? "eye" : "eye-off")}<span>${showHiddenRows ? "hide hidden" : `hidden ${hiddenCount}`}</span></button>`
      : "";
    listLabel.innerHTML =
      `<span>sessions</span>` +
      `<span class="list-tools">` +
        `<button class="sort-cycle icon-cycle" type="button" id="alert-toggle"` +
        ` aria-label="${alertsEnabled ? "Mute attention alerts" : "Enable attention alerts"}"` +
        ` title="${alertsEnabled ? "alerts on (click to mute attention pings)" : "alerts muted (click to enable)"}">${tablerIcon(alertsEnabled ? "bell" : "bell-off")}</button>` +
        hiddenToggle +
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
    listSection.classList.toggle("is-showing-all", overflow && showAllRows);
    listSection.classList.toggle("is-collapsed", overflow && !showAllRows);
    listEl.innerHTML = visibleRows.length > 0
      ? visibleRows.map(({ s, state, hidden }, index) => rowHtml(s, state, index, hidden)).join("")
      : `<li class="row-placeholder">all tracked sessions hidden</li>`;
    if (collapseToggleBtn) {
      collapseToggleBtn.hidden = !overflow;
      collapseToggleBtn.setAttribute("aria-expanded", showAllRows ? "true" : "false");
      collapseToggleBtn.textContent = showAllRows
        ? `show top ${ROW_COLLAPSE_THRESHOLD} (collapse)`
        : `+ ${rows.length - ROW_COLLAPSE_THRESHOLD} more · show all`;
    }
    // If the previously-expanded row dropped off the list, collapse.
    if (expandedSessionId && !rows.some((r) => r.s.sessionId === expandedSessionId)) {
      expandedSessionId = null;
    }
    scrollListAfterRender();
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
    const hiddenBtn = document.getElementById("hidden-toggle");
    if (hiddenBtn) hiddenBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showHiddenRows = !showHiddenRows;
      persistShowHidden();
      if (!showHiddenRows && expandedSessionId && hiddenMap.has(expandedSessionId)) {
        expandedSessionId = null;
      }
      render(snapshot);
    });
  }

  footStamp.textContent = formatStamp(snapshot.generatedAt);
  footThresholds.textContent = `live window ${describeWindow(thresholds.liveSeconds || 600)}`;
  footAge.textContent = `pub ${formatDuration(ageSec)} ago`;
  renderKeepAwake(snapshot);
  renderScreenMeta(snapshot);

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
  modeEl.innerHTML = `${tablerIcon("cloud-off")}<span>offline</span>`;
  emptySection.hidden = false;
  listSection.hidden = true;
  listSection.classList.remove("is-showing-all", "is-collapsed");
  if (collapseToggleBtn) collapseToggleBtn.hidden = true;
  emptyMark.innerHTML = tablerIcon("cloud-off");
  emptyText.textContent = "feed offline";
  emptyCounts.textContent = message || "snapshot unreachable";
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

function liveHudUrl() {
  try {
    const url = new URL("/hud.html", window.location.origin);
    if (SCREEN_TOKEN) url.searchParams.set("token", SCREEN_TOKEN);
    url.searchParams.set("screen", "1");
    return url.href;
  } catch {
    return window.location.href;
  }
}

function refreshShareLink() {
  const url = liveHudUrl();
  if (shareUrl) {
    shareUrl.href = url;
    shareUrl.textContent = url;
  }
  return url;
}

function setSharePanelVisible(visible) {
  if (!sharePanel || !btnQr) return;
  const show = !!visible;
  sharePanel.hidden = !show;
  btnQr.classList.toggle("is-active", show);
  btnQr.setAttribute("aria-expanded", show ? "true" : "false");
  if (show && qrCode) {
    const url = refreshShareLink();
    try {
      qrCode.innerHTML = qrSvgForText(url);
    } catch {
      qrCode.textContent = "QR unavailable";
    }
  }
  reportSizeToHost();
}

if (btnClose) {
  btnClose.addEventListener("click", (e) => {
    e.preventDefault();
    if (!postToHost({ action: "close" })) window.close();
  });
}

if (shareUrl) refreshShareLink();

if (btnQr) {
  btnQr.addEventListener("click", (e) => {
    e.preventDefault();
    setSharePanelVisible(sharePanel ? sharePanel.hidden : true);
  });
}

if (shareClose) {
  shareClose.addEventListener("click", (e) => {
    e.preventDefault();
    setSharePanelVisible(false);
  });
}

if (listEl) {
  listEl.addEventListener("click", (e) => {
    const rawTarget = e.target;
    const target = rawTarget && rawTarget.nodeType === Node.ELEMENT_NODE
      ? rawTarget
      : rawTarget && rawTarget.parentElement;
    if (!target) return;

    const visibility = target.closest(".row-visibility");
    if (visibility && listEl.contains(visibility)) {
      e.preventDefault();
      e.stopPropagation();
      const sid = visibility.getAttribute("data-session-id");
      if (!sid) return;
      const action = visibility.getAttribute("data-visibility");
      if (action === "show") {
        hiddenMap.delete(sid);
      } else {
        // Local hide only: the row reappears the moment the session writes
        // anything after this timestamp.
        hiddenMap.set(sid, Math.floor(Date.now() / 1000));
        if (expandedSessionId === sid) expandedSessionId = null;
      }
      saveHidden();
      if (lastSnapshot) render(lastSnapshot);
      return;
    }

    const row = target.closest(".row");
    if (row && listEl.contains(row)) {
      e.preventDefault();
      const sid = row.getAttribute("data-session-id");
      if (!sid) return;
      expandedSessionId = expandedSessionId === sid ? null : sid;
      if (lastSnapshot) render(lastSnapshot);
    }
  });

  listEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const target = e.target && e.target.nodeType === Node.ELEMENT_NODE
      ? e.target
      : e.target && e.target.parentElement;
    if (!target || target.closest("button")) return;
    const row = target.closest(".row");
    if (!row || !listEl.contains(row)) return;
    e.preventDefault();
    const sid = row.getAttribute("data-session-id");
    if (!sid) return;
    expandedSessionId = expandedSessionId === sid ? null : sid;
    if (lastSnapshot) render(lastSnapshot);
  });
}

if (collapseToggleBtn) {
  collapseToggleBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    collapsePointerHandledAt = Date.now();
    toggleRowCollapse();
  });
  collapseToggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (Date.now() - collapsePointerHandledAt < 700) return;
    toggleRowCollapse();
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

function screenCastStatusText() {
  const sc = currentScreenCast;
  if (!sc || typeof sc !== "object") return "";
  const last = Number(sc.lastUploadAt || 0);
  const age = last > 0 ? Math.max(0, Math.floor(Date.now() / 1000) - last) : null;
  if (sc.enabled === false) return "upload off";
  if (sc.pausedReason) return `paused · ${sc.pausedReason}`;
  if (sc.broadcasting && age != null) return `broadcasting · frame ${formatDuration(age)} ago`;
  if (sc.lastError) return `upload error · ${sc.lastError}`;
  if (age != null) return `last frame ${formatDuration(age)} ago`;
  return "";
}

function screenPublisherOff() {
  const sc = currentScreenCast;
  return !!(sc && typeof sc === "object" && sc.enabled === false);
}

function screenBroadcastEnabled() {
  const sc = currentScreenCast;
  if (!sc || typeof sc !== "object") return true;
  return sc.enabled !== false;
}

function screenBroadcasting() {
  const sc = currentScreenCast;
  return !!(sc && typeof sc === "object" && sc.enabled !== false && sc.broadcasting);
}

function applyScreenStateClasses() {
  if (!screenSection) return;
  const uploadOff = !screenBroadcastEnabled();
  const hasVisibleImage = !!(screenImg && !screenImg.hidden && screenImg.getAttribute("src"));
  screenSection.classList.toggle("is-broadcast-off", uploadOff);
  screenSection.classList.toggle("is-broadcasting", screenBroadcasting());
  screenSection.classList.toggle("is-local-preview", localScreenPreviewActive);
  if (screenOverlay) screenOverlay.hidden = !(uploadOff && hasVisibleImage);
}

function applyScreenButtonState() {
  if (!btnScreen) return;
  const enabled = screenBroadcastEnabled();
  const broadcasting = screenBroadcasting();
  btnScreen.classList.toggle("is-active", screenVisible);
  btnScreen.classList.toggle("is-broadcasting", enabled && broadcasting);
  btnScreen.classList.toggle("is-broadcast-off", !enabled);
  btnScreen.classList.toggle("is-pending", screenBroadcastChanging);
  btnScreen.setAttribute("aria-pressed", enabled ? "true" : "false");
  btnScreen.setAttribute("aria-label", enabled
    ? "Turn off desk Mac screen upload"
    : "Turn on desk Mac screen upload");
  btnScreen.title = enabled
    ? "Screen upload on — click to turn off"
    : "Screen upload off — click to turn on";
}

function setScreenPlaceholder(title, text) {
  if (screenPlaceholderTitle) screenPlaceholderTitle.textContent = title;
  if (screenPlaceholderText) screenPlaceholderText.textContent = text || "";
  if (screenPlaceholder) screenPlaceholder.hidden = false;
  if (screenImg) {
    screenImg.hidden = true;
    screenImg.removeAttribute("src");
  }
  applyScreenStateClasses();
}

function setScreenImageVisible() {
  if (screenPlaceholder) screenPlaceholder.hidden = true;
  if (screenImg) screenImg.hidden = false;
  applyScreenStateClasses();
}

function updateScreenCaption(state) {
  screenImageState = state || "waiting";
  if (!screenCaption || !screenSection) return;
  const meta = screenCastStatusText();
  screenSection.classList.toggle("is-live", state === "live" && screenBroadcastEnabled());
  screenSection.classList.toggle("is-error", state === "error");
  applyScreenStateClasses();

  if (localScreenPreviewActive) {
    const captured = localScreenPreviewCapturedAt ? `captured ${formatStamp(localScreenPreviewCapturedAt)}` : "captured locally";
    screenCaption.textContent = `local preview · ${captured} · ${screenBroadcastEnabled() ? "upload on" : "upload off"}`;
    return;
  }
  if (state === "local-loading") {
    screenCaption.textContent = "capturing local screen preview";
    return;
  }
  if (!SCREEN_TOKEN) {
    screenCaption.textContent = meta ? `${meta} · this HUD has no screen token` : "screen token missing";
    return;
  }
  if (!screenBroadcastEnabled()) {
    screenCaption.textContent = "upload off · click image for local preview";
    return;
  }
  if (state === "live") {
    const imageAge = lastScreenImageLoadedAt
      ? formatDuration(Math.max(0, Math.floor(Date.now() / 1000) - lastScreenImageLoadedAt))
      : "";
    const upload = screenBroadcasting() || screenBroadcastEnabled() ? "broadcasting" : "upload on";
    screenCaption.textContent = imageAge ? `${upload} · image ${imageAge} ago` : (meta || upload);
    return;
  }
  if (state === "error") {
    screenCaption.textContent = meta ? `screen preview failed · ${meta}` : "screen preview failed · check publisher/token";
    return;
  }
  screenCaption.textContent = meta || "screen preview loading";
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
  localScreenPreviewActive = false;
  localScreenPreviewCapturedAt = null;
  lastScreenImageLoadedAt = null;
  applyScreenStateClasses();
  updateScreenCaption("waiting");
  screenImg.src = url;
}

function showScreenPanel() {
  screenVisible = true;
  try { localStorage.setItem(SCREEN_STORAGE_KEY, "1"); } catch {}
  if (screenSection) screenSection.hidden = false;
}

function requestLocalScreenPreview() {
  showScreenPanel();
  localScreenPreviewActive = false;
  localScreenPreviewCapturedAt = null;
  updateScreenCaption("local-loading");
  const delivered = postToHost({ action: "requestLocalScreenPreview" });
  if (!delivered) {
    updateScreenCaption("error");
    if (screenCaption) screenCaption.textContent = "open desktop HUD for local screen preview";
  }
  return delivered;
}

window.agentHudSetLocalScreenPreview = function agentHudSetLocalScreenPreview(dataUrl, meta = {}) {
  if (!screenImg || !dataUrl) return;
  showScreenPanel();
  localScreenPreviewActive = true;
  const capturedAt = Number(meta && meta.capturedAt);
  localScreenPreviewCapturedAt = Number.isFinite(capturedAt) && capturedAt > 0
    ? capturedAt
    : Math.floor(Date.now() / 1000);
  screenImg.src = String(dataUrl);
  setScreenImageVisible();
  updateScreenCaption("local");
  reportSizeToHost();
};

window.agentHudSetLocalScreenPreviewFailed = function agentHudSetLocalScreenPreviewFailed(message) {
  localScreenPreviewActive = false;
  localScreenPreviewCapturedAt = null;
  updateScreenCaption("error");
  if (screenCaption) {
    const text = String(message || "local screen capture failed").replace(/\s+/g, " ").trim();
    screenCaption.textContent = `local preview failed · ${text.slice(0, 80)}`;
  }
  reportSizeToHost();
};

window.agentHudSetScreenBroadcast = function agentHudSetScreenBroadcast(enabled, detail = {}) {
  const next = enabled !== false;
  pendingScreenBroadcastEnabled = null;
  screenBroadcastChanging = false;
  currentScreenCast = {
    ...(currentScreenCast || {}),
    enabled: next,
    broadcasting: next ? !!(currentScreenCast && currentScreenCast.broadcasting) : false,
    pausedReason: next ? "" : "upload off",
    lastError: detail && detail.error ? String(detail.error) : "",
  };
  showScreenPanel();
  applyScreenButtonState();
  applyScreenStateClasses();
  if (next) {
    localScreenPreviewActive = false;
    localScreenPreviewCapturedAt = null;
    lastScreenImageLoadedAt = null;
    if (SCREEN_TOKEN) {
      setScreenPlaceholder("Loading screen preview", "Checking the latest published frame from the desk Mac.");
      startScreenAutoRefresh();
    } else {
      setScreenPlaceholder(
        "Screen preview needs a token",
        "Open the desktop HUD so it can attach the local screen token.",
      );
      updateScreenCaption("error");
    }
  } else {
    stopScreenAutoRefresh();
    updateScreenCaption("off");
  }
  reportSizeToHost();
};

function applyScreenVisibility() {
  if (!screenSection) return;
  applyScreenButtonState();
  applyScreenStateClasses();
  if (!SCREEN_TOKEN) {
    screenSection.hidden = !screenVisible;
    if (screenVisible) {
      stopScreenAutoRefresh();
      screenImageState = "error";
      if (screenPublisherOff()) {
        setScreenPlaceholder(
          "Screen upload is off",
          "Click the screen button to turn cloud upload back on from the desk Mac.",
        );
      } else {
        setScreenPlaceholder(
          "Screen preview needs a token",
          "Open the desktop HUD so it can attach the local screen token, or add ?token=<screen-token> to this URL.",
        );
      }
      updateScreenCaption("error");
    } else {
      stopScreenAutoRefresh();
    }
    return;
  }
  screenSection.hidden = !screenVisible;
  if (screenVisible) {
    if (screenPublisherOff()) {
      stopScreenAutoRefresh();
      if (!localScreenPreviewActive && (!screenImg || screenImg.hidden || !screenImg.getAttribute("src"))) {
        setScreenPlaceholder(
          "Screen upload is off",
          "Click the screen button to turn cloud upload back on from the desk Mac.",
        );
      }
      screenImageState = "off";
      updateScreenCaption("off");
      return;
    }
    setScreenPlaceholder("Loading screen preview", "Checking the latest published frame from the desk Mac.");
    screenImageState = "waiting";
    updateScreenCaption("waiting");
    startScreenAutoRefresh();
  } else {
    stopScreenAutoRefresh();
    setScreenPlaceholder("Screen preview is hidden", "Click the screen button to open the preview and change upload.");
  }
}

if (btnScreen) {
  btnScreen.addEventListener("click", (e) => {
    e.preventDefault();
    showScreenPanel();
    const previousEnabled = screenBroadcastEnabled();
    const nextEnabled = !previousEnabled;
    screenBroadcastChanging = true;
    pendingScreenBroadcastEnabled = nextEnabled;
    currentScreenCast = {
      ...(currentScreenCast || {}),
      enabled: nextEnabled,
      broadcasting: nextEnabled ? !!(currentScreenCast && currentScreenCast.broadcasting) : false,
      pausedReason: nextEnabled ? "" : "upload off",
      lastError: "",
    };
    if (nextEnabled) {
      localScreenPreviewActive = false;
      localScreenPreviewCapturedAt = null;
      lastScreenImageLoadedAt = null;
      if (SCREEN_TOKEN) {
        setScreenPlaceholder("Loading screen preview", "Checking the latest published frame from the desk Mac.");
        startScreenAutoRefresh();
      }
    } else {
      stopScreenAutoRefresh();
      updateScreenCaption("off");
    }
    applyScreenButtonState();
    applyScreenStateClasses();
    const delivered = postToHost({ action: "setScreenBroadcast", enabled: nextEnabled });
    if (!delivered) {
      screenBroadcastChanging = false;
      pendingScreenBroadcastEnabled = null;
      currentScreenCast = {
        ...(currentScreenCast || {}),
        enabled: previousEnabled,
        broadcasting: previousEnabled ? !!(currentScreenCast && currentScreenCast.broadcasting) : false,
      };
      applyScreenButtonState();
      applyScreenStateClasses();
      updateScreenCaption("error");
      if (screenCaption) screenCaption.textContent = "open desktop HUD to change screen upload";
    }
    reportSizeToHost();
  });
  applyScreenVisibility();
}

if (screenImg) {
  screenImg.addEventListener("click", (e) => {
    e.preventDefault();
    requestLocalScreenPreview();
  });
  screenImg.addEventListener("load", () => {
    if (!localScreenPreviewActive) lastScreenImageLoadedAt = Math.floor(Date.now() / 1000);
    setScreenImageVisible();
    updateScreenCaption(localScreenPreviewActive ? "local" : "live");
    reportSizeToHost();
  });
  screenImg.addEventListener("error", () => {
    setScreenPlaceholder(
      "No screen frame loaded",
      "Either the publisher is off, the token is wrong, or the last uploaded frame is unavailable.",
    );
    updateScreenCaption("error");
    reportSizeToHost();
  });
}

if (keepAwakeToggle) {
  keepAwakeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const next = !keepAwakeEnabled;
    keepAwakeEnabled = next;
    renderKeepAwake({
      ...(lastSnapshot || {}),
      keepAwake: {
        ...((lastSnapshot && lastSnapshot.keepAwake) || {}),
        enabled: next,
        held: next && !!(lastSnapshot && lastSnapshot.keepAwake && lastSnapshot.keepAwake.held),
        inactivityTimeoutSec: keepAwakeWindowSeconds,
      },
    });
    const delivered = postToHost({
      action: "setKeepAwake",
      enabled: next,
      inactivityTimeoutSec: keepAwakeWindowSeconds || 600,
    });
    if (!delivered && keepAwakeStatus) {
      keepAwakeStatus.textContent = "open as floating HUD to change Mac sleep";
    }
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
