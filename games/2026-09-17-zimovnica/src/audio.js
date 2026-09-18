/**
 * audio.js — Web Audio API zvuci za Zimovnicu.
 * Kuhinjski ambijent, zvek tegli, bačva KO heavy, rakija hum.
 * Bez .wav/.mp3 fajlova — sve generisano proceduralno.
 */

/** @type {AudioContext|null} */
let ctx = null;

/** @type {boolean} */
let enabled = true;

/**
 * Inicijalizuje Web Audio kontekst.
 * Mora se pozvati nakon user gesture zbog autoplay policy.
 */
export function initAudio() {
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    enabled = false;
    console.warn('Zimovnica Audio: Web Audio nije podržan', e);
  }
}

/**
 * Reprodukuje zvuk po tipu akcije.
 * @param {'jar'|'barrel'|'harvest'|'sell'|'rakija'|'event'|'nextday'|'fail'|'success'} type
 */
export function playSound(type) {}

/**
 * Pokreće ambijentnu petlju (kuhinja, kapanje, bubbling fermentacije).
 */
export function startAmbient() {}

/**
 * Zaustavlja ambijentnu petlju.
 */
export function stopAmbient() {}

/**
 * Uključuje/isključuje zvuk.
 * @param {boolean} on
 */
export function setEnabled(on) { enabled = on; }

/** @returns {boolean} */
export function isEnabled() { return enabled; }
