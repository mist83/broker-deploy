// Golden Apple workbench wire-up. The UI shell loads the Workbench as an
// htmlSource fragment, so initialization is idempotent and runs after shell
// view changes.

const API_URL = window.GOLDEN_APPLE_API_URL || localStorage.getItem('golden-apple.api') || '';

const $ = (id) => document.getElementById(id);
const SLIDER_IDS = ['s-colors', 's-edge', 's-saturation', 's-halftone', 's-crystal', 's-max-width'];
const RENDER_TIMEOUT_MS = 120000;

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

function updateSceneDetails(card) {
    if (!card) return;
    const scene = card.dataset.scene || '01';
    const time = card.dataset.time || '0:00.00';
    const role = card.dataset.role || 'establishing';
    const copy = card.dataset.copy || 'Scene ready for review.';

    if ($('preview-title')) $('preview-title').textContent = `Preview - Scene ${scene}`;
    if ($('scene-title')) $('scene-title').textContent = `Scene ${scene}`;
    if ($('scene-kf')) $('scene-kf').textContent = `kf${scene.padStart(3, '0')} - ${time}`;
    if ($('scene-copy')) $('scene-copy').textContent = `"${copy}"`;
    if ($('role-note')) $('role-note').textContent = `Selected role - ${role}`;

    document.querySelectorAll('.tab-row .tab').forEach((tab) => {
        tab.classList.toggle('active', tab.textContent.trim() === role);
    });

    setPreviewNote(`scene ${scene} selected`);
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

function renderMissingPreview() {
    const preview = $('preview');
    if (!preview) return;

    preview.innerHTML = '<div class="panel"><span>preview asset queued</span></div><div class="panel"><span>using placeholder</span></div>';
    preview.classList.add('is-placeholder');
}

async function verifyWorkbenchResources() {
    const sheetUrl = new URL('./demo/panel-guided-sheet.jpg', window.location.href).href;
    const hasSheet = await resourceExists(sheetUrl);

    if (!hasSheet) {
        renderMissingPreview();
        setStatus('Preview sheet is missing or still queued; using placeholder panels.', true);
    }
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

    const sceneStrip = document.querySelector('.scene-strip');
    sceneStrip?.addEventListener('click', (event) => {
        const addButton = event.target.closest('#btn-add-scene');
        if (addButton) {
            setStatus('Scene add is queued for the next decision-map pass.');
            setPreviewNote('new scene queued');
            return;
        }

        const card = event.target.closest('.scene-card');
        if (!card) return;
        sceneStrip.querySelectorAll('.scene-card').forEach((item) => item.classList.remove('active'));
        card.classList.add('active');
        updateSceneDetails(card);
    });

    document.querySelectorAll('.tab-row').forEach((row) => {
        row.addEventListener('click', (event) => {
            const tab = event.target.closest('.tab');
            if (!tab) return;
            row.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
            tab.classList.add('active');
            if ($('role-note')) $('role-note').textContent = `Operator selected - ${tab.textContent.trim()}`;
            setStatus(`Panel role set to ${tab.textContent.trim()}.`);
        });
    });

    $('btn-detect')?.addEventListener('click', () => {
        setStatus('Detected 10 demo scene packets. Open Decision Map for the pipeline shape.');
        setPreviewNote('scene packets refreshed');
    });

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

    ['crop-subject', 'bubble-side', 'bubble-anchor', 'f-style'].forEach((id) => {
        $(id)?.addEventListener('change', (event) => {
            setStatus(`${event.target.value} selected.`);
            setPreviewNote('scene decision updated');
        });
    });

    const videoField = $('f-video');
    if (videoField && !videoField.value) {
        videoField.value = exampleVideoUrl();
        videoField.placeholder = 'https://example.com/path/to/clip.mp4 (Big Buck Bunny preloaded — clear to use your own)';
    }

    updateSceneDetails(document.querySelector('.scene-card.active'));
    verifyWorkbenchResources();
}

document.addEventListener('ui:view-changed', initGoldenAppleWorkbench);
window.addEventListener('DOMContentLoaded', initGoldenAppleWorkbench);

const observer = new MutationObserver(() => initGoldenAppleWorkbench());
observer.observe(document.body, { childList: true, subtree: true });
