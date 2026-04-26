import { CONFIG } from './config.js';
import { buildGrid } from './systems/grid.js';
import { spawnLineEnemies } from './entities/enemy.js';
import { spawnPlayers } from './entities/player.js';

/** @typedef {'MENU'|'PLAYING'|'ANIMATING'|'GAMEOVER'} Phase */

export function createState() {
  const grid = buildGrid(CONFIG.COLS, CONFIG.ROWS);
  const units = {};
  let nextId = 1;

  const playerUnits = spawnPlayers(grid, nextId);
  playerUnits.forEach(u => { units[u.id] = u; nextId = u.id + 1; });

  // Spawn line 0 enemies (first trench at Y=4)
  const line1 = spawnLineEnemies(grid, 0, nextId);
  line1.forEach(u => { units[u.id] = u; nextId = u.id + 1; });

  return {
    version: 1,
    /** @type {Phase} */
    phase: 'MENU',
    turn: 0,
    ammo: CONFIG.AMMO_START,
    grid,
    units,         // { [id]: Unit }
    nextId,
    linesCleared: 0,
    lineEnemiesSpawned: [true, false, false],
    selectedUnit: null,   // player unit id
    pendingActions: [],   // [{unitId, type, target}]
    smokeZones: [],       // [{x, y, turns}]
    animEvents: [],       // animation queue
    statsAtStart: { soldiers: playerUnits.length },
    result: null          // { grade, turns, ammoLeft, losses }
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    const copy = JSON.parse(JSON.stringify(state));
    copy.animEvents = [];
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(copy));
  } catch { /* quota */ }
}

export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}
