// state.js — Game state management, localStorage persistence

import { BUDGET_START } from './config.js';

const LS_KEY = 'turneja2026_state';
const LS_HS_KEY = 'turneja2026_highscore';
const LS_HS_DATE_KEY = 'turneja2026_hs_date';

export function createInitialState() {
  return {
    tourney: {
      budget: BUDGET_START,
      reputation: 50,
      crew_morale: 80,
      fan_base: 0,
      completed_events: [],
      current_city: "",
      current_city_index: -1,
      unlocks: [],
      prestige_mode: false,
      pending_revenue_bonus: 0,
      pending_fan_preboost: 0
    },
    event_state: {
      blocks_done: 0,
      fan_score: 0,
      revenue: 0,
      media_coverage: 0,
      deck: [],
      active_synergies: [],
      dj_tier: 1,
      booking_id: "budget",
      promo_id: "none",
      blocks_results: [],
      random_event: null
    },
    macro_choices: {
      booking: null,
      promo: null,
      crew_action: null
    },
    phase: "START",   // START | TUTORIAL | MACRO | EVENT_INTRO | BLOCK_PHASE | BLOCK_RESULT | EVENT_RESULT | WIN | GAMEOVER
    tutorial_done: false,
    tutorial_step: 0
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch (e) {}
}

export function saveHighscore(fanBase) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = loadHighscore();
    if (fanBase > existing.score || existing.date !== today) {
      // Daily reset: if different date, reset
      const storedDate = localStorage.getItem(LS_HS_DATE_KEY);
      if (storedDate !== today) {
        localStorage.setItem(LS_HS_DATE_KEY, today);
        localStorage.setItem(LS_HS_KEY, String(fanBase));
      } else if (fanBase > existing.score) {
        localStorage.setItem(LS_HS_KEY, String(fanBase));
      }
    }
  } catch (e) {}
}

export function loadHighscore() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const storedDate = localStorage.getItem(LS_HS_DATE_KEY);
    if (storedDate !== today) {
      return { score: 0, date: today, isNew: true };
    }
    const score = parseInt(localStorage.getItem(LS_HS_KEY) || '0', 10);
    return { score, date: today, isNew: false };
  } catch (e) {
    return { score: 0, date: '', isNew: true };
  }
}

// Deep clone state for immutable-style updates
export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
