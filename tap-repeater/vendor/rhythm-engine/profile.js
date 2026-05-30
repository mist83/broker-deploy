// profile.js — the "tap profile" envelope: a rhythm-engine pattern bound to a song.
//
// A profile is the universal currency that ties the fleet together:
//   tap-repeater records it · the store keeps it · DAG + dance-party consume it.
//
// The `pattern` field stays the canonical rhythm-engine shape (compilePattern
// output), so every existing tool — handoff URLs, DAG's parsePattern, the Scene
// projection — keeps reading it untouched. The envelope only ADDS song identity
// (the join key to dance-party packs) plus a zero-parse summary for list views.
//
// Pure data. No DOM, no Node APIs, no clock — browser and Node both import it.
// `createdAt` is passed in by the caller so this module stays deterministic.

import { RHYTHM_PATTERN_VERSION } from './pattern.js';

export const RHYTHM_PROFILE_VERSION = 1;

const str = (value, fallback = '') => (typeof value === 'string' ? value : fallback);
const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

/**
 * The song identity that joins a profile to a dance-party pack and a YouTube video.
 * Accepts `youtubeId` or dance-party's native `videoId` interchangeably.
 */
export function normalizeSong(song = {}) {
    const input = song && typeof song === 'object' ? song : {};
    return {
        slug: str(input.slug),
        title: str(input.title),
        artist: str(input.artist),
        youtubeId: str(input.youtubeId || input.videoId),
        durationSec: num(input.durationSec, 0)
    };
}

/** Zero-parse summary so catalogs and list rows render without decoding the pattern. */
export function profileSummary(pattern = {}) {
    const input = pattern && typeof pattern === 'object' ? pattern : {};
    return {
        bpm: Number.isFinite(input.bpm) ? input.bpm : null,
        beatCount: Array.isArray(input.beats) ? input.beats.length : 0,
        eventCount: Array.isArray(input.events) ? input.events.length : 0,
        durationMs: num(input.durationMs, 0)
    };
}

/**
 * Build a tap-profile envelope around a compiled rhythm-engine pattern.
 * @param {object} input
 * @param {string} [input.id]        Stable id (defaults to the song slug).
 * @param {string} [input.name]      Human label.
 * @param {object} input.song        Song identity (see normalizeSong).
 * @param {object} input.pattern     compilePattern output.
 * @param {string} [input.source]    Origin tag (e.g. 'tap-repeater', 'seed').
 * @param {string} [input.createdAt] ISO date string supplied by the caller.
 */
export function buildProfile(input = {}) {
    const pattern = input.pattern && typeof input.pattern === 'object' ? input.pattern : {};
    const song = normalizeSong(input.song);
    const id = str(input.id) || song.slug;
    return {
        profileVersion: RHYTHM_PROFILE_VERSION,
        patternVersion: RHYTHM_PATTERN_VERSION,
        id,
        name: str(input.name) || (song.title ? `${song.title} — taps` : 'Untitled taps'),
        song,
        summary: profileSummary(pattern),
        source: str(input.source, 'tap-repeater'),
        createdAt: str(input.createdAt),
        pattern
    };
}

/** A compact catalog row (song + summary, NO full pattern) for the store's catalog.json. */
export function profileCatalogEntry(profile = {}, file) {
    return {
        id: str(profile.id),
        name: str(profile.name),
        song: normalizeSong(profile.song),
        summary: profile.summary || profileSummary(profile.pattern),
        source: str(profile.source, 'tap-repeater'),
        createdAt: str(profile.createdAt),
        file: str(file) || `./${str(profile.id)}.json`
    };
}

/** Validate a parsed profile enough to trust it downstream. Returns {ok, reason}. */
export function validateProfile(profile = {}) {
    if (!profile || typeof profile !== 'object') return { ok: false, reason: 'not an object' };
    if (!profile.pattern || !Array.isArray(profile.pattern.events) || !profile.pattern.events.length) {
        return { ok: false, reason: 'pattern has no events' };
    }
    if (!profile.song || !str(profile.song.slug)) return { ok: false, reason: 'missing song.slug' };
    return { ok: true, reason: '' };
}
