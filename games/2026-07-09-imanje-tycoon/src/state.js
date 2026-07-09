import { CONFIG } from './config.js';

export function createState() {
  return {
    version: 1,
    started: Date.now(),
    score: 0,
    gameOver: false,
    paused: false,
    // Jova: dopuni state shape po Miletovom GDD-u
    entities: [],
    meta: {}
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota or private mode — ignore
  }
}

export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}
