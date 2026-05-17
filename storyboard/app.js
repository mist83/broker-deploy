// Storyboard frontend — single page, single POST to the Lambda Function URL.
// No framework, no build step. Edit index.html + styles.css + this file and
// re-deploy.

// The Lambda Function URL. Filled in by deploy.sh so the frontend doesn't
// ship with a hardcoded URL. The server also CORS-allows the origin so
// cross-fetch works from storyboard.mullmania.com.
const API_URL = window.STORYBOARD_API_URL || localStorage.getItem('storyboard.api') || '';

const $ = (id) => document.getElementById(id);

const EXAMPLE_SCRIPT = [
    { t_ms: 0,     text: 'Storyboard demo. Every numeric marker is spoken by Polly.' },
    { t_ms: 5000,  text: 'This is the five-second mark.' },
    { t_ms: 12000, text: 'And this one lands at twelve seconds.' },
];

$('btn-example').addEventListener('click', () => {
    $('f-script').value = JSON.stringify(EXAMPLE_SCRIPT, null, 2);
});

$('btn-load-manifest').addEventListener('click', async () => {
    const manifestUrl = $('f-manifest').value.trim();
    if (!manifestUrl) {
        setStatus('Manifest URL is required.', true);
        return;
    }

    setStatus('Loading tour manifest…', false);
    try {
        const res = await fetch(manifestUrl);
        if (!res.ok) {
            setStatus(`Manifest load failed (${res.status}).`, true);
            return;
        }
        const manifest = await res.json();
        const script = scriptFromTourManifest(manifest);
        $('f-script').value = JSON.stringify(script, null, 2);
        setStatus(`Loaded ${script.length} narration markers from the UI tour manifest.`);
    } catch (err) {
        setStatus('Manifest error: ' + err.message, true);
    }
});

$('btn-render').addEventListener('click', async () => {
    if (!API_URL) {
        setStatus('API URL not configured. Deploy first or set localStorage["storyboard.api"].', true);
        return;
    }
    const video_url = $('f-video').value.trim();
    const voice = $('f-voice').value;
    let script;
    try { script = JSON.parse($('f-script').value || '[]'); }
    catch (err) { setStatus('Script is not valid JSON: ' + err.message, true); return; }

    if (!video_url) { setStatus('Video URL is required.', true); return; }
    if (!Array.isArray(script) || !script.length) {
        const manifestUrl = $('f-manifest').value.trim();
        if (!manifestUrl) {
            setStatus('Script must be a non-empty array, or provide a UI tour manifest URL.', true);
            return;
        }
    }

    setStatus('Rendering… Polly + ffmpeg, typically 20-60s.', false);
    $('btn-render').disabled = true;
    try {
        const t0 = performance.now();
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(buildRequestBody({ video_url, script, voice })),
        });
        const body = await res.json();
        const dt = Math.round((performance.now() - t0) / 1000);
        if (!res.ok) {
            setStatus(`Render failed (${res.status}): ${body.error || 'unknown error'}`, true);
            return;
        }
        setStatus(`Rendered in ${dt}s · ${(body.size_bytes / 1048576).toFixed(1)} MB · clips ${body.clip_count}`);
        renderResult(body);
    } catch (err) {
        setStatus('Request error: ' + err.message, true);
    } finally {
        $('btn-render').disabled = false;
    }
});

function buildRequestBody({ video_url, script, voice }) {
    const body = { video_url, voice };
    if (Array.isArray(script) && script.length > 0) {
        body.script = script;
        return body;
    }
    const manifestUrl = $('f-manifest').value.trim();
    if (manifestUrl) {
        body.tour_manifest_url = manifestUrl;
    }
    return body;
}

function scriptFromTourManifest(manifest) {
    if (!manifest || Number(manifest.version) !== 1 || !Array.isArray(manifest.nodes)) {
        throw new Error('Manifest must be version 1 with a nodes array.');
    }

    let cursor = 0;
    return manifest.nodes.map((node) => {
        const text = (node.narration || node.description || '').trim();
        if (!text) {
            throw new Error(`Node ${node.id || '(unknown)'} is missing narration/description.`);
        }
        const marker = {
            t_ms: cursor,
            text,
            node_id: node.id,
            route: node.route,
        };
        cursor += Math.max(250, Number(node.durationMs || 3000));
        return marker;
    });
}

function setStatus(text, isError = false) {
    const el = $('status');
    if (!text) {
        el.className = '';
        el.textContent = '';
        return;
    }
    el.className = 'alert ' + (isError ? 'alert-error' : 'alert-success');
    el.textContent = text;
}

function renderResult({ output_url, job_id, size_bytes, narration_end_s, clip_count }) {
    const el = $('result');
    el.className = '';
    el.removeAttribute('style');
    el.innerHTML = `
        <video controls src="${output_url}"></video>
        <div class="mt-md">
            <div class="data-row"><span class="data-label">job</span><span class="data-value">${job_id}</span></div>
            <div class="data-row"><span class="data-label">size</span><span class="data-value">${(size_bytes / 1048576).toFixed(1)} MB</span></div>
            <div class="data-row"><span class="data-label">narration ends</span><span class="data-value">${narration_end_s?.toFixed?.(1)}s</span></div>
            <div class="data-row"><span class="data-label">clips</span><span class="data-value">${clip_count}</span></div>
            <div class="data-row"><span class="data-label">link</span><span class="data-value"><a class="btn-link" href="${output_url}" target="_blank" rel="noopener">open MP4</a></span></div>
        </div>
    `;
}
