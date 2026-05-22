// spl-engine.js — core SPL physics: inverse-square law + log energy sum
import { GRID_W, GRID_H, CELL_SIZE_M } from '../config.js';

// Euclidean distance between two grid cells in meters
function dist(a, b) {
  const dx = (a.x - b.x) * CELL_SIZE_M;
  const dy = (a.y - b.y) * CELL_SIZE_M;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Compute SPL at a point from multiple sources.
 * Uses logarithmic energy sum (power addition) with:
 *  - Inverse-square distance rolloff: spl_at_d = spl_src - 20*log10(d)
 *  - Venue reflection (adds to SPL)
 *  - Wind factor (adds to SPL, directional approximation)
 */
function splAtPoint(sources, point, venueParams) {
  if (sources.length === 0) return 0;
  let totalPower = 0;
  const reflection = venueParams.reflection || 0;
  const windFactor = venueParams.windFactor || 0;
  for (const src of sources) {
    const d = Math.max(0.5, dist(src.pos, point));
    // Inverse square law: every doubling of distance = -6 dB
    const splAtD = src.db - 20 * Math.log10(d) + reflection + windFactor;
    totalPower += Math.pow(10, splAtD / 10);
  }
  if (totalPower <= 0) return 0;
  return 10 * Math.log10(totalPower);
}

/**
 * Map SPL at dance floor to happiness [0–100].
 * Optimal zone: 82–95 dB = peak happiness.
 * Too quiet < 75 dB = unhappy (dead floor).
 * Too loud > 100 dB = slight comfort reduction.
 */
export function happiness(splAtFloor) {
  if (splAtFloor < 70) return Math.max(0, (splAtFloor - 55) / 15 * 20); // 0–20% ramp up
  if (splAtFloor < 82) return 20 + (splAtFloor - 70) / 12 * 60;         // 20–80% ramp
  if (splAtFloor <= 95) return 80 + (splAtFloor - 82) / 13 * 20;         // 80–100% peak
  if (splAtFloor <= 105) return 100 - (splAtFloor - 95) / 10 * 25;       // 100–75% too hot
  return Math.max(0, 75 - (splAtFloor - 105) * 5);                        // drops fast >105
}

/**
 * Compute full 100×60 heatmap into state.heatmapBack, then swap buffers.
 * Called every tick from gameTick().
 */
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
      back[y * GRID_W + x] = splAtPoint(sources, { x, y }, venueParams);
    }
  }

  // Swap buffers so render reads stable data while we write
  const tmp = state.heatmap;
  state.heatmap = state.heatmapBack;
  state.heatmapBack = tmp;
}

/**
 * Get wind/reflection modifier from active dynamic events.
 */
function getCurrentWindFactor(state) {
  let wind = 0;
  if (state.currentVenue && state.currentVenue.windBase) {
    wind += state.currentVenue.windBase;
  }
  for (const ev of state.dynamicEvents) {
    if (ev.windBonus) wind += ev.windBonus;
    if (ev.reflectionBonus) wind += ev.reflectionBonus;
  }
  return wind;
}

/**
 * Compute neighbor SPL by averaging over a small radius around neighborPos.
 * Returns log-average (energy mean) of samples.
 */
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

  const radius = 3;
  let totalPower = 0;
  let count = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = neighborPos.x + dx;
      const ny = neighborPos.y + dy;
      if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
        const s = splAtPoint(sources, { x: nx, y: ny }, venueParams);
        totalPower += Math.pow(10, s / 10);
        count++;
      }
    }
  }

  if (count === 0 || totalPower <= 0) return 0;
  return 10 * Math.log10(totalPower / count);
}

/**
 * Get SPL averaged around a zone's position (for zone-level feedback).
 */
export function getZoneAverageSPL(state, zoneIndex) {
  const zone = state.zones[zoneIndex];
  if (!zone) return 0;

  // All sources including self
  const sources = state.zones
    .filter((z, i) => !z.isNeighbor)
    .map(z => ({ pos: z.pos, db: z.db }));

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
  if (count === 0 || totalPower <= 0) return 0;
  return 10 * Math.log10(totalPower / count);
}

/**
 * Compute average dance-floor happiness from heatmap.
 * Samples cells away from the neighbor corner.
 * Returns 0–100.
 */
export function computeAverageHappiness(state) {
  const venue = state.currentVenue;
  if (!venue) return 0;
  const hm = state.heatmap;
  const neighborPos = venue.neighborPos;

  let totalH = 0;
  let count = 0;

  // Sample the dance floor interior (avoid edge cells and neighbor area)
  for (let y = 6; y < GRID_H - 6; y++) {
    for (let x = 6; x < GRID_W - 6; x++) {
      const dxN = x - neighborPos.x;
      const dyN = y - neighborPos.y;
      const distToNeighbor = Math.sqrt(dxN * dxN + dyN * dyN);
      if (distToNeighbor < 12) continue; // exclude cells near neighbor
      const spl = hm[y * GRID_W + x];
      totalH += happiness(spl);
      count++;
    }
  }
  if (count === 0) return 0;
  return totalH / count;
}

/**
 * Check if a given dB reading is safe relative to venue neighbor limit.
 */
export function isSafeForNeighbor(spl, venueLimit) {
  return spl < (venueLimit || 70);
}

/**
 * Estimate SPL reach in meters for a given source dB and target floor SPL.
 * Useful for UI feedback ("this zone reaches Xm").
 */
export function estimateReach(sourceDb, targetSpl) {
  // d = 10^((sourceDb - targetSpl) / 20)
  return Math.pow(10, (sourceDb - targetSpl) / 20);
}
