/**
 * @file config.js
 * @description Sve tuning konstante za Frekventni Grad.
 *              Menjaj ovde — nigde drugde ne hardkoduj vrednosti.
 *
 * Moduli koji citaju ovo: main.js, state.js, scoring.js, energy.js,
 *                         beatScheduler.js, render.js, ui.js
 */

export const CONFIG = {
  // ─── Persistence ────────────────────────────────────────────────────────────
  SAVE_KEY: 'frekventni-grad-save',
  SAVE_INTERVAL_SEC: 10,

  // ─── Timing windows (sekunde) ───────────────────────────────────────────────
  /** Maksimalna apsolutna razlika za PERFECT ocenu */
  TIMING_PERFECT: 0.040,
  /** Maksimalna apsolutna razlika za GOOD ocenu */
  TIMING_GOOD: 0.080,

  // ─── Scoring ────────────────────────────────────────────────────────────────
  SCORE_PERFECT: 100,
  SCORE_GOOD: 60,
  SCORE_MISS: 0,

  // ─── Combo i multiplier ─────────────────────────────────────────────────────
  /** Broj uzastopnih PERFECT/GOOD udara pre nego što multiplier poraste za 1 */
  COMBO_PER_MULTIPLIER: 8,
  /** Maksimalni multiplier */
  MULTIPLIER_MAX: 4,

  // ─── Energy bar ─────────────────────────────────────────────────────────────
  ENERGY_START: 80,         // % na početku noći
  ENERGY_MAX: 100,
  ENERGY_DELTA_PERFECT: +3,
  ENERGY_DELTA_GOOD: +1,
  ENERGY_DELTA_MISS: -8,

  // ─── Beat travel ────────────────────────────────────────────────────────────
  /**
   * Sekunde pre scheduledTime kada beat circle pojavljuje na vrhu ekrana.
   * visualProgress = 1 − (remainingTime / BEAT_TRAVEL_TIME)
   */
  BEAT_TRAVEL_TIME: 1.8,

  // ─── Lane layout ────────────────────────────────────────────────────────────
  LANE_COUNT: 3,
  /** 0 = levo (A), 1 = centar (S/Space), 2 = desno (D) */
  LANE_KEYS: ['a', 's', 'd'],

  // ─── BPM po klubu ───────────────────────────────────────────────────────────
  /** [podrum, krov, metro, orbita] */
  CLUB_BPM: [110, 120, 130, 140],

  // ─── Progression ────────────────────────────────────────────────────────────
  NIGHTS_PER_CLUB: 5,
  SONGS_PER_NIGHT: 3,
  /** Broj ukupnih noći po klubu pre prestige-a (sve 4 kluba × 5 noći = 20) */
  PRESTIGE_AFTER_NIGHTS: 20,
  PRESTIGE_SPEED_MULTIPLIER: 1.2,

  // ─── Neon boje ──────────────────────────────────────────────────────────────
  COLORS: {
    BG: '#0D0D1A',
    LANE_LINE: '#1A1A33',
    TIMING_LINE: '#FFFFFF',
    BEAT_DEFAULT: '#E040FB',
    BEAT_LANE: ['#E040FB', '#00E5FF', '#FFD740'],  // levo, centar, desno
    HIT_PERFECT: '#FFD740',
    HIT_GOOD: '#00E5FF',
    HIT_MISS: '#FF5252',
    ENERGY_FILL: '#E040FB',
    ENERGY_BG: '#1A1A33',
    COMBO: '#00E5FF',
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_DIM: '#666688',
    GLOW_COLOR: '#E040FB'
  },

  // ─── Render geometrija ──────────────────────────────────────────────────────
  /** Rastojanje timing linije od dna ekrana (px, logical) */
  TIMING_LINE_Y_OFFSET: 120,
  /** Poluprečnik beat circle-a (px, logical) */
  BEAT_RADIUS: 28,
  /** Trajanje hit sonar ring animacije u sekundama */
  HIT_RING_DURATION: 0.35,

  // ─── Setlist kartice (kozmetičke) ───────────────────────────────────────────
  /** Boje teme kartice [svetla, tamna] */
  SETLIST_THEMES: [
    ['#E040FB', '#2D0040'],
    ['#00E5FF', '#00233A'],
    ['#FFD740', '#3A2F00']
  ]
};
