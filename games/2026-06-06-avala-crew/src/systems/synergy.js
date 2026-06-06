/**
 * synergy.js — detectSynergies, applySynergyBonuses
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { SYNERGIES_DATA, getSynergiesForMember } from '../content/synergies_data.js';
import { SYNERGY_BONUS_PER_ACTIVATION, MAX_SYNERGY_BONUS } from '../config.js';

/**
 * Detect all active synergies given current crew IDs
 * A synergy is "active" when ALL required members are in the crew
 *
 * @param {string[]} crewIds - Array of member IDs currently in crew
 * @param {Object} [synergiesData] - Optional override (defaults to SYNERGIES_DATA)
 * @returns {Array<{synergyId: string, memberIds: string[], effect: Object, name: string, desc: string}>}
 */
export function detectSynergies(crewIds, synergiesData = SYNERGIES_DATA) {
  const crewSet = new Set(crewIds);
  const active = [];

  for (const [id, synergy] of Object.entries(synergiesData)) {
    const allPresent = synergy.members.every(memberId => crewSet.has(memberId));
    if (allPresent) {
      active.push({
        synergyId: id,
        memberIds: synergy.members,
        effect: synergy.effect,
        name: synergy.name,
        desc: synergy.desc,
        shortDesc: synergy.shortDesc || synergy.desc,
        visible: synergy.visible
      });
    }
  }

  return active;
}

/**
 * Get all potentially activatable synergies for a partial crew selection
 * Used for roster preview — shows what synergies are "1 member away"
 *
 * @param {string[]} crewIds - Currently selected members
 * @returns {Array<{synergy: Object, missing: string[]}>}
 */
export function getNearbySynergies(crewIds) {
  const crewSet = new Set(crewIds);
  const nearby = [];

  for (const [id, synergy] of Object.entries(SYNERGIES_DATA)) {
    if (!synergy.visible) continue;
    const missing = synergy.members.filter(m => !crewSet.has(m));
    if (missing.length === 1) {
      nearby.push({ synergy: { ...synergy, id }, missing });
    }
  }

  return nearby;
}

/**
 * Apply synergy score bonuses to a running score total
 * Used in resolution.js for per-scenario bonuses
 *
 * @param {number} crewScore - Current crew score
 * @param {Object[]} activeSynergies - Active synergy objects from detectSynergies()
 * @param {Object} scenario - Current scenario
 * @returns {{modifiedScore: number, bonusMessages: string[]}}
 */
export function applySynergyBonuses(crewScore, activeSynergies, scenario) {
  let modifiedScore = crewScore;
  const bonusMessages = [];

  for (const syn of activeSynergies) {
    if (!syn.effect) continue;
    const eff = syn.effect;

    // Scenario type match
    const typeMatch = eff.scenarioType === scenario.type ||
      (Array.isArray(eff.scenarioTypes) && eff.scenarioTypes.includes(scenario.type));

    if (eff.type === 'scenario_bonus' && typeMatch && eff.bonus) {
      modifiedScore *= (1 + eff.bonus);
      bonusMessages.push(`${syn.name}: +${Math.round(eff.bonus * 100)}% (${scenario.type})`);
    }
  }

  return { modifiedScore, bonusMessages };
}

/**
 * Get night score bonus from active synergies
 * Called once per night (not per scenario) for activation bonus
 *
 * @param {Object[]} activeSynergies
 * @returns {number}
 */
export function getSynergyNightBonus(activeSynergies) {
  const count = activeSynergies.length;
  const bonus = Math.min(count * SYNERGY_BONUS_PER_ACTIVATION, MAX_SYNERGY_BONUS);
  return bonus;
}

/**
 * Check if a specific synergy is active given crew IDs
 * @param {string} synergyId
 * @param {string[]} crewIds
 * @returns {boolean}
 */
export function isSynergyActive(synergyId, crewIds) {
  const synergy = SYNERGIES_DATA[synergyId];
  if (!synergy) return false;
  const crewSet = new Set(crewIds);
  return synergy.members.every(id => crewSet.has(id));
}

/**
 * Get aftermath reduction from active synergies
 * (SYN04 - Srce i Mreža: reduces debuff duration)
 *
 * @param {Object[]} activeSynergies
 * @returns {number} Duration reduction (positive = reduces duration)
 */
export function getAftermathDurationReduction(activeSynergies) {
  let reduction = 0;
  for (const syn of activeSynergies) {
    if (syn.effect && syn.effect.type === 'aftermath_reduction') {
      reduction += syn.effect.durationReduction || 0;
    }
  }
  return reduction;
}

/**
 * Check if win scenario score should be doubled (SYN10)
 * @param {Object[]} activeSynergies
 * @returns {boolean}
 */
export function hasWinScoreDoubler(activeSynergies) {
  return activeSynergies.some(s => s.effect && s.effect.type === 'win_score_multiplier');
}

/**
 * Get phase end bonus from synergies (SYN05)
 * @param {Object[]} activeSynergies
 * @param {string} phase
 * @returns {number}
 */
export function getPhaseEndBonus(activeSynergies, phase) {
  let bonus = 0;
  for (const syn of activeSynergies) {
    if (syn.effect &&
        syn.effect.type === 'phase_bonus' &&
        syn.effect.trigger === 'phase_end') {
      bonus += syn.effect.scoreBonus || 0;
    }
  }
  return bonus;
}

/**
 * Get departure WIN bonus from synergies (SYN08)
 * @param {Object[]} activeSynergies
 * @param {string} phase
 * @param {'win'|'partial'|'fail'} outcome
 * @returns {number}
 */
export function getDepartureWinBonus(activeSynergies, phase, outcome) {
  if (phase !== 'departure' || outcome !== 'win') return 0;
  let bonus = 0;
  for (const syn of activeSynergies) {
    if (syn.effect &&
        syn.effect.type === 'phase_win_bonus' &&
        syn.effect.phase === 'departure') {
      bonus += syn.effect.scoreBonus || 0;
    }
  }
  return bonus;
}

/**
 * Get E stat floor from synergies (SYN07)
 * @param {Object[]} activeSynergies
 * @returns {number} Minimum E value (0 if no floor synergy)
 */
export function getEnergyStatFloor(activeSynergies) {
  for (const syn of activeSynergies) {
    if (syn.effect && syn.effect.type === 'stat_floor' && syn.effect.stat === 'E') {
      return syn.effect.floor || 0;
    }
  }
  return 0;
}
