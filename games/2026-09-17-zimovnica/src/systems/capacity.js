/**
 * capacity.js — Shelf capacity calculation, placement check.
 */

import { getCapacity, hasCapacity } from '../entities/shelf.js';

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
  const cap = getCapacity(shelfLevel);
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
  const ok = hasCapacity(tegle, newQty, shelfLevel);
  return {
    ok,
    message: ok ? null : `Nema mesta! Police su pune (${getCapacity(shelfLevel)} kg max).`
  };
}

/**
 * Koliko kg slobodnog prostora preostaje.
 * @param {Array} tegle
 * @param {number} shelfLevel
 * @returns {number}
 */
export function freeCapacity(tegle, shelfLevel) {
  return Math.max(0, getCapacity(shelfLevel) - usedCapacity(tegle));
}
