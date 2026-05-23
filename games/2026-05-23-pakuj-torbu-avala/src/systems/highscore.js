// Daily highscore — localStorage
const MAX_ENTRIES = 5;

function getKey() {
  const today = new Date().toISOString().slice(0, 10);
  return `pakuj-torbu-highscore-${today}`;
}

export function loadHighscores() {
  try {
    const raw = localStorage.getItem(getKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveHighscore(score, grade) {
  try {
    const scores = loadHighscores();
    scores.push({ score, grade, ts: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, MAX_ENTRIES);
    localStorage.setItem(getKey(), JSON.stringify(top));
    return top;
  } catch {
    return [];
  }
}

export function isNewHighscore(score) {
  const scores = loadHighscores();
  if (scores.length < MAX_ENTRIES) return true;
  return score > (scores[scores.length - 1]?.score || 0);
}
