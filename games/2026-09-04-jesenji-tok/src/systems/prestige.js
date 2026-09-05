/**
 * @module prestige
 * Prestige system: entry conditions, bonus options, state application, and run history.
 *
 * Prestige philosophy:
 *   - A player who scores >= PRESTIGE_THRESHOLD (300p) can choose a permanent bonus
 *   - The bonus persists across runs until they choose a new one
 *   - Three bonus types: extra_group, cheap_micelij, full_forecast
 *   - Player can skip prestige to keep the existing bonus
 *   - The run counter always increments (for achievement tracking)
 *
 * Bonus effects:
 *   extra_group   — +1 group point per week (4 total instead of 3)
 *   cheap_micelij — Micelij task costs 1 group point instead of 2
 *   full_forecast — All 12 weeks of forecast revealed at game start
 */

import { PRESTIGE_THRESHOLD, PRESTIGE_OPTIONS, BASE_GROUPS_PER_WEEK } from '../config.js';
import { savePrestigeBonus, loadPrestigeBonus, resetForNewRun, incrementTotalRuns } from '../state.js';

// ─── Prestige Gate ────────────────────────────────────────────────────────────

/**
 * Check if player qualifies for prestige (score is high enough).
 * @param {number} score - final season score
 * @returns {boolean}
 */
export function canPrestige(score) {
  return score >= PRESTIGE_THRESHOLD;
}

/**
 * Get the prestige threshold score.
 * @returns {number}
 */
export function getPrestigeThreshold() {
  return PRESTIGE_THRESHOLD;
}

/**
 * Get how far the player is from prestige (0 = already qualifies).
 * @param {number} score
 * @returns {number} points needed (0 if already qualifying)
 */
export function pointsToPrestige(score) {
  return Math.max(0, PRESTIGE_THRESHOLD - score);
}

/**
 * Get a progress percentage toward prestige threshold.
 * Capped at 100%.
 * @param {number} score
 * @returns {number} 0–100
 */
export function prestigeProgress(score) {
  return Math.min(100, Math.round((score / PRESTIGE_THRESHOLD) * 100));
}

// ─── Prestige Options ─────────────────────────────────────────────────────────

/**
 * Get the prestige options, annotating the currently active bonus.
 * @param {string|null} activeBonus - currently active prestige bonus id
 * @returns {Array<{
 *   id: string,
 *   label: string,
 *   description: string,
 *   emoji: string,
 *   active: boolean,
 *   effect_summary: string
 * }>}
 */
export function getPrestigeOptions(activeBonus) {
  return PRESTIGE_OPTIONS.map((opt) => ({
    id: opt.id,
    label: opt.label,
    description: opt.description,
    emoji: opt.emoji,
    active: opt.id === activeBonus,
    effect_summary: getBonusEffectSummary(opt.id),
  }));
}

/**
 * Get all available prestige option definitions (no additional annotation).
 * @returns {typeof PRESTIGE_OPTIONS}
 */
export function getAllPrestigeOptions() {
  return PRESTIGE_OPTIONS;
}

/**
 * Get a short, one-line summary of what a bonus does (for UI display).
 * @param {string} bonusId
 * @returns {string}
 */
export function getBonusEffectSummary(bonusId) {
  const summaries = {
    extra_group: '+1 radna grupa svake nedelje (ukupno 4)',
    cheap_micelij: 'Micelij košta 1 grupu umesto 2',
    full_forecast: 'Vidiš sve 12 nedelja prognoze od početka',
  };
  return summaries[bonusId] ?? bonusId;
}

/**
 * Get a detailed description of what a bonus does (for prestige screen).
 * @param {string} bonusId
 * @returns {string}
 */
export function getBonusDetailDescription(bonusId) {
  const details = {
    extra_group: [
      'Svake nedelje imaš 4 radne grupe umesto 3.',
      'Možeš rasporediti zadatke koji bi inače bili previše skupi za isti period.',
      'Posebno korisno za sezone kada trebaš Micelij (2 grupe) + drugi zadatak u istoj nedelji.',
    ].join(' '),
    cheap_micelij: [
      'Uzgoj micelija košta samo 1 radnu grupu (standardno košta 2).',
      'Oslobađa kapacitet za kombinovanje Micelija sa drugim zadatkom.',
      'Ključno za Ekosistem bonus — možeš staviti Micelij, Jezero i Kompost u isti prozor.',
    ].join(' '),
    full_forecast: [
      'Od prvog poteza vidiš sve 12 nedelja vremenske prognoze.',
      'Standardno vidiš samo prvih 3 nedelje — ostalo se otkriva postepeno.',
      'Omogućava savršeno planiranje od starta — idealno za hvatanje Ekosistem bonusa.',
    ].join(' '),
  };
  return details[bonusId] ?? 'Bonus koji pomaže u sledećoj sezoni.';
}

// ─── Prestige Application ─────────────────────────────────────────────────────

/**
 * Apply a prestige bonus and reset the game state for a new run.
 * @param {import('../state.js').GameState} state
 * @param {string} bonusId - chosen prestige option id
 */
export function applyPrestige(state, bonusId) {
  const option = PRESTIGE_OPTIONS.find((o) => o.id === bonusId);
  if (!option) {
    console.warn('JT Prestige: unknown bonus id', bonusId);
    return;
  }

  savePrestigeBonus(bonusId);
  incrementTotalRuns();
  resetForNewRun(state, bonusId);

  // Apply immediate effects
  if (bonusId === 'extra_group') {
    state.groups_per_week = BASE_GROUPS_PER_WEEK + 1;
  }
  // cheap_micelij: applied contextually in validation/scoring
  // full_forecast: applied contextually in weather system
}

/**
 * Skip prestige screen — keep the existing bonus and start new run.
 * @param {import('../state.js').GameState} state
 */
export function skipPrestige(state) {
  const existingBonus = loadPrestigeBonus();
  incrementTotalRuns();
  resetForNewRun(state, existingBonus);
  if (existingBonus === 'extra_group') {
    state.groups_per_week = BASE_GROUPS_PER_WEEK + 1;
  }
}

/**
 * Check if prestige was unlocked but player chose to skip it last run.
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function hasActivePrestige(state) {
  return state.prestige_bonus !== null;
}

// ─── Bonus Info Display ───────────────────────────────────────────────────────

/**
 * Get display info for the active prestige bonus.
 * Returns null if no bonus is active.
 * @param {string|null} bonusId
 * @returns {{ label: string, description: string, emoji: string, effect_summary: string } | null}
 */
export function getActiveBonusInfo(bonusId) {
  if (!bonusId) return null;
  const opt = PRESTIGE_OPTIONS.find((o) => o.id === bonusId);
  if (!opt) return null;
  return {
    label: opt.label,
    description: opt.description,
    emoji: opt.emoji,
    effect_summary: getBonusEffectSummary(bonusId),
  };
}

/**
 * Get the HUD badge text for active prestige bonus.
 * Short enough to display in one line in the header.
 * @param {string|null} bonusId
 * @returns {string}
 */
export function getPrestigeBadgeText(bonusId) {
  const badges = {
    extra_group: '👷+1',
    cheap_micelij: '🍄×0.5',
    full_forecast: '🌤️×12',
  };
  return badges[bonusId] ?? '';
}

/**
 * Get a motivational message to show on the prestige screen.
 * Varies based on how many total runs have been completed.
 * @param {number} totalRuns
 * @param {number} score
 * @returns {string}
 */
export function getPrestigeMotivationText(totalRuns, score) {
  if (score >= 900) {
    return 'Savršena sezona! Birkom bonusa za sledeći izazov.';
  }
  if (score >= 600) {
    return 'Solidno! Koji bonus će te odvesti do savršenstva?';
  }
  if (totalRuns === 0) {
    return 'Prva sezona za prestižom — odaberi bonus koji ti odgovara.';
  }
  if (totalRuns >= 5) {
    return `Sezona ${totalRuns + 1}. Svaki run unosi novi uvid.`;
  }
  return 'Napredak! Koji bonus u sledećoj sezoni?';
}
