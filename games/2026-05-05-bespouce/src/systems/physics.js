/**
 * physics.js — Fizika broda za Bespuće
 * Euler integracija: gravity, thrust, drag, MAX_VY klamping.
 * Brod se kreće po Y osi primarno; X pozicija je nominalno fiksna,
 * ali player.x može blago da varira pri horizontal thrusteru
 * (renderuje se fiksno, hodnik scrolluje).
 * Eksportuje: updatePhysics
 */
import { CONFIG } from '../config.js';

/**
 * Ažuriraj fiziku igrača za jedan frame.
 * @param {object} player   - Player state (x, y, vx, vy, thrusterActive)
 * @param {object} input    - Input snapshot { thrust, left, right }
 * @param {number} dt       - Delta time u sekundama
 */
export function updatePhysics(player, input, dt) {
  if (!player || !player.alive) return;

  // --- Sile ---
  // Gravitacija (pozitivna = dole, jer Y raste nadole u canvas-u)
  player.vy += CONFIG.GRAVITY * dt;

  // Thrust gore (THRUST_UP je negativan)
  if (input.thrust) player.vy += CONFIG.THRUST_UP * dt;

  // Horizontalni thrust
  if (input.left)  player.vx -= CONFIG.THRUST_HORIZ * dt;
  if (input.right) player.vx += CONFIG.THRUST_HORIZ * dt;

  // --- Drag (eksponencijalni, dt-skaliran za frame-rate nezavisnost) ---
  const drag = Math.pow(CONFIG.DRAG_FRAME, dt * 60);
  player.vx *= drag;
  player.vy *= drag;

  // --- Clamp brzine ---
  player.vx = Math.max(-CONFIG.MAX_VX, Math.min(CONFIG.MAX_VX, player.vx));
  player.vy = Math.max(-CONFIG.MAX_VY, Math.min(CONFIG.MAX_VY, player.vy));

  // --- Pomeri brod ---
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // --- Thruster vizual flag ---
  player.thrusterActive = !!input.thrust;
}
