/** @fileoverview All game constants and tuning values for Guncati Grand */

export const CONFIG = {
  WEEKS: 10,
  WEEKLY_BUDGET: 500,

  // Budget kategorije + caps
  CATEGORIES: {
    gradnja:   { cap: 250, baseEffect: { crowdCap: 15, revenuePct: 2 }, perUnit: { crowdCap: 1 } }, // per 10 GC
    hrana:     { cap: 200, baseEffect: { wellbeing: 10 }, perUnit: { wellbeing: 1 } },
    marketing: { cap: 200, baseEffect: { ticketRate: 8 }, perUnit: { ticketRate: 0.7 } }, // diminishing >150
    zajednica: { cap: 200, baseEffect: { wellbeing: 12 }, perUnit: { wellbeing: 1.25 } }  // per 8 GC
  },

  // Hrana+Zajednica WB kombinovani cap = 100
  WB_COMBO_CAP: 100,

  // Tom Sawyer
  TOM_SAWYER_THRESHOLD: 60,         // WB% iznad kojeg je besplatan rad
  TOM_SAWYER_SAVINGS_PER_POINT: 4,  // GC uštevina po 1% WB iznad 60
  VOLUNTEER_COST: 20,               // GC/volonter/nedelja kad WB < 60%

  // WB decay
  WB_DECAY_NO_INVEST: 5,            // % pada/nedelji bez Hrana/Zajednica
  WB_DECAY_POST_EVENT: 10,          // % ekstra posle event-a
  WB_DECAY_FINALE: 15,              // % ekstra posle Grand Finale
  WB_MIN: 20,

  // Marketing diminishing returns
  MARKETING_LINEAR_CAP: 150,        // GC granica pre diminishing
  MARKETING_RATE_ABOVE_CAP: 0.03,
  MARKETING_TOTAL_CAP_PCT: 18,

  // Building tipovi (id: { name, levels: [{cost, effect}] })
  BUILDINGS: {
    pozornica: {
      name: 'Pozornica',
      emoji: '🎪',
      levels: [
        { cost: 80,  crowdCap: 50,  djSlots: 1 },
        { cost: 120, crowdCap: 80,  djSlots: 2, unlockWeek: 4, unlockCrowdCap: 150 },
        { cost: 200, crowdCap: 120, djSlots: 3, unlockWeek: 7, unlockRevenue: 3000 }
      ]
    },
    wc: {
      name: 'WC Blok',
      emoji: '🚻',
      levels: [
        { cost: 40, wellbeing: 10, crowdCapPenaltyRemoval: 20 },
        { cost: 60, wellbeing: 15 },
        { cost: 80, wellbeing: 20 }
      ]
    },
    satre: {
      name: 'Šatre',
      emoji: '⛺',
      levels: [
        { cost: 50, crowdCap: 25, revenuePct: 5 },
        { cost: 70, crowdCap: 40, revenuePct: 8 },
        { cost: 100, crowdCap: 60, revenuePct: 12, unlockBuilding: { parking: 1 } }
      ]
    },
    bar: {
      name: 'Bar',
      emoji: '🍺',
      levels: [
        { cost: 60,  revenuePct: 3, wellbeing: 5 },
        { cost: 90,  revenuePct: 5, wellbeing: 8 },
        { cost: 130, revenuePct: 8, wellbeing: 12, unlockBuilding: { wc: 2 } }
      ]
    },
    parking: {
      name: 'Parking',
      emoji: '🅿️',
      locked: true,
      levels: [
        { cost: 35, marketingMult: 1.1 },
        { cost: 50, marketingMult: 1.2 },
        { cost: 70, marketingMult: 1.3 }
      ]
    }
  },
  MAX_BUILDING_UPGRADES_PER_WEEK: 2,

  // Crowd base
  CROWD_BASE: 100,
  CROWD_WORD_OF_MOUTH_PER_WEEK: 15,
  CROWD_MARKETING_100_PER_WEEK: 40,
  BUILDING_CROWDCAP_MULT: 1.3, // kad je sve na L1

  // Grand Finale
  FINALE_DURATION_SEC: 900,       // 15 min
  FINALE_BASE_MOOD: 70,
  FINALE_MOOD_HYPE_WEIGHT: 0.3,
  FINALE_MOOD_WB_WEIGHT: 0.2,
  DJ_HYPE_RAMP: 3,                // %/min
  DJ_HYPE_TRANSITION_GOOD: 20,
  DJ_HYPE_TRANSITION_BAD: -10,
  DJ_TRANSITION_WINDOW_SEC: 3,

  // Ticket pricing
  TICKET_RATE_BASE: 12,           // GC/posetilac base

  // Final Score
  REVENUE_TARGET: 5000,
  SCORE_HAPPINESS_WEIGHT: 0.4,
  SCORE_REVENUE_WEIGHT: 0.35,
  SCORE_COMMUNITY_WEIGHT: 0.25,

  // Win thresholds
  WIN_LEGEND: 7.5,
  WIN_DECENT: 5.0,

  // Prestige
  PRESTIGE_REP_THRESHOLDS: [30, 50, 70, 90, 110],

  // Volunteer pool unlock schedule
  VOLUNTEER_UNLOCK_SCHEDULE: {
    1: ['ana'],
    2: ['mika', 'jovana'],
    3: ['dragan', 'djule'],
    5: ['maja', 'biljana']
  },

  // Task definitions
  TASKS: {
    kopanje:  { name: 'Kopanje', emoji: '⛏️',  energyCost: 4 },
    tesanje:  { name: 'Tesanje', emoji: '🪚',  energyCost: 4 },
    kuvanje:  { name: 'Kuvanje', emoji: '🍳',  energyCost: 2 },
    foto:     { name: 'Foto',    emoji: '📸',  energyCost: 2 },
    bar:      { name: 'Bar',     emoji: '🍺',  energyCost: 2 },
    admin:    { name: 'Admin',   emoji: '📋',  energyCost: 2 },
    rest:     { name: 'Odmor',   emoji: '😴',  energyCost: 0, isRest: true },
    hrana_r:  { name: 'Hrana',   emoji: '🍲',  energyCost: 0, isRecovery: true }
  },

  // Audio
  AUDIO_ENABLED_DEFAULT: true,

  // Save key
  SAVE_KEY: 'guncati_grand_save_v1'
};

export default CONFIG;
