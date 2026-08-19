// audio.js — Web Audio API, all generated (no .wav/.mp3)

/** @type {AudioContext|null} */
let ctx = null;
/** @type {OscillatorNode|null} */
let crowdOsc = null;
/** @type {AudioBufferSourceNode|null} */
let crowdNoise = null;
/** @type {GainNode|null} */
let crowdGain = null;
let audioEnabled = false;

const CROWD_VOLUME_BY_PHASE = {
  setup:      0.025,
  soundcheck: 0.05,
  opening:    0.09,
  climax:     0.15,
  breakdown:  0.10,
  recap:      0.06
};

/** Lazily create or resume AudioContext */
function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/**
 * Create a white-noise buffer.
 * @param {AudioContext} ac
 * @param {number} seconds
 * @returns {AudioBuffer}
 */
function makeNoiseBuffer(ac, seconds = 2) {
  const rate    = ac.sampleRate;
  const samples = Math.ceil(rate * seconds);
  const buf     = ac.createBuffer(1, samples, rate);
  const data    = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

/** Initialize crowd ambient. Call once after first user gesture. */
export function initAudio() {
  if (audioEnabled) return;
  const ac = getCtx();
  audioEnabled = true;

  crowdGain = ac.createGain();
  crowdGain.gain.setValueAtTime(0.025, ac.currentTime);
  crowdGain.connect(ac.destination);

  // Sub sine (crowd rumble)
  crowdOsc = ac.createOscillator();
  crowdOsc.type = 'sine';
  crowdOsc.frequency.setValueAtTime(60, ac.currentTime);
  crowdOsc.connect(crowdGain);
  crowdOsc.start();

  // Noise layer
  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(400, ac.currentTime);
  noiseFilter.connect(crowdGain);

  crowdNoise = ac.createBufferSource();
  crowdNoise.buffer = makeNoiseBuffer(ac, 3);
  crowdNoise.loop = true;
  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.04, ac.currentTime);
  crowdNoise.connect(noiseGain);
  noiseGain.connect(noiseFilter);
  crowdNoise.start();
}

/**
 * Ramp crowd ambient to phase volume.
 * @param {string} phaseName
 */
export function setCrowdForPhase(phaseName) {
  if (!audioEnabled || !crowdGain) return;
  const ac  = getCtx();
  const vol = CROWD_VOLUME_BY_PHASE[phaseName] ?? 0.05;
  crowdGain.gain.cancelScheduledValues(ac.currentTime);
  crowdGain.gain.setTargetAtTime(vol, ac.currentTime, 0.8);
}

/**
 * SFX: vinyl scratch on draw (noise burst + high-shelf filter)
 */
export function sfxDraw() {
  if (!audioEnabled) return;
  const ac  = getCtx();
  const buf = makeNoiseBuffer(ac, 0.1);
  const src = ac.createBufferSource();
  src.buffer = buf;

  const flt = ac.createBiquadFilter();
  flt.type = 'highshelf';
  flt.frequency.setValueAtTime(4000, ac.currentTime);
  flt.gain.setValueAtTime(15, ac.currentTime);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.3, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

  src.connect(flt);
  flt.connect(gain);
  gain.connect(ac.destination);
  src.start();
  src.stop(ac.currentTime + 0.1);
}

/**
 * SFX: muffled thud on assign (sine 80Hz, 150ms)
 */
export function sfxAssign() {
  if (!audioEnabled) return;
  const ac  = getCtx();
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, ac.currentTime);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, ac.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.18);
}

/**
 * SFX: bass drop on synergy trigger (sub sine 80Hz, 300ms slow attack)
 */
export function sfxSynergy() {
  if (!audioEnabled) return;
  const ac  = getCtx();
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.3);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, ac.currentTime + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.38);
}

/**
 * SFX: feedback squeal when vibe drops below 30
 */
export function sfxVibeDropLow() {
  if (!audioEnabled) return;
  const ac  = getCtx();
  const buf = makeNoiseBuffer(ac, 0.25);
  const src = ac.createBufferSource();
  src.buffer = buf;

  const flt = ac.createBiquadFilter();
  flt.type = 'bandpass';
  flt.frequency.setValueAtTime(3200, ac.currentTime);
  flt.Q.setValueAtTime(8, ac.currentTime);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.15, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);

  src.connect(flt);
  flt.connect(gain);
  gain.connect(ac.destination);
  src.start();
  src.stop(ac.currentTime + 0.25);
}

/** Stop crowd ambient cleanly. */
export function stopAudio() {
  if (!audioEnabled) return;
  if (crowdGain) {
    const ac = getCtx();
    crowdGain.gain.setTargetAtTime(0, ac.currentTime, 0.5);
  }
}
