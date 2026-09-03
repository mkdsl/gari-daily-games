// systems/synergy.js — Synergy pair detection and calculation

import { SYNERGY_PAIRS, MAX_SYNERGY_PER_ROUND, EVENT_TYPE_CONFIGS } from '../config.js';

/**
 * @typedef {Object} ActivePair
 * @property {string} key   - 'role1-role2' canonical key
 * @property {string} name  - Display name
 * @property {number} bonus - Point bonus
 */

/**
 * Get the effective bonus for a synergy pair, accounting for event-type overrides.
 * @param {string} key
 * @param {string} eventType
 * @returns {number}
 */
function getEffectiveSynergyBonus(key, eventType) {
  const basePair = SYNERGY_PAIRS[key];
  if (!basePair) return 0;
  const cfg = EVENT_TYPE_CONFIGS[eventType];
  if (cfg && cfg.synergyOverrides && cfg.synergyOverrides[key]) {
    return cfg.synergyOverrides[key].bonus;
  }
  return basePair.bonus;
}

/**
 * Detect which synergy pairs are active given the current slot assignments.
 * A pair is active when both roles have non-null cards.
 * @param {import('../entities/slot.js').Slot[]} slots
 * @param {string} eventType
 * @returns {ActivePair[]}
 */
export function detectActivePairs(slots, eventType = 'klub') {
  // Build a map: role → card (only filled slots)
  /** @type {Object.<string, import('../entities/card.js').Card>} */
  const filledRoles = {};
  for (const slot of slots) {
    if (slot.card !== null) {
      filledRoles[slot.role] = slot.card;
    }
  }

  const active = [];
  for (const [key, pairDef] of Object.entries(SYNERGY_PAIRS)) {
    const [roleA, roleB] = key.split('-');
    if (filledRoles[roleA] && filledRoles[roleB]) {
      const bonus = getEffectiveSynergyBonus(key, eventType);
      active.push({ key, name: pairDef.name, bonus });
    }
  }

  return active;
}

/**
 * Sum all active pair bonuses, capped at MAX_SYNERGY_PER_ROUND.
 * @param {ActivePair[]} pairs
 * @returns {number}
 */
export function calcSynergyTotal(pairs) {
  const raw = pairs.reduce((sum, p) => sum + p.bonus, 0);
  return Math.min(raw, MAX_SYNERGY_PER_ROUND);
}

const SYNERGY_CODEX_KEY = 'crew-recruiter-synergy-codex';

/**
 * Persist newly discovered synergy pair keys; returns total discovered count.
 * @param {string[]} pairKeys
 * @returns {number}
 */
export function recordDiscoveredSynergies(pairKeys) {
  try {
    const stored = JSON.parse(localStorage.getItem(SYNERGY_CODEX_KEY) || '[]');
    const set    = new Set(stored);
    for (const k of pairKeys) set.add(k);
    localStorage.setItem(SYNERGY_CODEX_KEY, JSON.stringify([...set]));
    return set.size;
  } catch { return 0; }
}

/**
 * Return how many unique synergy pairs have been discovered across all runs.
 * @returns {number}
 */
export function getDiscoveredCount() {
  try {
    return JSON.parse(localStorage.getItem(SYNERGY_CODEX_KEY) || '[]').length;
  } catch { return 0; }
}
