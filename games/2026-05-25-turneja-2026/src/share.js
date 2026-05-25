// share.js — Web Share API + clipboard fallback

import { AVALA_CTA } from './content/brand_hooks.js';

const SHARE_URL = AVALA_CTA.url;

/**
 * Generate share text based on game result
 * @param {Object} state - full game state
 * @returns {string} share text
 */
export function buildShareText(state) {
  const fans = state.tourney.fan_base || 0;
  const cities = state.tourney.completed_events.length;
  const cityName = state.tourney.current_city || 'Avala';

  let result = '';
  if (fans >= 10000) result = '🏆 LEGENDARNO!';
  else if (fans >= 5000) result = '🔥 Odlično!';
  else if (fans >= 2500) result = '✅ Solidno!';
  else result = '🎧 Počnjem ispočetka!';

  return `${result} Odveo/la sam Kluboslavija turneju do ${formatFans(fans)} fanova! ${cities}/5 gradova. Avala 20. jun — da li si spreman? ${SHARE_URL}`;
}

function formatFans(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/**
 * Share game result using Web Share API or clipboard fallback
 * @param {Object} state
 * @returns {Promise<{shared: boolean, method: string}>}
 */
export async function shareResult(state) {
  const text = buildShareText(state);
  const shareData = {
    title: 'Kluboslavija: Turneja 2026',
    text,
    url: SHARE_URL
  };

  // Try Web Share API first
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { shared: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { shared: false, method: 'aborted' };
      }
      // Fall through to clipboard
    }
  }

  // Clipboard fallback
  const clipText = `${text}`;
  try {
    await navigator.clipboard.writeText(clipText);
    return { shared: true, method: 'clipboard' };
  } catch (err) {
    // Manual copy fallback
    try {
      const ta = document.createElement('textarea');
      ta.value = clipText;
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return { shared: true, method: 'execCommand' };
    } catch (e) {
      return { shared: false, method: 'failed' };
    }
  }
}

/**
 * Open bilet.rs URL
 */
export function openAvalaTickets() {
  window.open(AVALA_CTA.url, '_blank', 'noopener,noreferrer');
}

/**
 * Create share button DOM element
 */
export function createShareButton(state, onResult) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-accent';
  btn.textContent = '📤 PODELI REZULTAT';
  btn.style.touchAction = 'manipulation';

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = '...';
    const result = await shareResult(state);
    btn.disabled = false;
    if (result.shared) {
      btn.textContent = result.method === 'clipboard' ? '✓ KOPIRANO!' : '✓ PODELJENO!';
      setTimeout(() => { btn.textContent = '📤 PODELI REZULTAT'; }, 2500);
    } else {
      btn.textContent = '📤 PODELI REZULTAT';
    }
    if (onResult) onResult(result);
  });

  return btn;
}
