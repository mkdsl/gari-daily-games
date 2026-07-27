/** @fileoverview Building entity logic: 5 types × 3 levels, costs, effects, unlock conditions */

import { CONFIG } from '../config.js';

/**
 * Check if a building level is unlocked for purchase
 * @param {string} buildingId
 * @param {number} currentLevel - 0-based (0 = not built)
 * @param {Object} state
 * @returns {{ unlocked: boolean, reason: string }}
 */
export function isBuildingUnlocked(buildingId, currentLevel, state) {
  const building = CONFIG.BUILDINGS[buildingId];
  if (!building) return { unlocked: false, reason: 'Unknown building' };

  const targetLevel = currentLevel; // we're buying index currentLevel (0-based)
  const levelDef = building.levels[targetLevel];
  if (!levelDef) return { unlocked: false, reason: 'Max level reached' };

  // Parking is locked until satre L2 unlocks it
  if (buildingId === 'parking' && state.buildings.satre < 2) {
    return { unlocked: false, reason: 'Zahteva Šatre nivo 2' };
  }

  // Check unlockWeek
  if (levelDef.unlockWeek && state.week < levelDef.unlockWeek) {
    return { unlocked: false, reason: `Otključava se u nedelji ${levelDef.unlockWeek}` };
  }

  // Check unlockCrowdCap
  if (levelDef.unlockCrowdCap && state.seasonCrowdCap < levelDef.unlockCrowdCap) {
    return { unlocked: false, reason: `Potreban crowd cap ${levelDef.unlockCrowdCap}` };
  }

  // Check unlockRevenue
  if (levelDef.unlockRevenue && state.totalRevenue < levelDef.unlockRevenue) {
    return { unlocked: false, reason: `Potreban prihod ${levelDef.unlockRevenue} GC` };
  }

  return { unlocked: true, reason: '' };
}

/**
 * Get the cost to upgrade a building to its next level
 * @param {string} buildingId
 * @param {number} currentLevel - 0-based
 * @returns {number} cost in GC, or Infinity if maxed
 */
export function getBuildingUpgradeCost(buildingId, currentLevel) {
  const building = CONFIG.BUILDINGS[buildingId];
  if (!building) return Infinity;
  const levelDef = building.levels[currentLevel];
  if (!levelDef) return Infinity;
  return levelDef.cost;
}

/**
 * Get cumulative effects from all buildings at their current levels
 * @param {Object} buildings - { buildingId: level (1-based, 0 = not built) }
 * @returns {Object} cumulative effects
 */
export function getBuildingEffects(buildings) {
  const effects = {
    crowdCap: 0,
    djSlots: 0,
    wellbeing: 0,
    revenuePct: 0,
    marketingMult: 1.0,
    crowdCapPenaltyRemoval: 0
  };

  for (const [id, level] of Object.entries(buildings)) {
    if (level === 0) continue;
    const building = CONFIG.BUILDINGS[id];
    if (!building) continue;

    // Sum effects from level 0 up to current level (cumulative)
    for (let l = 0; l < level; l++) {
      const def = building.levels[l];
      if (!def) continue;
      if (def.crowdCap)               effects.crowdCap += def.crowdCap;
      if (def.djSlots)                effects.djSlots = Math.max(effects.djSlots, def.djSlots);
      if (def.wellbeing)              effects.wellbeing += def.wellbeing;
      if (def.revenuePct)             effects.revenuePct += def.revenuePct;
      if (def.marketingMult)          effects.marketingMult *= def.marketingMult;
      if (def.crowdCapPenaltyRemoval) effects.crowdCapPenaltyRemoval += def.crowdCapPenaltyRemoval;
    }
  }

  return effects;
}

/**
 * Get building display info
 * @param {string} buildingId
 * @param {number} currentLevel - 1-based (0 = not built)
 * @returns {Object}
 */
export function getBuildingInfo(buildingId, currentLevel) {
  const building = CONFIG.BUILDINGS[buildingId];
  if (!building) return null;
  const maxLevel = building.levels.length;
  const isMaxed = currentLevel >= maxLevel;
  const nextLevelDef = isMaxed ? null : building.levels[currentLevel];
  const nextCost = isMaxed ? null : nextLevelDef.cost;

  return {
    id: buildingId,
    name: building.name,
    emoji: building.emoji || '🏗️',
    currentLevel,
    maxLevel,
    isMaxed,
    nextCost,
    nextLevelDef
  };
}

/**
 * Describe building effect for tooltip
 * @param {string} buildingId
 * @param {number} levelIndex - 0-based
 * @returns {string[]}
 */
export function describeBuildingLevel(buildingId, levelIndex) {
  const building = CONFIG.BUILDINGS[buildingId];
  if (!building) return [];
  const def = building.levels[levelIndex];
  if (!def) return [];

  const lines = [];
  if (def.crowdCap)               lines.push(`+${def.crowdCap} kapacitet publike`);
  if (def.djSlots)                lines.push(`${def.djSlots} DJ slot(ova)`);
  if (def.wellbeing)              lines.push(`+${def.wellbeing}% wellbeing`);
  if (def.revenuePct)             lines.push(`+${def.revenuePct}% prihod`);
  if (def.marketingMult)          lines.push(`×${def.marketingMult} marketing`);
  if (def.crowdCapPenaltyRemoval) lines.push(`Uklanja ${def.crowdCapPenaltyRemoval} kaznu kapaciteta`);
  if (def.unlockBuilding)         lines.push(`Otključava: ${Object.keys(def.unlockBuilding).join(', ')}`);
  return lines;
}
