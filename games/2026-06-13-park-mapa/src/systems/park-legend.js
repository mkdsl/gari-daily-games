/**
 * park-legend.js — Kumulativni PT rang, rang promena animacija
 * Park Mapa | Jova jQuery
 */

import { CONFIG } from '../config.js';

export function getRank(totalPt) {
  const ranks = CONFIG.PARK_RANKS;
  let current = ranks[0];
  for (const rank of ranks) {
    if (totalPt >= rank.min) current = rank;
  }
  return current;
}

export function getRankIndex(totalPt) {
  const ranks = CONFIG.PARK_RANKS;
  let idx = 0;
  for (let i = 0; i < ranks.length; i++) {
    if (totalPt >= ranks[i].min) idx = i;
  }
  return idx;
}

export function getRankProgress(totalPt) {
  const ranks = CONFIG.PARK_RANKS;
  let currentIdx = 0;
  for (let i = 0; i < ranks.length; i++) {
    if (totalPt >= ranks[i].min) currentIdx = i;
  }
  if (currentIdx >= ranks.length - 1) {
    return {
      current: ranks[currentIdx],
      next: null,
      progress: 1,
      ptInRank: 0,
      ptToNext: 0
    };
  }
  const current = ranks[currentIdx];
  const next = ranks[currentIdx + 1];
  const ptInRank = totalPt - current.min;
  const ptToNext = next.min - current.min;
  return {
    current,
    next,
    progress: Math.min(1, ptInRank / ptToNext),
    ptInRank,
    ptToNext
  };
}

export function getRankBadgeSymbol(rankName) {
  const symbols = {
    'Izletnik': '🌱',
    'Poznavalac': '🗺️',
    'Domaćin': '🏠',
    'Legenda': '⭐',
    'MKDSLend Original': '👑'
  };
  // Return text fallback (emoji may not render in canvas)
  return symbols[rankName] || '•';
}

export function getRankColor(rankName) {
  const colors = {
    'Izletnik': '#78B7A0',
    'Poznavalac': '#5BA4CF',
    'Domaćin': '#BF5FFF',
    'Legenda': '#FFB830',
    'MKDSLend Original': '#FFD700'
  };
  return colors[rankName] || '#E8DCC8';
}

// Render rank badge on canvas
export function renderRankBadge(ctx, x, y, state) {
  const rankData = getRankProgress(state.totalPtEarned);
  const { current, next, progress } = rankData;
  const color = getRankColor(current.name);

  // Badge background
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.roundRect(x, y, 160, 36, 6);
  ctx.fill();

  // Rank name
  ctx.fillStyle = color;
  ctx.font = 'bold 12px monospace';
  ctx.fillText(current.name, x + 8, y + 16);

  // Progress bar
  ctx.fillStyle = '#1a2535';
  ctx.fillRect(x + 8, y + 22, 144, 6);
  ctx.fillStyle = color;
  ctx.fillRect(x + 8, y + 22, Math.floor(144 * progress), 6);

  if (next) {
    ctx.fillStyle = 'rgba(232,220,200,0.5)';
    ctx.font = '9px monospace';
    ctx.fillText(`→ ${next.name}`, x + 90, y + 16);
  }
}
