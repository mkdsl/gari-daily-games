import { CONFIG } from './config.js';
import { drawSprite, hasSprites } from './sprites.js';
import { drawBackground, drawBranding } from './systems/world.js';
import { objScreenX } from './systems/spawner.js';
import { drawPlayer } from './entities/player.js';

// Logo image for power-up collectible
const logoImg = new Image();
logoImg.src = 'sprites/logo.png';

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
    if (obj.kind === 'kamion') {
      // Flip sprite (faces right, moves left) + realistic engine vibration
      const t = Date.now();
      const shakeY = Math.sin(t * 0.06) * 0.9 + Math.sin(t * 0.13) * 0.5 + Math.sin(t * 0.037) * 0.3;
      const shakeX = Math.sin(t * 0.047) * 0.4 + Math.sin(t * 0.11) * 0.25;
      const shakeRot = (Math.sin(t * 0.053) * 0.004 + Math.sin(t * 0.09) * 0.002);
      ctx.save();
      ctx.translate(sx + obj.w / 2 + shakeX, shakeY);
      ctx.rotate(shakeRot);
      ctx.scale(-1, 1);
      ctx.translate(-(sx + obj.w / 2), 0);
      const drawn = drawSprite(ctx, 'obstacles', obj.kind, sx, sy, obj.w, obj.h);
      ctx.restore();
      if (drawn) return;
    } else {
      const drawn = drawSprite(ctx, 'obstacles', obj.kind, sx, sy, obj.w, obj.h);
      if (drawn) return;
    }
  }
  // Fallback to programmatic
  ctx.save();
  // Subtle red warning shadow on all obstacles
  ctx.shadowColor = 'rgba(255,50,50,0.3)';
  ctx.shadowBlur = 4;
  switch (obj.kind) {
    case 'bor':    drawBor(ctx, sx, sy, obj.w, obj.h); break;
    case 'kamen':  drawKamen(ctx, sx, sy, obj.w, obj.h); break;
    case 'kamion': {
      const t = Date.now();
      const shakeY = Math.sin(t * 0.06) * 0.9 + Math.sin(t * 0.13) * 0.5 + Math.sin(t * 0.037) * 0.3;
      const shakeX = Math.sin(t * 0.047) * 0.4 + Math.sin(t * 0.11) * 0.25;
      const shakeRot = (Math.sin(t * 0.053) * 0.004 + Math.sin(t * 0.09) * 0.002);
      ctx.translate(shakeX, shakeY);
      ctx.rotate(shakeRot);
      drawKamion(ctx, sx, sy, obj.w, obj.h);
      break;
    }
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

  // Outline for contrast against dark ground
  ctx.strokeStyle = 'rgba(150,160,180,0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top highlight (light source from above-left, brighter for visibility)
  ctx.fillStyle = '#7a8a9a';
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
  // Cabin at left = front (truck moves left towards player)
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w / 2 - 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chassis
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(x + 6, y + h - 5, w - 12, 5);

  // Cargo body
  ctx.fillStyle = '#2a3a4a';
  ctx.fillRect(x + Math.floor(w * 0.3), y + 2, Math.floor(w * 0.68), h - 7);
  ctx.fillStyle = '#3a4a5a';
  ctx.fillRect(x + Math.floor(w * 0.3), y + 2, Math.floor(w * 0.68), 3);

  // Cabin
  ctx.fillStyle = '#3a4455';
  ctx.fillRect(x + 2, y + 4, Math.floor(w * 0.28), h - 9);
  ctx.fillStyle = '#1a2533';
  ctx.fillRect(x + 4, y + 6, Math.floor(w * 0.16), Math.floor(h * 0.3));

  // Headlight warning (blinking)
  const blinkPhase = Math.sin(Date.now() * 0.008) > 0;
  const screenDist = Math.max(0, x);
  const glowSize = Math.min(18, 4 + screenDist * 0.04);
  const glowAlpha = blinkPhase ? Math.min(0.8, 0.2 + screenDist * 0.002) : 0.1;
  ctx.save();
  ctx.globalAlpha = glowAlpha;
  ctx.fillStyle = '#ffee66';
  ctx.beginPath();
  ctx.arc(x + 3, y + h - 10, glowSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = blinkPhase ? '#ffee44' : '#ffdd88';
  ctx.fillRect(x + 2, y + h - 12, 3, 3);

  // Taillight
  ctx.fillStyle = '#ff3344';
  ctx.fillRect(x + w - 3, y + h - 12, 3, 3);

  // Wheels
  const wheelY = y + h;
  [x + 14, x + w - 14].forEach(wx => {
    ctx.fillStyle = '#0a0a14';
    ctx.beginPath();
    ctx.arc(wx, wheelY, 7, 0, Math.PI * 2);
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

  if (hasSprites('collectibles')) {
    const drawn = drawSprite(ctx, 'collectibles', obj.kind, sx, sy, obj.w, obj.h);
    if (drawn) return;
  }

  ctx.save();

  ctx.shadowBlur = 8 + Math.sin(Date.now() * 0.005) * 4;
  ctx.shadowColor = '#44ff88';

  // Bounce animation for all collectibles
  const bounce = Math.sin(Date.now() * 0.004 + obj.worldX) * 3;
  const drawY = sy - bounce;

  if (obj.kind === 'logo') {
    drawLogo(ctx, sx, drawY, obj.w, obj.h);
    ctx.restore();
    return;
  }

  switch (obj.kind) {
    case 'flasa': drawFlasa(ctx, sx, drawY, obj.w, obj.h); break;
    case 'kesa':  drawKesa(ctx, sx, drawY, obj.w, obj.h); break;
  }

  if (obj.requireAction) {
    drawGrabHint(ctx, sx, sy, obj.w, obj.h, obj.requireAction);
  }

  ctx.restore();
}

function drawGrabHint(ctx, sx, sy, w, h, requireAction) {
  ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.006) * 0.2;
  ctx.fillStyle = requireAction === 'grab_down' ? CONFIG.COLORS.FLASA : '#88AACC';

  const arrowX = sx + w + 4;
  const arrowCY = sy + h / 2;

  if (requireAction === 'grab_up') {
    ctx.beginPath();
    ctx.moveTo(arrowX + 4, arrowCY - 6);
    ctx.lineTo(arrowX, arrowCY);
    ctx.lineTo(arrowX + 8, arrowCY);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(arrowX + 2, arrowCY, 4, 5);
  } else {
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

function drawKesa(ctx, x, y, w, h) {
  // Plastic bag hanging from branch
  // Branch stub
  ctx.fillStyle = '#3a2a14';
  ctx.fillRect(x + w / 2 - 2, y - 6, 4, 8);

  // Bag body (crinkled shape)
  ctx.fillStyle = '#aabbcc';
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + w - 2, y);
  ctx.lineTo(x + w, y + h * 0.3);
  ctx.lineTo(x + w - 1, y + h * 0.7);
  ctx.lineTo(x + w - 3, y + h);
  ctx.lineTo(x + 3, y + h);
  ctx.lineTo(x + 1, y + h * 0.7);
  ctx.lineTo(x, y + h * 0.3);
  ctx.closePath();
  ctx.fill();

  // Handle loops at top
  ctx.strokeStyle = '#8899aa';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + w * 0.3, y - 1, 3, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w * 0.7, y - 1, 3, Math.PI, 0);
  ctx.stroke();

  // Wrinkle lines
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 4);
  ctx.lineTo(x + w - 4, y + h - 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w - 3, y + 3);
  ctx.lineTo(x + 4, y + h - 4);
  ctx.stroke();

  // Logo/text on bag
  ctx.fillStyle = 'rgba(0,80,150,0.3)';
  ctx.fillRect(x + 4, y + h * 0.35, w - 8, 3);
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

function drawLogo(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const t = Date.now() * 0.003;

  // Pulsating golden glow circle behind logo
  const pulseR = w * 0.7 + Math.sin(t) * 3;
  ctx.save();
  ctx.shadowBlur = 16 + Math.sin(t * 1.5) * 6;
  ctx.shadowColor = '#FFD700';

  // Golden circle background
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
  glowGrad.addColorStop(0, 'rgba(255,215,0,0.6)');
  glowGrad.addColorStop(0.6, 'rgba(204,34,68,0.3)');
  glowGrad.addColorStop(1, 'rgba(204,34,68,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
  ctx.fill();

  // Slow rotation
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(t * 0.5) * 0.15);
  ctx.translate(-cx, -cy);

  // Draw logo image inverted (white on dark) if loaded
  if (logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.filter = 'invert(1) brightness(1.2)';
    ctx.drawImage(logoImg, x, y, w, h);
    ctx.filter = 'none';
  } else {
    // Fallback: golden "K" letter
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold ${h}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K', cx, cy);
  }

  ctx.restore();
}
