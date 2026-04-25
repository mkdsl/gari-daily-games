/**
 * systems/physics.js — Fizika i scroll za Graviton.
 *
 * Odgovornosti:
 *   - updateGravity(brod, dt): primenjuje gravity_dir * GRAVITY akceleraciju na velocity_y,
 *     clampuje na ±VELOCITY_MAX, primenjuje velocity_y na brod.y
 *   - updateScroll(state, dt): pomera sve aktivne zone ulevo za scrollSpeed * dt px,
 *     pomera obstacle.x unutar svake zone, ažurira state.scroll_x
 *   - getScrollSpeed(speedLevel): vraća SCROLL_BASE + speedLevel * SCROLL_SPEED_PER_LEVEL,
 *     clampovano na SCROLL_MAX
 *   - updateSpeedLevel(state): inkrementira speed_level svakih SPEED_LEVEL_INTERVAL sekundi
 *   - updateBuzzsaws(state, dt): ažurira Y poziciju oscilujućih buzzsaw-ova
 *
 * NE radi: collision detection, G-overload (to je player.js)
 */

import { CONFIG } from '../config.js';

/**
 * Clampuje broj između min i max.
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Izračunava trenutnu scroll brzinu na osnovu speed levela.
 * @param {number} speedLevel - 0 do 10
 * @returns {number} px/s
 */
export function getScrollSpeed(speedLevel) {
  return clamp(
    CONFIG.SCROLL_BASE + speedLevel * CONFIG.SCROLL_SPEED_PER_LEVEL,
    CONFIG.SCROLL_BASE,
    CONFIG.SCROLL_MAX
  );
}

/**
 * Primenjuje gravitacionu silu na brod za jedan frame.
 * Lepi brod uz pod/plafon kad dotakne granicu.
 * @param {import('../state.js').BrodState} brod
 * @param {number} dt - Delta time u sekundama
 */
export function updateGravity(brod, dt) {
  brod.velocity_y += brod.gravity_dir * CONFIG.GRAVITY * dt;
  brod.velocity_y = clamp(brod.velocity_y, -CONFIG.VELOCITY_MAX, CONFIG.VELOCITY_MAX);
  brod.y += brod.velocity_y * dt;

  // Lepljenje uz pod
  if (brod.y + CONFIG.PLAYER_HITBOX_RADIUS >= CONFIG.FLOOR_Y) {
    brod.y = CONFIG.FLOOR_Y - CONFIG.PLAYER_HITBOX_RADIUS;
    brod.velocity_y = 0;
  }

  // Lepljenje uz plafon
  if (brod.y - CONFIG.PLAYER_HITBOX_RADIUS <= CONFIG.CEIL_Y) {
    brod.y = CONFIG.CEIL_Y + CONFIG.PLAYER_HITBOX_RADIUS;
    brod.velocity_y = 0;
  }
}

/**
 * Pomera sve aktivne zone i njihove obstacle-e ulevo.
 * Ažurira state.scroll_x (ukupno px scrollovano).
 * Zone čija desna ivica prođe levo od 0 se uklanjaju, zone_index se inkrementira.
 *
 * @param {Object} state - Ceo game state
 * @param {number} dt
 */
export function updateScroll(state, dt) {
  const speed = getScrollSpeed(state.speed_level);
  const dx = speed * dt;
  state.scroll_x += dx;

  for (const zone of state.active_zones) {
    zone.x -= dx;
    for (const obs of zone.obstacles) {
      obs.x -= dx;
      // osc_y_center ostaje fiksiran — Y pozicija se računa u updateBuzzsaws
    }
  }

  // Ukloni zone koje su potpuno izašle levo van ekrana
  const toRemove = state.active_zones.filter(z => z.x + CONFIG.ZONE_WIDTH < 0);
  for (const z of toRemove) {
    const idx = state.active_zones.indexOf(z);
    if (idx !== -1) {
      state.active_zones.splice(idx, 1);
      state.zone_index++;
    }
  }
}

/**
 * Ažurira speed_level na osnovu survival_time.
 * speed_level = floor(survival_time / SPEED_LEVEL_INTERVAL), cap na 10.
 *
 * @param {Object} state
 * @returns {boolean} true ako je level porastao ovaj frame
 */
export function updateSpeedLevel(state) {
  const newLevel = clamp(
    Math.floor(state.survival_time / CONFIG.SPEED_LEVEL_INTERVAL),
    0, 10
  );
  if (newLevel > state.speed_level) {
    state.speed_level = newLevel;
    return true;
  }
  return false;
}

/**
 * Ažurira vizuelnu rotaciju i Y poziciju svih buzzsaw prepreka.
 * Koristi state.survival_time kao globalni tajmer za konzistentnu oscilaciju.
 *
 * @param {Object} state
 * @param {number} dt
 */
export function updateBuzzsaws(state, dt) {
  for (const zone of state.active_zones) {
    for (const obs of zone.obstacles) {
      if (obs.type !== 'buzzsaw') continue;

      obs.rotation = ((obs.rotation || 0) + CONFIG.BUZZSAW_ROTATION_SPEED * dt) % (2 * Math.PI);

      if (obs.oscillates) {
        const phase = obs.osc_phase + (2 * Math.PI * state.survival_time / CONFIG.BUZZSAW_OSCILLATE_PERIOD);
        obs.y = obs.osc_y_center + Math.sin(phase) * CONFIG.BUZZSAW_OSCILLATE_AMPLITUDE;
      }
    }
  }
}
