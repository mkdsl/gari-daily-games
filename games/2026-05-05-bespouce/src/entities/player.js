/**
 * player.js — Player entity za Bespuće
 * State igrača: pozicija, brzina, hitbox (krug), power-up efekti.
 * Eksplozija čestica pri smrti. Ghost Record Line Y tracking.
 * Eksportuje: createPlayer, applyPowerup, spawnExplosion, updatePlayerPowerups, updateRecordY
 */
import { CONFIG } from '../config.js';

/**
 * Kreira inicijalni player state.
 * @param {number} x  - Početna X pozicija (px)
 * @param {number} y  - Početna Y pozicija (px)
 * @returns {object}  Player state objekat
 */
export function createPlayer(x, y) {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    radius: CONFIG.PLAYER_RADIUS,
    thrusterActive: false,
    shieldAura: 0,       // countdown sekundi za shield vizual
    powerups: {
      slowTime: 0,       // preostalo sekundi
      score2x: 0,
      magnetTemp: 0,
      narrowHitbox: 0,
      speedBurst: 0,
      ghostPass: 0,
    },
    alive: true,
    // Record Line tracking
    recordYSamples: [],  // Y na svakih 10px distance (trenutni run)
    lastRecordSample: 0, // poslednja distance na kojoj smo uzeli uzorak
  };
}

/**
 * Primeni power-up efekat na player state.
 * @param {object} player
 * @param {string} powerupId  - ID power-upa iz pool-a
 */
export function applyPowerup(player, powerupId) {
  const effects = {
    SHIELD: () => { /* shield se handleuje u collision.js / index.js */ },
    SLOW_TIME:    () => { player.powerups.slowTime    = 5; },
    SCORE_2X:     () => { player.powerups.score2x     = 8; },
    MAGNET_TEMP:  () => { player.powerups.magnetTemp  = 10; },
    WIDE_SHIP:    () => { player.powerups.narrowHitbox = 8; },
    SPEED_BURST:  () => { player.powerups.speedBurst  = 4; },
    GHOST_PASS:   () => { player.powerups.ghostPass   = 6; },
    CRYSTAL_RAIN: () => { /* handleuje se u index.js */ },
  };
  (effects[powerupId] || (() => {}))();
}

/**
 * Generiši eksploziju čestica i vrati ih kao niz.
 * @param {object} player
 * @returns {object[]} Niz particle objekata za render.js
 */
export function spawnExplosion(player) {
  const particles = [];
  for (let i = 0; i < CONFIG.EXPLOSION_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * CONFIG.EXPLOSION_SPEED_MAX;
    particles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: CONFIG.PARTICLE_LIFETIME,
      maxLife: CONFIG.PARTICLE_LIFETIME,
    });
  }
  return particles;
}

/**
 * Ticki down sve aktivne powerup tajmere za igrača.
 * @param {object} player
 * @param {number} dt  - Delta time u sekundama
 */
export function updatePlayerPowerups(player, dt) {
  for (const key of Object.keys(player.powerups)) {
    if (player.powerups[key] > 0) {
      player.powerups[key] = Math.max(0, player.powerups[key] - dt);
    }
  }
  if (player.shieldAura > 0) {
    player.shieldAura = Math.max(0, player.shieldAura - dt);
  }
}

/**
 * Uzima uzorak Y pozicije svakih 10px pređene distance za Record Line.
 * @param {object} player
 * @param {object} run     - Run state (run.distance)
 */
export function updateRecordY(player, run) {
  while (run.distance >= player.lastRecordSample + 10) {
    player.recordYSamples.push(player.y);
    player.lastRecordSample += 10;
  }
}
