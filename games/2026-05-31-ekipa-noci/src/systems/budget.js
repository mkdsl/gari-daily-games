/**
 * @file budget.js
 * Budget and tier management:
 *  - Compute available budget for an event
 *  - Filter cards by affordable tiers
 *  - Deduct card cost from budget
 *  - Validate a full draft pick list against total budget
 */

import {
  TIER_COST_RANGES,
  getBracket,
  isTier3Unlocked,
  SCORE_BRACKETS,
} from '../config.js';
import { getState, setState } from '../state.js';

/**
 * @typedef {import('../entities/card.js').Card} Card
 * @typedef {import('../state.js').GameState} GameState
 * @typedef {import('../content/events_data.js').EventData} EventData
 */

// ---------------------------------------------------------------------------
// Budget computation
// ---------------------------------------------------------------------------

/**
 * Compute the available budget for the upcoming event.
 * Budget = event.base_budget + previous_budget_bonus accumulated in state.
 *
 * @param {EventData}  eventData
 * @param {GameState}  state
 * @returns {number}
 */
export function computeEventBudget(eventData, state) {
  return eventData.base_budget + (state.previous_budget_bonus ?? 0);
}

/**
 * Compute the budget bonus earned from an event score.
 * @param {number} eventScore
 * @returns {number}
 */
export function computeBudgetBonus(eventScore) {
  return getBracket(eventScore).budget_bonus;
}

/**
 * Return the tiers available for drafting given the current budget and
 * whether tier 3 was unlocked by the previous event.
 *
 * @param {number}  budget
 * @param {boolean} tier3Unlocked
 * @returns {number[]}  e.g. [1, 2] or [1, 2, 3]
 */
export function availableTiers(budget, tier3Unlocked) {
  const tiers = [1];
  if (budget >= TIER_COST_RANGES[2].min) tiers.push(2);
  if (tier3Unlocked && budget >= TIER_COST_RANGES[3].min) tiers.push(3);
  return tiers;
}

/**
 * Return the maximum tier the current budget supports.
 * @param {number}  budget
 * @param {boolean} tier3Unlocked
 * @returns {number}
 */
export function maxTier(budget, tier3Unlocked) {
  const tiers = availableTiers(budget, tier3Unlocked);
  return tiers[tiers.length - 1];
}

// ---------------------------------------------------------------------------
// Card filtering by budget
// ---------------------------------------------------------------------------

/**
 * Filter a list of cards to those affordable within the budget
 * and allowed by tier constraints.
 *
 * @param {Card[]}  cards
 * @param {number}  budget
 * @param {boolean} tier3Unlocked
 * @returns {Card[]}
 */
export function filterByBudget(cards, budget, tier3Unlocked) {
  return cards.filter(card => {
    if (card.cost > budget) return false;
    if (card.tier === 3 && !tier3Unlocked) return false;
    return true;
  });
}

/**
 * Filter cards by exact tier.
 * @param {Card[]}  cards
 * @param {number}  tier
 * @returns {Card[]}
 */
export function filterByTier(cards, tier) {
  return cards.filter(c => c.tier === tier);
}

/**
 * Given a card pool, return only the most budget-friendly option per role
 * (used as a fallback when budget is extremely tight).
 * @param {Card[]}  cards
 * @returns {Card|null}
 */
export function cheapestCard(cards) {
  if (cards.length === 0) return null;
  return cards.reduce((min, c) => c.cost < min.cost ? c : min, cards[0]);
}

// ---------------------------------------------------------------------------
// Cost deduction
// ---------------------------------------------------------------------------

/**
 * Deduct a card's cost from the state's available_budget.
 * Validates that the budget is sufficient; throws if not (should never happen
 * if deck.js filtered correctly).
 *
 * @param {Card}      card
 * @param {GameState} state    Current state (read)
 * @returns {number}  New available_budget value
 */
export function deductCardCost(card, state) {
  const newBudget = state.available_budget - card.cost;
  if (newBudget < 0) {
    // Defensive — deck.js should have filtered this card out
    console.warn(`[budget] Overdraft: ${card.name} costs ${card.cost}, budget was ${state.available_budget}`);
  }
  setState({ available_budget: Math.max(0, newBudget) });
  return Math.max(0, newBudget);
}

/**
 * Deduct costs for all 5 selected cards in the draft.
 * Called once after the full draft is complete.
 *
 * @param {{ [role: string]: Card }} selected  draft.selected object
 * @param {GameState} state
 * @returns {number}  Remaining budget after all deductions
 */
export function deductDraftCosts(selected, state) {
  const cards = Object.values(selected).filter(Boolean);
  const totalCost = cards.reduce((sum, c) => sum + c.cost, 0);
  const newBudget = Math.max(0, state.available_budget - totalCost);
  setState({ available_budget: newBudget });
  return newBudget;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate that a proposed team (5 selected cards) fits within the budget.
 * @param {{ [role: string]: Card }} selected
 * @param {number} budget
 * @returns {{ valid: boolean, total_cost: number, over_by: number }}
 */
export function validateDraftBudget(selected, budget) {
  const cards = Object.values(selected).filter(Boolean);
  const total_cost = cards.reduce((sum, c) => sum + c.cost, 0);
  const over_by = Math.max(0, total_cost - budget);
  return { valid: over_by === 0, total_cost, over_by };
}

/**
 * Return the remaining budget if the player picks the given card
 * without committing to it (for UI preview).
 * @param {Card}   card
 * @param {number} currentBudget
 * @returns {number}
 */
export function previewRemainingBudget(card, currentBudget) {
  return Math.max(0, currentBudget - card.cost);
}

/**
 * Check whether a card is affordable at the current budget.
 * @param {Card}   card
 * @param {number} budget
 * @returns {boolean}
 */
export function canAfford(card, budget) {
  return card.cost <= budget;
}

/**
 * Compute how much budget remains after a draft given selected cards and starting budget.
 * @param {{ [role: string]: Card|null }} selected
 * @param {number} startingBudget
 * @returns {number}
 */
export function remainingBudget(selected, startingBudget) {
  const spent = Object.values(selected)
    .filter(Boolean)
    .reduce((sum, c) => sum + c.cost, 0);
  return Math.max(0, startingBudget - spent);
}

/**
 * Compute budget bonus awarded from a score bracket and carry it
 * forward by updating previous_budget_bonus in state.
 * @param {number} eventScore
 */
export function applyBudgetBonus(eventScore) {
  const bonus = computeBudgetBonus(eventScore);
  const state = getState();
  setState({
    previous_budget_bonus: (state.previous_budget_bonus ?? 0) + bonus,
  });
  return bonus;
}
