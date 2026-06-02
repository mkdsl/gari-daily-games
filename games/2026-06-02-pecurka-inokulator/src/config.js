// config.js — sve konstante za Pečurka Inokulator
// Ne hard-code-uj boje van ovog fajla.

export const CONFIG = {
  // 10 nivoa: svaki sa tuning parametrima
  LEVELS: [
    { id: 1,  windowMs: 800, speed: 0.8, scorePerHit: 100, bags: 3, speciality: 'tutorial' },
    { id: 2,  windowMs: 700, speed: 1.0, scorePerHit: 120, bags: 4, speciality: 'fake_zone' },
    { id: 3,  windowMs: 600, speed: 1.3, scorePerHit: 150, bags: 4, speciality: 'direction_change' },
    { id: 4,  windowMs: 500, speed: 1.6, scorePerHit: 180, bags: 4, speciality: 'double_inoculation' },
    { id: 5,  windowMs: 450, speed: 1.9, scorePerHit: 220, bags: 5, speciality: 'golden_window' },
    { id: 6,  windowMs: 400, speed: 2.2, scorePerHit: 260, bags: 5, speciality: 'blink_window' },
    { id: 7,  windowMs: 350, speed: 2.5, scorePerHit: 300, bags: 4, speciality: 'multi_bag_2', multiCount: 2 },
    { id: 8,  windowMs: 300, speed: 2.8, scorePerHit: 350, bags: 4, speciality: 'fake_and_golden' },
    { id: 9,  windowMs: 260, speed: 3.2, scorePerHit: 400, bags: 3, speciality: 'multi_bag_3', multiCount: 3 },
    { id: 10, windowMs: 220, speed: 3.6, scorePerHit: 500, bags: 4, speciality: 'all_combined', multiCount: 2 },
  ],

  // Brand paleta — svi canvas fillStyle dolaze odavde
  PALETTE: {
    bg:       '#1a3a2a',
    green:    '#7bc67a',
    red:      '#c0392b',
    gold:     '#f1c40f',
    fake:     '#7f8c8d',
    cream:    '#f5f0e8',
    wood:     '#8b5e3c',
    white:    '#ffffff',
    orange:   '#e67e22',
    bar_bg:   '#0d1f17',
    // Dodatne nijanse za render detalje
    dark_green:  '#0f2a1a',
    mid_green:   '#2d6a4f',
    light_green: '#95d5b2',
    mycelium:    '#d8f3dc',
    mold:        '#6c757d',
    wood_dark:   '#5c3d1e',
    wood_light:  '#a0724a',
    bar_border:  '#3a6a4a',
    gold_dark:   '#d4ac0d',
    streak_bg:   'rgba(230, 126, 34, 0.85)',
    overlay_bg:  'rgba(10, 30, 18, 0.92)',
    text_shadow: 'rgba(0,0,0,0.8)',
  },

  // Timing bar layout (relative prema canvas)
  TIMING_BAR: {
    width:    0.8,    // 80% canvas širine
    height:   20,     // px (logički)
    y_offset: 0.75,   // Y = 75% canvas visine
  },

  // Logička rezolucija — skalira se na CSS
  CANVAS_W: 480,
  CANVAS_H: 640,

  // Streak multiplikatori
  STREAK_MULTIPLIER: {
    threshold1: 3,
    mult1:      1.5,
    threshold2: 6,
    mult2:      2.0,
  },

  DEBOUNCE_MS:        150,
  GOLDEN_SCORE_MULT:  2.0,
  PERFECT_BONUS_MULT: 2.0,

  // Golden window parametri
  GOLDEN_WINDOW_DURATION_MS: 400,
  GOLDEN_WINDOW_INTERVAL_MS: 3000, // pojavljuje se svake 3s

  // Blink interval (nivo 6)
  BLINK_INTERVAL_MS: 100,

  // LocalStorage ključevi
  LS_KEY:       'pecurka_highscore_v1',
  LS_TUTORIAL:  'pecurka_tutorial_seen',
  LS_FIRSTRUN:  'pecurka_first_run',

  // Koliko top score-ova čuvamo
  HS_TOP_N: 3,

  // Level clear auto-advance delay (ms)
  LEVEL_CLEAR_AUTO_MS: 3000,

  // Bag layout
  BAG: {
    width:  60,
    height: 80,
  },
};
