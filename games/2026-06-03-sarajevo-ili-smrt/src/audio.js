// ============================================================
//  audio.js — Sarajevo ili Smrt
//  Ceca Čujka — Web Audio API zvučni sistem
//  Sve generirano u kodu, bez .wav/.mp3/.ogg fajlova
// ============================================================

// ── State ────────────────────────────────────────────────────
/** @type {AudioContext|null} */
let audioCtx = null;

/** @type {GainNode|null} */
let masterGain = null;

/** @type {{ [kvart: string]: { nodes: AudioNode[], stop: () => void } }} */
let ambientNodes = {};

/** @type {string|null} */
let currentKvart = null;

/** @type {boolean} */
let isMuted = false;

/** @type {number} */
let masterVolume = 0.8;

/** @type {number|null} */
let schedulerTimer = null;

// ── Scheduler state za ambijentne looope ─────────────────────
const schedulerState = {
  nextNoteTime: 0,
  noteIndex: 0,
  patternStep: 0,
  active: false,
  kvart: null,
};

// ── Konstante ────────────────────────────────────────────────
const LOOK_AHEAD_S  = 0.1;   // koliko unaprijed schedulujemo (s)
const SCHEDULE_MS   = 50;    // interval scheduler timera (ms)

const SCALES = {
  bascarsija: [220, 246.9, 261.6, 293.7, 329.6, 349.2, 392.0], // A natural minor
  marijin_dvor: [440, 523.25, 587.33, 659.25],                   // tech house arpeggio
};

// ── Pomoćne funkcije ─────────────────────────────────────────

/**
 * Lazy inicijalizacija AudioContext.
 * Mora se pozvati iz user gesture handler-a.
 * @returns {AudioContext}
 */
function getCtx() {
  if (!audioCtx) {
    // @ts-ignore — webkit prefix za stariji Safari
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

/**
 * Napravi programski impulse response za ConvolverNode reverb.
 * @param {AudioContext} ctx
 * @param {number} decay  - trajanje reverba u sekundama
 * @returns {ConvolverNode}
 */
function createReverb(ctx, decay = 2.0) {
  const convolver = ctx.createConvolver();
  const length    = Math.floor(ctx.sampleRate * decay);
  const impulse   = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

/**
 * Napravi kratki oscilatorni ton sa ADSR envelope.
 * @param {AudioContext} ctx
 * @param {AudioNode}    destination
 * @param {number}       freq
 * @param {'sine'|'sawtooth'|'square'|'triangle'} type
 * @param {number}       startTime
 * @param {number}       duration
 * @param {number}       attack
 * @param {number}       release
 * @param {number}       volume
 */
function playTone(ctx, destination, freq, type, startTime, duration, attack, release, volume) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type            = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attack);
  gain.gain.setValueAtTime(volume, startTime + duration - release);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

/**
 * Napravi white noise buffer source.
 * @param {AudioContext} ctx
 * @param {number}       durationS
 * @param {boolean}      loop
 * @returns {AudioBufferSourceNode}
 */
function createWhiteNoise(ctx, durationS = 2.0, loop = false) {
  const bufLen = Math.floor(ctx.sampleRate * durationS);
  const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data   = buffer.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src  = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop   = loop;
  return src;
}

/**
 * Napravi BiquadFilter.
 * @param {AudioContext} ctx
 * @param {'lowpass'|'highpass'|'bandpass'|'peaking'} type
 * @param {number} freq
 * @param {number} [q]
 * @returns {BiquadFilterNode}
 */
function createFilter(ctx, type, freq, q = 1.0) {
  const f = ctx.createBiquadFilter();
  f.type            = type;
  f.frequency.value = freq;
  f.Q.value         = q;
  return f;
}

/**
 * Cleanup helper — zaustavlja sve AudioNode-ove koji su pratili ambient.
 * @param {string} kvart
 */
function stopKvartNodes(kvart) {
  const entry = ambientNodes[kvart];
  if (!entry) return;
  try { entry.stop(); } catch (_) { /* već zaustavljen */ }
  delete ambientNodes[kvart];
}

// ── Scheduler engine ─────────────────────────────────────────
// Koristi classic Web Audio look-ahead pattern (Chris Wilson).

/**
 * Zaustavi scheduler loop.
 */
function stopScheduler() {
  schedulerState.active = false;
  if (schedulerTimer !== null) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
  }
}

/**
 * Pokreni scheduler loop za zadati kvart.
 * @param {string} kvart
 */
function startScheduler(kvart) {
  stopScheduler();
  schedulerState.active    = true;
  schedulerState.kvart     = kvart;
  schedulerState.noteIndex = 0;
  schedulerState.patternStep = 0;
  schedulerState.nextNoteTime = getCtx().currentTime + 0.05;
  scheduleLoop();
}

function scheduleLoop() {
  if (!schedulerState.active) return;
  const ctx = getCtx();

  while (schedulerState.nextNoteTime < ctx.currentTime + LOOK_AHEAD_S) {
    scheduleNextBeat(ctx, schedulerState.kvart, schedulerState.nextNoteTime);
    advanceScheduler(schedulerState.kvart);
  }

  schedulerTimer = window.setTimeout(scheduleLoop, SCHEDULE_MS);
}

/**
 * Napreduj scheduler za jedan korak (izračunaj trajanje jednog step-a po BPM-u).
 * @param {string} kvart
 */
function advanceScheduler(kvart) {
  const bpm = kvart === 'bascarsija' ? 75 : kvart === 'grbavica' ? 85 : 120;
  const secondsPerBeat = 60.0 / bpm;

  // Korak = 1/16 note (za precizno hi-hat pattern)
  const stepDuration = secondsPerBeat / 4;

  schedulerState.nextNoteTime += stepDuration;
  schedulerState.patternStep   = (schedulerState.patternStep + 1) % 16;

  // Melody note index napreduje sporije (svaka 4 step-a = 1 beat)
  if (schedulerState.patternStep % 4 === 0) {
    schedulerState.noteIndex++;
  }
}

/**
 * Schedula zvukove za jedan 16th-note step.
 * @param {AudioContext} ctx
 * @param {string}       kvart
 * @param {number}       time
 */
function scheduleNextBeat(ctx, kvart, time) {
  if (!ambientNodes[kvart]) return; // kvart je zaustavljen

  const step      = schedulerState.patternStep;
  const beatIndex = Math.floor(step / 4); // 0–3 = beat unutar mjere

  if (kvart === 'bascarsija') {
    scheduleBascarsija(ctx, step, beatIndex, time);
  } else if (kvart === 'marijin_dvor') {
    scheduleMarijinDvor(ctx, step, beatIndex, time);
  } else if (kvart === 'grbavica') {
    scheduleGrbavica(ctx, step, beatIndex, time);
  }
}

// ── BAŠČARŠIJA — Sevdah-Elektronika ──────────────────────────

/** @type {ConvolverNode|null} */
let bascarsija_reverb = null;
/** @type {GainNode|null}      */
let bascarsija_reverbGain = null;

/**
 * Inicijalizuj statički reverb za Baščaršiju (kreira se jednom).
 * @param {AudioContext} ctx
 */
function initBascarsija(ctx) {
  bascarsija_reverb     = createReverb(ctx, 2.5);
  bascarsija_reverbGain = ctx.createGain();
  bascarsija_reverbGain.gain.value = 0.65; // wet 65%

  bascarsija_reverb.connect(bascarsija_reverbGain);
  bascarsija_reverbGain.connect(masterGain);
}

/**
 * @param {AudioContext} ctx
 * @param {number}       step
 * @param {number}       beatIndex
 * @param {number}       time
 */
function scheduleBascarsija(ctx, step, beatIndex, time) {
  const scale       = SCALES.bascarsija;
  const secondsPerBeat = 60.0 / 75;
  const noteDuration   = 0.8;

  // Bass: na svakom beatu (step % 4 === 0), A2 = 110Hz
  if (step % 4 === 0) {
    const bassOsc  = ctx.createOscillator();
    const bassGain = ctx.createGain();

    bassOsc.type            = 'sine';
    bassOsc.frequency.value = 110;

    bassGain.gain.setValueAtTime(0, time);
    bassGain.gain.linearRampToValueAtTime(0.6, time + 0.05);
    bassGain.gain.setValueAtTime(0.6, time + noteDuration - 0.3);
    bassGain.gain.linearRampToValueAtTime(0, time + noteDuration);

    bassOsc.connect(bassGain);
    bassGain.connect(masterGain);
    if (bascarsija_reverb) {
      bassGain.connect(bascarsija_reverb);
    }
    bassOsc.start(time);
    bassOsc.stop(time + noteDuration + 0.05);
  }

  // Melodija: svaki 4. beat (jedan korak naprijed u skali) + random walk
  if (step % 8 === 0) {
    const noteIdx = schedulerState.noteIndex % scale.length;
    // Mali random walk — ponekad skoči na susjedni stepen
    const offset  = Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0;
    const safeIdx = Math.max(0, Math.min(scale.length - 1, noteIdx + offset));
    const freq    = scale[safeIdx];

    const melOsc  = ctx.createOscillator();
    const melGain = ctx.createGain();

    melOsc.type            = 'sine';
    melOsc.frequency.value = freq;

    melGain.gain.setValueAtTime(0, time);
    melGain.gain.linearRampToValueAtTime(0.4, time + 0.8); // spori attack = 0.8s
    melGain.gain.setValueAtTime(0.4, time + noteDuration - 1.2);
    melGain.gain.linearRampToValueAtTime(0, time + noteDuration + 1.2);

    melOsc.connect(melGain);
    melGain.connect(masterGain);
    if (bascarsija_reverb) {
      melGain.connect(bascarsija_reverb);
    }
    melOsc.start(time);
    melOsc.stop(time + noteDuration + 1.5);
  }
}

// ── MARIJIN DVOR — Tech House ─────────────────────────────────

/** @type {ConvolverNode|null} */
let marijin_reverb = null;
/** @type {GainNode|null}      */
let marijin_reverbGain = null;

/**
 * Inicijalizuj reverb za Marijin Dvor.
 * @param {AudioContext} ctx
 */
function initMarijinDvor(ctx) {
  marijin_reverb     = createReverb(ctx, 0.4);
  marijin_reverbGain = ctx.createGain();
  marijin_reverbGain.gain.value = 0.25; // wet 25%

  marijin_reverb.connect(marijin_reverbGain);
  marijin_reverbGain.connect(masterGain);
}

/**
 * @param {AudioContext} ctx
 * @param {number}       step
 * @param {number}       beatIndex
 * @param {number}       time
 */
function scheduleMarijinDvor(ctx, step, beatIndex, time) {
  const scale          = SCALES.marijin_dvor;
  const secondsPerBeat = 60.0 / 120;
  const stepDur        = secondsPerBeat / 4;

  // Kick: 4/4 downbeats (step 0, 4, 8, 12)
  if (step % 4 === 0) {
    const kickOsc  = ctx.createOscillator();
    const kickGain = ctx.createGain();

    kickOsc.type              = 'sine';
    kickOsc.frequency.setValueAtTime(55, time);
    kickOsc.frequency.exponentialRampToValueAtTime(28, time + 0.3);

    kickGain.gain.setValueAtTime(0.9, time + 0.001);
    kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    kickOsc.connect(kickGain);
    kickGain.connect(masterGain);
    kickOsc.start(time);
    kickOsc.stop(time + 0.32);
  }

  // Hi-hat: off-beat = step 2, 6, 10, 14 (8th note offbeats)
  if (step % 4 === 2) {
    const noiseNode  = createWhiteNoise(ctx, 0.08);
    const hihatFilter = createFilter(ctx, 'highpass', 8000, 1.0);
    const hihatGain  = ctx.createGain();

    hihatGain.gain.setValueAtTime(0.15, time);
    hihatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    noiseNode.connect(hihatFilter);
    hihatFilter.connect(hihatGain);
    hihatGain.connect(masterGain);
    noiseNode.start(time);
    noiseNode.stop(time + 0.09);
  }

  // Melodija (sawtooth arpeggio): svaki 2 beata napreduje kroz scale
  if (step % 8 === 4) {
    const noteIdx = schedulerState.noteIndex % scale.length;
    const freq    = scale[noteIdx];

    const melOsc  = ctx.createOscillator();
    const melGain = ctx.createGain();

    melOsc.type            = 'sawtooth';
    melOsc.frequency.value = freq;

    melGain.gain.setValueAtTime(0, time);
    melGain.gain.linearRampToValueAtTime(0.3, time + 0.01);
    melGain.gain.setValueAtTime(0.3, time + stepDur * 1.5);
    melGain.gain.linearRampToValueAtTime(0, time + stepDur * 2);

    melOsc.connect(melGain);
    melGain.connect(masterGain);
    if (marijin_reverb) {
      melGain.connect(marijin_reverb);
    }
    melOsc.start(time);
    melOsc.stop(time + stepDur * 2 + 0.05);
  }
}

// ── GRBAVICA — Hip-Hop Balkanski Fusion ──────────────────────

/** @type {ConvolverNode|null} */
let grbavica_reverb = null;
/** @type {GainNode|null}      */
let grbavica_reverbGain = null;
/** @type {AudioBufferSourceNode|null} */
let grbavica_crackleSource = null;
/** @type {number|null} */
let grbavica_popTimer = null;

/**
 * Inicijalizuj reverb za Grbavicu.
 * @param {AudioContext} ctx
 */
function initGrbavica(ctx) {
  grbavica_reverb     = createReverb(ctx, 0.8);
  grbavica_reverbGain = ctx.createGain();
  grbavica_reverbGain.gain.value = 0.35; // wet 35%

  grbavica_reverb.connect(grbavica_reverbGain);
  grbavica_reverbGain.connect(masterGain);
}

/**
 * Pokreni vinyl crackle petlju (kontinuirani white noise + bandpass).
 * @param {AudioContext} ctx
 */
function startVinylCrackle(ctx) {
  stopVinylCrackle();

  const noiseNode    = createWhiteNoise(ctx, 3.0, true);
  const crackleFilter = createFilter(ctx, 'bandpass', 3000, 1.5);
  const crackleGain  = ctx.createGain();

  crackleGain.gain.value = 0.08;

  noiseNode.connect(crackleFilter);
  crackleFilter.connect(crackleGain);
  crackleGain.connect(masterGain);
  noiseNode.start();

  grbavica_crackleSource = noiseNode;

  // Random "pop" zvuci ~2/sec
  scheduleVinylPop(ctx);
}

/**
 * Rekurzivni scheduler za vinyl pop event-e.
 * @param {AudioContext} ctx
 */
function scheduleVinylPop(ctx) {
  if (!ambientNodes['grbavica']) return;

  // Sljedeći pop za između 0.2 – 0.8 sec
  const delay = 200 + Math.random() * 600;

  grbavica_popTimer = window.setTimeout(() => {
    if (!ambientNodes['grbavica']) return;

    const popTime = ctx.currentTime + 0.01;
    const pop     = createWhiteNoise(ctx, 0.05);
    const popGain = ctx.createGain();

    popGain.gain.setValueAtTime(0.3 + Math.random() * 0.3, popTime);
    popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.04);

    pop.connect(popGain);
    popGain.connect(masterGain);
    pop.start(popTime);
    pop.stop(popTime + 0.06);

    scheduleVinylPop(ctx);
  }, delay);
}

/**
 * Zaustavi vinyl crackle.
 */
function stopVinylCrackle() {
  if (grbavica_crackleSource) {
    try { grbavica_crackleSource.stop(); } catch (_) { /* ok */ }
    grbavica_crackleSource = null;
  }
  if (grbavica_popTimer !== null) {
    clearTimeout(grbavica_popTimer);
    grbavica_popTimer = null;
  }
}

/**
 * @param {AudioContext} ctx
 * @param {number}       step
 * @param {number}       beatIndex
 * @param {number}       time
 */
function scheduleGrbavica(ctx, step, beatIndex, time) {
  const secondsPerBeat = 60.0 / 85;
  const stepDur        = secondsPerBeat / 4;

  // Kick: downbeats (step 0, 4, 8, 12)
  if (step % 4 === 0) {
    const kickOsc  = ctx.createOscillator();
    const kickGain = ctx.createGain();

    kickOsc.type              = 'sine';
    kickOsc.frequency.setValueAtTime(65, time);
    kickOsc.frequency.exponentialRampToValueAtTime(30, time + 0.5);

    // Mid punch: sub osc na 150Hz
    const punchOsc  = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punchOsc.type             = 'sine';
    punchOsc.frequency.value  = 150;
    punchGain.gain.setValueAtTime(0.3, time + 0.002);
    punchGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    punchOsc.connect(punchGain);
    punchGain.connect(masterGain);
    punchOsc.start(time);
    punchOsc.stop(time + 0.1);

    kickGain.gain.setValueAtTime(0.9, time + 0.002);
    kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    kickOsc.connect(kickGain);
    kickGain.connect(masterGain);
    kickOsc.start(time);
    kickOsc.stop(time + 0.52);
  }

  // Snare: backbeat (step 4 i 12 = beat 2 i 4)
  if (step === 4 || step === 12) {
    const snare      = createWhiteNoise(ctx, 0.2);
    const snareFilt  = createFilter(ctx, 'bandpass', 1200, 1.5);
    const snareGain  = ctx.createGain();

    snareGain.gain.setValueAtTime(0.4, time + 0.001);
    snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    snare.connect(snareFilt);
    snareFilt.connect(snareGain);
    snareGain.connect(masterGain);
    if (grbavica_reverb) {
      snareGain.connect(grbavica_reverb);
    }
    snare.start(time);
    snare.stop(time + 0.2);
  }

  // Bass (square + WaveShaper distortion): svaki beat
  if (step % 4 === 0) {
    const bassOsc   = ctx.createOscillator();
    const shaper    = ctx.createWaveShaper();
    const bassGain  = ctx.createGain();

    bassOsc.type            = 'square';
    bassOsc.frequency.value = 82.4; // E2

    // Soft clip WaveShaper (gain = 0.6 distortion)
    const curve    = new Float32Array(256);
    const k        = 0.6 * 100; // drive
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
    }
    shaper.curve    = curve;
    shaper.oversample = '2x';

    bassGain.gain.setValueAtTime(0, time);
    bassGain.gain.linearRampToValueAtTime(0.7, time + 0.01);
    bassGain.gain.setValueAtTime(0.7, time + secondsPerBeat - 0.05);
    bassGain.gain.linearRampToValueAtTime(0, time + secondsPerBeat);

    bassOsc.connect(shaper);
    shaper.connect(bassGain);
    bassGain.connect(masterGain);
    if (grbavica_reverb) {
      bassGain.connect(grbavica_reverb);
    }
    bassOsc.start(time);
    bassOsc.stop(time + secondsPerBeat + 0.05);
  }
}

// ── PUBLIC API ────────────────────────────────────────────────

/**
 * Inicijalizuj AudioContext. Pozovi iz user gesture event-a.
 * @returns {AudioContext}
 */
export function initAudio() {
  const ctx = getCtx();
  // Ako je iOS/Safari u suspended stanju, pokušaj resume
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* iOS može odbiti bez gesture */ });
  }
  return ctx;
}

/**
 * Pokreni ambijentnu muziku za zadati kvart.
 * Automatski zaustavlja prethodni kvart.
 * @param {'bascarsija'|'marijin_dvor'|'grbavica'} kvart
 */
export function playKvartAmbient(kvart) {
  const ctx = getCtx();

  if (currentKvart === kvart) return; // već svira isti kvart

  // Zaustavi prethodni
  if (currentKvart) {
    stopKvartNodes(currentKvart);
  }
  stopScheduler();
  stopVinylCrackle();

  currentKvart = kvart;

  // Inicijalizuj reverb za kvart (lazy, jednom)
  if (kvart === 'bascarsija' && !bascarsija_reverb) initBascarsija(ctx);
  if (kvart === 'marijin_dvor' && !marijin_reverb)  initMarijinDvor(ctx);
  if (kvart === 'grbavica' && !grbavica_reverb)     initGrbavica(ctx);

  // Oznaka da je kvart aktivan (stop() poziva se kroz ambientNodes entry)
  ambientNodes[kvart] = {
    nodes: [],
    stop: () => {
      stopScheduler();
      if (kvart === 'grbavica') stopVinylCrackle();
    },
  };

  if (kvart === 'grbavica') {
    startVinylCrackle(ctx);
  }

  startScheduler(kvart);
}

/**
 * Zaustavi trenutni ambient.
 */
export function stopAmbient() {
  if (currentKvart) {
    stopKvartNodes(currentKvart);
  }
  stopScheduler();
  stopVinylCrackle();
  currentKvart = null;
}

/**
 * Pusti SFX zvuk po imenu.
 * @param {'lp_gain'|'unlock'|'prestige'|'legend_moment'|'bad_rep'|'click'} name
 */
export function playSFX(name) {
  const ctx = getCtx();
  if (ctx.state === 'suspended') return; // ne zvuči bez user gesture

  switch (name) {
    case 'lp_gain':       sfxLpGain(ctx);        break;
    case 'unlock':        sfxUnlock(ctx);         break;
    case 'prestige':      sfxPrestige(ctx);       break;
    case 'legend_moment': sfxLegendMoment(ctx);   break;
    case 'bad_rep':       sfxBadRep(ctx);         break;
    case 'click':         sfxClick(ctx);          break;
    default:
      console.warn('[audio] Nepoznat SFX:', name);
  }
}

/**
 * Postavi master volume.
 * @param {number} level - 0.0 – 1.0
 */
export function setVolume(level) {
  masterVolume = Math.max(0, Math.min(1, level));
  if (masterGain) {
    masterGain.gain.setTargetAtTime(
      isMuted ? 0 : masterVolume,
      getCtx().currentTime,
      0.05
    );
  }
}

/**
 * Resume AudioContext — pozovi na svaki user interaction za iOS Safari.
 */
export function resumeContext() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => { /* iOS može odbiti bez aktivan gesture */ });
  }
}

// ── SFX Implementacije ────────────────────────────────────────

/**
 * lp_gain — kvintu accord A4 + E5
 * @param {AudioContext} ctx
 */
function sfxLpGain(ctx) {
  const t     = ctx.currentTime;
  const notes = [440, 659.25];

  for (const freq of notes) {
    playTone(ctx, masterGain, freq, 'sine', t, 0.31, 0.01, 0.3, 0.5);
  }
}

/**
 * unlock — ascending pentatonic arpeggio C4 → D4 → E4 → G4 → C5
 * @param {AudioContext} ctx
 */
function sfxUnlock(ctx) {
  const t     = ctx.currentTime;
  const notes = [261.63, 293.66, 329.63, 392.0, 523.25];
  const dur   = 0.12;
  const gap   = 0.04;

  notes.forEach((freq, i) => {
    const startTime = t + i * (dur + gap);
    playTone(ctx, masterGain, freq, 'sine', startTime, dur, 0.01, 0.05, 0.6);
  });
}

/**
 * prestige — dramatic frequency sweep 200 → 800 Hz + reverb + delay
 * @param {AudioContext} ctx
 */
function sfxPrestige(ctx) {
  const t         = ctx.currentTime;
  const duration  = 2.0;

  // Convolver reverb
  const reverb     = createReverb(ctx, 3.0);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.8;
  reverb.connect(reverbGain);
  reverbGain.connect(masterGain);

  // Delay node
  const delay     = ctx.createDelay(1.0);
  const delFB     = ctx.createGain();
  delay.delayTime.value = 0.3;
  delFB.gain.value      = 0.4;
  delay.connect(delFB);
  delFB.connect(delay);
  delay.connect(masterGain);

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + duration);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.7, t + 0.1);
  gain.gain.setValueAtTime(0.7, t + duration - 0.3);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.connect(gain);
  gain.connect(masterGain);
  gain.connect(reverb);
  gain.connect(delay);

  osc.start(t);
  osc.stop(t + duration + 0.1);
}

/**
 * legend_moment — C5, E5, G5, C6 triangle arpeggio (crowd > 90)
 * @param {AudioContext} ctx
 */
function sfxLegendMoment(ctx) {
  const t     = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const gap   = 0.1;

  notes.forEach((freq, i) => {
    const startTime = t + i * gap;
    playTone(ctx, masterGain, freq, 'triangle', startTime, 0.85, 0.05, 0.8, 0.65);
  });
}

/**
 * bad_rep — frequency sweep down 440 → 110 Hz
 * @param {AudioContext} ctx
 */
function sfxBadRep(ctx) {
  const t        = ctx.currentTime;
  const duration = 0.6;

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(110, t + duration);

  gain.gain.setValueAtTime(0.5, t);
  gain.gain.setValueAtTime(0.5, t + duration - 0.1);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

/**
 * click — kratki UI beep 800 Hz / 0.05s
 * @param {AudioContext} ctx
 */
function sfxClick(ctx) {
  const t = ctx.currentTime;
  playTone(ctx, masterGain, 800, 'sine', t, 0.05, 0.005, 0.03, 0.3);
}
