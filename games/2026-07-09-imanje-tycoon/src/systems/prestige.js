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

// ─── Preview helpers ───────────────────────────────────────────────────────────

/**
 * Get prestige preview summary for display in modal.
 * @param {object} state
 * @returns {{ carryCapital, newYieldMult, newSpeedMult, currentCount, nextCount, canPrestige }}
 */
export function getPrestigePreview(state) {
  const currentCount = state.prestige.count;
  const nextCount = currentCount + 1;
  const carryCapital = Math.floor(state.capital * GAME_CONFIG.PRESTIGE_CAPITAL_CARRY);
  const newYieldMult = Math.pow(GAME_CONFIG.PRESTIGE_YIELD_MULTIPLIER_BASE, nextCount);
  const newSpeedMult = 1.0 + GAME_CONFIG.PRESTIGE_SPEED_PER_COUNT * nextCount;
  const newAlumniBonus = GAME_CONFIG.ALUMNI_BONUS_PER_PRESTIGE * nextCount;

  return {
    carryCapital,
    newYieldMult: newYieldMult.toFixed(3),
    newSpeedMult: newSpeedMult.toFixed(2),
    newAlumniBonus: (newAlumniBonus * 100).toFixed(0),
    currentCount,
    nextCount,
    prestige: canPrestige(state),
  };
}

/**
 * Get a breakdown of all accumulated prestige bonuses for UI display.
 * @param {object} state
 * @returns {Array<{ label, value, desc }>}
 */
export function getPrestigeBonusSummary(state) {
  const p = state.prestige;
  const bonuses = [];

  if (p.count > 0) {
    bonuses.push({
      label: 'Yield multiplikator',
      value: `×${p.yieldMultiplier.toFixed(3)}`,
      desc: `${p.count} prestiž × ${(GAME_CONFIG.PRESTIGE_YIELD_MULTIPLIER_BASE * 100 - 100).toFixed(0)}% po resetou`,
    });
    bonuses.push({
      label: 'Brzina rasta',
      value: `×${p.speedMultiplier.toFixed(2)}`,
      desc: `${p.count} prestiž × ${(GAME_CONFIG.PRESTIGE_SPEED_PER_COUNT * 100).toFixed(0)}% bržeg rasta`,
    });
    bonuses.push({
      label: 'Alumni mreza',
      value: `+${((p.alumniBonus || 0) * 100).toFixed(0)}%`,
      desc: 'Veći masterclass participacija zbog alumi mreže',
    });
  }

  // Scenario bonuses
  if (p.scenario === 'avala') {
    bonuses.push({ label: 'Avala: Plastenik yield', value: '×1.20', desc: 'Planinska klima pogodna za uzgoj' });
    bonuses.push({ label: 'Avala: Online kanal', value: '2.5× za mikrobiljke/jaja', desc: 'Turisti plaćaju premium' });
  }
  if (p.scenario === 'strandG') {
    bonuses.push({ label: 'Štrand: Smuđ restoran', value: '×2.0 min', desc: 'Gastro segment plaća premium za smuđa' });
    bonuses.push({ label: 'Štrand: Paradajz cena', value: '+25%', desc: 'Urbana potražnja za svežim povrćem' });
    bonuses.push({ label: 'Štrand: Operating cost', value: '−5.000 din/sez', desc: 'Regulatorni i komunalni troškovi' });
  }

  return bonuses;
}

/**
 * Get prestige history (scenarios used and season counts).
 * @param {object} state
 * @returns {{ count, scenario, history }}
 */
export function getPrestigeHistory(state) {
  return {
    count: state.prestige.count,
    scenario: state.prestige.scenario,
    yieldMult: state.prestige.yieldMultiplier,
    speedMult: state.prestige.speedMultiplier,
    alumniBonus: state.prestige.alumniBonus || 0,
    scenarioName: PRESTIGE_SCENARIOS.find(s => s.id === state.prestige.scenario)?.name || '🌿 Guncati',
  };
}

/**
 * Get available prestige scenarios with unlock status.
 * @param {object} state
 * @returns {Array<{...scenario, isUnlocked, isSelected}>}
 */
export function getAvailableScenarios(state) {
  return PRESTIGE_SCENARIOS.map(s => ({
    ...s,
    isUnlocked: s.unlockCount <= state.prestige.count,
    isSelected: s.id === state.prestige.scenario,
  }));
}

/**
 * Validate if a prestige scenario can be selected.
 * @param {object} state
 * @param {string} scenarioId
 * @returns {{ valid, reason }}
 */
export function validatePrestigeScenario(state, scenarioId) {
  if (!canPrestige(state)) {
    return { valid: false, reason: 'Uslovi za prestiž nisu ispunjeni (Faza C + 3 sezone surplus).' };
  }
  const scenario = PRESTIGE_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) {
    return { valid: false, reason: 'Nepostojeci scenario.' };
  }
  if (scenario.unlockCount > state.prestige.count) {
    return { valid: false, reason: `Ovaj scenario zahteva ${scenario.unlockCount} prestiž reset(a).` };
  }
  return { valid: true, reason: '' };
}

// ─── Execute prestige ──────────────────────────────────────────────────────────

/**
 * Execute prestige reset.
 * Returns true if successful.
 * @param {object} state
 * @param {string} scenarioId
 * @param {object|null} audio
 * @returns {boolean}
 */
export function doPrestige(state, scenarioId, audio) {
  const { valid, reason } = validatePrestigeScenario(state, scenarioId);
  if (!valid) return false;

  const scenario = PRESTIGE_SCENARIOS.find(s => s.id === scenarioId);

  // Carry 50% capital
  const carryCapital = Math.floor(state.capital * GAME_CONFIG.PRESTIGE_CAPITAL_CARRY);

  // Increment prestige count
  state.prestige.count++;
  state.prestige.scenario = scenarioId;

  // Accumulate multipliers
  state.prestige.yieldMultiplier = Math.pow(GAME_CONFIG.PRESTIGE_YIELD_MULTIPLIER_BASE, state.prestige.count);
  state.prestige.speedMultiplier = 1.0 + GAME_CONFIG.PRESTIGE_SPEED_PER_COUNT * state.prestige.count;
  state.prestige.alumniBonus = GAME_CONFIG.ALUMNI_BONUS_PER_PRESTIGE * state.prestige.count;

  // Record this prestige in history
  if (!state.prestige._history) state.prestige._history = [];
  state.prestige._history.push({
    count: state.prestige.count,
    scenario: scenarioId,
    season: state.season,
    capital: carryCapital,
    date: Date.now(),
  });

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
      blocks: [{
        id: 0, type: 'bukovaca', waveProgress: 0, waveIndex: 0, totalWaves: 3,
        inokulacijaWindow: false, inokulacijaTimer: 0, inokulacijaBonus: 0, pendingHarvest: 0,
      }],
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
      saran_harvested_kg: 0,
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
    _muljBonusApplied: false,
    _synergyFirstActivation: {},
    _fishGrowthPenalty: undefined,
    _recordSeasonBonus: undefined,
    _strandGOperatingCost: undefined,
    _microHarvestedKg: 0,
    _oysterRevenue: 0,
    _feedWindowSuccessCount: 0,
  });

  // Restore prestige and achievements
  state.prestige = prestigeSnapshot;
  state.unlockedAchievements = achievementSnapshot;
  state.achievementBonuses = bonusSnapshot;

  // Apply scenario-specific bonuses
  applyScenarioBonuses(state, scenarioId);

  if (audio) audio.playSfx('prestige');
  return true;
}

/**
 * Apply scenario-specific startup bonuses after prestige reset.
 * @param {object} state
 * @param {string} scenarioId
 */
function applyScenarioBonuses(state, scenarioId) {
  if (scenarioId === 'guncati') {
    // Default — synergies get an extra +10% bonus handled in synergies.js
    // Nothing to set here, synergy bonus is computed live
  } else if (scenarioId === 'avala') {
    // Greenhouse yield multiplier handled in getYieldPerM2() via scenario check
    // Unlock online channel at start
    if (!state.unlockedChannels.includes('online')) {
      state.unlockedChannels.push('online');
      state.channels.online = 10;
      state.channels.direktna = Math.max(0, (state.channels.direktna || 100) - 10);
    }
  } else if (scenarioId === 'strandG') {
    // Operating costs 5000 din/season handled in season end
    state._strandGOperatingCost = 5000;
  }
}

/** Open prestige UI (delegated to modals — dynamic import breaks circular dep) */
export function openPrestigeModal(state, gameRef) {
  if (!canPrestige(state)) {
    import('../ui/modals.js').then(({ showToast }) => {
      showToast('⚠️ Prestiž nije dostupan. Potrebna: Faza C + 3 sezone surplus.');
    });
    return;
  }
  import('../ui/modals.js').then(({ showPrestigeModal }) => {
    showPrestigeModal(state, gameRef);
  });
}

/**
 * Get prestige gating status message for UI.
 * @param {object} state
 * @returns {{ ready, message }}
 */
export function getPrestigeGateStatus(state) {
  if (state.phase !== 'C') {
    return { ready: false, message: `Prestiž zahteva Fazu C (trenutno: Faza ${state.phase})` };
  }
  const needed = GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS;
  const have = state.consecutiveSeasonsOverTarget || 0;
  if (have < needed) {
    return {
      ready: false,
      message: `Potrebno ${needed} uzastopnih sezona >150k din. Trenutno: ${have}/${needed}`,
    };
  }
  return { ready: true, message: '🌟 Spreman za prestiž!' };
}
