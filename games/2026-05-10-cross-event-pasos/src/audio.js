// audio.js — Web Audio API, 5 zvukova, lazy init
let ctx = null;

export function initAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    // Audio nije dostupan — sve je opciono
  }
}

function getCtx() { return ctx; }

// Utility: kreiraj oscilator i odsviraj ga
function playTone(freq, type, startT, duration, gainVal = 0.18) {
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startT);
  gain.gain.setValueAtTime(gainVal, startT);
  gain.gain.exponentialRampToValueAtTime(0.001, startT + duration);
  osc.start(startT);
  osc.stop(startT + duration);
}

function playNoise(startT, duration, gainVal = 0.08) {
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src  = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buffer;
  src.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(gainVal, startT);
  gain.gain.exponentialRampToValueAtTime(0.001, startT + duration);
  src.start(startT);
}

// ─── 5 zvukova ────────────────────────────────────────────────────────────────────

// 1. Otvaranje pasoša — noise sweep 0.3s
export function playOpen() {
  if (!ctx) return;
  const t = ctx.currentTime;
  playNoise(t, 0.3, 0.06);
  playTone(180, 'sine', t, 0.3, 0.08);
}

// 2. Utiskivanje pečata — noise burst 200Hz 0.1s
export function playStamp() {
  if (!ctx) return;
  const t = ctx.currentTime;
  playNoise(t, 0.12, 0.15);
  playTone(200, 'sawtooth', t, 0.08, 0.1);
}

// 3. Reward unlock — 3-note fanfar E4-G4-C5
export function playUnlock() {
  if (!ctx) return;
  const t = ctx.currentTime;
  // E4=329.63, G4=392, C5=523.25
  playTone(329.63, 'triangle', t,        0.15, 0.2);
  playTone(392,    'triangle', t + 0.15, 0.15, 0.2);
  playTone(523.25, 'triangle', t + 0.30, 0.25, 0.22);
}

// 4. Hover — 20ms sine 800Hz
export function playHover() {
  if (!ctx) return;
  const t = ctx.currentTime;
  playTone(800, 'sine', t, 0.02, 0.04);
}

// 5. Export — noise burst 0.2s
export function playExport() {
  if (!ctx) return;
  const t = ctx.currentTime;
  playNoise(t, 0.2, 0.12);
  playTone(440, 'sine', t, 0.15, 0.1);
}
