/**
 * @file deck.js
 * Draft pool logic: draw a hand of 3 Card objects for a given role.
 *
 * Rules enforced:
 *  1. Only cards matching the requested role are considered.
 *  2. Departed cards are excluded permanently.
 *  3. Cards locked by XP gate are excluded unless unlocked.
 *  4. Tier-3 cards are excluded unless tier3Unlocked is true.
 *  5. Budget tier filtering: cards whose cost exceeds available_budget are excluded
 *     UNLESS no affordable alternatives exist (fallback to cheapest).
 *  6. If a retained card exists for this role, it is GUARANTEED to be in the hand
 *     (slot 0), and the remaining 2 slots are filled from the general pool.
 *  7. Hand is shuffled so the retained guarantee is placed randomly.
 *  8. Returns exactly HAND_SIZE cards when possible; may return fewer if the
 *     available pool is smaller (edge case in late tour).
 */

import { HAND_SIZE, ROLES, TIER_COST_RANGES } from '../config.js';
import { Card } from '../entities/card.js';
import { CARDS_DATA } from '../content/cards_data.js';

/**
 * @typedef {import('../entities/card.js').CardData} CardData
 * @typedef {import('../entities/card.js').Card} Card
 * @typedef {import('../state.js').GameState} GameState
 */

// ---------------------------------------------------------------------------
// Seeded pseudo-random (for reproducibility in tests / replays)
// Uses a simple mulberry32 PRNG when a seed is provided.
// ---------------------------------------------------------------------------

/**
 * Create a deterministic PRNG from a seed.
 * @param {number} seed
 * @returns {() => number}  Returns a value in [0, 1)
 */
function makePrng(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle an array in-place using Fisher-Yates with a given PRNG.
 * @template T
 * @param {T[]} arr
 * @param {() => number} rand
 * @returns {T[]}
 */
function shuffleWith(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Tier budget helpers
// ---------------------------------------------------------------------------

/**
 * Determine the maximum tier a player can afford given their budget.
 * Tier 3 additionally requires tier3Unlocked.
 * @param {number} budget
 * @param {boolean} tier3Unlocked
 * @returns {number}  1 | 2 | 3
 */
export function maxAffordableTier(budget, tier3Unlocked) {
  if (tier3Unlocked && budget >= TIER_COST_RANGES[3].min) return 3;
  if (budget >= TIER_COST_RANGES[2].min) return 2;
  return 1;
}

/**
 * Return true if a card is within the budget and tier constraints.
 * @param {CardData} card
 * @param {number} budget
 * @param {boolean} tier3Unlocked
 * @returns {boolean}
 */
export function isCardAffordable(card, budget, tier3Unlocked) {
  if (card.cost > budget) return false;
  if (card.tier === 3 && !tier3Unlocked) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Availability filter
// ---------------------------------------------------------------------------

/**
 * Return true if a card is available for drafting.
 * Checks: not departed, XP unlocked, within budget + tier constraints.
 * @param {CardData} card
 * @param {Object}   opts
 * @param {string[]} opts.departed        IDs of permanently departed cards
 * @param {string[]} opts.unlockedIds     IDs unlocked by XP (from state.unlocked_card_ids)
 * @param {number}   opts.budget
 * @param {boolean}  opts.tier3Unlocked
 * @returns {boolean}
 */
export function isCardAvailable(card, { departed, unlockedIds, budget, tier3Unlocked }) {
  if (departed.includes(card.id)) return false;
  if (card.locked_until_xp > 0 && !unlockedIds.includes(card.id)) return false;
  if (!isCardAffordable(card, budget, tier3Unlocked)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Core draw function
// ---------------------------------------------------------------------------

/**
 * Draw a hand of up to HAND_SIZE Card objects for the given role.
 *
 * @param {string}    role          One of ROLES
 * @param {GameState} state         Current game state
 * @param {Object}    [opts]
 * @param {boolean}   [opts.tier3Unlocked=false]  Whether tier-3 cards are draftable
 * @param {number}    [opts.seed]   Optional PRNG seed for deterministic draws
 * @returns {Card[]}
 */
export function drawHand(role, state, opts = {}) {
  if (!ROLES.includes(role)) {
    throw new Error(`drawHand: unknown role "${role}"`);
  }

  const tier3Unlocked = opts.tier3Unlocked ?? false;
  const rand = opts.seed !== undefined ? makePrng(opts.seed) : Math.random;
  const randFn = typeof rand === 'function' && rand !== Math.random ? rand : () => Math.random();

  const { crew, available_budget, unlocked_card_ids } = state;
  const departed = crew?.departed ?? [];
  const retainedIds = crew?.retained ?? [];

  // All cards for this role
  const rolePool = CARDS_DATA.filter(c => c.role === role);

  // Availability options
  const availOpts = {
    departed,
    unlockedIds: unlocked_card_ids,
    budget: available_budget,
    tier3Unlocked,
  };

  // Filter to available cards
  let availablePool = rolePool.filter(c => isCardAvailable(c, availOpts));

  // Fallback: if nothing is affordable, relax budget constraint and pick cheapest
  if (availablePool.length === 0) {
    availablePool = rolePool
      .filter(c => !departed.includes(c.id))
      .filter(c => c.locked_until_xp === 0 || unlocked_card_ids.includes(c.id))
      .sort((a, b) => a.cost - b.cost)
      .slice(0, HAND_SIZE);
  }

  // Check for a retained card for this role
  const retainedCard = availablePool.find(c => retainedIds.includes(c.id)) ?? null;

  // Non-retained candidates
  const candidates = availablePool.filter(c => c !== retainedCard);

  // Shuffle candidates
  const shuffled = shuffleWith([...candidates], randFn);

  let hand;
  if (retainedCard) {
    // Guarantee retained card is in the hand; fill remaining from shuffled
    const others = shuffled.slice(0, HAND_SIZE - 1);
    // Randomly insert retained into the hand (not always slot 0 visually)
    const combined = [retainedCard, ...others];
    hand = shuffleWith(combined, randFn);
  } else {
    hand = shuffled.slice(0, HAND_SIZE);
  }

  // Convert to Card instances
  return hand.map(c => (c instanceof Card ? c : new Card(c)));
}

/**
 * Build the complete draft pool for all 5 roles at once.
 * Used by main.js to pre-draw the entire event draft.
 *
 * @param {GameState} state
 * @param {Object}    [opts]
 * @param {boolean}   [opts.tier3Unlocked=false]
 * @param {number}    [opts.seed]   Base seed; each role gets seed + role_index
 * @returns {{ [role: string]: Card[] }}
 */
export function buildDraftPool(state, opts = {}) {
  const pool = {};
  ROLES.forEach((role, i) => {
    const roleSeed = opts.seed !== undefined ? opts.seed + i * 1000 : undefined;
    pool[role] = drawHand(role, state, { ...opts, seed: roleSeed });
  });
  return pool;
}

/**
 * Return all cards in the available (non-departed, XP-unlocked) pool
 * regardless of budget, useful for the Codex modal.
 *
 * @param {GameState} state
 * @returns {Card[]}
 */
export function getFullAvailablePool(state) {
  const { crew, unlocked_card_ids } = state;
  const departed = crew?.departed ?? [];
  return CARDS_DATA
    .filter(c => !departed.includes(c.id))
    .filter(c => c.locked_until_xp === 0 || unlocked_card_ids.includes(c.id))
    .map(c => new Card(c));
}
