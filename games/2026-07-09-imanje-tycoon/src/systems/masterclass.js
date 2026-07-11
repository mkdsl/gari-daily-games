import { GAME_CONFIG } from '../config.js';
import { useAction } from './workers.js';
import { updateSynergies } from '../economy/synergies.js';
import { showToast } from '../ui/modals.js';

/** Cost of organizing a masterclass (actions-based) */
export const MASTERCLASS_ACTION_COST = 2;

/** Revenue per masterclass */
export function getMasterclassRevenue(state) {
  const participants = GAME_CONFIG.MASTERCLASS_PARTICIPANTS_BASE
    + Math.floor(state.masterclassCount * 2)
    + Math.floor((state.prestige.alumniBonus || 0) * 10);
  let revenue = participants * GAME_CONFIG.MASTERCLASS_REVENUE_PER_PARTICIPANT;

  // Achievement bonus
  if (state.achievementBonuses?.masterclassBonus) {
    revenue += state.achievementBonuses.masterclassBonus * participants;
  }

  return Math.round(revenue);
}

/**
 * Organize a masterclass.
 * Costs 2 daily actions.
 * Returns { success, revenue, reason }.
 */
export function organizeMasterclass(state, audio) {
  if (!state.masterclassUnlocked) {
    return { success: false, reason: `Masterclass dostupan od sezone ${GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON}.` };
  }
  if (state.season < GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON) {
    return { success: false, reason: `Masterclass dostupan od sezone ${GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON}.` };
  }

  // Check actions
  let actionsUsed = 0;
  for (let i = 0; i < MASTERCLASS_ACTION_COST; i++) {
    if (!useAction(state)) {
      return { success: false, reason: 'Nema dovoljno dnevnih akcija (treba 2).' };
    }
    actionsUsed++;
  }

  const revenue = getMasterclassRevenue(state);
  state.capital += revenue;
  state.totalRevenue += revenue;
  state.seasonRevenue = (state.seasonRevenue || 0) + revenue;
  state.masterclassCount++;

  // Reputation boost
  state.reputation = Math.min(
    state.achievementBonuses?.reputationCap || GAME_CONFIG.REPUTATION_CAP,
    state.reputation + GAME_CONFIG.REPUTATION_PER_MASTERCLASS
  );

  // Update synergies (ekosistem needs 3+)
  updateSynergies(state);

  if (audio) audio.playSfx('phase_unlock');
  showToast(`🎓 Masterclass organizovan! Prihod: ${revenue.toLocaleString()} din. Rep: ${state.reputation.toFixed(2)}×`);

  return { success: true, revenue };
}

/** Can organize masterclass? */
export function canOrganizeMasterclass(state) {
  if (!state.masterclassUnlocked) return false;
  if (state.season < GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON) return false;
  const actionsLeft = state.workers.dailyActionsTotal - state.workers.dailyActionsUsed;
  return actionsLeft >= MASTERCLASS_ACTION_COST;
}
