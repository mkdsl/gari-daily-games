// share.js — Web Share API + clipboard fallback

import { BRAND } from './content/brand_hooks.js';

const PLAY_URL = BRAND.PLAY_URL;

const EVENT_HASHTAGS = {
  outdoor:  '#GuncatiGrand',
  klub:     '#MKDSLend',
  intimate: '#Kluboslavija'
};

/**
 * Build the share payload string with event-type hashtag.
 * @param {number} vibeScore
 * @param {string} [eventType]
 * @returns {{ title: string, text: string, url: string }}
 */
export function buildSharePayload(vibeScore, eventType) {
  const hashtag = EVENT_HASHTAGS[eventType] || '#CrewRecruiter';
  return {
    title: `Crew Recruiter — Vibe ${vibeScore}/100`,
    text:  `Izgradi svoju ekipu za nastup. Moj score: ${vibeScore}/100. ${hashtag}\nProbaj: ${PLAY_URL}`,
    url:   PLAY_URL
  };
}

/**
 * Attempt native share, fall back to clipboard.
 * Calls onSuccess(method) or onError(err).
 * @param {number} vibeScore
 * @param {(method: 'native'|'clipboard') => void} onSuccess
 * @param {(err: Error) => void} onError
 * @param {string} [eventType]
 */
export async function shareScore(vibeScore, onSuccess, onError, eventType) {
  const payload = buildSharePayload(vibeScore, eventType);
  if (navigator.share) {
    try {
      await navigator.share(payload);
      onSuccess('native');
    } catch (err) {
      // User cancelled — not a real error, but we report it
      if (err.name !== 'AbortError') onError(err);
    }
  } else {
    const text = `${payload.text}\n${payload.url}`;
    try {
      await navigator.clipboard.writeText(text);
      onSuccess('clipboard');
    } catch (err) {
      onError(err);
    }
  }
}
