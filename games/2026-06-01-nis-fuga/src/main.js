/**
 * main.js — Niš Fuga entry point
 * Wires all modules, handles game init, menu, save/load, restart
 * @module main
 */

// Engine
import EventBus, { EVENTS } from './engine/EventBus.js';
import SceneManager from './engine/SceneManager.js';
import DialogEngine from './engine/DialogEngine.js';
import HotspotEngine from './engine/HotspotEngine.js';
import AchievementSystem from './engine/AchievementSystem.js';
import InputHandler from './engine/InputHandler.js';

// State & Utils
import GameState from './utils/GameState.js';
import { setFlag } from './utils/FlagManager.js';
import { load, hasSave, deleteSave } from './utils/SaveSystem.js';
import Analytics from './utils/Analytics.js';

// Audio
import AudioEngine from './audio/AudioEngine.js';
import AmbientPlayer from './audio/AmbientPlayer.js';
import SfxPlayer from './audio/SfxPlayer.js';

// UI
import ResourceBar from './ui/ResourceBar.js';
import DialogRenderer from './ui/DialogRenderer.js';
import ChoiceMenu from './ui/ChoiceMenu.js';
import EndingScreen from './ui/EndingScreen.js';
import ParticleSystem from './ui/ParticleSystem.js';
import FlavorDisplay from './ui/FlavorDisplay.js';
import UiComponents, { showToast, showFlavor, createMuteButton } from './art/UiComponents.js';

// Art
import BackgroundRenderer from './art/BackgroundRenderer.js';
import NpcRenderer from './art/NpcRenderer.js';

// Scenes
import SceneBulevar from './scenes/SceneBulevar.js';
import SceneKiosk from './scenes/SceneKiosk.js';
import SceneKafana from './scenes/SceneKafana.js';
import SceneTvrdjava from './scenes/SceneTvrdjava.js';
import SceneKapija from './scenes/SceneKapija.js';
import SceneEnding from './scenes/SceneEnding.js';

// Data (loaded async)
let scenesData = null;
let dialogsData = null;
let achievementsData = null;

/**
 * Initialize the game
 */
async function init() {
  showLoadingScreen();
  updateLoadingBar(10);

  // Inject CSS art styles
  BackgroundRenderer.injectStyles();
  NpcRenderer.injectStyles();
  NpcRenderer.injectPortraitStyles();
  UiComponents.init(document.body);
  ParticleSystem.init();
  updateLoadingBar(20);

  // Load JSON data
  try {
    [scenesData, dialogsData, achievementsData] = await Promise.all([
      fetch('./src/data/scenes.json').then(r => r.json()),
      fetch('./src/data/dialogs.json').then(r => r.json()),
      fetch('./src/data/achievements.json').then(r => r.json())
    ]);
  } catch (e) {
    console.error('[main] Failed to load data files:', e);
    showError('Greška pri učitavanju igre. Pokušajte ponovo.');
    return;
  }
  updateLoadingBar(50);

  // Initialize engines
  DialogEngine.init(dialogsData);
  AchievementSystem.init(achievementsData.achievements);
  updateLoadingBar(65);

  // Setup DOM
  const gameRoot = document.getElementById('game-root');
  const gameContainer = document.getElementById('game-container');

  // Build UI layers
  const hud = document.createElement('div');
  hud.id = 'game-hud';
  hud.style.cssText = 'position: relative; z-index: 100; flex-shrink: 0;';
  gameRoot.insertBefore(hud, gameContainer);

  ResourceBar.init(hud);

  // Scene name badge
  const sceneBadge = document.createElement('div');
  sceneBadge.className = 'scene-name-badge';
  sceneBadge.id = 'scene-name-badge';
  gameContainer.appendChild(sceneBadge);

  // Dialog layer
  const dialogLayer = document.createElement('div');
  dialogLayer.id = 'dialog-layer';
  dialogLayer.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 200;';
  gameContainer.appendChild(dialogLayer);

  DialogRenderer.init(dialogLayer);
  ChoiceMenu.init(dialogLayer);
  FlavorDisplay.init(gameContainer);
  dialogLayer.style.pointerEvents = 'auto';

  // Input handler
  InputHandler.init();

  // Ending screen
  EndingScreen.init(document.body, handleRestart);

  // Mute button
  const muteBtn = createMuteButton(() => AudioEngine.toggleMute());
  document.body.appendChild(muteBtn);

  // HotspotEngine
  HotspotEngine.init(gameContainer);

  // SceneManager
  SceneManager.init(scenesData, gameContainer);

  // Register scene modules
  SceneManager.registerScene('bulevar', SceneBulevar);
  SceneManager.registerScene('kiosk', SceneKiosk);
  SceneManager.registerScene('kafana', SceneKafana);
  SceneManager.registerScene('tvrdjava', SceneTvrdjava);
  SceneManager.registerScene('kapija', SceneKapija);

  // Update scene badge on scene change
  EventBus.on(EVENTS.SCENE_READY, ({ sceneId, sceneDef }) => {
    const badge = document.getElementById('scene-name-badge');
    if (badge) {
      badge.textContent = sceneDef.name;
    }
  });

  // Flavor text via event
  EventBus.on(EVENTS.HOTSPOT_FLAVOR, ({ text }) => {
    showFlavor(text);
  });

  // Wire FlagManager to window for ResourceManager cross-module access
  window.__flagManager__ = { setFlag };

  updateLoadingBar(80);

  // Setup audio unlock on first interaction
  const unlockAudio = async () => {
    await AudioEngine.unlock();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchend', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  };
  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchend', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  updateLoadingBar(95);

  // Small delay for polish
  await new Promise(r => setTimeout(r, 300));
  updateLoadingBar(100);

  hideLoadingScreen();

  // Show main menu
  showMainMenu();
}

/**
 * Show main menu with save detection
 */
function showMainMenu() {
  const menu = document.getElementById('main-menu');
  if (!menu) return;

  menu.classList.remove('hidden');

  const hasSaveFile = hasSave('auto');
  const achievements = AchievementSystem.getAll();
  const unlockedCount = AchievementSystem.getUnlockedCount();

  menu.innerHTML = buildMenuHTML(hasSaveFile, achievements, unlockedCount);

  // Wire buttons
  const newBtn = menu.querySelector('#btn-new-game');
  const contBtn = menu.querySelector('#btn-continue');

  newBtn?.addEventListener('click', () => {
    menu.classList.add('hidden');
    startNewGame();
  });

  contBtn?.addEventListener('click', () => {
    if (load('auto')) {
      menu.classList.add('hidden');
      continueGame();
    } else {
      showToast({ type: 'warning', title: 'Greška', message: 'Sačuvana igra nije pronađena.', duration: 2500 });
    }
  });
}

function buildMenuHTML(hasSaveFile, achievements, unlockedCount) {
  return `
    <div class="menu-brand">Kluboslavija 2026</div>
    <div class="menu-title">Niš Fuga</div>
    <div class="menu-subtitle">Point-and-click mini avantura — Vodiš Jovanku kroz Niš jutro pred event</div>

    ${hasSaveFile ? `<div class="menu-continue-banner">Postoji sačuvana igra — nastavi ili počni iznova</div>` : ''}

    <div class="menu-btn-group">
      <button class="menu-btn menu-btn-primary" id="btn-new-game">
        ${hasSaveFile ? 'Nova igra' : 'Igraj'}
      </button>
      ${hasSaveFile ? `<button class="menu-btn menu-btn-secondary" id="btn-continue">Nastavi igru</button>` : ''}
    </div>

    <div class="menu-achievements">
      <div class="menu-ach-title">Dostignuća: ${unlockedCount}/9</div>
      <div class="menu-ach-grid">
        ${achievements.map(({ def, unlocked }) => `
          <div class="menu-ach-item ${unlocked ? 'unlocked' : 'locked'}" title="${unlocked ? def.desc : (def.hidden ? '???' : def.name)}">
            <div class="menu-ach-icon">${unlocked ? getIconEmoji(def.icon) : (def.hidden ? '?' : '🔒')}</div>
            <div class="menu-ach-name">${unlocked ? def.name : (def.hidden ? '???' : def.name)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Start a new game
 */
function startNewGame() {
  deleteSave('auto');
  GameState.reset();
  GameState.markStarted();
  Analytics.logEvent('new_game');

  // Start first scene
  SceneManager.loadScene('bulevar');
}

/**
 * Continue from saved state
 */
function continueGame() {
  GameState.markStarted();
  Analytics.logEvent('continue_game');

  const currentScene = GameState.raw().currentScene ?? 'bulevar';

  if (GameState.raw().gameComplete) {
    // Game was complete — restart
    startNewGame();
    return;
  }

  SceneManager.loadScene(currentScene);
}

/**
 * Handle game restart from ending screen
 */
function handleRestart() {
  Analytics.logEvent('restart');
  GameState.reset();
  AmbientPlayer.stop();
  showMainMenu();
}

// ---- Loading Screen ----
function showLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (screen) screen.classList.remove('hidden');
}

function hideLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (screen) {
    screen.classList.add('hidden');
  }
}

function updateLoadingBar(pct) {
  const bar = document.querySelector('.loading-bar');
  if (bar) bar.style.width = `${pct}%`;
}

function showError(msg) {
  const screen = document.getElementById('loading-screen');
  if (screen) {
    screen.innerHTML = `
      <div class="loading-title">Greška</div>
      <div class="loading-sub">${msg}</div>
    `;
  }
}

function getIconEmoji(icon) {
  const map = {
    badge: '🏅', kiosk: '🏪', mic: '🎤', key: '🔑',
    guitar: '🎸', clock: '⏰', wall: '🧱', printer: '🖨️', car: '🚗'
  };
  return map[icon] ?? '🏆';
}

// ---- Boot ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
