/**
 * @fileoverview Guncati Grand — Entry point
 * Bootstrap, game loop initialization, screen routing, module wiring
 */

import { getState, setState, loadState, saveState, createInitialState } from './state.js';
import { initUI, navigateTo, handleVisibilityChange } from './ui/ui.js';
import { initInput, delegateRipples } from './input.js';
import { initRender } from './render.js';
import { hasSavedGame } from './systems/checkpoint.js';
import { CONFIG } from './config.js';
import { createVolunteer } from './entities/volunteer.js';

/** Main entry point */
async function main() {
  // Prevent multiple init
  if (window._guncatiInitialized) return;
  window._guncatiInitialized = true;

  // DOM elements
  const appEl = document.querySelector('#app');
  const hudEl = document.querySelector('#hud');
  const screenEl = document.querySelector('#screen-container');
  const modalEl = document.querySelector('#modal-overlay');

  if (!appEl || !hudEl || !screenEl || !modalEl) {
    console.error('Guncati Grand: Missing DOM elements');
    return;
  }

  // Initialize subsystems
  initRender(appEl);
  initInput();
  delegateRipples(appEl);

  initUI({
    hud: hudEl,
    screenContainer: screenEl,
    modalOverlay: modalEl
  });

  // Load saved state or start fresh
  const hasSave = loadState();

  if (hasSave) {
    const state = getState();
    // If mid-game, go directly to appropriate screen
    if (state.screen === 'MACRO' || state.screen === 'MICRO' || state.screen === 'FINALE') {
      navigateTo('MENU'); // Always show menu first for safety
    } else {
      navigateTo('MENU');
    }
  } else {
    // Fresh start
    navigateTo('MENU');
  }

  // Global event handlers
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Handle first-click new game from menu
  document.addEventListener('click', _handleMenuActions, { capture: true });

  // Error recovery
  window.addEventListener('error', (e) => {
    console.error('Guncati Grand error:', e.error);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Guncati Grand unhandled promise rejection:', e.reason);
  });

  // Expose debug API in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.GG = {
      state: getState,
      setState,
      navigateTo,
      config: CONFIG,
      skipToFinale: () => {
        setState({
          week: 11,
          currentWB: 75,
          crowdSize: 200,
          seasonCrowdCap: 250,
          totalRevenue: 2000,
          buildings: { pozornica: 2, wc: 2, satre: 1, bar: 1, parking: 0 },
          volunteers: [
            createVolunteer('ana'),
            createVolunteer('mika'),
            createVolunteer('jovana')
          ],
          weeklyWB: Array(10).fill(70)
        });
        navigateTo('FINALE');
      },
      skipToScore: () => {
        setState({
          week: 11,
          finale: { active: false, elapsed: 900, crowdMood: 80, revenue: 4000 },
          screen: 'SCORE'
        });
        navigateTo('SCORE');
      }
    };
    console.log('🌄 Guncati Grand — Debug API: window.GG');
  }
}

/** Handle menu button clicks that set up new game state */
function _handleMenuActions(e) {
  const target = e.target.closest('#btn-new');
  if (!target) return;

  // Initialize fresh state
  const fresh = createInitialState();
  // Add first volunteer (Ana) at week 1 start
  fresh.volunteers = [createVolunteer('ana')];
  setState(fresh);
  saveState();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

export default main;
