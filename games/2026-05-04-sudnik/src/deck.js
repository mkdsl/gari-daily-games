// src/deck.js — Deck management system (GDD §2, §7)
// Definiše starter deck, shuffle/draw/discard mehanike i "Odbaci i Povuci" logiku.

import { CONFIG } from './config.js';

/**
 * Starter deck definicija — 10 karata koje svaka sesija počinje (GDD §2).
 * @type {Object[]}
 */
export const STARTER_CARDS = [
  { id: 'c01', name: 'Tragovi na mestu zločina', type: 'dokaz',    value: +2, effect: null },
  { id: 'c02', name: 'Svedok koji je video sve',  type: 'svedok',   value: +2, effect: null },
  { id: 'c03', name: 'Nedostatak alibi-ja',        type: 'zakon',    value: +3, effect: null },
  { id: 'c04', name: 'Čist dosije',                type: 'karakter', value: -2, effect: null },
  { id: 'c05', name: 'Sumnjivi motiv',             type: 'dokaz',    value: +1, effect: null },
  { id: 'c06', name: 'Nepouzdani svedok',          type: 'svedok',   value: -1, effect: null },
  { id: 'c07', name: 'Tehnička greška u istrazi',  type: 'zakon',    value: -3, effect: null },
  { id: 'c08', name: 'Pozajmljeni predmeti',       type: 'dokaz',    value: +1, effect: null },
  { id: 'c09', name: 'Porodične veze',             type: 'karakter', value: -2, effect: null },
  { id: 'c10', name: 'Emocionalni apel',           type: 'karakter', value: +1, effect: 'vlast_minus2' }
];

/**
 * Gradi novi starter deck (deep copy shuffled) za novu sesiju.
 * @returns {Object[]} Shufflovani niz od 10 karata
 */
export function buildStarterDeck() {
  return shuffle(STARTER_CARDS.map(c => ({ ...c })));
}

/**
 * Fisher-Yates shuffle (in-place).
 * @param {Object[]} arr
 * @returns {Object[]} Isti niz, shufflovan
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Vuče `count` karata iz state.deck u state.hand.
 * Ako deck nema dovoljno karata, reshufflovati discardPile u deck pre vuče.
 * Karte koje su odigrane u trenutnom slučaju (state.currentCase.playedCards) se
 * NE vraćaju u deck pri reshufflu — ostaju van sve do kraja slučaja.
 *
 * @param {Object} state — game state (menja state.deck, state.hand, state.discardPile)
 * @param {number} count — broj karata za vuču
 */
export function drawCards(state, count) {
  let drawn = 0;
  while (drawn < count) {
    if (state.deck.length === 0) {
      reshuffleDiscard(state);
      // Ako posle reshufflovanja i dalje nema karata, nema više šta da se vuče
      if (state.deck.length === 0) break;
    }
    const card = state.deck.splice(0, 1)[0];
    state.hand.push(card);
    drawn++;
  }
}

/**
 * Reshufflovati discardPile u deck.
 * Karte iz currentCase.playedCards se isključuju (ostaju van).
 * @param {Object} state
 */
export function reshuffleDiscard(state) {
  // ID-jevi odigranih karata u trenutnom slučaju — ne smeju ući nazad u deck
  const playedIds = new Set(
    (state.currentCase?.playedCards ?? []).map(c => c.id)
  );

  // Filtriraj discardPile — zadrži samo karte koje NISU odigrane u ovom slučaju
  const toReshuffle = state.discardPile.filter(c => !playedIds.has(c.id));
  const toKeep      = state.discardPile.filter(c =>  playedIds.has(c.id));

  // Pomeri filtrirane karte u deck i shuffluj
  state.deck = shuffle([...state.deck, ...toReshuffle]);
  state.discardPile = toKeep;
}

/**
 * "Odbaci i Povuci" mehanika (GDD §7).
 * Odbacuje karte sa datim ID-jevima iz ruke, vuče isti broj novih.
 * Postavlja state.currentCase.discardUsed = true.
 *
 * @param {Object} state — game state
 * @param {string[]} cardIds — ID-jevi karata za odbacivanje (1 ili 2)
 */
export function discardAndDraw(state, cardIds) {
  const idSet = new Set(cardIds);
  const toDiscard = state.hand.filter(c => idSet.has(c.id));
  state.hand = state.hand.filter(c => !idSet.has(c.id));

  // Odbačene karte idu u discardPile
  state.discardPile.push(...toDiscard);

  // Vuci isti broj karata
  drawCards(state, toDiscard.length);

  state.currentCase.discardUsed = true;
}

/**
 * Premešta sve preostale karte iz ruke i odigrane karte u discardPile posle presude.
 * @param {Object} state
 */
export function discardHand(state) {
  const discardIds = new Set(state.discardPile.map(c => c.id));

  // Dodaj karte iz ruke koje nisu već u discardPile
  for (const card of state.hand) {
    if (!discardIds.has(card.id)) {
      state.discardPile.push(card);
      discardIds.add(card.id);
    }
  }
  state.hand = [];

  // Dodaj odigrane karte koje nisu već u discardPile
  // (može biti duplikat od reshuffleDiscard koji nije filtrirao ove ID-jeve)
  if (state.currentCase?.playedCards?.length > 0) {
    for (const card of state.currentCase.playedCards) {
      const baseCard = { id: card.id, name: card.name, value: card.value, type: card.type, effect: card.effect };
      if (!discardIds.has(card.id)) {
        state.discardPile.push(baseCard);
        discardIds.add(card.id);
      }
    }
    state.currentCase.playedCards = [];
  }
}
