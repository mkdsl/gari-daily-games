// =============================================================================
// render.js — DOM renderer + scene mounting
// =============================================================================
import { clearChildren } from './util.js';

let mountPoint = null;
let currentScene = null;

export function setMount(node) {
  mountPoint = node;
}

export function getMount() {
  return mountPoint;
}

export function mountScene(sceneFn, state, onTransition) {
  if (!mountPoint) {
    console.error('[render] no mount point');
    return;
  }
  clearChildren(mountPoint);
  currentScene = sceneFn;
  sceneFn(mountPoint, state, onTransition);
}

export function rerender(state, onTransition) {
  if (currentScene) {
    mountScene(currentScene, state, onTransition);
  }
}
