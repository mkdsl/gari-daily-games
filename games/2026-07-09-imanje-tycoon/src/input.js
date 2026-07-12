/**
 * input.js — Global input handlers (keyboard shortcuts + touch).
 * Self-initializes on module load. Call initInput(gameRef) to bind state.
 *
 * Keyboard:
 *   1 / 2 / 3   → switch tab (mushrooms / greenhouse / fishpond)
 *   m           → toggle macro panel
 *   Escape      → close open modals
 *   h           → show help overlay
 *   s           → quick save (export JSON to clipboard)
 *
 * Touch:
 *   #share-btn        → ensure audio resume + native share
 *   #masterclass-btn  → trigger masterclass on tap
 */

import { switchTab } from './ui/tabs.js';

let _gameRef = null;
let _helpVisible = false;

/**
 * Bind game state and audio to input handlers.
 * @param {{ state: object, audio: object }} gameRef
 */
export function initInput(gameRef) {
  _gameRef = gameRef;
}

// ─── Keyboard ────────────────────────────────────────────────────────────────

document.addEventListener('keydown', handleKeyDown);

function handleKeyDown(e) {
  // Skip if inside text inputs
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  // Skip if modifier keys held (browser shortcuts)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const state = _gameRef?.state;

  switch (e.key) {
    case '1':
      switchTab('mushrooms', state);
      break;
    case '2':
      switchTab('greenhouse', state);
      break;
    case '3':
      switchTab('fishpond', state);
      break;
    case 'm':
    case 'M':
      toggleMacroPanel(state);
      break;
    case 'Escape':
      closeTopModal();
      break;
    case 'h':
    case 'H':
      toggleHelpOverlay();
      break;
    case 's':
    case 'S':
      quickSave();
      break;
    default:
      break;
  }
}

// ─── Macro panel toggle ───────────────────────────────────────────────────────

function toggleMacroPanel(state) {
  const content = document.getElementById('macro-content');
  const toggle = document.getElementById('macro-toggle');
  if (!content || !toggle) return;

  const isHidden = content.classList.contains('hidden');
  content.classList.toggle('hidden', !isHidden);
  toggle.textContent = isHidden ? '▾' : '▸';

  if (state && state.ui) {
    state.ui.macroPanelOpen = isHidden;
  }
}

// ─── Modal close ─────────────────────────────────────────────────────────────

function closeTopModal() {
  const layer = document.getElementById('modals-layer');
  if (!layer) return;

  // Close the last (top-most) modal in the layer
  const modals = layer.querySelectorAll('.modal-backdrop');
  if (modals.length > 0) {
    const top = modals[modals.length - 1];
    // Trigger cancel/close button if present
    const cancelBtn = top.querySelector('#prestige-cancel, #proj-cancel, #event-close, #phase-close, #season-modal-close, #help-close');
    if (cancelBtn) {
      cancelBtn.click();
    } else {
      top.remove();
    }
  }
}

// ─── Help overlay ─────────────────────────────────────────────────────────────

function toggleHelpOverlay() {
  if (_helpVisible) {
    closeHelpOverlay();
  } else {
    showHelpOverlay();
  }
}

function showHelpOverlay() {
  const layer = document.getElementById('modals-layer');
  if (!layer) return;

  _helpVisible = true;
  const modal = document.createElement('div');
  modal.id = 'help-overlay';
  modal.className = 'modal-backdrop help-modal';
  modal.innerHTML = `
    <div class="modal-box help-box">
      <div class="modal-title">⌨️ Prečice</div>
      <table class="help-table">
        <tr><td><kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd></td><td>Prebaci na tab (Pečurke / Plastenik / Jezero)</td></tr>
        <tr><td><kbd>M</kbd></td><td>Otvori/zatvori Makro panel</td></tr>
        <tr><td><kbd>Esc</kbd></td><td>Zatvori otvoreni modal</td></tr>
        <tr><td><kbd>H</kbd></td><td>Ova pomoć</td></tr>
        <tr><td><kbd>S</kbd></td><td>Brzi export save u clipboard</td></tr>
      </table>
      <div class="help-tips">
        <strong>Saveti:</strong>
        <ul>
          <li>Inokulacija u prvih 10s talasa = +10% prinos</li>
          <li>Hrani ribu tokom feed window-a (15s) za +5% rast bonus</li>
          <li>Mikrobiljke: beri odmah kad progress = 100% za bonus</li>
          <li>Kanali prodaje moraju biti ukupno 100%</li>
          <li>Masterclass od S4: troši 2 akcije, vraća prihod + reputaciju</li>
        </ul>
      </div>
      <button class="modal-btn primary" id="help-close">Zatvori</button>
    </div>
  `;
  layer.appendChild(modal);

  const closeBtn = modal.querySelector('#help-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeHelpOverlay);
  }

  // Click backdrop to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeHelpOverlay();
  });
}

function closeHelpOverlay() {
  _helpVisible = false;
  const overlay = document.getElementById('help-overlay');
  if (overlay) overlay.remove();
}

// ─── Quick save ──────────────────────────────────────────────────────────────

async function quickSave() {
  const state = _gameRef?.state;
  if (!state) return;

  try {
    const json = JSON.stringify(state, null, 2);
    await navigator.clipboard.writeText(json);
    import('./ui/modals.js').then(({ showToast }) => {
      showToast('✓ Save kopiran u clipboard (Ctrl+V za paste)');
    });
  } catch {
    // Fallback: try using exportSave from state module
    import('./state.js').then(({ exportSave }) => {
      exportSave(state);
    });
  }
}

// ─── Touch handlers ───────────────────────────────────────────────────────────

// Resume audio context on first touch (iOS requirement)
document.addEventListener('touchstart', () => {
  _gameRef?.audio?.resume();
}, { once: true, passive: true });

// #share-btn touch → ensure audio resume (click handler already in main.js)
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('#share-btn')) {
    _gameRef?.audio?.resume();
  }
}, { passive: true });

// Haptic-like feedback on action buttons (mobile)
document.addEventListener('touchstart', (e) => {
  const btn = e.target.closest('.action-btn, .up-buy-btn');
  if (!btn) return;
  btn.classList.add('btn-pressed');
  setTimeout(() => btn.classList.remove('btn-pressed'), 180);
}, { passive: true });

// Swipe left/right on tab-content to switch tabs
(function initSwipeGesture() {
  let touchStartX = 0;
  let touchStartY = 0;

  const content = document.getElementById('tab-content');
  if (!content) {
    // If DOM not ready yet, wait
    window.addEventListener('DOMContentLoaded', initSwipeGesture);
    return;
  }

  content.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  content.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);

    // Only horizontal swipes with >40px movement and smaller vertical component
    if (Math.abs(dx) < 40 || dy > Math.abs(dx)) return;

    const state = _gameRef?.state;
    const activeTab = state?.ui?.activeTab || 'mushrooms';
    const TABS = ['mushrooms', 'greenhouse', 'fishpond'];
    const idx = TABS.indexOf(activeTab);

    if (dx < 0 && idx < TABS.length - 1) {
      // Swipe left → next tab
      switchTab(TABS[idx + 1], state);
    } else if (dx > 0 && idx > 0) {
      // Swipe right → prev tab
      switchTab(TABS[idx - 1], state);
    }
  }, { passive: true });
})();
