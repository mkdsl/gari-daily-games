/**
 * state.js — State shape i persistence za Kartaški Front.
 *
 * Sve što živi u state-u:
 *   phase        — string enum iz CONFIG.PHASES
 *   node         — trenutni čvor (1–4)
 *   player       — HP, shield, energy, effects, nextAttackBonus
 *   enemy        — HP, maxHp, shield, effects, intentIndex, def (ref na EnemyDef)
 *   deck         — array CardDef objekata (neiskorišćene karte)
 *   hand         — array CardDef objekata (karte u ruci, max 5)
 *   discard      — array CardDef objekata (odigrane karte)
 *   stats        — totalDamageDealt, totalCardsPlayed, roundsPlayed
 *
 * @typedef {import('./config.js').CardDef} CardDef
 *
 * @typedef {{
 *   name: string,
 *   type: string,
 *   value: number,
 *   duration: number
 * }} ActiveEffect
 *
 * @typedef {{
 *   hp: number,
 *   maxHp: number,
 *   shield: number,
 *   energy: number,
 *   effects: ActiveEffect[],
 *   nextAttackBonus: number
 * }} PlayerState
 *
 * @typedef {{
 *   hp: number,
 *   maxHp: number,
 *   shield: number,
 *   effects: ActiveEffect[],
 *   intentIndex: number,
 *   def: import('./config.js').EnemyDef | null
 * }} EnemyState
 *
 * @typedef {{
 *   version: number,
 *   phase: string,
 *   node: number,
 *   player: PlayerState,
 *   enemy: EnemyState,
 *   deck: CardDef[],
 *   hand: CardDef[],
 *   discard: CardDef[],
 *   rewardOptions: CardDef[],
 *   stats: { totalDamageDealt: number, totalCardsPlayed: number, roundsPlayed: number }
 * }} GameState
 */

import { CONFIG } from './config.js';
import { shuffleDeck } from './systems/deck.js';

const SAVE_VERSION = 2;

/**
 * Kreira svježi game state za novi run.
 * Deck = kopija STARTER_DECK, shufflovan.
 * Phase = MAP (igrač odmah bira čvor).
 * @returns {GameState}
 */
export function createState() {
  /** @type {CardDef[]} */
  const deck = shuffleDeck([...CONFIG.STARTER_DECK]);

  return {
    version: SAVE_VERSION,
    phase: CONFIG.PHASES.MAP,
    node: 0, // povećava se na 1 kad igrač klikne na čvor 1

    player: {
      hp: CONFIG.PLAYER_MAX_HP,
      maxHp: CONFIG.PLAYER_MAX_HP,
      shield: 0,
      energy: CONFIG.PLAYER_ENERGY_PER_TURN,
      effects: [],          // ActiveEffect[]
      nextAttackBonus: 0,   // Taktika karta akumulira bonus za sledeći napad
    },

    enemy: {
      hp: 0,
      maxHp: 0,
      shield: 0,
      effects: [],
      intentIndex: 0,
      def: null,
    },

    deck,
    hand: [],
    discard: [],

    rewardOptions: [], // popunjava se u REWARD fazi

    stats: {
      totalDamageDealt: 0,
      totalCardsPlayed:  0,
      roundsPlayed:      0,
    },
  };
}

/**
 * Sačuvaj state u localStorage.
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota ili private mode — tiho ignorišemo
  }
}

/**
 * Učitaj state iz localStorage.
 * Vraća null ako nema save-a ili je verzija nekompatibilna.
 * @returns {GameState | null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== SAVE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Obriši save iz localStorage (na kraju runa ili restart-u).
 */
export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}
