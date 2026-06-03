// ============================================================
//  entities/dj.js — Sarajevo ili Smrt
//  DJ entity: brend nivo, upgrades reference,
//  share data generator.
// ============================================================

import { UPGRADE_META, KVART_NAMES, COLORS } from '../config.js';
import { getRepLabel } from '../systems/reputation.js';
import { SHARE_HASHTAGS } from '../content/brand_hooks.js';

// ----------------------------------------------------------------
//  DJ display name / title based on prestige + brend
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @returns {string}
 */
export function getDJTitle(state) {
  const p = state.prestige_level;
  const d = state.upgrades.D;
  const name = state.player_name ?? 'DJ Neznani';

  if (p >= 2 && d >= 4) return `${name} — Avala Headliner`;
  if (p >= 2)           return `${name} — Sarajevo Legenda`;
  if (p >= 1 && d >= 3) return `${name} — Regionalni artist`;
  if (d >= 2)           return `${name} — Sarajevski brand`;
  if (d >= 1)           return `${name} — Lokalna legenda`;
  return `${name}`;
}

// ----------------------------------------------------------------
//  Share data (used by share.js to build the share card)
// ----------------------------------------------------------------
/**
 * Assembles all data needed for the share card canvas render.
 * @param {object} state
 * @param {object|null} last_session  — state.active_session (after done)
 * @returns {object}
 */
export function buildShareData(state, last_session = null) {
  const active_kvarts = Object.entries(state.kvartovi)
    .filter(([, ks]) => ks.active && !ks.locked)
    .map(([kvart, ks]) => ({
      name: KVART_NAMES[kvart] ?? kvart,
      rep: ks.mahala_reputacija,
      label: getRepLabel(ks.mahala_reputacija)
    }));

  return {
    player_name: state.player_name ?? 'DJ Neznani',
    dj_title: getDJTitle(state),
    prestige_level: state.prestige_level,
    total_lp: Math.floor(state.total_lp_earned_this_run),
    dk: state.dk,
    kvarts: active_kvarts,
    last_session_lp: last_session ? Math.floor(last_session.lp_earned) : null,
    last_session_kvart: last_session ? (KVART_NAMES[last_session.kvart] ?? last_session.kvart) : null,
    hashtags: SHARE_HASHTAGS
  };
}

// ----------------------------------------------------------------
//  DJ "equipment" display label
// ----------------------------------------------------------------
/**
 * @param {number} a_level  — upgrades.A
 * @returns {string}
 */
export function getEquipmentLabel(a_level) {
  return UPGRADE_META.A?.levels?.[a_level]?.name ?? 'Nepoznata oprema';
}

// ----------------------------------------------------------------
//  DJ status object (for macro screen HUD panel)
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @returns {object}
 */
export function getDJStatus(state) {
  return {
    title: getDJTitle(state),
    equipment: getEquipmentLabel(state.upgrades.A),
    prestige: state.prestige_level,
    prestige_multiplier: state.prestige_multiplier,
    dk: state.dk,
    lp: Math.floor(state.lp),
    total_lp: Math.floor(state.total_lp_earned_this_run)
  };
}
