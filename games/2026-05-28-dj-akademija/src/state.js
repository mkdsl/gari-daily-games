import { LS_KEY_BEST } from './config.js';

export function loadBestScore() {
  return parseInt(localStorage.getItem(LS_KEY_BEST) || '0', 10);
}

export function saveBestScore(score) {
  const best = loadBestScore();
  if (score > best) localStorage.setItem(LS_KEY_BEST, String(score));
}
