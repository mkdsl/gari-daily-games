/**
 * @module ui/tutorial
 * FTUE (First Time User Experience) overlay for Jesenji Tok.
 * 5-step tutorial shown on first play, dismissed permanently after completion.
 *
 * Features:
 *   - 5 progressive steps covering core mechanics
 *   - Keyboard navigation (←/→ arrow keys, Enter, Escape to skip)
 *   - Dot indicators for step progress
 *   - Per-step emoji icon and optional action highlight hint
 *   - Skip button available from step 1
 *   - Pause step: player can optionally interact with game at step 1
 *   - Marks done in localStorage via STORAGE_KEYS.ftue_done
 */

import { STORAGE_KEYS } from '../config.js';

// ─── Constants ─────────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let overlayEl = null;
let currentStep = 0;
let onComplete = null;

/**
 * Tutorial step definitions.
 * Each step teaches one mechanic.
 * @type {Array<{
 *   title: string,
 *   body: string,
 *   emoji: string,
 *   highlight_card: string|null,
 *   highlight_tip: string,
 *   interaction_hint?: string,
 * }>}
 */
const STEPS = [
  {
    title: 'Korak 1: Dodeli zadatak',
    body:
      'Tap <strong>Ozimo žito</strong> karticu ispod grida — postaje selektovana (svetli okvir).' +
      '<br>Zatim tap ćeliju <strong>u Nedelji 2 ili 3</strong> u gridu iznad.' +
      '<br><strong>Zadatak je dodeljen!</strong> Ćelija se popunjava bojom.',
    emoji: '🌾',
    highlight_card: 'ozimo',
    highlight_tip: 'N1–N4 je optimalni prozor za Ozimo žito — sej do 20. septembra.',
    interaction_hint: 'Pokušaj sam: tap Ozimo žito → tap N2 u redu Njiva.',
  },
  {
    title: 'Korak 2: Kapacitet radnih grupa',
    body:
      '<strong>Svake nedelje imaš 3 radne grupe</strong> (HUD gore desno prikazuje preostalo).' +
      '<br>Micelij košta <strong>2 grupe</strong> — svaki drugi zadatak košta <strong>1 grupu</strong>.' +
      '<br>Ako nedelja nema slobodnih grupa, ne možeš tamo dodeljivati.',
    emoji: '👷',
    highlight_card: 'micelij',
    highlight_tip: 'Pazi na broj preostalih grupa u nedelji pre nego što dodeliš Micelij.',
    interaction_hint: 'Micelij = 2 grupe. Ne idi u istu nedelju kad je već popunjena.',
  },
  {
    title: 'Korak 3: Forecast bar i vreme',
    body:
      '<strong>Forecast bar</strong> (ispod HUD-a) prikazuje vremensku prognozu za 12 nedelja.' +
      '<br>🌧️ = kiša — blokira <strong>Suvozid i tarabe</strong> (jedino njega).' +
      '<br>❄️ = mraz — skraćuje prozore za <strong>Micelij</strong> i <strong>Rezidbu</strong>.' +
      '<br>Prvih 3 nedelje su uvek vidljive. Ostalo se otkriva postepeno.',
    emoji: '🌤️',
    highlight_card: null,
    highlight_tip: 'Planificiraj Suvozid UVEK pre kišnih nedelja — kiša ga blokira automatski.',
    interaction_hint: 'Pogledaj forecast bar — koje nedelje imaju kišu?',
  },
  {
    title: 'Korak 4: Optimalni prozor = više poena',
    body:
      'Svaki zadatak ima <strong>optimalni vremenski prozor</strong> (prikazan na kartici).' +
      '<br>✓ U prozoru: puni bodovi.' +
      '<br>⚠️ Van prozora: <strong>60% poena</strong> (×0.6 penalizacija).' +
      '<br>Ćelije van prozora su tamnije — vizuelni signal da nisi u zoni.',
    emoji: '📅',
    highlight_card: 'rezidba',
    highlight_tip: 'Rezidba ima prozor N4–N11. Dodeli je ranije — ali ne prerano.',
    interaction_hint: 'Pogledaj na kartici opseg nedelja. Svetlije ćelije = prozor.',
  },
  {
    title: 'Korak 5: Ekosistem bonus',
    body:
      '<strong>Ekosistem bonus:</strong> stavi Micelij, Jezero i Kompost <em>sva tri u prozor</em>.' +
      '<br>Svaki od ta tri zadatka tada dobija <strong>×1.5 poena</strong>!' +
      '<br>Eco-status indikator (dno ekrana) prati napredak: 0/3 → 1/3 → 2/3 → ✓ Bonus!' +
      '<br>Ovo je ključna strategija za visoke score-ove.',
    emoji: '🌿',
    highlight_card: null,
    highlight_tip: 'Micelij N1–N7, Jezero N6–N11, Kompost N1–N8 — mogu se pokriti zajedno.',
    interaction_hint: 'Ciljaj 300+ da bi dobio Prestiž bonus posle sezone.',
  },
];

// ─── Exported API ──────────────────────────────────────────────────────────────

/**
 * Check if FTUE should be shown (first play only)
 * @returns {boolean}
 */
export function shouldShowTutorial() {
  try {
    return !localStorage.getItem(STORAGE_KEYS.ftue_done);
  } catch (e) {
    return true; // Safe fallback — show tutorial if localStorage unavailable
  }
}

/**
 * Mark FTUE as completed (persists across sessions)
 */
export function markTutorialDone() {
  try {
    localStorage.setItem(STORAGE_KEYS.ftue_done, '1');
  } catch (e) {
    // Ignore if localStorage unavailable (private mode, blocked)
  }
}

/**
 * Initialize and show the tutorial overlay.
 * @param {HTMLElement} overlay - overlay container element
 * @param {() => void} onDone - callback when tutorial finishes
 */
export function showTutorial(overlay, onDone) {
  overlayEl = overlay;
  onComplete = onDone;
  currentStep = 0;

  overlay.hidden = false;
  overlay.className = 'overlay overlay-tutorial';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Uputstvo za igru');

  renderStep();
  attachKeyboardNav();
}

/**
 * Reset tutorial flag (for debug/testing)
 */
export function resetTutorial() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ftue_done);
  } catch (e) {
    // ignore
  }
}

/**
 * Get current tutorial step index (0-based)
 * @returns {number}
 */
export function getTutorialStep() {
  return currentStep;
}

/**
 * Jump to a specific tutorial step (for testing)
 * @param {number} step - 0-indexed
 */
export function jumpToStep(step) {
  if (step >= 0 && step < STEPS.length) {
    currentStep = step;
    renderStep();
  }
}

// ─── Step Rendering ────────────────────────────────────────────────────────────

/**
 * Render the current tutorial step into the overlay
 */
function renderStep() {
  if (!overlayEl) return;
  const step = STEPS[currentStep];
  if (!step) {
    finishTutorial();
    return;
  }

  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  overlayEl.innerHTML = `
    <div class="tutorial-box" role="document">
      <div class="tutorial-header">
        <div class="tutorial-emoji" aria-hidden="true">${step.emoji}</div>
        <div class="tutorial-step-counter" aria-label="Korak ${currentStep + 1} od ${STEPS.length}">
          ${currentStep + 1} / ${STEPS.length}
        </div>
      </div>

      <h2 class="tutorial-title">${step.title}</h2>
      <p class="tutorial-body">${step.body}</p>
      <p class="tutorial-tip" aria-label="Savet"
         style="background:rgba(139,195,74,0.12);border-left:3px solid #8bc34a;padding:8px 12px;border-radius:4px;margin-top:12px">
        💡 ${step.highlight_tip}
      </p>
      ${step.interaction_hint ? `
        <p class="tutorial-interaction" aria-label="Šta da uradiš"
           style="font-style:italic;color:#a89880;font-size:13px;margin-top:8px">
          → ${step.interaction_hint}
        </p>
      ` : ''}

      <div class="tutorial-actions" style="margin-top:20px;display:flex;gap:8px;justify-content:space-between;align-items:center">
        <button class="btn-skip-tutorial btn-secondary" id="tutorial-skip"
                aria-label="Preskoči ceo vodič">
          Preskoči vodič
        </button>
        <div style="display:flex;gap:8px">
          ${!isFirst ? `
            <button class="btn-prev-step btn-secondary" id="tutorial-prev"
                    aria-label="Prethodni korak">← Nazad</button>
          ` : ''}
          <button class="btn-next-step btn-primary" id="tutorial-next"
                  aria-label="${isLast ? 'Počni igru' : 'Sledeći korak'}">
            ${isLast ? '🌾 Počni igru!' : 'Sledeće →'}
          </button>
        </div>
      </div>

      <div class="tutorial-dots" aria-label="Napredak" role="tablist">
        ${STEPS.map((_, i) => `
          <span class="dot ${i === currentStep ? 'active' : ''}"
                role="tab"
                aria-selected="${i === currentStep}"
                aria-label="Korak ${i + 1}"
                tabindex="${i === currentStep ? 0 : -1}"
                data-step="${i}">
          </span>
        `).join('')}
      </div>

      <p class="tutorial-keyboard-hint" style="text-align:center;color:#6b7c5e;font-size:11px;margin-top:8px">
        ← → strelice za navigaciju · Escape za preskok
      </p>
    </div>
  `;

  // Bind buttons
  const nextBtn = overlayEl.querySelector('#tutorial-next');
  nextBtn?.addEventListener('click', goNext);
  nextBtn?.focus();

  overlayEl.querySelector('#tutorial-prev')?.addEventListener('click', goPrev);
  overlayEl.querySelector('#tutorial-skip')?.addEventListener('click', finishTutorial);

  // Dot navigation
  overlayEl.querySelectorAll('.dot[data-step]').forEach((dot) => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.dataset.step ?? '0', 10);
      currentStep = step;
      renderStep();
    });
  });
}

// ─── Navigation ────────────────────────────────────────────────────────────────

function goNext() {
  currentStep++;
  if (currentStep >= STEPS.length) {
    finishTutorial();
  } else {
    renderStep();
  }
}

function goPrev() {
  if (currentStep > 0) {
    currentStep--;
    renderStep();
  }
}

/**
 * Attach keyboard navigation to document while tutorial is open
 */
function attachKeyboardNav() {
  function onKey(e) {
    if (!overlayEl || overlayEl.hidden) {
      document.removeEventListener('keydown', onKey);
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finishTutorial();
    } else if (e.key === 'Enter') {
      // Enter handled by focused button naturally
    }
  }
  document.addEventListener('keydown', onKey);
}

// ─── Finish ────────────────────────────────────────────────────────────────────

/**
 * Finish tutorial — mark done, hide overlay, fire callback
 */
function finishTutorial() {
  markTutorialDone();
  if (overlayEl) {
    overlayEl.hidden = true;
    overlayEl.className = 'overlay';
    overlayEl.removeAttribute('role');
    overlayEl.removeAttribute('aria-modal');
    overlayEl.innerHTML = '';
  }
  if (onComplete) {
    onComplete();
    onComplete = null;
  }
}
