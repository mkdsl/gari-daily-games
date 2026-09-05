/**
 * @module achievements
 * Achievement unlock tracking and display.
 *
 * Achievements are stored in game state and persist across runs via state.achievements.
 * Each achievement has a definition (static) and an unlock state (per-user).
 *
 * Achievements:
 *   first_assign     — first time placing any task
 *   ekosistem_bonus  — Micelij + Jezero + Kompost all in-window
 *   savrsena_sezona  — 900+ points (all 6 in-window)
 *   prestige_3       — 3 runs with prestige active
 *   no_weather_block — complete season without any rain-blocked task
 *   under_600_first  — finish a season under 600p (learning badge)
 *   speed_planner    — all 6 tasks assigned within first play session
 *   eco_without_full — eco bonus WITHOUT full_forecast prestige
 */

import { ACHIEVEMENT_MSGS } from '../content/brana_dialogs.js';
import { loadTotalRuns } from '../state.js';

// ─── Typedefs ──────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} AchievementDef
 * @property {string} id
 * @property {string} label       - Short display name
 * @property {string} description - What the player did to earn it
 * @property {string} emoji       - Badge emoji
 * @property {string} hint        - Shown when not yet unlocked (optional spoiler hint)
 * @property {boolean} hidden     - If true, shown as "???" until unlocked
 */

// ─── Achievement Definitions ──────────────────────────────────────────────────

/** @type {AchievementDef[]} */
export const ACHIEVEMENT_DEFS = [
  {
    id: 'first_assign',
    label: 'Prva dodela',
    description: 'Postavio si prvi zadatak na raspored. Sezona počinje!',
    emoji: '🌱',
    hint: 'Dodeli bilo koji zadatak na grid.',
    hidden: false,
  },
  {
    id: 'ekosistem_bonus',
    label: 'Ekosistem bonus',
    description: 'Micelij, Jezero i Kompost su svi u optimalnom prozoru — ×1.5 poena za sve tri!',
    emoji: '🌿',
    hint: 'Postavi Micelij, Jezero i Kompost sve u optimalnom prozoru.',
    hidden: false,
  },
  {
    id: 'savrsena_sezona',
    label: 'Savršena sezona',
    description: '900+ poena! Sve šest zadataka idealno raspoređeno.',
    emoji: '🌟',
    hint: 'Postigni 900+ poena.',
    hidden: false,
  },
  {
    id: 'prestige_3',
    label: 'Trojni prestiž',
    description: '3 ili više sezone sa aktivnim prestižom. Pravi posvećeni farmer.',
    emoji: '🏅',
    hint: 'Odigraj 3 ili više sezone s aktivnim prestižom.',
    hidden: false,
  },
  {
    id: 'no_weather_block',
    label: 'Čist plan',
    description: 'Završio si sezonu bez ijednog zadatka blokiranog kišom.',
    emoji: '☀️',
    hint: 'Završi sezonu bez ijedne rain-blokirane dodele.',
    hidden: false,
  },
  {
    id: 'under_600_first',
    label: 'Učiš na greškama',
    description: 'Prva sezona ispod 600 poena — ali nisi odustao.',
    emoji: '📚',
    hint: 'Završi bar jednu sezonu ispod 600 poena.',
    hidden: false,
  },
  {
    id: 'eco_without_forecast',
    label: 'Seosko osećanje',
    description: 'Postigao si Ekosistem bonus bez "Puna prognoza" prestige bonusa.',
    emoji: '🦉',
    hint: 'Postavi Ekosistem bonus bez full_forecast prestiža.',
    hidden: true,
  },
  {
    id: 'all_tasks_week1',
    label: 'Rani planinator',
    description: 'Rasporedio si svih 6 zadataka u prvih 5 nedelja.',
    emoji: '⚡',
    hint: 'Rasporedi sve zadatke u prvih 5 nedelja.',
    hidden: true,
  },
];

// ─── Achievement Checking ─────────────────────────────────────────────────────

/**
 * Check and unlock any newly achieved achievements after scoring.
 * Should be called immediately after a run ends with the score result.
 *
 * @param {import('../state.js').GameState} state
 * @param {import('./scoring.js').ScoreResult} scoreResult
 * @returns {string[]} ids of newly unlocked achievements
 */
export function checkAndUnlockAchievements(state, scoreResult) {
  const newlyUnlocked = [];

  // Savršena sezona: 900+
  if (!state.achievements['savrsena_sezona'] && scoreResult.total >= 900) {
    state.achievements['savrsena_sezona'] = true;
    newlyUnlocked.push('savrsena_sezona');
  }

  // Ekosistem bonus achieved
  if (!state.achievements['ekosistem_bonus'] && scoreResult.ecosystem_bonus) {
    state.achievements['ekosistem_bonus'] = true;
    newlyUnlocked.push('ekosistem_bonus');
  }

  // Eco bonus WITHOUT full_forecast
  if (!state.achievements['eco_without_forecast'] &&
      scoreResult.ecosystem_bonus &&
      state.prestige_bonus !== 'full_forecast') {
    state.achievements['eco_without_forecast'] = true;
    newlyUnlocked.push('eco_without_forecast');
  }

  // Prestige 3
  const totalRuns = loadTotalRuns();
  if (!state.achievements['prestige_3'] && totalRuns >= 3 && state.prestige_bonus) {
    state.achievements['prestige_3'] = true;
    newlyUnlocked.push('prestige_3');
  }

  // Under 600 first time
  if (!state.achievements['under_600_first'] && scoreResult.total < 600) {
    state.achievements['under_600_first'] = true;
    newlyUnlocked.push('under_600_first');
  }

  // No weather block (all assigned tasks were in-window; ignore unassigned)
  const assignedBreakdown = scoreResult.breakdown.filter((b) => b.week !== null);
  const noBlock = assignedBreakdown.every((b) => b.in_window);
  if (!state.achievements['no_weather_block'] && noBlock && scoreResult.total >= 300) {
    state.achievements['no_weather_block'] = true;
    newlyUnlocked.push('no_weather_block');
  }

  // All tasks in first 5 weeks
  const allInEarly = state.assignments.length >= 6 &&
    state.assignments.every((a) => a.week <= 5);
  if (!state.achievements['all_tasks_week1'] && allInEarly) {
    state.achievements['all_tasks_week1'] = true;
    newlyUnlocked.push('all_tasks_week1');
  }

  return newlyUnlocked;
}

/**
 * Unlock the first_assign achievement (called on first card assignment).
 * Returns whether it was newly unlocked.
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function unlockFirstAssign(state) {
  if (!state.achievements['first_assign']) {
    state.achievements['first_assign'] = true;
    return true;
  }
  return false;
}

/**
 * Manually unlock a specific achievement by ID.
 * Returns false if already unlocked.
 * @param {import('../state.js').GameState} state
 * @param {string} achievementId
 * @returns {boolean}
 */
export function unlockAchievement(state, achievementId) {
  if (state.achievements[achievementId]) return false;
  state.achievements[achievementId] = true;
  return true;
}

// ─── Achievement Queries ─────────────────────────────────────────────────────

/**
 * Get list of all achievements with unlock status from state.
 * @param {import('../state.js').GameState} state
 * @returns {Array<AchievementDef & { unlocked: boolean }>}
 */
export function getAchievementList(state) {
  return ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    unlocked: !!state.achievements[def.id],
  }));
}

/**
 * Get only unlocked achievements.
 * @param {import('../state.js').GameState} state
 * @returns {Array<AchievementDef & { unlocked: true }>}
 */
export function getUnlockedAchievements(state) {
  return getAchievementList(state).filter((a) => a.unlocked);
}

/**
 * Count total unlocked achievements.
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
export function countUnlocked(state) {
  return Object.values(state.achievements).filter(Boolean).length;
}

/**
 * Check if a specific achievement is unlocked.
 * @param {import('../state.js').GameState} state
 * @param {string} achievementId
 * @returns {boolean}
 */
export function isAchievementUnlocked(state, achievementId) {
  return !!state.achievements[achievementId];
}

/**
 * Get a display-friendly achievement entry.
 * If hidden and not unlocked, returns "???" for label and description.
 * @param {import('../state.js').GameState} state
 * @param {string} achievementId
 * @returns {{ label: string, description: string, emoji: string, unlocked: boolean } | null}
 */
export function getAchievementDisplay(state, achievementId) {
  const def = ACHIEVEMENT_DEFS.find((d) => d.id === achievementId);
  if (!def) return null;
  const unlocked = !!state.achievements[achievementId];
  if (def.hidden && !unlocked) {
    return { label: '???', description: 'Skriveno dostignuće', emoji: '🔒', unlocked: false };
  }
  return { label: def.label, description: def.description, emoji: def.emoji, unlocked };
}

// ─── Toast Messages ───────────────────────────────────────────────────────────

/**
 * Get a toast notification message for a newly unlocked achievement.
 * Uses ACHIEVEMENT_MSGS from brana_dialogs if available, else a default.
 * @param {string} achievementId
 * @returns {string}
 */
export function getAchievementToast(achievementId) {
  // Try brana's achievement messages first
  const branaMsgs = ACHIEVEMENT_MSGS;
  if (branaMsgs && branaMsgs[achievementId]) {
    return branaMsgs[achievementId];
  }

  const def = ACHIEVEMENT_DEFS.find((d) => d.id === achievementId);
  if (!def) return '🏆 Novo dostignuće!';
  return `${def.emoji} ${def.label} — ${def.description}`;
}

/**
 * Get a summary of achievement progress as a string.
 * Example: "3/8 dostignuća"
 * @param {import('../state.js').GameState} state
 * @returns {string}
 */
export function getAchievementProgressText(state) {
  const count = countUnlocked(state);
  const total = ACHIEVEMENT_DEFS.length;
  return `${count}/${total} dostignuća`;
}
