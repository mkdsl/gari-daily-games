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
  // TODO: create AudioContext + masterGain
  // TODO: start low-volume ambient hum oscillator (saw wave ~50Hz, gain ~0.04)
}

/**
 * Resume AudioContext if it was suspended (browser autoplay policy).
 * Call on first user interaction.
 */
export function resumeAudio() {
  // TODO: if (_ctx && _ctx.state === 'suspended') _ctx.resume();
}

/**
 * Play a short "bip" tone when a Gate node is toggled open/closed.
 * @param {boolean} open - true = open (higher pitch), false = closed (lower pitch)
 */
export function sfxGateToggle(open) {
  // TODO: short sine envelope, 80ms, freq 880Hz if open else 440Hz
}

/**
 * Play a "swoosh" sound when the signal advances one node.
 * @param {number} level - current level (affects pitch slightly)
 */
export function sfxSignalStep(level) {
  // TODO: filtered noise burst, 60ms, cutoff scales with level
}

/**
 * Play a "clunk" / hard stop sound when the signal hits a Scrambler.
 */
export function sfxScrambler() {
  // TODO: low-freq sawtooth blip, 120ms, freq ~80Hz with rapid gain drop
}

/**
 * Play an OR-Splitter "fork" sound — signal splits into two paths.
 */
export function sfxOrSplit() {
  // TODO: two simultaneous sine tones (440Hz + 660Hz), 100ms each
}

/**
 * Play the level-clear ascending melody.
 */
export function sfxLevelClear() {
  // TODO: pentatonic arpeggio, 4 notes, ~300ms total
}

/**
 * Play the checkpoint save "chime" (richer than level-clear).
 */
export function sfxCheckpoint() {
  // TODO: chord arpeggio C-E-G-C, 500ms total, soft attack
}

/**
 * Play the failure "fail tone" when signal reaches a dead-end or scrambled.
 */
export function sfxFail() {
  // TODO: descending two-tone, 300ms, freq 440→220Hz with short decay
}

/**
 * Play the power-up pickup / activation sound.
 * @param {string} powerupId - from CONFIG.POWERUPS keys
 */
export function sfxPowerup(powerupId) {
  // TODO: short rising sweep, 150ms; different pitch per powerupId
}

/**
 * Play the victory fanfare (signal fully restored).
 */
export function sfxVictory() {
  // TODO: full ascending major scale arpeggio, ~800ms
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
  // TODO: create OscillatorNode + GainNode, schedule ADSR-lite, start + stop
}
