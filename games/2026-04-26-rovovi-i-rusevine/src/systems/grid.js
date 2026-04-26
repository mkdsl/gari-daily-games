import { CONFIG } from '../config.js';

/** @typedef {'OPEN'|'TRENCH'|'RUBBLE'|'BLOCKED'} CellType */
/** @typedef {{ type: CellType, occupant: number|null }} Cell */

export function buildGrid(cols, rows) {
  const lineYSet = new Set(CONFIG.LINE_Y);
  const grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      let type = 'OPEN';
      if (lineYSet.has(y)) {
        type = 'TRENCH';
      } else if (y !== CONFIG.PLAYER_START_Y && y !== CONFIG.PLAYER_START_Y - 1) {
        // random rubble in open areas (deterministic seed by position)
        const seed = (x * 7 + y * 13) % 17;
        if (seed < 3) type = 'RUBBLE';
      }
      grid[y][x] = { type, occupant: null };
    }
  }
  return grid;
}

export function isPassable(grid, x, y, units) {
  if (x < 0 || x >= CONFIG.COLS || y < 0 || y >= CONFIG.ROWS) return false;
  const cell = grid[y][x];
  if (cell.type === 'BLOCKED' || cell.type === 'RUBBLE') return false;
  if (cell.occupant !== null) return false;
  return true;
}

export function getCellsInRange(cx, cy, range, includeCenter = false) {
  const cells = [];
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (!includeCenter && dx === 0 && dy === 0) continue;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist <= range) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && x < CONFIG.COLS && y >= 0 && y < CONFIG.ROWS) {
          cells.push({ x, y });
        }
      }
    }
  }
  return cells;
}

export function moveUnit(grid, unit, nx, ny) {
  grid[unit.y][unit.x].occupant = null;
  unit.x = nx;
  unit.y = ny;
  grid[ny][nx].occupant = unit.id;
}

export function removeUnit(grid, unit) {
  if (grid[unit.y] && grid[unit.y][unit.x]) {
    grid[unit.y][unit.x].occupant = null;
  }
}

export function getLineClearStatus(units, lineY) {
  return !Object.values(units).some(u => u.side === 'enemy' && u.y === lineY && u.hp > 0);
}

export function getAllEnemiesAlive(units) {
  return Object.values(units).filter(u => u.side === 'enemy' && u.hp > 0);
}

export function getAllPlayersAlive(units) {
  return Object.values(units).filter(u => u.side === 'player' && u.hp > 0);
}

export function getUnitAt(grid, x, y, units) {
  const id = grid[y] && grid[y][x] ? grid[y][x].occupant : null;
  return id !== null ? units[id] : null;
}

/** Manhattan path cost, ignoring occupants (for AI distance checks) */
export function manhattan(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
