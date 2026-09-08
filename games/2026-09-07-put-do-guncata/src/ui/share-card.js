/**
 * share-card.js — share card render (canvas 600×315) + Web Share API
 */

import { PLAY_URL } from '../content/brand_hooks.js';

const CARD_W = 600;
const CARD_H = 315;

/** Boje po score bucketu */
const BUCKET_COLORS = {
  green:  { bg: '#1a2e28', accent: '#5a9a4a', icon: '🌿' },
  yellow: { bg: '#2a1e10', accent: '#f5a030', icon: '⏰' },
  humor:  { bg: '#2a1018', accent: '#e85a3a', icon: '🗺️' }
};

// ============================================================
// Canvas render
// ============================================================

/**
 * Renderuje share card na HTML canvas elementu.
 * @param {HTMLCanvasElement} canvas
 * @param {{ score: number, scoreBucket: string, route: string }} cardState
 */
export function renderShareCard(canvas, cardState) {
  const { score, scoreBucket = 'green', route = 'sigurnije' } = cardState;
  const colors = BUCKET_COLORS[scoreBucket] || BUCKET_COLORS.green;

  canvas.width  = CARD_W;
  canvas.height = CARD_H;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Gradient overlay
  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  grad.addColorStop(0, 'rgba(0,0,0,0.15)');
  grad.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Accent bar (leva ivica)
  ctx.fillStyle = colors.accent;
  ctx.fillRect(0, 0, 6, CARD_H);

  // === Ikonica (bucket) ===
  ctx.font = '72px serif';
  ctx.textAlign = 'right';
  ctx.globalAlpha = 0.85;
  ctx.fillText(colors.icon, CARD_W - 36, CARD_H / 2 + 24);
  ctx.globalAlpha = 1;

  // === Naslov igre ===
  ctx.fillStyle = 'rgba(232,220,200,0.6)';
  ctx.font = '600 13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PUT DO GUNCATA', 36, 48);

  // === Score ===
  ctx.fillStyle = colors.accent;
  ctx.font = `700 80px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.round(score)}%`, 36, CARD_H / 2 + 18);

  // Score label
  ctx.fillStyle = 'rgba(232,220,200,0.55)';
  ctx.font = '500 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('PRIPREMLJENOST', 36, CARD_H / 2 + 40);

  // === Tagline ===
  ctx.fillStyle = '#e8dcc8';
  ctx.font = '500 18px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Stigao sam do Guncatija!', 36, CARD_H - 68);

  // Ruta info
  const routeLabels = { brze: '⚡ Brzi put', slikovitije: '🌿 Slikovitiji put', sigurnije: '🛡️ Sigurniji put' };
  ctx.fillStyle = 'rgba(232,220,200,0.5)';
  ctx.font = '400 13px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(routeLabels[route] || '', 36, CARD_H - 48);

  // === URL ===
  ctx.fillStyle = 'rgba(232,220,200,0.4)';
  ctx.font = '400 12px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left';
  const shortUrl = PLAY_URL.replace('https://', '');
  ctx.fillText(shortUrl, 36, CARD_H - 24);

  // Corner decoration
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.2;
  ctx.strokeRect(6, 0, CARD_W - 6, CARD_H);
  ctx.globalAlpha = 1;
}

// ============================================================
// Share widget
// ============================================================

/**
 * Kreira share card widget (canvas + dugme) i mountuje ga u container.
 *
 * @param {HTMLElement} container
 * @param {{ score: number, scoreBucket: string, route: string }} cardState
 * @returns {{ canvas: HTMLCanvasElement, button: HTMLButtonElement }}
 */
export function mountShareWidget(container, cardState) {
  const wrap = document.createElement('div');
  wrap.className = 'share-card-wrap';

  const canvas = document.createElement('canvas');
  canvas.className = 'share-card-canvas';
  canvas.setAttribute('aria-label', `Share kartica — pripremljenost ${Math.round(cardState.score)}%`);

  const btn = document.createElement('button');
  btn.className = 'btn-primary btn-share';
  btn.textContent = '📤 Podeli rezultat';
  btn.setAttribute('type', 'button');

  wrap.appendChild(canvas);
  wrap.appendChild(btn);
  container.appendChild(wrap);

  // Render canvas
  renderShareCard(canvas, cardState);

  // Share handler
  btn.addEventListener('click', async () => {
    await handleShare(canvas, cardState, btn);
  });

  return { canvas, button: btn };
}

// ============================================================
// Share logic
// ============================================================

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ score: number, scoreBucket: string }} cardState
 * @param {HTMLButtonElement} btn
 */
async function handleShare(canvas, cardState, btn) {
  const score = Math.round(cardState.score);
  const shareText = `Stigao sam do Guncatija sa ${score}% pripremljenosti! 🎮 Put do Guncata`;
  const shareUrl  = PLAY_URL;

  // Pokušaj Web Share API sa slikom
  if (navigator.share) {
    try {
      // Pokušaj sa canvas blob-om
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'put-do-guncata.png', { type: 'image/png' });

      const shareData = {
        title: 'Put do Guncata',
        text: shareText,
        url: shareUrl
      };

      // Dodaj sliku samo ako canShare to podržava
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }

      await navigator.share(shareData);
      return;
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.warn('[share] Web Share failed, fallback na clipboard:', e);
        // Fallback na clipboard
      } else {
        return; // Korisnik odbio — tiho izađi
      }
    }
  }

  // Fallback: kopiraj link u clipboard
  try {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    btn.textContent = '✓ Link kopiran';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📤 Podeli rezultat';
      btn.classList.remove('copied');
    }, 2500);
  } catch (clipErr) {
    console.warn('[share] Clipboard API nije dostupan:', clipErr);
    // Last resort: selektuj URL text
    btn.textContent = shareUrl;
    btn.select && btn.select();
  }
}

// ============================================================
// Utility
// ============================================================

/**
 * Promise wrapper za canvas.toBlob().
 * @param {HTMLCanvasElement} canvas
 * @param {string} [type='image/png']
 * @param {number} [quality=0.92]
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob returned null'));
    }, type, quality);
  });
}
