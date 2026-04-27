/**
 * @file input.js
 * @description Keyboard (A/S/D + Space) i touch (3 horizontalne zone) input handler.
 *              Emituje lane hit events ka scoring sistemu.
 *
 * Lane mapiranje:
 *   0 = levo  → tipka A     | touch leva trećina
 *   1 = centar→ tipka S ili Space | touch centralna trećina
 *   2 = desno → tipka D     | touch desna trećina
 *
 * Koristi: main.js poziva initInput(canvas, onHit) pri startu.
 *          onHit(lane: number) callback wire-uje ka scoring.processHit.
 */

import { CONFIG } from './config.js';

/** @type {((lane: number) => void)|null} */
let _onHit = null;

/** @type {HTMLCanvasElement|null} */
let _canvas = null;

/**
 * Inicijalizuje input handlere.
 * @param {HTMLCanvasElement} canvas
 * @param {(lane: number) => void} onHit - callback pri svakom tapnutom lane-u
 */
export function initInput(canvas, onHit) {
  _canvas = canvas;
  _onHit = onHit;
  _attachKeyboard();
  _attachTouch();
}

/**
 * Uklanja sve event listenere (koristi pri restart-u).
 */
export function destroyInput() {
  // TODO: implementirati cleanup sa AbortController signalom
}

// ─── Private ─────────────────────────────────────────────────────────────────

/**
 * Mapira KeyboardEvent.key na lane index.
 * @param {string} key - lowercase key string
 * @returns {number|null} lane 0–2 ili null ako nije relevantan
 */
function _keyToLane(key) {
  const map = { a: 0, s: 1, d: 2, ' ': 1 };
  return map[key] ?? null;
}

function _attachKeyboard() {
  window.addEventListener('keydown', e => {
    const lane = _keyToLane(e.key.toLowerCase());
    if (lane !== null) {
      e.preventDefault();
      _fireHit(lane);
    }
  });
}

function _attachTouch() {
  if (!_canvas) return;

  _canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const lane = _touchToLane(touch);
      _fireHit(lane);
    }
  }, { passive: false });
}

/**
 * Pretvara touch koordinatu u lane index na osnovu trećina canvas-a.
 * @param {Touch} touch
 * @returns {number} 0 | 1 | 2
 */
function _touchToLane(touch) {
  if (!_canvas) return 1;
  const rect = _canvas.getBoundingClientRect();
  const relX = touch.clientX - rect.left;
  const third = rect.width / CONFIG.LANE_COUNT;
  const lane = Math.floor(relX / third);
  return Math.max(0, Math.min(CONFIG.LANE_COUNT - 1, lane));
}

/**
 * Poziva onHit callback ako je registrovan.
 * @param {number} lane
 */
function _fireHit(lane) {
  if (_onHit) _onHit(lane);
}
