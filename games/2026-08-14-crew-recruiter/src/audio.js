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

/** Per-phase audio profile: vol = crowd gain, oscFreq = sub rumble Hz, rampTime = gain ramp speed */
const PHASE_AUDIO_PROFILE = {
  setup:      { vol: 0.025, oscFreq: 55,  rampTime: 1.2 },
  soundcheck: { vol: 0.05,  oscFreq: 60,  rampTime: 0.9 },
  opening:    { vol: 0.09,  oscFreq: 65,  rampTime: 0.7 },
  climax:     { vol: 0.18,  oscFreq: 90,  rampTime: 0.4 }, // bass peak: loud + punchy sub
  breakdown:  { vol: 0.07,  oscFreq: 45,  rampTime: 1.5 }, // inverse pad: quiet + low rumble
  recap:      { vol: 0.05,  oscFreq: 55,  rampTime: 1.0 }
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
 * Ramp crowd ambient to phase volume and oscillator frequency.
 * @param {string} phaseName
 */
export function setCrowdForPhase(phaseName) {
  if (!audioEnabled || !crowdGain) return;
  const ac      = getCtx();
  const profile = PHASE_AUDIO_PROFILE[phaseName] ?? { vol: 0.05, oscFreq: 60, rampTime: 0.8 };
  crowdGain.gain.cancelScheduledValues(ac.currentTime);
  crowdGain.gain.setTargetAtTime(profile.vol, ac.currentTime, profile.rampTime);
  if (crowdOsc) {
    crowdOsc.frequency.cancelScheduledValues(ac.currentTime);
    crowdOsc.frequency.setTargetAtTime(profile.oscFreq, ac.currentTime, profile.rampTime);
  }
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
