/**
 * era-manager.js — Stub: era tracking za post-P3 narrative content
 * Popunjava polish stage
 */

export const ERAS = [
  { id: 'pocetnik',  name: 'Počeci',        rep_start: 0,    description: 'Prve korake na imanju.' },
  { id: 'razvoj',    name: 'Razvoj',         rep_start: 200,  description: 'Masterclass raste.' },
  { id: 'zrelo',     name: 'Zrelost',        rep_start: 500,  description: 'Guncati je etabliran.' },
  { id: 'legenda',   name: 'Legenda',        rep_start: 800,  description: 'Živo Učilište prepoznato u regionu.' }
];

export function getCurrentEra(reputation) {
  const sorted = [...ERAS].reverse();
  return sorted.find(e => reputation >= e.rep_start) || ERAS[0];
}

export function getNextEra(reputation) {
  return ERAS.find(e => e.rep_start > reputation) || null;
}
