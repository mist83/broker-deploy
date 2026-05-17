import {
    buildDagRhythmURL,
    compilePattern,
    parsePattern,
    projectPatternToScene,
    serializePattern
} from '../../../src/index.js';

const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d');
const fontMono = getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace';

const ui = {
    input: document.getElementById('pattern-input'),
    status: document.getElementById('summary-status'),
    bpm: document.getElementById('summary-bpm'),
    entities: document.getElementById('summary-entities'),
    duration: document.getElementById('summary-duration'),
    timeline: document.getElementById('timeline-progress'),
    timelineNow: document.getElementById('timeline-now'),
    statusMessage: document.getElementById('status-message'),
    projectionLabel: document.getElementById('projection-label'),
    cameraLabel: document.getElementById('camera-label'),
    play: document.getElementById('btn-play'),
    pause: document.getElementById('btn-pause'),
    reset: document.getElementById('btn-reset'),
    loadDemo: document.getElementById('btn-demo'),
    importPattern: document.getElementById('btn-import'),
    copyLink: document.getElementById('btn-copy-link'),
    openDag: document.getElementById('btn-open-dag'),
    openTaps: document.getElementById('btn-open-taps')
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function formatDuration(ms = 0) {
    return `${(ms / 1000).toFixed(2)}s`;
}

function createDemoPattern() {
    return compilePattern([
        { id: 'kick', tMs: 0, xNorm: 0.12, yNorm: 0.78, durationMs: 0, isDrag: false, source: 'demo' },
        { id: 'snare', tMs: 320, xNorm: 0.34, yNorm: 0.62, durationMs: 0, isDrag: false, source: 'demo' },
        { id: 'pad', tMs: 680, xNorm: 0.58, yNorm: 0.34, durationMs: 260, isDrag: false, source: 'demo' },
        { id: 'glide', tMs: 910, xNorm: 0.78, yNorm: 0.24, durationMs: 0, isDrag: true, source: 'demo' },
        { id: 'bell', tMs: 1180, xNorm: 0.84, yNorm: 0.16, durationMs: 0, isDrag: false, source: 'demo' },
        { id: 'echo', tMs: 1540, xNorm: 0.56, yNorm: 0.48, durationMs: 220, isDrag: false, source: 'demo' },
        { id: 'land', tMs: 1860, xNorm: 0.24, yNorm: 0.7, durationMs: 0, isDrag: false, source: 'demo' }
    ], { loopable: true });
}

const SCENE_COLORS = {
    beat: '#38bdf8',
    sustain: '#f97316',
    gesture: '#8b5cf6'
};

const app = {
    pattern: null,
    scene: null,
    serialized: '',
    status: 'loading',
    source: 'boot',
    currentMs: 0,
    startedAt: 0,
    camera: { x: 0.5, y: 0.5, zoom: 1 },
    latestFocus: null,
    starfield: [],

    init() {
        this.handleResize = this.resize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.resize();
        this.bindEvents();
        this.loadInitialPattern();
        requestAnimationFrame(this.loop.bind(this));
    },

    bindEvents() {
        ui.play.addEventListener('click', () => this.play());
        ui.pause.addEventListener('click', () => this.pause());
        ui.reset.addEventListener('click', () => this.reset());
        ui.loadDemo.addEventListener('click', () => this.loadPattern(createDemoPattern(), 'demo'));
        ui.importPattern.addEventListener('click', () => this.importFromTextarea());
        ui.copyLink.addEventListener('click', () => this.copyShareLink());
        ui.openDag.addEventListener('click', () => this.openExternal('dag'));
        ui.openTaps.addEventListener('click', () => this.openExternal('taps'));
    },

    resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    setStatus(status, message) {
        this.status = status;
        ui.status.textContent = status;
        if (message) {
            ui.statusMessage.textContent = message;
        }
    },

    loadInitialPattern() {
        const params = new URLSearchParams(window.location.search);
        const rhythm = params.get('rhythm');
        if (rhythm) {
            try {
                this.loadSerializedPattern(rhythm, 'url');
                this.play();
                return;
            } catch (error) {
                console.warn('Failed to load serialized rhythm from URL:', error);
                this.setStatus('error', 'URL pattern failed to parse. Loaded demo pattern instead.');
            }
        }

        this.loadPattern(createDemoPattern(), 'demo');
    },

    buildStarfield() {
        const count = Math.max(36, (this.scene?.entities?.length || 0) * 7);
        this.starfield = Array.from({ length: count }, (_, index) => {
            const seed = Math.sin(index * 91.7) * 43758.5453;
            const seedB = Math.sin((index + 1) * 17.13) * 24531.153;
            return {
                x: seed - Math.floor(seed),
                y: seedB - Math.floor(seedB),
                size: 0.6 + ((index % 5) * 0.35),
                twinkle: 0.3 + ((index % 7) * 0.09)
            };
        });
    },

    loadSerializedPattern(serialized, source = 'manual') {
        const pattern = parsePattern(serialized);
        this.loadPattern(pattern, source, serialized);
    },

    loadPattern(pattern, source = 'manual', providedSerialized = '') {
        this.pattern = pattern;
        this.scene = projectPatternToScene(pattern);
        this.serialized = providedSerialized || serializePattern(pattern);
        this.source = source;
        this.currentMs = 0;
        this.startedAt = 0;
        this.latestFocus = null;
        this.camera = { x: 0.5, y: 0.5, zoom: 1 };
        this.buildStarfield();
        ui.input.value = this.serialized;
        this.setStatus('ready', `Loaded ${this.scene.entities.length} projected scene entities from ${source}.`);
        this.updateSummary();
        this.updateShareURL();
    },

    updateSummary() {
        ui.bpm.textContent = this.pattern?.bpm ? `${this.pattern.bpm} BPM` : 'Free';
        ui.entities.textContent = String(this.scene?.entities?.length || 0);
        ui.duration.textContent = formatDuration(this.pattern?.durationMs || 0);
        ui.projectionLabel.textContent = `Scene projection • ${this.scene?.meta?.beatCount || 0} beats`;
        this.updateTimeline();
    },

    updateTimeline() {
        const durationMs = this.pattern?.durationMs || 1;
        const pct = clamp(this.currentMs / durationMs, 0, 1);
        ui.timeline.style.width = `${pct * 100}%`;
        ui.timelineNow.textContent = formatDuration(this.currentMs);
    },

    updateShareURL() {
        const url = new URL(window.location.href);
        if (this.serialized) {
            url.searchParams.set('rhythm', this.serialized);
        }
        window.history.replaceState({}, '', url);
    },

    importFromTextarea() {
        const value = ui.input.value.trim();
        if (!value) {
            this.setStatus('error', 'Paste a serialized rhythm payload before importing.');
            return;
        }

        try {
            this.loadSerializedPattern(value, 'textarea');
        } catch (error) {
            console.warn(error);
            this.setStatus('error', 'Import failed. The serialized payload could not be parsed.');
        }
    },

    async copyShareLink() {
        const url = new URL(window.location.href);
        url.searchParams.set('rhythm', this.serialized);
        const value = url.toString();
        try {
            await navigator.clipboard.writeText(value);
            this.setStatus(this.status, 'Copied a shareable rhythm scene link to the clipboard.');
        } catch {
            ui.input.focus();
            ui.input.select();
            document.execCommand('copy');
            this.setStatus(this.status, 'Selected the current rhythm payload. Copy it to share the scene.');
        }
    },

    buildExternalURL(target) {
        const baseUrl = target === 'taps'
            ? 'https://tap-repeater.mullmania.com/'
            : 'https://dag.mullmania.com/';
        return buildDagRhythmURL(this.serialized, { baseUrl });
    },

    openExternal(target) {
        if (!this.serialized) return;
        const url = this.buildExternalURL(target);
        const win = window.open(url, '_blank');
        if (!win) {
            this.setStatus(this.status, `Popup blocked while opening ${target}.`);
        }
    },

    play() {
        if (!this.pattern) {
            this.loadPattern(createDemoPattern(), 'demo');
        }
        if (this.status === 'playing') {
            return;
        }
        this.startedAt = performance.now() - this.currentMs;
        this.setStatus('playing', `Playing ${this.scene.entities.length} scene entities from ${this.source}.`);
    },

    pause() {
        if (this.status !== 'playing') return;
        this.currentMs = clamp(performance.now() - this.startedAt, 0, this.pattern.durationMs);
        this.setStatus('paused', 'Scene playback paused.');
        this.updateTimeline();
    },

    reset() {
        this.currentMs = 0;
        this.startedAt = performance.now();
        this.latestFocus = null;
        this.camera = { x: 0.5, y: 0.5, zoom: 1 };
        this.setStatus('ready', 'Scene reset to the beginning.');
        this.updateTimeline();
    },

    loop(now) {
        if (this.status === 'playing' && this.pattern) {
            this.currentMs = clamp(now - this.startedAt, 0, this.pattern.durationMs);
            if (this.currentMs >= this.pattern.durationMs) {
                this.currentMs = this.pattern.durationMs;
                this.setStatus('completed', 'Scene playback completed.');
            }
        }

        this.updateCamera();
        this.updateTimeline();
        this.render(now);
        requestAnimationFrame(this.loop.bind(this));
    },

    updateCamera() {
        if (!this.scene) return;
        const focusWindows = this.scene.cameraHints?.focusWindows || [];
        const focus = focusWindows
            .filter(windowRef => windowRef.atMs <= this.currentMs)
            .slice(-1)[0] || focusWindows[0] || { x: 0.5, y: 0.5, durationMs: 300 };
        const peak = (this.scene.cameraHints?.densityPeaks || [])
            .find(entry => this.currentMs >= entry.atMs && this.currentMs < entry.atMs + 900);
        const zoomTarget = clamp(1 + ((peak?.eventCount || 0) / 12), 1, 1.45);

        this.camera.x += (focus.x - this.camera.x) * 0.08;
        this.camera.y += (focus.y - this.camera.y) * 0.08;
        this.camera.zoom += (zoomTarget - this.camera.zoom) * 0.05;
        this.latestFocus = focus;
        ui.cameraLabel.textContent = `Camera focus • ${focus.x.toFixed(2)}, ${focus.y.toFixed(2)} • ${this.camera.zoom.toFixed(2)}x`;
    },

    worldToScreen(entity) {
        const width = canvas.clientWidth || 1;
        const height = canvas.clientHeight || 1;
        const sceneScale = Math.min(width, height) * 0.72 * this.camera.zoom;
        return {
            x: width / 2 + (entity.x - this.camera.x) * sceneScale,
            y: height / 2 + (entity.y - this.camera.y) * sceneScale
        };
    },

    drawBackdrop(now) {
        const width = canvas.clientWidth || 1;
        const height = canvas.clientHeight || 1;
        ctx.clearRect(0, 0, width, height);

        const bg = ctx.createLinearGradient(0, 0, 0, height);
        bg.addColorStop(0, 'rgba(3, 10, 20, 0.95)');
        bg.addColorStop(1, 'rgba(2, 6, 14, 0.95)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        for (const star of this.starfield) {
            const twinkle = 0.35 + Math.sin(now * 0.0012 * star.twinkle + star.x * 8) * 0.2;
            ctx.fillStyle = `rgba(164, 202, 254, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawConnections(visibleEntities) {
        if (visibleEntities.length < 2) return;
        ctx.lineWidth = 1.3;
        for (let index = 1; index < visibleEntities.length; index += 1) {
            const prev = this.worldToScreen(visibleEntities[index - 1]);
            const current = this.worldToScreen(visibleEntities[index]);
            const alpha = 0.16 + (index / visibleEntities.length) * 0.34;
            ctx.strokeStyle = `rgba(116, 192, 252, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(current.x, current.y);
            ctx.stroke();
        }
    },

    drawEntity(entity, index, now) {
        const screen = this.worldToScreen(entity);
        const ageMs = this.currentMs - entity.atMs;
        const isVisible = ageMs >= -240;
        if (!isVisible) return;

        const color = SCENE_COLORS[entity.kind] || SCENE_COLORS.beat;
        const activeWindow = Math.max(220, entity.durationMs || 220);
        const presence = ageMs < 0 ? clamp(1 + (ageMs / 240), 0, 1) : clamp(1 - (ageMs / (activeWindow + 1200)), 0, 1);
        const pulse = entity.kind === 'sustain'
            ? 1 + Math.sin((now * 0.002) + index) * 0.2
            : 1 + Math.sin((now * 0.006) + index * 0.7) * 0.12;
        const baseRadius = entity.kind === 'sustain' ? 14 : (entity.kind === 'gesture' ? 9 : 11);
        const radius = baseRadius * pulse * (0.72 + presence * 0.55);

        ctx.save();
        ctx.globalAlpha = clamp(presence, 0.12, 1);

        const glow = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, radius * 4.8);
        glow.addColorStop(0, `${color}cc`);
        glow.addColorStop(1, `${color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius * 4.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(239, 246, 255, 0.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius + 3.5, 0, Math.PI * 2);
        ctx.stroke();

        if (entity.kind === 'gesture') {
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, radius + 9, Math.PI * 0.2, Math.PI * 1.2);
            ctx.stroke();
        }

        if (entity.kind === 'sustain') {
            const sustainLength = 24 + entity.durationMs * 0.05;
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.42)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y - sustainLength / 2);
            ctx.lineTo(screen.x, screen.y + sustainLength / 2);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(239, 246, 255, 0.88)';
        ctx.font = `12px ${fontMono}`;
        ctx.textAlign = 'center';
        ctx.fillText(entity.note || entity.kind, screen.x, screen.y - radius - 12);
        ctx.restore();
    },

    render(now) {
        if (!this.pattern || !this.scene) {
            this.drawBackdrop(now);
            return;
        }

        this.drawBackdrop(now);
        const visibleEntities = this.scene.entities.filter(entity => entity.atMs <= this.currentMs + 180);
        this.drawConnections(visibleEntities.slice(-10));

        for (const [index, entity] of this.scene.entities.entries()) {
            this.drawEntity(entity, index, now);
        }

        const width = canvas.clientWidth || 1;
        const height = canvas.clientHeight || 1;
        const focus = this.latestFocus || { x: 0.5, y: 0.5 };
        const focusPos = this.worldToScreen(focus);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(focusPos.x, focusPos.y, Math.min(width, height) * 0.18, 0, Math.PI * 2);
        ctx.stroke();
    },

    getSnapshot() {
        return {
            status: this.status,
            source: this.source,
            bpm: this.pattern?.bpm || null,
            entityCount: this.scene?.entities?.length || 0,
            durationMs: this.pattern?.durationMs || 0,
            currentMs: this.currentMs,
            serialized: this.serialized,
            latestFocus: this.latestFocus,
            scene: this.scene
        };
    }
};

window.rhythmSceneApp = {
    getSnapshot: () => app.getSnapshot(),
    play: () => app.play(),
    pause: () => app.pause(),
    reset: () => app.reset(),
    loadSerializedPattern: (serialized) => app.loadSerializedPattern(serialized, 'test'),
    buildDagURL: () => app.buildExternalURL('dag'),
    buildTapURL: () => app.buildExternalURL('taps')
};

app.init();
