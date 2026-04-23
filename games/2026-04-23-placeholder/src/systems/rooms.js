// src/systems/rooms.js — Sobe: gradnja, upgrade, cost validation, efekti na state

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
 * @returns {{ name: string, description: string, maxLevel: number, effect: string }}
 */
export function getRoomDef(type) {}

/**
 * Izračunava trošak gradnje ili nadogradnje sobe.
 * @param {RoomType} type
 * @param {number} currentLevel - 0 znači da soba ne postoji (gradnja)
 * @returns {{ food: number, minerals: number }}
 */
export function getRoomCost(type, currentLevel) {}

/**
 * Proverava da li igrač ima dovoljno resursa za gradnju/upgrade.
 * @param {import('../state.js').GameState} state
 * @param {RoomType} type
 * @param {number} currentLevel
 * @returns {boolean}
 */
export function canBuildRoom(state, type, currentLevel) {}

/**
 * Gradi ili nadograđuje sobu na datoj ćeliji. Ažurira grid i state.
 * @param {import('../state.js').GameState} state
 * @param {RoomType} type
 * @param {number} col
 * @param {number} row
 * @returns {boolean} - true ako je uspelo
 */
export function buildRoom(state, type, col, row) {}

/**
 * Primenjuje pasivne efekte svih soba na state (poziva se jednom po tick-u).
 * @param {import('../state.js').GameState} state
 * @returns {void}
 */
export function applyRoomEffects(state) {}

/**
 * Vraća listu svih izgrađenih soba.
 * @param {import('../state.js').GameState} state
 * @returns {Room[]}
 */
export function getBuiltRooms(state) {}
