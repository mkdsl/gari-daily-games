// ui-elements.js — canvas overlay elements
import { CELL_PX, CELL_PY } from '../config.js';
import { splToColor } from './heatmap.js';

export function renderZones(ctx, state) {
  if (!state.zones) return;
  const now = Date.now();

  for (const zone of state.zones) {
    if (zone.isNeighbor) continue;
    const px = zone.pos.x * CELL_PX;
    const py = zone.pos.y * CELL_PY;

    // Pulsing white circle for main stage
    if (zone.id === 'main') {
      const pulse = 0.6 + 0.4 * Math.abs(Math.sin(now / 400));
      ctx.beginPath();
      ctx.arc(px + CELL_PX / 2, py + CELL_PY / 2, CELL_PX * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${pulse * 0.25})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${pulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Zone dot indicator (colored by db level)
    const dotColor = splToColor(zone.db);
    ctx.beginPath();
    ctx.arc(px + CELL_PX / 2, py + CELL_PY / 2, CELL_PX, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();

    // Zone label
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '7px monospace';
    ctx.fillText(zone.name.substring(0, 8), px - CELL_PX * 2, py + CELL_PY * 2.5);
  }
}

export function renderHUD(ctx, state) {
  // Draw happiness bar at top right of canvas
  const barW = 120;
  const barH = 8;
  const barX = ctx.canvas.width - barW - 10;
  const barY = 8;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(barX, barY, barW * (state.happiness / 100), barH);
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);
}
