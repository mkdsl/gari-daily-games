/**
 * leaderboard-local.js — Stub: localStorage top-3 lista
 * Popunjava polish stage
 */

const KEY = 'gari_ziz_leaderboard_v1';

export function saveScore(score, temaId, season) {
  try {
    const existing = loadScores();
    existing.push({ score, temaId, season, date: new Date().toISOString().slice(0, 10) });
    existing.sort((a, b) => b.score - a.score);
    localStorage.setItem(KEY, JSON.stringify(existing.slice(0, 10)));
  } catch {}
}

export function loadScores() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function getTop3() {
  return loadScores().slice(0, 3);
}
