// config.js — Sve tuning konstante za Mozaik Ludila
// Svi agenti koji trebaju broj čitaju odavde — nikad hardcode u logici.

// --- Grid ---
export const GRID_COLS = 8;
export const GRID_ROWS = 8;
export const CELL_SIZE = 60;           // px (desktop base, rekalkuliše se na resize)
export const CELL_SIZE_MOBILE = 38;    // px za ekrane < 480px širine
export const GRID_GAP = 2;            // px fuga između ćelija
export const GRID_OFFSET_Y = 120;     // px od vrha canvas-a do gornje ivice grida (HUD prostor)

// Fragment zona (ispod grida)
export const FRAGMENT_ZONE_HEIGHT = 100;  // px visina zone za prikaz fragmenata
export const FRAGMENT_ZONE_PADDING = 16;  // px razmak između grida i fragment zone

// --- Boje ---
/** @type {string[]} Pet boja pločica (terakota, safir, smaragd, zlatna, rubin) */
export const TILE_COLORS = [
  '#e07b54',  // terakota narančasta
  '#4a8dbf',  // safirno plava
  '#4db87a',  // smaragdna zelena
  '#f0c040',  // zlatna žuta
  '#c0405a',  // rubin crvena
];

export const BG_COLOR = '#1a1d2e';       // tamna pozadina canvas-a
export const GROUT_COLOR = '#2e3350';    // boja fuga/linija grida
export const GHOST_INVALID_COLOR = 'rgba(255, 60, 60, 0.45)';  // crveni ghost za nevalidne pozicije

// --- Scoring ---
export const SCORE_WIN = 2500;
export const SCORE_PER_TILE = 10;          // poeni za jednu matched+obrisanu pločicu
export const SCORE_PLACEMENT_BONUS = 1;   // poeni po postavljenoj pločici fragmenta (ne množuje se comboom)
export const SCORE_PERFECT_ROW = 100;     // bonus za kompletan red iste boje
export const SCORE_PERFECT_COL = 100;     // bonus za kompletnu kolonu iste boje
export const SCORE_PERFECT_QUAD = 25;     // bonus za 2×2 kvadrant iste boje

// --- Combo ---
export const COMBO_MAX = 5;               // maksimalni combo multiplier (index = combo_count, capped na 5)
/** @type {number[]} Indeks = broj uzastopnih match poteza (0 = nema, 1 = ×1, 2 = ×2, ...) */
export const COMBO_MULTIPLIERS = [1, 1, 2, 3, 4, 5];  // combo_count 0 ili 1 → ×1, 2 → ×2, itd.

// --- Hint ---
export const HINT_THRESHOLD = 3;          // min pločica iste boje u grupi da se aktivira hint glow
export const HINT_SHADOW_BLUR = 12;       // px shadowBlur za hint glow

// --- Fragment queue ---
export const FRAGMENT_QUEUE_SIZE = 3;     // ukupno fragmenata u queue (1 aktivan + 2 peek)

// --- Particle sistem ---
export const PARTICLE_COUNT = 8;          // čestica po matched ćeliji
export const PARTICLE_LIFETIME = 240;     // ms trajanje čestice
export const PARTICLE_SPEED_MIN = 60;     // px/s min brzina čestice
export const PARTICLE_SPEED_MAX = 120;    // px/s max brzina čestice
export const PARTICLE_SIZE = 4;           // px kvadrat čestice

// --- Animacije ---
export const MATCH_ANIM_DURATION = 400;    // ms ukupno trajanje match animacije
export const INPUT_BLOCK_DURATION = 160;   // ms blokiranje inputa tokom brisanja
export const MATCH_FLASH_PERIOD = 80;      // ms period treperenja matched ćelija
export const MATCH_FLASH_COUNT = 2;        // broj treperenja pre brisanja

export const PLACEMENT_SHAKE_FRAMES = 3;  // frejmova za shake pri nevalidnom postavljanju
export const PLACEMENT_SHAKE_OFFSET = 4;  // px amplituda shake-a

export const COMBO_PULSE_OPACITY = 0.15;  // max opacity zlatnog combo overlay-a
export const COMBO_PULSE_DURATION = 600;  // ms trajanje combo pulse animacije
export const COMBO_TEXT_DURATION = 1200;  // ms prikaz "COMBO ×N!" teksta na ekranu
export const COMBO_MIN_FOR_PULSE = 3;     // min combo za zlatni pulse overlay

// --- Ghost preview ---
export const GHOST_OPACITY_VALID = 0.45;    // opacity validnog ghost fragmenta
export const GHOST_OPACITY_INVALID = 0.45;  // opacity nevalidnog ghost (boja = crvena)
export const GHOST_BORDER_COLOR = 'rgba(255, 255, 255, 0.8)';
export const GHOST_BORDER_WIDTH = 1.5;      // px border oko ghost ćelije

// --- Fragment vizual ---
export const SELECTED_SCALE = 1.1;   // scale selektovanog fragmenta u fragment zoni
export const PEEK_SCALE = 0.7;       // scale peek fragmenata
export const PEEK_OPACITY = 0.6;     // opacity peek fragmenata

// --- localStorage ključ ---
export const SAVE_KEY = 'mozaik-ludila-state';
export const HIGHSCORE_KEY = 'mozaik-ludila-highscore';

// --- Fragment phase pools (oblici po score fazama) ---
// Svaki entry: { id: string, weight: number }
export const PHASE_POOLS = [
  {
    // Faza 1: 0–499
    scoreMin: 0,
    scoreMax: 499,
    pool: [
      { id: 'Single', weight: 25 },
      { id: 'I2',     weight: 35 },
      { id: 'I3',     weight: 25 },
      { id: 'O',      weight: 15 },
    ],
  },
  {
    // Faza 2: 500–1499
    scoreMin: 500,
    scoreMax: 1499,
    pool: [
      { id: 'I2', weight: 20 },
      { id: 'I3', weight: 25 },
      { id: 'I4', weight: 15 },
      { id: 'L',  weight: 15 },
      { id: 'J',  weight: 15 },
      { id: 'O',  weight: 10 },
    ],
  },
  {
    // Faza 3: 1500–2499
    scoreMin: 1500,
    scoreMax: 2499,
    pool: [
      { id: 'I3', weight: 10 },
      { id: 'I4', weight: 15 },
      { id: 'L',  weight: 20 },
      { id: 'J',  weight: 20 },
      { id: 'T',  weight: 15 },
      { id: 'S',  weight: 10 },
      { id: 'Z',  weight: 10 },
    ],
  },
  {
    // Faza 4: 2500+ (posle win, novi run) — svi oblici uniformno
    scoreMin: 2500,
    scoreMax: Infinity,
    pool: [
      { id: 'Single', weight: 10 },
      { id: 'I2',     weight: 10 },
      { id: 'I3',     weight: 10 },
      { id: 'I4',     weight: 10 },
      { id: 'L',      weight: 10 },
      { id: 'J',      weight: 10 },
      { id: 'T',      weight: 10 },
      { id: 'S',      weight: 10 },
      { id: 'Z',      weight: 10 },
      { id: 'O',      weight: 10 },
    ],
  },
];
