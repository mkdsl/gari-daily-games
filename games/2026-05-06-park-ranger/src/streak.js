import { getTodayStr, getYesterdayStr, isPropusnicaAvailable, addToHistory } from './state.js';
import { LEVEL_THRESHOLDS, XP_PER_QUEST, XP_LEVEL_UP_BONUS } from './config.js';

export const DAY_STATUS = {
  FIRST_TIME: 'FIRST_TIME', TODAY_DONE: 'TODAY_DONE', TODAY_PENDING: 'TODAY_PENDING',
  YESTERDAY: 'YESTERDAY', MISSED_PROPUSNICA: 'MISSED_PROPUSNICA', MISSED_RESET: 'MISSED_RESET',
};

export function analyzeDayStatus(state) {
  const today = getTodayStr(); const yesterday = getYesterdayStr();
  if (!state.lastQuestDate) return DAY_STATUS.FIRST_TIME;
  if (state.lastQuestDate === today) return state.completedToday ? DAY_STATUS.TODAY_DONE : DAY_STATUS.TODAY_PENDING;
  if (state.lastQuestDate === yesterday) return DAY_STATUS.YESTERDAY;
  return isPropusnicaAvailable(state) ? DAY_STATUS.MISSED_PROPUSNICA : DAY_STATUS.MISSED_RESET;
}

export function prepareDayState(state) {
  const today = getTodayStr(); const status = analyzeDayStatus(state);
  if (status === DAY_STATUS.MISSED_RESET) return { ...state, currentStreak: 0, completedToday: false, lastQuestDate: today, currentQuestId: null };
  if (status === DAY_STATUS.YESTERDAY || status === DAY_STATUS.FIRST_TIME) return { ...state, completedToday: false, currentQuestId: null };
  return state;
}

export function completeQuest(state, questId, kategorija) {
  const today = getTodayStr();
  const newStreak = state.currentStreak + 1;
  const newRecord = Math.max(newStreak, state.recordStreak);
  let xpGained = XP_PER_QUEST;
  if ([7, 14, 30, 60].includes(newStreak)) xpGained += XP_LEVEL_UP_BONUS;
  const newTotalXP = state.totalXP + xpGained;
  const oldLevel = state.playerLevel;
  const newLevel = calculateLevel(newStreak, oldLevel);
  const leveledUp = newLevel > oldLevel;
  const levelXP = leveledUp ? XP_LEVEL_UP_BONUS : 0;
  const finalXP = newTotalXP + levelXP;
  let newState = addToHistory(state, questId, kategorija);
  newState = { ...newState, currentStreak: newStreak, recordStreak: newRecord, completedToday: true, lastQuestDate: today, playerLevel: newLevel, totalXP: finalXP, isLegend: newLevel >= 7, currentQuestId: questId };
  return { newState, leveledUp, newLevel, xpGained: xpGained + levelXP };
}

export function applyPropusnica(state) {
  return { ...state, parkPropusnicaUsedMonth: getTodayStr().slice(0, 7), completedToday: false, lastQuestDate: getYesterdayStr(), currentQuestId: null };
}

export function calculateLevel(streak, currentLevel) {
  let maxLevel = currentLevel;
  for (const threshold of LEVEL_THRESHOLDS) { if (streak >= threshold.streakRequired && threshold.level > maxLevel) maxLevel = threshold.level; }
  return maxLevel;
}

export function getLevelData(level) {
  let data = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) { if (t.level <= level) data = t; }
  return data;
}

export function getNextLevelData(level) {
  for (const t of LEVEL_THRESHOLDS) { if (t.level > level) return t; }
  return null;
}

export function getLevelProgress(streak, level) {
  const current = getLevelData(level); const next = getNextLevelData(level);
  if (!next) return 1;
  return Math.min(1, Math.max(0, (streak - current.streakRequired) / (next.streakRequired - current.streakRequired)));
}

export function getXPToNextLevel(state) {
  const next = getNextLevelData(state.playerLevel);
  if (!next) return 0;
  return Math.max(0, (next.streakRequired - state.currentStreak) * XP_PER_QUEST);
}
