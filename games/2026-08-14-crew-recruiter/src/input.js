// input.js — Pointer Events API (unified touch + mouse), keyboard shortcuts

/** @type {{ selectedCardId: string|null, dragCardId: string|null, spacePressed: boolean, escPressed: boolean }} */
const _inputState = {
  selectedCardId: null,
  dragCardId:     null,
  spacePressed:   false,
  escPressed:     false
};

/** External callbacks registered by UI */
/** @type {((cardId: string) => void)|null} */
let _onCardClick    = null;
/** @type {((cardId: string, slotRole: string) => void)|null} */
let _onCardDrop     = null;
/** @type {(() => void)|null} */
let _onConfirm      = null;
/** @type {(() => void)|null} */
let _onDiscard      = null;

/**
 * Register input callbacks. Called from main.js.
 * @param {{ onCardClick?: Function, onCardDrop?: Function, onConfirm?: Function, onDiscard?: Function }} cbs
 */
export function registerInputCallbacks(cbs) {
  if (cbs.onCardClick) _onCardClick = cbs.onCardClick;
  if (cbs.onCardDrop)  _onCardDrop  = cbs.onCardDrop;
  if (cbs.onConfirm)   _onConfirm   = cbs.onConfirm;
  if (cbs.onDiscard)   _onDiscard   = cbs.onDiscard;
}

/** Initialize Pointer Events on the game root. */
export function initInput() {
  const root = document.getElementById('app');
  if (!root) return;

  // ── Pointer events for drag ──────────────────────────────────────────────────
  root.addEventListener('pointerdown', _onPointerDown);
  root.addEventListener('pointermove', _onPointerMove);
  root.addEventListener('pointerup',   _onPointerUp);
  root.addEventListener('pointercancel', _onPointerCancel);

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  document.addEventListener('keydown', _onKeyDown);
}

// ── Drag state ────────────────────────────────────────────────────────────────

/** @type {HTMLElement|null} */
let _dragEl       = null;
/** @type {number} */
let _dragOffsetX  = 0;
let _dragOffsetY  = 0;

function _onPointerDown(e) {
  const cardEl = e.target.closest('[data-card-id]');
  if (!cardEl) return;

  const cardId = cardEl.dataset.cardId;
  _inputState.dragCardId = cardId;
  _dragEl = cardEl;

  const rect = cardEl.getBoundingClientRect();
  _dragOffsetX = e.clientX - rect.left;
  _dragOffsetY = e.clientY - rect.top;

  cardEl.setPointerCapture(e.pointerId);
  cardEl.classList.add('dragging');

  // Mark as selected for click-to-slot mode
  _selectCard(cardId);
}

function _onPointerMove(e) {
  if (!_dragEl || !_inputState.dragCardId) return;

  const x = e.clientX - _dragOffsetX;
  const y = e.clientY - _dragOffsetY;
  _dragEl.style.transform = `translate(${x}px, ${y}px)`;
  _dragEl.style.position  = 'fixed';
  _dragEl.style.left      = '0';
  _dragEl.style.top       = '0';
  _dragEl.style.zIndex    = '1000';

  // Highlight slot under cursor
  _highlightSlotUnder(e.clientX, e.clientY);
}

function _onPointerUp(e) {
  if (!_dragEl || !_inputState.dragCardId) return;

  // Find slot under release point
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const slotEl = el && el.closest('[data-slot-role]');

  if (slotEl) {
    const role = slotEl.dataset.slotRole;
    if (_onCardDrop) _onCardDrop(_inputState.dragCardId, role);
  } else if (e.target.closest('[data-card-id]') === _dragEl) {
    // Tap without drag — card click handled by _selectCard on pointerdown
    if (_onCardClick) _onCardClick(_inputState.dragCardId);
  }

  _resetDrag();
  _clearSlotHighlight();
}

function _onPointerCancel() {
  _resetDrag();
  _clearSlotHighlight();
}

function _resetDrag() {
  if (_dragEl) {
    _dragEl.classList.remove('dragging');
    _dragEl.style.transform = '';
    _dragEl.style.position  = '';
    _dragEl.style.left      = '';
    _dragEl.style.top       = '';
    _dragEl.style.zIndex    = '';
  }
  _dragEl = null;
  _inputState.dragCardId = null;
}

function _highlightSlotUnder(cx, cy) {
  document.querySelectorAll('[data-slot-role]').forEach(el => {
    const r = el.getBoundingClientRect();
    const over = cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    el.classList.toggle('drag-over', over);
  });
}

function _clearSlotHighlight() {
  document.querySelectorAll('[data-slot-role]').forEach(el => el.classList.remove('drag-over'));
}

/** Track which card is selected for click-to-slot. */
function _selectCard(cardId) {
  const prev = document.querySelector('.card-selected');
  if (prev) prev.classList.remove('card-selected');

  if (_inputState.selectedCardId === cardId) {
    _inputState.selectedCardId = null;
    return;
  }
  _inputState.selectedCardId = cardId;
  const el = document.querySelector(`[data-card-id="${cardId}"]`);
  if (el) el.classList.add('card-selected');
}

export function getSelectedCardId() {
  return _inputState.selectedCardId;
}

export function clearSelectedCard() {
  const prev = document.querySelector('.card-selected');
  if (prev) prev.classList.remove('card-selected');
  _inputState.selectedCardId = null;
}

// ── Keyboard ──────────────────────────────────────────────────────────────────

/** Index of the currently keyboard-focused slot (-1 = none) */
let _focusedSlotIdx = -1;

/**
 * Returns the ordered list of slot elements currently in the DOM.
 * @returns {HTMLElement[]}
 */
function _getSlotEls() {
  return Array.from(document.querySelectorAll('[data-slot-role]'));
}

function _onKeyDown(e) {
  // Arrow / Tab navigation cycles slot focus when a card is selected
  if (_inputState.selectedCardId) {
    const slots = _getSlotEls();
    if (slots.length > 0) {
      if (e.code === 'ArrowRight' || (e.code === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        _focusedSlotIdx = (_focusedSlotIdx + 1) % slots.length;
        _updateSlotFocus(slots);
        return;
      }
      if (e.code === 'ArrowLeft' || (e.code === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        _focusedSlotIdx = (_focusedSlotIdx - 1 + slots.length) % slots.length;
        _updateSlotFocus(slots);
        return;
      }
      if ((e.code === 'Enter') && _focusedSlotIdx >= 0 && slots[_focusedSlotIdx]) {
        e.preventDefault();
        const role = slots[_focusedSlotIdx].dataset.slotRole;
        handleSlotClick(role);
        _focusedSlotIdx = -1;
        _updateSlotFocus(slots);
        return;
      }
    }
  }

  if (e.code === 'Space' && !_inputState.selectedCardId) {
    e.preventDefault();
    if (_onConfirm) _onConfirm();
  } else if (e.code === 'Escape') {
    _focusedSlotIdx = -1;
    _updateSlotFocus(_getSlotEls());
    clearSelectedCard();
    if (_onDiscard) _onDiscard();
  }
}

function _updateSlotFocus(slots) {
  slots.forEach((el, idx) => {
    el.classList.toggle('keyboard-focus', idx === _focusedSlotIdx);
  });
}

/**
 * Register a handler for when the user clicks a slot (click-to-slot flow).
 * Called from ui/slots.js via event delegation.
 * @param {string} slotRole
 */
export function handleSlotClick(slotRole) {
  const cardId = _inputState.selectedCardId;
  if (cardId && _onCardDrop) {
    _onCardDrop(cardId, slotRole);
    clearSelectedCard();
  }
}
