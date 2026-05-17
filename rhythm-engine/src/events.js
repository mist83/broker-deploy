const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function clamp01(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, value));
}

export function roundNumber(value, decimals = 3) {
    if (!Number.isFinite(value)) return 0;
    const precision = 10 ** decimals;
    return Math.round(value * precision) / precision;
}

export function deriveFrequency(xNorm, yNorm, options = {}) {
    const minHz = Number.isFinite(options.minHz) ? options.minHz : 400;
    const maxHz = Number.isFinite(options.maxHz) ? options.maxHz : 1200;
    const diagonalBlend = (clamp01(xNorm) + (1 - clamp01(yNorm))) / 2;
    return roundNumber(minHz + diagonalBlend * (maxHz - minHz), 3);
}

export function freqToMidi(freqHz) {
    if (!Number.isFinite(freqHz) || freqHz <= 0) {
        return 69;
    }
    return Math.round(69 + 12 * Math.log2(freqHz / 440));
}

export function freqToNoteName(freqHz) {
    const midi = freqToMidi(freqHz);
    const name = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
}

export function normalizeGestureEvents(events = [], options = {}) {
    const source = options.source || 'unknown';
    const minHz = Number.isFinite(options.minHz) ? options.minHz : 400;
    const maxHz = Number.isFinite(options.maxHz) ? options.maxHz : 1200;

    return events
        .map((event, index) => {
            const xNorm = clamp01(event.xNorm);
            const yNorm = clamp01(event.yNorm);
            const tMs = Math.max(0, roundNumber(event.tMs, 3));
            const durationMs = Math.max(0, roundNumber(event.durationMs || 0, 3));
            const freqHz = deriveFrequency(xNorm, yNorm, { minHz, maxHz });
            return {
                id: event.id || `evt-${index + 1}`,
                tMs,
                xNorm,
                yNorm,
                durationMs,
                isDrag: event.isDrag === true,
                source: event.source || source,
                freqHz,
                note: event.note || freqToNoteName(freqHz)
            };
        })
        .sort((left, right) => {
            if (left.tMs !== right.tMs) return left.tMs - right.tMs;
            return left.id.localeCompare(right.id);
        });
}
