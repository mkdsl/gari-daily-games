import { CONFIG } from './config.js';

/**
 * @typedef {{ x: number, y: number }} Point
 */

let registeredHandlers = null;
let canvas = null;

export function initInput(canvasEl, handlers) {
  canvas = canvasEl;
  registeredHandlers = handlers;

  // Mouse events
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // Touch events
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });

  // Keyboard
  window.addEventListener('keydown', onKeyDown);
}

export function destroyInput() {
  if (!canvas) return;
  canvas.removeEventListener('mousemove', onMouseMove);
  canvas.removeEventListener('mousedown', onMouseDown);
  canvas.removeEventListener('mouseup', onMouseUp);
  canvas.removeEventListener('click', onClick);
  canvas.removeEventListener('mouseleave', onMouseLeave);
  canvas.removeEventListener('touchstart', onTouchStart);
  canvas.removeEventListener('touchend', onTouchEnd);
  canvas.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('keydown', onKeyDown);
}

/**
 * Convert mouse/touch event position to canvas logical coordinates
 * (accounts for CSS scaling)
 * @param {MouseEvent|Touch} e
 * @param {HTMLCanvasElement} canvasEl
 * @returns {Point}
 */
export function getPointerPos(e, canvasEl) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = (canvasEl.width) / rect.width;
  const scaleY = (canvasEl.height) / rect.height;

  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function onMouseMove(e) {
  if (!registeredHandlers?.onMove) return;
  const pos = getPointerPos(e, canvas);
  registeredHandlers.onMove(pos);
}

function onMouseDown(e) {
  if (!registeredHandlers?.onDown) return;
  const pos = getPointerPos(e, canvas);
  registeredHandlers.onDown(pos, e.button);
}

function onMouseUp(e) {
  if (!registeredHandlers?.onUp) return;
  const pos = getPointerPos(e, canvas);
  registeredHandlers.onUp(pos, e.button);
}

function onClick(e) {
  if (!registeredHandlers?.onClick) return;
  const pos = getPointerPos(e, canvas);
  registeredHandlers.onClick(pos);
}

function onMouseLeave(e) {
  if (!registeredHandlers?.onLeave) return;
  registeredHandlers.onLeave();
}

function onTouchStart(e) {
  e.preventDefault();
  if (!registeredHandlers?.onDown) return;
  const touch = e.changedTouches[0];
  if (!touch) return;
  const pos = getPointerPos(touch, canvas);
  registeredHandlers.onDown(pos, 0);
}

function onTouchEnd(e) {
  e.preventDefault();
  if (!registeredHandlers?.onClick) return;
  const touch = e.changedTouches[0];
  if (!touch) return;
  const pos = getPointerPos(touch, canvas);
  registeredHandlers.onClick(pos);
  if (registeredHandlers.onUp) registeredHandlers.onUp(pos, 0);
}

function onTouchMove(e) {
  e.preventDefault();
  if (!registeredHandlers?.onMove) return;
  const touch = e.changedTouches[0];
  if (!touch) return;
  const pos = getPointerPos(touch, canvas);
  registeredHandlers.onMove(pos);
}

function onKeyDown(e) {
  if (!registeredHandlers?.onKey) return;
  registeredHandlers.onKey(e.key, e);
}
