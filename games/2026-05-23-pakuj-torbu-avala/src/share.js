// Web Share API + clipboard fallback
import { BRAND } from './content/brand_hooks.js';

export async function shareScore(score, grade, level) {
  const text = `Spakovao sam torbu za Avalu! ${grade.emoji} Score: ${score} bodova (Nivo ${level}/5)\n${BRAND.hashtag} ${BRAND.biletUrl}`;
  const url = `https://mkdsl.github.io/gari-daily-games/games/2026-05-23-pakuj-torbu-avala/`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Pakuj Torbu — Avala Edition',
        text,
        url,
      });
      return 'shared';
    } catch {
      // Fallback to clipboard
    }
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
