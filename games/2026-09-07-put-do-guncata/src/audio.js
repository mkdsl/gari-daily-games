/**
 * audio.js — Web Audio API ambients + SFX, bez .mp3 fajlova
 * Sve je synthesizovano u kodu.
 */

/** @type {AudioContext|null} */
let ctx = null;

/** @type {GainNode|null} */
let masterGain = null;

/** @type {{ source: AudioNode|null, gain: GainNode|null, name: string|null }} */
let ambientState = { source: null, gain: null, name: null };

const MASTER_VOLUME = 0.55;
const AMBIENT_VOLUME = 0.35;
const SFX_VOLUME = 0.55;

// ============================================================
// Inicijalizacija
// ============================================================

/**
 * Kreira AudioContext (lazy — poziva se na prvom user gesture-u).
 * Bezbedno za pozivanje više puta.
 */
export function initAudio() {
  if (ctx) return ctx;
  try {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(MASTER_VOLUME, ctx.currentTime);
    masterGain.connect(ctx.destination);
    return ctx;
  } catch (e) {
    console.warn('[audio] Web Audio API nije dostupan:', e);
    ctx = null;
    return null;
  }
}

/** @returns {boolean} */
function isReady() {
  if (!ctx || !masterGain) return false;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return true;
}

// ============================================================
// Ambijenti — synthesizovani
// ============================================================

/**
 * Svirana scena → audio parametri
 * @param {string} scene
 * @returns {{ type: string, freqLow: number, freqHigh: number, noiseType: string, extras: string[] }}
 */
function getAmbientParams(scene) {
  switch (scene) {
    case 'city':
      return { freqLow: 40, freqHigh: 80, noiseType: 'brown', extras: ['horn', 'distant_traffic'] };
    case 'highway':
      return { freqLow: 100, freqHigh: 400, noiseType: 'brown', extras: [] };
    case 'highway_night':
      return { freqLow: 80, freqHigh: 300, noiseType: 'brown', extras: ['crickets'] };
    case 'forest':
      return { freqLow: 200, freqHigh: 1200, noiseType: 'pink', extras: ['birds'] };
    case 'lake':
      return { freqLow: 150, freqHigh: 800, noiseType: 'pink', extras: ['frogs'] };
    case 'lake_night':
      return { freqLow: 80, freqHigh: 400, noiseType: 'pink', extras: ['frogs', 'silence'] };
    default:
      return { freqLow: 100, freqHigh: 400, noiseType: 'pink', extras: [] };
  }
}

/**
 * Kreira white noise buffer.
 * @param {AudioContext} actx
 * @param {number} [seconds=3]
 * @returns {AudioBuffer}
 */
function makeNoiseBuffer(actx, seconds = 3) {
  const sampleRate = actx.sampleRate;
  const length = sampleRate * seconds;
  const buf = actx.createBuffer(1, length, sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

/**
 * Kreira beli šum filtriran bandpass filterom.
 * @param {AudioContext} actx
 * @param {number} freqLow
 * @param {number} freqHigh
 * @param {GainNode} destination
 * @param {number} gainValue
 * @returns {{ stop: () => void }}
 */
function makeFilteredNoise(actx, freqLow, freqHigh, destination, gainValue = 0.3) {
  const buf = makeNoiseBuffer(actx);
  const source = actx.createBufferSource();
  source.buffer = buf;
  source.loop = true;

  const filter = actx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime((freqLow + freqHigh) / 2, actx.currentTime);
  filter.Q.setValueAtTime(0.8, actx.currentTime);

  const gain = actx.createGain();
  gain.gain.setValueAtTime(gainValue, actx.currentTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start();

  return {
    stop: () => {
      try { source.stop(); } catch (_) {}
    }
  };
}

/**
 * Kreira "crkvetu" (cricket-like) oscilator.
 * @param {AudioContext} actx
 * @param {GainNode} destination
 * @returns {{ stop: () => void }}
 */
function makeCrickets(actx, destination) {
  const nodes = [];
  const CRICKET_COUNT = 4;
  for (let i = 0; i < CRICKET_COUNT; i++) {
    const osc = actx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200 + Math.random() * 800, actx.currentTime);

    const lfo = actx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(8 + Math.random() * 6, actx.currentTime);

    const lfoGain = actx.createGain();
    lfoGain.gain.setValueAtTime(0.04, actx.currentTime);

    const gain = actx.createGain();
    gain.gain.setValueAtTime(0.0, actx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(destination);

    osc.start(actx.currentTime + i * 0.4);
    lfo.start(actx.currentTime + i * 0.4);
    nodes.push(osc, lfo);
  }
  return {
    stop: () => nodes.forEach(n => { try { n.stop(); } catch (_) {} })
  };
}

/**
 * Kreira zvuke žaba (low sine oscillators sa AM).
 * @param {AudioContext} actx
 * @param {GainNode} destination
 * @param {number} gainValue
 * @returns {{ stop: () => void }}
 */
function makeFrogs(actx, destination, gainValue = 0.12) {
  const nodes = [];
  const FROG_COUNT = 3;
  for (let i = 0; i < FROG_COUNT; i++) {
    const osc = actx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180 + i * 40, actx.currentTime);

    const lfo = actx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(1.2 + i * 0.3, actx.currentTime);

    const lfoGain = actx.createGain();
    lfoGain.gain.setValueAtTime(gainValue * 0.5, actx.currentTime);

    const gain = actx.createGain();
    gain.gain.setValueAtTime(gainValue * 0.5, actx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(destination);

    osc.start(actx.currentTime + i * 0.7);
    lfo.start(actx.currentTime + i * 0.7);
    nodes.push(osc, lfo);
  }
  return {
    stop: () => nodes.forEach(n => { try { n.stop(); } catch (_) {} })
  };
}

/**
 * Kreira zvukove ptica (sine bursts).
 * @param {AudioContext} actx
 * @param {GainNode} destination
 * @returns {{ stop: () => void }}
 */
function makeBirds(actx, destination) {
  let running = true;
  const nodes = [];

  function scheduleBird(delayMs) {
    if (!running) return;
    const t = actx.currentTime + delayMs / 1000;
    const osc = actx.createOscillator();
    osc.type = 'sine';
    const baseFreq = 1800 + Math.random() * 1200;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, t + 0.08);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, t + 0.18);

    const gain = actx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.04);
    gain.gain.linearRampToValueAtTime(0, t + 0.22);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(t);
    osc.stop(t + 0.25);
    nodes.push(osc);

    if (running) {
      setTimeout(() => scheduleBird(800 + Math.random() * 2500), delayMs + 300);
    }
  }

  scheduleBird(200);
  scheduleBird(1400);

  return {
    stop: () => {
      running = false;
      nodes.forEach(n => { try { n.stop(); } catch (_) {} });
    }
  };
}

/**
 * Kreira distant horn (city ambient).
 * @param {AudioContext} actx
 * @param {GainNode} destination
 * @returns {{ stop: () => void }}
 */
function makeHorn(actx, destination) {
  let running = true;

  function scheduleHorn(delayMs) {
    if (!running) return;
    const t = actx.currentTime + delayMs / 1000;
    const osc = actx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);

    const filter = actx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    const gain = actx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
    gain.gain.setValueAtTime(0.04, t + 0.5);
    gain.gain.linearRampToValueAtTime(0, t + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(t);
    osc.stop(t + 0.7);

    if (running) {
      setTimeout(() => scheduleHorn(4000 + Math.random() * 8000), delayMs + 1000);
    }
  }

  scheduleHorn(1000);
  return {
    stop: () => { running = false; }
  };
}

/** Čuva sve aktivne "extras" node-ove za stopAmbient */
let extrasCleanup = [];

/**
 * Pušta ambient za datu scenu.
 * Prethodni ambient se fade-out-uje.
 * @param {'city'|'highway'|'highway_night'|'forest'|'lake'|'lake_night'} scene
 */
export function playAmbient(scene) {
  if (!isReady()) return;
  if (ambientState.name === scene) return;

  // Fade out stari
  stopAmbient();

  const params = getAmbientParams(scene);

  // Ambient gain
  const ambientGain = ctx.createGain();
  ambientGain.gain.setValueAtTime(0, ctx.currentTime);
  ambientGain.gain.linearRampToValueAtTime(AMBIENT_VOLUME, ctx.currentTime + 1.5);
  ambientGain.connect(masterGain);

  // Baza — filtered noise
  const noise = makeFilteredNoise(ctx, params.freqLow, params.freqHigh, ambientGain, 0.5);

  const extras = [];

  // Extras
  if (params.extras.includes('crickets')) {
    extras.push(makeCrickets(ctx, ambientGain));
  }
  if (params.extras.includes('frogs')) {
    const vol = scene === 'lake_night' ? 0.18 : 0.1;
    extras.push(makeFrogs(ctx, ambientGain, vol));
  }
  if (params.extras.includes('birds')) {
    extras.push(makeBirds(ctx, ambientGain));
  }
  if (params.extras.includes('horn')) {
    extras.push(makeHorn(ctx, ambientGain));
  }

  extrasCleanup = [noise, ...extras];

  ambientState = {
    source: null,
    gain: ambientGain,
    name: scene
  };
}

/**
 * Fade out i zaustavi aktivan ambient.
 */
export function stopAmbient() {
  if (!ctx || !ambientState.gain) return;

  const gain = ambientState.gain;
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.8);

  // Cleanup posle fade-out-a
  const cleanupList = [...extrasCleanup];
  setTimeout(() => {
    cleanupList.forEach(n => n.stop && n.stop());
    try { gain.disconnect(); } catch (_) {}
  }, 900);

  extrasCleanup = [];
  ambientState = { source: null, gain: null, name: null };
}

// ============================================================
// SFX
// ============================================================

/**
 * Pušta imenovani SFX.
 * @param {'tap_success'|'tap_fail'|'event_good'|'event_bad'|'whoosh'|'screen_shake_sfx'|'radio_static'|'ding'} name
 */
export function playEffect(name) {
  if (!isReady()) return;

  try {
    switch (name) {
      case 'tap_success':  _sfxTapSuccess();    break;
      case 'tap_fail':     _sfxTapFail();       break;
      case 'event_good':   _sfxEventGood();     break;
      case 'event_bad':    _sfxEventBad();      break;
      case 'whoosh':       _sfxWhoosh();        break;
      case 'screen_shake_sfx': _sfxShake();    break;
      case 'radio_static': _sfxRadioStatic();  break;
      case 'ding':         _sfxDing();          break;
      default:
        console.warn('[audio] Nepoznat SFX:', name);
    }
  } catch (e) {
    console.warn('[audio] SFX greška:', name, e);
  }
}

/** Kratki sine up-glide (200→800Hz, 150ms) */
function _sfxTapSuccess() {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(SFX_VOLUME * 0.5, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.17);
}

/** Kratki noise burst (200ms, filtered) */
function _sfxTapFail() {
  const buf = makeNoiseBuffer(ctx, 0.3);
  const source = ctx.createBufferSource();
  source.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(300, ctx.currentTime);
  filter.Q.setValueAtTime(1.5, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(SFX_VOLUME * 0.4, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start();
  source.stop(ctx.currentTime + 0.22);
}

/** Bright tone (800Hz, 200ms, envelope) */
function _sfxEventGood() {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(SFX_VOLUME * 0.6, ctx.currentTime + 0.02);
  gain.gain.setValueAtTime(SFX_VOLUME * 0.5, ctx.currentTime + 0.12);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.24);
}

/** Down-glide (600→200Hz, 200ms) */
function _sfxEventBad() {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(SFX_VOLUME * 0.45, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.24);
}

/** Filtered noise sweep (left to right pan, 300ms) */
function _sfxWhoosh() {
  const buf = makeNoiseBuffer(ctx, 0.4);
  const source = ctx.createBufferSource();
  source.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(3000, ctx.currentTime + 0.3);
  filter.Q.setValueAtTime(1, ctx.currentTime);

  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(-1, ctx.currentTime);
  panner.pan.linearRampToValueAtTime(1, ctx.currentTime + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(SFX_VOLUME * 0.6, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.32);

  source.connect(filter);
  filter.connect(panner);
  panner.connect(gain);
  gain.connect(masterGain);
  source.start();
  source.stop(ctx.currentTime + 0.34);
}

/** Low thud (80Hz, 100ms) */
function _sfxShake() {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.1);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(SFX_VOLUME * 0.8, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.14);
}

/** White noise burst filtered, 300ms */
function _sfxRadioStatic() {
  const buf = makeNoiseBuffer(ctx, 0.4);
  const source = ctx.createBufferSource();
  source.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  filter.Q.setValueAtTime(0.5, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(SFX_VOLUME * 0.35, ctx.currentTime + 0.02);
  gain.gain.setValueAtTime(SFX_VOLUME * 0.3, ctx.currentTime + 0.25);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.32);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start();
  source.stop(ctx.currentTime + 0.34);
}

/** Metallic sine (1200Hz, 300ms, quick decay) */
function _sfxDing() {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);

  // Harmonik
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(2400, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(SFX_VOLUME * 0.55, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(SFX_VOLUME * 0.2, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc.connect(gain);
  osc2.connect(gain2);
  gain.connect(masterGain);
  gain2.connect(masterGain);

  osc.start();
  osc2.start();
  osc.stop(ctx.currentTime + 0.37);
  osc2.stop(ctx.currentTime + 0.22);
}

// ============================================================
// Utility
// ============================================================

/**
 * Postavi master volume (0–1).
 * @param {number} vol
 */
export function setMasterVolume(vol) {
  if (!masterGain || !ctx) return;
  masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), ctx.currentTime);
}

/**
 * Tiho isključi sve zvuke (mute/unmute toggle).
 * @param {boolean} muted
 */
export function setMuted(muted) {
  setMasterVolume(muted ? 0 : MASTER_VOLUME);
}

/** Da li je AudioContext aktivan? */
export function isAudioActive() {
  return !!(ctx && ctx.state === 'running');
}
