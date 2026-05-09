// config.js — jedini izvor istine za sve GDD konstante
// Nema logike ovdje, samo podaci.

export const GAME_DURATION_S = 21600; // 6 sati

export const CLICK_ENERGY      = 2.5;
export const CLICK_COINS        = 5;
export const CLICK_COOLDOWN_MS  = 3000;

export const PASSIVE_COINS_PER_S = 1.0;

export const OFFLINE_CAP_S = 1800; // max 30 min offline

export const INITIAL_ENERGY = 50.0;

// ---------------------------------------------------------------------------
// Zone definicije
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Zone
 * @property {string} id
 * @property {string} name
 * @property {number} start_s  — početak u sekundama
 * @property {number} end_s    — kraj u sekundama (ekskluzivno)
 * @property {number} drain    — base drain /s (energy)
 * @property {number} mult     — drain multiplikator
 */

/** @type {Zone[]} */
export const ZONES = [
  {
    id:      'warmup',
    name:    'Zagrevanje',
    start_s: 0,
    end_s:   7200,
    drain:   0.030,
    mult:    1.0,
  },
  {
    id:      'peak',
    name:    'Vrhunac',
    start_s: 7200,
    end_s:   14400,
    drain:   0.050,
    mult:    1.5,
  },
  {
    id:      'afterhours',
    name:    'After Hours',
    start_s: 14400,
    end_s:   21600,
    drain:   0.075,
    mult:    2.0,
  },
];

// ---------------------------------------------------------------------------
// Upgrade tabela
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Upgrade
 * @property {string} id
 * @property {string} name
 * @property {number} effect       — pasivna retencija energy /s
 * @property {number} cost         — cijena u MC
 * @property {string} zone         — zona ID u kojoj se otključava
 */

/** @type {Upgrade[]} */
export const UPGRADES = [
  { id: 'U01', name: 'Bolji USB stick',        effect: 0.010, cost: 30,    zone: 'warmup'     },
  { id: 'U02', name: 'Hidratantni balzam',      effect: 0.015, cost: 80,    zone: 'warmup'     },
  { id: 'U03', name: 'Backup laptop',           effect: 0.020, cost: 180,   zone: 'warmup'     },
  { id: 'U04', name: 'Bežični in-ear monitor',  effect: 0.028, cost: 350,   zone: 'warmup'     },
  { id: 'U05', name: 'Smoke machine',           effect: 0.035, cost: 650,   zone: 'peak'       },
  { id: 'U06', name: 'Laser show sync',         effect: 0.045, cost: 1200,  zone: 'peak'       },
  { id: 'U07', name: 'Crowd hype mic',          effect: 0.055, cost: 2200,  zone: 'peak'       },
  { id: 'U08', name: 'Energy drink sponzor',    effect: 0.070, cost: 4000,  zone: 'afterhours' },
  { id: 'U09', name: 'Avala kolaboracija',      effect: 0.090, cost: 7500,  zone: 'afterhours' },
  { id: 'U10', name: 'Legendarni turntable',    effect: 0.120, cost: 14000, zone: 'afterhours' },
];
