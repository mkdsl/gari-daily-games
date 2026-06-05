/** @module upgrades_data — 20 upgrades sa atributima */

/**
 * @typedef {Object} UpgradeDef
 * @property {string} id
 * @property {string} category 'promo'|'coordinator'|'venue'
 * @property {string} name
 * @property {string} desc
 * @property {number} baseCost
 * @property {number} costMultiplier
 * @property {number} maxLevel
 * @property {string|null} prereqId
 * @property {number|null} prereqLevel
 * @property {string} effectKey
 * @property {number} effectValue
 */

export const UPGRADES = [
  // ─── PROMO ───────────────────────────────────────────────
  {
    id: 'P1', category: 'promo',
    name: 'Viral Udio',
    desc: 'Social Post reach +5, half-life +1 po nivou',
    baseCost: 150, costMultiplier: 1.8, maxLevel: 3,
    prereqId: null, prereqLevel: null,
    effectKey: 'social_reach_per_lvl', effectValue: 5,
  },
  {
    id: 'P2', category: 'promo',
    name: 'Print Network',
    desc: 'Flyer reach +4, iskoristi u 2 grada za isti novac',
    baseCost: 200, costMultiplier: 2.0, maxLevel: 2,
    prereqId: null, prereqLevel: null,
    effectKey: 'flyer_reach_per_lvl', effectValue: 4,
  },
  {
    id: 'P3', category: 'promo',
    name: 'Radio Partnership',
    desc: 'Radio cost -30%, koristiti 2× po gradu',
    baseCost: 300, costMultiplier: 2.5, maxLevel: 2,
    prereqId: 'P1', prereqLevel: 2,
    effectKey: 'radio_cost_reduction', effectValue: 0.30,
  },
  {
    id: 'P4', category: 'promo',
    name: 'Micro-Influencer Pack',
    desc: 'Novi promo tip: reach 20, cost 120, half-life 3',
    baseCost: 400, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'P1', prereqLevel: 1,
    effectKey: 'unlock_influencer_promo', effectValue: 1,
  },
  {
    id: 'P5', category: 'promo',
    name: 'Buzz Momentum',
    desc: 'Carry-over factor 0.7→0.77 (+0.035 po nivou)',
    baseCost: 350, costMultiplier: 2.2, maxLevel: 2,
    prereqId: null, prereqLevel: null,
    effectKey: 'carryover_factor_bonus', effectValue: 0.035,
  },
  {
    id: 'P6', category: 'promo',
    name: 'Cross-City Seeding',
    desc: 'Svaki uspeh +3 buzz SVIM budućim gradovima',
    baseCost: 500, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'P5', prereqLevel: 1,
    effectKey: 'cross_city_buzz_bonus', effectValue: 3,
  },
  {
    id: 'P7', category: 'promo',
    name: 'Decay Shield',
    desc: 'Svi promo half-life +50%',
    baseCost: 280, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'P2', prereqLevel: 1,
    effectKey: 'halflife_multiplier', effectValue: 1.5,
  },

  // ─── COORDINATOR ─────────────────────────────────────────
  {
    id: 'C1', category: 'coordinator',
    name: 'Loyalty Program',
    desc: 'Retention 60%→75%→90%',
    baseCost: 250, costMultiplier: 2.0, maxLevel: 2,
    prereqId: null, prereqLevel: null,
    effectKey: 'retention_bonus', effectValue: 0.15,
  },
  {
    id: 'C2', category: 'coordinator',
    name: 'Hiring Network',
    desc: 'Novi koordinatori kreću na Tier 2 ceni Tier 1',
    baseCost: 300, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'C1', prereqLevel: 1,
    effectKey: 'start_tier_upgrade', effectValue: 1,
  },
  {
    id: 'C3', category: 'coordinator',
    name: 'Alumni Extended',
    desc: 'Alumni slot 2→3',
    baseCost: 400, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'C1', prereqLevel: 2,
    effectKey: 'alumni_slots', effectValue: 3,
  },
  {
    id: 'C4', category: 'coordinator',
    name: 'Routing Mastery',
    desc: 'Base follow rate 70%→85%, sa koordinatorom 85%→92%',
    baseCost: 220, costMultiplier: 1.9, maxLevel: 2,
    prereqId: null, prereqLevel: null,
    effectKey: 'follow_rate_bonus', effectValue: 0.075,
  },
  {
    id: 'C5', category: 'coordinator',
    name: 'Skill Transfer',
    desc: '1 koordinator čuva pun loyalty bez alumni slota',
    baseCost: 350, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'C2', prereqLevel: 1,
    effectKey: 'loyalty_preservation', effectValue: 1,
  },
  {
    id: 'C6', category: 'coordinator',
    name: 'Emergency Network',
    desc: 'Angažuj koordinatora TOKOM eventa (Tier 3+) za 200 EUR',
    baseCost: 500, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'C1', prereqLevel: 2,
    effectKey: 'mid_event_hire', effectValue: 200,
  },
  {
    id: 'C7', category: 'coordinator',
    name: 'Loyalty Accelerator',
    desc: 'Loyalty gain +15→+20',
    baseCost: 180, costMultiplier: 1.7, maxLevel: 2,
    prereqId: 'C1', prereqLevel: 1,
    effectKey: 'loyalty_gain_bonus', effectValue: 5,
  },

  // ─── VENUE ───────────────────────────────────────────────
  {
    id: 'V1', category: 'venue',
    name: 'Crowd Flow Barriers',
    desc: 'Overflow threshold +10% po nivou',
    baseCost: 120, costMultiplier: 1.6, maxLevel: 3,
    prereqId: null, prereqLevel: null,
    effectKey: 'overflow_threshold_bonus', effectValue: 0.10,
  },
  {
    id: 'V2', category: 'venue',
    name: 'VIP Section',
    desc: 'Dodaje VIP zonu (cap 50, mood +0.2)',
    baseCost: 350, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'V1', prereqLevel: 2,
    effectKey: 'unlock_vip_zone', effectValue: 1,
  },
  {
    id: 'V3', category: 'venue',
    name: 'Sound System Plus',
    desc: 'BPM warm zona 100-127 (bilo 105-122)',
    baseCost: 400, costMultiplier: 1.0, maxLevel: 1,
    prereqId: null, prereqLevel: null,
    effectKey: 'bpm_warm_expand', effectValue: 1,
  },
  {
    id: 'V4', category: 'venue',
    name: 'Bar Express',
    desc: 'Bar→Dance Floor migracija ×1.67 (2.0/s)',
    baseCost: 150, costMultiplier: 1.8, maxLevel: 2,
    prereqId: null, prereqLevel: null,
    effectKey: 'bar_migration_speed', effectValue: 0.4,
  },
  {
    id: 'V5', category: 'venue',
    name: 'Technician on Standby',
    desc: 'EQUIPMENT_FAILURE tehnička opcija košta 0 EUR',
    baseCost: 200, costMultiplier: 1.0, maxLevel: 1,
    prereqId: null, prereqLevel: null,
    effectKey: 'free_technician', effectValue: 1,
  },
  {
    id: 'V6', category: 'venue',
    name: 'DJ Booth Premium',
    desc: 'Starting satisfaction bonus +5 flat; BPM cue threshold ±5 širi',
    baseCost: 280, costMultiplier: 1.0, maxLevel: 1,
    prereqId: 'V3', prereqLevel: 1,
    effectKey: 'dj_booth_premium', effectValue: 5,
  },
];

/** @type {Map<string, UpgradeDef>} */
export const UPGRADES_MAP = new Map(UPGRADES.map(u => [u.id, u]));

/**
 * Get current cost for upgrade at next level
 * @param {UpgradeDef} upgrade
 * @param {number} currentLevel
 * @returns {number}
 */
export function getUpgradeCost(upgrade, currentLevel) {
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}
