import { CONFIG } from '../config.js';

const PARALLAX_SPEEDS = [0.05, 0.15, 0.35, 0.60]; // stars, avala, farPines, midPines

export function initWorld(state, canvasW, canvasH) {
  const groundY = canvasH * CONFIG.GROUND_RATIO;
  // Generiši zvezde
  state.world.stars = Array.from({ length: 20 }, () => ({
    x: Math.random() * canvasW,
    y: Math.random() * groundY * 0.7
  }));
  // Generiši far pines (16 borova za seamless wrap)
  state.world.farPines = Array.from({ length: 16 }, (_, i) => ({
    x: (i / 16) * canvasW * 2,
    h: 80 + Math.random() * 40,
    baseY: groundY - 10
  }));
  // Generiši mid pines (24 borova za seamless wrap)
  state.world.midPines = Array.from({ length: 24 }, (_, i) => ({
    x: (i / 24) * canvasW * 2,
    h: 60 + Math.random() * 30,
    baseY: groundY - 5
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

export function drawBackground(ctx, state, canvasW, canvasH) {
  const groundY = canvasH * CONFIG.GROUND_RATIO;

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, CONFIG.COLORS.BG_TOP);
  grad.addColorStop(0.35, CONFIG.COLORS.BG_MID);
  grad.addColorStop(1, CONFIG.COLORS.BG_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, groundY);

  // Stars
  ctx.fillStyle = '#ffffff';
  const starOff = state.world.parallaxOffsets[0];
  state.world.stars.forEach(s => {
    const sx = ((s.x - starOff) % canvasW + canvasW) % canvasW;
    ctx.fillRect(sx, s.y, 2, 2);
  });

  // Avala silhouette (parallax 1)
  drawAvalaSilhouette(ctx, state.world.parallaxOffsets[1], canvasW, groundY);

  // Far pines (parallax 2)
  const farOff = state.world.parallaxOffsets[2];
  state.world.farPines.forEach(p => {
    const px = ((p.x - farOff) % (canvasW * 2) + canvasW * 2) % (canvasW * 2);
    drawPine(ctx, px, p.baseY, p.h, CONFIG.COLORS.PINE_FAR);
  });

  // Mid pines (parallax 3)
  const midOff = state.world.parallaxOffsets[3];
  state.world.midPines.forEach(p => {
    const px = ((p.x - midOff) % (canvasW * 2) + canvasW * 2) % (canvasW * 2);
    drawPine(ctx, px, p.baseY, p.h, CONFIG.COLORS.PINE_MID);
  });

  // Ground
  ctx.fillStyle = CONFIG.COLORS.GROUND;
  ctx.fillRect(0, groundY, canvasW, canvasH - groundY);
  ctx.fillStyle = CONFIG.COLORS.GROUND_LINE;
  ctx.fillRect(0, groundY, canvasW, 2);
}

let partyPhase = 0;

function drawAvalaSilhouette(ctx, offset, canvasW, groundY) {
  partyPhase += 0.02;
  const tileW = canvasW * 1.5;
  const off = offset % tileW;

  for (let tx = -off; tx < canvasW + tileW; tx += tileW) {
    // Planina — veća i izraženija
    ctx.fillStyle = '#0d1020';
    ctx.beginPath();
    ctx.moveTo(tx, groundY);
    ctx.lineTo(tx + tileW * 0.08,  groundY - 70);
    ctx.lineTo(tx + tileW * 0.2,   groundY - 130);
    ctx.lineTo(tx + tileW * 0.35,  groundY - 160);
    ctx.lineTo(tx + tileW * 0.5,   groundY - 190); // vrh Avale
    ctx.lineTo(tx + tileW * 0.65,  groundY - 155);
    ctx.lineTo(tx + tileW * 0.8,   groundY - 120);
    ctx.lineTo(tx + tileW * 0.92,  groundY - 65);
    ctx.lineTo(tx + tileW,         groundY);
    ctx.closePath();
    ctx.fill();

    // Toranj na vrhu
    const towerX = tx + tileW * 0.5;
    const towerBase = groundY - 190;
    const towerH = 40;
    ctx.fillStyle = '#1a1a30';
    ctx.fillRect(towerX - 2, towerBase - towerH, 4, towerH);
    // Antena vrh
    ctx.fillRect(towerX - 1, towerBase - towerH - 8, 2, 8);

    // Party svetla oko tornja (pulsiraju)
    const colors = ['#ff2266', '#ffaa00', '#00ccff', '#ff44ff', '#44ff88'];
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + partyPhase;
      const radius = 12 + Math.sin(partyPhase * 2 + i) * 4;
      const lx = towerX + Math.cos(angle) * radius;
      const ly = towerBase - towerH - 4 + Math.sin(angle) * radius * 0.5;
      const alpha = 0.5 + Math.sin(partyPhase * 3 + i * 1.3) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(lx, ly, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Glow na vrhu tornja (crveno svetlo)
    const glowAlpha = 0.6 + Math.sin(partyPhase * 4) * 0.3;
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = '#ff2244';
    ctx.beginPath();
    ctx.arc(towerX, towerBase - towerH - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Topla svetla na horizontu (festival hint)
    ctx.globalAlpha = 0.3;
    const grad = ctx.createRadialGradient(towerX, towerBase - towerH, 5, towerX, towerBase - towerH, 50);
    grad.addColorStop(0, '#ff6622');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(towerX - 50, towerBase - towerH - 50, 100, 80);
    ctx.globalAlpha = 1;
  }
}

function drawPine(ctx, x, baseY, h, color) {
  ctx.fillStyle = color;
  const w = h * 0.5;
  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const layerH = h * 0.45;
    const layerW = w * (1 - i * 0.2);
    const layerY = baseY - h * 0.3 * i - layerH;
    ctx.beginPath();
    ctx.moveTo(x, layerY);
    ctx.lineTo(x - layerW / 2, layerY + layerH);
    ctx.lineTo(x + layerW / 2, layerY + layerH);
    ctx.closePath();
    ctx.fill();
  }
  // Stub
  ctx.fillRect(x - 3, baseY - h * 0.2, 6, h * 0.2);
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
