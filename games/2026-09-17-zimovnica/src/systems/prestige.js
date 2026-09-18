/**
 * prestige.js — Prestige gate, carry-over kasa/recepti, Medenjaci check (run 2+), endings.
 */

import { PRESTIGE_THRESHOLDS } from '../config.js';
import { totalJarValue } from '../entities/jar.js';
import { ENDINGS_DATA } from '../content/endings_data.js';

/**
 * Proverava da li je igrač dostigao prestige threshold.
 * @param {object} state
 * @returns {boolean}
 */
export function isPrestigeEligible(state) {
  const totalJars = state.tegle.reduce((sum, j) => sum + j.qty, 0);
  return totalJars >= PRESTIGE_THRESHOLDS.min_jars &&
         state.kasa >= PRESTIGE_THRESHOLDS.min_kasa;
}

/**
 * Generiše prestige bonuse za sledeći run na osnovu performansi.
 * @param {object} state
 * @param {object} persistent
 * @returns {object} Carry-over bonusi
 */
export function calcPrestigeBonuses(state, persistent) {
  const jarVal = totalJarValue(state.tegle, false);
  return {
    kasa_bonus: Math.min(Math.floor(state.kasa * 0.20), 500),
    recipe_efficiency: Math.min(1.0 + (persistent.run_number || 1) * 0.05, 1.30),
    market_unlocked: persistent.run_number >= 2,
    commander_bačva: persistent.run_number >= 3,
    extra_shelf: jarVal >= 5000,
    harvest_bonus: Math.min(1.0 + (persistent.run_number || 1) * 0.03, 1.20),
  };
}

/**
 * Određuje ending na osnovu završnog state-a.
 * @param {object} state
 * @param {object} persistent
 * @returns {string} Ending id
 */
export function checkEnding(state, persistent) {
  const totalJars = state.tegle.reduce((sum, j) => sum + j.qty, 0);
  const hasRakija = state.rakija_reserve_L > 0;
  const hasMedenjaci = state.tegle.some(j => j.type === 'medenjaci');
  const bacvaSuccess = state.bačva_status === 'ready';
  const bacvaFailed = state.bačva_status === 'failed';

  // Medenjaci ending (run 2+)
  if (hasMedenjaci && state.run_number >= 2) return 'medenjaci';

  // Imanje Prezimlelo — sve ide
  if (totalJars >= 100 && hasRakija && bacvaSuccess) return 'imanje_prezimlelo';

  // Dobra sezona
  if (totalJars >= 60 && state.kasa >= 1000) return 'dobra_sezona';

  // Dovoljno
  if (totalJars >= 30) return 'dovoljno';

  // Trula Berba — propustili sve
  if (bacvaFailed && totalJars < 20) return 'trula_berba';

  // Zima bez rezervi
  return 'zima_bez_rezervi';
}

/**
 * Vraća podatke za ending po id-u.
 * @param {string} endingId
 * @returns {object|undefined}
 */
export function getEndingData(endingId) {
  return ENDINGS_DATA.find(e => e.id === endingId);
}
