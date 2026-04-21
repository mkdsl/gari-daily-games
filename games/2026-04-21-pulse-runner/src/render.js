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
  // TODO: implementiraj
  // const available = Math.min(canvasW, canvasH) - CONFIG.GRID_PADDING * 2;
  // const cellSize = Math.floor((available - CONFIG.CELL_GAP * (gridSize - 1)) / gridSize);
  // const totalSize = cellSize * gridSize + CONFIG.CELL_GAP * (gridSize - 1);
  // const offsetX = Math.floor((canvasW - totalSize) / 2);
  // const offsetY = Math.floor((canvasH - totalSize) / 2);
  // return { cellSize, offsetX, offsetY };
  return { cellSize: 40, offsetX: 0, offsetY: 0 };
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
  // TODO: implementiraj
  // const x = layout.offsetX + col * (layout.cellSize + CONFIG.CELL_GAP);
  // const y = layout.offsetY + row * (layout.cellSize + CONFIG.CELL_GAP);
  // return { x, y };
  return { x: 0, y: 0 };
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
  // TODO: implementiraj rounded rect
  // ctx.fillStyle = color;
  // ctx.beginPath();
  // ctx.roundRect(x, y, size, size, radius ?? CONFIG.CELL_BORDER_RADIUS);
  // ctx.fill();
}

/**
 * Crta igrača — crveni kvadrat koji pulsira u veličini po playerPulsePhase.
 * Pulsiranje: sin(playerPulsePhase) mapiran na ±10% veličine ćelije.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Canvas X centar igrača
 * @param {number} y - Canvas Y centar igrača
 * @param {number} size - Bazna veličina ćelije
 * @param {number} pulsePhase - Faza oscilacije (0–2π)
 */
export function drawPlayer(ctx, x, y, size, pulsePhase) {
  // TODO: implementiraj
  // const scale = 1 + 0.1 * Math.sin(pulsePhase);
  // const s = size * scale * 0.75; // igrač je 75% veličine ćelije
  // ctx.fillStyle = CONFIG.COLORS.PLAYER;
  // ctx.beginPath();
  // ctx.roundRect(x - s/2, y - s/2, s, s, CONFIG.CELL_BORDER_RADIUS);
  // ctx.fill();
  // // Glow efekat
  // ctx.shadowBlur = 12;
  // ctx.shadowColor = CONFIG.COLORS.PLAYER;
  // ctx.fill();
  // ctx.shadowBlur = 0;
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
  // TODO: implementiraj
  // ctx.shadowBlur = 16;
  // ctx.shadowColor = CONFIG.COLORS.COLLECTIBLE;
  // drawCell(ctx, x, y, size, CONFIG.COLORS.COLLECTIBLE);
  // ctx.shadowBlur = 0;
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
  // TODO: implementiraj
  // const glow = 8 + 8 * Math.sin(timestamp / 400); // oscilira 8–16px glow
  // ctx.shadowBlur = glow;
  // ctx.shadowColor = CONFIG.COLORS.EXIT;
  // drawCell(ctx, x, y, size, CONFIG.COLORS.EXIT);
  // ctx.shadowBlur = 0;
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
  // TODO: implementiraj
  // if (pulseFlashTimer <= 0) return;
  // const alpha = pulseFlashTimer / CONFIG.PULSE_FLASH_DURATION * 0.35;
  // ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  // ctx.fillRect(0, 0, w, h);
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
  // TODO: implementiraj
  // if (levelFlashTimer <= 0) return;
  // const alpha = levelFlashTimer / CONFIG.LEVEL_FLASH_DURATION * 0.5;
  // ctx.fillStyle = `rgba(0,212,170,${alpha})`; // EXIT boja
  // ctx.fillRect(0, 0, w, h);
}

/**
 * Glavni render poziv — crta ceo frame.
 * Poziva se svaki frame iz main.js.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function render(ctx, state) {
  const w = ctx.canvas.width / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;

  // TODO: implementiraj kompletan render
  // 1. Pozadina
  // ctx.fillStyle = CONFIG.COLORS.BG;
  // ctx.fillRect(0, 0, w, h);

  // 2. Grid ćelije (samo dok smo u 'playing' ekranu)
  // if (state.screen === 'playing' && state.grid.length) {
  //   const layout = calcGridLayout(w, h, state.gridSize);
  //   for (let r = 0; r < state.gridSize; r++) {
  //     for (let c = 0; c < state.gridSize; c++) {
  //       const cell = state.grid[r][c];
  //       const { x, y } = cellToCanvas(r, c, layout);
  //       if (cell.type === 'wall') drawCell(ctx, x, y, layout.cellSize, CONFIG.COLORS.CELL_WALL);
  //       else if (cell.type === 'empty' || cell.type === 'exit') drawCell(ctx, x, y, layout.cellSize, CONFIG.COLORS.CELL_EMPTY);
  //       if (cell.type === 'collectible') drawCollectible(ctx, x, y, layout.cellSize);
  //       if (cell.type === 'exit') drawExit(ctx, x, y, layout.cellSize, performance.now());
  //     }
  //   }
  //   // 3. Igrač
  //   const { x, y } = cellToCanvas(state.playerPos.row, state.playerPos.col, layout);
  //   drawPlayer(ctx, x + layout.cellSize/2, y + layout.cellSize/2, layout.cellSize, state.playerPulsePhase);
  // }

  // 4. Overlay efekti
  // drawPulseFlash(ctx, w, h, state.pulseFlashTimer);
  // drawLevelFlash(ctx, w, h, state.levelFlashTimer);

  // Privremeni placeholder render
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = CONFIG.COLORS.HUD_TEXT;
  ctx.font = '14px monospace';
  ctx.fillText('Pulse Runner — stub render', 20, 40);
}
