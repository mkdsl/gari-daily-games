/**
 * deck.js — Upravljanje špilom karata: shuffle, draw, discard.
 *
 * @typedef {import('../config.js').CardDef} CardDef
 * @typedef {import('../state.js').GameState} GameState
 */

import { CONFIG } from '../config.js';

/**
 * Fisher-Yates shuffle — mijenja niz in-place i vraća ga.
 * @param {CardDef[]} deck
 * @returns {CardDef[]}
 */
export function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Vuče CONFIG.HAND_SIZE karata iz deck-a u ruku.
 * Ako je deck prazan (ili nedovoljno karata), prethodno baca sve iz discard-a nazad
 * u deck i shuffle-uje ga, pa nastavlja vučenje.
 * Nikad ne dodaje više od CONFIG.HAND_SIZE ukupno u ruku.
 * @param {GameState} state
 */
export function drawHand(state) {
  const needed = CONFIG.HAND_SIZE - state.hand.length;
  if (needed <= 0) return;

  for (let drawn = 0; drawn < needed; drawn++) {
    // Ako je deck prazan, refill iz discarda
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break; // Nema više karata — izlazi
      state.deck = shuffleDeck(state.discard);
      state.discard = [];
    }
    state.hand.push(state.deck.shift());
  }
}

/**
 * Prebaci sve karte iz ruke u discard. Ruka postaje prazna.
 * @param {GameState} state
 */
export function discardHand(state) {
  state.discard.push(...state.hand);
  state.hand = [];
}

/**
 * Dodaje kartu u dno deck-a (bez shuffle-a).
 * Koristi se kada igrač bira reward kartu.
 * @param {GameState} state
 * @param {CardDef} card
 */
export function addCardToDeck(state, card) {
  state.deck.push(card);
}
