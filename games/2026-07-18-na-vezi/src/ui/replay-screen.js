/** Highlight reel prikaz posle emisije */
import { formatHighlight, calcSessionHighlightScore } from '../meta/replay-highlights.js';
import { buildHighlightText, shareHighlight } from '../share.js';
import { getAforizam, getOutcomeType } from '../content/aforizmi.js';
import { BRAND_HOOKS, getOutcomeBrandCopy } from '../content/brand-hooks.js';
import { formatCapital } from '../config.js';

/**
 * Renderuje replay screen
 * @param {HTMLElement} container
 * @param {Object} emisijaResult
 * @param {Function} onContinue - callback za nastavak
 */
export function renderReplayScreen(container, emisijaResult, onContinue) {
  const { highlights, overallEngagement, capitalDelta, week, noShow, tiktokSpike } = emisijaResult;
  const formattedHighlights = (highlights || []).map(formatHighlight);
  const sessionScore = calcSessionHighlightScore(highlights || []);
  const outcomeType = getOutcomeType(overallEngagement || 0);
  const aforizam = getAforizam(outcomeType);
  const brandCopy = getOutcomeBrandCopy(overallEngagement || 0, 'guncati');

  container.innerHTML = `
    <div class="replay-container scroll-area">
      <div style="text-align:center; padding: 24px 0 16px;">
        <h1 class="main-logo" style="font-size:1.8rem;">📼 Replay</h1>
        <p style="color:var(--color-text-muted); font-size:0.85rem;">Nedelja ${week}</p>
      </div>

      ${formattedHighlights.length > 0 ? `
        <h3 style="margin-bottom:8px;">Highlight Momenti</h3>
        ${formattedHighlights.map((h, i) => `
          <div class="highlight-card new" style="animation-delay:${i * 0.1}s">
            <div class="flex-between">
              <span class="highlight-moment">${h.icon} ${h.label}</span>
              <span class="highlight-score">${h.scoreLabel}</span>
            </div>
            <div class="highlight-desc">${h.desc || ''}</div>
          </div>
        `).join('')}
      ` : `
        <div class="panel" style="text-align:center;">
          <p>Nema posebnih momenata ovog puta. Nastavi da gradiš!</p>
        </div>
      `}

      ${sessionScore > 0 ? `
        <div style="text-align:center; padding:12px 0;">
          <div class="value-display">${sessionScore}</div>
          <div class="value-label">Highlight Score</div>
        </div>
      ` : ''}

      <div class="divider"></div>

      <div class="panel" style="text-align:center; font-style:italic;">
        <p style="color:var(--color-signal); font-size:0.9rem;">"${aforizam}"</p>
      </div>

      <div class="panel" style="margin-top:12px;">
        <p style="font-size:0.8rem; color:var(--color-text-dim);">${brandCopy}</p>
        <a href="${BRAND_HOOKS.guncati.ctaUrl}" target="_blank" rel="noopener"
           style="color:var(--color-signal); font-size:0.8rem; text-decoration:none;">
          ${BRAND_HOOKS.guncati.ctaText} →
        </a>
      </div>

      <div style="display:flex; gap:8px; margin-top:16px;">
        ${formattedHighlights.length > 0 ? `
          <button class="btn btn-ghost" id="share-highlights-btn">📤 Podeli</button>
        ` : ''}
        <button class="btn btn-primary flex-1" id="continue-btn">Nastavi →</button>
      </div>

      <div style="height:24px;"></div>
    </div>
  `;

  // Continue
  const continueBtn = container.querySelector('#continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => onContinue());
  }

  // Share
  const shareBtn = container.querySelector('#share-highlights-btn');
  if (shareBtn && formattedHighlights.length > 0) {
    shareBtn.addEventListener('click', async () => {
      const bestHighlight = formattedHighlights[0];
      const text = buildHighlightText(bestHighlight);
      const result = await shareHighlight(text);
      if (result.success) {
        shareBtn.textContent = result.method === 'clipboard' ? '✅ Kopirano!' : '✅ Podeljeno!';
        setTimeout(() => { shareBtn.textContent = '📤 Podeli'; }, 2000);
      }
    });
  }
}
