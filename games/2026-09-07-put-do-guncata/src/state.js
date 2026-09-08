/** @module state — game state, save/load, computeScore */
import { STORAGE_KEY } from './config.js';

const defaultState = {
  currentStage: 0,
  isRunning: false,
  completedRuns: 0,
  prestigeUnlocked: false,
  isNightMode: false,
  route: null,
  pripremljenost: 50,
  deltas: { d1: 0, d2: 0, d3: 0, d4: 0, d5: 0 },
  scoreBucket: null,
  etapa1: { accuracy: 0, completed: false },
  etapa2: { fuel: 100, eventsCorrect: 0, eventsTotal: 0, moodChanged: false, completed: false },
  etapa3: { route: null, completed: false },
  etapa4: { hitRate: 0, obstaclesTotal: 0, obstaclesAvoided: 0, completed: false },
  etapa5: { completed: false }
};

/** @type {typeof defaultState} */
export let state = JSON.parse(JSON.stringify(defaultState));

/** Reset state to default, preserve completedRuns and prestigeUnlocked */
export function initState() {
  const { completedRuns, prestigeUnlocked } = state;
  state = JSON.parse(JSON.stringify(defaultState));
  state.completedRuns = completedRuns;
  state.prestigeUnlocked = prestigeUnlocked;
}

/** Persist full state to localStorage */
export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

/** Load only persistent fields (completedRuns, prestigeUnlocked) from localStorage */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (typeof saved.completedRuns === 'number') state.completedRuns = saved.completedRuns;
    if (typeof saved.prestigeUnlocked === 'boolean') state.prestigeUnlocked = saved.prestigeUnlocked;
  } catch (_) {}
}

/**
 * @returns {number} clamped 0–100
 */
export function computeScore() {
  const { d1, d2, d3, d4, d5 } = state.deltas;
  return Math.max(0, Math.min(100, 50 + d1 + d2 + d3 + d4 + d5));
}

/**
 * @param {number} score
 * @returns {'green'|'yellow'|'humor'}
 */
export function getScoreBucket(score) {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'humor';
}

/**
 * @param {'d1'|'d2'|'d3'|'d4'|'d5'} key
 * @param {number} value
 */
export function applyDelta(key, value) {
  state.deltas[key] = value;
  state.pripremljenost = computeScore();
}
