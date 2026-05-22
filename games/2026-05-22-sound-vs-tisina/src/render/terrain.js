// terrain.js — venue terrain floor plan renderer
import { CELL_PX, CELL_PY, CANVAS_W, CANVAS_H } from '../config.js';

const TERRAIN_CONFIGS = {
  forest:   { outlineColor: '#2d5a1b', floorColor: 'rgba(20,50,15,0.6)', zoneColor: 'rgba(0,200,80,0.15)', accentColor: '#3a8a2a' },
  river:    { outlineColor: '#1b3a5a', floorColor: 'rgba(10,30,60,0.6)', zoneColor: 'rgba(0,100,220,0.15)', accentColor: '#2a6aaa' },
  concrete: { outlineColor: '#3a3a3a', floorColor: 'rgba(30,30,30,0.6)', zoneColor: 'rgba(180,180,180,0.12)', accentColor: '#666' },
  open:     { outlineColor: '#2a2a4a', floorColor: 'rgba(15,15,35,0.6)', zoneColor: 'rgba(123,47,255,0.1)', accentColor: '#4a3a7a' },
  water:    { outlineColor: '#0a2a4a', floorColor: 'rgba(5,20,40,0.6)', zoneColor: 'rgba(0,150,255,0.12)', accentColor: '#1a5a8a' },
  mountain: { outlineColor: '#2a2030', floorColor: 'rgba(15,10,25,0.6)', zoneColor: 'rgba(150,100,255,0.12)', accentColor: '#5a4080' }
};

export function renderTerrain(ctx, venue) {
  if (!venue) return;
  const config = TERRAIN_CONFIGS[venue.terrainType] || TERRAIN_CONFIGS.open;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // Draw terrain floor fill
  ctx.fillStyle = config.floorColor;
  ctx.fillRect(0, 0, W, H);

  // Draw grid lines (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  const gridStep = CELL_PX * 5; // Every 5 cells
  for (let x = 0; x < W; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Draw dance floor area (center region)
  const dfX = CELL_PX * 10;
  const dfY = CELL_PY * 8;
  const dfW = CELL_PX * 70;
  const dfH = CELL_PY * 44;
  ctx.fillStyle = config.zoneColor;
  ctx.fillRect(dfX, dfY, dfW, dfH);
  ctx.strokeStyle = config.accentColor;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(dfX, dfY, dfW, dfH);
  ctx.setLineDash([]);

  // Draw stage silhouette (top-left area)
  const stageX = CELL_PX * 12;
  const stageY = CELL_PY * 22;
  const stageW = CELL_PX * 18;
  const stageH = CELL_PY * 10;
  ctx.fillStyle = config.accentColor + '33';
  ctx.fillRect(stageX, stageY, stageW, stageH);
  ctx.strokeStyle = config.accentColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(stageX, stageY, stageW, stageH);

  // Stage label
  ctx.fillStyle = config.accentColor;
  ctx.font = 'bold 9px monospace';
  ctx.fillText('STAGE', stageX + 4, stageY + 14);

  // Draw zone boundary dashed boxes with fill
  if (venue.zones) {
    for (const zone of venue.zones) {
      const zx = zone.pos.x * CELL_PX;
      const zy = zone.pos.y * CELL_PY;
      const r = CELL_PX * 3;
      ctx.fillStyle = 'rgba(123,47,255,0.08)';
      ctx.fillRect(zx - r, zy - r, r * 2, r * 2);
      ctx.strokeStyle = 'rgba(123,47,255,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(zx - r, zy - r, r * 2, r * 2);
      ctx.setLineDash([]);
    }
  }

  // Terrain border
  ctx.strokeStyle = config.outlineColor;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // Venue name label — top-left
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.font = '10px monospace';
  ctx.fillText(venue.name, 8, 16);

  // Terrain type badge — top-right
  ctx.fillStyle = config.accentColor + 'aa';
  ctx.font = '9px monospace';
  const badge = venue.terrainType.toUpperCase();
  ctx.fillText(badge, W - badge.length * 6 - 8, 14);

  // SPL legend — bottom-left
  drawSPLLegend(ctx, W, H);
}

function drawSPLLegend(ctx, W, H) {
  const items = [
    { color: '#0d1117', label: '<55 dB' },
    { color: '#0a2a1a', label: '55-65' },
    { color: '#00ff88', label: '65-75' },
    { color: '#ffaa00', label: '75-85' },
    { color: '#ff6600', label: '85-95' },
    { color: '#ff2244', label: '>95 dB' }
  ];
  const startX = 8;
  const startY = H - 12 - items.length * 13;
  ctx.font = '7px monospace';
  items.forEach((item, i) => {
    const y = startY + i * 13;
    ctx.fillStyle = item.color;
    ctx.fillRect(startX, y, 10, 9);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(startX, y, 10, 9);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(item.label, startX + 13, y + 8);
  });
}
