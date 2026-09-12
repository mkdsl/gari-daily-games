/**
 * timer.js — Vremenski napredak igre (07:00 → 19:00, 12 sati)
 */

import { HOURS } from '../config.js';

/**
 * Formatuj sat za prikaz (07:00 format)
 * @param {number} hour - 7..19
 * @returns {string}
 */
export function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * Napreduj na sledeći sat
 * @param {GameState} state - mutira state.currentHourIndex
 * @returns {boolean} - true ako još ima sati
 */
export function advanceHour(state) {
  if (state.currentHourIndex < HOURS.length - 1) {
    state.currentHourIndex++;
    return true;
  }
  return false;
}

/**
 * Vrati trenutni sat
 * @param {GameState} state
 * @returns {number} - 7..19
 */
export function getCurrentHour(state) {
  return HOURS[state.currentHourIndex] || 19;
}

/**
 * Da li smo na poslednjem satu?
 */
export function isLastHour(state) {
  return state.currentHourIndex >= HOURS.length - 1;
}

/**
 * Progress kao broj 0..1
 */
export function progressRatio(state) {
  return state.currentHourIndex / (HOURS.length - 1);
}

/**
 * Preostalo sati
 */
export function hoursLeft(state) {
  return HOURS.length - 1 - state.currentHourIndex;
}

/**
 * Label za progress bar
 */
export function progressLabel(state) {
  const hour = getCurrentHour(state);
  const left = hoursLeft(state);
  return `${formatHour(hour)} — još ${left} sat${left === 1 ? '' : 'i'}`;
}

/**
 * Svi sati sa njihovim indexima
 */
export function getAllHours() {
  return HOURS.map((h, i) => ({ hour: h, index: i, label: formatHour(h) }));
}
