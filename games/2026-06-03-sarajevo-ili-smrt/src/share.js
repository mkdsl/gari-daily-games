// ============================================================
//  share.js — Sarajevo ili Smrt
//  Offscreen Canvas (600×400) share card render + Web Share API.
//  Canvas-only (no html2canvas dependency).
// ============================================================

import { COLORS, KVART_NAMES } from './config.js';
import { buildShareData } from './entities/dj.js';
import { AVALA_CTA, SHARE_HASHTAGS, SHARE_COPY, KLUBOSLAVIJA_BRAND } from './content/brand_hooks.js';

const CARD_W = 600;
const CARD_H = 400;

// ----------------------------------------------------------------
//  renderShareCard — draws to offscreen canvas, returns dataURL
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {object|null} last_session
 * @returns {string} PNG dataURL
 */
export function renderShareCard(state, last_session = null) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  const data = buildShareData(state, last_session);
  _drawBackground(ctx, state);
  _drawLogo(ctx);
  _drawDJInfo(ctx, data);
  _drawStats(ctx, data);
  _drawKvarts(ctx, data);
  if (state.upgrades.D >= 2) {
    _drawAvalaCTA(ctx);
  }
  _drawBranding(ctx);
  _drawHashtags(ctx, data);

  return canvas.toDataURL('image/png');
}

// ----------------------------------------------------------------
//  Share via Web Share API (with clipboard fallback)
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {object|null} last_session
 * @returns {Promise<void>}
 */
export async function shareResult(state, last_session = null) {
  const data_url = renderShareCard(state, last_session);

  // Determine copy text
  let text = SHARE_COPY.default;
  if (state.achievements.avala_headliner_eligible) text = SHARE_COPY.win;
  else if (state.achievements.first_legend_moment) text = SHARE_COPY.legend;
  else if (state.prestige_level > 0) text = SHARE_COPY.prestige;
  if (last_session?.is_daily_challenge) text = SHARE_COPY.daily;

  const full_text = `${text}\n\n${SHARE_HASHTAGS}\n${AVALA_CTA.button_url}`;

  // Try Web Share API with file
  if (navigator.canShare) {
    try {
      const blob = await _dataURLToBlob(data_url);
      const file = new File([blob], 'sarajevo-ili-smrt.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Sarajevo ili Smrt', text: full_text, files: [file] });
        return;
      }
    } catch (e) {
      // Fall through to URL share
    }
  }

  // Try Web Share API without file
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Sarajevo ili Smrt', text: full_text, url: AVALA_CTA.button_url });
      return;
    } catch (e) {
      // Fall through to clipboard
    }
  }

  // Fallback: clipboard
  try {
    await navigator.clipboard.writeText(full_text);
    _showShareFeedback('Kopirano u clipboard! Podjeli gdje hoćeš.');
  } catch {
    _showShareFeedback('Share: ' + full_text);
  }
}

// ----------------------------------------------------------------
//  Private draw helpers
// ----------------------------------------------------------------

function _drawBackground(ctx, state) {
  // Dark gradient with kvart color accent
  const kvart = state.active_session?.kvart ?? 'bascarsija';
  const kvart_colors = { bascarsija: COLORS.BASCARSIJA, marijin_dvor: COLORS.MARIJIN_DVOR, grbavica: COLORS.GRBAVICA };
  const accent = kvart_colors[kvart] ?? COLORS.BASCARSIJA;

  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  grad.addColorStop(0, '#0a0a14');
  grad.addColorStop(0.7, '#12121f');
  grad.addColorStop(1, accent + '44');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Border glow
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, CARD_W - 4, CARD_H - 4);

  // Inner border
  ctx.strokeStyle = accent + '44';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, CARD_W - 16, CARD_H - 16);
}

function _drawLogo(ctx) {
  ctx.save();
  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = COLORS.PRIMARY;
  ctx.fillText('SARAJEVO ILI SMRT', 24, 48);

  ctx.font = '13px monospace';
  ctx.fillStyle = COLORS.TEAL;
  ctx.fillText('Gari Daily Games — Idle/Incremental DJ Sim', 24, 68);
  ctx.restore();
}

function _drawDJInfo(ctx, data) {
  ctx.save();
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = COLORS.WHITE;
  ctx.fillText(data.dj_title, 24, 108);

  // Prestige stars
  const stars = '★'.repeat(data.prestige_level) + '☆'.repeat(2 - data.prestige_level);
  ctx.font = '16px monospace';
  ctx.fillStyle = COLORS.GOLD;
  ctx.fillText(`Prestige ${data.prestige_level} ${stars}`, 24, 132);
  ctx.restore();
}

function _drawStats(ctx, data) {
  ctx.save();
  const stats = [
    { label: 'Total LP',   value: _formatNumber(data.total_lp) },
    { label: 'DK',         value: data.dk.toString() },
    { label: 'Prestige',   value: `P${data.prestige_level}` }
  ];

  if (data.last_session_lp !== null) {
    stats.unshift({ label: `Sesija (${data.last_session_kvart})`, value: _formatNumber(data.last_session_lp) + ' LP' });
  }

  let x = 24;
  const y = 165;
  for (const s of stats) {
    const bw = 120;
    // Box background
    ctx.fillStyle = '#ffffff11';
    ctx.fillRect(x, y - 16, bw, 40);
    ctx.strokeStyle = '#ffffff22';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 16, bw, 40);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = COLORS.TEAL;
    ctx.fillText(s.value, x + 8, y + 5);
    ctx.font = '10px monospace';
    ctx.fillStyle = COLORS.DIM;
    ctx.fillText(s.label, x + 8, y + 20);
    x += bw + 10;
  }
  ctx.restore();
}

function _drawKvarts(ctx, data) {
  ctx.save();
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = COLORS.WHITE;
  ctx.fillText('Mahale:', 24, 230);

  const kvart_colors = { 'Baščaršija': COLORS.BASCARSIJA, 'Marijin Dvor': COLORS.MARIJIN_DVOR, 'Grbavica': COLORS.GRBAVICA };
  let x = 24;
  for (const kd of data.kvarts) {
    const color = kvart_colors[kd.name] ?? COLORS.TEAL;
    ctx.fillStyle = color + 'aa';
    ctx.fillRect(x, 238, 160, 44);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, 238, 160, 44);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillText(kd.name, x + 8, 256);

    // Rep bar
    const bar_w = 144;
    const bar_h = 6;
    ctx.fillStyle = '#ffffff22';
    ctx.fillRect(x + 8, 264, bar_w, bar_h);
    ctx.fillStyle = color;
    ctx.fillRect(x + 8, 264, Math.round(bar_w * kd.rep / 100), bar_h);

    ctx.font = '10px monospace';
    ctx.fillStyle = COLORS.DIM;
    ctx.fillText(`Rep: ${kd.rep}  ${kd.label}`, x + 8, 278);

    x += 172;
  }
  ctx.restore();
}

function _drawAvalaCTA(ctx) {
  ctx.save();
  const y = 308;
  ctx.fillStyle = COLORS.PRIMARY + 'cc';
  ctx.fillRect(24, y, CARD_W - 48, 46);
  ctx.strokeStyle = COLORS.PRIMARY;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, y, CARD_W - 48, 46);

  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = COLORS.WHITE;
  ctx.fillText(AVALA_CTA.visible_text, 36, y + 18);
  ctx.font = '12px monospace';
  ctx.fillStyle = COLORS.GOLD;
  ctx.fillText(AVALA_CTA.button_text + '  ' + AVALA_CTA.button_url, 36, y + 37);
  ctx.restore();
}

function _drawBranding(ctx) {
  ctx.save();
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = COLORS.PRIMARY;
  ctx.textAlign = 'right';
  ctx.fillText(KLUBOSLAVIJA_BRAND.logo_text, CARD_W - 24, CARD_H - 28);
  ctx.font = '11px monospace';
  ctx.fillStyle = COLORS.DIM;
  ctx.fillText(KLUBOSLAVIJA_BRAND.tagline, CARD_W - 24, CARD_H - 14);
  ctx.textAlign = 'left';
  ctx.restore();
}

function _drawHashtags(ctx, data) {
  ctx.save();
  ctx.font = '11px monospace';
  ctx.fillStyle = COLORS.TEAL + 'aa';
  ctx.fillText(data.hashtags, 24, CARD_H - 14);
  ctx.restore();
}

// ----------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------

async function _dataURLToBlob(data_url) {
  const res = await fetch(data_url);
  return res.blob();
}

function _showShareFeedback(msg) {
  let el = document.getElementById('share-feedback');
  if (!el) {
    el = document.createElement('div');
    el.id = 'share-feedback';
    el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#FF3366;color:#fff;padding:10px 20px;border-radius:8px;font-family:monospace;z-index:9999;pointer-events:none;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

function _formatNumber(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}
