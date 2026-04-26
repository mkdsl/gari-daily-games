import { CONFIG } from '../config.js';

let _id = 1;

export function spawnPlayers(grid, startId) {
  _id = startId;
  const stats = CONFIG.UNITS.SOLDIER;
  const y = CONFIG.PLAYER_START_Y;
  const xs = [3, 5, 7];
  const units = xs.map(x => {
    const u = {
      id: _id++,
      side: 'player',
      type: 'SOLDIER',
      x, y,
      hp: stats.hp,
      maxHp: stats.hp,
      move: stats.move,
      range: stats.range,
      attack: stats.attack,
      acted: false
    };
    grid[y][x].occupant = u.id;
    return u;
  });
  return units;
}

export function createPlayerUnit(id, x, y) {
  const stats = CONFIG.UNITS.SOLDIER;
  return {
    id, side: 'player', type: 'SOLDIER',
    x, y,
    hp: stats.hp, maxHp: stats.hp,
    move: stats.move, range: stats.range, attack: stats.attack,
    acted: false
  };
}
