// Storyboard frontend — single page, single POST to the Lambda Function URL.
// No framework, no build step. Edit index.html + styles.css + this file and
// re-deploy.

// The Lambda Function URL. Filled in by deploy.sh so the frontend doesn't
// ship with a hardcoded URL. The server also CORS-allows the origin so
// cross-fetch works from storyboard.mullmania.com.
const API_URL = window.STORYBOARD_API_URL || localStorage.getItem('storyboard.api') || '';

const $ = (id) => document.getElementById(id);

const EXAMPLE_SCRIPT = [
    { t_ms: 0, text: 'Storyboard demo. We are narrating the evidence now, because silent proof was apparently too peaceful.' },
    { t_ms: 5000, text: 'This beat drop should land near the first meaningful state change.', rate: '+8%', pitch: '+1st' },
    { t_ms: 12000, text: 'And this one slows down just enough to point at the result.', rate: '-6%', pitch: '-1st', volume: 0.9 },
];

for (const link of document.querySelectorAll('[data-site-link]')) {
    const site = link.getAttribute('data-site-link');
    const baseDomain = window.__STORYBOARD_BASE_DOMAIN__ || 'mullmania.com';
    if (site) link.href = `https://${site}.${baseDomain}/`;
}

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
        setStatus(`Loaded ${script.length} narration markers from the manifest.`);
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
    const music = buildMusicRequest();
    const sourceSync = getSourceSyncRequest();
    let script;
    try { script = JSON.parse($('f-script').value || '[]'); }
    catch (err) { setStatus('Script is not valid JSON: ' + err.message, true); return; }

    if (!video_url) { setStatus('Video URL is required. YouTube sync is a source clock, not a downloadable render input.', true); return; }
    if (!Array.isArray(script) || !script.length) {
        const manifestUrl = $('f-manifest').value.trim();
        if (!manifestUrl) {
            setStatus('Script must be a non-empty array, or provide a UI tour manifest URL.', true);
            return;
        }
    }

    setStatus(sourceSync
        ? 'Rendering… Polly + ffmpeg with YouTube source-sync metadata attached.'
        : 'Rendering… Polly + ffmpeg, typically 20-60s.', false);
    $('btn-render').disabled = true;
    try {
        const t0 = performance.now();
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(buildRequestBody({ video_url, script, voice, music, sourceSync })),
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

function buildRequestBody({ video_url, script, voice, music, sourceSync }) {
    const body = { video_url, voice };
    if (music) body.music = music;
    if (sourceSync) body.source_sync = sourceSync;
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

function getSourceSyncRequest() {
    try {
        return window.StoryboardYouTubeSync?.getRequestSync?.() || null;
    } catch {
        return null;
    }
}

function buildMusicRequest() {
    if (!$('f-music-enabled').checked) return null;
    return {
        style: $('f-music-style').value,
        bpm: Number($('f-music-bpm').value || 96),
        drop_ms: Math.max(0, Number($('f-music-drop').value || 0)),
        volume: Number($('f-music-volume').value || 0.22),
    };
}

function scriptFromTourManifest(manifest) {
    if (!manifest || Number(manifest.version) !== 1 || !Array.isArray(manifest.nodes)) {
        throw new Error('Manifest must be version 1 with a nodes array.');
    }

    const nodesById = new Map(manifest.nodes.map((node) => [node.id, node]));
    const orderedNodeIds = resolveNodeOrder(manifest).filter((id) => nodesById.has(id));
    const nodes = orderedNodeIds.length
        ? orderedNodeIds.map((id) => nodesById.get(id))
        : manifest.nodes;
    const incoming = buildIncomingEdgeMap(manifest.edges || []);

    let cursor = 0;
    return nodes.map((node) => {
        const text = (node.narration || node.description || node.title || node.label || '').trim();
        if (!text) {
            throw new Error(`Node ${node.id || '(unknown)'} is missing narration/description.`);
        }
        const marker = {
            t_ms: cursor,
            text,
            node_id: node.id,
            route: node.route,
        };
        const edge = incoming.get(node.id);
        if (edge?.label) marker.edge_label = edge.label;
        if (Array.isArray(node.choices) && node.choices.length) marker.choices = node.choices;
        cursor += Math.max(250, Number(node.durationMs || 3000));
        return marker;
    });
}

function resolveNodeOrder(manifest) {
    const pathId = manifest.selectedPathId;
    if (pathId && Array.isArray(manifest.paths)) {
        const path = manifest.paths.find((candidate) => candidate.id === pathId);
        if (Array.isArray(path?.nodeIds) && path.nodeIds.length) {
            return path.nodeIds.map(String);
        }
    }

    if (Array.isArray(manifest.path) && manifest.path.length) {
        return manifest.path.map(String);
    }

    if (Array.isArray(manifest.edges) && manifest.edges.length) {
        return graphWalkOrder(manifest);
    }

    return manifest.nodes.map((node) => node.id);
}

function graphWalkOrder(manifest) {
    const nodesById = new Map(manifest.nodes.map((node) => [node.id, node]));
    const targets = new Set(manifest.edges.map((edge) => edge.target));
    const entry = manifest.entryNodeId && nodesById.has(manifest.entryNodeId)
        ? manifest.entryNodeId
        : [...nodesById.keys()].find((id) => !targets.has(id)) || manifest.nodes[0]?.id;
    const outgoing = new Map(manifest.nodes.map((node) => [node.id, []]));
    for (const edge of manifest.edges) {
        if (outgoing.has(edge.source) && nodesById.has(edge.target)) {
            outgoing.get(edge.source).push(edge);
        }
    }
    for (const edges of outgoing.values()) {
        edges.sort((a, b) => {
            const an = nodesById.get(a.target);
            const bn = nodesById.get(b.target);
            return compareTuple([a.label || '', an?.y || 0, an?.x || 0, an?.title || an?.label || a.target], [b.label || '', bn?.y || 0, bn?.x || 0, bn?.title || bn?.label || b.target]);
        });
    }

    const order = [];
    const seen = new Set();
    function visit(id) {
        if (!id || seen.has(id) || !nodesById.has(id)) return;
        seen.add(id);
        order.push(id);
        for (const edge of outgoing.get(id) || []) visit(edge.target);
    }

    visit(entry);
    for (const node of [...manifest.nodes].sort((a, b) => compareTuple([a.y || 0, a.x || 0, a.title || a.label || a.id], [b.y || 0, b.x || 0, b.title || b.label || b.id]))) {
        visit(node.id);
    }
    return order;
}

function buildIncomingEdgeMap(edges) {
    const map = new Map();
    for (const edge of edges || []) {
        if (!map.has(edge.target)) map.set(edge.target, edge);
    }
    return map;
}

function compareTuple(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
    }
    return 0;
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

function renderResult({ output_url, job_id, size_bytes, narration_end_s, clip_count, music_style }) {
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
            <div class="data-row"><span class="data-label">music</span><span class="data-value">${music_style || 'none'}</span></div>
            <div class="data-row"><span class="data-label">link</span><span class="data-value"><a class="btn-link" href="${output_url}" target="_blank" rel="noopener">open MP4</a></span></div>
        </div>
    `;
}
