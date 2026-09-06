/**
 * @module main
 * Entry point for Jesenji Tok.
 * DOM-based seasonal scheduling puzzle — not canvas loop.
 * Wires all modules and manages game phase transitions.
 *
 * Game phases:
 *   planning → bura → score → prestige → planning (next run)
 *
 * Key responsibilities:
 *   - Bootstrap all subsystems in correct order
 *   - Route input events (card select, cell tap, keyboard)
 *   - Manage phase transitions (planning → bura → score → prestige)
 *   - Auto-save, visibility-change pause, audio toggle
 *   - Debug console helpers (window.jt)
 *   - Window resize / orientation change handling
 *   - Online/offline state tracking
 */

import { STORAGE_KEYS, SAVE_INTERVAL_SEC, DEBUG, FORECAST_FIRST_ASSIGN_REVEAL } from './config.js';
import {
  createState,
  loadState,
  saveState,
  clearState,
  assignTask,
  unassignTask,
  isTaskAssigned,
  allTasksAssigned,
  getAssignment,
  loadPrestigeBonus,
  saveBestScore,
  loadBestScore,
  getScheduleHealth,
} from './state.js';

import { TASKS } from './content/tasks.js';
import { WEATHER_COMMENTS } from './content/brana_dialogs.js';

import { generateWeather, revealForecast } from './systems/weather.js';
import { validateAssign, buildValidationSummary } from './systems/validation.js';
import { calculateScore } from './systems/scoring.js';
import { detectConflict, setErrorState, clearErrorState, scanAllConflicts } from './systems/conflict.js';
import { applyPrestige, skipPrestige, canPrestige } from './systems/prestige.js';
import { checkAndUnlockAchievements, unlockFirstAssign, getAchievementToast } from './systems/achievements.js';

import { initGrid, updateGrid, triggerCellError } from './ui/grid.js';
import { initCards, updateCards, flashCardAssigned } from './ui/cards.js';
import { shouldShowTutorial, showTutorial } from './ui/tutorial.js';
import { showScoreScreen } from './ui/score-screen.js';
import { showPrestigeScreen } from './ui/prestige-screen.js';

import { initRender, render, renderHUD, renderForecastBar, showAchievementToast, showToast } from './render.js';
import { initUI, updateHUD, showTaskTooltip, showIntroMessage, announce } from './ui.js';
import { initInput, haptic, isTouchDevice } from './input.js';
import {
  initAudio,
  resumeAudio,
  playThud,
  playClick,
  playError,
  playHarmonika,
  startAmbient,
  stopAmbient,
  playBuraStart,
  toggleMute,
  isAmbientRunning,
  getAudioStatus,
} from './audio.js';

// ─── DOM Elements ─────────────────────────────────────────────────────────────

const appEl = document.getElementById('app');
const hudEl = document.getElementById('hud');
const gameGridEl = document.getElementById('game-grid');
const cardPaletteEl = document.getElementById('card-palette');
const forecastBarEl = document.getElementById('forecast-bar');
const overlayEl = document.getElementById('overlay');
const audioToggleBtn = document.getElementById('btn-audio-toggle');
const closeSeasonBtn = document.getElementById('btn-close-season');

// ─── Game State ────────────────────────────────────────────────────────────────

/** @type {import('./state.js').GameState} */
let state;
let saveTimer = 0;
let lastRenderTime = 0;
let _isOnline = navigator.onLine;
let _isFocused = !document.hidden;
let _hintTimer = null;
let _lastInteraction = Date.now();

// ─── Hint System ───────────────────────────────────────────────────────────────

/**
 * Idle hint: show a Brana hint after 45 seconds of no interaction
 */
const BRANA_HINTS = [
  'Tapni karticu, pa tapni ćeliju — to je sve.',
  'Ozimo i Suvozid imaju najuži prozor. Rasporedi ih prve.',
  'Ekosistem bonus: Micelij + Jezero + Kompost sva tri u prozoru = ×1.5.',
  'Kiša blokira jedino Suvozid i tarabe. Ostalo radi po vlazi.',
  'Mraz od N10 skraćuje Micelij i Rezidbu. Pazi na prognozu.',
  'Broj 1–6 na tastaturi bira zadatak direktno.',
  'Tap iste kartice ponovo = deselektuj.',
];
let _hintIndex = 0;

function startHintTimer() {
  clearHintTimer();
  _hintTimer = setTimeout(() => {
    if (state.phase === 'planning') {
      const hint = BRANA_HINTS[_hintIndex % BRANA_HINTS.length];
      _hintIndex++;
      showToast(`🧑‍🌾 ${hint}`, 'info');
    }
    startHintTimer();
  }, 45000);
}

function clearHintTimer() {
  if (_hintTimer) {
    clearTimeout(_hintTimer);
    _hintTimer = null;
  }
}

function touchInteraction() {
  _lastInteraction = Date.now();
  _hintIndex = 0; // Reset hint index on interaction
  startHintTimer();
}

// ─── Audio Toggle ──────────────────────────────────────────────────────────────

/**
 * Toggle audio mute and update button label
 */
function handleAudioToggle() {
  const status = getAudioStatus();
  toggleMute();
  const newMuted = !status.muted;
  if (audioToggleBtn) {
    audioToggleBtn.setAttribute('aria-pressed', String(newMuted));
    audioToggleBtn.textContent = newMuted ? '🔇' : '🔊';
    audioToggleBtn.title = newMuted ? 'Uključi zvuk' : 'Isključi zvuk';
  }
  announce(newMuted ? 'Zvuk isključen' : 'Zvuk uključen');
}

/**
 * Sync audio toggle button to current audio state
 */
function syncAudioToggle() {
  const status = getAudioStatus();
  if (audioToggleBtn) {
    const muted = status.muted;
    audioToggleBtn.setAttribute('aria-pressed', String(muted));
    audioToggleBtn.textContent = muted ? '🔇' : '🔊';
    audioToggleBtn.title = muted ? 'Uključi zvuk' : 'Isključi zvuk';
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

function init() {
  // Load or create state
  const savedState = loadState();
  state = savedState ?? createState();

  // Apply persisted prestige bonus to fresh state
  if (!savedState) {
    const persistedBonus = loadPrestigeBonus();
    state.prestige_bonus = persistedBonus;
    if (persistedBonus === 'extra_group') {
      state.groups_per_week = 4;
    }
  }

  // Initialize weather if missing (fresh run)
  if (!state.weather) {
    state.weather = generateWeather(state.prestige_bonus);
  }

  // Ensure phase is set
  if (!state.phase) state.phase = 'planning';

  // Initialize audio (lazy — resumed on first interaction)
  initAudio();
  syncAudioToggle();

  // Initialize render system
  initRender({ hud: hudEl, forecastBar: forecastBarEl });

  // Initialize UI system
  initUI();

  // Initialize input
  initInput({
    onCardSelect: handleCardSelect,
    onCellTap: handleCellTap,
    onCardInfo: handleCardInfo,
  });

  // Initialize grid
  if (gameGridEl) {
    initGrid(gameGridEl, (taskId, week) => handleCellTap(taskId, week));
  }

  // Initialize cards
  if (cardPaletteEl) {
    initCards(
      cardPaletteEl,
      (taskId) => handleCardSelect(taskId),
      (taskId) => handleCardInfo(taskId)
    );
  }

  // Keyboard handler
  document.addEventListener('keydown', (e) => {
    if (state.phase === 'planning') {
      handleKeyboard(e);
    } else if (e.key === 'Escape') {
      handleEscapeOverlay();
    }
  });

  // Close season button
  if (closeSeasonBtn) {
    closeSeasonBtn.addEventListener('click', () => {
      if (state.phase === 'planning') {
        triggerCloseSeason();
      }
    });
  }

  // Close season custom event (from HUD button wired by render.js)
  document.addEventListener('close-season', () => {
    if (state.phase === 'planning') {
      triggerCloseSeason();
    }
  });

  // Audio toggle
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      resumeAudio();
      handleAudioToggle();
    });
  }

  // First interaction — resume audio context
  const onFirstInteraction = () => {
    resumeAudio();
    document.removeEventListener('click', onFirstInteraction);
    document.removeEventListener('touchstart', onFirstInteraction);
    document.removeEventListener('keydown', onFirstInteraction);
  };
  document.addEventListener('click', onFirstInteraction);
  document.addEventListener('touchstart', onFirstInteraction, { passive: true });
  document.addEventListener('keydown', onFirstInteraction);

  // Visibility change — pause/resume ambient when tab hides/shows
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Window focus/blur (secondary — some browsers don't fire visibilitychange)
  window.addEventListener('blur', () => {
    _isFocused = false;
    if (isAmbientRunning()) stopAmbient();
  });
  window.addEventListener('focus', () => {
    _isFocused = true;
    if (state.phase === 'planning' && !isAmbientRunning()) {
      startAmbient();
    }
  });

  // Online/offline
  window.addEventListener('online', () => {
    _isOnline = true;
  });
  window.addEventListener('offline', () => {
    _isOnline = false;
    showToast('Nema interneta — igra radi offline.', 'info');
  });

  // Resize — re-render grid sizing
  window.addEventListener('resize', debounce(handleResize, 150));

  // Handle in-progress phase from saved state
  if (state.phase === 'score' || state.phase === 'bura') {
    // Reshow score screen from saved state edge case — reset to planning
    state.phase = 'planning';
    saveState(state);
  }

  // Expose debug helpers
  exposeDebugApi();

  // Show FTUE or start game
  if (shouldShowTutorial() && overlayEl) {
    showTutorial(overlayEl, () => {
      startGame();
    });
  } else {
    startGame();
  }

  // Auto-save loop
  setInterval(() => {
    if (state.phase === 'planning') {
      saveState(state);
    }
  }, SAVE_INTERVAL_SEC * 1000);

  // Render loop (for error state auto-clear + idle updates)
  requestAnimationFrame(renderLoop);

  // Start hint timer
  startHintTimer();

  if (DEBUG.log_state) {
    console.log('[JT] init complete', state);
  }
}

// ─── Event Handling ────────────────────────────────────────────────────────────

/**
 * Handle visibility change (tab switch, phone lock screen)
 */
function handleVisibilityChange() {
  if (document.hidden) {
    _isFocused = false;
    // Pause ambient when hidden — save battery
    if (isAmbientRunning()) stopAmbient();
    // Save state on hide
    if (state.phase === 'planning') saveState(state);
  } else {
    _isFocused = true;
    // Resume ambient if in planning phase
    if (state.phase === 'planning') {
      startAmbient();
    }
  }
}

/**
 * Handle window resize — re-render UI for new size
 */
function handleResize() {
  if (state.phase === 'planning') {
    doRender();
  }
}

/**
 * Handle Escape key to close overlays/tooltips/deselect
 */
function handleEscapeOverlay() {
  // Dismiss any visible tooltip first
  if (document.getElementById('tooltip')?.hidden === false) {
    document.getElementById('tooltip').hidden = true;
    return;
  }
  // Then dismiss any overlay if dismissible
  if (overlayEl && !overlayEl.hidden) {
    // Overlays for bura/score are NOT dismissible by Escape
    // Only tutorial might be
  }
}

/**
 * Start/restart the planning phase
 */
function startGame() {
  state.phase = 'planning';
  touchInteraction();

  // Start ambient
  startAmbient();

  // Show weather intro
  const weatherComment = WEATHER_COMMENTS[state.weather?.preset_id] ?? '';
  showIntroMessage(weatherComment, state);

  // Full render
  doRender();

  if (DEBUG.log_state) {
    console.log('[JT] startGame', { weather: state.weather?.preset_id, bonus: state.prestige_bonus });
  }
}

// ─── Input Handlers ────────────────────────────────────────────────────────────

/**
 * Handle card select/deselect
 * @param {string|null} taskId
 */
function handleCardSelect(taskId) {
  resumeAudio();
  touchInteraction();
  playClick();

  if (state.phase !== 'planning') return;

  // Toggle: tap selected card again = deselect
  if (state.selected_task_id === taskId) {
    state.selected_task_id = null;
  } else {
    state.selected_task_id = taskId;
  }

  clearErrorState(state);
  doRender();

  // Announce for screen readers
  if (state.selected_task_id) {
    const task = TASKS.find((t) => t.id === state.selected_task_id);
    if (task) announce(`Selektovan: ${task.name}. Tap ćeliju u gridu za dodelu.`);
  } else {
    announce('Deselektovano.');
  }
}

/**
 * Handle grid cell tap
 * @param {string} cellTaskId - the task row this cell belongs to
 * @param {number} week
 */
function handleCellTap(cellTaskId, week) {
  resumeAudio();
  touchInteraction();
  if (state.phase !== 'planning') return;

  const selectedTaskId = state.selected_task_id;
  if (!selectedTaskId) {
    // No task selected — show hint
    showToast('Prvo selektuj zadatak (tap na karticu ispod)', 'info');
    haptic('light');
    return;
  }

  // The selected task should be placed in this week
  handleAssign(selectedTaskId, week);
}

/**
 * Handle task assignment
 * @param {string} taskId
 * @param {number} week
 */
function handleAssign(taskId, week) {
  // If same task already in this week, treat as unassign
  const existing = getAssignment(state, taskId);
  if (existing && existing.week === week) {
    unassignTask(state, taskId);
    state.selected_task_id = null;
    playClick();
    doRender();
    const task = TASKS.find((t) => t.id === taskId);
    announce(`${task?.name ?? taskId} uklonjen iz N${week}.`);
    saveState(state);
    return;
  }

  // Validate
  const conflict = detectConflict(state, taskId, week);

  if (conflict.hasConflict) {
    playError();
    haptic('medium');
    setErrorState(state, taskId, week, conflict.message);
    triggerCellError(taskId, week);
    showToast(conflict.message, 'error');
    doRender();
    announce(`Greška: ${conflict.message}`);
    return;
  }

  // Valid assign (may have warning)
  if (conflict.severity === 'warning') {
    showToast(conflict.message, 'info');
  }

  // Assign
  assignTask(state, taskId, week);

  // Reveal forecast progressively on each new assignment
  revealForecast(state.weather, FORECAST_FIRST_ASSIGN_REVEAL);
  renderForecastBar(state);

  // First assign achievement
  const wasFirst = unlockFirstAssign(state);
  if (wasFirst) {
    showAchievementToast(getAchievementToast('first_assign'));
  }

  // Deselect card
  state.selected_task_id = null;
  clearErrorState(state);

  playThud();
  haptic('light');
  flashCardAssigned(taskId);

  // Screen reader announcement
  const task = TASKS.find((t) => t.id === taskId);
  announce(`${task?.name ?? taskId} dodeljen u N${week}.`);

  doRender();
  saveState(state);

  // Check if all tasks assigned — prompt to close
  if (allTasksAssigned(state)) {
    setTimeout(() => {
      const health = getScheduleHealth(state);
      if (health.allDone) {
        showToast('Sve parcele raspoređene! Zatvori sezonu da vidiš rezultat.', 'success');
        highlightCloseButton();
      }
    }, 400);
  }

  if (DEBUG.log_state) {
    console.log('[JT] assign', taskId, 'week', week, 'assignments', state.assignments.length);
  }
}

/**
 * Handle info button click on task card
 * @param {string} taskId
 */
function handleCardInfo(taskId) {
  touchInteraction();
  const card = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
  if (card) {
    const rect = card.getBoundingClientRect();
    showTaskTooltip(taskId, rect, state);
  } else {
    showTaskTooltip(taskId, null, state);
  }
}

/**
 * Keyboard shortcut handling
 * @param {KeyboardEvent} e
 */
function handleKeyboard(e) {
  // M = toggle mute
  if (e.key === 'm' || e.key === 'M') {
    e.preventDefault();
    handleAudioToggle();
    return;
  }

  // Enter = close season if all assigned, or assign selected to focused cell
  if (e.key === 'Enter') {
    if (state.selected_task_id === null && allTasksAssigned(state)) {
      triggerCloseSeason();
      return;
    }
  }

  // Escape = deselect / close tooltip
  if (e.key === 'Escape') {
    const tooltipEl = document.getElementById('tooltip');
    if (tooltipEl && !tooltipEl.hidden) {
      tooltipEl.hidden = true;
      return;
    }
    if (state.selected_task_id !== null) {
      state.selected_task_id = null;
      clearErrorState(state);
      doRender();
      announce('Deselektovano.');
    }
    return;
  }

  // 1–6 = select task by index
  const idx = parseInt(e.key, 10) - 1;
  if (idx >= 0 && idx < TASKS.length) {
    e.preventDefault();
    handleCardSelect(TASKS[idx].id);
  }
}

// ─── Phase Transitions ─────────────────────────────────────────────────────────

/**
 * Trigger the end-of-season zimska bura and score reveal.
 * Can be called even if not all tasks are assigned.
 */
function triggerCloseSeason() {
  if (state.phase !== 'planning') return;

  state.phase = 'bura';
  state.selected_task_id = null;
  clearHintTimer();

  stopAmbient();
  playBuraStart();

  // Dismiss any open tooltip
  const tooltipEl = document.getElementById('tooltip');
  if (tooltipEl) tooltipEl.hidden = true;

  // Calculate score
  const scoreResult = calculateScore(state);
  state.score_breakdown = scoreResult.breakdown;
  state.last_score = scoreResult.total;
  state.last_rank = scoreResult.rank_id;
  state.total_runs = (state.total_runs ?? 0) + 1;

  // Save best score
  saveBestScore(scoreResult.total);

  // Check achievements
  const newAchievements = checkAndUnlockAchievements(state, scoreResult);

  // Save state
  saveState(state);

  announce(`Zimska bura. Sezona se zatvara. Ukupno: ${scoreResult.total} poena.`);

  // Show score screen
  if (overlayEl) {
    showScoreScreen(
      overlayEl,
      scoreResult,
      state,
      () => handlePlayAgain(),
      () => handlePrestige(scoreResult),
      newAchievements
    );
  }

  // Show achievement toasts after animation completes
  setTimeout(() => {
    for (const achId of newAchievements) {
      setTimeout(() => showAchievementToast(getAchievementToast(achId)), 600);
    }

    // Play harmonika on good score
    if (scoreResult.total >= 600) {
      setTimeout(() => playHarmonika(), 1500);
    }
  }, 3800);

  if (DEBUG.log_state) {
    console.log('[JT] season closed', scoreResult);
  }
}

/**
 * Handle "Play Again" — reset to planning without prestige
 */
function handlePlayAgain() {
  const persistedBonus = loadPrestigeBonus();
  const savedAchievements = { ...state.achievements };

  clearState();
  state = createState();
  state.prestige_bonus = persistedBonus;
  if (persistedBonus === 'extra_group') state.groups_per_week = 4;
  state.weather = generateWeather(persistedBonus);
  state.achievements = savedAchievements;
  saveState(state);

  if (overlayEl) overlayEl.hidden = true;

  startHintTimer();
  startGame();
}

/**
 * Handle "Prestige" — show prestige screen
 * @param {import('./systems/scoring.js').ScoreResult} scoreResult
 */
function handlePrestige(scoreResult) {
  if (!canPrestige(scoreResult.total)) return;

  if (overlayEl) {
    showPrestigeScreen(
      overlayEl,
      state.prestige_bonus,
      scoreResult.total,
      (bonusId) => {
        applyPrestige(state, bonusId);

        // Create fresh state with new prestige, preserve achievements across runs
        const newBonus = bonusId;
        const prevRuns = state.total_runs ?? 0;
        const savedAchievements = { ...state.achievements };
        state = createState();
        state.prestige_bonus = newBonus;
        if (newBonus === 'extra_group') state.groups_per_week = 4;
        state.weather = generateWeather(newBonus);
        state.total_runs = prevRuns;
        state.achievements = savedAchievements;
        saveState(state);

        if (overlayEl) overlayEl.hidden = true;
        startHintTimer();
        startGame();
      },
      () => {
        handlePlayAgain();
      }
    );
  }
}

// ─── Close Season Button Highlight ────────────────────────────────────────────

/**
 * Add a pulsing highlight to the close-season button when all tasks are done
 */
function highlightCloseButton() {
  const btn = document.getElementById('btn-close-season') ??
    document.querySelector('.btn-close-season');
  if (!btn) return;
  btn.classList.add('pulse-ready');
  setTimeout(() => btn.classList.remove('pulse-ready'), 4000);
}

// ─── Render ────────────────────────────────────────────────────────────────────

/**
 * Trigger a full render pass from current state
 */
function doRender() {
  if (state.phase === 'planning') {
    render(state);
    updateHUD(state);
  }
}

/**
 * Animation frame render loop (for auto-clearing error states etc.)
 * Throttled to ~10fps — this is a DOM game, not a canvas animation.
 * @param {number} now
 */
function renderLoop(now) {
  if (now - lastRenderTime >= 100) {
    lastRenderTime = now;
    if (state.phase === 'planning' && state.error_timestamp) {
      const age = Date.now() - state.error_timestamp;
      if (age > 2000) {
        // Auto-clear stale error states
        clearErrorState(state);
      }
      render(state);
      renderHUD(state);
    }
  }
  requestAnimationFrame(renderLoop);
}

// ─── Debug API ─────────────────────────────────────────────────────────────────

/**
 * Expose debug helpers on window.jt for console use
 */
function exposeDebugApi() {
  window.jt = {
    /** Print current game state */
    state: () => console.table(state),
    /** Force close season */
    closeSeason: () => triggerCloseSeason(),
    /** Assign all tasks to their optimal windows for testing */
    fillAll: () => {
      const { TASKS: T } = window.__jt_debug ?? {};
      if (!T) return console.warn('TASKS not loaded');
      T.forEach((task) => {
        if (!isTaskAssigned(state, task.id)) {
          assignTask(state, task.id, task.window_start + 1);
        }
      });
      doRender();
    },
    /** Reset tutorial flag */
    resetTutorial: () => {
      try { localStorage.removeItem(STORAGE_KEYS.ftue_done); } catch (e) {}
      console.log('Tutorial flag cleared — reload to see tutorial.');
    },
    /** Print score breakdown */
    score: () => {
      const s = calculateScore(state);
      console.table(s.breakdown);
      console.log('Total:', s.total, '/', s.rank_label);
    },
    /** Print validation summary */
    validate: () => {
      const v = buildValidationSummary(state);
      console.log(v);
    },
    /** Get conflict scan */
    conflicts: () => {
      const c = scanAllConflicts(state);
      console.log(c);
    },
    /** Audio status */
    audio: () => console.log(getAudioStatus()),
  };
  // Expose TASKS for fillAll
  window.__jt_debug = { TASKS };
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Simple debounce utility for resize handler
 * @param {() => void} fn
 * @param {number} delay
 * @returns {() => void}
 */
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ─── Start ─────────────────────────────────────────────────────────────────────

init();
