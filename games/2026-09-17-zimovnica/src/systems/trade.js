/**
 * trade.js — Buy/sell operacije: market cena, kasa debit/credit.
 */

import { calcBuyCost, calcSellRevenue, getListing } from '../entities/market.js';
import { addLog } from '../state.js';
import { JAR_PRICES } from '../config.js';
import { totalQtyByType } from '../entities/jar.js';

/**
 * Kupuje sirovinu na pijaci.
 * @param {object} state
 * @param {string} ingredientId
 * @param {number} kg
 * @returns {{ state: object, error: string|null }}
 */
export function buyIngredient(state, ingredientId, kg) {
  if (!state.unlocks.pijaca) {
    return { state, error: 'Pijaca nije dostupna (prestige required).' };
  }
  const listing = getListing(ingredientId);
  if (!listing) return { state, error: 'Nepoznata sirovina.' };
  if (kg > listing.max_buy_kg) {
    return { state, error: `Max kupovina: ${listing.max_buy_kg} kg.` };
  }
  const cost = calcBuyCost(ingredientId, kg);
  if (state.kasa < cost) {
    return { state, error: `Nema dovoljno dinara (treba ${cost}, ima ${state.kasa}).` };
  }

  const newSirovine = { ...state.sirovine, [ingredientId]: (state.sirovine[ingredientId] || 0) + kg };
  let s = { ...state, kasa: state.kasa - cost, sirovine: newSirovine };
  s = addLog(s, `🛒 Kupljeno ${kg} kg ${ingredientId} za ${cost} din.`, 'info');
  return { state: s, error: null };
}

/**
 * Prodaje tegle na pijaci.
 * @param {object} state
 * @param {string} jarType
 * @param {number} qty
 * @returns {{ state: object, error: string|null }}
 */
export function sellJars(state, jarType, qty) {
  const available = totalQtyByType(state.tegle, jarType);
  if (available < qty) {
    return { state, error: `Nema dovoljno ${jarType} tegli (ima ${available.toFixed(1)} kg).` };
  }

  const pricePerKg = JAR_PRICES[jarType] || 0;
  const prestige = state.prestige_active;
  const mult = prestige ? (JAR_PRICES.prestige_mult?.[jarType] || 1) : 1;
  const revenue = qty * pricePerKg * mult;

  // Ukloni prodate tegle
  let remaining = qty;
  const newTegle = state.tegle.map(j => {
    if (j.type !== jarType || remaining <= 0) return j;
    const sell = Math.min(j.qty, remaining);
    remaining -= sell;
    return { ...j, qty: j.qty - sell };
  }).filter(j => j.qty > 0.01);

  let s = { ...state, tegle: newTegle, kasa: state.kasa + revenue };
  s = addLog(s, `💰 Prodato ${qty} kg ${jarType} za ${revenue.toFixed(0)} din.`, 'success');
  return { state: s, error: null };
}
