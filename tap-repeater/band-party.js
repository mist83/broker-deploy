// band-party.js (page side) — the on-the-fly beat composer.
//
// Mounts a self-contained composer into a host element. The engine
// (vendor/rhythm-engine/band-party.js) owns the data model + maths; this owns
// the DOM, the Web Audio voices, and the wall clock. The flow:
//
//   pick a device → metronome → "Record my beats" → Stop snapshots an
//   encapsulated CELL → lay the cell on a track (by REFERENCE) → edit the cell
//   once (quantize / nudge) and EVERY placement follows → layer more tracks =
//   a band → play once or loop. Every instance pulses when its source cell
//   fires, so the structure-sharing is visible. Save captures the whole
//   composition + device into the shared tap-profile envelope.

import {
    compileComposition,
    createPlaybackSchedule,
    metronomeGrid,
    gridStepMs,
    barMs,
    snapshotCell,
    makeCell,
    quantizeCellEvents,
    nudgeCellEvents,
    predictNextBeats,
    INSTRUMENT_PRESETS,
    normalizeInstrument,
    getInstrument,
    slugifyInstrument,
    emptyComposition,
    bandSessionReducer,
    emptySession,
    buildBandProfile
} from './vendor/rhythm-engine/index.js';
import { audioContext, scheduleVoice, playNow } from './voices.js';

const uid = (() => { let n = 0; return (p) => `${p}-${(n += 1)}`; })();

const state = {
    bpm: 120,
    beatsPerBar: 4,
    devices: INSTRUMENT_PRESETS.map(normalizeInstrument),
    instrumentId: 'kick',
    composition: emptyComposition({ bpm: 120, beatsPerBar: 4 }),
    activeTrackId: null,
    selectedCellId: null,
    session: emptySession(),
    recording: false,
    playing: false,
    loopPlayback: true,
    metronomeOn: false
};

let dom = null;          // cached DOM refs after mount
let opts = {};           // { songClock(), song(), onProfile() }
let playToken = null;    // playback generation guard
const metro = { on: false, timer: 0, nextTime: 0, step: 0 };

// ── small helpers ──────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (ms) => `${(ms / 1000).toFixed(1)}s`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function currentDevice() {
    return state.devices.find((d) => d.id === state.instrumentId) || state.devices[0];
}
function deviceById(id) {
    return state.devices.find((d) => d.id === id) || null;
}
function toast(msg, pink = false) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.innerHTML = msg;
    t.className = 'toast show' + (pink ? ' pink' : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.className = 'toast'; }, 2200);
}

// ── arrangement helpers ──────────────────────────────────────────────────────
function ensureActiveTrack(forInstrumentId) {
    const inst = forInstrumentId || state.instrumentId;
    let track = state.composition.tracks.find((t) => t.id === state.activeTrackId);
    if (!track || track.instrument !== inst) {
        // reuse an existing same-instrument track, else make a new lane
        track = state.composition.tracks.find((t) => t.instrument === inst);
        if (!track) {
            const dev = deviceById(inst) || currentDevice();
            track = { id: uid('track'), name: dev ? dev.name : 'Track', instrument: inst, muted: false, refs: [] };
            state.composition.tracks.push(track);
        }
        state.activeTrackId = track.id;
    }
    return track;
}

function trackContentEnd(track) {
    // where the next sequential ref should start: end of the last placement
    let end = 0;
    for (const ref of track.refs) {
        const cell = state.composition.cells[ref.cellId];
        const span = cell && cell.lengthMs ? cell.lengthMs : 0;
        end = Math.max(end, (ref.atMs || 0) + (ref.repeat || 1) * span);
    }
    return end;
}

function layCellOnTrack(cellId, { newTrack = false, repeat = 1, atZero = false } = {}) {
    const cell = state.composition.cells[cellId];
    if (!cell) return;
    let track;
    if (newTrack) {
        const dev = currentDevice();
        track = { id: uid('track'), name: dev.name, instrument: dev.id, muted: false, refs: [] };
        state.composition.tracks.push(track);
        state.activeTrackId = track.id;
    } else {
        track = ensureActiveTrack();
    }
    const atMs = atZero ? 0 : trackContentEnd(track);
    track.refs.push({ id: uid('ref'), cellId, atMs, repeat });
}

// Collapse a lane's placements into ONE reusable group cell (refs-of-refs = a
// nested DAG node). The lane then references the group once; editing any child
// cell still propagates everywhere the group is used, and the group itself can
// be laid down / repeated as a unit.
function groupLane(trackId) {
    const track = state.composition.tracks.find((t) => t.id === trackId);
    if (!track || !track.refs.length) { toast('Lane is empty — nothing to group'); return; }
    if (track.refs.length === 1 && state.composition.cells[track.refs[0].cellId]?.refs?.length) {
        toast('Lane is already a single group'); return;
    }
    const groupId = uid('cell');
    const group = makeCell({
        id: groupId,
        name: `Group (${track.refs.length})`,
        refs: track.refs.map((r) => ({ ...r })),
        lengthMs: trackContentEnd(track)
    });
    state.composition.cells[groupId] = group;
    track.refs = [{ id: uid('ref'), cellId: groupId, atMs: 0, repeat: 1 }];
    state.selectedCellId = groupId;
    render();
    toast(`Grouped ${group.refs.length} into one cell — reuse it, repeat it; child edits still propagate`, true);
}

// ── snapshot: turn a recorded take (or scratch events) into a cell ────────────
function commitCellFromEvents(events, name) {
    if (!events.length) { toast('No beats to snapshot — tap some first'); return null; }
    const cell = snapshotCell({
        id: uid('cell'),
        name: name || `Take ${Object.keys(state.composition.cells).length + 1}`,
        events,
        bpm: state.bpm,
        beatsPerBar: state.beatsPerBar
    });
    state.composition.cells[cell.id] = cell;
    state.selectedCellId = cell.id;
    return cell;
}

// ── edits that propagate to every placement (the whole point) ─────────────────
function countPlacements(cellId) {
    let n = 0;
    for (const t of state.composition.tracks) for (const r of t.refs) if (r.cellId === cellId) n += r.repeat || 1;
    return n;
}
function editSelectedCell(fn, label) {
    const id = state.selectedCellId;
    const cell = id && state.composition.cells[id];
    if (!cell) { toast('Select a cell first'); return; }
    state.composition.cells[id] = fn(cell);
    const n = countPlacements(id);
    render();
    toast(`${label}: 1 source → ${n || 1} placement${n === 1 ? '' : 's'} updated`, true);
}

// ── ghosts: stamp on-grid beats that anticipate the tempo ─────────────────────
function ghostNewBar() {
    const step = gridStepMs(state.bpm, 1);
    const events = Array.from({ length: state.beatsPerBar }, (_, i) => ({ id: `g-${i + 1}`, tMs: i * step, xNorm: 0.5, yNorm: 0.5, durationMs: 0, isDrag: false }));
    const cell = makeCell({ id: uid('cell'), name: 'Ghost bar', events, lengthMs: barMs(state.bpm, state.beatsPerBar), source: 'ghost' });
    state.composition.cells[cell.id] = cell;
    state.selectedCellId = cell.id;
    layCellOnTrack(cell.id, {});
    render();
    toast('Stamped a ghost bar on the grid', true);
}
function ghostAppend(n) {
    const id = state.selectedCellId;
    const cell = id && state.composition.cells[id];
    if (!cell) { ghostNewBar(); return; }
    const step = gridStepMs(state.bpm, 1);
    const lastT = cell.events.length ? Math.max(...cell.events.map((e) => e.tMs)) : -step;
    const start = (Math.floor(lastT / step) + 1) * step;
    const add = Array.from({ length: n }, (_, i) => ({ id: `g-${cell.events.length + i + 1}`, tMs: start + i * step, xNorm: 0.5, yNorm: 0.5, durationMs: 0, isDrag: false }));
    state.composition.cells[id] = makeCell({ ...cell, events: [...cell.events, ...add], lengthMs: Math.max(cell.lengthMs || 0, start + n * step) });
    render();
    toast(`Anticipated ${n} ghost beat${n === 1 ? '' : 's'}`, true);
}

// ── recording (human-timed, via the engine session reducer) ───────────────────
function dispatch(action) { state.session = bandSessionReducer(state.session, action); }

function startRecording() {
    audioContext();
    const toSong = !!(opts.songClock && opts.songClock() != null);
    state.session = bandSessionReducer(emptySession(), { type: 'ARM' });
    state.recording = true;
    if (!state.metronomeOn && !toSong) toggleMetronome(true);   // count-in feel (free mode only)
    ensureActiveTrack();
    render();
    toast(toSong ? 'Recording to the song — tap along, then Stop' : 'Recording your beats — tap in time, then Stop', true);
}
function stopRecording() {
    state.recording = false;
    dispatch({ type: 'STOP' });
    const events = state.session.events.slice();
    state.session = emptySession();
    if (events.length) {
        const cell = commitCellFromEvents(events, null);
        if (cell) { layCellOnTrack(cell.id, {}); toast(`Snapshotted “${cell.name}” (${events.length} beats) — laid on ${currentDevice().name}`, true); }
    } else {
        toast('Stopped — no beats recorded');
    }
    render();
}
// Record against the song's own clock when a YouTube video is playing (robust to
// buffering — getCurrentTime tracks the actual audio), else the wall clock.
function recordClock() {
    const c = opts.songClock && opts.songClock();
    return (typeof c === 'number' && Number.isFinite(c) && c >= 0) ? c : performance.now();
}
function padTap(xNorm, yNorm) {
    const dev = currentDevice();
    playNow(dev.voice, { xNorm, yNorm });
    rippleAt(xNorm, yNorm);
    if (state.recording) dispatch({ type: 'TAP', tMs: recordClock(), xNorm, yNorm });
    if (dom) dom.padDev.textContent = dev.name;
}

// ── metronome (Web Audio lookahead scheduler) ─────────────────────────────────
function clickVoice(accent) {
    return { wave: 'square', attackMs: 1, releaseMs: accent ? 55 : 35, baseHz: accent ? 1500 : 1000, pitchFromXY: false };
}
function toggleMetronome(force) {
    state.metronomeOn = typeof force === 'boolean' ? force : !state.metronomeOn;
    if (state.metronomeOn) startMetronome(); else stopMetronome();
    if (dom) dom.metroBtn.classList.toggle('on', state.metronomeOn);
}
function startMetronome() {
    const ctx = audioContext();
    metro.on = true;
    metro.step = 0;
    metro.nextTime = ctx.currentTime + 0.12;
    scheduleMetro();
}
function scheduleMetro() {
    if (!metro.on) return;
    const ctx = audioContext();
    const stepS = gridStepMs(state.bpm, 1) / 1000;
    while (metro.nextTime < ctx.currentTime + 0.25) {
        const beat = metro.step % state.beatsPerBar;
        const accent = beat === 0;
        scheduleVoice(ctx, metro.nextTime, clickVoice(accent), { gain: accent ? 0.9 : 0.6 });
        const delayMs = (metro.nextTime - ctx.currentTime) * 1000;
        const b = beat;
        setTimeout(() => flashBeat(b, accent), Math.max(0, delayMs));
        metro.nextTime += stepS;
        metro.step += 1;
    }
    metro.timer = setTimeout(scheduleMetro, 60);
}
function stopMetronome() {
    metro.on = false;
    clearTimeout(metro.timer);
    if (dom) dom.beatdots.querySelectorAll('.d').forEach((d) => d.classList.remove('lit', 'down'));
}
function flashBeat(beat, accent) {
    if (!dom) return;
    const dots = dom.beatdots.querySelectorAll('.d');
    dots.forEach((d, i) => d.classList.toggle('lit', i === beat));
    dots.forEach((d, i) => d.classList.toggle('down', i === beat && accent));
    if (dom.pad) { dom.pad.style.borderColor = accent ? 'var(--yellow,#FFC220)' : 'transparent'; setTimeout(() => { if (!state.recording) dom.pad.style.borderColor = ''; }, 90); }
}

// ── playback (drift-free; loops; pulses each source cell as it fires) ─────────
function play() {
    const { pattern, map } = compileComposition(state.composition, { loopable: state.loopPlayback });
    if (!pattern.events.length) { toast('Nothing to play yet — record or stamp a cell'); return; }
    const ctx = audioContext();
    const schedule = createPlaybackSchedule(pattern, { defaultTapDurationMs: 140 });
    const total = Math.max(pattern.durationMs, barMs(state.bpm, state.beatsPerBar)) + 40;
    state.playing = true;
    const token = Symbol('pb');
    playToken = token;
    if (dom) dom.playBtn.innerHTML = '<i class="ti ti-player-stop"></i> Stop';

    (async function loop() {
        do {
            const origin = ctx.currentTime + 0.08;
            const perfOrigin = performance.now() + 80;
            for (const cue of schedule) {
                const prov = map[cue.id] || {};
                const dev = deviceById(prov.instrument) || currentDevice();
                scheduleVoice(ctx, origin + cue.atMs / 1000, dev.voice, { xNorm: cue.xNorm, yNorm: cue.yNorm, durationMs: cue.durationMs });
                schedulelessPulse(cue, prov, perfOrigin, token);
            }
            if (state.metronomeOn) {
                const stepS = gridStepMs(state.bpm, 1) / 1000;
                const ticks = Math.ceil(total / 1000 / stepS);
                for (let i = 0; i < ticks; i += 1) scheduleVoice(ctx, origin + i * stepS, clickVoice(i % state.beatsPerBar === 0), { gain: 0.5 });
            }
            animatePlayhead(perfOrigin, total, token);
            await sleep(total + 80);
        } while (state.loopPlayback && playToken === token);
        if (playToken === token) stop();
    })();
}
function schedulelessPulse(cue, prov, perfOrigin, token) {
    const at = perfOrigin + cue.atMs - performance.now();
    setTimeout(() => {
        if (playToken !== token || !dom) return;
        pulse(`[data-cell="${prov.cellId}"]`);
        pulse(`[data-ref="${prov.refId}"]`);
    }, Math.max(0, at));
}
function pulse(sel) {
    const elx = dom.host.querySelector(sel);
    if (!elx) return;
    elx.classList.remove('pulse');
    void elx.offsetWidth;
    elx.classList.add('pulse');
}
function animatePlayhead(perfOrigin, total, token) {
    // Re-query each frame so the playhead survives re-renders (e.g. editing a
    // cell mid-playback rebuilds the lanes).
    (function raf() {
        if (!dom) return;
        const heads = dom.host.querySelectorAll('.bp-lane-body .ph');
        if (playToken !== token) { heads.forEach((h) => h.classList.remove('on')); return; }
        const t = performance.now() - perfOrigin;
        const pct = Math.max(0, Math.min(1, t / total));
        heads.forEach((h) => { h.classList.add('on'); h.style.left = (pct * 100) + '%'; });
        if (t < total) requestAnimationFrame(raf);
    })();
}
function stop() {
    playToken = null;
    state.playing = false;
    if (dom) {
        dom.playBtn.innerHTML = '<i class="ti ti-player-play"></i> Play';
        dom.host.querySelectorAll('.bp-lane-body .ph').forEach((h) => { h.classList.remove('on'); h.style.left = '0%'; });
    }
}

// ── save → the shared tap-profile envelope (+ band layer) ─────────────────────
function saveProfile() {
    const song = (opts.song && opts.song()) || {};
    const slug = slugifyInstrument(song.slug || song.title || state.composition.name || 'band-jam') || 'band-jam';
    const profile = buildBandProfile({
        id: slug,
        name: `${currentDevice().name} jam — ${Object.keys(state.composition.cells).length} cells`,
        song: { slug, title: song.title || 'Band-party jam', artist: song.artist || '', youtubeId: song.youtubeId || '', durationSec: song.durationSec || 0 },
        instrument: currentDevice(),
        composition: state.composition,
        source: 'band-party',
        createdAt: new Date().toISOString().slice(0, 10)
    });
    if (typeof opts.onProfile === 'function') opts.onProfile(profile);
    toast(`Saved “${profile.name}” to the library`, true);
}

// ── visuals ───────────────────────────────────────────────────────────────────
function rippleAt(xNorm, yNorm) {
    if (!dom) return;
    const r = document.createElement('div');
    r.className = 'bp-pad-ripple';
    r.style.left = (xNorm * 100) + '%';
    r.style.top = (yNorm * 100) + '%';
    dom.pad.appendChild(r);
    requestAnimationFrame(() => { r.style.transition = 'transform .4s, opacity .4s'; r.style.transform = 'translate(-50%,-50%) scale(2.4)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 400);
}

// ── render ─────────────────────────────────────────────────────────────────────
function sparkline(cell) {
    const len = cell.lengthMs || cell.events.reduce((m, e) => Math.max(m, e.tMs), 1) || 1;
    return cell.events.map((e) => `<i style="left:${Math.min(98, (e.tMs / len) * 100)}%"></i>`).join('');
}

function renderDevices() {
    dom.devSelect.innerHTML = state.devices
        .map((d) => `<option value="${esc(d.id)}"${d.id === state.instrumentId ? ' selected' : ''}>${esc(d.name)}</option>`)
        .join('');
    if (dom.padDev) dom.padDev.textContent = currentDevice().name;
}

function renderBeatDots() {
    dom.beatdots.innerHTML = Array.from({ length: state.beatsPerBar }, () => '<span class="d"></span>').join('');
}

function renderShelf() {
    const ids = Object.keys(state.composition.cells);
    if (!ids.length) { dom.shelf.innerHTML = '<div class="bp-empty">No cells yet — hit <b>Record</b> and tap a phrase, or stamp a <b>Ghost bar</b>.</div>'; return; }
    dom.shelf.innerHTML = ids.map((id) => {
        const c = state.composition.cells[id];
        const placed = countPlacements(id);
        const isGroup = !!(c.refs && c.refs.length);
        const meta = isGroup
            ? `▦ group · ${c.refs.length} cells · ${(c.lengthMs / 1000).toFixed(1)}s · ${placed} placed`
            : `${c.events.length} beats · ${(c.lengthMs / 1000).toFixed(1)}s · ${placed} placed`;
        const editActs = isGroup ? '' : `
                <button data-act="quantize" data-id="${esc(id)}" title="Snap to the grid">Quantize</button>
                <button data-act="nudgeback" data-id="${esc(id)}" title="Nudge earlier">◀</button>
                <button data-act="nudgefwd" data-id="${esc(id)}" title="Nudge later">▶|</button>`;
        return `<div class="bp-cell${id === state.selectedCellId ? ' sel' : ''}${isGroup ? ' group' : ''}" data-cell="${esc(id)}" data-pick="${esc(id)}">
            <div class="t">${isGroup ? '▦ ' : ''}${esc(c.name)}</div>
            <div class="s">${meta}</div>
            <div class="bp-spark">${isGroup ? '' : sparkline(c)}</div>
            <div class="bp-cell-acts">
                <button data-act="preview" data-id="${esc(id)}" title="Hear it once">▶</button>
                <button class="lay" data-act="lay" data-id="${esc(id)}" title="Lay on the active track">Lay</button>
                <button class="loop" data-act="loopcell" data-id="${esc(id)}" title="New looping lane ×4">Loop×4</button>${editActs}
            </div>
        </div>`;
    }).join('');
}

function renderTracks() {
    const total = Math.max(
        barMs(state.bpm, state.beatsPerBar),
        ...state.composition.tracks.map((t) => trackContentEnd(t)),
        1
    );
    if (!state.composition.tracks.length) {
        dom.tracks.innerHTML = '<div class="bp-empty bp-hint">Lay a cell down and it becomes a track here. Each lane is one device — stack lanes to build a <b>band</b>.</div>';
    } else {
        dom.tracks.innerHTML = state.composition.tracks.map((t) => {
            const dev = deviceById(t.instrument);
            const blocks = t.refs.map((ref) => {
                const cell = state.composition.cells[ref.cellId];
                const span = (cell && cell.lengthMs ? cell.lengthMs : 0) * (ref.repeat || 1);
                const left = (ref.atMs / total) * 100;
                const width = Math.max(3, (span / total) * 100);
                return `<div class="bp-block" data-ref="${esc(ref.id)}" data-refid="${esc(ref.id)}" style="left:${left}%;width:${width}%" title="${esc(cell ? cell.name : ref.cellId)} ×${ref.repeat}">
                    <span class="x" data-act="delref" data-ref="${esc(ref.id)}">✕</span>
                    <span>${esc(cell ? cell.name : '?')}</span>
                    <span class="rep" data-act="rep" data-ref="${esc(ref.id)}">×${ref.repeat}</span>
                </div>`;
            }).join('');
            return `<div class="bp-lane">
                <div class="bp-lane-head${t.muted ? ' muted' : ''}" data-act="mute" data-track="${esc(t.id)}" title="Mute / unmute">
                    <span class="n">${esc(t.name)}</span><span class="i">${esc(dev ? dev.name : t.instrument || '—')}</span>
                    ${t.refs.length ? `<button class="bp-lane-group" data-act="group" data-track="${esc(t.id)}" title="Group this lane into one reusable cell">▦ group</button>` : ''}
                </div>
                <div class="bp-lane-body" data-track="${esc(t.id)}">${blocks}<div class="ph"></div></div>
            </div>`;
        }).join('');
    }
}

function render() {
    if (!dom) return;
    renderDevices();
    renderShelf();
    renderTracks();
    dom.bpmInput.value = state.bpm;
    dom.recBtn.classList.toggle('on', state.recording);
    dom.recBtn.innerHTML = state.recording ? '<i class="ti ti-player-stop-filled"></i> Stop' : '<i class="ti ti-circle-filled"></i> Record my beats';
    dom.loopBtn.classList.toggle('on', state.loopPlayback);
    dom.pad.classList.toggle('armed', state.recording);
}

// ── skeleton + wiring ──────────────────────────────────────────────────────────
const SKELETON = `
<div class="bp-wrap">
    <h2><i class="ti ti-wand"></i> Band-Party Composer <span class="bp-tag">BEAT BUILDER</span></h2>
    <div class="bp-toolbar">
        <label class="bp-field"><i class="ti ti-device-speaker"></i>
            <select id="bp-dev"></select>
        </label>
        <button class="btn ghost" id="bp-newdev" title="Name your own beat-making device"><i class="ti ti-plus"></i> New device</button>
        <span class="bp-sep"></span>
        <label class="bp-field">BPM
            <span class="bp-bpm-steppers"><button id="bp-bpm-dn">−</button></span>
            <input id="bp-bpm" type="number" min="40" max="260" step="1" value="120">
            <span class="bp-bpm-steppers"><button id="bp-bpm-up">+</button></span>
        </label>
        <span class="bp-beatdots" id="bp-dots"></span>
        <button class="btn ghost bp-toggle" id="bp-metro" title="Metronome (M)"><i class="ti ti-metronome"></i> Metronome</button>
        <span class="bp-sep"></span>
        <button class="btn pink bp-rec" id="bp-rec"><i class="ti ti-circle-filled"></i> Record my beats</button>
        <button class="btn primary" id="bp-play"><i class="ti ti-player-play"></i> Play</button>
        <button class="btn ghost bp-toggle on" id="bp-loop" title="Lay it down once or over and over"><i class="ti ti-repeat"></i> Loop</button>
        <button class="btn ghost" id="bp-save" title="Save composition to the library"><i class="ti ti-device-floppy"></i> Save</button>
    </div>

    <div class="bp-pad" id="bp-pad">
        <div class="bp-pad-hint"><span class="bp-pad-dev" id="bp-pad-dev">Kick</span><br>tap here — left/right &amp; up/down bend the pitch · <b>R</b> rec · <b>P</b> play · <b>M</b> metro</div>
    </div>

    <div>
        <div class="bp-section-label">Ghosts — anticipate the tempo, no tapping required</div>
        <div class="bp-toolbar" style="margin-top:6px">
            <button class="btn ghost" id="bp-ghost-bar"><i class="ti ti-ghost"></i> Stamp ghost bar</button>
            <button class="btn ghost" id="bp-ghost-beat"><i class="ti ti-plus"></i> +1 ghost beat</button>
            <button class="btn ghost" id="bp-ghost-extend"><i class="ti ti-arrow-bar-to-right"></i> + ghost bar to selected</button>
            <span class="bp-hint">stamps land on the grid — then <b>Quantize</b>/<b>Nudge</b> a cell and every copy follows</span>
        </div>
    </div>

    <div>
        <div class="bp-section-label">Cells — encapsulated snapshots (edit once, every placement updates)</div>
        <div class="bp-shelf" id="bp-shelf" style="margin-top:6px"></div>
    </div>

    <div>
        <div class="bp-section-label">Arrangement — lay cells on lanes by reference; stack lanes = a band</div>
        <div class="bp-tracks" id="bp-tracks" style="margin-top:6px"></div>
        <button class="bp-addtrack" id="bp-addtrack"><i class="ti ti-plus"></i> Add lane</button>
    </div>
</div>`;

export function mountBandParty(host, options = {}) {
    if (!host) return null;
    opts = options || {};
    host.innerHTML = SKELETON;
    dom = {
        host,
        devSelect: host.querySelector('#bp-dev'),
        newDev: host.querySelector('#bp-newdev'),
        bpmInput: host.querySelector('#bp-bpm'),
        bpmUp: host.querySelector('#bp-bpm-up'),
        bpmDn: host.querySelector('#bp-bpm-dn'),
        beatdots: host.querySelector('#bp-dots'),
        metroBtn: host.querySelector('#bp-metro'),
        recBtn: host.querySelector('#bp-rec'),
        playBtn: host.querySelector('#bp-play'),
        loopBtn: host.querySelector('#bp-loop'),
        saveBtn: host.querySelector('#bp-save'),
        pad: host.querySelector('#bp-pad'),
        padDev: host.querySelector('#bp-pad-dev'),
        shelf: host.querySelector('#bp-shelf'),
        tracks: host.querySelector('#bp-tracks')
    };

    renderBeatDots();
    render();

    // device
    dom.devSelect.addEventListener('change', () => { state.instrumentId = dom.devSelect.value; if (dom.padDev) dom.padDev.textContent = currentDevice().name; });
    dom.newDev.addEventListener('click', () => {
        const name = prompt('Name your beat-making device (e.g. "Throat Click", "Desk Thump"):');
        if (!name) return;
        const wave = (prompt('Tone? sine / square / triangle / sawtooth / noise', 'triangle') || 'triangle').trim();
        const dev = normalizeInstrument({ name, voice: { wave, baseHz: 320, pitchFromXY: true }, custom: true });
        if (!state.devices.some((d) => d.id === dev.id)) state.devices.push(dev);
        state.instrumentId = dev.id;
        renderDevices();
        playNow(dev.voice, { xNorm: 0.5, yNorm: 0.4 });
        toast(`Added device “${dev.name}”`, true);
    });

    // tempo
    const setBpm = (v) => { state.bpm = Math.max(40, Math.min(260, v | 0 || 120)); state.composition.bpm = state.bpm; dom.bpmInput.value = state.bpm; };
    dom.bpmInput.addEventListener('change', () => setBpm(Number(dom.bpmInput.value)));
    dom.bpmUp.addEventListener('click', () => setBpm(state.bpm + 1));
    dom.bpmDn.addEventListener('click', () => setBpm(state.bpm - 1));

    // transport
    dom.metroBtn.addEventListener('click', () => toggleMetronome());
    dom.recBtn.addEventListener('click', () => (state.recording ? stopRecording() : startRecording()));
    dom.playBtn.addEventListener('click', () => (state.playing ? stop() : play()));
    dom.loopBtn.addEventListener('click', () => { state.loopPlayback = !state.loopPlayback; dom.loopBtn.classList.toggle('on', state.loopPlayback); toast(state.loopPlayback ? 'Loop on — lays down over and over' : 'Loop off — plays once'); });
    dom.saveBtn.addEventListener('click', saveProfile);

    // ghosts
    host.querySelector('#bp-ghost-bar').addEventListener('click', ghostNewBar);
    host.querySelector('#bp-ghost-beat').addEventListener('click', () => ghostAppend(1));
    host.querySelector('#bp-ghost-extend').addEventListener('click', () => ghostAppend(state.beatsPerBar));
    host.querySelector('#bp-addtrack').addEventListener('click', () => { const dev = currentDevice(); state.composition.tracks.push({ id: uid('track'), name: dev.name, instrument: dev.id, muted: false, refs: [] }); state.activeTrackId = state.composition.tracks[state.composition.tracks.length - 1].id; render(); });

    // pad tapping
    const padXY = (e) => {
        const r = dom.pad.getBoundingClientRect();
        const cx = (e.clientX ?? e.touches?.[0]?.clientX ?? r.left + r.width / 2) - r.left;
        const cy = (e.clientY ?? e.touches?.[0]?.clientY ?? r.top + r.height / 2) - r.top;
        return { x: Math.max(0, Math.min(1, cx / r.width)), y: Math.max(0, Math.min(1, cy / r.height)) };
    };
    dom.pad.addEventListener('pointerdown', (e) => { e.preventDefault(); const { x, y } = padXY(e); padTap(x, y); });

    // delegated shelf + track actions
    host.addEventListener('click', (e) => {
        const pick = e.target.closest('[data-pick]');
        const actEl = e.target.closest('[data-act]');
        if (actEl) {
            e.stopPropagation();
            const act = actEl.dataset.act;
            const id = actEl.dataset.id;
            const refId = actEl.dataset.ref;
            const trackId = actEl.dataset.track;
            if (act === 'preview' && id) {
                const cell = state.composition.cells[id];
                if (cell) {  // compile this cell (leaf OR group) and play it once
                    const tmp = { bpm: state.bpm, beatsPerBar: state.beatsPerBar, cells: state.composition.cells, tracks: [{ id: 't', instrument: state.instrumentId, refs: [{ id: 'r', cellId: id, atMs: 0, repeat: 1 }] }] };
                    createPlaybackSchedule(compileComposition(tmp, {}).pattern).forEach((cue) => setTimeout(() => playNow(currentDevice().voice, { xNorm: cue.xNorm, yNorm: cue.yNorm }), cue.atMs));
                }
                return;
            }
            if (act === 'lay' && id) { state.selectedCellId = id; layCellOnTrack(id, {}); render(); toast('Laid on the active lane', true); return; }
            if (act === 'loopcell' && id) { state.selectedCellId = id; layCellOnTrack(id, { newTrack: true, repeat: 4, atZero: true }); render(); toast('New looping lane ×4', true); return; }
            if (act === 'quantize' && id) { state.selectedCellId = id; editSelectedCell((c) => quantizeCellEvents(c, { bpm: state.bpm, subdivision: 4 }), 'Quantized'); return; }
            if (act === 'nudgeback' && id) { state.selectedCellId = id; editSelectedCell((c) => nudgeCellEvents(c, -20), 'Nudged −20ms'); return; }
            if (act === 'nudgefwd' && id) { state.selectedCellId = id; editSelectedCell((c) => nudgeCellEvents(c, 20), 'Nudged +20ms'); return; }
            if (act === 'rep' && refId) { adjustRepeat(refId, e.shiftKey ? -1 : 1); return; }
            if (act === 'delref' && refId) { removeRef(refId); return; }
            if (act === 'mute' && trackId) { const t = state.composition.tracks.find((x) => x.id === trackId); if (t) { t.muted = !t.muted; render(); } return; }
            if (act === 'group' && trackId) { groupLane(trackId); return; }
        }
        if (pick) { state.selectedCellId = pick.dataset.pick; render(); }
    });

    // keyboard: Space = tap, M = metronome, R = record, P = play
    // Keyboard: M metronome · R record · P play. Space is intentionally left to
    // the YouTube tap-along below, so band-party doesn't clobber it.
    window.addEventListener('keydown', (e) => {
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
        if (e.key === 'm' || e.key === 'M') toggleMetronome();
        else if (e.key === 'r' || e.key === 'R') (state.recording ? stopRecording() : startRecording());
        else if (e.key === 'p' || e.key === 'P') (state.playing ? stop() : play());
    });

    window.bandPartyDebug = { state: () => state, compile: () => compileComposition(state.composition), play, stop };
    return { state, play, stop, getComposition: () => state.composition };
}

function adjustRepeat(refId, delta) {
    for (const t of state.composition.tracks) {
        const ref = t.refs.find((r) => r.id === refId);
        if (ref) { ref.repeat = Math.max(1, (ref.repeat || 1) + delta); render(); return; }
    }
}
function removeRef(refId) {
    for (const t of state.composition.tracks) {
        const i = t.refs.findIndex((r) => r.id === refId);
        if (i >= 0) { t.refs.splice(i, 1); render(); return; }
    }
}
