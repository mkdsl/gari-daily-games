/**
 * @module audio
 * Web Audio API sound effects and ambient for Jesenji Tok.
 * All sounds are generated procedurally — no .wav/.mp3 files.
 *
 * Sound catalog:
 * - playThud()          — glineni zvuk pri assign (triangle, ~80Hz, decay 0.3s)
 * - playClick()         — drveni click za confirm (square, ~400Hz, very short)
 * - playError()         — error shake feedback (brief buzz, sawtooth)
 * - playUnassign()      — card returned to palette (reverse thud)
 * - playHarmonika()     — folk motiv za score screen (D-mol sequence)
 * - playPrestigeFanfare()— triumphant folk fanfare for prestige unlock
 * - playAchievement()   — achievement unlock chime (ascending arpeggio)
 * - playSeasonClose()   — closing season confirmation sound
 * - playWeekReveal()    — per-week reveal tick during bura
 * - playEcoBonusJingle()— eco bonus achieved jingle
 * - startAmbient()      — jesenji ambient (filtered noise + gentle oscillation)
 * - stopAmbient()       — stop ambient loop
 * - playBuraStart()     — staccato rumble for zimska bura start
 * - playBuraTick()      — tick sound per revealed week during bura
 * - playBuraEnd()       — triumphant/melancholic end of bura
 * - setAudioEnabled()   — toggle audio on/off
 * - getAudioEnabled()   — query audio state
 */

// ─── Module State ──────────────────────────────────────────────────────────────

/** @type {AudioContext|null} */
let ctx = null;
/** @type {GainNode|null} */
let masterGain = null;
/** @type {GainNode|null} */
let ambientGain = null;
/** @type {AudioBufferSourceNode|null} */
let ambientSource = null;
/** @type {OscillatorNode|null} */
let ambientLfo = null;
let ambientRunning = false;

/** User preference: audio enabled */
let audioEnabled = true;

/** Track any playing one-shot nodes to avoid runaway nodes */
const activeNodes = new Set();

// ─── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialize audio context (must be called after user gesture).
 * Safe to call multiple times — no-op if already initialized.
 */
export function initAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    masterGain.connect(ctx.destination);
  } catch (e) {
    console.warn('JT Audio: Web Audio not available', e);
    ctx = null;
  }
}

/**
 * Resume audio context if suspended (needed after user gesture on some browsers).
 */
export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

/**
 * Toggle audio enabled/disabled.
 * @param {boolean} enabled
 */
export function setAudioEnabled(enabled) {
  audioEnabled = enabled;
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(enabled ? 0.7 : 0, ctx.currentTime, 0.1);
  }
  if (!enabled) {
    stopAmbient();
  }
}

/**
 * Get audio enabled state.
 * @returns {boolean}
 */
export function getAudioEnabled() {
  return audioEnabled;
}

// ─── Internal Utilities ────────────────────────────────────────────────────────

/**
 * Create a gain envelope node connected to masterGain.
 * @returns {GainNode}
 */
function makeGain() {
  const gain = ctx.createGain();
  gain.connect(masterGain);
  return gain;
}

/**
 * Create and start an oscillator with cleanup.
 * @param {'sine'|'square'|'triangle'|'sawtooth'} type
 * @param {number} freq
 * @param {GainNode} target
 * @param {number} startTime
 * @param {number} stopTime
 * @returns {OscillatorNode}
 */
function makeOsc(type, freq, target, startTime, stopTime) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.connect(target);
  osc.start(startTime);
  osc.stop(stopTime);
  activeNodes.add(osc);
  osc.onended = () => activeNodes.delete(osc);
  return osc;
}

/**
 * Create a biquad filter.
 * @param {'lowpass'|'highpass'|'bandpass'|'peaking'} type
 * @param {number} freq
 * @param {AudioNode} target
 * @returns {BiquadFilterNode}
 */
function makeFilter(type, freq, target) {
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, ctx.currentTime);
  filter.connect(target);
  return filter;
}

/**
 * Check if audio is ready to play.
 * @returns {boolean}
 */
function canPlay() {
  if (!ctx || !masterGain || !audioEnabled) return false;
  resumeAudio();
  return true;
}

// ─── SFX: Assignment ──────────────────────────────────────────────────────────

/**
 * Glineni thud sound for task assignment.
 * Triangle wave, ~80Hz base, pitch drop, 0.3s decay.
 */
export function playThud() {
  if (!canPlay()) return;
  const gain = makeGain();
  const t = ctx.currentTime;

  const osc = makeOsc('triangle', 95, gain, t, t + 0.36);
  osc.frequency.exponentialRampToValueAtTime(58, t + 0.14);

  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.55, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
}

/**
 * Reverse thud for task unassignment (card returned to palette).
 * Rising pitch triangle — same as thud but reversed envelope.
 */
export function playUnassign() {
  if (!canPlay()) return;
  const gain = makeGain();
  const t = ctx.currentTime;

  const osc = makeOsc('triangle', 55, gain, t, t + 0.28);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);

  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.35, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
}

/**
 * Drveni click for confirm/selection.
 * Square wave, ~380Hz, highpass filtered, very short.
 */
export function playClick() {
  if (!canPlay()) return;
  const gain = makeGain();
  const t = ctx.currentTime;

  const filter = makeFilter('highpass', 300, gain);
  const osc = makeOsc('square', 380, filter, t, t + 0.1);

  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.28, t + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
}

/**
 * Error buzz for invalid assignment.
 * Sawtooth wave, ~160Hz, brief downward sweep.
 */
export function playError() {
  if (!canPlay()) return;
  const gain = makeGain();
  const t = ctx.currentTime;

  const osc = makeOsc('sawtooth', 160, gain, t, t + 0.25);
  osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);

  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.35, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
}

// ─── SFX: Score & Prestige ────────────────────────────────────────────────────

/**
 * Folk harmonika motif for score screen.
 * D-mol melodija: D4-F4-A4-C5-D5-A4 (6 nota, 1.5s total)
 */
export function playHarmonika() {
  if (!canPlay()) return;

  // D minor scale notes
  const notes = [293.66, 349.23, 440.00, 523.25, 587.33, 440.00];
  const durations = [0.22, 0.22, 0.22, 0.28, 0.36, 0.42];
  const t0 = ctx.currentTime + 0.1;
  let time = t0;

  for (let i = 0; i < notes.length; i++) {
    const gain = makeGain();
    const osc = makeOsc('triangle', notes[i], gain, time, time + durations[i] + 0.05);

    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.4, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + durations[i]);

    time += durations[i] * 0.85;
  }
}

/**
 * Prestige fanfare — full folk chord progression.
 * A major chord + D minor resolution, 2.5s.
 * Played when player qualifies for prestige (score >= 300).
 */
export function playPrestigeFanfare() {
  if (!canPlay()) return;

  // A major: A4=440, C#5=554.37, E5=659.25
  // Then D minor: D4=293.66, F4=349.23, A4=440
  const chords = [
    { freqs: [440, 554.37, 659.25], start: 0.1, dur: 0.6 },
    { freqs: [440, 554.37, 659.25], start: 0.65, dur: 0.4 },
    { freqs: [293.66, 349.23, 440], start: 1.0, dur: 0.8 },
  ];

  const t0 = ctx.currentTime;

  for (const chord of chords) {
    for (const freq of chord.freqs) {
      const gain = makeGain();
      const t = t0 + chord.start;
      const osc = makeOsc('triangle', freq, gain, t, t + chord.dur + 0.1);

      gain.gain.setValueAtTime(0.0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
      gain.gain.setValueAtTime(0.22, t + chord.dur - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + chord.dur + 0.1);
    }
  }

  // Bass note for fullness
  const bassGain = makeGain();
  const bassT = t0 + 1.0;
  const bassOsc = makeOsc('sine', 146.83, bassGain, bassT, bassT + 0.9);
  bassGain.gain.setValueAtTime(0.0, bassT);
  bassGain.gain.linearRampToValueAtTime(0.35, bassT + 0.08);
  bassGain.gain.exponentialRampToValueAtTime(0.001, bassT + 0.85);
}

/**
 * Achievement unlock chime.
 * Ascending pentatonic arpeggio, bright and short.
 */
export function playAchievement() {
  if (!canPlay()) return;

  // G pentatonic: G4=392, A4=440, B4=493.88, D5=587.33, E5=659.25
  const notes = [392, 440, 493.88, 587.33, 659.25];
  const t0 = ctx.currentTime + 0.05;

  for (let i = 0; i < notes.length; i++) {
    const t = t0 + i * 0.09;
    const gain = makeGain();
    const osc = makeOsc('sine', notes[i], gain, t, t + 0.25);

    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.3 - i * 0.02, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  }
}

/**
 * Eco bonus achieved jingle.
 * Three-note bright chord signal.
 */
export function playEcoBonusJingle() {
  if (!canPlay()) return;

  // Major third stack: C5=523.25, E5=659.25, G5=783.99
  const t0 = ctx.currentTime;
  const chordFreqs = [523.25, 659.25, 783.99];

  // Quick ascending stagger
  chordFreqs.forEach((freq, i) => {
    const t = t0 + i * 0.04;
    const gain = makeGain();
    const osc = makeOsc('triangle', freq, gain, t, t + 0.45);
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
  });
}

/**
 * Season close confirmation sound.
 * A low satisfying chord swell, then quick cutoff.
 */
export function playSeasonClose() {
  if (!canPlay()) return;
  const t0 = ctx.currentTime;

  // D4 + A4 + D5 swell
  const freqs = [293.66, 440, 587.33];
  freqs.forEach((freq, i) => {
    const gain = makeGain();
    const osc = makeOsc('sine', freq + i * 2, gain, t0, t0 + 0.9);
    gain.gain.setValueAtTime(0.0, t0);
    gain.gain.linearRampToValueAtTime(0.25 / (i + 1), t0 + 0.15);
    gain.gain.setValueAtTime(0.25 / (i + 1), t0 + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.88);
  });
}

// ─── SFX: Week Reveal ─────────────────────────────────────────────────────────

/**
 * Per-week reveal sound during bura animation.
 * Pitch increases slightly with each revealed week to convey progression.
 * @param {number} weekNumber - 1-12
 */
export function playWeekReveal(weekNumber) {
  if (!canPlay()) return;
  const t = ctx.currentTime;
  // Pitch rises from 480Hz (week 1) to 620Hz (week 12)
  const freq = 480 + (weekNumber - 1) * 12;

  const gain = makeGain();
  const osc = makeOsc('sine', freq, gain, t, t + 0.14);
  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.22, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
}

// ─── SFX: Bura ────────────────────────────────────────────────────────────────

/**
 * Low rumble for zimska bura start.
 * Sine, ~60Hz, downward sweep with noise layer.
 */
export function playBuraStart() {
  if (!canPlay()) return;
  const t = ctx.currentTime;

  // Main rumble
  const gain = makeGain();
  const osc = makeOsc('sine', 62, gain, t, t + 1.1);
  osc.frequency.linearRampToValueAtTime(38, t + 0.9);
  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.5, t + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

  // Noise burst
  const bufSize = Math.floor(ctx.sampleRate * 0.4);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;

  const noiseGain = makeGain();
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = buf;
  noiseSrc.connect(noiseGain);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(400, t);
  noiseSrc.connect(noiseFilter);
  noiseFilter.connect(noiseGain);

  noiseGain.gain.setValueAtTime(0.0, t);
  noiseGain.gain.linearRampToValueAtTime(0.3, t + 0.1);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  noiseSrc.start(t);
  noiseSrc.stop(t + 0.5);
}

/**
 * Tick sound for each week revealed during bura.
 * Higher pitched than playWeekReveal — used as generic tick.
 */
export function playBuraTick() {
  if (!canPlay()) return;
  const t = ctx.currentTime;

  const gain = makeGain();
  const osc = makeOsc('sine', 520, gain, t, t + 0.1);
  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.18, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
}

/**
 * End of bura animation sound.
 * Resolves either triumphantly (high score) or melancholically (low score).
 * @param {'high'|'low'} variant
 */
export function playBuraEnd(variant = 'high') {
  if (!canPlay()) return;
  const t = ctx.currentTime;

  if (variant === 'high') {
    // D major triad swell: D4-F#4-A4
    const freqs = [293.66, 369.99, 440];
    freqs.forEach((freq, i) => {
      const gain = makeGain();
      const start = t + i * 0.06;
      const osc = makeOsc('triangle', freq, gain, start, start + 1.2);
      gain.gain.setValueAtTime(0.0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.1);
      gain.gain.setValueAtTime(0.3, start + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2);
    });
  } else {
    // D minor, descending: D5-C5-A4 (sad cadence)
    const notes = [587.33, 523.25, 440];
    notes.forEach((freq, i) => {
      const gain = makeGain();
      const start = t + i * 0.22;
      const osc = makeOsc('sine', freq, gain, start, start + 0.5);
      gain.gain.setValueAtTime(0.0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.46);
    });
  }
}

// ─── Ambient ──────────────────────────────────────────────────────────────────

/**
 * Start jesenja ambient background.
 * Filtered noise with LFO modulation — evokes autumn wind through leaves.
 * Fades in over 2.5s.
 */
export function startAmbient() {
  if (!ctx || !masterGain || !audioEnabled || ambientRunning) return;
  resumeAudio();

  ambientGain = ctx.createGain();
  ambientGain.gain.setValueAtTime(0.0, ctx.currentTime);
  ambientGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2.5);
  ambientGain.connect(masterGain);

  // Build 3-second looping white noise buffer
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  ambientSource = ctx.createBufferSource();
  ambientSource.buffer = buffer;
  ambientSource.loop = true;

  // Lowpass filter for "wind rustling leaves" texture
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(650, ctx.currentTime);
  lowpass.Q.setValueAtTime(0.8, ctx.currentTime);

  // Highpass to remove DC offset and very low rumble
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(90, ctx.currentTime);

  // Very slow LFO for wind sway effect (0.1Hz = 10s per cycle)
  ambientLfo = ctx.createOscillator();
  ambientLfo.type = 'sine';
  ambientLfo.frequency.setValueAtTime(0.1, ctx.currentTime);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(120, ctx.currentTime); // ±120Hz filter modulation
  ambientLfo.connect(lfoGain);
  lfoGain.connect(lowpass.frequency);
  ambientLfo.start();

  // Secondary gentle tone — soft D2 drone (like distant birds)
  const droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(0.04, ctx.currentTime);
  droneGain.connect(ambientGain);
  const droneOsc = ctx.createOscillator();
  droneOsc.type = 'sine';
  droneOsc.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
  // Slight detune for warmth
  droneOsc.detune.setValueAtTime(8, ctx.currentTime);
  droneOsc.connect(droneGain);
  droneOsc.start();

  ambientSource.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(ambientGain);

  ambientSource.start();
  ambientRunning = true;
}

/**
 * Stop ambient audio gracefully with 2s fade.
 */
export function stopAmbient() {
  if (!ctx || !ambientGain || !ambientRunning) return;

  ambientGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);

  if (ambientLfo) {
    try { ambientLfo.stop(ctx.currentTime + 2); } catch (e) {}
    ambientLfo = null;
  }

  setTimeout(() => {
    if (ambientSource) {
      try { ambientSource.stop(); } catch (e) {}
      ambientSource = null;
    }
    ambientRunning = false;
  }, 2200);
}

/**
 * Check if ambient is currently running.
 * @returns {boolean}
 */
export function isAmbientRunning() {
  return ambientRunning;
}

// ─── Audio Status & Debug ─────────────────────────────────────────────────────

/**
 * Get current audio context state for debugging.
 * @returns {{state: string, sampleRate: number, activeNodes: number}|null}
 */
export function getAudioStatus() {
  if (!ctx) return null;
  return {
    state: ctx.state,
    sampleRate: ctx.sampleRate,
    activeNodes: activeNodes.size,
  };
}

/**
 * Preload / warm up audio context.
 * Plays a silent buffer to avoid first-play latency on iOS.
 */
export function warmup() {
  if (!ctx) return;
  try {
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + 0.001);
  } catch (e) {}
}

/**
 * Play a "confirmation" sound at a given musical pitch.
 * Used for custom events that need audio feedback without a dedicated sound.
 * @param {number} freq - Hz (default 440)
 * @param {'sine'|'triangle'} waveform
 * @param {number} duration - ms
 */
export function playTone(freq = 440, waveform = 'sine', duration = 200) {
  if (!canPlay()) return;
  const t = ctx.currentTime;
  const dur = duration / 1000;
  const gain = makeGain();
  const osc = makeOsc(waveform, freq, gain, t, t + dur);
  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
}
