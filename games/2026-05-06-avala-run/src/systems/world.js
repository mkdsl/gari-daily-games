import { CONFIG } from '../config.js';

// Parallax speeds: stars, clouds, avala, farPines, midPines
const PARALLAX_SPEEDS = [0.02, 0.05, 0.1, 0.3, 0.6];

export function initWorld(state, canvasW, canvasH) {
  const groundY = canvasH * CONFIG.GROUND_RATIO;
  // Generiši zvezde sa varijacijom velicine i blink fazom
  state.world.stars = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvasW * 2,
    y: Math.random() * groundY * 0.5,
    size: Math.random() < 0.2 ? 2 : 1,
    blinkPhase: Math.random() * Math.PI * 2,
    blinkSpeed: 1.5 + Math.random() * 2
  }));
  // Generiši oblake
  state.world.clouds = Array.from({ length: 5 }, (_, i) => ({
    x: (i / 5) * canvasW * 2 + Math.random() * 100,
    y: 30 + Math.random() * groundY * 0.25,
    w: 40 + Math.random() * 60,
    h: 12 + Math.random() * 10,
    alpha: 0.06 + Math.random() * 0.08
  }));
  // Generiši far pines (16 borova za seamless wrap)
  state.world.farPines = Array.from({ length: 16 }, (_, i) => ({
    x: (i / 16) * canvasW * 2,
    h: 80 + Math.random() * 40,
    baseY: groundY - 10,
    variant: Math.floor(Math.random() * 3)
  }));
  // Generiši mid pines (24 borova za seamless wrap)
  state.world.midPines = Array.from({ length: 24 }, (_, i) => ({
    x: (i / 24) * canvasW * 2,
    h: 60 + Math.random() * 30,
    baseY: groundY - 5,
    variant: Math.floor(Math.random() * 3)
  }));
  // Ground texture seed
  state.world.groundSeeds = Array.from({ length: 40 }, () => ({
    xOff: Math.random() * canvasW * 2,
    type: Math.floor(Math.random() * 3) // 0=grass tuft, 1=pebble, 2=dirt patch
  }));
  // Reset scroll
  state.world.scrollX = 0;
  state.world.parallaxOffsets = [0, 0, 0, 0, 0];
}

export function updateWorld(state, dt) {
  const dx = state.speed * dt;
  state.world.scrollX += dx;
  PARALLAX_SPEEDS.forEach((s, i) => {
    state.world.parallaxOffsets[i] = state.world.scrollX * s;
  });
}

let _time = 0;

export function drawBackground(ctx, state, canvasW, canvasH) {
  const groundY = canvasH * CONFIG.GROUND_RATIO;
  _time += 0.016;

  // Sky gradient — noćna paleta
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, '#05081a');
  grad.addColorStop(0.15, '#0a1030');
  grad.addColorStop(0.4, '#0f1540');
  grad.addColorStop(0.7, '#1a1050');
  grad.addColorStop(0.85, '#2d1244');
  grad.addColorStop(1, '#0a0d1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, groundY);

  // Moon
  drawMoon(ctx, canvasW, groundY);

  // Stars with twinkling (0.02x parallax — almost static)
  const starPatternW = canvasW * 2;
  const starOff = state.world.parallaxOffsets[0];
  state.world.stars.forEach(s => {
    const sx = ((s.x - starOff) % starPatternW + starPatternW) % starPatternW;
    if (sx > canvasW) return;
    const alpha = 0.4 + 0.5 * Math.sin(_time * s.blinkSpeed + s.blinkPhase);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx, s.y, s.size, s.size);
    // Cross sparkle on bigger stars
    if (s.size === 2 && alpha > 0.7) {
      ctx.fillRect(sx - 1, s.y + 1, 1, 1);
      ctx.fillRect(sx + 2, s.y + 1, 1, 1);
    }
  });
  ctx.globalAlpha = 1;

  // Clouds (0.05x parallax — slow drift)
  const cloudPatternW = canvasW * 2;
  const cloudOff = state.world.parallaxOffsets[1];
  if (state.world.clouds) {
    state.world.clouds.forEach(c => {
      const cx = ((c.x - cloudOff) % cloudPatternW + cloudPatternW) % cloudPatternW;
      if (cx > canvasW + c.w) return;
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = '#8090aa';
      // Multi-ellipse cloud shape
      ctx.beginPath();
      ctx.ellipse(cx, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - c.w * 0.25, c.y + 2, c.w * 0.35, c.h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + c.w * 0.3, c.y + 1, c.w * 0.3, c.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // Avala silhouette (0.1x parallax)
  drawAvalaSilhouette(ctx, state.world.parallaxOffsets[2], canvasW, groundY);

  // Far pines (0.3x parallax) — darker, simpler
  const farOff = state.world.parallaxOffsets[3];
  state.world.farPines.forEach(p => {
    const px = ((p.x - farOff) % (canvasW * 2) + canvasW * 2) % (canvasW * 2);
    drawPine(ctx, px, p.baseY, p.h, CONFIG.COLORS.PINE_FAR, p.variant, true);
  });

  // Mid pines (0.6x parallax) — more detail
  const midOff = state.world.parallaxOffsets[4];
  state.world.midPines.forEach(p => {
    const px = ((p.x - midOff) % (canvasW * 2) + canvasW * 2) % (canvasW * 2);
    drawPine(ctx, px, p.baseY, p.h, CONFIG.COLORS.PINE_MID, p.variant, false);
  });

  // Ground with texture
  drawGround(ctx, state, canvasW, canvasH, groundY);
}

function drawMoon(ctx, canvasW, groundY) {
  const moonX = canvasW * 0.82;
  const moonY = groundY * 0.15;
  const moonR = 18;

  // Outer glow
  ctx.globalAlpha = 0.08;
  const glow = ctx.createRadialGradient(moonX, moonY, moonR, moonX, moonY, moonR * 4);
  glow.addColorStop(0, '#c0c8e0');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(moonX - moonR * 4, moonY - moonR * 4, moonR * 8, moonR * 8);

  // Moon body
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#d0d4e8';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  // Crescent shadow (crescent moon effect)
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0a1030';
  ctx.beginPath();
  ctx.arc(moonX + 6, moonY - 3, moonR - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawGround(ctx, state, canvasW, canvasH, groundY) {
  const groundH = canvasH - groundY;

  // Base ground gradient
  const gGrad = ctx.createLinearGradient(0, groundY, 0, canvasH);
  gGrad.addColorStop(0, '#2a1a0d');
  gGrad.addColorStop(0.3, '#1a0d06');
  gGrad.addColorStop(1, '#0f0804');
  ctx.fillStyle = gGrad;
  ctx.fillRect(0, groundY, canvasW, groundH);

  // Top edge — grass/dirt line with texture
  ctx.fillStyle = '#3d2816';
  ctx.fillRect(0, groundY, canvasW, 2);
  ctx.fillStyle = '#2a4a1a';
  ctx.fillRect(0, groundY - 1, canvasW, 1);

  // Scattered ground details
  const scrollX = state.world.scrollX;
  if (state.world.groundSeeds) {
    state.world.groundSeeds.forEach(seed => {
      const gx = ((seed.xOff - scrollX * 0.9) % (canvasW * 2) + canvasW * 2) % (canvasW * 2);
      if (gx > canvasW) return;
      if (seed.type === 0) {
        // Grass tuft
        ctx.fillStyle = '#1a3d12';
        ctx.fillRect(gx, groundY - 3, 1, 3);
        ctx.fillRect(gx + 2, groundY - 4, 1, 4);
        ctx.fillRect(gx + 4, groundY - 2, 1, 2);
      } else if (seed.type === 1) {
        // Pebble
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(gx, groundY + 4, 3, 2);
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(gx + 1, groundY + 4, 1, 1);
      } else {
        // Dirt patch
        ctx.fillStyle = '#241408';
        ctx.fillRect(gx, groundY + 8, 5, 2);
      }
    });
  }
}

let partyPhase = 0;

function drawAvalaSilhouette(ctx, offset, canvasW, groundY) {
  partyPhase += 0.02;
  const tileW = canvasW * 1.5;
  const off = offset % tileW;

  for (let tx = -off; tx < canvasW + tileW; tx += tileW) {
    // Mountain body with subtle gradient
    const mtnGrad = ctx.createLinearGradient(tx, groundY - 190, tx, groundY);
    mtnGrad.addColorStop(0, '#0f1428');
    mtnGrad.addColorStop(1, '#080c18');
    ctx.fillStyle = mtnGrad;
    ctx.beginPath();
    ctx.moveTo(tx, groundY);
    ctx.lineTo(tx + tileW * 0.05,  groundY - 50);
    ctx.lineTo(tx + tileW * 0.1,   groundY - 80);
    ctx.lineTo(tx + tileW * 0.2,   groundY - 130);
    ctx.lineTo(tx + tileW * 0.3,   groundY - 155);
    ctx.lineTo(tx + tileW * 0.4,   groundY - 175);
    ctx.lineTo(tx + tileW * 0.5,   groundY - 190); // vrh Avale
    ctx.lineTo(tx + tileW * 0.6,   groundY - 170);
    ctx.lineTo(tx + tileW * 0.7,   groundY - 145);
    ctx.lineTo(tx + tileW * 0.8,   groundY - 120);
    ctx.lineTo(tx + tileW * 0.9,   groundY - 75);
    ctx.lineTo(tx + tileW * 0.95,  groundY - 40);
    ctx.lineTo(tx + tileW,         groundY);
    ctx.closePath();
    ctx.fill();

    // Ridge highlight on mountain edge
    ctx.strokeStyle = 'rgba(40,50,80,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + tileW * 0.3, groundY - 155);
    ctx.lineTo(tx + tileW * 0.5, groundY - 190);
    ctx.lineTo(tx + tileW * 0.7, groundY - 145);
    ctx.stroke();

    // Avalski TV toranj na vrhu
    drawAvalaTower(ctx, tx + tileW * 0.5, groundY - 190);
  }
}

function drawAvalaTower(ctx, towerX, towerBase) {
  const towerH = 55; // visok toranj
  const topY = towerBase - towerH;

  // Trougaona baza tornja (širi donji deo, sužava se ka vrhu)
  const baseHalfW = 10; // širina dna baze
  const baseH = 20;     // visina trougaone baze
  ctx.fillStyle = '#141830';
  ctx.beginPath();
  ctx.moveTo(towerX - baseHalfW, towerBase);
  ctx.lineTo(towerX + baseHalfW, towerBase);
  ctx.lineTo(towerX + 3, towerBase - baseH);
  ctx.lineTo(towerX - 3, towerBase - baseH);
  ctx.closePath();
  ctx.fill();

  // Strukturne linije baze (triangular lattice)
  ctx.strokeStyle = 'rgba(60,70,110,0.5)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  // Levi i desni dijagonalni nosač
  ctx.moveTo(towerX - baseHalfW, towerBase);
  ctx.lineTo(towerX, towerBase - baseH - 5);
  ctx.moveTo(towerX + baseHalfW, towerBase);
  ctx.lineTo(towerX, towerBase - baseH - 5);
  // Poprečne linije
  for (let i = 1; i <= 3; i++) {
    const frac = i / 4;
    const ly = towerBase - baseH * frac;
    const lw = baseHalfW * (1 - frac * 0.7);
    ctx.moveTo(towerX - lw, ly);
    ctx.lineTo(towerX + lw, ly);
  }
  ctx.stroke();

  // Gornji deo tornja (tanak stub koji se sužava)
  const shaftBottom = towerBase - baseH;
  const shaftH = towerH - baseH - 10;
  ctx.fillStyle = '#181c34';
  ctx.beginPath();
  ctx.moveTo(towerX - 3, shaftBottom);
  ctx.lineTo(towerX + 3, shaftBottom);
  ctx.lineTo(towerX + 1.5, shaftBottom - shaftH);
  ctx.lineTo(towerX - 1.5, shaftBottom - shaftH);
  ctx.closePath();
  ctx.fill();

  // Strukturne linije na stubu
  ctx.strokeStyle = 'rgba(60,70,110,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(towerX - 3, shaftBottom);
  ctx.lineTo(towerX, shaftBottom - shaftH);
  ctx.moveTo(towerX + 3, shaftBottom);
  ctx.lineTo(towerX, shaftBottom - shaftH);
  ctx.stroke();

  // Antena na vrhu
  const antennaBase = shaftBottom - shaftH;
  ctx.fillStyle = '#1a1e38';
  ctx.fillRect(towerX - 0.5, antennaBase - 10, 1, 10);

  // Crveno avijacijsko svetlo na vrhu antene (pulsirajuće)
  const glowAlpha = 0.6 + Math.sin(partyPhase * 4) * 0.3;
  ctx.globalAlpha = glowAlpha;
  ctx.fillStyle = '#ff2244';
  ctx.beginPath();
  ctx.arc(towerX, antennaBase - 12, 3, 0, Math.PI * 2);
  ctx.fill();
  // Outer glow
  ctx.globalAlpha = glowAlpha * 0.35;
  ctx.beginPath();
  ctx.arc(towerX, antennaBase - 12, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Party svetla oko baze tornja (šarena, animirana, žurka je na Avali!)
  const colors = ['#ff2266', '#ffaa00', '#00ccff', '#ff44ff', '#44ff88', '#ffdd44', '#ff6622'];
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + partyPhase * 1.5;
    const radius = 14 + Math.sin(partyPhase * 2 + i) * 5;
    const lx = towerX + Math.cos(angle) * radius;
    const ly = towerBase + 2 + Math.sin(angle) * radius * 0.35;
    const alpha = 0.5 + Math.sin(partyPhase * 3 + i * 1.3) * 0.35;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Light ray glow
    ctx.globalAlpha = alpha * 0.25;
    ctx.beginPath();
    ctx.arc(lx, ly, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Topla svetla / festival glow oko baze
  ctx.globalAlpha = 0.2;
  const fGrad = ctx.createRadialGradient(towerX, towerBase, 8, towerX, towerBase, 50);
  fGrad.addColorStop(0, '#ff6622');
  fGrad.addColorStop(0.5, 'rgba(255,50,10,0.15)');
  fGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = fGrad;
  ctx.fillRect(towerX - 50, towerBase - 40, 100, 80);
  ctx.globalAlpha = 1;
}

function drawPine(ctx, x, baseY, h, color, variant, isFar) {
  const w = h * 0.5;
  const layers = isFar ? 3 : 4;

  // Trunk
  const trunkW = isFar ? 4 : 6;
  ctx.fillStyle = isFar ? '#0a0f0a' : '#1a0f06';
  ctx.fillRect(x - trunkW / 2, baseY - h * 0.25, trunkW, h * 0.25);

  // Foliage layers
  for (let i = 0; i < layers; i++) {
    const layerH = h * (isFar ? 0.4 : 0.38);
    const layerW = w * (1 - i * 0.18) * (variant === 2 ? 0.85 : 1);
    const layerY = baseY - h * 0.28 * i - layerH;
    const ySkew = variant === 1 ? -4 : 0;

    // Main triangle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, layerY + ySkew);
    ctx.lineTo(x - layerW / 2, layerY + layerH);
    ctx.lineTo(x + layerW / 2, layerY + layerH);
    ctx.closePath();
    ctx.fill();

    // Edge highlight (moonlight from left)
    if (!isFar) {
      ctx.fillStyle = 'rgba(30,60,30,0.4)';
      ctx.beginPath();
      ctx.moveTo(x, layerY + ySkew);
      ctx.lineTo(x - layerW / 2, layerY + layerH);
      ctx.lineTo(x - layerW / 4, layerY + layerH * 0.7);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Snow/frost tips on far pines
  if (isFar && variant === 0) {
    ctx.fillStyle = 'rgba(60,80,100,0.2)';
    ctx.fillRect(x - 1, baseY - h * 0.28 * (layers - 1) - h * 0.4, 2, 3);
  }
}

export function drawBranding(ctx, canvasW, canvasH) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = CONFIG.COLORS.BRANDING;
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('K KLUBOSLAVIJA', canvasW - 8, canvasH - 8);
  ctx.restore();
}
