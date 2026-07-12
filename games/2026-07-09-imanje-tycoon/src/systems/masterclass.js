import { GAME_CONFIG } from '../config.js';
import { useAction } from './workers.js';
import { updateSynergies } from '../economy/synergies.js';
import { showToast } from '../ui/modals.js';

/** Cost of organizing a masterclass (actions-based) */
export const MASTERCLASS_ACTION_COST = 2;

// ─── Revenue calculation ───────────────────────────────────────────────────────

/**
 * Get estimated number of participants for next masterclass.
 * @param {object} state
 * @returns {number}
 */
export function getMasterclassParticipants(state) {
  const base = GAME_CONFIG.MASTERCLASS_PARTICIPANTS_BASE;
  const countBonus = Math.floor(state.masterclassCount * 2); // +2 per past event
  const alumniBonus = Math.floor((state.prestige.alumniBonus || 0) * 10);
  const repBonus = Math.floor((state.reputation - GAME_CONFIG.REPUTATION_BASE) * 20);
  return Math.max(5, base + countBonus + alumniBonus + repBonus);
}

/**
 * Get revenue for next masterclass.
 * @param {object} state
 * @returns {number}
 */
export function getMasterclassRevenue(state) {
  const participants = getMasterclassParticipants(state);
  let revenuePerPerson = GAME_CONFIG.MASTERCLASS_REVENUE_PER_PARTICIPANT;

  // Achievement bonus: extra per participant
  if (state.achievementBonuses?.masterclassBonus) {
    revenuePerPerson += state.achievementBonuses.masterclassBonus;
  }

  let total = participants * revenuePerPerson;

  // Scenario bonuses
  if (state.prestige.scenario === 'avala') {
    total *= 1.20; // Mountain experience premium
  }
  if (state.prestige.scenario === 'strandG') {
    total *= 1.10; // Urban audience premium
  }

  return Math.round(total);
}

/**
 * Get alumni network bonus for revenue.
 * Based on past masterclasses and prestige alumni bonus.
 * @param {object} state
 * @returns {number} multiplier bonus (e.g. 0.12 = +12%)
 */
export function getAlumniNetworkBonus(state) {
  const baseAlumni = state.prestige.alumniBonus || 0;
  const countBonus = state.masterclassCount * 0.005; // 0.5% per event
  return Math.min(0.40, baseAlumni + countBonus); // cap at +40%
}

// ─── Organize masterclass ──────────────────────────────────────────────────────

/**
 * Organize a masterclass.
 * Costs 2 daily actions.
 * @param {object} state
 * @param {object|null} audio
 * @returns {{ success: boolean, revenue: number, reason: string }}
 */
export function organizeMasterclass(state, audio) {
  if (!state.masterclassUnlocked) {
    return { success: false, revenue: 0, reason: `Masterclass dostupan od sezone ${GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON}.` };
  }
  if (state.season < GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON) {
    return { success: false, revenue: 0, reason: `Masterclass dostupan od sezone ${GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON}.` };
  }

  // Check actions available
  const actionsLeft = state.workers.dailyActionsTotal - state.workers.dailyActionsUsed;
  if (actionsLeft < MASTERCLASS_ACTION_COST) {
    return { success: false, revenue: 0, reason: `Nema dovoljno dnevnih akcija (treba ${MASTERCLASS_ACTION_COST}, dostupno ${actionsLeft}).` };
  }

  // Use actions
  for (let i = 0; i < MASTERCLASS_ACTION_COST; i++) {
    if (!useAction(state)) {
      return { success: false, revenue: 0, reason: 'Greška pri trošenju akcija.' };
    }
  }

  const participants = getMasterclassParticipants(state);
  const revenue = getMasterclassRevenue(state);

  state.capital += revenue;
  state.totalRevenue += revenue;
  state.seasonRevenue = (state.seasonRevenue || 0) + revenue;
  state.masterclassCount++;

  // Track history
  if (!state._masterclassHistory) state._masterclassHistory = [];
  state._masterclassHistory.push({
    season: state.season,
    participants,
    revenue,
    scenario: state.prestige.scenario,
    date: Date.now(),
  });

  // Reputation boost
  const repCap = state.achievementBonuses?.reputationCap || GAME_CONFIG.REPUTATION_CAP;
  state.reputation = Math.min(repCap, state.reputation + GAME_CONFIG.REPUTATION_PER_MASTERCLASS);

  // Update synergies — ekosistem needs 3+
  updateSynergies(state);

  if (audio) audio.playSfx('phase_unlock');
  showToast(`🎓 Masterclass organizovan! ${participants} učesnika — Prihod: ${revenue.toLocaleString()} din. Rep: ${state.reputation.toFixed(2)}×`);

  return { success: true, revenue, participants };
}

/**
 * Can organize masterclass now?
 * @param {object} state
 * @returns {boolean}
 */
export function canOrganizeMasterclass(state) {
  if (!state.masterclassUnlocked) return false;
  if (state.season < GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON) return false;
  const actionsLeft = state.workers.dailyActionsTotal - state.workers.dailyActionsUsed;
  return actionsLeft >= MASTERCLASS_ACTION_COST;
}

// ─── Stats and projections ────────────────────────────────────────────────────

/**
 * Get comprehensive masterclass statistics for UI display.
 * @param {object} state
 * @returns {{ count, totalRevenue, avgParticipants, nextProjected, reputationGained, alumniBonus }}
 */
export function getMasterclassStats(state) {
  const history = state._masterclassHistory || [];
  const totalRevenue = history.reduce((s, h) => s + h.revenue, 0);
  const avgParticipants = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.participants, 0) / history.length)
    : 0;

  return {
    count: state.masterclassCount,
    totalRevenue,
    avgParticipants,
    nextProjected: getMasterclassRevenue(state),
    nextParticipants: getMasterclassParticipants(state),
    reputationGained: Math.round((state.reputation - GAME_CONFIG.REPUTATION_BASE) * 100) / 100,
    alumniBonus: getAlumniNetworkBonus(state),
    ekosistemProgress: state.masterclassCount >= 3,
  };
}

/**
 * Get masterclass unlock progress message.
 * @param {object} state
 * @returns {{ unlocked, message, seasonNeeded }}
 */
export function getMasterclassUnlockStatus(state) {
  if (state.masterclassUnlocked && state.season >= GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON) {
    return { unlocked: true, message: '🎓 Masterclass aktivan!', seasonNeeded: 0 };
  }
  const needed = GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON;
  return {
    unlocked: false,
    message: `Masterclass se otključava u sezoni ${needed} (trenutno: ${state.season})`,
    seasonNeeded: needed,
  };
}

/**
 * Get reputation breakdown for UI tooltip.
 * @param {object} state
 * @returns {string}
 */
export function getReputationBreakdown(state) {
  const base = GAME_CONFIG.REPUTATION_BASE;
  const fromMC = state.masterclassCount * GAME_CONFIG.REPUTATION_PER_MASTERCLASS;
  const fromAch = state.achievementBonuses?.reputation || 0;
  const cap = state.achievementBonuses?.reputationCap || GAME_CONFIG.REPUTATION_CAP;
  return [
    `Osnova: ${base}×`,
    `Masterclass: +${fromMC.toFixed(2)}× (${state.masterclassCount} sez.)`,
    fromAch > 0 ? `Achievement: +${fromAch.toFixed(2)}×` : null,
    `Cap: ${cap}×`,
    `Trenutno: ${state.reputation.toFixed(2)}×`,
  ].filter(Boolean).join(' | ');
}

/**
 * Get the edu tip for next masterclass theme.
 * Rotates through Guncati themes based on season.
 * @param {object} state
 * @returns {string}
 */
export function getMasterclassTheme(state) {
  const themes = [
    'Permakultura i zoniranje imanja — zona 1-5 principi',
    'Inokulacija pečurki: bukovača vs oyster na piljevini',
    'Biofiltracija jezera: patke, makrozoobenthos, karotenoidni filteri',
    'Mulj đubrivo: P/K/N profil ribnjačkog mulja za plastenik',
    'Direktna prodaja vs. restoran kanal: kalkulacija margin-a',
    'Kapljično navodnjavanje: 50% uštede vode u suši',
    'Mikrobiljke: 4-40× više vitamina od odraslih biljaka',
    'Tom Sawyer model: masterclass kao prihod, ne kao trošak',
    'Prestiž ciklus imanja: godišnji ritam obnove tla',
    'Polikultura ribe: šaran i smuđ u različitim zonama jezera',
  ];
  const idx = (state.season + state.masterclassCount) % themes.length;
  return themes[idx];
}

/**
 * Projected revenue per season if masterclass runs each season.
 * @param {object} state
 * @returns {number}
 */
export function getMasterclassSeasonProjection(state) {
  if (!state.masterclassUnlocked) return 0;
  // Assume one per season (limited by action cost)
  return getMasterclassRevenue(state);
}
