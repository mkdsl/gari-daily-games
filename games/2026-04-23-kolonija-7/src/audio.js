// src/audio.js — Kolonija 7 Web Audio zvuci generisani programski

let ctx = null;
let droneGain = null;
let initialized = false;

function unlock() {
  if (initialized) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  initialized = true;
  startDrone();
}

// Ambient drone — 40Hz + 80Hz oscilatori, veoma tiho (zemlja koja diše)
function startDrone() {
  droneGain = ctx.createGain();
  droneGain.gain.setValueAtTime(0, ctx.currentTime);
  droneGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
  droneGain.connect(ctx.destination);

  [40, 80].forEach(freq => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(droneGain);
    osc.start();
  });
}

// Thud zvuk iskopavanja — kratki noise burst 80ms
function playDig() {
  if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

// Tik zvuk skupljanja resursa — 880Hz sine, 30ms
function playCollect() {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 880;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}

// Bura warning — narastajući bijeli šum, fade in 2s
function playStormWarning() {
  if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

// Bura udar — visokofrekventni šum impact 0.3s
function playStormImpact() {
  if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6, ctx.currentTime);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

// Kristal pronađen — uzlazni tonovi, uplifting (C5→E5→G5→C6)
function playCrystal() {
  if (!ctx) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

export function initAudio() {
  ['click', 'touchstart', 'keydown'].forEach(ev =>
    document.addEventListener(ev, unlock, { once: true })
  );
}

// Globalni interface za pozivanje iz sistema bez importa
window.K7audio = {
  playDig,
  playCollect,
  playStormWarning,
  playStormImpact,
  playCrystal
};
