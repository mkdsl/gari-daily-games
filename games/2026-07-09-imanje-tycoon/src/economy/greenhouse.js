import { GAME_CONFIG } from '../config.js';
import { sellYield } from './market.js';

/** Get crop cycle duration in seconds */
export function getCycleDuration(state) {
  const isParadajz = state.greenhouse.currentCrop === 'paradajz';
  let base = isParadajz ? GAME_CONFIG.PLASTENIK_PARADAJZ_SEC : GAME_CONFIG.PLASTENIK_MICRO_SEC;
  if (state.purchasedUpgrades.includes('T5')) base *= 0.80;
  return base / state.prestige.speedMultiplier;
}

/** Get yield per m2 for current crop */
export function getYieldPerM2(state) {
  const isParadajz = state.greenhouse.currentCrop === 'paradajz';
  const base = isParadajz
    ? GAME_CONFIG.PLASTENIK_TOMATO_KG_M2
    : GAME_CONFIG.PLASTENIK_MICRO_KG_M2_CYCLE;

  let bonusMult = 1.0 + state.greenhouse.yieldBonus;
  if (state.synergies.mulj) bonusMult += GAME_CONFIG.MULJ_YIELD_BONUS;
  if (state.achievementBonuses.greenhouseYield) bonusMult += state.achievementBonuses.greenhouseYield;

  // Drought penalty
  if (state.greenhouse.suša) {
    let penalty = GAME_CONFIG.DROUGHT_YIELD_PENALTY;
    if (state.purchasedUpgrades.includes('T2')) penalty *= 0.70; // kapljično navod. reduces
    bonusMult *= (1.0 - penalty);
  }

  return base * bonusMult * state.prestige.yieldMultiplier;
}

/** Get effective harvest yield in kg */
export function getHarvestYield(state) {
  return getYieldPerM2(state) * state.greenhouse.areaM2;
}

/**
 * Tick greenhouse once per second.
 */
export function tickGreenhouse(state, dt, audio) {
  const gh = state.greenhouse;

  if (gh.cropProgress >= 1.0) {
    // Crop ready — grace period
    if (!gh.overripe) {
      gh.graceTimer += dt;
      if (gh.graceTimer >= GAME_CONFIG.HARVEST_GRACE_SEC) {
        gh.overripe = true;
        gh.graceTimer = GAME_CONFIG.HARVEST_GRACE_SEC;
      }
    } else {
      // Overripe: lose value over time
      if (gh.currentCrop === 'paradajz') {
        gh.cropProgress = Math.max(0, gh.cropProgress - GAME_CONFIG.HARVEST_GRACE_PENALTY_PER_TICK * dt);
        if (gh.cropProgress <= 0) {
          // Lost entire harvest — reset
          gh.cropProgress = 0;
          gh.graceTimer = 0;
          gh.overripe = false;
        }
      } else {
        // Mikrobiljke: different auto logic
        if (gh.microReadyWindow) {
          gh.microWindowTimer -= dt;
          if (gh.microWindowTimer <= 0) {
            // Auto-harvest with penalty
            const kg = getHarvestYield(state) * (1.0 - GAME_CONFIG.MICRO_HARVEST_AUTO_PENALTY);
            autoHarvestGreenhouse(state, kg, audio);
          }
        }
      }
    }

    // T8 auto-harvest
    if (state.purchasedUpgrades.includes('T8') && !gh.overripe) {
      const kg = getHarvestYield(state);
      autoHarvestGreenhouse(state, kg, audio);
    }
    return;
  }

  // Advance crop progress
  const cycleDur = getCycleDuration(state);
  gh.cropProgress += dt / cycleDur;

  if (gh.cropProgress >= 1.0) {
    gh.cropProgress = 1.0;
    gh.graceTimer = 0;
    gh.overripe = false;

    if (gh.currentCrop === 'mikrobiljke') {
      gh.microReadyWindow = true;
      gh.microWindowTimer = GAME_CONFIG.MICRO_HARVEST_WINDOW_SEC;
      if (audio) audio.playSfx('inokulacija');
    } else {
      if (audio) audio.playSfx('harvest');
    }
  }
}

/** Player manually harvests */
export function harvestGreenhouse(state, audio) {
  const gh = state.greenhouse;
  if (gh.cropProgress < 1.0) return 0;

  const kg = getHarvestYield(state);
  const bonusKg = (gh.currentCrop === 'mikrobiljke' && gh.microReadyWindow)
    ? kg * GAME_CONFIG.MICRO_HARVEST_BONUS
    : 0;
  const totalKg = kg + bonusKg;

  const revenue = sellYield(state, 'greenhouse', totalKg, gh.currentCrop);

  if (gh.currentCrop === 'paradajz') {
    state.greenhouse.tomato_harvested_kg = (state.greenhouse.tomato_harvested_kg || 0) + totalKg;
  } else {
    gh.microCycles++;
    state._microHarvestedKg = (state._microHarvestedKg || 0) + totalKg;
  }

  gh.totalHarvested += totalKg;
  gh.revenueEarned += revenue;
  gh.cropProgress = 0;
  gh.graceTimer = 0;
  gh.overripe = false;
  gh.microReadyWindow = false;
  gh.microWindowTimer = 0;

  if (audio) audio.playSfx('harvest');
  return revenue;
}

function autoHarvestGreenhouse(state, kg, audio) {
  const revenue = sellYield(state, 'greenhouse', kg, state.greenhouse.currentCrop);
  state.greenhouse.totalHarvested += kg;
  state.greenhouse.revenueEarned += revenue;
  state.greenhouse.cropProgress = 0;
  state.greenhouse.graceTimer = 0;
  state.greenhouse.overripe = false;
  state.greenhouse.microReadyWindow = false;
  state.greenhouse.microWindowTimer = 0;
  if (audio) audio.playSfx('harvest');
}

/** Switch crop type */
export function switchCrop(state, cropType) {
  if (cropType === 'mikrobiljke' && !state.purchasedUpgrades.includes('T3')) return false;
  state.greenhouse.currentCrop = cropType;
  state.greenhouse.cropProgress = 0;
  state.greenhouse.graceTimer = 0;
  state.greenhouse.overripe = false;
  state.greenhouse.microReadyWindow = false;
  return true;
}
