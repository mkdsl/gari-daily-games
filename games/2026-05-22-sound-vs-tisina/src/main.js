// main.js — game bootstrap and loop orchestrator
import { createInitialState, saveProgress, loadProgress } from './state.js';
import { loadVenue } from './systems/venue.js';
import { computeHeatmap, getNeighborSPL, computeAverageHappiness } from './systems/spl-engine.js';
import { tickEvents } from './systems/events.js';
import { checkComplaint, getEffectiveNeighborLimit } from './systems/economy.js';
import { triggerComplaint, isShutdown } from './systems/warnings.js';
import { addXP, calculateSessionXP, unlockNextVenue } from './systems/progression.js';
import { calculateReputation, applyUpgrade } from './systems/economy.js';
import { startRenderLoop, stopRenderLoop } from './render.js';
import { updateRunningUI, showScreen, clearFeed, renderVenueSelect } from './ui.js';
import { initSliders, rebuildSliders } from './ui/sliders.js';
import { showGameOver } from './ui/game-over.js';
import { resumeAudio, startBeatLoop, stopBeatLoop, happinessChord, gameOverDrone } from './audio.js';
import { InputManager } from './input.js';
import { TICK_RATE, GAME_DURATION_REAL_SEC, UPGRADES } from './config.js';
import { addFeedMessage } from './ui/event-feed.js';
import { getRandomLine } from './content/dialogue.js';

let state = null;
let tickInterval = null;
let inputManager = null;
let lastHappiness = 0;
let happinessChordThrottle = 0;

export function startGame() {
  state = createInitialState();
  loadProgress(state);

  setupMenuHandlers();
  showScreen('menu');
}

function setupMenuHandlers() {
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.onclick = () => {
      resumeAudio();
      showScreen('venue-select');
      renderVenueSelect(state, onVenueSelected);
    };
  }

  const btnSetupBack = document.getElementById('btn-setup-back');
  if (btnSetupBack) {
    btnSetupBack.onclick = () => {
      showScreen('venue-select');
      renderVenueSelect(state, onVenueSelected);
    };
  }

  const btnSetupStart = document.getElementById('btn-setup-start');
  if (btnSetupStart) {
    btnSetupStart.onclick = () => startRunning();
  }

  const btnReplay = document.getElementById('btn-replay');
  if (btnReplay) {
    btnReplay.onclick = () => {
      showScreen('venue-select');
      renderVenueSelect(state, onVenueSelected);
    };
  }

  const btnNextVenue = document.getElementById('btn-next-venue');
  if (btnNextVenue) {
    btnNextVenue.onclick = () => {
      showScreen('venue-select');
      renderVenueSelect(state, onVenueSelected);
    };
  }
}

function onVenueSelected(venueIndex) {
  loadVenue(venueIndex, state);
  showSetupScreen();
}

function showSetupScreen() {
  showScreen('setup');

  const titleEl = document.getElementById('setup-title');
  if (titleEl) titleEl.textContent = `Priprema: ${state.currentVenue.name}`;

  const budgetEl = document.getElementById('setup-budget');
  if (budgetEl) budgetEl.textContent = `💰 ${state.budget.toLocaleString()}`;

  renderUpgradesGrid();
}

function renderUpgradesGrid() {
  const grid = document.getElementById('upgrades-grid');
  if (!grid) return;
  grid.innerHTML = '';

  UPGRADES.forEach(upgrade => {
    const owned = state.upgrades.has(upgrade.id);
    const requiresMet = !upgrade.requires || state.upgrades.has(upgrade.requires);
    const canAfford = state.budget >= upgrade.cost;

    const card = document.createElement('div');
    card.className = `upgrade-card ${owned ? 'owned' : ''} ${!requiresMet ? 'locked' : ''} ${!canAfford && !owned ? 'unaffordable' : ''}`;

    card.innerHTML = `
      <div class="ug-name">${upgrade.name}</div>
      <div class="ug-desc">${upgrade.desc}</div>
      <div class="ug-cost">${owned ? '✅ Kupljeno' : `💰 ${upgrade.cost.toLocaleString()}`}</div>
    `;

    if (!owned && requiresMet && canAfford) {
      card.addEventListener('click', () => {
        if (applyUpgrade(upgrade.id, state)) {
          renderUpgradesGrid();
          const budgetEl = document.getElementById('setup-budget');
          if (budgetEl) budgetEl.textContent = `💰 ${state.budget.toLocaleString()}`;
        }
      });
    }

    grid.appendChild(card);
  });
}

function startRunning() {
  state.phase = 'running';
  showScreen('running');

  // Init canvas input
  const canvas = document.getElementById('game-canvas');
  inputManager = new InputManager(canvas);

  // Init sliders
  initSliders(state, (zone) => {
    // Slider changed — heatmap will recompute on next tick
  });

  // Show mentor start line
  const mentorLine = getRandomLine('venue_start');
  if (mentorLine) addFeedMessage(mentorLine, '🎭');

  // Start render loop
  startRenderLoop(canvas, () => state);

  // Start beat loop
  startBeatLoop(() => state.happiness);

  // Start tick loop
  let lastTick = performance.now();
  tickInterval = setInterval(() => {
    const now = performance.now();
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    gameTick(dt);
  }, 1000 / TICK_RATE);
}

function gameTick(dt) {
  if (state.phase !== 'running') return;

  state.gameTime += dt;

  // Compute SPL heatmap
  computeHeatmap(state);

  // Get neighbor SPL
  state.neighborSPL = getNeighborSPL(state);

  // Compute happiness
  const rawHappiness = computeAverageHappiness(state);
  const mods = getEventMods(state);
  state.happiness = Math.min(100, rawHappiness * mods.happinessMult);

  // Track session stats
  if (state.happiness > state.sessionStats.maxHappiness) {
    state.sessionStats.maxHappiness = state.happiness;
  }
  if (state.neighborSPL < state.sessionStats.minNeighborSPL) {
    state.sessionStats.minNeighborSPL = state.neighborSPL;
  }
  state.sessionStats.totalTicks++;

  // Happiness chord feedback (throttled)
  const now = performance.now();
  if (state.happiness > lastHappiness + 15 && now - happinessChordThrottle > 3000) {
    happinessChord(Math.floor(state.happiness / 10));
    happinessChordThrottle = now;
  }
  lastHappiness = state.happiness;

  // Tick dynamic events
  const newEvent = tickEvents(state, dt);
  if (newEvent) {
    const line = getEventMentorLine(newEvent);
    if (line) addFeedMessage(line, '🎭');
  }

  // Check complaints
  const effectiveLimit = getEffectiveNeighborLimit(state);
  if (state.neighborSPL >= effectiveLimit + 1.5) {
    if (checkComplaint(state)) {
      const shutdown = triggerComplaint(state);
      addFeedMessage(getRandomLine('complaint'), '⚠️');
      if (shutdown) {
        endGame(false);
        return;
      }
    }
  }

  // Check win condition (game time up + happiness threshold met)
  if (state.gameTime >= GAME_DURATION_REAL_SEC) {
    const threshold = state.currentVenue.happinessThreshold || 60;
    const won = state.happiness >= threshold || state.sessionStats.maxHappiness >= threshold;
    state.pendingWin = won;
    endGame(won);
    return;
  }

  // Update DOM HUD
  updateRunningUI(state);
}

function getEventMods(state) {
  let happinessMult = 1.0;
  for (const ev of state.dynamicEvents) {
    if (ev.happinessMult) happinessMult *= ev.happinessMult;
  }
  return { happinessMult };
}

function getEventMentorLine(event) {
  if (event.id === 'wind_shift') return getRandomLine('event_wind');
  if (event.id === 'inspection') return getRandomLine('event_inspection');
  return null;
}

function endGame(isWin) {
  state.phase = 'gameover';

  // Stop loops
  clearInterval(tickInterval);
  tickInterval = null;
  stopRenderLoop();
  stopBeatLoop();
  gameOverDrone();

  // Award XP
  const xpEarned = calculateSessionXP(state);
  addXP(xpEarned, state);

  // Update reputation
  calculateReputation(state);

  // Unlock next venue on win
  if (isWin) unlockNextVenue(state);

  // Save progress
  saveProgress(state);

  // Show game over screen
  showScreen('gameover');
  showGameOver(state, isWin);

  clearFeed();
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  startGame();
});
