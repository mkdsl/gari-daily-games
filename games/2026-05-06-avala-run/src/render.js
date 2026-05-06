import { CONFIG } from './config.js';
import { drawSprite, hasSprites } from './sprites.js';
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
  // Try sprite first
  if (hasSprites('obstacles')) {
    const drawn = drawSprite(ctx, 'obstacles', obj.kind, sx, sy, obj.w, obj.h);
    if (drawn) return;
  }
  // Fallback to programmatic
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
  const cx = x + w / 2;

  // Trunk with bark texture
  const trunkW = 8;
  const trunkH = h * 0.3;
  ctx.fillStyle = '#2a1508';
  ctx.fillRect(cx - trunkW / 2, baseY - trunkH, trunkW, trunkH);
  // Bark highlights
  ctx.fillStyle = '#3a2510';
  ctx.fillRect(cx - 2, baseY - trunkH + 4, 2, 6);
  ctx.fillRect(cx + 1, baseY - trunkH + 12, 2, 5);
  // Bark dark lines
  ctx.fillStyle = '#1a0a04';
  ctx.fillRect(cx - 1, baseY - trunkH + 2, 1, trunkH - 4);

  // Foliage — 4 layered triangles with depth
  const layers = 4;
  const colors = ['#0a2210', '#0d2a14', '#0f3318', '#0a2210'];
  const hlColors = ['#1a4020', '#1d4a26', '#20552c', '#1a4020'];
  const pine_w = h * 0.55;

  for (let i = 0; i < layers; i++) {
    const layerH = h * 0.38;
    const layerW = pine_w * (1 - i * 0.15);
    const layerY = baseY - h * 0.22 * i - layerH - h * 0.1;

    // Main dark triangle
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(cx, layerY);
    ctx.lineTo(cx - layerW / 2, layerY + layerH);
    ctx.lineTo(cx + layerW / 2, layerY + layerH);
    ctx.closePath();
    ctx.fill();

    // Left highlight edge (moonlight)
    ctx.fillStyle = hlColors[i];
    ctx.beginPath();
    ctx.moveTo(cx, layerY);
    ctx.lineTo(cx - layerW / 2, layerY + layerH);
    ctx.lineTo(cx - layerW / 3, layerY + layerH * 0.6);
    ctx.closePath();
    ctx.fill();

    // Snow/frost on tips
    if (i >= 2) {
      ctx.fillStyle = 'rgba(100,130,160,0.15)';
      ctx.fillRect(cx - 1, layerY, 2, 3);
    }
  }

  // Root shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, baseY, 8, 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawKamen(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Main rock shape (irregular polygon)
  ctx.fillStyle = '#3a4455';
  ctx.beginPath();
  ctx.moveTo(x + 4, y + h);
  ctx.lineTo(x + 1, cy + 2);
  ctx.lineTo(x + 3, y + 3);
  ctx.lineTo(x + w * 0.3, y);
  ctx.lineTo(x + w * 0.7, y + 1);
  ctx.lineTo(x + w - 2, y + 4);
  ctx.lineTo(x + w, cy + 1);
  ctx.lineTo(x + w - 3, y + h);
  ctx.closePath();
  ctx.fill();

  // Top highlight (light source from above-left)
  ctx.fillStyle = '#5a6a7a';
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 5);
  ctx.lineTo(x + w * 0.3, y + 1);
  ctx.lineTo(x + w * 0.6, y + 2);
  ctx.lineTo(x + w * 0.5, y + h * 0.5);
  ctx.lineTo(x + 6, y + h * 0.5);
  ctx.closePath();
  ctx.fill();

  // Cracks/texture
  ctx.strokeStyle = '#2a3344';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 2);
  ctx.lineTo(cx + 2, cy + 3);
  ctx.lineTo(cx + 6, cy + 1);
  ctx.stroke();

  // Small detail pebbles nearby
  ctx.fillStyle = '#4a5566';
  ctx.fillRect(x + w - 5, y + h - 3, 3, 2);
  ctx.fillRect(x + 2, y + h - 2, 2, 2);

  // Bottom shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, y + h + 1, w / 2 - 2, 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawKamion(ctx, x, y, w, h) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w / 2 - 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chassis
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(x + 6, y + h - 5, w - 12, 5);

  // Cargo body — single solid block
  ctx.fillStyle = '#2a3a4a';
  ctx.fillRect(x + Math.floor(w * 0.3), y + 2, Math.floor(w * 0.68), h - 7);
  // Cargo top highlight
  ctx.fillStyle = '#3a4a5a';
  ctx.fillRect(x + Math.floor(w * 0.3), y + 2, Math.floor(w * 0.68), 3);

  // Cabin — solid block
  ctx.fillStyle = '#3a4455';
  ctx.fillRect(x + 2, y + 4, Math.floor(w * 0.28), h - 9);
  // Windshield
  ctx.fillStyle = '#1a2533';
  ctx.fillRect(x + 4, y + 6, Math.floor(w * 0.16), Math.floor(h * 0.3));

  // Headlight
  ctx.fillStyle = '#ffdd88';
  ctx.fillRect(x + 2, y + h - 12, 3, 3);

  // Taillight
  ctx.fillStyle = '#ff3344';
  ctx.fillRect(x + w - 3, y + h - 12, 3, 3);

  // Wheels — simple circles
  const wheelR = 7;
  const wheelY = y + h;
  [x + 14, x + w - 14].forEach(wx => {
    ctx.fillStyle = '#0a0a14';
    ctx.beginPath();
    ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a4a5a';
    ctx.beginPath();
    ctx.arc(wx, wheelY, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDron(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const _t = Date.now() * 0.01;

  // Propeller blur (animated suggestion)
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#667788';
  // Left prop disc
  ctx.beginPath();
  ctx.ellipse(x + 5, y + 2, 7, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right prop disc
  ctx.beginPath();
  ctx.ellipse(x + w - 5, y + 2, 7, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Arms
  ctx.fillStyle = '#2a3344';
  ctx.fillRect(x + 2, cy - 2, w - 4, 4);

  // Central body
  const bodyGrad = ctx.createLinearGradient(cx - 8, cy - 5, cx + 8, cy + 5);
  bodyGrad.addColorStop(0, '#3a4455');
  bodyGrad.addColorStop(1, '#1a2233');
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(cx - 8, cy - 5, 16, 10);

  // Body detail
  ctx.fillStyle = '#4a5566';
  ctx.fillRect(cx - 6, cy - 4, 12, 2);

  // Motor mounts
  ctx.fillStyle = '#3a4455';
  ctx.fillRect(x + 2, cy - 4, 5, 8);
  ctx.fillRect(x + w - 7, cy - 4, 5, 8);

  // Propeller blades (pixel style, alternating)
  ctx.fillStyle = '#5a6a7a';
  // Left props
  ctx.fillRect(x, y, 3, 2);
  ctx.fillRect(x + 5, y, 3, 2);
  // Right props
  ctx.fillRect(x + w - 8, y, 3, 2);
  ctx.fillRect(x + w - 3, y, 3, 2);

  // LED lights
  ctx.fillStyle = '#ff3344';
  ctx.fillRect(cx - 1, cy + 3, 2, 2);
  // Green nav lights
  ctx.fillStyle = '#44ff66';
  ctx.fillRect(x + 3, cy + 2, 2, 2);
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x + w - 5, cy + 2, 2, 2);

  // Camera lens
  ctx.fillStyle = '#111122';
  ctx.beginPath();
  ctx.arc(cx, cy + 6, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(100,150,200,0.4)';
  ctx.beginPath();
  ctx.arc(cx - 0.5, cy + 5.5, 1, 0, Math.PI * 2);
  ctx.fill();
}

// ===== COLLECTIBLE DRAWING =====

function drawCollectible(ctx, obj, sx, groundY) {
  const sy = groundY - obj.groundOffset;

  // Try sprite first
  if (hasSprites('collectibles')) {
    const drawn = drawSprite(ctx, 'collectibles', obj.kind, sx, sy, obj.w, obj.h);
    if (drawn) return;
  }

  ctx.save();
  // Determine base kind (strip _high/_low suffix)
  const baseKind = obj.kind.replace(/_high|_low/, '');
  switch (baseKind) {
    case 'limenka': drawLimenka(ctx, sx, sy, obj.w, obj.h); break;
    case 'flasa':   drawFlasa(ctx, sx, sy, obj.w, obj.h); break;
    case 'papir':   drawPapir(ctx, sx, sy, obj.w, obj.h); break;
  }

  // Draw directional arrow hint for pose-based collectibles
  if (obj.requireState) {
    drawPoseHint(ctx, sx, sy, obj.w, obj.h, obj.requireState, baseKind);
  }

  ctx.restore();
}

function drawPoseHint(ctx, sx, sy, w, h, requireState, baseKind) {
  const colorMap = {
    limenka: CONFIG.COLORS.LIMENKA,
    flasa:   CONFIG.COLORS.FLASA,
    papir:   CONFIG.COLORS.PAPIR
  };
  const color = colorMap[baseKind] || '#FFFFFF';
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = color;

  const arrowX = sx + w + 4;
  const arrowCY = sy + h / 2;

  if (requireState === 'jumping') {
    // Up arrow
    ctx.beginPath();
    ctx.moveTo(arrowX + 4, arrowCY - 6);
    ctx.lineTo(arrowX, arrowCY);
    ctx.lineTo(arrowX + 8, arrowCY);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(arrowX + 2, arrowCY, 4, 5);
  } else {
    // Down arrow
    ctx.fillRect(arrowX + 2, arrowCY - 5, 4, 5);
    ctx.beginPath();
    ctx.moveTo(arrowX + 4, arrowCY + 6);
    ctx.lineTo(arrowX, arrowCY);
    ctx.lineTo(arrowX + 8, arrowCY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawLimenka(ctx, x, y, w, h) {
  // Can body with metallic gradient
  const canGrad = ctx.createLinearGradient(x, y, x + w, y);
  canGrad.addColorStop(0, '#6a7a8a');
  canGrad.addColorStop(0.3, '#8899AA');
  canGrad.addColorStop(0.5, '#AABBCC');
  canGrad.addColorStop(0.7, '#8899AA');
  canGrad.addColorStop(1, '#5a6a7a');
  ctx.fillStyle = canGrad;
  ctx.fillRect(x + 1, y + 3, w - 2, h - 6);

  // Top rim (lid)
  ctx.fillStyle = '#BBCCDD';
  ctx.fillRect(x, y, w, 3);
  // Tab on top
  ctx.fillStyle = '#99AABB';
  ctx.fillRect(x + w / 2 - 2, y - 1, 4, 2);
  ctx.fillRect(x + w / 2, y - 2, 2, 1);

  // Bottom rim
  ctx.fillStyle = '#99AABB';
  ctx.fillRect(x, y + h - 3, w, 3);

  // Label band (colored stripe)
  ctx.fillStyle = '#cc3344';
  ctx.fillRect(x + 2, y + 8, w - 4, 8);
  // Label text suggestion
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x + 4, y + 10, w - 8, 1);
  ctx.fillRect(x + 5, y + 13, w - 10, 1);
  ctx.globalAlpha = 1;

  // Specular highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x + 3, y + 4, 2, h - 9);

  // Dent/crush detail
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(x + w - 4, y + h - 10, 2, 4);
}

function drawFlasa(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const neckH = Math.floor(h * 0.3);
  const bodyH = h - neckH;
  const bodyY = y + neckH;

  // Bottle body
  const bGrad = ctx.createLinearGradient(x, y, x + w, y);
  bGrad.addColorStop(0, '#5a4228');
  bGrad.addColorStop(0.3, '#7A5C3A');
  bGrad.addColorStop(0.6, '#8a6c4a');
  bGrad.addColorStop(1, '#4a3218');
  ctx.fillStyle = bGrad;
  ctx.fillRect(x + 1, bodyY, w - 2, bodyH);

  // Bottle neck (narrower)
  ctx.fillStyle = '#6a4c32';
  ctx.fillRect(cx - 2, y, 4, neckH + 2);

  // Bottle cap
  ctx.fillStyle = '#aa8844';
  ctx.fillRect(cx - 3, y - 1, 6, 3);

  // Label
  ctx.fillStyle = '#ddccaa';
  ctx.fillRect(x + 2, bodyY + 4, w - 4, Math.floor(bodyH * 0.4));
  // Label text lines
  ctx.fillStyle = '#5a4228';
  ctx.fillRect(x + 3, bodyY + 6, w - 6, 1);
  ctx.fillRect(x + 4, bodyY + 9, w - 8, 1);

  // Specular highlight (glass reflection)
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x + 2, bodyY + 1, 2, bodyH - 2);
  ctx.fillRect(cx - 1, y + 1, 1, neckH - 1);

  // Base shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x + 1, y + h - 2, w - 2, 2);
}

function drawPapir(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(0.18);

  // Paper sheet with crumple effect
  const pw = w / 2;
  const ph = h / 2;

  // Shadow under
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(-pw + 2, -ph + 2, w, h);

  // Main paper body
  const pGrad = ctx.createLinearGradient(-pw, -ph, pw, ph);
  pGrad.addColorStop(0, '#E8E8D8');
  pGrad.addColorStop(0.5, '#D0D0C0');
  pGrad.addColorStop(1, '#B8B8A8');
  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.moveTo(-pw, -ph);
  ctx.lineTo(pw - 3, -ph + 1);
  ctx.lineTo(pw, -ph + 3);
  ctx.lineTo(pw - 1, ph);
  ctx.lineTo(-pw + 2, ph - 1);
  ctx.closePath();
  ctx.fill();

  // Folded corner
  ctx.fillStyle = '#C8C8B8';
  ctx.beginPath();
  ctx.moveTo(pw - 3, -ph + 1);
  ctx.lineTo(pw, -ph + 3);
  ctx.lineTo(pw - 3, -ph + 4);
  ctx.closePath();
  ctx.fill();

  // Text lines
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-pw + 2, -ph + 3, w - 6, 1);
  ctx.fillRect(-pw + 2, -ph + 6, w - 8, 1);
  ctx.fillRect(-pw + 2, -ph + 9, w - 5, 1);
  ctx.fillRect(-pw + 2, -ph + 12, w - 9, 1);

  // Crumple wrinkle line
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-pw + 4, -ph + 2);
  ctx.lineTo(pw - 4, ph - 2);
  ctx.stroke();

  ctx.restore();
}
