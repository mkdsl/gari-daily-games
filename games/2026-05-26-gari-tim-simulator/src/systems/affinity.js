// affinity.js — applyDelta(), getLeader(), getTotalAffinity()
import { AFFINITY_CHARACTERS } from '../config.js';

export function applyDelta(state, delta) {
  for (const [char, val] of Object.entries(delta)) {
    if (state.affinity.hasOwnProperty(char)) {
      state.affinity[char] += val;
    }
  }
}

export function getLeader(affinity, candidates = null) {
  // candidates: array of char keys to consider (default: all)
  // Tie-break order: Gari > Mici > Brana > Tonket > Dule > Pera
  const TIEBREAK = ['gari', 'mici', 'brana', 'tonket', 'dule', 'pera'];
  const chars = candidates || TIEBREAK;

  let maxVal = -Infinity;
  let leader = null;

  for (const key of TIEBREAK) {
    if (!chars.includes(key)) continue;
    const val = affinity[key] || 0;
    if (val > maxVal) {
      maxVal = val;
      leader = key;
    }
  }

  return leader;
}

export function getTotalAffinity(affinity) {
  return Object.values(affinity).reduce((sum, v) => sum + v, 0);
}

export function getAllAffinities(affinity) {
  return { ...affinity };
}

export function getScene3Leader(affinity) {
  // Scene 3: dominant lik posle Scene 2
  // Candidates: gari, mici, brana, tonket
  // Tie-break: Gari > Mici > Brana > Tonket
  return getLeader(affinity, ['gari', 'mici', 'brana', 'tonket']);
}
