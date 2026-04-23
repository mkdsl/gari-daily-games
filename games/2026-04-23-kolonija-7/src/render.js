// src/render.js — Canvas rendering: grid, ćelije, sobe, particle efekti, screen shake

import { CONFIG } from './config.js';
import { getParticles } from './systems/particles.js';

/**
 * Izračunava grid offset na osnovu dimenzija canvasa.
 * @param {number} w - logical canvas width
 * @param {number} h - logical canvas height
 * @returns {{ offsetX: number, offsetY: number }}
 */
function gridOffset(w, h) {
  const gridW = CONFIG.GRID_COLS * CONFIG.CELL_SIZE;
  const gridH = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;
  return {
    offsetX: Math.floor((w - gridW) / 2),
    offsetY: Math.floor((h - gridH) / 2) + 30  // +30 za HUD
  };
}

/**
 * Glavni render poziv — briše canvas i crta sve slojeve u ispravnom redosledu.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function render(ctx, state) {
  const w = ctx.canvas.width  / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;

  // 1. Pozadina
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  // 2. Sve ostalo sa screen shake-om
  ctx.save();
  applyScreenShake(ctx, state);

  // 3. Grid ćelije
  renderGrid(ctx, state, w, h);

  // 4. Sobe (vizualni layer iznad grida)
  renderRooms(ctx, state);

  // 5. Particles
  renderParticles(ctx, state);

  // 6. Kristal glow (poseban layer)
  renderCrystalGlow(ctx, state);

  ctx.restore();

  // 7. Bura visual efekti (sand overlay, crta se bez shake-a)
  renderStormOverlay(ctx, state, w, h);

  // Resetuj transform posle screen shake-a
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

/**
 * Primenjuje screen shake transformaciju.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function applyScreenShake(ctx, state) {
  if (state.screenShake.timer > 0) {
    state.screenShake.timer -= 0.016;
    if (state.screenShake.timer < 0) state.screenShake.timer = 0;
    const progress  = Math.max(0, state.screenShake.timer / 0.5);
    const intensity = state.screenShake.intensity * progress;
    const dx = (Math.random() - 0.5) * intensity;
    const dy = (Math.random() - 0.5) * intensity;
    ctx.translate(dx, dy);
  }
}

/**
 * Crta sve grid ćelije (zemlja, tuneli, fog of war, resursi).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 * @param {number} w - canvas logical width
 * @param {number} h - canvas logical height
 */
export function renderGrid(ctx, state, w, h) {
  const cellSize = CONFIG.CELL_SIZE;
  const { offsetX, offsetY } = gridOffset(w, h);

  // Sačuvaj offset u state za input konverziju koordinata
  state.camera.x = -offsetX;
  state.camera.y = -offsetY;

  for (let r = 0; r < state.grid.length; r++) {
    for (let c = 0; c < state.grid[r].length; c++) {
      const cell = state.grid[r][c];
      const x = offsetX + c * cellSize;
      const y = offsetY + r * cellSize;

      if (!cell.revealed) {
        ctx.fillStyle = CONFIG.COLORS.FOG;
        ctx.fillRect(x, y, cellSize, cellSize);
        continue;
      }

      // Osnovna boja po tipu
      if (cell.type === 'TUNEL' || cell.type === 'SOBA') {
        ctx.fillStyle = CONFIG.COLORS.TUNEL;
      } else {
        ctx.fillStyle = CONFIG.COLORS.ZEMLJA;
      }
      ctx.fillRect(x, y, cellSize, cellSize);

      // Rub za tunele/sobe
      if (cell.type === 'TUNEL' || cell.type === 'SOBA') {
        ctx.strokeStyle = 'rgba(50,30,10,0.5)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      }

      // Resursi na ćeliji tipa ZEMLJA
      if (cell.type === 'ZEMLJA') {
        if (cell.resource === 'HRANA') {
          ctx.fillStyle = CONFIG.COLORS.FOOD;
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell.resource === 'MINERAL') {
          ctx.fillStyle = CONFIG.COLORS.MINERAL;
          ctx.fillRect(x + cellSize / 2 - 3, y + cellSize / 2 - 3, 6, 6);
        } else if (cell.resource === 'KRISTAL') {
          // Mali kristal prikaz — radijalni gradient
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellSize * 0.4);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, CONFIG.COLORS.KRISTAL);
          grad.addColorStop(1, 'rgba(0,255,221,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, cellSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Row 0 overlay (površina = nebo, blago plava nijansa)
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#87ceeb';
  for (let c = 0; c < CONFIG.GRID_COLS; c++) {
    ctx.fillRect(offsetX + c * cellSize, offsetY, cellSize, cellSize);
  }
  ctx.globalAlpha = 1;
}

/**
 * Crta vizuale soba na tunelima.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function renderRooms(ctx, state) {
  if (!state.rooms || state.rooms.length === 0) return;

  const cellSize = CONFIG.CELL_SIZE;
  const w = ctx.canvas.width  / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;
  const { offsetX, offsetY } = gridOffset(w, h);

  const roomColors = {
    MAGACIN: CONFIG.COLORS.SOBA_MAGACIN,
    LEGLO:   CONFIG.COLORS.SOBA_LEGLO,
    ZID:     CONFIG.COLORS.SOBA_ZID,
    LAB:     CONFIG.COLORS.SOBA_LAB
  };
  const roomIcons = { MAGACIN: '▣', LEGLO: 'Ω', ZID: '■', LAB: '◈' };

  for (const room of state.rooms) {
    const x = offsetX + room.col * cellSize;
    const y = offsetY + room.row * cellSize;

    ctx.fillStyle = roomColors[room.type] ?? '#444';
    ctx.fillRect(x, y, cellSize, cellSize);

    // Ikona sobe (ASCII da ne zavisi od emoji podrške)
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = `${Math.floor(cellSize * 0.45)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(roomIcons[room.type] ?? '?', x + cellSize / 2, y + cellSize / 2);

    // Level indikator u gornjem desnom uglu
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`L${room.level}`, x + cellSize - 2, y + 2);
  }

  // Resetuj tekstualni state
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

/**
 * Crta sve žive čestice.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function renderParticles(ctx, state) {
  const particles = getParticles(state);
  if (particles.length === 0) return;

  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Crta kristal glow efekat (pulsing teal glow).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function renderCrystalGlow(ctx, state) {
  const cellSize = CONFIG.CELL_SIZE;
  const w = ctx.canvas.width  / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;
  const { offsetX, offsetY } = gridOffset(w, h);

  for (let r = 0; r < state.grid.length; r++) {
    for (let c = 0; c < state.grid[r].length; c++) {
      const cell = state.grid[r][c];
      if (cell.resource !== 'KRISTAL' || !cell.revealed) continue;

      const cx = offsetX + c * cellSize + cellSize / 2;
      const cy = offsetY + r * cellSize + cellSize / 2;
      const pulse  = 0.5 + 0.5 * Math.sin(Date.now() / 500);
      const radius = cellSize * (2 + pulse * 0.5);

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `rgba(0,255,221,${0.6 + pulse * 0.2})`);
      grad.addColorStop(1, 'rgba(0,255,221,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Crta sand overlay efekat za buru (transparency u zavisnosti od storm.intensity).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 * @param {number} w
 * @param {number} h
 */
export function renderStormOverlay(ctx, state, w, h) {
  if (!state.storm || state.storm.intensity <= 0) return;

  const intensity = state.storm.intensity;

  // Ceo ekran — blagi sand tint
  ctx.fillStyle = CONFIG.COLORS.STORM_SAND;
  ctx.globalAlpha = intensity * 0.25;
  ctx.fillRect(0, 0, w, h);

  // Horizontalna traka na vrhu (pesak koji ulazi)
  ctx.globalAlpha = intensity * 0.6;
  ctx.fillRect(0, 0, w, 4);

  ctx.globalAlpha = 1;
}
