/**
 * ui.js — Start screen i end screen za Graviton.
 *
 * Sve je crtano na canvas-u (ne DOM elementi osim što canvas već postoji).
 *
 * Start screen (IDLE):
 *   - Naziv "GRAVITON" veliki font, centrirano
 *   - "TAP / SPACE to start" manji font, centrirano ispod
 *   - Best time ako postoji: "BEST: X:XX"
 *
 * End screen (HIGH_SCORE_CHECK):
 *   - Poluprovidni crni overlay (već nacrtan od renderDeathOverlay)
 *   - "CRASHED AT X:XX" veliki crveni font
 *   - "BEST: X:XX" manji beli font
 *   - Ako new_record: "NEW RECORD!" zlatno, bljesk animacija
 *   - Oznaka sesije: "★" zlatna za ≥300s, "✦" platinasta za ≥600s
 *   - "[ SPACE / TAP to restart ]" hint
 *
 * Koordinatni sistem: logički 800×450px.
 */

import { CONFIG } from './config.js';
import { formatTime } from './render.js';

export { formatTime };

/**
 * Crta start screen (IDLE phase).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 * @param {number} time - Ukupno vreme od starta (za blinking animacije)
 */
export function renderStartScreen(ctx, state, time) {
  const W = CONFIG.CANVAS_WIDTH;
  const H = CONFIG.CANVAS_HEIGHT;

  // Tamni overlay
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Naslov
  ctx.font = 'bold 64px monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('GRAVITON', W / 2, 160);

  // Podnaslov
  ctx.font = '16px monospace';
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('kontroliši gravitaciju — preživljaj', W / 2, 200);

  // Separator
  ctx.strokeStyle = 'rgba(57,255,20,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, 225);
  ctx.lineTo(W / 2 + 120, 225);
  ctx.stroke();

  // CTA — bljeskanje sinusom
  if (Math.sin(time * 3) > 0) {
    ctx.font = '20px monospace';
    ctx.fillStyle = CONFIG.COLORS.NEON_EDGE;
    ctx.fillText('TAP  /  SPACE to start', W / 2, 265);
  }

  // Best time
  if (state.best_score > 0) {
    ctx.font = '14px monospace';
    ctx.fillStyle = CONFIG.COLORS.HUD_TEXT;
    ctx.fillText('BEST: ' + formatTime(state.best_score), W / 2, 310);
  }

  ctx.restore();
}

/**
 * Crta end screen (HIGH_SCORE_CHECK phase).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 * @param {number} time - Ukupno vreme od starta (za NEW RECORD bljesk)
 */
export function renderEndScreen(ctx, state, time) {
  const W = CONFIG.CANVAS_WIDTH;

  // Overlay (pojačan — death overlay je možda već na 0.8)
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, W, CONFIG.CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Milestone oznaka gore
  const score = state.current_score;
  if (score >= CONFIG.MILESTONE_PLATINUM) {
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#E5E4E2';
    ctx.fillText('✦ PLATINUM', W / 2, 80);
  } else if (score >= CONFIG.MILESTONE_GOLD) {
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = CONFIG.COLORS.RECORD_TEXT;
    ctx.fillText('★ GOLD', W / 2, 80);
  }

  // CRASHED AT
  ctx.font = 'bold 40px monospace';
  ctx.fillStyle = CONFIG.COLORS.CRASHED_TEXT;
  ctx.fillText('CRASHED AT  ' + formatTime(score), W / 2, 160);

  // Best time
  ctx.font = '20px monospace';
  ctx.fillStyle = CONFIG.COLORS.BEST_TEXT;
  ctx.fillText('BEST: ' + formatTime(state.best_score), W / 2, 210);

  // New record — bljeskanje
  if (state.new_record) {
    if (Math.sin(time * 8) > 0) {
      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = CONFIG.COLORS.RECORD_TEXT;
      ctx.fillText('NEW RECORD!', W / 2, 255);
    }
  }

  // Restart hint — sporije bljeskanje
  if (Math.sin(time * 2) > 0) {
    ctx.font = '16px monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText('[ SPACE  /  TAP  to restart ]', W / 2, 315);
  }

  ctx.restore();
}

/**
 * Glavni UI render dispatcher — poziva se posle render() u svakom frame-u.
 * uiTime je sekunde od starta (za blink animacije); ako nije prosleđen uzima performance.now().
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 * @param {number} [uiTime] - Sekunde od starta aplikacije (za blink animacije)
 */
export function renderUI(ctx, state, uiTime) {
  if (uiTime === undefined) uiTime = performance.now() / 1000;
  switch (state.gamePhase) {
    case 'IDLE':
      renderStartScreen(ctx, state, uiTime);
      break;
    case 'HIGH_SCORE_CHECK':
      renderEndScreen(ctx, state, uiTime);
      break;
    default:
      // PLAYING i DEAD — HUD se crta u render.js, UI nema šta da doda
      break;
  }
}
