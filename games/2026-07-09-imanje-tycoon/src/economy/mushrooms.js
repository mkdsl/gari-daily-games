import { GAME_CONFIG } from '../config.js';
import { sellYield } from './market.js';

/** Calculate wave duration in seconds */
export function getWaveDuration(state) {
  let base = GAME_CONFIG.MUSHROOM_WAVE_SEC;
  if (state.purchasedUpgrades.includes('P5')) base *= 0.85;
  return base / state.prestige.speedMultiplier;
}

/** Calculate spawn ratio (yield multiplier) */
export function getSpawnRatio(state) {
  let ratio = GAME_CONFIG.MUSHROOM_SPAWN_RATIO_BASE + state.mushrooms.spawnRatioBonus;
  if (state.synergies.komposter) ratio += GAME_CONFIG.KOMPOSTER_SPAWN_BONUS;
  ratio *= state.prestige.yieldMultiplier;
  // Achievement bonus
  if (state.achievementBonuses.spawnRatio) ratio += state.achievementBonuses.spawnRatio;
  return ratio;
}

/** Yield in kg for one completed wave */
export function getWaveYieldKg(state, block, extraBonus = 0) {
  const ratio = getSpawnRatio(state) + extraBonus;
  return GAME_CONFIG.MUSHROOM_BLOCK_KG * ratio;
}

/** Price per kg for a block type */
export function getBlockPrice(block) {
  return block.type === 'oyster' ? GAME_CONFIG.PRICE_OYSTER : GAME_CONFIG.PRICE_BUKOVACA;
}

/**
 * Called every second (dt ≈ 1.0).
 * Advances each block's wave progress; handles inokulacija windows; auto-harvests complete waves.
 */
export function tickMushrooms(state, dt, audio) {
  const waveDuration = getWaveDuration(state);

  for (const block of state.mushrooms.blocks) {
    // If inokulacija window is open, countdown it
    if (block.inokulacijaWindow) {
      block.inokulacijaTimer -= dt;
      if (block.inokulacijaTimer <= 0) {
        // Window expired — auto-seed without bonus
        block.inokulacijaWindow = false;
        block.inokulacijaTimer = 0;
        block.inokulacijaBonus = 0;
        startNextWave(state, block);
      }
      continue; // Pause wave progress while window is open
    }

    if (block.waveIndex >= block.totalWaves) {
      // All waves done for this block cycle — pending harvest accumulates, wait for player harvest
      continue;
    }

    // Advance wave progress
    block.waveProgress += dt / waveDuration;

    if (block.waveProgress >= 1.0) {
      block.waveProgress = 1.0;
      completeWave(state, block, audio);
    }
  }
}

/** A wave completes: either open inokulacija window or auto-proceed */
function completeWave(state, block, audio) {
  block.waveIndex++;

  if (block.waveIndex >= block.totalWaves) {
    // Final wave done — harvest ready
    const kg = getWaveYieldKg(state, block, block.inokulacijaBonus);
    block.pendingHarvest += kg;
    block.inokulacijaBonus = 0;
    block.waveProgress = 0;
    if (audio) audio.playSfx('harvest');
  } else {
    // Open inokulacija window for next wave
    block.inokulacijaWindow = true;
    block.inokulacijaTimer = GAME_CONFIG.INOKULACIJA_WINDOW_SEC;
    block.inokulacijaBonus = 0;
    block.waveProgress = 0;
    if (audio) audio.playSfx('inokulacija');
  }
}

/** Player clicks inokulacija during window */
export function doInokulacija(state, blockId, audio) {
  const block = state.mushrooms.blocks.find(b => b.id === blockId);
  if (!block || !block.inokulacijaWindow) return { success: false };

  // On-time bonus
  block.inokulacijaBonus += GAME_CONFIG.INOKULACIJA_BONUS;
  block.inokulacijaWindow = false;
  block.inokulacijaTimer = 0;
  state.mushrooms.inokulacijaStreak = (state.mushrooms.inokulacijaStreak || 0) + 1;
  startNextWave(state, block);
  if (audio) audio.playSfx('inokulacija');
  return { success: true, bonus: GAME_CONFIG.INOKULACIJA_BONUS };
}

function startNextWave(state, block) {
  block.waveProgress = 0;
  // (waveIndex was already incremented in completeWave)
}

/** Player harvests a block's pending yield */
export function harvestBlock(state, blockId, audio) {
  const block = state.mushrooms.blocks.find(b => b.id === blockId);
  if (!block || block.pendingHarvest <= 0) return 0;

  const kg = block.pendingHarvest;
  const revenue = sellYield(state, 'mushrooms', kg, block.type);
  block.pendingHarvest = 0;
  block.waveIndex = 0;
  block.waveProgress = 0;

  state.mushrooms.totalHarvested += kg;
  state.mushrooms.revenueEarned += revenue;

  // Check oyster achievement
  if (block.type === 'oyster') {
    state._oysterRevenue = (state._oysterRevenue || 0) + revenue;
  }

  if (audio) audio.playSfx('harvest');
  return revenue;
}

/**
 * Estimate din revenue for a block over one season.
 * @param {object} state
 * @param {object} block
 * @returns {number} projected din/season
 */
export function getBlockRevenueProjection(state, block) {
  const seasDur = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
    ? GAME_CONFIG.SEASON_DURATION_LATE_SEC
    : GAME_CONFIG.SEASON_DURATION_SEC;
  const waveDur = getWaveDuration(state);
  const totalCycleSec = waveDur * GAME_CONFIG.MUSHROOM_WAVES_PER_BLOCK;
  const cyclesPerSeason = seasDur / totalCycleSec;
  const kgPerCycle = getWaveYieldKg(state, block);
  const price = getBlockPrice(block);
  const channelMultiplier = state?.market?.activeMultiplier || 1.0;
  return Math.round(cyclesPerSeason * kgPerCycle * price * channelMultiplier);
}

/** Add a new block (from upgrade) */
export function addMushroomBlock(state, type = 'bukovaca') {
  if (state.mushrooms.blocks.length >= state.mushrooms.maxBlocks) return false;
  state.mushrooms.blocks.push({
    id: state.mushrooms.nextBlockId++,
    type,
    waveProgress: 0,
    waveIndex: 0,
    totalWaves: GAME_CONFIG.MUSHROOM_WAVES_PER_BLOCK,
    inokulacijaWindow: false,
    inokulacijaTimer: 0,
    inokulacijaBonus: 0,
    pendingHarvest: 0,
  });
  return true;
}
