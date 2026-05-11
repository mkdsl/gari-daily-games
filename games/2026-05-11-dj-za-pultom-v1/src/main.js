// =============================================================================
// main.js — Game bootstrap + scene manager (v2)
// =============================================================================
import { createNewState, loadState, saveState } from './state.js';
import { setMount, mountScene } from './render.js';
import { renderSplashCinematic } from './scenes/splash-cinematic.js';
import { renderSplash } from './scenes/splash.js';
import { renderOriginCreator } from './scenes/origin-creator.js';
import { renderMacroPlanner } from './scenes/macro-planner.js';
import { renderMicroNight } from './scenes/micro-night.js';
import { renderWeekRecap } from './scenes/week-recap.js';
import { renderFinale } from './scenes/finale.js';
import { renderSettings } from './scenes/settings.js';
import { renderPersonaProfile } from './scenes/persona-profile.js';
import { initAudioEngine } from './audio.js';
import { VERSION } from './config.js';

let state = null;

const SCENES = {
  cinematic: renderSplashCinematic,
  splash:    renderSplash,
  origin:    renderOriginCreator,
  macro:     renderMacroPlanner,
  micro:     renderMicroNight,
  recap:     renderWeekRecap,
  finale:    renderFinale,
  settings:  renderSettings,
  persona:   renderPersonaProfile
};

function transition(target, payload = {}) {
  if (target === 'continue') {
    const loaded = loadState();
    if (loaded) {
      state = loaded;
      const lastScene = state.scene || 'macro';
      mountScene(SCENES.macro, state, transition);
      state.scene = 'macro';
      saveState(state);
      return;
    }
    target = 'new';
  }

  if (target === 'new') {
    state = createNewState();
    state.scene = state.settings?.first_run_done ? 'origin' : 'cinematic';
    saveState(state);
    mountScene(SCENES[state.scene], state, transition);
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
  // initAudioEngine() is deferred — biće pozvana iz cinematic scene posle user gesture-a
  // da bismo izbegli AudioContext suspension.

  console.log(`[DJ za Pultom v${VERSION}] boot`);

  const loaded = loadState();
  if (loaded) {
    state = loaded;
    // Migrate stari save → ubaci settings ako fali
    state.settings = state.settings || { numeric_mode: false, audio_enabled: true, first_run_done: true };
    state.substance = state.substance || {
      baseline: [], active_substances: [], diagnoses: [],
      zovi_covika_total: 0, zovi_covika_this_week: 0,
      compound_active: [],
      recovery_uses: { tisina: 0, integration: 0, reality: 0 }
    };
    state.pera_overlay = state.pera_overlay || { active: false, line: '', shown_at: 0 };
  } else {
    state = createNewState();
  }

  // Boot scena: cinematic ako first_run_done == false, inače splash
  const bootScene = state.settings?.first_run_done ? SCENES.splash : SCENES.cinematic;
  mountScene(bootScene, state, transition);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.__dj = {
  getState: () => state,
  resetState: () => {
    state = createNewState();
    saveState(state);
    console.log('state reset');
  },
  toggleNumericMode: () => {
    state.settings = state.settings || {};
    state.settings.numeric_mode = !state.settings.numeric_mode;
    saveState(state);
    console.log('numeric_mode:', state.settings.numeric_mode);
  }
};
