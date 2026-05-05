import { CONFIG } from '../config.js';
import { consumeJump, consumeDuck, getInput } from '../input.js';
import { drawSprite, hasSprites } from '../sprites.js';

let _faceImg = null;
let _faceLoaded = false;

function getFaceImage() {
  if (_faceLoaded) return _faceImg;
  _faceLoaded = true;
  const data = localStorage.getItem('avala-run-face');
  if (data) {
    _faceImg = new Image();
    _faceImg.src = data;
  }
  return _faceImg;
}

// Reset face cache so new uploads are picked up on next run
export function refreshFace() {
  _faceLoaded = false;
  _faceImg = null;
}

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
  p.x = Math.max(CONFIG.PLAYER_MIN_X, Math.min(CONFIG.PLAYER_MAX_X, p.x));

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

  // Animation
  p.animTimer += dt;
  if (p.animTimer >= 0.15) {
    p.animTimer = 0;
    p.animFrame = p.animFrame === 0 ? 1 : 0;
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
    const pw = CONFIG.PLAYER_W + 12; // sprite is wider than hitbox
    const ph = ducking ? CONFIG.PLAYER_H_DUCK + 8 : CONFIG.PLAYER_H_RUN + 8;
    const drawn = drawSprite(ctx, 'player', frameName, x - 6, y - 4, pw, ph);
    if (drawn) {
      // Still draw face overlay if available
      const face = getFaceImage();
      if (face && face.complete) {
        const headY = y - (ducking ? 10 : 14);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(face, x + 1, headY, 14, 12);
        ctx.imageSmoothingEnabled = true;
      }
      return;
    }
  }

  ctx.save();

  const bodyH = ducking ? 18 : 28;
  const bodyW = 16;
  const headH = 12;
  const headW = 14;
  const headY = y - (ducking ? 10 : 14);

  // Shadow on ground
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + bodyW / 2 + 2, groundY - 1, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (behind body)
  if (!ducking) {
    const legColor = '#0f0f22';
    const shoeColor = '#2a1a3d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    if (p.animFrame === 0) {
      // Left leg forward
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + bodyH);
      ctx.lineTo(x + 3, y + bodyH + 6);
      ctx.lineTo(x + 1, y + bodyH + 11);
      ctx.stroke();
      // shoe
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x - 1, y + bodyH + 9, 5, 3);
      // Right leg back
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 11, y + bodyH);
      ctx.lineTo(x + 13, y + bodyH + 5);
      ctx.lineTo(x + 14, y + bodyH + 9);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 12, y + bodyH + 7, 5, 3);
    } else {
      // Right leg forward
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 11, y + bodyH);
      ctx.lineTo(x + 14, y + bodyH + 6);
      ctx.lineTo(x + 16, y + bodyH + 11);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 14, y + bodyH + 9, 5, 3);
      // Left leg back
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + bodyH);
      ctx.lineTo(x + 3, y + bodyH + 5);
      ctx.lineTo(x + 2, y + bodyH + 9);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x, y + bodyH + 7, 5, 3);
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
    ctx.roundRect(x, y, bodyW, bodyH, 3);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, bodyW, bodyH);
  }
  // Body highlight edge (left)
  ctx.fillStyle = 'rgba(100,120,180,0.15)';
  ctx.fillRect(x, y + 2, 2, bodyH - 4);
  // Hoodie pocket detail
  if (!ducking) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 3, y + bodyH - 8, 10, 4);
  }

  // Head
  const face = getFaceImage();
  if (face && face.complete) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(face, x + 1, headY, headW, headH);
    ctx.imageSmoothingEnabled = true;
  } else {
    const headGrad = ctx.createLinearGradient(x + 1, headY, x + headW, headY + headH);
    headGrad.addColorStop(0, '#2a2a44');
    headGrad.addColorStop(1, '#1a1a30');
    ctx.fillStyle = headGrad;
    ctx.fillRect(x + 1, headY, headW, headH);
    // Face detail - visor/shades
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(x + 3, headY + 4, 10, 3);
    // Highlight on forehead
    ctx.fillStyle = 'rgba(100,140,200,0.2)';
    ctx.fillRect(x + 3, headY + 1, 8, 2);
  }

  // Headphones band
  ctx.strokeStyle = '#5577BB';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x + headW / 2 + 1, headY + 1, 8, Math.PI * 1.1, Math.PI * -0.1);
  ctx.stroke();
  // Left ear cup
  ctx.fillStyle = '#5577BB';
  ctx.fillRect(x - 1, headY + 1, 4, 6);
  ctx.fillStyle = '#3a5599';
  ctx.fillRect(x, headY + 2, 2, 4);
  // Right ear cup
  ctx.fillStyle = '#5577BB';
  ctx.fillRect(x + headW - 1, headY + 1, 4, 6);
  ctx.fillStyle = '#3a5599';
  ctx.fillRect(x + headW, headY + 2, 2, 4);

  // DJ Bag (right side, detailed)
  const bagH = ducking ? 12 : 18;
  const bagX = x + 14;
  const bagY = y + 3;
  // Bag body with gradient
  const bagGrad = ctx.createLinearGradient(bagX, bagY, bagX + 9, bagY + bagH);
  bagGrad.addColorStop(0, '#2a2a44');
  bagGrad.addColorStop(1, '#16162a');
  ctx.fillStyle = bagGrad;
  ctx.fillRect(bagX, bagY, 9, bagH);
  // Bag zipper
  ctx.fillStyle = '#6688AA';
  ctx.fillRect(bagX + 4, bagY + 2, 1, bagH - 4);
  // Bag buckle
  ctx.fillStyle = '#888888';
  ctx.fillRect(bagX + 2, bagY + bagH - 3, 5, 2);
  // Strap
  ctx.strokeStyle = '#4466AA';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bagX, bagY);
  ctx.lineTo(x + 8, y + (ducking ? 0 : -2));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bagX + 9, bagY);
  ctx.lineTo(x + 12, y + (ducking ? 0 : -2));
  ctx.stroke();

  // Arm (simple, swinging)
  if (!ducking) {
    ctx.strokeStyle = '#14142a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const armSwing = p.animFrame === 0 ? -2 : 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 6);
    ctx.lineTo(x - 2 + armSwing, y + 16);
    ctx.stroke();
  }

  ctx.restore();
}
