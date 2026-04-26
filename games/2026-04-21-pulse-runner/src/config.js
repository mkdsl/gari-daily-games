/**
 * config.js — Sve tuning konstante za Pulse Runner.
 *
 * JEDINI izvor istine za brojeve. Svaki drugi modul importuje odavde.
 * Iz GDD-a: puls formula, grid tabela, HP pravila, score formula, palete.
 */

export const CONFIG = {
  /** localStorage ključ — čuva se SAMO highScore */
  SAVE_KEY: 'pulse-runner-hs',

  // ─── Grid dimenzije po nivoima (GDD tabela) ────────────────────────────────
  // Nivo 1-2: 7×7, Nivo 3-4: 8×8, Nivo 5-6: 9×9, Nivo 7-8: 10×10,
  // Nivo 9: 11×11, Nivo 10+: 12×12 (hard cap).
  GRID_SIZE_BY_LEVEL: [
    0,   // index 0 nekorišćen (nivo počinje od 1)
    7,   // nivo 1
    7,   // nivo 2
    8,   // nivo 3
    8,   // nivo 4
    9,   // nivo 5
    9,   // nivo 6
    10,  // nivo 7
    10,  // nivo 8
    11,  // nivo 9
    12   // nivo 10+ (fallback za sve više nivoe)
  ],

  /** Vraća veličinu grida za dati nivo (1-based). */
  gridSize(level) {
    const idx = Math.min(level, CONFIG.GRID_SIZE_BY_LEVEL.length - 1);
    return CONFIG.GRID_SIZE_BY_LEVEL[idx];
  },

  // ─── Gustina zidova po nivoima (procenat ćelija) ───────────────────────────
  // Formula: min(0.40, 0.20 + (level - 1) * 0.03) uz tabelu iz GDD-a.
  WALL_DENSITY_BY_LEVEL: [
    0,     // index 0 nekorišćen
    0.20,  // nivo 1
    0.23,  // nivo 2
    0.26,  // nivo 3
    0.29,  // nivo 4
    0.32,  // nivo 5
    0.35,  // nivo 6
    0.37,  // nivo 7
    0.38,  // nivo 8
    0.39,  // nivo 9
    0.40   // nivo 10+ (hard cap)
  ],

  /** Vraća gustinu zidova za dati nivo (0.0–1.0). */
  wallDensity(level) {
    const idx = Math.min(level, CONFIG.WALL_DENSITY_BY_LEVEL.length - 1);
    return CONFIG.WALL_DENSITY_BY_LEVEL[idx];
  },

  // ─── Broj collectibles po nivoima ──────────────────────────────────────────
  COLLECTIBLES_BY_LEVEL: [
    0,  // index 0 nekorišćen
    3, 3, 3, 3,   // nivo 1-4: 3 collectibles
    2, 2, 2, 2, 2, 2  // nivo 5+: 2 collectibles
  ],

  /** Vraća broj collectibles za dati nivo. */
  collectibleCount(level) {
    const idx = Math.min(level, CONFIG.COLLECTIBLES_BY_LEVEL.length - 1);
    return CONFIG.COLLECTIBLES_BY_LEVEL[idx];
  },

  // ─── Puls sistem ────────────────────────────────────────────────────────────
  /**
   * Puls interval formula iz GDD-a: max(0.65, 1.5 - (level - 1) * 0.09) sekundi.
   * @param {number} level - trenutni nivo (1-based)
   * @returns {number} interval u sekundama
   */
  pulseInterval(level) {
    return Math.max(0.65, 1.5 - (level - 1) * 0.09);
  },

  /** Input window = 80% puls intervala. Igrač može unositi smer u ovom periodu. */
  INPUT_WINDOW_RATIO: 0.80,

  // ─── HP sistem ──────────────────────────────────────────────────────────────
  /** Početni HP */
  HP_START: 3,
  /** Maksimalni HP */
  HP_MAX: 5,
  /** HP bonus za sakupljeni collectible */
  HP_PER_COLLECTIBLE: 1,
  /** Broj uzastopnih miss-a koji završava run */
  MISS_LIMIT: 3,

  // ─── Score formula ──────────────────────────────────────────────────────────
  /** Score = depth * SCORE_PER_DEPTH + totalCollected * SCORE_PER_COLLECTIBLE */
  SCORE_PER_DEPTH: 100,
  SCORE_PER_COLLECTIBLE: 25,

  // ─── Maze generator ─────────────────────────────────────────────────────────
  /** Maksimalan broj pokušaja generisanja pre smanjenja gustine */
  MAZE_MAX_RETRIES: 10,
  /** Smanjenje gustine zidova ako BFS ne uspe u prvih MAZE_MAX_RETRIES pokušaja */
  MAZE_DENSITY_FALLBACK_REDUCTION: 0.05,
  /** Broj dodatnih pokušaja posle smanjenja gustine */
  MAZE_FALLBACK_RETRIES: 5,

  // ─── Vizuelne konstante ─────────────────────────────────────────────────────
  COLORS: {
    /** Pozadina canvas-a */
    BG: '#0a0a12',
    /** Neaktivna grid ćelija */
    CELL_EMPTY: '#1a1a2e',
    /** Zid ćelija */
    CELL_WALL: '#0d0d1f',
    /** Igrač (električno crvena) */
    PLAYER: '#e94560',
    /** Collectible (toplo žuta) */
    COLLECTIBLE: '#f5a623',
    /** Exit (tirkizna) */
    EXIT: '#00d4aa',
    /** Grid linija */
    GRID_LINE: '#12122a',
    /** Puls flash (beli bljesak koji feid-uje ka pozadini) */
    PULSE_FLASH: '#ffffff',
    /** Level transition flash */
    LEVEL_FLASH: '#00d4aa',
    /** HUD tekst */
    HUD_TEXT: '#e5e5e5',
    /** Miss indicator */
    MISS_COLOR: '#e94560',
    /** Pun HP srce */
    HP_FULL: '#e94560',
    /** Prazan HP srce */
    HP_EMPTY: '#2a1a1e'
  },

  // ─── Animacije ──────────────────────────────────────────────────────────────
  /** Trajanje puls flash efekta u sekundama */
  PULSE_FLASH_DURATION: 0.3,
  /** Trajanje level transition flash-a u sekundama */
  LEVEL_FLASH_DURATION: 0.5,
  /** Pulsiranje igrača — period oscilacije u sekundama */
  PLAYER_PULSE_PERIOD: 1.2,

  // ─── Rendering ──────────────────────────────────────────────────────────────
  /** Padding oko grida u pikselima (logical) */
  GRID_PADDING: 16,
  /** Gap između ćelija grida u pikselima */
  CELL_GAP: 2,
  /** Zaobljenost uglova ćelije */
  CELL_BORDER_RADIUS: 3,

  // ─── Audio ──────────────────────────────────────────────────────────────────
  /** Puls zvuk: sine na ovoj frekvenciji */
  AUDIO_PULSE_FREQ: 60,
  /** Puls zvuk: trajanje u sekundama */
  AUDIO_PULSE_DURATION: 0.08,
  /** Collectible zvuk: početna frekvencija */
  AUDIO_COLLECT_FREQ_START: 440,
  /** Collectible zvuk: krajnja frekvencija */
  AUDIO_COLLECT_FREQ_END: 880,
  /** Collectible zvuk: trajanje u sekundama */
  AUDIO_COLLECT_DURATION: 0.08,
  /** Game over zvuk: početna frekvencija */
  AUDIO_GAMEOVER_FREQ_START: 880,
  /** Game over zvuk: krajnja frekvencija */
  AUDIO_GAMEOVER_FREQ_END: 110,
  /** Game over zvuk: trajanje u sekundama */
  AUDIO_GAMEOVER_DURATION: 0.6,
  /** Level transition "ding": frekvencija */
  AUDIO_LEVEL_FREQ: 528,
  /** Level transition "ding": trajanje */
  AUDIO_LEVEL_DURATION: 0.15
};
