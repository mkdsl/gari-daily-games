/**
 * progression.js — Unlock tracking: shelf upgrades, rakija unlock, recepti.
 */

import { RAKIJA_UNLOCK_DAY } from '../config.js';
import { addLog } from '../state.js';

/**
 * Proverava i primenjuje sve progression unlockove za trenutni state.
 * @param {object} state
 * @returns {object} Ažurirani state
 */
export function checkProgressionUnlocks(state) {
  let s = { ...state };

  // Rakija unlock na dan RAKIJA_UNLOCK_DAY
  if (!s.unlocks.rakija && s.day >= RAKIJA_UNLOCK_DAY) {
    s = { ...s, unlocks: { ...s.unlocks, rakija: true } };
    s = addLog(s, '🫗 Novo! Rakija je dostupna od danas.', 'success');
  }

  // Pijaca unlock (prestige only)
  if (!s.unlocks.pijaca && s.prestige_bonuses?.market_unlocked) {
    s = { ...s, unlocks: { ...s.unlocks, pijaca: true } };
  }

  // Medenjaci unlock (needs džem + prestige run 2+)
  if (!s.unlocks.medenjaci && s.prestige_active) {
    const hasJam = s.tegle.some(j => j.type === 'dzem' && j.qty >= 5);
    if (hasJam) {
      s = { ...s, unlocks: { ...s.unlocks, medenjaci: true } };
      s = addLog(s, '🍪 Novo! Medenjaci se mogu praviti.', 'success');
    }
  }

  // Sušene šljive unlock (day 5+, šljive berba >= 20 kg at any point)
  if (!s.unlocks.sušene_šljive && s.day >= 5) {
    s = { ...s, unlocks: { ...s.unlocks, sušene_šljive: true } };
  }

  return s;
}

/**
 * Alias za checkProgressionUnlocks — kompatibilnost sa task brief imenima.
 * @param {object} state
 * @returns {object}
 */
export function checkUnlocks(state) {
  return checkProgressionUnlocks(state);
}

/**
 * Vraća opis narednog unlock-a za UI hint.
 * @param {object} unlocks
 * @param {number} day
 * @returns {string|null}
 */
export function getNextUnlockHint(unlocks, day) {
  if (!unlocks.rakija && day < RAKIJA_UNLOCK_DAY) {
    return `Rakija dostupna za ${RAKIJA_UNLOCK_DAY - day} dan(a)`;
  }
  if (!unlocks.medenjaci) {
    return 'Napravi 5 kg džema za medenjaci recept';
  }
  return null;
}
