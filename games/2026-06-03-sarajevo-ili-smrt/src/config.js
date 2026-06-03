// ============================================================
//  config.js — Sarajevo ili Smrt
//  Sve tuning konstante. Agenti čitaju ovaj fajl UMJESTO GDD-a.
// ============================================================

export const SAVE_KEY = 'sarajevo-ili-smrt-v1';
export const SAVE_INTERVAL_MS = 5000;
export const SAVE_INTERVAL_SEC = 5;

// --- LP ekonomija ---
export const BASE_LP = 10;
export const PRESTIGE_MULTIPLIER = [1.0, 1.5, 2.5]; // index = prestige level

// --- Vibe Wave parametri ---
export const VIBE_ZONE_MIN = -30;   // donja granica zone na [-100, +100] osi
export const VIBE_ZONE_MAX = 30;    // gornja granica
export const WAVE_PERIOD_SECONDS = 8;
export const WAVE_AMPLITUDE = 80;   // peek/valley vrijednost sinusoide

// --- Crowd mehanika ---
export const CROWD_TICK_MS = 100;          // 10 tikova/s
export const CROWD_DECAY_PER_TICK = -0.5;  // bazni pad crowd-a po tiku
export const CROWD_MAX_BASE = 60;          // bez A upgrade-a
export const CROWD_FAIL_THRESHOLD = 20;    // ispod ovoga = fail/bad-rep
export const SESSION_DURATION_SEC = 120;

// --- Slider fizika ---
export const SLIDER_MATCH_BONUS_MAX = 2.0;   // savršeno poklapanje
export const SLIDER_MISMATCH_PENALTY_K = 0.03;

// --- Prestige gejt ---
export const PRESTIGE_1_LP_GATE = 500;
export const PRESTIGE_2_LP_GATE = 2500;
export const GRBAVICA_UNLOCK_REP = 50;   // svaki od oba prethodna kvarta

// --- Sezona ---
export const SEASON_LENGTH = 7; // noći

// --- Upgrade troškovi (LP) ---
// Indeks = nivo koji se kupuje (0 = FREE/start, preskočeno je start stanje)
export const UPGRADE_COSTS = {
  A: [0, 50,  200,  500,  1200, 3000],
  B: [0, 60,  150,  380,  950,  2400],
  C: [0, 100, 250,  600,  1500],
  Cplus: [400, 1000], // Cplus[0] = nivo1, Cplus[1] = nivo2; P1 + C3 prereq
  D: [0, 90,  220,  550,  1400],
  E: [0, 70,  175,  440,  1100, 2800]
};

// --- DK Shop ---
export const DK_SHOP_ITEMS = [
  { id: 'brzi_start',      name: 'Brži start',      cost: 3,  description: 'B grana počinje nivo 1 (ne 0)' },
  { id: 'mreza_sjecanja',  name: 'Mreža sjećanja',  cost: 5,  description: 'C grana počinje nivo 1' },
  { id: 'mahala_sjaj',     name: 'Mahala sjaj',      cost: 8,  description: '+10% idle LP po satu permanentno' },
  { id: 'sarajevo_duh',    name: 'Sarajevo duh',     cost: 12, description: 'E grana počinje nivo 2, crowd floor +6' }
];

// --- Idle LP ---
export const IDLE_BASE_PER_TIER = [0.8, 1.1, 1.4]; // klub tier 1/2/3 → LP/h base

// --- Boje (sync sa Pera theme.css) ---
export const COLORS = {
  BG:           '#0a0a14',
  PRIMARY:      '#FF3366',
  TEAL:         '#00FFCC',
  GOLD:         '#FFD700',
  WHITE:        '#f0f0f0',
  DIM:          '#555577',
  BASCARSIJA:   '#C8860A',
  MARIJIN_DVOR: '#4A90D9',
  GRBAVICA:     '#8B45A0',
  CROWD_LOW:    '#FF3333',
  CROWD_MID:    '#FFAA00',
  CROWD_HIGH:   '#33FF88',
  CROWD_LEGEND: '#FFD700'
};

// --- Nazivi kvartova (key → display) ---
export const KVART_NAMES = {
  bascarsija:   'Baščaršija',
  marijin_dvor: 'Marijin Dvor',
  grbavica:     'Grbavica'
};

export const KVART_ORDER = ['bascarsija', 'marijin_dvor', 'grbavica'];

// --- Upgrade grane metadata ---
export const UPGRADE_META = {
  A: {
    name: 'Oprema',
    icon: '🎛',
    max_level: 5,
    levels: [
      { name: 'Stari laptop mix',   crowd_cap: 60,  idle_multi: 1.00, vibe_bonus: 0,    note: '' },
      { name: 'Budget CDJ-200',     crowd_cap: 70,  idle_multi: 1.25, vibe_bonus: 0,    note: '' },
      { name: 'Pioneer DDJ-800',    crowd_cap: 80,  idle_multi: 1.30, vibe_bonus: 0.08, note: 'Vibe Zone +8% šira' },
      { name: 'Pioneer CDJ-3000',   crowd_cap: 90,  idle_multi: 1.45, vibe_bonus: 0.08, note: '' },
      { name: 'Modular + Ableton',  crowd_cap: 95,  idle_multi: 1.60, vibe_bonus: 0.08, note: 'Perfect bonus +10%' },
      { name: 'Alien Rig (custom)', crowd_cap: 100, idle_multi: 1.75, vibe_bonus: 0.08, note: 'Crowd floor +5' }
    ]
  },
  B: {
    name: 'Repertoar',
    icon: '🎵',
    max_level: 5,
    levels: [
      { name: '10 pesama',         note: '' },
      { name: '50 pesama',         note: '+10% LP u matching kvartu' },
      { name: '200 pesama',        note: '+20%; Baščaršija wave speed normalised' },
      { name: 'Custom editi',      note: '+35%; +1 LP/tick kad crowd > 70' },
      { name: 'Ekskluzivni ID-ovi',note: '+50%; Legenda threshold → 85' },
      { name: 'Sarajevo Anthem',   note: '+75%; svi kvarti +10% LP' }
    ]
  },
  C: {
    name: 'Mreža',
    icon: '🤝',
    max_level: 4,
    levels: [
      { name: 'Slučajni poznanici', note: '' },
      { name: 'Lokalni promoteri',  note: 'Booking fee 1.2×; tier 2 dostupan' },
      { name: 'Regionalni agenti',  note: '1.45×; idle +20%' },
      { name: 'Međunarodni booking',note: '1.75×; tier 3 dostupan; DK +20%' },
      { name: 'Festival kontakti',  note: '2.10×; sezonski bonus event' }
    ]
  },
  Cplus: {
    name: 'Strani DJ Agent',
    icon: '✈',
    max_level: 2,
    levels: [
      { name: 'EU DJ agent',     note: 'Booking fee 2.5×; cameo bonus LP' },
      { name: 'Globalni agent',  note: '3.0×; +25% agent LP; DK +30%' }
    ]
  },
  D: {
    name: 'Brend',
    icon: '📱',
    max_level: 4,
    levels: [
      { name: 'Bezimeni DJ',        note: '' },
      { name: 'Lokalna legenda',    note: 'Viralni 1.15×; rep decay -5%' },
      { name: 'Sarajevski brand',   note: 'Animirana share; Avala CTA vidljiv' },
      { name: 'Regionalni artist',  note: 'Full branded; viralni 1.60×' },
      { name: 'Internacionalni',    note: 'Viralni 2.0×; DK bonus na share' }
    ]
  },
  E: {
    name: 'Sarajevo Know-how',
    icon: '🧠',
    max_level: 5,
    levels: [
      { name: 'Stranac',           crowd_floor: 0,  note: '' },
      { name: 'Poznanik mahale',   crowd_floor: 3,  note: 'Bad rep trajanje 1 noć' },
      { name: 'Komšija',           crowd_floor: 6,  note: 'Grbavica fail → 12%' },
      { name: 'Mahala favorit',    crowd_floor: 9,  note: 'Max bad rep/sezona: 3' },
      { name: 'Sarajevo ikona',    crowd_floor: 12, note: 'Grbavica fail → 5%; +5 rep/sesija' },
      { name: 'Legenda Sarajeva',  crowd_floor: 15, note: 'Instant fail eliminisan u Baščaršiji i MD' }
    ]
  }
};
