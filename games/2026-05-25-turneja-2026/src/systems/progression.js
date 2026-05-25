// progression.js — State progression after blocks and events

import { WIN_TARGET, MORALE_GAMEOVER, CITIES, PROMO_OPTIONS, CREW_ACTIONS, BOOKING_TIERS } from '../config.js';
import { scoreTotalEvent, applyBacklineBonus, getDjTier } from './scoring.js';

/**
 * Apply a block result to event_state
 * @param {Object} state - full game state (mutates event_state)
 * @param {Object} blockResult - { fan_gain, revenue_gain, media_gain, morale_delta, fan_base_direct }
 */
export function applyBlockResult(state, blockResult) {
  const es = state.event_state;

  es.fan_score = Math.max(0, (es.fan_score || 0) + blockResult.fan_gain);
  es.revenue = Math.max(0, (es.revenue || 0) + blockResult.revenue_gain);
  es.media_coverage = Math.max(0, (es.media_coverage || 0) + blockResult.media_gain);
  es.blocks_done = (es.blocks_done || 0) + 1;

  // Morale is on tourney level
  state.tourney.crew_morale = Math.max(0, Math.min(100,
    (state.tourney.crew_morale || 50) + blockResult.morale_delta
  ));

  // Direct fan_base from DJ+Video synergy
  if (blockResult.fan_base_direct) {
    state.tourney.fan_base = (state.tourney.fan_base || 0) + blockResult.fan_base_direct;
  }

  // Store block result for post-event display
  if (!es.blocks_results) es.blocks_results = [];
  es.blocks_results.push(blockResult);
}

/**
 * Apply event (3 blocks done) result back to tourney state
 * @param {Object} state - full game state (mutates tourney)
 */
export function applyEventResult(state) {
  const es = state.event_state;
  const t = state.tourney;

  // Apply backline bonus if purchased
  let revenue = es.revenue || 0;
  if (t.pending_revenue_bonus) {
    revenue = applyBacklineBonus(revenue, true);
    t.pending_revenue_bonus = 0;
  }

  // Add revenue to budget
  t.budget = (t.budget || 0) + revenue;

  // Add fans to fan_base
  t.fan_base = (t.fan_base || 0) + (es.fan_score || 0);

  // Media → reputation (media coverage 50+ = +5 rep, 100+ = +10 rep)
  const media = es.media_coverage || 0;
  if (media >= 100) t.reputation = Math.min(100, t.reputation + 10);
  else if (media >= 50) t.reputation = Math.min(100, t.reputation + 5);

  // Successful event morale bonus
  if (es.fan_score >= 500) {
    t.crew_morale = Math.min(100, t.crew_morale + 15);
  }

  // Fan preboost carry-over (Host+Video synergy)
  if (t.pending_fan_preboost) {
    t.fan_base += t.pending_fan_preboost;
    t.pending_fan_preboost = 0;
  }

  // Mark city as completed
  const cityIndex = t.current_city_index;
  if (!t.completed_events) t.completed_events = [];
  t.completed_events.push({
    city: t.current_city,
    fan_score: es.fan_score,
    revenue,
    media
  });

  // Prestige mode unlock: after 3 completed events with rep >= 70
  if (t.completed_events.length >= 3 && t.reputation >= 70) {
    t.prestige_mode = true;
  }
}

/**
 * Reset event_state for next event
 * @param {Object} state
 * @param {Object} macroChoices - { booking_id, promo_id, crew_action_id }
 */
export function prepareNextEvent(state, macroChoices) {
  const t = state.tourney;

  // Apply macro costs
  if (macroChoices.booking_id) {
    const booking = BOOKING_TIERS.find(b => b.id === macroChoices.booking_id);
    if (booking) {
      t.budget = Math.max(0, t.budget - booking.cost);
      t.crew_morale = Math.min(100, t.crew_morale + booking.moraleBonus);
    }
  }

  if (macroChoices.promo_id) {
    const promo = PROMO_OPTIONS.find(p => p.id === macroChoices.promo_id);
    if (promo) {
      t.budget = Math.max(0, t.budget - promo.cost);
      if (promo.fanPre) {
        t.pending_fan_preboost = (t.pending_fan_preboost || 0) + promo.fanPre;
      }
    }
  }

  if (macroChoices.crew_action_id) {
    const action = CREW_ACTIONS.find(a => a.id === macroChoices.crew_action_id);
    if (action) {
      t.budget = Math.max(0, t.budget - action.cost);
      if (action.moraleBonus) {
        t.crew_morale = Math.min(100, t.crew_morale + action.moraleBonus);
      }
      if (action.revenueBonus) {
        t.pending_revenue_bonus = action.revenueBonus;
      }
    }
  }

  // Reset event_state
  state.event_state = {
    blocks_done: 0,
    fan_score: 0,
    revenue: 0,
    media_coverage: 0,
    deck: [],
    active_synergies: [],
    dj_tier: getDjTier(macroChoices.booking_id || 'budget'),
    booking_id: macroChoices.booking_id || 'budget',
    promo_id: macroChoices.promo_id || 'none',
    blocks_results: [],
    random_event: null
  };

  // Reset macro choices
  state.macro_choices = { booking: null, promo: null, crew_action: null };
}

/**
 * Advance to next city
 * @returns {boolean} true if there is a next city
 */
export function advanceToNextCity(state) {
  const idx = (state.tourney.current_city_index || 0) + 1;
  if (idx >= CITIES.length) return false;
  state.tourney.current_city_index = idx;
  state.tourney.current_city = CITIES[idx].id;
  return true;
}

/**
 * Check win/lose conditions
 * @param {Object} state
 * @returns {"win" | "partial_win" | "gameover_budget" | "gameover_morale" | null}
 */
export function checkWin(state) {
  const t = state.tourney;

  // Lose conditions
  if (t.crew_morale <= MORALE_GAMEOVER) return 'gameover_morale';
  if (t.budget <= 0) return 'gameover_budget';

  // Win: all 5 cities completed
  if (t.completed_events.length >= CITIES.length) {
    if (t.fan_base >= WIN_TARGET) return 'win';
    return 'partial_win';
  }

  return null;
}
