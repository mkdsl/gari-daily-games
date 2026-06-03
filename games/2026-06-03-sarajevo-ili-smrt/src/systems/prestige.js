// ============================================================
//  systems/prestige.js — Sarajevo ili Smrt
//  Prestige reset, DK kalkulacija, permanent bonus application,
//  DK shop purchase logic.
// ============================================================

import {
  PRESTIGE_MULTIPLIER,
  DK_SHOP_ITEMS,
  KVART_ORDER
} from '../config.js';
import { canPrestige1, canPrestige2 } from '../state.js';

// ----------------------------------------------------------------
//  DK Calculation
// ----------------------------------------------------------------
/**
 * How many DK this prestige earns.
 * Formula: floor(total_lp / 100), min 5.
 * C3 upgrade: +20% DK.
 * @param {object} state
 * @returns {number}
 */
export function calcDKEarned(state) {
  let dk = Math.floor(state.total_lp_earned_this_run / 100);
  dk = Math.max(5, dk);
  if (state.upgrades.C >= 3) dk = Math.floor(dk * 1.20);
  return dk;
}

// ----------------------------------------------------------------
//  Prestige 1 — reset with partial carry-over
// ----------------------------------------------------------------
/**
 * Perform Prestige 1 reset.
 * Requires canPrestige1(state) === true.
 * @param {object} state — mutated in place
 * @returns {{ dk_earned: number }} summary
 */
export function doPrestige1(state) {
  if (!canPrestige1(state)) return null;

  const dk_earned = calcDKEarned(state);

  // Apply DK
  state.dk += dk_earned;
  state.total_dk_earned = (state.total_dk_earned || 0) + dk_earned;

  // Set prestige level & multiplier
  state.prestige_level = 1;
  state.prestige_multiplier = PRESTIGE_MULTIPLIER[1]; // 1.5

  // Reset LP
  state.lp = 0;
  state.total_lp_earned_this_run = 0;

  // Reset upgrades — BUT Equipment Memory: A starts at level 1
  state.upgrades = {
    A: 1,       // Equipment Memory
    B: state.dk_shop_purchases.includes('brzi_start') ? 1 : 0,
    C: state.dk_shop_purchases.includes('mreza_sjecanja') ? 1 : 0,
    Cplus: 0,
    D: 0,
    E: state.dk_shop_purchases.includes('sarajevo_duh') ? 2 : 0
  };

  // Reset kvartovi rep and sessions (locked status resets too)
  for (const kvart of KVART_ORDER) {
    state.kvartovi[kvart] = {
      active: kvart === 'bascarsija',
      locked: kvart === 'grbavica',
      mahala_reputacija: 0,
      klub_tier: 1,
      sessions_played: 0,
      bad_rep_events_this_season: 0,
      next_night_income_modifier: 1.0,
      clean_tech_triggered_this_session: false,
      max_crowd_this_session: 0
    };
  }

  // Reset season
  state.season = { number: 1, nights_played: 0, bad_rep_events_total: 0 };

  // Reset achievements (but keep first_prestige)
  state.achievements = {
    sarajevo_achievement: false,
    avala_headliner_eligible: false,
    first_legend_moment: false,
    first_prestige: true,
    grbavica_legend: false
  };

  return { dk_earned };
}

// ----------------------------------------------------------------
//  Prestige 2 — Win condition path
// ----------------------------------------------------------------
/**
 * Perform Prestige 2. Unlocks win screen path.
 * @param {object} state
 * @returns {{ dk_earned: number }}
 */
export function doPrestige2(state) {
  if (!canPrestige2(state)) return null;

  const dk_earned = calcDKEarned(state);

  state.dk += dk_earned;
  state.total_dk_earned = (state.total_dk_earned || 0) + dk_earned;

  state.prestige_level = 2;
  state.prestige_multiplier = PRESTIGE_MULTIPLIER[2]; // 2.5

  // Win screen unlocked
  state.achievements.avala_headliner_eligible = true;
  state.current_screen = 'win';

  return { dk_earned };
}

// ----------------------------------------------------------------
//  DK Shop Purchase
// ----------------------------------------------------------------
/**
 * Attempt to buy a DK shop item.
 * @param {object} state
 * @param {string} item_id
 * @returns {{ ok: boolean, reason?: string }}
 */
export function buyDKItem(state, item_id) {
  const item = DK_SHOP_ITEMS.find(i => i.id === item_id);
  if (!item) return { ok: false, reason: 'Item not found' };
  if (state.dk_shop_purchases.includes(item_id)) {
    return { ok: false, reason: 'Already purchased' };
  }
  if (state.dk < item.cost) {
    return { ok: false, reason: `Need ${item.cost} DK` };
  }

  state.dk -= item.cost;
  state.dk_shop_purchases.push(item_id);

  // Immediately apply effect if mid-run
  _applyDKItemEffect(state, item_id);

  return { ok: true };
}

function _applyDKItemEffect(state, item_id) {
  switch (item_id) {
    case 'brzi_start':
      if (state.upgrades.B < 1) state.upgrades.B = 1;
      break;
    case 'mreza_sjecanja':
      if (state.upgrades.C < 1) state.upgrades.C = 1;
      break;
    case 'sarajevo_duh':
      if (state.upgrades.E < 2) state.upgrades.E = 2;
      break;
    // mahala_sjaj: passive idle bonus — handled in idle.js
    default:
      break;
  }
}

// ----------------------------------------------------------------
//  Preview what prestige resets / keeps
// ----------------------------------------------------------------
/**
 * Returns a human-readable list for the prestige confirm screen.
 * @param {object} state
 * @returns {{ loses: string[], keeps: string[], dk_preview: number }}
 */
export function getPrestigePreview(state) {
  const dk_preview = calcDKEarned(state);
  const keeps = [
    `${dk_preview} DK (Džabe-Konekti)`,
    'Prestige multiplier: 1.5×',
    'Oprema (A) počinje nivo 1',
    'DK shop kupovine ostaju'
  ];
  const loses = [
    `${Math.floor(state.lp)} LP`,
    'Svi upgrades (osim Equipment Memory A1)',
    'Mahala reputacija (sve kvartove na 0)',
    'Klub tier-ovi'
  ];
  return { keeps, loses, dk_preview };
}
