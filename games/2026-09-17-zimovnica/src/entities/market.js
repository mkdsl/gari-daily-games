/**
 * market.js — Market cene sirovine, trade kalkulacije.
 * Pijaca je unlocked posle prestige-a.
 */

import { JAR_PRICES } from '../config.js';

/**
 * @typedef {Object} MarketListing
 * @property {string} id - Ingredient id
 * @property {string} label - Naziv za prikaz
 * @property {number} buy_price - Cena kupovine (din/kg)
 * @property {number} sell_price - Cena prodaje sirovine (din/kg)
 * @property {number} max_buy_kg - Max kg koji se može kupiti u jednoj transakciji
 */

/** @type {MarketListing[]} */
export const MARKET_LISTINGS = [
  { id: 'paprike',   label: 'Paprike',   buy_price: 120, sell_price: 80,  max_buy_kg: 20 },
  { id: 'paradajz',  label: 'Paradajz',  buy_price: 90,  sell_price: 60,  max_buy_kg: 15 },
  { id: 'jabuke',    label: 'Jabuke',    buy_price: 80,  sell_price: 55,  max_buy_kg: 15 },
  { id: 'sljive',    label: 'Šljive',    buy_price: 100, sell_price: 70,  max_buy_kg: 10 },
  { id: 'krastavci', label: 'Krastavci', buy_price: 70,  sell_price: 45,  max_buy_kg: 10 },
  { id: 'kupus',     label: 'Kupus',     buy_price: 60,  sell_price: 40,  max_buy_kg: 20 },
];

/**
 * Izračunava ukupnu cenu kupovine.
 * @param {string} ingredientId
 * @param {number} kg
 * @returns {number} Ukupna cena u dinarima
 */
export function calcBuyCost(ingredientId, kg) {
  const listing = MARKET_LISTINGS.find(m => m.id === ingredientId);
  return listing ? listing.buy_price * kg : 0;
}

/**
 * Izračunava zaradu od prodaje sirovine.
 * @param {string} ingredientId
 * @param {number} kg
 * @returns {number}
 */
export function calcSellRevenue(ingredientId, kg) {
  const listing = MARKET_LISTINGS.find(m => m.id === ingredientId);
  return listing ? listing.sell_price * kg : 0;
}

/**
 * Vraća listing po id-u.
 * @param {string} id
 * @returns {MarketListing|undefined}
 */
export function getListing(id) {
  return MARKET_LISTINGS.find(m => m.id === id);
}

/**
 * Prodajne cene sirovine (din/kg) — quick lookup.
 * Isti podaci kao u MARKET_LISTINGS.sell_price.
 */
export const MARKET_PRICES = Object.fromEntries(
  MARKET_LISTINGS.map(m => [m.id, m.sell_price])
);

/**
 * Vraća cenu tegle (din/kg) sa opcionim prestige multiplikatorom.
 * @param {string} type - Tip tegle
 * @param {number} [prestige_mult=1.0]
 * @returns {number}
 */
export function getJarPrice(type, prestige_mult = 1.0) {
  return Math.round((JAR_PRICES[type] || 0) * prestige_mult);
}
