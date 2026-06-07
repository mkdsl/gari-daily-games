/**
 * state.js — Game state shapes za macroState, microTempState, metaState
 * Ovo je "source of truth" struktura — save/load je u save.js
 */

import { MIN_PARTICIPANTS, SESSION_SLOTS, ACTIVITY_TYPES } from './config.js';

// === MACRO STATE ===
/**
 * @returns {import('./types.js').MacroState}
 */
export function createMacroState() {
  return {
    version: 1,
    currentSeason: 1,          // 1-5 pre prestiza
    prestigeLevel: 0,
    totalSeasonsCompleted: 0,
    currentWeek: 1,

    // Odabrana tema za sezonu
    selectedTema: null,         // string key iz masterclass-catalog

    // Polaznici
    participants: [],           // array ParticipantProfile objekata
    participantCount: MIN_PARTICIPANTS,
    maxParticipants: MIN_PARTICIPANTS,

    // Staff
    hiredStaff: [],             // ['brana', 'alatko', ...]
    availableStaff: ['alatko'],

    // Budget
    budget: 500,
    carryoverBudget: 0,
    totalEarned: 0,
    totalSpent: 0,

    // Resursi (carry-over)
    toolInventory: {
      quality: 1.0,             // 0.5 = habanje, 1.0 = novo
      discount: 0               // 0.20 posle unlock
    },
    foodStockpile: {
      units: 0,                 // iz Cana konzerviranja
      discount: 0
    },

    // Plan sesije (timeline koji igrač napravi)
    sessionPlan: createDefaultPlan(), // array od SESSION_SLOTS

    // Trajanje (dani)
    sessionDays: 1,

    // Weather forecast
    weatherForecast: 'sunny',

    // Rezultati prethodnih sesija u sezoni
    completedSessions: [],

    // Stanje sezone
    seasonStarted: false,
    seasonCompleted: false,

    // Guided mode
    guidedModeActive: true,
    guidedSessionsCompleted: 0,

    // Curriculum
    curriculumModules: []       // redosled modula
  };
}

/**
 * Default raspored sesije — 8 slotova
 */
export function createDefaultPlan() {
  const plan = [];
  const defaults = ['teorija', 'demonstracija', 'prakticni_rad', 'teorija', 'pauza', 'prakticni_rad', 'demonstracija', 'evaluacija'];
  for (let i = 0; i < SESSION_SLOTS; i++) {
    plan.push({
      slotIndex: i,
      activity: defaults[i] || 'teorija',
      locked: false
    });
  }
  return plan;
}

// === MICRO TEMP STATE ===
/**
 * Atomarna sesija — brise se po zavrsetku
 * @returns {import('./types.js').MicroState}
 */
export function createMicroState(plan, participants, weather, staff, tema) {
  return {
    version: 1,
    startedAt: Date.now(),
    plan: plan || createDefaultPlan(),
    participants: participants || [],
    weather: weather || 'sunny',
    staff: staff || [],
    tema: tema || 'suvozid',

    // Clock
    gameMinute: 0,              // 0-480 (8h sesija)
    currentSlot: 0,             // 0-7
    slotProgress: 0,            // 0-60 minuta unutar slota
    isPaused: false,
    speed: 1,

    // Per-participant energija i zadovoljstvo
    participantStates: [],      // [{id, energy, satisfaction, learned, mood}]

    // Incident queue
    activeIncident: null,
    incidentHistory: [],
    lastIncidentTime: 0,
    incidentCooldowns: {},      // {INC_xx: lastTime}

    // Session stats
    totalSatisfaction: 0,
    satisfactionSamples: 0,
    totalLearned: 0,
    incidentCount: 0,
    criticalIncidentCount: 0,

    // Module progress (0-100 per module)
    moduleProgress: {},

    // Flags
    sessionEnded: false,
    endReason: null,            // 'completed', 'abandoned', 'auto_resolve'
    guidedActive: true
  };
}

// === META STATE ===
export function createMetaState() {
  return {
    version: 1,
    reputation: 0,
    prestigeLevel: 0,
    prestigeCycles: 0,

    // Career stats
    totalSessions: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    totalSeasons: 0,
    sessionsWithoutIncident: 0,
    bestSeason: null,

    // Achievements
    achievements: {},           // {id: {unlocked: bool, unlockedAt: timestamp}}

    // Unlocked features
    unlockedFeatures: new Set(), // converted to/from array on save
    unlockedStaff: ['alatko'],
    unlockedThemes: ['suvozid'],
    maxParticipants: MIN_PARTICIPANTS,
    maxSessionDays: 1,

    // History
    seasonHistory: [],          // poslednje 10 sezona

    // Prestige memory
    prestigeKeptStaff: null,
    prestigeKeptTool: null,

    // First time flags
    shownGuidedEnd: false,
    shownBrandLink: false
  };
}

// === RESULT RECORD ===
export function createSessionResult(microState) {
  const avgSatisfaction = microState.satisfactionSamples > 0
    ? microState.totalSatisfaction / microState.satisfactionSamples
    : 0;

  return {
    completedAt: Date.now(),
    tema: microState.tema,
    participants: microState.participants.length,
    avgSatisfaction,
    totalLearned: microState.totalLearned,
    incidentCount: microState.incidentCount,
    weatherDuringSession: microState.weather,
    endReason: microState.endReason || 'completed'
  };
}

/**
 * Vraca satisfaction modifier za rep gain
 * @param {number} satisfactionRatio 0.0 - 1.0
 */
export function getSatisfactionModifier(satisfactionRatio) {
  if (satisfactionRatio >= 0.95) return 1.5;
  if (satisfactionRatio >= 0.85) return 1.2;
  if (satisfactionRatio >= 0.75) return 1.0;
  if (satisfactionRatio >= 0.65) return 0.8;
  if (satisfactionRatio >= 0.50) return 0.5;
  return 0;
}
