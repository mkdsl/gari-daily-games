// =============================================================================
// main.js — Game bootstrap + scene manager
// =============================================================================
import { createNewState, loadState, saveState } from './state.js';
import { setMount, mountScene } from './render.js';
import { renderSplash } from './scenes/splash.js';
import { renderOriginCreator } from './scenes/origin-creator.js';
import { renderMacroPlanner } from './scenes/macro-planner.js';
import { renderMicroNight } from './scenes/micro-night.js';
import { renderWeekRecap } from './scenes/week-recap.js';
import { renderFinale } from './scenes/finale.js';
import { initAudioEngine } from './audio.js';
import { VERSION } from './config.js';

let state = null;

const SCENES = {
  splash: renderSplash,
  origin: renderOriginCreator,
  macro:  renderMacroPlanner,
  micro:  renderMicroNight,
  recap:  renderWeekRecap,
  finale: renderFinale
};

function transition(target, payload = {}) {
  if (target === 'continue') {
    // load existing save
    const loaded = loadState();
    if (loaded) {
      state = loaded;
      const lastScene = state.scene || 'macro';
      // If lastScene is origin etc, go to macro after origin completion
      mountScene(SCENES.macro, state, transition);
      state.scene = 'macro';
      saveState(state);
      return;
    }
    target = 'new';
  }

  if (target === 'new') {
    state = createNewState();
    state.scene = 'origin';
    saveState(state);
    mountScene(SCENES.origin, state, transition);
    return;
  }

  if (!SCENES[target]) {
    console.error('[main] unknown scene', target);
    return;
  }

  state.scene = target;
  saveState(state);
  mountScene(SCENES[target], state, transition);
}

function boot() {
  const mount = document.getElementById('app');
  if (!mount) {
    console.error('[main] #app not found');
    return;
  }
  setMount(mount);
  initAudioEngine();

  console.log(`[DJ za Pultom v${VERSION}] boot`);

  // Initial: try load, else splash
  const loaded = loadState();
  if (loaded) {
    state = loaded;
  } else {
    state = createNewState();
  }

  mountScene(SCENES.splash, state, transition);
}

// Boot when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Expose za debug
window.__dj = {
  getState: () => state,
  resetState: () => {
    state = createNewState();
    saveState(state);
    console.log('state reset');
  }
};
