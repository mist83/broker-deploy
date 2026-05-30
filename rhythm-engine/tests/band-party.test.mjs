import test from 'node:test';
import assert from 'node:assert/strict';

import {
    compileComposition,
    normalizeComposition,
    snapshotCell,
    quantizeCellEvents,
    nudgeCellEvents,
    upsertCell,
    metronomeGrid,
    gridStepMs,
    predictNextBeats,
    normalizeInstrument,
    getInstrument,
    INSTRUMENT_PRESETS,
    bandSessionReducer,
    emptySession,
    buildBandProfile,
    emptyComposition,
    BAND_PARTY_VERSION
} from '../src/index.js';

// A cell "A" with two beats, half a second apart, in a 500ms tile.
function compWithRepeatedCell(repeat) {
    return {
        bpm: 120,
        beatsPerBar: 4,
        cells: {
            A: {
                id: 'A',
                name: 'kick',
                lengthMs: 500,
                events: [
                    { id: 'a0', tMs: 0, xNorm: 0.5, yNorm: 0.5, durationMs: 0, isDrag: false },
                    { id: 'a1', tMs: 250, xNorm: 0.5, yNorm: 0.5, durationMs: 0, isDrag: false }
                ]
            }
        },
        tracks: [{ id: 't1', name: 'Track 1', instrument: 'kick', refs: [{ id: 'r1', cellId: 'A', repeat }] }]
    };
}

test('compileComposition tiles a referenced cell by repeat into one flat pattern', () => {
    const { pattern, map } = compileComposition(compWithRepeatedCell(2));
    assert.deepEqual(pattern.events.map((e) => e.tMs), [0, 250, 500, 750]);
    assert.equal(pattern.events.length, 4);
    assert.equal(pattern.bpm, 120, 'composition tempo is authoritative, not re-derived');
    // every compiled event knows the source cell it came from (for instance-pulse UI)
    for (const ev of pattern.events) assert.equal(map[ev.id].cellId, 'A');
});

test('editing the SOURCE cell propagates to every placed instance (no chicken copy)', () => {
    const comp = compWithRepeatedCell(2);
    const before = compileComposition(comp).pattern.events.map((e) => e.tMs);
    assert.deepEqual(before, [0, 250, 500, 750]);

    // nudge the one shared cell by +50ms, write it back, recompile
    const nudged = nudgeCellEvents(normalizeComposition(comp).cells.A, 50);
    const edited = upsertCell(comp, nudged);
    const after = compileComposition(edited).pattern.events.map((e) => e.tMs);

    assert.deepEqual(after, [50, 300, 550, 800], 'all four instances followed the single edit');
});

test('quantizeCellEvents snaps an off-by-a-little beat onto the grid', () => {
    const cell = {
        id: 'Q',
        events: [
            { id: 'q0', tMs: 0, xNorm: 0.5, yNorm: 0.5, durationMs: 0, isDrag: false },
            { id: 'q1', tMs: 264, xNorm: 0.5, yNorm: 0.5, durationMs: 0, isDrag: false } // wanted 250
        ]
    };
    const q = quantizeCellEvents(cell, { bpm: 120, subdivision: 2 }); // eighth = 250ms
    assert.equal(gridStepMs(120, 2), 250);
    assert.deepEqual(q.events.map((e) => e.tMs), [0, 250]);
});

test('nested cells form a DAG that flattens, and edits still propagate through nesting', () => {
    const comp = {
        bpm: 120,
        cells: {
            A: {
                id: 'A',
                lengthMs: 500,
                events: [{ id: 'a0', tMs: 0, xNorm: 0.5, yNorm: 0.5, durationMs: 0, isDrag: false }]
            },
            G: { id: 'G', refs: [{ id: 'g-r', cellId: 'A', repeat: 2 }] } // group cell: A twice → 0,500
        },
        tracks: [{ id: 't1', refs: [{ id: 'r1', cellId: 'G', repeat: 2 }] }] // G twice
    };
    const { pattern } = compileComposition(comp);
    // G expands to A@0 and A@500 (len 1000); track repeats G → 0,500,1000,1500
    assert.deepEqual(pattern.events.map((e) => e.tMs), [0, 500, 1000, 1500]);
});

test('a cell that references itself is rejected (DAG, not a cycle)', () => {
    const comp = {
        cells: { X: { id: 'X', refs: [{ id: 'self', cellId: 'X' }] } },
        tracks: [{ id: 't1', refs: [{ id: 'r1', cellId: 'X' }] }]
    };
    assert.throws(() => compileComposition(comp), /cycle/);
});

test('metronomeGrid lays down clicks with a downbeat accent', () => {
    const grid = metronomeGrid({ bpm: 120, beatsPerBar: 4, bars: 1, subdivision: 1 });
    assert.equal(grid.stepMs, 500);
    assert.equal(grid.barMs, 2000);
    assert.deepEqual(grid.clicks.map((c) => c.atMs), [0, 500, 1000, 1500]);
    assert.equal(grid.clicks[0].accent, 'downbeat');
    assert.equal(grid.clicks[1].accent, 'beat');
});

test('predictNextBeats anticipates the next grid points from a tempo', () => {
    const ghosts = predictNextBeats({}, { count: 4, fromMs: 0, bpm: 120, beatsPerBar: 4 });
    assert.deepEqual(ghosts.map((g) => g.atMs), [500, 1000, 1500, 2000]);
    assert.equal(ghosts[3].accent, 'downbeat');
    assert.ok(ghosts.every((g) => g.source === 'ghost'));
});

test('predictNextBeats falls back to interval extrapolation with no tempo', () => {
    const pattern = { events: [{ tMs: 0 }, { tMs: 500 }], intervalsMs: [500] };
    const ghosts = predictNextBeats(pattern, { count: 2 });
    assert.deepEqual(ghosts.map((g) => g.atMs), [1000, 1500]);
});

test('snapshotCell anchors to zero and snaps length up to a whole bar', () => {
    const cell = snapshotCell({
        name: 'Tap',
        bpm: 120,
        beatsPerBar: 4,
        events: [
            { tMs: 1000, xNorm: 0.5, yNorm: 0.5 },
            { tMs: 1250, xNorm: 0.5, yNorm: 0.5 }
        ]
    });
    assert.deepEqual(cell.events.map((e) => e.tMs), [0, 250]);
    assert.equal(cell.lengthMs, 2000); // one bar at 120bpm/4
});

test('normalizeInstrument accepts a custom-named device and sanitizes the voice', () => {
    const dev = normalizeInstrument({ name: 'My Cowbell', voice: { wave: 'zzz', baseHz: 700 } });
    assert.equal(dev.id, 'my-cowbell');
    assert.equal(dev.voice.wave, 'sine'); // invalid wave → default
    assert.equal(dev.voice.baseHz, 700);
    assert.equal(dev.custom, true);

    const kick = getInstrument('kick');
    assert.equal(kick.voice.baseHz, 90);
    assert.ok(INSTRUMENT_PRESETS.length >= 5);
});

test('bandSessionReducer records taps relative to the first one', () => {
    let s = emptySession();
    assert.equal(s.phase, 'idle');
    s = bandSessionReducer(s, { type: 'ARM' });
    assert.equal(s.phase, 'armed');
    s = bandSessionReducer(s, { type: 'TAP', tMs: 1000, xNorm: 0.5, yNorm: 0.5 });
    s = bandSessionReducer(s, { type: 'TAP', tMs: 1500, xNorm: 0.5, yNorm: 0.5 });
    assert.equal(s.phase, 'recording');
    assert.deepEqual(s.events.map((e) => e.tMs), [0, 500]);
    s = bandSessionReducer(s, { type: 'STOP' });
    assert.equal(s.phase, 'stopped');
});

test('buildBandProfile keeps the canonical envelope and adds the band layer', () => {
    const profile = buildBandProfile({
        name: 'My jam',
        song: { slug: 'jam', title: 'Jam', artist: 'Me' },
        instrument: { name: 'Kick Thing' },
        composition: compWithRepeatedCell(2)
    });
    assert.equal(profile.song.slug, 'jam');
    assert.ok(profile.pattern.events.length > 0, 'downstream still reads .pattern');
    assert.equal(profile.summary.beatCount, profile.pattern.beats.length);
    assert.equal(profile.bandVersion, BAND_PARTY_VERSION);
    assert.equal(profile.instrument.id, 'kick-thing');
    assert.ok(profile.composition.cells.A, 'the editable graph rides along for modeling');
});

test('an empty composition compiles to an empty pattern', () => {
    const { pattern } = compileComposition(emptyComposition());
    assert.equal(pattern.events.length, 0);
});
