/**
 * fermentation.js — Fermentation progress: turšija 3 dana, barrel state machine.
 */

import { FERMENTATION_DAYS } from '../config.js';

/**
 * @typedef {'unsalted'|'critical_window'|'fermenting'|'ready'|'failed'} BacvaStatus
 */

/**
 * Vraća broj preostalih dana fermentacije bačve.
 * @param {number} initDay - Dan inicijacije
 * @param {number} currentDay
 * @returns {number}
 */
export function bacvaDaysRemaining(initDay, currentDay) {
  const endDay = initDay + FERMENTATION_DAYS.bačva;
  return Math.max(0, endDay - currentDay);
}

/**
 * Proverava da li je turšija batch završen.
 * @param {number} startDay
 * @param {number} currentDay
 * @returns {boolean}
 */
export function isTursijaReady(startDay, currentDay) {
  return currentDay >= startDay + FERMENTATION_DAYS.tursija;
}

/**
 * Vraća opisni tekst statusa bačve.
 * @param {BacvaStatus} status
 * @param {number} daysRemaining
 * @returns {string}
 */
export function bacvaStatusText(status, daysRemaining) {
  switch (status) {
    case 'unsalted':        return 'Bačva — čeka inicijaciju';
    case 'critical_window': return '⚠️ Bačva — pokrenuti odmah!';
    case 'fermenting':      return `🪣 Bačva — još ${daysRemaining} dan(a)`;
    case 'ready':           return '✅ Bačva gotova — kiseli kupus spreman!';
    case 'failed':          return '💀 Bačva — propuštena inicijacija';
    default:                return 'Bačva — nepoznat status';
  }
}
