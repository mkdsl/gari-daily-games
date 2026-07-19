/** Sezonski reset, multiplier stacking */
import { GAME_CONFIG } from '../config.js';
import { getState, updateState, saveState } from '../state.js';
import { emit, EVENTS } from '../events.js';

/**
 * Je li prestige dostupan?
 * Prestige je moguć posle SEASON_LENGTH_EMISIJE emisija u sezoni
 * @returns {boolean}
 */
export function isPrestigeAvailable() {
  const state = getState();
  return state.emisije_u_sezoni >= GAME_CONFIG.SEASON_LENGTH_EMISIJE;
}

/**
 * Izvršava prestige reset
 * @returns {Object} novi prestige state
 */
export function executePrestige() {
  const state = getState();
  if (!isPrestigeAvailable()) {
    return { ok: false, reason: 'Nije dostupno — potrebno više emisija' };
  }

  const newPrestigeCount = state.prestige_count + 1;
  const newMult = Math.pow(GAME_CONFIG.PRESTIGE_MULT_BASE, newPrestigeCount);

  // Loyal core audience — 15% se zadržava
  const loyalCore = {
    ig:      Math.floor(state.audience.ig      * GAME_CONFIG.LOYAL_CORE_CARRY),
    tiktok:  Math.floor(state.audience.tiktok  * GAME_CONFIG.LOYAL_CORE_CARRY),
    youtube: Math.floor(state.audience.youtube * GAME_CONFIG.LOYAL_CORE_CARRY),
  };

  // Oprema se ZADRŽAVA (trajni investicija)
  // Audience pada na loyal core + base
  const newAudience = {
    ig:      Math.max(loyalCore.ig,      GAME_CONFIG.AUDIENCE_BASE.ig),
    tiktok:  Math.max(loyalCore.tiktok,  GAME_CONFIG.AUDIENCE_BASE.tiktok),
    youtube: Math.max(loyalCore.youtube, GAME_CONFIG.AUDIENCE_BASE.youtube),
  };

  // Reputation pada na 50% prethodnog
  const newReputation = {
    ig:      state.reputation.ig * 0.5,
    tiktok:  state.reputation.tiktok * 0.5,
    youtube: state.reputation.youtube * 0.5,
  };

  // Kapital se zadržava (plus 10% bonus za prestige)
  const capitalBonus = Math.floor(state.capital * 0.10);

  // guest_reliability se NE resetuje
  // achievements se NE resetuju
  // unlocked_formats se ZADRŽAVAJU

  updateState({
    prestige_count: newPrestigeCount,
    season_multiplier: newMult,
    emisije_u_sezoni: 0,
    week: 1,
    audience: newAudience,
    reputation: newReputation,
    capital: state.capital + capitalBonus,
    // guest_reliability, achievements, equipment — sve ostaje
    signal_stabilan_streak: 0,
    emisije_bez_critical: 0,
    emisija_sa_gostom_bez_noshow: false,
    last_week_outcome: null,
    season_stats: {
      total_emisije: 0,
      total_capital_earned: 0,
      best_engagement: 0,
      alarms_resolved: 0,
      alarms_missed: 0,
      highlights_collected: 0,
    },
  });

  emit(EVENTS.PRESTIGE_TRIGGERED, {
    prestigeCount: newPrestigeCount,
    multiplier: newMult,
    loyalCore,
    capitalBonus,
  });

  return {
    ok: true,
    prestigeCount: newPrestigeCount,
    multiplier: newMult,
    loyalCore,
    capitalBonus,
  };
}

/**
 * Multiplikator za sledeći prestige
 * @returns {number}
 */
export function getNextPrestigeMult() {
  const state = getState();
  return Math.pow(GAME_CONFIG.PRESTIGE_MULT_BASE, state.prestige_count + 1);
}

/**
 * Formatira multiplier za UI
 * @param {number} mult
 * @returns {string}
 */
export function formatMultiplier(mult) {
  return `×${mult.toFixed(2)}`;
}

/**
 * Emisija do prestige-a
 * @returns {number}
 */
export function emisijeDoPrestizhu() {
  const state = getState();
  return Math.max(0, GAME_CONFIG.SEASON_LENGTH_EMISIJE - state.emisije_u_sezoni);
}
