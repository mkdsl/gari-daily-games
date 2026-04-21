/**
 * systems/maze.js — Proceduralni grid generator za Pulse Runner.
 *
 * Algoritam (iz GDD-a):
 * 1. Kreiraj NxN grid, sve ćelije = 'empty'
 * 2. Postavi START poziciju (random u gornji levi 2x2 ugao)
 * 3. Postavi EXIT poziciju (random u donji desni 2x2 ugao)
 * 4. Random postavi zidove po gustini CONFIG.wallDensity(level)
 *    — START i EXIT ćelije nikad nisu zid
 * 5. BFS od START do EXIT — proveri da postoji put
 * 6. Ako nema puta: retry do CONFIG.MAZE_MAX_RETRIES puta
 * 7. Ako ni posle max retry-a nema puta: smanji gustinu za
 *    CONFIG.MAZE_DENSITY_FALLBACK_REDUCTION i pokušaj još
 *    CONFIG.MAZE_FALLBACK_RETRIES puta
 * 8. Postavi CONFIG.collectibleCount(level) collectible-a
 *    na random empty ćelije (ne START, ne EXIT)
 *
 * generateMaze(state) direktno menja state.grid, state.playerPos,
 * state.exitPos, state.gridSize.
 */

import { CONFIG } from '../config.js';

/**
 * @typedef {import('../state.js').GridCell} GridCell
 * @typedef {import('../state.js').Position} Position
 * @typedef {import('../state.js').GameState} GameState
 */

/**
 * Generiše novi maze za trenutni nivo i upisuje ga u state.
 * Mutira: state.grid, state.gridSize, state.playerPos, state.exitPos.
 *
 * @param {GameState} state
 */
export function generateMaze(state) {
  // TODO: implementiraj
  // const size = CONFIG.gridSize(state.level);
  // state.gridSize = size;
  // let density = CONFIG.wallDensity(state.level);
  //
  // // Pokušaji generisanja
  // for (let attempt = 0; attempt < CONFIG.MAZE_MAX_RETRIES; attempt++) {
  //   const result = _tryGenerate(size, density, state.level);
  //   if (result) { _applyToState(state, result); return; }
  // }
  //
  // // Fallback: smanji gustinu
  // density -= CONFIG.MAZE_DENSITY_FALLBACK_REDUCTION;
  // for (let attempt = 0; attempt < CONFIG.MAZE_FALLBACK_RETRIES; attempt++) {
  //   const result = _tryGenerate(size, density, state.level);
  //   if (result) { _applyToState(state, result); return; }
  // }
  //
  // // Poslednji fallback: generisi bez zidova (uvek solvable)
  // const result = _tryGenerate(size, 0, state.level);
  // _applyToState(state, result);
}

/**
 * Jedan pokušaj generisanja grida. Vraća rezultat ako je solvable, null ako nije.
 *
 * @param {number} size - Grid dimenzija (NxN)
 * @param {number} density - Gustina zidova (0.0–1.0)
 * @param {number} level - Trenutni nivo (za collectibles)
 * @returns {{ grid: GridCell[][], playerPos: Position, exitPos: Position }|null}
 */
function _tryGenerate(size, density, level) {
  // TODO: implementiraj
  // 1. Kreira 2D array: size × size ćelija, sve 'empty'
  // 2. Izaberi START iz {(0,0), (0,1), (1,0), (1,1)} random
  // 3. Izaberi EXIT iz {(size-2,size-2), (size-2,size-1), (size-1,size-2), (size-1,size-1)} random
  // 4. Postavi zidove random — preskoci START i EXIT
  // 5. BFS od START do EXIT
  // 6. Ako nije solvable — vrati null
  // 7. Postavi collectibles (CONFIG.collectibleCount(level)) na random empty ćelije
  // 8. Vrati { grid, playerPos: START, exitPos: EXIT }
  return null;
}

/**
 * BFS od start do exit kroz grid.
 * Prohodi samo kroz 'empty', 'collectible', i 'exit' ćelije (ne 'wall').
 *
 * @param {GridCell[][]} grid
 * @param {Position} start
 * @param {Position} exit
 * @param {number} size
 * @returns {boolean} true ako postoji put
 */
export function bfsSolvable(grid, start, exit, size) {
  // TODO: implementiraj BFS
  // const visited = Array.from({ length: size }, () => new Array(size).fill(false));
  // const queue = [start];
  // visited[start.row][start.col] = true;
  // const dirs = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];
  // while (queue.length) {
  //   const { row, col } = queue.shift();
  //   if (row === exit.row && col === exit.col) return true;
  //   for (const d of dirs) {
  //     const nr = row + d.row, nc = col + d.col;
  //     if (nr >= 0 && nr < size && nc >= 0 && nc < size
  //         && !visited[nr][nc] && grid[nr][nc].type !== 'wall') {
  //       visited[nr][nc] = true;
  //       queue.push({ row: nr, col: nc });
  //     }
  //   }
  // }
  // return false;
  return true;
}

/**
 * Upisuje generisani maze u state.
 *
 * @param {GameState} state
 * @param {{ grid: GridCell[][], playerPos: Position, exitPos: Position }} result
 */
function _applyToState(state, result) {
  // TODO: implementiraj
  // state.grid = result.grid;
  // state.playerPos = result.playerPos;
  // state.exitPos = result.exitPos;
}

/**
 * DEBUG helper: štampa grid u konzolu kao ASCII art.
 * P = player, E = exit, # = wall, . = empty, * = collectible
 *
 * @param {GridCell[][]} grid
 * @param {Position} playerPos
 * @param {Position} exitPos
 */
export function debugPrintGrid(grid, playerPos, exitPos) {
  // TODO: implementiraj (samo za development)
  // const lines = grid.map((row, r) =>
  //   row.map((cell, c) => {
  //     if (r === playerPos.row && c === playerPos.col) return 'P';
  //     if (r === exitPos.row && c === exitPos.col) return 'E';
  //     return { wall: '#', empty: '.', collectible: '*', exit: 'E' }[cell.type];
  //   }).join('')
  // );
  // console.log(lines.join('\n'));
}
