/**
 * render.js — Canvas rendering za Pulse Runner.
 *
 * Odgovornosti:
 * - Brisanje canvas-a i crtanje pozadine (#0a0a12)
 * - Crtanje grid ćelija: empty (#1a1a2e), wall (#0d0d1f), collectible (žuta glow),
 *   exit (tirkizna blago animirana)
 * - Crtanje igrača (crveni kvadrat koji pulsira po playerPulsePhase)
 * - Puls flash overlay (bijeli bljesak koji feid-uje za 0.3s)
 * - Level transition flash (tirkizni overlay za 0.5s)
 * - NE crta HUD — to radi ui.js u DOM-u
 *
 * Sve se oslanja na CONFIG.COLORS za boje.
 * Grid je uvek centriran na canvas-u sa GRID_PADDING marginom.
 *
 * Render je čisto vizuelno — ne menja state.
 */

import { CONFIG } from './config.js';

/**
 * Izračunava geometriju grida: poziciju i dimenzije svake ćelije.
 * Grid je centriran na canvasu, ćelije su kvadratne.
 *
 * @param {number} canvasW - Logička širina canvas-a (bez DPI scale)
 * @param {number} canvasH - Logička visina canvas-a
 * @param {number} gridSize - Broj ćelija (NxN)
 * @returns {{ cellSize: number, offsetX: number, offsetY: number }}
 */
export function calcGridLayout(canvasW, canvasH, gridSize) {
  const available = Math.min(canvasW, canvasH) - CONFIG.GRID_PADDING * 2;
  const cellSize = Math.floor((available - CONFIG.CELL_GAP * (gridSize - 1)) / gridSize);
  const totalSize = cellSize * gridSize + CONFIG.CELL_GAP * (gridSize - 1);
  const offsetX = Math.floor((canvasW - totalSize) / 2);
  const offsetY = Math.floor((canvasH - totalSize) / 2);
  return { cellSize, offsetX, offsetY };
}

/**
 * Vraća X, Y poziciju gornjeg levog ugla ćelije na canvasu.
 *
 * @param {number} row
 * @param {number} col
 * @param {{ cellSize: number, offsetX: number, offsetY: number }} layout
 * @returns {{ x: number, y: number }}
 */
export function cellToCanvas(row, col, layout) {
  const x = layout.offsetX + col * (layout.cellSize + CONFIG.CELL_GAP);
  const y = layout.offsetY + row * (layout.cellSize + CONFIG.CELL_GAP);
  return { x, y };
}

/**
 * Crta jednu grid ćeliju na kanvasu.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Canvas X pozicija
 * @param {number} y - Canvas Y pozicija
 * @param {number} size - Veličina ćelije u pikselima
 * @param {string} color - Fill boja
 * @param {number} [radius] - Border radius (default: CONFIG.CELL_BORDER_RADIUS)
 */
export function drawCell(ctx, x, y, size, color, radius) {
  const r = radius ?? CONFIG.CELL_BORDER_RADIUS;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, r);
  ctx.fill();
}

/**
 * Crta igrača — crveni kvadrat koji pulsira u veličini po playerPulsePhase.
 * Pulsiranje: sin(playerPulsePhase) mapiran na 0.7–0.9 scale faktora.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Canvas X centar igrača
 * @param {number} y - Canvas Y centar igrača
 * @param {number} size - Bazna veličina ćelije
 * @param {number} pulsePhase - Faza oscilacije (0–2π)
 */
export function drawPlayer(ctx, x, y, size, pulsePhase) {
  const scale = 0.7 + 0.2 * Math.sin(pulsePhase);
  const s = size * scale;
  const halfS = s / 2;

  // Glow efekat ispod kvadrata
  ctx.shadowBlur = 14;
  ctx.shadowColor = CONFIG.COLORS.PLAYER;

  ctx.fillStyle = CONFIG.COLORS.PLAYER;
  ctx.beginPath();
  ctx.roundRect(x - halfS, y - halfS, s, s, CONFIG.CELL_BORDER_RADIUS);
  ctx.fill();

  ctx.shadowBlur = 0;
}

/**
 * Crta collectible ćeliju — žuti kvadrat sa glow aurom.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 */
export function drawCollectible(ctx, x, y, size) {
  ctx.shadowBlur = 16;
  ctx.shadowColor = CONFIG.COLORS.COLLECTIBLE;
  drawCell(ctx, x, y, size, CONFIG.COLORS.COLLECTIBLE);
  ctx.shadowBlur = 0;
}

/**
 * Crta exit ćeliju — tirkizna, blago animirana (blinking glow).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {number} timestamp - performance.now() za animaciju
 */
export function drawExit(ctx, x, y, size, timestamp) {
  const glow = 8 + 8 * Math.sin(timestamp / 400); // oscilira 8–16px glow
  ctx.shadowBlur = glow;
  ctx.shadowColor = CONFIG.COLORS.EXIT;
  drawCell(ctx, x, y, size, CONFIG.COLORS.EXIT);
  ctx.shadowBlur = 0;
}

/**
 * Crta puls flash overlay — bijeli semi-transparent rect koji se feid-uje.
 * Alpha = pulseFlashTimer / CONFIG.PULSE_FLASH_DURATION
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Canvas logička širina
 * @param {number} h - Canvas logička visina
 * @param {number} pulseFlashTimer - Preostalo vreme flash-a (sekunde)
 */
export function drawPulseFlash(ctx, w, h, pulseFlashTimer) {
  if (pulseFlashTimer <= 0) return;
  const alpha = (pulseFlashTimer / CONFIG.PULSE_FLASH_DURATION) * 0.35;
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Crta level transition flash — tirkizni overlay.
 * Alpha = levelFlashTimer / CONFIG.LEVEL_FLASH_DURATION
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} levelFlashTimer - Preostalo vreme flash-a (sekunde)
 */
export function drawLevelFlash(ctx, w, h, levelFlashTimer) {
  if (levelFlashTimer <= 0) return;
  const alpha = (levelFlashTimer / CONFIG.LEVEL_FLASH_DURATION) * 0.5;
  ctx.fillStyle = `rgba(0,212,170,${alpha})`;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Glavni render poziv — crta ceo frame.
 * Poziva se svaki frame iz main.js.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function render(ctx, state) {
  const dpr = devicePixelRatio || 1;
  const w = ctx.canvas.width / dpr;
  const h = ctx.canvas.height / dpr;

  // 1. Pozadina
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  // 2. Grid ćelije (samo dok smo u 'playing' ekranu)
  if (state.screen === 'playing' && state.grid.length) {
    const layout = calcGridLayout(w, h, state.gridSize);
    const now = performance.now();

    for (let r = 0; r < state.gridSize; r++) {
      for (let c = 0; c < state.gridSize; c++) {
        const cell = state.grid[r][c];
        const { x, y } = cellToCanvas(r, c, layout);

        if (cell.type === 'wall') {
          drawCell(ctx, x, y, layout.cellSize, CONFIG.COLORS.CELL_WALL);
        } else if (cell.type === 'empty') {
          drawCell(ctx, x, y, layout.cellSize, CONFIG.COLORS.CELL_EMPTY);
        } else if (cell.type === 'collectible') {
          // Nacrtaj praznu ćeliju ispod, pa collectible
          drawCell(ctx, x, y, layout.cellSize, CONFIG.COLORS.CELL_EMPTY);
          drawCollectible(ctx, x, y, layout.cellSize);
        } else if (cell.type === 'exit') {
          // Nacrtaj praznu ćeliju ispod, pa exit
          drawCell(ctx, x, y, layout.cellSize, CONFIG.COLORS.CELL_EMPTY);
          drawExit(ctx, x, y, layout.cellSize, now);
        }
      }
    }

    // Input window indikacija — blagi border oko canvas-a
    if (state.inInputWindow) {
      const logW = ctx.canvas.width / dpr;
      const logH = ctx.canvas.height / dpr;
      ctx.save();
      ctx.strokeStyle = 'rgba(233, 69, 96, 0.4)'; // crvena, providno
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, logW - 4, logH - 4);
      ctx.restore();
    }

    // 3. Igrač — crta se na centru ćelije iznad grida
    const { x: px, y: py } = cellToCanvas(state.playerPos.row, state.playerPos.col, layout);
    drawPlayer(
      ctx,
      px + layout.cellSize / 2,
      py + layout.cellSize / 2,
      layout.cellSize,
      state.playerPulsePhase
    );
  }

  // 4. Overlay efekti (crtaju se na vrhu, iznad svega)
  if (state.pulseFlash && state.pulseFlashTimer > 0) {
    drawPulseFlash(ctx, w, h, state.pulseFlashTimer);
  }
  if (state.levelFlash && state.levelFlashTimer > 0) {
    drawLevelFlash(ctx, w, h, state.levelFlashTimer);
  }
}
