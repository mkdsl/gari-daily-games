/**
 * systems/index.js — Wire-uje sve sisteme Mozaik Ludila.
 *
 * NOTA: Input handling (postavljanje fragmenta, selekcija, rotacija) je
 * implementiran direktno u input.js koji muta state po referenci.
 * Ovaj fajl je rezervisan za buduće sisteme koji se pozivaju u update petlji.
 *
 * U koraku 4c će biti dodat sistem za:
 *   - Hint state ažuriranje (posle svakog postavljanja)
 *   - Fragment queue management
 *   - Win/lose state management
 */

// Re-eksportuj sisteme za lak import iz drugih modula
export { evaluateMatches, clearMatchedCells, matchedSetToArray } from './matching.js';
export { isValidPlacement, placeFragment, checkGameOver, getFragmentCells } from './placement.js';
export { applyScore, getWinProgress } from './scoring.js';
