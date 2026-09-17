/** @module share — html2canvas + Web Share API */

/**
 * Capture the #game-root element as a canvas screenshot
 * @returns {Promise<string>} data URL
 */
async function captureScreenshot() {
  const el = document.getElementById('game-root');
  if (!el) throw new Error('No #game-root');

  // Try html2canvas from CDN if available
  if (typeof html2canvas !== 'undefined') {
    const canvas = await html2canvas(el, {
      backgroundColor: '#0d1b2a',
      scale: 1,
      useCORS: true,
    });
    return canvas.toDataURL('image/png');
  }

  // Fallback: canvas text card
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx2d = canvas.getContext('2d');
  ctx2d.fillStyle = '#0d1b2a';
  ctx2d.fillRect(0, 0, 600, 400);
  ctx2d.fillStyle = '#ffffff';
  ctx2d.font = 'bold 32px system-ui';
  ctx2d.textAlign = 'center';
  ctx2d.fillText('Turneja Planer', 300, 80);
  ctx2d.font = '20px system-ui';
  ctx2d.fillStyle = '#52b788';
  ctx2d.fillText('Kluboslavija 2026', 300, 130);
  return canvas.toDataURL('image/png');
}

/**
 * Generate share text from game state
 * @param {{ ending_id: string, resources: Object, city_results: Object[] }} state
 * @returns {string}
 */
function buildShareText(state) {
  const endingLabels = {
    TURNEJA_LEGENDA: '🏆 TURNEJA LEGENDA',
    ZAVRSENO_I_PLACENO: '✅ Završeno i plaćeno',
    POREZ_I_DUG: '💸 Porez i dug',
    GUNCATI_ZATVOREN: '🚧 Guncati zatvoren',
  };
  const ending = endingLabels[state.ending_id] || state.ending_id;
  const rep = state.resources.reputation.toFixed(1);
  const budget = Math.round(state.resources.budget);
  const reach = state.resources.reach.toFixed(1);

  return `🎧 Turneja Planer — Kluboslavija 2026\n${ending}\nReputacija: ${rep}/10 | Budžet: ${budget}€ | Reach: ${reach}k\nIgraj na: https://mkdsl.github.io/gari-daily-games/games/2026-09-15-turneja-planer/`;
}

/**
 * Share result using Web Share API with fallback to clipboard
 * @param {{ ending_id: string, resources: Object, city_results: Object[] }} state
 */
export async function shareResult(state) {
  const text = buildShareText(state);

  try {
    let dataUrl;
    try {
      dataUrl = await captureScreenshot();
    } catch (e) {
      dataUrl = null;
    }

    if (navigator.share) {
      const shareData = { title: 'Turneja Planer', text };
      // Try with image blob
      if (dataUrl && navigator.canShare) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], 'turneja.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (e) { /* skip image */ }
      }
      await navigator.share(shareData);
    } else {
      // Clipboard fallback
      await navigator.clipboard.writeText(text);
      showCopiedToast();
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      // Last resort: show text
      prompt('Kopiraj i podeli:', text);
    }
  }
}

/**
 * Download screenshot
 * @param {{ ending_id: string, resources: Object, city_results: Object[] }} state
 */
export async function downloadScreenshot(state) {
  try {
    const dataUrl = await captureScreenshot();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `turneja-planer-${state.ending_id}.png`;
    a.click();
  } catch (e) {
    console.warn('Screenshot failed:', e);
  }
}

function showCopiedToast() {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = '📋 Kopirano u clipboard!';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
