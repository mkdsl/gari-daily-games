/**
 * SceneManager.js — Scene lifecycle, loading, and transition management
 * Orchestrates scene modules and handles fade transitions
 * @module SceneManager
 */

import EventBus, { EVENTS } from './EventBus.js';
import GameState from '../utils/GameState.js';
import HotspotEngine from './HotspotEngine.js';
import DialogEngine from './DialogEngine.js';
import { applyScene3Complication, isTimeDepleted, computeEnding } from './ResourceManager.js';
import AchievementSystem from './AchievementSystem.js';
import Analytics from '../utils/Analytics.js';
import { autoSave } from '../utils/SaveSystem.js';

/** @type {object} Loaded scene data */
let scenesData = {};

/** @type {object} Scene module instances */
const sceneModules = {};

/** @type {string|null} Current scene id */
let currentSceneId = null;

/** @type {HTMLElement|null} Game container */
let gameContainer = null;

/** @type {boolean} Transition in progress */
let transitioning = false;

/** @type {object|null} Active scene module */
let activeSceneModule = null;

/**
 * Initialize with scenes.json data and DOM container
 * @param {object} data - scenes.json
 * @param {HTMLElement} container
 */
export function init(data, container) {
  scenesData = data;
  gameContainer = container;

  // Listen for hotspot click to trigger dialog
  EventBus.on(EVENTS.HOTSPOT_CLICK, ({ hotspot }) => {
    if (hotspot.action === 'dialog' && hotspot.dialog) {
      startSceneDialog(hotspot.dialog);
    }
  });

  // Listen for scene changes from GameState
  GameState.on('scene_changed', ({ to }) => {
    loadScene(to);
  });
}

/**
 * Register a scene module
 * @param {string} sceneId
 * @param {object} module - { render, setup, teardown }
 */
export function registerScene(sceneId, module) {
  sceneModules[sceneId] = module;
}

/**
 * Get scene definition
 * @param {string} sceneId
 * @returns {object|null}
 */
export function getSceneDef(sceneId) {
  return scenesData.scenes?.find(s => s.id === sceneId) ?? null;
}

/**
 * Load and display a scene with fade transition
 * @param {string} sceneId
 */
export async function loadScene(sceneId) {
  if (transitioning) return;
  if (sceneId === currentSceneId) return;

  const sceneDef = getSceneDef(sceneId);
  if (!sceneDef) {
    console.error(`[SceneManager] Scene not found: ${sceneId}`);
    return;
  }

  transitioning = true;

  // Teardown previous scene
  if (activeSceneModule?.teardown) {
    activeSceneModule.teardown();
  }

  EventBus.emit(EVENTS.SCENE_TRANSITION_START, { from: currentSceneId, to: sceneId });
  Analytics.logSceneTransition(currentSceneId, sceneId);

  // Fade out
  await fadeOut();

  // Update state
  currentSceneId = sceneId;

  // Apply scene 3 complication on scene 5
  if (sceneId === 'kapija') {
    applyScene3Complication();
  }

  // Build scene DOM
  renderSceneBackground(sceneDef);

  // Load hotspots
  HotspotEngine.loadHotspots(sceneId, sceneDef.hotspots ?? []);

  // Setup scene module
  activeSceneModule = sceneModules[sceneId] ?? null;
  if (activeSceneModule?.setup) {
    activeSceneModule.setup(sceneDef);
  }

  // Emit audio change
  EventBus.emit(EVENTS.AUDIO_AMBIENT_CHANGE, { track: sceneDef.ambientTrack });

  EventBus.emit(EVENTS.SCENE_LOAD, { sceneId, sceneDef });

  // Fade in
  await fadeIn();

  transitioning = false;

  EventBus.emit(EVENTS.SCENE_READY, { sceneId, sceneDef });

  autoSave();

  // Auto-start scene dialog
  if (sceneDef.startDialog) {
    setTimeout(() => {
      startSceneDialog(sceneDef.startDialog);
    }, 400);
  }
}

/**
 * Start a dialog in the current scene
 * @param {string} nodeId
 */
export function startSceneDialog(nodeId) {
  EventBus.emit(EVENTS.DIALOG_START, { nodeId, sceneId: currentSceneId });
  DialogEngine.startDialog(nodeId, handleDialogComplete);
}

/**
 * Called when a dialog tree completes
 * @param {string|null} action
 * @param {any} data
 */
function handleDialogComplete(action, data) {
  if (action === 'next_scene') {
    proceedToNextScene();
  } else if (action === 'ending') {
    triggerEnding();
  }
}

/**
 * Move to next scene in sequence
 */
function proceedToNextScene() {
  const sceneOrder = ['bulevar', 'kiosk', 'kafana', 'tvrdjava', 'kapija'];
  const idx = sceneOrder.indexOf(currentSceneId);

  if (isTimeDepleted()) {
    triggerEnding();
    return;
  }

  if (idx >= 0 && idx < sceneOrder.length - 1) {
    const nextId = sceneOrder[idx + 1];
    GameState.goToScene(nextId);
  } else if (idx === sceneOrder.length - 1) {
    triggerEnding();
  }
}

/**
 * Trigger game ending
 */
function triggerEnding() {
  const endingResult = computeEnding();
  GameState.setEnding(endingResult.endingId);
  Analytics.logEnding(endingResult.endingId, endingResult.score);

  // Check ending achievements
  if (endingResult.endingId === 'hard_fail') {
    AchievementSystem.checkTrigger('ending_hard_fail');
  }
  if (endingResult.endingId === 'secret_s2') {
    AchievementSystem.checkTrigger('ending_s2');
  }

  autoSave();

  EventBus.emit(EVENTS.GAME_ENDING, {
    endingId: endingResult.endingId,
    score: endingResult.score,
    endingData: endingResult.endingData
  });
}

/**
 * Render scene background into game container
 * @param {object} sceneDef
 */
function renderSceneBackground(sceneDef) {
  if (!gameContainer) return;

  // Clear previous scene content (keep UI overlay)
  const prev = gameContainer.querySelector('.scene-bg');
  if (prev) prev.remove();

  const bg = document.createElement('div');
  bg.className = `scene-bg ${sceneDef.background}`;
  bg.setAttribute('aria-label', sceneDef.name);
  // NPC element is created by each scene module (SceneBulevar, etc.) — not duplicated here

  gameContainer.insertBefore(bg, gameContainer.firstChild);
}

/**
 * Fade out animation
 * @returns {Promise}
 */
function fadeOut() {
  return new Promise(resolve => {
    const overlay = getFadeOverlay();
    overlay.style.opacity = '0';
    overlay.style.display = 'block';
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 0.35s ease';
      overlay.style.opacity = '1';
      setTimeout(resolve, 380);
    });
  });
}

/**
 * Fade in animation
 * @returns {Promise}
 */
function fadeIn() {
  return new Promise(resolve => {
    const overlay = getFadeOverlay();
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 0.35s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        resolve();
      }, 380);
    });
  });
}

function getFadeOverlay() {
  let overlay = document.getElementById('scene-fade-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'scene-fade-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0d0020;
      pointer-events: none;
      z-index: 9000;
      display: none;
      opacity: 0;
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

/**
 * Get current scene id
 * @returns {string|null}
 */
export function getCurrentSceneId() {
  return currentSceneId;
}

export default { init, registerScene, loadScene, getSceneDef, startSceneDialog, getCurrentSceneId };
