// =============================================================================
// config.js — Sve balance konstante iz Mile GDD v1 Sezona 1 sekcija 11
// =============================================================================
// Šef ce ovo prvo da menja kad bude igrao radnu verziju.
// Svaka konstanta ima komentar sa Mile GDD referencom.
// =============================================================================

export const VERSION = '0.1.0-scaffold';
export const SEASON = 1;

// -----------------------------------------------------------------------------
// SEZONA ARHITEKTURA — Mile GDD sekcija 4.1
// -----------------------------------------------------------------------------
export const WEEKS_PER_SEASON = 12;
export const CHECKPOINT_EVERY_N_WEEKS = 4;
export const GIGS_PER_SEASON_BASELINE = { min: 8, max: 12 };

// -----------------------------------------------------------------------------
// TIME / ENERGY BUDGET — Mile GDD sekcija 2.1
// -----------------------------------------------------------------------------
export const WEEKLY_TIME_BUDGET = 100;   // skrivena vrednost; igrac vidi simptomatski signal
export const WEEKLY_ENERGY_BUDGET = 100; // skrivena; igrac vidi ikonu umora

// -----------------------------------------------------------------------------
// KLASA MODIFIKATORI — Mile GDD sekcija 5.1
// Stat spread 50-70% (Dule Korekcija 2 — manji spread)
// -----------------------------------------------------------------------------
export const CLASS_MODIFIERS = {
  bogata_deca: {
    name: 'Bogata deca',
    description: 'Roditeljska subvencija, pristup mentorima, ali underground autentičnost je problem.',
    time_mult: 1.0,
    energy_mult: 1.0,
    money_baseline_pct: 70,
    knowledge_start_pct: 30,
    network_start_pct: 60,
    recognizability_start_pct: 20,
    visual_start_pct: 40,
    mixing_start_pct: 25,
    // Žrtvovanje start
    health_start: 100,
    odnosi_start: 100,
    normalnost_start: 100,
    // Handicap (sekcija 5.2)
    underground_authenticity_penalty: 0.7,  // 0.7x reputation gain ka underground scene
    underground_penalty_weeks: 5,           // dok ne postigne Knowledge tier 3
    brand_coherence_visual_penalty: 10,     // -10% per "performans" sesija bez Knowledge
    // Origin narativ buff/debuff
    money_subvencija_per_week: 0
  },

  radnicka_klasa: {
    name: 'Radnička klasa',
    description: 'Šljakanje pre svega. Šta ti ostane vremena, to je tvoje.',
    time_mult: 0.6,
    energy_mult: 0.7,
    money_baseline_pct: 50,
    knowledge_start_pct: 30,
    network_start_pct: 25,
    recognizability_start_pct: 5,
    visual_start_pct: 20,
    mixing_start_pct: 25,
    health_start: 100,
    odnosi_start: 80,
    normalnost_start: 100,
    // Šljakanje tax (sekcija 5.3)
    sljakanje_default_pct: 60,  // default pri origin
    sljakanje_music_dev_bonus: 0.15, // +15% music dev efikasnost (Nega Rizik 19 mehanički buff)
    money_subvencija_per_week: 0
  },

  posthumna_penzija: {
    name: 'Posthumna penzija + faks',
    description: 'Imaš novac od porodice/penzije, faks tek kreće. Vreme imaš. Pitanje je da li ti je previše.',
    time_mult: 1.0,
    energy_mult: 0.9,
    money_baseline_pct: 60,
    knowledge_start_pct: 60,
    network_start_pct: 30,
    recognizability_start_pct: 10,
    visual_start_pct: 30,
    mixing_start_pct: 50,  // vežba je tu — najvise iskustva
    health_start: 100,
    odnosi_start: 70,
    normalnost_start: 60,
    // Monomania risk (sekcija 5.4)
    normalnost_drain_extra: 2,
    odnosi_drain_extra: 1,
    visual_gain_penalty: 0.7,
    knowledge_monomania_bonus: 1.3, // monomania bonus when listening
    money_subvencija_per_week: 200  // penzija full u S1 nedelja 1-12
  },

  custom: {
    name: 'Custom (tvoja priča)',
    description: 'Tvoja priča. Napiši je. Sistem će aproksimirati stat-ove.',
    time_mult: 0.75,
    energy_mult: 0.75,
    money_baseline_pct: 55,
    knowledge_start_pct: 35,
    network_start_pct: 40,
    recognizability_start_pct: 10,
    visual_start_pct: 25,
    mixing_start_pct: 25,
    health_start: 100,
    odnosi_start: 90,
    normalnost_start: 90,
    money_subvencija_per_week: 0
  }
};

// -----------------------------------------------------------------------------
// ŠLJAKANJE TAX TABELA — Mile GDD sekcija 5.3 (radnicka klasa skrivena)
// -----------------------------------------------------------------------------
export const SLJAKANJE_TIERS = {
  0: { time: 0,   energy: 0,   cash_week: -100, music_eff: 1.0, hard_fail_risk: 'bankrupt_6wk' },
  40: { time: -40, energy: -30, cash_week: -20, music_eff: 1.10, hard_fail_risk: 'burnout' },
  60: { time: -60, energy: -50, cash_week: 5,   music_eff: 1.15, hard_fail_risk: 'optimum' },
  80: { time: -80, energy: -70, cash_week: 30,  music_eff: 0.50, hard_fail_risk: 'permanent_midtier' }
};

// -----------------------------------------------------------------------------
// V1 PROMO formula — Mile GDD sekcija 11.2
// -----------------------------------------------------------------------------
export const PROMO = {
  base_rsvp: 5,
  freq_mult: { 0: 0, 1: 1.0, 3: 2.5, 5: 4.0 },
  rsvp_cap: 120,
  recog_gain_threshold_freq: 3,
  recog_gain_amount: 0.05,
  ad_money_cap: 50,
  time_cost: { 0: 0, 1: 5, 3: 10, 5: 15 },
  energy_cost: { 0: 0, 1: 3, 3: 6, 5: 10 }
};

// -----------------------------------------------------------------------------
// V2 MUSIC RESEARCH — Mile GDD sekcija 2.2 (V2)
// -----------------------------------------------------------------------------
export const MUSIC_RESEARCH = {
  sources: {
    digital:    { speed: 1.0, cost_per_track: 15, depth: 1.0 },
    vinyl:      { speed: 0.6, cost_per_track: 40, depth: 2.0 },
    soundcloud: { speed: 1.3, cost_per_track: 5,  depth: 0.7 },
    friend:     { speed: 0.4, cost_per_track: 0,  depth: 1.5 }
  },
  knowledge_baseline_factor: 0.02,
  freshness_decay_per_week: 0.05,
  freshness_start: 1.0
};

// -----------------------------------------------------------------------------
// V3 KNOWLEDGE — Mile GDD sekcija 11.3
// -----------------------------------------------------------------------------
export const KNOWLEDGE = {
  base_gain: 0.3,
  source_efficiency: {
    citanje: 0.7,
    podcast: 1.0,
    label:   1.4,
    mentor:  2.0
  },
  source_money_cost: {
    citanje: 0,
    podcast: 0,
    label:   30,
    mentor:  100
  },
  diminishing_exponent: 1.3,
  tier_max: 7
};

// -----------------------------------------------------------------------------
// V4 MIXING — Mile GDD sekcija 2.2 (V4)
// -----------------------------------------------------------------------------
export const MIXING = {
  base_gain: 0.4,
  session_intensity: { 30: 0.4, 60: 0.7, 120: 1.0, 240: 1.3 },
  session_time_cost: { 30: 5,   60: 10,  120: 18,  240: 25 },
  session_energy_cost: { 30: 10, 60: 18, 120: 25, 240: 30 },
  health_low_modifier: 0.6,
  health_low_threshold: 50,
  tier_max: 7,
  mixtape_recognizability_gain: 0.1
};

// -----------------------------------------------------------------------------
// V5 IZGLED — Mile GDD sekcija 2.2 (V5)
// -----------------------------------------------------------------------------
export const VISUAL = {
  cost_factor: { garderoba: 200, fitness: 0, frizer: 80, fotka: 120 },
  time_cost:   { garderoba: 5,   fitness: 8, frizer: 3,  fotka: 4 },
  energy_cost: { garderoba: 2,   fitness: 5, frizer: 2,  fotka: 3 },
  fitness_baseline_threshold_per_week: 1,
  fitness_baseline_gain: 0.05,
  fitness_health_bonus: 1,
  fitness_energy_bonus: 5,
  tier_max: 7
};

// -----------------------------------------------------------------------------
// V6 SCENE PRESENCE — Mile GDD sekcija 2.2 (V6) composite
// -----------------------------------------------------------------------------
export const SCENE_PRESENCE = {
  mingling: {
    time_cost: 8,
    energy_cost: 8,
    booze_money_cost: 60,    // booze tax
    network_per_unit: 0.4,
    reputation_chance_factor: 0.05
  },
  atmospheric: {
    time_cost: 8,
    energy_cost: 8,
    money_cost: 25,
    network_per_unit: 0.7,
    crew_loyalty_gain: 0.03
  },
  guest_set: {
    time_cost: 25,
    energy_cost: 30,
    gig_fee_min: 50,
    gig_fee_max: 300,
    network_per_event: 5,
    reputation_gain: 0.5,
    recognizability_gain: 0.08
  }
};

// -----------------------------------------------------------------------------
// V7 FINANSIJE — Mile GDD sekcija 2.2 (V7)
// -----------------------------------------------------------------------------
export const FINANSIJE = {
  fixed_costs_per_week: 200, // stan, telefon, transport
  sponsor_min_network_tier: 3,
  sponsor_min_recognizability_tier: 2,
  sponsor_inflow_range: { min: 200, max: 1000 },
  sponsor_chance_per_week: 0.04
};

// -----------------------------------------------------------------------------
// V8 ENERGIJA — Mile GDD sekcija 2.2 (V8) + 7 (recovery)
// -----------------------------------------------------------------------------
export const ENERGY = {
  base_regen: 20,
  activity_efficiency: {
    san: 1.0,
    joga: 0.8,
    setnja: 0.6,
    hobi: 0.7,
    mirna_nedelja: 2.0,
    porodica: 0.5
  },
  time_cost: {
    san: 5, joga: 8, setnja: 6, hobi: 10, mirna_nedelja: 30, porodica: 12
  },
  money_cost: {
    san: 0, joga: 30, setnja: 0, hobi: 20, mirna_nedelja: 0, porodica: 50
  },
  health_low_modifier: 0.7,
  health_regen_factor: 0.4,  // health regen = energy regen * 0.4
  hobby_reckless_buff: 0.05,
  porodica_odnosi_gain: 20,
  hobby_normalnost_gain: 12,
  mirna_normalnost_gain: 25
};

// -----------------------------------------------------------------------------
// V9 RECKLESS SELECTION — Mile GDD sekcija 2.2 (V9) + 13.1
// -----------------------------------------------------------------------------
export const RECKLESS = {
  gating_knowledge_tier: 2,
  peak_unique_gated: 20,   // Knowledge tier 3+ & track unique → +20% atmosphere
  drop_unique_gated: -12,
  peak_ungated: 5,
  drop_ungated: -8,
  success_threshold: 15,    // peak atmosphere ≥ +15% counts as success
  recognizability_per_success: 0.05
};

// -----------------------------------------------------------------------------
// ŽRTVOVANJE DRAIN/RECOVERY — Mile GDD sekcija 7 + 11.4
// -----------------------------------------------------------------------------
export const SACRIFICE = {
  health: {
    drain_per_gig_night: 3,
    drain_low_sleep: 5,
    drain_sljakanje_extra: 2,
    drain_alcohol_per_unit_above_threshold: 0.4,
    alcohol_threshold: 5,
    base_regen: 8,
    fitness_factor: 3,
    mirna_factor: 25,
    low_threshold: 50,
    low_modifier: 0.7
  },
  odnosi: {
    drain_music_dominance: 5,
    music_dominance_threshold: 0.7,
    drain_festival_event: 15,
    drain_unresponded_family: 10,
    unresponded_family_days: 3,
    drain_posthumna_extra: 1,
    porodica_factor: 20,
    crew_factor: 0.3
  },
  normalnost: {
    drain_no_hobby: 4,
    drain_radnicka_extra: 2,
    drain_posthumna_extra: 2,
    hobby_factor: 12,
    balance_event_factor: 25
  }
};

// -----------------------------------------------------------------------------
// CASCADE THRESHOLDS — Mile GDD sekcija 7 + 11.6
// -----------------------------------------------------------------------------
export const CASCADE = {
  health: {
    obs_threshold: 50,
    set_penalty_threshold: 30,
    set_penalty: 8,
    forced_cancellation_threshold: 30,
    forced_cancellation_chance: 0.3,
    hard_fail_threshold: 0,
    hard_fail_recovery_weeks_min: 4,
    hard_fail_recovery_weeks_max: 6,
    hard_fail_reputation_loss: 1
  },
  odnosi: {
    obs_threshold: 50,
    bridge_finance_blocked_threshold: 30,
    banishment_threshold: 0
  },
  normalnost: {
    obs_threshold: 50,
    reckless_toggle_threshold: 30,
    identity_crisis_threshold: 0,
    recog_decay_multiplier: 2.0
  },
  money: {
    bankrupt_threshold: -500,
    bankrupt_weeks_required: 4
  }
};

// -----------------------------------------------------------------------------
// ALKOHOL / NIKOTIN (S1 single substance) — Mile GDD sekcija 8
// -----------------------------------------------------------------------------
export const BOOZE = {
  apstinent: {
    money_bonus_pct: 0.20,
    health_drain_reduction_pct: 0.30
  },
  social_drinking: {
    weekly_intake: 2,
    money_cost_per_week: 10,
    health_drain_per_week: 0
  },
  scene_fitted: {
    weekly_intake: 5,
    money_cost_per_week: 25,
    health_drain_per_week: 1
  },
  dj_navike: {
    weekly_intake: 8,
    money_cost_per_week: 50,
    health_drain_per_week: 3,
    set_penalty_if_preset: 5
  },
  problem_zone: {
    weekly_intake: 12,
    money_cost_per_week: 100,
    health_drain_per_week: 5,
    set_penalty_if_preset: 10
  }
};

// -----------------------------------------------------------------------------
// SET QUALITY FORMULA — Mile GDD sekcija 11.5 + 3.4
// -----------------------------------------------------------------------------
export const SET_QUALITY = {
  base: 50,
  mixing_factor: 5,         // tier × 5, max +35 at tier 7
  camelot_factor: 20,       // (compatible/total) × 20
  freshness_factor: 15,     // avg freshness × 15
  desync_penalty_factor: 3,
  alcohol_preset_threshold: 2,
  alcohol_preset_penalty: 10,
  health_low_threshold: 50,
  health_low_penalty: 8,
  reputation_gain_threshold: 80,
  reputation_loss_threshold: 40,
  recog_gain_threshold: 100,
  rsvp_delta_factor: 0.8,
  range_min: 0,
  range_max: 150
};

// -----------------------------------------------------------------------------
// DE-SYNC TIMER po nedelji — Mile GDD sekcija 3.3
// -----------------------------------------------------------------------------
export const DESYNC = {
  timer_weeks_1_3: 90,
  timer_weeks_4_8: 60,
  timer_weeks_9_12: 45,
  mixing_tier_5plus_bonus: 0.20,
  failure_set_penalty: 15,
  failure_threshold_seconds: 5
};

// -----------------------------------------------------------------------------
// PASOŠ PEČAT — Mile GDD sekcija 4.4
// -----------------------------------------------------------------------------
export const PASOS = {
  default_on: true,
  cap_per_season: 50,
  crew_loyalty_per_pecat: 0.02,
  max_crew_loyalty_boost: 1.0
};

// -----------------------------------------------------------------------------
// RECOGNIZABILITY tier rast — Mile GDD sekcija 2.2 (V1) + 13.5
// -----------------------------------------------------------------------------
export const RECOGNIZABILITY = {
  tier_max: 7,
  tier_modifier: tier => 0.5 + (tier / 7) * 2.5,  // tier 0=0.5, tier 7=3.0
  decay_per_week_if_normalnost_low: 0.03
};

// -----------------------------------------------------------------------------
// PATH WIN CONDITIONS — Mile GDD sekcija 4.2 + 10
// (Sezona 1: 3 primary path-a explicit support; ostali emergent unutar engine-a)
// -----------------------------------------------------------------------------
export const PATHS = {
  pro_set: {
    name: 'Selektor',
    description: 'Manager-sim glavni clear. Reputation gradi se postupno, žrtvovanje pod kontrolom.',
    conditions: {
      reputation_min: 3,
      set_quality_avg_min: 70,
      sacrifice_all_above: 30
    },
    pera_finale: '"Pustio si svoj set. Sala te pamti. Sledeca sezona zna gde da te pita."'
  },
  networker: {
    name: 'Vezista',
    description: 'Scene Presence dominant. Pio si sa svima, svi te poznaju.',
    conditions: {
      network_min: 5,
      reputation_events_min: 4,
      crew_loyalty_min: 0.8
    },
    pera_finale: '"Pio si sa svima. Sad svi znaju kako si. Pitanje je da li to znaci da te poznaju."'
  },
  reckless_selector: {
    name: 'Prkosni',
    description: 'Signature picks definiše tvoj identitet. Knowledge gating te štiti od šuma.',
    conditions: {
      reckless_success_rate_min: 0.7,
      knowledge_min: 4,
      recognizability_min: 3,
      signature_picks_played_min: 12
    },
    pera_finale: '"Pustio si nesto sto niko ne pusta. Pitanje je da li si to cuo, ili si se nadao."'
  },
  the_lasting_dj: {
    name: 'The Lasting DJ',
    description: 'Pro Set sa sva tri žrtvovanje stat-a ≥ 40%. Dule Loop 41 parity.',
    is_achievement: true,
    conditions: {
      sacrifice_all_above: 40,
      pro_set_achieved: true,
      hobby_weeks_min: 8
    },
    pera_finale: '"Nikad ti se nije srusila kuca. Ne zato sto si imao srece — zato sto si umeo da nosis svoju tezinu, i tudju samo onoliko koliko si mogao. Niko ti nece praviti dokumentarac. Tvoja deca ce."'
  },
  the_tragic_genius: {
    name: 'The Tragic Genius',
    description: 'Sva tri žrtvovanje stat-a 0%. Replay value, ne soft-fail.',
    is_achievement: true,
    conditions: {
      sacrifice_all_zero: true
    },
    pera_finale: '"Bio si prelep. Onda nije bilo nikog tu da te vidi. Razlika ti je trajala duze nego sto si mislio."'
  }
};

// -----------------------------------------------------------------------------
// PERA TONE PHASE — Mile GDD sekcija 12.3 + 7.6
// -----------------------------------------------------------------------------
export const PERA_TONE = {
  supportive_until_week: 3,
  observation_neutral_until_week: 12,
  // brutal allowed only if pattern→collapse AND player has enough info
};

// -----------------------------------------------------------------------------
// SAVE KEY (localStorage)
// -----------------------------------------------------------------------------
export const SAVE_KEY = 'dj-za-pultom-v1-save';

// -----------------------------------------------------------------------------
// GIG SCHEDULE — baseline 1 žurka per 1.5 nedelje (Mile sekcija 4.1)
// -----------------------------------------------------------------------------
export const GIG_SCHEDULE = {
  baseline_weeks_between: 1.5,
  // Sezona 1: žurke se javljaju u nedeljama:
  // 2, 4, 5, 7, 8, 10, 11, 12 = 8 žurki baseline; +2 random ako Reputation tier raste
  default_weeks: [2, 4, 5, 7, 8, 10, 11, 12]
};
