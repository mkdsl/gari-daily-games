/**
 * rakija.js — Rakija entity: status, liters, unlock_day check, destilacija batch.
 */

import { RAKIJA_UNLOCK_DAY, RAKIJA_LEGAL_CAP_L, YIELD, SLOT_COST } from '../config.js';
import { createBatchJob } from './batchjob.js';

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

/**
 * Proverava da li se može pokrenuti destilacija.
 * @param {object} state
 * @returns {boolean}
 */
export function canDestilize(state) {
  if (state.day < RAKIJA_UNLOCK_DAY) return false;
  if (!state.unlocks?.rakija) return false;
  const jabuke = state.sirovine?.jabuke || 0;
  const sljive = state.sirovine?.sljive || 0;
  return jabuke >= 15 || sljive >= 10;
}

/**
 * Pokreće destilaciju kao pasivni posao. -3 action slota.
 * Bira jabuke ako dostupne >= 15, inače šljive.
 * @param {object} state
 * @returns {{ state: object, error: string|null }}
 */
export function destilize(state) {
  if (!canDestilize(state)) {
    return { state, error: 'Destilacija nije dostupna (dan < 7, ili nema sirovine).' };
  }
  const slotCost = SLOT_COST.destilacija || 3;
  if ((state.slots || 0) < slotCost) {
    return { state, error: `Nema dovoljno slotova (treba ${slotCost}).` };
  }

  const jabuke = state.sirovine?.jabuke || 0;
  const sljive = state.sirovine?.sljive || 0;
  const inputType = jabuke >= 15 ? 'jabuke' : 'sljive';
  const inputKg = inputType === 'jabuke' ? jabuke : sljive;

  const efficiency = state.prestige_bonuses?.recipe_efficiency || 1.0;
  const rawL = calcRakijaLiters(inputKg, efficiency);
  const { allowed } = checkLegalCap(state.rakija_reserve_L || 0, rawL);

  if (allowed <= 0) {
    return { state, error: `Zakonski limit ${RAKIJA_LEGAL_CAP_L}L dostignut.` };
  }

  const newSirovine = { ...state.sirovine, [inputType]: 0 };
  const job = createBatchJob('rakija', state.day, 1, inputKg, allowed, inputType);

  return {
    state: {
      ...state,
      sirovine: newSirovine,
      passive_jobs: [...(state.passive_jobs || []), job],
      slots: (state.slots || 0) - slotCost,
    },
    error: null,
  };
}
