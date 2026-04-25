/**
 * audio.js — Web Audio API zvučni efekti za Graviton.
 *
 * Svi zvukovi su generisani proceduralno — bez .mp3/.wav fajlova.
 * AudioContext se kreira lazy (na prvi user gesture) zbog browser autoplay policy.
 *
 * Zvukovi:
 *   - playFlip()           → kratki "whoosh": frequency sweep 400→100 Hz, 80ms
 *   - playBeepWarning(r)   → G-overload beep: 880 Hz, interval = 800*(1-r) ms
 *   - stopBeepWarning()    → gasi tekući beep i timer
 *   - playDeathChord()     → dissonant minor cluster: 3 oscillatora, fadeout 300ms
 *   - playMilestoneArpeggio() → ascending arpeggio 4 note (C4 D4 E4 G4), chiptune
 */

import { CONFIG } from './config.js';

/** @type {AudioContext|null} */
let _ctx = null;

/** @type {number|null} setTimeout ID za sledeći beep */
let _beepTimer = null;

/** @type {OscillatorNode|null} Tekući beep oscilator */
let _beepOsc = null;

/** @type {number} Poslednji prosleđeni ratio za beep sekvenciranje */
let _lastBeepRatio = 0;

/**
 * Kreira AudioContext jednom, čuva u closure.
 */
function _createContext() {
  try {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    // Browser ne podržava Web Audio API
  }
}

/**
 * Inicijalizuje AudioContext. Mora se pozvati iz main.js.
 * Stvarni AudioContext se kreira tek na prvi user gesture (click/touchstart/keydown).
 */
export function initAudio() {
  const handler = () => {
    if (!_ctx) _createContext();
  };
  document.addEventListener('click', handler, { once: true });
  document.addEventListener('touchstart', handler, { once: true });
  document.addEventListener('keydown', handler, { once: true });
}

/**
 * Vraća AudioContext ili null ako još nije kreiran.
 * @returns {AudioContext|null}
 */
function _getCtx() {
  return _ctx;
}

/**
 * Pušta flip "whoosh" zvuk.
 * Sine sweep 400→100 Hz, 80ms, sa gain fade 0.3→0.
 */
export function playFlip() {
  const ctx = _getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Tiho — AudioContext može biti suspended
  }
}

/**
 * Pušta jedan G-overload beep i rekurzivno zakazuje sledeći.
 * Interval: CONFIG.AUDIO_BEEP_BASE_INTERVAL * (1 - ratio) ms.
 * Prestaje kada ratio < 0.5.
 *
 * @param {number} ratio - Trenutni g_overload_ratio (0.5–1.0)
 */
export function playBeepWarning(ratio) {
  if (ratio < CONFIG.G_OVERLOAD_WARNING_THRESHOLD) {
    stopBeepWarning();
    return;
  }

  _lastBeepRatio = ratio;
  const ctx = _getCtx();

  if (ctx) {
    try {
      // Zaustavi prethodni beep ako postoji
      if (_beepOsc) {
        try { _beepOsc.stop(); } catch { /* već zaustavljen */ }
        _beepOsc = null;
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);

      _beepOsc = osc;
    } catch {
      // Tiho
    }
  }

  // Interval pada sa rastom ratio-a: pri 0.5 = 400ms, pri 0.9 = 80ms, pri 1.0 = 0
  const interval = Math.max(50, CONFIG.AUDIO_BEEP_BASE_INTERVAL * (1 - ratio));
  if (_beepTimer !== null) clearTimeout(_beepTimer);
  _beepTimer = setTimeout(() => playBeepWarning(_lastBeepRatio), interval);
}

/**
 * Zaustavlja G-overload beep warning sekvenciranje.
 * Poziva se pri flipu ili pri prelasku u DEAD.
 */
export function stopBeepWarning() {
  if (_beepTimer !== null) {
    clearTimeout(_beepTimer);
    _beepTimer = null;
  }
  if (_beepOsc) {
    try { _beepOsc.stop(); } catch { /* već zaustavljen */ }
    _beepOsc = null;
  }
  _lastBeepRatio = 0;
}

/**
 * Pušta death chord — dissonant minor cluster.
 * 3 oscillatora: 220 Hz (A3), 261 Hz (C4), 311 Hz (Eb4), sawtooth.
 * Gain: 0.15 → 0 linearRamp tokom 300ms.
 */
export function playDeathChord() {
  const ctx = _getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const freqs = [220, 261, 311];

    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Tiho
  }
}

/**
 * Pušta milestone ascending arpeggio.
 * 4 note: C4(261), D4(293), E4(329), G4(392), square wave, po 80ms svaka.
 */
export function playMilestoneArpeggio() {
  const ctx = _getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = [261, 293, 329, 392];

    notes.forEach((freq, i) => {
      const start = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.1, start);
      gain.gain.linearRampToValueAtTime(0, start + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.08);
    });
  } catch {
    // Tiho
  }
}
