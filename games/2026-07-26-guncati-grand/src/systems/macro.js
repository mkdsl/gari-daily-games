/** @fileoverview Weekly budget allocation logic, category cap enforcement, validation */

import { CONFIG } from '../config.js';
import { calcWBGain } from './wellbeing.js';
import { calcMarketingBonus } from './economy.js';

/**
 * Validate and clamp allocation
 * @param {Object} allocation - { gradnja, hrana, marketing, zajednica }
 * @param {number} weeklyBudget
 * @returns {{ valid: boolean, clamped: Object, errors: string[] }}
 */
export function validateAllocation(allocation, weeklyBudget) {
  const errors = [];
  const clamped = {};

  for (const [cat, val] of Object.entries(allocation)) {
    const catConfig = CONFIG.CATEGORIES[cat];
    if (!catConfig) continue;
    const cap = catConfig.cap;
    if (val < 0) {
      errors.push(`${cat}: ne može biti negativan`);
      clamped[cat] = 0;
    } else if (val > cap) {
      errors.push(`${cat}: max ${cap} GC`);
      clamped[cat] = cap;
    } else {
      clamped[cat] = Math.floor(val);
    }
  }

  const total = Object.values(clamped).reduce((a, b) => a + b, 0);
  if (total > weeklyBudget) {
    errors.push(`Ukupno ${total} GC prelazi budžet od ${weeklyBudget} GC`);
    // Scale down proportionally
    const scale = weeklyBudget / total;
    for (const k of Object.keys(clamped)) {
      clamped[k] = Math.floor(clamped[k] * scale);
    }
  }

  return {
    valid: errors.length === 0,
    clamped,
    errors
  };
}

/**
 * Calculate remaining budget after allocation
 * @param {Object} allocation
 * @param {number} weeklyBudget
 * @returns {number}
 */
export function calcRemainingBudget(allocation, weeklyBudget) {
  const spent = Object.values(allocation).reduce((a, b) => a + b, 0);
  return Math.max(0, weeklyBudget - spent);
}

/**
 * Calculate projected effects of allocation choices (for preview)
 * @param {Object} allocation
 * @param {Object} state
 * @returns {Object} projected effects
 */
export function projectAllocationEffects(allocation, state) {
  const wbGain = calcWBGain(allocation.hrana || 0, allocation.zajednica || 0);

  const parkingMult = state.buildings.parking > 0
    ? CONFIG.BUILDINGS.parking.levels[state.buildings.parking - 1].marketingMult
    : 1.0;
  const marketingBonus = calcMarketingBonus(allocation.marketing || 0, parkingMult);

  const crowdCapGain = Math.floor((allocation.gradnja || 0) / 10) *
    CONFIG.CATEGORIES.gradnja.perUnit.crowdCap;

  const tomSawyerActive = state.currentWB + wbGain >= CONFIG.TOM_SAWYER_THRESHOLD;
  const overTS = Math.max(0, state.currentWB + wbGain - CONFIG.TOM_SAWYER_THRESHOLD);
  const savings = overTS * CONFIG.TOM_SAWYER_SAVINGS_PER_POINT;

  return {
    wbGain: Math.round(wbGain),
    marketingBonus: Math.round(marketingBonus * 10) / 10,
    crowdCapGain,
    tomSawyerActive,
    volunteerSavings: Math.floor(savings),
    projectedWB: Math.min(100, Math.max(CONFIG.WB_MIN, state.currentWB + wbGain))
  };
}

/**
 * Resolve macro phase: apply allocation, calc costs, return week summary
 * @param {Object} state - full game state (read-only)
 * @param {Object} allocation - validated allocation
 * @param {Array} buildingUpgrades - [{ buildingId, newLevel }] applied this week
 * @returns {Object} macro result
 */
export function resolveMacro(state, allocation, buildingUpgrades) {
  const effects = projectAllocationEffects(allocation, state);

  // Volunteer cost
  const volCount = state.volunteers.length;
  const newWB = effects.projectedWB;
  const overTS = Math.max(0, newWB - CONFIG.TOM_SAWYER_THRESHOLD);
  const totalSavings = overTS * CONFIG.TOM_SAWYER_SAVINGS_PER_POINT;
  const baseVolCost = volCount * CONFIG.VOLUNTEER_COST;
  const actualVolCost = Math.max(0, baseVolCost - totalSavings);

  // Building upgrade costs
  const upgradeCost = buildingUpgrades.reduce((sum, u) => {
    const b = CONFIG.BUILDINGS[u.buildingId];
    if (!b) return sum;
    const def = b.levels[u.newLevel - 1];
    return sum + (def ? def.cost : 0);
  }, 0);

  const totalSpent = Object.values(allocation).reduce((a, b) => a + b, 0) +
    Math.floor(actualVolCost) + upgradeCost;

  return {
    allocation,
    buildingUpgrades,
    wbGain: effects.wbGain,
    volunteerCost: Math.floor(actualVolCost),
    volunteerSavings: Math.floor(totalSavings),
    upgradeCost,
    totalSpent,
    marketingBonus: effects.marketingBonus,
    crowdCapGain: effects.crowdCapGain
  };
}

/**
 * Check if a building upgrade is affordable this week
 * @param {string} buildingId
 * @param {number} currentLevel
 * @param {number} gcBalance
 * @param {number} upgradesThisWeek
 * @returns {{ canAfford: boolean, reason: string }}
 */
export function canAffordUpgrade(buildingId, currentLevel, gcBalance, upgradesThisWeek) {
  if (upgradesThisWeek >= CONFIG.MAX_BUILDING_UPGRADES_PER_WEEK) {
    return { canAfford: false, reason: `Max ${CONFIG.MAX_BUILDING_UPGRADES_PER_WEEK} upgrade-a po nedelji` };
  }
  const b = CONFIG.BUILDINGS[buildingId];
  if (!b) return { canAfford: false, reason: 'Nepoznata zgrada' };
  const def = b.levels[currentLevel];
  if (!def) return { canAfford: false, reason: 'Već maksimalan nivo' };
  if (gcBalance < def.cost) {
    return { canAfford: false, reason: `Nedostaje ${def.cost - gcBalance} GC` };
  }
  return { canAfford: true, reason: '' };
}

/**
 * Generate week-start tooltip hints for budget categories
 * @param {number} week
 * @param {number} currentWB
 * @returns {string[]}
 */
export function getMacroHints(week, currentWB) {
  const hints = [];
  if (week === 1) {
    hints.push('💡 Počni sa Gradnjom da podigneš kapacitet publike');
    hints.push('💡 Hrana i Zajednica podižu Wellbeing volontera');
  }
  if (currentWB < CONFIG.TOM_SAWYER_THRESHOLD) {
    hints.push(`✊ WB iznad ${CONFIG.TOM_SAWYER_THRESHOLD}% = besplatan volonterski rad`);
  } else {
    const over = currentWB - CONFIG.TOM_SAWYER_THRESHOLD;
    const savings = over * CONFIG.TOM_SAWYER_SAVINGS_PER_POINT;
    hints.push(`🎯 Tom Sawyer: šteduješ ~${Math.floor(savings)} GC na volonterima`);
  }
  if (week >= 7) {
    hints.push('⚡ Finale se bliži! Fokusiraj se na DJ slotove i Pozornicu');
  }
  return hints;
}
