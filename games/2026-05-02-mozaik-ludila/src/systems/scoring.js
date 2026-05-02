/**
 * scoring.js — Score formula i combo sistem za Mozaik Ludila.
 *
 * Formula za jedan move (iz GDD sekcija 2):
 *
 *   placement_bonus = broj_plocica_fragmenta × SCORE_PLACEMENT_BONUS
 *   base_match_score = matchedCount × SCORE_PER_TILE
 *   perfect_bonuses = (perfects.rows × SCORE_PERFECT_ROW)
 *                   + (perfects.cols × SCORE_PERFECT_COL)
 *                   + (perfects.quads × SCORE_PERFECT_QUAD)
 *   combo_multiplier = COMBO_MULTIPLIERS[min(combo_count, COMBO_MAX)]
 *
 *   raw_score = placement_bonus + (base_match_score + perfect_bonuses) × combo_multiplier
 *   total_score += raw_score
 *
 * VAŽNO: placement_bonus se NE množi sa combo_multiplier.
 * Samo match score (base + perfect bonuses) se množi.
 *
 * Combo sistem:
 *   Posle svakog poteza:
 *     Ako matchedCount > 0:
 *       combo_count += 1
 *       combo_multiplier = min(combo_count, COMBO_MAX)
 *     Else:
 *       combo_count = 0
 *       combo_multiplier = 1
 */

import {
  SCORE_PER_TILE, SCORE_PLACEMENT_BONUS,
  SCORE_PERFECT_ROW, SCORE_PERFECT_COL, SCORE_PERFECT_QUAD,
  SCORE_WIN, COMBO_MULTIPLIERS, COMBO_MAX,
  COMBO_PULSE_DURATION, COMBO_TEXT_DURATION, COMBO_MIN_FOR_PULSE,
} from '../config.js';

/**
 * Primenjuje score za jedan potez i ažurira state.
 * Muta state.score, state.combo, state.stats i state.animations.
 *
 * @param {import('../state.js').GameState} state
 * @param {number} matchedCount — broj matched pločica u ovom potezu
 * @param {{ rows: number, cols: number, quads: number }} perfects — savršeni red/kolona/kvadrant
 * @param {number} placedTileCount — broj pločica postavljenog fragmenta
 */
export function applyScore(state, matchedCount, perfects, placedTileCount) {
  // --- Placement bonus (ne množi se comboom) ---
  const placementBonus = (placedTileCount ?? 0) * SCORE_PLACEMENT_BONUS;

  // --- Match score ---
  const baseMatchScore = matchedCount * SCORE_PER_TILE;
  const perfectBonus = (perfects.rows ?? 0) * SCORE_PERFECT_ROW
                     + (perfects.cols ?? 0) * SCORE_PERFECT_COL
                     + (perfects.quads ?? 0) * SCORE_PERFECT_QUAD;

  // --- Combo ažuriranje ---
  if (matchedCount > 0) {
    state.combo = Math.min(state.combo + 1, COMBO_MAX);
  } else {
    state.combo = 0;
  }

  // Combo multiplier: COMBO_MULTIPLIERS[0] = 1 (nema komboa), COMBO_MULTIPLIERS[1] = 1 (×1), itd.
  const comboIdx = Math.min(state.combo, COMBO_MULTIPLIERS.length - 1);
  const comboMultiplier = COMBO_MULTIPLIERS[comboIdx];

  // --- Finalni score ovog poteza ---
  const matchScore = (baseMatchScore + perfectBonus) * comboMultiplier;
  const rawScore = placementBonus + matchScore;
  state.score += rawScore;

  // --- Stats ažuriranje ---
  if (matchedCount > 0) {
    state.stats.totalMatches += matchedCount;
    state.stats.maxCombo = Math.max(state.stats.maxCombo, state.combo);
  }
  state.stats.totalMoves = (state.stats.totalMoves ?? 0) + 1;

  // --- Combo vizualni feedback ---
  if (state.combo >= 2) {
    const comboText = `COMBO ×${comboMultiplier}!`;
    state.animations.comboText = {
      text: comboText,
      timer: COMBO_TEXT_DURATION,
      maxTimer: COMBO_TEXT_DURATION,
    };

    if (state.combo >= COMBO_MIN_FOR_PULSE) {
      state.animations.comboPulse = COMBO_PULSE_DURATION;
    }
  }

  // --- Win check ---
  if (state.score >= SCORE_WIN && state.gamePhase === 'playing') {
    state.gamePhase = 'won';
    if (!state.animations.winReveal) {
      state.animations.winReveal = { timer: 2000, maxTimer: 2000 };
    }
  }

  return rawScore;
}

/**
 * Izračunava postotak do win condition za prikaz u progress bar-u.
 * @param {number} score
 * @returns {number} vrednost od 0.0 do 1.0
 */
export function getWinProgress(score) {
  return Math.min(score / SCORE_WIN, 1.0);
}
