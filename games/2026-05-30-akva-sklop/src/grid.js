/**
 * grid.js — Akva-Sklop
 * Grid logic: creation, cell access, placement validation, adjacency queries.
 */

import {
  GRID_COLS,
  GRID_ROWS,
  HEIGHT_MAP,
  TILE_TYPES,
  TILE_CONFIG,
  SOURCE_POS,
  LAKE_A_ORIGIN,
  LAKE_A_SIZE,
  LAKE_B_ORIGIN,
  LAKE_B_SIZE,
  LAKE_C_ORIGIN,
  LAKE_C_SIZE,
  DIFFICULTY,
} from './config.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function idx(col, row) {
  return row * GRID_COLS + col;
}

function inBounds(col, row) {
  return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
}

/**
 * Returns true if (col, row) is inside a lake zone for any lake.
 * Also returns which lakeId it belongs to.
 */
function getLakeZone(col, row) {
  const zones = [
    { id: 'A', origin: LAKE_A_ORIGIN, size: LAKE_A_SIZE },
    { id: 'B', origin: LAKE_B_ORIGIN, size: LAKE_B_SIZE },
    { id: 'C', origin: LAKE_C_ORIGIN, size: LAKE_C_SIZE },
  ];
  for (const z of zones) {
    if (
      col >= z.origin.col &&
      col < z.origin.col + z.size.cols &&
      row >= z.origin.row &&
      row < z.origin.row + z.size.rows
    ) {
      return z.id;
    }
  }
  return null;
}

/**
 * Determine the height for a cell using HEIGHT_MAP (row-major).
 */
function getHeight(col, row) {
  if (!inBounds(col, row)) return 0;
  return HEIGHT_MAP[row][col];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a fresh 20×15 grid.
 * Each cell: { type, lakeId, height }
 * Terrain is set where height is 0 or on mountain edges (none in current map —
 * height=0 doesn't appear, so we keep terrain for height=0 only).
 */
export function createGrid() {
  const grid = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const h = getHeight(col, row);
      grid.push({
        type:   h === 0 ? TILE_TYPES.TERRAIN : TILE_TYPES.EMPTY,
        lakeId: null,
        height: h,
      });
    }
  }
  return grid;
}

/**
 * Get a cell by (col, row).  Returns null if out of bounds.
 */
export function getCell(grid, col, row) {
  if (!inBounds(col, row)) return null;
  return grid[idx(col, row)];
}

/**
 * Overwrite type (and optionally lakeId) for a cell.
 */
export function setCell(grid, col, row, type, lakeId = null) {
  if (!inBounds(col, row)) return;
  const cell = grid[idx(col, row)];
  cell.type   = type;
  cell.lakeId = lakeId;
}

/**
 * Validate whether tileType can be placed at (col, row).
 * @returns {{ ok: boolean, reason: string }}
 */
export function canPlace(grid, col, row, tileType, apLeft) {
  if (!inBounds(col, row)) {
    return { ok: false, reason: 'Van granica mape.' };
  }

  const cell = getCell(grid, col, row);

  if (cell.type === TILE_TYPES.TERRAIN) {
    return { ok: false, reason: 'Ne može se graditi na planini.' };
  }
  if (cell.type === TILE_TYPES.SOURCE) {
    return { ok: false, reason: 'Izvor je fiksiran.' };
  }

  const cfg = TILE_CONFIG[tileType];
  if (!cfg) {
    return { ok: false, reason: 'Nepoznat tip tile-a.' };
  }

  // REMOVE action — allow on anything except source and terrain
  if (tileType === TILE_TYPES.REMOVE) {
    if (cell.type === TILE_TYPES.EMPTY) {
      return { ok: false, reason: 'Nema tile-a za uklanjanje.' };
    }
    if (apLeft < cfg.apCost) {
      return { ok: false, reason: `Nedovoljno AP (potrebno ${cfg.apCost}).` };
    }
    return { ok: true, reason: '' };
  }

  if (apLeft < cfg.apCost) {
    return { ok: false, reason: `Nedovoljno AP (potrebno ${cfg.apCost}).` };
  }

  // LAKE_2 requires LAKE_1 already placed at same cell
  if (tileType === TILE_TYPES.LAKE_2) {
    if (cell.type !== TILE_TYPES.LAKE_1) {
      return { ok: false, reason: 'Jezero Nivo 2 zahteva Jezero Nivo 1 na istoj poziciji.' };
    }
    // Must be inside a lake zone
    const zoneId = getLakeZone(col, row);
    if (!zoneId) {
      return { ok: false, reason: 'Jezero se može postaviti samo u predviđenoj zoni.' };
    }
    return { ok: true, reason: '' };
  }

  // LAKE_1 must be inside a lake zone
  if (tileType === TILE_TYPES.LAKE_1) {
    const zoneId = getLakeZone(col, row);
    if (!zoneId) {
      return { ok: false, reason: 'Jezero se može postaviti samo u predviđenoj zoni.' };
    }
    if (cell.type !== TILE_TYPES.EMPTY) {
      return { ok: false, reason: 'Pozicija je zauzeta.' };
    }
    return { ok: true, reason: '' };
  }

  // General tiles: cell must be empty
  if (cell.type !== TILE_TYPES.EMPTY) {
    return { ok: false, reason: 'Pozicija je zauzeta.' };
  }

  return { ok: true, reason: '' };
}

/**
 * Returns array of existing (non-null) adjacent cells [{cell, col, row}].
 * 4-directional adjacency (N, E, S, W).
 */
export function getAdjacentCells(grid, col, row) {
  const dirs = [
    [0, -1], [1, 0], [0, 1], [-1, 0],
  ];
  const result = [];
  for (const [dc, dr] of dirs) {
    const nc = col + dc;
    const nr = row + dr;
    const cell = getCell(grid, nc, nr);
    if (cell) result.push({ cell, col: nc, row: nr });
  }
  return result;
}

/**
 * Count drainage tiles connected to (adjacent to or within) the lake zone
 * for lakeId.  Returns the total flow bonus.
 */
export function getDrainageFlow(grid, lakeId) {
  const zoneMap = { A: { origin: LAKE_A_ORIGIN, size: LAKE_A_SIZE },
                    B: { origin: LAKE_B_ORIGIN, size: LAKE_B_SIZE },
                    C: { origin: LAKE_C_ORIGIN, size: LAKE_C_SIZE } };
  const z = zoneMap[lakeId];
  if (!z) return 0;

  // Collect all cells in zone and their border-adjacent cells
  const checked = new Set();
  let totalBonus = 0;

  for (let r = z.origin.row; r < z.origin.row + z.size.rows; r++) {
    for (let c = z.origin.col; c < z.origin.col + z.size.cols; c++) {
      // Check cell itself
      const cellKey = `${c},${r}`;
      if (!checked.has(cellKey)) {
        checked.add(cellKey);
        const cell = getCell(grid, c, r);
        if (cell && cell.type === TILE_TYPES.DRAINAGE) {
          totalBonus += TILE_CONFIG[TILE_TYPES.DRAINAGE].flowBonus;
        }
      }
      // Check adjacents
      const adjs = getAdjacentCells(grid, c, r);
      for (const { cell, col: ac, row: ar } of adjs) {
        const key = `${ac},${ar}`;
        if (!checked.has(key)) {
          checked.add(key);
          if (cell.type === TILE_TYPES.DRAINAGE) {
            totalBonus += TILE_CONFIG[TILE_TYPES.DRAINAGE].flowBonus;
          }
        }
      }
    }
  }
  return totalBonus;
}

/**
 * Count biofilter tiles adjacent to or inside the lake zone for lakeId.
 */
export function getBiofilters(grid, lakeId) {
  const zoneMap = { A: { origin: LAKE_A_ORIGIN, size: LAKE_A_SIZE },
                    B: { origin: LAKE_B_ORIGIN, size: LAKE_B_SIZE },
                    C: { origin: LAKE_C_ORIGIN, size: LAKE_C_SIZE } };
  const z = zoneMap[lakeId];
  if (!z) return 0;

  const checked = new Set();
  let count = 0;

  for (let r = z.origin.row; r < z.origin.row + z.size.rows; r++) {
    for (let c = z.origin.col; c < z.origin.col + z.size.cols; c++) {
      const cellKey = `${c},${r}`;
      if (!checked.has(cellKey)) {
        checked.add(cellKey);
        const cell = getCell(grid, c, r);
        if (cell && cell.type === TILE_TYPES.BIOFILTER) count++;
      }
      const adjs = getAdjacentCells(grid, c, r);
      for (const { cell, col: ac, row: ar } of adjs) {
        const key = `${ac},${ar}`;
        if (!checked.has(key)) {
          checked.add(key);
          if (cell.type === TILE_TYPES.BIOFILTER) count++;
        }
      }
    }
  }
  return count;
}

/**
 * Count wetland tiles adjacent to the lake zone for lakeId.
 * Returns total duckCapBonus.
 */
export function getWetlandBonus(grid, lakeId) {
  const zoneMap = { A: { origin: LAKE_A_ORIGIN, size: LAKE_A_SIZE },
                    B: { origin: LAKE_B_ORIGIN, size: LAKE_B_SIZE },
                    C: { origin: LAKE_C_ORIGIN, size: LAKE_C_SIZE } };
  const z = zoneMap[lakeId];
  if (!z) return 0;

  const checked = new Set();
  let bonus = 0;

  for (let r = z.origin.row; r < z.origin.row + z.size.rows; r++) {
    for (let c = z.origin.col; c < z.origin.col + z.size.cols; c++) {
      const adjs = getAdjacentCells(grid, c, r);
      for (const { cell, col: ac, row: ar } of adjs) {
        // Only adjacents, not the zone itself
        const inZone = getLakeZone(ac, ar) === lakeId;
        if (inZone) continue;
        const key = `${ac},${ar}`;
        if (!checked.has(key)) {
          checked.add(key);
          if (cell.type === TILE_TYPES.WETLAND) {
            bonus += TILE_CONFIG[TILE_TYPES.WETLAND].duckCapBonus;
          }
        }
      }
    }
  }
  return bonus;
}

/**
 * Place the source tile, lake tiles, and seed initial capacity into state.
 * Called once at game start.
 */
export function initGridWithLakes(grid, state, difficulty) {
  const diff = DIFFICULTY[difficulty] || DIFFICULTY['fazaA'];

  // Place source
  setCell(grid, SOURCE_POS.col, SOURCE_POS.row, TILE_TYPES.SOURCE, null);

  // Helper: fill a lake zone with LAKE_1 tiles, calculate capacity, set state
  function fillLake(origin, size, lakeId) {
    let capacity = 0;
    for (let r = origin.row; r < origin.row + size.rows; r++) {
      for (let c = origin.col; c < origin.col + size.cols; c++) {
        setCell(grid, c, r, TILE_TYPES.LAKE_1, lakeId);
        capacity += TILE_CONFIG[TILE_TYPES.LAKE_1].capacity;
      }
    }
    state.lakes[lakeId].capacity = capacity;
    // Start at 30% fill
    state.lakes[lakeId].level = Math.floor(capacity * 0.3);
  }

  fillLake(LAKE_A_ORIGIN, LAKE_A_SIZE, 'A');
  fillLake(LAKE_B_ORIGIN, LAKE_B_SIZE, 'B');
  fillLake(LAKE_C_ORIGIN, LAKE_C_SIZE, 'C');
}
