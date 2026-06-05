/** @module rendering/macro_renderer — network graph Canvas render */

import { CITIES, CITY_ORDER, getVenueCapacity, getVenueTierLabel } from '../content/cities_data.js';
import { getCityBuzz } from '../systems/promo_engine.js';

/** City node positions (percent of canvas) */
const NODE_POS = {
  nis:      { x: 0.18, y: 0.72 },
  sarajevo: { x: 0.38, y: 0.45 },
  strand:   { x: 0.58, y: 0.32 },
  guncati:  { x: 0.72, y: 0.62 },
  avala:    { x: 0.85, y: 0.22 },
};

/** Connection lines between cities */
const CONNECTIONS = [
  ['nis', 'sarajevo'],
  ['sarajevo', 'strand'],
  ['strand', 'guncati'],
  ['strand', 'avala'],
  ['guncati', 'avala'],
];

/**
 * Render the macro network graph
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @param {number} w canvas width
 * @param {number} h canvas height
 * @param {number} now timestamp for animations
 */
export function renderMacroCanvas(ctx, macro, meta, w, h, now) {
  ctx.clearRect(0, 0, w, h);

  const pulse = 0.5 + 0.5 * Math.sin(now / 800);

  // Draw connections
  for (const [a, b] of CONNECTIONS) {
    const pa = getNodePos(a, w, h);
    const pb = getNodePos(b, w, h);
    const aIdx = CITY_ORDER.indexOf(a);
    const bIdx = CITY_ORDER.indexOf(b);
    const completed = Math.max(aIdx, bIdx) < macro.current_city_index;
    const active = Math.max(aIdx, bIdx) === macro.current_city_index;

    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = completed ? 'rgba(196,77,255,0.7)' : active ? `rgba(77,245,255,${0.3 + pulse * 0.3})` : 'rgba(77,245,255,0.15)';
    ctx.lineWidth = completed ? 2 : 1;
    ctx.setLineDash(completed ? [] : [6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw city nodes
  for (const cityId of CITY_ORDER) {
    const city = CITIES[cityId];
    const pos = getNodePos(cityId, w, h);
    const idx = CITY_ORDER.indexOf(cityId);
    const rep = macro.reputation[cityId] || 0;
    const buzz = getCityBuzzSimple(macro, cityId);
    const isLocked = cityId === 'guncati' && !meta.guncati_unlocked;
    const isCurrent = idx === macro.current_city_index;
    const isCompleted = idx < macro.current_city_index;

    drawCityNode(ctx, pos, city, rep, buzz, isCurrent, isCompleted, isLocked, pulse, now);
  }
}

/**
 * Draw individual city node
 */
function drawCityNode(ctx, pos, city, rep, buzz, isCurrent, isCompleted, isLocked, pulse, now) {
  const r = isCurrent ? 22 : 16;

  // Buzz ring (outer glow)
  if (buzz > 0 && !isLocked) {
    const buzzAlpha = (buzz / 70) * (0.3 + pulse * 0.2);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 184, 48, ${buzzAlpha})`;
    ctx.fill();
  }

  // Pulse ring for current city
  if (isCurrent) {
    const pulseR = r + 10 + pulse * 6;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pulseR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(77,245,255,${0.6 - pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Main node circle
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  if (isLocked) {
    ctx.fillStyle = 'rgba(40,40,60,0.8)';
    ctx.strokeStyle = 'rgba(100,100,120,0.5)';
  } else if (isCompleted) {
    ctx.fillStyle = 'rgba(196,77,255,0.4)';
    ctx.strokeStyle = '#c44dff';
  } else if (isCurrent) {
    ctx.fillStyle = 'rgba(77,245,255,0.15)';
    ctx.strokeStyle = '#4df5ff';
  } else {
    ctx.fillStyle = `rgba(${hexToRgb(city.color)},0.3)`;
    ctx.strokeStyle = city.accentColor || '#4df5ff';
  }
  ctx.lineWidth = isCurrent ? 2 : 1;
  ctx.fill();
  ctx.stroke();

  // Lock icon
  if (isLocked) {
    ctx.fillStyle = '#6a6a9a';
    ctx.font = `${r}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒', pos.x, pos.y);
    ctx.textBaseline = 'alphabetic';
  } else {
    // City initial
    ctx.fillStyle = isCompleted ? '#c44dff' : isCurrent ? '#4df5ff' : '#f0f0f5';
    ctx.font = `bold ${r * 0.7}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(city.name.charAt(0), pos.x, pos.y);
    ctx.textBaseline = 'alphabetic';
  }

  // City name label
  ctx.fillStyle = isLocked ? '#6a6a9a' : '#f0f0f5';
  ctx.font = `11px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(city.name, pos.x, pos.y + r + 14);

  // Rep bar below label
  if (!isLocked) {
    const barW = 48;
    const barH = 4;
    const barX = pos.x - barW / 2;
    const barY = pos.y + r + 20;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = isCompleted ? '#c44dff' : '#4df5ff';
    ctx.fillRect(barX, barY, barW * (rep / 100), barH);
  }
}

function getNodePos(cityId, w, h) {
  const p = NODE_POS[cityId];
  return { x: p.x * w, y: p.y * h };
}

function getCityBuzzSimple(macro, cityId) {
  const now = macro.current_city_index;
  let total = 0;
  for (const p of macro.promo_investments) {
    if (p.cityId === cityId && p.active) total += p.currentBuzz(now);
  }
  return Math.min(70, total);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
