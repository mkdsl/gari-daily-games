/**
 * @file state.js
 * Singleton game state with save/load via localStorage.
 * All state mutations go through setState() — never mutate the object directly.
 */

import { STORAGE_KEY, STORAGE_META_KEY, ROLES } from './config.js';

/**
 * @typedef {'intro'|'draft'|'resolve'|'crew_update'|'next_event'|'tour_end'} GamePhase
 */

/**
 * @typedef {Object} DraftState
 * @property {number}   current_role_index  0-4
 * @property {Array}    hand                3 Card objects offered for current role
 * @property {Object}   selected            { dj, host, sound, video, security } — null until picked
 */

/**
 * @typedef {Object} CrewState
 * @property {string[]}           retained         card IDs that passed retention
 * @property {{ [id: string]: number }} loyalty_counts  events survived per card
 * @property {string[]}           departed         permanently gone card IDs
 * @property {{ [id: string]: number }} burnout_count  burnout incidents per card
 */

/**
 * @typedef {Object} EventResult
 * @property {number}   score
 * @property {number}   xp_earned
 * @property {number}   budget_bonus
 * @property {string[]} crew_changes
 * @property {Object}   synergy_report
 */

/**
 * @typedef {Object} GameState
 * @property {GamePhase}    phase
 * @property {number}       current_event_index
 * @property {number}       cumulative_xp
 * @property {number}       available_budget
 * @property {number}       previous_budget_bonus
 * @property {DraftState}   draft
 * @property {CrewState}    crew
 * @property {number[]}     event_scores
 * @property {EventResult[]} event_results
 * @property {string[]}     unlocked_card_ids
 * @property {number|null}  tour_score
 * @property {string[]|null} finale_preferred_tags
 * @property {number}       runs_completed
 * @property {number}       best_tour_score
 */

/** @returns {DraftState} */
function freshDraft() {
  const selected = {};
  ROLES.forEach(r => { selected[r] = null; });
  return {
    current_role_index: 0,
    hand: [],
    selected,
  };
}

/** @returns {CrewState} */
function freshCrew() {
  return {
    retained: [],
    loyalty_counts: {},
    departed: [],
    burnout_count: {},
  };
}

/**
 * Build a brand-new game state.
 * @param {number} [runs_completed=0]
 * @param {number} [best_tour_score=0]
 * @returns {GameState}
 */
function buildInitialState(runs_completed = 0, best_tour_score = 0) {
  return {
    phase: 'intro',
    current_event_index: 0,
    cumulative_xp: 0,
    available_budget: 60,
    previous_budget_bonus: 0,
    draft: freshDraft(),
    crew: freshCrew(),
    event_scores: [],
    event_results: [],
    unlocked_card_ids: [],
    tour_score: null,
    finale_preferred_tags: null,
    runs_completed,
    best_tour_score,
  };
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

/** @type {GameState} */
let _state = buildInitialState();

/**
 * Return a shallow clone of the current state.
 * Callers must not mutate the returned object — use setState().
 * @returns {GameState}
 */
export function getState() {
  return Object.assign({}, _state);
}

/**
 * Merge updates into the state and persist to localStorage.
 * Nested objects (draft, crew) are shallow-merged one level deep if provided as objects.
 * For deeper mutations, pass the fully updated sub-object.
 * @param {Partial<GameState>} updates
 * @returns {GameState} updated state reference
 */
export function setState(updates) {
  // Shallow merge top-level keys; for nested objects caller provides the full new sub-object
  _state = Object.assign({}, _state, updates);
  saveToStorage();
  return _state;
}

/**
 * Reset the game state for a new run, preserving meta (runs_completed, best_tour_score).
 * @returns {GameState}
 */
export function resetState() {
  const meta = loadMeta();
  _state = buildInitialState(meta.runs_completed, meta.best_tour_score);
  saveToStorage();
  return _state;
}

// ---------------------------------------------------------------------------
// Draft helpers
// ---------------------------------------------------------------------------

/**
 * Update only draft sub-object (merges shallowly).
 * @param {Partial<DraftState>} draftUpdates
 */
export function updateDraft(draftUpdates) {
  const newDraft = Object.assign({}, _state.draft, draftUpdates);
  setState({ draft: newDraft });
}

/**
 * Set the selected card for a role inside draft.selected.
 * @param {string} role
 * @param {import('./entities/card.js').Card} card
 */
export function selectCardForRole(role, card) {
  const selected = Object.assign({}, _state.draft.selected, { [role]: card });
  updateDraft({ selected });
}

/**
 * Advance draft to the next role index.
 * @returns {number} new current_role_index
 */
export function advanceDraftRole() {
  const next = _state.draft.current_role_index + 1;
  updateDraft({ current_role_index: next, hand: [] });
  return next;
}

// ---------------------------------------------------------------------------
// Crew helpers
// ---------------------------------------------------------------------------

/**
 * Update only crew sub-object (merges shallowly).
 * @param {Partial<CrewState>} crewUpdates
 */
export function updateCrew(crewUpdates) {
  const newCrew = Object.assign({}, _state.crew, crewUpdates);
  setState({ crew: newCrew });
}

/**
 * Increment loyalty count for a card.
 * @param {string} cardId
 */
export function incrementLoyalty(cardId) {
  const counts = Object.assign({}, _state.crew.loyalty_counts);
  counts[cardId] = (counts[cardId] ?? 0) + 1;
  updateCrew({ loyalty_counts: counts });
}

/**
 * Record a burnout incident for a card.
 * @param {string} cardId
 */
export function recordBurnout(cardId) {
  const bo = Object.assign({}, _state.crew.burnout_count);
  bo[cardId] = (bo[cardId] ?? 0) + 1;
  updateCrew({ burnout_count: bo });
}

/**
 * Mark a card as departed (cannot be re-drafted).
 * @param {string} cardId
 */
export function departCard(cardId) {
  if (_state.crew.departed.includes(cardId)) return;
  const departed = [..._state.crew.departed, cardId];
  const retained = _state.crew.retained.filter(id => id !== cardId);
  updateCrew({ departed, retained });
}

/**
 * Mark a card as retained (survived this event).
 * @param {string} cardId
 */
export function retainCard(cardId) {
  if (_state.crew.retained.includes(cardId)) return;
  const retained = [..._state.crew.retained, cardId];
  updateCrew({ retained });
}

// ---------------------------------------------------------------------------
// XP / unlocks
// ---------------------------------------------------------------------------

/**
 * Add XP and trigger any newly unlocked cards.
 * @param {number} amount
 * @param {import('./content/cards_data.js').CardData[]} allCards
 */
export function addXP(amount, allCards) {
  const newXP = _state.cumulative_xp + amount;
  const newUnlocks = allCards
    .filter(c => c.locked_until_xp > 0 &&
                 c.locked_until_xp <= newXP &&
                 !_state.unlocked_card_ids.includes(c.id))
    .map(c => c.id);
  const unlocked_card_ids = [..._state.unlocked_card_ids, ...newUnlocks];
  setState({ cumulative_xp: newXP, unlocked_card_ids });
  return newUnlocks;
}

/**
 * Check whether a card is currently draftable based on XP.
 * @param {string} cardId
 * @param {number} locked_until_xp
 * @returns {boolean}
 */
export function isCardUnlocked(cardId, locked_until_xp) {
  if (locked_until_xp === 0) return true;
  return _state.unlocked_card_ids.includes(cardId);
}

// ---------------------------------------------------------------------------
// Score / results
// ---------------------------------------------------------------------------

/**
 * Append an event score.
 * @param {number} score
 */
export function recordEventScore(score) {
  setState({ event_scores: [..._state.event_scores, score] });
}

/**
 * Append a full event result record.
 * @param {EventResult} result
 */
export function recordEventResult(result) {
  setState({ event_results: [..._state.event_results, result] });
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/**
 * Load meta (runs_completed, best_tour_score) from localStorage.
 * @returns {{ runs_completed: number, best_tour_score: number }}
 */
export function loadMeta() {
  try {
    const raw = localStorage.getItem(STORAGE_META_KEY);
    if (!raw) return { runs_completed: 0, best_tour_score: 0 };
    const parsed = JSON.parse(raw);
    return {
      runs_completed: parsed.runs_completed ?? 0,
      best_tour_score: parsed.best_tour_score ?? 0,
    };
  } catch {
    return { runs_completed: 0, best_tour_score: 0 };
  }
}

/**
 * Save meta to localStorage.
 * @param {{ runs_completed: number, best_tour_score: number }} meta
 */
export function saveMeta(meta) {
  try {
    localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
  } catch {
    // Storage unavailable — silent fail
  }
}

/**
 * Persist current state to localStorage.
 */
export function saveToStorage() {
  try {
    // Serialize Card instances in draft.selected as plain data
    const serializable = JSON.parse(JSON.stringify(_state));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Storage quota or unavailability — silent fail
  }
}

/**
 * Load state from localStorage, falling back to a fresh state.
 * @returns {GameState}
 */
export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return resetState();
    const parsed = JSON.parse(raw);
    // Validate minimal shape
    if (!parsed.phase || parsed.current_event_index === undefined) return resetState();
    _state = parsed;
    return _state;
  } catch {
    return resetState();
  }
}

/**
 * Clear persisted state (used on run-end or manual reset).
 */
export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}

/**
 * Finalize a completed run: update meta, clear run state.
 * @param {number} finalTourScore
 */
export function finalizeRun(finalTourScore) {
  const meta = loadMeta();
  const newMeta = {
    runs_completed: meta.runs_completed + 1,
    best_tour_score: Math.max(meta.best_tour_score, finalTourScore),
  };
  saveMeta(newMeta);
  setState({ tour_score: finalTourScore, phase: 'tour_end', runs_completed: newMeta.runs_completed, best_tour_score: newMeta.best_tour_score });
  clearStorage();
}
