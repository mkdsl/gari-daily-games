import { CONFIG } from '../config.js';
import { isPassable, getCellsInRange, getAllPlayersAlive, manhattan } from './grid.js';

/**
 * Deterministic FSM for enemy AI.
 * States: HOLD | RETREAT | ATTACK | REINFORCE | ARTILLERY
 * Returns array of AI actions: [{unitId, type: 'MOVE'|'SHOOT'|'ARTILLERY', target?}]
 */
export function computeAIActions(state) {
  const { units, grid, turn } = state;
  const actions = [];
  const players = getAllPlayersAlive(units);
  if (players.length === 0) return actions;

  Object.values(units).forEach(enemy => {
    if (enemy.side !== 'enemy' || enemy.hp <= 0 || enemy.stunned) return;

    const newState = evaluateState(enemy, players, units, grid, turn);
    enemy.aiState = newState;

    switch (newState) {
      case 'ATTACK': {
        const target = getNearestPlayer(enemy, players);
        if (!target) break;
        const dist = manhattan(enemy.x, enemy.y, target.x, target.y);
        if (dist <= enemy.range && enemy.attack > 0) {
          actions.push({ unitId: enemy.id, type: 'SHOOT', targetId: target.id });
          if (enemy.attacksPerTurn > 1) {
            actions.push({ unitId: enemy.id, type: 'SHOOT', targetId: target.id });
          }
        } else if (enemy.move > 0) {
          const step = stepToward(enemy, target, grid, units);
          if (step) actions.push({ unitId: enemy.id, type: 'MOVE', to: step });
        }
        break;
      }
      case 'RETREAT': {
        if (enemy.move > 0) {
          const step = stepAway(enemy, players, grid, units);
          if (step) actions.push({ unitId: enemy.id, type: 'MOVE', to: step });
        }
        break;
      }
      case 'ARTILLERY': {
        const target = players[Math.floor((turn * 7 + enemy.id) % players.length)];
        actions.push({ unitId: enemy.id, type: 'ARTILLERY', cx: target.x, cy: target.y });
        break;
      }
      case 'HOLD':
      default: {
        // Still shoot if player is in range
        const target = getPlayerInRange(enemy, players);
        if (target) {
          actions.push({ unitId: enemy.id, type: 'SHOOT', targetId: target.id });
          if (enemy.attacksPerTurn > 1) {
            actions.push({ unitId: enemy.id, type: 'SHOOT', targetId: target.id });
          }
        }
        break;
      }
    }
  });

  return actions;
}

function evaluateState(enemy, players, units, grid, turn) {
  if (enemy.type === 'ARTILLERY') {
    return (turn % enemy.fireEvery === 0) ? 'ARTILLERY' : 'HOLD';
  }
  if (enemy.type === 'OFFICER') {
    return 'HOLD';
  }

  // Check if flanked (player on same Y, ±2 X)
  const flanked = players.some(p => p.y === enemy.y && Math.abs(p.x - enemy.x) <= 2);
  if (flanked) return 'RETREAT';

  // Check if player is in attack range
  const inRange = players.some(p => manhattan(enemy.x, enemy.y, p.x, p.y) <= enemy.range);
  if (inRange) return 'ATTACK';

  // Check if player is getting close (within 3)
  const close = players.some(p => manhattan(enemy.x, enemy.y, p.x, p.y) <= 3);
  if (close) return 'ATTACK';

  return 'HOLD';
}

function getNearestPlayer(enemy, players) {
  let best = null, bestDist = Infinity;
  players.forEach(p => {
    const d = manhattan(enemy.x, enemy.y, p.x, p.y);
    if (d < bestDist) { bestDist = d; best = p; }
  });
  return best;
}

function getPlayerInRange(enemy, players) {
  return players.find(p => manhattan(enemy.x, enemy.y, p.x, p.y) <= enemy.range) || null;
}

function stepToward(enemy, target, grid, units) {
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const candidates = [];
  if (Math.abs(dy) >= Math.abs(dx)) {
    candidates.push({ x: enemy.x, y: enemy.y + Math.sign(dy) });
    candidates.push({ x: enemy.x + Math.sign(dx), y: enemy.y });
  } else {
    candidates.push({ x: enemy.x + Math.sign(dx), y: enemy.y });
    candidates.push({ x: enemy.x, y: enemy.y + Math.sign(dy) });
  }
  return candidates.find(c => isPassable(grid, c.x, c.y, units)) || null;
}

function stepAway(enemy, players, grid, units) {
  // Move toward higher Y (away from player's direction which is from Y=6 going up)
  const candidates = [
    { x: enemy.x, y: enemy.y + 1 },
    { x: enemy.x - 1, y: enemy.y },
    { x: enemy.x + 1, y: enemy.y },
    { x: enemy.x, y: enemy.y - 1 }
  ];
  return candidates.find(c => isPassable(grid, c.x, c.y, units)) || null;
}
