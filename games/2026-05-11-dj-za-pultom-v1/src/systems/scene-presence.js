// =============================================================================
// systems/scene-presence.js — V6 composite (Mingling + Atmospheric + Guest sets)
// =============================================================================
import { SCENE_PRESENCE, CLASS_MODIFIERS } from '../config.js';
import { clamp, chance, randomInt } from '../util.js';

export function computeScenePresence(slot, state) {
  const minglingCount = slot.mingling_count ?? 0;
  const atmosphericCount = slot.atmospheric_count ?? 0;
  const guestSet = !!slot.guest_set;

  let networkGain = 0;
  let crewLoyaltyGain = 0;
  let boozeCost = 0;
  let reputationGain = 0;
  let recogGain = 0;
  let gigIncome = 0;
  let healthDrain = 0;
  let timeCost = 0;
  let energyCost = 0;
  let moneyCost = 0;

  // Mingling
  if (minglingCount > 0) {
    const m = SCENE_PRESENCE.mingling;
    timeCost += m.time_cost * minglingCount;
    energyCost += m.energy_cost * minglingCount;
    networkGain += m.network_per_unit * minglingCount;
    if (!state.apstinent) {
      boozeCost += m.booze_money_cost * minglingCount;
      // booze health drain (basic)
      healthDrain += 0.5 * minglingCount;
    }
  }

  // Atmospheric
  if (atmosphericCount > 0) {
    const a = SCENE_PRESENCE.atmospheric;
    timeCost += a.time_cost * atmosphericCount;
    energyCost += a.energy_cost * atmosphericCount;
    moneyCost += a.money_cost * atmosphericCount;
    networkGain += a.network_per_unit * atmosphericCount;
    crewLoyaltyGain += a.crew_loyalty_gain * atmosphericCount;
  }

  // Guest set
  if (guestSet) {
    const g = SCENE_PRESENCE.guest_set;
    timeCost += g.time_cost;
    energyCost += g.energy_cost;
    gigIncome += randomInt(g.gig_fee_min, g.gig_fee_max);
    networkGain += g.network_per_event;
    reputationGain += g.reputation_gain;
    recogGain += g.recognizability_gain;
    healthDrain += 3;
  }

  // Bogata deca underground penalty — reputacija sporije raste prvih 5 nedelja
  if (state.class_key === 'bogata_deca' && state.week < 5 && state.stats.knowledge < 3) {
    reputationGain *= CLASS_MODIFIERS.bogata_deca.underground_authenticity_penalty;
  }

  // Reputation event chance — Mile sekcija 2.2
  const sceneTier = networkGain / 5; // approximation
  const repEventChance = SCENE_PRESENCE.mingling.reputation_chance_factor * sceneTier * minglingCount;

  return {
    networkGain, crewLoyaltyGain, boozeCost, reputationGain, recogGain,
    gigIncome, healthDrain, timeCost, energyCost, moneyCost,
    repEventChance
  };
}

export function applyScenePresence(state, slot) {
  const out = computeScenePresence(slot, state);
  state.stats.network = clamp(state.stats.network + out.networkGain, 0, 7);
  state.crew_loyalty = clamp(state.crew_loyalty + out.crewLoyaltyGain, 0, 1.5);
  state.stats.reputation = clamp(state.stats.reputation + out.reputationGain, 0, 7);
  state.stats.recognizability = clamp(state.stats.recognizability + out.recogGain, 0, 7);
  state.money += out.gigIncome;
  state.money -= out.boozeCost + out.moneyCost;
  state.sacrifice.health = clamp(state.sacrifice.health - out.healthDrain, 0, 100);

  // Reputation event roll
  if (chance(out.repEventChance)) {
    state.reputation_events.push({
      week: state.week,
      type: 'mingling_spawn',
      label: 'Stari rezident te je primetio'
    });
    state.path_progress.reputation_events_triggered += 1;
  }

  return out;
}
