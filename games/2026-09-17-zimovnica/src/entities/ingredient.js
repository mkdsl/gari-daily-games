/**
 * ingredient.js — Ingredient tipovi, decay stope, kg tracking.
 * Definiše sve sirovine koje se koriste u receptima.
 */

import { DECAY_BASE } from '../config.js';

/**
 * @typedef {Object} Ingredient
 * @property {string} id - Identifikator (npr. 'paprike')
 * @property {string} label - Srpski naziv za prikaz
 * @property {string} icon - Emoji ikona
 * @property {number} decay_rate - Dnevni gubitak (0–1)
 * @property {string[]} usable_in - Recepti gde se koristi ova sirovina
 */

/** @type {Ingredient[]} */
export const INGREDIENTS = [
  { id: 'paprike',   label: 'Paprike',   icon: '🫑', decay_rate: DECAY_BASE.paprike,   usable_in: ['ajvar', 'sos', 'tursija'] },
  { id: 'paradajz',  label: 'Paradajz',  icon: '🍅', decay_rate: DECAY_BASE.paradajz,  usable_in: ['sos', 'pelat'] },
  { id: 'jabuke',    label: 'Jabuke',    icon: '🍎', decay_rate: DECAY_BASE.jabuke,    usable_in: ['dzem', 'suseno', 'rakija'] },
  { id: 'sljive',    label: 'Šljive',    icon: '🫐', decay_rate: DECAY_BASE.sljive,    usable_in: ['pekmez', 'rakija', 'sušene_šljive'] },
  { id: 'krastavci', label: 'Krastavci', icon: '🥒', decay_rate: DECAY_BASE.krastavci, usable_in: ['tursija'] },
  { id: 'bostanusa', label: 'Bostanuša', icon: '🍈', decay_rate: DECAY_BASE.bostanusa, usable_in: ['dzem', 'tursija'] },
  { id: 'kupus',     label: 'Kupus',     icon: '🥬', decay_rate: DECAY_BASE.kupus,     usable_in: ['kiseli_kupus'] },
];

/**
 * Vraća ingredient po id-u.
 * @param {string} id
 * @returns {Ingredient|undefined}
 */
export function getIngredient(id) {
  return INGREDIENTS.find(i => i.id === id);
}

/**
 * Primenjuje dnevni decay na sirovine iz state-a.
 * @param {object} sirovine - Mapa {id: kg}
 * @param {string} weather - 'sunny'|'cloudy'|'rainy'
 * @returns {{ sirovine: object, decayed: object }} Ažurirane sirovine i koliko je propalo
 */
export function applyDecay(sirovine, weather = 'sunny') {
  const result = {};
  const decayed = {};
  const weatherMult = weather === 'rainy' ? 1.3 : weather === 'cloudy' ? 1.1 : 1.0;

  for (const [id, kg] of Object.entries(sirovine)) {
    const ing = getIngredient(id);
    if (!ing || kg <= 0) { result[id] = kg; continue; }
    const loss = kg * ing.decay_rate * weatherMult;
    const after = Math.max(0, kg - loss);
    result[id] = after;
    decayed[id] = loss;
  }
  return { sirovine: result, decayed };
}
