/**
 * @module share — cross-event glue (Pasoš integration hook)
 * Wraps share-card.js and exposes a cross-game compatible share API.
 */
import { PLAY_URL, GUNCATI_GRAND_SHARE } from './content/brand_hooks.js';

/** @type {string} slug for Pasoš SDK whitelist */
export const GAME_SLUG = '2026-09-07-put-do-guncata';

/**
 * Share result to system share sheet or clipboard.
 * Uses Guncati Grand event copy when in the Grand period (sept-okt 2026).
 * @param {{ score: number, bucket: string, route: string }} result
 */
export async function shareResult(result) {
  const grandActive = _isGrandPeriod();
  let text, url;

  if (grandActive) {
    const template = GUNCATI_GRAND_SHARE.texts[result.bucket] || GUNCATI_GRAND_SHARE.texts.yellow;
    text = template.replace('{score}', Math.round(result.score));
    url = GUNCATI_GRAND_SHARE.url;
  } else {
    text = `Stigao sam do Guncatija! Pripremljenost: ${result.score}% — ${_bucketLabel(result.bucket)}`;
    url = PLAY_URL;
  }

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

function _isGrandPeriod() {
  try {
    const now = new Date().toISOString().slice(0, 10);
    return now >= GUNCATI_GRAND_SHARE.periodStart && now <= GUNCATI_GRAND_SHARE.periodEnd;
  } catch { return false; }
}
