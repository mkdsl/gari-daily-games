/**
 * @module ui/prestige-screen
 * Prestige selection screen — shown after qualifying season (score >= 300).
 *
 * Features:
 *   - 3 bonus options with radio-style selection
 *   - Effect preview text per bonus
 *   - Current active bonus displayed
 *   - Keyboard navigation (Tab, Enter/Space to select, arrow keys)
 *   - Confirm button enabled only after selection
 *   - Skip option (play next season without prestige)
 *   - Motivation text based on total run count
 *   - ARIA labels for accessibility
 *
 * Prestige bonus options:
 *   - extra_group: 4 groups/week instead of 3
 *   - cheap_micelij: Micelij costs 1 group instead of 2
 *   - full_forecast: All 12 weeks visible from start
 */

import { PRESTIGE_OPTIONS } from '../config.js';
import {
  getActiveBonusInfo,
  getBonusEffectSummary,
  getBonusDetailDescription,
  getPrestigeMotivationText,
} from '../systems/prestige.js';
import { PRESTIGE_BRANA_VOICE, getPrestigeNarrative } from '../content/brana_dialogs.js';

// ─── Module State ──────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let overlayEl = null;
let onSelect = null;
let onSkip = null;
let selectedBonusId = null;

// ─── Main Entry ───────────────────────────────────────────────────────────────

/**
 * Show the prestige selection screen
 * @param {HTMLElement} overlay
 * @param {string|null} currentBonus - currently active prestige bonus id
 * @param {number} score - final score from this run
 * @param {(bonusId: string) => void} onSelectCb - called with chosen bonus id
 * @param {() => void} onSkipCb - called if player skips prestige
 * @param {number} [totalRuns] - total season count for motivation text
 */
export function showPrestigeScreen(overlay, currentBonus, score, onSelectCb, onSkipCb, totalRuns = 1) {
  overlayEl = overlay;
  onSelect = onSelectCb;
  onSkip = onSkipCb;
  selectedBonusId = null;

  overlay.hidden = false;
  overlay.className = 'overlay overlay-prestige';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Prestiž — izaberi bonus');

  const currentBonusInfo = getActiveBonusInfo(currentBonus);
  const motivationText = getPrestigeMotivationText(totalRuns, score);
  const prestigeNarrative = getPrestigeNarrative(totalRuns);

  const isBadRun = score < 300;
  const prestigeHeading = isBadRun ? 'Zemlja trpi. Brana uči.' : 'Drugi sezon.';

  overlay.innerHTML = `
    <div class="prestige-screen ${isBadRun ? 'prestige-screen-bad-run' : ''}" role="document">
      <div class="prestige-header">
        <div class="prestige-star" aria-hidden="true">⭐</div>
        <h2 class="prestige-heading">${prestigeHeading}</h2>
        <p class="prestige-subtitle">
          Resetuj sezonu sa trajnim bonusom.<br>
          Odaberi mudro — ovo ostaje u svim sledećim sezonama.
        </p>
        <p class="prestige-motivation" aria-label="Motivacioni tekst">${motivationText}</p>

        ${currentBonusInfo ? `
          <div class="current-bonus-info" aria-label="Trenutni aktivan bonus">
            <span class="current-bonus-label">Trenutni bonus:</span>
            <span class="current-bonus-value">
              ${currentBonusInfo.emoji} <strong>${currentBonusInfo.label}</strong>
            </span>
            <p class="current-bonus-desc">${currentBonusInfo.description}</p>
          </div>
        ` : `
          <div class="current-bonus-info no-bonus" aria-label="Nema aktivnog bonusa">
            <span class="current-bonus-label">Nema aktivnog bonusa</span>
            <p class="current-bonus-desc">Ovo je tvoj prvi prestiž — svaka opcija je nova!</p>
          </div>
        `}
      </div>

      <div class="prestige-brana-narrative" aria-label="Brana kaže">
        <span class="brana-narrative-avatar" aria-hidden="true">🧑‍🌾</span>
        <p class="brana-narrative-text">"${prestigeNarrative}"</p>
      </div>

      <fieldset class="prestige-options" id="prestige-options"
                aria-label="Izaberi prestiž bonus">
        <legend class="sr-only">Prestiž opcije</legend>
        ${PRESTIGE_OPTIONS.map((opt) => buildOptionHTML(opt, currentBonus)).join('')}
      </fieldset>

      <div class="prestige-effect-preview" id="effect-preview" aria-live="polite" aria-atomic="true">
        <p class="effect-preview-placeholder">Izaberi bonus da vidiš detaljni opis efekta.</p>
      </div>

      <div class="prestige-actions">
        <button class="btn-prestige-confirm btn-primary"
                id="btn-prestige-confirm"
                disabled
                aria-disabled="true"
                aria-label="Potvrdi izabrani bonus">
          Izaberi bonus za potvrdu →
        </button>
        <button class="btn-prestige-skip btn-secondary"
                id="btn-prestige-skip"
                aria-label="Preskoči prestiž — nova sezona bez bonusa">
          Preskoči (nova sezona bez promene)
        </button>
      </div>

      <div class="prestige-disclaimer" role="note">
        <small>
          Prestiž resetuje grid i raspored. Rekord ostaje sačuvan. Bonus važi od naredne sezone i sve posle.
        </small>
      </div>
    </div>
  `;

  // On bad run (score < 300): hide options for 3s — ambient "Brana pauza" before choice
  const optionsFieldset = overlay.querySelector('#prestige-options');
  const actionsEl = overlay.querySelector('.prestige-actions');
  if (isBadRun && optionsFieldset && actionsEl) {
    optionsFieldset.hidden = true;
    actionsEl.hidden = true;
    setTimeout(() => {
      optionsFieldset.hidden = false;
      actionsEl.hidden = false;
      const firstOpt = overlay.querySelector('.prestige-option');
      firstOpt?.focus();
    }, 3000);
  }

  // Wire option selection
  const optionEls = overlay.querySelectorAll('.prestige-option');
  optionEls.forEach((el) => {
    el.addEventListener('click', () => selectBonus(el.dataset.bonusId ?? null, overlay));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectBonus(el.dataset.bonusId ?? null, overlay);
      }
    });
  });

  // Confirm button
  overlay.querySelector('#btn-prestige-confirm')?.addEventListener('click', () => {
    if (selectedBonusId && onSelect) {
      overlay.hidden = true;
      onSelect(selectedBonusId);
    }
  });

  // Skip button
  overlay.querySelector('#btn-prestige-skip')?.addEventListener('click', () => {
    overlay.hidden = true;
    if (onSkip) onSkip();
  });

  // Keyboard: Escape = skip
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      overlay.hidden = true;
      if (onSkip) onSkip();
    }
  };
  document.addEventListener('keydown', escHandler);

  // Arrow key navigation between options
  overlay.addEventListener('keydown', handleArrowNav);

  // Focus first option
  setTimeout(() => {
    const firstOpt = overlay.querySelector('.prestige-option');
    firstOpt?.focus();
  }, 100);
}

// ─── Option HTML Builder ──────────────────────────────────────────────────────

/**
 * Build HTML for a single prestige option card
 * @param {{ id: string, label: string, description: string, emoji: string }} opt
 * @param {string|null} currentBonus
 * @returns {string}
 */
function buildOptionHTML(opt, currentBonus) {
  const isCurrentBonus = opt.id === currentBonus;
  const effectSummary = getBonusEffectSummary(opt.id);

  return `
    <div class="prestige-option ${isCurrentBonus ? 'current-active' : ''}"
         data-bonus-id="${opt.id}"
         role="radio"
         aria-checked="false"
         tabindex="0"
         aria-label="${opt.label}: ${opt.description}">
      <span class="prestige-opt-emoji" aria-hidden="true">${opt.emoji}</span>
      <div class="prestige-opt-content">
        <strong class="prestige-opt-label">${opt.label}</strong>
        <p class="prestige-opt-desc">${opt.description}</p>
        ${effectSummary ? `
          <p class="prestige-opt-effect" aria-label="Efekat: ${effectSummary}">
            → ${effectSummary}
          </p>
        ` : ''}
        ${PRESTIGE_BRANA_VOICE[opt.id] ? `
          <p class="prestige-opt-brana-voice" aria-label="Brana kaže">
            "${PRESTIGE_BRANA_VOICE[opt.id]}"
          </p>
        ` : ''}
        ${isCurrentBonus ? `
          <span class="current-bonus-badge" role="note">Trenutno aktivan</span>
        ` : ''}
      </div>
      <div class="prestige-opt-check" aria-hidden="true" id="check-${opt.id}">○</div>
    </div>
  `;
}

// ─── Option Selection ─────────────────────────────────────────────────────────

/**
 * Handle option selection — updates visual state, enables confirm button, shows effect preview
 * @param {string|null} bonusId
 * @param {HTMLElement} overlay
 */
function selectBonus(bonusId, overlay) {
  if (!bonusId) return;
  selectedBonusId = bonusId;

  // Update all option ARIA states and visual classes
  overlay.querySelectorAll('.prestige-option').forEach((el) => {
    const isThis = el.dataset.bonusId === bonusId;
    el.classList.toggle('selected', isThis);
    el.setAttribute('aria-checked', String(isThis));
    const check = el.querySelector('.prestige-opt-check');
    if (check) check.textContent = isThis ? '●' : '○';
  });

  // Update effect preview
  const previewEl = overlay.querySelector('#effect-preview');
  if (previewEl) {
    const opt = PRESTIGE_OPTIONS.find((o) => o.id === bonusId);
    const detailDesc = getBonusDetailDescription(bonusId);
    if (opt) {
      previewEl.innerHTML = `
        <div class="effect-preview-content" aria-label="Detalji bonusa ${opt.label}">
          <div class="effect-preview-title">
            ${opt.emoji} ${opt.label}
          </div>
          <p class="effect-preview-desc">${detailDesc || opt.description}</p>
        </div>
      `;
    }
  }

  // Enable confirm button
  const confirmBtn = overlay.querySelector('#btn-prestige-confirm');
  if (confirmBtn) {
    confirmBtn.removeAttribute('disabled');
    confirmBtn.removeAttribute('aria-disabled');
    const opt = PRESTIGE_OPTIONS.find((o) => o.id === bonusId);
    if (opt) {
      confirmBtn.textContent = `Potvrdi: ${opt.emoji} ${opt.label} →`;
      confirmBtn.setAttribute('aria-label', `Potvrdi bonus: ${opt.label}`);
    }
  }
}

// ─── Keyboard Navigation ──────────────────────────────────────────────────────

/**
 * Handle arrow key navigation between prestige option cards
 * @param {KeyboardEvent} e
 */
function handleArrowNav(e) {
  if (!overlayEl) return;
  const options = Array.from(overlayEl.querySelectorAll('.prestige-option'));
  const focused = document.activeElement;
  const idx = options.indexOf(focused);

  if (idx === -1) return;

  let nextIdx = idx;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    nextIdx = (idx + 1) % options.length;
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    nextIdx = (idx - 1 + options.length) % options.length;
  } else {
    return;
  }

  options[nextIdx]?.focus();
}
