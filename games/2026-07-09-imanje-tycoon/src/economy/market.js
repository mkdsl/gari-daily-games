/**
 * economy/market.js — Channel distribution and revenue calculation.
 *
 * Each harvest sells through the configured channel mix (must sum to 100%).
 * Channel unlock: direktna (free), pijaca (5k), online (35k), restoran (20k).
 * Revenue = kg × basePrice × channelMultiplier × reputation.
 * J8 upgrade: smuđ always gets restoran multiplier minimum.
 * Avala prestige: online channel = 2.5× for mikrobiljke/jaja.
 */

import { GAME_CONFIG } from '../config.js';

// ─── Base price ───────────────────────────────────────────────────────────────

/**
 * Get base price per kg for a given branch and item type.
 * @param {string} branch - 'mushrooms'|'greenhouse'|'fishpond'
 * @param {string} itemType - 'bukovaca'|'oyster'|'paradajz'|'mikrobiljke'|'saran'|'smudj'
 * @param {object|null} state - for market forecast and achievement bonuses
 * @returns {number} price in din/kg
 */
export function getBasePrice(branch, itemType, state) {
  let price;

  if (branch === 'mushrooms') {
    price = itemType === 'oyster' ? GAME_CONFIG.PRICE_OYSTER : GAME_CONFIG.PRICE_BUKOVACA;

  } else if (branch === 'greenhouse') {
    // Use market forecast if available (±15% variation)
    if (state?.marketForecast) {
      price = itemType === 'mikrobiljke'
        ? state.marketForecast.mikrobiljke
        : state.marketForecast.paradajz;
    } else {
      price = itemType === 'mikrobiljke'
        ? GAME_CONFIG.PRICE_MIKROBILJKE
        : GAME_CONFIG.PRICE_PARADAJZ;
    }

    // Štrand prestige: paradajz +25%
    if (state?.prestige?.scenario === 'strandG' && itemType === 'paradajz') {
      price *= 1.25;
    }

  } else if (branch === 'fishpond') {
    price = itemType === 'smudj' ? GAME_CONFIG.PRICE_SMUDJ : GAME_CONFIG.PRICE_SARAN;

  } else {
    price = 0;
  }

  // Achievement bonus: mikrobiljke price premium
  if (state?.achievementBonuses?.microPrice && itemType === 'mikrobiljke') {
    price += state.achievementBonuses.microPrice;
  }

  return Math.max(0, price);
}

// ─── Sell yield (main revenue engine) ────────────────────────────────────────

/**
 * Sell a harvest amount across configured channels.
 * Mutates state.capital, state.totalRevenue, state.seasonRevenue.
 * @param {object} state
 * @param {string} branch
 * @param {number} kgAmount
 * @param {string} itemType
 * @returns {number} total revenue earned
 */
export function sellYield(state, branch, kgAmount, itemType) {
  if (kgAmount <= 0) return 0;

  const basePrice = getBasePrice(branch, itemType, state);
  if (basePrice <= 0) return 0;

  const channels = state.channels;
  const unlockedChannels = state.unlockedChannels || ['direktna'];

  // Sell through highest-multiplier channels first for premium products
  const channelOrder = ['masterclass', 'online', 'restoran', 'pijaca', 'direktna'];

  let remaining = kgAmount;
  let totalRevenue = 0;

  for (const ch of channelOrder) {
    if (!unlockedChannels.includes(ch)) continue;
    const pct = (channels[ch] || 0) / 100;
    if (pct <= 0) continue;

    // Capacity cap per channel
    const cap = GAME_CONFIG.CHANNEL_CAPS_KG[ch] || Infinity;
    const allocated = Math.min(remaining, kgAmount * pct, cap);
    if (allocated <= 0) continue;

    let mult = GAME_CONFIG.CHANNEL_MULTIPLIERS[ch];

    // J8: smuđ in fishpond gets restoran minimum multiplier
    if (branch === 'fishpond' && itemType === 'smudj'
        && state.purchasedUpgrades?.includes('J8')) {
      mult = Math.max(mult, GAME_CONFIG.CHANNEL_MULTIPLIERS.restoran);
      // Štrand prestige: smuđ via restoran → 2.0×
      if (state.prestige.scenario === 'strandG') {
        mult = Math.max(mult, 2.0);
      }
    }

    // Avala: online is tourist channel — 2.5× for mikrobiljke and jaja
    if (state.prestige.scenario === 'avala' && ch === 'online'
        && (itemType === 'mikrobiljke' || itemType === 'jaje')) {
      mult = 2.5;
    }

    // Pijaca achievement bonus
    if (ch === 'pijaca' && state.achievementBonuses?.pijacaMultiplier) {
      mult += state.achievementBonuses.pijacaMultiplier;
    }

    const chRevenue = allocated * basePrice * mult * state.reputation;
    totalRevenue += chRevenue;
    remaining -= allocated;

    if (remaining <= 0) break;
  }

  // Overflow: remaining kg → direktna channel (no cap)
  if (remaining > 0) {
    let ovMult = GAME_CONFIG.CHANNEL_MULTIPLIERS.direktna;

    // J8 bonus for overflow too
    if (branch === 'fishpond' && itemType === 'smudj'
        && state.purchasedUpgrades?.includes('J8')) {
      ovMult = Math.max(ovMult, GAME_CONFIG.CHANNEL_MULTIPLIERS.restoran);
    }

    totalRevenue += remaining * basePrice * ovMult * state.reputation;
  }

  // Record season bonus (rekordna sezona event)
  if (state._recordSeasonBonus) {
    totalRevenue *= (1.0 + state._recordSeasonBonus);
  }

  // Achievement: all revenue bonus
  if (state.achievementBonuses?.allRevenue) {
    totalRevenue *= (1.0 + state.achievementBonuses.allRevenue);
  }

  // Commit to state
  state.capital += totalRevenue;
  state.totalRevenue += totalRevenue;
  state.seasonRevenue = (state.seasonRevenue || 0) + totalRevenue;

  return totalRevenue;
}

// ─── Channel management ───────────────────────────────────────────────────────

/**
 * Unlock a sales channel by paying its cost.
 * Shifts 20% from direktna to the new channel.
 * @param {object} state
 * @param {string} channelName
 * @returns {boolean} success
 */
export function unlockChannel(state, channelName) {
  const cost = GAME_CONFIG.CHANNEL_COSTS[channelName];
  if (!cost) return false;
  if (state.capital < cost) return false;
  if (state.unlockedChannels.includes(channelName)) return false;

  state.capital -= cost;
  state.unlockedChannels.push(channelName);

  // Default allocation shift from direktna
  const shift = Math.min(20, state.channels.direktna || 0);
  if (shift > 0) {
    state.channels.direktna = (state.channels.direktna || 100) - shift;
    state.channels[channelName] = shift;
  } else {
    state.channels[channelName] = 0;
  }

  return true;
}

/**
 * Normalize channel allocations to ensure they sum to exactly 100.
 * Adjusts direktna to absorb the difference.
 * @param {object} state
 */
export function normalizeChannels(state) {
  const unlocked = state.unlockedChannels || ['direktna'];
  let total = 0;
  for (const ch of unlocked) {
    total += state.channels[ch] || 0;
  }

  if (Math.abs(total - 100) < 1) return; // Already normalized

  // Adjust direktna by the difference
  const diff = 100 - total;
  state.channels.direktna = Math.max(0, (state.channels.direktna || 0) + diff);
}

// ─── Revenue projection ───────────────────────────────────────────────────────

/**
 * Project revenue for an upgrade based on current state.
 * @param {object} state
 * @param {object} upgrade - upgrade definition with {branch, cost}
 * @returns {{ investment, estimatedPerSeason, breakevenSeasons, roi3Seasons }}
 */
export function projectUpgradeRevenue(state, upgrade) {
  const seasonDur = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
    ? GAME_CONFIG.SEASON_DURATION_LATE_SEC
    : GAME_CONFIG.SEASON_DURATION_SEC;

  let estimatedPerSeason = 0;

  if (upgrade.branch === 'mushrooms') {
    const blocks = state.mushrooms.blocks.length;
    const spawnRatio = GAME_CONFIG.MUSHROOM_SPAWN_RATIO_BASE + (state.mushrooms.spawnRatioBonus || 0);
    const wavesPerSeason = seasonDur / GAME_CONFIG.MUSHROOM_WAVE_SEC;
    const kgPerBlock = GAME_CONFIG.MUSHROOM_BLOCK_KG * spawnRatio / GAME_CONFIG.MUSHROOM_WAVES_PER_BLOCK;
    const price = state.mushrooms.oysterUnlocked ? GAME_CONFIG.PRICE_OYSTER : GAME_CONFIG.PRICE_BUKOVACA;
    estimatedPerSeason = blocks * kgPerBlock * wavesPerSeason * price * state.reputation;

  } else if (upgrade.branch === 'greenhouse') {
    const area = state.greenhouse.areaM2;
    const cycleDur = state.greenhouse.currentCrop === 'paradajz'
      ? GAME_CONFIG.PLASTENIK_PARADAJZ_SEC
      : GAME_CONFIG.PLASTENIK_MICRO_SEC;
    const cyclesPerSeason = seasonDur / cycleDur;
    const kgPerCycle = (state.greenhouse.currentCrop === 'paradajz'
      ? GAME_CONFIG.PLASTENIK_TOMATO_KG_M2
      : GAME_CONFIG.PLASTENIK_MICRO_KG_M2_CYCLE) * area;
    const price = state.greenhouse.currentCrop === 'paradajz'
      ? GAME_CONFIG.PRICE_PARADAJZ
      : GAME_CONFIG.PRICE_MIKROBILJKE;
    estimatedPerSeason = kgPerCycle * cyclesPerSeason * price * state.reputation;

  } else if (upgrade.branch === 'fishpond') {
    const yearlyKg = GAME_CONFIG.FISH_KG_M2_YEAR_BASE * state.fishpond.areaM2;
    const cyclesPerYear = (365 * 24 * 3600) / GAME_CONFIG.FISH_GROWTH_SEC;
    const kgPerHarvest = yearlyKg / cyclesPerYear;
    const harvestsPerSeason = seasonDur / GAME_CONFIG.FISH_GROWTH_SEC;
    const price = state.fishpond.fishType === 'smudj' ? GAME_CONFIG.PRICE_SMUDJ : GAME_CONFIG.PRICE_SARAN;
    estimatedPerSeason = kgPerHarvest * harvestsPerSeason * price * state.reputation;
  }

  const investment = upgrade.cost || 0;
  const breakeven = investment > 0 && estimatedPerSeason > 0
    ? Math.ceil(investment / estimatedPerSeason)
    : 0;
  const roi3 = investment > 0 && estimatedPerSeason > 0
    ? Math.round(((estimatedPerSeason * 3 - investment) / investment) * 100)
    : 0;

  return {
    investment,
    estimatedPerSeason: Math.round(estimatedPerSeason),
    breakevenSeasons: breakeven,
    roi3Seasons: roi3,
  };
}

/**
 * Get total projected monthly revenue across all branches.
 * @param {object} state
 * @returns {number} din per season estimate
 */
export function getTotalProjectedRevenue(state) {
  // Use recent season revenue as best estimate
  const recent = state.monthlyRevenue;
  if (recent && recent.length > 0) {
    return recent[recent.length - 1];
  }
  return state.seasonRevenue || 0;
}

/**
 * Get breakdown of revenue contribution per channel (estimate).
 * @param {object} state
 * @param {number} totalKg - hypothetical kg amount
 * @param {string} branch
 * @param {string} itemType
 * @returns {Array<{ channel: string, pct: number, kg: number, revenue: number, mult: number }>}
 */
export function getChannelBreakdown(state, totalKg, branch, itemType) {
  const basePrice = getBasePrice(branch, itemType, state);
  const unlocked = state.unlockedChannels || ['direktna'];
  const result = [];

  for (const ch of unlocked) {
    const pct = (state.channels[ch] || 0) / 100;
    if (pct <= 0) continue;
    const kg = totalKg * pct;
    const mult = GAME_CONFIG.CHANNEL_MULTIPLIERS[ch] || 1.0;
    const revenue = kg * basePrice * mult * state.reputation;
    result.push({ channel: ch, pct: pct * 100, kg, revenue, mult });
  }

  return result;
}

// ─── Market forecast ──────────────────────────────────────────────────────────

/**
 * Update market forecast for next 2 seasons (±15% variance).
 * @param {object} state
 */
export function updateMarketForecast(state) {
  const vary = () => 0.85 + Math.random() * 0.30; // 0.85–1.15
  state.marketForecast = {
    paradajz: Math.round(GAME_CONFIG.PRICE_PARADAJZ * vary()),
    mikrobiljke: Math.round(GAME_CONFIG.PRICE_MIKROBILJKE * vary()),
  };
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Format a number as Serbian currency (din).
 * @param {number} n
 * @returns {string}
 */
export function formatDin(n) {
  if (typeof n !== 'number' || isNaN(n)) return '0 din';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.', ',') + 'B din';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M din';
  if (n >= 1000) {
    const s = Math.floor(n).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' din';
  }
  return Math.floor(n) + ' din';
}

/**
 * Format a number with k/M/B suffix (no currency).
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return Math.floor(n).toString();
}
