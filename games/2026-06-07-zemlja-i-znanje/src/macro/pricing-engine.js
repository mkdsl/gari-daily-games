/**
 * pricing-engine.js — Cena = BASE_PRICE * (1 + rep/200), prestiž multiplier
 */

import { BASE_PRICES, PRICE_HARD_CAP_MULTIPLIER } from '../config.js';
import { prestigeMultiplier } from '../utils.js';

/**
 * Izracunava cenu ulaznice
 * @param {string} tema
 * @param {number} reputation 0-1000
 * @param {number} prestigeLevel 0-10
 * @returns {number} cena u €
 */
export function calcTicketPrice(tema, reputation, prestigeLevel = 0) {
  const base = BASE_PRICES[tema] || 100;
  const repBonus = 1 + (reputation / 200);
  const prestizMod = prestigeMultiplier(prestigeLevel);

  const raw = base * repBonus * prestizMod;
  const cap = base * PRICE_HARD_CAP_MULTIPLIER;

  return Math.round(Math.min(raw, cap));
}

/**
 * Vraca min/max cenu za temu
 */
export function getPriceRange(tema) {
  const base = BASE_PRICES[tema] || 100;
  return {
    min: base,
    max: base * PRICE_HARD_CAP_MULTIPLIER,
    base
  };
}

/**
 * Procenjuje prihod za planning screen preview
 * @param {string} tema
 * @param {number} participants
 * @param {number} reputation
 * @param {number} prestigeLevel
 */
export function estimateIncome(tema, participants, reputation, prestigeLevel = 0) {
  const price = calcTicketPrice(tema, reputation, prestigeLevel);
  return {
    price,
    total: Math.round(price * participants),
    participants
  };
}
