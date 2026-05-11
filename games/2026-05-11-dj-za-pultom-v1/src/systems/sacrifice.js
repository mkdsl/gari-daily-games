// =============================================================================
// systems/sacrifice.js — Žrtvovanje drain/recovery (Mile sekcija 7 + 11.4)
// =============================================================================
import { SACRIFICE, BOOZE, CLASS_MODIFIERS } from '../config.js';
import { clamp } from '../util.js';

export function applySacrificeDrain(state, slots) {
  // ===== HEALTH =====
  let healthDrain = 0;

  // Žurka noć drain — applied separately u micro layer, ali agregat ovde:
  const gigsThisWeek = slots.gigs_this_week ?? 0;
  healthDrain += gigsThisWeek * SACRIFICE.health.drain_per_gig_night;

  // Sleep — derived iz V8 san slot
  const slept = slots.energy && (slots.energy.san || slots.energy.mirna_nedelja);
  if (!slept) {
    healthDrain += SACRIFICE.health.drain_low_sleep;
  }

  // Šljakanje (radnicka klasa)
  if (state.class_key === 'radnicka_klasa' && state.sljakanje_pct >= 40) {
    healthDrain += SACRIFICE.health.drain_sljakanje_extra;
  }

  // Alkohol weekly
  const boozeMode = state.origin.answers.q5_apstinencija;
  if (boozeMode === 'scene_fitted') {
    healthDrain += BOOZE.scene_fitted.health_drain_per_week;
  } else if (boozeMode === 'dj_navike') {
    healthDrain += BOOZE.dj_navike.health_drain_per_week;
  } else if (boozeMode === 'problem_zone') {
    healthDrain += BOOZE.problem_zone.health_drain_per_week;
  }

  // Apstinent bonus
  if (state.apstinent) {
    healthDrain *= (1 - BOOZE.apstinent.health_drain_reduction_pct);
  }

  // Passive regen
  let healthRegen = SACRIFICE.health.base_regen;
  healthRegen *= (1 + state.fitness_baseline);
  if (state.sacrifice.health < SACRIFICE.health.low_threshold) {
    healthRegen *= SACRIFICE.health.low_modifier;
  }

  state.sacrifice.health = clamp(state.sacrifice.health + healthRegen - healthDrain, 0, 100);

  // ===== ODNOSI =====
  let odnosiDrain = 0;

  // Music dominance — % time in music vectors (V2+V3+V4)
  const musicTime = (slots.music_time ?? 0) + (slots.knowledge_time ?? 0) + (slots.mixing_time ?? 0);
  const totalTime = slots.total_time_spent ?? 100;
  if (totalTime > 0 && (musicTime / totalTime) > SACRIFICE.odnosi.music_dominance_threshold) {
    odnosiDrain += SACRIFICE.odnosi.drain_music_dominance;
  }

  // Festival events
  odnosiDrain += (slots.festival_events ?? 0) * SACRIFICE.odnosi.drain_festival_event;

  // Posthumna penzija extra
  if (state.class_key === 'posthumna_penzija') {
    odnosiDrain += SACRIFICE.odnosi.drain_posthumna_extra;
  }

  // Recovery (porodica + crew)
  let odnosiRegen = 0;
  if (slots.energy && slots.energy.porodica) {
    odnosiRegen += SACRIFICE.odnosi.porodica_factor;
  }
  // Crew time = atmospheric Time investment
  const crewTime = (slots.scene_atmospheric_time ?? 0);
  odnosiRegen += crewTime * SACRIFICE.odnosi.crew_factor;

  state.sacrifice.odnosi = clamp(state.sacrifice.odnosi + odnosiRegen - odnosiDrain, 0, 100);

  // ===== NORMALNOST =====
  let normalnostDrain = 0;
  if (!slots.energy || !slots.energy.hobi) {
    normalnostDrain += SACRIFICE.normalnost.drain_no_hobby;
  }
  if (state.class_key === 'radnicka_klasa' && state.sljakanje_pct >= 60) {
    normalnostDrain += SACRIFICE.normalnost.drain_radnicka_extra;
  }
  if (state.class_key === 'posthumna_penzija') {
    normalnostDrain += SACRIFICE.normalnost.drain_posthumna_extra;
  }

  // Recovery
  let normalnostRegen = 0;
  if (slots.energy && slots.energy.hobi) {
    normalnostRegen += SACRIFICE.normalnost.hobby_factor;
  }
  if (slots.energy && slots.energy.mirna_nedelja) {
    normalnostRegen += SACRIFICE.normalnost.balance_event_factor;
  }

  state.sacrifice.normalnost = clamp(
    state.sacrifice.normalnost + normalnostRegen - normalnostDrain,
    0, 100
  );

  return {
    healthDelta: healthRegen - healthDrain,
    odnosiDelta: odnosiRegen - odnosiDrain,
    normalnostDelta: normalnostRegen - normalnostDrain
  };
}
