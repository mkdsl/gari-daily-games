/**
 * economy/greenhouse.js — Plastenik ekonomija.
 *
 * Paradajz: 180s ciklus, 27 kg/m² teorijskog max, grace period 60s pre penalizacije.
 * Mikrobiljke: 14s ciklus, 0.2 kg/m² ali 1.000 din/kg premium.
 *   Ima harvest window od 8s od momenta kad su gotove — beri tada za +5% bonus.
 * Suša event: -30% yield, smanji sa kapljičnim navodnjavanjem (T2 upgrade).
 * T8 upgrade: auto-harvest kad cropProgress >= 1.0.
 */

import { GAME_CONFIG } from '../config.js';
import { sellYield } from './market.js';

// ─── Yield and cycle calculations ─────────────────────────────────────────────

/**
 * Get crop cycle duration in seconds.
 * @param {object} state
 * @returns {number} seconds per cycle
 */
export function getCycleDuration(state) {
  const isParadajz = state.greenhouse.currentCrop === 'paradajz';
  let base = isParadajz
    ? GAME_CONFIG.PLASTENIK_PARADAJZ_SEC
    : GAME_CONFIG.PLASTENIK_MICRO_SEC;

  // T5 upgrade: faster growth (-20%)
  if (state.purchasedUpgrades.includes('T5')) {
    base *= 0.80;
  }

  // Prestige speed multiplier
  return base / state.prestige.speedMultiplier;
}

/**
 * Get yield per m² for current crop, accounting for all bonuses.
 * @param {object} state
 * @returns {number} kg per m²
 */
export function getYieldPerM2(state) {
  const gh = state.greenhouse;
  const isParadajz = gh.currentCrop === 'paradajz';

  const base = isParadajz
    ? GAME_CONFIG.PLASTENIK_TOMATO_KG_M2
    : GAME_CONFIG.PLASTENIK_MICRO_KG_M2_CYCLE;

  let bonusMult = 1.0 + (gh.yieldBonus || 0);

  // Mulj sinergija bonus (tracked in synergies.js but applied here)
  if (state.synergies.mulj) {
    bonusMult += GAME_CONFIG.MULJ_YIELD_BONUS;
  }

  // Achievement bonus
  if (state.achievementBonuses?.greenhouseYield) {
    bonusMult += state.achievementBonuses.greenhouseYield;
  }

  // Avala prestige: plastenik yield ×1.20
  if (state.prestige.scenario === 'avala') {
    bonusMult *= 1.20;
  }

  // Suša drought penalty
  if (gh.suša) {
    let penalty = GAME_CONFIG.DROUGHT_YIELD_PENALTY;
    // T2 (kapljično navodnjavanje) reduces drought penalty by 30%
    if (state.purchasedUpgrades.includes('T2')) {
      penalty *= 0.70;
    }
    bonusMult *= (1.0 - penalty);
  }

  return base * bonusMult * state.prestige.yieldMultiplier;
}

/**
 * Get total harvest yield in kg for current area.
 * @param {object} state
 * @returns {number} kg
 */
export function getHarvestYield(state) {
  return getYieldPerM2(state) * state.greenhouse.areaM2;
}

/**
 * Get projected revenue per season for UI display.
 * @param {object} state
 * @returns {number} din
 */
export function getProjectedRevenueSeason(state) {
  const gh = state.greenhouse;
  const cycleDur = getCycleDuration(state);
  const kgPerCycle = getHarvestYield(state);

  const seasonDur = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
    ? GAME_CONFIG.SEASON_DURATION_LATE_SEC
    : GAME_CONFIG.SEASON_DURATION_SEC;

  const cyclesPerSeason = seasonDur / cycleDur;

  const priceKey = gh.currentCrop === 'mikrobiljke' ? 'mikrobiljke' : 'paradajz';
  const basePrice = state.marketForecast?.[priceKey] || (gh.currentCrop === 'mikrobiljke'
    ? GAME_CONFIG.PRICE_MIKROBILJKE
    : GAME_CONFIG.PRICE_PARADAJZ);

  // Apply blended channel multiplier estimate
  const blendedMult = getBlendedChannelMultiplier(state);

  return kgPerCycle * cyclesPerSeason * basePrice * blendedMult * state.reputation;
}

/**
 * Get harvest window status for mikrobiljke.
 * @param {object} state
 * @returns {{ active: boolean, timerLeft: number, bonus: number }}
 */
export function getMicroHarvestWindowStatus(state) {
  const gh = state.greenhouse;
  if (gh.currentCrop !== 'mikrobiljke') {
    return { active: false, timerLeft: 0, bonus: 0 };
  }
  return {
    active: gh.microReadyWindow,
    timerLeft: gh.microReadyWindow ? Math.ceil(gh.microWindowTimer) : 0,
    bonus: gh.microReadyWindow ? GAME_CONFIG.MICRO_HARVEST_BONUS * 100 : 0,
  };
}

/**
 * Get remaining time until crop is ready (seconds).
 * @param {object} state
 * @returns {number}
 */
export function getTimeToHarvest(state) {
  const gh = state.greenhouse;
  if (gh.cropProgress >= 1.0) return 0;
  const cycleDur = getCycleDuration(state);
  return cycleDur * (1.0 - gh.cropProgress);
}

// ─── Tick ─────────────────────────────────────────────────────────────────────

/**
 * Tick greenhouse state by dt seconds.
 * @param {object} state
 * @param {number} dt - delta time in seconds
 * @param {object|null} audio
 */
export function tickGreenhouse(state, dt, audio) {
  const gh = state.greenhouse;

  // ── Crop ready state ──────────────────────────────────────────────────────
  if (gh.cropProgress >= 1.0) {

    // T8 auto-harvest when crop is ready and NOT yet overripe
    if (state.purchasedUpgrades.includes('T8') && !gh.overripe) {
      const kg = getHarvestYield(state);
      autoHarvestGreenhouse(state, kg, audio);
      return;
    }

    if (!gh.overripe) {
      // Grace period countdown
      gh.graceTimer += dt;
      if (gh.graceTimer >= GAME_CONFIG.HARVEST_GRACE_SEC) {
        gh.overripe = true;
        gh.graceTimer = GAME_CONFIG.HARVEST_GRACE_SEC;
        if (audio) audio.playSfx('event_alert');
      }

      // Mikrobiljke: harvest window timer
      if (gh.currentCrop === 'mikrobiljke' && gh.microReadyWindow) {
        gh.microWindowTimer -= dt;
        if (gh.microWindowTimer <= 0) {
          gh.microReadyWindow = false;
          gh.microWindowTimer = 0;
          // Auto-harvest with penalty
          const kg = getHarvestYield(state) * (1.0 - GAME_CONFIG.MICRO_HARVEST_AUTO_PENALTY);
          autoHarvestGreenhouse(state, kg, audio);
        }
      }
    } else {
      // Overripe: paradajz loses value over time
      if (gh.currentCrop === 'paradajz') {
        gh.cropProgress = Math.max(0.5, gh.cropProgress - GAME_CONFIG.HARVEST_GRACE_PENALTY_PER_TICK * dt);
        // Note: progress can't go below 0.5 to avoid confusion with "growing"
      }
    }

    return; // Don't grow further when at 100%
  }

  // ── Advance crop progress ────────────────────────────────────────────────
  const cycleDur = getCycleDuration(state);
  if (cycleDur > 0) {
    gh.cropProgress += dt / cycleDur;
  }

  if (gh.cropProgress >= 1.0) {
    gh.cropProgress = 1.0;
    gh.graceTimer = 0;
    gh.overripe = false;

    if (gh.currentCrop === 'mikrobiljke') {
      gh.microReadyWindow = true;
      gh.microWindowTimer = GAME_CONFIG.MICRO_HARVEST_WINDOW_SEC;
      if (audio) audio.playSfx('inokulacija'); // distinctive sound
    } else {
      if (audio) audio.playSfx('harvest');
    }
  }
}

// ─── Player actions ───────────────────────────────────────────────────────────

/**
 * Player manually harvests greenhouse crop.
 * @param {object} state
 * @param {object|null} audio
 * @returns {number} revenue earned (0 if not ready)
 */
export function harvestGreenhouse(state, audio) {
  const gh = state.greenhouse;
  if (gh.cropProgress < 1.0) return 0;

  const baseKg = getHarvestYield(state);

  // Mikrobiljke harvest window bonus
  const bonusKg = (gh.currentCrop === 'mikrobiljke' && gh.microReadyWindow)
    ? baseKg * GAME_CONFIG.MICRO_HARVEST_BONUS
    : 0;

  // Overripe penalty: progress has degraded below 1.0 (for paradajz)
  const effectivePct = gh.overripe
    ? Math.max(0.5, Math.min(1.0, gh.cropProgress))
    : 1.0;

  const totalKg = (baseKg + bonusKg) * effectivePct;
  const revenue = sellYield(state, 'greenhouse', totalKg, gh.currentCrop);

  // Track harvest stats
  if (gh.currentCrop === 'paradajz') {
    gh.tomato_harvested_kg = (gh.tomato_harvested_kg || 0) + totalKg;
  } else {
    gh.microCycles = (gh.microCycles || 0) + 1;
    state._microHarvestedKg = (state._microHarvestedKg || 0) + totalKg;
  }

  gh.totalHarvested = (gh.totalHarvested || 0) + totalKg;
  gh.revenueEarned = (gh.revenueEarned || 0) + revenue;

  // Reset crop state
  gh.cropProgress = 0;
  gh.graceTimer = 0;
  gh.overripe = false;
  gh.microReadyWindow = false;
  gh.microWindowTimer = 0;
  gh.pendingHarvest = 0;

  if (audio) audio.playSfx('harvest');
  return revenue;
}

/**
 * Auto-harvest (T8 upgrade trigger or mikrobiljke window expiry).
 * @param {object} state
 * @param {number} kg - actual kg to sell
 * @param {object|null} audio
 * @returns {number} revenue
 */
function autoHarvestGreenhouse(state, kg, audio) {
  const gh = state.greenhouse;
  const revenue = sellYield(state, 'greenhouse', kg, gh.currentCrop);

  if (gh.currentCrop === 'paradajz') {
    gh.tomato_harvested_kg = (gh.tomato_harvested_kg || 0) + kg;
  } else {
    gh.microCycles = (gh.microCycles || 0) + 1;
    state._microHarvestedKg = (state._microHarvestedKg || 0) + kg;
  }

  gh.totalHarvested = (gh.totalHarvested || 0) + kg;
  gh.revenueEarned = (gh.revenueEarned || 0) + revenue;
  gh.cropProgress = 0;
  gh.graceTimer = 0;
  gh.overripe = false;
  gh.microReadyWindow = false;
  gh.microWindowTimer = 0;

  if (audio) audio.playSfx('harvest');
  return revenue;
}

/**
 * Switch crop type. Requires T3 for mikrobiljke.
 * @param {object} state
 * @param {'paradajz'|'mikrobiljke'} cropType
 * @returns {boolean} success
 */
export function switchCrop(state, cropType) {
  if (cropType === 'mikrobiljke' && !state.purchasedUpgrades.includes('T3')) return false;
  if (cropType === state.greenhouse.currentCrop) return false;

  state.greenhouse.currentCrop = cropType;
  state.greenhouse.cropProgress = 0;
  state.greenhouse.graceTimer = 0;
  state.greenhouse.overripe = false;
  state.greenhouse.microReadyWindow = false;
  state.greenhouse.microWindowTimer = 0;
  return true;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/**
 * Get crop description for current crop type.
 * @param {object} state
 * @returns {{ name: string, icon: string, cycleSec: number, yieldDesc: string, priceDesc: string }}
 */
export function getCropDescription(state) {
  const gh = state.greenhouse;
  const cycleDur = getCycleDuration(state);
  const yieldM2 = getYieldPerM2(state);

  if (gh.currentCrop === 'paradajz') {
    return {
      name: 'Paradajz',
      icon: '🍅',
      cycleSec: cycleDur,
      yieldDesc: `${yieldM2.toFixed(2)} kg/m² ciklus`,
      priceDesc: `${GAME_CONFIG.PRICE_PARADAJZ} din/kg`,
      grace: `${GAME_CONFIG.HARVEST_GRACE_SEC}s pre gubitka vrednosti`,
    };
  } else {
    return {
      name: 'Mikrobiljke',
      icon: '🌿',
      cycleSec: cycleDur,
      yieldDesc: `${yieldM2.toFixed(3)} kg/m² ciklus`,
      priceDesc: `${GAME_CONFIG.PRICE_MIKROBILJKE} din/kg`,
      grace: `${GAME_CONFIG.MICRO_HARVEST_WINDOW_SEC}s harvest window za +${(GAME_CONFIG.MICRO_HARVEST_BONUS*100).toFixed(0)}% bonus`,
    };
  }
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function getBlendedChannelMultiplier(state) {
  const channels = state.channels;
  const unlocked = state.unlockedChannels || ['direktna'];
  const multipliers = GAME_CONFIG.CHANNEL_MULTIPLIERS;
  let blended = 0;
  let totalPct = 0;

  for (const ch of unlocked) {
    const pct = (channels[ch] || 0) / 100;
    blended += pct * multipliers[ch];
    totalPct += pct;
  }

  return totalPct > 0 ? blended / totalPct : 1.0;
}
