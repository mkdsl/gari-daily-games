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
  if (state.gamePhase !== 'playing') return;

  const audioNow = audioCtx.currentTime;

  // 1. Schedule new beats from lookahead window
  scheduleBeatLookahead(state, audioCtx, currentSong.beats);

  // 2. Update visual progress and hit ring age for all beats
  for (const beat of state.activeBeats) {
    updateBeatProgress(beat, audioNow, CONFIG.BEAT_TRAVEL_TIME);
    if (beat.hitRingAge >= 0) {
      beat.hitRingAge += 0.016; // ~60fps delta approximation
    }
  }

  // 3. Check for misses (beats that passed timing window without being hit)
  const newMisses = [];
  for (const beat of state.activeBeats) {
    if (beat.state === 'active') {
      const wasMissed = checkMissed(beat, audioNow, CONFIG.TIMING_GOOD);
      if (wasMissed) newMisses.push(beat);
    }
  }

  // 4. Process player-input hits
  while (pendingHits.length > 0) {
    const lane = pendingHits.shift();
    const result = processHit(state, lane, audioNow);
    state.lastHitResult = result;
    state.lastHitTime = performance.now();
    applyEnergyDelta(state, result);
  }

  // 5. Apply energy penalty for auto-misses
  for (const _ of newMisses) {
    applyEnergyDelta(state, 'MISS');
  }

  // 6. Check game over
  checkGameOver(state);

  // 7. Remove dead beats from active list
  pruneDeadBeats(state);
}
