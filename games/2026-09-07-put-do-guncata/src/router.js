/**
 * @module router — stage router, etapa progression
 * Stage sequence: 0=menu, 1-5=etape, looping back to 0 on end
 */
import { state, saveState } from './state.js';
import { attachTo, clearAll } from './input.js';

/** @type {Map<number, {mount: Function, unmount: Function}>} */
const sceneRegistry = new Map();

/** @type {Function|null} */
let _onGameEndCb = null;

/** @type {Function|null} */
let _currentCleanup = null;

/** @type {HTMLElement|null} */
let _container = null;

/**
 * @param {HTMLElement} container
 */
export function init(container) {
  _container = container;
}

/**
 * @param {number} stageNum
 * @param {{mount: Function, unmount: Function}} scene
 */
export function registerScene(stageNum, scene) {
  sceneRegistry.set(stageNum, scene);
}

/**
 * Navigate to a stage by number.
 * @param {number} n
 */
export function goToStage(n) {
  if (!_container) return;

  // Cleanup previous scene
  if (_currentCleanup) {
    try { _currentCleanup(); } catch (_) {}
    _currentCleanup = null;
  }
  const prev = sceneRegistry.get(state.currentStage);
  if (prev?.unmount) {
    try { prev.unmount(_container); } catch (_) {}
  }

  clearAll();
  _container.innerHTML = '';
  attachTo(_container);

  state.currentStage = n;
  saveState();

  const scene = sceneRegistry.get(n);
  if (!scene) {
    console.warn(`[router] No scene for stage ${n}`);
    return;
  }

  _currentCleanup = scene.mount(_container, state, {
    next: nextStage,
    onEnd: () => _onGameEndCb?.()
  }) || null;
}

/** Advance to next stage */
export function nextStage() {
  const cur = state.currentStage;
  if (cur >= 5) {
    _onGameEndCb?.();
    return;
  }
  goToStage(cur + 1);
}

/**
 * @param {Function} cb — called when etapa5 ends
 */
export function onGameEnd(cb) {
  _onGameEndCb = cb;
}
