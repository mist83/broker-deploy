import { normalizeGestureEvents, roundNumber } from './events.js';

export const RHYTHM_PATTERN_VERSION = 1;

export function compilePattern(events = [], options = {}) {
    const normalizedEvents = normalizeGestureEvents(events, options);
    const beats = normalizedEvents.filter(event => !event.isDrag && event.durationMs === 0);
    const intervalsMs = beats.slice(1).map((event, index) => roundNumber(event.tMs - beats[index].tMs, 3));
    const averageIntervalMs = intervalsMs.length
        ? intervalsMs.reduce((sum, value) => sum + value, 0) / intervalsMs.length
        : null;
    const bpm = averageIntervalMs && averageIntervalMs > 0
        ? Math.round(60000 / averageIntervalMs)
        : null;
    const lastEventEndMs = normalizedEvents.reduce(
        (max, event) => Math.max(max, event.tMs + event.durationMs),
        0
    );
    const noteHistogram = normalizedEvents.reduce((histogram, event) => {
        histogram[event.note] = (histogram[event.note] || 0) + 1;
        return histogram;
    }, {});
    const pitchValues = normalizedEvents.map(event => event.freqHz);

    return {
        version: RHYTHM_PATTERN_VERSION,
        events: normalizedEvents,
        beats,
        intervalsMs,
        durationMs: roundNumber(lastEventEndMs, 3),
        bpm,
        loopable: options.loopable !== false,
        pitch: {
            mapping: 'xy-average',
            minHz: pitchValues.length ? Math.min(...pitchValues) : null,
            maxHz: pitchValues.length ? Math.max(...pitchValues) : null,
            noteHistogram,
            eventCount: normalizedEvents.length
        }
    };
}
