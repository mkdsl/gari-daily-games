const KEY = 'parkRanger_v1';
const DEFAULT_STATE = {
  currentStreak: 0, recordStreak: 0, lastQuestDate: null, completedToday: false,
  playerLevel: 0, totalXP: 0, questHistory: [], parkPropusnicaUsedMonth: null,
  currentQuestId: null, installPromptShown: false, appInstalled: false,
  pushPermission: 'unknown', isLegend: false, audioMuted: false,
};

export function loadState() {
  try { const raw = localStorage.getItem(KEY); if (!raw) return { ...DEFAULT_STATE }; return { ...DEFAULT_STATE, ...JSON.parse(raw) }; }
  catch { return { ...DEFAULT_STATE }; }
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Park Ranger: ne mogu da sačuvam stanje.', e); }
}

export function patchState(patch) {
  const state = loadState(); const next = { ...state, ...patch }; saveState(next); return next;
}

export function getTodayStr() { return new Date().toISOString().slice(0, 10); }
export function getYesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }
export function getCurrentMonthStr() { return new Date().toISOString().slice(0, 7); }

export function daysBetween(dateStrA, dateStrB) {
  return Math.round((new Date(dateStrB) - new Date(dateStrA)) / (1000 * 60 * 60 * 24));
}

export function addToHistory(state, questId, kategorija) {
  const entry = { id: questId, date: getTodayStr(), mood: null, kategorija };
  return { ...state, questHistory: [entry, ...state.questHistory].slice(0, 30) };
}

export function setLastMood(state, mood) {
  if (!state.questHistory.length) return state;
  const history = [...state.questHistory]; history[0] = { ...history[0], mood };
  return { ...state, questHistory: history };
}

export function getLast7DaysIds(history) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
  return history.filter(h => new Date(h.date) >= cutoff).map(h => h.id);
}

export function isPropusnicaAvailable(state) { return state.parkPropusnicaUsedMonth !== getCurrentMonthStr(); }

export function usePropusnica(state) { return patchState({ ...state, parkPropusnicaUsedMonth: getCurrentMonthStr() }); }

export function resetState() { localStorage.removeItem(KEY); return { ...DEFAULT_STATE }; }
