import { CONFIG } from '../config.js';
import { playTruckHorn } from '../audio.js';

const OBSTACLE_TYPES = ['bor', 'kamen', 'kamion', 'dron'];
const TRASH_TYPES    = ['limenka_high', 'limenka_low', 'flasa_high', 'flasa_low', 'papir_high', 'papir_low'];

export function initSpawner(state, canvasW) {
  state.objects = [];
  state.nextSpawnX = state.world.scrollX + canvasW + 200;
  state.antiAbuseTimer = 0;
  state.antiAbuseDelay = 0;
}

export function updateSpawner(state, canvasW, dt) {
  // Move obstacles that have moveSpeed
  for (const obj of state.objects) {
    if (obj.moveSpeed) {
      obj.worldX += obj.moveSpeed * dt;
    }
  }

  // Ukloni objekte koji su izašli van ekrana levo
  state.objects = state.objects.filter(o => objScreenX(o, state.world.scrollX) + o.w > -50);

  // Spawn novi objekat kada scroll dostigne nextSpawnX
  const screenEdge = state.world.scrollX + canvasW;
  if (screenEdge >= state.nextSpawnX - state.antiAbuseDelay) {
    spawnObject(state, canvasW);
    const gap = CONFIG.SPAWN_MIN_GAP + Math.random() * (CONFIG.SPAWN_MAX_GAP - CONFIG.SPAWN_MIN_GAP);
    state.nextSpawnX = state.world.scrollX + canvasW + gap;
    state.antiAbuseDelay = 0;
  }
}

function spawnObject(state, canvasW) {
  const roll = Math.random();
  let kind, type;

  if (roll < CONFIG.TRASH_CHANCE) {
    type = 'collectible'; kind = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
  } else {
    type = 'obstacle'; kind = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  }

  const def = type === 'obstacle' ? CONFIG.OBSTACLES[kind] : CONFIG.COLLECTIBLES[kind];
  const worldX = state.world.scrollX + canvasW + 60;

  state.objects.push({
    type, kind, worldX,
    w: def.w, h: def.h,
    groundOffset: def.groundOffset,
    hitW: def.hitW || def.w,
    hitH: def.hitH || def.h,
    requireState: def.requireState || null,
    collected: false,
    moveSpeed: def.moveSpeed || 0
  });

  // Truck horn warning when kamion spawns
  if (kind === 'kamion') {
    playTruckHorn();
  }
}

// Vraca screen X od objekta
export function objScreenX(obj, scrollX) {
  return obj.worldX - scrollX;
}
