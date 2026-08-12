/** @fileoverview Main UI coordinator: screen switching, DOM initialization, routing */

import { getState, setState } from '../state.js';
import { initHUD, updateHUD, showHUDToast } from './hud.js';
import { initModals, showOnboarding, showWeekResult, showVolunteerJoin } from './modals.js';
import { renderMacro } from './macro_ui.js';
import { renderMicro } from './micro_ui.js';
import { renderFinale, updateFinaleHUD, updateFinaleFarm } from './finale_ui.js';
import { renderScore } from './score_ui.js';
import { advanceWeek, shouldStartFinale, resolveBuildingUpgrade } from '../systems/progression.js';
import { resolveMicro } from '../systems/micro.js';
import { startFinale } from '../systems/finale.js';
import { autoSave } from '../systems/checkpoint.js';
import { getAudio } from '../audio.js';
import { calcFinalScore } from '../systems/scoring.js';

/** @type {HTMLElement} */
let _screenContainer = null;

/** @type {string} current screen name */
let _currentScreen = '';

/**
 * Initialize the UI system
 * @param {Object} elements - { hud, screenContainer, modalOverlay }
 */
export function initUI(elements) {
  _screenContainer = elements.screenContainer;
  initHUD(elements.hud);
  initModals(elements.modalOverlay);
}

/**
 * Navigate to a screen
 * @param {string} screen - MENU | MACRO | MICRO | RESULT | FINALE | SCORE
 */
export function navigateTo(screen) {
  if (_currentScreen === screen) return;
  _currentScreen = screen;
  setState({ screen });
  updateHUD();
  renderScreen(screen);
}

/**
 * Render the active screen
 * @param {string} screen
 */
function renderScreen(screen) {
  if (!_screenContainer) return;
  _screenContainer.className = `screen screen-${screen.toLowerCase()}`;
  _screenContainer.innerHTML = '';

  const audio = getAudio();

  switch (screen) {
    case 'MENU':
      renderMenuScreen(_screenContainer);
      audio?.playAmbient('menu');
      break;
    case 'MACRO':
      renderMacroScreen(_screenContainer);
      audio?.playAmbient('macro');
      break;
    case 'MICRO':
      renderMicroScreen(_screenContainer);
      audio?.playAmbient('micro');
      break;
    case 'RESULT':
      renderResultScreen(_screenContainer);
      audio?.playSFX('result_arpeggio');
      break;
    case 'FINALE':
      renderFinaleScreen(_screenContainer);
      audio?.playAmbient('finale');
      break;
    case 'SCORE':
      renderScoreScreen(_screenContainer);
      audio?.playAmbient(getState().finalScore >= 7.5 ? 'score_win' : 'score_fail');
      break;
    default:
      _screenContainer.innerHTML = `<div class="error-screen">Unknown screen: ${screen}</div>`;
  }
}

/** ── Screen renderers ── */

function renderMenuScreen(container) {
  const state = getState();
  const hasSave = state.week > 1 || state.screen !== 'MENU';

  container.innerHTML = `
    <div class="menu-screen">
      <div class="menu-hero">
        <div class="menu-logo">🌄</div>
        <h1 class="menu-title">Guncati Grand</h1>
        <p class="menu-tagline">Multi-layer Festival Management Sim</p>
        <p class="menu-brand">Zabavni Radni Park · Turneja 2026</p>
      </div>
      <div class="menu-actions">
        ${hasSave ? `
          <button class="btn-primary btn-xlarge" id="btn-continue">
            ▶️ Nastavi — Nedelja ${state.week}
          </button>
        ` : ''}
        <button class="btn-${hasSave ? 'secondary' : 'primary btn-xlarge'}" id="btn-new">
          🌱 Nova Sezona
        </button>
      </div>
      <div class="menu-story">
        <p>Nasleduješ polugorak teren. 10 nedelja do Grand Finale-a.</p>
        <p>Alociraš budžet. Motivišeš volontere. <strong>Tom Sawyer</strong> govori.</p>
      </div>
      <div class="menu-footer">
        <span>🎵 Guncati × Kluboslavija × MKDSLend</span>
      </div>
    </div>
  `;

  container.querySelector('#btn-new')?.addEventListener('click', () => {
    navigateTo('MACRO');
  });

  container.querySelector('#btn-continue')?.addEventListener('click', () => {
    continueGame();
  });
}

function renderMacroScreen(container) {
  const state = getState();

  // Check onboarding
  const needsOnboarding = state.week <= 3 && state.onboardingStep < state.week;

  renderMacro(container, (allocation) => {
    // Macro confirmed: go to Micro
    if (needsOnboarding && state.week === 1 && state.onboardingStep === 0) {
      showOnboarding(1, () => navigateTo('MICRO'));
    } else {
      navigateTo('MICRO');
    }
  });

  // Show onboarding if needed
  if (needsOnboarding && !state.allocationLocked) {
    showOnboarding(state.week, () => {});
  }
}

function renderMicroScreen(container) {
  const state = getState();

  // Check onboarding N2
  if (state.week === 2 && state.onboardingStep < 2) {
    showOnboarding(2, () => {});
  }

  renderMicro(container, (assignments) => {
    // Resolve micro
    const microResult = resolveMicro(state.volunteers, assignments, state);

    // Advance week (internally handles volunteer unlocks)
    const weekResult = advanceWeek(microResult);

    // Auto-save
    autoSave(state.week);

    // Show new volunteer joins using weekResult (avoids duplicate checkVolunteerUnlocks call)
    const newVolNames = weekResult.newVolunteers || [];
    if (newVolNames.length > 0) {
      const updatedState = getState();
      let queue = updatedState.volunteers.filter(v => newVolNames.includes(v.name));
      const showNext = () => {
        if (queue.length === 0) {
          showWeekResult(weekResult, () => {
            const s = getState();
            if (shouldStartFinale(s.week)) {
              navigateTo('FINALE');
            } else {
              navigateTo('MACRO');
            }
          });
          return;
        }
        showVolunteerJoin(queue.shift(), showNext);
      };
      showNext();
    } else {
      showWeekResult(weekResult, () => {
        const s = getState();
        if (shouldStartFinale(s.week)) {
          navigateTo('FINALE');
        } else {
          navigateTo('MACRO');
        }
      });
    }
  });
}

function renderResultScreen(container) {
  // Result is shown as a modal on top of Micro, not a separate screen
  navigateTo('MACRO');
}

function renderFinaleScreen(container) {
  renderFinale(container);

  // Start the simulation
  startFinale({
    onTick: (finaleState) => {
      updateFinaleHUD(finaleState);
      updateFinaleFarm(getState());
      getAudio()?.updateFinaleIntensity(finaleState);
    },
    onEvent: (event) => {
      getAudio()?.playSFX('event_trigger');
    },
    onTransition: (info) => {
      if (info.pending) {
        getAudio()?.playSFX('dj_transition_pending');
      } else if (info.success) {
        getAudio()?.playSFX('dj_transition_good');
      } else {
        getAudio()?.playSFX('dj_transition_bad');
      }
    },
    onFinaleEnd: ({ revenue }) => {
      showHUDToast(`🎪 Finale završen! Prihod: ${revenue} GC`, 'success', 3000);
      const state = getState();
      const breakdown = calcFinalScore(state);
      setState({ finalScore: breakdown.finalScore, scoreBreakdown: breakdown });
      setTimeout(() => navigateTo('SCORE'), 1500);
    }
  });
}

function renderScoreScreen(container) {
  renderScore(container, {
    onNewGame: () => startNewGame(),
    onPrestige: () => startNewGame()
  });
}

/** ── Game lifecycle ── */

function startNewGame() {
  navigateTo('MENU');
}

function continueGame() {
  const state = getState();
  const screen = state.screen;
  if (screen === 'MACRO' || screen === 'MICRO' || screen === 'FINALE' || screen === 'SCORE') {
    navigateTo(screen);
  } else {
    navigateTo('MACRO');
  }
}

/**
 * Handle visibility change (mobile focus loss)
 */
export function handleVisibilityChange() {
  const state = getState();
  if (state.screen === 'FINALE' && state.finale?.active) {
    if (document.hidden) {
      import('../systems/finale.js').then(({ pauseFinale }) => pauseFinale());
    } else {
      import('../systems/finale.js').then(({ resumeFinale }) => resumeFinale());
    }
  }
}
