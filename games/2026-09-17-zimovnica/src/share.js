/**
 * share.js — Screenshot i share funkcionalnost.
 * html2canvas screenshot + Web Share API. Cross-event glue za Guncati/MKDSLend.
 */

/**
 * Pravi screenshot ending screena i nudi share/download.
 * @param {object} state - Game state sa ending podacima
 * @param {object} persistent - Persistent state sa statistikama
 */
export async function shareEnding(state, persistent) {}

/**
 * Generiše share tekst na osnovu ending tipa.
 * @param {string} endingId
 * @param {object} state
 * @returns {string} Share tekst
 */
export function generateShareText(endingId, state) {
  return '';
}

/**
 * Proverava da li je Web Share API dostupan.
 * @returns {boolean}
 */
export function canShare() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}
