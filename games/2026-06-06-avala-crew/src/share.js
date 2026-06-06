/**
 * share.js — Share card generator + Web Share API + PNG fallback
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { getMemberById } from './content/crew_data.js';
import { OUTCOME_LABELS, OUTCOME_COLORS, TICKETING_URL, PLAY_URL } from './config.js';

/**
 * Generate a 1200×630px share card canvas
 * Layout:
 *   Top: "#AvalaCrew — 20. jun 2026" header, dark background
 *   Middle: 5 crew member pills (name + role) in 2 rows
 *   Bottom: Night Score color + outcome label
 *   Bottom-right: Kluboslavija branding + bilet.rs CTA
 *
 * @param {Array<{memberId: string, role: string}>} crew - Active crew (5 members)
 * @param {number} nightScore - 0-100
 * @param {'legendary'|'good'|'survived'|'kaos'} outcome
 * @param {number} nightNumber - Completed nights count
 * @returns {Promise<string>} data URL (PNG)
 */
export async function generateShareCard(crew, nightScore, outcome, nightNumber) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  // ── Background ──────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 630);
  bgGrad.addColorStop(0, '#0d1f0d');
  bgGrad.addColorStop(0.5, '#0e1a2e');
  bgGrad.addColorStop(1, '#0d1f0d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // ── Grid pattern overlay (subtle) ────────────────────────────
  ctx.strokeStyle = 'rgba(57, 255, 20, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1200; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 630);
    ctx.stroke();
  }
  for (let y = 0; y < 630; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }

  // ── Top header ───────────────────────────────────────────────
  ctx.fillStyle = '#39ff14';
  ctx.font = 'bold 38px system-ui, sans-serif';
  ctx.fillText('#AvalaCrew', 60, 72);

  ctx.fillStyle = '#9dbc9d';
  ctx.font = '28px system-ui, sans-serif';
  ctx.fillText('Kluboslavija · 20. jun 2026', 60, 115);

  // Separator line
  ctx.strokeStyle = '#39ff14';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 135);
  ctx.lineTo(1140, 135);
  ctx.stroke();

  // ── Crew pills ───────────────────────────────────────────────
  const roleLabels = {
    navigator: 'Navigator',
    hype: 'Hype',
    logistics: 'Logistika',
    dance_captain: 'Kapetan poda',
    anchor: 'Sidro'
  };

  const pillWidth = 330;
  const pillHeight = 80;
  const pillGap = 20;
  const pillRadius = 12;
  const startY = 165;

  crew.slice(0, 5).forEach((slot, i) => {
    const member = getMemberById(slot.memberId);
    if (!member) return;

    const col = i % 3;
    const row = Math.floor(i / 3);
    const xOffset = row === 1 && crew.length - row * 3 === 2 ? (pillWidth + pillGap) / 2 : 0;
    const x = 60 + col * (pillWidth + pillGap) + xOffset;
    const y = startY + row * (pillHeight + pillGap);

    // Pill background
    ctx.fillStyle = member.portraitColor + '22';
    ctx.strokeStyle = member.portraitColor;
    ctx.lineWidth = 2;
    _roundRect(ctx, x, y, pillWidth, pillHeight, pillRadius);
    ctx.fill();
    ctx.stroke();

    // Emoji
    ctx.font = '36px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(member.portraitEmoji, x + 16, y + 52);

    // Name
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = member.portraitColor;
    ctx.fillText(member.name.split(' ')[0], x + 66, y + 36);

    // Role
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#9dbc9d';
    ctx.fillText(roleLabels[slot.role] || slot.role, x + 66, y + 62);
  });

  // ── Night Score section ───────────────────────────────────────
  const scoreColor = OUTCOME_COLORS[outcome] || '#ffffff';
  const outcomeText = OUTCOME_LABELS[outcome] || outcome;

  ctx.fillStyle = scoreColor;
  ctx.font = 'bold 90px system-ui, sans-serif';
  ctx.fillText(`${nightScore}`, 60, 510);

  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillText('/100', 200, 510);

  ctx.font = '28px system-ui, sans-serif';
  ctx.fillStyle = '#e8f5e8';
  ctx.fillText(outcomeText, 60, 552);

  ctx.font = '20px system-ui, sans-serif';
  ctx.fillStyle = '#9dbc9d';
  ctx.fillText(`Noć ${nightNumber}`, 60, 588);

  // ── Right side — CTA block ────────────────────────────────────
  // Kluboslavija branding box
  const ctaX = 820;
  const ctaY = 440;
  const ctaW = 320;
  const ctaH = 140;

  ctx.fillStyle = 'rgba(57, 255, 20, 0.08)';
  ctx.strokeStyle = '#39ff14';
  ctx.lineWidth = 2;
  _roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = '#39ff14';
  ctx.fillText('KLUBOSLAVIJA', ctaX + 20, ctaY + 34);

  ctx.font = '17px system-ui, sans-serif';
  ctx.fillStyle = '#e8f5e8';
  ctx.fillText('Prava Avala je 20. juna.', ctaX + 20, ctaY + 65);
  ctx.fillText('Sastaviš pravu ekipu →', ctaX + 20, ctaY + 88);

  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillStyle = '#ff8c42';
  ctx.fillText('bilet.rs/show/261', ctaX + 20, ctaY + 116);

  // Game URL bottom right
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#4df5ff';
  ctx.fillText('🎮 mkdsl.github.io/gari-daily-games', 820, 610);

  return canvas.toDataURL('image/png');
}

/**
 * Share the crew card using Web Share API or fallback
 * @param {string} dataUrl - PNG data URL
 * @param {number} nightScore
 * @param {'legendary'|'good'|'survived'|'kaos'} outcome
 */
export async function shareCrewCard(dataUrl, nightScore, outcome) {
  const outcomeText = OUTCOME_LABELS[outcome] || outcome;
  const shareText = `Moja Avala Crew — Noć Score: ${nightScore}/100 — ${outcomeText} 🎉\nKluboslavija 20. jun 2026 → ${TICKETING_URL}`;

  // Check Web Share API support
  if (navigator.share && navigator.canShare) {
    try {
      // Convert data URL to blob
      const blob = await dataUrlToBlob(dataUrl);
      const file = new File([blob], 'avala-crew.png', { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Avala Crew — Kluboslavija 2026',
          text: shareText,
          files: [file]
        });
        return { method: 'web-share-files' };
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('[Share] File share failed, trying URL share:', err);
      } else {
        return { method: 'aborted' };
      }
    }

    // Fallback to text+URL share
    try {
      await navigator.share({
        title: 'Avala Crew — Kluboslavija 2026',
        text: shareText,
        url: PLAY_URL
      });
      return { method: 'web-share-url' };
    } catch (err) {
      if (err.name === 'AbortError') return { method: 'aborted' };
      console.warn('[Share] URL share failed:', err);
    }
  }

  // Fallback: copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareText + '\n' + PLAY_URL);
      return { method: 'clipboard', message: 'Tekst kopiran u klipbord!' };
    } catch {}
  }

  // Last resort: open image in new tab for manual save
  openShareImageTab(dataUrl, shareText);
  return { method: 'new-tab' };
}

/**
 * Open share image in new tab with download prompt
 * @param {string} dataUrl
 * @param {string} shareText
 */
export function openShareImageTab(dataUrl, shareText) {
  const win = window.open('', '_blank');
  if (!win) return;

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>Avala Crew Share</title>
    <style>
      body { background: #0d1f0d; color: #e8f5e8; font-family: system-ui; text-align: center; padding: 20px; }
      img { max-width: 100%; border: 2px solid #39ff14; border-radius: 8px; }
      p { color: #9dbc9d; }
      .btn { background: #39ff14; color: #0d1f0d; padding: 12px 24px; border: none; border-radius: 6px;
             font-size: 16px; cursor: pointer; font-weight: bold; margin: 8px; text-decoration: none; display: inline-block; }
    </style>
    </head>
    <body>
      <h1>#AvalaCrew</h1>
      <p>${shareText.replace(/\n/g, '<br>')}</p>
      <img src="${dataUrl}" alt="Avala Crew Share Card">
      <br>
      <a class="btn" href="${dataUrl}" download="avala-crew.png">⬇ Sačuvaj sliku</a>
      <a class="btn" href="${TICKETING_URL}" target="_blank">🎟 Avala karte</a>
    </body>
    </html>
  `);
  win.document.close();
}

/**
 * Convert data URL to Blob
 * @param {string} dataUrl
 * @returns {Promise<Blob>}
 */
async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * Draw rounded rectangle path (Canvas utility)
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - radius
 */
function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
