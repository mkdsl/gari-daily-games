/**
 * state.js — GameState shape za Bespuće
 * Run state (ephemeral, reset po svakom runu) + meta state (localStorage, traje).
 * Eksportuje: createState, resetRun, loadMeta, saveMeta
 */
import { CONFIG } from './config.js';

/** @returns {object} Puni state objekat (run + meta wrapovan zajedno) */
export function createState(meta = createMeta()) {
  return {
    // -- Game state mašina --
    screen: 'MENU', // 'MENU' | 'RUNNING' | 'CHECKPOINT_SELECT' | 'DEAD' | 'META_UPGRADE'

    // -- Run state (resetuje se na resetRun) --
    run: createRun(),

    // -- Meta state (persists) --
    meta,
  };
}

/** @returns {object} Svježi run state */
export function createRun() {
  return {
    distance: 0,       // ukupno pređeni px (za score i pacing)
    score: 0,
    crystals: 0,       // prikupljeni u ovom runu
    multiplier: 1.0,
    player: null,      // popunjava entities/player.js
    chunks: [],        // popunjava systems/chunks.js
    obstacles: [],     // popunjava entities/obstacle.js
    pickups: [],       // popunjava entities/pickup.js
    particles: [],     // eksplozija čestica
    activePowerups: [],// trenutno aktivni power-up efekti
    nextCheckpoint: 0, // distanca do sljedećeg checkpoint-a
    recordY: null,     // Y pozicija igrača na rekordnom runu (ghost line)
    scrollSpeed: 0,    // trenutna brzina scrolla
    dead: false,
  };
}

/** @returns {object} Default meta state (prvi put, prazno) */
function createMeta() {
  return {
    version: 1,
    bestScore: 0,
    bestDistance: 0,
    totalCrystals: 0,
    upgrades: {
      startThrust: 0,   // 0–3
      magnetRange: 0,   // 0–3
      checkpointHp: 0,  // 0–3
    },
    recordRunY: null,   // ghost Y za Record Line
  };
}

/** Resetuj run state unutar postojećeg state objekta */
export function resetRun(state) {
  state.run = createRun();
  state.screen = 'RUNNING';
}

/** Učitaj meta iz localStorage, vrati default ako nema/nevalid */
export function loadMeta() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return createMeta();
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return createMeta();
    return parsed;
  } catch {
    return createMeta();
  }
}

/** Sačuvaj meta u localStorage */
export function saveMeta(meta) {
  try {
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(meta));
  } catch {
    // quota or private mode — ignore
  }
}

/** Obriši meta (debug) */
export function clearMeta() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}
