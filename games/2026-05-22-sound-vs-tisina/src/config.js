// config.js — sve konstante za Sound vs Tišina

export const GRID_W = 100;
export const GRID_H = 60;
export const CELL_SIZE_M = 10;
export const NEIGHBOR_LIMIT_DB = 70;
export const TICK_RATE = 10; // ticks/sec
export const RENDER_FPS = 30;
export const GAME_DURATION_REAL_SEC = 120; // 120 real sec = 6h game time
export const GAME_TIME_START = 22 * 60; // 22:00 in minutes
export const GAME_TIME_END = 28 * 60;   // 04:00 next day = 28:00
export const REAL_TO_GAME_RATIO = 3;    // 1 real sec = 3 game minutes

export const CANVAS_W = 800;
export const CANVAS_H = 480;
export const CELL_PX = Math.floor(CANVAS_W / GRID_W); // 8
export const CELL_PY = Math.floor(CANVAS_H / GRID_H); // 8

export const SPL_COLORS = {
  off:    '#0d1117',
  low:    '#0a2a1a',
  safe:   '#00ff88',
  warn:   '#ffaa00',
  hot:    '#ff6600',
  danger: '#ff2244'
};

// SPL thresholds for color mapping
export const SPL_THRESHOLDS = [
  { max: 55,  color: SPL_COLORS.off },
  { max: 65,  color: SPL_COLORS.low },
  { max: 75,  color: SPL_COLORS.safe },
  { max: 85,  color: SPL_COLORS.warn },
  { max: 95,  color: SPL_COLORS.hot },
  { max: 999, color: SPL_COLORS.danger }
];

export const COMPLAINT_COOLDOWN_SEC = 10;
export const MAX_COMPLAINTS = 3;
export const COMPLAINT_THRESHOLD_DB = 71.5;

export const XP_PER_WIN = 500;
export const XP_PER_COMPLAINT = -50;
export const XP_PER_HAPPINESS_POINT = 2;

export const CAREER_TITLES = [
  { minXp: 0,    title: 'Rookie' },
  { minXp: 500,  title: 'Asistent' },
  { minXp: 1200, title: 'Promoter Jr.' },
  { minXp: 2500, title: 'Promoter' },
  { minXp: 4500, title: 'Promoter Sr.' },
  { minXp: 7000, title: 'Stage Manager' },
  { minXp: 10000, title: 'Festival Boss' },
  { minXp: 15000, title: 'Legenda' },
  { minXp: 25000, title: 'Avala Elite' }
];
