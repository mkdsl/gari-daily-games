import { CONFIG } from '../config.js';
import { consumeJump, consumeDuck, getInput } from '../input.js';
import { drawSprite, hasSprites } from '../sprites.js';
import { getFaceImage } from '../face.js';

export function initPlayer(state, groundY) {
  const p = state.player;
  p.y = groundY - CONFIG.PLAYER_H_RUN;
  p.vy = 0;
  p.isJumping = false;
  p.isDucking = false;
  p.duckTimer = 0;
  p.animFrame = 0;
  p.animTimer = 0;
}

export function updatePlayer(state, dt, groundY) {
  const p = state.player;
  const input = getInput();

  // Consume one-shot inputs once
  const wantsJump = consumeJump();
  const wantsDuck = consumeDuck();

  // Jump input
  if (wantsJump && !p.isJumping && !p.isDucking) {
    p.vy = CONFIG.PLAYER_JUMP_VY;
    p.isJumping = true;
  }

  // Duck input (only on ground)
  if (wantsDuck && !p.isJumping) {
    p.isDucking = true;
    p.duckTimer = CONFIG.DUCK_DURATION;
  }

  // Duck timer
  if (p.isDucking) {
    p.duckTimer -= dt;
    if (p.duckTimer <= 0) {
      p.isDucking = false;
      p.duckTimer = 0;
    }
  }

  // Left/right movement
  if (input.left) p.x -= CONFIG.PLAYER_MOVE_SPEED * dt;
  if (input.right) p.x += CONFIG.PLAYER_MOVE_SPEED * dt;
  // Clamp to canvas width dynamically (state.canvasW set by game loop)
  const maxX = state.canvasW ? state.canvasW - CONFIG.PLAYER_MIN_X : CONFIG.PLAYER_MAX_X;
  p.x = Math.max(CONFIG.PLAYER_MIN_X, Math.min(maxX, p.x));

  // Physics
  if (p.isJumping || p.y < groundY - CONFIG.PLAYER_H_RUN) {
    p.vy += CONFIG.GRAVITY * dt;
    p.y += p.vy * dt;
  }

  // Fast fall — pressing duck while in air increases gravity
  if (p.isJumping && (wantsDuck || input.duck)) {
    p.vy += CONFIG.FAST_FALL_BOOST * dt;
  }

  // Clamp to ground — kad si na tlu, uvek prilepi igrača za pod
  const playerH = p.isDucking ? CONFIG.PLAYER_H_DUCK : CONFIG.PLAYER_H_RUN;
  if (!p.isJumping || p.y >= groundY - playerH) {
    p.y = groundY - playerH;
    p.vy = 0;
    p.isJumping = false;
  }

  // Animation — 4 frames for smoother run cycle
  p.animTimer += dt;
  if (p.animTimer >= 0.12) {
    p.animTimer = 0;
    p.animFrame = (p.animFrame + 1) % 4;
  }
}

export function drawPlayer(ctx, player, groundY) {
  const p = player;
  const x = p.x - CONFIG.PLAYER_W / 2;
  const y = p.y;
  const ducking = p.isDucking;

  // Try sprite first
  if (hasSprites('player')) {
    let frameName;
    if (ducking) frameName = 'duck';
    else if (p.isJumping) frameName = 'jump';
    else frameName = 'run_' + p.animFrame;
    const pw = CONFIG.PLAYER_W + 16; // sprite is wider than hitbox
    const ph = ducking ? CONFIG.PLAYER_H_DUCK + 12 : CONFIG.PLAYER_H_RUN + 12;
    const drawn = drawSprite(ctx, 'player', frameName, x - 8, y - 6, pw, ph);
    if (drawn) {
      // Face overlay on sprite head area — position relative to sprite draw coords
      const face = getFaceImage();
      if (face && face.complete) {
        const spriteX = x - 8;
        const spriteY = y - 6;
        // Head is in top portion of 32x32 sprite, scaled to pw x ph
        const scaleX = pw / 32;
        const scaleY = ph / (ducking ? 32 : 32);
        // Face region in sprite: roughly x=8..24, y=0..12 (top center of 32x32)
        const faceX = spriteX + 8 * scaleX;
        const faceY = spriteY + (ducking ? 2 : 0) * scaleY;
        const faceW = 16 * scaleX;
        const faceH = 12 * scaleY;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(faceX + faceW / 2, faceY + faceH / 2, faceW / 2, faceH / 2, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(face, faceX, faceY, faceW, faceH);
        ctx.imageSmoothingEnabled = true;
        ctx.restore();
      }
      return;
    }
  }

  ctx.save();

  const bodyH = ducking ? 32 : 50;
  const bodyW = 28;
  const headH = 22;
  const headW = 25;
  const headY = y - (ducking ? 18 : 25);

  // Shadow on ground
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + bodyW / 2 + 4, groundY - 1, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (behind body) — 4-frame cycle
  if (!ducking) {
    const legColor = '#0f0f22';
    const shoeColor = '#2a1a3d';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    const frame = p.animFrame;
    // Frame 0: left forward, right back
    // Frame 1: both middle (transition)
    // Frame 2: right forward, left back
    // Frame 3: both middle (transition back)
    if (frame === 0) {
      // Left leg forward
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 9, y + bodyH);
      ctx.lineTo(x + 5, y + bodyH + 10);
      ctx.lineTo(x + 2, y + bodyH + 20);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x - 1, y + bodyH + 17, 8, 5);
      // Right leg back
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 19, y + bodyH);
      ctx.lineTo(x + 23, y + bodyH + 9);
      ctx.lineTo(x + 25, y + bodyH + 16);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 22, y + bodyH + 13, 8, 5);
    } else if (frame === 1) {
      // Both legs middle (passing)
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 9, y + bodyH);
      ctx.lineTo(x + 8, y + bodyH + 10);
      ctx.lineTo(x + 7, y + bodyH + 20);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 4, y + bodyH + 17, 8, 5);
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 19, y + bodyH);
      ctx.lineTo(x + 20, y + bodyH + 10);
      ctx.lineTo(x + 21, y + bodyH + 20);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 18, y + bodyH + 17, 8, 5);
    } else if (frame === 2) {
      // Right leg forward
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 19, y + bodyH);
      ctx.lineTo(x + 23, y + bodyH + 10);
      ctx.lineTo(x + 27, y + bodyH + 20);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 24, y + bodyH + 17, 8, 5);
      // Left leg back
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 9, y + bodyH);
      ctx.lineTo(x + 5, y + bodyH + 9);
      ctx.lineTo(x + 3, y + bodyH + 16);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x, y + bodyH + 13, 8, 5);
    } else {
      // Frame 3: both legs middle (passing back)
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 9, y + bodyH);
      ctx.lineTo(x + 8, y + bodyH + 10);
      ctx.lineTo(x + 7, y + bodyH + 20);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 4, y + bodyH + 17, 8, 5);
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 19, y + bodyH);
      ctx.lineTo(x + 20, y + bodyH + 10);
      ctx.lineTo(x + 21, y + bodyH + 20);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 18, y + bodyH + 17, 8, 5);
    }
  }

  // Body — hoodie with shading
  const bodyGrad = ctx.createLinearGradient(x, y, x + bodyW, y + bodyH);
  bodyGrad.addColorStop(0, '#1e1e38');
  bodyGrad.addColorStop(0.5, '#14142a');
  bodyGrad.addColorStop(1, '#0a0a1e');
  ctx.fillStyle = bodyGrad;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, bodyW, bodyH, 5);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, bodyW, bodyH);
  }
  // Body highlight edge (left)
  ctx.fillStyle = 'rgba(100,120,180,0.15)';
  ctx.fillRect(x, y + 3, 3, bodyH - 6);
  // Hoodie pocket detail
  if (!ducking) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 5, y + bodyH - 14, 18, 7);
  }

  // Head
  const face = getFaceImage();
  if (face && face.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + 2 + headW / 2, headY + headH / 2, headW / 2, headH / 2, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(face, x + 2, headY, headW, headH);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  } else {
    const headGrad = ctx.createLinearGradient(x + 2, headY, x + headW, headY + headH);
    headGrad.addColorStop(0, '#2a2a44');
    headGrad.addColorStop(1, '#1a1a30');
    ctx.fillStyle = headGrad;
    ctx.fillRect(x + 2, headY, headW, headH);
    // Face detail - visor/shades
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 5, headY + 8, 18, 5);
    // Highlight on forehead
    ctx.fillStyle = 'rgba(100,140,200,0.2)';
    ctx.fillRect(x + 5, headY + 2, 14, 4);
  }

  // Headphones band
  ctx.strokeStyle = '#5577BB';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(x + headW / 2 + 2, headY + 2, 14, Math.PI * 1.1, Math.PI * -0.1);
  ctx.stroke();
  // Left ear cup
  ctx.fillStyle = '#5577BB';
  ctx.fillRect(x - 1, headY + 2, 6, 10);
  ctx.fillStyle = '#3a5599';
  ctx.fillRect(x, headY + 3, 4, 8);
  // Right ear cup
  ctx.fillStyle = '#5577BB';
  ctx.fillRect(x + headW - 1, headY + 2, 6, 10);
  ctx.fillStyle = '#3a5599';
  ctx.fillRect(x + headW, headY + 3, 4, 8);

  // DJ Bag (right side, detailed)
  const bagH = ducking ? 20 : 32;
  const bagX = x + 25;
  const bagY = y + 5;
  // Bag body with gradient
  const bagGrad = ctx.createLinearGradient(bagX, bagY, bagX + 14, bagY + bagH);
  bagGrad.addColorStop(0, '#2a2a44');
  bagGrad.addColorStop(1, '#16162a');
  ctx.fillStyle = bagGrad;
  ctx.fillRect(bagX, bagY, 14, bagH);
  // Bag zipper
  ctx.fillStyle = '#6688AA';
  ctx.fillRect(bagX + 6, bagY + 3, 2, bagH - 6);
  // Bag buckle
  ctx.fillStyle = '#888888';
  ctx.fillRect(bagX + 3, bagY + bagH - 5, 8, 3);
  // Strap
  ctx.strokeStyle = '#4466AA';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bagX, bagY);
  ctx.lineTo(x + 14, y + (ducking ? 0 : -3));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bagX + 14, bagY);
  ctx.lineTo(x + 20, y + (ducking ? 0 : -3));
  ctx.stroke();

  // Arm (swinging with 4-frame animation)
  if (!ducking) {
    ctx.strokeStyle = '#14142a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const armOffsets = [-4, -1, 4, 1]; // swing positions for 4 frames
    const armSwing = armOffsets[p.animFrame] || 0;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 10);
    ctx.lineTo(x - 3 + armSwing, y + 28);
    ctx.stroke();
  }

  ctx.restore();
}
