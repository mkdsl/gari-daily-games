// audio.js — AudioManager: Web Audio API, bez .mp3
let ctx = null;
let ambientOsc = null;
let ambientNoise = null;
let ambientGain = null;
let subBassOsc = null;
let subBassGain = null;
let initialized = false;

export function initAudio() {
  if (initialized) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    _startAmbient();
    initialized = true;
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
}

function _startAmbient() {
  if (!ctx) return;

  // Low-frequency oscillator ~60Hz — klima uredjaj
  ambientGain = ctx.createGain();
  ambientGain.gain.setValueAtTime(0.02, ctx.currentTime);
  ambientOsc = ctx.createOscillator();
  ambientOsc.type = 'sine';
  ambientOsc.frequency.setValueAtTime(60, ctx.currentTime);
  ambientOsc.connect(ambientGain);
  ambientGain.connect(ctx.destination);
  ambientOsc.start();

  // White noise buffer
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2) - 1;

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.008, ctx.currentTime);

  // Low-pass filter na noise
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);

  noiseSource.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start();
  ambientNoise = noiseSource;
}

export function setScene(sceneName) {
  if (!ctx) return;
  if (sceneName === 'gari') {
    _addSubBass();
  } else {
    _removeSubBass();
  }
}

function _addSubBass() {
  if (!ctx || subBassOsc) return;
  subBassGain = ctx.createGain();
  subBassGain.gain.setValueAtTime(0.015, ctx.currentTime);
  subBassOsc = ctx.createOscillator();
  subBassOsc.type = 'sine';
  subBassOsc.frequency.setValueAtTime(40, ctx.currentTime);
  subBassOsc.connect(subBassGain);
  subBassGain.connect(ctx.destination);
  subBassOsc.start();
}

function _removeSubBass() {
  if (!subBassOsc) return;
  try {
    subBassGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    subBassOsc.stop(ctx.currentTime + 0.2);
  } catch(e) {}
  subBassOsc = null;
  subBassGain = null;
}

export function playClick() {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playDing() {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}

export function playSceneFade() {
  if (!ctx || !ambientGain) return;
  const now = ctx.currentTime;
  ambientGain.gain.linearRampToValueAtTime(0.005, now + 0.15);
  ambientGain.gain.linearRampToValueAtTime(0.02, now + 0.35);
}
