/**
 * recipe.js — Recipe definicije: input→output, time cost, yield formula.
 * Importuje detalje iz content/recipes_data.js.
 */

import { RECIPES_DATA } from '../content/recipes_data.js';
import { YIELD, SLOT_COST } from '../config.js';

/**
 * @typedef {Object} Recipe
 * @property {string} id - Identifikator recepta
 * @property {string} label - Naziv za prikaz
 * @property {string} icon - Emoji
 * @property {Object.<string, number>} inputs - {ingredient_id: kg_per_slot}
 * @property {string} output - Tip tegle/proizvoda
 * @property {number} yield_rate - Stopa prinosa (output/input)
 * @property {number} slot_cost - Broj action slotova
 * @property {number|null} passive_days - Null = instant, broj = pasivna fermentacija
 * @property {number|null} unlock_day - Dan od kog je dostupan (null = uvek)
 * @property {boolean} prestige_only - Dostupan samo u prestige runu
 */

/**
 * Vraća recept po id-u.
 * @param {string} id
 * @returns {Recipe|undefined}
 */
export function getRecipe(id) {
  return RECIPES_DATA.find(r => r.id === id);
}

/**
 * Vraća sve recepte dostupne za dati dan i unlock state.
 * @param {number} day
 * @param {object} unlocks
 * @param {boolean} prestigeActive
 * @returns {Recipe[]}
 */
export function getAvailableRecipes(day, unlocks, prestigeActive) {
  return RECIPES_DATA.filter(r => {
    if (r.prestige_only && !prestigeActive) return false;
    if (r.unlock_day !== null && day < r.unlock_day) return false;
    if (r.id === 'rakija' && !unlocks.rakija) return false;
    if (r.id === 'medenjaci' && !unlocks.medenjaci) return false;
    return true;
  });
}

/**
 * Izračunava output kg za dati input i recept.
 * @param {Recipe} recipe
 * @param {number} inputKg
 * @param {number} efficiencyMult - Prestige efficiency bonus (default 1.0)
 * @returns {number}
 */
export function calcOutput(recipe, inputKg, efficiencyMult = 1.0) {
  return inputKg * recipe.yield_rate * efficiencyMult;
}
