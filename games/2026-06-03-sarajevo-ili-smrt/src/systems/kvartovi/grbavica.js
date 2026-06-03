// ============================================================
//  systems/kvartovi/grbavica.js — Sarajevo ili Smrt
//  Grbavica underground risk/reward:
//  - Instant fail chance when crowd < 20 (reduced by E upgrade)
//  - Legend bonus: max_crowd >= 90 → session_lp * 1.50
// ============================================================

/**
 * Returns runtime modifiers for a Grbavica session.
 * @param {object} state
 * @returns {{ wave_speed_factor: number, lp_modifier: number, flavour: string }}
 */
export function getGrbavicaMods(state) {
  return {
    wave_speed_factor: 1.0,
    lp_modifier: 1.0,  // Legend bonus applied at session end
    flavour: 'underground_raw'
  };
}

/**
 * Returns current instant-fail chance for Grbavica.
 * Base: 20%. E upgrade reduces by 3% per level.
 * E2: 12%, E4: 5%, E5: still active (only Baščaršija + MD are immune at E5).
 * @param {object} state
 * @returns {number} 0.0-0.20
 */
export function getGrbavicaInstantFailChance(state) {
  const base = 0.20;
  const reduction = (state.upgrades.E ?? 0) * 0.03;
  return Math.max(0.0, base - reduction);
}

/**
 * Check if legend bonus applies (max crowd in session >= 90).
 * @param {object} sess — state.active_session
 * @returns {boolean}
 */
export function isGrbavicaLegendBonus(sess) {
  return (sess.kvart === 'grbavica') &&
    (sess.max_crowd_this_session >= 90 || (sess._crowd_frac ?? 0) >= 90);
}

/**
 * Returns a contextual tooltip for Grbavica.
 * @param {object} state
 * @returns {string}
 */
export function getGrbavicaTip(state) {
  const fail_chance = Math.round(getGrbavicaInstantFailChance(state) * 100);
  if (fail_chance === 0) {
    return 'Savladao si podrum. Legenda čeka na 90 crowd.';
  }
  return `Podrum ne prašta. ${fail_chance}% šansa instant izlaza ispod 20 crowd.`;
}
