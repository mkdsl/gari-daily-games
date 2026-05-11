// =============================================================================
// systems/finansije.js — V7 cash flow
// =============================================================================
import { FINANSIJE, CLASS_MODIFIERS, SLJAKANJE_TIERS, BOOZE } from '../config.js';
import { chance, randomInt } from '../util.js';

export function computeFinance(slot, state) {
  let netCashFlow = 0;
  let sponsorAcquired = false;
  let timeCost = 0;
  let energyCost = 0;

  // Fixed costs
  netCashFlow -= FINANSIJE.fixed_costs_per_week;

  // Klasa subvencija (Posthumna penzija)
  const mod = CLASS_MODIFIERS[state.class_key];
  if (mod && mod.money_subvencija_per_week) {
    netCashFlow += mod.money_subvencija_per_week;
  }

  // Šljakanje tax (radnicka klasa)
  if (state.class_key === 'radnicka_klasa') {
    const tier = SLJAKANJE_TIERS[state.sljakanje_pct];
    if (tier) {
      netCashFlow += tier.cash_week;
    }
  }

  // Booze cost (origin Q5)
  const boozeMode = state.origin.answers.q5_apstinencija;
  if (boozeMode === 'apstinent') {
    // bonus se primenjuje na ostalim mestima — ovde 0 boozeCost
  } else if (boozeMode === 'drustveno') {
    netCashFlow -= BOOZE.social_drinking.money_cost_per_week;
  } else if (boozeMode === 'scene_fitted') {
    netCashFlow -= BOOZE.scene_fitted.money_cost_per_week;
  } else if (boozeMode === 'dj_navike') {
    netCashFlow -= BOOZE.dj_navike.money_cost_per_week;
  }

  // Sponsor outreach — Mile sekcija 2.2 V7
  if (slot.sponsor_outreach
      && state.stats.network >= FINANSIJE.sponsor_min_network_tier
      && state.stats.recognizability >= FINANSIJE.sponsor_min_recognizability_tier) {
    timeCost += 5;
    energyCost += 3;
    if (chance(FINANSIJE.sponsor_chance_per_week)) {
      const inflow = randomInt(FINANSIJE.sponsor_inflow_range.min, FINANSIJE.sponsor_inflow_range.max);
      netCashFlow += inflow;
      sponsorAcquired = true;
    }
  }

  // Bookkeeping — passive maintenance, small benefit
  if (slot.bookkeeping) {
    timeCost += 3;
    netCashFlow += 20;  // tax optimization, no big effect
  }

  return { netCashFlow, sponsorAcquired, timeCost, energyCost };
}

export function applyFinance(state, slot) {
  const out = computeFinance(slot, state);
  state.money += out.netCashFlow;
  if (state.money < 0) {
    state.weeks_with_negative_balance += 1;
  } else {
    state.weeks_with_negative_balance = 0;
  }
  return out;
}
