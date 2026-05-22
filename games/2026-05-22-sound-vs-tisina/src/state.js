// state.js — centralni game state + save/load
import { GRID_W, GRID_H } from './config.js';

const SAVE_KEY = 'svt_save';

export function createInitialState() {
  return {
    phase: 'menu',
    currentVenue: null,
    currentLevel: 0,
    zones: [],
    heatmap: new Float32Array(GRID_W * GRID_H),
    heatmapBack: new Float32Array(GRID_W * GRID_H),
    neighborSPL: 0,
    happiness: 0,
    complaints: 0,
    lastComplaintTime: -999,
    budget: 0,
    reputation: { audience: 50, neighbor: 50 },
    xp: 0,
    careerLevel: 0,
    gameTime: 0,         // real seconds elapsed
    dynamicEvents: [],
    upgrades: new Set(),
    sessionStats: {
      maxHappiness: 0,
      minNeighborSPL: 999,
      complaints: 0,
      totalTicks: 0
    },
    pendingWin: false
  };
}

export function saveProgress(state) {
  const data = {
    xp: state.xp,
    careerLevel: state.careerLevel,
    currentLevel: state.currentLevel,
    reputation: state.reputation
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage might be unavailable
  }
}

export function loadProgress(state) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.xp === 'number') state.xp = data.xp;
    if (typeof data.careerLevel === 'number') state.careerLevel = data.careerLevel;
    if (typeof data.currentLevel === 'number') state.currentLevel = data.currentLevel;
    if (data.reputation) state.reputation = data.reputation;
  } catch (e) {
    // ignore corrupt save
  }
}

export function resetSessionStats(state) {
  state.sessionStats = {
    maxHappiness: 0,
    minNeighborSPL: 999,
    complaints: 0,
    totalTicks: 0
  };
  state.complaints = 0;
  state.lastComplaintTime = -999;
  state.dynamicEvents = [];
  state.gameTime = 0;
  state.happiness = 0;
  state.neighborSPL = 0;
  state.pendingWin = false;
}
