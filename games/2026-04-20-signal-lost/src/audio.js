/**
 * audio.js — Web Audio API, sve zvuke sintetizuje u kodu (nema .mp3/.wav fajlova).
 * Poziva se iz main.js (initAudio) i iz signal.js / ui.js za sfx triggere.
 */

/** @type {AudioContext|null} */
let _ctx = null;

/** @type {GainNode|null} Ukupna glasnoća */
let _masterGain = null;

/** @type {OscillatorNode|null} Ambijentni hum */
let _ambientOsc = null;

/**
 * Initialise the AudioContext (must be called from a user gesture on iOS).
 * Safe to call multiple times — only creates context once.
 */
export function initAudio() {
  if (_ctx) return; // already initialised
  try {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _masterGain.gain.value = 0.3;
    _masterGain.connect(_ctx.destination);

    // Ambient hum: low sawtooth at 50Hz, very quiet
    _ambientOsc = _ctx.createOscillator();
    const ambGain = _ctx.createGain();
    _ambientOsc.type = 'sawtooth';
    _ambientOsc.frequency.value = 50;
    ambGain.gain.value = 0.04;
    _ambientOsc.connect(ambGain);
    ambGain.connect(_masterGain);
    _ambientOsc.start();
  } catch (e) {
    // Audio not supported or blocked — fail silently
    _ctx = null;
  }
}

/**
 * Resume AudioContext if it was suspended (browser autoplay policy).
 * Call on first user interaction.
 */
export function resumeAudio() {
  if (_ctx?.state === 'suspended') _ctx.resume();
}

/**
 * Play a short "bip" tone when a Gate node is toggled open/closed.
 * @param {boolean} open - true = open (higher pitch), false = closed (lower pitch)
 */
export function sfxGateToggle(open) {
  _playTone('sine', open ? 880 : 440, 0.08, 0.3);
}

/**
 * Play a "swoosh" sound when the signal advances one node.
 * @param {number} level - current level (affects pitch slightly)
 */
export function sfxSignalStep(level) {
  _playTone('sine', 300 + (level ?? 1) * 20, 0.06, 0.15);
}

/**
 * Play a "clunk" / hard stop sound when the signal hits a Scrambler.
 */
export function sfxScrambler() {
  if (!_ctx) return;
  const t = _ctx.currentTime;
  const osc = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.linearRampToValueAtTime(40, t + 0.12);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.4, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(t);
  osc.stop(t + 0.13);
}

/**
 * Play an OR-Splitter "fork" sound — signal splits into two paths.
 */
export function sfxOrSplit() {
  _playTone('sine', 440, 0.1, 0.2);
  _playTone('sine', 660, 0.1, 0.2);
}

/**
 * Play the level-clear ascending melody.
 */
export function sfxLevelClear() {
  if (!_ctx) return;
  const freqs = [523, 659, 784, 1047]; // C5, E5, G5, C6
  const t = _ctx.currentTime;
  freqs.forEach((freq, i) => {
    _playTone('sine', freq, 0.08, 0.3, t + i * 0.1);
  });
}

/**
 * Play the checkpoint save "chime" (richer than level-clear).
 */
export function sfxCheckpoint() {
  if (!_ctx) return;
  const freqs = [523, 659, 784, 1047]; // C-E-G-C arpeggio
  const t = _ctx.currentTime;
  freqs.forEach((freq, i) => {
    _playTone('sine', freq, 0.15, 0.25, t + i * 0.15);
  });
}

/**
 * Play the failure "fail tone" when signal reaches a dead-end or scrambled.
 */
export function sfxFail() {
  if (!_ctx) return;
  const t = _ctx.currentTime;
  const osc = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.linearRampToValueAtTime(220, t + 0.3);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.5, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(t);
  osc.stop(t + 0.31);
}

/**
 * Play the power-up pickup / activation sound.
 * @param {string} powerupId - from CONFIG.POWERUPS keys
 */
export function sfxPowerup(powerupId) {
  if (!_ctx) return;
  // Each powerup gets a slightly different starting pitch
  const pitchOffsets = {
    SLOW_SIGNAL: 0,
    REVEAL:      50,
    FREEZE:      100,
    TIME_BUBBLE: 150,
    ECHO:        200,
  };
  const startFreq = 400 + (pitchOffsets[powerupId] ?? 0);
  const t = _ctx.currentTime;
  const osc = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, t);
  osc.frequency.linearRampToValueAtTime(startFreq * 2, t + 0.15);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(t);
  osc.stop(t + 0.16);
}

/**
 * Play the victory fanfare (signal fully restored).
 */
export function sfxVictory() {
  if (!_ctx) return;
  // Ascending C major scale: C4 D4 E4 F4 G4 A4 B4 C5
  const freqs = [262, 294, 330, 349, 392, 440, 494, 523];
  const t = _ctx.currentTime;
  freqs.forEach((freq, i) => {
    _playTone('sine', freq, 0.12, 0.3, t + i * 0.1);
  });
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Create a simple gain-enveloped oscillator and connect to master.
 * @param {string} type - OscillatorType
 * @param {number} freq - Hz
 * @param {number} durationSec
 * @param {number} peakGain
 * @param {number} [startTime] - AudioContext time, defaults to now
 */
function _playTone(type, freq, durationSec, peakGain, startTime) {
  if (!_ctx) return;
  const t = startTime ?? _ctx.currentTime;
  const osc = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peakGain, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(t);
  osc.stop(t + durationSec + 0.01);
}
