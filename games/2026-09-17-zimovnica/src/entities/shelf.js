/**
 * shelf.js — Shelf kapacitet (bazno 2 police, upgradeable), placement logika.
 */

import { SHELF_UPGRADES } from '../config.js';

/**
 * Vraća trenutni shelf upgrade config na osnovu shelf_level.
 * @param {number} shelfLevel - Index u SHELF_UPGRADES
 * @returns {object}
 */
export function getCurrentShelfConfig(shelfLevel) {
  return SHELF_UPGRADES[Math.min(shelfLevel, SHELF_UPGRADES.length - 1)];
}

/**
 * Izračunava ukupan kapacitet polica (u tegla-kg).
 * @param {number} shelfLevel
 * @returns {number}
 */
export function getCapacity(shelfLevel) {
  return getCurrentShelfConfig(shelfLevel).capacity;
}

/**
 * Proverava da li ima mesta za novu teglu.
 * @param {Array} tegle
 * @param {number} addQty - Kg koje dodajemo
 * @param {number} shelfLevel
 * @returns {boolean}
 */
export function hasCapacity(tegle, addQty, shelfLevel) {
  const used = tegle.reduce((sum, j) => sum + j.qty, 0);
  return (used + addQty) <= getCapacity(shelfLevel);
}

/**
 * Vraća sledeći dostupan upgrade ili null ako je max.
 * @param {number} shelfLevel
 * @param {boolean} prestigeActive
 * @returns {object|null}
 */
export function getNextUpgrade(shelfLevel, prestigeActive) {
  const next = shelfLevel + 1;
  if (next >= SHELF_UPGRADES.length) return null;
  const cfg = SHELF_UPGRADES[next];
  if (cfg.prestige_only && !prestigeActive) return null;
  return cfg;
}
