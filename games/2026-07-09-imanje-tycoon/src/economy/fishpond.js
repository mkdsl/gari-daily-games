/**
 * economy/fishpond.js — Jezero ekonomija.
 *
 * Rast ribe: logistička kriva (ne linearna) — usporava kako se kapacitet puni.
 * Feed window: svaki FISH_FEED_INTERVAL_SEC se otvori prozor od FISH_FEED_WINDOW_SEC.
 *   Ako igrač hrani u prozoru: +FISH_FEED_BONUS akumuliran, ne gubi se.
 *   Ako istekne bez hranjenja: -0.03 decay.
 * Patke: pasivni prihod svaki DUCK_INCOME_INTERVAL_SEC = ducks × jaja × cena.
 * Berba: moguća samo kad fishGrowth >= 1.0.
 */

import { GAME_CONFIG } from '../config.js';
import { sellYield } from './market.js';

// ─── Growth calculations ──────────────────────────────────────────────────────

/**
 * Get instantaneous growth rate per second (logistic curve).
 * Growth slows as fishGrowth approaches 1.0 (capacity).
 * @param {object} state
 * @returns {number} growth rate 0–1 per second
 */
export function getFishGrowthPerSec(state) {
  const fp = state.fishpond;

  // Base duration adjusted by prestige speed multiplier
  const baseDuration = GAME_CONFIG.FISH_GROWTH_SEC / state.prestige.speedMultiplier;

  // Logistic curve: rate = 4 × k × g × (1 - g) where k = growth rate constant
  // This peaks at g=0.5 and is 0 at g=0 and g=1
  // We normalize so total area under curve = 1.0 (full growth in baseDuration)
  const g = Math.max(0, Math.min(0.999, fp.fishGrowth));
  const logisticFactor = 4.0 * g * (1.0 - g); // peaks at 0.5 → equals 1.0
  const baseRate = 1.0 / baseDuration;

  // Density/stocking bonus from J1 upgrade
  const densityBonus = state.purchasedUpgrades.includes('J1') ? 1.20 : 1.0;

  // Feed bonus accumulated
  const feedMult = 1.0 + fp.feedBonusAccumulated;

  // Disease penalty (seasonal event)
  const diseasePenalty = state._fishGrowthPenalty ? (1.0 - state._fishGrowthPenalty) : 1.0;

  // Avala prestige: fishpond is more expensive but growth is similar
  // (the extra cost is in unlock, not growth rate)

  // For g near 0 (start), use a minimum rate to avoid getting stuck at 0
  const rate = g < 0.05
    ? baseRate * 0.4   // slow ramp-up phase
    : baseRate * 2.0 * logisticFactor;

  return rate * densityBonus * feedMult * diseasePenalty;
}

/**
 * Get harvest yield in kg when fish are fully grown.
 * Based on area, fish type yield factor, feed bonus.
 * @param {object} state
 * @returns {number} kg
 */
export function getHarvestYieldKg(state) {
  const fp = state.fishpond;

  // Base yield: kg per m² per year converted to per-growth-cycle
  const yearSec = 365 * 24 * 3600;
  const effectiveGrowthSec = GAME_CONFIG.FISH_GROWTH_SEC / state.prestige.speedMultiplier;
  const cyclesPerYear = yearSec / effectiveGrowthSec;
  const yearlyKg = GAME_CONFIG.FISH_KG_M2_YEAR_BASE * fp.areaM2;
  let kgPerHarvest = yearlyKg / cyclesPerYear;

  // Smuđ requires more care but doesn't change base yield (price premium only)
  // J1 upgrade increases stocking density → more kg
  if (state.purchasedUpgrades.includes('J1')) {
    kgPerHarvest *= 1.20;
  }

  // Feed bonus: accumulated from on-time feedings
  kgPerHarvest *= (1.0 + fp.feedBonusAccumulated);

  // Prestige yield multiplier
  kgPerHarvest *= state.prestige.yieldMultiplier;

  // Polyculture bonus (J2 + both types harvested)
  if (fp.polyculture && state.purchasedUpgrades.includes('J2')) {
    kgPerHarvest *= 1.10; // 10% bonus for mixed species
  }

  return Math.max(0.1, kgPerHarvest);
}

/**
 * Project revenue per harvest at current prices and channels.
 * @param {object} state
 * @returns {number} estimated din per harvest
 */
export function getFishRevenuePerHarvest(state) {
  const kg = getHarvestYieldKg(state);
  const fp = state.fishpond;
  const pricePerKg = fp.fishType === 'smudj' ? GAME_CONFIG.PRICE_SMUDJ : GAME_CONFIG.PRICE_SARAN;

  // Apply channel blended multiplier estimate
  let mult = 1.0;
  const channels = state.channels;
  const unlocked = state.unlockedChannels || ['direktna'];
  const multipliers = GAME_CONFIG.CHANNEL_MULTIPLIERS;
  let totalPct = 0;

  for (const ch of unlocked) {
    const pct = (channels[ch] || 0) / 100;
    mult += pct * (multipliers[ch] - 1.0);
    totalPct += pct;
  }
  // Normalize if total != 100%
  if (totalPct > 0 && Math.abs(totalPct - 1.0) > 0.01) {
    mult = mult / totalPct;
  }

  return kg * pricePerKg * mult * state.reputation;
}

/**
 * Get estimated time to harvest in seconds.
 * @param {object} state
 * @returns {number} seconds remaining (0 if ready)
 */
export function getTimeToHarvest(state) {
  const fp = state.fishpond;
  if (fp.fishGrowth >= 1.0) return 0;

  // Approximate remaining time using current growth rate
  const remaining = 1.0 - fp.fishGrowth;
  const growthPerSec = getFishGrowthPerSec(state);
  if (growthPerSec <= 0) return Infinity;

  // Simple linear estimate of remaining time
  return remaining / growthPerSec;
}

// ─── Tick ─────────────────────────────────────────────────────────────────────

/**
 * Tick fishpond state by dt seconds.
 * @param {object} state
 * @param {number} dt - delta time in seconds
 * @param {object|null} audio
 */
export function tickFishpond(state, dt, audio) {
  const fp = state.fishpond;

  // ── Fish growth (logistic curve) ─────────────────────────────────────────
  if (fp.fishGrowth < 1.0) {
    const growthIncrement = getFishGrowthPerSec(state) * dt;
    fp.fishGrowth = Math.min(1.0, fp.fishGrowth + growthIncrement);

    // Play ready sound when newly at 100%
    if (fp.fishGrowth >= 1.0 && audio) {
      audio.playSfx('harvest');
    }
  }

  // ── Feed window timer ─────────────────────────────────────────────────────
  if (fp.feedWindowActive) {
    fp.feedWindowTimer = Math.max(0, fp.feedWindowTimer - dt);
    if (fp.feedWindowTimer <= 0) {
      // Window expired without feeding — apply penalty decay
      fp.feedWindowActive = false;
      fp.feedWindowTimer = 0;
      fp.feedBonusAccumulated = Math.max(0, fp.feedBonusAccumulated - 0.03);
      fp.feedTimer = GAME_CONFIG.FISH_FEED_INTERVAL_SEC;
    }
  } else {
    fp.feedTimer = Math.max(0, fp.feedTimer - dt);
    if (fp.feedTimer <= 0) {
      fp.feedWindowActive = true;
      fp.feedWindowTimer = GAME_CONFIG.FISH_FEED_WINDOW_SEC;
      fp.feedTimer = GAME_CONFIG.FISH_FEED_INTERVAL_SEC;
      if (audio) audio.playSfx('event_alert');
    }
  }

  // ── Duck income ──────────────────────────────────────────────────────────
  if (fp.ducks > 0) {
    fp.duckIncomeTimer -= dt;
    if (fp.duckIncomeTimer <= 0) {
      fp.duckIncomeTimer = GAME_CONFIG.DUCK_INCOME_INTERVAL_SEC;

      // Eggs per interval: ducks × eggs/year / 365 × (interval_sec / 86400)
      const eggsPerInterval = (fp.ducks * GAME_CONFIG.DUCK_EGGS_PER_YEAR / 365)
        * (GAME_CONFIG.DUCK_INCOME_INTERVAL_SEC / 86400);
      const pricePerEgg = GAME_CONFIG.PRICE_JAJE;
      const income = eggsPerInterval * pricePerEgg * state.reputation;

      if (income > 0) {
        state.capital += income;
        state.totalRevenue += income;
        state.seasonRevenue = (state.seasonRevenue || 0) + income;
        fp.revenueEarned = (fp.revenueEarned || 0) + income;
      }
    }
  }
}

// ─── Player actions ───────────────────────────────────────────────────────────

/**
 * Player clicks "Hrani" during feed window.
 * @param {object} state
 * @param {object|null} audio
 * @returns {boolean} true if feeding was successful
 */
export function feedFish(state, audio) {
  const fp = state.fishpond;
  if (!fp.feedWindowActive) return false;

  // Accumulate feed bonus (capped at 0.25 = +25% yield)
  fp.feedBonusAccumulated = Math.min(0.25, fp.feedBonusAccumulated + GAME_CONFIG.FISH_FEED_BONUS);
  fp.feedWindowActive = false;
  fp.feedWindowTimer = 0;
  fp.feedTimer = GAME_CONFIG.FISH_FEED_INTERVAL_SEC;

  // Track for achievement (A9 "feed_master")
  state._feedWindowSuccessCount = (state._feedWindowSuccessCount || 0) + 1;

  if (audio) audio.playSfx('purchase');
  return true;
}

/**
 * Player manually harvests fish when fishGrowth >= 1.0.
 * @param {object} state
 * @param {object|null} audio
 * @returns {number} revenue earned (0 if not ready)
 */
export function harvestFish(state, audio) {
  const fp = state.fishpond;
  if (fp.fishGrowth < 1.0) return 0;

  const kg = getHarvestYieldKg(state);
  const revenue = sellYield(state, 'fishpond', kg, fp.fishType);

  // Track type-specific harvest stats
  if (fp.fishType === 'smudj') {
    fp.smudj_harvested_kg = (fp.smudj_harvested_kg || 0) + kg;
  } else {
    fp.saran_harvested_kg = (fp.saran_harvested_kg || 0) + kg;
  }

  fp.totalHarvested = (fp.totalHarvested || 0) + kg;
  fp.revenueEarned = (fp.revenueEarned || 0) + revenue;
  fp.fishGrowth = 0;
  fp.feedBonusAccumulated *= 0.5; // Partial reset — retain 50% of built bonus
  fp.pendingHarvest = 0;

  // Check polyculture: both types harvested
  if ((fp.smudj_harvested_kg || 0) > 0 && (fp.saran_harvested_kg || 0) > 0) {
    fp.polyculture = true;
  }

  if (audio) audio.playSfx('harvest');
  return revenue;
}

/**
 * Switch fish type. Requires J2 upgrade for smuđ.
 * @param {object} state
 * @param {'saran'|'smudj'} fishType
 * @returns {boolean} success
 */
export function switchFishType(state, fishType) {
  if (fishType === 'smudj' && !state.purchasedUpgrades.includes('J2')) return false;
  if (fishType === state.fishpond.fishType) return false;

  state.fishpond.fishType = fishType;
  state.fishpond.fishGrowth = 0; // Reset growth on type change
  state.fishpond.feedBonusAccumulated = 0;
  return true;
}

// ─── Duck management ──────────────────────────────────────────────────────────

/**
 * Get duck income info for UI display.
 * @param {object} state
 * @returns {{ eggsPerDay: number, incomePerInterval: number, nextIncome: number }}
 */
export function getDuckIncomeInfo(state) {
  const fp = state.fishpond;
  if (fp.ducks === 0) return { eggsPerDay: 0, incomePerInterval: 0, nextIncomeSec: 0 };

  const eggsPerDay = (fp.ducks * GAME_CONFIG.DUCK_EGGS_PER_YEAR) / 365;
  const eggsPerInterval = eggsPerDay * (GAME_CONFIG.DUCK_INCOME_INTERVAL_SEC / 86400);
  const incomePerInterval = eggsPerInterval * GAME_CONFIG.PRICE_JAJE * state.reputation;

  return {
    eggsPerDay: eggsPerDay.toFixed(1),
    incomePerInterval: Math.round(incomePerInterval),
    nextIncomeSec: Math.ceil(fp.duckIncomeTimer || GAME_CONFIG.DUCK_INCOME_INTERVAL_SEC),
  };
}

/**
 * Get polyculture status description.
 * @param {object} state
 * @returns {{ active: boolean, desc: string }}
 */
export function getPolycultureStatus(state) {
  const fp = state.fishpond;
  const hasJ2 = state.purchasedUpgrades.includes('J2');
  const hasJ1 = state.purchasedUpgrades.includes('J1');

  if (!hasJ1 && !hasJ2) {
    return {
      active: false,
      desc: 'Polikultura nedostupna. Kupi J1 (gustina) i J2 (smuđ) za +10% yield.',
    };
  }

  if (fp.polyculture) {
    return {
      active: true,
      desc: '+10% yield bonus aktivan — oba tipa ribe su uzgajana u ribnjaku.',
    };
  }

  return {
    active: false,
    desc: hasJ2
      ? 'Uzgajaj smuđa barem jednom uz šarana da aktiviraš polikultura bonus (+10%).'
      : 'Kupi J2 upgrade da otključaš smuđa i aktiviraš polikultura bonus.',
  };
}
