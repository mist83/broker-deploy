import { roundNumber } from './events.js';

export function createPlaybackSchedule(pattern, options = {}) {
    const startPct = Math.max(0, Math.min(1, Number.isFinite(options.startPct) ? options.startPct : 0));
    const defaultTapDurationMs = Number.isFinite(options.defaultTapDurationMs) ? options.defaultTapDurationMs : 130;
    const startMs = roundNumber((pattern?.durationMs || 0) * startPct, 3);
    const events = Array.isArray(pattern?.events) ? pattern.events : [];
    const accentFirstBeat = options.accentFirstBeat !== false;
    let beatIndex = 0;

    return events
        .filter(event => event.tMs >= startMs)
        .map(event => {
            const isBeat = !event.isDrag && event.durationMs === 0;
            const cue = {
                id: event.id,
                atMs: roundNumber(event.tMs - startMs, 3),
                durationMs: roundNumber(event.durationMs > 0 ? event.durationMs : defaultTapDurationMs, 3),
                xNorm: event.xNorm,
                yNorm: event.yNorm,
                freqHz: event.freqHz,
                note: event.note,
                accent: isBeat && accentFirstBeat && beatIndex === 0 ? 'downbeat' : (isBeat ? 'beat' : 'gesture'),
                isDrag: event.isDrag,
                source: event.source
            };

            if (isBeat) {
                beatIndex += 1;
            }

            return cue;
        });
}
