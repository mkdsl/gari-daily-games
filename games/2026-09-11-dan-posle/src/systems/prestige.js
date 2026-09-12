/**
 * prestige.js — Prestige sistem: unlock, run setup, persistencija
 */

import { loadPrestige, savePrestige, clearState } from '../state.js';

/**
 * Unlock prestige na osnovu "Sledeće leto" endinga
 * @returns {{ unlocked: boolean, count: number }}
 */
export function unlockPrestige() {
  const current = loadPrestige();
  const updated = {
    unlocked: true,
    count: (current.count || 0) + 1
  };
  savePrestige(updated);
  return updated;
}

/**
 * Da li je prestige unlock-ovan?
 */
export function isPrestigeUnlocked() {
  const p = loadPrestige();
  return p.unlocked === true;
}

/**
 * Broj prestige run-ova
 */
export function prestigeRunCount() {
  const p = loadPrestige();
  return p.count || 0;
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
