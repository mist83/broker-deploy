// pair.js — one-import primitive for "TV shows QR, phone(s) join over signal-argh"
//
// Canonical entry point:
//   import { pairScreen, pairPhone } from "https://ui.mullmania.com/js/pair.js";
//
// Multi-phone is the default. Each phone joins with a unique userId, and the
// hub tags every customMessage with that userId — so the TV can render N
// players from one channel without any extra plumbing.
//
// Hub contract (from development-canon/integrations/signalargh.md):
//   invoke SendCustomMessage(channelId, topic, message)
//   receive customMessage({topic, message, userId})
//   receive systemNotification(text)  // join/leave notices, text-based
//
// Domain-agnostic per shared rule. Falls back to mullmania.com on localhost.

const SIGNALR_CDN = "https://cdn.jsdelivr.net/npm/@microsoft/signalr@8.0.7/+esm";
const QRCODE_CDN = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";

let signalRPromise = null;
async function loadSignalR() {
  if (!signalRPromise) signalRPromise = import(SIGNALR_CDN);
  return signalRPromise;
}

let qrcodePromise = null;
async function loadQRCode() {
  if (!qrcodePromise) {
    qrcodePromise = import(QRCODE_CDN).then((mod) => mod.default || mod);
  }
  return qrcodePromise;
}

export function baseDomain() {
  const host = (typeof location !== "undefined" && location.hostname) || "";
  if (!host || host === "localhost" || /^127\./.test(host) || host === "0.0.0.0") {
    return "mullmania.com";
  }
  const parts = host.split(".");
  return parts.length >= 2 ? parts.slice(-2).join(".") : "mullmania.com";
}

export function signalArghBase() {
  return `https://signalargh.${baseDomain()}`;
}

function randomToken(length = 8) {
  const buf = new Uint8Array(Math.ceil(length / 1.6));
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, length);
}

// Custom-alphabet token. Used when callers want a human-readable code (e.g.
// 4-char alpha for arcade venues where players say it out loud).
function randomCustomToken(length, alphabet) {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < length; i += 1) out += alphabet[buf[i] % alphabet.length];
  return out;
}

// Defaults: 8-char base36 (legacy shape). Callers that want a short,
// readable code pass { length, alphabet } — e.g. { length: 4,
// alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" } for arcade-style rooms.
export function newSessionId(opts = {}) {
  const { length = 8, alphabet = null } = opts;
  if (alphabet) return randomCustomToken(length, alphabet);
  return randomToken(length);
}
export function newPhoneId(prefix = "phone") { return `${prefix}-${randomToken(4)}`; }

function hubUrl(channelId, userId) {
  return `${signalArghBase()}/hub?channelId=${encodeURIComponent(channelId)}&userId=${encodeURIComponent(userId)}`;
}

async function buildConnection(channelId, userId) {
  const signalR = await loadSignalR();
  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl(channelId, userId))
    .withAutomaticReconnect()
    .build();
}

function remoteUrlFor(remotePath, sessionId) {
  const url = new URL(remotePath, window.location.href);
  url.searchParams.set("s", sessionId);
  return url.toString();
}

export async function renderQrCanvas(canvas, url, opts = {}) {
  const QRCode = await loadQRCode();
  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: opts.errorCorrectionLevel || "M",
    margin: opts.margin ?? 1,
    width: opts.width ?? 240,
    color: opts.color || { dark: "#0f172a", light: "#ffffff" },
  });
  // QRCode lib sets inline width/height that fight the CSS-driven layout.
  canvas.style.removeProperty("width");
  canvas.style.removeProperty("height");
}

function parsePayload(message) {
  if (typeof message !== "string") return message;
  try { return JSON.parse(message); } catch { return message; }
}

function publisher(connection, channelId) {
  return async (topic, payload) => {
    const body = typeof payload === "string" ? payload : JSON.stringify(payload ?? null);
    await connection.invoke("SendCustomMessage", channelId, topic, body);
  };
}

// ---------- screen side ----------
// TV / dashboard. Generates session, displays QR, listens for phones.
//
//   const screen = await pairScreen({
//     channelPrefix: "marble-maze",
//     qrCanvas: document.querySelector("#qr"),
//     onPhoneJoin: (userId) => addMarble(userId),
//     onPhoneLeave: (userId) => removeMarble(userId),
//     onMessage: (topic, payload, userId) => { ... },
//   });
//   screen.remoteUrl   // open the phone-side page (also encoded in the QR)
//   screen.sessionId   // short id; appears as ?s=... on the phone URL
//   screen.phones      // live Set<userId>
export async function pairScreen({
  channelPrefix,
  sessionId = newSessionId(),
  qrCanvas = null,
  qrOptions = null,
  remotePath = "./remote.html",
  onMessage = null,
  onPhoneJoin = null,
  onPhoneLeave = null,
  onStatus = null,
  screenUserId = "screen",
} = {}) {
  if (!channelPrefix) throw new Error("pairScreen: channelPrefix required");

  const channelId = `${channelPrefix}-${sessionId}`;
  const remoteUrl = remoteUrlFor(remotePath, sessionId);
  const phones = new Set();

  const noteJoin = (userId) => {
    if (!userId || userId === screenUserId || phones.has(userId)) return;
    phones.add(userId);
    onPhoneJoin?.(userId);
  };
  const noteLeave = (userId) => {
    if (!userId || !phones.has(userId)) return;
    phones.delete(userId);
    onPhoneLeave?.(userId);
  };

  if (qrCanvas) {
    try { await renderQrCanvas(qrCanvas, remoteUrl, qrOptions || undefined); }
    catch (err) { onStatus?.("error", err); }
  }

  const conn = await buildConnection(channelId, screenUserId);

  conn.on("customMessage", (msg) => {
    if (!msg || typeof msg !== "object") return;
    noteJoin(msg.userId);
    onMessage?.(msg.topic, parsePayload(msg.message), msg.userId);
  });

  conn.on("systemNotification", (text) => {
    const msg = String(text || "");
    // signal-argh emits free-text join/leave notices; pull the userId out and
    // route to onPhoneJoin / onPhoneLeave. Match anything with a hyphen so
    // custom phone-id prefixes still work.
    const match = msg.match(/([\w]+-[\w-]+)/);
    if (!match) return;
    const userId = match[1];
    if (userId === screenUserId) return;
    if (/join/i.test(msg)) noteJoin(userId);
    else if (/leave|left|disconnect/i.test(msg)) noteLeave(userId);
  });

  conn.onreconnecting(() => onStatus?.("reconnecting"));
  conn.onreconnected(() => onStatus?.("waiting"));
  conn.onclose(() => onStatus?.("closed"));

  try {
    await conn.start();
    onStatus?.("waiting");
  } catch (err) {
    onStatus?.("error", err);
    throw err;
  }

  return {
    sessionId,
    channelId,
    remoteUrl,
    phones,
    connection: conn,
    publish: publisher(conn, channelId),
    stop: () => conn.stop(),
  };
}

// ---------- phone side ----------
// Reads ?s=<sessionId> from URL, joins the channel with a unique userId.
//
//   const phone = await pairPhone({
//     channelPrefix: "marble-maze",
//     onTilt: ({beta, gamma}) => paintBubble(beta, gamma),
//   });
//   const stopTilt = phone.publishTilt(33);  // auto-publish 'tilt' at ~30Hz
//   phone.publish("button", { jump: 1 });    // ad-hoc messages
//
// If onTilt is provided OR requestTilt is true, prompts for DeviceOrientation
// permission (required on iOS) and attaches a listener.
export async function pairPhone({
  channelPrefix,
  sessionId = new URLSearchParams(window.location.search).get("s"),
  userId = newPhoneId(),
  onMessage = null,
  onTilt = null,
  requestTilt = false,
  onStatus = null,
} = {}) {
  if (!channelPrefix) throw new Error("pairPhone: channelPrefix required");
  if (!sessionId) throw new Error("pairPhone: sessionId missing (expected ?s= in URL)");

  const channelId = `${channelPrefix}-${sessionId}`;
  const tiltState = { beta: 0, gamma: 0, hasMotion: false };
  const wantTilt = requestTilt || !!onTilt;

  if (wantTilt) {
    if (typeof DeviceOrientationEvent === "undefined") {
      throw new Error("DeviceOrientationEvent not supported on this device");
    }
    const requestFn = DeviceOrientationEvent.requestPermission;
    if (typeof requestFn === "function") {
      const result = await requestFn.call(DeviceOrientationEvent);
      if (result !== "granted") throw new Error("Motion permission denied");
    }
    window.addEventListener("deviceorientation", (event) => {
      tiltState.hasMotion = true;
      tiltState.beta = Number(event.beta) || 0;
      tiltState.gamma = Number(event.gamma) || 0;
      onTilt?.({ beta: tiltState.beta, gamma: tiltState.gamma });
    }, { passive: true });
  }

  const conn = await buildConnection(channelId, userId);

  conn.on("customMessage", (msg) => {
    if (!msg || typeof msg !== "object") return;
    onMessage?.(msg.topic, parsePayload(msg.message), msg.userId);
  });

  conn.onreconnecting(() => onStatus?.("reconnecting"));
  conn.onreconnected(() => onStatus?.("live"));
  conn.onclose(() => onStatus?.("closed"));

  try {
    await conn.start();
    onStatus?.("live");
  } catch (err) {
    onStatus?.("error", err);
    throw err;
  }

  const publish = publisher(conn, channelId);

  let tiltTimer = null;
  const publishTilt = (intervalMs = 33) => {
    if (tiltTimer) return () => stopTilt();
    let lastB = null;
    let lastG = null;
    tiltTimer = setInterval(() => {
      const b = Math.round(tiltState.beta * 10) / 10;
      const g = Math.round(tiltState.gamma * 10) / 10;
      if (b === lastB && g === lastG) return;
      lastB = b;
      lastG = g;
      publish("tilt", { b, g }).catch(() => {});
    }, Math.max(16, intervalMs));
    const stopTilt = () => {
      if (tiltTimer) { clearInterval(tiltTimer); tiltTimer = null; }
    };
    return stopTilt;
  };

  return {
    sessionId,
    userId,
    channelId,
    connection: conn,
    tilt: tiltState,
    publish,
    publishTilt,
    stop: () => conn.stop(),
  };
}
