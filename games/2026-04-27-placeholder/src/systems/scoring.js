/**
 * @file scoring.js
 * @description Scoring sistem — ocenjuje udare i ažurira score/combo/multiplier.
 *
 * Ulazna tačka je processHit(state, lane, audioNow) koja se poziva iz main.js
 * kada igrač tapne lane (keyboard ili touch).
 *
 * Logika:
 *  1. Pronađi najbliži 'active' beat u zadatoj lani
 *  2. Izračunaj |hitTime - scheduledTime|
 *  3. Klasifikuj: PERFECT (≤ TIMING_PERFECT) / GOOD (≤ TIMING_GOOD) / MISS
 *  4. Ažuriraj score, combo, multiplier, energy u state
 *  5. Vrati string rezultat
 *
 * @module systems/scoring
 */

import { CONFIG } from '../config.js';

/**
 * @typedef {'PERFECT'|'GOOD'|'MISS'} HitResult
 */

/**
 * Pronalazi najbliži aktivni beat u datoj lani.
 * Vraća null ako nema aktivnih beatova u toj lani.
 *
 * @param {import('../state.js').GameState} state
 * @param {number} lane - 0 | 1 | 2
 * @param {number} audioNow - AudioContext.currentTime
 * @returns {import('../entities/beatCircle.js').BeatCircle|null}
 */
export function findClosestBeat(state, lane, audioNow) {
  let closest = null;
  let closestDelta = Infinity;

  for (const beat of state.activeBeats) {
    if (beat.lane !== lane || beat.state !== 'active') continue;
    const delta = Math.abs(beat.scheduledTime - audioNow);
    if (delta < closestDelta) {
      closestDelta = delta;
      closest = beat;
    }
  }

  return closest;
}

/**
 * Klasifikuje hit na osnovu vremenskog odstupanja.
 *
 * @param {number} delta - Apsolutna razlika u sekundama
 * @returns {HitResult}
 */
export function classifyHit(delta) {
  if (delta <= CONFIG.TIMING_PERFECT) return 'PERFECT';
  if (delta <= CONFIG.TIMING_GOOD)    return 'GOOD';
  return 'MISS';
}

/**
 * Glavni ulaz scoring sistema. Poziva se pri svakom igrač tapnu.
 * Menja state in-place i vraća HitResult.
 *
 * @param {import('../state.js').GameState} state
 * @param {number} lane      - 0 | 1 | 2
 * @param {number} audioNow  - AudioContext.currentTime u trenutku tapa
 * @returns {HitResult}
 */
export function processHit(state, lane, audioNow) {
  const beat = findClosestBeat(state, lane, audioNow);
  if (!beat) return 'MISS';

  const delta = Math.abs(audioNow - beat.scheduledTime);
  const result = classifyHit(delta);

  if (result === 'MISS') {
    // Too far outside timing window — don't consume the beat
    return 'MISS';
  }

  beat.state = 'hit';
  beat.hitResult = result;
  beat.hitRingAge = 0;

  _applyScoring(state, result);

  return result;
}

/**
 * Ažurira score, combo i multiplier u state na osnovu rezultata udara.
 *
 * @param {import('../state.js').GameState} state
 * @param {HitResult} result
 * @returns {void}
 */
function _applyScoring(state, result) {
  if (result === 'PERFECT') {
    state.score += CONFIG.SCORE_PERFECT * state.multiplier;
    state.combo++;
    state.nightSummary.perfectCount++;
    state.nightSummary.scoreGained += CONFIG.SCORE_PERFECT * state.multiplier;
  } else if (result === 'GOOD') {
    state.score += CONFIG.SCORE_GOOD * state.multiplier;
    state.combo++;
    state.nightSummary.goodCount++;
    state.nightSummary.scoreGained += CONFIG.SCORE_GOOD * state.multiplier;
  } else {
    state.combo = 0;
    state.multiplier = 1;
    state.nightSummary.missCount++;
    return;
  }

  // Recompute multiplier after combo increment
  state.multiplier = Math.min(
    CONFIG.MULTIPLIER_MAX,
    1 + Math.floor(state.combo / CONFIG.COMBO_PER_MULTIPLIER)
  );

  // Track max combo
  if (state.combo > state.nightSummary.maxCombo) {
    state.nightSummary.maxCombo = state.combo;
  }
}
