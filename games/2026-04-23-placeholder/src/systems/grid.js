// src/systems/grid.js — Grid generacija, kopanje, susednost, sadržaj ćelija, kristal placement

/** @typedef {'ZEMLJA'|'TUNEL'|'SOBA'|'KRISTAL'} CellType */

/**
 * @typedef {{
 *   type: CellType,
 *   resource: 'HRANA'|'MINERAL'|null,
 *   quantity: number,
 *   room: string|null,
 *   roomLevel: number,
 *   revealed: boolean
 * }} Cell
 */

/**
 * Generiše inicijalnu grid matricu sa random sadržajem i postavljenim kristalom.
 * @param {number} cols
 * @param {number} rows
 * @returns {Cell[][]}
 */
export function generateGrid(cols, rows) {}

/**
 * Proverava da li se ćelija može kopati (susedna sa tunelom ili startnom pozicijom).
 * @param {Cell[][]} grid
 * @param {number} col
 * @param {number} row
 * @returns {boolean}
 */
export function canDig(grid, col, row) {}

/**
 * Kopanje ćelije — menja tip u TUNEL i vraća pronađene resurse.
 * @param {Cell[][]} grid
 * @param {number} col
 * @param {number} row
 * @returns {{ food: number, minerals: number, crystal: boolean }}
 */
export function digCell(grid, col, row) {}

/**
 * Vraća listu susednih ćelija (gore, dole, levo, desno).
 * @param {Cell[][]} grid
 * @param {number} col
 * @param {number} row
 * @returns {Array<{ col: number, row: number, cell: Cell }>}
 */
export function getNeighbors(grid, col, row) {}

/**
 * Pronalazi koordinate Drevnog Kristala u gridu.
 * @param {Cell[][]} grid
 * @returns {{ col: number, row: number }|null}
 */
export function findCrystal(grid) {}

/**
 * Otkriva ćelije u radijusu oko iskopane ćelije (fog of war).
 * @param {Cell[][]} grid
 * @param {number} col
 * @param {number} row
 * @param {number} radius
 * @returns {void}
 */
export function revealAround(grid, col, row, radius) {}
