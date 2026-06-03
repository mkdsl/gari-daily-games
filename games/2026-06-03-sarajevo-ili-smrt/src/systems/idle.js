// ============================================================
//  systems/idle.js — Sarajevo ili Smrt
//  Idle LP/h kalkulator, offline progress catch-up.
//  Formula: po kvartu, eksponencijalna s tier, rep, oprema.
// ============================================================

import {
  PRESTIGE_MULTIPLIER,
  IDLE_BASE_PER_TIER,
  KVART_ORDER
} from '../config.js';

/**
 * Izračunaj LP/h za jedan kvart.
 * @param {object} kvartState  — state.kvartovi[kvart]
 * @param {object} upgrades    — state.upgrades
 * @param {number} prestige_level
 * @param {string[]} dk_shop_purchases
 * @returns {number} LP/h (float)
 */
export function calcKvartIdleLPPerHour(kvartState, upgrades, prestige_level, dk_shop_purchases) {
  if (!kvartState.active || kvartState.locked) return 0;

  const tier = Math.max(0, Math.min(2, kvartState.klub_tier - 1));
  const base_club_idle = IDLE_BASE_PER_TIER[tier] ?? 0.8;

  const rep_tier = Math.floor(kvartState.mahala_reputacija / 25); // 0-4 → tiered ×
  const rep_multi = rep_tier + 1; // rep 0-24→×1, 25-49→×2, 50-74→×3, 75-100→×4

  const equipment_multi = 1.0 + (upgrades.A * 0.15);

  // C upgrade: +20% idle na C2+
  let c_idle_bonus = 1.0;
  if (upgrades.C >= 2) c_idle_bonus = 1.20;
  if (upgrades.C >= 3) c_idle_bonus = 1.40;

  // DK shop: mahala_sjaj = +10% idle per hour permanently
  const dk_idle_bonus = dk_shop_purchases.includes('mahala_sjaj') ? 1.10 : 1.0;

  const prestige_multi = PRESTIGE_MULTIPLIER[Math.min(prestige_level, 2)] ?? 1.0;

  // next_night_income_modifier je per-night modifier koji reset-uje na 1.0 posle noći
  const night_mod = kvartState.next_night_income_modifier ?? 1.0;

  const kvart_idle = base_club_idle * rep_multi * equipment_multi * c_idle_bonus * dk_idle_bonus;
  return kvart_idle * prestige_multi * night_mod;
}

/**
 * Suma idle LP/h za sve aktivne kvartove.
 * @param {object} state — full game state
 * @returns {number} total LP/h
 */
export function calcIdleLPPerHour(state) {
  let total = 0;
  for (const kvart of KVART_ORDER) {
    const kvartState = state.kvartovi[kvart];
    if (!kvartState) continue;
    total += calcKvartIdleLPPerHour(
      kvartState,
      state.upgrades,
      state.prestige_level,
      state.dk_shop_purchases
    );
  }
  return total;
}

/**
 * Primijeni offline LP dobit. Zove se na load.
 * @param {object} state     — mutira state direktno
 * @param {number} cap_hours — max sati offline (default 24)
 * @returns {{ gained_lp: number, hours_elapsed: number }}
 */
export function applyOfflineProgress(state, cap_hours = 24) {
  const now = Date.now();
  const elapsed_ms = now - (state.last_tick_timestamp || now);
  const elapsed_hours = Math.min(elapsed_ms / 3_600_000, cap_hours);

  if (elapsed_hours < 0.016) {
    state.last_tick_timestamp = now;
    return { gained_lp: 0, hours_elapsed: 0 };
  }

  const lp_per_hour = calcIdleLPPerHour(state);
  const gained_raw = lp_per_hour * elapsed_hours;
  const gained_lp = Math.max(0, gained_raw);

  state.lp += gained_lp;
  state.total_lp_earned_this_run += gained_lp;
  state.last_tick_timestamp = now;

  return {
    gained_lp: Math.floor(gained_lp),
    hours_elapsed: Math.round(elapsed_hours * 10) / 10
  };
}

/**
 * Online idle tick — called each frame from main loop when NOT in session.
 * @param {object} state
 * @param {number} dt — delta time in seconds
 */
export function tickIdleLP(state, dt) {
  if (state.active_session) return; // session handles its own LP
  const lp_per_sec = calcIdleLPPerHour(state) / 3600;
  const gained = lp_per_sec * dt;
  state.lp += gained;
  state.total_lp_earned_this_run += gained;
  state.last_tick_timestamp = Date.now();
}
