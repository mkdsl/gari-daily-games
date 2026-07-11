import { GAME_CONFIG } from '../config.js';
import { sellYield } from './market.js';

/** Growth per second */
export function getFishGrowthPerSec(state) {
  const fp = state.fishpond;
  const baseDuration = GAME_CONFIG.FISH_GROWTH_SEC / state.prestige.speedMultiplier;
  const densityBonus = state.purchasedUpgrades.includes('J1') ? 1.20 : 1.0;
  const feedBonus = 1.0 + fp.feedBonusAccumulated;
  return (1.0 / baseDuration) * densityBonus * feedBonus;
}

/** Yield in kg when fish are fully grown */
export function getHarvestYieldKg(state) {
  const fp = state.fishpond;
  // Fish KG per area per year → convert to per-harvest (one cycle = FISH_GROWTH_SEC)
  const yearlyKg = GAME_CONFIG.FISH_KG_M2_YEAR_BASE * fp.areaM2;
  // Number of possible harvests per year at current speed
  const cyclesPerYear = (365 * 24 * 3600) / (GAME_CONFIG.FISH_GROWTH_SEC / state.prestige.speedMultiplier);
  const kgPerHarvest = yearlyKg / cyclesPerYear;
  return kgPerHarvest * (1.0 + fp.feedBonusAccumulated);
}

/** Tick fishpond once per second */
export function tickFishpond(state, dt, audio) {
  const fp = state.fishpond;

  // Grow fish
  if (fp.fishGrowth < 1.0) {
    fp.fishGrowth = Math.min(1.0, fp.fishGrowth + getFishGrowthPerSec(state) * dt);
  }

  // Feed timer
  if (fp.feedWindowActive) {
    fp.feedWindowTimer -= dt;
    if (fp.feedWindowTimer <= 0) {
      // Window expired without feeding — slight bonus decay
      fp.feedWindowActive = false;
      fp.feedWindowTimer = 0;
      fp.feedBonusAccumulated = Math.max(0, fp.feedBonusAccumulated - 0.03);
      fp.feedTimer = GAME_CONFIG.FISH_FEED_INTERVAL_SEC;
    }
  } else {
    fp.feedTimer -= dt;
    if (fp.feedTimer <= 0) {
      fp.feedWindowActive = true;
      fp.feedWindowTimer = GAME_CONFIG.FISH_FEED_WINDOW_SEC;
      fp.feedTimer = GAME_CONFIG.FISH_FEED_INTERVAL_SEC;
      if (audio) audio.playSfx('event_alert');
    }
  }

  // Duck income
  if (fp.ducks > 0) {
    fp.duckIncomeTimer -= dt;
    if (fp.duckIncomeTimer <= 0) {
      fp.duckIncomeTimer = GAME_CONFIG.DUCK_INCOME_INTERVAL_SEC;
      const eggsPerInterval = (fp.ducks * GAME_CONFIG.DUCK_EGGS_PER_YEAR / 365)
        * (GAME_CONFIG.DUCK_INCOME_INTERVAL_SEC / 86400);
      const income = eggsPerInterval * GAME_CONFIG.PRICE_JAJE * state.reputation;
      state.capital += income;
      state.totalRevenue += income;
      state.seasonRevenue += income;
      state.fishpond.revenueEarned += income;
    }
  }
}

/** Player clicks "Hrani" during window */
export function feedFish(state, audio) {
  const fp = state.fishpond;
  if (!fp.feedWindowActive) return false;

  fp.feedBonusAccumulated = Math.min(0.25, fp.feedBonusAccumulated + GAME_CONFIG.FISH_FEED_BONUS);
  fp.feedWindowActive = false;
  fp.feedWindowTimer = 0;
  if (audio) audio.playSfx('purchase');
  return true;
}

/** Player harvests fish when growth = 1.0 */
export function harvestFish(state, audio) {
  const fp = state.fishpond;
  if (fp.fishGrowth < 1.0) return 0;

  const kg = getHarvestYieldKg(state);
  const revenue = sellYield(state, 'fishpond', kg, fp.fishType);

  if (fp.fishType === 'smudj') {
    fp.smudj_harvested_kg = (fp.smudj_harvested_kg || 0) + kg;
  }

  fp.totalHarvested += kg;
  fp.revenueEarned += revenue;
  fp.fishGrowth = 0;
  fp.feedBonusAccumulated = 0;

  // Check polyculture (both types harvested)
  if (fp.fishType === 'smudj' && state.fishpond.totalHarvested > 0) {
    state.fishpond.polyculture = true;
  }

  if (audio) audio.playSfx('harvest');
  return revenue;
}

/** Switch fish type */
export function switchFishType(state, fishType) {
  if (fishType === 'smudj' && !state.purchasedUpgrades.includes('J2')) return false;
  state.fishpond.fishType = fishType;
  state.fishpond.fishGrowth = 0;
  return true;
}
