/**
 * jar.js — Jar state: type, quantity, shelf assignment, expiry tracking.
 */

import { JAR_PRICES, JAR_ICONS } from '../config.js';

/**
 * @typedef {Object} Jar
 * @property {string} type - Tip tegle (npr. 'ajvar', 'tursija')
 * @property {number} qty - Količina u kg (ili L za rakiju)
 * @property {number} day_created - Dan kreiranja
 * @property {number} shelf_idx - Index police (0-based)
 * @property {string} icon - Emoji ikona
 */

/**
 * Kreira novu teglu.
 * @param {string} type
 * @param {number} qty
 * @param {number} day
 * @param {number} [shelfIdx=0]
 * @returns {Jar}
 */
export function createJar(type, qty, day, shelfIdx = 0) {
  return {
    type,
    qty,
    day_created: day,
    shelf_idx: shelfIdx,
    icon: JAR_ICONS[type] || '🫙'
  };
}

/**
 * Izračunava vrednost tegle u dinarima.
 * @param {Jar} jar
 * @param {boolean} [prestige=false] - Da li se primenjuju prestige cene
 * @returns {number}
 */
export function jarValue(jar, prestige = false) {
  const base = JAR_PRICES[jar.type] || 0;
  if (!prestige) return base * jar.qty;
  const mult = JAR_PRICES.prestige_mult?.[jar.type] || 1;
  return base * mult * jar.qty;
}

/**
 * Vraća ukupnu količinu tegli datog tipa.
 * @param {Jar[]} tegle
 * @param {string} type
 * @returns {number}
 */
export function totalQtyByType(tegle, type) {
  return tegle.filter(j => j.type === type).reduce((sum, j) => sum + j.qty, 0);
}

/**
 * Vraća ukupnu vrednost svih tegli.
 * @param {Jar[]} tegle
 * @param {boolean} [prestige=false]
 * @returns {number}
 */
export function totalJarValue(tegle, prestige = false) {
  return tegle.reduce((sum, j) => sum + jarValue(j, prestige), 0);
}
