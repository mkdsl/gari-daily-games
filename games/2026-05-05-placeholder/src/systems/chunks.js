/**
 * chunks.js — Chunk generator za Bespuće
 * Proceduralni zidovi (gore/dole), queue od 5 chunk-ova, recycle.
 * Tezina (difficulty) raste linearno s pređenom distancom.
 * Svaki chunk sadrži: zidove, listu obstacles za spawn, listu pickups za spawn.
 * Eksportuje: initChunks, updateChunks, generateChunk, spawnCrystalsForChunk
 */
import { CONFIG } from '../config.js';
import { spawnObstaclesForChunk } from '../entities/obstacle.js';
import { createCrystal } from '../entities/pickup.js';

/**
 * Lerp helper.
 * @param {number} a
 * @param {number} b
 * @param {number} t  - 0.0–1.0
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp helper.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Generiši jedan novi chunk za dati difficulty nivo.
 * @param {number} startWorldX   - X pozicija levog ruba novog chunk-a u scroll prostoru
 * @param {number} difficulty    - 0.0–1.0, raste s distancom
 * @param {number} canvasH       - Visina canvasa u px
 * @param {number} nextCheckpointIn - Preostala distanca do sledećeg checkpointu
 * @returns {object}             Chunk objekat s wall podacima i spawn listama
 */
export function generateChunk(startWorldX, difficulty, canvasH, nextCheckpointIn) {
  const centerY   = canvasH / 2;
  const halfWidth = lerp(CONFIG.CORRIDOR_START_HEIGHT / 2, CONFIG.CORRIDOR_MIN_HEIGHT / 2, difficulty);
  const amplitude = lerp(50, 120, difficulty);
  const freq      = lerp(0.003, 0.008, difficulty);

  // Random phase offset so chunks don't repeat
  const phase = Math.random() * Math.PI * 2;

  const samples = [];
  for (let localX = 0; localX <= CONFIG.CHUNK_WIDTH; localX += 30) {
    let topY    = centerY - halfWidth + Math.sin(localX * freq + phase) * amplitude;
    let bottomY = centerY + halfWidth + Math.cos(localX * freq + phase) * amplitude;

    // Guard: ensure minimum corridor height
    const gap = bottomY - topY;
    if (gap < CONFIG.CORRIDOR_MIN_HEIGHT) {
      const mid    = (topY + bottomY) / 2;
      topY    = mid - CONFIG.CORRIDOR_MIN_HEIGHT / 2;
      bottomY = mid + CONFIG.CORRIDOR_MIN_HEIGHT / 2;
    }

    // Guard: keep walls inside canvas (10px margin)
    topY    = clamp(topY, 10, canvasH - CONFIG.CORRIDOR_MIN_HEIGHT - 10);
    bottomY = clamp(bottomY, topY + CONFIG.CORRIDOR_MIN_HEIGHT, canvasH - 10);

    samples.push({ localX, topY, bottomY });
  }

  // Determine if checkpoint falls inside this chunk
  let checkpointLocalX = -1;
  if (nextCheckpointIn >= 0 && nextCheckpointIn <= CONFIG.CHUNK_WIDTH) {
    checkpointLocalX = nextCheckpointIn;
  }

  // Crystal positions: 1–2 per chunk, safely inside corridor, not too close to walls
  const crystalPositions = [];
  const crystalCount = Math.random() < 0.5 ? 1 : 2;
  const WALL_MARGIN = 40;

  for (let c = 0; c < crystalCount; c++) {
    // Space crystals across chunk
    const localX = 80 + Math.random() * (CONFIG.CHUNK_WIDTH - 160);
    const wallY  = _sampleWallAt({ samples }, localX);
    if (!wallY) continue;
    const minY = wallY.topY + WALL_MARGIN;
    const maxY = wallY.bottomY - WALL_MARGIN;
    if (maxY <= minY) continue;
    const y = minY + Math.random() * (maxY - minY);
    crystalPositions.push({ localX, y });
  }

  return {
    worldX:           startWorldX,
    width:            CONFIG.CHUNK_WIDTH,
    samples,
    obstacles:        [],
    checkpointLocalX,
    crystalPositions,
  };
}

/**
 * Spawnuj kristale za dati chunk i dodaj ih u pickups array.
 * @param {object}   chunk
 * @param {object[]} pickups  - run.pickups
 */
export function spawnCrystalsForChunk(chunk, pickups) {
  for (const pos of chunk.crystalPositions) {
    const worldX = chunk.worldX + pos.localX;
    pickups.push(createCrystal(worldX, pos.y));
  }
}

/**
 * Inicijalizuj chunk queue sa startnim chunk-ovima.
 * @param {object} run - Run state (popunjava run.chunks, run.obstacles, run.pickups)
 */
export function initChunks(run) {
  const canvasH = window.innerHeight;
  run.chunks  = [];
  run.obstacles = [];
  run.pickups   = [];

  let wx = 0;
  for (let i = 0; i < CONFIG.CHUNK_QUEUE_SIZE + 1; i++) {
    const chunk = generateChunk(wx, 0, canvasH, 99999);
    run.chunks.push(chunk);
    wx += CONFIG.CHUNK_WIDTH;
  }

  // Seed crystals from all initial chunks
  for (const chunk of run.chunks) {
    spawnCrystalsForChunk(chunk, run.pickups);
  }

  // Initialize scroll speed
  run.scrollSpeed = CONFIG.SCROLL_SPEED_BASE;
}

/**
 * Ažuriraj chunk queue: pomeri zidove, reciklej prošle chunk-ove, generiši nove.
 * @param {object} run
 * @param {number} scrollSpeed  - px/s
 * @param {number} dt
 */
export function updateChunks(run, scrollSpeed, dt) {
  const canvasH = window.innerHeight;

  // Pomeri sve chunk-ove ulevo
  for (const chunk of run.chunks) {
    chunk.worldX -= scrollSpeed * dt;
    // Ažuriraj worldX kristala (kristali se skroluju u pickup.js, ali chunk referenca se ažurira ovde)
  }

  // Recikliraj chunk-ove koji su izašli van ekrana
  while (run.chunks.length > 0 && run.chunks[0].worldX + run.chunks[0].width < 0) {
    run.chunks.shift();

    // Generiši novi chunk na kraju
    const last       = run.chunks[run.chunks.length - 1];
    const newWorldX  = last.worldX + last.width;
    const difficulty = clamp(run.distance / 3000, 0, 1);

    // Koliko distanca do sledećeg checkpointa iz ugla novog chunka
    const nextCpIn = run.nextCheckpoint - run.distance;

    const newChunk = generateChunk(newWorldX, difficulty, canvasH, nextCpIn);
    run.chunks.push(newChunk);

    // Spawn prepreka za novi chunk
    spawnObstaclesForChunk(newChunk, difficulty, canvasH, run.obstacles);

    // Spawn kristala za novi chunk
    spawnCrystalsForChunk(newChunk, run.pickups);
  }
}

// ─── Interni helper ──────────────────────────────────────────────────────────

/**
 * Uzorkuj zidove na localX unutar chunka (linearna interpolacija).
 * @param {object} chunk
 * @param {number} localX
 * @returns {{topY: number, bottomY: number}|null}
 */
function _sampleWallAt(chunk, localX) {
  if (!chunk.samples || chunk.samples.length === 0) return null;

  for (let i = 0; i < chunk.samples.length - 1; i++) {
    const a = chunk.samples[i];
    const b = chunk.samples[i + 1];
    if (localX >= a.localX && localX <= b.localX) {
      const t = (localX - a.localX) / (b.localX - a.localX);
      return {
        topY:    a.topY    + (b.topY    - a.topY)    * t,
        bottomY: a.bottomY + (b.bottomY - a.bottomY) * t,
      };
    }
  }

  const last = chunk.samples[chunk.samples.length - 1];
  return { topY: last.topY, bottomY: last.bottomY };
}
