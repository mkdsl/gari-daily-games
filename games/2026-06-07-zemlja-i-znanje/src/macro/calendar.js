/**
 * calendar.js — Nedeljni prikaz sezone, slot-ovi za sesije
 */

import { getCurrentSeason } from './weather.js';

/**
 * Kreira calendar za sezonu
 * @param {number} seasonNumber
 * @param {number} totalDays
 */
export function createSeasonCalendar(seasonNumber, totalDays = 1) {
  const season = getCurrentSeason();
  return {
    seasonNumber,
    season,
    totalDays,
    completedDays: 0,
    sessions: [],
    startDate: new Date().toISOString().slice(0, 10)
  };
}

/**
 * Vraca display naziv sezone
 */
export function getSeasonLabel(seasonNumber, prestigeLevel = 0) {
  const labels = ['Proleće', 'Leto', 'Jesen', 'Zima', 'Kasna Zima'];
  const cycle = prestigeLevel > 0 ? ` (Ciklus ${prestigeLevel + 1})` : '';
  return `Sezona ${seasonNumber}${cycle}`;
}

/**
 * Vraca progress sezone (0-1)
 */
export function getSeasonProgress(calendar) {
  if (!calendar.totalDays) return 0;
  return calendar.completedDays / calendar.totalDays;
}
