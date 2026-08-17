// systems/ending.js — Ending type logic

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
 * Return brand CTA text for the ending screen.
 * @param {'legendary'|'solid'|'weak'|'crash'} type
 * @param {string} eventType
 * @returns {string}
 */
export function getCTA(type, eventType) {
  return 'Pravi tim se gradi na Guncatiju.';
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
