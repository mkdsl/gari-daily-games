/**
 * @module ui/score-screen
 * Score reveal screen with zimska bura animation, task breakdown, and rank display.
 *
 * Flow:
 *   1. Zimska bura: animated week-by-week reveal (BURA_WEEK_DELAY per week)
 *   2. Score reveal: rank, total score, breakdown table, weather info
 *   3. Brana's verdict quote
 *   4. Action buttons: play again, prestige, share
 *   5. Brand CTAs: Guncati masterclass, Kluboslavija turneja
 *
 * Score counter uses eased animation (cubic ease-out).
 * Ecosystem bonus highlighted separately in breakdown.
 * Share uses Web Share API with clipboard fallback.
 */

import {
  BURA_WEEK_DELAY,
  BURA_INITIAL_DELAY,
  BURA_POST_REVEAL_DELAY,
  ANIM,
} from '../config.js';
import { BRANA_DIALOGS, BRANA_VERDICTS_EXTENDED } from '../content/brana_dialogs.js';
import { BRAND, SCORE_CTAS, buildShareText, buildShareTitle, getCTAForScore } from '../content/brand_hooks.js';
import { weekLabel } from '../content/tasks.js';
import { loadBestScore } from '../state.js';
import { playWeekReveal, playBuraEnd } from '../audio.js';

/** @type {HTMLElement|null} */
let overlayEl = null;
let onPlayAgain = null;
let onPrestige = null;
let buraInterval = null;

// ─── Main Entry ───────────────────────────────────────────────────────────────

/**
 * Show the zimska bura animation then reveal score screen
 * @param {HTMLElement} overlay
 * @param {import('../systems/scoring.js').ScoreResult} scoreResult
 * @param {import('../state.js').GameState} state
 * @param {() => void} onPlayAgainCb
 * @param {() => void} onPrestigeCb
 * @param {string[]} newAchievements
 */
export function showScoreScreen(overlay, scoreResult, state, onPlayAgainCb, onPrestigeCb, newAchievements) {
  overlayEl = overlay;
  onPlayAgain = onPlayAgainCb;
  onPrestige = onPrestigeCb;

  // Clear any previous bura interval
  if (buraInterval) {
    clearInterval(buraInterval);
    buraInterval = null;
  }

  overlay.hidden = false;
  overlay.innerHTML = '';
  overlay.className = 'overlay overlay-bura';

  // Phase 1: Zimska bura animation
  renderBuraAnimation(overlay, state, scoreResult);
}

// ─── Bura Animation ───────────────────────────────────────────────────────────

/**
 * Render zimska bura weather reveal animation.
 * Reveals one week at a time with weather emoji and task summary.
 * @param {HTMLElement} overlay
 * @param {import('../state.js').GameState} state
 * @param {import('../systems/scoring.js').ScoreResult} scoreResult
 */
function renderBuraAnimation(overlay, state, scoreResult) {
  overlay.innerHTML = `
    <div class="bura-screen" role="status" aria-live="polite" aria-label="Zimska bura — sezona se zatvara">
      <div class="bura-header">
        <span class="bura-emoji" aria-hidden="true">🌬️</span>
        <h2 class="bura-title">Zimska Bura</h2>
        <p class="bura-subtitle">Sezona se zatvara...</p>
      </div>
      <div class="bura-weeks" id="bura-weeks" role="log" aria-label="Raspored po nedeljama"></div>
      <div class="bura-progress" aria-label="Napredak otkrivanja">
        <div class="bura-progress-bar" id="bura-bar" style="width:0%"></div>
        <span class="bura-progress-label" id="bura-progress-label">N0 / N12</span>
      </div>
      <div class="bura-running-total" id="bura-running-total">
        <span class="running-total-label">Akumulirani poeni:</span>
        <span class="running-total-value" id="running-total">0</span>
      </div>
    </div>
  `;

  const weeksContainer = overlay.querySelector('#bura-weeks');
  const progressBar = overlay.querySelector('#bura-bar');
  const progressLabel = overlay.querySelector('#bura-progress-label');
  const runningTotalEl = overlay.querySelector('#running-total');

  let currentWeek = 0;
  const totalWeeks = 12;
  let accumulatedScore = 0;

  // Pre-build all week elements (hidden)
  for (let w = 1; w <= totalWeeks; w++) {
    const weekEl = document.createElement('div');
    weekEl.className = 'bura-week-item';
    weekEl.hidden = true;
    weekEl.dataset.week = String(w);
    weekEl.setAttribute('aria-label', `Nedelja ${w}`);
    weeksContainer?.appendChild(weekEl);
  }

  function revealNextWeek() {
    currentWeek++;
    if (currentWeek > totalWeeks) {
      clearInterval(buraInterval);
      buraInterval = null;
      if (scoreResult.total < 300) {
        const subtitle = overlay.querySelector('.bura-subtitle');
        if (subtitle) subtitle.textContent = 'Zemlja beleži svaki propušten prozor.';
      }
      // Pause then show final score screen
      setTimeout(() => {
        // Play end fanfare based on score tier
        const tier = accumulatedScore >= 600 ? 'major' : 'minor';
        try { playBuraEnd(tier); } catch (e) {}
        setTimeout(() => renderScoreResult(overlay, scoreResult, state), 400);
      }, BURA_POST_REVEAL_DELAY);
      return;
    }

    const weekEl = weeksContainer?.querySelector(`[data-week="${currentWeek}"]`);
    if (!weekEl) return;

    // Find assignments for this week
    const weekAssignments = state.assignments.filter((a) => a.week === currentWeek);
    const weatherEmoji = getWeatherEmojiForWeek(state, currentWeek);
    const weatherLabel = getWeatherLabelForWeek(state, currentWeek);

    // Build week content
    let content = `
      <div class="bura-week-header">
        <span class="bura-week-num">N${currentWeek}</span>
        <span class="bura-week-date">${weekLabel(currentWeek)}</span>
        <span class="bura-weather-chip" title="${weatherLabel}">${weatherEmoji}</span>
      </div>
    `;

    if (weekAssignments.length > 0) {
      for (const asgn of weekAssignments) {
        const taskScore = scoreResult.breakdown.find((b) => b.task_id === asgn.task_id);
        const inWindow = taskScore?.in_window ?? false;
        const pts = taskScore?.final ?? 0;
        const taskName = taskScore?.task_name ?? asgn.task_id;
        const ecoFlag = taskScore?.ecosystem_bonus_applied ? ' 🌿' : '';
        const penaltyFlag = taskScore?.hot_penalty_applied ? ' ⚠️' : '';

        accumulatedScore += pts;

        content += `
          <div class="bura-task-line ${inWindow ? 'in-win' : 'out-win'}">
            <span class="bura-task-name">${taskName}${ecoFlag}${penaltyFlag}</span>
            <span class="bura-task-pts ${pts >= 0 ? 'pts-positive' : 'pts-negative'}">
              ${pts > 0 ? '+' : ''}${pts}p
            </span>
            <span class="bura-task-status" aria-label="${inWindow ? 'u prozoru' : 'van prozora'}">
              ${inWindow ? '✓' : '⚠'}
            </span>
          </div>
        `;
      }
    } else {
      content += `<div class="bura-empty-week">— nema radova —</div>`;
    }

    weekEl.innerHTML = content;
    weekEl.hidden = false;
    weekEl.classList.add('bura-reveal');

    if (scoreResult.total >= 900) {
      weekEl.querySelectorAll('.in-win').forEach(el => {
        el.classList.add('bura-cell-pulse');
        setTimeout(() => el.classList.remove('bura-cell-pulse'), 600);
      });
    }

    // Update progress
    if (progressBar) {
      progressBar.style.width = `${(currentWeek / totalWeeks) * 100}%`;
    }
    if (progressLabel) {
      progressLabel.textContent = `N${currentWeek} / N${totalWeeks}`;
    }
    if (runningTotalEl) {
      runningTotalEl.textContent = String(accumulatedScore);
    }

    // Audio tick — higher pitch as season progresses
    try { playWeekReveal(currentWeek); } catch (e) {}

    // Scroll last item into view
    weekEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const weekDelay = scoreResult.total >= 900
    ? Math.floor(BURA_WEEK_DELAY * 0.6)
    : scoreResult.total < 300
      ? Math.floor(BURA_WEEK_DELAY * 1.6)
      : BURA_WEEK_DELAY;

  setTimeout(() => {
    buraInterval = setInterval(revealNextWeek, weekDelay);
  }, BURA_INITIAL_DELAY);
}

// ─── Weather Helpers ──────────────────────────────────────────────────────────

/**
 * Get weather emoji for a specific week
 * @param {import('../state.js').GameState} state
 * @param {number} week
 * @returns {string}
 */
function getWeatherEmojiForWeek(state, week) {
  if (!state.weather) return '☀️';
  if (state.weather.frost_week !== null && week >= state.weather.frost_week) return '❄️';
  if (state.weather.rain_weeks.includes(week)) return '🌧️';
  if (state.weather.hot_weeks.includes(week)) return '🌡️';
  return '☀️';
}

/**
 * Get accessible weather label for a week
 * @param {import('../state.js').GameState} state
 * @param {number} week
 * @returns {string}
 */
function getWeatherLabelForWeek(state, week) {
  if (!state.weather) return 'Sunčano';
  if (state.weather.frost_week !== null && week >= state.weather.frost_week) return 'Mraz';
  if (state.weather.rain_weeks.includes(week)) return 'Kiša';
  if (state.weather.hot_weeks.includes(week)) return 'Toplo';
  return 'Sunčano';
}

// ─── Score Result Screen ──────────────────────────────────────────────────────

/**
 * Render the final score result screen after bura animation completes
 * @param {HTMLElement} overlay
 * @param {import('../systems/scoring.js').ScoreResult} scoreResult
 * @param {import('../state.js').GameState} state
 */
function renderScoreResult(overlay, scoreResult, state) {
  overlay.className = 'overlay overlay-score';

  const branaComment = BRANA_DIALOGS[scoreResult.rank_id] ?? '';
  const extendedVerdict = BRANA_VERDICTS_EXTENDED[scoreResult.rank_id] ?? [];
  const bestScore = loadBestScore();
  const isNewBest = scoreResult.total >= bestScore;
  const scoreCTA = getCTAForScore(scoreResult.total);

  // Count missed tasks (not assigned)
  const missedCount = scoreResult.breakdown.filter((b) => b.week === null).length;
  const outWindowCount = scoreResult.breakdown.filter((b) => b.week !== null && !b.in_window).length;

  overlay.innerHTML = `
    <div class="score-screen" role="main" aria-label="Rezultat sezone">
      <div class="score-header">
        <div class="score-rank-emoji" aria-hidden="true">${scoreResult.rank_emoji}</div>
        <h1 class="score-rank-label" style="color:${scoreResult.rank_color}">${scoreResult.rank_label}</h1>
        <div class="score-total" aria-label="Ukupno ${scoreResult.total} poena">
          <span class="score-number" id="score-counter" aria-live="off">0</span>
          <span class="score-unit">poena</span>
        </div>
        ${isNewBest ? '<div class="score-new-best" role="status">🏆 Novi rekord!</div>' : `<div class="score-prev-best">Rekord: ${bestScore}p</div>`}
        ${scoreResult.ecosystem_bonus ? '<div class="score-ecosystem-badge" role="status">🌿 Ekosistem bonus aktiviran! ×1.5</div>' : ''}
      </div>

      <div class="score-brana-comment" aria-label="Brana kaže">
        <span class="brana-avatar" aria-hidden="true">🧑‍🌾</span>
        <div class="brana-verdict-block">
          <blockquote class="brana-quote">"${branaComment}"</blockquote>
          ${extendedVerdict.length > 1 ? `
            <div class="brana-extended" aria-label="Branin komentar">
              ${extendedVerdict.slice(1).map((line) => `<p class="brana-ext-line">${line}</p>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>

      <details class="score-breakdown" open>
        <summary class="breakdown-summary">
          <span>Raspored radova</span>
          <span class="breakdown-badges">
            ${outWindowCount > 0 ? `<span class="badge badge-warn">${outWindowCount} van prozora</span>` : ''}
            ${missedCount > 0 ? `<span class="badge badge-miss">${missedCount} nije raspoređeno</span>` : ''}
            ${scoreResult.ecosystem_bonus ? '<span class="badge badge-eco">🌿 Ekosistem</span>' : ''}
          </span>
        </summary>
        <div class="breakdown-list" role="list" aria-label="Pregled zadataka">
          ${scoreResult.breakdown.map((b) => buildBreakdownRow(b)).join('')}
        </div>
        <div class="breakdown-total-row">
          <span class="breakdown-total-label">Ukupno</span>
          <span class="breakdown-total-week">—</span>
          <span class="breakdown-total-pts">${scoreResult.total}p</span>
          <span class="breakdown-total-check"></span>
        </div>
        ${scoreResult.ecosystem_bonus ? `
          <div class="breakdown-eco-note">
            🌿 Ekosistem bonus: Micelij + Jezero + Kompost u prozoru = ×1.5 poena
          </div>
        ` : ''}
      </details>

      <div class="score-weather-info">
        <span class="weather-label">Vreme ove sezone:</span>
        <span class="weather-preset">
          ${state.weather?.preset_emoji ?? ''} ${state.weather?.preset_name ?? '—'}
        </span>
      </div>

      <div class="score-actions">
        <button class="btn-play-again btn-primary" id="btn-play-again">
          🔄 Nova sezona
        </button>
        <button
          class="btn-prestige ${scoreResult.total >= 300 ? '' : 'disabled'}"
          id="btn-prestige"
          ${scoreResult.total < 300 ? 'disabled aria-disabled="true"' : ''}
          title="${scoreResult.total >= 300 ? 'Prestiž dostupan — trajni bonus za sledeće sezone' : 'Treba 300+ poena za prestiž'}"
        >
          ⭐ Prestiž
          <small>${scoreResult.total >= 300 ? 'dostupno' : '(treba 300+)'}</small>
        </button>
        <button class="btn-share-score" id="btn-share" aria-label="Podeli rezultat">
          📤 Podeli
        </button>
      </div>

      <div class="score-brand-ctas">
        <a href="${scoreCTA.url}" target="_blank" rel="noopener noreferrer"
           class="brand-cta primary" aria-label="${scoreCTA.label}">
          ${scoreCTA.emoji} ${scoreCTA.label}
        </a>
        ${SCORE_CTAS.filter((c) => !c.primary).map((cta) => `
          <a href="${cta.url}" target="_blank" rel="noopener noreferrer"
             class="brand-cta secondary" aria-label="${cta.label}">
            ${cta.emoji} ${cta.label}
          </a>
        `).join('')}
      </div>
    </div>
  `;

  // Animate score counter
  animateCounter('score-counter', 0, scoreResult.total, 1400);

  // Bind action buttons
  const playAgainBtn = overlay.querySelector('#btn-play-again');
  playAgainBtn?.addEventListener('click', () => {
    overlay.hidden = true;
    if (onPlayAgain) onPlayAgain();
  });

  const prestigeBtn = overlay.querySelector('#btn-prestige');
  prestigeBtn?.addEventListener('click', () => {
    if (scoreResult.total >= 300 && onPrestige) {
      overlay.hidden = true;
      onPrestige();
    }
  });

  const shareBtn = overlay.querySelector('#btn-share');
  shareBtn?.addEventListener('click', async () => {
    await handleShare(shareBtn, scoreResult, state);
  });

  // Keyboard: Enter on play-again
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === playAgainBtn) {
      playAgainBtn?.click();
    }
  });

  // Focus play-again by default
  setTimeout(() => playAgainBtn?.focus(), 200);
}

// ─── Breakdown Row Builder ────────────────────────────────────────────────────

/**
 * Build a single breakdown row for the score table
 * @param {import('../systems/scoring.js').BreakdownEntry} b
 * @returns {string}
 */
function buildBreakdownRow(b) {
  const statusClass = b.week === null ? 'skipped' : (b.in_window ? 'in-window' : 'out-window');
  const statusIcon = b.week === null ? '✗' : (b.in_window ? '✓' : '⚠️');
  const statusLabel = b.week === null ? 'nije raspoređeno' : (b.in_window ? 'u prozoru' : 'van prozora');
  const weekStr = b.week !== null ? `N${b.week}` : '—';
  const ecoMark = b.ecosystem_bonus_applied ? ' 🌿' : '';
  const penaltyMark = b.hot_penalty_applied ? ' ⚠️' : '';

  return `
    <div class="breakdown-row ${statusClass}" role="listitem"
         aria-label="${b.task_name}: ${b.final} poena, ${statusLabel}">
      <span class="breakdown-name">${b.task_name}${ecoMark}${penaltyMark}</span>
      <span class="breakdown-week">${weekStr}</span>
      <span class="breakdown-pts">${b.final}p</span>
      <span class="breakdown-note" aria-label="${statusLabel}">${statusIcon}</span>
    </div>
  `;
}

// ─── Share ────────────────────────────────────────────────────────────────────

/**
 * Handle share button — Web Share API with clipboard fallback
 * @param {HTMLButtonElement} btn
 * @param {import('../systems/scoring.js').ScoreResult} scoreResult
 * @param {import('../state.js').GameState} state
 */
async function handleShare(btn, scoreResult, state) {
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Priprema...';

  try {
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

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        btn.textContent = '✓ Podeljeno!';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2000);
        return;
      } catch (e) {
        if (e.name === 'AbortError') {
          btn.textContent = originalText;
          btn.disabled = false;
          return;
        }
        // Fall through to clipboard
      }
    }

    // Clipboard fallback
    const clipText = `${text}\n${url}`;
    await writeToClipboard(clipText);
    btn.textContent = '✓ Kopirano!';
    showInlineToast('Tekst kopiran — podeli ga gde hoćeš!');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2500);
  } catch (err) {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

/**
 * Write text to clipboard with execCommand fallback
 * @param {string} text
 */
async function writeToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Legacy fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

/**
 * Show a brief inline toast within the score screen
 * @param {string} msg
 */
function showInlineToast(msg) {
  const existing = document.querySelector('.score-copy-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'score-copy-toast toast toast-info';
  toast.textContent = msg;
  document.querySelector('.score-actions')?.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 30);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ─── Score Counter Animation ──────────────────────────────────────────────────

/**
 * Animate a counter element from start to end with cubic ease-out
 * @param {string} elementId
 * @param {number} start
 * @param {number} end
 * @param {number} duration - milliseconds
 */
function animateCounter(elementId, start, end, duration) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Cubic ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(start + (end - start) * eased));
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = String(end); // Ensure exact final value
  }

  requestAnimationFrame(tick);
}
