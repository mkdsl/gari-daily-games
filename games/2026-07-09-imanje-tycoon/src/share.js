import { formatDin } from './economy/market.js';

/**
 * Share game results using Web Share API or fallback to clipboard.
 */
export async function shareResults(state) {
  const text = buildShareText(state);
  const url = 'https://mkdsl.github.io/gari-daily-games/games/2026-07-09-imanje-tycoon/';

  // Try Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Imanje Tycoon — Guncati',
        text,
        url,
      });
      return { success: true, method: 'share' };
    } catch (err) {
      // User cancelled or not supported
    }
  }

  // Fallback: copy to clipboard
  const fullText = `${text}\n${url}`;
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(fullText);
      return { success: true, method: 'clipboard' };
    } catch (_) {}
  }

  // Final fallback: select in text area
  const ta = document.createElement('textarea');
  ta.value = fullText;
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return { success: true, method: 'execCommand' };
}

function buildShareText(state) {
  const phase = { '0': 'Start', A: 'Rast', B: 'Ekspanzija', C: 'Prestiž' }[state.phase] || state.phase;
  const lines = [
    `🌿 Imanje Tycoon — Guncati @MKDSLend`,
    `💰 Kapital: ${formatDin(state.capital)}`,
    `📈 Prihod ukupno: ${formatDin(state.totalRevenue)}`,
    `🏷️ Faza ${state.phase} — ${phase} | Sezona ${state.season}`,
  ];

  if (state.mushrooms.revenueEarned > 0) {
    lines.push(`🍄 Pečurke: ${formatDin(state.mushrooms.revenueEarned)}`);
  }
  if (state.greenhouse.unlocked) {
    lines.push(`🌱 Plastenik: ${formatDin(state.greenhouse.revenueEarned)}`);
  }
  if (state.fishpond.unlocked) {
    lines.push(`🐟 Jezero: ${formatDin(state.fishpond.revenueEarned)}`);
  }
  if (state.prestige.count > 0) {
    lines.push(`⭐ Prestiži: ${state.prestige.count}× | Yield: ${state.prestige.yieldMultiplier.toFixed(2)}×`);
  }
  if (state.unlockedAchievements.length > 0) {
    lines.push(`🏆 Achievements: ${state.unlockedAchievements.length}/25`);
  }

  return lines.join('\n');
}

/** Create an achievement card image for sharing (simple DOM-based card) */
export function createShareCard(state) {
  const card = document.createElement('div');
  card.className = 'share-card';
  card.style.cssText = `
    position:fixed; top:-9999px; left:-9999px;
    width:400px; padding:24px;
    background:linear-gradient(135deg, #1A1208, #2E2214);
    color:#F0E8D5; font-family:sans-serif; border-radius:16px;
    border:2px solid #4A7C3F;
  `;
  card.innerHTML = `
    <div style="font-size:24px; margin-bottom:12px;">🌿 Imanje Tycoon</div>
    <div style="font-size:36px; color:#D4A017; font-weight:bold;">${formatDin(state.totalRevenue)}</div>
    <div style="color:#A09078; margin-top:4px;">Ukupni prihod | Faza ${state.phase} | Sezona ${state.season}</div>
    <div style="margin-top:16px; font-size:14px; color:#6AA356;">mkdsl.github.io/gari-daily-games</div>
  `;
  document.body.appendChild(card);
  return card;
}
