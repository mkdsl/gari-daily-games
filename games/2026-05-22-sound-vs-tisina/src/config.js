// Core configuration — all constants in one place

export const GRID_W = 100;
export const GRID_H = 60;
export const CELL_SIZE_M = 10;
export const NEIGHBOR_LIMIT_DB = 70;
export const TICK_RATE = 10; // ticks per second
export const RENDER_FPS = 30;
export const GAME_DURATION_REAL_SEC = 120; // 6 game hours = 120 real seconds
export const GAME_START_HOUR = 22;
export const REAL_SEC_TO_GAME_MIN = 3; // 1 real sec = 3 game minutes

export const CANVAS_W = 800;
export const CANVAS_H = 480;
export const CELL_PX = CANVAS_W / GRID_W; // 8px per cell

export const SPL_COLORS = {
  off:    '#0d1117',
  vlow:   '#0a1a12',
  low:    '#0d2a1a',
  safe:   '#00ff88',
  warn:   '#ffaa00',
  hot:    '#ff6600',
  danger: '#ff2244'
};

export const COMPLAINT_MAX = 3;
export const COMPLAINT_COOLDOWN_SEC = 10;
export const COMPLAINT_THRESHOLD_DB = 71.5;

// SPL color thresholds in dB
export const SPL_THRESHOLDS = [
  { min: -Infinity, max: 55,  color: SPL_COLORS.off },
  { min: 55,        max: 62,  color: SPL_COLORS.vlow },
  { min: 62,        max: 68,  color: SPL_COLORS.low },
  { min: 68,        max: 75,  color: SPL_COLORS.safe },
  { min: 75,        max: 85,  color: SPL_COLORS.warn },
  { min: 85,        max: 95,  color: SPL_COLORS.hot },
  { min: 95,  max: Infinity,  color: SPL_COLORS.danger }
];

export function splToColor(db) {
  for (const t of SPL_THRESHOLDS) {
    if (db >= t.min && db < t.max) return t.color;
  }
  return SPL_COLORS.off;
}

// Career titles by XP
export const CAREER_TITLES = [
  { minXP: 0,    title: 'Asistent' },
  { minXP: 100,  title: 'DJ Bootleg' },
  { minXP: 300,  title: 'Booking Agent' },
  { minXP: 600,  title: 'Resident DJ' },
  { minXP: 1000, title: 'Promoter' },
  { minXP: 1500, title: 'Head Promoter' },
  { minXP: 2200, title: 'Venue Manager' },
  { minXP: 3000, title: 'Festival Director' },
  { minXP: 4500, title: 'Legenda' }
];
