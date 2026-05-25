// highscore.js — Daily highscore with midnight reset

const LS_KEY_SCORE = 'turneja2026_daily_score';
const LS_KEY_DATE = 'turneja2026_daily_date';
const LS_KEY_CITY = 'turneja2026_daily_city';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Check if current score beats daily highscore
 * Resets daily at midnight
 * @param {number} fanBase
 * @param {string} date - ISO date string (optional, defaults to today)
 * @returns {{ isNewRecord: boolean, previousBest: number, today: string }}
 */
export function checkDailyHighscore(fanBase, date) {
  const today = date || getTodayStr();
  const storedDate = localStorage.getItem(LS_KEY_DATE);
  const storedScore = parseInt(localStorage.getItem(LS_KEY_SCORE) || '0', 10);

  if (storedDate !== today) {
    // New day — reset
    return {
      isNewRecord: fanBase > 0,
      previousBest: 0,
      today,
      wasReset: true
    };
  }

  return {
    isNewRecord: fanBase > storedScore,
    previousBest: storedScore,
    today,
    wasReset: false
  };
}

/**
 * Save highscore to localStorage
 * @param {number} fanBase
 * @param {string} city - last city reached
 * @param {string} date - ISO date (optional)
 */
export function saveHighscore(fanBase, city, date) {
  const today = date || getTodayStr();
  const storedDate = localStorage.getItem(LS_KEY_DATE);
  const storedScore = parseInt(localStorage.getItem(LS_KEY_SCORE) || '0', 10);

  // Always update date
  localStorage.setItem(LS_KEY_DATE, today);

  // Only update score if new day or new record
  if (storedDate !== today || fanBase > storedScore) {
    localStorage.setItem(LS_KEY_SCORE, String(fanBase));
    if (city) localStorage.setItem(LS_KEY_CITY, city);
  }
}

/**
 * Load today's highscore
 * @returns {{ score: number, city: string, date: string, isToday: boolean }}
 */
export function loadDailyHighscore() {
  const today = getTodayStr();
  const storedDate = localStorage.getItem(LS_KEY_DATE);

  if (storedDate !== today) {
    return { score: 0, city: '', date: today, isToday: false };
  }

  return {
    score: parseInt(localStorage.getItem(LS_KEY_SCORE) || '0', 10),
    city: localStorage.getItem(LS_KEY_CITY) || '',
    date: today,
    isToday: true
  };
}

/**
 * Format score for display
 */
export function formatScore(score) {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
  return String(score);
}
