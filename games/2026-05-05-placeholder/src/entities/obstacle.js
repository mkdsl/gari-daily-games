/**
 * obstacle.js — Obstacle pool za Bespuće
 * 4 tipa: WALL_SPIKE, FLOAT_BLOCK, MOVING_GATE, DIAGONAL_BAR.
 * Eksportuje: ObstacleType, createObstacle, updateObstacles, scrollObstacles, spawnObstaclesForChunk
 */
import { CONFIG } from '../config.js';

/** @enum {string} */
export const ObstacleType = {
  WALL_SPIKE:    'A',
  FLOAT_BLOCK:   'B',
  MOVING_GATE:   'C',
  DIAGONAL_BAR:  'D',
};

/**
 * Kreira obstacle objekat datog tipa.
 * @param {string} type       - ObstacleType vrednost
 * @param {number} x          - World X (leva ivica AABB)
 * @param {number} y          - Canvas Y (gornja ivica AABB)
 * @param {object} [params]   - Extra params (w, h, gateY, gateSpeed, angle, ...)
 * @returns {object}
 */
export function createObstacle(type, x, y, params = {}) {
  const base = { type, x, y, w: params.w || 40, h: params.h || 40 };

  if (type === ObstacleType.MOVING_GATE) {
    return {
      ...base,
      gateY:     params.gateY     || y,
      gateSpeed: params.gateSpeed || 80,
      gateDir:   1,
      gateMinY:  params.gateMinY  || (y - 80),
      gateMaxY:  params.gateMaxY  || (y + 80),
    };
  }

  if (type === ObstacleType.DIAGONAL_BAR) {
    return {
      ...base,
      angle: params.angle || (Math.PI / 6), // ~30°
    };
  }

  return base;
}

/**
 * Ažuriraj sve aktivne prepreke za jedan frame (animacija MOVING_GATE).
 * @param {object[]} obstacles
 * @param {number} dt  - Delta time u sekundama
 */
export function updateObstacles(obstacles, dt) {
  for (const obs of obstacles) {
    if (obs.type === ObstacleType.MOVING_GATE) {
      obs.gateY += obs.gateSpeed * obs.gateDir * dt;
      if (obs.gateY >= obs.gateMaxY) {
        obs.gateY = obs.gateMaxY;
        obs.gateDir = -1;
      } else if (obs.gateY <= obs.gateMinY) {
        obs.gateY = obs.gateMinY;
        obs.gateDir = 1;
      }
      // Keep AABB synced with gateY (gate center → y is top of gate block)
      obs.y = obs.gateY - obs.h / 2;
    }
  }
}

/**
 * Pomeri sve prepreke ulevo za scrollSpeed * dt.
 * @param {object[]} obstacles
 * @param {number} scrollSpeed  - px/s
 * @param {number} dt
 */
export function scrollObstacles(obstacles, scrollSpeed, dt) {
  for (const obs of obstacles) {
    obs.x -= scrollSpeed * dt;
    if (obs.type === ObstacleType.MOVING_GATE) {
      // gateY is independent of scroll — no adjustment needed
    }
  }
}

/**
 * Generiši prepreke za dati chunk i dodaj ih u chunk.obstacles i run.obstacles.
 * Poziva se iz chunks.js pri generisanju novog chunk-a.
 * @param {object}   chunk       - Chunk objekat (worldX, width, samples, obstacles)
 * @param {number}   difficulty  - 0.0–1.0
 * @param {number}   canvasH     - Visina canvasa u px
 * @param {object[]} runObstacles - run.obstacles flat array za direktno dodavanje
 */
export function spawnObstaclesForChunk(chunk, difficulty, canvasH, runObstacles) {
  // Koliko prepreka po chunk-u raste s tezinom (0→1, max 3)
  const count = Math.floor(difficulty * 2) + 1; // 1 na startu, do 3

  // Tipovi dostupni po difficulty
  const availableTypes = [ObstacleType.WALL_SPIKE];
  if (difficulty >= 0.3) availableTypes.push(ObstacleType.FLOAT_BLOCK);
  if (difficulty >= 0.6) availableTypes.push(ObstacleType.MOVING_GATE);
  if (difficulty >= 0.9) availableTypes.push(ObstacleType.DIAGONAL_BAR);

  // Rasporedi prepreke po lokalnim X pozicijama (podeli chunk na zone)
  const zoneWidth = chunk.width / (count + 1);

  let placed = 0;
  for (let i = 0; i < count; i++) {
    const localX = zoneWidth * (i + 1) + (Math.random() - 0.5) * zoneWidth * 0.5;
    const worldX = chunk.worldX + localX;

    // Interpoliraj zidove na ovoj poziciji da znamo koridor
    const wallY = _sampleWallAt(chunk, localX);
    if (!wallY) continue;

    const corridorTop    = wallY.topY;
    const corridorBottom = wallY.bottomY;
    const corridorH      = corridorBottom - corridorTop;

    // Minimalni slobodan prolaz 80px — ako je hodnik preuzak, preskoči
    if (corridorH < 90) continue;

    // Odabir tipa
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    let obs = null;

    if (type === ObstacleType.WALL_SPIKE) {
      // Bodlja iz gornjeg ili donjeg zida
      const fromTop = Math.random() < 0.5;
      const w = 24 + Math.random() * 16;      // 24–40px
      const h = 30 + Math.random() * 30;      // 30–60px
      const obsY = fromTop ? corridorTop : corridorBottom - h;
      obs = createObstacle(type, worldX - w / 2, obsY, { w, h });
    } else if (type === ObstacleType.FLOAT_BLOCK) {
      // Blok u sredini hodnika
      const w = 30 + Math.random() * 20;
      const h = 20 + Math.random() * 20;
      const midY = (corridorTop + corridorBottom) / 2;
      const obsY = midY - h / 2 + (Math.random() - 0.5) * (corridorH * 0.3);
      obs = createObstacle(type, worldX - w / 2, obsY, { w, h });
    } else if (type === ObstacleType.MOVING_GATE) {
      // Horizontalni blok koji se kreće gore-dole
      const w = 20 + Math.random() * 16;
      const h = corridorH * 0.35; // blokira ~35% hodnika
      const midY = (corridorTop + corridorBottom) / 2;
      const travel = (corridorH - h - 80) / 2; // ostavi 80px prolaz
      const gateMinY = corridorTop + travel * 0.1;
      const gateMaxY = corridorBottom - h - travel * 0.1;
      const gateY    = midY - h / 2;
      const gateSpeed = 60 + difficulty * 60; // 60–120 px/s
      obs = createObstacle(type, worldX - w / 2, gateY, {
        w, h,
        gateY, gateSpeed,
        gateMinY, gateMaxY,
      });
    } else if (type === ObstacleType.DIAGONAL_BAR) {
      // Dijagonalna traka
      const w = 80 + Math.random() * 40;
      const h = 14 + Math.random() * 8;
      const midY = (corridorTop + corridorBottom) / 2;
      const obsY = midY - h / 2 + (Math.random() - 0.5) * (corridorH * 0.25);
      const angle = (Math.PI / 6) * (Math.random() < 0.5 ? 1 : -1); // ±30°
      obs = createObstacle(type, worldX - w / 2, obsY, { w, h, angle });
    }

    if (obs) {
      chunk.obstacles.push(obs);
      runObstacles.push(obs);
      placed++;

      // Hard stop: ne stavljaj treću prepreku ako nema dovoljno slobodnog prolaza
      if (placed >= 2 && corridorH < 180) break;
    }
  }
}

/**
 * Interni helper: uzorkuj zidove na localX unutar chunka.
 * @param {object} chunk
 * @param {number} localX
 * @returns {{topY: number, bottomY: number}|null}
 */
function _sampleWallAt(chunk, localX) {
  if (!chunk.samples || chunk.samples.length === 0) return null;
  // Nađi susedne uzorke i interpoliraj
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
  // Vrati poslednji ako je van opsega
  const last = chunk.samples[chunk.samples.length - 1];
  return { topY: last.topY, bottomY: last.bottomY };
}
