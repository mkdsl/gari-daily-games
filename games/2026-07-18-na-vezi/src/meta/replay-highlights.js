/** Highlight scoring i selekcija posle emisije */
import { addHighlight, getState } from '../state.js';
import { emit, EVENTS } from '../events.js';

/**
 * Procesira highlights iz emisijaResult i čuva u state
 * @param {Object} emisijaResult
 * @returns {Array} sačuvani highlights
 */
export function processAndSaveHighlights(emisijaResult) {
  const { highlights, week } = emisijaResult;
  if (!highlights || highlights.length === 0) return [];

  const saved = [];
  for (const h of highlights) {
    const highlight = {
      ...h,
      week,
      savedAt: Date.now(),
    };
    addHighlight(highlight);
    saved.push(highlight);
    emit(EVENTS.HIGHLIGHT_SCORED, { highlight });
  }
  return saved;
}

/**
 * Vraća poslednjih N highlight-a iz state
 * @param {number} n
 * @returns {Array}
 */
export function getRecentHighlights(n = 10) {
  const state = getState();
  return (state.highlights || []).slice(-n).reverse();
}

/**
 * Vraća highlight-e iz poslednje emisije
 * @param {number} week
 * @returns {Array}
 */
export function getHighlightsForWeek(week) {
  const state = getState();
  return (state.highlights || []).filter(h => h.week === week);
}

/**
 * Formatira highlight za prikaz
 * @param {Object} highlight
 * @returns {Object}
 */
export function formatHighlight(highlight) {
  const momentLabels = {
    alarm_resolved_ontime:    { label: 'Alarm Rešen',        icon: '⚡' },
    alarm_chain_broken:       { label: 'Lanac Prekinut',     icon: '⛓' },
    tiktok_spike_caught:      { label: 'TikTok Spike!',      icon: '🚀' },
    tiktok_spike:             { label: 'TikTok Aktiviran',   icon: '📈' },
    guest_standout:           { label: 'Gost Blistao',       icon: '⭐' },
    battery_critical_survived:{ label: 'Baterija Preživela', icon: '🔋' },
    signal_stable_full:       { label: 'Signal Stabilan',    icon: '📡' },
  };

  const meta = momentLabels[highlight.moment_type] || { label: 'Poseban Momenat', icon: '🎯' };
  return {
    ...highlight,
    label: meta.label,
    icon: meta.icon,
    scoreLabel: `+${Math.round(highlight.score)} pts`,
  };
}

/**
 * Skor sesije (zbir svih highlight score-ova)
 * @param {Array} highlights
 * @returns {number}
 */
export function calcSessionHighlightScore(highlights) {
  return highlights.reduce((sum, h) => sum + (h.score || 0), 0);
}
