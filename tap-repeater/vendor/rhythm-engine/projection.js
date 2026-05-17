import { roundNumber } from './events.js';

function buildSummaryLabel(pattern) {
    const bpmLabel = pattern.bpm ? `${pattern.bpm} BPM` : 'Free Rhythm';
    const durationLabel = `${(pattern.durationMs / 1000).toFixed(2)}s`;
    return `${bpmLabel}  |  ${durationLabel}  |  ${pattern.events.length} events`;
}

function lineStyleForInterval(intervalMs, minIntervalMs, maxIntervalMs) {
    if (!Number.isFinite(intervalMs)) return 'solid';
    if (!Number.isFinite(minIntervalMs) || !Number.isFinite(maxIntervalMs) || minIntervalMs === maxIntervalMs) {
        return 'solid';
    }

    const normalized = (intervalMs - minIntervalMs) / (maxIntervalMs - minIntervalMs);
    if (normalized < 0.33) return 'solid';
    if (normalized < 0.66) return 'dotted';
    return 'dashed';
}

function nodeTypeForEvent(event) {
    if (event.durationMs > 0) return 'thought';
    if (event.isDrag) return 'hexagon';
    return 'circle';
}

function buildDagNodeLabel(event, index) {
    if (event.durationMs > 0) {
        return `${index + 1}\n${event.note}\n${Math.round(event.durationMs)}ms`;
    }
    return `${index + 1}\n${event.note}`;
}

export function projectPatternToDag(pattern, options = {}) {
    const mode = options.mode === 'spatial-rhythm' ? 'spatial-rhythm' : 'timing-chain';
    const canvasWidth = Number.isFinite(options.canvasWidth) ? options.canvasWidth : 1200;
    const canvasHeight = Number.isFinite(options.canvasHeight) ? options.canvasHeight : 560;
    const margin = Number.isFinite(options.margin) ? options.margin : 80;
    const usableWidth = Math.max(320, canvasWidth - margin * 2);
    const usableHeight = Math.max(240, canvasHeight - margin * 2);
    const nodes = [];
    const edges = [];
    const playbackOrder = [];
    const eventNodeMap = {};
    const edgeOrder = [];
    const intervals = pattern.events.slice(1).map((event, index) => event.tMs - pattern.events[index].tMs);
    const minIntervalMs = intervals.length ? Math.min(...intervals) : null;
    const maxIntervalMs = intervals.length ? Math.max(...intervals) : null;

    nodes.push({
        id: 'rhythm-meta',
        label: buildSummaryLabel(pattern),
        x: margin,
        y: 40,
        type: 'rectangle',
        color: '#0071CE',
        size: 'large',
        textSize: 'small',
        rhythmKind: 'meta'
    });

    pattern.events.forEach((event, index) => {
        const xNorm = pattern.durationMs > 0 ? event.tMs / pattern.durationMs : (pattern.events.length > 1 ? index / (pattern.events.length - 1) : 0.5);
        const x = mode === 'timing-chain'
            ? margin + xNorm * usableWidth
            : margin + event.xNorm * usableWidth;
        const yBase = mode === 'timing-chain'
            ? margin + event.yNorm * usableHeight
            : margin + event.yNorm * usableHeight;
        const y = mode === 'timing-chain'
            ? yBase + Math.sin(xNorm * Math.PI * 4) * 18
            : yBase;
        const nodeId = `rhythm-${event.id}`;
        const color = event.durationMs > 0
            ? '#7c3aed'
            : (event.isDrag ? '#FFC220' : '#4CAF50');

        nodes.push({
            id: nodeId,
            label: buildDagNodeLabel(event, index),
            x: Math.round(x),
            y: Math.round(Math.max(margin, Math.min(canvasHeight - margin, y))),
            type: nodeTypeForEvent(event),
            color,
            size: event.durationMs > 0 ? 'large' : 'medium',
            textSize: 'small',
            rhythmEventId: event.id,
            rhythmOrder: index,
            rhythmAtMs: event.tMs,
            rhythmDurationMs: event.durationMs,
            note: event.note,
            freqHz: event.freqHz,
            isDragGesture: event.isDrag
        });
        playbackOrder.push(nodeId);
        eventNodeMap[event.id] = nodeId;
    });

    edges.push({
        id: 'rhythm-meta-edge',
        source: 'rhythm-meta',
        target: playbackOrder[0],
        label: 'start',
        edgeColor: '#0071CE',
        thickness: 'medium',
        lineStyle: 'dashed',
        targetArrow: 'triangle',
        sourceArrow: 'none'
    });
    edgeOrder.push('rhythm-meta-edge');

    pattern.events.slice(1).forEach((event, index) => {
        const previousEvent = pattern.events[index];
        const edgeId = `rhythm-edge-${index + 1}`;
        edges.push({
            id: edgeId,
            source: eventNodeMap[previousEvent.id],
            target: eventNodeMap[event.id],
            label: `${Math.round(event.tMs - previousEvent.tMs)}ms`,
            edgeColor: '#0071CE',
            thickness: 'medium',
            lineStyle: lineStyleForInterval(event.tMs - previousEvent.tMs, minIntervalMs, maxIntervalMs),
            targetArrow: 'triangle',
            sourceArrow: 'none',
            rhythmEdgeIndex: index,
            rhythmIntervalMs: roundNumber(event.tMs - previousEvent.tMs, 3)
        });
        edgeOrder.push(edgeId);
    });

    return {
        nodes,
        edges,
        playbackOrder,
        meta: {
            projectionMode: mode,
            eventNodeMap,
            edgeOrder,
            beatCount: pattern.beats.length,
            bpm: pattern.bpm,
            durationMs: pattern.durationMs
        }
    };
}

export function projectPatternToScene(pattern, options = {}) {
    const events = pattern.events || [];
    const entities = events.map((event, index) => ({
        id: `entity-${event.id}`,
        kind: event.durationMs > 0 ? 'sustain' : (event.isDrag ? 'gesture' : 'beat'),
        x: event.xNorm,
        y: event.yNorm,
        atMs: event.tMs,
        durationMs: event.durationMs,
        note: event.note,
        freqHz: event.freqHz,
        intensity: event.durationMs > 0 ? Math.min(1, 0.45 + event.durationMs / 1200) : 0.55 + ((index % 3) * 0.1)
    }));

    const timeline = events.map((event, index) => ({
        id: `timeline-${event.id}`,
        atMs: event.tMs,
        durationMs: event.durationMs,
        order: index,
        kind: event.durationMs > 0 ? 'sustain' : 'pulse'
    }));

    const densityPeaks = [];
    const windowSizeMs = options.windowSizeMs || 1200;
    for (let cursor = 0; cursor <= pattern.durationMs; cursor += Math.max(300, windowSizeMs / 2)) {
        const eventCount = events.filter(event => event.tMs >= cursor && event.tMs < cursor + windowSizeMs).length;
        densityPeaks.push({
            atMs: cursor,
            eventCount
        });
    }

    const cameraHints = {
        strategy: 'density-and-cluster',
        densityPeaks,
        clusterTransitions: events.slice(1).map((event, index) => ({
            atMs: event.tMs,
            dx: roundNumber(event.xNorm - events[index].xNorm, 3),
            dy: roundNumber(event.yNorm - events[index].yNorm, 3)
        })),
        focusWindows: events.map(event => ({
            atMs: event.tMs,
            durationMs: Math.max(180, event.durationMs || 140),
            x: event.xNorm,
            y: event.yNorm
        }))
    };

    return {
        entities,
        timeline,
        cameraHints,
        meta: {
            bpm: pattern.bpm,
            durationMs: pattern.durationMs,
            beatCount: pattern.beats.length
        }
    };
}
