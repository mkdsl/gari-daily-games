// highscore.js — localStorage daily highscore
import { GAME_CONFIG } from '../config.js';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function loadData() {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    localStorage.setItem(GAME_CONFIG.LS_KEY, JSON.stringify(data));
  } catch {}
}

export function saveHighscore(sessionTotal, maxStreak) {
  const today = getTodayKey();
  const data = loadData();

  // Reset if different day
  if (data.date !== today) {
    data.date = today;
    data.scores = [];
    data.streaks = [];
  }

  data.scores = data.scores || [];
  data.streaks = data.streaks || [];

  data.scores.push(sessionTotal);
  data.scores.sort((a, b) => b - a);
  data.scores = data.scores.slice(0, 3);

  data.streaks.push(maxStreak);
  data.streaks.sort((a, b) => b - a);
  data.streaks = data.streaks.slice(0, 3);

  saveData(data);
  return data;
}

export function loadHighscores() {
  const today = getTodayKey();
  const data = loadData();
  if (data.date !== today) {
    return { scores: [], streaks: [] };
  }
  return {
    scores: data.scores || [],
    streaks: data.streaks || [],
  };
}
