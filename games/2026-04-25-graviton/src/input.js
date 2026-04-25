/**
 * input.js — Keyboard, mouse i touch input handlers za Graviton.
 *
 * Interfejs prema ostatku igre:
 *   - initInput(canvas) — inicijalizuje listenere, poziva se jednom pri startu
 *   - readInput()       — vraća snapshot inputa za ovaj frame, konzumira "pressed" stanja
 *
 * Flip trigger:
 *   - Space, ArrowUp, ArrowDown → flipPressed = true za jedan frame
 *   - Levi klik ili tap bilo gde na canvas-u → flipPressed = true za jedan frame
 *   - Drži se NE procesira — samo prvi "pressed" event po pritisku
 *
 * Koordinatni sistem pointera:
 *   - Normalizovan na logički canvas prostor (800×450)
 *   - Korekcija za CSS scale i devicePixelRatio
 */

/** @type {Set<string>} Skup trenutno držanih tastera (lowercase) */
const _heldKeys = new Set();

/** @type {boolean} Buffered flip signal — postaje true na keydown/mousedown/touchstart */
let _flipBuffer = false;

/** @type {boolean} Buffered anyKey signal — bilo koji keydown (za start screen) */
let _anyKeyBuffer = false;

/** @type {{ x: number, y: number, held: boolean }} Trenutno stanje pointera */
const _pointer = { x: 0, y: 0, held: false };

/** @type {HTMLCanvasElement|null} */
let _canvas = null;

/**
 * Inicijalizuje input listenere. Poziva se jednom u main.js.
 * @param {HTMLCanvasElement} canvas
 */
export function initInput(canvas) {
  // TODO: implementacija — dodaj event listenere:
  //   - keydown: dodaj e.key.toLowerCase() u _heldKeys; ako je 'space', ' ', 'arrowup', 'arrowdown' → _flipBuffer = true; uvek _anyKeyBuffer = true
  //   - keyup: ukloni iz _heldKeys
  //   - mousedown (canvas): _flipBuffer = true, _pointer.held = true, updatePointer(e, canvas)
  //   - mouseup: _pointer.held = false
  //   - mousemove: updatePointer(e, canvas)
  //   - touchstart (canvas, passive: false): preventDefault, _flipBuffer = true, _pointer.held = true, updatePointerTouch(e, canvas)
  //   - touchmove (canvas, passive: false): preventDefault, updatePointerTouch(e, canvas)
  //   - touchend: _pointer.held = false
  _canvas = canvas;
}

/**
 * Normalizuje koordinate pointera na logički canvas prostor (800×450).
 * @param {MouseEvent} e
 * @param {HTMLCanvasElement} canvas
 */
function _updatePointer(e, canvas) {
  // TODO: implementacija — koristi canvas.getBoundingClientRect() za offset
  const rect = canvas.getBoundingClientRect();
  _pointer.x = (e.clientX - rect.left) * (800 / rect.width);
  _pointer.y = (e.clientY - rect.top)  * (450 / rect.height);
}

/**
 * Normalizuje koordinate touch eventa na logički canvas prostor.
 * @param {TouchEvent} e
 * @param {HTMLCanvasElement} canvas
 */
function _updatePointerTouch(e, canvas) {
  // TODO: implementacija — uzmi e.touches[0] ili e.changedTouches[0]
  const touch = e.touches?.[0] ?? e.changedTouches?.[0];
  if (!touch) return;
  const rect = canvas.getBoundingClientRect();
  _pointer.x = (touch.clientX - rect.left) * (800 / rect.width);
  _pointer.y = (touch.clientY - rect.top)  * (450 / rect.height);
}

/**
 * Čita i konzumira input za ovaj frame.
 * Posle poziva, pressed/flipPressed/anyKey su reset na false.
 * @returns {{ flipPressed: boolean, anyKeyPressed: boolean, pointer: { x: number, y: number, held: boolean } }}
 */
export function readInput() {
  // TODO: implementacija — vrati snapshot, resetuj buffers
  const snapshot = {
    flipPressed:    _flipBuffer,
    anyKeyPressed:  _anyKeyBuffer,
    pointer: { ..._pointer },
  };
  _flipBuffer    = false;
  _anyKeyBuffer  = false;
  return snapshot;
}
