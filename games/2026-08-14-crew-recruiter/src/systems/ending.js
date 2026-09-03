// systems/ending.js — Ending type logic

import { BRAND_CTAS } from '../content/brand_hooks.js';

/**
 * @param {number} vibeScore
 * @param {boolean} [crashed] - true if vibe hit 0 before final round
 * @returns {'legendary'|'solid'|'weak'|'crash'}
 */
export function getEndingType(vibeScore, crashed = false) {
  if (crashed || vibeScore <= 0) return 'crash';
  if (vibeScore >= 80)           return 'legendary';
  if (vibeScore >= 50)           return 'solid';
  return 'weak';
}

/**
 * @param {'legendary'|'solid'|'weak'|'crash'} type
 * @returns {string}
 */
export function getTagline(type) {
  switch (type) {
    case 'legendary': return 'Crew je spreman. Svi znaju šta im je posao.';
    case 'solid':     return 'Solidno. Malo još rada na sinergiji.';
    case 'weak':      return 'Sutra probaj ponovo. Crew se gradi vremenom.';
    case 'crash':     return 'Sutra probaj ponovo. Crew se gradi vremenom.';
    default:          return '';
  }
}

/**
 * Return brand CTA for the ending screen — differentiated by tier and event type.
 * Always returns a Guncati or MKDSLend hook; never empty.
 * @param {'legendary'|'solid'|'weak'|'crash'} type
 * @param {string} [eventType] - 'outdoor' | 'klub' | 'intimate'
 * @returns {{ text: string, url: string }}
 */
export function getCTA(type, eventType) {
  const isOutdoor = eventType === 'outdoor';
  if (type === 'legendary') {
    return isOutdoor ? BRAND_CTAS.legendary_outdoor : BRAND_CTAS.legendary_default;
  }
  if (type === 'solid') {
    return isOutdoor ? BRAND_CTAS.solid_outdoor : BRAND_CTAS.solid_default;
  }
  // weak / crash — Guncati as a place that builds teams over time
  return BRAND_CTAS.weak_crash;
}

/**
 * Return emoji flair for score display.
 * @param {'legendary'|'solid'|'weak'|'crash'} type
 * @returns {string}
 */
export function getEndingEmoji(type) {
  switch (type) {
    case 'legendary': return '🏆';
    case 'solid':     return '👍';
    case 'weak':      return '💪';
    case 'crash':     return '💥';
    default:          return '';
  }
}
