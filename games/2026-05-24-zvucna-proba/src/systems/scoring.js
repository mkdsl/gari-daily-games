// scoring.js — Scoring formula, streak
import { GAME_CONFIG } from '../config.js';

/**
 * Calculate round score.
 * @param {object} params
 * @param {boolean} params.diagnosisCorrect
 * @param {boolean} params.correctionCorrect
 * @param {number}  params.elapsed   - ms used
 * @param {number}  params.total     - ms allowed
 * @param {number}  params.streak    - current streak before this round
 * @param {boolean} params.noTimeBonus - boss round 6 flag
 */
export function calcRoundScore({ diagnosisCorrect, correctionCorrect, elapsed, total, streak, noTimeBonus }) {
  let base = GAME_CONFIG.BASE_MISS;

  if (diagnosisCorrect && correctionCorrect) {
    base = GAME_CONFIG.BASE_CORRECT;
  } else if (diagnosisCorrect) {
    base = GAME_CONFIG.BASE_DIAG_ONLY;
  }

  let timeBonus = 0;
  if (base > 0 && !noTimeBonus && total > 0) {
    const remaining = Math.max(0, total - elapsed);
    timeBonus = Math.floor((remaining / total) * GAME_CONFIG.TIME_BONUS_MAX);
  }

  const streakMult = Math.min(
    GAME_CONFIG.STREAK_MULTIPLIER_CAP,
    1.0 + streak * GAME_CONFIG.STREAK_MULTIPLIER_STEP
  );

  const total_score = Math.round((base + timeBonus) * streakMult);

  return {
    base,
    timeBonus,
    streakMult,
    total: total_score,
    breakdown: `Base: ${base}  +  Bonus: ${timeBonus}  ×  ${streakMult.toFixed(1)}`,
  };
}

/**
 * Update streak based on outcome.
 */
export function updateStreak(currentStreak, success) {
  if (success) return currentStreak + 1;
  return 0;
}
