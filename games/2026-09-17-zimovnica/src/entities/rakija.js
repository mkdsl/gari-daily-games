/**
 * rakija.js — Rakija entity: status, liters, unlock_day check, destilacija batch.
 */

import { RAKIJA_UNLOCK_DAY, RAKIJA_LEGAL_CAP_L, YIELD } from '../config.js';

/**
 * Proverava da li je rakija dostupna za dati dan.
 * @param {number} day
 * @returns {boolean}
 */
export function isRakijaUnlocked(day) {
  return day >= RAKIJA_UNLOCK_DAY;
}

/**
 * Izračunava koliko litara rakije se dobija od kg šljiva/jabuka.
 * @param {number} inputKg
 * @param {number} efficiencyMult - Prestige bonus
 * @returns {number}
 */
export function calcRakijaLiters(inputKg, efficiencyMult = 1.0) {
  return inputKg * YIELD.rakija * efficiencyMult;
}

/**
 * Proverava da li je dodavanje litara unutar zakonskog limita.
 * @param {number} currentL
 * @param {number} addL
 * @returns {{ ok: boolean, allowed: number }}
 */
export function checkLegalCap(currentL, addL) {
  const allowed = Math.min(addL, RAKIJA_LEGAL_CAP_L - currentL);
  return { ok: allowed >= addL, allowed: Math.max(0, allowed) };
}

/**
 * Izračunava vrednost rakije (din/L).
 * @param {number} liters
 * @param {boolean} prestige
 * @returns {number}
 */
export function rakijaValue(liters, prestige = false) {
  const pricePerL = prestige ? 4500 : 3000;
  return liters * pricePerL;
}
