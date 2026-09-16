/** @module config — sve tuning konstante za Turneja Planer */

export const STARTING_BUDGET = 3500;
export const STARTING_CREW_MOOD = 10;
export const STARTING_REPUTATION = 0;
export const STARTING_REACH = 0;

export const MAX_CREW_MOOD = 10;
export const MIN_CREW_MOOD = 0;
export const MAX_REPUTATION = 10;
export const MAX_REACH = 50;

export const GUNCATI_REP_GATE = 6.0;
export const MAX_CREW_SIZE = 5;
export const MIN_CREW_SIZE = 2;

export const CARDS_PER_CITY = 4;

/** @type {Record<string, Record<string, number>>} travel costs u EUR */
export const TRAVEL_COSTS = {
  beograd: {
    novi_sad: 144,
    nis: 504,
    sarajevo: 620,
    guncati: 216,
  },
  novi_sad: {
    beograd: 144,
    nis: 558,
    guncati: 324,
    sarajevo: 688, // NS→Sarajevo: via BG estimate
  },
  nis: {
    beograd: 504,
    novi_sad: 558,
    sarajevo: 674,
    guncati: 630,
  },
  sarajevo: {
    guncati: 530,
    beograd: 620,
    novi_sad: 688,
    nis: 674,
  },
  guncati: {
    beograd: 216,
    novi_sad: 324,
    nis: 630,
    sarajevo: 530,
  },
};

/** transport_alloc → mood delta, CQ delta */
export const TRANSPORT_ALLOC_TIERS = [
  { max: 80,  mood: -1.0, cq: -0.5 },
  { max: 150, mood:  0.0, cq:  0.0 },
  { max: 250, mood:  0.5, cq:  0.0 },
  { max: Infinity, mood: 1.0, cq: 0.0 },
];

/** tech_alloc → CQ delta */
export const TECH_ALLOC_TIERS = [
  { max: 200,       cq: -1.5 },
  { max: 400,       cq:  0.0 },
  { max: 700,       cq:  0.5 },
  { max: 1000,      cq:  1.0 },
  { max: Infinity,  cq:  1.5 },
];

/** promo_alloc → promo_mult formula cap */
export const PROMO_MULT_CAP = 1.5;
export const PROMO_REACH_BASE = 100;
export const PROMO_MULT_BASE = 200;

/** mood decay per transit by resilience */
export const MOOD_DECAY = {
  high: -0.5,
  med:  -1.0,
  low:  -1.5,
};

/** base mood decay per transit (before resilience) */
export const BASE_MOOD_DECAY_PER_TRANSIT = 1.0;

/** Sarajevo border extras */
export const BORDER_EXTRA_COST = 80;
export const BORDER_EXTRA_MOOD = -0.5;
export const BORDER_INCIDENT_PROB = 0.25;

/** @type {Array<{id:string, effects:Object, weight:number}>} border incidents */
export const BORDER_INCIDENTS = [
  { id: 'carinski',   label: 'Carinska kontrola',   effects: { crew_mood: -0.5 },              weight: 0.5 },
  { id: 'dokumenti',  label: 'Problem s dokumentima', effects: { budget: -150, crew_mood: -1.0 }, weight: 0.3 },
  { id: 'oprema',     label: 'Oprema zadržana',      effects: { budget: -300 },                 weight: 0.2 },
];

/** Prestige reset values */
export const PRESTIGE_RESET = {
  budget: 2500,
  reputation: 2.0,
  crew_mood: 10,
  reach: 0,
};

/** fan_db formula multipliers per ending */
export const FAN_DB_MULTIPLIERS = {
  TURNEJA_LEGENDA: 1.5,
  ZAVRSENO_I_PLACENO: 1.0,
  POREZ_I_DUG: 0.5,
  GUNCATI_ZATVOREN: 0,
};

/** promo_eff_bonus from fan_db */
export const PROMO_EFF_CAP = 0.3;

/** Skill effects per skill key */
export const SKILL_EFFECTS = {
  djing:      { cq_bonus_per_city: 1.0,  per_rank: true },
  visual:     { cq_bonus_per_city: 0.8,  reach_per_city: 0.5, per_rank: true },
  promo:      { promo_mult_bonus: 0.15,  per_rank: true },
  social:     { reach_per_city: 1.5,     per_rank: true },
  tech:       { cq_bonus_per_city: 0.5,  tech_risk_half: true, per_rank: true },
  logistics:  { travel_cost_mult: -0.10, per_rank: true },
  reputation: { rep_per_city: 0.3,       per_rank: true },
};

export const SAVE_KEY = 'turneja_planer_v1';
