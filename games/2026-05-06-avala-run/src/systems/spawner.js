import { CONFIG } from '../config.js';

const OBSTACLE_TYPES = ['bor', 'kamen', 'kamion', 'dron'];
const TRASH_TYPES    = ['limenka_high', 'limenka_low', 'flasa_high', 'flasa_low', 'papir_high', 'papir_low'];

export function initSpawner(state, canvasW) {
  state.objects = [];
  state.nextSpawnX = state.world.scrollX + canvasW + 200;
  state.antiAbuseTimer = 0;
  state.antiAbuseDelay = 0;
}

export function updateSpawner(state, canvasW) {
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

  if (roll < CONFIG.CARD_CHANCE) {
    type = 'collectible'; kind = 'karta';
  } else if (roll < CONFIG.CARD_CHANCE + CONFIG.TRASH_CHANCE) {
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
    collected: false
  });
}

// Vraca screen X od objekta
export function objScreenX(obj, scrollX) {
  return obj.worldX - scrollX;
}
