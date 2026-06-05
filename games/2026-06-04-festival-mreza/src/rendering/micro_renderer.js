/** @module rendering/micro_renderer — venue top-down Canvas render, crowd particles */

import { particleCap } from '../systems/performance_monitor.js';

/**
 * Render the micro (venue) canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../state.js').MicroState} micro
 * @param {number} w canvas display width
 * @param {number} h canvas display height
 * @param {number} now timestamp
 */
export function renderMicroCanvas(ctx, micro, w, h, now) {
  ctx.clearRect(0, 0, w, h);

  if (!micro.zones) return;

  const floorTemp = micro.floor_temperature || 0;

  // Floor temperature background overlay
  const tempColor = getFloorTempColor(floorTemp);
  ctx.fillStyle = tempColor;
  ctx.fillRect(0, 0, w, h);

  // Draw zones
  for (const zone of Object.values(micro.zones)) {
    drawZone(ctx, zone, now);
  }

  // Draw crowd particles
  drawCrowdParticles(ctx, micro.crowd_groups || [], micro.zones, now);

  // Overflow glow effect
  for (const zone of Object.values(micro.zones)) {
    if (zone.overflow_active) {
      drawOverflowGlow(ctx, zone, now);
    }
  }
}

/**
 * Draw a single zone
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../entities/zone.js').Zone} zone
 * @param {number} now
 */
function drawZone(ctx, zone, now) {
  // Fill
  ctx.fillStyle = zone.getFillColor();
  ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

  // Border
  ctx.strokeStyle = zone.getBorderColor();
  ctx.lineWidth = zone.overflow_active ? 2 : 1;
  ctx.strokeRect(zone.x + 0.5, zone.y + 0.5, zone.w - 1, zone.h - 1);

  // Zone label
  ctx.fillStyle = 'rgba(240,240,245,0.7)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(zone.label, zone.x + zone.w / 2, zone.y + 16);

  // Crowd count
  ctx.fillStyle = 'rgba(240,240,245,0.9)';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`${zone.current_crowd}/${zone.capacity}`, zone.x + zone.w / 2, zone.y + zone.h - 8);

  // Utilization bar (bottom of zone)
  const util = Math.min(1, zone.utilization);
  const barW = zone.w - 20;
  const barY = zone.y + zone.h - 18;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(zone.x + 10, barY, barW, 4);
  const barColor = util > 1.0 ? '#ff4444' : util > 0.85 ? '#ffb830' : '#4df5ff';
  ctx.fillStyle = barColor;
  ctx.fillRect(zone.x + 10, barY, barW * Math.min(1, util), 4);

  ctx.textAlign = 'left';
}

/**
 * Draw crowd groups as colored dots/particles
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../entities/crowd_group.js').CrowdGroup[]} groups
 * @param {Record<string, import('../entities/zone.js').Zone>} zones
 * @param {number} now
 */
function drawCrowdParticles(ctx, groups, zones, now) {
  let drawnParticles = 0;
  const cap = particleCap;

  for (const group of groups) {
    if (drawnParticles >= cap) break;

    const zone = zones[group.zoneId];
    if (!zone) continue;

    const color = group.getColor();
    const baseRadius = 3;
    const particlesPerGroup = Math.min(20, Math.max(1, Math.floor(group.size / 8)));

    for (let i = 0; i < particlesPerGroup && drawnParticles < cap; i++) {
      // Spread particles across zone using group position as seed
      const px = group.x + (Math.sin(i * 1.618 + group.id.length) * zone.w * 0.35);
      const py = group.y + (Math.cos(i * 2.718 + group.id.length) * zone.h * 0.35);

      // Pulse effect for warm/hot groups
      const pulse = group.mood !== 'cold' ? Math.sin(now / 400 + i) * 0.5 + 0.5 : 0;
      const r = baseRadius + pulse;

      ctx.beginPath();
      ctx.arc(
        Math.max(zone.x + r, Math.min(zone.x + zone.w - r, px)),
        Math.max(zone.y + r, Math.min(zone.y + zone.h - r, py)),
        r, 0, Math.PI * 2
      );
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7 + pulse * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
      drawnParticles++;
    }

    // Migration trail
    if (group.migrating) {
      ctx.beginPath();
      ctx.moveTo(group.x, group.y);
      ctx.lineTo(group.targetX, group.targetY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

/**
 * Draw overflow glow around zone
 */
function drawOverflowGlow(ctx, zone, now) {
  const alpha = 0.3 + 0.2 * Math.sin(now / 200);
  const gradient = ctx.createRadialGradient(
    zone.x + zone.w / 2, zone.y + zone.h / 2, 0,
    zone.x + zone.w / 2, zone.y + zone.h / 2, Math.max(zone.w, zone.h) / 1.5
  );
  gradient.addColorStop(0, `rgba(255,68,68,${alpha})`);
  gradient.addColorStop(1, 'rgba(255,68,68,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(zone.x - 10, zone.y - 10, zone.w + 20, zone.h + 20);
}

/**
 * Get floor temperature background color
 * @param {number} temp 0-1
 * @returns {string} rgba color
 */
function getFloorTempColor(temp) {
  if (temp >= 0.85) return 'rgba(255,0,34,0.08)';         // overheated
  if (temp >= 0.65) return 'rgba(255,85,0,0.06)';          // hot
  if (temp >= 0.45) return 'rgba(255,140,66,0.04)';        // warm
  return 'rgba(13,27,46,0.95)';                             // cool/normal
}
