/**
 * audio.js — Mozaik Ludila
 * Web Audio engine: mediteransko, meditativno, kameni odjek.
 * Sve generisano u kodu — bez .mp3/.wav fajlova.
 */

/** @type {AudioContext|null} */
let audioCtx = null;

/**
 * Inicijalizuje AudioContext posle prvog user interaction.
 * Bezbedno je pozvati više puta — inicijalizuje se samo jednom.
 */
export function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return; // graceful degrade — tiho nastavi
  audioCtx = new Ctx();
}

/**
 * Interni helper — kreira i reprodukuje jedan ton.
 * @param {number} frequency - Hz
 * @param {'sine'|'triangle'|'sawtooth'|'square'} type
 * @param {number} gainPeak - vršna glasnoća (0–1)
 * @param {number} durationSec - trajanje fade-outa u sekundama
 * @param {number} [startDelay=0] - kašnjenje od currentTime u sekundama
 */
function playTone(frequency, type, gainPeak, durationSec, startDelay = 0) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime + startDelay;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(gainPeak, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

  osc.start(t);
  osc.stop(t + durationSec + 0.05);
}

/**
 * Reprodukuje zvuk postavljanja pločice na grid.
 * Kratak perkusivni keramički "klik".
 * @param {string} [color] - hex boja pločice (blago varira ton)
 */
export function playPlacement(color) {
  if (!audioCtx) return;

  // Izvuci malu varijaciju iz boje da svaka pločica zvuči jedinstevno
  let freq = 1000;
  if (color && typeof color === 'string') {
    const hue = parseInt(color.replace('#', '').slice(0, 2), 16);
    freq = 800 + (hue / 255) * 400; // raspon 800–1200 Hz
  }

  playTone(freq, 'sine', 0.15, 0.08);
}

/**
 * Reprodukuje zvuk match brisanja — harmoničan "ding" akord u kvintu.
 * @param {number} count - broj uklonjenih pločica (rezervisano za buduće variranje)
 */
export function playMatch(count) {
  if (!audioCtx) return;

  // C5 – G5 – C6 : osnova, kvinta, oktava
  playTone(523,  'sine', 0.1, 0.5, 0.0);
  playTone(784,  'sine', 0.1, 0.5, 0.0);
  playTone(1047, 'sine', 0.1, 0.5, 0.0);
}

/**
 * Reprodukuje combo fanfare — uzlazni niz nota.
 * @param {number} comboCount - magnitude combo-a (2, 3, 4, 5+)
 */
export function playCombo(comboCount) {
  if (!audioCtx) return;

  /** @type {number[]} */
  let notes;
  if (comboCount <= 2) {
    notes = [523, 659];
  } else if (comboCount === 3) {
    notes = [523, 659, 784];
  } else {
    // 4+: puna petočlana fanfare
    notes = [523, 587, 659, 784, 1047];
  }

  notes.forEach((freq, i) => {
    playTone(freq, 'triangle', 0.12, 0.25, i * 0.08);
  });
}

/**
 * Reprodukuje zvuk nevalidnog pokušaja postavljanja.
 * Blagi "bump" — nizak, kratak.
 */
export function playInvalid() {
  if (!audioCtx) return;
  playTone(120, 'sine', 0.08, 0.12);
}

/**
 * Reprodukuje kratki zvuk pobede (win screen).
 * Troakord crescendo + finalni "crown" ton.
 */
export function playWin() {
  if (!audioCtx) return;

  // Uzlazni troakord
  playTone(523, 'sine', 0.2, 0.8, 0.0);
  playTone(659, 'sine', 0.2, 0.8, 0.15);
  playTone(784, 'sine', 0.2, 0.8, 0.3);

  // Finalni "crown" — C6 kao vrhunac
  playTone(1047, 'sine', 0.25, 0.9, 0.5);
}

// Integrisati u input.js: import { initAudio, playPlacement, playMatch, playCombo, playInvalid, playWin } from './audio.js';
