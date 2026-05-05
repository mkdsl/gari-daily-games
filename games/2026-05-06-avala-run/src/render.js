import { CONFIG } from './config.js';
import { drawBackground, drawBranding } from './systems/world.js';
import { objScreenX } from './systems/spawner.js';
import { drawPlayer } from './entities/player.js';

export function render(ctx, state, canvasW, canvasH) {
  const groundY = canvasH * CONFIG.GROUND_RATIO;

  // Clear
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Background (sky, stars, silhouette, pines, ground)
  drawBackground(ctx, state, canvasW, canvasH);

  // Collectibles
  for (const obj of state.objects) {
    if (obj.type === 'collectible' && !obj.collected) {
      const sx = objScreenX(obj, state.world.scrollX);
      drawCollectible(ctx, obj, sx, groundY);
    }
  }

  // Obstacles
  for (const obj of state.objects) {
    if (obj.type === 'obstacle') {
      const sx = objScreenX(obj, state.world.scrollX);
      drawObstacle(ctx, obj, sx, groundY);
    }
  }

  // Player
  drawPlayer(ctx, state.player, groundY);

  // Branding
  drawBranding(ctx, canvasW, canvasH);
}

// ===== OBSTACLE DRAWING =====

function drawObstacle(ctx, obj, sx, groundY) {
  const sy = groundY - obj.groundOffset;
  ctx.save();
  switch (obj.kind) {
    case 'bor':    drawBor(ctx, sx, sy, obj.w, obj.h); break;
    case 'kamen':  drawKamen(ctx, sx, sy, obj.w, obj.h); break;
    case 'kamion': drawKamion(ctx, sx, sy, obj.w, obj.h); break;
    case 'dron':   drawDron(ctx, sx, sy, obj.w, obj.h); break;
  }
  ctx.restore();
}

function drawBor(ctx, x, baseY, w, h) {
  const col = '#0d2210';
  const hl  = '#1a4020';
  const pine_w = h * 0.5;
  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const layerH = h * 0.45;
    const layerW = pine_w * (1 - i * 0.2);
    const layerY = baseY - h * 0.3 * i - layerH;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, layerY);
    ctx.lineTo(x + w / 2 - layerW / 2, layerY + layerH);
    ctx.lineTo(x + w / 2 + layerW / 2, layerY + layerH);
    ctx.closePath();
    ctx.fill();
    // Highlight linija
    ctx.strokeStyle = hl;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, layerY + 2);
    ctx.lineTo(x + w / 2 - layerW / 4, layerY + layerH / 2);
    ctx.stroke();
  }
  // Stub
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(x + w / 2 - 3, baseY - h * 0.2, 6, h * 0.2);
}

function drawKamen(ctx, x, y, w, h) {
  ctx.fillStyle = '#556677';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#778899';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 - 3, y + h / 2 - 3, w / 4, h / 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawKamion(ctx, x, y, w, h) {
  // Telo
  ctx.fillStyle = '#334455';
  ctx.fillRect(x, y, w, h);
  // Kabina
  ctx.fillStyle = '#445566';
  ctx.fillRect(x + 2, y + 2, Math.floor(w * 0.35), Math.floor(h * 0.6));
  // Prozor kabine
  ctx.fillStyle = '#223344';
  ctx.fillRect(x + 4, y + 4, Math.floor(w * 0.2), Math.floor(h * 0.35));
  // Točkovi
  ctx.fillStyle = '#111122';
  ctx.beginPath();
  ctx.arc(x + 12, y + h, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w - 12, y + h, 8, 0, Math.PI * 2);
  ctx.fill();
  // Highlight kontura
  ctx.strokeStyle = '#445566';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function drawDron(ctx, x, y, w, h) {
  // Telo
  ctx.fillStyle = '#223344';
  ctx.fillRect(x + Math.floor(w * 0.3), y + Math.floor(h * 0.2), Math.floor(w * 0.4), Math.floor(h * 0.6));
  // Horizontalni krak
  ctx.fillRect(x, y + Math.floor(h * 0.3), w, Math.floor(h * 0.15));
  // Propeleri
  ctx.fillStyle = '#445566';
  ctx.fillRect(x + 1, y, 5, 6);
  ctx.fillRect(x + w - 6, y, 5, 6);
  // LED svetlo (crveno)
  ctx.fillStyle = '#ff3344';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

// ===== COLLECTIBLE DRAWING =====

function drawCollectible(ctx, obj, sx, groundY) {
  const sy = groundY - obj.groundOffset;
  ctx.save();
  switch (obj.kind) {
    case 'karta':   drawKarta(ctx, sx, sy, obj.w, obj.h); break;
    case 'limenka': drawLimenka(ctx, sx, sy, obj.w, obj.h); break;
    case 'flasa':   drawFlasa(ctx, sx, sy, obj.w, obj.h); break;
    case 'papir':   drawPapir(ctx, sx, sy, obj.w, obj.h); break;
  }
  ctx.restore();
}

function drawKarta(ctx, x, y, w, h) {
  // Glow
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#FFD700';
  ctx.fillStyle = CONFIG.COLORS.KARTA;
  ctx.fillRect(x, y, w, h);
  // Linija detalj
  ctx.fillStyle = '#FFA500';
  ctx.fillRect(x + 2, y + 4, w - 4, 3);
  ctx.fillRect(x + 2, y + h - 7, w - 4, 3);
  ctx.shadowBlur = 0;
  // Glow particle iznad
  ctx.fillStyle = 'rgba(255,215,0,0.6)';
  ctx.beginPath();
  ctx.arc(x + w / 2, y - 6, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawLimenka(ctx, x, y, w, h) {
  ctx.fillStyle = CONFIG.COLORS.LIMENKA;
  ctx.fillRect(x + 2, y, w - 4, h);
  // Gornji i donji prsten
  ctx.fillStyle = '#AABBCC';
  ctx.fillRect(x, y + 3, w, 2);
  ctx.fillRect(x, y + h - 5, w, 2);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x + 3, y + 4, 3, h - 10);
}

function drawFlasa(ctx, x, y, w, h) {
  ctx.fillStyle = CONFIG.COLORS.FLASA;
  // Telo
  ctx.fillRect(x + 2, y + Math.floor(h * 0.3), w - 4, Math.floor(h * 0.7));
  // Grlo
  ctx.fillRect(x + 4, y, w - 8, Math.floor(h * 0.35));
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x + 3, y + Math.floor(h * 0.35), 2, Math.floor(h * 0.5));
}

function drawPapir(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(0.15);
  ctx.fillStyle = CONFIG.COLORS.PAPIR;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // Linije teksta
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w - 4, 2);
  ctx.fillRect(-w / 2 + 2, -h / 2 + 7, w - 6, 2);
  ctx.restore();
}
