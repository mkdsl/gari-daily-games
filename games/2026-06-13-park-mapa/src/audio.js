import { CONFIG } from './config.js';

let audioCtx = null;
let masterGain = null;
let ambientNode = null;
let ambientGain = null;
let isInitialized = false;

export function initAudio() {
  if (isInitialized) return true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(audioCtx.destination);
    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0.15;
    ambientGain.connect(masterGain);
    isInitialized = true;
    return true;
  } catch (e) {
    console.warn('[Audio] Web Audio API not available:', e);
    return false;
  }
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function createOscillator(freq, type = 'sine', duration = 0.3, gainValue = 0.3) {
  if (!audioCtx) return null;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainValue, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
  return { osc, gain };
}

// Egg discovery: ascending C5-E5-G5 chord (staccato, 200ms)
export function playEggSound() {
  if (!audioCtx) return;
  resumeAudio();
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillator(freq, 'triangle', 0.25, 0.25);
    }, i * 60);
  });
}

// Zone proximity: single tone per zone
export function playZoneProximityTone(zone) {
  if (!audioCtx) return;
  resumeAudio();
  const freq = CONFIG.ZONE_PROXIMITY_TONES?.[zone] || 196;
  createOscillator(freq, 'sine', 0.15, 0.08);
}

// Zone activation: reverb-heavy pad note
export function playZoneActivation(zone) {
  if (!audioCtx) return;
  resumeAudio();
  const freqMap = { pult: 185, bina: 261.63, suma: 195.99 };
  const freq = freqMap[zone] || 261.63;

  // Create reverb via delay+feedback
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const delay = audioCtx.createDelay(2.0);
  const feedback = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.value = freq;
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  delay.delayTime.value = 0.3;
  feedback.gain.value = 0.4;

  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);

  osc.connect(gain);
  gain.connect(filter);
  filter.connect(masterGain);
  filter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(masterGain);

  osc.start();
  osc.stop(audioCtx.currentTime + 2.5);
}

// Level up: 5-note ascending arpeggio
export function playLevelUp() {
  if (!audioCtx) return;
  resumeAudio();
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4-E4-G4-C5-E5
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillator(freq, 'square', 0.2, 0.15);
    }, i * 80);
  });
}

// Closure fanfare: celebratory chord progression
export function playClosureFanfare() {
  if (!audioCtx) return;
  resumeAudio();
  const chords = [
    [261.63, 329.63, 392.00],   // C major
    [293.66, 369.99, 440.00],   // D major
    [329.63, 415.30, 493.88],   // E major
    [349.23, 440.00, 523.25],   // F major
  ];
  chords.forEach((chord, ci) => {
    setTimeout(() => {
      chord.forEach(freq => createOscillator(freq, 'triangle', 0.4, 0.12));
    }, ci * 300);
  });
}

// Ambient cricket/night atmosphere using filtered noise
export function startAmbient() {
  if (!audioCtx || ambientNode) return;
  resumeAudio();

  // White noise source
  const bufferSize = audioCtx.sampleRate * 4;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Bandpass filter for cricket-like sound (2-6kHz range)
  const bpFilter = audioCtx.createBiquadFilter();
  bpFilter.type = 'bandpass';
  bpFilter.frequency.value = 3000;
  bpFilter.Q.value = 2;

  // Low-pass for warmth
  const lpFilter = audioCtx.createBiquadFilter();
  lpFilter.type = 'lowpass';
  lpFilter.frequency.value = 5000;

  // Slow LFO for modulation
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.3;
  lfoGain.gain.value = 500;
  lfo.connect(lfoGain);
  lfoGain.connect(bpFilter.frequency);
  lfo.start();

  source.connect(bpFilter);
  bpFilter.connect(lpFilter);
  lpFilter.connect(ambientGain);

  source.start();
  ambientNode = source;
}

export function stopAmbient() {
  if (ambientNode) {
    try { ambientNode.stop(); } catch (e) {}
    ambientNode = null;
  }
}

export function setVolume(value) {
  // value 0-1
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, value));
}

export function getAudioContext() { return audioCtx; }
export function isAudioReady() { return isInitialized && !!audioCtx; }

// UI click sound
export function playUIClick() {
  if (!audioCtx) return;
  resumeAudio();
  createOscillator(440, 'square', 0.05, 0.1);
}

// PT earn notification
export function playPTEarn() {
  if (!audioCtx) return;
  resumeAudio();
  createOscillator(880, 'sine', 0.1, 0.15);
  setTimeout(() => createOscillator(1046, 'sine', 0.1, 0.1), 80);
}
