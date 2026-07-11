import { GAME_CONFIG } from './config.js';

/** @returns {Object} Fresh default game state */
function createDefaultState() {
  return {
    version: 1,
    playTime: 0,
    lastSaveTime: Date.now(),

    prestige: {
      count: 0,
      scenario: 'guncati',
      yieldMultiplier: 1.0,
      speedMultiplier: 1.0,
      alumniBonus: 0.0,
    },

    capital: GAME_CONFIG.STARTER_CAPITAL,
    totalRevenue: 0,
    seasonRevenue: 0,
    monthlyRevenue: [],

    phase: '0',
    season: 1,
    seasonTimer: GAME_CONFIG.SEASON_DURATION_SEC,
    consecutiveSeasonsOverTarget: 0,

    channels: {
      direktna: 100,
      pijaca: 0,
      restoran: 0,
      online: 0,
      masterclass: 0,
    },
    unlockedChannels: ['direktna'],

    mushrooms: {
      unlocked: true,
      blocks: [
        { id: 0, type: 'bukovaca', waveProgress: 0, waveIndex: 0, totalWaves: 3,
          inokulacijaWindow: false, inokulacijaTimer: 0, inokulacijaBonus: 0,
          pendingHarvest: 0 }
      ],
      maxBlocks: 1,
      nextBlockId: 1,
      spawnRatioBonus: 0,
      oysterUnlocked: false,
      totalHarvested: 0,
      revenueEarned: 0,
      inokulacijaStreak: 0,
    },

    greenhouse: {
      unlocked: false,
      areaM2: GAME_CONFIG.PLASTENIK_STARTER_M2,
      maxAreaM2: GAME_CONFIG.PLASTENIK_STARTER_M2,
      currentCrop: 'paradajz',
      cropProgress: 0,
      graceTimer: 0,
      overripe: false,
      microCycles: 0,
      suša: false,
      yieldBonus: 0,
      pendingHarvest: 0,
      totalHarvested: 0,
      revenueEarned: 0,
      microReadyWindow: false,
      microWindowTimer: 0,
      tomato_harvested_kg: 0,
      pijacaSeasons: 0,
    },

    fishpond: {
      unlocked: false,
      areaM2: GAME_CONFIG.FISH_STARTER_M2,
      maxAreaM2: GAME_CONFIG.FISH_STARTER_M2,
      fishType: 'saran',
      fishGrowth: 0,
      feedTimer: GAME_CONFIG.FISH_FEED_INTERVAL_SEC,
      feedWindowActive: false,
      feedWindowTimer: 0,
      feedBonusAccumulated: 0,
      ducks: 0,
      duckIncomeTimer: GAME_CONFIG.DUCK_INCOME_INTERVAL_SEC,
      pendingHarvest: 0,
      totalHarvested: 0,
      revenueEarned: 0,
      smudj_harvested_kg: 0,
      polyculture: false,
    },

    workers: {
      hired: 0,
      dailyActionsTotal: GAME_CONFIG.BASE_DAILY_ACTIONS,
      dailyActionsUsed: 0,
    },

    reputation: GAME_CONFIG.REPUTATION_BASE,
    masterclassCount: 0,
    masterclassUnlocked: false,

    synergies: {
      komposter: false,
      mulj: false,
      ekosistem: false,
    },

    purchasedUpgrades: [],

    unlockedAchievements: [],
    achievementBonuses: {},

    activeEvent: null,

    marketForecast: {
      paradajz: GAME_CONFIG.PRICE_PARADAJZ,
      mikrobiljke: GAME_CONFIG.PRICE_MIKROBILJKE,
    },

    ui: {
      activeTab: 'mushrooms',
      macroPanelOpen: true,
    },
  };
}

/** Apply offline progress (max 8h) on load */
export function applyOfflineProgress(state) {
  const now = Date.now();
  const elapsed = Math.min((now - state.lastSaveTime) / 1000, GAME_CONFIG.OFFLINE_MAX_SEC);
  if (elapsed < 5) return state;

  // Mushrooms: advance wave progress
  if (state.mushrooms.unlocked) {
    const waveLen = getWaveDurationForState(state);
    for (const block of state.mushrooms.blocks) {
      if (block.waveIndex < block.totalWaves) {
        const totalTicks = elapsed;
        const wavesCompleted = Math.floor(totalTicks / waveLen);
        const remaining = totalTicks % waveLen;
        const canComplete = block.totalWaves - block.waveIndex;
        const completed = Math.min(wavesCompleted, canComplete);
        block.waveIndex += completed;
        if (block.waveIndex >= block.totalWaves) {
          const kg = getMushroomWaveYield(state, block);
          block.pendingHarvest += kg;
          block.waveIndex = block.totalWaves;
          block.waveProgress = 0;
        } else {
          block.waveProgress = remaining / waveLen;
        }
      }
    }
  }

  // Fish: grow offline
  if (state.fishpond.unlocked && state.fishpond.fishGrowth < 1.0) {
    const growthPerSec = 1.0 / (GAME_CONFIG.FISH_GROWTH_SEC / state.prestige.speedMultiplier);
    state.fishpond.fishGrowth = Math.min(1.0, state.fishpond.fishGrowth + growthPerSec * elapsed);
  }

  // Season timer advance (multiple seasons)
  let timeLeft = elapsed;
  while (timeLeft > 0) {
    const thisSeason = Math.min(timeLeft, state.seasonTimer);
    state.seasonTimer -= thisSeason;
    timeLeft -= thisSeason;
    if (state.seasonTimer <= 0) {
      state.season++;
      const dur = state.season >= GAME_CONFIG.SEASON_LATE_THRESHOLD
        ? GAME_CONFIG.SEASON_DURATION_LATE_SEC
        : GAME_CONFIG.SEASON_DURATION_SEC;
      state.seasonTimer = dur;
      state.workers.dailyActionsUsed = 0;
      // Reset grace timers
      if (state.greenhouse.graceTimer > 0) {
        state.greenhouse.graceTimer -= thisSeason;
        if (state.greenhouse.graceTimer < 0) state.greenhouse.graceTimer = 0;
      }
    }
  }

  return state;
}

function getWaveDurationForState(state) {
  let base = GAME_CONFIG.MUSHROOM_WAVE_SEC;
  if (state.purchasedUpgrades.includes('P5')) base *= 0.85;
  return base / state.prestige.speedMultiplier;
}

function getMushroomWaveYield(state, block) {
  const ratio = (GAME_CONFIG.MUSHROOM_SPAWN_RATIO_BASE + state.mushrooms.spawnRatioBonus)
    * state.prestige.yieldMultiplier;
  const price = block.type === 'oyster' ? GAME_CONFIG.PRICE_OYSTER : GAME_CONFIG.PRICE_BUKOVACA;
  // Return kg not din — market.js handles din
  return GAME_CONFIG.MUSHROOM_BLOCK_KG * ratio;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return null;
    // Deep merge: ensure new fields exist
    return deepMerge(createDefaultState(), parsed);
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    state.lastSaveTime = Date.now();
    localStorage.setItem(GAME_CONFIG.SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota or private mode
  }
}

export function exportSave(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'imanje-tycoon-save.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importSave(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || parsed.version !== 1) throw new Error('Nepoznat format save fajla.');
      onSuccess(deepMerge(createDefaultState(), parsed));
    } catch (err) {
      onError(err.message || 'Greška pri učitavanju save fajla.');
    }
  };
  reader.readAsText(file);
}

export function resetState() {
  localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
}

export function createState() {
  return createDefaultState();
}

/** Deep merge: fill missing keys from defaults without overwriting existing values */
function deepMerge(defaults, saved) {
  const result = Object.assign({}, defaults);
  for (const key of Object.keys(saved)) {
    if (saved[key] !== null && typeof saved[key] === 'object' && !Array.isArray(saved[key])
        && typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
      result[key] = deepMerge(defaults[key], saved[key]);
    } else {
      result[key] = saved[key];
    }
  }
  return result;
}
