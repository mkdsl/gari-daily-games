import { getLast7DaysIds } from './state.js';

let allQuests = null;

export async function loadQuests() {
  if (allQuests) return allQuests;
  try { const res = await fetch('./quests.json'); allQuests = await res.json(); }
  catch (e) { console.error('Park Ranger: ne mogu da učitam questove.', e); allQuests = []; }
  return allQuests;
}

export function getQuestById(id) { if (!allQuests) return null; return allQuests.find(q => q.id === id) || null; }

export function selectTodayQuest(state, quests) {
  const recentIds = getLast7DaysIds(state.questHistory);
  let eligible = quests.filter(q => q.level_min <= state.playerLevel);
  let noRecent = eligible.filter(q => !recentIds.includes(q.id));
  if (noRecent.length === 0) noRecent = eligible;

  const lastKategorija = state.questHistory.length > 0 ? state.questHistory[0].kategorija : null;
  let preferred = lastKategorija ? noRecent.filter(q => q.kategorija !== lastKategorija) : noRecent;
  if (preferred.length === 0) preferred = noRecent;

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seed = parseInt(today, 10) + state.currentStreak;
  return preferred[seed % preferred.length];
}

export function resolveDailyQuest(state, quests) {
  if (!state.currentQuestId) return selectTodayQuest(state, quests);
  const saved = getQuestById(state.currentQuestId);
  if (saved) return saved;
  return selectTodayQuest(state, quests);
}
