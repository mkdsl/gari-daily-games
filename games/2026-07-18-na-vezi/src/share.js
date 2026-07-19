/** html2canvas fallback + Web Share API (highlight share) */
import { getState } from './state.js';

/**
 * Deli highlight reel
 * @param {string} highlightText - tekstualni opis highligtha
 */
export async function shareHighlight(highlightText) {
  const state = getState();
  const url = window.location.href;
  const title = 'Na Vezi — Guncati Televizija';
  const text = `${highlightText}\n\n📺 Emisija br. ${state.week}, Sezona ${state.prestige_count + 1}\n#GuncatiTvizija #NaVezi`;

  // Pokušaj Web Share API
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'share' };
    } catch (e) {
      // Korisnik otkazao ili nije podržano
      if (e.name !== 'AbortError') {
        return _fallbackShare(text, url);
      }
      return { success: false, cancelled: true };
    }
  }

  return _fallbackShare(text, url);
}

/**
 * Fallback — kopira u clipboard
 */
async function _fallbackShare(text, url) {
  const shareText = `${text}\n${url}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareText);
      return { success: true, method: 'clipboard' };
    } catch (e) {
      return _legacyShare(shareText);
    }
  }
  return _legacyShare(shareText);
}

/**
 * Legacy fallback — textarea select
 */
function _legacyShare(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const success = document.execCommand('copy');
    document.body.removeChild(ta);
    return { success, method: 'legacy' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Screenshot celog dashboard-a (html2canvas ako je dostupno)
 * @param {HTMLElement} element - element za screenshot
 * @returns {Promise<string|null>} data URL ili null
 */
export async function screenshotDashboard(element) {
  if (typeof window.html2canvas !== 'function') {
    return null;
  }
  try {
    const canvas = await window.html2canvas(element, {
      backgroundColor: '#1A1F3B',
      scale: window.devicePixelRatio || 1,
      logging: false,
      useCORS: false,
    });
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Screenshot failed:', e);
    return null;
  }
}

/**
 * Kreira share text iz highlight-a
 * @param {Object} highlight
 * @returns {string}
 */
export function buildHighlightText(highlight) {
  const momentLabels = {
    alarm_resolved_ontime: 'Alarm rešen na vreme!',
    alarm_chain_broken: 'Alarm lanac prekinut!',
    tiktok_spike_caught: 'TikTok spike uhvaćen!',
    guest_standout: 'Gost blistao!',
    battery_critical_survived: 'Baterija preživela kritično!',
  };
  const label = momentLabels[highlight.moment_type] || 'Poseban momenat';
  return `🎯 ${label} (${Math.round(highlight.score)} poena)`;
}

/**
 * Generiše sažetak emisije za deljenje
 * @param {Object} outcome
 * @returns {string}
 */
export function buildOutcomeSummary(outcome) {
  const lines = [
    `📺 Na Vezi — Nedelja ${outcome.week}`,
    `📊 Engagement: ${Math.round(outcome.engagement * 100)}%`,
    `💰 Kapital: +${Math.round(outcome.capitalDelta)}`,
  ];
  if (outcome.noShow) {
    lines.push('😬 Gost nije stigao...');
  }
  if (outcome.tiktokSpike) {
    lines.push('🚀 TikTok spike!');
  }
  return lines.join('\n');
}
