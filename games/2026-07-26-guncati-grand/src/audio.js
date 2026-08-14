/** @fileoverview Web Audio API: ambient layers, event stingers, DJ hype ramp, SFX */

import { CONFIG } from './config.js';

/** @type {AudioContext|null} */
let _ctx = null;

/** @type {Object} active nodes keyed by name */
const _nodes = {};

/** @type {boolean} */
let _enabled = CONFIG.AUDIO_ENABLED_DEFAULT;

/** @type {GainNode|null} */
let _masterGain = null;

/**
 * Initialize audio context (must be called on user gesture)
 * @returns {Object} audio API
 */
export function initAudio() {
  if (_ctx) return getAudio();

  try {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _masterGain.gain.value = 0.5;
    _masterGain.connect(_ctx.destination);
  } catch (e) {
    console.warn('Web Audio not available:', e);
    _enabled = false;
  }

  return getAudio();
}

/** Get public audio API */
export function getAudio() {
  return {
    playAmbient,
    playSFX,
    updateFinaleIntensity,
    setEnabled,
    isEnabled: () => _enabled,
    resume: () => _ctx?.resume()
  };
}

/**
 * Play ambient sound layer for a given phase
 * @param {'menu'|'macro'|'micro'|'finale'|'score_win'|'score_fail'} phase
 */
function playAmbient(phase) {
  if (!_enabled || !_ctx) return;
  stopAllAmbient();

  switch (phase) {
    case 'menu':
      _playMenuAmbient();
      break;
    case 'macro':
      _playMacroAmbient();
      break;
    case 'micro':
      _playMicroAmbient();
      break;
    case 'finale':
      _playFinaleAmbient();
      break;
    case 'score_win':
      _playCelebration();
      break;
    case 'score_fail':
      _playMinorFade();
      break;
  }
}

function stopAllAmbient() {
  for (const [key, node] of Object.entries(_nodes)) {
    try {
      if (node.stop) node.stop();
      if (node.gainNode) node.gainNode.gain.setTargetAtTime(0, _ctx.currentTime, 0.2);
    } catch {}
    delete _nodes[key];
  }
}

/** Menu: soft morning folk — low oscillators with reverb character */
function _playMenuAmbient() {
  if (!_ctx) return;
  const gain = _ctx.createGain();
  gain.gain.value = 0.08;
  gain.connect(_masterGain);

  const notes = [130.81, 164.81, 196.00, 261.63]; // C3 E3 G3 C4

  notes.forEach((freq, i) => {
    const osc = _ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const oscGain = _ctx.createGain();
    oscGain.gain.value = 0.15 - i * 0.03;

    // Slow LFO modulation
    const lfo = _ctx.createOscillator();
    lfo.frequency.value = 0.1 + i * 0.05;
    const lfoGain = _ctx.createGain();
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();

    _nodes[`menu_osc_${i}`] = osc;
    _nodes[`menu_lfo_${i}`] = lfo;
  });
  _nodes['menu_gain'] = gain;
}

/** Macro: quiet folk pulse — period percussion-like noise */
function _playMacroAmbient() {
  if (!_ctx) return;
  const gain = _ctx.createGain();
  gain.gain.value = 0.06;
  gain.connect(_masterGain);

  // Drone: two oscillators a fifth apart
  [196, 294].forEach((freq, i) => {
    const osc = _ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const g = _ctx.createGain();
    g.gain.value = 0.12;
    osc.connect(g);
    g.connect(gain);
    osc.start();
    _nodes[`macro_osc_${i}`] = osc;
  });

  // Soft periodic click (metronome feel)
  const clickInterval = setInterval(() => {
    _playClick(0.04);
  }, 1200);
  _nodes['macro_click'] = { stop: () => clearInterval(clickInterval) };
  _nodes['macro_gain'] = gain;
}

/** Micro: rhythmic work sounds — burst noise + taps */
function _playMicroAmbient() {
  if (!_ctx) return;
  const gain = _ctx.createGain();
  gain.gain.value = 0.07;
  gain.connect(_masterGain);

  // Rhythmic noise bursts (work sounds)
  let beat = 0;
  const pattern = [1, 0, 0.5, 0, 1, 0, 0.5, 0]; // 4/4 with off-beats
  const beatInterval = setInterval(() => {
    const vol = pattern[beat % pattern.length];
    if (vol > 0) _playNoiseBurst(0.04 * vol, 0.05);
    beat++;
  }, 300);

  _nodes['micro_beat'] = { stop: () => clearInterval(beatInterval) };
  _nodes['micro_gain'] = gain;
}

/** Finale: deep bass pulse + crowd hum */
function _playFinaleAmbient() {
  if (!_ctx) return;

  // Bass pulse
  const bassGain = _ctx.createGain();
  bassGain.gain.value = 0.0;
  bassGain.connect(_masterGain);

  const bass = _ctx.createOscillator();
  bass.type = 'sawtooth';
  bass.frequency.value = 55; // deep sub

  const bassFilter = _ctx.createBiquadFilter();
  bassFilter.type = 'lowpass';
  bassFilter.frequency.value = 200;
  bassFilter.Q.value = 1;

  bass.connect(bassFilter);
  bassFilter.connect(bassGain);
  bass.start();

  // Fade in bass
  bassGain.gain.setTargetAtTime(0.15, _ctx.currentTime, 2.0);

  // Crowd noise
  const crowdGain = _ctx.createGain();
  crowdGain.gain.value = 0.04;
  crowdGain.connect(_masterGain);

  const crowdFilter = _ctx.createBiquadFilter();
  crowdFilter.type = 'bandpass';
  crowdFilter.frequency.value = 800;
  crowdFilter.Q.value = 0.5;

  const bufferSize = _ctx.sampleRate * 3;
  const noiseBuffer = _ctx.createBuffer(1, bufferSize, _ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = _ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  noise.connect(crowdFilter);
  crowdFilter.connect(crowdGain);
  noise.start();

  _nodes['finale_bass'] = bass;
  _nodes['finale_bassGain'] = bassGain;
  _nodes['finale_crowd'] = noise;
  _nodes['finale_crowdGain'] = crowdGain;
  _nodes['finale_bassFilter'] = bassFilter;
}

/**
 * Update finale audio intensity based on game state
 * @param {Object} finaleState
 */
function updateFinaleIntensity(finaleState) {
  if (!_enabled || !_ctx) return;
  const { djHype, crowdMood } = finaleState;
  const intensity = (djHype + crowdMood) / 200;

  const bassGain = _nodes['finale_bassGain'];
  if (bassGain) {
    bassGain.gain.setTargetAtTime(0.05 + intensity * 0.25, _ctx.currentTime, 0.5);
  }

  const crowdGain = _nodes['finale_crowdGain'];
  if (crowdGain) {
    crowdGain.gain.setTargetAtTime(0.02 + intensity * 0.08, _ctx.currentTime, 0.5);
  }

  // Filter sweep on bass
  const bassFilter = _nodes['finale_bassFilter'];
  if (bassFilter) {
    bassFilter.frequency.setTargetAtTime(100 + intensity * 400, _ctx.currentTime, 0.5);
  }
}

/** Win celebration arpeggio */
function _playCelebration() {
  if (!_ctx) return;
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C E G C E
  notes.forEach((freq, i) => {
    setTimeout(() => _playTone(freq, 0.15, 0.4), i * 120);
  });
}

/** Fail minor chord fade */
function _playMinorFade() {
  if (!_ctx) return;
  [261.63, 311.13, 392.00].forEach(freq => {
    _playTone(freq, 0.08, 1.5);
  });
}

/**
 * Play a sound effect by name
 * @param {string} name
 */
function playSFX(name) {
  if (!_enabled || !_ctx) return;

  switch (name) {
    case 'slider_click':
      _playClick(0.05);
      break;
    case 'building_upgrade':
      // Ascending 3-note
      [330, 440, 550].forEach((f, i) => setTimeout(() => _playTone(f, 0.1, 0.15), i * 80));
      break;
    case 'volunteer_assign':
      _playPluck(440, 0.12);
      break;
    case 'event_trigger':
      _playAlert();
      break;
    case 'dj_transition_pending':
      // Pulsing indicator
      [880, 880, 1047].forEach((f, i) => setTimeout(() => _playTone(f, 0.08, 0.08), i * 150));
      break;
    case 'dj_transition_good':
      _playRisingSweep(200, 800, 0.3);
      setTimeout(() => _playTone(880, 0.2, 0.2), 300);
      break;
    case 'dj_transition_bad':
      _playDescendingGlitch();
      break;
    case 'result_arpeggio':
      [330, 392, 494, 523].forEach((f, i) => setTimeout(() => _playTone(f, 0.1, 0.25), i * 100));
      break;
    case 'tom_sawyer_activate':
      [440, 554, 659, 880].forEach((f, i) => setTimeout(() => _playTone(f, 0.08, 0.2), i * 90));
      break;
  }
}

// ── Low-level audio primitives ──

function _playClick(vol) {
  if (!_ctx) return;
  const buf = _ctx.createBuffer(1, 512, _ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < 512; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
  const src = _ctx.createBufferSource();
  src.buffer = buf;
  const g = _ctx.createGain();
  g.gain.value = vol;
  src.connect(g);
  g.connect(_masterGain);
  src.start();
}

function _playTone(freq, vol, duration) {
  if (!_ctx) return;
  const osc = _ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const g = _ctx.createGain();
  g.gain.setValueAtTime(vol, _ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + duration);
  osc.connect(g);
  g.connect(_masterGain);
  osc.start();
  osc.stop(_ctx.currentTime + duration + 0.1);
}

function _playPluck(freq, vol) {
  if (!_ctx) return;
  const osc = _ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  const g = _ctx.createGain();
  g.gain.setValueAtTime(vol, _ctx.currentTime);
  g.gain.setTargetAtTime(0, _ctx.currentTime, 0.1);
  osc.connect(g);
  g.connect(_masterGain);
  osc.start();
  osc.stop(_ctx.currentTime + 0.5);
}

function _playAlert() {
  if (!_ctx) return;
  [880, 660, 880].forEach((f, i) => {
    setTimeout(() => _playTone(f, 0.12, 0.1), i * 100);
  });
}

function _playNoiseBurst(vol, duration) {
  if (!_ctx) return;
  const bufSize = Math.floor(_ctx.sampleRate * duration);
  const buf = _ctx.createBuffer(1, bufSize, _ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = _ctx.createBufferSource();
  src.buffer = buf;
  const g = _ctx.createGain();
  g.gain.setValueAtTime(vol, _ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + duration);
  src.connect(g);
  g.connect(_masterGain);
  src.start();
}

function _playRisingSweep(freqStart, freqEnd, duration) {
  if (!_ctx) return;
  const osc = _ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freqStart, _ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, _ctx.currentTime + duration);
  const g = _ctx.createGain();
  g.gain.setValueAtTime(0.15, _ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + duration);
  osc.connect(g);
  g.connect(_masterGain);
  osc.start();
  osc.stop(_ctx.currentTime + duration + 0.1);
}

function _playDescendingGlitch() {
  if (!_ctx) return;
  const dur = 0.05;
  [440, 330, 220, 165].forEach((f, i) => {
    setTimeout(() => {
      _playNoiseBurst(0.1, dur);
      _playTone(f, 0.08, dur);
    }, i * 60);
  });
}

/**
 * Enable or disable audio
 * @param {boolean} enabled
 */
function setEnabled(enabled) {
  _enabled = enabled;
  if (!enabled) stopAllAmbient();
  if (enabled && _ctx?.state === 'suspended') _ctx.resume();
}
