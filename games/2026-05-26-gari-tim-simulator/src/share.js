// share.js — shareResult(), copyToClipboard(), buildShareCard()

export function buildShareText(endingData, shareText) {
  return `Gari Tim Simulator — ${endingData.title}\n\n${shareText}\n\nhttps://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/`;
}

export async function shareResult(endingData, shareTextStr) {
  const text = buildShareText(endingData, shareTextStr);

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Gari Tim Simulator — ${endingData.title}`,
        text: text,
        url: 'https://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/',
      });
      return { success: true, method: 'share' };
    } catch (e) {
      // Fallback to clipboard
    }
  }

  // Clipboard fallback
  return copyToClipboard(text);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard' };
  } catch (e) {
    // Legacy fallback
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return { success: true, method: 'execCommand' };
    } catch (e2) {
      return { success: false, method: 'none' };
    }
  }
}

export function showCopyFeedback(message = 'Kopirano!') {
  const el = document.getElementById('copy-feedback');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2000);
}
