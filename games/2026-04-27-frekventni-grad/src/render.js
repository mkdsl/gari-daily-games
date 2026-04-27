/**
 * @file render.js
 * @description Canvas rendering za Frekventni Grad.
 *              Crta pozadinu, lane-ove, timing liniju, beat krugove i hit efekte.
 *
 * Neon estetika: tamna pozadina #0D0D1A, neon boje po lanu, glow filterom.
 * Sve boje dolaze iz CONFIG.COLORS.
 *
 * Poziva se iz main.js: renderFrame(state, ctx, canvas)
 */

import { CONFIG } from './config.js';

/** Preračunava logičke dimenzije platna bez DPR */
function getLogicalSize(canvas) {
  return {
    w: canvas.clientWidth,
    h: canvas.clientHeight,
  };
}

/** X pozicije 3 lane-a (logical px) */
function laneXPositions(w) {
  return [w * 0.25, w * 0.50, w * 0.75];
}

/** Y pozicija timing linije */
function timingLineY(h) {
  return h - CONFIG.TIMING_LINE_Y_OFFSET;
}

// ─── Javne funkcije ───────────────────────────────────────────────────────────

/**
 * Glavni render entry point — poziva se svaki frame.
 * @param {import('./state.js').GameState} state
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 */
export function renderFrame(state, ctx, canvas) {
  const { w, h } = getLogicalSize(canvas);

  renderBackground(ctx, w, h);
  renderLanes(ctx, w, h);
  renderTimingLine(ctx, w, h);

  const beats = state.activeBeats ?? [];
  renderBeats(ctx, beats, w, h);
  renderHitEffects(ctx, beats, w, h);
}

/**
 * Crta tamnu pozadinu i neon grid linije.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - logička širina (px)
 * @param {number} h - logička visina (px)
 */
export function renderBackground(ctx, w, h) {
  // Puna pozadina
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  // Suptilna horizontalna grid linija na sredini (dekorativno)
  ctx.save();
  ctx.strokeStyle = CONFIG.COLORS.LANE_LINE;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  const midY = h * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(w, midY);
  ctx.stroke();
  ctx.restore();
}

/**
 * Crta 3 vertikalna lane traka i separator linije.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 */
export function renderLanes(ctx, w, h) {
  const tlY = timingLineY(h);
  const laneXs = laneXPositions(w);
  const TOP_Y = 40; // lanes počinju malo ispod vrha

  ctx.save();

  // Vertikalne lane trake (tanka linija po sredini lane-a)
  ctx.lineWidth = 1;
  laneXs.forEach((x, i) => {
    ctx.strokeStyle = CONFIG.COLORS.BEAT_LANE[i];
    ctx.globalAlpha = 0.18;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(x, TOP_Y);
    ctx.lineTo(x, tlY);
    ctx.stroke();
  });

  // Vertikalni separator-i između lane-a (centralni razmak)
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = CONFIG.COLORS.LANE_LINE;
  ctx.lineWidth = 1;

  const separators = [w * 0.375, w * 0.625];
  separators.forEach((sx) => {
    ctx.beginPath();
    ctx.moveTo(sx, TOP_Y);
    ctx.lineTo(sx, tlY);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Crta horizontalnu timing liniju na dnu ekrana.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 */
export function renderTimingLine(ctx, w, h) {
  const tlY = timingLineY(h);
  const laneXs = laneXPositions(w);

  ctx.save();

  // Horizontalna linija puna širina
  ctx.strokeStyle = CONFIG.COLORS.TIMING_LINE;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.35;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(0, tlY);
  ctx.lineTo(w, tlY);
  ctx.stroke();

  // Hit zone krugovi — stroke only, boja po lane-u
  const HIT_ZONE_R = 32;
  laneXs.forEach((x, i) => {
    const color = CONFIG.COLORS.BEAT_LANE[i];
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, tlY, HIT_ZONE_R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  ctx.restore();
}

/**
 * Crta sve aktivne beat krugove koji putuju ka timing liniji.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').BeatCircle[]} beats
 * @param {number} w
 * @param {number} h
 */
export function renderBeats(ctx, beats, w, h) {
  const tlY = timingLineY(h);
  const laneXs = laneXPositions(w);
  const TOP_Y = 60;

  ctx.save();

  beats.forEach((beat) => {
    if (beat.state === 'missed') {
      _drawMissedBeat(ctx, beat, laneXs, tlY, TOP_Y);
      return;
    }
    if (beat.state === 'hit') {
      // Hit beati se prikazuju u renderHitEffects — ovde preskačemo telo
      return;
    }

    const x = laneXs[beat.lane];
    const progress = Math.max(0, Math.min(1, beat.visualProgress ?? 0));
    const y = TOP_Y + progress * (tlY - TOP_Y);
    const color = CONFIG.COLORS.BEAT_LANE[beat.lane];
    const r = CONFIG.BEAT_RADIUS;

    // Neon glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;

    // Fill
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Unutrašnji highlight (beli krug, mali)
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  });

  ctx.restore();
}

/**
 * Crta sonar ring eksploziju za beate koji su upravo hitovani,
 * i X marker za missed beate.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').BeatCircle[]} beats
 * @param {number} w
 * @param {number} h
 */
export function renderHitEffects(ctx, beats, w, h) {
  const tlY = timingLineY(h);
  const laneXs = laneXPositions(w);
  const TOP_Y = 60;

  ctx.save();

  beats.forEach((beat) => {
    if (beat.state !== 'hit') return;

    const x = laneXs[beat.lane];
    const progress = Math.max(0, Math.min(1, beat.visualProgress ?? 0));
    const y = TOP_Y + progress * (tlY - TOP_Y);
    const color = CONFIG.COLORS.BEAT_LANE[beat.lane];

    const age = beat.hitRingAge ?? 0; // 0..1 normalizovano
    const duration = CONFIG.HIT_RING_DURATION;
    const t = Math.min(age / duration, 1);

    const ringRadius = CONFIG.BEAT_RADIUS + t * 120;
    const alpha = Math.max(0, 1 - t);

    // Sonar ring
    ctx.globalAlpha = alpha * 0.85;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Drugi, brži ring (polovina trajanja — extra glow)
    const t2 = Math.min(age / (duration * 0.6), 1);
    const ring2Radius = CONFIG.BEAT_RADIUS + t2 * 60;
    const alpha2 = Math.max(0, 1 - t2) * 0.5;
    ctx.globalAlpha = alpha2;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, ring2Radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });

  ctx.restore();
}

// ─── Privatni helperi ─────────────────────────────────────────────────────────

/**
 * Crta X marker za missed beat.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} beat
 * @param {number[]} laneXs
 * @param {number} tlY
 * @param {number} TOP_Y
 */
function _drawMissedBeat(ctx, beat, laneXs, tlY, TOP_Y) {
  const x = laneXs[beat.lane];
  // Missed beat ostaje na timing liniji
  const y = tlY;
  const r = CONFIG.BEAT_RADIUS * 0.75;

  // Fade out tokom hitRingAge
  const age = beat.hitRingAge ?? 0;
  const duration = CONFIG.HIT_RING_DURATION;
  const alpha = Math.max(0, 1 - age / duration);

  ctx.save();
  ctx.globalAlpha = alpha * 0.75;
  ctx.strokeStyle = CONFIG.COLORS.HIT_MISS;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 8;
  ctx.shadowColor = CONFIG.COLORS.HIT_MISS;

  // X linija 1
  ctx.beginPath();
  ctx.moveTo(x - r, y - r);
  ctx.lineTo(x + r, y + r);
  ctx.stroke();

  // X linija 2
  ctx.beginPath();
  ctx.moveTo(x + r, y - r);
  ctx.lineTo(x - r, y + r);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();
}
