import test from 'node:test';
import assert from 'node:assert/strict';

import {
    compilePattern,
    createPlaybackSchedule,
    projectPatternToDag,
    projectPatternToScene,
    serializePattern,
    parsePattern,
    gestureEventsFromTapRepeater,
    buildDagRhythmURL
} from '../src/index.js';

test('compilePattern excludes drags and long notes from BPM while preserving pitch metadata', () => {
    const pattern = compilePattern([
        { id: 'a', tMs: 0, xNorm: 0.2, yNorm: 0.8, durationMs: 0, isDrag: false, source: 'test' },
        { id: 'b', tMs: 250, xNorm: 0.3, yNorm: 0.7, durationMs: 0, isDrag: true, source: 'test' },
        { id: 'c', tMs: 500, xNorm: 0.4, yNorm: 0.6, durationMs: 360, isDrag: false, source: 'test' },
        { id: 'd', tMs: 1000, xNorm: 0.5, yNorm: 0.5, durationMs: 0, isDrag: false, source: 'test' }
    ]);

    assert.equal(pattern.beats.length, 2);
    assert.deepEqual(pattern.intervalsMs, [1000]);
    assert.equal(pattern.bpm, 60);
    assert.equal(pattern.durationMs, 1000);
    assert.equal(pattern.pitch.eventCount, 4);
    assert.ok(pattern.pitch.minHz >= 400);
    assert.ok(pattern.pitch.maxHz <= 1200);
    assert.ok(pattern.pitch.noteHistogram[pattern.events[0].note] >= 1);
});

test('createPlaybackSchedule is deterministic and starts from an offset', () => {
    const pattern = compilePattern([
        { id: 'a', tMs: 0, xNorm: 0.1, yNorm: 0.9, durationMs: 0, isDrag: false },
        { id: 'b', tMs: 500, xNorm: 0.2, yNorm: 0.8, durationMs: 0, isDrag: false },
        { id: 'c', tMs: 1000, xNorm: 0.3, yNorm: 0.7, durationMs: 300, isDrag: false }
    ]);

    const full = createPlaybackSchedule(pattern);
    const partial = createPlaybackSchedule(pattern, { startPct: 0.3 });

    assert.deepEqual(full.map(cue => cue.atMs), [0, 500, 1000]);
    assert.equal(full[0].accent, 'downbeat');
    assert.equal(partial.length, 2);
    assert.deepEqual(partial.map(cue => cue.atMs), [110, 610]);
});

test('serializePattern round-trips without semantic loss', () => {
    const pattern = compilePattern([
        { id: 'a', tMs: 0, xNorm: 0.1, yNorm: 0.2, durationMs: 0, isDrag: false },
        { id: 'b', tMs: 400, xNorm: 0.7, yNorm: 0.3, durationMs: 220, isDrag: false }
    ]);
    const serialized = serializePattern(pattern);
    const parsed = parsePattern(serialized);

    assert.deepEqual(parsed, pattern);
});

test('projectPatternToDag produces playback order and scene projection emits camera hints', () => {
    const pattern = compilePattern([
        { id: 'a', tMs: 0, xNorm: 0.1, yNorm: 0.8, durationMs: 0, isDrag: false },
        { id: 'b', tMs: 250, xNorm: 0.5, yNorm: 0.6, durationMs: 0, isDrag: false },
        { id: 'c', tMs: 500, xNorm: 0.9, yNorm: 0.2, durationMs: 180, isDrag: false }
    ]);

    const dagProjection = projectPatternToDag(pattern, { mode: 'spatial-rhythm' });
    const sceneProjection = projectPatternToScene(pattern);

    assert.equal(dagProjection.playbackOrder.length, 3);
    assert.equal(dagProjection.meta.projectionMode, 'spatial-rhythm');
    assert.ok(dagProjection.nodes.length >= 4);
    assert.ok(dagProjection.edges.length >= 3);
    assert.equal(sceneProjection.entities.length, 3);
    assert.ok(Array.isArray(sceneProjection.cameraHints.densityPeaks));
});

test('tap-repeater adapter produces normalized events and DAG URLs use rhythm payloads', () => {
    const events = gestureEventsFromTapRepeater([
        { perfOffset: 0, x: 50, y: 100, duration: 0, isDrag: false },
        { perfOffset: 600, x: 150, y: 50, duration: 200, isDrag: false }
    ], { width: 200, height: 200 });
    const pattern = compilePattern(events);
    const url = buildDagRhythmURL(pattern, { baseUrl: 'https://dag.mullmania.com/' });

    assert.equal(events[0].xNorm, 0.25);
    assert.equal(events[1].yNorm, 0.25);
    assert.match(url, /\?rhythm=/);
    assert.doesNotMatch(url, /\?dag=/);
});
