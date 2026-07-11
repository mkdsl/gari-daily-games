import { updateHUD } from './hud.js';
import { updateMacroPanelUI } from './macro-panel.js';
import { updateMushroomTab } from './mushroom-tab.js';
import { updateGreenhouseTab } from './greenhouse-tab.js';
import { updateFishpondTab } from './fishpond-tab.js';

let _state = null;

/** Initialize tab navigation */
export function initTabs(state) {
  _state = state;
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId, state);
    });
  });

  // Keyboard shortcuts: 1=mushrooms, 2=greenhouse, 3=fishpond
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '1') switchTab('mushrooms', _state);
    if (e.key === '2') switchTab('greenhouse', _state);
    if (e.key === '3') switchTab('fishpond', _state);
  });

  // Init macro panel toggle
  const toggle = document.getElementById('macro-toggle');
  const content = document.getElementById('macro-content');
  if (toggle && content) {
    toggle.addEventListener('click', () => {
      const open = content.classList.toggle('hidden');
      toggle.textContent = open ? '▸' : '▾';
      if (_state) _state.ui.macroPanelOpen = !open;
    });
  }
}

/** Switch active tab */
export function switchTab(tabId, state) {
  if (state) {
    state.ui = state.ui || {};
    state.ui.activeTab = tabId;
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    btn.setAttribute('aria-selected', btn.getAttribute('data-tab') === tabId ? 'true' : 'false');
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    const isActive = panel.id === `tab-${tabId}`;
    panel.classList.toggle('active', isActive);
    panel.classList.toggle('hidden', !isActive);
  });
}

/**
 * Master UI update — called every tick.
 * Only updates visible parts to save DOM operations.
 */
export function updateAllUI(state) {
  _state = state;
  updateHUD(state);
  updateMacroPanelUI(state);

  const activeTab = state.ui?.activeTab || 'mushrooms';
  if (activeTab === 'mushrooms') updateMushroomTab(state);
  if (activeTab === 'greenhouse') updateGreenhouseTab(state);
  if (activeTab === 'fishpond') updateFishpondTab(state);
}
