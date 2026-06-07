/**
 * audio.js — Web Audio API, zero .mp3/.wav
 * Jutarnji ambijent, radni SFX, incident signal, prestiž crescendo
 */

import { bus, EVT } from './events.js';

let _ctx = null;
let _masterGain = null;
let _ambientPlaying = false;
let _ambientNodes = [];
let _enabled = true;

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _masterGain.gain.value = 0.7;
    _masterGain.connect(_ctx.destination);
  }
  return _ctx;
}

function resumeCtx() {
  const ac = getCtx();
  if (ac.state === 'suspended') ac.resume();
}

// === PUBLIC API ===
export function initAudio() {
  // Lazy init on first user interaction
  const unlock = () => {
    resumeCtx();
    document.removeEventListener('click', unlock);
    document.removeEventListener('keydown', unlock);
  };
  document.addEventListener('click', unlock);
  document.addEventListener('keydown', unlock);

  // Bus listeners
  bus.on(EVT.AUDIO_PLAY, ({ sound }) => playSound(sound));
  bus.on(EVT.AUDIO_AMBIENT_START, () => startAmbient());
  bus.on(EVT.AUDIO_AMBIENT_STOP, () => stopAmbient());
}

export function setVolume(v) {
  _enabled = v > 0;
  if (_masterGain) _masterGain.gain.value = v;
}

export function playSound(soundId) {
  if (!_enabled) return;
  resumeCtx();
  switch (soundId) {
    case 'incident_signal':   playIncidentSignal(); break;
    case 'decision_positive': playDecisionPositive(); break;
    case 'session_success':   playSessionSuccess(); break;
    case 'session_fail':      playSessionFail(); break;
    case 'prestige':          playPrestige(); break;
    case 'pauza_ambient':     playPauzaAmbient(); break;
    case 'ui_click':          playUIClick(); break;
    default: break;
  }
}

// === AMBIENT ===
export function startAmbient() {
  if (_ambientPlaying || !_enabled) return;
  resumeCtx();
  _ambientPlaying = true;

  // Morning bird calls (procedural)
  scheduleNextBirdCall();

  // Quiet wind
  startWindAmbient();
}

export function stopAmbient() {
  _ambientPlaying = false;
  _ambientNodes.forEach(n => {
    try { n.stop(); } catch {}
  });
  _ambientNodes = [];
}

function scheduleNextBirdCall() {
  if (!_ambientPlaying || !_enabled) return;
  const ac = getCtx();
  const delay = 200 + Math.random() * 600; // 200-800ms
  setTimeout(() => {
    if (!_ambientPlaying) return;
    const freq = 800 + Math.random() * 1600; // 800-2400Hz
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.06, ac.currentTime + 0.01);
    g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.05);
    osc.connect(g);
    g.connect(_masterGain);
    osc.start();
    osc.stop(ac.currentTime + 0.06);
    scheduleNextBirdCall();
  }, delay);
}

function startWindAmbient() {
  if (!_enabled) return;
  const ac = getCtx();

  // White noise buffer
  const bufSize = ac.sampleRate * 2;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);

  const source = ac.createBufferSource();
  source.buffer = buf;
  source.loop = true;

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;

  const g = ac.createGain();
  g.gain.value = 0.03;

  source.connect(filter);
  filter.connect(g);
  g.connect(_masterGain);
  source.start();

  _ambientNodes.push(source);
}

// === ACTIVITY SFX ===
function startWorkAmbient() {
  if (!_enabled) return;
  const ac = getCtx();

  const scheduleWork = () => {
    if (!_ambientPlaying) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 60 + Math.random() * 20;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.04, ac.currentTime + 0.01);
    g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.1);
    osc.connect(g);
    g.connect(_masterGain);
    osc.start();
    osc.stop(ac.currentTime + 0.12);
    setTimeout(scheduleWork, 2000 + Math.random() * 2000);
  };
  scheduleWork();
}

function playPauzaAmbient() {
  if (!_enabled) return;
  const ac = getCtx();
  // Grlica (dove): 500Hz + 1000Hz harmonik
  const now = ac.currentTime;
  [500, 1000].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.06, now + 0.05);
    g.gain.linearRampToValueAtTime(0.04, now + 0.3);
    g.gain.linearRampToValueAtTime(0, now + 0.8);
    osc.connect(g);
    g.connect(_masterGain);
    osc.start(now);
    osc.stop(now + 0.85);
  });

  // Water sound (noise + band-pass)
  const bufSize = ac.sampleRate;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);

  const source = ac.createBufferSource();
  source.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 600;
  filter.Q.value = 0.5;
  const g2 = ac.createGain();
  g2.gain.value = 0.05;
  source.connect(filter);
  filter.connect(g2);
  g2.connect(_masterGain);
  source.start(now + 0.5);
  source.stop(now + 1.5);
}

// === INCIDENT / DECISION ===
function playIncidentSignal() {
  if (!_enabled) return;
  const ac = getCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = 880;
  g.gain.value = 0.15;
  g.gain.linearRampToValueAtTime(0, now + 0.08);
  osc.connect(g);
  g.connect(_masterGain);
  osc.start(now);
  osc.stop(now + 0.09);
}

function playDecisionPositive() {
  if (!_enabled) return;
  const ac = getCtx();
  const now = ac.currentTime;
  // C-E-G dur akord, 200ms
  [261.63, 329.63, 392.00].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.value = 0.08;
    g.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.connect(g);
    g.connect(_masterGain);
    osc.start(now + i * 0.02);
    osc.stop(now + 0.22);
  });
}

// === SESSION END ===
function playSessionSuccess() {
  if (!_enabled) return;
  const ac = getCtx();
  const now = ac.currentTime;
  // Layered crescendo: 3 oscillators, 2s fade-out
  const freqs = [261.63, 329.63, 392.00, 523.25];
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.1, now + i * 0.15 + 0.05);
    g.gain.linearRampToValueAtTime(0.07, now + 1.5);
    g.gain.linearRampToValueAtTime(0, now + 2.5);
    osc.connect(g);
    g.connect(_masterGain);
    osc.start(now + i * 0.15);
    osc.stop(now + 2.6);
  });
}

function playSessionFail() {
  if (!_enabled) return;
  const ac = getCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.linearRampToValueAtTime(150, now + 1.5);
  g.gain.value = 0.12;
  g.gain.linearRampToValueAtTime(0, now + 1.5);
  osc.connect(g);
  g.connect(_masterGain);
  osc.start(now);
  osc.stop(now + 1.6);
}

// === PRESTIGE ===
function playPrestige() {
  if (!_enabled) return;
  const ac = getCtx();
  const now = ac.currentTime;

  // Click noise burst (drvo pucketanje)
  for (let i = 0; i < 5; i++) {
    const buf = ac.createBuffer(1, 500, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let j = 0; j < 500; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / 500);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    g.gain.value = 0.15;
    src.connect(g);
    g.connect(_masterGain);
    src.start(now + i * 0.08);
  }

  // Deep tone 100Hz, 3s
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = 100;
  g.gain.value = 0.2;
  g.gain.linearRampToValueAtTime(0, now + 3.0);
  osc.connect(g);
  g.connect(_masterGain);
  osc.start(now + 0.3);
  osc.stop(now + 3.1);
}

// === UI ===
function playUIClick() {
  if (!_enabled) return;
  const ac = getCtx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'square';
  osc.frequency.value = 600;
  g.gain.value = 0.05;
  g.gain.linearRampToValueAtTime(0, now + 0.04);
  osc.connect(g);
  g.connect(_masterGain);
  osc.start(now);
  osc.stop(now + 0.05);
}

export function isAudioEnabled() {
  return _enabled;
}
