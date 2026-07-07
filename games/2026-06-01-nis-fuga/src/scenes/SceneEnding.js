/**
 * SceneEnding.js — Ending computation and dispatch
 * Listens for game_ending event and orchestrates ending screen display
 * @module SceneEnding
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';
import { computeEnding } from '../engine/ResourceManager.js';
import GameState from '../utils/GameState.js';

/**
 * Force trigger an ending computation and emit
 * (Used when dialog action === 'ending')
 */
export function triggerEnding() {
  const result = computeEnding();
  GameState.setEnding(result.endingId);
  EventBus.emit(EVENTS.GAME_ENDING, {
    endingId: result.endingId,
    score: result.score,
    endingData: result.endingData
  });
}

/**
 * Get ending title for display purposes
 * @param {string} endingId
 * @returns {string}
 */
export function getEndingTitle(endingId) {
  const titles = {
    legendarno: 'Legendarno jutro',
    solidno: 'Solidno jutro',
    proslo_nekako: 'Prošlo je nekako',
    chaos: 'Chaos morning',
    hard_fail: 'Nismo stigli',
    secret_s1: 'Svi te vole, ekipa te mrzi',
    secret_s2: 'Niš nas je primio'
  };
  return titles[endingId] ?? 'Nepoznato';
}

export default { triggerEnding, getEndingTitle };
