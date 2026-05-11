// =============================================================================
// systems/pera-overlay.js — Pera Period bottom-center subtitle overlay
// =============================================================================
// V2 (Jova 2026-05-11): NIJE tutorial bubble. Fade-in subtitle posle key event-a.
//   - Position: bottom-center (fixed, z-index iznad scene-a)
//   - 3-5s vidljivost, fade-out
//   - Trigger iz any scene posle event-a (set_high, set_low, symptom shift, etc.)
// =============================================================================

let overlayEl = null;
let activeTimeout = null;

const DEFAULT_DURATION_MS = 4500;

export function showPeraOverlay(state, line, durationMs = DEFAULT_DURATION_MS) {
  if (!line) return;

  // Skip if disabled
  if (state?.settings?.pera_overlay_off) return;

  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.className = 'pera-overlay';
    overlayEl.innerHTML = '<span class="po-marker">Pera Period</span><span class="po-line"></span>';
    document.body.appendChild(overlayEl);
  }

  const lineEl = overlayEl.querySelector('.po-line');
  lineEl.textContent = line;

  // Reset animation
  overlayEl.classList.remove('po-show', 'po-fadeout');
  void overlayEl.offsetWidth;  // force reflow
  overlayEl.classList.add('po-show');

  if (activeTimeout) clearTimeout(activeTimeout);
  activeTimeout = setTimeout(() => {
    overlayEl.classList.add('po-fadeout');
    setTimeout(() => {
      overlayEl.classList.remove('po-show', 'po-fadeout');
    }, 800);
  }, durationMs);

  // Persist to state log
  if (state) {
    state.pera_log = state.pera_log || [];
    state.pera_log.push({ week: state.week, line, ts: Date.now() });
    if (state.pera_log.length > 50) state.pera_log.shift();
  }
}

export function hidePeraOverlay() {
  if (!overlayEl) return;
  overlayEl.classList.add('po-fadeout');
  if (activeTimeout) { clearTimeout(activeTimeout); activeTimeout = null; }
}

// Auto-trigger po context-u (helper za scenes)
import { selectAforizam } from '../data/aforizmi.js';
export function triggerOverlay(state, context, durationMs) {
  const line = selectAforizam(state, context);
  if (line) showPeraOverlay(state, line, durationMs);
}
