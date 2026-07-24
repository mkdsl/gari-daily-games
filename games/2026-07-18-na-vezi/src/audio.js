/** Web Audio API: alarm blip, chat tap, on-air/off-air, battery pulse, ambient */

/** @type {AudioContext|null} */
let _ctx = null;

/** @type {GainNode|null} */
let _masterGain = null;

/** @type {GainNode|null} */
let _ambientGain = null;

/** @type {OscillatorNode|null} */
let _ambientOsc = null;

/** @type {boolean} */
let _initialized = false;

/** @type {boolean} Mute flag */
let _muted = false;

/** @type {number} 0-1 */
let _volume = 0.7;

/**
 * Inicijalizuje AudioContext (mora biti pozvan iz user gesture)
 */
export function initAudio() {
  if (_initialized) return;
  try {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _masterGain.gain.value = _volume;
    _masterGain.connect(_ctx.destination);
    _initialized = true;
    startAmbientPad();
  } catch (e) {
    console.warn('Web Audio not available:', e);
  }
}

/**
 * Tihi sintisajzer pad (sine 60Hz, konstantno u pozadini)
 */
export function startAmbientPad() {
  if (!_ctx) return;
  _ambientGain = _ctx.createGain();
  _ambientGain.gain.value = 0.03;
  _ambientGain.connect(_masterGain);

  _ambientOsc = _ctx.createOscillator();
  _ambientOsc.type = 'sine';
  _ambientOsc.frequency.value = 60;
  _ambientOsc.connect(_ambientGain);
  _ambientOsc.start();

  // Subtle second harmonic
  const osc2 = _ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 90;
  const g2 = _ctx.createGain();
  g2.gain.value = 0.015;
  osc2.connect(g2);
  g2.connect(_masterGain);
  osc2.start();
}

/**
 * Kratki alarm blip (440Hz sawtooth, kratki envelope)
 */
export function playAlarmBlip() {
  if (!_ctx || _muted) return;
  const osc = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 440;
  gain.gain.setValueAtTime(0.15, _ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start();
  osc.stop(_ctx.currentTime + 0.3);
}

/**
 * Kritični alarm (niži ton, duži)
 */
export function playAlarmCritical() {
  if (!_ctx || _muted) return;
  // Double beep
  for (let i = 0; i < 2; i++) {
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 330;
    const t = _ctx.currentTime + i * 0.35;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(_masterGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }
}

/**
 * Chat tap — IG (220Hz sine, kratko)
 */
export function playChatIg() {
  if (!_ctx || _muted) return;
  _playTap(220, 0.06, 0.08);
}

/**
 * Chat tap — TikTok (264Hz, neznatno viši)
 */
export function playChatTiktok() {
  if (!_ctx || _muted) return;
  _playTap(264, 0.06, 0.08);
}

/**
 * Chat tap — YouTube (196Hz, niži)
 */
export function playChatYoutube() {
  if (!_ctx || _muted) return;
  _playTap(196, 0.05, 0.1);
}

function _playTap(freq, volume, duration) {
  if (!_ctx) return;
  const osc = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, _ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start();
  osc.stop(_ctx.currentTime + duration);
}

/**
 * On-air jingle — topli C major chord (0.3s envelope up)
 */
export function playOnAirJingle() {
  if (!_ctx || _muted) return;
  const freqs = [261.63, 329.63, 392.00]; // C4, E4, G4
  freqs.forEach((freq, i) => {
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, _ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, _ctx.currentTime + 0.3 + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(_masterGain);
    osc.start();
    osc.stop(_ctx.currentTime + 1.2);
  });
}

/**
 * Off-air fade — isti chord, fade out
 */
export function playOffAirFade() {
  if (!_ctx || _muted) return;
  const freqs = [261.63, 329.63, 392.00];
  freqs.forEach((freq) => {
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, _ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(_masterGain);
    osc.start();
    osc.stop(_ctx.currentTime + 1.5);
  });
}

/**
 * Battery pulse — subliminalan pulsiranje, intenzitet raste sa kritičnim stanjem
 * @param {number} intensity 0-1 (1 = critical)
 */
let _batteryPulseNode = null;
let _batteryPulseGain = null;

export function updateBatteryPulse(intensity) {
  if (!_ctx) return;
  if (intensity <= 0) {
    if (_batteryPulseGain) {
      _batteryPulseGain.gain.setTargetAtTime(0, _ctx.currentTime, 0.3);
    }
    return;
  }
  if (!_batteryPulseNode) {
    _batteryPulseNode = _ctx.createOscillator();
    _batteryPulseGain = _ctx.createGain();
    _batteryPulseNode.type = 'sine';
    _batteryPulseNode.frequency.value = 40;
    _batteryPulseGain.gain.value = 0;
    _batteryPulseNode.connect(_batteryPulseGain);
    _batteryPulseGain.connect(_masterGain);
    _batteryPulseNode.start();
  }
  const targetGain = intensity * 0.08;
  _batteryPulseGain.gain.setTargetAtTime(targetGain, _ctx.currentTime, 0.5);
}

/**
 * Success chime za achievement
 */
export function playSuccessChime() {
  if (!_ctx || _muted) return;
  const notes = [523.25, 659.25]; // C5, E5
  notes.forEach((freq, i) => {
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = _ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(_masterGain);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

/**
 * Prestige fanfare
 */
export function playPrestigeFanfare() {
  if (!_ctx || _muted) return;
  const notes = [261.63, 329.63, 392.00, 523.25];
  notes.forEach((freq, i) => {
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = _ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain);
    gain.connect(_masterGain);
    osc.start(t);
    osc.stop(t + 0.8);
  });
}

/**
 * Toggle mute
 * @returns {boolean} novi mute state
 */
export function toggleMute() {
  _muted = !_muted;
  if (_masterGain) {
    _masterGain.gain.setTargetAtTime(_muted ? 0 : _volume, _ctx.currentTime, 0.1);
  }
  return _muted;
}

/**
 * Postavi volume
 * @param {number} vol 0-1
 */
export function setVolume(vol) {
  _volume = Math.max(0, Math.min(1, vol));
  if (_masterGain && !_muted) {
    _masterGain.gain.setTargetAtTime(_volume, _ctx.currentTime, 0.1);
  }
}

/**
 * Je li audio inicijalizovan?
 * @returns {boolean}
 */
export function isAudioReady() {
  return _initialized;
}

/**
 * Resume AudioContext ako je suspended (iOS)
 */
export function resumeAudio() {
  if (_ctx && _ctx.state === 'suspended') {
    _ctx.resume();
  }
}
