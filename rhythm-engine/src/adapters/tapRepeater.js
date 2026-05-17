import { clamp01, roundNumber } from '../events.js';
import { compilePattern } from '../pattern.js';

export function gestureEventsFromTapRepeater(taps = [], options = {}) {
    const width = Math.max(1, Number(options.width) || 1);
    const height = Math.max(1, Number(options.height) || 1);
    const source = options.source || 'tap-repeater';

    return taps.map((tap, index) => ({
        id: tap.id || `tap-${index + 1}`,
        tMs: roundNumber(Number(tap.perfOffset) || 0, 3),
        xNorm: clamp01((Number(tap.x) || 0) / width),
        yNorm: clamp01((Number(tap.y) || 0) / height),
        durationMs: roundNumber(Number(tap.duration) || 0, 3),
        isDrag: tap.isDrag === true,
        source
    }));
}

export function compileTapRepeaterPattern(taps = [], options = {}) {
    return compilePattern(
        gestureEventsFromTapRepeater(taps, options),
        options
    );
}
