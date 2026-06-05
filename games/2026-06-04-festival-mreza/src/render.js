/** @module render — Canvas render dispatcher */

import { renderMacroCanvas } from './rendering/macro_renderer.js';
import { renderMicroCanvas } from './rendering/micro_renderer.js';

/** @type {HTMLCanvasElement} */
let _macroCanvas = null;
/** @type {CanvasRenderingContext2D} */
let _macroCtx = null;
/** @type {HTMLCanvasElement} */
let _microCanvas = null;
/** @type {CanvasRenderingContext2D} */
let _microCtx = null;

/**
 * Initialize canvas elements
 */
export function initCanvases() {
  _macroCanvas = document.getElementById('macro-canvas');
  _microCanvas = document.getElementById('micro-canvas');

  if (_macroCanvas) {
    _macroCtx = _macroCanvas.getContext('2d');
    resizeCanvas(_macroCanvas, _macroCtx);
  }
  if (_microCanvas) {
    _microCtx = _microCanvas.getContext('2d');
    resizeCanvas(_microCanvas, _microCtx);
  }

  window.addEventListener('resize', () => {
    if (_macroCanvas) resizeCanvas(_macroCanvas, _macroCtx);
    if (_microCanvas) resizeCanvas(_microCanvas, _microCtx);
  });
}

/**
 * Resize canvas to its display size
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 */
function resizeCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}

/**
 * Get display dimensions of canvas
 * @param {HTMLCanvasElement} canvas
 * @returns {{w:number, h:number}}
 */
function getDisplaySize(canvas) {
  const dpr = window.devicePixelRatio || 1;
  return { w: canvas.width / dpr, h: canvas.height / dpr };
}

/**
 * Main render dispatch
 * @param {string} layer 'macro'|'micro'|'meta'
 * @param {object} macro
 * @param {object} micro
 * @param {object} meta
 * @param {number} now timestamp
 */
export function render(layer, macro, micro, meta, now) {
  if (layer === 'macro' && _macroCtx && _macroCanvas) {
    const { w, h } = getDisplaySize(_macroCanvas);
    renderMacroCanvas(_macroCtx, macro, meta, w, h, now);
  }

  if (layer === 'micro' && _microCtx && _microCanvas) {
    const { w, h } = getDisplaySize(_microCanvas);
    renderMicroCanvas(_microCtx, micro, w, h, now);
  }

  if (layer === 'meta') {
    // Meta screen is purely DOM — no canvas render needed
  }
}

/**
 * Clear all canvases
 */
export function clearCanvases() {
  if (_macroCtx && _macroCanvas) {
    _macroCtx.clearRect(0, 0, _macroCanvas.width, _macroCanvas.height);
  }
  if (_microCtx && _microCanvas) {
    _microCtx.clearRect(0, 0, _microCanvas.width, _microCanvas.height);
  }
}
