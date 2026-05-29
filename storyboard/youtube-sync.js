// Storyboard YouTube source-clock helper.
// Uses the official YouTube iframe as a visible timing reference for narration
// markers. It does not download, cache, or render YouTube media server-side.

const DEFAULT_YOUTUBE_URL = 'https://www.youtube.com/watch?v=uaP6KgwbOvo';
const STORAGE_PREFIX = 'storyboard.youtubeSync.';
const YT_API = 'https://www.youtube.com/iframe_api';
const VISUAL_TIME_FORMULA = 'visualTime = sourceTime + offsetSec + driftCorrectionSec';

const $ = (id) => document.getElementById(id);

let ytApiPromise = null;
let player = null;
let playerReady = false;
let rafId = 0;
let currentVideoId = '';
let currentUrl = '';
const hasLocalStorage = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
let offsetSec = (hasLocalStorage ? Number(localStorage.getItem(`${STORAGE_PREFIX}offsetSec`) || 0) : 0) || 0;

// Only auto-install in a browser. Guarding this lets the pure helpers
// (URL parsing, time formatting, contract shape) be imported and tested
// under node without a DOM.
if (typeof document !== 'undefined') install();

function install() {
    injectStyles();
    injectPanel();
    wireControls();
    exposeApi();
    const storedUrl = localStorage.getItem(`${STORAGE_PREFIX}url`) || DEFAULT_YOUTUBE_URL;
    $('yt-sync-url').value = storedUrl;
    loadFromInput({ autoplay: false });
}

function injectStyles() {
    if ($('storyboard-youtube-sync-style')) return;
    const style = document.createElement('style');
    style.id = 'storyboard-youtube-sync-style';
    style.textContent = `
        .youtube-sync-card {
            border: 1px solid var(--border-color, #d0d5dd);
            border-radius: 14px;
            padding: 14px;
            background: color-mix(in srgb, var(--bg-secondary, #f8fafc) 88%, white);
            display: grid;
            gap: 10px;
        }
        .youtube-sync-card h3 {
            margin: 0;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        .youtube-sync-card small { color: var(--text-muted, #667085); }
        .youtube-sync-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .youtube-sync-row .field-input { flex: 1 1 220px; min-width: 0; }
        .youtube-sync-player {
            width: 100%;
            aspect-ratio: 16 / 9;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid var(--border-color, #d0d5dd);
        }
        .youtube-sync-player iframe { width: 100%; height: 100%; display: block; }
        .youtube-sync-readout {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            font-variant-numeric: tabular-nums;
            font-size: 12px;
        }
        .youtube-sync-readout span {
            border: 1px solid var(--border-color, #d0d5dd);
            border-radius: 8px;
            padding: 6px 8px;
            background: var(--bg-primary, #fff);
            overflow-wrap: anywhere;
        }
        .youtube-sync-marker {
            min-height: 48px;
            border: 1px dashed var(--border-color, #d0d5dd);
            border-radius: 10px;
            padding: 8px 10px;
            color: var(--text-muted, #667085);
            background: var(--bg-primary, #fff);
            font-size: 13px;
            line-height: 1.4;
        }
        @media (max-width: 640px) {
            .youtube-sync-readout { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);
}

function injectPanel() {
    if ($('storyboard-youtube-sync')) return;
    const manifestField = $('f-manifest')?.closest('.field-group');
    const videoField = $('f-video')?.closest('.field-group');
    const anchor = manifestField || videoField;
    if (!anchor) return;

    const panel = document.createElement('div');
    panel.id = 'storyboard-youtube-sync';
    panel.className = 'youtube-sync-card mb-md';
    panel.innerHTML = `
        <h3>
            <span>Source YouTube clock</span>
            <small>visible player · sync metadata only</small>
        </h3>
        <div class="youtube-sync-row">
            <input id="yt-sync-url" class="field-input" type="url" inputmode="url" autocomplete="off" placeholder="https://www.youtube.com/watch?v=uaP6KgwbOvo">
            <button id="yt-sync-load" type="button" class="btn-secondary">Load</button>
        </div>
        <div id="yt-sync-player" class="youtube-sync-player" aria-label="Official YouTube source clock"></div>
        <div class="youtube-sync-row">
            <button id="yt-sync-restart" type="button" class="btn-secondary">Restart song</button>
            <button id="yt-sync-zero" type="button" class="btn-secondary">Pattern starts here</button>
            <button id="yt-sync-first" type="button" class="btn-secondary">First marker here</button>
        </div>
        <label class="field-label" for="yt-sync-offset">
            Offset <span id="yt-sync-offset-label">+0.00s</span>
            <input id="yt-sync-offset" class="field-input" type="range" min="-30" max="30" step="0.05" value="0">
        </label>
        <div class="youtube-sync-readout">
            <span id="yt-sync-source-time">yt 0:00</span>
            <span id="yt-sync-visual-time">story 0:00</span>
        </div>
        <div id="yt-sync-marker" class="youtube-sync-marker">No active script marker yet.</div>
    `;
    anchor.after(panel);
    setOffset(offsetSec);
}

function wireControls() {
    $('yt-sync-load')?.addEventListener('click', () => loadFromInput({ autoplay: true }));
    $('yt-sync-restart')?.addEventListener('click', () => restartSong());
    $('yt-sync-zero')?.addEventListener('click', () => anchorVisualZeroHere());
    $('yt-sync-first')?.addEventListener('click', () => anchorFirstMarkerHere());
    $('yt-sync-offset')?.addEventListener('input', (event) => {
        setOffset(Number(event.target.value) || 0);
    });
    $('yt-sync-url')?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadFromInput({ autoplay: true });
        }
    });
}

function exposeApi() {
    window.StoryboardYouTubeSync = {
        getRequestSync,
        getState,
        load: (url, options) => loadVideo(url, options),
        restart: restartSong,
        setOffset,
    };
}

async function loadFromInput(options = {}) {
    const url = $('yt-sync-url')?.value?.trim() || DEFAULT_YOUTUBE_URL;
    return loadVideo(url, options);
}

async function loadVideo(url, { autoplay = false } = {}) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
        setMarker('Paste a valid YouTube watch, share, embed, shorts, or live URL.');
        return null;
    }
    currentUrl = normalizeYouTubeUrl(url, videoId);
    currentVideoId = videoId;
    localStorage.setItem(`${STORAGE_PREFIX}url`, currentUrl);
    if ($('yt-sync-url')) $('yt-sync-url').value = currentUrl;

    await loadYouTubeApi();
    if (player) {
        player.loadVideoById(videoId);
        if (!autoplay) player.pauseVideo();
        return player;
    }

    player = new YT.Player('yt-sync-player', {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
        },
        events: {
            onReady: () => {
                playerReady = true;
                if (autoplay) player.playVideo();
                startTicker();
            },
            onStateChange: () => startTicker(),
            onError: () => setMarker('YouTube could not play this video in the embedded player.'),
        },
    });
    return player;
}

function loadYouTubeApi() {
    if (window.YT?.Player) return Promise.resolve();
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve, reject) => {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof prev === 'function') prev();
            resolve();
        };
        const script = document.createElement('script');
        script.src = YT_API;
        script.onerror = () => reject(new Error('YouTube iframe API failed to load'));
        document.head.appendChild(script);
    });
    return ytApiPromise;
}

function restartSong() {
    if (!playerReady || !player) return;
    player.seekTo(0, true);
    player.playVideo();
    startTicker();
}

function anchorVisualZeroHere() {
    setOffset(-sourceTime());
}

function anchorFirstMarkerHere() {
    const script = parseScript();
    const first = script.find((marker) => Number.isFinite(Number(marker.t_ms)));
    const firstSec = Math.max(0, Number(first?.t_ms || 0) / 1000);
    setOffset(firstSec - sourceTime());
}

function setOffset(value) {
    offsetSec = Number.isFinite(Number(value)) ? Number(value) : 0;
    localStorage.setItem(`${STORAGE_PREFIX}offsetSec`, String(offsetSec));
    if ($('yt-sync-offset')) $('yt-sync-offset').value = String(offsetSec);
    if ($('yt-sync-offset-label')) $('yt-sync-offset-label').textContent = `${offsetSec >= 0 ? '+' : ''}${offsetSec.toFixed(2)}s`;
    updateReadout();
}

function startTicker() {
    if (rafId) return;
    const tick = () => {
        rafId = 0;
        updateReadout();
        if (playerReady && player) {
            const state = player.getPlayerState?.();
            if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                rafId = requestAnimationFrame(tick);
            }
        }
    };
    rafId = requestAnimationFrame(tick);
}

function updateReadout() {
    const source = sourceTime();
    const visual = Math.max(0, source + offsetSec);
    if ($('yt-sync-source-time')) $('yt-sync-source-time').textContent = `yt ${formatTime(source)}`;
    if ($('yt-sync-visual-time')) $('yt-sync-visual-time').textContent = `story ${formatTime(visual)}`;
    updateActiveMarker(visual * 1000);
}

function updateActiveMarker(visualMs) {
    const script = parseScript().sort((a, b) => Number(a.t_ms) - Number(b.t_ms));
    if (!script.length) {
        setMarker('Script markers will appear here while the YouTube source clock runs.');
        return;
    }
    let active = null;
    for (const marker of script) {
        if (Number(marker.t_ms) <= visualMs + 40) active = marker;
        else break;
    }
    if (!active) {
        setMarker(`Waiting for first marker at ${formatTime(Number(script[0].t_ms || 0) / 1000)}.`);
        return;
    }
    const index = script.indexOf(active) + 1;
    setMarker(`#${index} · ${formatTime(Number(active.t_ms || 0) / 1000)} — ${active.text || '(no text)'}`);
}

function setMarker(text) {
    const el = $('yt-sync-marker');
    if (el) el.textContent = text;
}

function parseScript() {
    try {
        const value = JSON.parse($('f-script')?.value || '[]');
        return Array.isArray(value) ? value.filter((item) => item && Number.isFinite(Number(item.t_ms))) : [];
    } catch {
        return [];
    }
}

function sourceTime() {
    if (!playerReady || !player) return 0;
    try {
        const t = player.getCurrentTime();
        return Number.isFinite(t) ? t : 0;
    } catch {
        return 0;
    }
}

function getRequestSync() {
    if (!currentVideoId) return null;
    return {
        specVersion: 'storyboard.youtube-sync.v1',
        source: {
            type: 'youtube',
            url: currentUrl || youtubeWatchUrl(currentVideoId),
            videoId: currentVideoId,
            player: 'official-youtube-iframe-api',
        },
        sync: {
            mode: 'official-player-clock',
            sourceClock: 'youtube-iframe-api',
            visualTimeFormula: VISUAL_TIME_FORMULA,
            offsetSec,
            driftCorrectionSec: 0,
            // Honest list: the ticker re-reads the official player clock on
            // ready and on iframe-API state changes (play/pause/buffer/seek).
            // Rate-change and free scrub are not separately wired, so they
            // are not claimed.
            resyncOn: ['ready', 'play', 'pause', 'buffer', 'seek'],
        },
        policy: {
            officialPlayerVisible: true,
            noDownload: true,
            noCache: true,
            noStreamRip: true,
            rawAudioAccess: false,
        },
    };
}

function getState() {
    return {
        videoId: currentVideoId,
        url: currentUrl,
        sourceTimeSec: sourceTime(),
        visualTimeSec: Math.max(0, sourceTime() + offsetSec),
        offsetSec,
        ready: playerReady,
    };
}

function normalizeYouTubeUrl(rawUrl, videoId) {
    return rawUrl && /^https?:/i.test(rawUrl) ? rawUrl : youtubeWatchUrl(videoId);
}

export function youtubeWatchUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

export function extractYouTubeVideoId(input = '') {
    const raw = String(input || '').trim();
    if (!raw) return '';
    try {
        const url = new URL(raw);
        const host = url.hostname.replace(/^www\./, '').toLowerCase();
        if (host === 'youtu.be') return cleanVideoId(url.pathname.slice(1).split('/')[0]);
        if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
            const fromQuery = cleanVideoId(url.searchParams.get('v'));
            if (fromQuery) return fromQuery;
            const parts = url.pathname.split('/').filter(Boolean);
            const keyedPath = ['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : '';
            return cleanVideoId(keyedPath);
        }
    } catch {
        const match = raw.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?[^#\s]*v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{6,})/);
        return cleanVideoId(match?.[1] || raw);
    }
    return cleanVideoId(raw);
}

export function cleanVideoId(value = '') {
    const id = String(value || '').trim().replace(/[^a-zA-Z0-9_-].*$/, '');
    return /^[a-zA-Z0-9_-]{6,}$/.test(id) ? id : '';
}

export function formatTime(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
}
