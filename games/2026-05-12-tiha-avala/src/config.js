// config.js — sve konstante igre

export const TERRAIN_MOD = {
  open: 0,
  forest: -10,
  valley: 7,
  asphalt: 4,
  hill_shadow: -18
};

export const SPL_FAIL_THRESHOLD = 70;    // dB — komšija limit
export const SPL_WARN_THRESHOLD = 67;   // dB — early warning
export const HAPPINESS_WIN_THRESHOLD = 0.70;
export const HAPPINESS_FAIL_THRESHOLD = 0.50;
export const WIN_DURATION_MS = 10000;   // 10s oba uslova
export const FAIL_CROWD_DURATION_MS = 5000; // 5s publika ispod 0.5
export const WIND_PERIOD_MS = 8000;
export const WIND_AMPLITUDE = 4;

export const SPL_MIN = 80;
export const SPL_MAX = 120;
export const BASS_MIN = 0;
export const BASS_MAX = 1;
export const ANGLE_MIN = -60;
export const ANGLE_MAX = 60;

export const CANVAS_BG = '#0a1a0a';
