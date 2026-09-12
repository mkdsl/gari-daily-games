/**
 * endings.js — Ending detekcija na kraju igre
 */

import { computeCS } from '../state.js';

/**
 * Odredi ending na osnovu finalnog state-a
 * Redosled provere je bitan — proverava redom od najboljeg ka najgorem
 * @param {GameState} state
 * @returns {{ id: string, label: string, prestigeUnlock?: boolean }}
 */
export function detectEnding(state) {
  const { veze, secanja, energija } = state.resources;
  const cs = computeCS(state);

  // 1. Zajednica nastaje (Veze ≥ 8 AND Sećanja ≥ 5)
  if (veze >= 8 && secanja >= 5) {
    return {
      id: 'zajednica',
      label: 'Zajednica nastaje',
      prestigeUnlock: false
    };
  }

  // 2. Dobar posao (CS 6-10)
  if (cs >= 6 && cs <= 10) {
    return {
      id: 'dobar',
      label: 'Dobar posao',
      prestigeUnlock: false
    };
  }

  // 3. Sledeće leto (CS < 6 AND Energija > 3) — prestige unlock
  if (cs < 6 && energija > 3) {
    return {
      id: 'sledece',
      label: 'Sledeće leto',
      prestigeUnlock: true
    };
  }

  // 4. Sagoreo si (CS < 6 AND Energija ≤ 3)
  return {
    id: 'sagoreo',
    label: 'Sagoreo si',
    prestigeUnlock: false
  };
}

/**
 * Finalni CS broj formatovan
 * @param {GameState} state
 * @returns {string}
 */
export function formatCS(state) {
  const cs = computeCS(state);
  return cs.toFixed(1);
}

/**
 * Resurs pregled za ending screen
 * @param {GameState} state
 * @returns {Array<{label, value, max, color}>}
 */
export function endingResourceSummary(state) {
  return [
    { label: 'Energija', value: state.resources.energija, max: 10, color: '#4a7c59' },
    { label: 'Veze',     value: state.resources.veze,     max: 10, color: '#3a6a9e' },
    { label: 'Sećanja',  value: state.resources.secanja,  max: 10, color: '#c8820a' },
    { label: 'Nered',    value: state.resources.nered,    max: 10, color: '#b03030', inverted: true }
  ];
}
