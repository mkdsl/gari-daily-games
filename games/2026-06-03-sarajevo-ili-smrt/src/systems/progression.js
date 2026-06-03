// ============================================================
//  systems/progression.js — Sarajevo ili Smrt
//  LP tracking, achievement gates, rep gain, season end.
// ============================================================

import { GRBAVICA_UNLOCK_REP, KVART_ORDER } from '../config.js';
import { canPrestige1, canPrestige2 } from '../state.js';

// ----------------------------------------------------------------
//  Rep gain after session
// ----------------------------------------------------------------
/**
 * Award reputation to the kvart after a session.
 * @param {object} state
 * @param {string} kvart
 * @param {number} session_lp   — LP earned that session
 * @param {boolean} failed
 */
export function applySessionRep(state, kvart, session_lp, failed) {
  const ks = state.kvartovi[kvart];
  if (!ks) return;

  if (failed) {
    // Bad set: lose rep, log event
    const rep_loss = 5 + Math.floor(Math.random() * 5);
    ks.mahala_reputacija = Math.max(0, ks.mahala_reputacija - rep_loss);
    ks.bad_rep_events_this_season = (ks.bad_rep_events_this_season || 0) + 1;
    state.season.bad_rep_events_total = (state.season.bad_rep_events_total || 0) + 1;
    return;
  }

  // Gain rep based on LP earned; E4 gives +5/session
  let rep_gain = Math.min(10, Math.floor(session_lp / 5));
  if (state.upgrades.E >= 4) rep_gain += 5;
  ks.mahala_reputacija = Math.min(100, ks.mahala_reputacija + rep_gain);

  // Track sessions for achievement
  checkAchievements(state);
}

// ----------------------------------------------------------------
//  Achievement checks — run after each session and on state change
// ----------------------------------------------------------------
export function checkAchievements(state) {
  // Sarajevo achievement: all 3 kvarts played at least once
  if (!state.achievements.sarajevo_achievement) {
    const all_played = KVART_ORDER.every(
      k => (state.kvartovi[k]?.sessions_played ?? 0) >= 1
    );
    if (all_played) {
      state.achievements.sarajevo_achievement = true;
    }
  }

  // Avala headliner eligibility = P2 available
  if (!state.achievements.avala_headliner_eligible) {
    if (canPrestige2(state)) {
      state.achievements.avala_headliner_eligible = true;
    }
  }
}

// ----------------------------------------------------------------
//  Grbavica unlock check
// ----------------------------------------------------------------
/**
 * Unlock Grbavica if Baščaršija + Marijin Dvor both have >= 50 rep.
 * @param {object} state
 * @returns {boolean} true if just unlocked
 */
export function checkGrbavicaUnlock(state) {
  const gk = state.kvartovi.grbavica;
  if (!gk.locked) return false;

  const basc = state.kvartovi.bascarsija?.mahala_reputacija ?? 0;
  const md = state.kvartovi.marijin_dvor?.mahala_reputacija ?? 0;

  if (basc >= GRBAVICA_UNLOCK_REP && md >= GRBAVICA_UNLOCK_REP) {
    gk.locked = false;
    return true;
  }
  return false;
}

// ----------------------------------------------------------------
//  Marijin Dvor unlock — happens when Baščaršija rep >= 25
// ----------------------------------------------------------------
export function checkMarijinDvorUnlock(state) {
  const md = state.kvartovi.marijin_dvor;
  if (md.active) return false;
  if (state.kvartovi.bascarsija.mahala_reputacija >= 25) {
    md.active = true;
    return true;
  }
  return false;
}

// ----------------------------------------------------------------
//  Season end obračun
// ----------------------------------------------------------------
/**
 * Called when season_nights_played >= SEASON_LENGTH (7 nights).
 * Resets per-season counters, increments season number.
 * Returns season summary object for UI.
 * @param {object} state
 * @returns {object} season_summary
 */
export function endSeason(state) {
  const summary = {
    season_number: state.season.number,
    nights_played: state.season.nights_played,
    bad_rep_events: state.season.bad_rep_events_total,
    lp_snapshot: state.lp
  };

  state.season.number += 1;
  state.season.nights_played = 0;
  state.season.bad_rep_events_total = 0;

  // Reset bad rep per-kvart counters
  for (const kvart of KVART_ORDER) {
    const ks = state.kvartovi[kvart];
    if (ks) {
      ks.bad_rep_events_this_season = 0;
      ks.next_night_income_modifier = 1.0;
    }
  }

  // C4: seasonal bonus event — small LP gift
  if (state.upgrades.C >= 4) {
    const bonus = Math.floor(state.lp * 0.05);
    state.lp += bonus;
    state.total_lp_earned_this_run += bonus;
    summary.season_bonus_lp = bonus;
  }

  return summary;
}

// ----------------------------------------------------------------
//  Night counter increment
// ----------------------------------------------------------------
export function incrementNight(state) {
  state.season.nights_played = (state.season.nights_played || 0) + 1;
}

// ----------------------------------------------------------------
//  Klub tier upgrade (via reputation thresholds)
// ----------------------------------------------------------------
/**
 * Try to auto-upgrade klub tier based on rep and C upgrade prereqs.
 * Tier 2 needs C >= 1 and rep >= 40.
 * Tier 3 needs C >= 3 and rep >= 70.
 * @param {object} state
 * @param {string} kvart
 * @returns {boolean} true if tier increased
 */
export function tryKlubTierUpgrade(state, kvart) {
  const ks = state.kvartovi[kvart];
  if (!ks || ks.locked) return false;

  let upgraded = false;
  if (ks.klub_tier < 2 && state.upgrades.C >= 1 && ks.mahala_reputacija >= 40) {
    ks.klub_tier = 2;
    upgraded = true;
  }
  if (ks.klub_tier < 3 && state.upgrades.C >= 3 && ks.mahala_reputacija >= 70) {
    ks.klub_tier = 3;
    upgraded = true;
  }
  return upgraded;
}
