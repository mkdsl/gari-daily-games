/** @module main — entry point, game loop, event wiring */

import { createInitialState, saveState, loadState, applyResourceDelta, resetForPrestige } from './state.js';
import { renderScreen, initRoot, updateBudgetPreview } from './render.js';
import { on, emit } from './input.js';
import { CREW_MAP, ALL_CREW, hasDJing, totalDailyRate } from './entities/crew_member.js';
import { CITY_MAP } from './entities/city.js';
import { drawCards, resolveOption, computeEffectDelta } from './systems/decision_engine.js';
import { calcRepGain, applyRepGain } from './systems/reputation.js';
import { crewMoodDecay, applyMoodDelta } from './systems/crew_mood.js';
import { totalCityReachGain, addReach } from './systems/reach.js';
import { rollBorderIncident, checkViralMoment, rollEquipmentRisk, rollCrowdSurge } from './systems/random_events.js';
import { splitTotal, deductCrewCost, transportAllocEffects, techAllocCQ, promoMult, promoReachGain } from './systems/budget.js';
import { createProgression, currentCityId, advanceCity, checkGuncatiGate } from './systems/progression.js';
import { accumulateFanDB, performPrestige, createPrestigeState } from './systems/prestige.js';
import { CARDS_PER_CITY, BORDER_EXTRA_COST, BORDER_EXTRA_MOOD } from './config.js';
import { evaluateEnding } from './content/endings.js';
import { rollCrowd } from './entities/city.js';
import { pickVenueForCity } from './entities/venue.js';
import { shareResult } from './share.js';
import { toast } from './ui.js';
import { sfxClick, sfxCrowdCheer, sfxWin, sfxFail, sfxBorderCrossing } from './audio.js';
import { CARD_MAP } from './content/cards.js';

/** @type {import('./state.js').GameState} */
let state;

function setState(next) {
  state = next;
  saveState(state);
  renderScreen(state);
}

// ---- INIT ----
export function init() {
  initRoot();

  const saved = loadState();
  state = createInitialState();
  state._hasSave = !!saved;
  renderScreen(state);
  wireEvents();
}

// ---- EVENT WIRING ----
function wireEvents() {
  on('new_game', () => {
    state = createInitialState();
    state._hasSave = false;
    setState({ ...state, screen: 'routing' });
  });

  on('continue_game', () => {
    const saved = loadState();
    if (saved) {
      state = saved;
      state._hasSave = false;
      renderScreen(state);
    }
  });

  on('route_selected', (route) => {
    setState({ ...state, route, city_index: 0, screen: 'crew_select' });
  });

  on('toggle_crew', (crew_id) => {
    const selected = new Set(state.selected_crew_ids);
    if (selected.has(crew_id)) {
      selected.delete(crew_id);
    } else {
      if (selected.size >= 5) {
        toast('Maksimum 5 članova!', 'warn');
        return;
      }
      selected.add(crew_id);
    }
    setState({ ...state, selected_crew_ids: [...selected] });
  });

  on('crew_confirmed', () => {
    const crew = state.selected_crew_ids.map(id => CREW_MAP.get(id)).filter(Boolean);
    if (crew.length < 2) { toast('Minimum 2 člana!', 'warn'); return; }
    if (!hasDJing(crew)) { toast('Obavezan je member sa DJ skill-om!', 'error'); return; }
    setState({ ...state, screen: 'city_budget', budget_split: { transport: 0, promo: 0, tech: 0 } });
  });

  on('budget_slider', ({ key, value }) => {
    const split = { ...state.budget_split, [key]: value };
    const total = splitTotal(split);
    if (total > state.resources.budget) {
      // Clamp this slider
      split[key] = Math.max(0, state.resources.budget - splitTotal({ ...split, [key]: 0 }));
    }
    state = { ...state, budget_split: split };
    updateBudgetPreview(split, state.resources.budget);
  });

  on('budget_confirmed', () => {
    startCityEvent();
  });

  on('card_option_chosen', ({ card_id, option }) => {
    handleCardOption(card_id, option);
  });

  on('card_option', (option) => {
    // Keyboard shortcut
    const idx = state.card_outcomes.length;
    if (idx < state.drawn_card_ids.length) {
      const card_id = state.drawn_card_ids[idx];
      handleCardOption(card_id, option);
    }
  });

  on('go_transit', () => {
    doTransit();
  });

  on('city_arrived', () => {
    setState({ ...state, screen: 'city_budget', budget_split: { transport: 0, promo: 0, tech: 0 }, border_incident: null });
  });

  on('go_ending', () => {
    const ending_id = evaluateEnding(state.resources);
    const new_prestige = accumulateFanDB(state.prestige, state.city_results, ending_id);
    setState({ ...state, ending_id, prestige: new_prestige, screen: 'ending' });
  });

  on('prestige', () => {
    setState({ ...state, screen: 'prestige' });
  });

  on('prestige_start', () => {
    const { new_resources, new_prestige } = performPrestige(state.prestige, state.resources, state.ending_id);
    const newState = resetForPrestige(state, new_resources);
    newState.prestige = new_prestige;
    setState(newState);
  });

  on('restart', () => {
    const prestige = state.prestige;
    state = createInitialState();
    state.prestige = prestige;
    state._hasSave = false;
    setState({ ...state, screen: 'routing' });
  });

  on('share', () => {
    shareResult(state);
  });
}

// ---- CITY EVENT ----
function startCityEvent() {
  const city_id = state.route[state.city_index];
  const city = CITY_MAP.get(city_id);
  const split = state.budget_split;
  const crew = state.selected_crew_ids.map(id => CREW_MAP.get(id)).filter(Boolean);

  // Deduct costs
  let budget = state.resources.budget;
  const crew_cost = totalDailyRate(crew);
  budget -= crew_cost;
  budget -= splitTotal(split);

  // Sarajevo border
  let border_incident = null;
  if (city.border) {
    const result = rollBorderIncident();
    sfxBorderCrossing();
    budget -= result.extra_cost;
    let mood_delta = result.extra_mood;
    if (result.incident) {
      if (result.incident.effects.budget) budget += result.incident.effects.budget;
      if (result.incident.effects.crew_mood) mood_delta += result.incident.effects.crew_mood;
    }
    border_incident = result;
    state = applyResourceDelta(state, { budget: -(state.resources.budget - budget), crew_mood: mood_delta });
  } else {
    state = applyResourceDelta(state, { budget: -(state.resources.budget - budget) });
  }

  // Draw cards
  const drawn = drawCards(city_id, [], CARDS_PER_CITY);
  const drawn_ids = drawn.map(c => c.id);

  setState({
    ...state,
    border_incident,
    drawn_card_ids: drawn_ids,
    card_outcomes: [],
    current_card_index: 0,
    screen: 'cards',
  });
}

// ---- CARD OPTION HANDLER ----
function handleCardOption(card_id, option_key) {
  const card = CARD_MAP.get(card_id);
  if (!card) return;

  const opt_index = { A: 0, B: 1, C: 2 }[option_key];
  const option = card.options[opt_index];
  if (!option) return;

  const resolved_effects = resolveOption(option);
  const crew = state.selected_crew_ids.map(id => CREW_MAP.get(id)).filter(Boolean);
  const delta = computeEffectDelta(state, resolved_effects, crew);

  const outcome = { card_id, chosen_option: option_key, resolved_effects };
  const outcomes = [...state.card_outcomes, outcome];

  // Apply resource delta
  let newState = applyResourceDelta(state, {
    budget: delta.budget,
    crew_mood: delta.crew_mood,
    reputation: delta.reputation,
    reach: delta.reach,
  });

  newState = {
    ...newState,
    card_outcomes: outcomes,
    current_card_index: outcomes.length,
    next_city_mood_penalty: newState.next_city_mood_penalty + (delta.next_city_crew_mood || 0),
  };

  // All cards resolved?
  if (outcomes.length >= newState.drawn_card_ids.length) {
    // Compute city results
    newState = computeCityResults(newState);
  } else {
    setState(newState);
  }
}

// ---- CITY RESULTS ----
function computeCityResults(newState) {
  const city_id = newState.route[newState.city_index];
  const city = CITY_MAP.get(city_id);
  const crew = newState.selected_crew_ids.map(id => CREW_MAP.get(id)).filter(Boolean);
  const split = newState.budget_split;

  // Crowd
  const base_crowd = rollCrowd(city.crowd_min, city.crowd_max);
  const attendance = Math.round(base_crowd * rollCrowdSurge(city.risk));

  // CQ: start at 5, add transport/tech effects, add crew skills, add card bonuses
  let cq = 5.0;
  const transport_eff = transportAllocEffects(split.transport || 0);
  cq += transport_eff.cq;
  const tech_cq = techAllocCQ(split.tech || 0);
  cq += tech_cq;
  // Equipment risk
  const equip = rollEquipmentRisk(city.risk, split.tech || 0);
  cq += equip.cq_penalty;
  // Crew djing bonus
  const djing_bonus = crew.reduce((s, m) => s + (m.skills.djing || 0) * 1.0, 0);
  cq += djing_bonus * 0.3;
  // Crew visual bonus
  const visual_bonus = crew.reduce((s, m) => s + (m.skills.visual || 0) * 0.8, 0);
  cq += visual_bonus * 0.2;
  // Card cq bonuses
  const card_cq = newState.card_outcomes.reduce((s, o) => s + (o.resolved_effects.cq_bonus || 0), 0);
  cq += card_cq;
  // Venue
  const venue = pickVenueForCity(city);
  cq += venue.cq_bonus;

  cq = Math.max(0, Math.min(10, cq));

  // Rep gain
  const card_rep_bonus = newState.card_outcomes.reduce((s, o) => s + (o.resolved_effects.reputation || 0), 0);
  const rep_gain = calcRepGain(cq, newState.resources.crew_mood, city.rep_mult, 0); // cards already applied
  const new_rep = applyRepGain(newState.resources.reputation, rep_gain);

  // Reach
  const card_reach = newState.card_outcomes.reduce((s, o) => s + (o.resolved_effects.reach || 0), 0);
  const promo_reach = promoReachGain(split.promo || 0);
  const crew_social_reach = crew.reduce((s, m) => s + (m.skills.social || 0) * 1.5, 0);
  const total_reach_gain = promo_reach + crew_social_reach + card_reach;
  const new_reach = addReach(newState.resources.reach, total_reach_gain);

  // Viral check
  const viral = checkViralMoment(new_reach, cq);
  const viral_reach = viral.viral ? viral.reach_bonus : 0;

  const city_result = {
    city_id,
    attendance,
    crowd_quality: cq,
    rep_gain,
    budget_delta: -(totalDailyRate(crew) + splitTotal(split)),
  };

  const finalState = {
    ...newState,
    resources: {
      ...newState.resources,
      reputation: new_rep,
      reach: Math.min(50, new_reach + viral_reach),
    },
    city_results: [...newState.city_results, city_result],
    screen: 'results',
    border_incident: newState.border_incident || null,
  };

  setState(finalState);
}

// ---- TRANSIT ----
function doTransit() {
  const crew = state.selected_crew_ids.map(id => CREW_MAP.get(id)).filter(Boolean);
  const mood_decay = crewMoodDecay(crew);
  const mood_penalty = state.next_city_mood_penalty || 0;
  const new_mood = applyMoodDelta(state.resources.crew_mood, mood_decay + mood_penalty);

  const next_index = state.city_index + 1;
  setState({
    ...state,
    city_index: next_index,
    resources: { ...state.resources, crew_mood: new_mood },
    next_city_mood_penalty: 0,
    card_outcomes: [],
    drawn_card_ids: [],
    current_card_index: 0,
    border_incident: null,
    screen: 'transit',
  });
}
