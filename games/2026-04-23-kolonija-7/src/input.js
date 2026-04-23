// src/input.js — Click/touch handler za grid ćelije (kopanje, sobe meni), keyboard shortcuts

const keys = new Set();
const pointer = { x: 0, y: 0, down: false, pressed: false, released: false };
let _pressedBuffer = false;
let _releasedBuffer = false;

/** @type {HTMLCanvasElement|null} */
let _canvas = null;

/**
 * @typedef {{
 *   keys: Set<string>,
 *   pointer: { x: number, y: number, down: boolean, pressed: boolean, released: boolean }
 * }} InputSnapshot
 */

/**
 * Inicijalizuje input listenere.
 * @param {HTMLCanvasElement} canvas
 */
export function initInput(canvas) {
  _canvas = canvas;

  window.addEventListener('keydown', e => {
    keys.add(e.key.toLowerCase());
    // Escape zatvara room meni, P pauzira
    if (e.key === 'Escape') keys.add('escape');
    if (e.key === 'p' || e.key === 'P') keys.add('p');
  });
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

  const setPointer = (e, down) => {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches?.[0] ?? e;
    pointer.x = (t.clientX - rect.left);
    pointer.y = (t.clientY - rect.top);
    if (down === true)  { pointer.down = true;  _pressedBuffer = true; }
    if (down === false) { pointer.down = false; _releasedBuffer = true; }
  };

  canvas.addEventListener('mousedown',  e => setPointer(e, true));
  canvas.addEventListener('mousemove',  e => setPointer(e));
  canvas.addEventListener('mouseup',    e => setPointer(e, false));
  canvas.addEventListener('touchstart', e => { e.preventDefault(); setPointer(e, true);  }, { passive: false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); setPointer(e);        }, { passive: false });
  canvas.addEventListener('touchend',   e => { setPointer(e, false); });
}

/**
 * Vraća snapshot input-a za tekući frame i resetuje press/release buffere.
 * @returns {InputSnapshot}
 */
export function readInput() {
  const snapshot = {
    keys: new Set(keys),
    pointer: { ...pointer, pressed: _pressedBuffer, released: _releasedBuffer }
  };
  _pressedBuffer = false;
  _releasedBuffer = false;
  return snapshot;
}

/**
 * Konvertuje canvas koordinate u grid kolonu i red.
 * @param {number} canvasX - pointer.x iz snapshot-a
 * @param {number} canvasY - pointer.y iz snapshot-a
 * @param {{ x: number, y: number }} camera - camera offset iz state
 * @param {number} cellSize - CONFIG.CELL_SIZE
 * @returns {{ col: number, row: number }}
 */
export function screenToGrid(canvasX, canvasY, camera, cellSize) {
  const col = Math.floor((canvasX + camera.x) / cellSize);
  const row = Math.floor((canvasY + camera.y) / cellSize);
  return { col, row };
}
