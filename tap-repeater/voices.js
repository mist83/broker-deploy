// voices.js — Web Audio voice factory for band-party "beat-making devices".
//
// A device's `voice` is a portable timbre descriptor (rhythm-engine's
// normalizeInstrument shape: { wave, attackMs, releaseMs, baseHz, pitchFromXY }).
// This turns it into actual sound — an oscillator (or filtered noise for claps)
// with a short attack/release envelope — scheduled on the Web Audio clock so
// playback is sample-accurate and drift-free. Ported from the standalone
// instrument's synth. No DOM; the composer owns the timeline.

let _ctx = null;
let _noiseBuffer = null;

export function audioContext() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
}

function clamp01(v) {
    return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
}

// Pitch a voice from the tap's position when it's pitch-sensitive — the "tone of
// inflection" the ear latches onto. Diagonal blend (low = bottom-left) around the
// device's base pitch, ±1 octave.
export function voiceFreq(voice, xNorm = 0.5, yNorm = 0.5) {
    if (!voice || voice.pitchFromXY === false) return voice ? voice.baseHz : 440;
    const blend = (clamp01(xNorm) + (1 - clamp01(yNorm))) / 2;
    return voice.baseHz * Math.pow(2, (blend - 0.5) * 2);
}

function noiseBuffer(ctx) {
    if (_noiseBuffer) return _noiseBuffer;
    const len = Math.floor(ctx.sampleRate * 0.4);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    _noiseBuffer = buffer;
    return _noiseBuffer;
}

// Schedule a single hit at absolute audioCtx time `when`.
export function scheduleVoice(ctx, when, voice, opts = {}) {
    if (!ctx || !voice) return;
    const xNorm = opts.xNorm ?? 0.5;
    const yNorm = opts.yNorm ?? 0.5;
    const gainVal = Number.isFinite(opts.gain) ? opts.gain : 1;
    const attack = Math.max(0.001, (voice.attackMs || 4) / 1000);
    const release = Math.max(0.03, (voice.releaseMs || 160) / 1000);
    const hold = Math.max(attack + 0.03, Math.min(release, (opts.durationMs ? opts.durationMs / 1000 : release)));
    const end = when + Math.max(hold, release) + 0.02;

    const out = ctx.createGain();
    out.gain.value = 0.32 * clamp01(gainVal);
    out.connect(ctx.destination);

    if (voice.wave === 'noise') {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer(ctx);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = voice.baseHz || 1500;
        bp.Q.value = 0.8;
        const g = ctx.createGain();
        src.connect(bp); bp.connect(g); g.connect(out);
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(1, when + attack);
        g.gain.exponentialRampToValueAtTime(0.001, when + Math.max(attack + 0.02, release));
        src.start(when);
        src.stop(end);
        return;
    }

    const osc = ctx.createOscillator();
    osc.type = voice.wave || 'sine';
    const freq = voiceFreq(voice, xNorm, yNorm);
    osc.frequency.setValueAtTime(freq, when);
    // Percussive pitch-drop for low, fixed-pitch voices (kick/tom feel).
    if (voice.pitchFromXY === false && voice.baseHz <= 130) {
        osc.frequency.setValueAtTime(freq * 2.4, when);
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq), when + 0.09);
    }
    const g = ctx.createGain();
    osc.connect(g); g.connect(out);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(1, when + attack);
    g.gain.exponentialRampToValueAtTime(0.001, when + Math.max(attack + 0.04, hold));
    osc.start(when);
    osc.stop(end);
}

// Fire a hit right now (live tapping / preview).
export function playNow(voice, opts = {}) {
    const ctx = audioContext();
    scheduleVoice(ctx, ctx.currentTime + 0.005, voice, opts);
}
