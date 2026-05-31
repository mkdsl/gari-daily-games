/**
 * @file progression.js
 * Reputation XP update, unlock triggers, event advance.
 * Orchestrates: scoring → budget bonus → XP → unlocks → crew update → next event setup.
 */

import {
  getBracket,
  isTier3Unlocked,
  ROLES,
} from '../config.js';
import {
  getState,
  setState,
  addXP,
  recordEventScore,
  recordEventResult,
} from '../state.js';
import { applyBudgetBonus } from './budget.js';
import { processCrewUpdate } from './crew.js';
import { CARDS_DATA } from '../content/cards_data.js';
import { EVENTS_DATA, getEventByIndex } from '../content/events_data.js';
import { seededFinaleTagPick } from './grand_finale.js';

/**
 * @typedef {import('../entities/card.js').Card} Card
 * @typedef {import('../state.js').GameState} GameState
 * @typedef {import('../systems/scoring.js').ScoreBreakdown} ScoreBreakdown
 * @typedef {import('../systems/crew.js').CrewUpdateResult} CrewUpdateResult
 */

/**
 * @typedef {Object} ProgressionResult
 * @property {number}          event_score
 * @property {string}          bracket_label
 * @property {number}          xp_earned
 * @property {number}          new_cumulative_xp
 * @property {string[]}        newly_unlocked_cards  Card IDs just unlocked by this XP gain
 * @property {number}          budget_bonus
 * @property {number}          new_budget
 * @property {CrewUpdateResult} crew_update
 * @property {boolean}         is_last_event
 * @property {number|null}     next_event_index      null if tour ended
 * @property {string|null}     next_event_name
 * @property {boolean}         tier3_unlocked_next   Whether tier 3 is available next event
 */

// ---------------------------------------------------------------------------
// Next-event bonus handling (dj_zara special ability)
// ---------------------------------------------------------------------------

/**
 * Scan ability_results for any cards that have a next_event_bonus queued.
 * @param {Object[]} abilityResults  From ScoreBreakdown.ability_results
 * @returns {number}  Total bonus to apply to next event's base score
 */
function extractNextEventBonus(abilityResults) {
  return abilityResults.reduce((sum, r) => sum + (r.next_event_bonus ?? 0), 0);
}

// ---------------------------------------------------------------------------
// Main progression function
// ---------------------------------------------------------------------------

/**
 * Resolve one event: award XP, apply budget bonus, process crew, set up next event.
 * This is the single orchestration call main.js makes after scoring.
 *
 * @param {ScoreBreakdown}              scoreBreakdown  From scoring.calcEventScore()
 * @param {{ [role: string]: Card }}    selected        draft.selected
 * @returns {ProgressionResult}
 */
export function resolveEvent(scoreBreakdown, selected) {
  const state = getState();
  const { event_score, synergy_report, ability_results, bracket_label } = scoreBreakdown;
  const current_event_index = state.current_event_index;
  const is_last_event = current_event_index >= EVENTS_DATA.length - 1;

  // 1. Record score
  recordEventScore(event_score);

  // 2. Award XP
  const bracket = getBracket(event_score);
  const xp_earned = bracket.xp_earned;
  const newly_unlocked_cards = addXP(xp_earned, CARDS_DATA);

  // 3. Apply budget bonus
  const budget_bonus = applyBudgetBonus(event_score);

  // 4. Collect any next-event bonuses from abilities (e.g. dj_zara)
  const next_event_score_bonus = extractNextEventBonus(ability_results ?? []);

  // 5. Process crew retention
  const crew_update = processCrewUpdate(selected, event_score, synergy_report);

  // 6. Build event result record
  const eventResult = {
    score: event_score,
    xp_earned,
    budget_bonus,
    crew_changes: crew_update.flavor_lines,
    synergy_report,
    bracket_label,
    next_event_score_bonus,
  };
  recordEventResult(eventResult);

  // 7. Determine next event
  const next_event_index = is_last_event ? null : current_event_index + 1;
  const next_event_data = next_event_index !== null ? getEventByIndex(next_event_index) : null;

  // 8. Tier 3 check for next event
  const tier3_unlocked_next = isTier3Unlocked(event_score);

  // 9. If this was the last event, leave advancement to tour.js
  //    Otherwise update state to advance
  if (!is_last_event && next_event_index !== null) {
    advanceToNextEvent(next_event_index, next_event_data, tier3_unlocked_next, next_event_score_bonus);
  } else if (is_last_event) {
    setState({ phase: 'tour_end' });
  }

  const refreshedState = getState();

  return {
    event_score,
    bracket_label,
    xp_earned,
    new_cumulative_xp: refreshedState.cumulative_xp,
    newly_unlocked_cards,
    budget_bonus,
    new_budget: refreshedState.available_budget,
    crew_update,
    is_last_event,
    next_event_index,
    next_event_name: next_event_data?.name ?? null,
    tier3_unlocked_next,
  };
}

/**
 * Set up state for the next event:
 *  - Advance current_event_index
 *  - Compute new available_budget
 *  - Set finale_preferred_tags if entering E5
 *  - Apply any queued next_event_score_bonus (stored for scoring to consume)
 *  - Reset draft
 *  - Set phase to 'draft'
 *
 * @param {number}   nextIndex
 * @param {Object}   nextEventData
 * @param {boolean}  tier3Unlocked
 * @param {number}   nextEventScoreBonus  Bonus from abilities like dj_zara
 */
export function advanceToNextEvent(nextIndex, nextEventData, tier3Unlocked, nextEventScoreBonus = 0) {
  const state = getState();

  // Compute new budget
  const new_budget = nextEventData.base_budget + (state.previous_budget_bonus ?? 0);

  // Grand Finale: seed preferred tags
  let finale_preferred_tags = state.finale_preferred_tags;
  if (nextEventData.event_number === 5 && !finale_preferred_tags) {
    const seed = buildFinaleSeed(state);
    finale_preferred_tags = seededFinaleTagPick(seed);
  }

  // Reset draft selected map
  const freshSelected = {};
  ROLES.forEach(r => { freshSelected[r] = null; });

  setState({
    current_event_index: nextIndex,
    available_budget: new_budget,
    finale_preferred_tags,
    phase: 'draft',
    draft: {
      current_role_index: 0,
      hand: [],
      selected: freshSelected,
    },
    // Store bonus for scoring.js to read on next event
    _next_event_score_bonus: nextEventScoreBonus,
    // Track tier3 availability
    _tier3_unlocked: tier3Unlocked,
  });
}

/**
 * Build the numeric seed for Grand Finale tag randomization.
 * Seed = date integer (YYYYMMDD) XOR cumulative XP.
 * @param {GameState} state
 * @returns {number}
 */
function buildFinaleSeed(state) {
  // Use today's date as a base
  const today = new Date();
  const dateInt = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return (dateInt ^ (state.cumulative_xp | 0)) >>> 0;
}

// ---------------------------------------------------------------------------
// Unlock trigger
// ---------------------------------------------------------------------------

/**
 * Check if any new cards became unlocked after XP was added.
 * addXP() already handles this internally; this helper is for external queries.
 * @param {number} currentXP
 * @returns {string[]}  Card IDs that are now unlockable
 */
export function getUnlockableCardIds(currentXP) {
  return CARDS_DATA
    .filter(c => c.locked_until_xp > 0 && c.locked_until_xp <= currentXP)
    .map(c => c.id);
}

/**
 * Return XP needed to unlock the next locked card, or null if all are unlocked.
 * @param {number} currentXP
 * @returns {number|null}
 */
export function xpToNextUnlock(currentXP) {
  const locked = CARDS_DATA
    .filter(c => c.locked_until_xp > currentXP)
    .map(c => c.locked_until_xp);
  if (locked.length === 0) return null;
  return Math.min(...locked) - currentXP;
}
