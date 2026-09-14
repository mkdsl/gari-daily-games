/**
 * prestige.js — Prestige sistem: unlock, run setup, persistencija
 */

import { loadPrestige, savePrestige, clearState } from '../state.js';

/** Modul-nivo keš — jedan localStorage read po page loadu */
let _cache = null;

function _get() {
  if (!_cache) _cache = loadPrestige();
  return _cache;
}

/**
 * Unlock prestige na osnovu "Sledeće leto" endinga
 * @returns {{ unlocked: boolean, count: number }}
 */
export function unlockPrestige() {
  const current = _get();
  const updated = {
    unlocked: true,
    count: (current.count || 0) + 1
  };
  savePrestige(updated);
  _cache = updated;
  return updated;
}

/**
 * Da li je prestige unlock-ovan?
 */
export function isPrestigeUnlocked() {
  return _get().unlocked === true;
}

/**
 * Broj prestige run-ova
 */
export function prestigeRunCount() {
  return _get().count || 0;
}

/**
 * Resetuj igru za prestige run
 * Briše game state, ali čuva prestige info i achievements
 */
export function startPrestigeRun() {
  clearState();
  // Prestige info se čuva
}

/**
 * Prestige bonus opis za UI
 */
export function prestigeBonus() {
  return {
    title: 'Prestige Run',
    description: 'Toma pamti prošlost. Novi scenariji dostupni.',
    bonuses: [
      'Toma pokazuje svesku sa beleškama (10:00)',
      'Retrospektiva draft je gotov (17:00)',
      'Toma pita: "Šta je drugačije ovog puta?" (14:00)'
    ]
  };
}
