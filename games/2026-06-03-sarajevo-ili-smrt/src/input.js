// ============================================================
//  input.js — Sarajevo ili Smrt
//  Touch drag + mouse drag za slider, keyboard fallback,
//  DOM button click bus.
// ============================================================

/** @type {Set<string>} */
const keys = new Set();

/** @type {{ x: number, y: number, down: boolean }} */
const pointer = { x: 0, y: 0, down: false };

let _pressedBuffer = false;
let _releasedBuffer = false;

// DOM button clicks (macro UI) go through this bus so main.js can
// read them as events without coupling DOM to game loop.
/** @type {{ action: string, payload: any }[]} */
const _actionQueue = [];

/** Register a DOM action from outside the canvas (button clicks etc.) */
export function pushAction(action, payload = null) {
  _actionQueue.push({ action, payload });
}

/**
 * Initialise all input listeners.
 * @param {HTMLCanvasElement} canvas
 */
export function initInput(canvas) {
  // Keyboard
  window.addEventListener('keydown', e => {
    keys.add(e.key.toLowerCase());
    // Keyboard slider: arrow keys
    if (e.key === 'ArrowLeft')  pushAction('slider_nudge', -5);
    if (e.key === 'ArrowRight') pushAction('slider_nudge', +5);
    if (e.key === ' ')          { e.preventDefault(); pushAction('slider_center'); }
  });
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

  // Pointer helpers
  const canvasCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches?.[0] ?? e;
    return {
      x: (t.clientX - rect.left),
      y: (t.clientY - rect.top)
    };
  };

  canvas.addEventListener('mousedown', e => {
    const c = canvasCoords(e);
    pointer.x = c.x; pointer.y = c.y;
    pointer.down = true;
    _pressedBuffer = true;
  });
  canvas.addEventListener('mousemove', e => {
    const c = canvasCoords(e);
    pointer.x = c.x; pointer.y = c.y;
  });
  canvas.addEventListener('mouseup', e => {
    const c = canvasCoords(e);
    pointer.x = c.x; pointer.y = c.y;
    pointer.down = false;
    _releasedBuffer = true;
  });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const c = canvasCoords(e);
    pointer.x = c.x; pointer.y = c.y;
    pointer.down = true;
    _pressedBuffer = true;
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const c = canvasCoords(e);
    pointer.x = c.x; pointer.y = c.y;
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    pointer.down = false;
    _releasedBuffer = true;
  });
}

/**
 * Read & clear the current input snapshot. Called once per frame.
 * @returns {{ keys: Set<string>, pointer: object, actions: Array }}
 */
export function readInput() {
  const snapshot = {
    keys: new Set(keys),
    pointer: {
      x: pointer.x,
      y: pointer.y,
      down: pointer.down,
      pressed: _pressedBuffer,
      released: _releasedBuffer
    },
    actions: _actionQueue.splice(0) // drain queue
  };
  _pressedBuffer = false;
  _releasedBuffer = false;
  return snapshot;
}

/** @returns {boolean} */
export function isKeyDown(key) {
  return keys.has(key.toLowerCase());
}
