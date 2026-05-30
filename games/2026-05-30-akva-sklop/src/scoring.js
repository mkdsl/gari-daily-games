/**
 * scoring.js - Akva-Sklop
 * Weekly and final score calculations.
 */

import {
  RANK_LABELS,
  DIFFICULTY,
  SCORE_NO_DUCKS_CAP,
  PH_SCORE_IDEAL_MIN,
  PH_SCORE_IDEAL_MAX,
  PH_SCORE_OK_LOW_MIN,
  PH_SCORE_OK_LOW_MAX,
  PH_SCORE_OK_HI_MIN,
  PH_SCORE_OK_HI_MAX,
  PH_SCORE_IDEAL_VAL,
  PH_SCORE_OK_VAL,
  PH_SCORE_BAD_VAL,
} from './config.js';

// ---------------------------------------------------------------------------
// pH health
// ---------------------------------------------------------------------------

/**
 * Map a pH value to a 0-100 health score.
 * @param {number} pH
 * @returns {number}
 */
export function calcPHHealth(pH) {
  if (pH >= PH_SCORE_IDEAL_MIN && pH <= PH_SCORE_IDEAL_MAX) {
    return PH_SCORE_IDEAL_VAL;
  }

  if (pH >= PH_SCORE_OK_LOW_MIN && pH < PH_SCORE_OK_LOW_MAX) {
    const t = (pH - PH_SCORE_OK_LOW_MIN) / (PH_SCORE_OK_LOW_MAX - PH_SCORE_OK_LOW_MIN);
    return Math.round(PH_SCORE_OK_VAL + t * (PH_SCORE_IDEAL_VAL - PH_SCORE_OK_VAL));
  }

  if (pH > PH_SCORE_OK_HI_MIN && pH <= PH_SCORE_OK_HI_MAX) {
    const t = (pH - PH_SCORE_OK_HI_MIN) / (PH_SCORE_OK_HI_MAX - PH_SCORE_OK_HI_MIN);
    return Math.round(PH_SCORE_IDEAL_VAL - t * (PH_SCORE_IDEAL_VAL - PH_SCORE_OK_VAL));
  }

  if (pH >= 5.5 && pH < PH_SCORE_OK_LOW_MIN) {
    const t = (pH - 5.5) / (PH_SCORE_OK_LOW_MIN - 5.5);
    return Math.round(t * PH_SCORE_OK_VAL);
  }

  if (pH > PH_SCORE_OK_HI_MAX && pH <= 9.5) {
    const t = (pH - PH_SCORE_OK_HI_MAX) / (9.5 - PH_SCORE_OK_HI_MAX);
    return Math.round(PH_SCORE_OK_VAL - t * PH_SCORE_OK_VAL);
  }

  return PH_SCORE_BAD_VAL;
}

// ---------------------------------------------------------------------------
// Weekly score
// ---------------------------------------------------------------------------

/**
 * Calculate the weekly eco-score (0-100).
 * Weights: water 30%, pH 30%, species 40%.
 * @param {object} state
 * @returns {number}
 */
export function calcWeekScore(state) {
  const lakeIds = ['A', 'B', 'C'];

  const waterScores = lakeIds.map(id => {
    const lake = state.lakes[id];
    if (lake.capacity <= 0) return 0;
    return (lake.level / lake.capacity) * 100;
  });
  const waterScore = waterScores.reduce((a, b) => a + b, 0) / lakeIds.length;

  const pHScores = lakeIds.map(id => calcPHHealth(state.lakes[id].pH));
  const pHScore  = pHScores.reduce((a, b) => a + b, 0) / lakeIds.length;

  const healthValues = [];
  for (const id of lakeIds) {
    const lake = state.lakes[id];
    if (lake.fish > 0 || lake.capacity > 0) healthValues.push(lake.fishHealth);
    if (lake.ducks > 0 || lake.capacity > 0) healthValues.push(lake.duckHealth);
  }
  const speciesScore = healthValues.length > 0
    ? healthValues.reduce((a, b) => a + b, 0) / healthValues.length
    : 100;

  let score = 0.30 * waterScore + 0.30 * pHScore + 0.40 * speciesScore;

  const totalDucks = lakeIds.reduce((sum, id) => sum + (state.lakes[id].ducks || 0), 0);
  if (totalDucks === 0) {
    score = Math.min(score, SCORE_NO_DUCKS_CAP);
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

// ---------------------------------------------------------------------------
// Final score
// ---------------------------------------------------------------------------

/**
 * Determine rank entry for a score.
 * @param {number} score
 * @returns {{ min:number, label:string, emoji:string }}
 */
export function getRank(score) {
  for (const rank of RANK_LABELS) {
    if (score >= rank.min) return rank;
  }
  return RANK_LABELS[RANK_LABELS.length - 1];
}

/**
 * Calculate final run score.
 * @param {Array} weeklyScores
 * @param {object} difficultyObj
 * @returns {{ score:number, rank:object, label:string, emoji:string }}
 */
export function calcFinalScore(weeklyScores, difficultyObj) {
  if (!weeklyScores || weeklyScores.length === 0) {
    const rank = getRank(0);
    return { score: 0, rank, label: rank.label, emoji: rank.emoji };
  }

  const multiplier = difficultyObj && difficultyObj.multiplier != null
    ? difficultyObj.multiplier : 1.0;
  const avg = weeklyScores.reduce((sum, w) => sum + (w.score || 0), 0) / weeklyScores.length;
  const raw = avg * multiplier;
  const score = Math.round(Math.min(100, Math.max(0, raw)));

  const rank = getRank(score);
  return { score, rank, label: rank.label, emoji: rank.emoji };
}
