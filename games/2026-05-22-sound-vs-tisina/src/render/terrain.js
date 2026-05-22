// terrain.js — venue terrain floor plan
import { CELL_PX, CELL_PY } from '../config.js';

const TERRAIN_CONFIGS = {
  forest: { outlineColor: '#2d5a1b', bgColor: '#0d1a0d', texture: '█' },
  river:  { outlineColor: '#1b3a5a', bgColor: '#0d1220', texture: '≈' },
  concrete: { outlineColor: '#3a3a3a', bgColor: '#141414', texture: '▓' },
  open:   { outlineColor: '#2a2a4a', bgColor: '#0a0a15', texture: '.' },
  water:  { outlineColor: '#0a2a4a', bgColor: '#050d1a', texture: '~' },
  mountain: { outlineColor: '#2a2030', bgColor: '#0a0a12', texture: '▲' }
};

export function renderTerrain(ctx, venue) {
  if (!venue) return;
  const config = TERRAIN_CONFIGS[venue.terrainType] || TERRAIN_CONFIGS.open;

  // Draw terrain border
  ctx.strokeStyle = config.outlineColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, ctx.canvas.width - 4, ctx.canvas.height - 4);

  // Terrain label top-left
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '10px monospace';
  ctx.fillText(venue.name, 8, 16);

  // Draw zone boundaries / labels
  for (const zone of (venue.zones || [])) {
    const zx = zone.pos.x * CELL_PX;
    const zy = zone.pos.y * CELL_PY;
    ctx.strokeStyle = 'rgba(123,47,255,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(zx - CELL_PX * 3, zy - CELL_PY * 3, CELL_PX * 6, CELL_PY * 6);
    ctx.setLineDash([]);
  }
}
