/**
 * audio.js — Web Audio API zvučni efekti za Pulse Runner.
 *
 * Sve generiše sintetički — nema .mp3/.wav fajlova.
 * AudioContext se inicijalizuje lazy (na prvu user interakciju) zbog browser policy-a.
 *
 * Zvukovi (iz concept.md audio mooda):
 * - playPulse(): sinusni puls na CONFIG.AUDIO_PULSE_FREQ (60Hz), kratki attack/decay
 *   kao EKG — osećaj srčanog otkucaja. Svira na svaki puls event.
 * - playCollectible(): ascending tone 440→880 Hz za 80ms (pentatonski).
 * - playGameOver(): descending sine glide 880→110 Hz za 600ms.
 * - playLevelTransition(): kratki "ding" na CONFIG.AUDIO_LEVEL_FREQ (528Hz) za 150ms.
 *
 * Tišina između otkucaja je namerna — naglašava tenziju.
 * Sve frekvencije su iz CONFIG.AUDIO_* konstanti.
 */

import { CONFIG } from './config.js';

/** @type {AudioContext|null} */
let _ctx = null;

/**
 * Inicijalizuje AudioContext (lazy, na prvu interakciju).
 * Poziva se iz main.js, ali AudioContext se ne kreira dok korisnik ne klikne.
 * Dodaje listener koji kreira context na prvi click/touch/keydown.
 */
export function initAudio() {
  const resume = () => {
    if (!_ctx) {
      try {
        _ctx = new AudioContext();
      } catch (e) {
        // AudioContext nije podržan u ovom browseru
        return;
      }
    }
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
  };
  window.addEventListener('click', resume, { once: true });
  window.addEventListener('keydown', resume, { once: true });
  window.addEventListener('touchstart', resume, { once: true });
}

/**
 * Vraća AudioContext ako je inicijalizovan i nije zatvoren, null ako nije.
 * Interne funkcije za playback koriste ovo da skippuju ako nema context-a.
 *
 * @returns {AudioContext|null}
 */
function _getCtx() {
  return _ctx && _ctx.state !== 'closed' ? _ctx : null;
}

/**
 * Interno: kreira OscillatorNode + GainNode sa linearnim envelope-om i pušta ga.
 *
 * @param {number} freqStart - Početna frekvencija (Hz)
 * @param {number} freqEnd - Krajnja frekvencija (Hz), ista kao start za konstantan ton
 * @param {number} duration - Trajanje u sekundama
 * @param {number} peakGain - Maksimalna glasnoća (0.0–1.0)
 * @param {'sine'|'square'|'sawtooth'|'triangle'} [type] - Tip oscilatorа (default: 'sine')
 */
function _playTone(freqStart, freqEnd, duration, peakGain, type = 'sine') {
  const ctx = _getCtx();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    const now = ctx.currentTime;

    // Frequency sweep (od freqStart do freqEnd)
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqStart !== freqEnd) {
      osc.frequency.linearRampToValueAtTime(freqEnd, now + duration);
    }

    // Envelope: kratki attack (1ms), decay do 0 na kraju
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.001); // 1ms attack
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.01);

    // Cleanup posle završetka
    osc.addEventListener('ended', () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch (_) {
        // ignore
      }
    });
  } catch (e) {
    // Tiho ignoriši audio greške (ne prekidaj igru)
  }
}

/**
 * Puls zvuk — sinusni udarac na CONFIG.AUDIO_PULSE_FREQ (60Hz).
 * Kratki attack + brzi decay = EKG otkucaj.
 * Poziva se iz pulse.js na svakom puls eventu.
 */
export function playPulse() {
  _playTone(
    CONFIG.AUDIO_PULSE_FREQ,
    CONFIG.AUDIO_PULSE_FREQ,
    CONFIG.AUDIO_PULSE_DURATION,
    0.3
  );
}

/**
 * Collectible pickup zvuk — ascending tone 440→880 Hz za 80ms.
 * Pentatonski interval (oktava) koji daje osećaj nagrade.
 * Poziva se iz collision.js na pickup-u.
 */
export function playCollectible() {
  _playTone(
    CONFIG.AUDIO_COLLECT_FREQ_START,
    CONFIG.AUDIO_COLLECT_FREQ_END,
    CONFIG.AUDIO_COLLECT_DURATION,
    0.25
  );
}

/**
 * Game over zvuk — descending sine glide 880→110 Hz za 600ms.
 * Dramatičan pad koji naglašava kraj runa.
 * Poziva se iz main.js na endRun().
 */
export function playGameOver() {
  _playTone(
    CONFIG.AUDIO_GAMEOVER_FREQ_START,
    CONFIG.AUDIO_GAMEOVER_FREQ_END,
    CONFIG.AUDIO_GAMEOVER_DURATION,
    0.35
  );
}

/**
 * Level transition zvuk — kratki "ding" na 528 Hz za 150ms.
 * Poziva se iz main.js na nextLevel() — tirkizni flash + ovaj zvuk.
 */
export function playLevelTransition() {
  _playTone(
    CONFIG.AUDIO_LEVEL_FREQ,
    CONFIG.AUDIO_LEVEL_FREQ,
    CONFIG.AUDIO_LEVEL_DURATION,
    0.2
  );
}
