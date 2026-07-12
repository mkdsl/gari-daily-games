/**
 * economy/synergies.js — Permakulturne sinergije između grana.
 *
 * Sinergije:
 *   Komposter  : Patke (J3) + Pečurke upgrade (P6) + ducks>0 → +25% spawn_ratio
 *   Mulj       : Ribnjak upgrade (J5) + Plastenik unlocked → +30% plastenik yield
 *   Ekosistem  : Sve 3 grane + masterclassCount >= 3 → +5% prihod po masterclass-u
 */

import { GAME_CONFIG } from '../config.js';

// ─── Main update function ─────────────────────────────────────────────────────

/**
 * Recompute all synergy flags based on current state.
 * Called every tick — only boolean checks, no side effects.
 * @param {object} state
 */
export function updateSynergies(state) {
  const upgrades = state.purchasedUpgrades;

  // ── Komposter ──────────────────────────────────────────────────────────────
  const komposterPrev = state.synergies.komposter;
  state.synergies.komposter =
    upgrades.includes('J3') &&
    upgrades.includes('P6') &&
    state.fishpond.ducks > 0;

  // First activation: spawn_ratio bonus applied once
  if (!komposterPrev && state.synergies.komposter) {
    _trackFirstActivation(state, 'komposter');
    // P6 upgrade already applies KOMPOSTER_SPAWN_BONUS via upgrades.js
    // but we track it here for achievement trigger
  }

  // ── Mulj đubrivo ───────────────────────────────────────────────────────────
  const muljPrev = state.synergies.mulj;
  state.synergies.mulj =
    upgrades.includes('J5') &&
    state.greenhouse.unlocked;

  if (!muljPrev && state.synergies.mulj) {
    _trackFirstActivation(state, 'mulj');
    // Apply yieldBonus to greenhouse once — guard with flag
    if (!state._muljBonusApplied) {
      state._muljBonusApplied = true;
      state.greenhouse.yieldBonus = (state.greenhouse.yieldBonus || 0) + GAME_CONFIG.MULJ_YIELD_BONUS;
    }
  }

  // If mulj deactivates (e.g. greenhouse locked somehow), track for cleanup
  if (muljPrev && !state.synergies.mulj && state._muljBonusApplied) {
    state._muljBonusApplied = false;
    state.greenhouse.yieldBonus = Math.max(0,
      (state.greenhouse.yieldBonus || 0) - GAME_CONFIG.MULJ_YIELD_BONUS);
  }

  // ── Ekosistem ──────────────────────────────────────────────────────────────
  const ekosistemPrev = state.synergies.ekosistem;
  state.synergies.ekosistem =
    state.mushrooms.unlocked &&
    state.greenhouse.unlocked &&
    state.fishpond.unlocked &&
    state.masterclassCount >= 3;

  if (!ekosistemPrev && state.synergies.ekosistem) {
    _trackFirstActivation(state, 'ekosistem');
  }
}

// ─── Revenue bonus ────────────────────────────────────────────────────────────

/**
 * Get total revenue multiplier from active synergies (added to 1.0).
 * @param {object} state
 * @returns {number} additive bonus (e.g. 0.15 = +15%)
 */
export function getSynergyRevenueBonus(state) {
  let bonus = 0;

  if (state.synergies.ekosistem) {
    // +5% per masterclass organized
    bonus += GAME_CONFIG.EKOSISTEM_BRANCH_BONUS * state.masterclassCount;
  }

  if (state.achievementBonuses?.allRevenue) {
    bonus += state.achievementBonuses.allRevenue;
  }

  // Komposter: adds to spawn_ratio in mushroom economy, not direct revenue
  // Mulj: already baked into greenhouse.yieldBonus

  return bonus;
}

/**
 * Get per-synergy individual bonus descriptions for UI.
 * @param {object} state
 * @returns {Array<{ id: string, active: boolean, bonus: string }>}
 */
export function getSynergyBonusBreakdown(state) {
  return [
    {
      id: 'komposter',
      active: state.synergies.komposter,
      bonus: `+${(GAME_CONFIG.KOMPOSTER_SPAWN_BONUS * 100).toFixed(0)}% spawn ratio pečuraka`,
      desc: 'Patke → kompost → supstrat za pečurke',
    },
    {
      id: 'mulj',
      active: state.synergies.mulj,
      bonus: `+${(GAME_CONFIG.MULJ_YIELD_BONUS * 100).toFixed(0)}% prinos plaskenika`,
      desc: 'Ribnjački mulj kao đubrivo za useve',
    },
    {
      id: 'ekosistem',
      active: state.synergies.ekosistem,
      bonus: `+${(GAME_CONFIG.EKOSISTEM_BRANCH_BONUS * 100).toFixed(0)}% × masterclass sesija`,
      desc: `Trenutno: +${(GAME_CONFIG.EKOSISTEM_BRANCH_BONUS * 100 * state.masterclassCount).toFixed(0)}% (${state.masterclassCount} MC sesija)`,
    },
  ];
}

// ─── Status checks ────────────────────────────────────────────────────────────

/**
 * Check if all synergies are active.
 * @param {object} state
 * @returns {boolean}
 */
export function allSynergiesActive(state) {
  return state.synergies.komposter && state.synergies.mulj && state.synergies.ekosistem;
}

/**
 * Get synergy progress toward unlock for a specific synergy.
 * @param {object} state
 * @param {'komposter'|'mulj'|'ekosistem'} synergyId
 * @returns {{ met: number, total: number, conditions: Array }}
 */
export function getSynergyProgress(state, synergyId) {
  const upgrades = state.purchasedUpgrades;

  switch (synergyId) {
    case 'komposter': {
      const conds = [
        { label: 'Upgrade J3 (Patke)', met: upgrades.includes('J3') },
        { label: 'Upgrade P6 (Kompost input)', met: upgrades.includes('P6') },
        { label: 'Jezero otključano i patke', met: state.fishpond.unlocked && state.fishpond.ducks > 0 },
      ];
      return { met: conds.filter(c => c.met).length, total: conds.length, conditions: conds };
    }
    case 'mulj': {
      const conds = [
        { label: 'Upgrade J5 (Mulj sistem)', met: upgrades.includes('J5') },
        { label: 'Plastenik otključan', met: state.greenhouse.unlocked },
      ];
      return { met: conds.filter(c => c.met).length, total: conds.length, conditions: conds };
    }
    case 'ekosistem': {
      const conds = [
        { label: 'Pečurke aktivne', met: state.mushrooms.unlocked },
        { label: 'Plastenik otključan', met: state.greenhouse.unlocked },
        { label: 'Jezero otključano', met: state.fishpond.unlocked },
        { label: '3+ masterclass sesija', met: state.masterclassCount >= 3 },
      ];
      return { met: conds.filter(c => c.met).length, total: conds.length, conditions: conds };
    }
    default:
      return { met: 0, total: 0, conditions: [] };
  }
}

// ─── UI descriptions ──────────────────────────────────────────────────────────

export const SYNERGY_DESCRIPTIONS = {
  komposter: {
    name: 'Komposter',
    icon: '♻️',
    desc: 'Patke + Pečurke → komposter → +25% spawn ratio pečuraka.',
    req: ['Upgrade J3 (Patke)', 'Upgrade P6 (Komposter input)', 'Jezero otključano + Patke'],
  },
  mulj: {
    name: 'Mulj đubrivo',
    icon: '💧',
    desc: 'Ribnjački mulj → đubrivo za Plastenik → +30% yield useva.',
    req: ['Upgrade J5 (Mulj sistem)', 'Plastenik otključan'],
  },
  ekosistem: {
    name: 'Ekosistem arhitekta',
    icon: '🌿',
    desc: 'Sve 3 grane aktivne + 3 masterclass sesije → +5% prihod po masterclass-u.',
    req: ['Pečurke aktivne', 'Plastenik otključan', 'Jezero otključano', '3+ masterclass-a'],
  },
};

// ─── Private helpers ──────────────────────────────────────────────────────────

function _trackFirstActivation(state, synergyId) {
  if (!state._synergyFirstActivation) {
    state._synergyFirstActivation = {};
  }
  state._synergyFirstActivation[synergyId] = true;
}
