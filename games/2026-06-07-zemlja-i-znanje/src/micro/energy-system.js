/**
 * energy-system.js — Formule energije po aktivnosti, glad akumulacija, pauza efekti
 */

import { ACTIVITY_TYPES } from '../config.js';
import { ARCHETYPES } from '../content/participant-archetypes.js';
import { clamp } from '../utils.js';

const HUNGER_ACCUMULATION_RATE = 0.5; // energy points per minute of session time
const PAUZA_RESTORE = 20;             // base energy restore na pauzi
const PAUZA_CANA_BONUS = 5;           // extra uz Cana

/**
 * Vraca energy change za aktivnost (negativan = trošak)
 * @param {string} activityId
 * @param {string} archetypeId
 * @param {string} weatherId
 * @param {number} slotMinute — 0-60, kasno u slotu = vise umora
 * @param {boolean} hasCana
 */
export function calcEnergyChange(activityId, archetypeId, weatherEnergyMod = 1.0, slotMinute = 0, hasCana = false) {
  const act = ACTIVITY_TYPES[activityId];
  if (!act) return 0;

  const arch = ARCHETYPES[archetypeId];
  const decayRate = arch ? arch.energy_decay_rate : 1.0;
  const base = act.energy_cost;

  // Late-slot fatigue bonus (last 20 min of slot = +20% drain)
  const lateSlopeFactor = slotMinute > 40 ? 1.2 : 1.0;

  let change = base * decayRate * weatherEnergyMod * lateSlopeFactor;

  // Pauza is negative energy_cost (restores)
  if (activityId === 'pauza') {
    change = -(PAUZA_RESTORE + (hasCana ? PAUZA_CANA_BONUS : 0));
  }

  return change;
}

/**
 * Primijenjeuje energy change na participantState
 * @param {Object} pState
 * @param {number} change — positive = drain, negative = restore
 * @param {number} deltaMinutes — game minutes elapsed
 */
export function applyEnergyChange(pState, change, deltaMinutes = 1) {
  if (!pState.isPresent) return pState;

  const scaledChange = change * (deltaMinutes / 60); // per hour rate
  pState.energy = clamp(pState.energy - scaledChange, 0, pState.maxEnergy);

  // Hunger accumulation (separate from activity)
  pState.hunger = (pState.hunger || 0) + HUNGER_ACCUMULATION_RATE * deltaMinutes;

  // Hunger penalty > 120min without pauza
  if (pState.hunger > 120) {
    const hungryPenalty = Math.floor((pState.hunger - 120) / 30) * 2;
    pState.energy = clamp(pState.energy - hungryPenalty * (deltaMinutes / 60), 0, pState.maxEnergy);
  }

  return pState;
}

/**
 * Pauza efekti: resetuje hunger, restore energija
 */
export function applyPausaEffect(pState, hasCana = false) {
  if (!pState.isPresent) return pState;

  const restore = PAUZA_RESTORE + (hasCana ? PAUZA_CANA_BONUS : 0);
  pState.energy = clamp(pState.energy + restore, 0, pState.maxEnergy);
  pState.hunger = Math.max(0, (pState.hunger || 0) - 90); // reset hunger
  return pState;
}

/**
 * Vraca energy level kao string
 */
export function getEnergyLabel(energy) {
  if (energy >= 75) return 'Svež';
  if (energy >= 50) return 'Dobro';
  if (energy >= 30) return 'Umoran';
  if (energy >= 15) return 'Iscrpljen';
  return 'Krajnje umoran';
}

/**
 * Vraca boju energy bar-a
 */
export function getEnergyColor(energy) {
  if (energy >= 60) return '#5aad5a';
  if (energy >= 35) return '#F4C430';
  return '#cc3333';
}
