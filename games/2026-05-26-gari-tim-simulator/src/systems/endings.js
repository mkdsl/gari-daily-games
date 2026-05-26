// endings.js — calculateEnding(state) -> ending ID or 'lose'
import { AFFINITY_KEYS } from '../config.js';
import { getTotalAffinity } from './affinity.js';

export function calculateEnding(state) {
  const a = state.affinity;
  const total = getTotalAffinity(a);

  // Lose state: sve affinity <= 1
  const allLow = AFFINITY_KEYS.every(k => (a[k] || 0) <= 1);
  if (allLow) return 'lose';

  // Ending 1 (Gari): gari >= 12 I nijedno drugo >= 9
  const othersUnder9 = AFFINITY_KEYS
    .filter(k => k !== 'gari')
    .every(k => (a[k] || 0) < 9);
  if ((a.gari || 0) >= 12 && othersUnder9) return 1;

  // Ending 5 (Dule): dule >= 9 I dule_greska = false
  if ((a.dule || 0) >= 9 && !state.flags.dule_greska) return 5;

  // Ending 6 (Pera): pera >= 6 ILI total <= 5
  if ((a.pera || 0) >= 6 || total <= 5) return 6;

  // Endings 2/3/4: po max affinitiju (Mici/Brana/Tonket)
  // Mici >= 10 + gari >= 5
  if ((a.mici || 0) >= 10 && (a.gari || 0) >= 5) return 2;
  // Brana >= 10 + tonket >= 4
  if ((a.brana || 0) >= 10 && (a.tonket || 0) >= 4) return 3;
  // Tonket >= 10 + brana >= 3
  if ((a.tonket || 0) >= 10 && (a.brana || 0) >= 3) return 4;

  // Tie-break po najvišem: Mici > Brana > Tonket
  const candidates = [
    { id: 2, key: 'mici' },
    { id: 3, key: 'brana' },
    { id: 4, key: 'tonket' },
  ];
  let bestEnding = 6;
  let bestVal = -1;
  for (const c of candidates) {
    if ((a[c.key] || 0) > bestVal) {
      bestVal = a[c.key] || 0;
      bestEnding = c.id;
    }
  }
  return bestEnding;
}
