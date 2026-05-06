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
  p.grabAnim = 'none';
  p.grabTimer = 0;
}

export function updatePlayer(state, dt, groundY) {
  const p = state.player;
  const input = getInput();

  const wantsJump = consumeJump();
  const wantsDuck = consumeDuck();

  if (wantsDuck && p.isDucking) {
    p.grabAnim = 'down';
    p.grabTimer = 0.4;
  }
  if (wantsJump && p.isJumping) {
    p.grabAnim = 'up';
    p.grabTimer = 0.4;
  }
  if (p.grabTimer > 0) {
    p.grabTimer -= dt;
    if (p.grabTimer <= 0) {
      p.grabAnim = 'none';
      p.grabTimer = 0;
    }
  }

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

  // Try sprite first (not for ducking — programmatic has animated legs)
  if (hasSprites('player') && !ducking) {
    let frameName;
    if (p.isJumping) frameName = 'jump';
    else frameName = 'run_' + p.animFrame;
    const pw = CONFIG.PLAYER_W + 16;
    const ph = CONFIG.PLAYER_H_RUN + 12;
    const drawn = drawSprite(ctx, 'player', frameName, x - 8, y - 6, pw, ph);
    if (drawn) {
      const face = getFaceImage();
      if (face && face.complete) {
        const sprX = x - 8;
        const scaleX = pw / 48;
        const scaleY = ph / 64;
        const faceW = 37 * scaleX;
        const faceH = 32 * scaleY;
        const faceX = sprX + 8 * scaleX;
        const faceY = y - 6 + -2 * scaleY;
        const clipRx = faceW * 0.46;
        const clipRy = faceH * 0.48;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(faceX + faceW / 2, faceY + faceH / 2, clipRx, clipRy, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(face, faceX, faceY, faceW, faceH);
        ctx.imageSmoothingEnabled = true;
        ctx.restore();
      }
      drawGrabOverlay(ctx, p, x, y, ducking);
      return;
    }
  }

  ctx.save();

  const bodyW = 28;
  const headH = 22;
  const headW = 25;

  // Shadow on ground
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + bodyW / 2 + 4, groundY - 1, ducking ? 24 : 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (ducking) {
    // Dynamic slide/crouch — body leaning forward, legs in running slide
    const frame = p.animFrame;

    // Body dimensions for slide pose
    const bw = 34;
    const bh = 20;
    const bx = x - 2;
    const by = y + 6; // body sits lower

    // === LEGS — sliding stride, 4-frame animated ===
    const legColor = '#1a1a30';
    const shoeColor = '#2a1a3d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    // Leg positions: [frontKneeX, frontKneeY, frontFootX, frontFootY, backKneeX, backKneeY, backFootX, backFootY]
    const legFrames = [
      // frame 0: wide stride — front leg far forward, back leg extended behind
      { fk: [bx - 2, by + bh + 2], ff: [bx - 8, by + bh + 10], bk: [bx + bw - 2, by + bh + 1], bf: [bx + bw + 6, by + bh + 8] },
      // frame 1: legs pulling in slightly
      { fk: [bx + 2, by + bh + 3], ff: [bx - 4, by + bh + 11], bk: [bx + bw - 4, by + bh + 2], bf: [bx + bw + 2, by + bh + 10] },
      // frame 2: mid slide — legs closer together
      { fk: [bx + 4, by + bh + 2], ff: [bx, by + bh + 10], bk: [bx + bw - 6, by + bh + 2], bf: [bx + bw - 2, by + bh + 10] },
      // frame 3: pushing back out
      { fk: [bx + 1, by + bh + 3], ff: [bx - 6, by + bh + 11], bk: [bx + bw - 3, by + bh + 1], bf: [bx + bw + 4, by + bh + 9] },
    ];
    const lf = legFrames[frame] || legFrames[0];

    // Front leg
    ctx.strokeStyle = legColor;
    ctx.beginPath();
    ctx.moveTo(bx + 6, by + bh);
    ctx.lineTo(lf.fk[0], lf.fk[1]);
    ctx.lineTo(lf.ff[0], lf.ff[1]);
    ctx.stroke();
    // Front shoe
    ctx.fillStyle = shoeColor;
    ctx.fillRect(lf.ff[0] - 4, lf.ff[1] - 1, 9, 4);

    // Back leg
    ctx.strokeStyle = legColor;
    ctx.beginPath();
    ctx.moveTo(bx + bw - 6, by + bh);
    ctx.lineTo(lf.bk[0], lf.bk[1]);
    ctx.lineTo(lf.bf[0], lf.bf[1]);
    ctx.stroke();
    // Back shoe
    ctx.fillStyle = shoeColor;
    ctx.fillRect(lf.bf[0] - 3, lf.bf[1] - 1, 9, 4);

    // === BODY — wide, low, tilted forward ===
    const bodyGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    bodyGrad.addColorStop(0, '#2a2a4a');
    bodyGrad.addColorStop(0.5, '#252542');
    bodyGrad.addColorStop(1, '#181830');
    ctx.fillStyle = bodyGrad;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 5);
      ctx.fill();
    } else {
      ctx.fillRect(bx, by, bw, bh);
    }
    // Hoodie zip highlight
    ctx.fillStyle = 'rgba(100,120,180,0.2)';
    ctx.fillRect(bx + bw / 2 - 1, by + 2, 2, bh - 4);
    // Chest highlight (visibility on dark bg)
    ctx.fillStyle = 'rgba(80,100,160,0.12)';
    ctx.fillRect(bx + 2, by + 2, bw / 2 - 4, bh - 4);

    // === DJ BAG — compact, on back ===
    const bagW = 10;
    const bagH = 16;
    const bagX = bx + bw - 2;
    const bagY = by + 1;
    const bagGrad = ctx.createLinearGradient(bagX, bagY, bagX + bagW, bagY + bagH);
    bagGrad.addColorStop(0, '#2a2a44');
    bagGrad.addColorStop(1, '#16162a');
    ctx.fillStyle = bagGrad;
    ctx.fillRect(bagX, bagY, bagW, bagH);
    // Bag strap
    ctx.strokeStyle = '#4466AA';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bagX, bagY + 2);
    ctx.lineTo(bx + bw - 8, by + 2);
    ctx.stroke();
    // Bag detail
    ctx.fillStyle = '#6688AA';
    ctx.fillRect(bagX + 4, bagY + 2, 2, bagH - 4);
    ctx.fillStyle = '#888888';
    ctx.fillRect(bagX + 2, bagY + bagH - 3, 6, 2);

    // === HEAD — forward and low, tucked ===
    const hx = bx - 4;
    const hy = by - 14;
    const face = getFaceImage();
    if (face && face.complete) {
      const clipRx = headW * 0.48;
      const clipRy = headH * 0.52;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(hx + headW / 2 + 1, hy + headH / 2 + 1, clipRx, clipRy, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(face, hx - 5, hy - 6, headW + 14, headH + 14);
      ctx.imageSmoothingEnabled = true;
      ctx.restore();
    } else {
      const headGrad = ctx.createLinearGradient(hx, hy, hx + headW, hy + headH);
      headGrad.addColorStop(0, '#2e2e4a');
      headGrad.addColorStop(1, '#1e1e38');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(hx + headW / 2 + 1, hy + headH / 2 + 1, headW / 2, headH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Visor / shades
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(hx + 4, hy + 8, 18, 5);
    }

    // === HEADPHONES ===
    ctx.strokeStyle = '#5577BB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hx + headW / 2 + 1, hy + 3, 13, Math.PI * 1.1, Math.PI * -0.1);
    ctx.stroke();
    // Ear cups
    ctx.fillStyle = '#5577BB';
    ctx.fillRect(hx - 1, hy + 3, 5, 8);
    ctx.fillStyle = '#3a5599';
    ctx.fillRect(hx, hy + 4, 3, 6);
    ctx.fillStyle = '#5577BB';
    ctx.fillRect(hx + headW - 1, hy + 3, 5, 8);
    ctx.fillStyle = '#3a5599';
    ctx.fillRect(hx + headW, hy + 4, 3, 6);

    // === ARM — reaching forward for balance ===
    ctx.strokeStyle = '#1a1a30';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const armSwing = [-3, -1, 2, 0][frame] || 0;
    ctx.beginPath();
    ctx.moveTo(bx + 4, by + 5);
    ctx.lineTo(bx - 4 + armSwing, by + 16);
    ctx.lineTo(bx - 6 + armSwing, by + 22);
    ctx.stroke();
    // Hand
    ctx.fillStyle = '#ddb88a';
    ctx.beginPath();
    ctx.arc(bx - 6 + armSwing, by + 22, 3, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // Standing/running pose
    const bodyH = 50;
    const headY = y - 25;

    // Legs — 4-frame cycle
    const legColor = '#0f0f22';
    const shoeColor = '#2a1a3d';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    const frame = p.animFrame;
    if (frame === 0) {
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 9, y + bodyH);
      ctx.lineTo(x + 5, y + bodyH + 10);
      ctx.lineTo(x + 2, y + bodyH + 20);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x - 1, y + bodyH + 17, 8, 5);
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 19, y + bodyH);
      ctx.lineTo(x + 23, y + bodyH + 9);
      ctx.lineTo(x + 25, y + bodyH + 16);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 22, y + bodyH + 13, 8, 5);
    } else if (frame === 1) {
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
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 19, y + bodyH);
      ctx.lineTo(x + 23, y + bodyH + 10);
      ctx.lineTo(x + 27, y + bodyH + 20);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 24, y + bodyH + 17, 8, 5);
      ctx.strokeStyle = legColor;
      ctx.beginPath();
      ctx.moveTo(x + 9, y + bodyH);
      ctx.lineTo(x + 5, y + bodyH + 9);
      ctx.lineTo(x + 3, y + bodyH + 16);
      ctx.stroke();
      ctx.fillStyle = shoeColor;
      ctx.fillRect(x, y + bodyH + 13, 8, 5);
    } else {
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

    // Body
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
    ctx.fillStyle = 'rgba(100,120,180,0.15)';
    ctx.fillRect(x, y + 3, 3, bodyH - 6);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 5, y + bodyH - 14, 18, 7);

    // Head
    const face = getFaceImage();
    if (face && face.complete) {
      const faceDraw = { x: x - 6, y: headY - 8, w: headW + 16, h: headH + 16 };
      const clipRx = headW * 0.50;
      const clipRy = headH * 0.55;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x + 2 + headW / 2, headY + headH / 2, clipRx, clipRy, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(face, faceDraw.x, faceDraw.y, faceDraw.w, faceDraw.h);
      ctx.imageSmoothingEnabled = true;
      ctx.restore();
    } else {
      const headGrad = ctx.createLinearGradient(x + 2, headY, x + headW, headY + headH);
      headGrad.addColorStop(0, '#2a2a44');
      headGrad.addColorStop(1, '#1a1a30');
      ctx.fillStyle = headGrad;
      ctx.fillRect(x + 2, headY, headW, headH);
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(x + 5, headY + 8, 18, 5);
      ctx.fillStyle = 'rgba(100,140,200,0.2)';
      ctx.fillRect(x + 5, headY + 2, 14, 4);
    }

    // Headphones
    ctx.strokeStyle = '#5577BB';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(x + headW / 2 + 2, headY + 2, 14, Math.PI * 1.1, Math.PI * -0.1);
    ctx.stroke();
    ctx.fillStyle = '#5577BB';
    ctx.fillRect(x - 1, headY + 2, 6, 10);
    ctx.fillStyle = '#3a5599';
    ctx.fillRect(x, headY + 3, 4, 8);
    ctx.fillStyle = '#5577BB';
    ctx.fillRect(x + headW - 1, headY + 2, 6, 10);
    ctx.fillStyle = '#3a5599';
    ctx.fillRect(x + headW, headY + 3, 4, 8);

    // DJ Bag
    const bagH = 32;
    const bagX = x + 25;
    const bagY = y + 5;
    const bagGrad = ctx.createLinearGradient(bagX, bagY, bagX + 14, bagY + bagH);
    bagGrad.addColorStop(0, '#2a2a44');
    bagGrad.addColorStop(1, '#16162a');
    ctx.fillStyle = bagGrad;
    ctx.fillRect(bagX, bagY, 14, bagH);
    ctx.fillStyle = '#6688AA';
    ctx.fillRect(bagX + 6, bagY + 3, 2, bagH - 6);
    ctx.fillStyle = '#888888';
    ctx.fillRect(bagX + 3, bagY + bagH - 5, 8, 3);
    ctx.strokeStyle = '#4466AA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bagX, bagY);
    ctx.lineTo(x + 14, y - 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bagX + 14, bagY);
    ctx.lineTo(x + 20, y - 3);
    ctx.stroke();

    // Arm
    ctx.strokeStyle = '#14142a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const armOffsets = [-4, -1, 4, 1];
    const armSwing = armOffsets[p.animFrame] || 0;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 10);
    ctx.lineTo(x - 3 + armSwing, y + 28);
    ctx.stroke();
  }

  drawGrabOverlay(ctx, p, x, y, ducking);

  ctx.restore();
}

function drawGrabOverlay(ctx, p, x, y, ducking) {
  if (p.grabAnim === 'none' || p.grabTimer <= 0) return;
  const progress = 1 - (p.grabTimer / 0.4);
  ctx.save();
  ctx.strokeStyle = '#14142a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  if (p.grabAnim === 'down') {
    const armLen = 20 + progress * 16;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + (ducking ? 10 : 14));
    ctx.lineTo(x - 6, y + (ducking ? 10 : 14) + armLen);
    ctx.stroke();
    ctx.fillStyle = '#ddb88a';
    ctx.beginPath();
    ctx.arc(x - 6, y + (ducking ? 10 : 14) + armLen, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const armLen = 20 + progress * 18;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 6);
    ctx.lineTo(x - 4, y + 6 - armLen);
    ctx.stroke();
    ctx.fillStyle = '#ddb88a';
    ctx.beginPath();
    ctx.arc(x - 4, y + 6 - armLen, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
