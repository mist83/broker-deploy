// builder.js — YouTube tap-along builder + profile library.
//
// Play a song, tap along on every beat (Space or the pad), and the taps are
// anchored to the YouTube player's clock (getCurrentTime) — not wall time — so a
// recorded profile lines up with the actual audio. Saves named profiles to a
// local library and exports them as the shared tap-profile envelope that DAG and
// dance-party consume. Reuses the vendored rhythm-engine end to end.

import { compileTapRepeaterPattern, serializePattern, buildDagRhythmURL, projectPatternToDag } from './vendor/rhythm-engine/index.js';
import { buildProfile } from './vendor/rhythm-engine/profile.js';
import { mountBandParty } from './band-party.js';

const TAP_AREA = { width: 1000, height: 700 };
const LS_KEY = 'tap-repeater:profiles:v1';

const $ = (id) => document.getElementById(id);
const els = {
    url: $('url'), load: $('load'), player: $('player'), videoEmpty: $('video-empty'),
    tappad: $('tappad'), play: $('play'), restart: $('restart'), undo: $('undo'), clear: $('clear'),
    statTaps: $('stat-taps'), statBpm: $('stat-bpm'), statTime: $('stat-time'),
    timeline: $('timeline'), tlDur: $('tl-dur'), tlLoop: $('tl-loop'),
    pName: $('p-name'), pTitle: $('p-title'), pArtist: $('p-artist'), pSlug: $('p-slug'),
    save: $('save'), sendDag: $('send-dag'), download: $('download'), copyUrl: $('copy-url'),
    libList: $('lib-list'), navDag: $('nav-dag'), toast: $('toast')
};

const S = { videoId: null, player: null, ready: false, duration: 0, taps: [], slugTouched: false };

// ── helpers ────────────────────────────────────────────────────────────────
function parseVideoId(input) {
    const s = (input || '').trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    const m = s.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
}
function slugify(s) {
    return (s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60);
}
function fmtTime(ms) {
    const t = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}
function siblingUrl(sub) {
    const parts = (location.hostname || '').split('.').filter(Boolean);
    if (parts.length < 2) return null;                 // localhost → no sibling
    return `https://${sub}.${parts.slice(-2).join('.')}/`;
}
function toast(msg, pink = false) {
    els.toast.innerHTML = msg;
    els.toast.className = 'toast show' + (pink ? ' pink' : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { els.toast.className = 'toast'; }, 2200);
}

let ytApiPromise = null;
function ensureYouTubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve, reject) => {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => { if (typeof prev === 'function') { try { prev(); } catch {} } resolve(window.YT); };
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        s.onerror = () => reject(new Error('YT API failed'));
        document.head.appendChild(s);
    });
    return ytApiPromise;
}

// ── load a song ──────────────────────────────────────────────────────────────
async function loadSong(videoId, meta = {}) {
    S.videoId = videoId;
    S.ready = false;
    els.videoEmpty.style.display = 'none';
    const YT = await ensureYouTubeApi();
    if (S.player) { try { S.player.loadVideoById(videoId); } catch {} }
    else {
        S.player = new YT.Player('player', {
            videoId,
            playerVars: { controls: 1, modestbranding: 1, rel: 0, playsinline: 1 },
            events: {
                onReady: (e) => { S.ready = true; S.duration = e.target.getDuration() * 1000; renderAll(); },
                onStateChange: (e) => {
                    if (S.duration < 1000 && S.player.getDuration) S.duration = S.player.getDuration() * 1000;
                    els.tappad.classList.toggle('rec', e.data === YT.PlayerState.PLAYING);
                    syncPlayBtn();
                }
            }
        });
    }
    // metadata: prefer passed meta, else YouTube oEmbed (best-effort, may be CORS-blocked)
    if (meta.title) { els.pTitle.value = meta.title; els.pArtist.value = meta.artist || ''; }
    else {
        try {
            const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (r.ok) { const j = await r.json(); els.pTitle.value = j.title || ''; els.pArtist.value = j.author_name || ''; }
        } catch { /* manual entry */ }
    }
    if (!S.slugTouched) els.pSlug.value = slugify(meta.slug || els.pTitle.value || videoId);
    if (!els.pName.value) els.pName.value = (els.pTitle.value ? els.pTitle.value + ' — taps' : 'Untitled taps');
}

// ── tapping ──────────────────────────────────────────────────────────────────
function recordTap(x, y) {
    if (!S.ready || !S.player) { toast('Load a song first'); return; }
    const t = S.player.getCurrentTime() * 1000;
    S.taps.push({ id: `tap-${S.taps.length + 1}`, perfOffset: t, x, y, duration: 0, isDrag: false });
    els.tappad.classList.remove('flash'); void els.tappad.offsetWidth; els.tappad.classList.add('flash');
    renderAll();
}

function currentPattern() {
    return compileTapRepeaterPattern(S.taps, { width: TAP_AREA.width, height: TAP_AREA.height, loopable: true, source: 'tap-repeater' });
}

// ── render ───────────────────────────────────────────────────────────────────
function renderAll() {
    const pat = S.taps.length ? currentPattern() : null;
    els.statTaps.textContent = String(S.taps.length);
    els.statBpm.textContent = pat && pat.bpm ? String(pat.bpm) : '—';
    els.tlDur.textContent = fmtTime(S.duration);

    // timeline ticks
    const tl = els.timeline;
    [...tl.querySelectorAll('.tick, .tl-empty')].forEach(n => n.remove());
    const span = S.duration || (pat ? pat.durationMs + 1000 : 1);
    if (!S.taps.length) {
        const e = document.createElement('div'); e.className = 'tl-empty'; e.textContent = 'taps appear here along the song — click to seek'; tl.appendChild(e);
    } else {
        S.taps.forEach((tap, i) => {
            const d = document.createElement('div');
            d.className = 'tick' + (i % 4 === 0 ? ' beat4' : '');
            d.style.left = Math.min(100, (tap.perfOffset / span) * 100) + '%';
            tl.appendChild(d);
        });
    }
    if (pat && pat.intervalsMs.length) {
        const avg = pat.intervalsMs.reduce((a, b) => a + b, 0) / pat.intervalsMs.length;
        els.tlLoop.textContent = fmtTime(pat.durationMs + avg);
    } else els.tlLoop.textContent = '—';
    dagRefresh();
}

function frame() {
    if (S.player && S.ready && S.player.getCurrentTime) {
        const ct = S.player.getCurrentTime() * 1000;
        els.statTime.textContent = fmtTime(ct);
        let ph = els.timeline.querySelector('.playhead');
        if (!ph) { ph = document.createElement('div'); ph.className = 'playhead'; els.timeline.appendChild(ph); }
        ph.style.left = Math.min(100, (ct / (S.duration || 1)) * 100) + '%';
    }
    requestAnimationFrame(frame);
}

function syncPlayBtn() {
    const playing = S.player && S.player.getPlayerState && S.player.getPlayerState() === 1;
    els.play.innerHTML = `<i class="ti ti-player-${playing ? 'pause' : 'play'}"></i>`;
}

// ── library (localStorage) ───────────────────────────────────────────────────
function loadLibrary() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }
function writeLibrary(lib) { try { localStorage.setItem(LS_KEY, JSON.stringify(lib)); } catch {} }

function renderLibrary() {
    const lib = loadLibrary();
    const ids = Object.keys(lib).sort((a, b) => (lib[b].createdAt || '').localeCompare(lib[a].createdAt || ''));
    if (!ids.length) { els.libList.innerHTML = '<div class="lib-empty">No saved profiles yet — tap a song and hit Save.</div>'; return; }
    els.libList.innerHTML = '';
    ids.forEach(id => {
        const p = lib[id];
        const item = document.createElement('div');
        item.className = 'lib-item';
        item.innerHTML = `<div class="meta"><div class="t">${escapeHtml(p.name || id)}</div>
            <div class="s">${escapeHtml(p.song?.title || id)} · ${p.summary?.beatCount ?? 0} taps · ${p.summary?.bpm ?? '—'} bpm</div></div>
            <div class="act"><button class="open" title="Load"><i class="ti ti-folder-open"></i></button>
            <button class="del" title="Delete"><i class="ti ti-trash"></i></button></div>`;
        item.querySelector('.open').onclick = () => openProfile(p);
        item.querySelector('.del').onclick = () => { if (confirm(`Delete "${p.name || id}"?`)) { const l = loadLibrary(); delete l[id]; writeLibrary(l); renderLibrary(); toast('Deleted'); } };
        els.libList.appendChild(item);
    });
}
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function openProfile(p) {
    els.pName.value = p.name || '';
    els.pTitle.value = p.song?.title || '';
    els.pArtist.value = p.song?.artist || '';
    els.pSlug.value = p.id || p.song?.slug || '';
    S.slugTouched = true;
    // restore taps from the compiled pattern
    S.taps = (p.pattern?.events || []).map((e, i) => ({
        id: `tap-${i + 1}`, perfOffset: e.tMs, x: (e.xNorm ?? 0.5) * TAP_AREA.width, y: (e.yNorm ?? 0.5) * TAP_AREA.height,
        duration: e.durationMs || 0, isDrag: !!e.isDrag
    }));
    const vid = p.song?.youtubeId;
    if (vid) loadSong(vid, { title: p.song.title, artist: p.song.artist, slug: p.id });
    renderAll();
    toast(`Loaded “${p.name || p.id}”`);
}

function buildCurrentProfile() {
    const slug = slugify(els.pSlug.value || els.pTitle.value || S.videoId || 'taps');
    return buildProfile({
        id: slug, name: els.pName.value || (els.pTitle.value ? `${els.pTitle.value} — taps` : 'Untitled taps'),
        song: { slug, title: els.pTitle.value, artist: els.pArtist.value, youtubeId: S.videoId, durationSec: Math.round(S.duration / 1000) },
        pattern: currentPattern(), source: 'tap-repeater', createdAt: new Date().toISOString().slice(0, 10)
    });
}

// ── actions ──────────────────────────────────────────────────────────────────
function saveProfile() {
    if (!S.taps.length) { toast('Tap some beats first'); return; }
    const profile = buildCurrentProfile();
    const lib = loadLibrary(); lib[profile.id] = profile; writeLibrary(lib);
    renderLibrary();
    toast(`Saved “${profile.name}” to library`, true);
}
function downloadProfile() {
    if (!S.taps.length) { toast('Tap some beats first'); return; }
    const profile = buildCurrentProfile();
    const blob = new Blob([JSON.stringify(profile, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `${profile.id}.json`; a.click();
    URL.revokeObjectURL(a.href);
    toast(`Drop ${profile.id}.json into tap-repeater/wwwroot/profiles/`);
}
function dagRhythmUrl() {
    if (!S.taps.length) return null;
    const serialized = serializePattern(currentPattern());
    const base = siblingUrl('dag');
    return base ? buildDagRhythmURL(serialized, { baseUrl: base }) : serialized;
}
function sendToDag() {
    const u = dagRhythmUrl();
    if (!u) { toast('Tap some beats first'); return; }
    if (siblingUrl('dag')) window.open(u, '_blank');
    else { navigator.clipboard?.writeText(u); toast('Not deployed — rhythm copied to clipboard'); }
}
function copyRhythmUrl() {
    const u = dagRhythmUrl();
    if (!u) { toast('Tap some beats first'); return; }
    navigator.clipboard?.writeText(u).then(() => toast('Rhythm URL copied')).catch(() => toast('Copy failed'));
}

// ── DAG preview over SignalR ─────────────────────────────────────────────────
// Embed the live DAG in an iframe joined to a private channelId room, push the
// projected taps to it through signalargh (so it round-trips REAL SignalR, even
// from your own machine), and measure that round-trip with a self-ping. The DAG
// reads its channelId from the iframe URL (?channelId=). projectPatternToDag is
// the same engine DAG uses — reused here for the inline projection.
const dagEls = {
    status: $('dag-status'), rtt: $('dag-rtt'), project: $('dag-project'),
    auto: $('dag-auto'), room: $('dag-room'), frame: $('dag-frame'), note: $('dag-note'), inline: $('dag-inline'), toggle: $('dag-toggle')
};
const dagRoom = `tr-${Math.random().toString(36).slice(2, 9)}`;
const dagUserId = `builder-${Math.random().toString(36).slice(2, 9)}`;
let dagConn = null;
let dagAutoTimer = null;
let dagPingAt = null;
let dagMode = 'inline';

function dagContext() {
    const override = new URLSearchParams(location.search).get('dagBase');
    const parts = (location.hostname || '').split('.').filter(Boolean);
    const base = override || (parts.length >= 2 ? parts.slice(-2).join('.') : null);
    if (!base) return null;
    return { base, dagOrigin: `https://dag.${base}`, hubUrl: `https://signalargh.${base}/hub` };
}
function setDagStatus(text, cls) { dagEls.status.textContent = text; dagEls.status.className = 'dag-status' + (cls ? ' ' + cls : ''); }
function setDagRtt(ms) { dagEls.rtt.innerHTML = `<i class="ti ti-activity"></i> RTT <b>${Math.round(ms)} ms</b>`; }

function projectToDag(announce = true) {
    if (!dagConn || dagConn.state !== 'Connected') { if (announce) toast('DAG not connected yet'); return; }
    if (!S.taps.length) { if (announce) toast('Tap some beats first'); return; }
    const pattern = currentPattern();
    const proj = projectPatternToDag(pattern, { mode: 'timing-chain' });
    const msg = {
        type: 'full-sync',
        data: { nodes: proj.nodes, edges: proj.edges, metadata: { rhythm: { serialized: serializePattern(pattern), projectionMode: 'timing-chain' } } },
        userId: dagUserId, _ts: performance.now()
    };
    dagConn.invoke('SendChannelChat', dagRoom, JSON.stringify(msg)).catch(() => {});
    if (announce) toast(`Projected ${proj.nodes.length} nodes → DAG`, true);
}
function dagAutoProject() {
    if (!dagEls.auto || !dagEls.auto.checked || !dagConn || dagConn.state !== 'Connected' || !S.taps.length) return;
    clearTimeout(dagAutoTimer);
    dagAutoTimer = setTimeout(() => projectToDag(false), 400);
}
function onDagMessage(data) {
    let m;
    try { m = typeof data?.message === 'string' ? JSON.parse(data.message) : data?.message; } catch { return; }
    if (!m || m.userId === dagUserId) return;                       // hub doesn't echo to sender, but be safe
    // DAG's full-sync is its reply to our request-sync ping → that's the round-trip.
    if (m.type === 'full-sync') { if (dagPingAt != null) { setDagRtt(performance.now() - dagPingAt); dagPingAt = null; } return; }
    // The iframe DAG just connected and asked for state → hand it the current taps.
    if (m.type === 'request-sync' && S.taps.length) projectToDag(false);
}
function dagPing() {
    if (!dagConn || dagConn.state !== 'Connected') return;
    dagPingAt = performance.now();
    dagConn.invoke('SendChannelChat', dagRoom, JSON.stringify({ type: 'request-sync', userId: dagUserId })).catch(() => { dagPingAt = null; });
}
function initDag() {
    const ctx = dagContext();
    if (!ctx) {
        dagEls.note.hidden = false;
        dagEls.note.innerHTML = 'Live DAG preview runs on the deployed site.<br>For local testing add <code>?dagBase=&lt;your-domain&gt;</code>.';
        setDagStatus('offline', 'off');
        return;
    }
    dagEls.room.textContent = 'room ' + dagRoom;
    dagEls.frame.src = `${ctx.dagOrigin}/workspace.html?channelId=${dagRoom}&_=${Date.now()}`;
    if (!window.signalR) { setDagStatus('no signalr lib', 'off'); return; }
    dagConn = new signalR.HubConnectionBuilder()
        .withUrl(`${ctx.hubUrl}?channelId=${dagRoom}&userId=${dagUserId}`)
        .withAutomaticReconnect().build();
    dagConn.on('channelChat', onDagMessage);
    dagConn.onreconnecting(() => setDagStatus('reconnecting…'));
    dagConn.onreconnected(() => setDagStatus('live', 'live'));
    dagConn.onclose(() => setDagStatus('disconnected', 'off'));
    dagConn.start().then(() => {
        setDagStatus('live', 'live');
        dagPing();                       // measure the round-trip immediately, then keep it fresh
        setInterval(dagPing, 2000);
    }).catch(() => setDagStatus('hub unreachable', 'off'));
}
// Inline mode: render the SAME projectPatternToDag output directly as SVG — instant,
// no network, no SignalR. A zero-latency baseline to eyeball the SignalR lag against.
function renderInlineDag() {
    const host = dagEls.inline;
    if (!host) return;
    if (!S.taps.length) { host.innerHTML = '<div class="dag-empty">tap some beats to see the DAG</div>'; return; }
    const proj = projectPatternToDag(currentPattern(), { mode: 'timing-chain' });
    const nodes = proj.nodes, edges = proj.edges;
    const W = host.clientWidth || 800, H = host.clientHeight || 360;
    const pad = 56, nodeW = 116, nodeH = 38;
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const sx = (W - pad * 2 - nodeW) / ((maxX - minX) || 1), sy = (H - pad * 2 - nodeH) / ((maxY - minY) || 1);
    const pos = n => ({ x: pad + (n.x - minX) * sx, y: pad + (n.y - minY) * sy });
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
    const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`;
    for (const e of edges) {
        const a = byId[e.source], b = byId[e.target]; if (!a || !b) continue;
        const pa = pos(a), pb = pos(b);
        svg += `<line x1="${pa.x + nodeW / 2}" y1="${pa.y + nodeH / 2}" x2="${pb.x + nodeW / 2}" y2="${pb.y + nodeH / 2}" stroke="#9aa7b6" stroke-width="2"/>`;
    }
    for (const n of nodes) {
        const p = pos(n);
        svg += `<rect x="${p.x}" y="${p.y}" width="${nodeW}" height="${nodeH}" rx="9" fill="${n.color || '#0071CE'}"/>`
            + `<text x="${p.x + nodeW / 2}" y="${p.y + nodeH / 2 + 4}" text-anchor="middle" fill="#fff" font-family="system-ui, sans-serif" font-size="11">${esc(String(n.label || '').slice(0, 16))}</text>`;
    }
    host.innerHTML = svg + '</svg>';
}
function dagRefresh() { if (dagMode === 'signalr') dagAutoProject(); else renderInlineDag(); }
function setDagMode(mode) {
    dagMode = mode === 'signalr' ? 'signalr' : 'inline';
    try { localStorage.setItem('tap-repeater:dagMode', dagMode); } catch {}
    dagEls.toggle?.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.mode === dagMode));
    const sr = dagMode === 'signalr';
    if (dagEls.frame) dagEls.frame.style.display = sr ? 'block' : 'none';
    if (dagEls.inline) dagEls.inline.style.display = sr ? 'none' : 'block';
    [dagEls.rtt, dagEls.room, dagEls.status, dagEls.project].forEach(el => { if (el) el.style.display = sr ? '' : 'none'; });
    if (dagEls.note && !sr) dagEls.note.hidden = true;
    if (sr) { if (!dagConn) initDag(); else projectToDag(false); }
    else renderInlineDag();
}
if (dagEls.project) dagEls.project.onclick = () => projectToDag(true);
if (dagEls.toggle) dagEls.toggle.querySelectorAll('button').forEach(b => { b.onclick = () => setDagMode(b.dataset.mode); });

// ── wire up ──────────────────────────────────────────────────────────────────
els.load.onclick = () => {
    const id = parseVideoId(els.url.value);
    if (!id) { toast('Paste a valid YouTube link or 11-char id'); return; }
    S.taps = []; S.slugTouched = false; loadSong(id); renderAll();
};
els.url.addEventListener('keydown', e => { if (e.key === 'Enter') els.load.click(); });
els.tappad.addEventListener('pointerdown', (e) => {
    const r = els.tappad.getBoundingClientRect();
    recordTap(((e.clientX - r.left) / r.width) * TAP_AREA.width, ((e.clientY - r.top) / r.height) * TAP_AREA.height);
});
els.play.onclick = () => { if (!S.player) return; const st = S.player.getPlayerState(); st === 1 ? S.player.pauseVideo() : S.player.playVideo(); };
els.restart.onclick = () => { if (S.player) S.player.seekTo(0, true); };
els.undo.onclick = () => { S.taps.pop(); renderAll(); };
els.clear.onclick = () => { if (S.taps.length && confirm('Clear all taps?')) { S.taps = []; renderAll(); } };
els.timeline.addEventListener('click', (e) => {
    if (!S.player || !S.duration) return;
    const r = els.timeline.getBoundingClientRect();
    S.player.seekTo(((e.clientX - r.left) / r.width) * (S.duration / 1000), true);
});
els.pSlug.addEventListener('input', () => { S.slugTouched = true; });
els.save.onclick = saveProfile;
els.download.onclick = downloadProfile;
els.sendDag.onclick = sendToDag;
els.copyUrl.onclick = copyRhythmUrl;

// Space = tap (the natural "tap along" gesture); ignore when typing in a field.
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) {
        e.preventDefault();
        recordTap(TAP_AREA.width / 2, TAP_AREA.height / 2);
    }
});

// Nav: link "Open DAG" at the sibling domain when deployed.
const dagBase = siblingUrl('dag');
if (dagBase) els.navDag.href = dagBase + 'workspace.html'; else els.navDag.style.display = 'none';

// Boot: deep-link ?v=<id> or ?load=<slug>; render library; start the playhead loop.
renderLibrary();
const qp = new URLSearchParams(location.search);
const deepId = parseVideoId(qp.get('v') || qp.get('url') || '');
const deepSlug = qp.get('load');
if (deepSlug && loadLibrary()[deepSlug]) openProfile(loadLibrary()[deepSlug]);
else if (deepId) { els.url.value = deepId; loadSong(deepId); }
else { els.url.value = 'uaP6KgwbOvo'; loadSong('uaP6KgwbOvo', { title: 'Pain', artist: 'Jimmy Eat World', slug: 'pain' }); }   // pre-seed: Jimmy Eat World — Pain
renderAll();
requestAnimationFrame(frame);
try { setDagMode(localStorage.getItem('tap-repeater:dagMode') || 'inline'); } catch { setDagMode('inline'); }

// Mount the band-party composer at the top of the stage. It saves into the SAME
// profile library (buildBandProfile extends the same envelope), so on-the-fly
// band compositions show up alongside the YouTube tap-along profiles.
mountBandParty(document.getElementById('bandPartyHost'), {
    song: () => ({ title: els.pTitle.value, artist: els.pArtist.value, youtubeId: S.videoId, durationSec: Math.round((S.duration || 0) / 1000) }),
    songClock: () => (S.player && S.player.getPlayerState && S.player.getPlayerState() === 1 && S.player.getCurrentTime ? S.player.getCurrentTime() * 1000 : null),
    onProfile: (profile) => { const lib = loadLibrary(); lib[profile.id] = profile; writeLibrary(lib); renderLibrary(); }
});

// Debug surface (consistent with window.tapRepeaterDebug on the instrument).
window.tapRepeaterBuilderDebug = {
    state: () => S,
    recordTap, currentPattern, buildCurrentProfile, loadSong, saveProfile,
    pushTapAt(ms) { S.taps.push({ id: `tap-${S.taps.length + 1}`, perfOffset: Number(ms) || 0, x: 500, y: 350, duration: 0, isDrag: false }); renderAll(); }
};
