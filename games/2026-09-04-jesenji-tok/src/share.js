/**
 * @module share
 * Web Share API and clipboard fallback for sharing score card.
 * Uses html2canvas for screenshot generation if available in page scope.
 *
 * Cross-event hooks:
 *   - Guncati masterclass deep link in share text
 *   - Kluboslavija turneja hashtag in share text
 *   - MKDSLend brand in footer of share card
 *
 * Share priority:
 *   1. Web Share API with image (if html2canvas available and canShare({files}))
 *   2. Web Share API text-only
 *   3. Clipboard API (async writeText)
 *   4. Legacy execCommand copy
 */

import { BRAND, buildShareText, buildShareTitle, buildStoriesShareText } from './content/brand_hooks.js';

// ─── Main Share Entry ─────────────────────────────────────────────────────────

/**
 * Share the current score result using Web Share API or clipboard fallback
 * @param {import('./systems/scoring.js').ScoreResult} scoreResult
 * @param {import('./state.js').GameState} state
 * @returns {Promise<{ success: boolean, method: string }>}
 */
export async function shareScore(scoreResult, state) {
  const text = buildShareText(
    scoreResult.rank_label,
    scoreResult.total,
    state.weather?.preset_name ?? 'Nepoznato',
    {
      ecosystem_bonus: scoreResult.ecosystem_bonus,
      prestige_bonus: state.prestige_bonus,
    }
  );
  const title = buildShareTitle(scoreResult.rank_label, scoreResult.total);
  const url = BRAND.share_url;
  const fullText = text;

  // Try to generate screenshot first (html2canvas, if available)
  let screenshotBlob = null;
  const scoreEl = document.querySelector('.score-screen');
  if (scoreEl && typeof window.html2canvas === 'function') {
    try {
      const canvas = await window.html2canvas(scoreEl, {
        backgroundColor: '#1a2415',
        scale: 1.5,
        useCORS: false,
        allowTaint: false,
        logging: false,
      });
      screenshotBlob = await canvasToBlob(canvas, 'image/png', 0.92);
    } catch (e) {
      console.warn('[JT Share] html2canvas failed:', e?.message ?? e);
    }
  }

  // Try Web Share API with image file
  if (navigator.share && screenshotBlob) {
    try {
      const file = new File([screenshotBlob], 'jesenji-tok-score.png', { type: 'image/png' });
      const canShareFile = navigator.canShare?.({ files: [file] });
      await navigator.share({
        title,
        text: fullText,
        url,
        files: canShareFile ? [file] : undefined,
      });
      return { success: true, method: 'web-share-image' };
    } catch (e) {
      if (e.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      // Fall through to text-only share
    }
  }

  // Try Web Share API text-only
  if (navigator.share) {
    try {
      await navigator.share({ title, text: fullText, url });
      return { success: true, method: 'web-share-text' };
    } catch (e) {
      if (e.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      // Fall through to clipboard
    }
  }

  // Clipboard fallback
  const clipboardText = `${fullText}\n${url}`;
  return copyToClipboard(clipboardText);
}

// ─── Score Card Renderer ──────────────────────────────────────────────────────

/**
 * Build a share card DOM element for html2canvas screenshot.
 * Card is positioned off-screen, captured, then removed.
 * @param {import('./systems/scoring.js').ScoreResult} scoreResult
 * @param {import('./state.js').GameState} state
 * @returns {HTMLElement}
 */
export function buildShareCard(scoreResult, state) {
  const card = document.createElement('div');
  card.className = 'share-card';
  card.setAttribute('aria-hidden', 'true');
  card.style.cssText = [
    'width:400px',
    'padding:24px',
    'background:#1a2415',
    'color:#f5e6c8',
    'font-family:system-ui,sans-serif',
    'border:2px solid #8bc34a',
    'border-radius:12px',
    'position:absolute',
    'left:-9999px',
    'top:0',
    'z-index:-1',
  ].join(';');

  const weatherStr = state.weather
    ? `${state.weather.preset_emoji ?? ''} ${state.weather.preset_name ?? ''}`
    : '';

  card.innerHTML = `
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:40px;line-height:1.2">${scoreResult.rank_emoji}</div>
      <h2 style="margin:4px 0;color:${scoreResult.rank_color};font-size:20px">${scoreResult.rank_label}</h2>
      <div style="font-size:52px;font-weight:bold;color:#f5a623;line-height:1">${scoreResult.total}</div>
      <div style="color:#a89880;font-size:14px">poena</div>
    </div>
    ${scoreResult.ecosystem_bonus ? `
      <div style="color:#8bc34a;text-align:center;font-size:13px;margin-bottom:8px">
        🌿 Ekosistem bonus aktiviran
      </div>
    ` : ''}
    <div style="background:#2d3d20;padding:12px;border-radius:8px;margin-bottom:12px;font-size:13px">
      ${scoreResult.breakdown.map((b) => `
        <div style="display:flex;justify-content:space-between;align-items:center;margin:5px 0;gap:8px">
          <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${b.task_name}
          </span>
          <span style="flex-shrink:0;font-size:12px;color:#a89880">
            ${b.week !== null ? `N${b.week}` : '—'}
          </span>
          <span style="flex-shrink:0;color:${b.in_window ? '#8bc34a' : '#f5a623'};font-weight:bold">
            ${b.final}p ${b.in_window ? '✓' : '⚠️'}
          </span>
        </div>
      `).join('')}
    </div>
    ${weatherStr ? `
      <div style="text-align:center;font-size:12px;color:#a89880;margin-bottom:8px">
        Vreme: ${weatherStr}
      </div>
    ` : ''}
    <div style="text-align:center;margin-top:12px;padding-top:10px;border-top:1px solid #3d5230">
      <div style="font-size:12px;color:#a89880;line-height:1.5">
        🌾 Jesenji Tok — Gari Daily Games<br>
        <span style="color:#8bc34a">${BRAND.guncati_url}</span>
      </div>
    </div>
  `;

  document.body.appendChild(card);
  return card;
}

/**
 * Remove a share card DOM element (cleanup after screenshot)
 * @param {HTMLElement} card
 */
export function removeShareCard(card) {
  if (card && card.parentNode) {
    card.parentNode.removeChild(card);
  }
}

// ─── Stories Card (9:16 Portrait) ────────────────────────────────────────────

/**
 * Build a 9:16 portrait share card for Instagram Stories.
 * Score + rank in top third; ecosystem status icons in middle; Guncati wordmark in bottom strip.
 * Card is appended off-screen; caller must remove it after html2canvas capture.
 * @param {import('./systems/scoring.js').ScoreResult} scoreResult
 * @param {import('./state.js').GameState} state
 * @returns {HTMLElement}
 */
export function buildStoriesCard(scoreResult, state) {
  const ecoTasks = [
    { key: 'micelij', label: 'Micelij' },
    { key: 'jezero', label: 'Jezero' },
    { key: 'kompost', label: 'Kompost' },
  ];
  const placedTaskIds = scoreResult.breakdown
    .filter((b) => b.week !== null && b.in_window)
    .map((b) => b.task_id ?? b.task_name?.toLowerCase());

  const ecoRows = ecoTasks.map((t) => {
    const done = placedTaskIds.some((id) => id && id.includes(t.key));
    return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;font-size:15px">
      <span style="color:${done ? '#8bc34a' : '#5a6b50'};font-size:18px">${done ? '✓' : '○'}</span>
      <span style="color:${done ? '#d4e8a0' : '#6b7d60'}">${t.label}</span>
    </div>`;
  }).join('');

  const card = document.createElement('div');
  card.className = 'share-card share-card-stories';
  card.setAttribute('aria-hidden', 'true');
  card.style.cssText = [
    'width:405px',
    'height:720px',
    'background:#1a2415',
    'color:#f5e6c8',
    'font-family:system-ui,sans-serif',
    'position:absolute',
    'left:-9999px',
    'top:0',
    'z-index:-1',
    'display:flex',
    'flex-direction:column',
    'overflow:hidden',
  ].join(';');

  card.innerHTML = `
    <!-- top third: score + rank -->
    <div style="flex:0 0 240px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:#1f2e18">
      <div style="font-size:56px;line-height:1">${scoreResult.rank_emoji}</div>
      <div style="font-size:22px;font-weight:700;color:${scoreResult.rank_color ?? '#f5a623'};margin:8px 0 4px;text-align:center">${scoreResult.rank_label}</div>
      <div style="font-size:72px;font-weight:800;color:#f5a623;line-height:1">${scoreResult.total}</div>
      <div style="font-size:13px;color:#a89880;letter-spacing:1px">POENA</div>
    </div>

    <!-- middle: ecosystem status -->
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px 32px;background:#1a2415">
      <div style="font-size:12px;color:#6b7d60;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Ekosistem</div>
      ${ecoRows}
      ${scoreResult.ecosystem_bonus ? `
        <div style="margin-top:10px;padding:6px 10px;background:#2d3d20;border-radius:6px;font-size:13px;color:#8bc34a">
          🌿 Ekosistem bonus × 1.5
        </div>
      ` : ''}
      ${state.weather?.preset_name ? `
        <div style="margin-top:16px;font-size:12px;color:#6b7d60">
          ${state.weather.preset_emoji ?? ''} ${state.weather.preset_name}
        </div>
      ` : ''}
    </div>

    <!-- bottom strip: Guncati wordmark -->
    <div style="flex:0 0 80px;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#0f1a0b;border-top:1px solid #2d3d20">
      <div style="font-size:13px;color:#8bc34a;font-weight:600;letter-spacing:1px">🌿 GUNCATI</div>
      <div style="font-size:11px;color:#4a5e40;margin-top:2px">${BRAND.guncati_url}</div>
      <div style="font-size:10px;color:#3a4e30;margin-top:1px">🌾 Jesenji Tok · Gari Daily Games</div>
    </div>
  `;

  document.body.appendChild(card);
  return card;
}

/**
 * Share a Stories-format card via Web Share API or clipboard fallback.
 * @param {import('./systems/scoring.js').ScoreResult} scoreResult
 * @param {import('./state.js').GameState} state
 * @returns {Promise<{ success: boolean, method: string }>}
 */
export async function shareStories(scoreResult, state) {
  const text = buildStoriesShareText(
    scoreResult.rank_label,
    scoreResult.total,
    { ecosystem_bonus: scoreResult.ecosystem_bonus }
  );
  const url = BRAND.share_url;

  let screenshotBlob = null;
  const card = buildStoriesCard(scoreResult, state);
  if (typeof window.html2canvas === 'function') {
    try {
      const canvas = await window.html2canvas(card, {
        backgroundColor: '#1a2415',
        scale: 2,
        useCORS: false,
        allowTaint: false,
        logging: false,
      });
      screenshotBlob = await canvasToBlob(canvas, 'image/png', 0.92);
    } catch (e) {
      console.warn('[JT Stories] html2canvas failed:', e?.message ?? e);
    }
  }
  removeShareCard(card);

  if (navigator.share && screenshotBlob) {
    try {
      const file = new File([screenshotBlob], 'jesenji-tok-stories.png', { type: 'image/png' });
      const canShareFile = navigator.canShare?.({ files: [file] });
      await navigator.share({
        title: 'Moja jesenja sezona',
        text,
        url,
        files: canShareFile ? [file] : undefined,
      });
      return { success: true, method: 'web-share-stories' };
    } catch (e) {
      if (e?.name === 'AbortError') return { success: false, method: 'cancelled' };
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Moja jesenja sezona', text, url });
      return { success: true, method: 'web-share-text' };
    } catch (e) {
      if (e?.name === 'AbortError') return { success: false, method: 'cancelled' };
    }
  }

  return copyToClipboard(`${text}\n${url}`);
}

// ─── Platform-Specific Text Builders ─────────────────────────────────────────

/**
 * Build Twitter/X-optimized share text (≤280 chars).
 * @param {import('./systems/scoring.js').ScoreResult} scoreResult
 * @param {import('./state.js').GameState} state
 * @returns {string}
 */
export function buildTwitterText(scoreResult, state) {
  const eco = scoreResult.ecosystem_bonus ? ' 🌿' : '';
  const weather = state.weather?.preset_emoji ?? '';
  return (
    `${scoreResult.rank_emoji} ${scoreResult.rank_label}: ${scoreResult.total}p ${weather}${eco}\n` +
    `#JesenjiTok #Guncati\n${BRAND.share_url}`
  );
}

/**
 * Build a longer share text for email or messaging apps.
 * @param {import('./systems/scoring.js').ScoreResult} scoreResult
 * @param {import('./state.js').GameState} state
 * @returns {string}
 */
export function buildLongShareText(scoreResult, state) {
  const lines = [
    `🌾 Jesenji Tok — moja jesenja sezona`,
    `Rang: ${scoreResult.rank_emoji} ${scoreResult.rank_label}`,
    `Poeni: ${scoreResult.total}`,
    `Vreme: ${state.weather?.preset_emoji ?? ''} ${state.weather?.preset_name ?? ''}`,
    scoreResult.ecosystem_bonus ? '🌿 Ekosistem bonus aktiviran!' : '',
    '',
    'Raspored:',
    ...scoreResult.breakdown.map(
      (b) => `  ${b.task_name}: ${b.week !== null ? `N${b.week}` : '—'} → ${b.final}p ${b.in_window ? '✓' : '⚠️'}`
    ),
    '',
    `Igraj i ti: ${BRAND.share_url}`,
    BRAND.hashtags.join(' '),
  ].filter(Boolean);
  return lines.join('\n');
}

// ─── Clipboard Utility ────────────────────────────────────────────────────────

/**
 * Copy text to clipboard with async API and legacy execCommand fallback.
 * @param {string} text
 * @returns {Promise<{success: boolean, method: string}>}
 */
async function copyToClipboard(text) {
  // Modern Clipboard API
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      showCopyToast();
      return { success: true, method: 'clipboard' };
    } catch (e) {
      // Permission denied or not in focus — fall through
    }
  }

  // Legacy execCommand fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;top:0;left:0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(ta);

  if (copied) {
    showCopyToast();
    return { success: true, method: 'execCommand' };
  }

  return { success: false, method: 'failed' };
}

/**
 * Show a brief toast confirming clipboard copy
 */
function showCopyToast() {
  const existing = document.querySelector('.share-copy-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast toast-info share-copy-toast';
  toast.textContent = '✓ Tekst kopiran — podeli ga gde hoćeš!';
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 40);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// ─── Canvas Utilities ─────────────────────────────────────────────────────────

/**
 * Convert an HTMLCanvasElement to a Blob
 * @param {HTMLCanvasElement} canvas
 * @param {string} [mimeType]
 * @param {number} [quality]
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas, mimeType = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('canvas.toBlob returned null'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Convert a Blob to a data URL string
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(/** @type {string} */ (reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Check if the Web Share API supports file sharing on this device
 * @returns {boolean}
 */
export function canShareFiles() {
  if (!navigator.canShare) return false;
  try {
    const probe = new File([''], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [probe] });
  } catch (e) {
    return false;
  }
}

/**
 * Check if Web Share API is available
 * @returns {boolean}
 */
export function canShare() {
  return typeof navigator.share === 'function';
}
