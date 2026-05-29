// Golden Apple workbench wire-up. The UI shell loads the Workbench as an
// htmlSource fragment, so initialization is idempotent and runs after shell
// view changes.

const API_URL = window.GOLDEN_APPLE_API_URL || localStorage.getItem('golden-apple.api') || '';

const $ = (id) => document.getElementById(id);
const SLIDER_IDS = ['s-colors', 's-edge', 's-saturation', 's-halftone', 's-crystal', 's-max-width', 's-duration'];
const RENDER_TIMEOUT_MS = 600000;
const STYLE_PRESETS = {
    pixel: {
        's-colors': 7,
        's-edge': 0.82,
        's-saturation': 1,
        's-halftone': 0.35,
        's-crystal': 0.42,
    },
    print: {
        's-colors': 16,
        's-edge': 0.88,
        's-saturation': 1.75,
        's-halftone': 0.42,
        's-crystal': 0.38,
    },
    sketch: {
        's-colors': 8,
        's-edge': 0.85,
        's-saturation': 1,
        's-halftone': 0.18,
        's-crystal': 0,
    },
    comic: {
        's-colors': 6,
        's-edge': 0.8,
        's-saturation': 1.35,
        's-halftone': 0,
        's-crystal': 0,
    },
};

function exampleVideoUrl() {
    return 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4';
}

async function resourceExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        return response.ok;
    } catch {
        return false;
    }
}

function formatSliderValue(input) {
    const value = parseFloat(input.value);
    if (input.step && input.step.includes('.')) return value.toFixed(2);
    return String(value);
}

function setStatus(text, isError = false) {
    const el = $('status');
    if (!el) return;
    if (!text) {
        el.className = '';
        el.textContent = '';
        return;
    }
    el.className = 'alert ' + (isError ? 'alert-error' : 'alert-success');
    el.textContent = text;
}

function setPreviewNote(text) {
    const note = $('preview-note');
    if (note) note.textContent = text;
}

function applyStylePreset(style) {
    const preset = STYLE_PRESETS[style];
    if (!preset) return;
    for (const [id, value] of Object.entries(preset)) {
        const input = $(id);
        if (!input) continue;
        input.value = String(value);
        const out = input.closest('.slider-row')?.querySelector('.slider-value');
        if (out) out.textContent = formatSliderValue(input);
    }
}

function buildRequestBody() {
    const subtitles = $('f-srt')?.value.trim() || '';
    return {
        video_url: $('f-video')?.value.trim() || '',
        style: $('f-style')?.value || 'print',
        params: {
            colors: parseInt($('s-colors')?.value || '16', 10),
            edge_strength: parseFloat($('s-edge')?.value || '0.88'),
            saturation: parseFloat($('s-saturation')?.value || '1.75'),
            halftone: parseFloat($('s-halftone')?.value || '0.42'),
            crystal: parseFloat($('s-crystal')?.value || '0.38'),
        },
        max_width: parseInt($('s-max-width')?.value || '854', 10),
        duration_sec: parseFloat($('s-duration')?.value || '30'),
        ...(subtitles ? { subtitles_url: subtitles } : {}),
    };
}

function renderResult({ output_url, job_id }) {
    const preview = $('preview');
    if (!preview) return;

    preview.innerHTML = '';
    preview.style.aspectRatio = '16 / 9';
    preview.style.padding = '0';
    preview.style.display = 'block';

    const video = document.createElement('video');
    video.src = output_url;
    video.controls = true;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.background = '#000';
    preview.appendChild(video);

    const link = document.createElement('a');
    link.href = output_url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = `open MP4 - ${job_id}`;
    link.className = 'btn-link';
    link.style.marginLeft = 'var(--space-md)';
    $('status')?.appendChild(link);
}

async function renderComic() {
    if (!API_URL) {
        setStatus('API URL not configured. Deploy first or set localStorage["golden-apple.api"].', true);
        return;
    }

    const body = buildRequestBody();
    if (!body.video_url) {
        setStatus('Source video URL is required.', true);
        return;
    }

    const renderButton = $('btn-render');
    setStatus('Rendering - golden-apple typically takes 20-60s.');
    setPreviewNote('rendering');
    if (renderButton) renderButton.disabled = true;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);

    try {
        const startedAt = performance.now();
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        const data = await response.json();
        const seconds = Math.round((performance.now() - startedAt) / 1000);

        if (!response.ok) {
            setStatus(`Render failed (${response.status}): ${data.error || 'unknown error'}`, true);
            setPreviewNote('render failed');
            console.error('render error', data);
            return;
        }

        const cachedNote = data.cached ? 'cached' : `${seconds}s`;
        setStatus(`Rendered ${cachedNote} - ${(data.size_bytes / 1048576).toFixed(1)} MB`);
        setPreviewNote('render complete');
        renderResult(data);
    } catch (error) {
        const message = error.name === 'AbortError'
            ? 'Render timed out after 120s. The job may still finish server-side; try again with a shorter clip or lower max width.'
            : 'Request error: ' + error.message;
        setStatus(message, true);
        setPreviewNote('request error');
    } finally {
        window.clearTimeout(timeoutId);
        if (renderButton) renderButton.disabled = false;
    }
}

function initGoldenAppleWorkbench() {
    const root = document.querySelector('.golden-workbench');
    if (!root || root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';

    for (const id of SLIDER_IDS) {
        const input = $(id);
        if (!input) continue;
        const update = () => {
            const out = input.closest('.slider-row')?.querySelector('.slider-value');
            if (out) out.textContent = formatSliderValue(input);
            setPreviewNote(`${input.closest('.slider-row')?.querySelector('.field-label')?.firstChild?.textContent.trim() || 'setting'} updated`);
        };
        input.addEventListener('input', update);
        input.addEventListener('change', () => setStatus('Render settings updated.'));
    }

    $('btn-example')?.addEventListener('click', () => {
        const videoField = $('f-video');
        if (videoField) videoField.value = exampleVideoUrl();
        setStatus('Example video loaded.');
        setPreviewNote('example source ready');
    });

    $('btn-json')?.addEventListener('click', () => {
        const view = $('json-view');
        if (!view) return;
        if (view.hidden) {
            view.textContent = JSON.stringify(buildRequestBody(), null, 2);
            view.hidden = false;
            setPreviewNote('request JSON visible');
        } else {
            view.hidden = true;
            setPreviewNote('request JSON hidden');
        }
    });

    $('btn-render')?.addEventListener('click', renderComic);

    $('f-style')?.addEventListener('change', (event) => {
        applyStylePreset(event.target.value);
        setStatus(`${event.target.value} selected.`);
        setPreviewNote('style updated');
        scheduleImageRender();
    });

    const videoField = $('f-video');
    if (videoField && !videoField.value) {
        videoField.value = exampleVideoUrl();
        videoField.placeholder = 'https://example.com/path/to/clip.mp4 (Big Buck Bunny preloaded — clear to use your own)';
    }

    wireImageMode(root);
}

// --- Image mode -------------------------------------------------------------
// Pure client-side comic-flatten on an uploaded or URL-loaded image. The
// recipe loosely mirrors src/golden_apple/comic.py::comic_color_frame:
//   blur -> k-means quantize -> palette saturate -> sobel ink mask -> halftone.
// No backend hop -- redraws live as sliders move.

const IMG_STATE = { source: null, render: 0, working: null, palette: null, paletteKey: '' };

function exampleImageUrl() {
    // Same-origin sample shipped with the site so the example button always
    // works without CORS gymnastics. Users can paste any image URL too — if
    // the host rejects cross-origin reads, fall back to the file picker.
    return './demo/print-contact-sheet.jpg';
}

function setMode(root, mode) {
    if (!root) return;
    root.dataset.mode = mode;
    for (const btn of root.querySelectorAll('[data-mode-tab]')) {
        btn.classList.toggle('is-active', btn.dataset.modeTab === mode);
    }
    setPreviewNote(mode === 'image' ? 'pick an image to start' : 'click Render comic to start');
}

function wireImageMode(root) {
    if (!root) return;

    for (const btn of root.querySelectorAll('[data-mode-tab]')) {
        btn.addEventListener('click', () => setMode(root, btn.dataset.modeTab));
    }

    const fileInput = $('f-image-file');
    const urlInput = $('f-image-url');
    const exampleBtn = $('btn-image-example');
    const downloadBtn = $('btn-download-png');

    fileInput?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => loadImageInto(reader.result, file.name);
        reader.readAsDataURL(file);
    });

    urlInput?.addEventListener('change', () => {
        if (urlInput.value) loadImageInto(urlInput.value, 'image');
    });

    exampleBtn?.addEventListener('click', () => {
        const url = exampleImageUrl();
        if (urlInput) urlInput.value = url;
        loadImageInto(url, 'example');
    });

    downloadBtn?.addEventListener('click', downloadImagePng);

    for (const id of ['s-colors', 's-edge', 's-saturation', 's-halftone', 's-crystal']) {
        $(id)?.addEventListener('input', scheduleImageRender);
    }
}

function loadImageInto(src, label) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        IMG_STATE.source = img;
        IMG_STATE.palette = null;
        IMG_STATE.paletteKey = '';
        scheduleImageRender();
        setStatus(`Loaded ${label} (${img.naturalWidth}×${img.naturalHeight})`);
    };
    img.onerror = () => setStatus(`Could not load ${label}. Try a different URL or upload directly.`, true);
    img.src = src;
}

function scheduleImageRender() {
    const root = document.querySelector('.golden-workbench');
    if (!root || root.dataset.mode !== 'image' || !IMG_STATE.source) return;
    const myId = ++IMG_STATE.render;
    // Tiny debounce so dragging a slider doesn't render on every event frame.
    setTimeout(() => { if (myId === IMG_STATE.render) renderImageNow(); }, 30);
}

function renderImageNow() {
    const canvas = $('image-canvas');
    const wrap = $('image-preview');
    const stats = $('image-stats');
    const downloadBtn = $('btn-download-png');
    const img = IMG_STATE.source;
    if (!canvas || !img) return;

    const params = {
        colors: parseInt($('s-colors')?.value || '6', 10),
        edge: parseFloat($('s-edge')?.value || '0.88'),
        saturation: parseFloat($('s-saturation')?.value || '1.75'),
        halftone: parseFloat($('s-halftone')?.value || '0'),
    };

    const maxDim = 720;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(2, Math.round(img.naturalWidth * scale));
    const h = Math.max(2, Math.round(img.naturalHeight * scale));
    canvas.width = w;
    canvas.height = h;

    const t0 = performance.now();
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // 1) Draw source with a mild blur to merge similar neighbors (mean-shift surrogate).
    ctx.filter = 'blur(1.4px)';
    ctx.drawImage(img, 0, 0, w, h);
    ctx.filter = 'none';

    const data = ctx.getImageData(0, 0, w, h);

    // 2) K-means quantize. Centroid extraction is the single slowest step,
    // so cache it per (image, k). Saturation is applied to a fresh copy each
    // render so dragging that slider doesn't re-run k-means.
    const k = Math.max(3, Math.min(params.colors, 6));
    const cacheKey = `${img.src}|${k}|${w}x${h}`;
    if (IMG_STATE.paletteKey !== cacheKey) {
        IMG_STATE.palette = kmeansPalette(data.data, w, h, k);
        IMG_STATE.paletteKey = cacheKey;
    }
    const centroids = new Float32Array(IMG_STATE.palette);
    saturatePalette(centroids, params.saturation);

    // 3) Map every pixel to its centroid.
    mapToPalette(data.data, centroids);

    // 4) Sobel ink mask from the *original* (sharp) image. Punch black where edges are.
    const edgeMask = sobelInkMask(img, w, h, params.edge);
    overlayInk(data.data, edgeMask);

    // 5) Optional halftone dots.
    ctx.putImageData(data, 0, 0);
    if (params.halftone > 0.02) {
        applyHalftone(ctx, w, h, params.halftone);
    }

    wrap?.classList.add('has-image');
    if (downloadBtn) downloadBtn.disabled = false;
    if (stats) stats.textContent = `${w}×${h} · ${k} colors · ${Math.round(performance.now() - t0)}ms`;
    setPreviewNote('comic preview live');
}

function kmeansPalette(buf, w, h, k) {
    const sampleCount = Math.min(2400, Math.floor((w * h) / 8));
    const samples = new Float32Array(sampleCount * 3);
    for (let i = 0; i < sampleCount; i++) {
        const idx = (Math.floor(Math.random() * (w * h))) * 4;
        samples[i * 3]     = buf[idx];
        samples[i * 3 + 1] = buf[idx + 1];
        samples[i * 3 + 2] = buf[idx + 2];
    }
    // k-means++ init.
    const centers = new Float32Array(k * 3);
    {
        const first = Math.floor(Math.random() * sampleCount);
        centers[0] = samples[first * 3];
        centers[1] = samples[first * 3 + 1];
        centers[2] = samples[first * 3 + 2];
        for (let ci = 1; ci < k; ci++) {
            let best = 0, bestD = -1;
            for (let i = 0; i < sampleCount; i++) {
                let minD = Infinity;
                for (let cj = 0; cj < ci; cj++) {
                    const dr = samples[i * 3] - centers[cj * 3];
                    const dg = samples[i * 3 + 1] - centers[cj * 3 + 1];
                    const db = samples[i * 3 + 2] - centers[cj * 3 + 2];
                    const d = dr * dr + dg * dg + db * db;
                    if (d < minD) minD = d;
                }
                if (minD > bestD) { bestD = minD; best = i; }
            }
            centers[ci * 3]     = samples[best * 3];
            centers[ci * 3 + 1] = samples[best * 3 + 1];
            centers[ci * 3 + 2] = samples[best * 3 + 2];
        }
    }
    // Lloyd iterations.
    const sums = new Float32Array(k * 3);
    const counts = new Int32Array(k);
    for (let iter = 0; iter < 6; iter++) {
        sums.fill(0);
        counts.fill(0);
        for (let i = 0; i < sampleCount; i++) {
            const r = samples[i * 3], g = samples[i * 3 + 1], b = samples[i * 3 + 2];
            let best = 0, bestD = Infinity;
            for (let cj = 0; cj < k; cj++) {
                const dr = r - centers[cj * 3];
                const dg = g - centers[cj * 3 + 1];
                const db = b - centers[cj * 3 + 2];
                const d = dr * dr + dg * dg + db * db;
                if (d < bestD) { bestD = d; best = cj; }
            }
            sums[best * 3] += r;
            sums[best * 3 + 1] += g;
            sums[best * 3 + 2] += b;
            counts[best]++;
        }
        for (let cj = 0; cj < k; cj++) {
            if (counts[cj] > 0) {
                centers[cj * 3] = sums[cj * 3] / counts[cj];
                centers[cj * 3 + 1] = sums[cj * 3 + 1] / counts[cj];
                centers[cj * 3 + 2] = sums[cj * 3 + 2] / counts[cj];
            }
        }
    }
    return centers;
}

function saturatePalette(centers, gain) {
    const k = centers.length / 3;
    for (let i = 0; i < k; i++) {
        const r = centers[i * 3] / 255;
        const g = centers[i * 3 + 1] / 255;
        const b = centers[i * 3 + 2] / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let l = (max + min) / 2;
        let s = 0;
        let hue = 0;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: hue = ((g - b) / d + (g < b ? 6 : 0)); break;
                case g: hue = ((b - r) / d + 2); break;
                case b: hue = ((r - g) / d + 4); break;
            }
            hue /= 6;
        }
        s = Math.min(1, s * Math.max(1, gain) + 0.08);
        l = Math.min(0.92, l * 1.04);
        const [rr, gg, bb] = hslToRgb(hue, s, l);
        centers[i * 3] = rr;
        centers[i * 3 + 1] = gg;
        centers[i * 3 + 2] = bb;
    }
}

function hslToRgb(h, s, l) {
    if (s === 0) {
        const v = Math.round(l * 255);
        return [v, v, v];
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const conv = (t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 0.5) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return [
        Math.round(conv(h + 1 / 3) * 255),
        Math.round(conv(h) * 255),
        Math.round(conv(h - 1 / 3) * 255),
    ];
}

function mapToPalette(buf, centers) {
    const k = centers.length / 3;
    for (let i = 0; i < buf.length; i += 4) {
        const r = buf[i], g = buf[i + 1], b = buf[i + 2];
        let best = 0, bestD = Infinity;
        for (let cj = 0; cj < k; cj++) {
            const dr = r - centers[cj * 3];
            const dg = g - centers[cj * 3 + 1];
            const db = b - centers[cj * 3 + 2];
            const d = dr * dr + dg * dg + db * db;
            if (d < bestD) { bestD = d; best = cj; }
        }
        buf[i] = centers[best * 3];
        buf[i + 1] = centers[best * 3 + 1];
        buf[i + 2] = centers[best * 3 + 2];
    }
}

function sobelInkMask(img, w, h, edgeStrength) {
    if (!IMG_STATE.working) IMG_STATE.working = document.createElement('canvas');
    const tmp = IMG_STATE.working;
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext('2d', { willReadFrequently: true });
    tctx.filter = 'none';
    tctx.drawImage(img, 0, 0, w, h);
    const src = tctx.getImageData(0, 0, w, h).data;
    const gray = new Float32Array(w * h);
    for (let i = 0, j = 0; i < src.length; i += 4, j++) {
        gray[j] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    }
    const mag = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            const gx = -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1]
                     + gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
            const gy = -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1]
                     + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
            // L1 magnitude — cheaper than sqrt and still monotonic in edge-ness.
            mag[i] = Math.abs(gx) + Math.abs(gy);
        }
    }
    // Sample-based percentile threshold. Full sort on a Float32Array of
    // hundreds of thousands of entries is the single slowest op in the
    // pipeline — subsampling to 2k entries gets within 1-2% of the true
    // percentile and is ~150x faster.
    const keepFrac = 0.01 + (1 - edgeStrength) * 0.14;
    const sampleN = Math.min(2000, mag.length);
    const sample = new Float32Array(sampleN);
    for (let i = 0; i < sampleN; i++) {
        sample[i] = mag[(Math.random() * mag.length) | 0];
    }
    sample.sort();
    const threshIdx = Math.floor(sampleN * (1 - Math.max(0.005, Math.min(0.3, keepFrac))));
    const thresh = sample[threshIdx];
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < mag.length; i++) {
        if (mag[i] > thresh) mask[i] = 1;
    }
    // Dilate 0..2 px depending on edge_strength.
    const dilateIters = edgeStrength > 0.66 ? 2 : edgeStrength > 0.33 ? 1 : 0;
    let cur = mask;
    for (let it = 0; it < dilateIters; it++) {
        const next = new Uint8Array(w * h);
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = y * w + x;
                if (cur[i] || cur[i - 1] || cur[i + 1] || cur[i - w] || cur[i + w]) next[i] = 1;
            }
        }
        cur = next;
    }
    return cur;
}

function overlayInk(buf, mask) {
    for (let i = 0, j = 0; i < buf.length; i += 4, j++) {
        if (mask[j]) {
            buf[i] = 12;
            buf[i + 1] = 8;
            buf[i + 2] = 6;
        }
    }
}

function applyHalftone(ctx, w, h, strength) {
    const step = Math.max(4, Math.round(7 - strength * 3));
    ctx.save();
    ctx.fillStyle = `rgba(20, 14, 10, ${0.20 + 0.45 * strength})`;
    const radius = step * 0.42 * (0.35 + strength * 0.65);
    for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
            // Skip cells already inked; just draw uniform dots — caveman halftone.
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}

function downloadImagePng() {
    const canvas = $('image-canvas');
    if (!canvas || !canvas.width) return;
    canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `golden-apple-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
}

document.addEventListener('ui:view-changed', initGoldenAppleWorkbench);
window.addEventListener('DOMContentLoaded', initGoldenAppleWorkbench);

const observer = new MutationObserver(() => initGoldenAppleWorkbench());
observer.observe(document.body, { childList: true, subtree: true });
