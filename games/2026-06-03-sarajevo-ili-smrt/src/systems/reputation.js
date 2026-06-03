// ============================================================
//  systems/reputation.js — Sarajevo ili Smrt
//  Mahala rep per kvart, bad rep events, kicked out logic,
//  rep decay and recovery rules.
// ============================================================

import { KVART_ORDER } from '../config.js';

// ----------------------------------------------------------------
//  Bad rep event
// ----------------------------------------------------------------
/**
 * Trigger a bad rep event for a kvart.
 * Reduces reputation, marks event, applies next-night penalty.
 * @param {object} state
 * @param {string} kvart
 * @param {'minor'|'major'} severity
 */
export function triggerBadRepEvent(state, kvart, severity = 'minor') {
  const ks = state.kvartovi[kvart];
  if (!ks || ks.locked) return;

  const rep_loss = severity === 'major' ? 15 : 8;
  ks.mahala_reputacija = Math.max(0, ks.mahala_reputacija - rep_loss);
  ks.bad_rep_events_this_season = (ks.bad_rep_events_this_season || 0) + 1;
  state.season.bad_rep_events_total = (state.season.bad_rep_events_total || 0) + 1;

  // Next night penalty: -20% income for that kvart
  const e_modifier = state.upgrades.E >= 1 ? 0.9 : 0.8; // E1: softer penalty
  ks.next_night_income_modifier = e_modifier;

  // E1: bad rep lasts only 1 night (handled by reset in endSession/progression)
}

// ----------------------------------------------------------------
//  Kicked out (crowd drops to 0 AND failed session)
// ----------------------------------------------------------------
/**
 * Apply kicked-out consequences. Bigger rep hit than bad rep event.
 * @param {object} state
 * @param {string} kvart
 */
export function triggerKickedOut(state, kvart) {
  const ks = state.kvartovi[kvart];
  if (!ks) return;

  const rep_loss = 20 + Math.floor(Math.random() * 10);
  ks.mahala_reputacija = Math.max(0, ks.mahala_reputacija - rep_loss);
  ks.bad_rep_events_this_season = (ks.bad_rep_events_this_season || 0) + 1;
  state.season.bad_rep_events_total = (state.season.bad_rep_events_total || 0) + 1;
  ks.next_night_income_modifier = 0.7;  // strong penalty next night
}

// ----------------------------------------------------------------
//  Rep decay per season (end-of-season)
// ----------------------------------------------------------------
/**
 * Slight rep decay at end of season if not played recently.
 * @param {object} state
 */
export function seasonRepDecay(state) {
  for (const kvart of KVART_ORDER) {
    const ks = state.kvartovi[kvart];
    if (!ks || !ks.active) continue;

    // Only decay if no sessions this season
    if ((ks.sessions_played ?? 0) === 0) {
      const decay = 5;
      ks.mahala_reputacija = Math.max(0, ks.mahala_reputacija - decay);
    }
    ks.sessions_played = 0; // reset for next season counter
  }
}

// ----------------------------------------------------------------
//  Rep status label (for UI)
// ----------------------------------------------------------------
/**
 * @param {number} rep  0-100
 * @returns {string}
 */
export function getRepLabel(rep) {
  if (rep < 10)  return 'Nepoznat';
  if (rep < 25)  return 'Poznanik';
  if (rep < 50)  return 'Lokalni favorit';
  if (rep < 75)  return 'Mahala ikona';
  return 'Sarajevska legenda';
}

/**
 * @param {number} rep 0-100
 * @returns {string} CSS color class hint
 */
export function getRepColor(rep) {
  if (rep < 25)  return '#FF3333';
  if (rep < 50)  return '#FFAA00';
  if (rep < 75)  return '#33FF88';
  return '#FFD700';
}

// ----------------------------------------------------------------
//  Summary of all kvart reputations (for season end screen)
// ----------------------------------------------------------------
export function getRepSummary(state) {
  return KVART_ORDER.map(kvart => {
    const ks = state.kvartovi[kvart];
    return {
      kvart,
      rep: ks?.mahala_reputacija ?? 0,
      label: getRepLabel(ks?.mahala_reputacija ?? 0),
      locked: ks?.locked ?? true,
      active: ks?.active ?? false
    };
  });
}
