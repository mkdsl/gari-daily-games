import { CONFIG } from './config.js';
import { setGridLayout } from './input.js';
import { getCellsInRange, manhattan } from './systems/grid.js';

const CELL = CONFIG.CELL_SIZE;

let _layout = { cols: CONFIG.COLS, rows: CONFIG.ROWS, cellSize: CELL, offsetX: 0, offsetY: 0 };

export function getLayout() { return _layout; }

export function render(ctx, state, animState) {
  const w = ctx.canvas.width / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;

  // Compute layout
  const isMobile = w < CONFIG.MOBILE_BREAKPOINT;
  const cols = isMobile ? CONFIG.MOBILE_COLS : CONFIG.COLS;
  const rows = isMobile ? CONFIG.MOBILE_ROWS : CONFIG.ROWS;
  const cellSize = isMobile ? Math.floor(w * 0.98 / cols) : CELL;
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;
  const offsetX = Math.floor((w - gridW) / 2);
  const offsetY = isMobile ? Math.floor(h * 0.05) : Math.floor((h - gridH) / 2 - 20);

  _layout = { cols, rows, cellSize, offsetX, offsetY };
  setGridLayout(offsetX, offsetY, cellSize);

  // Background
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  if (state.phase === 'MENU') {
    drawMenu(ctx, w, h);
    return;
  }

  drawGrid(ctx, state, offsetX, offsetY, cellSize, cols, rows);
  drawSmoke(ctx, state, offsetX, offsetY, cellSize);
  drawHighlights(ctx, state, offsetX, offsetY, cellSize);
  drawUnits(ctx, state, animState, offsetX, offsetY, cellSize);
  drawAnimEvents(ctx, animState, offsetX, offsetY, cellSize);
}

function drawMenu(ctx, w, h) {
  ctx.fillStyle = CONFIG.COLORS.GROUND;
  ctx.fillRect(0, 0, w, h);

  // Draw stylized trench lines
  ctx.strokeStyle = CONFIG.COLORS.TRENCH;
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const y = h * (0.2 + i * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = `bold ${Math.min(40, w * 0.07)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('ROVOVI I RUŠEVINE', w / 2, h * 0.3);

  ctx.font = `${Math.min(18, w * 0.04)}px monospace`;
  ctx.fillStyle = '#8B9060';
  ctx.fillText('1917. ZAPADNI FRONT', w / 2, h * 0.38);

  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = `${Math.min(16, w * 0.035)}px monospace`;
  const lines = [
    'Probij 3 linije rovova za 20 poteza.',
    'Klikni vojnika → klikni cilj → "POTEZ!"'
  ];
  lines.forEach((l, i) => ctx.fillText(l, w / 2, h * 0.52 + i * 28));

  // Start button hint
  ctx.fillStyle = CONFIG.COLORS.AMMO;
  ctx.font = `bold ${Math.min(20, w * 0.04)}px monospace`;
  ctx.fillText('[ KLIKNI BILO GDE ZA START ]', w / 2, h * 0.72);
  ctx.textAlign = 'left';
}

function drawGrid(ctx, state, ox, oy, cs, cols, rows) {
  const C = CONFIG.COLORS;

  for (let y = 0; y < rows; y++) {
    const gridY = y; // could add camera offset for mobile
    if (gridY >= CONFIG.ROWS) continue;
    for (let x = 0; x < cols; x++) {
      const gridX = x;
      if (gridX >= CONFIG.COLS) continue;
      const cell = state.grid[gridY][gridX];
      const px = ox + x * cs;
      const py = oy + y * cs;

      // Cell background
      let bg = C.GROUND;
      if (cell.type === 'TRENCH') bg = C.TRENCH;
      else if (cell.type === 'RUBBLE') bg = C.RUBBLE;
      else if (cell.type === 'BLOCKED') bg = C.BLOCKED;
      ctx.fillStyle = bg;
      ctx.fillRect(px, py, cs, cs);

      // Trench visual — horizontal grooves
      if (cell.type === 'TRENCH') {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        for (let g = 0; g < 3; g++) {
          const gy = py + cs * 0.25 + g * cs * 0.2;
          ctx.beginPath();
          ctx.moveTo(px + 4, gy);
          ctx.lineTo(px + cs - 4, gy);
          ctx.stroke();
        }
      }

      // Rubble visual — X marks
      if (cell.type === 'RUBBLE') {
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + 8, py + 8);
        ctx.lineTo(px + cs - 8, py + cs - 8);
        ctx.moveTo(px + cs - 8, py + 8);
        ctx.lineTo(px + 8, py + cs - 8);
        ctx.stroke();
      }

      // Grid line
      ctx.strokeStyle = C.GRID_LINE;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, cs, cs);
    }
  }
}

function drawSmoke(ctx, state, ox, oy, cs) {
  state.smokeZones.forEach(zone => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const gx = zone.x + dx, gy = zone.y + dy;
        if (gx < 0 || gx >= CONFIG.COLS || gy < 0 || gy >= CONFIG.ROWS) continue;
        const px = ox + gx * cs, py = oy + gy * cs;
        ctx.fillStyle = CONFIG.COLORS.SMOKE;
        ctx.fillRect(px, py, cs, cs);
      }
    }
  });
}

function drawHighlights(ctx, state, ox, oy, cs) {
  if (!state.selectedUnit) return;
  const unit = state.units[state.selectedUnit];
  if (!unit) return;

  // Movement range highlight
  const moveTargets = getReachableCells(state, unit);
  moveTargets.forEach(({ x, y }) => {
    ctx.fillStyle = CONFIG.COLORS.HIGHLIGHT;
    ctx.fillRect(ox + x * cs, oy + y * cs, cs, cs);
  });

  // Attack range highlight
  const attackTargets = getAttackTargets(state, unit);
  attackTargets.forEach(({ x, y }) => {
    ctx.fillStyle = CONFIG.COLORS.ATTACK_HL;
    ctx.fillRect(ox + x * cs, oy + y * cs, cs, cs);
  });

  // Selected unit border
  ctx.strokeStyle = CONFIG.COLORS.PLAYER_SEL;
  ctx.lineWidth = 3;
  ctx.strokeRect(ox + unit.x * cs + 2, oy + unit.y * cs + 2, cs - 4, cs - 4);
}

function getReachableCells(state, unit) {
  const result = [];
  for (let dy = -unit.move; dy <= unit.move; dy++) {
    for (let dx = -unit.move; dx <= unit.move; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (Math.abs(dx) + Math.abs(dy) > unit.move) continue;
      const nx = unit.x + dx, ny = unit.y + dy;
      if (nx < 0 || nx >= CONFIG.COLS || ny < 0 || ny >= CONFIG.ROWS) continue;
      const cell = state.grid[ny][nx];
      if (cell.type === 'RUBBLE' || cell.type === 'BLOCKED') continue;
      if (cell.occupant !== null) continue;
      result.push({ x: nx, y: ny });
    }
  }
  return result;
}

function getAttackTargets(state, unit) {
  const result = [];
  Object.values(state.units).forEach(target => {
    if (target.side !== 'enemy' || target.hp <= 0) return;
    const dist = manhattan(unit.x, unit.y, target.x, target.y);
    if (dist <= unit.range) result.push({ x: target.x, y: target.y });
  });
  return result;
}

function drawUnits(ctx, state, animState, ox, oy, cs) {
  const movers = new Set((animState?.movingUnits || []).map(m => m.id));

  Object.values(state.units).forEach(unit => {
    if (unit.hp <= 0) return;
    let px, py;
    if (movers.has(unit.id) && animState) {
      const anim = animState.movingUnits.find(m => m.id === unit.id);
      px = ox + anim.cx * cs + cs * 0.5;
      py = oy + anim.cy * cs + cs * 0.5;
    } else {
      px = ox + unit.x * cs + cs * 0.5;
      py = oy + unit.y * cs + cs * 0.5;
    }

    drawUnit(ctx, unit, px, py, cs, state.selectedUnit === unit.id, animState);
  });
}

function drawUnit(ctx, unit, cx, cy, cs, selected, animState) {
  const r = cs * 0.32;
  const isPlayer = unit.side === 'player';

  // Hit flash
  const hitFlash = animState?.hitFlash?.has(unit.id);
  const baseColor = hitFlash ? CONFIG.COLORS.HIT_FLASH : (isPlayer ? CONFIG.COLORS.PLAYER : CONFIG.COLORS.ENEMY);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.8, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body circle
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner detail — helmet shape
  ctx.fillStyle = isPlayer ? '#3a4a1e' : '#5c1800';
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.15, r * 0.55, Math.PI, 0);
  ctx.fill();

  // Type indicator
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = `bold ${Math.floor(cs * 0.22)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icon = getUnitIcon(unit.type);
  ctx.fillText(icon, cx, cy + r * 0.1);
  ctx.textBaseline = 'alphabetic';

  // HP bar
  const barW = cs * 0.7;
  const barH = 4;
  const barX = cx - barW / 2;
  const barY = cy + r + 3;
  ctx.fillStyle = CONFIG.COLORS.HP_EMPTY;
  ctx.fillRect(barX, barY, barW, barH);
  const hpFrac = Math.max(0, unit.hp / unit.maxHp);
  ctx.fillStyle = hpFrac > 0.5 ? CONFIG.COLORS.HP_FULL : '#c8a84b';
  ctx.fillRect(barX, barY, barW * hpFrac, barH);

  // Acted indicator (player units that have already acted)
  if (isPlayer && unit.acted) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (selected) {
    ctx.strokeStyle = CONFIG.COLORS.PLAYER_SEL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.textAlign = 'left';
}

function getUnitIcon(type) {
  const icons = { SOLDIER: '⚔', RIFLEMAN: '✦', MACHINEGUN: '⊕', OFFICER: '★', ARTILLERY: '◉' };
  return icons[type] || '•';
}

function drawAnimEvents(ctx, animState, ox, oy, cs) {
  if (!animState) return;
  // Draw artillery explosion
  (animState.artilleryEvents || []).forEach(ev => {
    const t = animState.progress;
    const alpha = Math.sin(t * Math.PI) * 0.8;
    ctx.fillStyle = `rgba(255,120,0,${alpha})`;
    const r = cs * (0.5 + t);
    ctx.beginPath();
    ctx.arc(ox + ev.cx * cs + cs / 2, oy + ev.cy * cs + cs / 2, r, 0, Math.PI * 2);
    ctx.fill();
  });
}
