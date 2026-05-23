// Entry point — game loop orchestration
import { state, initState, recordHighscore } from './state.js';
import { CELL_SIZE, LOW_TIME_THRESHOLD } from './config.js';
import { Backpack } from './entities/backpack.js';
import { spawnParticles } from './entities/particle.js';
import { getLevelConfig, generateLevelItems } from './levels/generator.js';
import { render, getGridOrigin } from './render.js';
import { setupInput } from './input.js';
import { updateGhost, clearGhost, tryDrop } from './systems/drag.js';
import { rotateItem } from './systems/rotation.js';
import { calculateLevelScore, getScoreGrade, getSummary } from './systems/scoring.js';
import { Timer } from './systems/timer.js';
import { isLastLevel, getNextLevelId } from './systems/progression.js';
import {
  showScreen, hideAllScreens, showHUD, showGameArea,
  updateHUDTimer, updateHUDScore, updateHUDLevel,
  renderItemPanel, renderStartScreen, renderLevelComplete, renderGameOver,
} from './ui.js';
import { playThud, playBuzz, playWin, playLevelUp, playTick, playRotate, playSelect, resumeAudio } from './audio.js';
import { shareScore } from './share.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Build color map {itemId: color} for fast render lookup
let itemColorMap = {};

// Timer instance
const timer = new Timer(90,
  (timeLeft) => {
    updateHUDTimer(timeLeft, timer.isUrgent);
    if (timer.isUrgent && Math.floor(timeLeft) !== Math.floor(timeLeft + 0.016)) {
      // Tick sound ~ once per second in urgent zone
    }
    updateTimerBar(timer.progress, timer.isUrgent);
  },
  () => {
    // Timer expired
    endLevel(true);
  }
);

let tickSoundAccum = 0;

function updateTimerBar(progress, urgent) {
  let bar = document.getElementById('timer-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'timer-bar';
    bar.className = 'timer-bar';
    const hud = document.getElementById('hud');
    if (hud) hud.appendChild(bar);
  }
  bar.style.width = `${progress * 100}%`;
  bar.classList.toggle('urgent', urgent);
}

// ---- Setup ----
function resizeCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  if (!wrap) return;
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}

function startLevel(levelId) {
  const config = getLevelConfig(levelId);
  state.currentLevel = levelId;
  state.levelScore = 0;

  // Build backpack
  state.backpack = new Backpack(config.gridW, config.gridH);

  // Build items
  state.levelItems = generateLevelItems(levelId);
  state.availableItems = [...state.levelItems];
  state.placedItems = [];
  state.selectedItem = null;
  state.ghost = null;
  state.particles = [];

  // Build color map
  itemColorMap = {};
  state.levelItems.forEach(item => {
    itemColorMap[item.id] = item.color;
  });

  // Timer
  timer.reset(config.time);
  timer.start();

  // UI
  hideAllScreens();
  showHUD(true);
  showGameArea(true);
  updateHUDLevel(levelId);
  updateHUDScore(state.totalScore);
  renderItemPanel(state.levelItems, state.selectedItem, onItemClick);
}

function endLevel(timedOut = false) {
  timer.pause();

  const placedItems = state.placedItems.filter(i => i.placed);
  const { total, breakdown, allRequiredPacked } = calculateLevelScore(
    placedItems,
    state.levelItems,
    timer.timeLeft
  );

  state.levelScore = total;
  state.totalScore += total;
  state.lastBreakdown = breakdown;

  updateHUDScore(state.totalScore);

  const isLast = isLastLevel(state.currentLevel);

  if (isLast) {
    triggerGameOver();
  } else {
    triggerLevelComplete(breakdown);
  }
}

function triggerLevelComplete(breakdown) {
  playLevelUp();
  renderLevelComplete(state.levelScore, state.totalScore, breakdown);
  showHUD(false);
  showGameArea(false);
  showScreen('level-complete');
}

function triggerGameOver() {
  const gradeObj = getScoreGrade(state.totalScore);

  // Collect all level items for summary
  const allItems = state.levelItems;
  const placedItems = state.placedItems.filter(i => i.placed);
  const { packed, missed } = getSummary(placedItems, allItems);

  recordHighscore(state.totalScore, gradeObj.grade);

  if (state.totalScore >= 300) playWin();
  else playBuzz();

  renderGameOver(
    state.totalScore,
    gradeObj,
    state.lastBreakdown,
    packed,
    missed,
    allItems,
    state.highscores
  );

  showHUD(false);
  showGameArea(false);
  showScreen('game-over');
}

// ---- Item selection ----
function onItemClick(item) {
  if (item.placed) return;
  resumeAudio();
  if (state.selectedItem === item) {
    state.selectedItem = null;
  } else {
    state.selectedItem = item;
    playSelect();
  }
  renderItemPanel(state.levelItems, state.selectedItem, onItemClick);
}

// ---- Grid click / drop ----
function onCellClick(col, row) {
  resumeAudio();
  if (state.screen !== 'playing') return;
  if (!state.selectedItem) return;

  const result = tryDrop(col, row, state);

  if (result === 'placed') {
    const item = state.placedItems[state.placedItems.length - 1];
    playThud();

    // Spawn particles at placed location
    const { x: ox, y: oy } = getGridOrigin(canvas, state.backpack);
    const px = ox + (item.gridX + Math.floor(item.cols / 2)) * CELL_SIZE;
    const py = oy + (item.gridY + Math.floor(item.rows / 2)) * CELL_SIZE;
    state.particles.push(...spawnParticles(px, py, item.color, 10));

    // Score pop
    updateHUDScore(state.totalScore);

    // Re-render panel
    renderItemPanel(state.levelItems, state.selectedItem, onItemClick);

    // Check if all required are placed
    const requiredItems = state.levelItems.filter(i => i.required);
    const allRequiredPlaced = requiredItems.every(i => i.placed);
    if (allRequiredPlaced) {
      // Optionally auto-advance, but let player keep placing bonus items
      // until time runs out
    }
  } else if (result === 'invalid') {
    playBuzz();
    // Shake canvas briefly
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 350);
  }
}

function onCanvasMove(px, py) {
  if (state.screen !== 'playing') return;
  updateGhost(px, py, canvas, state);
}

function onCanvasLeave() {
  clearGhost(state);
}

// ---- Game loop ----
let lastTimestamp = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  if (state.screen === 'playing') {
    timer.update(timestamp);

    // Tick sound
    if (timer.isUrgent) {
      tickSoundAccum += dt;
      if (tickSoundAccum >= 1.0) {
        tickSoundAccum = 0;
        playTick();
      }
    } else {
      tickSoundAccum = 0;
    }

    // Update particles
    state.particles = state.particles.filter(p => p.alive);
    for (const p of state.particles) p.update(dt);

    // Render canvas
    resizeCanvas();
    render(ctx, canvas, state, itemColorMap);
  }

  requestAnimationFrame(gameLoop);
}

// ---- Button bindings ----
function bindButtons() {
  document.getElementById('btn-start')?.addEventListener('click', () => {
    resumeAudio();
    initState();
    state.screen = 'playing';
    startLevel(1);
  });

  document.getElementById('btn-next-level')?.addEventListener('click', () => {
    resumeAudio();
    const next = getNextLevelId(state.currentLevel);
    state.screen = 'playing';
    startLevel(next);
  });

  document.getElementById('btn-restart')?.addEventListener('click', () => {
    resumeAudio();
    initState();
    state.screen = 'playing';
    startLevel(1);
  });

  document.getElementById('btn-rotate')?.addEventListener('click', () => {
    resumeAudio();
    if (state.selectedItem) {
      rotateItem(state.selectedItem);
      playRotate();
      renderItemPanel(state.levelItems, state.selectedItem, onItemClick);
    }
  });

  document.getElementById('btn-share')?.addEventListener('click', async () => {
    resumeAudio();
    const gradeObj = getScoreGrade(state.totalScore);
    const result = await shareScore(state.totalScore, gradeObj, state.currentLevel);
    const btn = document.getElementById('btn-share');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = result === 'copied' ? 'Kopirano!' : (result === 'shared' ? 'Podeljeno!' : 'Greška');
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }
  });

  // Keyboard: R = rotate, Escape = deselect
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      if (state.selectedItem) {
        rotateItem(state.selectedItem);
        playRotate();
        renderItemPanel(state.levelItems, state.selectedItem, onItemClick);
      }
    }
    if (e.key === 'Escape') {
      state.selectedItem = null;
      renderItemPanel(state.levelItems, null, onItemClick);
    }
  });
}

// ---- Init ----
function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  initState();
  renderStartScreen(state.highscores);
  showScreen('start');

  setupInput(canvas, state, {
    onCellClick,
    onCanvasMove,
    onCanvasLeave,
  });

  bindButtons();
  requestAnimationFrame(gameLoop);
}

init();
