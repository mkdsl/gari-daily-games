/**
 * systems/collision.js — Collision detection za Graviton.
 *
 * Brod hitbox: krug radijusa CONFIG.PLAYER_HITBOX_RADIUS (5px), centar na (brod.x, brod.y).
 * Brod.x i brod.y su centar broda (ne gornji levi ugao).
 *
 * Prepreke:
 *   - block:   AABB pravougaonik (obs.x, obs.y, obs.w, obs.h)
 *   - spike:   AABB pravougaonik (obs.x, obs.y, obs.w, obs.h) — manji hitbox
 *   - buzzsaw: Krug radijusa CONFIG.BUZZSAW_HITBOX_RADIUS (14px), centar = (obs.x, obs.y)
 *
 * Pod/plafon:
 *   Collision sa podom i plafonom main.js resolves kao "lepljenje" u tutorijalskim zonama.
 *   Od zone 4 nadalje, smrt dolazi samo od prepreka i G-overload.
 *   checkCollisions vraća 'floor'/'ceil' kao signal — main.js odlučuje da li je smrt ili lepljenje.
 */

import { CONFIG } from '../config.js';

/**
 * @typedef {'none' | 'obstacle' | 'floor' | 'ceil'} CollisionResult
 */

/**
 * Proverava circle-AABB koliziju (krug vs pravougaonik).
 * Closest-point metoda.
 * @param {number} cx - X centar kruga
 * @param {number} cy - Y centar kruga
 * @param {number} r  - Radijus kruga
 * @param {number} rx - X gornjeg levog ugla pravougaonika
 * @param {number} ry - Y gornjeg levog ugla pravougaonika
 * @param {number} rw - Širina pravougaonika
 * @param {number} rh - Visina pravougaonika
 * @returns {boolean}
 */
export function circleIntersectsRect(cx, cy, r, rx, ry, rw, rh) {
  const nearX = Math.min(rx + rw, Math.max(rx, cx));
  const nearY = Math.min(ry + rh, Math.max(ry, cy));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Proverava circle-circle koliziju.
 * @param {number} x1 @param {number} y1 @param {number} r1
 * @param {number} x2 @param {number} y2 @param {number} r2
 * @returns {boolean}
 */
export function circleIntersectsCircle(x1, y1, r1, x2, y2, r2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const sumR = r1 + r2;
  return dx * dx + dy * dy <= sumR * sumR;
}

/**
 * Proverava koliziju broda sa svim aktivnim prepreakama.
 * Vraća 'obstacle' pri prvoj koliziji sa preprekom,
 * 'floor' ili 'ceil' pri dodiru sa podom/plafonom, 'none' ako nema ničega.
 *
 * @param {import('../state.js').BrodState} brod
 * @param {import('../state.js').Zone[]} activeZones
 * @returns {{ result: CollisionResult }}
 */
export function checkCollisions(brod, activeZones) {
  const cx = brod.x;
  const cy = brod.y;
  const r = CONFIG.PLAYER_HITBOX_RADIUS;

  // Pod i plafon — prioritet pre prepreka (ima uvek)
  if (cy + r >= CONFIG.FLOOR_Y) return { result: 'floor' };
  if (cy - r <= CONFIG.CEIL_Y)  return { result: 'ceil' };

  // Obstacle kolizija
  for (const zone of activeZones) {
    for (const obs of zone.obstacles) {
      let hit = false;

      if (obs.type === 'buzzsaw') {
        hit = circleIntersectsCircle(cx, cy, r, obs.x, obs.y, CONFIG.BUZZSAW_HITBOX_RADIUS);
      } else {
        // block ili spike — AABB
        hit = circleIntersectsRect(cx, cy, r, obs.x, obs.y, obs.w, obs.h);
      }

      if (hit) return { result: 'obstacle' };
    }
  }

  return { result: 'none' };
}

/**
 * Handleuje pod/plafon "lepljenje" — nulira velocity_y i clampuje Y.
 * @param {import('../state.js').BrodState} brod
 * @param {'floor' | 'ceil'} surface
 */
export function clampToBounds(brod, surface) {
  if (surface === 'floor') {
    brod.y = CONFIG.FLOOR_Y - CONFIG.PLAYER_HITBOX_RADIUS;
    brod.velocity_y = 0;
  } else if (surface === 'ceil') {
    brod.y = CONFIG.CEIL_Y + CONFIG.PLAYER_HITBOX_RADIUS;
    brod.velocity_y = 0;
  }
}
