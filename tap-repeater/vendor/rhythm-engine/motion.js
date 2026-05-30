// motion.js — continuous gesture/orientation stream (the conductor's wand).
//
// Where events.js / pattern.js handle discrete taps + sweeps with timing,
// this module handles CONTINUOUS motion: device orientation (alpha/beta/
// gamma), optional acceleration, sampled at whatever rate the source can
// produce (typically 30-60Hz). The output is a portable clip that
// downstream consumers (drop, dag, scene viewers, animation authoring
// tools like baton) can read uniformly.
//
// A motion clip is intentionally separate from a tap pattern — they live
// on the same timeline (tMs) but are different shapes. A "rhythm payload"
// can carry both: a tap pattern AND a motion clip. v0 keeps them
// independent; combine at the call site.

export function clamp(v, min, max) {
    if (!Number.isFinite(v)) return min;
    return Math.max(min, Math.min(max, v));
}

export function roundNumber(v, decimals = 3) {
    if (!Number.isFinite(v)) return 0;
    const p = 10 ** decimals;
    return Math.round(v * p) / p;
}

// Normalize a raw motion sample stream into a canonical clip.
//
// Input: array of { tMs, alpha?, beta?, gamma?, accelX?, accelY?, accelZ? }
// Output: { source, durationMs, sampleCount, samples: [...] } with
//   stable shape, monotonically-increasing tMs, and bounded values.
//
// Options:
//   source: string ('phone-pair', 'recorded', …)
//   anchorAtZero: if true, shift the first sample's tMs to 0 and offset
//     the rest. Default true. Set false if the caller wants absolute time.
export function normalizeMotionStream(samples = [], options = {}) {
    const source = options.source || 'unknown';
    const anchorAtZero = options.anchorAtZero !== false;
    if (!Array.isArray(samples) || samples.length === 0) {
        return { source, durationMs: 0, sampleCount: 0, samples: [] };
    }

    const sorted = samples
        .filter((s) => s && Number.isFinite(s.tMs))
        .slice()
        .sort((a, b) => a.tMs - b.tMs);

    if (sorted.length === 0) {
        return { source, durationMs: 0, sampleCount: 0, samples: [] };
    }

    const t0 = anchorAtZero ? sorted[0].tMs : 0;
    const out = sorted.map((s) => ({
        tMs: roundNumber(s.tMs - t0, 3),
        // DeviceOrientation: alpha 0..360, beta -180..180, gamma -90..90.
        // Keep values within those ranges; null when unknown.
        alpha: Number.isFinite(s.alpha) ? roundNumber(clamp(s.alpha, 0, 360), 3) : null,
        beta:  Number.isFinite(s.beta)  ? roundNumber(clamp(s.beta, -180, 180), 3) : null,
        gamma: Number.isFinite(s.gamma) ? roundNumber(clamp(s.gamma, -90, 90), 3) : null,
        // DeviceMotion accelerationIncludingGravity (m/s²). Optional.
        accelX: Number.isFinite(s.accelX) ? roundNumber(s.accelX, 3) : null,
        accelY: Number.isFinite(s.accelY) ? roundNumber(s.accelY, 3) : null,
        accelZ: Number.isFinite(s.accelZ) ? roundNumber(s.accelZ, 3) : null,
    }));

    return {
        source,
        durationMs: roundNumber(out[out.length - 1].tMs, 3),
        sampleCount: out.length,
        samples: out,
    };
}

// Decimate a motion clip to a target frame rate. Useful for export when the
// raw stream was sampled at 60Hz but the target animation runs at 24fps.
// Picks the sample closest to each target time. Returns a new clip.
export function decimateMotionStream(clip, targetHz = 30) {
    if (!clip || !Array.isArray(clip.samples) || clip.samples.length === 0) return clip;
    const stepMs = 1000 / Math.max(1, targetHz);
    const out = [];
    let cursor = 0;
    for (let t = 0; t <= clip.durationMs + stepMs / 2; t += stepMs) {
        while (cursor < clip.samples.length - 1 && clip.samples[cursor + 1].tMs <= t) cursor += 1;
        out.push({ ...clip.samples[cursor], tMs: roundNumber(t, 3) });
    }
    return {
        ...clip,
        sampleCount: out.length,
        samples: out,
    };
}

// Export a motion clip as a paste-ready array of keyframes mapping tMs →
// chosen channels. The default extracts {alpha, beta, gamma}; pass channels
// to pull a different subset.
//
// Output shape: [{ tMs, ...channels }, ...] — easy to JSON.stringify and
// drop into a scene file.
export function motionStreamToKeyframes(clip, opts = {}) {
    const channels = opts.channels || ['alpha', 'beta', 'gamma'];
    if (!clip || !Array.isArray(clip.samples)) return [];
    return clip.samples.map((s) => {
        const frame = { tMs: s.tMs };
        for (const ch of channels) {
            if (s[ch] != null) frame[ch] = s[ch];
        }
        return frame;
    });
}

// Render a clip as a tiny JS function source string. Returns text the caller
// can copy-paste into a scene module: `(t) => motionAt(t, clip)`. Linear
// interpolation between samples. Useful for "canon-ify this gesture into a
// reusable animation."
export function motionStreamToFunction(clip, opts = {}) {
    const fnName = opts.fnName || 'gesture';
    const channels = opts.channels || ['alpha', 'beta', 'gamma'];
    const keyframes = motionStreamToKeyframes(clip, { channels });
    return [
        `// Auto-generated from a ${(clip?.durationMs ?? 0) | 0}ms motion clip (${clip?.sampleCount ?? 0} samples).`,
        `// Returns { ${channels.join(', ')} } for a tMs in [0, ${clip?.durationMs ?? 0}].`,
        `export const ${fnName}Clip = ${JSON.stringify(keyframes)};`,
        `export function ${fnName}(tMs) {`,
        `  const f = ${fnName}Clip;`,
        `  if (!f.length) return {};`,
        `  if (tMs <= f[0].tMs) return { ...f[0] };`,
        `  if (tMs >= f[f.length - 1].tMs) return { ...f[f.length - 1] };`,
        `  let lo = 0, hi = f.length - 1;`,
        `  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (f[mid].tMs <= tMs) lo = mid; else hi = mid; }`,
        `  const a = f[lo], b = f[hi];`,
        `  const u = (tMs - a.tMs) / (b.tMs - a.tMs);`,
        `  const out = { tMs };`,
        `  for (const k of Object.keys(a)) {`,
        `    if (k === 'tMs') continue;`,
        `    if (typeof a[k] === 'number' && typeof b[k] === 'number') out[k] = a[k] + (b[k] - a[k]) * u;`,
        `    else out[k] = a[k];`,
        `  }`,
        `  return out;`,
        `}`,
    ].join('\n');
}
