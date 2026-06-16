/**
 * progression.js — Level-up logika, cost formula, rang tracker, streak
 * Park Mapa | Jova jQuery
 */

import { CONFIG } from '../config.js';

/**
 * Get the PT cost to level up a zone from currentLevel to currentLevel+1.
 * ZONE_LEVEL_COSTS = [50, 150, 400, 1000] → max level is 5.
 * currentLevel 1 → cost 50, currentLevel 4 → cost 1000, currentLevel 5+ → Infinity
 * @param {number} currentLevel
 * @returns {number} Cost in PT, or Infinity if already at max
 */
export function getZoneLevelCost(currentLevel) {
  const costs = CONFIG.ZONE_LEVEL_COSTS || [50, 150, 400, 1000];
  if (currentLevel >= costs.length + 1) return Infinity;
  return costs[currentLevel - 1];
}

/**
 * Get the current level of a zone from state.
 * @param {Object} state
 * @param {string} zoneId
 * @returns {number}
 */
export function getZoneLevel(state, zoneId) {
  return state.zones?.[zoneId]?.level || 1;
}

/**
 * Check if the player can afford to level up a zone.
 * @param {Object} state
 * @param {string} zoneId
 * @returns {boolean}
 */
export function canLevelUpZone(state, zoneId) {
  const zone = state.zones?.[zoneId];
  if (!zone) return false;
  const cost = getZoneLevelCost(zone.level);
  if (cost === Infinity) return false;
  return (state.pt || 0) >= cost;
}

/**
 * Level up a zone. Deducts cost, increments level.
 * Mutates state in place.
 * @param {Object} state
 * @param {string} zoneId
 * @returns {boolean} True if successful, false if cannot afford or at max
 */
export function levelUpZone(state, zoneId) {
  const zone = state.zones?.[zoneId];
  if (!zone) return false;

  const cost = getZoneLevelCost(zone.level);
  if (cost === Infinity) return false;
  if ((state.pt || 0) < cost) return false;

  state.pt -= cost;
  state.weeklyPtSpent = (state.weeklyPtSpent || 0) + cost;
  zone.level += 1;
  zone.leveledUpAt = new Date().toISOString();

  return true;
}

/**
 * Get the current Park Legend rank based on totalPtEarned.
 * Returns the highest rank whose min threshold is reached.
 * @param {Object} state
 * @returns {{ name: string, min: number, label?: string }}
 */
export function getParkLegendRank(state) {
  const ranks = CONFIG.PARK_RANKS || [
    { name: 'Prolaznik',    min: 0 },
    { name: 'Redovni',      min: 100 },
    { name: 'Znalac',       min: 500 },
    { name: 'Postaša',      min: 1500 },
    { name: 'Parkovnjak',   min: 5000 },
    { name: 'Legenda Parka', min: 15000 }
  ];

  let current = ranks[0];
  for (const rank of ranks) {
    if ((state.totalPtEarned || 0) >= rank.min) current = rank;
  }
  return current;
}

/**
 * Get progress info towards the next rank.
 * @param {Object} state
 * @returns {{ current: Object, next: Object|null, progress: number }}
 *   progress is [0, 1], where 1 means at or above next threshold.
 */
export function getRankProgress(state) {
  const ranks = CONFIG.PARK_RANKS || [
    { name: 'Prolaznik',    min: 0 },
    { name: 'Redovni',      min: 100 },
    { name: 'Znalac',       min: 500 },
    { name: 'Postaša',      min: 1500 },
    { name: 'Parkovnjak',   min: 5000 },
    { name: 'Legenda Parka', min: 15000 }
  ];

  const earned = state.totalPtEarned || 0;
  let currentIdx = 0;

  for (let i = 0; i < ranks.length; i++) {
    if (earned >= ranks[i].min) currentIdx = i;
  }

  const current = ranks[currentIdx];

  if (currentIdx >= ranks.length - 1) {
    return { current, next: null, progress: 1 };
  }

  const next = ranks[currentIdx + 1];
  const progress = (earned - current.min) / (next.min - current.min);

  return { current, next, progress: Math.min(1, Math.max(0, progress)) };
}

/**
 * Update the daily visit streak.
 * Increments state.totalDaysVisited if last visit was yesterday.
 * Resets streak to 1 if last visit was 2+ days ago.
 * Updates lastVisitDate to today.
 * Mutates state in place.
 * @param {Object} state
 */
export function updateDailyStreak(state) {
  const today = new Date().toISOString().slice(0, 10);

  if (state.lastVisitDate === today) {
    // Already visited today — no change needed
    return;
  }

  if (state.lastVisitDate) {
    const last = new Date(state.lastVisitDate + 'T00:00:00Z');
    const now = new Date(today + 'T00:00:00Z');
    const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day — extend streak
      state.totalDaysVisited = (state.totalDaysVisited || 1) + 1;
    } else {
      // Gap in visits — reset streak
      state.totalDaysVisited = 1;
    }
  } else {
    // First visit ever
    state.totalDaysVisited = 1;
  }

  state.lastVisitDate = today;
}
