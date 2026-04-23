// src/render.js — Canvas rendering: grid, ćelije, sobe, particle efekti, screen shake

import { CONFIG } from './config.js';
import { getParticles } from './systems/particles.js';

/**
 * Glavni render poziv — briše canvas i crta sve slojeve u ispravnom redosledu.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function render(ctx, state) {
  const w = ctx.canvas.width  / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;

  // Jova: u implementaciji zameni stub sa pravim render-om

  // 1. Pozadina
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  // 2. Screen shake offset
  applyScreenShake(ctx, state);

  // 3. Grid ćelije
  renderGrid(ctx, state, w, h);

  // 4. Sobe (vizualni layer iznad grida)
  renderRooms(ctx, state);

  // 5. Particles
  renderParticles(ctx, state);

  // 6. Kristal glow (poseban layer)
  renderCrystalGlow(ctx, state);

  // 7. Bura visual efekti (sand overlay)
  renderStormOverlay(ctx, state, w, h);

  // Resetuj transform posle screen shake-a
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

/**
 * Primenjuje screen shake transformaciju.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function applyScreenShake(ctx, state) {
  // Jova: implementiraj screen shake translate
}

/**
 * Crta sve grid ćelije (zemlja, tuneli, fog of war).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 * @param {number} w - canvas logical width
 * @param {number} h - canvas logical height
 */
export function renderGrid(ctx, state, w, h) {
  // Jova: iteriraj grid, crtaj svaku ćeliju prema cell.type i cell.revealed
}

/**
 * Crta vizuale soba na tunelima.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function renderRooms(ctx, state) {
  // Jova: za svaku sobu iz state.rooms crtaj ikonu/tekst iznad ćelije
}

/**
 * Crta sve žive čestice.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function renderParticles(ctx, state) {
  const particles = getParticles(state);
  // Jova: iteriraj particles, crtaj kružiće/tačkice
}

/**
 * Crta kristal glow efekat (pulsing teal glow).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 */
export function renderCrystalGlow(ctx, state) {
  // Jova: pronađi kristal u gridu i crta radial gradient glow
}

/**
 * Crta sand overlay efekat za buru (transparency u zavisnosti od storm.intensity).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 * @param {number} w
 * @param {number} h
 */
export function renderStormOverlay(ctx, state, w, h) {
  // Jova: fillRect sa COLORS.STORM_SAND i alpha = storm.intensity * 0.35
}
