// ============================================================
//  systems/kvartovi/marijin_dvor.js — Sarajevo ili Smrt
//  Marijin Dvor clean-tech bonus: if crowd ever > 70 in session
//  → session_lp *= 1.20 (triggered once).
// ============================================================

/**
 * Returns runtime modifiers for a Marijin Dvor session.
 * @param {object} state
 * @returns {{ wave_speed_factor: number, lp_modifier: number, flavour: string }}
 */
export function getMarijinDvorMods(state) {
  return {
    wave_speed_factor: 1.0,   // Marijin Dvor has standard wave
    lp_modifier: 1.0,         // Base; final bonus applied at session end
    flavour: 'urban_tech'
  };
}

/**
 * Returns a contextual tooltip/reaction for Marijin Dvor.
 * @param {object} state
 * @returns {string}
 */
export function getMarijinDvorTip(state) {
  return 'Dovedi crowd iznad 70 za urban bonus. Ova publika traži više.';
}

/**
 * Check if crowd-peak-70 bonus is still available this session.
 * @param {object} sess  — state.active_session
 * @returns {boolean}
 */
export function isMarijinDvorBonusAvailable(sess) {
  return !sess.crowd_peak_over_70_triggered;
}
