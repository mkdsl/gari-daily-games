import { GAME_CONFIG } from '../config.js';

/** Get base price per kg for a given branch and item type */
export function getBasePrice(branch, itemType, state) {
  let price;
  if (branch === 'mushrooms') {
    price = itemType === 'oyster' ? GAME_CONFIG.PRICE_OYSTER : GAME_CONFIG.PRICE_BUKOVACA;
  } else if (branch === 'greenhouse') {
    price = itemType === 'mikrobiljke' ? GAME_CONFIG.PRICE_MIKROBILJKE : GAME_CONFIG.PRICE_PARADAJZ;
    // Market forecast variation
    if (state && state.marketForecast) {
      if (itemType === 'mikrobiljke') price = state.marketForecast.mikrobiljke;
      if (itemType === 'paradajz') price = state.marketForecast.paradajz;
    }
  } else if (branch === 'fishpond') {
    price = itemType === 'smudj' ? GAME_CONFIG.PRICE_SMUDJ : GAME_CONFIG.PRICE_SARAN;
  } else {
    price = 0;
  }
  // Achievement bonus price
  if (state && state.achievementBonuses) {
    if (itemType === 'mikrobiljke' && state.achievementBonuses.microPrice) {
      price += state.achievementBonuses.microPrice;
    }
  }
  return price;
}

/**
 * Sell kg amount and distribute across channels.
 * Returns total revenue earned (din).
 * Mutates state.capital, state.totalRevenue, state.seasonRevenue.
 */
export function sellYield(state, branch, kgAmount, itemType) {
  if (kgAmount <= 0) return 0;

  const basePrice = getBasePrice(branch, itemType, state);
  const channels = state.channels;
  const unlockedChannels = state.unlockedChannels || ['direktna'];

  // Build ordered channel list: highest mult first for premium selling
  const channelOrder = ['masterclass', 'online', 'restoran', 'pijaca', 'direktna'];

  let remaining = kgAmount;
  let totalRevenue = 0;

  for (const ch of channelOrder) {
    if (!unlockedChannels.includes(ch)) continue;
    const pct = (channels[ch] || 0) / 100;
    if (pct <= 0) continue;

    const allocated = Math.min(remaining * pct, GAME_CONFIG.CHANNEL_CAPS_KG[ch]);
    if (allocated <= 0) continue;

    let mult = GAME_CONFIG.CHANNEL_MULTIPLIERS[ch];

    // J8: smudj in fishpond gets restoran channel bonus automatically
    if (branch === 'fishpond' && itemType === 'smudj'
        && state.purchasedUpgrades && state.purchasedUpgrades.includes('J8')) {
      if (ch === 'direktna' || ch === 'pijaca') {
        mult = Math.max(mult, GAME_CONFIG.CHANNEL_MULTIPLIERS.restoran);
      }
    }

    // Prestige: Avala scenario tourist channel bonus for mikrobiljke/jaja
    if (state.prestige.scenario === 'avala' && ch === 'online'
        && (itemType === 'mikrobiljke' || itemType === 'jaje')) {
      mult = 2.5;
    }

    // Pijaca achievement bonus
    if (ch === 'pijaca' && state.achievementBonuses && state.achievementBonuses.pijacaMultiplier) {
      mult += state.achievementBonuses.pijacaMultiplier;
    }

    // Restaurant achievement bonus
    if (ch === 'restoran' && state.achievementBonuses && state.achievementBonuses.restaurantCapacity) {
      // Extra kg capacity handled via cap override (simplified: extra revenue)
    }

    const chRevenue = allocated * basePrice * mult * state.reputation;
    totalRevenue += chRevenue;
    remaining -= allocated;

    if (remaining <= 0) break;
  }

  // Overflow to direktna
  if (remaining > 0) {
    let ovMult = GAME_CONFIG.CHANNEL_MULTIPLIERS.direktna;
    if (branch === 'fishpond' && itemType === 'smudj'
        && state.purchasedUpgrades && state.purchasedUpgrades.includes('J8')) {
      ovMult = GAME_CONFIG.CHANNEL_MULTIPLIERS.restoran;
    }
    totalRevenue += remaining * basePrice * ovMult * state.reputation;
  }

  // All revenue bonus (achievement)
  if (state.achievementBonuses && state.achievementBonuses.allRevenue) {
    totalRevenue *= (1.0 + state.achievementBonuses.allRevenue);
  }

  state.capital += totalRevenue;
  state.totalRevenue += totalRevenue;
  state.seasonRevenue = (state.seasonRevenue || 0) + totalRevenue;

  return totalRevenue;
}

/**
 * Update market forecast for next 2 seasons.
 * Fluctuates ±15% from baseline.
 */
export function updateMarketForecast(state) {
  const vary = () => 0.85 + Math.random() * 0.30; // 0.85–1.15
  state.marketForecast = {
    paradajz: Math.round(GAME_CONFIG.PRICE_PARADAJZ * vary()),
    mikrobiljke: Math.round(GAME_CONFIG.PRICE_MIKROBILJKE * vary()),
  };
}

/** Unlock a sales channel */
export function unlockChannel(state, channelName) {
  const cost = GAME_CONFIG.CHANNEL_COSTS[channelName];
  if (!cost || state.capital < cost) return false;
  if (state.unlockedChannels.includes(channelName)) return false;

  state.capital -= cost;
  state.unlockedChannels.push(channelName);

  // Default allocation: shift some % from direktna
  const shift = Math.min(20, state.channels.direktna);
  state.channels.direktna -= shift;
  state.channels[channelName] = shift;

  return true;
}

/** Format number to Serbian number format (5.234 din or 1,2M din) */
export function formatDin(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.', ',') + 'B din';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M din';
  if (n >= 1000) {
    const s = Math.floor(n).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' din';
  }
  return Math.floor(n) + ' din';
}

/** Project revenue for an upgrade */
export function projectUpgradeRevenue(state, upgrade) {
  // Simplified projection: estimate monthly revenue change
  const seasonsPerMonth = (30 * 24 * 3600) / GAME_CONFIG.SEASON_DURATION_SEC;
  let estimatedPerSeason = 0;

  if (upgrade.branch === 'mushrooms') {
    const blocks = state.mushrooms.blocks.length;
    const spawnRatio = (GAME_CONFIG.MUSHROOM_SPAWN_RATIO_BASE + state.mushrooms.spawnRatioBonus);
    const wavesPerSeason = GAME_CONFIG.SEASON_DURATION_SEC / GAME_CONFIG.MUSHROOM_WAVE_SEC;
    const kgPerBlock = GAME_CONFIG.MUSHROOM_BLOCK_KG * spawnRatio;
    estimatedPerSeason = blocks * kgPerBlock * wavesPerSeason * GAME_CONFIG.PRICE_BUKOVACA;
  } else if (upgrade.branch === 'greenhouse') {
    const area = state.greenhouse.areaM2;
    const kgPerSeason = GAME_CONFIG.PLASTENIK_TOMATO_KG_M2 * area;
    estimatedPerSeason = kgPerSeason * GAME_CONFIG.PRICE_PARADAJZ;
  } else if (upgrade.branch === 'fishpond') {
    const yearlyKg = GAME_CONFIG.FISH_KG_M2_YEAR_BASE * state.fishpond.areaM2;
    const monthlyKg = yearlyKg / 12;
    estimatedPerSeason = monthlyKg * GAME_CONFIG.PRICE_SARAN;
  }

  const breakeven = upgrade.cost > 0
    ? Math.ceil(upgrade.cost / Math.max(estimatedPerSeason, 1))
    : 0;
  const roi3 = estimatedPerSeason > 0
    ? Math.round(((estimatedPerSeason * 3 - upgrade.cost) / Math.max(upgrade.cost, 1)) * 100)
    : 0;

  return {
    investment: upgrade.cost,
    estimatedPerSeason: Math.round(estimatedPerSeason),
    breakevenSeasons: breakeven,
    roi3Seasons: roi3,
  };
}
