/** @module systems/upgrade_manager — purchase, effects, prereqs */

import { UPGRADES_MAP, getUpgradeCost } from '../content/upgrades_data.js';

/**
 * Compute active upgrade effects from purchased upgrade list
 * @param {string[]} purchased array of upgrade IDs with levels like 'P1:2'
 * @returns {Record<string, number>} effectKey → accumulated value
 */
export function computeUpgradeEffects(purchased) {
  const effects = {};
  for (const entry of purchased) {
    const [id, lvlStr] = entry.split(':');
    const level = parseInt(lvlStr) || 1;
    const upgrade = UPGRADES_MAP.get(id);
    if (!upgrade) continue;
    const key = upgrade.effectKey;
    effects[key] = (effects[key] || 0) + upgrade.effectValue * level;
  }
  return effects;
}

/**
 * Get current level of an upgrade
 * @param {string[]} purchased
 * @param {string} upgradeId
 * @returns {number} 0 if not purchased
 */
export function getUpgradeLevel(purchased, upgradeId) {
  const entry = purchased.find(e => e.startsWith(upgradeId + ':'));
  if (!entry) return purchased.includes(upgradeId) ? 1 : 0;
  return parseInt(entry.split(':')[1]) || 0;
}

/**
 * Try to buy an upgrade
 * @param {import('../state.js').MacroState} macro
 * @param {string} upgradeId
 * @returns {{ ok:boolean, reason?:string }}
 */
export function buyUpgrade(macro, upgradeId) {
  const upgrade = UPGRADES_MAP.get(upgradeId);
  if (!upgrade) return { ok: false, reason: 'Nepoznat upgrade' };

  const currentLevel = getUpgradeLevel(macro.upgrades_purchased, upgradeId);
  if (currentLevel >= upgrade.maxLevel) {
    return { ok: false, reason: `Max nivo dostignut (${upgrade.maxLevel})` };
  }

  // Prereq check
  if (upgrade.prereqId) {
    const prereqLevel = getUpgradeLevel(macro.upgrades_purchased, upgrade.prereqId);
    if (prereqLevel < (upgrade.prereqLevel || 1)) {
      return { ok: false, reason: `Prerekvizit: ${upgrade.prereqId} nivo ${upgrade.prereqLevel}` };
    }
  }

  const cost = getUpgradeCost(upgrade, currentLevel);
  if (macro.budget < cost) {
    return { ok: false, reason: `Nedovoljan budžet (${cost} EUR)` };
  }

  macro.budget -= cost;

  // Update purchased list
  const existingIdx = macro.upgrades_purchased.findIndex(e => e.startsWith(upgradeId + ':') || e === upgradeId);
  if (existingIdx >= 0) {
    macro.upgrades_purchased[existingIdx] = `${upgradeId}:${currentLevel + 1}`;
  } else {
    macro.upgrades_purchased.push(`${upgradeId}:${currentLevel + 1}`);
  }

  return { ok: true };
}

/**
 * Get all available upgrades with their status
 * @param {import('../state.js').MacroState} macro
 * @returns {Array<{upgrade, currentLevel, cost, canBuy, reason}>}
 */
export function getUpgradeList(macro) {
  return Array.from(UPGRADES_MAP.values()).map(upgrade => {
    const currentLevel = getUpgradeLevel(macro.upgrades_purchased, upgrade.id);
    const maxed = currentLevel >= upgrade.maxLevel;
    const cost = maxed ? 0 : getUpgradeCost(upgrade, currentLevel);

    let canBuy = !maxed && macro.budget >= cost;
    let reason = null;

    if (maxed) {
      reason = 'Max nivo';
    } else if (upgrade.prereqId) {
      const prereqLevel = getUpgradeLevel(macro.upgrades_purchased, upgrade.prereqId);
      if (prereqLevel < (upgrade.prereqLevel || 1)) {
        canBuy = false;
        reason = `Prerekvizit: ${upgrade.prereqId} nivo ${upgrade.prereqLevel}`;
      }
    }

    if (!canBuy && !reason && macro.budget < cost) {
      reason = `Nedovoljan budžet (${cost} EUR)`;
    }

    return { upgrade, currentLevel, cost, canBuy, reason };
  });
}
