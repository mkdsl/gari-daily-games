/**
 * Imanje Tycoon — main.js
 * Bootstrap: init state, wire tabs, start tick, audio on first gesture.
 */

import { GAME_CONFIG } from './config.js';
import { createState, loadState, saveState, applyOfflineProgress } from './state.js';
import { AudioEngine } from './audio.js';
import { startTick } from './engine/tick.js';
import { initTabs, updateAllUI } from './ui/tabs.js';
import { initMacroPanel, updateMacroPanelUI } from './ui/macro-panel.js';
import { initMushroomTab } from './ui/mushroom-tab.js';
import { initGreenhouseTab } from './ui/greenhouse-tab.js';
import { initFishpondTab } from './ui/fishpond-tab.js';
import { shareResults } from './share.js';
import { showSeasonEndModal, showPhaseUnlockModal, showEventModal, showToast } from './ui/modals.js';

// ─── State ────────────────────────────────────────────────────────────────

let state = loadState();
if (!state) {
  state = createState();
} else {
  applyOfflineProgress(state);
  const offlineMin = Math.floor((Date.now() - state.lastSaveTime) / 60000);
  if (offlineMin >= 1) {
    setTimeout(() => {
      showToast(`👋 Dobrodošao nazad! ${offlineMin} minuta offline — imanje je napredovalo.`);
    }, 500);
  }
}

// ─── Audio ────────────────────────────────────────────────────────────────

const audio = new AudioEngine();

// iOS: AudioContext needs user gesture
document.addEventListener('click', () => { audio.resume(); }, { once: true });
document.addEventListener('touchstart', () => { audio.resume(); }, { once: true });

// Mute button
const muteBtn = document.getElementById('mute-btn');
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    const isOn = audio.toggle();
    muteBtn.textContent = isOn ? '🔊' : '🔇';
    muteBtn.setAttribute('aria-label', isOn ? 'Mute' : 'Unmute');
  });
}

// ─── Game Ref (passed to all systems) ────────────────────────────────────

const gameRef = {
  state,
  audio,
  onSeasonEnd(data) {
    // Update ambient season
    audio.setSeasonAmbient(data.season % 4);
    // Show season summary
    showSeasonEndModal(data, () => {});
    // Show event modal if new event
    if (data.event && data.event.seasonsLeft > 0) {
      setTimeout(() => showEventModal(data.event, () => {}), 500);
    }
  },
  onPhaseUnlock(phase, label) {
    showPhaseUnlockModal(phase, label);
  },
  onAchievement(ach) {
    // Achievement toast already shown in achievements.js
    // Could add analytics here
  },
};

// ─── UI Init ─────────────────────────────────────────────────────────────

initTabs(state);
initMacroPanel(gameRef);
initMushroomTab(gameRef);
initGreenhouseTab(gameRef);
initFishpondTab(gameRef);

// Initial render
updateAllUI(state);

// ─── Mushroom tab rendering on first load ─────────────────────────────────
// Force initial render of mushroom tab content
import('./ui/mushroom-tab.js').then(({ updateMushroomTab }) => {
  updateMushroomTab(state);
});

// ─── Share button ────────────────────────────────────────────────────────

const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const result = await shareResults(state);
    if (result.success) {
      showToast(result.method === 'share'
        ? '✓ Podeljeno!'
        : '✓ Kopirano u clipboard!');
    }
  });
}

// ─── Macro panel toggle init ─────────────────────────────────────────────

const macroContent = document.getElementById('macro-content');
const macroToggle = document.getElementById('macro-toggle');
if (macroContent && macroToggle && state.ui && !state.ui.macroPanelOpen) {
  macroContent.classList.add('hidden');
  macroToggle.textContent = '▸';
}

// ─── Start game tick ─────────────────────────────────────────────────────

startTick(gameRef);

// ─── Periodic save ───────────────────────────────────────────────────────
// (tick.js handles auto-save every 10s, but also save on page unload)
window.addEventListener('beforeunload', () => {
  saveState(state);
});

// ─── Service worker for offline (optional, GitHub Pages) ─────────────────
// No service worker needed — game saves to localStorage, works offline

// ─── Debug helpers (dev only) ─────────────────────────────────────────────
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  window._gameState = state;
  window._gameRef = gameRef;
  window._addCapital = (n) => { state.capital += n; updateAllUI(state); };
  window._advanceSeason = () => {
    import('./systems/seasons.js').then(({ handleSeasonEnd }) => {
      handleSeasonEnd(state, audio, gameRef.onSeasonEnd);
    });
  };
  console.log('[Imanje Tycoon] Dev mode. _gameState, _addCapital(n), _advanceSeason() available.');
}
