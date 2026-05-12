// score.js — score calc + localStorage

const STORAGE_KEY = 'tiha-avala-scores';

export function calcScore(solve_time_seconds, max_kdb) {
  const time_bonus = Math.max(0, 300 - solve_time_seconds) * 10;
  const margin_bonus = Math.max(0, (70 - max_kdb)) * 50;
  return Math.round(time_bonus + margin_bonus);
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { level_bests: [null, null, null, null, null, null], total_best_time: null };
    return JSON.parse(raw);
  } catch (e) {
    return { level_bests: [null, null, null, null, null, null], total_best_time: null };
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export function saveLevelScore(level_id, score, time) {
  const data = loadData();
  const prev = data.level_bests[level_id];
  if (prev === null || score > prev.score) {
    data.level_bests[level_id] = { score, time };
  }
  // Unlock next level
  if (level_id + 1 < 6) {
    // Mark next as unlocked by saving a sentinel
    if (!data.unlocked) data.unlocked = [0];
    if (!data.unlocked.includes(level_id + 1)) {
      data.unlocked.push(level_id + 1);
    }
  }
  saveData(data);
}

export function getLevelBest(level_id) {
  const data = loadData();
  return data.level_bests[level_id]; // null or { score, time }
}

export function getUnlockedLevels() {
  const data = loadData();
  const s = new Set([0]);
  if (data.unlocked) {
    data.unlocked.forEach(id => s.add(id));
  }
  // Also unlock levels that have been beaten
  data.level_bests.forEach((b, idx) => {
    if (b !== null && idx + 1 < 6) s.add(idx + 1);
  });
  return s;
}
