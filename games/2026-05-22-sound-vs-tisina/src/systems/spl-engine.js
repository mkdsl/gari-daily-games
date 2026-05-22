// spl-engine.js — core SPL physics
import { GRID_W, GRID_H, CELL_SIZE_M } from '../config.js';

function dist(a, b) {
  const dx = (a.x - b.x) * CELL_SIZE_M;
  const dy = (a.y - b.y) * CELL_SIZE_M;
  return Math.sqrt(dx * dx + dy * dy);
}

// Logarithmic sum of sound pressure from multiple sources at a point
function splAtPoint(sources, point, venueParams) {
  let totalPower = 0;
  const reflection = venueParams.reflection || 0;
  const windFactor = venueParams.windFactor || 0;
  for (const src of sources) {
    const d = Math.max(1, dist(src.pos, point));
    const spl = src.db - 20 * Math.log10(d) + reflection - windFactor;
    totalPower += Math.pow(10, spl / 10);
  }
  if (totalPower <= 0) return 0;
  return 10 * Math.log10(totalPower);
}

// Compute happiness [0–100] from SPL at dance floor
export function happiness(splAtFloor) {
  return Math.min(100, Math.max(0, (splAtFloor - 75) / 15 * 100));
}

// Compute full heatmap into state.heatmapBack, then swap buffers
export function computeHeatmap(state) {
  const venue = state.currentVenue;
  if (!venue) return;

  const sources = state.zones
    .filter(z => !z.isNeighbor)
    .map(z => ({ pos: z.pos, db: z.db }));

  const venueParams = {
    reflection: venue.reflection || 0,
    windFactor: getCurrentWindFactor(state)
  };

  const back = state.heatmapBack;
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const idx = y * GRID_W + x;
      back[idx] = splAtPoint(sources, { x, y }, venueParams);
    }
  }

  // Swap buffers
  const tmp = state.heatmap;
  state.heatmap = state.heatmapBack;
  state.heatmapBack = tmp;
}

function getCurrentWindFactor(state) {
  let wind = 0;
  if (state.currentVenue && state.currentVenue.windBase) {
    wind += state.currentVenue.windBase;
  }
  for (const ev of state.dynamicEvents) {
    if (ev.windBonus) wind += ev.windBonus;
    if (ev.reflectionBonus) wind -= ev.reflectionBonus; // negative = reduction in effective db
  }
  return wind;
}

export function getNeighborSPL(state) {
  const venue = state.currentVenue;
  if (!venue) return 0;

  const neighborPos = venue.neighborPos;
  const sources = state.zones
    .filter(z => !z.isNeighbor)
    .map(z => ({ pos: z.pos, db: z.db }));

  const venueParams = {
    reflection: venue.reflection || 0,
    windFactor: getCurrentWindFactor(state)
  };

  // Average over a small radius around neighbor
  const radius = 2;
  let samples = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = neighborPos.x + dx;
      const ny = neighborPos.y + dy;
      if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
        samples.push(splAtPoint(sources, { x: nx, y: ny }, venueParams));
      }
    }
  }

  if (samples.length === 0) return 0;
  // Log-average (energy average)
  let totalPower = 0;
  for (const s of samples) totalPower += Math.pow(10, s / 10);
  return 10 * Math.log10(totalPower / samples.length);
}

export function getZoneAverageSPL(state, zoneIndex) {
  const zone = state.zones[zoneIndex];
  if (!zone) return 0;

  const sources = state.zones
    .filter((z, i) => !z.isNeighbor && i !== zoneIndex)
    .map(z => ({ pos: z.pos, db: z.db }));

  // Also include the zone itself as a source
  sources.push({ pos: zone.pos, db: zone.db });

  const venue = state.currentVenue;
  const venueParams = {
    reflection: venue ? venue.reflection || 0 : 0,
    windFactor: getCurrentWindFactor(state)
  };

  const radius = 5;
  let totalPower = 0;
  let count = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const px = zone.pos.x + dx;
      const py = zone.pos.y + dy;
      if (px >= 0 && px < GRID_W && py >= 0 && py < GRID_H) {
        totalPower += Math.pow(10, splAtPoint(sources, { x: px, y: py }, venueParams) / 10);
        count++;
      }
    }
  }
  if (count === 0) return 0;
  return 10 * Math.log10(totalPower / count);
}

// Compute average happiness across dance floor cells (non-neighbor cells)
export function computeAverageHappiness(state) {
  const venue = state.currentVenue;
  if (!venue) return 0;
  const hm = state.heatmap;
  // Sample dance floor area (center region, excluding edges near neighbor)
  const neighborPos = venue.neighborPos;
  let totalH = 0;
  let count = 0;
  for (let y = 5; y < GRID_H - 5; y++) {
    for (let x = 5; x < GRID_W - 5; x++) {
      const dxN = x - neighborPos.x;
      const dyN = y - neighborPos.y;
      const distToNeighbor = Math.sqrt(dxN * dxN + dyN * dyN);
      if (distToNeighbor < 10) continue; // skip cells near neighbor
      const spl = hm[y * GRID_W + x];
      totalH += happiness(spl);
      count++;
    }
  }
  if (count === 0) return 0;
  return totalH / count;
}
