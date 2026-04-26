// src/systems/rooms.js — Sobe: gradnja, upgrade, cost validation, efekti na state

import { CONFIG } from '../config.js';

/**
 * @typedef {'MAGACIN'|'LEGLO'|'ZID'|'LAB'} RoomType
 */

/**
 * @typedef {{
 *   type: RoomType,
 *   level: number,
 *   col: number,
 *   row: number
 * }} Room
 */

/**
 * Vraća definiciju sobe (naziv, opis, max level, efekti).
 * @param {RoomType} type
 * @returns {{ name: string, description: string, maxLevel: number, effect: string }|null}
 */
export function getRoomDef(type) {
  const defs = {
    MAGACIN: { name: 'Magacin',    description: '+100 cap resursa',  maxLevel: 3, effect: 'resource_cap' },
    LEGLO:   { name: 'Leglo',      description: '+5 max radnica',    maxLevel: 3, effect: 'worker_cap' },
    ZID:     { name: 'Odbr. Zid',  description: 'Štiti od bure',     maxLevel: 2, effect: 'storm_protection' },
    LAB:     { name: 'Lab',        description: '+10% resurse',      maxLevel: 3, effect: 'resource_boost' },
  };
  return defs[type] ?? null;
}

/**
 * Izračunava trošak gradnje ili nadogradnje sobe.
 * @param {RoomType} type
 * @param {number} currentLevel - 0 znači da soba ne postoji (gradnja)
 * @returns {{ food: number, minerals: number }}
 */
export function getRoomCost(type, currentLevel) {
  const base = CONFIG.ROOM_COSTS[type];
  const mult = Math.pow(CONFIG.ROOM_UPGRADE_MULT, currentLevel);
  return {
    food: Math.floor(base.food * mult),
    minerals: Math.floor(base.minerals * mult)
  };
}

/**
 * Proverava da li igrač ima dovoljno resursa za gradnju/upgrade.
 * @param {import('../state.js').GameState} state
 * @param {RoomType} type
 * @param {number} currentLevel
 * @returns {boolean}
 */
export function canBuildRoom(state, type, currentLevel) {
  const cost = getRoomCost(type, currentLevel);
  return state.resources.food >= cost.food && state.resources.minerals >= cost.minerals;
}

/**
 * Gradi ili nadograđuje sobu na datoj ćeliji. Ažurira grid i state.
 * @param {import('../state.js').GameState} state
 * @param {RoomType} type
 * @param {number} col
 * @param {number} row
 * @returns {boolean} - true ako je uspelo
 */
export function buildRoom(state, type, col, row) {
  const existingRoom = state.rooms.find(r => r.col === col && r.row === row);
  const currentLevel = existingRoom ? existingRoom.level : 0;
  const def = getRoomDef(type);

  if (!def) return false;
  if (currentLevel >= def.maxLevel) return false;
  if (!canBuildRoom(state, type, currentLevel)) return false;

  const cost = getRoomCost(type, currentLevel);
  state.resources.food -= cost.food;
  state.resources.minerals -= cost.minerals;

  if (existingRoom) {
    existingRoom.level++;
    // Ažuriraj grid ćeliju ako postoji
    if (state.grid[row] && state.grid[row][col]) {
      state.grid[row][col].roomLevel = existingRoom.level;
    }
  } else {
    state.rooms.push({ type, level: 1, col, row });
    if (state.grid[row] && state.grid[row][col]) {
      state.grid[row][col].room = type;
      state.grid[row][col].roomLevel = 1;
      state.grid[row][col].type = 'SOBA';
    }
  }

  applyRoomEffects(state);
  return true;
}

/**
 * Primenjuje pasivne efekte svih soba na state (poziva se jednom po tick-u).
 * Recalculates worker capacity, resource cap.
 * @param {import('../state.js').GameState} state
 * @returns {void}
 */
export function applyRoomEffects(state) {
  // Leglo: +5 max radnica po ukupnom nivou Leglo soba
  const legloLevels = state.rooms
    .filter(r => r.type === 'LEGLO')
    .reduce((sum, r) => sum + r.level, 0);
  state.workers.capacity = CONFIG.WORKER_CAP_BASE + legloLevels * 5;

  // Magacin: +100 cap resursa po ukupnom nivou Magacin soba
  const magasinLevels = state.rooms
    .filter(r => r.type === 'MAGACIN')
    .reduce((sum, r) => sum + r.level, 0);
  state.resourceCap = CONFIG.RESOURCE_CAP_BASE + magasinLevels * 100;
}

/**
 * Vraća listu svih izgrađenih soba.
 * @param {import('../state.js').GameState} state
 * @returns {Room[]}
 */
export function getBuiltRooms(state) {
  return state.rooms;
}
