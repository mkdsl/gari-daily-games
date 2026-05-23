// Canvas renderer — grid, items in grid, ghost preview, particles
import { CELL_SIZE, GRID_PADDING, COLORS } from './config.js';
import { cellToPixel } from './systems/grid.js';

// Compute grid origin (top-left pixel) centered in canvas
export function getGridOrigin(canvas, backpack) {
  const gridW = backpack.width * CELL_SIZE;
  const gridH = backpack.height * CELL_SIZE;
  const x = Math.round((canvas.width - gridW) / 2);
  const y = Math.round((canvas.height - gridH) / 2);
  return { x, y, gridW, gridH };
}

/**
 * Clear and redraw entire scene.
 */
export function render(ctx, canvas, state, itemColorMap) {
  if (!state.backpack) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = COLORS.bgPrimary;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { x: ox, y: oy } = getGridOrigin(canvas, state.backpack);

  drawGrid(ctx, state.backpack, ox, oy, itemColorMap);

  if (state.ghost) {
    drawGhost(ctx, state.ghost, state.backpack, ox, oy);
  }

  drawParticles(ctx, state.particles);
}

/**
 * Draw the grid: empty cells + filled cells with item colors.
 */
export function drawGrid(ctx, backpack, ox, oy, itemColorMap) {
  const { width: gw, height: gh } = backpack;

  // Draw filled cells first
  for (let r = 0; r < gh; r++) {
    for (let c = 0; c < gw; c++) {
      const px = ox + c * CELL_SIZE;
      const py = oy + r * CELL_SIZE;
      const itemId = backpack.cells[r][c];

      if (itemId !== null) {
        const color = itemColorMap[itemId] || '#888';
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        // Inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, 4);
      } else {
        ctx.fillStyle = COLORS.cellEmpty;
        ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }

  // Draw grid lines
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 1;
  for (let r = 0; r <= gh; r++) {
    ctx.beginPath();
    ctx.moveTo(ox, oy + r * CELL_SIZE);
    ctx.lineTo(ox + gw * CELL_SIZE, oy + r * CELL_SIZE);
    ctx.stroke();
  }
  for (let c = 0; c <= gw; c++) {
    ctx.beginPath();
    ctx.moveTo(ox + c * CELL_SIZE, oy);
    ctx.lineTo(ox + c * CELL_SIZE, oy + gh * CELL_SIZE);
    ctx.stroke();
  }

  // Draw grid border
  ctx.strokeStyle = COLORS.gridBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(ox, oy, gw * CELL_SIZE, gh * CELL_SIZE);

  // Torba label
  ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
  ctx.font = '11px Segoe UI, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TORBA', ox + (gw * CELL_SIZE) / 2, oy - 6);
}

/**
 * Draw ghost placement preview.
 */
export function drawGhost(ctx, ghost, backpack, ox, oy) {
  const { item, gridX, gridY, valid } = ghost;
  const fillColor = valid ? COLORS.ghostValid : COLORS.ghostInvalid;
  const borderColor = valid ? COLORS.ghostBorderValid : COLORS.ghostBorderInvalid;

  for (let r = 0; r < item.rows; r++) {
    for (let c = 0; c < item.cols; c++) {
      if (item.currentShape[r][c] === 1) {
        const px = ox + (gridX + c) * CELL_SIZE;
        const py = oy + (gridY + r) * CELL_SIZE;

        // Check bounds for ghost drawing
        if (gridX + c >= 0 && gridX + c < backpack.width &&
            gridY + r >= 0 && gridY + r < backpack.height) {
          ctx.fillStyle = fillColor;
          ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
      }
    }
  }
}

/**
 * Draw active particles.
 */
export function drawParticles(ctx, particles) {
  for (const p of particles) {
    p.draw(ctx);
  }
}

/**
 * Draw a single item shape on a given canvas context at (x, y) with given cellSize.
 */
export function drawItemShape(ctx, item, x, y, cellSize, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let r = 0; r < item.rows; r++) {
    for (let c = 0; c < item.cols; c++) {
      if (item.currentShape[r][c] === 1) {
        const px = x + c * cellSize;
        const py = y + r * cellSize;
        ctx.fillStyle = item.color;
        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(px, py, cellSize - 1, 3);
      }
    }
  }
  ctx.restore();
}
