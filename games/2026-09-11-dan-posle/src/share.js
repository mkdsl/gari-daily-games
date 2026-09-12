/**
 * share.js — Web Share API sa fallback na clipboard
 */

import { computeCS } from './state.js';
import { shareText } from './content/aforizmi.js';

/**
 * Share rezultate igre
 * @param {GameState} state
 * @param {string} endingId
 */
export async function shareResult(state, endingId) {
  const cs = computeCS(state);
  const text = shareText(endingId, cs);
  const url = 'https://mkdsl.github.io/gari-daily-games/games/2026-09-11-dan-posle/';
  const title = 'Dan Posle — Guncati';

  if (navigator.share) {
    try {
      await navigator.share({ title, text: `${text}\n\n${url}`, url });
      return { success: true, method: 'native' };
    } catch (e) {
      if (e.name !== 'AbortError') {
        return copyToClipboard(text + '\n\n' + url);
      }
      return { success: false, method: 'aborted' };
    }
  } else {
    return copyToClipboard(text + '\n\n' + url);
  }
}

/**
 * Kopiraj tekst u clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard' };
  } catch (e) {
    // Fallback: textarea trick
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success: true, method: 'execCommand' };
  }
}

/**
 * Share za Instagram story (tekst za kopiranje)
 * @param {GameState} state
 * @param {string} endingId
 * @returns {string}
 */
export function instagramShareText(state, endingId) {
  const cs = computeCS(state);
  return shareText(endingId, cs);
}

/**
 * Generate score card text za share
 * @param {GameState} state
 * @param {string} endingId
 * @param {string} endingTitle
 * @returns {string}
 */
export function generateScoreCard(state, endingId, endingTitle) {
  const { energija, veze, secanja, nered } = state.resources;
  const cs = computeCS(state);
  return [
    `Dan Posle — ${endingTitle}`,
    ``,
    `⚡ Energija: ${energija}/10`,
    `🤝 Veze: ${veze}/10`,
    `📸 Sećanja: ${secanja}/10`,
    `🗑️ Nered: ${nered}/10`,
    ``,
    `Community Score: ${cs.toFixed(1)}`,
    ``,
    `gari-daily-games.mkdsl.github.io`
  ].join('\n');
}
