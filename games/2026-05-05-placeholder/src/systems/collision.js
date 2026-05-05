/**
 * collision.js — Collision detection za Bespuće
 * circleAABB: player krug vs obstacle AABB → smrt.
 * Zid collision: player krug vs gornji/donji zid chunk-a → smrt.
 * Pickup collect: player radius vs pickup radius → skupljanje.
 * Checkpoint trigger: player prođe X granicu markera → CHECKPOINT_SELECT.
 * Eksportuje: checkCollisions, circleAABB, getWallAtX
 */
import { CONFIG } from '../config.js';
import { spawnExplosion } from '../entities/player.js';

/**
 * Detekcija kruga i osi-poravnatog pravougaonika (AABB).
 * @param {number} cx  - Centar kruga X
 * @param {number} cy  - Centar kruga Y
 * @param {number} cr  - Poluprecnik kruga
 * @param {number} rx  - AABB lijevo X
 * @param {number} ry  - AABB gore Y
 * @param {number} rw  - AABB širina
 * @param {number} rh  - AABB visina
 * @returns {boolean}
 */
export function circleAABB(cx, cy, cr, rx, ry, rw, rh) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < cr * cr;
}

/**
 * Interpoliraj zidove na datoj X poziciji iz chunk queue.
 * @param {object[]} chunks  - run.chunks
 * @param {number}   x       - Canvas X pozicija
 * @returns {{topY: number, bottomY: number}|null}
 */
export function getWallAtX(chunks, x) {
  for (const chunk of chunks) {
    if (x >= chunk.worldX && x <= chunk.worldX + chunk.width) {
      const localX = x - chunk.worldX;
      return _sampleChunkWall(chunk, localX);
    }
  }
  return null;
}

/**
 * Provjeri sve kolizije za ovaj frame i ažuriraj run state.
 * @param {object} run    - Run state (player, chunks, obstacles, pickups, particles)
 * @param {object} state  - Cijeli state (za promenu screen-a i meta)
 */
export function checkCollisions(run, state) {
  const p = run.player;
  if (!p || !p.alive) return;

  const effectiveR = p.powerups.narrowHitbox > 0
    ? Math.max(4, p.radius - 4)
    : p.radius;

  // ── 1. Zid collision ─────────────────────────────────────────────────────
  const wallY = getWallAtX(run.chunks, p.x);
  if (wallY) {
    if (p.y - effectiveR < wallY.topY || p.y + effectiveR > wallY.bottomY) {
      _killPlayer(run, state);
      return;
    }
  }

  // ── 2. Obstacle collision ────────────────────────────────────────────────
  for (const obs of run.obstacles) {
    // GHOST_PASS: preskači FLOAT_BLOCK tip
    if (p.powerups.ghostPass > 0 && obs.type === 'B') continue;

    if (circleAABB(p.x, p.y, effectiveR, obs.x, obs.y, obs.w, obs.h)) {
      if (run.shieldsLeft > 0) {
        run.shieldsLeft--;
        p.shieldAura = 0.5; // 0.5s vizuelna aura
        return;
      }
      _killPlayer(run, state);
      return;
    }
  }

  // ── 3. Crystal pickup ────────────────────────────────────────────────────
  const collectR2 = CONFIG.PICKUP_COLLECT_RADIUS * CONFIG.PICKUP_COLLECT_RADIUS;
  for (const pu of run.pickups) {
    if (pu.type !== 'CRYSTAL' || pu.collected) continue;
    const dx = p.x - pu.x;
    const dy = p.y - pu.y;
    if (dx * dx + dy * dy < collectR2) {
      pu.collected = true;
      run.crystals++;
      state.meta.totalCrystals++;
    }
  }
}

// ─── Internali ───────────────────────────────────────────────────────────────

/**
 * Ubij igrača: generiši eksploziju, sačuvaj rekord, prebaci na DEAD ekran.
 * @param {object} run
 * @param {object} state
 */
function _killPlayer(run, state) {
  const p = run.player;
  p.alive = false;

  // Eksplozija čestica
  const newParticles = spawnExplosion(p);
  run.particles.push(...newParticles);

  // Sačuvaj rekord ako je bolji
  if (run.score > state.meta.bestScore) {
    state.meta.bestScore    = run.score;
    state.meta.bestDistance = run.distance;
    state.meta.recordRunY   = [...p.recordYSamples];
  }

  // Prebaci ekran
  state.screen = 'DEAD';
}

/**
 * Interni helper: uzorkuj zidove na localX unutar chunka.
 * @param {object} chunk
 * @param {number} localX
 * @returns {{topY: number, bottomY: number}|null}
 */
function _sampleChunkWall(chunk, localX) {
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
