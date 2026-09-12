/**
 * resource_manager.js — applyDelta, clamp, Energija=0 pravilo
 */

import { RESOURCES } from '../config.js';

/**
 * Clamp vrednost resursa u [min, max] opseg
 * @param {string} resourceKey
 * @param {number} value
 * @returns {number}
 */
export function clampResource(resourceKey, value) {
  const def = RESOURCES[resourceKey];
  if (!def) return value;
  return Math.max(def.min, Math.min(def.max, value));
}

/**
 * Primeni delta na sve resurse u state-u
 * Delta format: { e: Energija, v: Veze, s: Secanja, n: Nered }
 * @param {object} resources - trenutni resursi (mutira in-place)
 * @param {object} delta - { e, v, s, n }
 * @returns {object} - stvarna promena { energija, veze, secanja, nered }
 */
export function applyDelta(resources, delta) {
  const actual = {};
  const MAP = { e: 'energija', v: 'veze', s: 'secanja', n: 'nered' };
  for (const [key, resKey] of Object.entries(MAP)) {
    const change = delta[key] || 0;
    const before = resources[resKey];
    const after = clampResource(resKey, before + change);
    resources[resKey] = after;
    actual[resKey] = after - before;
  }
  return actual;
}

/**
 * Da li je Energija = 0?
 * @param {object} resources
 * @returns {boolean}
 */
export function isEnergyDepleted(resources) {
  return resources.energija <= 0;
}

/**
 * Filtriraj opcije kad je Energija = 0:
 * Sve opcije postaju sive OSIM one sa najnižim E troškom (ili 0).
 * Labeled "(automatski)".
 * @param {Array} options - opcije noda
 * @param {boolean} depleted
 * @returns {Array} - opcije sa .disabled i .auto flagom
 */
export function filterOptionsForEnergy(options, depleted) {
  if (!depleted) return options.map(o => ({ ...o, disabled: false, auto: false }));

  // Nađi opciju sa najvećim E delta (ili 0 ako nema E troška)
  // Pravilo: najmanji E trošak = najveći e delta (manje negativan)
  let bestE = -Infinity;
  for (const opt of options) {
    const eDelta = opt.delta?.e ?? 0;
    if (eDelta > bestE) bestE = eDelta;
  }

  return options.map(opt => {
    const eDelta = opt.delta?.e ?? 0;
    const isBest = eDelta === bestE;
    return {
      ...opt,
      disabled: !isBest,
      auto: isBest
    };
  });
}

/**
 * Formatuj delta za prikaz
 * @param {object} actualDelta - { energija, veze, secanja, nered }
 * @returns {Array<{label, value, positive}>}
 */
export function formatDeltaDisplay(actualDelta) {
  const display = [];
  const defs = {
    energija: { label: 'Energija', inverted: false },
    veze:     { label: 'Veze',     inverted: false },
    secanja:  { label: 'Sećanja',  inverted: false },
    nered:    { label: 'Nered',    inverted: true }
  };
  for (const [key, def] of Object.entries(defs)) {
    const v = actualDelta[key] || 0;
    if (v === 0) continue;
    display.push({
      label: def.label,
      value: v,
      positive: def.inverted ? v < 0 : v > 0 // za Nered, smanjenje = pozitivno
    });
  }
  return display;
}

/**
 * Resurs summary za sharing
 * @param {object} resources
 * @returns {string}
 */
export function resourceSummary(resources) {
  return [
    `E:${resources.energija}`,
    `V:${resources.veze}`,
    `S:${resources.secanja}`,
    `N:${resources.nered}`
  ].join(' ');
}
