/**
 * entities/player.js — Brod logika za Graviton.
 *
 * Odgovornosti:
 *   - Procesiranje flip inputa (sa cooldown-om)
 *   - Update G-overload timera i ratio-a
 *   - Update vizuelne rotacione animacije (flip_anim_t, visual_angle)
 *   - Boja broda prema g_overload_ratio (delegira na render.js za crtanje)
 *
 * NE radi:
 *   - Fiziku (velocity_y, gravity) — to je systems/physics.js
 *   - Collision detection — to je systems/collision.js
 *   - Crtanje — to je render.js (renderPlayer)
 *
 * Korišćenje:
 *   import { updatePlayer } from './entities/player.js';
 *   const result = updatePlayer(state.brod, input, state.zone_index, dt);
 *   if (result.overloadStatus === 'dead') triggerDeath('G-OVERLOAD');
 */

import { CONFIG } from '../config.js';

/**
 * Ease-out quad za glatkiju flip animaciju.
 * @param {number} t - 0.0 do 1.0
 * @returns {number}
 */
function _easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Pokreće vizuelnu flip animaciju.
 * @param {import('../state.js').BrodState} brod
 */
export function startFlipAnim(brod) {
  brod.target_angle = brod.visual_angle + Math.PI;
  brod.flip_anim_t = 0;
  brod.flipping = true;
}

/**
 * Ažurira progres vizuelne rotacione animacije.
 * Lerp visual_angle → target_angle tokom CONFIG.FLIP_ANIM_DURATION sekundi.
 * @param {import('../state.js').BrodState} brod
 * @param {number} dt
 */
export function updateFlipAnim(brod, dt) {
  if (!brod.flipping) return;

  brod.flip_anim_t += dt / CONFIG.FLIP_ANIM_DURATION;

  if (brod.flip_anim_t >= 1.0) {
    brod.visual_angle = brod.target_angle % (2 * Math.PI);
    brod.flip_anim_t = 1.0;
    brod.flipping = false;
  } else {
    const startAngle = brod.target_angle - Math.PI;
    const easedT = _easeOutQuad(brod.flip_anim_t);
    brod.visual_angle = startAngle + easedT * Math.PI;
  }
}

/**
 * Procesira flip input za tekući frame.
 * Ako je input.flipPressed i cooldown je 0 — izvrši flip.
 * Flip menja gravity_dir, resetuje G-overload timer, pokreće vizuelnu animaciju.
 *
 * @param {import('../state.js').BrodState} brod
 * @param {{ flipPressed: boolean }} input
 * @param {number} dt - Delta time u sekundama
 * @returns {boolean} true ako je flip izvršen ovaj frame
 */
export function processFlipInput(brod, input, dt) {
  brod.flip_cooldown = Math.max(0, brod.flip_cooldown - dt);

  if (input.flipPressed && brod.flip_cooldown <= 0) {
    brod.gravity_dir *= -1;
    brod.flip_cooldown = CONFIG.FLIP_COOLDOWN;
    brod.g_overload_timer = 0;
    brod.g_overload_ratio = 0;
    startFlipAnim(brod);
    return true;
  }

  return false;
}

/**
 * Ažurira G-overload timer i ratio.
 * G-overload se aktivira samo kada zone_index >= CONFIG.G_OVERLOAD_ACTIVE_FROM_ZONE.
 * Vraća 'dead' kad ratio >= 1.0 — main.js handleuje triggerDeath('G-OVERLOAD').
 *
 * @param {import('../state.js').BrodState} brod
 * @param {number} zoneIndex
 * @param {number} dt
 * @returns {'ok' | 'dead'}
 */
export function updateGOverload(brod, zoneIndex, dt) {
  if (zoneIndex < CONFIG.G_OVERLOAD_ACTIVE_FROM_ZONE) {
    brod.g_overload_timer = 0;
    brod.g_overload_ratio = 0;
    return 'ok';
  }

  brod.g_overload_timer += dt;
  brod.g_overload_ratio = brod.g_overload_timer / CONFIG.G_OVERLOAD_MAX_TIME;

  if (brod.g_overload_ratio >= 1.0) {
    brod.g_overload_ratio = 1.0;
    return 'dead';
  }

  return 'ok';
}

/**
 * Izračunava boju broda na osnovu g_overload_ratio.
 * Interpolacija po tabeli iz GDD 1.1.
 * @param {number} ratio - 0.0–1.0
 * @returns {string} CSS hex boja
 */
export function getBrodColor(ratio) {
  if (ratio < 0.5) {
    return CONFIG.COLORS.PLAYER_WHITE;
  } else if (ratio < 0.75) {
    return CONFIG.COLORS.PLAYER_YELLOW;
  } else if (ratio < 1.0) {
    return CONFIG.COLORS.PLAYER_ORANGE_RED;
  }
  return CONFIG.COLORS.PLAYER_RED;
}

/**
 * Glavni update za brod — poziva se iz main.js game loop.
 * @param {import('../state.js').BrodState} brod
 * @param {{ flipPressed: boolean }} input
 * @param {number} zoneIndex
 * @param {number} dt
 * @returns {{ flipped: boolean, overloadStatus: 'ok' | 'dead' }}
 */
export function updatePlayer(brod, input, zoneIndex, dt) {
  const flipped = processFlipInput(brod, input, dt);
  updateFlipAnim(brod, dt);
  const overloadStatus = updateGOverload(brod, zoneIndex, dt);
  return { flipped, overloadStatus };
}
