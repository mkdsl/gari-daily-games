/**
 * @file systems/index.js
 * @description Orchestrator za sve sisteme — poziva ih redom u svakom frame-u.
 *
 * Redosled update-a je bitan:
 *   1. beatScheduler  — dodaj nove beatove iz lookahead prozora
 *   2. beatProgress   — ažuriraj visualProgress za sve aktivne beatove
 *   3. missCheck      — označi beate koji su prošli timing window
 *   4. scoring        — obradi pendingHits niz (input.js puni, ovde praznimo)
 *   5. energy         — ažuriraj energy bar, proveri game over
 *   6. pruneDeadBeats — ukloni beatove koji više nisu vidljivi
 *
 * @module systems/index
 */

import { scheduleBeatLookahead, pruneDeadBeats } from './beatScheduler.js';
import { processHit } from './scoring.js';
import { applyEnergyDelta, checkGameOver } from './energy.js';
import { updateBeatProgress, checkMissed } from '../entities/beatCircle.js';
import { CONFIG } from '../config.js';

/**
 * Glavni update tick za sve sisteme.
 * Poziva se iz main.js svaki frame pre render-a.
 *
 * @param {import('../state.js').GameState} state
 * @param {AudioContext} audioCtx
 * @param {import('../levels/patterns.js').Song} currentSong
 * @param {number[]} pendingHits  - Niz lane indeksa iz input.js (dreniraj ovde)
 * @returns {void}
 */
export function updateSystems(state, audioCtx, currentSong, pendingHits) {
  // TODO: implementirati
  // if (state.gamePhase !== 'playing') return;
  //
  // 1. scheduleBeatLookahead(state, audioCtx, currentSong.beats)
  //
  // 2. const audioNow = audioCtx.currentTime;
  //    for (const beat of state.activeBeats) {
  //      updateBeatProgress(beat, audioNow, CONFIG.BEAT_TRAVEL_TIME);
  //      if (beat.hitRingAge >= 0) beat.hitRingAge += dt;
  //    }
  //
  // 3. for (const beat of state.activeBeats) {
  //      if (beat.state === 'active') checkMissed(beat, audioNow, CONFIG.TIMING_GOOD);
  //    }
  //    Missovi koji su tek postali 'missed' → applyEnergyDelta(state, 'MISS')
  //
  // 4. while (pendingHits.length > 0) {
  //      const lane = pendingHits.shift();
  //      const result = processHit(state, lane, audioNow);
  //      applyEnergyDelta(state, result);
  //    }
  //
  // 5. checkGameOver(state)
  //
  // 6. pruneDeadBeats(state)
}
