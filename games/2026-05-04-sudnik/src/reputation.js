// src/reputation.js — Masa i Vlast reputacioni sistem (GDD §6)
// Tabele promene resursa po presudi + crimeType + wealth modifier.
// Game over detekcija. Clamp 0-100.

import { CONFIG, GUILTY_DELTAS, FREE_DELTAS } from './config.js';

/**
 * Primenjuje promenu resursa posle presude.
 * Uključuje base delta, wealth modifier i aktivne presedant efekte (p08, p13).
 * Clampuje rezultate na [0, 100].
 *
 * @param {Object} state — game state (menja state.resources)
 */
export function applyVerdictReputation(state) {
  const verdict   = state.currentCase.verdict;    // 'guilty' | 'free'
  const crimeType = state.currentCase.crimeType;
  const wealth    = state.currentCase.suspectWealth;

  // 1. Base delta po presudi i crimeType
  const deltaTable = verdict === 'guilty' ? GUILTY_DELTAS : FREE_DELTAS;
  const base = deltaTable[crimeType] ?? { masa: 0, vlast: 0 };

  // 2. Wealth modifier
  const wealthMod = CONFIG.WEALTH_MODIFIERS[wealth] ?? { masa: 0, vlast: 0 };

  // 3. Akumulirani delta
  let masaDelta  = base.masa  + wealthMod.masa;
  let vlastDelta = base.vlast + wealthMod.vlast;

  // 4. Primeni aktivne presedant efekte (p08, p13)
  for (const precedent of state.precedents) {
    const eff = precedent.effect;

    if (eff.target === 'masa_on_verdict') {
      masaDelta += verdict === 'guilty' ? eff.guiltyDelta : eff.freeDelta;
    }

    if (eff.target === 'vlast_on_verdict') {
      vlastDelta += verdict === 'guilty' ? eff.guiltyDelta : eff.freeDelta;
    }
  }

  // 5. Primeni i clampuj
  state.resources.masa  = clamp(state.resources.masa  + masaDelta,  0, 100);
  state.resources.vlast = clamp(state.resources.vlast + vlastDelta, 0, 100);
}

/**
 * Proverava game over uslov posle promene resursa.
 * @param {Object} resources — state.resources
 * @returns {'none'|'masa'|'vlast'|'both'} Uzrok game over-a, ili 'none'
 */
export function checkGameOver(resources) {
  const masaDown  = resources.masa  <= 0;
  const vlastDown = resources.vlast <= 0;
  if (masaDown && vlastDown) return 'both';
  if (masaDown)  return 'masa';
  if (vlastDown) return 'vlast';
  return 'none';
}

/**
 * Vraća poruku game over-a na osnovu uzroka.
 * @param {'masa'|'vlast'|'both'} cause
 * @returns {string}
 */
export function getGameOverMessage(cause) {
  const messages = {
    masa:  'Masa te je okrenula leđima.',
    vlast: 'Vlast te je smenila.',
    both:  'Pao si sa obe strane — ni narod ni vlast te ne prepoznaju.'
  };
  return messages[cause] ?? 'Igra je završena.';
}

/**
 * Clamp helper.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
