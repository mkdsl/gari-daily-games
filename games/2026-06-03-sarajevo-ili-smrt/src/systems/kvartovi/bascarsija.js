// ============================================================
//  systems/kvartovi/bascarsija.js — Sarajevo ili Smrt
//  Baščaršija-specific wave speed modifier and sevdah bonus.
//  B < 2 → faster wave (1.5×). B >= 2 → normalized + 10% LP.
// ============================================================

/**
 * Returns runtime modifiers for a Baščaršija session.
 * @param {object} state
 * @returns {{ wave_speed_factor: number, lp_modifier: number, flavour: string }}
 */
export function getBascarsijaMods(state) {
  const b = state.upgrades.B ?? 0;

  if (b < 2) {
    return {
      wave_speed_factor: 1.5,  // Brži talas — teže pratiti
      lp_modifier: 1.0,
      flavour: 'sevdah_fast'
    };
  }

  // B >= 2: wave normalized + 10% LP bonus (represents DJ knows local repertoire)
  return {
    wave_speed_factor: 1.0,
    lp_modifier: 1.10,
    flavour: 'sevdah_groove'
  };
}

/**
 * Returns a contextual tooltip/reaction for Baščaršija.
 * @param {object} state
 * @returns {string}
 */
export function getBascarsijaTip(state) {
  if (state.upgrades.B < 2) {
    return 'Baščaršija pamti sve. Nauči repertoar da usporiš talas.';
  }
  return 'Mahala te zna. Svaka nota u pravo vrijeme.';
}
