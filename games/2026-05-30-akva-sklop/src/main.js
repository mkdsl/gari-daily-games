/**
 * main.js - Akva-Sklop
 * Bootstrap + game loop (requestAnimationFrame).
 * Planning phase: real-time countdown; simulate on button click or timer expire.
 */

import { initState, getState, setState, saveToStorage, loadFromStorage } from './state.js';
import { createGrid, initGridWithLakes } from './grid.js';
import { runSimulationWeek } from './hydraulics.js';
import { scheduleEvents, getActiveEvent, generateSeed } from './events.js';
import { calcWeekScore, calcFinalScore } from './scoring.js';
import { startPlanningPhase, startSimulationPhase, advanceWeek, tickPlanningTimer } from './progression.js';
import { DIFFICULTY } from './config.js';

// ---------------------------------------------------------------------------
// Optional module imports — these modules are expected to exist alongside.
// They are imported defensively so the core loop runs even if stubs are absent.
// ---------------------------------------------------------------------------

let initInput       = () => {};
let initRender      = () => {};
let renderFrame     = () => {};
let initUI          = () => {};
let updateHUD       = () => {};
let showEventBanner = () => {};
let showVictoryScreen = () => {};
let addWeekLog      = () => {};  // BUG-M2: dodato
let initAudio       = () => {};
let playTilePlaced  = () => {};
let playSimStart    = () => {};
let playWaterAmbient = () => {};
let initCards       = () => {};
let unlockNextCard  = () => {};
let initShare       = () => {};
let setAnimLerp     = () => {};  // BUG-M1: dodato
let setPrevLakes    = () => {};  // BUG-M1: dodato

async function loadOptionalModules() {
  try { ({ initInput }                                          = await import('./input.js'));   } catch (_) {}
  try { ({ initRender, renderFrame }                           = await import('./render.js'));  } catch (_) {}
  try { ({ initUI, updateHUD, showEventBanner, showVictoryScreen, addWeekLog } = await import('./ui.js')); } catch (_) {}  // BUG-M2: addWeekLog dodat
  try { ({ initAudio, playTilePlaced, playSimStart, playWaterAmbient } = await import('./audio.js')); } catch (_) {}
  try { ({ initCards, unlockNextCard }                         = await import('./cards.js'));   } catch (_) {}
  try { ({ initShare }                                         = await import('./share.js'));   } catch (_) {}
  try { ({ setAnimLerp, setPrevLakes }                         = await import('./render.js'));  } catch (_) {}  // BUG-M1: render anim exports
}

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let lastTime = 0;
let grid     = [];
let _simLock = false; // prevent double-triggering simulation

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

function gameLoop(timestamp) {
  const delta = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  const state = getState();

  if (state.phase === 'planning') {
    const timerDone = tickPlanningTimer(state, delta);
    if (timerDone && !_simLock) {
      triggerSimulation();
      return; // triggerSimulation will resume the loop after animation
    }
  }

  renderFrame(grid, state);
  updateHUD(state);

  if (state.phase !== 'gameover' && state.phase !== 'victory') {
    requestAnimationFrame(gameLoop);
  }
}

// ---------------------------------------------------------------------------
// Simulation trigger — BUG-C1: export dodat
// ---------------------------------------------------------------------------

export async function triggerSimulation() {  // BUG-C1 fix: export
  if (_simLock) return;
  _simLock = true;

  const state = getState();
  if (state.phase !== 'planning') {
    _simLock = false;
    return;
  }

  startSimulationPhase(state);
  playSimStart();

  // Run simulation
  const newState = runSimulationWeek(state, grid);
  const weekScore = calcWeekScore(newState);
  newState.weeklyScores.push({ week: newState.week, score: weekScore, event: newState.activeEvent });

  // BUG-M2: addWeekLog poziv posle calcWeekScore
  const activeEvent = getActiveEvent(newState.events, newState.week);
  addWeekLog(newState.week, weekScore, activeEvent?.type || null);

  // BUG-M1: zapamti pre-sim stanje za lerp animaciju
  setPrevLakes(state.lakes);
  const simStart = Date.now();
  const animInterval = setInterval(() => {
    const elapsed = (Date.now() - simStart) / 4000;
    setAnimLerp(Math.min(elapsed, 1.0));
    if (elapsed >= 1.0) clearInterval(animInterval);
  }, 16); // ~60fps

  // 4s animation window
  lastTime = 0;
  requestAnimationFrame(gameLoop);
  await new Promise(r => setTimeout(r, 4000));

  clearInterval(animInterval);  // BUG-M1: cleanup
  setAnimLerp(0);               // BUG-M1: reset po završetku animacije

  advanceWeek(newState);
  saveToStorage();

  if (newState.phase === 'victory' || newState.phase === 'gameover') {
    const finalResult = calcFinalScore(
      newState.weeklyScores,
      DIFFICULTY[newState.difficulty] || DIFFICULTY['fazaA']
    );
    newState.finalScore = finalResult;
    unlockNextCard(newState);
    showVictoryScreen(newState, finalResult);
    renderFrame(grid, newState);
    updateHUD(newState);
  } else {
    startPlanningPhase(newState);
    const nextEvent = getActiveEvent(newState.events, newState.week);
    if (nextEvent) showEventBanner(nextEvent);
    lastTime = 0;
    requestAnimationFrame(gameLoop);
  }

  _simLock = false;
}

// ---------------------------------------------------------------------------
// Simulate button — BUG-C2: 'btn-simulate' -> 'btnSimulate'
// ---------------------------------------------------------------------------

function bindSimulateButton() {
  const btn = document.getElementById('btnSimulate');  // BUG-C2 fix: ispravljen ID
  if (!btn) return;
  btn.addEventListener('click', () => {
    const state = getState();
    if (state.phase === 'planning' && !_simLock) {
      triggerSimulation();
    }
  });
}

// ---------------------------------------------------------------------------
// Debug panel
// ---------------------------------------------------------------------------

let _debugVisible = false;

function toggleDebugPanel() {
  _debugVisible = !_debugVisible;
  const panel = document.getElementById('debug-panel');
  if (!panel) return;
  panel.style.display = _debugVisible ? 'block' : 'none';
  if (_debugVisible) {
    try {
      const state = getState();
      panel.textContent = JSON.stringify({
        week:   state.week,
        phase:  state.phase,
        ap:     state.ap,
        timer:  Math.ceil(state.apTimer),
        lakes:  Object.fromEntries(
          Object.entries(state.lakes).map(([id, l]) => [id, {
            level:  Math.round(l.level),
            cap:    l.capacity,
            pH:     l.pH.toFixed(2),
            fish:   l.fishHealth,
            ducks:  l.duckHealth,
          }])
        ),
        events: state.events,
      }, null, 2);
    } catch (_) {
      panel.textContent = '(state not initialized)';
    }
  }
}

function closeModal() {
  const modals = document.querySelectorAll('.modal, #victory-screen, #event-banner');
  modals.forEach(m => { m.style.display = 'none'; });
}

// ---------------------------------------------------------------------------
// Difficulty picker
// ---------------------------------------------------------------------------

function showDifficultyPicker() {
  const loading = document.getElementById('loading');
  if (!loading) return;
  loading.innerHTML = `
    <div class="picker">
      <h1>Akva-Sklop</h1>
      <p>Guncati Imanje — upravljaj vodom pre investitora</p>
      <button onclick="window.startNewGame('faza0')">Faza 0 - Tutorial</button>
      <button onclick="window.startNewGame('fazaA')">Faza A - Standard</button>
      <button onclick="window.startNewGame('fazaB')">Faza B - Komercijalno</button>
    </div>
  `;
  loading.style.display = 'flex';
}

// ---------------------------------------------------------------------------
// Public start function
// ---------------------------------------------------------------------------

export async function startNewGame(difficultyId = 'fazaA') {
  // Hide picker
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';

  await loadOptionalModules();

  const { runCount, unlockedCards } = loadFromStorage();
  const state = initState(difficultyId, unlockedCards);
  state.runCount = runCount + 1;

  grid = createGrid();
  initGridWithLakes(grid, state, difficultyId);
  state.events = scheduleEvents(difficultyId, generateSeed());

  const canvas = document.getElementById('gameCanvas');
  initInput(canvas, grid);  // BUG-C3 fix: canvas (ne grid) je prvi argument
  if (canvas) initRender(canvas);
  initUI();
  initAudio();
  initCards(state);
  initShare();

  startPlanningPhase(state);
  updateHUD(state);
  playWaterAmbient();
  bindSimulateButton();

  _simLock = false;
  lastTime = 0;
  requestAnimationFrame(gameLoop);
}

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------

document.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') toggleDebugPanel();
  if (e.key === 'Escape') closeModal();
});

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  showDifficultyPicker();
});

window.startNewGame = startNewGame;
window.triggerSimulation = triggerSimulation;  // BUG-C1: expose za onclick fallback
