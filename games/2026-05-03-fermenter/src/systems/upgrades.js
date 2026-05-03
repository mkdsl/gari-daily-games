/**
 * @file systems/upgrades.js
 * Fermenter — Varenički Bunt
 * Upgrade troškovi, provjera sredstava i kupovina.
 */

import { CONFIG } from '../config.js';
import { computeDerivedStats } from '../state.js';

/**
 * Vrati definiciju upgrada iz CONFIG po ID-u.
 * @param {string} upgradeId
 * @returns {{id:string,baseCost:number,growthFactor:number,maxLevel:number}|undefined}
 */
function findUpgradeDef(upgradeId) {
  return CONFIG.UPGRADES.find(u => u.id === upgradeId);
}

/**
 * Izračunaj cenu sledećeg nivoa upgrada.
 * @param {string} upgradeId
 * @param {number} currentLevel — trenutni nivo (0 = nije kupljen)
 * @returns {number} — cena u SJ; Infinity ako je dostignut maxLevel ili upgrade ne postoji
 */
export function getUpgradeCost(upgradeId, currentLevel) {
  const def = findUpgradeDef(upgradeId);
  if (!def) return Infinity;
  if (currentLevel >= def.maxLevel) return Infinity;
  return Math.round(def.baseCost * Math.pow(def.growthFactor, currentLevel));
}

/**
 * Provjeri može li igrač da priušti sledeći nivo upgrada.
 * @param {GameState} state
 * @param {string} upgradeId
 * @returns {boolean}
 */
export function canAfford(state, upgradeId) {
  const currentLevel = state.upgrades[upgradeId] || 0;
  const cost = getUpgradeCost(upgradeId, currentLevel);
  return cost !== Infinity && state.sj >= cost;
}

/**
 * Kupi sledeći nivo upgrada ako igrač može da priušti.
 * M6 (Osmofilna Adaptacija): auto_ferment_1 i auto_ferment_2 kostaju 30% manje.
 * @param {GameState} state — mutira se in-place
 * @param {string} upgradeId
 * @returns {boolean} — true ako je kupovina uspješna
 */
export function buyUpgrade(state, upgradeId) {
  const currentLevel = state.upgrades[upgradeId] || 0;
  let cost = getUpgradeCost(upgradeId, currentLevel);

  if (cost === Infinity) return false;

  // M6 Osmofilna Adaptacija: auto-ferment upgejdi 30% jeftiniji
  const isAutoFerment =
    upgradeId === 'auto_ferment_1' || upgradeId === 'auto_ferment_2';
  if (isAutoFerment && state.activeMutations.includes('M6')) {
    cost = Math.round(cost * 0.7);
  }

  if (state.sj < cost) return false;

  state.sj -= cost;
  state.upgrades[upgradeId] = currentLevel + 1;
  computeDerivedStats(state);
  return true;
}
