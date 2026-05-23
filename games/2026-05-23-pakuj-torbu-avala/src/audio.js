// Web Audio API synthesizer — no .wav files
import { AUDIO } from './config.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {});
  }
}

function masterGain(c) {
  const g = c.createGain();
  g.gain.value = AUDIO.masterVolume;
  g.connect(c.destination);
  return g;
}

function playOsc(type, freq, duration, volume = 0.5, startTime = 0) {
  const c = getCtx();
  if (!c || !AUDIO.enabled) return;
  try {
    const now = c.currentTime + startTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume * AUDIO.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // silence
  }
}

/** Thud: bass click for item placement */
export function playThud() {
  const c = getCtx();
  if (!c || !AUDIO.enabled) return;
  try {
    resumeAudio();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // silence
  }
}

/** Buzz: error sound for invalid placement */
export function playBuzz() {
  resumeAudio();
  playOsc('sawtooth', 120, 0.15, 0.3);
  playOsc('sawtooth', 90, 0.15, 0.2, 0.05);
}

/** Win fanfare: ascending arpeggio */
export function playWin() {
  resumeAudio();
  const notes = [261, 329, 392, 523, 659];
  notes.forEach((freq, i) => {
    playOsc('triangle', freq, 0.3, 0.35, i * 0.1);
  });
}

/** Level up: short fanfare */
export function playLevelUp() {
  resumeAudio();
  const notes = [392, 523, 659, 784];
  notes.forEach((freq, i) => {
    playOsc('square', freq, 0.18, 0.25, i * 0.08);
  });
}

/** Tick: subtle timer tick for < 10 seconds */
export function playTick() {
  resumeAudio();
  playOsc('square', 880, 0.05, 0.15);
}

/** Rotate click */
export function playRotate() {
  resumeAudio();
  playOsc('triangle', 440, 0.08, 0.2);
  playOsc('triangle', 550, 0.08, 0.15, 0.04);
}

/** Select item click */
export function playSelect() {
  resumeAudio();
  playOsc('triangle', 660, 0.07, 0.2);
}
