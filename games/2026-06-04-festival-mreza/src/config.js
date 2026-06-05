/** @module config — Sve tuning konstante za Festival Mreža */

export const CONFIG = {
  // === BUDGET & INCOME ===
  STARTING_BUDGET_BY_TIER: { rookie: 2000, regional: 2400, balkanski_fenomen: 3000, legenda: 3800 },
  EVENT_SUCCESS_INCOME_BASE: 200,
  EVENT_SUCCESS_INCOME_PER_PCT: 15,
  INSURANCE_COST: 300,
  INSURANCE_PAYOUT: 500,

  // === PROMO ===
  PROMO_SOCIAL_REACH: 15, PROMO_SOCIAL_COST: 80, PROMO_SOCIAL_HALFLIFE: 2,
  PROMO_FLYER_REACH: 10, PROMO_FLYER_COST: 40, PROMO_FLYER_HALFLIFE: 4,
  PROMO_RADIO_REACH: 25, PROMO_RADIO_COST: 200, PROMO_RADIO_HALFLIFE: 5,

  // === BUZZ / CARRY-OVER ===
  BUZZ_CARRYOVER_FACTOR: 0.7,
  BUZZ_CARRYOVER_CAP: 70,
  SATISFACTION_BONUS_FROM_BUZZ: 0.30,

  // === BPM ===
  BPM_MIN: 90, BPM_MAX: 138, BPM_STEP: 2,
  BPM_COOL_RANGE: [90, 104], BPM_WARM_RANGE: [105, 122], BPM_HOT_RANGE: [123, 138],

  // === CROWD MIGRATION ===
  MIGRATION_SPEED: 1.2,
  REDIRECT_FOLLOW_RATE: 0.70,

  // === WAVE INTERVALS (seconds) ===
  WAVE_INTERVAL_BY_CITY: { nis: 30, sarajevo: 25, strand: 22, guncati: 20, avala: 18 },

  // === ENERGY DEBT ===
  ENERGY_DEBT_ACCUMULATE_RATE: 3.0,
  ENERGY_DEBT_DECAY_RATE: 1.5,
  ENERGY_DEBT_THRESHOLD: 0.7,
  ENERGY_DEBT_MAX_BASE: 50,

  // === WIN CONDITIONS ===
  SATISFACTION_WIN_THRESHOLD: 70,
  AVALA_GRAND_WIN_THRESHOLD: 90,

  // === PRESTIGE ===
  PRESTIGE_MULTIPLIER_BASE: 1.25,

  // === COORDINATORS ===
  COORDINATOR_BASE_COST: 100,
  COORDINATOR_RETENTION_BASE: 0.60,
  LOYALTY_GAIN_SUCCESS: 15,
  LOYALTY_GAIN_FAIL: 3,
  LOYALTY_DECAY_UNUSED: -5,

  // === PARTICLES ===
  PARTICLE_CAP_HIGH: 200,
  PARTICLE_CAP_MEDIUM: 150,
  PARTICLE_CAP_MOBILE: 80,
  PARTICLE_CAP_LOW: 40,
  FPS_DOWNGRADE_THRESHOLD: 30,

  // === PROCEDURAL SEED (BigInt LCG) ===
  CROWD_SEED_PRIME_A: 6364136223846793005n,
  CROWD_SEED_PRIME_B: 1442695040888963407n,

  // === AUDIO ===
  AUDIO_BPM_SYNC_DELAY: 300,
  AUDIO_OVERFLOW_COOLDOWN: 8000,

  // === STORAGE ===
  STORAGE_KEYS: {
    MACRO: 'festival_mreza_macro_v1',
    META: 'festival_mreza_meta_v1'
  },

  // === RENDER ===
  CROWD_RENDER_MODE: 'canvas',
  SAVE_INTERVAL_SEC: 15,

  // === ZONE CAPACITIES (percent of venue_capacity) ===
  ZONE_PCT: { dance_floor: 0.40, bar: 0.25, chill: 0.20, stage_front: 0.15 },

  // === VENUE TIERS by reputation ===
  VENUE_TIERS: [
    { minRep: 0,  maxRep: 19,  capacity: 200,  label: 'Underground' },
    { minRep: 20, maxRep: 49,  capacity: 400,  label: 'Club' },
    { minRep: 50, maxRep: 79,  capacity: 800,  label: 'Venue' },
    { minRep: 80, maxRep: 100, capacity: 1600, label: 'Arena' }
  ],

  // === LOYALTY TIER THRESHOLDS ===
  LOYALTY_TIERS: [0, 40, 100, 200, 350],

  // === BPM MOOD EFFECT TABLE ===
  BPM_MOOD_EFFECTS: {
    cool:  { cold: 0,     warm: -0.05, hot: -0.15 },
    warm:  { cold: 0.03,  warm: 0.08,  hot: 0.03  },
    hot:   { cold: -0.08, warm: 0.04,  hot: 0.10  }
  },

  // === OVERFLOW ===
  OVERFLOW_THRESHOLD_FACTOR: 1.1,
  OVERFLOW_MEDIUM_TIME: 15,
  OVERFLOW_HIGH_TIME: 30,

  // === CAREER TIER ORDERING ===
  CAREER_TIERS: ['rookie', 'regional', 'balkanski_fenomen', 'legenda'],

  // === CITY ORDER ===
  CITY_ORDER: ['nis', 'sarajevo', 'strand', 'guncati', 'avala'],
};
