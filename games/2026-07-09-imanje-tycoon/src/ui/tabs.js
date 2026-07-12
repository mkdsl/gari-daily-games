import { updateHUD, updateHUDAchievementBadge } from './hud.js';
import { updateMacroPanelUI } from './macro-panel.js';
import { updateMushroomTab } from './mushroom-tab.js';
import { updateGreenhouseTab } from './greenhouse-tab.js';
import { updateFishpondTab } from './fishpond-tab.js';

// ─── Module state ─────────────────────────────────────────────────────────────

let _state = null;
let _gameRef = null;
const TAB_IDS = ['mushrooms', 'greenhouse', 'fishpond'];

// ─── Init ──────────────────────────────────────────────────────────────────────

/**
 * Initialize tab navigation and event handlers.
 * @param {object} state
 * @param {object} [gameRef]
 */
export function initTabs(state, gameRef) {
  _state = state;
  _gameRef = gameRef || null;

  // Bind tab buttons
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId) switchTab(tabId, state);
    });
  });

  // Macro panel toggle
  const toggle = document.getElementById('macro-toggle');
  const content = document.getElementById('macro-content');
  if (toggle && content) {
    toggle.addEventListener('click', () => {
      const isNowHidden = content.classList.toggle('hidden');
      toggle.textContent = isNowHidden ? '▸' : '▾';
      toggle.setAttribute('aria-expanded', isNowHidden ? 'false' : 'true');
      if (_state) {
        _state.ui = _state.ui || {};
        _state.ui.macroPanelOpen = !isNowHidden;
      }
    });
    // Restore macro panel open state
    if (state.ui?.macroPanelOpen === false) {
      content.classList.add('hidden');
      toggle.textContent = '▸';
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Set initial active tab
  const initialTab = state.ui?.activeTab || 'mushrooms';
  switchTab(initialTab, state, true); // silent=true skips re-render on first run

  // Update tab lock states
  updateTabLockStates(state);
}

// ─── Switch tab ───────────────────────────────────────────────────────────────

/**
 * Switch active tab.
 * @param {string} tabId
 * @param {object} [state]
 * @param {boolean} [silent] - if true, skip immediate content update
 */
export function switchTab(tabId, state, silent = false) {
  const effectiveState = state || _state;
  if (!TAB_IDS.includes(tabId)) return;

  if (effectiveState) {
    effectiveState.ui = effectiveState.ui || {};
    effectiveState.ui.activeTab = tabId;
  }

  // Update button states
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.getAttribute('data-tab') === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update panel visibility
  document.querySelectorAll('.tab-panel').forEach(panel => {
    const isActive = panel.id === `tab-${tabId}`;
    panel.classList.toggle('active', isActive);
    panel.classList.toggle('hidden', !isActive);
    panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });

  // Update tab lock indicators
  if (effectiveState) updateTabLockStates(effectiveState);
}

// ─── Tab lock states ──────────────────────────────────────────────────────────

/**
 * Update tab button visual state based on unlock status.
 * @param {object} state
 */
export function updateTabLockStates(state) {
  const ghBtn = document.querySelector('.tab-btn[data-tab="greenhouse"]');
  const fpBtn = document.querySelector('.tab-btn[data-tab="fishpond"]');

  if (ghBtn) {
    const unlocked = state.greenhouse.unlocked;
    ghBtn.classList.toggle('tab-locked', !unlocked);
    ghBtn.title = unlocked ? 'Plastenik — uzgoj povrća i mikrobiljki' : `Plastenik zaključan (otključaj za 15.000 din)`;
  }

  if (fpBtn) {
    const unlocked = state.fishpond.unlocked;
    fpBtn.classList.toggle('tab-locked', !unlocked);
    fpBtn.title = unlocked ? 'Jezero — akvakultura i patke' : `Jezero zaključano (otključaj za 40.000 din)`;
  }
}

// ─── Master UI update ─────────────────────────────────────────────────────────

/**
 * Master UI update — called every tick.
 * Updates HUD always; only updates visible tab content.
 * @param {object} state
 */
export function updateAllUI(state) {
  _state = state;
  updateHUD(state);
  updateMacroPanelUI(state);
  updateHUDAchievementBadge(state);

  // Update only visible tab
  const activeTab = state.ui?.activeTab || 'mushrooms';
  if (activeTab === 'mushrooms') updateMushroomTab(state);
  if (activeTab === 'greenhouse') updateGreenhouseTab(state);
  if (activeTab === 'fishpond') updateFishpondTab(state);

  // Update tab lock states
  updateTabLockStates(state);
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

// Register shortcuts at module load time
document.addEventListener('keydown', (e) => {
  if (!_state) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.altKey || e.ctrlKey || e.metaKey) return;

  switch (e.key) {
    case '1': switchTab('mushrooms', _state); break;
    case '2': switchTab('greenhouse', _state); break;
    case '3': switchTab('fishpond', _state); break;
    case 'M':
    case 'm': {
      // Toggle macro panel
      const content = document.getElementById('macro-content');
      const toggle = document.getElementById('macro-toggle');
      if (content && toggle) {
        const isHidden = content.classList.toggle('hidden');
        toggle.textContent = isHidden ? '▸' : '▾';
        if (_state) _state.ui = { ...(_state.ui || {}), macroPanelOpen: !isHidden };
      }
      break;
    }
    default: break;
  }
});

// ─── Swipe support ────────────────────────────────────────────────────────────

let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!_state) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 50) return; // Threshold

  const currentIdx = TAB_IDS.indexOf(_state.ui?.activeTab || 'mushrooms');
  if (dx < 0 && currentIdx < TAB_IDS.length - 1) {
    // Swipe left → next tab
    switchTab(TAB_IDS[currentIdx + 1], _state);
  } else if (dx > 0 && currentIdx > 0) {
    // Swipe right → previous tab
    switchTab(TAB_IDS[currentIdx - 1], _state);
  }
}, { passive: true });

// ─── Notification dot helpers ─────────────────────────────────────────────────

/**
 * Show a notification dot on a tab button.
 * @param {string} tabId
 * @param {string} [msg] - optional tooltip
 */
export function showTabNotification(tabId, msg = '') {
  const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (!btn) return;
  let dot = btn.querySelector('.tab-notif-dot');
  if (!dot) {
    dot = document.createElement('span');
    dot.className = 'tab-notif-dot';
    btn.appendChild(dot);
  }
  if (msg) dot.title = msg;
}

/**
 * Clear notification dot on a tab button.
 * @param {string} tabId
 */
export function clearTabNotification(tabId) {
  const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (!btn) return;
  const dot = btn.querySelector('.tab-notif-dot');
  if (dot) dot.remove();
}
