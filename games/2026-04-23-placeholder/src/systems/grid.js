// src/systems/grid.js — Grid generacija, kopanje, susednost, sadržaj ćelija, kristal placement

import { CONFIG } from '../config.js';
import { screenToGrid } from '../input.js';

/** @typedef {'ZEMLJA'|'TUNEL'|'SOBA'} CellType */

/**
 * @typedef {{
 *   type: CellType,
 *   resource: 'HRANA'|'MINERAL'|'KRISTAL'|null,
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
export function generateGrid(cols, rows) {
  // Inicijalizuj praznu matricu
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        type: 'ZEMLJA',
        resource: null,
        quantity: 0,
        room: null,
        roomLevel: 0,
        revealed: false
      });
    }
    grid.push(row);
  }

  // Row 0 = površina — uvek revealed, TUNEL (nekopirav)
  for (let c = 0; c < cols; c++) {
    grid[0][c].type = 'TUNEL';
    grid[0][c].revealed = true;
  }

  // Entry point: (col=7, row=1) = TUNEL, revealed
  grid[1][7].type = 'TUNEL';
  grid[1][7].revealed = true;
  revealAround(grid, 7, 1, CONFIG.FOG_REVEAL_RADIUS);

  // Popuni preostale ćelije (row 1-19, osim entry pointa)
  for (let r = 1; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 1 && c === 7) continue; // entry point, preskočen

      const rand = Math.random();
      if (rand < CONFIG.DIG_FOOD_CHANCE) {
        // Hrana
        grid[r][c].resource = 'HRANA';
        grid[r][c].quantity = CONFIG.DIG_FOOD_MIN + Math.floor(Math.random() * (CONFIG.DIG_FOOD_MAX - CONFIG.DIG_FOOD_MIN));
      } else if (rand < CONFIG.DIG_FOOD_CHANCE + CONFIG.DIG_MINERAL_CHANCE) {
        // Minerali
        grid[r][c].resource = 'MINERAL';
        grid[r][c].quantity = CONFIG.DIG_MINERAL_MIN + Math.floor(Math.random() * (CONFIG.DIG_MINERAL_MAX - CONFIG.DIG_MINERAL_MIN));
      }
      // Inače prazna zemlja (resource ostaje null)
    }
  }

  // Postavi TAČNO JEDAN kristal
  // Nasumično na redu CRYSTAL_DEPTH_MIN do rows-1, kol 2 do cols-3
  let crystalPlaced = false;
  let attempts = 0;
  while (!crystalPlaced && attempts < 1000) {
    attempts++;
    const cr = CONFIG.CRYSTAL_DEPTH_MIN + Math.floor(Math.random() * (rows - CONFIG.CRYSTAL_DEPTH_MIN));
    const cc = 2 + Math.floor(Math.random() * (cols - 5)); // cols-3 inclusive, tj. cols-5+2
    // Kristal mora biti ZEMLJA (ne row 0)
    if (cr < 1 || cr >= rows || cc < 2 || cc > cols - 3) continue;

    grid[cr][cc].resource = 'KRISTAL';
    grid[cr][cc].quantity = 1;
    // Kristal ostaje type 'ZEMLJA' — poseban resource marker

    // Buffer: susedne ćelije kristala su prazne (bez resursa)
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of directions) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 1 && nr < rows && nc >= 0 && nc < cols) {
        if (grid[nr][nc].resource !== 'KRISTAL') {
          grid[nr][nc].resource = null;
          grid[nr][nc].quantity = 0;
        }
      }
    }

    crystalPlaced = true;
  }

  return grid;
}

/**
 * Proverava da li se ćelija može kopati.
 * True ako: col i row su u granicama, tip je 'ZEMLJA', i bar jedna susedna ćelija je 'TUNEL' ili 'SOBA'.
 * Row 0 se NIKAD ne kopa.
 * @param {Cell[][]} grid
 * @param {number} col
 * @param {number} row
 * @returns {boolean}
 */
export function canDig(grid, col, row) {
  if (row <= 0) return false; // Row 0 se ne kopa nikad
  if (row >= grid.length || col < 0 || col >= grid[0].length) return false;
  if (grid[row][col].type !== 'ZEMLJA') return false;

  const neighbors = getNeighbors(grid, col, row);
  return neighbors.some(n => n.cell.type === 'TUNEL' || n.cell.type === 'SOBA');
}

/**
 * Kopanje ćelije — menja tip u TUNEL i vraća pronađene resurse.
 * @param {Cell[][]} grid
 * @param {number} col
 * @param {number} row
 * @returns {{ food: number, minerals: number, crystal: boolean }}
 */
export function digCell(grid, col, row) {
  const cell = grid[row][col];
  cell.type = 'TUNEL';
  cell.revealed = true;

  let result = { food: 0, minerals: 0, crystal: false };

  if (cell.resource === 'HRANA') {
    result.food = cell.quantity;
  } else if (cell.resource === 'MINERAL') {
    result.minerals = cell.quantity;
  } else if (cell.resource === 'KRISTAL') {
    result.crystal = true;
  }

  cell.resource = null;
  cell.quantity = 0;

  revealAround(grid, col, row, CONFIG.FOG_REVEAL_RADIUS);

  return result;
}

/**
 * Vraća listu susednih ćelija (gore, dole, levo, desno).
 * @param {Cell[][]} grid
 * @param {number} col
 * @param {number} row
 * @returns {Array<{ col: number, row: number, cell: Cell }>}
 */
export function getNeighbors(grid, col, row) {
  const dirs = [
    [0, -1],  // gore
    [0,  1],  // dole
    [-1, 0],  // levo
    [1,  0]   // desno
  ];
  const result = [];
  for (const [dc, dr] of dirs) {
    const nc = col + dc;
    const nr = row + dr;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
      result.push({ col: nc, row: nr, cell: grid[nr][nc] });
    }
  }
  return result;
}

/**
 * Pronalazi koordinate Drevnog Kristala u gridu.
 * @param {Cell[][]} grid
 * @returns {{ col: number, row: number }|null}
 */
export function findCrystal(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].resource === 'KRISTAL') {
        return { col: c, row: r };
      }
    }
  }
  return null;
}

/**
 * Otkriva ćelije u radijusu oko iskopane ćelije (fog of war).
 * @param {Cell[][]} grid
 * @param {number} col
 * @param {number} row
 * @param {number} radius
 * @returns {void}
 */
export function revealAround(grid, col, row, radius) {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        grid[nr][nc].revealed = true;
      }
    }
  }
}

/**
 * Obrađuje pointer input za grid — kopanje ili otvaranje room menija.
 * @param {import('../state.js').GameState} state
 * @param {import('../input.js').InputSnapshot} input
 */
export function handleGridInput(state, input) {
  if (!input.pointer.pressed) return;

  const { col, row } = screenToGrid(
    input.pointer.x,
    input.pointer.y,
    state.camera,
    CONFIG.CELL_SIZE
  );

  // Ako je room meni otvoren, zatvori ga i ne radi ništa više
  if (state.showRoomMenu !== null) {
    state.showRoomMenu = null;
    return;
  }

  const rows = state.grid.length;
  const cols = state.grid[0]?.length ?? 0;
  if (row < 0 || row >= rows || col < 0 || col >= cols) return;

  const cell = state.grid[row][col];

  if (canDig(state.grid, col, row)) {
    const found = digCell(state.grid, col, row);

    // Dodaj resurse
    state.resources.food += found.food;
    state.resources.minerals += found.minerals;

    // Kapuj resurse na resourceCap (ako postoji)
    const cap = state.resourceCap ?? CONFIG.RESOURCE_CAP_BASE;
    if (state.resources.food > cap) state.resources.food = cap;
    if (state.resources.minerals > cap) state.resources.minerals = cap;

    // Provjeri kristal
    if (found.crystal) {
      state.showPrestigeScreen = true;
    }
  } else if (cell.type === 'TUNEL') {
    // Otvori room meni za ovu ćeliju
    state.showRoomMenu = { col, row };
  }
}
