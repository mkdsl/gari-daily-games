/**
 * state.js — Game state shape, localStorage save/load, career/bond/prestige tracking
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { SAVE_KEY, STATE_VERSION } from './config.js';

/**
 * Creates a fresh game state (both session and career data)
 * @returns {Object} Full state object
 */
export function createState() {
  return {
    version: STATE_VERSION,

    // ── SESSION STATE (resetuje se svake noći) ──────────────────
    /** [{memberId: string, role: string}] — max 5 */
    activeCrew: [],

    /** Trenutna faza: 'roster'|'gathering'|'peak'|'departure'|'outro' */
    currentPhase: 'roster',

    /** Index trenutnog scenarija u scenariosForNight (0-based) */
    currentScenarioIndex: 0,

    /** Array 10 scenario ID-jeva za ovu noć */
    scenariosForNight: [],

    /** Rezultati svakog scenarija: [{scenarioId, outcome, scoreGained}] */
    scenarioResults: [],

    /** Tekući Night Score (0-100) */
    nightScore: 0,

    /** Aftermath stack: [{type, magnitude, duration, statAffected, label}] */
    aftermathStack: [],

    /** Koje ability-je su potrošene ove noći: {[memberId]: boolean} */
    spentAbilities: {},

    /** Aktivne sinergije za ovu noć: [synergyId] */
    activeSynergies: [],

    /** Seed za ovu noć (baziran na datum + careerTier + nightNumber) */
    currentNightSeed: 0,

    /** Frozen aftermath counter (Guncati ability) */
    aftermathFrozenFor: 0,

    /** Force next scenario type override (Tanja ability) */
    forceNextScenarioType: null,

    /** Peak phase bonus (Tonović ability) */
    peakPhaseBonus: 0,

    /** Share score multiplier (Ivana ability) */
    shareScoreMultiplier: 1,

    /** Privremene stat deltas za ovu noć */
    tempStatDeltas: {},

    /** Da li je Ana ability iskorišćena za override */
    anaOverridePending: false,

    // ── CAREER STATE (trajno, između noći) ────────────────────────

    /** Ukupni career XP */
    crewXP: 0,

    /** Broj završenih noći ukupno */
    completedNights: 0,

    /**
     * Bond tracking: {[pairKey: string]: {sharedNights: number, bondLevel: number}}
     * pairKey = alphabetically sorted "${id1}_${id2}"
     */
    bondLevels: {},

    /** Prestige nivo (0-5) */
    prestigeLevel: 0,

    /** Koliko legendary noći ukupno (za prestige trigger) */
    prestigeNightCount: 0,

    /** Ukupan number legendary nights achieved (ne resetuje se) */
    totalLegendaryNights: 0,

    /** Otključani member ID-jevi (starter uvek ima 6 startera) */
    unlockedMembers: ['maja', 'dragan', 'ana', 'bojan', 'lena', 'pedja'],

    /** Achievements: {[achievementId]: boolean} */
    achievements: {},

    /** History of last 5 nights: [{nightScore, outcome, crew, date}] */
    nightHistory: [],

    /** Career tier (0=rookie, 1=regular, 2=veteran, 3=legend) */
    careerTier: 0,

    /** Timestamp poslednjeg save-a */
    lastSaved: Date.now()
  };
}

/**
 * Load state from localStorage
 * @returns {Object|null} State or null if not found/invalid
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STATE_VERSION) return null;
    // Merge with fresh defaults to handle new fields added in updates
    const fresh = createState();
    return { ...fresh, ...parsed };
  } catch {
    return null;
  }
}

/**
 * Save state to localStorage
 * @param {Object} state
 */
export function saveState(state) {
  try {
    state.lastSaved = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or private mode — silently ignore
  }
}

/**
 * Reset career state (on prestige) — clears session, keeps prestige level
 * @param {Object} state - Current state (mutated in place)
 */
export function applyCareerPrestigeReset(state) {
  const prestigeLevel = state.prestigeLevel + 1;
  const totalLegendaryNights = state.totalLegendaryNights;
  const nightHistory = state.nightHistory.slice(-5);

  const fresh = createState();
  Object.assign(state, fresh);

  state.prestigeLevel = prestigeLevel;
  state.totalLegendaryNights = totalLegendaryNights;
  state.nightHistory = nightHistory;
  // Keep unlocked members on prestige
  // Guncati unlocks at prestige 1
  if (prestigeLevel >= 1 && !state.unlockedMembers.includes('guncati')) {
    state.unlockedMembers.push('guncati');
  }
}

/**
 * Reset session state for new night (keeps career data)
 * @param {Object} state - Current state (mutated in place)
 */
export function resetNightSession(state) {
  state.currentPhase = 'roster';
  state.currentScenarioIndex = 0;
  state.scenariosForNight = [];
  state.scenarioResults = [];
  state.nightScore = 0;
  state.aftermathStack = [];
  state.spentAbilities = {};
  state.activeSynergies = [];
  state.currentNightSeed = 0;
  state.aftermathFrozenFor = 0;
  state.forceNextScenarioType = null;
  state.peakPhaseBonus = 0;
  state.shareScoreMultiplier = 1;
  state.tempStatDeltas = {};
  state.anaOverridePending = false;
  // Keep activeCrew (player's roster selection persists)
}

/**
 * Get career tier string based on completedNights
 * @param {Object} state
 * @returns {'rookie'|'regular'|'veteran'|'legend'}
 */
export function getCareerTierLabel(state) {
  if (state.completedNights >= 20) return 'legend';
  if (state.completedNights >= 10) return 'veteran';
  if (state.completedNights >= 3) return 'regular';
  return 'rookie';
}

/**
 * Get current scenario data from state
 * @param {Object} state
 * @returns {string|null} scenarioId or null
 */
export function getCurrentScenarioId(state) {
  return state.scenariosForNight[state.currentScenarioIndex] || null;
}

/**
 * Check if an ability has been spent this night
 * @param {Object} state
 * @param {string} memberId
 * @returns {boolean}
 */
export function isAbilitySpent(state, memberId) {
  return !!state.spentAbilities[memberId];
}

/**
 * Mark ability as spent
 * @param {Object} state
 * @param {string} memberId
 */
export function markAbilitySpent(state, memberId) {
  state.spentAbilities[memberId] = true;
}

/**
 * Get night outcome label based on nightScore
 * @param {number} score
 * @returns {'legendary'|'good'|'survived'|'kaos'}
 */
export function getNightOutcome(score) {
  if (score >= 85) return 'legendary';
  if (score >= 60) return 'good';
  if (score >= 35) return 'survived';
  return 'kaos';
}

/**
 * Add to night history (last 10 kept)
 * @param {Object} state
 * @param {number} nightScore
 * @param {string} outcome
 * @param {string[]} crewIds
 */
export function addToNightHistory(state, nightScore, outcome, crewIds) {
  state.nightHistory.unshift({
    nightScore,
    outcome,
    crewIds: [...crewIds],
    nightNumber: state.completedNights,
    date: new Date().toISOString().slice(0, 10)
  });
  if (state.nightHistory.length > 10) {
    state.nightHistory = state.nightHistory.slice(0, 10);
  }
}

/**
 * Update career tier based on completed nights
 * @param {Object} state
 */
export function updateCareerTier(state) {
  const n = state.completedNights;
  if (n >= 20) state.careerTier = 3;
  else if (n >= 10) state.careerTier = 2;
  else if (n >= 3) state.careerTier = 1;
  else state.careerTier = 0;
}
