/**
 * prestige.js — Prestige gate, carry-over kasa/recepti, Medenjaci check (run 2+), endings.
 */

import { PRESTIGE_THRESHOLDS } from '../config.js';
import { totalJarValue } from '../entities/jar.js';
import { ENDINGS_DATA } from '../content/endings_data.js';

/**
 * Alias za isPrestigeEligible — kompatibilnost sa task brief imenima.
 * @param {object} state
 * @returns {boolean}
 */
export function checkPrestigeCondition(state) {
  return isPrestigeEligible(state);
}

/**
 * Primenjuje prestige — ažurira persistent, daje bonuse za sledeći run.
 * @param {object} state
 * @param {object} persistent
 * @returns {{ state: object, persistent: object }}
 */
export function applyPrestige(state, persistent) {
  const bonuses = calcPrestigeBonuses(state, persistent);
  const updated_persistent = {
    ...persistent,
    run_number: (persistent.run_number || 1) + 1,
    total_runs: (persistent.total_runs || 0) + 1,
    best_kasa: Math.max(persistent.best_kasa || 0, state.kasa),
    best_jars: Math.max(persistent.best_jars || 0, state.tegle.reduce((s, j) => s + j.qty, 0)),
    endings_seen: [...new Set([...(persistent.endings_seen || []), state.ending])].filter(Boolean),
    carry_bonuses: bonuses,
    lifetime_stats: {
      total_jars_made: (persistent.lifetime_stats?.total_jars_made || 0) + state.tegle.reduce((s, j) => s + j.qty, 0),
      total_kasa_earned: (persistent.lifetime_stats?.total_kasa_earned || 0) + state.kasa,
      bačva_successes: (persistent.lifetime_stats?.bačva_successes || 0) + (state.bačva_status === 'ready' ? 1 : 0),
      bačva_failures: (persistent.lifetime_stats?.bačva_failures || 0) + (state.bačva_status === 'failed' ? 1 : 0),
      rakija_L_total: (persistent.lifetime_stats?.rakija_L_total || 0) + (state.rakija_reserve_L || 0),
    },
    // track for medenjaci unlock
    has_rakija: (persistent.has_rakija || state.rakija_reserve_L > 0),
    has_dried_plums: (persistent.has_dried_plums || state.tegle.some(j => j.type === 'sušene_šljive')),
  };

  const new_state = {
    ...state,
    prestige_active: true,
    prestige_bonuses: {
      recipe_efficiency: 1.20,
      market_unlocked: true,
      commander_bačva: true,
      extra_shelf: bonuses.extra_shelf || false,
    },
    run_number: updated_persistent.run_number,
  };

  return { state: new_state, persistent: updated_persistent };
}

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
