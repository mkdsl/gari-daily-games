// =============================================================================
// systems/vector-promo.js — V1 Promo (Mile sekcija 11.2)
// =============================================================================
import { PROMO } from '../config.js';
import { clamp } from '../util.js';

export function computePromo(slot, state) {
  const frequency = slot.frequency ?? 0;
  const adMoney = clamp(slot.ad_money ?? 0, 0, PROMO.ad_money_cap);

  const freqMult = PROMO.freq_mult[frequency] ?? 0;
  const recogMod = 0.5 + (state.stats.recognizability / 7) * 2.5;
  const adBonus = 1 + adMoney / 100;

  const rsvpGain = clamp(PROMO.base_rsvp * freqMult * recogMod * adBonus, 0, PROMO.rsvp_cap);
  const recogGain = (frequency >= PROMO.recog_gain_threshold_freq) ? PROMO.recog_gain_amount : 0;
  const moneyCost = adMoney;
  const timeCost = PROMO.time_cost[frequency] ?? 0;
  const energyCost = PROMO.energy_cost[frequency] ?? 0;

  return { rsvpGain, recogGain, moneyCost, timeCost, energyCost };
}

export function applyPromo(state, slot) {
  const out = computePromo(slot, state);
  state.rsvp_next += out.rsvpGain;
  state.stats.recognizability = clamp(state.stats.recognizability + out.recogGain, 0, 7);
  state.money -= out.moneyCost;
  return out;
}
