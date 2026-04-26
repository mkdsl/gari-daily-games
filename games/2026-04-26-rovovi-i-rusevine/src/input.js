import { CONFIG } from './config.js';

const pointer = { x: 0, y: 0, cellX: -1, cellY: -1, pressed: false, released: false };
let _pressed = false;
let _released = false;
let _canvas = null;
let _cellSize = CONFIG.CELL_SIZE;
let _offsetX = 0;
let _offsetY = 0;

export function initInput(canvas) {
  _canvas = canvas;
  const onDown = e => {
    const pos = getCanvasPos(e);
    pointer.x = pos.x;
    pointer.y = pos.y;
    updateCell(pos);
    _pressed = true;
    pointer.pressed = false;
  };
  const onUp = e => {
    const pos = getCanvasPos(e);
    pointer.x = pos.x;
    pointer.y = pos.y;
    _released = true;
  };
  const onMove = e => {
    const pos = getCanvasPos(e);
    pointer.x = pos.x;
    pointer.y = pos.y;
    updateCell(pos);
  };
  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); onDown(e); }, { passive: false });
  canvas.addEventListener('touchend', e => { e.preventDefault(); onUp(e); });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); onMove(e); }, { passive: false });
}

function getCanvasPos(e) {
  const rect = _canvas.getBoundingClientRect();
  const t = e.touches?.[0] ?? e.changedTouches?.[0] ?? e;
  return {
    x: (t.clientX - rect.left),
    y: (t.clientY - rect.top)
  };
}

function updateCell(pos) {
  pointer.cellX = Math.floor((pos.x - _offsetX) / _cellSize);
  pointer.cellY = Math.floor((pos.y - _offsetY) / _cellSize);
}

export function setGridLayout(offsetX, offsetY, cellSize) {
  _offsetX = offsetX;
  _offsetY = offsetY;
  _cellSize = cellSize;
}

export function readInput() {
  const snap = {
    x: pointer.x, y: pointer.y,
    cellX: pointer.cellX, cellY: pointer.cellY,
    pressed: _pressed,
    released: _released
  };
  _pressed = false;
  _released = false;
  return snap;
}
