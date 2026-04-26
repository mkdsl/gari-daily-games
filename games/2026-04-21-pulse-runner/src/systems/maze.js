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
  const size = CONFIG.gridSize(state.level);
  state.gridSize = size;
  let density = CONFIG.wallDensity(state.level);

  // Pokušaji generisanja sa originalnom gustinom
  for (let attempt = 0; attempt < CONFIG.MAZE_MAX_RETRIES; attempt++) {
    const result = _tryGenerate(size, density, state.level);
    if (result) {
      _applyToState(state, result);
      return;
    }
  }

  // Fallback: smanji gustinu
  density -= CONFIG.MAZE_DENSITY_FALLBACK_REDUCTION;
  for (let attempt = 0; attempt < CONFIG.MAZE_FALLBACK_RETRIES; attempt++) {
    const result = _tryGenerate(size, density, state.level);
    if (result) {
      _applyToState(state, result);
      return;
    }
  }

  // Poslednji fallback: generisi bez zidova (uvek solvable)
  const result = _tryGenerate(size, 0, state.level);
  _applyToState(state, result);
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
  // 1. Kreira 2D array: size × size ćelija, sve 'empty'
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ type: 'empty' }))
  );

  // 2. Izaberi START iz gornjeg levog 2×2 ugla
  const startCandidates = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
  ];
  const playerPos = startCandidates[Math.floor(Math.random() * startCandidates.length)];

  // 3. Izaberi EXIT iz donjeg desnog 2×2 ugla
  const exitCandidates = [
    { row: size - 1, col: size - 1 },
    { row: size - 1, col: size - 2 },
    { row: size - 2, col: size - 1 },
    { row: size - 2, col: size - 2 },
  ];
  const exitPos = exitCandidates[Math.floor(Math.random() * exitCandidates.length)];

  // Označi EXIT ćeliju u gridu
  grid[exitPos.row][exitPos.col] = { type: 'exit' };

  // Set za brzu proveru start/exit pozicija
  const isStart = (r, c) => r === playerPos.row && c === playerPos.col;
  const isExit = (r, c) => r === exitPos.row && c === exitPos.col;

  // 4. Postavi zidove random — preskoci START i EXIT
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isStart(r, c) || isExit(r, c)) continue;
      if (Math.random() < density) {
        grid[r][c] = { type: 'wall' };
      }
    }
  }

  // 5. BFS od START do EXIT
  if (!bfsSolvable(grid, playerPos, exitPos, size)) {
    return null;
  }

  // 7. Postavi collectibles na random empty ćelije (ne START, ne EXIT)
  const emptyCells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type === 'empty' && !isStart(r, c) && !isExit(r, c)) {
        emptyCells.push({ row: r, col: c });
      }
    }
  }

  // Shuffle i uzmi prvih collectibleCount
  const count = CONFIG.collectibleCount(level);
  for (let i = emptyCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
  }
  const toPlace = Math.min(count, emptyCells.length);
  for (let i = 0; i < toPlace; i++) {
    const { row, col } = emptyCells[i];
    grid[row][col] = { type: 'collectible' };
  }

  // 8. Vrati { grid, playerPos, exitPos }
  return { grid, playerPos, exitPos };
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
  const visited = Array.from({ length: size }, () => new Array(size).fill(false));
  const queue = [{ row: start.row, col: start.col }];
  visited[start.row][start.col] = true;
  const dirs = [
    { row: -1, col:  0 },
    { row:  1, col:  0 },
    { row:  0, col: -1 },
    { row:  0, col:  1 },
  ];

  while (queue.length) {
    const { row, col } = queue.shift();
    if (row === exit.row && col === exit.col) return true;
    for (const d of dirs) {
      const nr = row + d.row;
      const nc = col + d.col;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size
          && !visited[nr][nc]
          && grid[nr][nc].type !== 'wall') {
        visited[nr][nc] = true;
        queue.push({ row: nr, col: nc });
      }
    }
  }
  return false;
}

/**
 * Upisuje generisani maze u state.
 *
 * @param {GameState} state
 * @param {{ grid: GridCell[][], playerPos: Position, exitPos: Position }} result
 */
function _applyToState(state, result) {
  state.grid = result.grid;
  state.playerPos = result.playerPos;
  state.exitPos = result.exitPos;
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
  // const lines = grid.map((row, r) =>
  //   row.map((cell, c) => {
  //     if (r === playerPos.row && c === playerPos.col) return 'P';
  //     if (r === exitPos.row && c === exitPos.col) return 'E';
  //     return { wall: '#', empty: '.', collectible: '*', exit: 'E' }[cell.type];
  //   }).join('')
  // );
  // console.log(lines.join('\n'));
}
