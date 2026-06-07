/**
 * input.js — Click/touch/keyboard handlers
 * Forwarduje canvas klick kroz event bus
 */

import { bus, EVT } from './events.js';

const _keys = new Set();
const _pointer = { x: 0, y: 0, down: false };

export function initInput(canvas) {
  // Keyboard
  window.addEventListener('keydown', e => {
    _keys.add(e.key.toLowerCase());
    if (e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
    }
    if (e.key === ' ') bus.emit(EVT.SESSION_PAUSE);
    if (e.key === 'Escape') bus.emit(EVT.MODAL_CLOSE);
  });

  window.addEventListener('keyup', e => {
    _keys.delete(e.key.toLowerCase());
  });

  // Mouse/Touch on canvas
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches?.[0] ?? e;
    return {
      x: (t.clientX - rect.left) * (canvas.width / rect.width),
      y: (t.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener('click', e => {
    const pos = getCanvasPos(e);
    bus.emit(EVT.CANVAS_CLICK, pos);
  });

  canvas.addEventListener('mousedown', e => {
    Object.assign(_pointer, getCanvasPos(e), { down: true });
    bus.emit(EVT.AUDIO_PLAY, { sound: 'ui_click' });
  });

  canvas.addEventListener('mousemove', e => {
    Object.assign(_pointer, getCanvasPos(e));
  });

  canvas.addEventListener('mouseup', e => {
    _pointer.down = false;
  });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    Object.assign(_pointer, getCanvasPos(e), { down: true });
    bus.emit(EVT.CANVAS_CLICK, getCanvasPos(e));
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    Object.assign(_pointer, getCanvasPos(e));
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    _pointer.down = false;
  });
}

export function isKeyDown(key) {
  return _keys.has(key.toLowerCase());
}

export function getPointer() {
  return { ..._pointer };
}
