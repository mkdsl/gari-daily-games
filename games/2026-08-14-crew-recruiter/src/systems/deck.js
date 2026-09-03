// systems/deck.js — Deck creation, shuffle, draw

import { createCard } from '../entities/card.js';
import { KLUB_CARDS } from '../content/cards_klub.js';
import { OUTDOOR_CARDS, GUNCATI_GRAND_CARDS } from '../content/cards_outdoor.js';
import { INTIMATE_CARDS } from '../content/cards_intimate.js';

/**
 * Fisher-Yates shuffle (in-place).
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a full deck for the given event type.
 * Outdoor and Intimate include all Klub cards plus their signature cards.
 * Outdoor with ≥6 completed runs also includes Guncati Grand Finale bonus cards.
 * @param {string} eventType
 * @param {number} [completedRuns=0]
 * @returns {import('../entities/card.js').Card[]}
 */
export function createDeck(eventType, completedRuns = 0) {
  const defs = [...KLUB_CARDS];
  if (eventType === 'outdoor')  defs.push(...OUTDOOR_CARDS);
  if (eventType === 'outdoor' && completedRuns >= 6) defs.push(...GUNCATI_GRAND_CARDS);
  if (eventType === 'intimate') defs.push(...INTIMATE_CARDS);

  const cards = defs.map(def => createCard(def));
  return shuffle(cards);
}

/**
 * Draw n cards from state.deck into state.hand.
 * Shuffles graveyard back if deck is exhausted.
 * @param {number} n
 * @param {import('../state.js').GameState} state
 * @returns {import('../entities/card.js').Card[]} newly drawn cards
 */
export function drawCards(n, state) {
  const drawn = [];
  for (let i = 0; i < n; i++) {
    if (state.deck.length === 0) {
      // recycle graveyard
      if (state.graveyard.length === 0) break;
      state.deck = shuffle([...state.graveyard]);
      state.graveyard = [];
    }
    const card = state.deck.pop();
    if (card) {
      state.hand.push(card);
      drawn.push(card);
    }
  }
  return drawn;
}
