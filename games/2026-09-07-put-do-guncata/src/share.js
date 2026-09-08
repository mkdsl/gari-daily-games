/**
 * @module share — cross-event glue (Pasoš integration hook)
 * Wraps share-card.js and exposes a cross-game compatible share API.
 */
import { PLAY_URL } from './content/brand_hooks.js';

/** @type {string} slug for Pasoš SDK whitelist */
export const GAME_SLUG = '2026-09-07-put-do-guncata';

/**
 * Share result to system share sheet or clipboard.
 * @param {{ score: number, bucket: string, route: string }} result
 */
export async function shareResult(result) {
  const text = `Stigao sam do Guncatija! Pripremljenost: ${result.score}% — ${_bucketLabel(result.bucket)}`;
  const url = PLAY_URL;

  try {
    if (navigator.share) {
      await navigator.share({ title: 'Put do Guncata', text, url });
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      return { method: 'clipboard' };
    }
    return { method: 'native' };
  } catch {
    return { method: 'failed' };
  }
}

/**
 * Fire Pasoš SDK stamp event if SDK is loaded on the page.
 * No-op if SDK absent (safe cross-page call).
 * @param {{ score: number, bucket: string }} result
 */
export function firePassportStamp(result) {
  if (typeof window.__pasosSDK === 'undefined') return;
  try {
    window.__pasosSDK.stamp(GAME_SLUG, {
      score: result.score,
      bucket: result.bucket,
      ts: Date.now()
    });
  } catch { /* SDK not ready */ }
}

function _bucketLabel(bucket) {
  return bucket === 'green' ? 'Spreman!' : bucket === 'yellow' ? 'Stigao sam.' : 'Barem sam probao!';
}
