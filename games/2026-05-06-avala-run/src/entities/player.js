import { CONFIG } from '../config.js';
import { consumeJump, consumeDuck } from '../input.js';

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

  // Jump input
  if (consumeJump() && !p.isJumping && !p.isDucking) {
    p.vy = CONFIG.PLAYER_JUMP_VY;
    p.isJumping = true;
  }

  // Duck input
  if (consumeDuck() && !p.isJumping) {
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

  // Physics
  if (p.isJumping || p.y < groundY - CONFIG.PLAYER_H_RUN) {
    p.vy += CONFIG.GRAVITY * dt;
    p.y += p.vy * dt;
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

  ctx.save();

  // Body
  ctx.fillStyle = CONFIG.COLORS.PLAYER;
  const bodyH = ducking ? 18 : 28;
  const bodyW = 16;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, bodyW, bodyH, 2);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, bodyW, bodyH);
  }

  // Glava
  const headH = 12;
  const headW = 14;
  const headY = y - (ducking ? 10 : 14);
  ctx.fillStyle = CONFIG.COLORS.PLAYER;
  ctx.fillRect(x + 1, headY, headW, headH);

  // Slušalice
  ctx.strokeStyle = CONFIG.COLORS.PLAYER_HL;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + headW / 2 + 1, headY + 2, 7, Math.PI, 0);
  ctx.stroke();
  // Levi i desni jastuk
  ctx.fillStyle = CONFIG.COLORS.PLAYER_HL;
  ctx.beginPath();
  ctx.arc(x + 1, headY + 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + headW, headY + 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Torba (desna strana)
  const bagH = ducking ? 12 : 18;
  ctx.fillStyle = CONFIG.COLORS.PLAYER;
  ctx.fillRect(x + 14, y + 4, 8, bagH);
  ctx.strokeStyle = CONFIG.COLORS.PLAYER_HL;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 14, y + 4, 8, bagH);
  // Strap torbe
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 4);
  ctx.lineTo(x + 8, y + (ducking ? 2 : 0));
  ctx.stroke();

  // Noge (2 linije, smenjuju se)
  if (!ducking) {
    ctx.strokeStyle = CONFIG.COLORS.PLAYER;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    if (p.animFrame === 0) {
      // Leva napred
      ctx.beginPath();
      ctx.moveTo(x + 4, y + bodyH);
      ctx.lineTo(x + 2, y + bodyH + 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 12, y + bodyH);
      ctx.lineTo(x + 14, y + bodyH + 8);
      ctx.stroke();
    } else {
      // Desna napred
      ctx.beginPath();
      ctx.moveTo(x + 4, y + bodyH);
      ctx.lineTo(x + 1, y + bodyH + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 12, y + bodyH);
      ctx.lineTo(x + 15, y + bodyH + 10);
      ctx.stroke();
    }
  }

  ctx.restore();
}
