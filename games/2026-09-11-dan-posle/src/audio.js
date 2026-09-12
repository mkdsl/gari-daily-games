/**
 * audio.js — Web Audio API ambijenti po satu + SFX
 * Pokreće se na prvi klik (autoplay policy)
 */

import { AUDIO_CONFIG, STORAGE_KEYS } from './config.js';

let ctx = null;
let currentNodes = [];
let muted = false;

/** Inicijalizuj AudioContext (mora biti na user gesture) */
export function initAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    muted = loadMuted();
  } catch (e) {
    console.warn('Web Audio not available:', e);
  }
}

function loadMuted() {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUDIO_MUTED) === 'true';
  } catch { return false; }
}

export function setMuted(val) {
  muted = val;
  try { localStorage.setItem(STORAGE_KEYS.AUDIO_MUTED, val ? 'true' : 'false'); } catch {}
  if (val) stopAll();
}

export function isMuted() { return muted; }

/** Zaustavi sve tekuće nodove */
function stopAll() {
  for (const n of currentNodes) {
    try { n.stop(); } catch {}
  }
  currentNodes = [];
}

/** Kreira pink noise buffer */
function createNoiseBuffer(type = 'pink') {
  if (!ctx) return null;
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362) * 0.11;
    } else if (type === 'brown') {
      b0 = (b0 + (0.02 * white)) / 1.02;
      data[i] = b0 * 3.5;
    } else {
      data[i] = white * 0.5;
    }
  }
  return buffer;
}

/** Pokreni ambijent za dati sat */
export function startAmbient(hour) {
  if (!ctx || muted) return;
  stopAll();

  const cfg = AUDIO_CONFIG[hour] || AUDIO_CONFIG[7];
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(cfg.vol, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // Glavni oscilator
  const osc = ctx.createOscillator();
  osc.type = cfg.type;
  osc.frequency.setValueAtTime(cfg.freq, ctx.currentTime);

  // LFO za tremolo (ako je konfigurisan)
  if (cfg.lfo > 0 && cfg.lfo < 20) {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(cfg.lfo, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.3, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();
    currentNodes.push(lfo);
  }

  osc.connect(masterGain);
  osc.start();
  currentNodes.push(osc);

  // Noise
  if (cfg.noise && cfg.noiseVol > 0) {
    const buffer = createNoiseBuffer(cfg.noise);
    if (buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(cfg.noiseVol, ctx.currentTime);

      if (cfg.noise === 'band') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(0.5, ctx.currentTime);
        src.connect(filter);
        filter.connect(noiseGain);
      } else {
        src.connect(noiseGain);
      }
      noiseGain.connect(ctx.destination);
      src.start();
      currentNodes.push(src);
    }
  }

  // BPM pulse (ako je konfigurisan)
  if (cfg.bpm > 0) {
    schedulePulse(cfg.freq * 0.5, cfg.bpm, masterGain);
  }
}

function schedulePulse(freq, bpm, destination) {
  if (!ctx) return;
  const interval = 60 / bpm;
  let nextTime = ctx.currentTime + 0.1;

  function tick() {
    if (muted) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.15, nextTime);
    env.gain.exponentialRampToValueAtTime(0.001, nextTime + 0.08);

    const p = ctx.createOscillator();
    p.type = 'sine';
    p.frequency.setValueAtTime(freq, nextTime);
    p.connect(env);
    env.connect(destination);
    p.start(nextTime);
    p.stop(nextTime + 0.1);

    nextTime += interval;
    if (nextTime < ctx.currentTime + 10) {
      setTimeout(tick, (nextTime - ctx.currentTime - 0.5) * 1000);
    } else {
      setTimeout(tick, interval * 1000 * 0.5);
    }
  }
  setTimeout(tick, 100);
}

/** SFX: klik na opciju */
export function sfxClick() {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, t);
  env.gain.setValueAtTime(0.3, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  osc.connect(env);
  env.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

/** SFX: resurs gain */
export function sfxGain() {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(1400, t + 0.15);
  env.gain.setValueAtTime(0.25, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(env);
  env.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.22);
}

/** SFX: resurs loss */
export function sfxLoss() {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, t);
  env.gain.setValueAtTime(0.3, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(env);
  env.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.17);
}

/** SFX: ending swell */
export function sfxEndingSwell() {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 4);
  env.gain.setValueAtTime(0.001, t);
  env.gain.linearRampToValueAtTime(0.4, t + 2);
  env.gain.linearRampToValueAtTime(0.001, t + 5);
  osc.connect(env);
  env.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 5.5);
}

/** SFX: achievement unlock */
export function sfxAchievement() {
  if (!ctx || muted) return;
  const freqs = [523, 659, 784, 1047];
  freqs.forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.12;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    env.gain.setValueAtTime(0.2, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

/** Fade out ambijent (za kraj igre) */
export function fadeOutAmbient(duration = 3000) {
  if (!ctx) return;
  for (const n of currentNodes) {
    if (n.stop && typeof n.stop === 'function') {
      try {
        const t = ctx.currentTime;
        // Ako ima gain konekciju — fade out
        n.stop(t + duration / 1000);
      } catch {}
    }
  }
}
