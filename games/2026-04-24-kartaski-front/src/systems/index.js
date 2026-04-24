/**
 * systems/index.js — Re-export svih sistema za Kartaški Front.
 *
 * main.js importuje sisteme odavde radi konzistentnosti.
 * Svaki sistem je zasebni modul — ova datoteka samo wire-uje.
 */

export { shuffleDeck, drawHand, discardHand, addCardToDeck } from './deck.js';
export { addEffect, getEffectValue, getEffectDuration, applyDoT, tickEffects, applyEndOfTurnEffects } from './effects.js';
export { applyCard, endPlayerTurn, applyEnemyIntent, checkCombatEnd, applyEnemyEndOfTurn } from './combat.js';
export { startBattle, nextNode, getRewardCards, calculateScore, getNodeLabel } from './progression.js';

/**
 * Stub updateSystems — Kartaški Front je turn-based, nema rAF update loop.
 * Akcije se pokraju kroz event callbackove u input.js.
 * Ova funkcija ostaje prazna radi kompatibilnosti sa main.js skeleton-om.
 * @param {import('../state.js').GameState} _state
 * @param {*} _input
 * @param {number} _dt
 */
export function updateSystems(_state, _input, _dt) {
  // Turn-based igra — nema kontinuirane fizike. No-op.
}
