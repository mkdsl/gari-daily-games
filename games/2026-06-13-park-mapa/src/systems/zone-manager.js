/**
 * zone-manager.js — Zone lifecycle, check-in logic, upgrade, rect helpers
 * Park Mapa | Jova jQuery
 *
 * Zone lifecycle (state machine):
 *   idle → hover → activating → active → cooldown
 *
 * "UI states" are ephemeral (in-memory, not persisted).
 * "Zone data" lives in state.zones[zoneId] and IS persisted.
 */

import { CONFIG } from '../config.js';
import { earnPT, spendPT } from './economy.js';

// ─── Zone UI state constants ───────────────────────────────────────────────────
export const ZONE_STATE = {
  IDLE:       'idle',
  HOVER:      'hover',
  ACTIVATING: 'activating',
  ACTIVE:     'active',
  COOLDOWN:   'cooldown',
};

// ─── In-memory UI state (not persisted across sessions) ────────────────────────
/** @type {Object.<string, string>} */
let zoneUIStates = {};

/**
 * Initialise (or re-initialise) the ephemeral UI state map.
 * Call once on app boot and whenever the zone list changes.
 */
export function initZoneUIStates() {
  zoneUIStates = {};
  for (const zoneId of CONFIG.ACTIVE_ZONES) {
    zoneUIStates[zoneId] = ZONE_STATE.IDLE;
  }
  for (const zoneId of CONFIG.LOCKED_ZONES) {
    zoneUIStates[zoneId] = ZONE_STATE.IDLE;
  }
}

/**
 * Get the current ephemeral UI state for a zone.
 * @param {string} zoneId
 * @returns {string}  One of ZONE_STATE.*
 */
export function getZoneUIState(zoneId) {
  return zoneUIStates[zoneId] ?? ZONE_STATE.IDLE;
}

/**
 * Set the ephemeral UI state for a zone.
 * @param {string} zoneId
 * @param {string} uiState  One of ZONE_STATE.*
 */
export function setZoneUIState(zoneId, uiState) {
  zoneUIStates[zoneId] = uiState;
}

// ─── Cooldown helpers ──────────────────────────────────────────────────────────

/**
 * Returns true if the zone is eligible for check-in right now.
 * A zone with no previous check-in is always eligible.
 * @param {Object} state
 * @param {string} zoneId
 * @returns {boolean}
 */
export function canCheckIn(state, zoneId) {
  const zone = state.zones?.[zoneId];
  if (!zone) return false;
  if (!zone.lastCheckin) return true;
  return (Date.now() - zone.lastCheckin) >= CONFIG.CHECKIN_COOLDOWN_MS;
}

/**
 * Returns milliseconds remaining on the check-in cooldown.
 * Returns 0 if the zone is available now.
 * @param {Object} state
 * @param {string} zoneId
 * @returns {number}
 */
export function getZoneCooldownRemaining(state, zoneId) {
  const zone = state.zones?.[zoneId];
  if (!zone || !zone.lastCheckin) return 0;
  const elapsed = Date.now() - zone.lastCheckin;
  return Math.max(0, CONFIG.CHECKIN_COOLDOWN_MS - elapsed);
}

/**
 * Format a cooldown duration in milliseconds as a human-readable string.
 * Examples: "4h 32m", "55m", "0m"
 * @param {number} ms
 * @returns {string}
 */
export function formatCooldownRemaining(ms) {
  if (ms <= 0) return '0m';
  const totalMinutes = Math.ceil(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Check-in ──────────────────────────────────────────────────────────────────

/**
 * Perform a zone check-in.
 * - Records lastCheckin timestamp
 * - Awards PT (standard or daily-light bonus)
 * - Advances storiesUnlocked counter (up to STORIES_PER_ZONE)
 * - Increments internal zone XP
 * - Emits 'zoneCheckin' event
 *
 * Returns null if check-in is on cooldown.
 *
 * @param {Object} state
 * @param {string} zoneId
 * @param {string|null} dailyLightZone  Zone ID currently designated as Daily Light, or null
 * @param {((event:string, data:any) => void)|null} emit
 * @returns {{ ptReward: number, isDailyLight: boolean, storiesUnlocked: number }|null}
 */
export function checkInZone(state, zoneId, dailyLightZone, emit) {
  if (!canCheckIn(state, zoneId)) return null;

  const zone = state.zones[zoneId];
  zone.lastCheckin = Date.now();

  const isDailyLight = zoneId === dailyLightZone;
  const ptReward = isDailyLight
    ? CONFIG.PT_REWARDS.ZONE_CHECKIN_DAILY_LIGHT
    : CONFIG.PT_REWARDS.ZONE_CHECKIN;

  earnPT(state, ptReward, `checkin_${zoneId}`);

  // Unlock next story (sequential, capped at STORIES_PER_ZONE)
  const storyCap = CONFIG.STORIES_PER_ZONE ?? 5;
  if ((zone.storiesUnlocked ?? 0) < storyCap) {
    zone.storiesUnlocked = (zone.storiesUnlocked ?? 0) + 1;
  }

  // Internal XP counter (not shown to user, used for visual tier decisions)
  zone.xp = (zone.xp ?? 0) + 10;

  const result = {
    ptReward,
    isDailyLight,
    storiesUnlocked: zone.storiesUnlocked,
  };

  if (emit) {
    emit('zoneCheckin', { zoneId, ...result });
  }

  return result;
}

// ─── Zone upgrade ──────────────────────────────────────────────────────────────

/**
 * Attempt to upgrade a zone to the next level.
 * Costs PT according to CONFIG.ZONE_LEVEL_COSTS.
 * Returns false if already max level or insufficient PT.
 *
 * @param {Object} state
 * @param {string} zoneId
 * @param {((event:string, data:any) => void)|null} emit
 * @returns {boolean}  true if upgrade succeeded
 */
export function upgradeZone(state, zoneId, emit) {
  const zone = state.zones?.[zoneId];
  if (!zone) return false;

  const costs = CONFIG.ZONE_LEVEL_COSTS;
  const maxLevel = (CONFIG.ZONE_MAX_LEVEL ?? 5);
  if (zone.level >= maxLevel) return false;

  // ZONE_LEVEL_COSTS[0] = cost to go from level 1→2, index = current level - 1
  const costIndex = zone.level - 1;
  if (costIndex >= costs.length) return false;

  const cost = costs[costIndex];
  if (!spendPT(state, cost)) return false;

  zone.level++;

  if (emit) {
    emit('zoneUpgraded', { zoneId, newLevel: zone.level, cost });
  }

  return true;
}

// ─── Grid geometry helpers ─────────────────────────────────────────────────────

/**
 * Compute the pixel rectangle for a zone tile on the canvas.
 * The grid is centered horizontally, with a slight vertical offset for the header.
 *
 * @param {string} zoneId
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {{ x:number, y:number, w:number, h:number }|null}
 */
export function getZoneRect(zoneId, canvasW, canvasH) {
  const pos = CONFIG.ZONE_GRID_POSITIONS?.[zoneId];
  if (!pos) return null;

  const tileW  = CONFIG.ZONE_TILE_W;
  const tileH  = CONFIG.ZONE_TILE_H;
  const padX   = CONFIG.GRID_PAD_X;
  const padY   = CONFIG.GRID_PAD_Y;
  const cols   = CONFIG.GRID_COLS;
  const rows   = CONFIG.GRID_ROWS;

  const totalW = cols * tileW + (cols - 1) * padX;
  const totalH = rows * tileH + (rows - 1) * padY;

  // Centre grid on canvas, shift down 30px to leave room for top HUD
  const startX = Math.round((canvasW - totalW) / 2);
  const startY = Math.round((canvasH - totalH) / 2) + 30;

  return {
    x: startX + pos.col * (tileW + padX),
    y: startY + pos.row * (tileH + padY),
    w: tileW,
    h: tileH,
  };
}

/**
 * Returns a map of zoneId → rect for every zone (active + locked).
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {Object.<string, {x:number,y:number,w:number,h:number}>}
 */
export function getAllZoneRects(canvasW, canvasH) {
  const rects = {};
  const allZones = [...CONFIG.ACTIVE_ZONES, ...CONFIG.LOCKED_ZONES];
  for (const z of allZones) {
    const r = getZoneRect(z, canvasW, canvasH);
    if (r) rects[z] = r;
  }
  return rects;
}

/**
 * Returns the zoneId of the zone tile that contains (x, y), or null.
 * Hit-tests active zones first, then locked zones.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {string|null}
 */
export function getZoneAtPoint(x, y, canvasW, canvasH) {
  const allZones = [...CONFIG.ACTIVE_ZONES, ...CONFIG.LOCKED_ZONES];
  for (const z of allZones) {
    const rect = getZoneRect(z, canvasW, canvasH);
    if (!rect) continue;
    if (x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h) {
      return z;
    }
  }
  return null;
}

/**
 * Returns true if the zone is in CONFIG.ACTIVE_ZONES (i.e., not locked).
 * @param {string} zoneId
 * @returns {boolean}
 */
export function isActiveZone(zoneId) {
  return CONFIG.ACTIVE_ZONES.includes(zoneId);
}

/**
 * Returns true if the zone is locked (present in LOCKED_ZONES).
 * @param {string} zoneId
 * @returns {boolean}
 */
export function isLockedZone(zoneId) {
  return CONFIG.LOCKED_ZONES.includes(zoneId);
}

/**
 * Build the initial zone data structure for a single zone.
 * Used by state.js when creating a new game state.
 *
 * @param {string} zoneId
 * @returns {{ level:number, xp:number, lastCheckin:number|null, storiesUnlocked:number }}
 */
export function createZoneData(zoneId) {
  return {
    level: 1,
    xp: 0,
    lastCheckin: null,
    storiesUnlocked: 0,
  };
}

/**
 * Build the full initial zones map for all zones.
 * @returns {Object.<string, ReturnType<typeof createZoneData>>}
 */
export function createAllZonesData() {
  const zones = {};
  for (const z of [...CONFIG.ACTIVE_ZONES, ...CONFIG.LOCKED_ZONES]) {
    zones[z] = createZoneData(z);
  }
  return zones;
}
