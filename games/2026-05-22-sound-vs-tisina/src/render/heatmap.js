// heatmap.js — canvas heatmap rendering with offscreen buffer
import { GRID_W, GRID_H, CELL_PX, CELL_PY, SPL_THRESHOLDS, CANVAS_W, CANVAS_H } from '../config.js';

let offscreenCanvas = null;
let offCtx = null;
let colorCache = null;

function initOffscreen() {
  offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = CANVAS_W;
  offscreenCanvas.height = CANVAS_H;
  offCtx = offscreenCanvas.getContext('2d');
  // Build 256-level color cache for fast lookup
  buildColorCache();
}

function buildColorCache() {
  colorCache = new Array(256);
  for (let i = 0; i < 256; i++) {
    // Map 0-255 to SPL range 0-120 dB
    const spl = i * 120 / 255;
    colorCache[i] = splToColor(spl);
  }
}

export function splToColor(spl) {
  for (const t of SPL_THRESHOLDS) {
    if (spl < t.max) return t.color;
  }
  return SPL_THRESHOLDS[SPL_THRESHOLDS.length - 1].color;
}

export function renderHeatmap(ctx, state) {
  if (!offscreenCanvas) initOffscreen();

  const hm = state.heatmap;
  const venue = state.currentVenue;
  if (!venue) return;

  // Draw bg
  offCtx.fillStyle = venue.bgColor || '#0d1117';
  offCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Draw each cell
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const spl = hm[y * GRID_W + x];
      offCtx.fillStyle = splToColor(spl);
      offCtx.fillRect(x * CELL_PX, y * CELL_PY, CELL_PX, CELL_PY);
    }
  }

  // Draw neighbor zone indicator
  const np = venue.neighborPos;
  const nx = np.x * CELL_PX;
  const ny = np.y * CELL_PY;
  const neighborSPL = state.neighborSPL;
  const neighborColor = neighborSPL >= 70 ? '#ff2244' : neighborSPL >= 65 ? '#ffaa00' : '#ffffff';

  // Pulsing ring around neighbor
  const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 300);
  offCtx.strokeStyle = neighborColor;
  offCtx.lineWidth = 2;
  offCtx.globalAlpha = pulse;
  offCtx.beginPath();
  offCtx.arc(nx + CELL_PX / 2, ny + CELL_PY / 2, CELL_PX * 2, 0, Math.PI * 2);
  offCtx.stroke();
  offCtx.globalAlpha = 1;

  // Neighbor label
  offCtx.fillStyle = neighborColor;
  offCtx.font = 'bold 9px monospace';
  offCtx.fillText('🏠', nx - 2, ny - 4);

  // Copy offscreen to main canvas
  ctx.drawImage(offscreenCanvas, 0, 0);
}
