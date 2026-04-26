import { CONFIG } from '../config.js';

/**
 * Spawn enemies for a given line index (0=line1, 1=line2, 2=line3).
 * Returns array of unit objects; caller places them in units map.
 */
export function spawnLineEnemies(grid, lineIndex, startId) {
  const lineY = CONFIG.LINE_Y[lineIndex];
  const units = [];
  let id = startId;

  if (lineIndex === 0) {
    // Line 1: 4 riflemen
    [2, 4, 6, 8].forEach(x => {
      units.push(makeEnemy(id++, 'RIFLEMAN', x, lineY, grid));
    });
  } else if (lineIndex === 1) {
    // Line 2: 3 riflemen + 2 machineguns
    [2, 5, 8].forEach(x => units.push(makeEnemy(id++, 'RIFLEMAN', x, lineY, grid)));
    [3, 7].forEach(x => units.push(makeEnemy(id++, 'MACHINEGUN', x, lineY, grid)));
  } else {
    // Line 3: 2 riflemen + 1 officer + 1 artillery
    [2, 8].forEach(x => units.push(makeEnemy(id++, 'RIFLEMAN', x, lineY, grid)));
    units.push(makeEnemy(id++, 'OFFICER', 5, lineY, grid));
    units.push(makeEnemy(id++, 'ARTILLERY', 8, lineY, grid));
  }
  return units;
}

function makeEnemy(id, type, x, y, grid) {
  const stats = CONFIG.UNITS[type];
  // clamp to grid bounds
  if (x >= CONFIG.COLS) x = CONFIG.COLS - 1;
  if (grid[y][x].occupant) {
    // find nearby free cell in same row
    for (let dx = 1; dx < CONFIG.COLS; dx++) {
      if (x + dx < CONFIG.COLS && !grid[y][x + dx].occupant) { x = x + dx; break; }
      if (x - dx >= 0 && !grid[y][x - dx].occupant) { x = x - dx; break; }
    }
  }
  grid[y][x].occupant = id;
  return {
    id, side: 'enemy', type,
    x, y,
    hp: stats.hp, maxHp: stats.hp,
    move: stats.move,
    range: stats.range,
    attack: stats.attack,
    attacksPerTurn: stats.attacksPerTurn || 1,
    buffRadius: stats.buffRadius || 0,
    fireEvery: stats.fireEvery || 0,
    aiState: 'HOLD',
    turnsAlive: 0,
    stunned: false
  };
}
