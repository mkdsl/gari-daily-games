// ============================================================
//  systems/upgrades.js — Sarajevo ili Smrt
//  Upgrade shop: cost lookup, prereq check, purchase logic,
//  effect queries.
// ============================================================

import { UPGRADE_COSTS, UPGRADE_META } from '../config.js';

// ----------------------------------------------------------------
//  Cost for the NEXT level of a branch
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {string} branch   — 'A'|'B'|'C'|'Cplus'|'D'|'E'
 * @returns {number|null}   — null if maxed or not available
 */
export function getUpgradeCost(state, branch) {
  const current = state.upgrades[branch] ?? 0;
  const costs = UPGRADE_COSTS[branch];
  if (!costs) return null;

  // Cplus is 0-indexed differently: Cplus[0] = first purchase (level 1)
  if (branch === 'Cplus') {
    if (current >= 2) return null;
    return costs[current]; // costs[0]=400, costs[1]=1000
  }

  const max_level = (UPGRADE_META[branch]?.max_level ?? costs.length - 1);
  if (current >= max_level) return null;
  return costs[current + 1] ?? null;
}

// ----------------------------------------------------------------
//  Prereq check
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {string} branch
 * @returns {{ ok: boolean, reason?: string }}
 */
export function checkPrereqs(state, branch) {
  switch (branch) {
    case 'A':
    case 'B':
    case 'D':
    case 'E':
      return { ok: true };

    case 'C':
      // No prereqs
      return { ok: true };

    case 'Cplus':
      // Requires P1 (prestige >= 1) and C >= 3
      if (state.prestige_level < 1) {
        return { ok: false, reason: 'Prestige 1 required' };
      }
      if (state.upgrades.C < 3) {
        return { ok: false, reason: 'Mreža nivo 3 required' };
      }
      return { ok: true };

    default:
      return { ok: false, reason: 'Unknown branch' };
  }
}

// ----------------------------------------------------------------
//  Attempt purchase
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {string} branch
 * @returns {{ ok: boolean, reason?: string, new_level?: number }}
 */
export function buyUpgrade(state, branch) {
  const prereq = checkPrereqs(state, branch);
  if (!prereq.ok) return { ok: false, reason: prereq.reason };

  const cost = getUpgradeCost(state, branch);
  if (cost === null) return { ok: false, reason: 'Already maxed' };
  if (state.lp < cost) {
    return { ok: false, reason: `Need ${Math.ceil(cost)} LP` };
  }

  state.lp -= cost;
  state.upgrades[branch] = (state.upgrades[branch] ?? 0) + 1;
  const new_level = state.upgrades[branch];

  return { ok: true, new_level };
}

// ----------------------------------------------------------------
//  Sell / downgrade (not in GDD but useful for debug)
// ----------------------------------------------------------------
// Not implemented — GDD has no refund mechanic.

// ----------------------------------------------------------------
//  Queries for effects used by other systems
// ----------------------------------------------------------------

/** A-upgrade crowd cap */
export function getCrowdCapFromA(upgrades) {
  const caps = [60, 70, 80, 90, 95, 100];
  return caps[upgrades.A] ?? 60;
}

/** A-upgrade idle multiplier */
export function getIdleMultiFromA(upgrades) {
  const meta = UPGRADE_META.A.levels;
  return meta[upgrades.A]?.idle_multi ?? 1.0;
}

/** B LP bonus percentage */
export function getBLPBonus(upgrades) {
  const bonuses = [0, 0.10, 0.20, 0.35, 0.50, 0.75];
  let b = bonuses[upgrades.B] ?? 0;
  if (upgrades.B >= 5) b += 0.10;
  return b;
}

/** Vibe zone width bonus from A2+ */
export function getVibeZoneBonus(upgrades) {
  return upgrades.A >= 2 ? 8 : 0;
}

/** Legend moment threshold */
export function getLegendThreshold(upgrades) {
  return upgrades.B >= 4 ? 85 : 90;
}

/** E crowd floor */
export function getCrowdFloorFromE(upgrades, dk_shop_purchases = []) {
  const floors = [0, 3, 6, 9, 12, 15];
  let floor = floors[upgrades.E] ?? 0;
  if (dk_shop_purchases.includes('sarajevo_duh')) floor += 6;
  if (upgrades.A >= 5) floor += 5;
  return floor;
}

/** All upgrade data for the shop modal */
export function getUpgradeShopData(state) {
  const branches = ['A', 'B', 'C', 'Cplus', 'D', 'E'];
  return branches.map(branch => {
    const meta = UPGRADE_META[branch];
    const current = state.upgrades[branch] ?? 0;
    const cost = getUpgradeCost(state, branch);
    const prereq = checkPrereqs(state, branch);
    const can_afford = cost !== null && state.lp >= cost;
    const maxed = cost === null && prereq.ok;
    const next_level_info = meta?.levels?.[current] ?? null;

    return {
      branch,
      name: meta?.name ?? branch,
      icon: meta?.icon ?? '?',
      current_level: current,
      max_level: meta?.max_level ?? 5,
      cost,
      can_afford,
      maxed,
      prereq_ok: prereq.ok,
      prereq_reason: prereq.reason ?? null,
      current_level_desc: meta?.levels?.[current - 1]?.note ?? '',
      next_level_desc: next_level_info?.note ?? meta?.levels?.[current]?.note ?? ''
    };
  });
}
