import { GAME_CONFIG } from '../config.js';

/**
 * Recompute all synergy flags based on current state.
 * Called every tick (cheap boolean checks).
 */
export function updateSynergies(state) {
  const upgrades = state.purchasedUpgrades;

  // Komposter: J3 (patke) + P6 upgrade + ducks > 0
  const komposterPrev = state.synergies.komposter;
  state.synergies.komposter =
    upgrades.includes('J3') &&
    upgrades.includes('P6') &&
    state.fishpond.ducks > 0;

  // Mulj: J5 purchased + greenhouse unlocked
  const muljPrev = state.synergies.mulj;
  state.synergies.mulj =
    upgrades.includes('J5') &&
    state.greenhouse.unlocked;

  // Ekosistem: all 3 branches active + masterclass >= 3
  const ekosistemPrev = state.synergies.ekosistem;
  state.synergies.ekosistem =
    state.mushrooms.unlocked &&
    state.greenhouse.unlocked &&
    state.fishpond.unlocked &&
    state.masterclassCount >= 3;

  // Track first activation for achievements
  if (!komposterPrev && state.synergies.komposter) {
    state._synergyFirstActivation = state._synergyFirstActivation || {};
    state._synergyFirstActivation.komposter = true;
  }
  if (!muljPrev && state.synergies.mulj) {
    state._synergyFirstActivation = state._synergyFirstActivation || {};
    state._synergyFirstActivation.mulj = true;
  }
  if (!ekosistemPrev && state.synergies.ekosistem) {
    state._synergyFirstActivation = state._synergyFirstActivation || {};
    state._synergyFirstActivation.ekosistem = true;
  }
}

/** Check if all synergies are active */
export function allSynergiesActive(state) {
  return state.synergies.komposter && state.synergies.mulj && state.synergies.ekosistem;
}

/** Get total revenue multiplier from active synergies */
export function getSynergyRevenueBonus(state) {
  let bonus = 0;
  if (state.synergies.ekosistem) {
    bonus += GAME_CONFIG.EKOSISTEM_BRANCH_BONUS * state.masterclassCount;
  }
  if (state.achievementBonuses && state.achievementBonuses.allRevenue) {
    bonus += state.achievementBonuses.allRevenue;
  }
  return bonus;
}

/** Describe each synergy for UI tooltip */
export const SYNERGY_DESCRIPTIONS = {
  komposter: {
    name: 'Komposter',
    icon: '♻️',
    desc: 'Patke + Pečurke → komposter → +25% spawn ratio pečuraka.',
    req: ['Upgrade J3 (Patke)', 'Upgrade P6 (Komposter input)', 'Jezero otključano'],
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
