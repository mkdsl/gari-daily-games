/**
 * share.js — Season end-card generator (Canvas 1200x630) + Web Share API + PNG fallback
 */

import { bus, EVT } from './events.js';
import { BRAND } from './content/brand-hooks.js';
import { classifySatisfaction } from './micro/satisfaction-calc.js';
import { formatPct, formatEur } from './utils.js';
import { COLORS } from './config.js';

/**
 * Generiše share card Canvas 1200x630 i triguje share
 * @param {Object} result — session result
 * @param {Object} metaState
 */
export async function generateAndShare(result, metaState) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  drawShareCard(ctx, result, metaState);

  // Pokušaj Web Share API
  canvas.toBlob(async (blob) => {
    if (navigator.share && navigator.canShare && blob) {
      const file = new File([blob], 'zemlja-i-znanje.png', { type: 'image/png' });
      try {
        await navigator.share({
          title: 'Zemlja i Znanje — Guncati Masterclass',
          text: `Završio sam sezonu sa ${formatPct(result.avgSatisfaction)} zadovoljstva! ${BRAND.cta}`,
          url: 'https://mkdsl.github.io/gari-daily-games/games/2026-06-07-zemlja-i-znanje/',
          files: [file]
        });
        bus.emit(EVT.SHARE_DONE, { success: true });
        return;
      } catch {}
    }

    // Fallback: download PNG
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zemlja-i-znanje-sezona.png';
    a.click();
    URL.revokeObjectURL(url);
    bus.emit(EVT.SHARE_DONE, { success: true, download: true });
  }, 'image/png');
}

function drawShareCard(ctx, result, metaState) {
  const W = 1200, H = 630;

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#1A2416');
  grad.addColorStop(0.5, '#2A3A1E');
  grad.addColorStop(1, '#1A2416');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = '#4A6741';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // Inner border
  ctx.strokeStyle = '#F4C430';
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Title
  ctx.fillStyle = '#F4C430';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Zemlja i Znanje', W / 2, 100);

  ctx.fillStyle = '#C4956A';
  ctx.font = '28px Georgia, serif';
  ctx.fillText('Guncati Masterclass Simulator', W / 2, 148);

  // Divider
  ctx.strokeStyle = '#4A6741';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 170);
  ctx.lineTo(W - 100, 170);
  ctx.stroke();

  // Tema
  ctx.fillStyle = '#E8E0D0';
  ctx.font = '36px sans-serif';
  ctx.fillText(`Tema: ${result.tema || 'Masterclass'}`, W / 2, 230);

  // Big satisfaction
  const cls = classifySatisfaction(result.avgSatisfaction || 0);
  ctx.fillStyle = cls.color;
  ctx.font = 'bold 100px Georgia, serif';
  ctx.fillText(`${cls.grade}`, W / 2, 360);

  ctx.fillStyle = '#F2EDE4';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(formatPct(result.avgSatisfaction || 0), W / 2, 420);

  // Stats row
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#C4956A';
  const stats = [
    `👥 ${result.participantsFinished || 0} polaznika`,
    `⚡ ${result.incidentCount || 0} incidenta`,
    `📚 ${result.totalLearned || 0}% naučeno`,
    `🌿 ${Math.round(metaState?.reputation || 0)} rep`
  ];
  stats.forEach((s, i) => {
    ctx.fillText(s, W / 2 - 400 + i * 270, 480);
  });

  // Brand
  ctx.fillStyle = '#4A6741';
  ctx.font = '22px sans-serif';
  ctx.fillText(BRAND.tagline, W / 2, 550);
  ctx.fillStyle = '#F4C430';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(BRAND.link, W / 2, 582);

  ctx.textAlign = 'left';
}

/**
 * Mount share button na container
 */
export function mountShareButton(container, result, metaState) {
  if (!metaState?.shareCardUnlocked && (metaState?.reputation || 0) < 500) return;

  const btn = document.createElement('button');
  btn.className = 'btn-share';
  btn.innerHTML = '📤 Podeli rezultat';
  btn.addEventListener('click', () => generateAndShare(result, metaState));
  container.appendChild(btn);
}
