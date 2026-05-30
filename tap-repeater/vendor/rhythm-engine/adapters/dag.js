import { serializePattern } from '../serialization.js';

export function buildDagRhythmURL(patternOrSerialized, options = {}) {
    const baseUrl = options.baseUrl || 'https://dag.mullmania.com/';
    const serialized = typeof patternOrSerialized === 'string'
        ? patternOrSerialized
        : serializePattern(patternOrSerialized);
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}rhythm=${encodeURIComponent(serialized)}`;
}
