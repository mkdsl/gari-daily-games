/**
 * @file audio.js
 * @description Web Audio API stub za Frekventni Grad.
 *              Ceca Čujka popunjava implementaciju.
 *
 * Sve funkcije su no-op dok Ceca ne implementuje.
 * Poziva se iz main.js: initAudio() pri startu.
 * playHitSound se poziva iz scoring.js posle svakog hita.
 *
 * @module audio
 */

/** @type {AudioContext|null} */
let _ctx = null;

/** @type {AudioBufferSourceNode|null} */
let _bassSource = null;

/** @type {AudioBufferSourceNode|null} */
let _arpSource = null;

/**
 * Inicijalizuje AudioContext. Mora se zvati iz user gesture handlera.
 * @returns {Promise<void>}
 */
export async function initAudio() {
  // TODO: Ceca — kreiraj AudioContext, pripremi oscillator pool
}

/**
 * Pokreće bas loop u petlji na zadatom BPM-u.
 * @param {number} bpm
 * @returns {void}
 */
export function playBassLoop(bpm) {
  // TODO: Ceca — low-frequency oscillator loop sinhronizovan sa BPM-om
}

/**
 * Zaustavlja bas loop.
 * @returns {void}
 */
export function stopBassLoop() {
  // TODO: Ceca
}

/**
 * Pokreće arpegio loop u petlji na zadatom BPM-u.
 * @param {number} bpm
 * @returns {void}
 */
export function playArpeggio(bpm) {
  // TODO: Ceca — kratki neon arpegio (pentatonska skala)
}

/**
 * Zaustavlja arpegio loop.
 * @returns {void}
 */
export function stopArpeggio() {
  // TODO: Ceca
}

/**
 * Reproducira kratki hit zvuk koji odgovara rezultatu udara.
 * @param {'PERFECT'|'GOOD'|'MISS'} result
 * @returns {void}
 */
export function playHitSound(result) {
  // TODO: Ceca — PERFECT: visok ping, GOOD: srednji ping, MISS: low thud
}

/**
 * Reproducira kratku jingle melodiju na kraju noći.
 * @returns {void}
 */
export function playNightEnd() {
  // TODO: Ceca — ascending arpeggio chord
}
