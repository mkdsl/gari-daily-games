import { CONFIG } from '../config.js';
import { isPassable, moveUnit, removeUnit, getLineClearStatus, getAllPlayersAlive, getCellsInRange, manhattan } from './grid.js';
import { computeAIActions } from './ai.js';
import { spawnLineEnemies } from '../entities/enemy.js';
import { computeScore } from './score.js';

/**
 * Process a full turn. Mutates state in place.
 * Returns array of animation events.
 */
export function resolveTurn(state) {
  const events = [];
  state.turn += 1;

  // Tick smoke zones
  state.smokeZones = state.smokeZones
    .map(z => ({ ...z, turns: z.turns - 1 }))
    .filter(z => z.turns > 0);

  // Phase 1: Collect player actions (already in state.pendingActions)
  const playerActions = [...state.pendingActions];
  state.pendingActions = [];

  // Phase 2: Initial death sweep
  sweepDead(state, events);

  // Phase 3: Player movement
  for (const action of playerActions) {
    if (action.type !== 'MOVE') continue;
    const unit = state.units[action.unitId];
    if (!unit || unit.hp <= 0) continue;
    if (!isPassable(state.grid, action.to.x, action.to.y, state.units)) continue;
    const from = { x: unit.x, y: unit.y };
    moveUnit(state.grid, unit, action.to.x, action.to.y);
    events.push({ type: 'MOVE', id: unit.id, from, to: { x: unit.x, y: unit.y } });
  }

  // Phase 4: AI decisions + movement
  const aiActions = computeAIActions(state);
  for (const action of aiActions) {
    if (action.type !== 'MOVE') continue;
    const unit = state.units[action.unitId];
    if (!unit || unit.hp <= 0) continue;
    if (!isPassable(state.grid, action.to.x, action.to.y, state.units)) continue;
    const from = { x: unit.x, y: unit.y };
    moveUnit(state.grid, unit, action.to.x, action.to.y);
    events.push({ type: 'MOVE', id: unit.id, from, to: { x: unit.x, y: unit.y } });
  }

  // Phase 5: Officer buff — apply temp HP bonus
  applyOfficerBuffs(state);

  // Phase 6: Player attacks
  for (const action of playerActions) {
    const unit = state.units[action.unitId];
    if (!unit || unit.hp <= 0) continue;

    if (action.type === 'SHOOT') {
      const target = state.units[action.targetId];
      if (!target || target.hp <= 0) continue;
      if (manhattan(unit.x, unit.y, target.x, target.y) > unit.range) continue;
      const dmg = unit.attack;
      target.hp = Math.max(0, target.hp - dmg);
      events.push({ type: 'HIT', attackerId: unit.id, targetId: target.id, dmg });
    } else if (action.type === 'CHARGE') {
      const target = state.units[action.targetId];
      if (!target || target.hp <= 0) continue;
      if (manhattan(unit.x, unit.y, target.x, target.y) > 1) continue;
      target.hp = Math.max(0, target.hp - 1);
      unit.hp = Math.max(0, unit.hp - 1);
      events.push({ type: 'HIT', attackerId: unit.id, targetId: target.id, dmg: 1 });
      events.push({ type: 'HIT', attackerId: target.id, targetId: unit.id, dmg: 1 });
    } else if (action.type === 'SMOKE') {
      state.smokeZones.push({ x: action.cx, y: action.cy, turns: 2 });
      events.push({ type: 'SMOKE', cx: action.cx, cy: action.cy });
      // Stun enemies in smoke zone
      getCellsInRange(action.cx, action.cy, 1, true).forEach(cell => {
        const id = state.grid[cell.y] && state.grid[cell.y][cell.x] ? state.grid[cell.y][cell.x].occupant : null;
        if (id !== null) {
          const u = state.units[id];
          if (u && u.side === 'enemy') u.stunned = true;
        }
      });
    }
  }

  // Phase 7: Enemy attacks
  for (const action of aiActions) {
    const unit = state.units[action.unitId];
    if (!unit || unit.hp <= 0 || unit.stunned) continue;

    if (action.type === 'SHOOT') {
      const target = state.units[action.targetId];
      if (!target || target.hp <= 0) continue;
      if (isInSmoke(state, target.x, target.y)) continue;
      if (manhattan(unit.x, unit.y, target.x, target.y) > unit.range) continue;
      const dmg = unit.attack;
      target.hp = Math.max(0, target.hp - dmg);
      events.push({ type: 'HIT', attackerId: unit.id, targetId: target.id, dmg });
    } else if (action.type === 'ARTILLERY') {
      const radius = 1;
      getCellsInRange(action.cx, action.cy, radius, true).forEach(cell => {
        const id = state.grid[cell.y] && state.grid[cell.y][cell.x] ? state.grid[cell.y][cell.x].occupant : null;
        if (id !== null) {
          const u = state.units[id];
          if (u && u.side === 'player' && u.hp > 0) {
            u.hp = Math.max(0, u.hp - 1);
            events.push({ type: 'HIT', attackerId: unit.id, targetId: u.id, dmg: 1 });
          }
        }
      });
      events.push({ type: 'ARTILLERY', cx: action.cx, cy: action.cy });
    }
  }

  // Phase 8: Clear stun
  Object.values(state.units).forEach(u => { u.stunned = false; });

  // Phase 9: Death sweep
  sweepDead(state, events);

  // Phase 10: Increment enemy turnsAlive, check line clears, spawn next line
  Object.values(state.units).forEach(u => { if (u.side === 'enemy') u.turnsAlive++; });

  for (let li = 0; li < CONFIG.LINE_Y.length; li++) {
    const lineY = CONFIG.LINE_Y[li];
    if (getLineClearStatus(state.units, lineY)) {
      if (!state.lineEnemiesSpawned[li]) continue;
      // This line cleared — check if next line needs spawning
      const nextLi = li + 1;
      if (nextLi < CONFIG.LINE_Y.length && !state.lineEnemiesSpawned[nextLi]) {
        state.lineEnemiesSpawned[nextLi] = true;
        const newEnemies = spawnLineEnemies(state.grid, nextLi, state.nextId);
        newEnemies.forEach(u => {
          state.units[u.id] = u;
          state.nextId = u.id + 1;
          events.push({ type: 'SPAWN', id: u.id, x: u.x, y: u.y });
        });
        state.linesCleared = nextLi;
      }
    }
  }

  // Check win/lose
  checkEndCondition(state);

  return events;
}

function sweepDead(state, events) {
  Object.values(state.units).forEach(u => {
    if (u.hp <= 0) {
      removeUnit(state.grid, u);
      events.push({ type: 'DEATH', id: u.id, x: u.x, y: u.y });
      delete state.units[u.id];
    }
  });
}

function applyOfficerBuffs(state) {
  const officers = Object.values(state.units).filter(u => u.type === 'OFFICER' && u.hp > 0);
  officers.forEach(off => {
    getCellsInRange(off.x, off.y, off.buffRadius, false).forEach(cell => {
      const id = state.grid[cell.y] && state.grid[cell.y][cell.x] ? state.grid[cell.y][cell.x].occupant : null;
      if (id !== null && state.units[id] && state.units[id].side === 'enemy') {
        // Buff: enemies near officer have +1 effective HP (max HP raised for this turn only)
        // Simple implementation: we just won't apply buff here for simplicity — officer presence
        // is communicated visually; its primary effect is as a priority target
      }
    });
  });
}

function isInSmoke(state, x, y) {
  return state.smokeZones.some(z => Math.abs(z.x - x) <= 1 && Math.abs(z.y - y) <= 1);
}

function checkEndCondition(state) {
  const players = getAllPlayersAlive(state.units);
  const allLinesCleared = state.lineEnemiesSpawned.every(
    (spawned, i) => spawned && getLineClearStatus(state.units, CONFIG.LINE_Y[i])
  );

  if (players.length === 0) {
    state.phase = 'GAMEOVER';
    state.result = computeScore(state, false);
    return;
  }
  if (allLinesCleared) {
    state.phase = 'GAMEOVER';
    state.result = computeScore(state, true);
    return;
  }
  if (state.turn >= CONFIG.MAX_TURNS) {
    state.phase = 'GAMEOVER';
    state.result = computeScore(state, false);
  }
}
