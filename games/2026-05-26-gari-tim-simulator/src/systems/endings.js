// endings.js — calculateEnding(state) → ending ID ili "lose"
import { getTotalAffinity } from './affinity.js';

export function calculateEnding(state) {
  const a = state.affinity;
  const total = getTotalAffinity(a);

  // Lose state: sve affinity <= 1
  const allLow = Object.values(a).every(v => v <= 1);
  if (allLow) return 'lose';

  // Ending 1 (Gari): gari >= 12 I nijedno drugo >= 9
  if (a.gari >= 12) {
    const others = ['mici', 'brana', 'tonket', 'dule', 'pera'];
    if (others.every(k => a[k] < 9)) {
      return 1;
    }
  }

  // Ending 5 (Dule): dule >= 9
  if (a.dule >= 9) {
    return 5;
  }

  // Ending 6 (Pera): pera >= 6 ILI total_affinity <= 5
  if (a.pera >= 6 || total <= 5) {
    return 6;
  }

  // Endings 2/3/4: po najvisem affinitiju
  // Tie-break: Mici > Brana > Tonket
  if (a.mici >= 10 && a.gari >= 5) return 2;
  if (a.brana >= 10 && a.tonket >= 4) return 3;
  if (a.tonket >= 10 && a.brana >= 3) return 4;

  // Fallback: highest among Mici/Brana/Tonket if conditions partially met
  const candidates = [
    { key: 'mici',   threshold: 8, ending: 2, companion: 'gari',   compThreshold: 3 },
    { key: 'brana',  threshold: 8, ending: 3, companion: 'tonket', compThreshold: 2 },
    { key: 'tonket', threshold: 8, ending: 4, companion: 'brana',  compThreshold: 2 },
  ];

  for (const c of candidates) {
    if (a[c.key] >= c.threshold && a[c.companion] >= c.compThreshold) {
      return c.ending;
    }
  }

  // Fallback: gari ending if gari is highest
  if (a.gari >= 8) return 1;

  // Last resort: Pera ending
  return 6;
}
