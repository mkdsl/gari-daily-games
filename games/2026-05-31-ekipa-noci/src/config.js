/**
 * @file config.js
 * Central constants for Ekipa Noći.
 * Import everything you need from here — no magic numbers in system files.
 */

/** @type {string} localStorage namespace key */
export const STORAGE_KEY = 'ekipa_noci_state';

/** @type {string} localStorage key for meta (runs, best score) */
export const STORAGE_META_KEY = 'ekipa_noci_meta';

// ---------------------------------------------------------------------------
// ROLES
// ---------------------------------------------------------------------------

/** @type {string[]} Ordered draft roles — one per draft round */
export const ROLES = ['dj', 'host', 'sound', 'video', 'security'];

/** @type {number} How many cards are offered per role during draft */
export const HAND_SIZE = 3;

// ---------------------------------------------------------------------------
// TIERS
// ---------------------------------------------------------------------------

/**
 * Cost ranges per tier.
 * @type {{ [tier: number]: { min: number, max: number } }}
 */
export const TIER_COST_RANGES = {
  1: { min: 5, max: 8 },
  2: { min: 9, max: 15 },
  3: { min: 16, max: 20 },
};

/** @type {number[]} All valid tier numbers */
export const ALL_TIERS = [1, 2, 3];

/**
 * Determine a card's tier from its cost.
 * @param {number} cost
 * @returns {number} tier (1 | 2 | 3)
 */
export function tierFromCost(cost) {
  if (cost <= TIER_COST_RANGES[1].max) return 1;
  if (cost <= TIER_COST_RANGES[2].max) return 2;
  return 3;
}

// ---------------------------------------------------------------------------
// XP THRESHOLDS — card unlock gates
// ---------------------------------------------------------------------------

/**
 * XP thresholds used by cards' locked_until_xp.
 * Also used by progression.js to drive unlock checks.
 * @type {{ [label: string]: number }}
 */
export const XP_GATES = {
  NONE: 0,
  GATE_40: 40,
  GATE_60: 60,
  GATE_80: 80,
  GATE_100: 100,
  GATE_120: 120,
};

// ---------------------------------------------------------------------------
// SCORE BRACKETS → XP + BUDGET BONUS + TIER AVAILABILITY
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ScoreBracket
 * @property {number}   min
 * @property {number}   max
 * @property {number}   xp_earned
 * @property {number}   budget_bonus
 * @property {number[]} available_tiers
 * @property {string}   label
 */

/** @type {ScoreBracket[]} Ordered from highest to lowest for easy lookup */
export const SCORE_BRACKETS = [
  { min: 86, max: 100, xp_earned: 50, budget_bonus: 20, available_tiers: [1, 2, 3], label: 'Legenda' },
  { min: 61, max: 85,  xp_earned: 30, budget_bonus: 12, available_tiers: [1, 2],    label: 'Zvezda'  },
  { min: 31, max: 60,  xp_earned: 15, budget_bonus: 5,  available_tiers: [1, 2],    label: 'Solid'   },
  { min: 0,  max: 30,  xp_earned: 5,  budget_bonus: 0,  available_tiers: [1],       label: 'Flop'    },
];

/**
 * Return the ScoreBracket for a given event score.
 * @param {number} score  0-100
 * @returns {ScoreBracket}
 */
export function getBracket(score) {
  return SCORE_BRACKETS.find(b => score >= b.min && score <= b.max) ?? SCORE_BRACKETS[SCORE_BRACKETS.length - 1];
}

/**
 * Return tier unlock label for tier-3 gate:
 * Tier 3 cards become draftable only when the previous event was 'Legenda'.
 * @param {number} prevScore
 * @returns {boolean}
 */
export function isTier3Unlocked(prevScore) {
  return getBracket(prevScore).label === 'Legenda';
}

// ---------------------------------------------------------------------------
// EVENT SCORE CAP
// ---------------------------------------------------------------------------

/** @type {number} Maximum possible event score */
export const MAX_EVENT_SCORE = 100;

/** @type {number} Minimum possible event score */
export const MIN_EVENT_SCORE = 0;

// ---------------------------------------------------------------------------
// AUDIENCE MATCH
// ---------------------------------------------------------------------------

/** @type {number} Points per matched preferred tag */
export const AUDIENCE_MATCH_PER_TAG = 5;

/** @type {number} Bonus vibe points when Ela Vizual matches viralmoment preferred tag */
export const ELA_VIRALMOMENT_BONUS = 7;

/** @type {number} Standard audience match bonus for Ela Vizual if it's not the special tag */
export const ELA_STANDARD_AUDIENCE_BONUS = 5;

// ---------------------------------------------------------------------------
// TOUR SCORE WEIGHTS
// ---------------------------------------------------------------------------

/**
 * Per-event weights for Tour Score calculation.
 * Key = event_number (1-indexed).
 * @type {{ [eventNum: number]: number }}
 */
export const TOUR_WEIGHTS = {
  1: 0.8,
  2: 0.9,
  3: 1.0,
  4: 1.1,
  5: 1.3,
};

/** @type {number} Loyalty bonus per member who survived 3+ events */
export const LOYALTY_BONUS_PER_MEMBER = 5;

/** @type {number} Consistency bonus: ALL events >= 31 */
export const CONSISTENCY_BONUS_ALL_31 = 10;

/** @type {number} Consistency bonus: first 4 events all >= 61 */
export const CONSISTENCY_BONUS_4_SOLID = 5;

// ---------------------------------------------------------------------------
// CREW RETENTION THRESHOLDS
// ---------------------------------------------------------------------------

/** @type {number} Event score threshold: at or above this, burnout members still stay */
export const RETENTION_SCORE_FLOOR = 61;

/** @type {number} How many conflict entries before automatic departure */
export const DEPARTURE_CONFLICT_THRESHOLD = 2;

/** @type {number} Events survived before Loyal status is granted */
export const LOYALTY_THRESHOLD = 3;

/** @type {number} Base score bonus per event after reaching Loyal status */
export const LOYALTY_SCORE_BONUS = 2;

/** @type {number} Maximum total loyalty bonus applicable */
export const LOYALTY_SCORE_MAX_BONUS = 6;

// ---------------------------------------------------------------------------
// GRAND FINALE
// ---------------------------------------------------------------------------

/** @type {string[]} Pool of tags that can be picked for Grand Finale preferred_tags */
export const GRAND_FINALE_TAG_POOL = [
  'hype', 'techno', 'precision', 'crowdread',
  'versatile', 'magnet', 'charisma', 'stamina',
];

/** @type {number} How many preferred tags are selected for Grand Finale */
export const GRAND_FINALE_TAG_COUNT = 2;

// ---------------------------------------------------------------------------
// PHASE CONSTANTS
// ---------------------------------------------------------------------------

/**
 * @typedef {'intro'|'draft'|'resolve'|'crew_update'|'next_event'|'tour_end'} GamePhase
 */

/** @type {GamePhase[]} All valid phases in order */
export const PHASES = ['intro', 'draft', 'resolve', 'crew_update', 'next_event', 'tour_end'];

// ---------------------------------------------------------------------------
// SPECIAL ABILITY CONSTANTS
// to avoid magic numbers in card.js evaluations
// ---------------------------------------------------------------------------

export const ABILITY = Object.freeze({
  DJ_DRAZEN_BONUS: 4,
  DJ_LENA_HI_BONUS: 6,
  DJ_LENA_LO_PENALTY: -3,
  DJ_LENA_MIDPOINT: 50,
  DJ_PHANTOM_CONFLICT_REROLL: 1,
  DJ_TONI_VET_COUNT: 3,
  DJ_TONI_BONUS: 3,
  DJ_ZARA_NEXT_EVENT_BONUS: 5,
  HOST_MIA_VIBE_BONUS: 4,
  HOST_DARKO_CONFLICT_REDUCE: 2,
  HOST_SASHA_HH_BONUS: 10,
  HOST_SASHA_INTRO_PENALTY: -10,
  SOUND_BORO_BONUS: 5,
  SOUND_MARKO_FINALE_BONUS: 8,
  SOUND_PETRA_BURNOUT_REDUCE: 1,
  SOUND_LUKA_EXTRO_BONUS: 3,
  VIDEO_VUK_BONUS: 4,
  VIDEO_ELA_VIRAL_BONUS: 7,
  VIDEO_ELA_STANDARD_BONUS: 5,
  VIDEO_REX_VIBE_BONUS: 5,
  VIDEO_REX_LOGISTICS_PENALTY: -3,
  VIDEO_KIKA_MATCH_BONUS: 2,
  SEC_ZORAN_RISKY_REDUCE: 3,
  SEC_BRANKA_BONUS: 5,
  SEC_SIMO_NO_CONFLICT_BONUS: 10,
  SEC_SIMO_HIGH_CONFLICT_PENALTY: -5,
  SEC_SIMO_CONFLICT_HIGH_THRESHOLD: 10,
  SEC_BOBAN_HYPE_BONUS: 6,
  SEC_BOBAN_NO_HYPE_PENALTY: -4,
});
