import { GAME_CONFIG } from '../config.js';
import { canPrestige } from './phases.js';

export const PRESTIGE_SCENARIOS = [
  {
    id: 'guncati',
    name: '🌿 Guncati (Osnova)',
    desc: 'Permakulturno imanje — Komposter i Mulj sinergija +10% extra bonus. Tvoj polazni teren.',
    unlockCount: 0,
    bonuses: ['Komposter sinergija +10%', 'Mulj sinergija +10%'],
  },
  {
    id: 'avala',
    name: '⛰️ Avala (Prestiž 1+)',
    desc: 'Planinsko imanje sa turizmom. Plastenik yield ×1.20. Turistički kanal otključan. Jezero 30% skuplje.',
    unlockCount: 1,
    bonuses: ['Plastenik yield ×1.20', 'Turistički kanal (2.5× za mikrobiljke/jaja)', 'Jezero investicija +30%'],
  },
  {
    id: 'strandG',
    name: '🏖️ Štrand (Prestiž 2+)',
    desc: 'Urbano imanje pored reke. Smuđ kanal mult →2.0. Paradajz +25% cena. Regulatorni troškovi.',
    unlockCount: 2,
    bonuses: ['Smuđ restoran mult →2.0', 'Paradajz +25% cena', '−5.000 din/sezona operating cost', 'Inspekcija 12%'],
  },
];

/**
 * Execute prestige reset.
 * Returns true if successful.
 */
export function doPrestige(state, scenarioId, audio) {
  if (!canPrestige(state)) return false;

  const scenario = PRESTIGE_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return false;
  if (scenario.unlockCount > state.prestige.count) return false;

  // Carry 50% capital
  const carryCapital = Math.floor(state.capital * GAME_CONFIG.PRESTIGE_CAPITAL_CARRY);

  // Increment prestige count
  state.prestige.count++;
  state.prestige.scenario = scenarioId;

  // Accumulate multipliers
  state.prestige.yieldMultiplier = Math.pow(GAME_CONFIG.PRESTIGE_YIELD_MULTIPLIER_BASE, state.prestige.count);
  state.prestige.speedMultiplier = 1.0 + GAME_CONFIG.PRESTIGE_SPEED_PER_COUNT * state.prestige.count;
  state.prestige.alumniBonus = GAME_CONFIG.ALUMNI_BONUS_PER_PRESTIGE * state.prestige.count;

  // Reset game state (preserve prestige, carry capital)
  const prestigeSnapshot = { ...state.prestige };
  const achievementSnapshot = [...state.unlockedAchievements];
  const bonusSnapshot = { ...state.achievementBonuses };

  // Re-init all core state
  Object.assign(state, {
    capital: carryCapital,
    totalRevenue: 0,
    seasonRevenue: 0,
    monthlyRevenue: [],
    phase: '0',
    season: 1,
    seasonTimer: GAME_CONFIG.SEASON_DURATION_SEC,
    consecutiveSeasonsOverTarget: 0,
    channels: { direktna: 100, pijaca: 0, restoran: 0, online: 0, masterclass: 0 },
    unlockedChannels: ['direktna'],
    mushrooms: {
      unlocked: true,
      blocks: [{ id: 0, type: 'bukovaca', waveProgress: 0, waveIndex: 0, totalWaves: 3,
        inokulacijaWindow: false, inokulacijaTimer: 0, inokulacijaBonus: 0, pendingHarvest: 0 }],
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
    synergies: { komposter: false, mulj: false, ekosistem: false },
    purchasedUpgrades: [],
    activeEvent: null,
    marketForecast: { paradajz: GAME_CONFIG.PRICE_PARADAJZ, mikrobiljke: GAME_CONFIG.PRICE_MIKROBILJKE },
  });

  // Restore prestige and achievements
  state.prestige = prestigeSnapshot;
  state.unlockedAchievements = achievementSnapshot;
  state.achievementBonuses = bonusSnapshot;

  // Apply scenario bonuses
  applyScenarioBonuses(state, scenarioId);

  if (audio) audio.playSfx('prestige');
  return true;
}

function applyScenarioBonuses(state, scenarioId) {
  if (scenarioId === 'guncati') {
    // Default bonus already in synergies
  } else if (scenarioId === 'avala') {
    // greenhouseYield boost handled in getYieldPerM2() via scenario check
    if (!state.unlockedChannels.includes('online')) {
      state.unlockedChannels.push('online');
      state.channels.online = 10;
      state.channels.direktna -= 10;
    }
  } else if (scenarioId === 'strandG') {
    // Operating costs handled in season end
    state._strandGOperatingCost = 5000;
  }
}

/** Open prestige UI (delegated to modals — dynamic import breaks circular dep) */
export function openPrestigeModal(state, gameRef) {
  if (!canPrestige(state)) return;
  import('../ui/modals.js').then(({ showPrestigeModal }) => {
    showPrestigeModal(state, gameRef);
  });
}
