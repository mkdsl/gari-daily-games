/**
 * @file beatScheduler.js
 * @description Schedules beat krugove iz pesme pattern-a u lookahead prozoru.
 *
 * Radi sa AudioContext.currentTime kao referentnim satom da osigura
 * sinhronizaciju između audio i vizuelnog sloja.
 *
 * Koristi state.schedulerHead da zna do kog trenutka je već schedlovano.
 * Svaki frame main.js poziva scheduleBeatLookahead(state, audioCtx, pattern).
 *
 * @module systems/beatScheduler
 */

import { CONFIG } from '../config.js';
import { createBeatCircle } from '../entities/beatCircle.js';

/**
 * Lookahead prozor u sekundama — koliko unapred scheduler popunjava beats.
 * Mora biti > jedan frame (tipično 0.016s) a manji od BEAT_TRAVEL_TIME.
 */
const LOOKAHEAD = 0.5;

/**
 * @typedef {Object} BeatPattern
 * @property {number} time  - Vreme u sekundama od početka pesme kada beat stigne na timing liniju
 * @property {number} lane  - 0 | 1 | 2
 */

/**
 * Pokreće sve beate iz pattern-a koji padaju unutar lookahead prozora,
 * a nisu već schedlovani (schedulerHead). Dodaje ih u state.activeBeats.
 *
 * @param {import('../state.js').GameState} state
 * @param {AudioContext} audioCtx
 * @param {BeatPattern[]} pattern - Lista svih beatova trenutne pesme
 * @returns {void}
 */
export function scheduleBeatLookahead(state, audioCtx, pattern) {
  const audioNow = audioCtx.currentTime;
  const scheduleUntil = audioNow + CONFIG.BEAT_TRAVEL_TIME + LOOKAHEAD;

  for (const beat of pattern) {
    const absoluteTime = state.songStartTime + beat.time;
    if (absoluteTime > state.schedulerHead && absoluteTime <= scheduleUntil) {
      state.activeBeats.push(createBeatCircle(state.nextBeatId++, beat.lane, absoluteTime));
      if (absoluteTime > state.schedulerHead) {
        state.schedulerHead = absoluteTime;
      }
    }
  }
}

/**
 * Uklanja iz state.activeBeats sve beate koji su davno prošli i više nisu vidljivi
 * (state === 'missed' ili state === 'hit' i hitRingAge > HIT_RING_DURATION).
 *
 * @param {import('../state.js').GameState} state
 * @returns {void}
 */
export function pruneDeadBeats(state) {
  state.activeBeats = state.activeBeats.filter(beat => {
    // Keep all active beats
    if (beat.state === 'active') return true;
    // Keep hit beats while their ring animation is still running
    if (beat.state === 'hit') {
      return beat.hitRingAge < CONFIG.HIT_RING_DURATION;
    }
    // Remove missed beats once they've scrolled well past the timing line
    if (beat.state === 'missed') {
      return beat.visualProgress <= 1.3;
    }
    return false;
  });
}
