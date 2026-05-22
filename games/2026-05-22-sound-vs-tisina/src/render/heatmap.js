// heatmap.js — canvas heatmap rendering with offscreen double-buffer
import { GRID_W, GRID_H, CELL_PX, CELL_PY, SPL_THRESHOLDS, CANVAS_W, CANVAS_H } from '../config.js';

let offscreenCanvas = null;
let offCtx = null;

function initOffscreen() {
  offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = CANVAS_W;
  offscreenCanvas.height = CANVAS_H;
  offCtx = offscreenCanvas.getContext('2d');
}

export function splToColor(spl) {
  for (const t of SPL_THRESHOLDS) {
    if (spl < t.max) return t.color;
  }
  return SPL_THRESHOLDS[SPL_THRESHOLDS.length - 1].color;
}

// Alpha for heatmap overlay — semi-transparent so terrain shows through
const HEATMAP_ALPHA = 0.72;

export function renderHeatmap(ctx, state) {
  if (!offscreenCanvas) initOffscreen();

  const hm = state.heatmap;
  const venue = state.currentVenue;
  if (!venue) return;

  // Clear offscreen with transparent bg so terrain bleeds through
  offCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Fill bg
  offCtx.fillStyle = venue.bgColor || '#0d1117';
  offCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Draw each heatmap cell
  offCtx.globalAlpha = HEATMAP_ALPHA;
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const spl = hm[y * GRID_W + x];
      if (spl < 55) continue; // skip near-zero cells for perf
      offCtx.fillStyle = splToColor(spl);
      offCtx.fillRect(x * CELL_PX, y * CELL_PY, CELL_PX, CELL_PY);
    }
  }
  offCtx.globalAlpha = 1;

  // Draw neighbor zone indicator
  const np = venue.neighborPos;
  const nx = np.x * CELL_PX;
  const ny = np.y * CELL_PY;
  const neighborSPL = state.neighborSPL;
  const neighborColor = neighborSPL >= 70 ? '#ff2244' : neighborSPL >= 65 ? '#ffaa00' : '#88ccff';

  // Pulsing ring around neighbor
  const pulse = 0.65 + 0.35 * Math.abs(Math.sin(Date.now() / 300));
  offCtx.save();
  offCtx.strokeStyle = neighborColor;
  offCtx.lineWidth = 2.5;
  offCtx.globalAlpha = pulse;
  offCtx.beginPath();
  offCtx.arc(nx + CELL_PX / 2, ny + CELL_PY / 2, CELL_PX * 2.5, 0, Math.PI * 2);
  offCtx.stroke();

  // Inner fill ring
  offCtx.globalAlpha = pulse * 0.2;
  offCtx.fillStyle = neighborColor;
  offCtx.beginPath();
  offCtx.arc(nx + CELL_PX / 2, ny + CELL_PY / 2, CELL_PX * 2.5, 0, Math.PI * 2);
  offCtx.fill();
  offCtx.restore();

  // Neighbor house icon
  offCtx.font = 'bold 11px monospace';
  offCtx.fillStyle = neighborColor;
  offCtx.fillText('\u{1F3E0}', nx - 4, ny - 6);

  // Neighbor SPL readout next to icon
  if (neighborSPL > 0) {
    offCtx.font = '8px monospace';
    offCtx.fillStyle = neighborColor;
    offCtx.fillText(`${neighborSPL.toFixed(0)}dB`, nx - 4, ny - 16);
  }

  // Copy offscreen to main canvas
  ctx.drawImage(offscreenCanvas, 0, 0);
}
