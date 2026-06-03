// ============================================================
//  render.js — Sarajevo ili Smrt
//  Canvas rendering: session screen only.
//  Macro/meta UI rendered in DOM by ui.js.
// ============================================================

import { COLORS, WAVE_AMPLITUDE, SESSION_DURATION_SEC } from './config.js';
import { isInVibeZone } from './systems/session.js';
import { getSessionProgress, getSessionTimeLeft } from './systems/session.js';
import { getCrowdColor } from './entities/crowd.js';

// Canvas element id
const CANVAS_ID = 'session-canvas';

// ----------------------------------------------------------------
//  Main render entry point — called every frame
// ----------------------------------------------------------------
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state
 */
export function render(ctx, state) {
  if (state.current_screen !== 'session') return;
  if (!state.active_session) return;

  const canvas = ctx.canvas;
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  _drawSessionBackground(ctx, w, h, state);
  _drawVibeWave(ctx, w, h, state);
  _drawCrowdBar(ctx, w, h, state);
  _drawSlider(ctx, w, h, state);
  _drawParticles(ctx, w, h, state);
  _drawTimerArc(ctx, w, h, state);
  _drawSessionHUD(ctx, w, h, state);
  if (state.active_session.reaction_text) {
    _drawReactionText(ctx, w, h, state);
  }
  if (state.active_session.failed || state.active_session.done) {
    _drawSessionEnd(ctx, w, h, state);
  }

  ctx.restore();
}

// ----------------------------------------------------------------
//  Background — gradient per kvart
// ----------------------------------------------------------------
function _drawSessionBackground(ctx, w, h, state) {
  const kvart = state.active_session.kvart;
  const accent = COLORS[kvart === 'bascarsija' ? 'BASCARSIJA' : kvart === 'marijin_dvor' ? 'MARIJIN_DVOR' : 'GRBAVICA'];

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, COLORS.BG);
  grad.addColorStop(0.6, '#0e0e1a');
  grad.addColorStop(1, accent + '22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle vignette overlay
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, '#00000066');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

// ----------------------------------------------------------------
//  Vibe Wave — horizontal sin wave across the canvas
// ----------------------------------------------------------------
function _drawVibeWave(ctx, w, h, state) {
  const sess = state.active_session;
  const wave_pos = sess.wave_pos;     // -100..+100

  // Map -100..+100 to canvas x 10%..90%
  const margin_x = w * 0.10;
  const usable_w = w - 2 * margin_x;
  const wave_cx = margin_x + ((wave_pos + 100) / 200) * usable_w;

  // Vibe zone bounds
  const base_half = 30;
  const extra = state.upgrades.A >= 2 ? 8 : 0;
  const half_zone = base_half + extra;
  const zone_left_pct  = (wave_pos - half_zone + 100) / 200;
  const zone_right_pct = (wave_pos + half_zone + 100) / 200;
  const zone_left_x  = margin_x + zone_left_pct * usable_w;
  const zone_right_x = margin_x + zone_right_pct * usable_w;

  const in_vibe = isInVibeZone(sess.slider_pos, wave_pos, state);

  // --- Wave band background ---
  const band_y = h * 0.45;
  const band_h = h * 0.20;

  // Vibe zone highlight
  ctx.save();
  ctx.fillStyle = in_vibe ? '#00FFCC18' : '#ffffff08';
  ctx.fillRect(zone_left_x, band_y - band_h / 2, zone_right_x - zone_left_x, band_h);

  // Vibe zone border
  ctx.strokeStyle = in_vibe ? COLORS.TEAL + '88' : COLORS.DIM + '44';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(zone_left_x, band_y - band_h / 2, zone_right_x - zone_left_x, band_h);
  ctx.setLineDash([]);
  ctx.restore();

  // --- Draw sin wave across full width ---
  const kvart = sess.kvart;
  const accent = COLORS[kvart === 'bascarsija' ? 'BASCARSIJA' : kvart === 'marijin_dvor' ? 'MARIJIN_DVOR' : 'GRBAVICA'];

  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const SEGMENTS = 120;
  for (let i = 0; i <= SEGMENTS; i++) {
    const t_norm = i / SEGMENTS;
    const px = margin_x + t_norm * usable_w;
    // Evaluate sin at this x, shifted to represent wave position
    const phase = ((px - margin_x) / usable_w) * 4 * Math.PI - sess.wave_time * 1.5;
    const sin_y = Math.sin(phase);
    const py = band_y + sin_y * (band_h * 0.38);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  // Color: teal when in vibe, red-orange when far away
  const dist = Math.abs(sess.slider_pos - wave_pos);
  const t_color = Math.max(0, 1 - dist / 80);
  const r = Math.round(255 * (1 - t_color));
  const g = Math.round(255 * t_color);
  const b = Math.round(200 * t_color);
  ctx.strokeStyle = `rgba(${r},${g + 100},${b},0.85)`;
  ctx.shadowColor = in_vibe ? COLORS.TEAL : COLORS.PRIMARY;
  ctx.shadowBlur = in_vibe ? 12 : 4;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();

  // --- Wave target marker (circle on wave peak at wave_cx) ---
  const wave_peak_y = band_y;
  ctx.save();
  ctx.beginPath();
  ctx.arc(wave_cx, wave_peak_y, 7, 0, Math.PI * 2);
  ctx.fillStyle = in_vibe ? COLORS.TEAL : accent;
  ctx.shadowColor = in_vibe ? COLORS.TEAL : accent;
  ctx.shadowBlur = in_vibe ? 16 : 6;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ----------------------------------------------------------------
//  Slider — vertical line that player drags
// ----------------------------------------------------------------
function _drawSlider(ctx, w, h, state) {
  const sess = state.active_session;
  const margin_x = w * 0.10;
  const usable_w = w - 2 * margin_x;

  const slider_x = margin_x + ((sess.slider_pos + 100) / 200) * usable_w;
  const in_vibe = isInVibeZone(sess.slider_pos, sess.wave_pos, state);

  const slider_top    = h * 0.25;
  const slider_bottom = h * 0.70;

  ctx.save();

  // Glow effect when in vibe
  if (in_vibe) {
    ctx.shadowColor = COLORS.TEAL;
    ctx.shadowBlur = 18;
  }

  // Slider line
  ctx.strokeStyle = in_vibe ? COLORS.TEAL : COLORS.WHITE;
  ctx.lineWidth = in_vibe ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(slider_x, slider_top);
  ctx.lineTo(slider_x, slider_bottom);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Slider knob (circle at center)
  const knob_y = (slider_top + slider_bottom) / 2;
  ctx.beginPath();
  ctx.arc(slider_x, knob_y, 10, 0, Math.PI * 2);
  ctx.fillStyle = in_vibe ? COLORS.TEAL : COLORS.WHITE;
  if (in_vibe) {
    ctx.shadowColor = COLORS.TEAL;
    ctx.shadowBlur = 20;
  }
  ctx.fill();
  ctx.shadowBlur = 0;

  // Position label
  ctx.font = '11px monospace';
  ctx.fillStyle = COLORS.DIM;
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(sess.slider_pos), slider_x, slider_bottom + 14);
  ctx.textAlign = 'left';

  ctx.restore();
}

// ----------------------------------------------------------------
//  Crowd Bar — left side vertical bar
// ----------------------------------------------------------------
function _drawCrowdBar(ctx, w, h, state) {
  const sess = state.active_session;
  const crowd = sess._crowd_frac ?? sess.crowd_level ?? 0;

  const bar_x = 18;
  const bar_y = h * 0.15;
  const bar_w = 18;
  const bar_h = h * 0.65;

  // Background
  ctx.save();
  ctx.fillStyle = '#ffffff0f';
  ctx.fillRect(bar_x, bar_y, bar_w, bar_h);
  ctx.strokeStyle = '#ffffff22';
  ctx.lineWidth = 1;
  ctx.strokeRect(bar_x, bar_y, bar_w, bar_h);

  // Fill
  const fill_h = (crowd / 100) * bar_h;
  const fill_y = bar_y + bar_h - fill_h;
  const color = getCrowdColor(crowd);

  const grad = ctx.createLinearGradient(bar_x, fill_y + fill_h, bar_x, fill_y);
  grad.addColorStop(0, color + '88');
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  ctx.fillRect(bar_x, fill_y, bar_w, fill_h);

  // Glow at crowd > 80
  if (crowd > 80) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillRect(bar_x, fill_y, bar_w, fill_h);
    ctx.shadowBlur = 0;
  }

  // Fail threshold line
  const fail_y = bar_y + bar_h - (20 / 100) * bar_h;
  ctx.strokeStyle = COLORS.PRIMARY + 'aa';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(bar_x - 4, fail_y);
  ctx.lineTo(bar_x + bar_w + 4, fail_y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(crowd)}`, bar_x + bar_w / 2, bar_y - 6);
  ctx.textAlign = 'left';

  // Crowd label
  ctx.font = '9px monospace';
  ctx.fillStyle = COLORS.DIM;
  ctx.textAlign = 'center';
  ctx.fillText('CROWD', bar_x + bar_w / 2, bar_y + bar_h + 14);
  ctx.textAlign = 'left';

  ctx.restore();
}

// ----------------------------------------------------------------
//  Timer Arc — countdown circle top right
// ----------------------------------------------------------------
function _drawTimerArc(ctx, w, h, state) {
  const sess = state.active_session;
  const progress = getSessionProgress(sess);
  const time_left = getSessionTimeLeft(sess);

  const cx = w - 48;
  const cy = 48;
  const r = 30;

  ctx.save();

  // Background circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff18';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Progress arc (depletes clockwise)
  const start_angle = -Math.PI / 2;
  const end_angle = start_angle + (1 - progress) * Math.PI * 2;
  const color = progress > 0.6 ? COLORS.TEAL : progress > 0.3 ? COLORS.GOLD : COLORS.PRIMARY;

  ctx.beginPath();
  ctx.arc(cx, cy, r, start_angle, end_angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  if (progress < 0.2) {
    ctx.shadowColor = COLORS.PRIMARY;
    ctx.shadowBlur = 10;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Time text
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = COLORS.WHITE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.ceil(time_left) + 's', cx, cy);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  ctx.restore();
}

// ----------------------------------------------------------------
//  Session HUD — LP earned, vibe%, kvart name
// ----------------------------------------------------------------
function _drawSessionHUD(ctx, w, h, state) {
  const sess = state.active_session;
  const kvart = sess.kvart;
  const kvart_names = { bascarsija: 'Baščaršija', marijin_dvor: 'Marijin Dvor', grbavica: 'Grbavica' };
  const kvart_color = COLORS[kvart === 'bascarsija' ? 'BASCARSIJA' : kvart === 'marijin_dvor' ? 'MARIJIN_DVOR' : 'GRBAVICA'];

  ctx.save();

  // Kvart name — top left
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = kvart_color;
  ctx.fillText(kvart_names[kvart] ?? kvart, 46, 24);

  // LP earned
  const lp_text = `+${Math.floor(sess.lp_earned)} LP`;
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = COLORS.TEAL;
  ctx.fillText(lp_text, 46, 44);

  // Vibe %
  const vibe_pct = Math.round((sess.seconds_in_vibe / Math.max(sess.elapsed_sec, 0.1)) * 100);
  ctx.font = '11px monospace';
  ctx.fillStyle = COLORS.DIM;
  ctx.fillText(`Vibe: ${vibe_pct}%`, 46, 60);

  // Bottom: drag/touch hint
  ctx.font = '11px monospace';
  ctx.fillStyle = COLORS.DIM + 'aa';
  ctx.textAlign = 'center';
  ctx.fillText('← Vuci slider ili koristi ← → tipke →', w / 2, h - 12);
  ctx.textAlign = 'left';

  ctx.restore();
}

// ----------------------------------------------------------------
//  Particles
// ----------------------------------------------------------------
function _drawParticles(ctx, w, h, state) {
  const sess = state.active_session;
  if (!sess.particles || sess.particles.length === 0) return;

  ctx.save();
  for (const p of sess.particles) {
    const px = p.x * w;
    const py = p.y * h;
    const alpha = Math.max(0, p.life);

    if (p.type === 'lp') {
      ctx.font = `${Math.floor(10 + p.life * 6)}px monospace`;
      ctx.fillStyle = `rgba(0, 255, 204, ${alpha})`;
      ctx.textAlign = 'center';
      ctx.fillText('♪', px, py);
    } else if (p.type === 'legend') {
      ctx.beginPath();
      ctx.arc(px, py, 4 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.8})`;
      ctx.fill();
    }
  }
  ctx.textAlign = 'left';
  ctx.restore();
}

// ----------------------------------------------------------------
//  Reaction text — floating crowd quote
// ----------------------------------------------------------------
function _drawReactionText(ctx, w, h, state) {
  const sess = state.active_session;
  const alpha = Math.min(1, sess.reaction_timer / 1.5);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'italic 14px monospace';
  ctx.fillStyle = COLORS.GOLD;
  ctx.textAlign = 'center';
  // Word-wrap long reactions
  const max_w = w * 0.6;
  _wrapText(ctx, `"${sess.reaction_text}"`, w / 2, h * 0.80, max_w, 20);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
  ctx.restore();
}

function _wrapText(ctx, text, x, y, max_w, line_h) {
  const words = text.split(' ');
  let line = '';
  let current_y = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > max_w && line) {
      ctx.fillText(line, x, current_y);
      line = word;
      current_y += line_h;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, current_y);
}

// ----------------------------------------------------------------
//  Session end overlay (result flash)
// ----------------------------------------------------------------
function _drawSessionEnd(ctx, w, h, state) {
  const sess = state.active_session;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, w, h);

  const title = sess.failed ? 'IZBAČEN' : 'NOĆ ZAVRŠENA';
  const title_color = sess.failed ? COLORS.PRIMARY : COLORS.TEAL;

  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = title_color;
  ctx.textAlign = 'center';
  ctx.shadowColor = title_color;
  ctx.shadowBlur = 20;
  ctx.fillText(title, w / 2, h * 0.38);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = COLORS.GOLD;
  ctx.fillText(`${Math.floor(sess.lp_earned)} LP`, w / 2, h * 0.52);

  const vibe_pct = Math.round((sess.seconds_in_vibe / SESSION_DURATION_SEC) * 100);
  ctx.font = '14px monospace';
  ctx.fillStyle = COLORS.DIM;
  ctx.fillText(`Vibe time: ${vibe_pct}%   Crowd: ${Math.floor(sess._crowd_frac ?? sess.crowd_level ?? 0)}`, w / 2, h * 0.62);

  ctx.font = '13px monospace';
  ctx.fillStyle = COLORS.WHITE + 'aa';
  ctx.fillText('Klikni ili tapni za nastavak', w / 2, h * 0.76);

  ctx.textAlign = 'left';
  ctx.restore();
}

// ----------------------------------------------------------------
//  Resize canvas helper — call from main.js on window resize
// ----------------------------------------------------------------
/**
 * @param {HTMLCanvasElement} canvas
 */
export function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = canvas.clientWidth  * dpr;
  canvas.height = canvas.clientHeight * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}
