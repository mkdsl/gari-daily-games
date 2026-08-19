// systems/resolution.js — Round resolution formula

import {
  PHASE_WEIGHTS, PHASE_THRESHOLDS,
  EMPTY_SLOT_PENALTY, IMPATIENCE_PENALTY, CHURN_PENALTY,
  EVENT_TYPE_CONFIGS
} from '../config.js';
import { detectActivePairs, calcSynergyTotal } from './synergy.js';

/**
 * @typedef {Object} RoundResult
 * @property {number} weightedPower
 * @property {number} synergyBonus
 * @property {number} emptyPenalty
 * @property {number} impatiencePenalty
 * @property {number} churnPenalty
 * @property {number} roundDelta
 * @property {import('./synergy.js').ActivePair[]} activePairs
 */

/**
 * Get the effective phase weight for a given event type.
 * @param {string} phaseName
 * @param {string} eventType
 * @returns {number}
 */
function getEffectivePhaseWeight(phaseName, eventType) {
  const cfg = EVENT_TYPE_CONFIGS[eventType];
  if (cfg && cfg.phaseWeightOverrides && cfg.phaseWeightOverrides[phaseName] !== undefined) {
    return cfg.phaseWeightOverrides[phaseName];
  }
  return PHASE_WEIGHTS[phaseName] ?? 1.0;
}

/**
 * Resolve a round and return the delta breakdown.
 * @param {import('../entities/slot.js').Slot[]} slots
 * @param {string} phaseName
 * @param {boolean} isRound1
 * @param {number}  churnCount
 * @param {string}  eventType
 * @returns {RoundResult}
 */
export function resolveRound(slots, phaseName, isRound1, churnCount, eventType) {
  const weight    = getEffectivePhaseWeight(phaseName, eventType);
  const threshold = PHASE_THRESHOLDS[phaseName] ?? 10;

  const filledSlots = slots.filter(s => s.card !== null);
  const emptyCount  = 5 - filledSlots.length;

  const slotPowerSum  = filledSlots.reduce((sum, s) => sum + s.card.power, 0);
  const weightedPower = Math.round(slotPowerSum * weight);

  const activePairs  = detectActivePairs(slots, eventType);
  const synergyBonus = calcSynergyTotal(activePairs);

  const emptyPenalty      = isRound1 ? 0 : emptyCount * EMPTY_SLOT_PENALTY;
  const impatiencePenalty = slotPowerSum < threshold ? IMPATIENCE_PENALTY : 0;
  const churnPenalty      = churnCount * CHURN_PENALTY;

  const roundDelta = weightedPower + synergyBonus - emptyPenalty - impatiencePenalty - churnPenalty;

  return {
    weightedPower,
    synergyBonus,
    emptyPenalty,
    impatiencePenalty,
    churnPenalty,
    roundDelta,
    activePairs
  };
}
