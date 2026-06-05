/** @module input — Mouse/touch handlers for slider, redirect buttons, upgrade clicks */

import { CONFIG } from './config.js';
import { setBPM, bpmFromSliderPct } from './systems/bpm_controller.js';
import { executeRedirect, REDIRECT_PAIRS, getRedirectButtonStates } from './systems/routing_manager.js';
import { buyUpgrade } from './systems/upgrade_manager.js';
import { buyPromo } from './systems/promo_engine.js';
import { hireCoordinator } from './systems/coordinator_manager.js';
import { buyInsurance } from './systems/macro_engine.js';
import { AudioAPI } from './audio.js';

/** @type {GameState|null} */
let _gameState = null;
/** @type {HTMLElement|null} */
let _bpmSlider = null;
let _sliderDragging = false;

/**
 * Initialize all input handlers
 * @param {object} gameState reference to {macro, micro, meta, layer}
 */
export function initInput(gameState) {
  _gameState = gameState;

  // BPM Slider
  _bpmSlider = document.getElementById('bpm-slider');
  if (_bpmSlider) {
    initBPMSlider();
  }

  // Redirect buttons
  initRedirectButtons();

  // Macro decision buttons (event delegation on #macro-screen)
  const macroScreen = document.getElementById('macro-screen');
  if (macroScreen) {
    macroScreen.addEventListener('click', onMacroClick);
  }

  // Victory and prestige screen button delegation — these screens rebuild innerHTML
  // and add their own click listeners, but those listeners don't have gameState access.
  // Add a document-level delegate to catch data-action buttons from any screen.
  document.addEventListener('click', (e) => {
    // Skip if event already handled by #macro-screen delegation
    if (e.target.closest('#macro-screen')) return;
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    onMacroClick(e);
  });

  // Start event button — use event delegation on macro-screen because
  // renderMacroScreen rebuilds innerHTML and the old #btn-start-event element is replaced.
  // The macro-screen listener already registered above via onMacroClick handles data-action,
  // but btn-start-event may not carry data-action; add a dedicated delegated handler here.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#btn-start-event');
    if (!btn) return;
    if (_gameState && _gameState.onStartEvent) {
      _gameState.onStartEvent();
    }
  });

  // Touch: prevent double-tap zoom
  document.addEventListener('touchend', e => e.preventDefault(), { passive: false });

  // Keyboard shortcuts
  document.addEventListener('keydown', onKeyDown);
}

/**
 * Init BPM slider drag behavior
 */
function initBPMSlider() {
  const slider = _bpmSlider;

  function getSliderPct(clientX) {
    const rect = slider.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function updateBPM(clientX) {
    if (!_gameState?.micro) return;
    if (_gameState.micro.bpm_locked) return;
    const pct = getSliderPct(clientX);
    const newBPM = bpmFromSliderPct(pct);
    setBPM(_gameState.micro, newBPM, _gameState._upgradeEffects || {});
    updateSliderVisual(pct);
  }

  slider.addEventListener('mousedown', e => { _sliderDragging = true; updateBPM(e.clientX); });
  window.addEventListener('mousemove', e => { if (_sliderDragging) updateBPM(e.clientX); });
  window.addEventListener('mouseup', () => { _sliderDragging = false; });

  slider.addEventListener('touchstart', e => {
    _sliderDragging = true;
    updateBPM(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (_sliderDragging) updateBPM(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { _sliderDragging = false; });
}

/**
 * Update slider visual fill
 * @param {number} pct 0-1
 */
function updateSliderVisual(pct) {
  const fill = document.getElementById('bpm-slider-fill');
  if (fill) fill.style.width = `${pct * 100}%`;
}

/**
 * Init redirect button click handlers
 */
function initRedirectButtons() {
  REDIRECT_PAIRS.forEach((pair, i) => {
    const btn = document.getElementById(`redirect-btn-${i}`);
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!_gameState?.micro || !_gameState?.macro) return;
      const { micro, macro, _upgradeEffects } = _gameState;
      const states = getRedirectButtonStates(micro.zones, false);
      const state = states[i];
      if (!state.enabled) return;

      const followRate = CONFIG.REDIRECT_FOLLOW_RATE + (_upgradeEffects?.follow_rate_bonus || 0);
      const count = executeRedirect(
        pair.from, pair.to,
        micro.crowd_groups, micro.zones,
        followRate, CONFIG.MIGRATION_SPEED
      );

      if (count > 0) {
        // Visual feedback
        btn.classList.add('redirect-active');
        setTimeout(() => btn.classList.remove('redirect-active'), 300);
      }
    });
  });
}

/**
 * Handle macro screen clicks (event delegation)
 * @param {MouseEvent} e
 */
function onMacroClick(e) {
  if (!_gameState) return;
  const { macro, meta, _upgradeEffects } = _gameState;
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const param = btn.dataset.param;

  switch (action) {
    case 'buy-promo':
      if (macro && param) {
        const result = buyPromo(macro, param, macro.city_order[macro.current_city_index], _upgradeEffects || {});
        showActionFeedback(btn, result.ok ? '✓' : result.reason, result.ok);
      }
      break;

    case 'buy-upgrade':
      if (macro && param) {
        const result = buyUpgrade(macro, param);
        if (result.ok) AudioAPI.onUpgradePurchased();
        showActionFeedback(btn, result.ok ? '✓' : result.reason, result.ok);
      }
      break;

    case 'hire-coordinator':
      if (macro && meta && param) {
        const result = hireCoordinator(macro, meta, param, _upgradeEffects || {});
        if (result.ok) AudioAPI.onCoordinatorHired(param);
        showActionFeedback(btn, result.ok ? '✓ Angažovan' : result.reason, result.ok);
      }
      break;

    case 'buy-insurance':
      if (macro) {
        const result = buyInsurance(macro);
        showActionFeedback(btn, result.ok ? '✓ Osiguranje aktivno' : result.reason, result.ok);
      }
      break;

    case 'open-upgrades':
      document.getElementById('upgrades-panel')?.classList.toggle('hidden');
      break;

    case 'prestige':
      if (_gameState.onPrestige) _gameState.onPrestige();
      break;

    case 'share':
      if (_gameState.onShare) _gameState.onShare();
      break;
  }

  // Trigger UI re-render
  if (_gameState.onMacroAction) _gameState.onMacroAction(action, param);
}

/**
 * Show brief feedback on button
 * @param {HTMLElement} btn
 * @param {string} text
 * @param {boolean} ok
 */
function showActionFeedback(btn, text, ok) {
  const orig = btn.textContent;
  btn.textContent = text;
  btn.style.color = ok ? '#4a7c59' : '#ff4444';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.color = '';
  }, 1500);
}

/**
 * Keyboard shortcuts
 * @param {KeyboardEvent} e
 */
function onKeyDown(e) {
  if (!_gameState) return;
  const { micro } = _gameState;
  if (!micro) return;

  switch (e.key) {
    case 'ArrowLeft':
      if (!micro.bpm_locked) setBPM(micro, micro.current_bpm - CONFIG.BPM_STEP, {});
      break;
    case 'ArrowRight':
      if (!micro.bpm_locked) setBPM(micro, micro.current_bpm + CONFIG.BPM_STEP, {});
      break;
    case '1': case '2': case '3': case '4': {
      const idx = parseInt(e.key) - 1;
      const btn = document.getElementById(`redirect-btn-${idx}`);
      if (btn) btn.click();
      break;
    }
    case 'Escape':
      // Close any open panel
      document.querySelectorAll('.panel:not(.hidden)').forEach(p => p.classList.add('hidden'));
      break;
  }
}
