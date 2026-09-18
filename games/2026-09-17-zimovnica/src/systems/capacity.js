/**
 * capacity.js — Shelf capacity calculation, placement check.
 * Re-exports getCapacity/hasCapacity from entities/shelf.js with
 * state-aware wrappers for use by action handlers.
 */

import {
  getCapacity as shelfGetCapacity,
  hasCapacity as shelfHasCapacity
} from '../entities/shelf.js';

/**
 * Vraća kapacitet polica za dati state ili shelf_level.
 * Prihvata i state objekat i broj (za kompatibilnost).
 * @param {object|number} stateOrLevel - Game state ili shelf_level index
 * @returns {number} Kapacitet u kg
 */
export function getCapacity(stateOrLevel) {
  const level = typeof stateOrLevel === 'number'
    ? stateOrLevel
    : (stateOrLevel?.shelf_level ?? 0);
  return shelfGetCapacity(level);
}

/**
 * Vraća ukupan broj kg tegli u state-u.
 * @param {object|Array} stateOrTegle - Game state ili tegle array
 * @returns {number}
 */
export function getTotalJars(stateOrTegle) {
  const tegle = Array.isArray(stateOrTegle) ? stateOrTegle : (stateOrTegle?.tegle ?? []);
  return tegle.reduce((sum, j) => sum + j.qty, 0);
}

/**
 * Proverava da li ima kapaciteta za qty novih kg.
 * @param {object|Array} stateOrTegle - Game state ili tegle array
 * @param {number} qty
 * @param {number} [shelfLevel] - Ignorišu se kad se prosledi state
 * @returns {boolean}
 */
export function hasCapacity(stateOrTegle, qty, shelfLevel) {
  if (typeof stateOrTegle === 'object' && !Array.isArray(stateOrTegle) && stateOrTegle.tegle !== undefined) {
    // state objekat
    return shelfHasCapacity(stateOrTegle.tegle, qty, stateOrTegle.shelf_level ?? 0);
  }
  return shelfHasCapacity(stateOrTegle, qty, shelfLevel ?? 0);
}

/**
 * Vraća ukupno korišćeni kapacitet (u kg) iz tegli.
 * @param {Array} tegle
 * @returns {number}
 */
export function usedCapacity(tegle) {
  return tegle.reduce((sum, j) => sum + j.qty, 0);
}

/**
 * Vraća procenat popunjenosti polica.
 * @param {Array} tegle
 * @param {number} shelfLevel
 * @returns {number} 0–1
 */
export function capacityPercent(tegle, shelfLevel) {
  const cap = shelfGetCapacity(shelfLevel);
  if (cap === 0) return 1;
  return Math.min(usedCapacity(tegle) / cap, 1);
}

/**
 * Proverava da li ima mesta za new batch output.
 * @param {Array} tegle
 * @param {number} newQty - Kg koji se dodaju
 * @param {number} shelfLevel
 * @returns {{ ok: boolean, message: string|null }}
 */
export function checkCapacity(tegle, newQty, shelfLevel) {
  const ok = shelfHasCapacity(tegle, newQty, shelfLevel);
  return {
    ok,
    message: ok ? null : `Nema mesta! Police su pune (${shelfGetCapacity(shelfLevel)} kg max).`
  };
}

/**
 * Koliko kg slobodnog prostora preostaje.
 * @param {Array} tegle
 * @param {number} shelfLevel
 * @returns {number}
 */
export function freeCapacity(tegle, shelfLevel) {
  return Math.max(0, shelfGetCapacity(shelfLevel) - usedCapacity(tegle));
}
