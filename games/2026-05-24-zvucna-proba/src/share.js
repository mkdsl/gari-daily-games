// share.js — Web Share API + clipboard fallback
import { getShareText } from './content/brand_hooks.js';

export async function shareResult(score, streak, rank) {
  const text = getShareText(score, streak, rank);

  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (err) {
      if (err.name !== 'AbortError') {
        return copyToClipboard(text);
      }
      return 'aborted';
    }
  } else {
    return copyToClipboard(text);
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    // Fallback: textarea trick
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return 'copied_fallback';
  }
}
