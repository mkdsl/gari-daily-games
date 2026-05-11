// =============================================================================
// systems/vector-energy.js — V8 Energija (regen + hobby Reckless buff)
// =============================================================================
import { ENERGY } from '../config.js';
import { clamp } from '../util.js';

export function computeEnergyRegen(slot, state) {
  let energyRegen = 0;
  let healthRegen = 0;
  let normalnostRegen = 0;
  let odnosiRegen = 0;
  let recklessBuff = 0;
  let timeCost = 0;
  let moneyCost = 0;
  let hobbyUsed = false;
  let mirnaUsed = false;

  const activities = ['san', 'joga', 'setnja', 'hobi', 'porodica', 'mirna_nedelja'];

  for (const act of activities) {
    if (slot[act]) {
      const eff = ENERGY.activity_efficiency[act];
      const cost = ENERGY.time_cost[act];
      const money = ENERGY.money_cost[act];
      energyRegen += ENERGY.base_regen * eff;
      timeCost += cost;
      moneyCost += money;
      if (act === 'hobi') {
        hobbyUsed = true;
        normalnostRegen += ENERGY.hobby_normalnost_gain;
        recklessBuff += ENERGY.hobby_reckless_buff;
      }
      if (act === 'porodica') odnosiRegen += ENERGY.porodica_odnosi_gain;
      if (act === 'mirna_nedelja') {
        mirnaUsed = true;
        normalnostRegen += ENERGY.mirna_normalnost_gain;
      }
    }
  }

  // Health modifier — if low, regen razlika
  if (state.sacrifice.health < 50) {
    energyRegen *= ENERGY.health_low_modifier;
  }

  healthRegen = energyRegen * ENERGY.health_regen_factor;

  return {
    energyRegen, healthRegen, normalnostRegen, odnosiRegen, recklessBuff,
    timeCost, moneyCost, hobbyUsed, mirnaUsed
  };
}

export function applyEnergy(state, slot) {
  const out = computeEnergyRegen(slot, state);
  state.energy = clamp(state.energy + out.energyRegen, 0, 100);
  state.sacrifice.health = clamp(state.sacrifice.health + out.healthRegen, 0, 100);
  state.sacrifice.normalnost = clamp(state.sacrifice.normalnost + out.normalnostRegen, 0, 100);
  state.sacrifice.odnosi = clamp(state.sacrifice.odnosi + out.odnosiRegen, 0, 100);
  state.reckless_breakthrough_chance += out.recklessBuff;
  state.money -= out.moneyCost;
  if (out.hobbyUsed) state.hobby_weeks_used += 1;
  return out;
}
