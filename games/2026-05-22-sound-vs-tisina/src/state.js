// Game state management

const SAVE_KEY = 'svt_save';

export function createInitialState() {
  return {
    phase: 'menu',
    currentVenue: null,
    currentLevel: 0,
    zones: [],
    heatmap: new Float32Array(100 * 60),
    heatmapBack: new Float32Array(100 * 60), // double buffer
    neighborSPL: 0,
    happiness: 0,
    complaints: 0,
    lastComplaintTime: -999,
    budget: 0,
    reputation: { audience: 50, neighbor: 50 },
    xp: 0,
    careerLevel: 0,
    gameTime: 0,       // real seconds from start
    dynamicEvents: [], // active events
    upgrades: new Set(),
    sessionStats: {
      maxHappiness: 0,
      minNeighborSPL: 999,
      complaints: 0,
      totalTicks: 0,
      happinessSum: 0
    },
    unlockedVenues: [0], // indices of unlocked venues
    lastEventTime: 0,
    nextEventTime: 20,
    mediaBonus: false
  };
}

export function saveState(state) {
  try {
    const serializable = {
      phase: 'menu', // always save to menu on reload
      xp: state.xp,
      careerLevel: state.careerLevel,
      budget: state.budget,
      reputation: state.reputation,
      upgrades: [...state.upgrades],
      unlockedVenues: state.unlockedVenues
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
  } catch (e) {
    // localStorage might not be available
  }
}

export function loadState(state) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    state.xp = saved.xp || 0;
    state.careerLevel = saved.careerLevel || 0;
    state.budget = saved.budget || 0;
    state.reputation = saved.reputation || { audience: 50, neighbor: 50 };
    state.upgrades = new Set(saved.upgrades || []);
    state.unlockedVenues = saved.unlockedVenues || [0];
    return true;
  } catch (e) {
    return false;
  }
}

export function hasSave() {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch (e) {
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
}
