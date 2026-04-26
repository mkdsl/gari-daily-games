/**
 * input.js — Event handleri za Kartaški Front.
 *
 * Igra je turn-based i UI-driven (bez rAF input polling-a).
 * Handleri direktno pozivaju callback-e registrovane iz main.js.
 * SVE akcije prvo proveravaju state.phase pre nego što propagiraju.
 *
 * Registrovani eventi:
 *   - Klik na .card div     → onCardClick(card, cardDef)
 *   - Klik na #btn-end-turn → onEndTurn()
 *   - Klik na #overlay      → onOverlayClick(event) (reward izbor, restart dugmad)
 *
 * @typedef {import('./state.js').GameState} GameState
 */

/** @type {((card: HTMLElement, cardIndex: number) => void) | null} */
let _onCardClick = null;

/** @type {(() => void) | null} */
let _onEndTurn = null;

/** @type {((e: MouseEvent | TouchEvent) => void) | null} */
let _onOverlayClick = null;

/**
 * Inicijalizuje sve event listenere.
 * Pozovi jednom iz main.js.
 *
 * @param {{
 *   onCardClick: (card: HTMLElement, cardIndex: number) => void,
 *   onEndTurn: () => void,
 *   onOverlayClick: (e: Event) => void
 * }} callbacks
 */
export function initInput({ onCardClick, onEndTurn, onOverlayClick }) {
  _onCardClick    = onCardClick;
  _onEndTurn      = onEndTurn;
  _onOverlayClick = onOverlayClick;

  // ── Kraj runde dugme ────────────────────────────────────────────────────────
  const btnEnd = document.getElementById('btn-end-turn');
  if (btnEnd) {
    btnEnd.addEventListener('click', () => {
      if (_onEndTurn) _onEndTurn();
    });
  }

  // ── Overlay klikovi (reward, game over, victory, map) ──────────────────────
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (_onOverlayClick) _onOverlayClick(e);
    });
    overlay.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (_onOverlayClick) _onOverlayClick(e);
    }, { passive: false });
  }

  // ── Karte u ruci — event delegation na #hand-zone ──────────────────────────
  // (renderHand() kreira .card div-ove dinamički, koristimo delegation)
  const handZone = document.getElementById('hand-zone');
  if (handZone) {
    handZone.addEventListener('click', (e) => {
      const card = /** @type {HTMLElement} */ (e.target.closest('.card'));
      if (!card) return;
      const idx = parseInt(card.dataset.index ?? '-1', 10);
      if (idx < 0) return;
      if (_onCardClick) _onCardClick(card, idx);
    });

    handZone.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const card = /** @type {HTMLElement | null} */ (el?.closest?.('.card'));
      if (!card) return;
      const idx = parseInt(card.dataset.index ?? '-1', 10);
      if (idx < 0) return;
      if (_onCardClick) _onCardClick(card, idx);
    }, { passive: false });
  }
}

/**
 * Ažuriraj callback ako se state promeni (npr. re-init posle borbe).
 * @param {'onCardClick'|'onEndTurn'|'onOverlayClick'} name
 * @param {Function} fn
 */
export function updateCallback(name, fn) {
  if (name === 'onCardClick')    _onCardClick    = fn;
  if (name === 'onEndTurn')      _onEndTurn      = fn;
  if (name === 'onOverlayClick') _onOverlayClick = fn;
}
