// affinity.js — applyDelta, getLeader, getTotalAffinity
import { AFFINITY_KEYS } from '../config.js';

export function applyDelta(state, delta) {
  for (const [key, val] of Object.entries(delta)) {
    if (AFFINITY_KEYS.includes(key)) {
      state.affinity[key] = (state.affinity[key] || 0) + val;
    }
  }
}

export function getLeader(affinity, candidates) {
  const keys = candidates || AFFINITY_KEYS;
  let best = null;
  let bestVal = -Infinity;
  for (const k of keys) {
    if ((affinity[k] || 0) > bestVal) {
      bestVal = affinity[k] || 0;
      best = k;
    }
  }
  return best;
}

export function getTotalAffinity(affinity) {
  return AFFINITY_KEYS.reduce((sum, k) => sum + (affinity[k] || 0), 0);
}
