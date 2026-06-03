// ============================================================
//  systems/season.js — Sarajevo ili Smrt
//  Season planning UI logic, night scheduling,
//  resource carry-over between seasons.
// ============================================================

import { SEASON_LENGTH, KVART_ORDER } from '../config.js';
import { endSeason, incrementNight, checkGrbavicaUnlock, checkMarijinDvorUnlock, tryKlubTierUpgrade } from './progression.js';
import { seasonRepDecay } from './reputation.js';

// ----------------------------------------------------------------
//  Season state accessors
// ----------------------------------------------------------------
export function getNightsRemaining(state) {
  return Math.max(0, SEASON_LENGTH - state.season.nights_played);
}

export function isSeasonComplete(state) {
  return state.season.nights_played >= SEASON_LENGTH;
}

// ----------------------------------------------------------------
//  Post-night processing — call after each endSession
// ----------------------------------------------------------------
/**
 * Apply all post-night side effects:
 * - increment night counter
 * - check unlocks (Grbavica, Marijin Dvor, Klub tier)
 * - season end if needed
 * @param {object} state
 * @returns {{ unlocked_grbavica: boolean, unlocked_marijin_dvor: boolean, season_ended: boolean, season_summary?: object }}
 */
export function processNightEnd(state) {
  incrementNight(state);

  const unlocked_grbavica   = checkGrbavicaUnlock(state);
  const unlocked_marijin_dvor = checkMarijinDvorUnlock(state);

  // Try klub tier upgrades for all active kvarts
  for (const kvart of KVART_ORDER) {
    tryKlubTierUpgrade(state, kvart);
  }

  let season_ended = false;
  let season_summary = null;

  if (isSeasonComplete(state)) {
    seasonRepDecay(state);
    season_summary = endSeason(state);
    season_ended = true;
  }

  return { unlocked_grbavica, unlocked_marijin_dvor, season_ended, season_summary };
}

// ----------------------------------------------------------------
//  Season planner data (for macro UI)
// ----------------------------------------------------------------
/**
 * Returns data for the season planner overlay.
 * @param {object} state
 * @returns {object}
 */
export function getSeasonPlannerData(state) {
  const nights_left = getNightsRemaining(state);
  const kvart_statuses = KVART_ORDER.map(kvart => {
    const ks = state.kvartovi[kvart];
    return {
      kvart,
      active: ks?.active ?? false,
      locked: ks?.locked ?? true,
      rep: ks?.mahala_reputacija ?? 0,
      tier: ks?.klub_tier ?? 1,
      bad_events: ks?.bad_rep_events_this_season ?? 0,
      next_modifier: ks?.next_night_income_modifier ?? 1.0
    };
  });

  return {
    season_number: state.season.number,
    nights_played: state.season.nights_played,
    nights_left,
    total_nights: SEASON_LENGTH,
    kvart_statuses,
    bad_rep_total: state.season.bad_rep_events_total
  };
}

// ----------------------------------------------------------------
//  Carry-over bonuses (applied automatically on season end)
// ----------------------------------------------------------------
/**
 * C4 bonus: seasonal event fires once per season end.
 * Returns LP amount given (0 if C < 4).
 * @param {object} state
 * @returns {number}
 */
export function applySeasonalCarryOver(state) {
  if (state.upgrades.C < 4) return 0;
  const bonus_lp = Math.floor(state.lp * 0.05);
  state.lp += bonus_lp;
  state.total_lp_earned_this_run += bonus_lp;
  return bonus_lp;
}
