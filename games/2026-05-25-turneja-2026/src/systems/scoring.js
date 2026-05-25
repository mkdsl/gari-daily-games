// scoring.js — Block and event scoring calculations

import { BLOCK_BASE, BOOKING_TIERS, CITIES } from '../config.js';

/**
 * Score a single block
 * @param {number} block_index - 0=Open, 1=Peak, 2=Close
 * @param {Object} synergy_result - from calculateSynergies()
 * @param {number} dj_tier - 1|2|3
 * @param {string} city_id - for modifier lookup
 * @param {number} city_mod_val - raw modifier value from city config
 * @param {string} city_modifier - modifier type string
 * @param {Object|null} event_result - from rollEvent
 * @param {Object} opts - { booking_hype_bonus, promo_media_bonus }
 * @returns {{ fan_gain: number, revenue_gain: number, media_gain: number, morale_delta: number }}
 */
export function scoreBlock(block_index, synergy_result, dj_tier, city_id, city_mod_val, city_modifier, event_result, opts = {}) {
  const base = BLOCK_BASE;
  const bIdx = Math.min(block_index, 2);

  // DJ tier multiplier
  const djMult = 1 + (dj_tier - 1) * 0.15; // tier1=1.0, tier2=1.15, tier3=1.30

  // City modifier
  let cityFanMult = 1.0;
  let cityMediaMult = 1.0;
  let cityRevMult = 1.0;

  switch (city_modifier) {
    case 'forest_acoustics':
      cityMediaMult += city_mod_val;
      break;
    case 'resident_crew':
      // +1 means a bonus resident crew card: +10% all
      cityFanMult += 0.10;
      cityMediaMult += 0.10;
      break;
    case 'beach_crowd':
      cityFanMult += city_mod_val;
      break;
    case 'balkanski_media':
      cityMediaMult *= city_mod_val;
      break;
    case 'finale_crowd':
      cityFanMult += city_mod_val;
      cityRevMult += city_mod_val;
      break;
  }

  // Booking hype bonus
  const bookingHype = opts.booking_hype_bonus || 0;
  const promoMedia = opts.promo_media_bonus || 0;

  // Synergy multipliers
  const fanMult = synergy_result.fan_score_mult || 1.0;
  const mediaMult = synergy_result.media_mult || 1.0;

  // Calculate raw gains
  let fan_gain = Math.floor(
    base.fan_gain[bIdx] * djMult * cityFanMult * fanMult * (1 + bookingHype)
  );
  let revenue_gain = Math.floor(
    base.revenue_base[bIdx] * djMult * cityRevMult
  );
  let media_gain = Math.floor(
    base.media_base[bIdx] * djMult * cityMediaMult * mediaMult * (1 + promoMedia)
  );

  // Morale delta from this block
  let morale_delta = 0;

  // Empty block penalty (no cards played)
  if (!synergy_result.bonuses && synergy_result.bonuses !== 0) {
    morale_delta -= 5;
  }

  // Apply event effects (already applied to event_state elsewhere, just morale here)
  if (event_result && !event_result.mitigated) {
    morale_delta -= 25;
  } else if (event_result && event_result.mitigated) {
    morale_delta += 5; // small bonus for mitigating
  }

  // Add synergy morale bonus
  morale_delta += synergy_result.morale_bonus || 0;

  // Fan base bonus from DJ+Video synergy
  const fan_base_direct = Math.floor(fan_gain * (synergy_result.fan_base_bonus || 0));

  return {
    fan_gain: Math.max(0, fan_gain),
    revenue_gain: Math.max(0, revenue_gain),
    media_gain: Math.max(0, media_gain),
    morale_delta,
    fan_base_direct
  };
}

/**
 * Calculate total event score from all 3 blocks
 */
export function scoreTotalEvent(blocks_results) {
  return blocks_results.reduce((acc, b) => ({
    fan_score: acc.fan_score + (b.fan_gain || 0),
    revenue: acc.revenue + (b.revenue_gain || 0),
    media_coverage: acc.media_coverage + (b.media_gain || 0),
    morale_delta: acc.morale_delta + (b.morale_delta || 0)
  }), { fan_score: 0, revenue: 0, media_coverage: 0, morale_delta: 0 });
}

/**
 * Apply backline upgrade bonus
 */
export function applyBacklineBonus(revenue, hasBonus) {
  if (!hasBonus) return revenue;
  return Math.floor(revenue * 1.25);
}

/**
 * Get DJ tier number from booking id
 */
export function getDjTier(booking_id) {
  const tier = BOOKING_TIERS.find(t => t.id === booking_id);
  return tier ? tier.tier : 1;
}

/**
 * Get current BPM for a block (rises through the night)
 * block 0 = 90, block 1 = 115, block 2 = 130
 */
export function getBlockBpm(block_index) {
  return [90, 115, 130][Math.min(block_index, 2)];
}
