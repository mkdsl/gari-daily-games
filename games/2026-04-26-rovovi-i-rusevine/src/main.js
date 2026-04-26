import { CONFIG } from './config.js';
import { createState, saveState } from './state.js';
import { initInput, readInput } from './input.js';
import { render, getLayout } from './render.js';
import { initUI, updateHUD, getSelectedAction } from './ui.js';
import { resolveTurn } from './systems/turn.js';
import { manhattan } from './systems/grid.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

let state = createState();
initInput(canvas);
initUI(handleAction, handleEndTurn);

let animState = null;
let animStartTime = 0;
let pendingAnimEvents = [];
let saveTimer = 0;
let lastTime = performance.now();

function loop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  if (state.phase === 'ANIMATING') {
    const elapsed = now - animStartTime;
    const progress = Math.min(1, elapsed / CONFIG.ANIM_DURATION_MS);
    updateAnimState(pendingAnimEvents, progress);
    if (progress >= 1) {
      animState = null;
      pendingAnimEvents = [];
      if (state.phase === 'ANIMATING') {
        state.phase = state.result ? 'GAMEOVER' : 'PLAYING';
      }
    }
  }

  if (state.phase === 'PLAYING' || state.phase === 'MENU') {
    handleInput();
  }

  render(ctx, state, animState);
  updateHUD(state);

  saveTimer += dt;
  if (saveTimer >= CONFIG.SAVE_INTERVAL_SEC) {
    if (state.phase === 'PLAYING') saveState(state);
    saveTimer = 0;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// ─── Input ────────────────────────────────────────────────────────────────────

function handleInput() {
  const input = readInput();
  if (!input.pressed) return;

  if (state.phase === 'MENU') {
    state.phase = 'PLAYING';
    return;
  }
  if (state.phase !== 'PLAYING') return;

  const { cellX, cellY } = input;
  if (cellX < 0 || cellX >= CONFIG.COLS || cellY < 0 || cellY >= CONFIG.ROWS) return;

  const clickedUnit = getUnitAtCell(cellX, cellY);
  const action = getSelectedAction();

  if (clickedUnit && clickedUnit.side === 'player' && clickedUnit.hp > 0) {
    state.selectedUnit = clickedUnit.id;
    return;
  }

  if (!state.selectedUnit) return;
  const selected = state.units[state.selectedUnit];
  if (!selected || selected.hp <= 0) { state.selectedUnit = null; return; }

  if (action === 'SMOKE') {
    if (state.ammo < CONFIG.AMMO_SMOKE) return;
    state.ammo -= CONFIG.AMMO_SMOKE;
    queueAction({ unitId: selected.id, type: 'SMOKE', cx: cellX, cy: cellY });
    state.selectedUnit = null;
    return;
  }

  if (action === 'MOVE') {
    const cell = state.grid[cellY][cellX];
    if (cell.occupant !== null) return;
    if (cell.type === 'RUBBLE' || cell.type === 'BLOCKED') return;
    if (manhattan(selected.x, selected.y, cellX, cellY) > selected.move) return;
    queueAction({ unitId: selected.id, type: 'MOVE', to: { x: cellX, y: cellY } });
    state.selectedUnit = null;
    return;
  }

  if (action === 'SHOOT') {
    const target = clickedUnit;
    if (!target || target.side !== 'enemy') return;
    if (state.ammo < CONFIG.AMMO_SHOOT) return;
    if (manhattan(selected.x, selected.y, target.x, target.y) > selected.range) return;
    state.ammo -= CONFIG.AMMO_SHOOT;
    queueAction({ unitId: selected.id, type: 'SHOOT', targetId: target.id });
    state.selectedUnit = null;
    return;
  }

  if (action === 'CHARGE') {
    const target = clickedUnit;
    if (!target || target.side !== 'enemy') return;
    if (manhattan(selected.x, selected.y, target.x, target.y) > 1) return;
    queueAction({ unitId: selected.id, type: 'CHARGE', targetId: target.id });
    state.selectedUnit = null;
  }
}

function getUnitAtCell(x, y) {
  if (y < 0 || y >= CONFIG.ROWS || x < 0 || x >= CONFIG.COLS) return null;
  const id = state.grid[y][x].occupant;
  return id !== null ? state.units[id] : null;
}

function queueAction(action) {
  state.pendingActions = state.pendingActions.filter(a => a.unitId !== action.unitId);
  state.pendingActions.push(action);
}

// ─── Turn ─────────────────────────────────────────────────────────────────────

function handleEndTurn() {
  if (state.phase !== 'PLAYING') return;
  const events = resolveTurn(state);
  pendingAnimEvents = events;
  animStartTime = performance.now();
  state.phase = 'ANIMATING';
  buildAnimState(events);
}

function handleAction() {}

// ─── Animation ────────────────────────────────────────────────────────────────

function buildAnimState(events) {
  animState = { movingUnits: [], hitFlash: new Set(), artilleryEvents: [], progress: 0 };
  events.forEach(ev => {
    if (ev.type === 'MOVE') {
      animState.movingUnits.push({ id: ev.id, from: ev.from, to: ev.to, cx: ev.from.x, cy: ev.from.y });
    }
    if (ev.type === 'HIT') animState.hitFlash.add(ev.targetId);
    if (ev.type === 'ARTILLERY') animState.artilleryEvents.push({ cx: ev.cx, cy: ev.cy });
  });
}

function updateAnimState(events, progress) {
  if (!animState) return;
  animState.progress = progress;
  animState.movingUnits.forEach(m => {
    m.cx = m.from.x + (m.to.x - m.from.x) * progress;
    m.cy = m.from.y + (m.to.y - m.from.y) * progress;
  });
  if (progress < 0.5) {
    animState.hitFlash = new Set(events.filter(e => e.type === 'HIT').map(e => e.targetId));
  } else {
    animState.hitFlash = new Set();
  }
}
