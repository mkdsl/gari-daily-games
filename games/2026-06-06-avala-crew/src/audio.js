/**
 * audio.js — Web Audio API lo-fi techno ambient, phase transitions, SFX
 * Ceca Čujka @ Gari Daily Games 2026-06-06
 * NO .mp3/.wav files — all generated from oscillators
 */

/** @type {AudioContext|null} */
let audioCtx = null;

/** @type {GainNode|null} */
let masterGain = null;

/** @type {Object|null} current ambient state */
let currentAmbient = null;

/** Whether audio is enabled */
let _enabled = true;

/** Current BPM for ambient */
let _currentBPM = 75;

/** Ambient loop handles */
const _ambientNodes = [];

/** Scheduled stop times */
let _ambientStopTime = 0;

/**
 * Initialize audio context (lazy init on first user interaction)
 * Must be called from a user gesture (click/touch) handler
 */
export function initAudio() {
  if (audioCtx) return;

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Resume if suspended (autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (e) {
    _enabled = false;
    console.warn('[Audio] Web Audio API not available:', e);
  }
}

/**
 * Ensure audio context is running
 */
function ensureRunning() {
  if (!audioCtx) return false;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx.state !== 'closed';
}

// ── AMBIENT GENERATORS ─────────────────────────────────────────

/**
 * Play ambient music for a given phase
 * @param {'roster'|'gathering'|'peak'|'departure'} phase
 */
export function playAmbient(phase) {
  if (!_enabled || !ensureRunning()) return;

  stopAmbient();

  switch (phase) {
    case 'roster':
      _playRosterAmbient();
      break;
    case 'gathering':
      _playGatheringAmbient();
      break;
    case 'peak':
      _playPeakAmbient();
      break;
    case 'departure':
      _playDepartureAmbient();
      break;
    default:
      _playRosterAmbient();
  }

  currentAmbient = phase;
}

/**
 * Roster ambient: 75 BPM lo-fi, bass pulse, pad
 */
function _playRosterAmbient() {
  if (!audioCtx || !masterGain) return;

  const bpm = 75;
  const beatDuration = 60 / bpm;

  // Pad chord (warm, slow attack)
  const padOsc = audioCtx.createOscillator();
  const padFilter = audioCtx.createBiquadFilter();
  const padGain = audioCtx.createGain();

  padOsc.type = 'sawtooth';
  padOsc.frequency.setValueAtTime(110, audioCtx.currentTime); // A2

  padFilter.type = 'lowpass';
  padFilter.frequency.setValueAtTime(300, audioCtx.currentTime);
  padFilter.Q.setValueAtTime(2, audioCtx.currentTime);

  padGain.gain.setValueAtTime(0, audioCtx.currentTime);
  padGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 2);

  padOsc.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(masterGain);
  padOsc.start();

  // Sub bass pulse at beat 1 and 3
  _scheduleBassPattern([1, 3], beatDuration, 60, 4, 0.12); // C2

  _ambientNodes.push({ node: padOsc, gain: padGain });

  // Slow filter sweep
  padFilter.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 8);
  padFilter.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 16);
}

/**
 * Gathering ambient: 90 BPM, bass count-in, building energy
 */
function _playGatheringAmbient() {
  if (!audioCtx || !masterGain) return;

  const bpm = 90;
  const beatDuration = 60 / bpm;

  // Hi-hat on every beat
  _scheduleHiHatPattern(beatDuration, 8, 0.04);

  // Bass on beats 1 and 3 with slight movement
  _scheduleBassPattern([1, 3], beatDuration, 65, 4, 0.10); // F2-ish

  // Mid tone pad
  const midOsc = audioCtx.createOscillator();
  const midFilter = audioCtx.createBiquadFilter();
  const midGain = audioCtx.createGain();

  midOsc.type = 'square';
  midOsc.frequency.setValueAtTime(146.83, audioCtx.currentTime); // D3

  midFilter.type = 'bandpass';
  midFilter.frequency.setValueAtTime(500, audioCtx.currentTime);
  midFilter.Q.setValueAtTime(3, audioCtx.currentTime);

  midGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

  midOsc.connect(midFilter);
  midFilter.connect(midGain);
  midGain.connect(masterGain);
  midOsc.start();

  _ambientNodes.push({ node: midOsc, gain: midGain });
}

/**
 * Peak ambient: 128 BPM techno arc, kick + bass + melodic line
 */
function _playPeakAmbient() {
  if (!audioCtx || !masterGain) return;

  const bpm = 128;
  const beatDuration = 60 / bpm;

  // 4/4 kick pattern (beats 1,2,3,4 with 128BPM)
  _scheduleKickPattern(beatDuration, 8, 0.15);

  // Hi-hat on offbeats (every 0.5 beats)
  _scheduleHiHatPattern(beatDuration * 0.5, 16, 0.05);

  // Bass walk (E, A, B minor feel)
  const bassNotes = [82.41, 110, 123.47, 110]; // E2, A2, B2, A2
  _scheduleBassWalk(bassNotes, beatDuration, 8, 0.12);

  // Lead synth melody (rising arpeggio)
  _scheduleArpeggio([246.94, 329.63, 392, 523.25], beatDuration * 0.5, 0.06); // B3, E4, G4, C5

  _currentBPM = 128;
}

/**
 * Departure ambient: 100 BPM, gradual slowdown, nostalgic
 */
function _playDepartureAmbient() {
  if (!audioCtx || !masterGain) return;

  const bpm = 100;
  const beatDuration = 60 / bpm;

  // Light kick
  _scheduleKickPattern(beatDuration, 4, 0.08);

  // Soft pad (minor chord)
  const padOsc = audioCtx.createOscillator();
  const padGain = audioCtx.createGain();

  padOsc.type = 'sine';
  padOsc.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3
  padGain.gain.setValueAtTime(0.07, audioCtx.currentTime);
  // Slow fade out
  padGain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 12);

  padOsc.connect(padGain);
  padGain.connect(masterGain);
  padOsc.start();

  // Descending arp
  _scheduleArpeggio([261.63, 220, 196, 174.61], beatDuration, 0.05); // C4, A3, G3, F3

  _ambientNodes.push({ node: padOsc, gain: padGain });
}

// ── PATTERN SCHEDULERS ──────────────────────────────────────────

function _scheduleKickPattern(beatDuration, bars, gain) {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const totalBeats = bars * 4;

  for (let beat = 0; beat < totalBeats; beat++) {
    const time = now + beat * beatDuration;
    _scheduleKick(time, gain);
  }
}

function _scheduleKick(time, gain = 0.15) {
  if (!audioCtx || !masterGain) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

  gainNode.gain.setValueAtTime(gain, time);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

  osc.connect(gainNode);
  gainNode.connect(masterGain);
  osc.start(time);
  osc.stop(time + 0.15);
}

function _scheduleHiHatPattern(subdivisionDuration, count, gain) {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;

  for (let i = 0; i < count; i++) {
    const time = now + i * subdivisionDuration;
    _scheduleHiHat(time, gain);
  }
}

function _scheduleHiHat(time, gain = 0.03) {
  if (!audioCtx || !masterGain) return;

  const bufferSize = audioCtx.sampleRate * 0.05;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 8000;

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(gain, time);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);
  source.start(time);
}

function _scheduleBassPattern(beats, beatDuration, midiNote, bars, gain) {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

  for (let bar = 0; bar < bars; bar++) {
    for (const beat of beats) {
      const time = now + (bar * 4 + beat - 1) * beatDuration;
      _scheduleBass(time, freq, gain, beatDuration * 0.8);
    }
  }
}

function _scheduleBass(time, freq, gain = 0.10, duration = 0.3) {
  if (!audioCtx || !masterGain) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, time);
  filter.Q.setValueAtTime(1, time);

  gainNode.gain.setValueAtTime(gain, time);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);
  osc.start(time);
  osc.stop(time + duration);
}

function _scheduleBassWalk(notes, beatDuration, bars, gain) {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;

  for (let bar = 0; bar < bars; bar++) {
    for (let i = 0; i < notes.length; i++) {
      const time = now + (bar * notes.length + i) * beatDuration;
      _scheduleBass(time, notes[i], gain, beatDuration * 0.9);
    }
  }
}

function _scheduleArpeggio(notes, subdivisionDuration, gain) {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;

  for (let cycle = 0; cycle < 4; cycle++) {
    for (let i = 0; i < notes.length; i++) {
      const time = now + (cycle * notes.length + i) * subdivisionDuration;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i], time);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(gain, time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + subdivisionDuration * 0.8);

      osc.connect(gainNode);
      gainNode.connect(masterGain);
      osc.start(time);
      osc.stop(time + subdivisionDuration);
    }
  }
}

// ── SFX ────────────────────────────────────────────────────────

/**
 * Play a card interaction sound
 * @param {'select'|'synergy'|'win'|'partial'|'fail'|'ability'} type
 */
export function playCardSound(type) {
  if (!_enabled || !ensureRunning()) return;

  switch (type) {
    case 'select':
      _playSoftWhoosh();
      break;
    case 'synergy':
      _playSynergyBell();
      break;
    case 'win':
      _playWinChord();
      break;
    case 'partial':
      _playPartialClick();
      break;
    case 'fail':
      _playFailThud();
      break;
    case 'ability':
      _playAbilityZap();
      break;
    default:
      _playPartialClick();
  }
}

/** Soft whoosh (bandpass noise burst) */
function _playSoftWhoosh() {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const bufferSize = audioCtx.sampleRate * 0.15;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.linearRampToValueAtTime(2400, now + 0.15);
  filter.Q.setValueAtTime(1, now);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start(now);
}

/** Crisp bell ding (triangle oscillator) */
function _playSynergyBell() {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const frequencies = [1047, 1319, 1568]; // C6, E6, G6 — major triad

  frequencies.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);

    gain.gain.setValueAtTime(0.08, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.6);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.6);
  });
}

/** Rising chord (major 3rd) */
function _playWinChord() {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const notes = [261.63, 329.63, 392, 523.25]; // C4, E4, G4, C5

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.9, now + i * 0.06);
    osc.frequency.linearRampToValueAtTime(freq, now + i * 0.06 + 0.1);

    gain.gain.setValueAtTime(0.1, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.8);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.8);
  });
}

/** Neutral click */
function _playPartialClick() {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.linearRampToValueAtTime(220, now + 0.05);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.08);
}

/** Dull thud (low sine burst) */
function _playFailThud() {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.3);
}

/** Electric zap */
function _playAbilityZap() {
  if (!audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;

  // Noise burst
  const bufferSize = audioCtx.sampleRate * 0.1;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, now);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start(now);

  // Pitch sweep
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(2000, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
  oscGain.gain.setValueAtTime(0.08, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(oscGain);
  oscGain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.1);
}

// ── CONTROL ────────────────────────────────────────────────────

/**
 * Stop all ambient audio
 */
export function stopAmbient() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  for (const { node, gain } of _ambientNodes) {
    try {
      if (gain) {
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
      }
      setTimeout(() => {
        try { node.stop && node.stop(); } catch {}
        try { node.disconnect && node.disconnect(); } catch {}
      }, 350);
    } catch {}
  }

  _ambientNodes.length = 0;
  currentAmbient = null;
}

/**
 * Set master volume
 * @param {number} vol - 0 to 1
 */
export function setVolume(vol) {
  if (!masterGain) return;
  const clamped = Math.max(0, Math.min(1, vol));
  masterGain.gain.linearRampToValueAtTime(clamped * 0.7, audioCtx.currentTime + 0.1);
}

/**
 * Mute/unmute
 * @param {boolean} muted
 */
export function setMuted(muted) {
  _enabled = !muted;
  if (masterGain && audioCtx) {
    masterGain.gain.linearRampToValueAtTime(
      muted ? 0 : 0.5,
      audioCtx.currentTime + 0.1
    );
  }
}

/**
 * Get current ambient phase
 * @returns {string|null}
 */
export function getCurrentAmbientPhase() {
  return currentAmbient;
}

/**
 * Crossfade to new ambient phase
 * @param {'roster'|'gathering'|'peak'|'departure'} phase
 */
export function crossfadeTo(phase) {
  if (currentAmbient === phase) return;

  if (!audioCtx) {
    initAudio();
  }

  // Fade out current
  if (_ambientNodes.length > 0 && masterGain) {
    const now = audioCtx.currentTime;
    for (const { gain } of _ambientNodes) {
      if (gain) gain.gain.linearRampToValueAtTime(0, now + 0.5);
    }
    setTimeout(() => {
      _ambientNodes.forEach(({ node }) => {
        try { node.stop && node.stop(); } catch {}
      });
      _ambientNodes.length = 0;
      playAmbient(phase);
    }, 550);
  } else {
    playAmbient(phase);
  }
}
