// band-party.js — the encapsulated cell-graph composition engine (codename
// "band-party"). Where pattern.js compiles a flat list of taps into one pattern,
// this module models music as a DAG of REUSABLE CELLS:
//
//   • A CELL is an encapsulated mini-pattern with a stable id (a snapshot of
//     what you tapped). It owns its own events in cell-local time, and may
//     itself reference other cells.
//   • A REF places a cell on a timeline BY REFERENCE — not a copy. `repeat`
//     tiles the cell back-to-back. Lay the same cell down five times and you
//     have five references to ONE source.
//   • Edit the cell once (quantize a beat that was "off by a little", nudge it)
//     and EVERY placement changes, because they all point at the same source.
//     No "chicken copy on the board."
//   • Cells referencing cells form a DAG (structure-shared, cycle-guarded).
//
// compileComposition flattens that DAG down to the existing rhythm-engine
// `pattern` shape, so every downstream consumer (playback, profile, DAG/scene
// projection, dance-party) keeps reading the same flat currency it always has.
// The graph is the editable SOURCE; the flat pattern is the compiled OUTPUT —
// which is the thing a linear MIDI piano-roll cannot give you.
//
// Pure data + pure functions. No DOM, no audio, no clock — browser and Node
// both import it. The page owns the Web Audio voices and the wall clock.

import { clamp01, roundNumber } from './events.js';
import { compilePattern } from './pattern.js';
import { buildProfile } from './profile.js';

export const BAND_PARTY_VERSION = 'rhythm-engine.band-party.v1';
export const COMPOSITION_VERSION = 1;

const r3 = (v) => roundNumber(v, 3);
const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);

// ── metronome grid ───────────────────────────────────────────────────────────
// The grid every cell snaps to and loops against. `subdivision` is steps per
// beat (1 = quarter, 2 = eighth, 4 = sixteenth).

export function barMs(bpm, beatsPerBar = 4) {
    if (!Number.isFinite(bpm) || bpm <= 0) return 0;
    return r3((60000 / bpm) * Math.max(1, beatsPerBar));
}

export function gridStepMs(bpm, subdivision = 4) {
    if (!Number.isFinite(bpm) || bpm <= 0) return 0;
    return r3((60000 / bpm) / Math.max(1, subdivision));
}

export function metronomeGrid({ bpm, beatsPerBar = 4, bars = 1, subdivision = 1 } = {}) {
    const sub = Math.max(1, subdivision | 0 || 1);
    const meter = Math.max(1, beatsPerBar | 0 || 4);
    const barCount = Math.max(1, bars | 0 || 1);
    const stepMs = gridStepMs(bpm, sub);
    const totalSteps = meter * barCount * sub;
    const clicks = [];
    for (let i = 0; i < totalSteps; i += 1) {
        const stepsPerBar = meter * sub;
        const accent = i % stepsPerBar === 0 ? 'downbeat' : (i % sub === 0 ? 'beat' : 'sub');
        clicks.push({ index: i, atMs: r3(i * stepMs), accent });
    }
    return {
        bpm: num(bpm, null),
        beatsPerBar: meter,
        bars: barCount,
        subdivision: sub,
        stepMs,
        barMs: barMs(bpm, meter),
        durationMs: r3(totalSteps * stepMs),
        clicks
    };
}

// Snap a single time to the metronome grid. `strength` 0..1 blends raw→snapped
// so you can quantize gently instead of slamming everything onto the grid.
export function quantizeTime(tMs, { bpm, subdivision = 4, strength = 1 } = {}) {
    const step = gridStepMs(bpm, subdivision);
    if (!step) return r3(tMs);
    const snapped = Math.round(tMs / step) * step;
    return r3(tMs + (snapped - tMs) * clamp01(strength));
}

// ── cells & events ───────────────────────────────────────────────────────────
// A cell event is the minimal source shape; note/freq are derived downstream by
// compilePattern, so cells stay lean and re-pitchable.

function cloneEvent(e, index = 0) {
    return {
        id: str(e.id) || `ce-${index + 1}`,
        tMs: Math.max(0, r3(num(e.tMs))),
        xNorm: clamp01(num(e.xNorm, 0.5)),
        yNorm: clamp01(num(e.yNorm, 0.5)),
        durationMs: Math.max(0, r3(num(e.durationMs))),
        isDrag: e.isDrag === true
    };
}

export function makeCell({ id, name, events = [], refs = [], lengthMs, source } = {}) {
    const cellId = str(id) || `cell-${Math.abs(hashStr(JSON.stringify(events) + (name || ''))).toString(36)}`;
    return {
        id: cellId,
        name: str(name) || cellId,
        events: events.map((e, i) => cloneEvent(e, i)),
        refs: refs.map((ref, i) => normalizeRef(ref, i)),
        lengthMs: Number.isFinite(lengthMs) && lengthMs > 0 ? r3(lengthMs) : null,
        source: str(source, 'snapshot')
    };
}

// Take a snapshot of what was just tapped → an encapsulated, editable cell.
// `events` are anchored so the earliest lands at 0. lengthMs defaults to the
// content end, snapped up to a whole bar when bpm is known (so repeats tile
// on the grid instead of drifting).
export function snapshotCell({ name, events = [], bpm, beatsPerBar = 4, lengthMs, id, source = 'snapshot' } = {}) {
    const cloned = events.map((e, i) => cloneEvent(e, i));
    const t0 = cloned.length ? Math.min(...cloned.map((e) => e.tMs)) : 0;
    const anchored = cloned
        .map((e) => ({ ...e, tMs: r3(e.tMs - t0) }))
        .sort((a, b) => a.tMs - b.tMs || a.id.localeCompare(b.id));
    let len = Number.isFinite(lengthMs) && lengthMs > 0 ? lengthMs : null;
    if (!len) {
        const contentEnd = anchored.reduce((m, e) => Math.max(m, e.tMs + e.durationMs), 0);
        const bar = barMs(bpm, beatsPerBar);
        len = bar > 0 ? Math.max(bar, Math.ceil(contentEnd / bar || 1) * bar) : contentEnd;
    }
    return makeCell({ id, name, events: anchored, lengthMs: len, source });
}

function normalizeRef(ref = {}, index = 0) {
    return {
        id: str(ref.id) || `ref-${index + 1}`,
        cellId: str(ref.cellId),
        atMs: Math.max(0, r3(num(ref.atMs))),
        repeat: Math.max(1, num(ref.repeat, 1) | 0 || 1),
        gain: Number.isFinite(ref.gain) ? clamp01(ref.gain) : null,
        instrument: str(ref.instrument) || null
    };
}

function normalizeTrack(track = {}, index = 0) {
    return {
        id: str(track.id) || `track-${index + 1}`,
        name: str(track.name) || `Track ${index + 1}`,
        instrument: str(track.instrument) || null,
        muted: track.muted === true,
        refs: (track.refs || []).map((ref, i) => normalizeRef(ref, i))
    };
}

export function emptyComposition({ id, name, bpm = 120, beatsPerBar = 4, instrument } = {}) {
    return {
        version: COMPOSITION_VERSION,
        id: str(id) || 'composition',
        name: str(name) || 'Untitled composition',
        bpm: num(bpm, 120),
        beatsPerBar: Math.max(1, beatsPerBar | 0 || 4),
        instrument: str(instrument) || null,
        cells: {},
        tracks: []
    };
}

export function normalizeComposition(comp = {}) {
    const base = emptyComposition({
        id: comp.id,
        name: comp.name,
        bpm: comp.bpm,
        beatsPerBar: comp.beatsPerBar,
        instrument: comp.instrument
    });
    const cells = {};
    const rawCells = comp.cells || {};
    for (const key of Object.keys(rawCells)) {
        const c = makeCell(rawCells[key]);
        cells[c.id] = c;
    }
    return {
        ...base,
        cells,
        tracks: (comp.tracks || []).map((t, i) => normalizeTrack(t, i))
    };
}

// ── compile: flatten the cell DAG into the flat rhythm-engine pattern ─────────

function getCell(comp, cellId) {
    const cell = comp.cells[cellId];
    if (!cell) throw new Error(`band-party: unknown cell "${cellId}"`);
    return cell;
}

function contentEndOfEvents(events) {
    return (events || []).reduce((m, e) => Math.max(m, (e.tMs || 0) + (e.durationMs || 0)), 0);
}

// A cell's tile span: explicit lengthMs wins, else the full occupied duration —
// own leaf content AND the tiled reach of every nested ref (atMs + repeat*span),
// so back-to-back repeats lay flush instead of overlapping. Cycle-guarded.
function cellSpan(comp, cellId, seen = []) {
    if (seen.includes(cellId)) {
        throw new Error(`band-party: cell cycle ${[...seen, cellId].join(' -> ')}`);
    }
    const cell = getCell(comp, cellId);
    if (Number.isFinite(cell.lengthMs) && cell.lengthMs > 0) return cell.lengthMs;
    const chain = [...seen, cellId];
    let span = contentEndOfEvents(cell.events);
    for (const ref of cell.refs) {
        span = Math.max(span, ref.atMs + ref.repeat * cellSpan(comp, ref.cellId, chain));
    }
    return r3(span);
}

// Recursively expand a cell into placed events in cell-LOCAL time (0-origin),
// carrying provenance (which cell/ref/instance each event came from) so the UI
// can light up every instance when its source cell fires. `seen` is the active
// ancestor chain — re-entering it means a cycle, which a DAG forbids.
function expandCell(comp, cellId, seen) {
    if (seen.includes(cellId)) {
        throw new Error(`band-party: cell cycle ${[...seen, cellId].join(' -> ')}`);
    }
    const cell = getCell(comp, cellId);
    const chain = [...seen, cellId];
    const out = [];

    for (const e of cell.events) {
        out.push({ ev: { ...e }, prov: { cellId, cellEventId: e.id, refPath: [] } });
    }

    for (const ref of cell.refs) {
        const child = expandCell(comp, ref.cellId, chain);
        const childLen = cellSpan(comp, ref.cellId, chain);
        for (let rep = 0; rep < ref.repeat; rep += 1) {
            const offset = ref.atMs + rep * childLen;
            for (const placed of child) {
                out.push({
                    ev: { ...placed.ev, tMs: r3(placed.ev.tMs + offset) },
                    prov: {
                        cellId: placed.prov.cellId,
                        cellEventId: placed.prov.cellEventId,
                        refPath: [ref.id, ...placed.prov.refPath],
                        repeatIndex: rep
                    }
                });
            }
        }
    }
    return out;
}

// Flatten the composition DAG into a single flat `pattern` (the shared currency)
// plus a `map` from compiled event id → provenance, plus the normalized comp.
export function compileComposition(comp, options = {}) {
    const c = normalizeComposition(comp);
    const placed = [];
    let uid = 0;

    for (const track of c.tracks) {
        if (track.muted) continue;
        for (const ref of track.refs) {
            const child = expandCell(c, ref.cellId, []);
            const childLen = cellSpan(c, ref.cellId, []);
            for (let rep = 0; rep < ref.repeat; rep += 1) {
                const offset = ref.atMs + rep * childLen;
                for (const p of child) {
                    const id = `e${uid}`;
                    uid += 1;
                    placed.push({
                        id,
                        ev: {
                            id,
                            tMs: Math.max(0, r3(p.ev.tMs + offset)),
                            xNorm: p.ev.xNorm,
                            yNorm: p.ev.yNorm,
                            durationMs: p.ev.durationMs || 0,
                            isDrag: !!p.ev.isDrag,
                            source: options.source || 'band-party'
                        },
                        prov: {
                            trackId: track.id,
                            refId: ref.id,
                            instrument: ref.instrument || track.instrument || c.instrument || null,
                            cellId: p.prov.cellId,
                            cellEventId: p.prov.cellEventId,
                            refPath: [ref.id, ...p.prov.refPath],
                            repeatIndex: rep
                        }
                    });
                }
            }
        }
    }

    const pattern = compilePattern(
        placed.map((p) => p.ev),
        { loopable: options.loopable !== false, source: options.source || 'band-party' }
    );
    // The composition knows its own tempo; don't let an off-grid take re-derive it.
    if (Number.isFinite(c.bpm) && c.bpm > 0) pattern.bpm = c.bpm;

    const map = {};
    for (const p of placed) map[p.id] = p.prov;

    return { pattern, map, composition: c };
}

// ── on-the-fly edits (mutate the SOURCE cell → every placement follows) ───────

export function quantizeCellEvents(cell, { bpm, subdivision = 4, strength = 1 } = {}) {
    return {
        ...cell,
        events: (cell.events || []).map((e) => ({
            ...e,
            tMs: quantizeTime(e.tMs, { bpm, subdivision, strength })
        }))
    };
}

export function nudgeCellEvents(cell, deltaMs) {
    const d = num(deltaMs);
    return {
        ...cell,
        events: (cell.events || []).map((e) => ({ ...e, tMs: Math.max(0, r3(e.tMs + d)) }))
    };
}

export function nudgeCellEvent(cell, eventId, deltaMs) {
    const d = num(deltaMs);
    return {
        ...cell,
        events: (cell.events || []).map((e) => (e.id === eventId ? { ...e, tMs: Math.max(0, r3(e.tMs + d)) } : e))
    };
}

// Pure helpers for editing the graph; the page can also mutate the plain object.
export function upsertCell(comp, cell) {
    const c = normalizeComposition(comp);
    const normalized = makeCell(cell);
    return { ...c, cells: { ...c.cells, [normalized.id]: normalized } };
}

export function placeRef(comp, trackId, ref) {
    const c = normalizeComposition(comp);
    const tracks = c.tracks.map((t) =>
        t.id === trackId ? { ...t, refs: [...t.refs, normalizeRef(ref, t.refs.length)] } : t
    );
    return { ...c, tracks };
}

// ── ghosts: anticipate the next beats ────────────────────────────────────────
// With a known tempo the next beats are the next grid points after `fromMs`.
// With no tempo, extrapolate from a compiled pattern's average interval.

export function predictNextBeats(source = {}, { count = 4, fromMs = 0, bpm, beatsPerBar = 4 } = {}) {
    const tempo = Number.isFinite(bpm) ? bpm : num(source && source.bpm, null);
    const meter = Math.max(1, beatsPerBar | 0 || 4);

    if (Number.isFinite(tempo) && tempo > 0) {
        const step = 60000 / tempo;
        const firstIdx = Math.floor(fromMs / step + 1e-6) + 1;
        return Array.from({ length: Math.max(0, count) }, (_, i) => {
            const idx = firstIdx + i;
            return {
                atMs: r3(idx * step),
                beatIndex: idx,
                accent: idx % meter === 0 ? 'downbeat' : 'beat',
                confidence: 1,
                source: 'ghost'
            };
        });
    }

    const events = (source && source.events) || [];
    if (events.length < 2) return [];
    const intervals = (source.intervalsMs && source.intervalsMs.length)
        ? source.intervalsMs
        : events.slice(1).map((e, i) => e.tMs - events[i].tMs);
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (!Number.isFinite(avg) || avg <= 0) return [];
    const last = events[events.length - 1].tMs;
    return Array.from({ length: Math.max(0, count) }, (_, i) => ({
        atMs: r3(last + (i + 1) * avg),
        confidence: 0.5,
        source: 'ghost'
    }));
}

// ── instruments ("beat-making devices") ──────────────────────────────────────
// A voice is a portable timbre descriptor; the page turns it into Web Audio.

export const INSTRUMENT_PRESETS = Object.freeze([
    { id: 'click', name: 'Metronome Click', voice: { wave: 'square', attackMs: 1, releaseMs: 40, baseHz: 1000, pitchFromXY: false } },
    { id: 'kick', name: 'Kick', voice: { wave: 'sine', attackMs: 2, releaseMs: 120, baseHz: 90, pitchFromXY: false } },
    { id: 'clap', name: 'Clap', voice: { wave: 'noise', attackMs: 1, releaseMs: 90, baseHz: 1500, pitchFromXY: false } },
    { id: 'rim', name: 'Rim', voice: { wave: 'square', attackMs: 1, releaseMs: 60, baseHz: 420, pitchFromXY: false } },
    { id: 'tom', name: 'Tom', voice: { wave: 'sine', attackMs: 2, releaseMs: 160, baseHz: 160, pitchFromXY: true } },
    { id: 'stab', name: 'Synth Stab', voice: { wave: 'sawtooth', attackMs: 3, releaseMs: 220, baseHz: 220, pitchFromXY: true } },
    { id: 'vox', name: 'Vocal Chop', voice: { wave: 'triangle', attackMs: 8, releaseMs: 260, baseHz: 330, pitchFromXY: true } }
]);

const DEFAULT_VOICE = { wave: 'sine', attackMs: 4, releaseMs: 160, baseHz: 440, pitchFromXY: true };
const VALID_WAVES = new Set(['sine', 'square', 'triangle', 'sawtooth', 'noise']);

export function slugifyInstrument(name) {
    return str(name)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40);
}

export function normalizeInstrument(raw = {}) {
    const voice = raw.voice && typeof raw.voice === 'object' ? raw.voice : {};
    const name = str(raw.name) || 'My Device';
    return {
        id: slugifyInstrument(raw.id || raw.name) || `device-${Math.abs(hashStr(name)).toString(36)}`,
        name,
        voice: {
            wave: VALID_WAVES.has(voice.wave) ? voice.wave : DEFAULT_VOICE.wave,
            attackMs: Math.max(0, num(voice.attackMs, DEFAULT_VOICE.attackMs)),
            releaseMs: Math.max(1, num(voice.releaseMs, DEFAULT_VOICE.releaseMs)),
            baseHz: Math.max(20, num(voice.baseHz, DEFAULT_VOICE.baseHz)),
            pitchFromXY: voice.pitchFromXY !== false
        },
        custom: raw.custom === true || !INSTRUMENT_PRESETS.some((p) => p.id === slugifyInstrument(raw.id || raw.name))
    };
}

export function getInstrument(id) {
    const preset = INSTRUMENT_PRESETS.find((p) => p.id === id);
    return preset ? normalizeInstrument(preset) : null;
}

// ── recording-session reducer (the page owns the clock; this owns the rules) ──
// Pure reducer so "record my beats → stop → lay it down" is testable. The page
// supplies tMs (perf clock or YouTube clock). On STOP it hands back the events
// ready to become a snapshot cell.

export const SESSION_PHASES = Object.freeze(['idle', 'armed', 'recording', 'stopped']);

export function emptySession() {
    return { phase: 'idle', events: [], startedAtMs: null };
}

export function bandSessionReducer(state = emptySession(), action = {}) {
    switch (action.type) {
        case 'ARM':
            return { phase: 'armed', events: [], startedAtMs: null };
        case 'TAP': {
            if (state.phase !== 'armed' && state.phase !== 'recording') return state;
            const startedAtMs = state.phase === 'armed' ? num(action.tMs) : state.startedAtMs;
            const tMs = Math.max(0, r3(num(action.tMs) - startedAtMs));
            const ev = cloneEvent(
                {
                    id: action.id || `s-${state.events.length + 1}`,
                    tMs,
                    xNorm: action.xNorm,
                    yNorm: action.yNorm,
                    durationMs: action.durationMs,
                    isDrag: action.isDrag
                },
                state.events.length
            );
            return { phase: 'recording', startedAtMs, events: [...state.events, ev] };
        }
        case 'STOP':
            return { ...state, phase: state.phase === 'recording' ? 'stopped' : 'idle' };
        case 'CLEAR':
            return emptySession();
        default:
            return state;
    }
}

// ── profile glue ──────────────────────────────────────────────────────────────
// Wrap the canonical tap-profile envelope (DAG + dance-party read `.pattern`,
// `.song`, `.summary` untouched) and ADD the band-party composition + device,
// so the captured structure is available for modeling later.

export function buildBandProfile(input = {}) {
    const { pattern, composition } = compileComposition(input.composition || emptyComposition(), {
        source: input.source || 'band-party'
    });
    const base = buildProfile({
        id: input.id,
        name: input.name,
        song: input.song,
        pattern,
        source: input.source || 'band-party',
        createdAt: input.createdAt
    });
    return {
        ...base,
        bandVersion: BAND_PARTY_VERSION,
        compositionVersion: COMPOSITION_VERSION,
        instrument: input.instrument ? normalizeInstrument(input.instrument) : null,
        composition
    };
}

// tiny stable string hash (deterministic; for fallback ids only)
function hashStr(s) {
    let h = 0;
    const text = String(s);
    for (let i = 0; i < text.length; i += 1) {
        h = (h << 5) - h + text.charCodeAt(i);
        h |= 0;
    }
    return h;
}
