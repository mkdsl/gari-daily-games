import { CONFIG } from '../config.js';
import { getZoneRect, getAllZoneRects, isActiveZone } from './zone-manager.js';
import { renderPult, updatePultAnimation } from '../zones/pult.js';
import { renderBina, updateBinaAnimation } from '../zones/bina.js';
import { renderSuma, updateSumaAnimation } from '../zones/suma.js';

// Parallax cloud state
let clouds = [];
let cloudTimer = 0;

function initClouds() {
  clouds = Array.from({ length: 6 }, (_, i) => ({
    x: Math.random() * 900,
    y: 10 + Math.random() * 40,
    w: 40 + Math.random() * 60,
    h: 10 + Math.random() * 15,
    speed: 8 + Math.random() * 12,
    alpha: 0.05 + Math.random() * 0.08
  }));
}
initClouds();

export function updateParkBoard(dt) {
  // Update zone animations
  updatePultAnimation(dt);
  updateBinaAnimation(dt);
  updateSumaAnimation(dt);

  // Update clouds
  clouds.forEach(c => {
    c.x += c.speed * dt;
    if (c.x > 950) c.x = -80;
  });
}

export function renderParkBoard(ctx, canvas, state, hoverZone, time) {
  const W = canvas.width;
  const H = canvas.height;

  // Clear background
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, W, H);

  // Stars (static, seed-based pattern)
  renderStars(ctx, W, H, time);

  // Parallax clouds
  renderClouds(ctx, W);

  // Render all zones
  const allZones = [...CONFIG.ACTIVE_ZONES, ...CONFIG.LOCKED_ZONES];
  for (const zoneId of allZones) {
    const rect = getZoneRect(zoneId, W, H);
    if (!rect) continue;

    if (isActiveZone(zoneId)) {
      renderActiveZone(ctx, zoneId, rect, state, hoverZone === zoneId, time);
    } else {
      renderLockedZone(ctx, zoneId, rect, hoverZone === zoneId, time);
    }
  }

  // Daily light golden frame (animated dashed border)
  const dlZone = state.dailyLight?.zone;
  if (dlZone && !state.dailyLight?.completed) {
    const rect = getZoneRect(dlZone, W, H);
    if (rect) renderDailyLightFrame(ctx, rect, time);
  }
}

function renderStars(ctx, W, H, time) {
  // 30 fixed stars (deterministic positions)
  let seed = 42;
  for (let i = 0; i < 30; i++) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const sx = ((seed >>> 0) % W);
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const sy = ((seed >>> 0) % Math.floor(H * 0.6));
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const brightness = 0.3 + ((seed >>> 0) % 100) / 200;
    const pulse = 0.5 + 0.5 * Math.sin(time * (0.5 + brightness) + i);
    ctx.globalAlpha = brightness * pulse;
    ctx.fillStyle = '#E8DCC8';
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function renderClouds(ctx, W) {
  clouds.forEach(c => {
    ctx.globalAlpha = c.alpha;
    ctx.fillStyle = '#4a6080';
    ctx.beginPath();
    ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x + c.w * 0.3, c.y + c.h * 0.3, c.w * 0.35, c.h * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function renderActiveZone(ctx, zoneId, rect, state, isHovered, time) {
  const zoneState = state.zones[zoneId];
  switch (zoneId) {
    case 'pult': renderPult(ctx, rect, zoneState, isHovered, time); break;
    case 'bina': renderBina(ctx, rect, zoneState, isHovered, time); break;
    case 'suma': renderSuma(ctx, rect, zoneState, isHovered, time); break;
  }
}

function renderLockedZone(ctx, zoneId, rect, isHovered, time) {
  const { x, y, w, h } = rect;

  // Gray base
  ctx.fillStyle = CONFIG.COLORS.LOCKED_GRAY;
  ctx.fillRect(x, y, w, h);

  // Subtle pulse glow
  const pulse = 0.03 + 0.02 * Math.sin(time * 0.8);
  ctx.fillStyle = `rgba(255,255,255,${pulse})`;
  ctx.fillRect(x, y, w, h);

  // Border
  ctx.strokeStyle = '#3a4555';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

  // Lock icon (text-based)
  ctx.fillStyle = '#4a5568';
  ctx.font = '18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[  ]', x + w / 2, y + h / 2 - 5);
  ctx.font = '8px monospace';
  ctx.fillStyle = '#3a4555';
  ctx.fillText('U izgradnji...', x + w / 2, y + h / 2 + 10);

  // Zone name
  ctx.fillStyle = '#3a4555';
  ctx.font = 'bold 9px monospace';
  ctx.fillText((CONFIG.ZONE_DISPLAY_NAMES[zoneId] || zoneId).toUpperCase(), x + w / 2, y + 14);
  ctx.textAlign = 'left';

  if (isHovered) {
    ctx.strokeStyle = 'rgba(255,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}

function renderDailyLightFrame(ctx, rect, time) {
  const { x, y, w, h } = rect;
  // Animated dashed golden border
  ctx.save();
  ctx.strokeStyle = CONFIG.COLORS.GOLD;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 4]);
  ctx.lineDashOffset = -(time * 20) % 24;
  ctx.globalAlpha = 0.8;
  ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
  ctx.restore();

  // Star indicator above zone
  ctx.fillStyle = CONFIG.COLORS.GOLD;
  ctx.font = '12px monospace';
  ctx.globalAlpha = 0.9;
  ctx.fillText('* DNEVNO SVETLO *', x + w / 2 - 55, y - 7);
  ctx.globalAlpha = 1;
}

export function renderEggOverlay(ctx, canvas, eggs, time) {
  if (!eggs) return;

  for (const egg of eggs) {
    if (egg.collected) continue;
    renderEgg(ctx, egg, time);
  }
}

function renderEgg(ctx, egg, time) {
  const { x, y, type } = egg;
  const pulse = 0.6 + 0.4 * Math.sin(time * 3 + x * 0.1);

  // Glow effect
  const grd = ctx.createRadialGradient(x, y, 0, x, y, 16);
  grd.addColorStop(0, `rgba(255, 215, 0, ${0.3 * pulse})`);
  grd.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();

  // Egg visual based on type
  renderEggByType(ctx, egg, x, y, pulse);
}

function renderEggByType(ctx, egg, x, y, pulse) {
  ctx.globalAlpha = 0.85 + 0.15 * pulse;

  switch (egg.type.id) {
    case 'lampion':
      // Golden circle with inner glow
      ctx.fillStyle = CONFIG.COLORS.GOLD;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF5A0';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'klupa':
      // Dark gray rectangle with orange detail
      ctx.fillStyle = '#4a3010';
      ctx.fillRect(x - 8, y - 3, 16, 6);
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(x - 6, y - 4, 12, 2);
      break;

    case 'poster':
      // Purple rectangle
      ctx.fillStyle = '#6B35A8';
      ctx.fillRect(x - 5, y - 7, 10, 14);
      ctx.fillStyle = '#9B65D8';
      ctx.fillRect(x - 3, y - 5, 6, 3);
      break;

    case 'torba':
      // Dark brown shape
      ctx.fillStyle = '#3D1F08';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x - 6, y - 5, 12, 10, 2);
      } else {
        ctx.rect(x - 6, y - 5, 12, 10);
      }
      ctx.fill();
      ctx.fillStyle = '#6B3A1A';
      ctx.fillRect(x - 2, y - 7, 4, 3);
      break;

    case 'knjiga':
      // Blue open rectangle
      ctx.fillStyle = '#1A4F7A';
      ctx.fillRect(x - 8, y - 5, 16, 10);
      ctx.fillStyle = '#2980B9';
      ctx.fillRect(x - 1, y - 4, 2, 8);
      ctx.fillRect(x - 7, y - 2, 14, 1);
      ctx.fillRect(x - 7, y + 1, 14, 1);
      break;

    case 'foto':
      // Gray square with border
      ctx.fillStyle = '#888';
      ctx.fillRect(x - 6, y - 6, 12, 12);
      ctx.fillStyle = '#555';
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 6, y - 6, 12, 12);
      break;

    case 'vinil':
      // Black circle with red label
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#C0392B';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.globalAlpha = 1;
}

export { initClouds };
