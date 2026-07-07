/**
 * AudioEngine.js — Web Audio API context wrapper
 * Central AudioContext management with iOS unlock support
 * @module AudioEngine
 */

/** @type {AudioContext|null} */
let ctx = null;
let masterGain = null;
let unlocked = false;
let muted = false;

/**
 * Get or create AudioContext — must be called after user gesture
 * @returns {AudioContext|null}
 */
export function getContext() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
    unlocked = ctx.state === 'running';
  } catch (e) {
    console.warn('[AudioEngine] Web Audio not supported:', e);
    ctx = null;
  }
  return ctx;
}

/**
 * Unlock audio on first user gesture (iOS/Chrome autoplay policy)
 * @returns {Promise<boolean>}
 */
export async function unlock() {
  if (unlocked) return true;
  const audioCtx = getContext();
  if (!audioCtx) return false;

  try {
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    // Brief silent buffer trick for iOS
    const buf = audioCtx.createBuffer(1, 1, 22050);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start(0);
    unlocked = true;
    return true;
  } catch (e) {
    console.warn('[AudioEngine] Unlock failed:', e);
    return false;
  }
}

/**
 * Get master gain node
 * @returns {GainNode|null}
 */
export function getMasterGain() {
  return masterGain;
}

/**
 * Set master volume
 * @param {number} value 0-1
 */
export function setVolume(value) {
  if (masterGain) {
    masterGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, value)),
      ctx?.currentTime ?? 0,
      0.1
    );
  }
}

/**
 * Toggle mute
 * @returns {boolean} new muted state
 */
export function toggleMute() {
  muted = !muted;
  setVolume(muted ? 0 : 0.7);
  return muted;
}

export function isMuted() { return muted; }
export function isUnlocked() { return unlocked; }

/**
 * Create a gain node connected to master
 * @param {number} [gainValue=1]
 * @returns {GainNode|null}
 */
export function createGainNode(gainValue = 1) {
  if (!ctx) return null;
  const gain = ctx.createGain();
  gain.gain.value = gainValue;
  gain.connect(masterGain);
  return gain;
}

/**
 * Schedule frequency ramp on an oscillator
 * @param {OscillatorNode} osc
 * @param {number} from
 * @param {number} to
 * @param {number} duration
 */
export function rampFrequency(osc, from, to, duration) {
  if (!ctx) return;
  osc.frequency.setValueAtTime(from, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(to, ctx.currentTime + duration);
}

export default { getContext, unlock, getMasterGain, setVolume, toggleMute, isMuted, isUnlocked, createGainNode, rampFrequency };
