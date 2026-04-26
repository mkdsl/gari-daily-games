export const CONFIG = {
  SAVE_KEY: 'rovovi-i-rusevine',
  SAVE_INTERVAL_SEC: 10,

  // Grid
  COLS: 12,
  ROWS: 8,
  CELL_SIZE: 60,
  MOBILE_BREAKPOINT: 600,
  MOBILE_COLS: 9,
  MOBILE_ROWS: 6,

  // Turn
  MAX_TURNS: 20,
  ANIM_DURATION_MS: 700,

  // Ammo
  AMMO_START: 20,
  AMMO_SHOOT: 2,
  AMMO_SMOKE: 3,

  // Unit stats
  UNITS: {
    SOLDIER:    { hp: 3, move: 2, range: 2, attack: 1 },
    RIFLEMAN:   { hp: 2, move: 1, range: 2, attack: 1 },
    MACHINEGUN: { hp: 3, move: 0, range: 3, attack: 1, attacksPerTurn: 2 },
    OFFICER:    { hp: 1, move: 1, range: 0, attack: 0, buffRadius: 1 },
    ARTILLERY:  { hp: 4, move: 0, range: 99, attack: 1, fireEvery: 3 }
  },

  // Line Y coordinates (0=top, 7=bottom)
  PLAYER_START_Y: 6,
  LINE_Y: [4, 2, 0],

  // Scoring
  SCORE: {
    S: { maxTurns: 12, minAmmo: 8, noLosses: true },
    A: { maxTurns: 16, minAmmo: 3 },
    B: { maxTurns: 20 }
  },

  COLORS: {
    BG:         '#1a1208',
    GROUND:     '#2B1B0E',
    TRENCH:     '#3d2810',
    RUBBLE:     '#4a3520',
    BLOCKED:    '#120a04',
    GRID_LINE:  '#3d2810',
    PLAYER:     '#4A5C2A',
    PLAYER_SEL: '#7ab03a',
    ENEMY:      '#8B2500',
    HIGHLIGHT:  'rgba(120,180,60,0.35)',
    ATTACK_HL:  'rgba(180,60,30,0.45)',
    SMOKE:      'rgba(180,170,150,0.55)',
    HIT_FLASH:  'rgba(255,60,0,0.7)',
    TEXT:       '#D4C9A8',
    AMMO:       '#c8a84b',
    HP_FULL:    '#4A5C2A',
    HP_EMPTY:   '#3d2810'
  }
};
