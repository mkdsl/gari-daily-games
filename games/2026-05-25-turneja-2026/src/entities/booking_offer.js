// booking_offer.js — Booking offer generation

import { BOOKING_TIERS } from '../config.js';

/**
 * Generate 3 booking offers by weighted distribution
 * @param {Object} tier_weights - { budget: w, mid: w, star: w } (higher = more likely)
 * @param {Object} opts - { reputation, budget } for contextual modifiers
 * @returns {Array} 3 booking offer objects
 */
export function generateOffers(tier_weights, opts = {}) {
  const defaults = { budget: 4, mid: 3, star: 2 };
  const weights = { ...defaults, ...tier_weights };

  // Adjust weights based on context
  if (opts.budget < 3000) {
    weights.budget += 3;
    weights.star = Math.max(0, weights.star - 2);
  }
  if (opts.reputation >= 70) {
    weights.star += 2;
    weights.mid += 1;
  }
  if (opts.reputation <= 30) {
    weights.budget += 2;
    weights.mid = Math.max(1, weights.mid - 1);
  }

  // Weighted random selection
  const pool = [];
  BOOKING_TIERS.forEach(tier => {
    const w = weights[tier.id] || 1;
    for (let i = 0; i < w; i++) pool.push(tier);
  });

  // Always guarantee at least one of each affordability tier appears
  // Pick 3 unique offers
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const seen = new Set();
  const offers = [];

  for (const tier of shuffled) {
    if (!seen.has(tier.id)) {
      seen.add(tier.id);
      offers.push(generateOffer(tier, opts));
    }
    if (offers.length >= 3) break;
  }

  // Fill with any remaining if not enough unique
  if (offers.length < 3) {
    for (const tier of BOOKING_TIERS) {
      if (!seen.has(tier.id)) {
        seen.add(tier.id);
        offers.push(generateOffer(tier, opts));
      }
      if (offers.length >= 3) break;
    }
  }

  return offers.slice(0, 3);
}

/**
 * Generate a single offer from a tier with slight randomization
 */
function generateOffer(tier, opts) {
  // Slight price variation (±10%)
  const variance = 1 + (Math.random() * 0.2 - 0.1);
  const cost = Math.round(tier.cost * variance / 100) * 100;
  const affordable = !opts.budget || cost <= opts.budget;

  return {
    ...tier,
    cost,
    affordable,
    offerName: generateDJName(tier.id)
  };
}

/**
 * Generate a fun DJ name based on tier
 */
function generateDJName(tierId) {
  const names = {
    budget: [
      'DJ Kosta', 'Djuro B2B', 'MC Žuti', 'Selector Pera',
      'DJ Šaban', 'Resident Bojan', 'MC Laza Beats'
    ],
    mid: [
      'Subovic', 'Noctornu', 'DJ Balkan Pro', 'Vibe Controller',
      'Bass Katarina', 'Selektor Marko', 'DJ Ema Resident'
    ],
    star: [
      'ZVUK GOD', 'Balkan Bass Star', 'DJ Exodus', 'Nina Kraviz HR',
      'ULTRA Miloš', 'The Bassline Prophet', 'DJ Elektra Beograd'
    ]
  };
  const list = names[tierId] || names.budget;
  return list[Math.floor(Math.random() * list.length)];
}
