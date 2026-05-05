/**
 * render.js — Canvas 2D rendering za Bespuće
 * Redosled slojeva: BG → zidovi/chunks → prepreke → pickups → brod → čestice → Record Line → HUD canvas elementi
 * Eksportuje: render
 */
import { CONFIG } from './config.js';

/**
 * Renderuj jedan frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state  - Cijeli state (state.screen, state.run)
 */
export function render(ctx, state) {
  const w = ctx.canvas.width / devicePixelRatio;
  const h = ctx.canvas.height / devicePixelRatio;

  // Placeholder — biće implementirano u koraku 4d
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);
}
