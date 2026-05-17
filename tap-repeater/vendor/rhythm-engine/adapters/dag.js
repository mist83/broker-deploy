import { serializePattern } from '../serialization.js';

function defaultDagBaseUrl() {
    if (typeof window === 'undefined' || !window.location || !window.location.hostname) {
        return 'https://dag.mikesendpoint.com/';
    }
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
        return 'https://dag.mikesendpoint.com/';
    }
    const dotIndex = host.indexOf('.');
    if (dotIndex === -1) {
        return 'https://dag.mikesendpoint.com/';
    }
    const baseHost = host.slice(dotIndex + 1);
    return `https://dag.${baseHost}/`;
}

export function buildDagRhythmURL(patternOrSerialized, options = {}) {
    const baseUrl = options.baseUrl || defaultDagBaseUrl();
    const serialized = typeof patternOrSerialized === 'string'
        ? patternOrSerialized
        : serializePattern(patternOrSerialized);
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}rhythm=${encodeURIComponent(serialized)}`;
}
