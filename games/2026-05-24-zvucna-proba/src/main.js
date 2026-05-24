// main.js — Bootstrap, game loop
import { createInitialState, getRank } from './state.js';
import { GAME_CONFIG, ROUNDS } from './config.js';
import { initAudio, playSnippet, stopSnippet, sfxOK, sfxError, sfxStreakBonus, sfxTimerUrgency } from './audio.js';
import { initRenderer, startRenderer, stopRenderer } from './render.js';
import { initUI, showScreen, updateHUD, updateTimerBar, showListening, showDiagnosis, showCorrection, showVerify, showRoundResult, maybeShowGlossary, showGameOver, showWin, renderStartHighscore, setStateRef } from './ui.js';
import { onTap } from './input.js';
import { buildRoundData, isGameOver, isWin, correctionIsCorrect } from './systems/progression.js';
import { calcRoundScore, updateStreak } from './systems/scoring.js';
import { GameTimer } from './systems/timer.js';
import { saveHighscore } from './systems/highscore.js';
import { shareResult } from './share.js';

let state = createInitialState();
let timer = null;
let diagnosisLocked = false;
let correctionSelections = {}; // { axisId: direction }
let correctionConfirmed = false;
let correctionConfirmTimeout = null;

// Init
function init() {
  initUI();
  initRenderer(document.getElementById('vu-canvas'));
  renderStartHighscore();
  setStateRef(state);

  onTap(document.getElementById('btn-start'), startGame);
  onTap(document.getElementById('btn-restart-gameover'), restartGame);
  onTap(document.getElementById('btn-restart-win'), restartGame);
  onTap(document.getElementById('btn-share-gameover'), () => doShare());
  onTap(document.getElementById('btn-share-win'), () => doShare());

  showScreen('start');
}

async function doShare() {
  const rank = getRank(state.score);
  const result = await shareResult(state.score, state.maxStreak, rank);
  if (result === 'copied' || result === 'copied_fallback') {
    showToast('Kopirano u clipboard!');
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:120px; left:50%; transform:translateX(-50%);
    background:#333; color:#fff; padding:10px 20px; border-radius:8px;
    font-size:0.85rem; z-index:999; pointer-events:none;
    animation: fadeInUp 0.3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function startGame() {
  // Init audio on user gesture
  initAudio();
  state = createInitialState();
  state.sessionStarted = true;
  setStateRef(state);
  startRenderer();
  showScreen('game');
  startRound();
}

function restartGame() {
  stopTimer();
  stopSnippet();
  stopRenderer();
  startGame();
}

function startRound() {
  if (isWin(state.round, GAME_CONFIG.TOTAL_ROUNDS)) {
    endGame('win');
    return;
  }

  diagnosisLocked = false;
  correctionSelections = {};
  correctionConfirmed = false;
  if (correctionConfirmTimeout) clearTimeout(correctionConfirmTimeout);

  const roundData = buildRoundData(state.round);
  state.currentRoundData = roundData;
  state.currentProblem = roundData.problem;
  state.currentOptions = roundData.options;

  updateHUD(state);
  showListening();

  // Play snippet
  playSnippet(roundData.problem, () => {
    // After snippet ends, show diagnosis
    showDiagnosisPhase();
  });

  // Start timer only for listening? No — timer starts at diagnosis
}

function showDiagnosisPhase() {
  const roundData = state.currentRoundData;
  const config = roundData.config;

  state.timerDuration = config.timeWindow * 1000;
  state.timerStart = performance.now();

  showDiagnosis(state.currentOptions, (i, text) => {
    if (diagnosisLocked) return;
    diagnosisLocked = true;
    stopTimer();

    const elapsed = performance.now() - state.timerStart;
    const isCorrect = text === roundData.problem.diagnosis;
    state.selectedDiagnosis = text;
    state.diagnosisCorrect = isCorrect;

    if (!isCorrect) {
      // Wrong diagnosis
      handleMiss(elapsed);
    } else {
      // Show glossary terms
      maybeShowGlossary(roundData.problem.glossaryTerms);
      // Go to correction
      showCorrectionPhase(elapsed);
    }
  });

  // Start countdown timer
  timer = new GameTimer({
    duration: state.timerDuration,
    onTick: (remaining, fraction) => {
      updateTimerBar(fraction, fraction < 0.25, fraction < 0.5);
    },
    onUrgency: () => {
      sfxTimerUrgency();
    },
    onExpire: () => {
      if (!diagnosisLocked) {
        diagnosisLocked = true;
        handleMiss(state.timerDuration);
      }
    },
  });
  timer.start();
}

function showCorrectionPhase(diagnosisElapsed) {
  const roundData = state.currentRoundData;
  const problem = roundData.problem;
  const isDouble = roundData.isDouble;

  // Determine axes
  let axes;
  if (isDouble && Array.isArray(problem.correction)) {
    axes = problem.correction.map(c => ({ id: c.axis, label: c.axis.toUpperCase() }));
  } else {
    const corr = Array.isArray(problem.correction) ? problem.correction[0] : problem.correction;
    axes = [{ id: corr.axis, label: corr.axis.toUpperCase() }];
  }

  correctionSelections = {};

  showCorrection(axes, (axisId, direction) => {
    correctionSelections[axisId] = direction;

    // Auto-confirm after all axes selected (300ms debounce)
    if (correctionConfirmTimeout) clearTimeout(correctionConfirmTimeout);
    const allSelected = axes.every(a => correctionSelections[a.id]);
    if (allSelected) {
      correctionConfirmTimeout = setTimeout(() => {
        confirmCorrection(diagnosisElapsed);
      }, 400);
    }
  });
}

function confirmCorrection(diagnosisElapsed) {
  if (correctionConfirmed) return;
  correctionConfirmed = true;

  const roundData = state.currentRoundData;
  const config = roundData.config;
  const problem = roundData.problem;

  const selArr = Object.entries(correctionSelections).map(([axis, direction]) => ({ axis, direction }));
  const correct = correctionIsCorrect(selArr, problem, config.tolerance);

  const elapsed = performance.now() - state.timerStart;

  // Score
  const scoreResult = calcRoundScore({
    diagnosisCorrect: true,
    correctionCorrect: correct,
    elapsed,
    total: state.timerDuration,
    streak: state.streak,
    noTimeBonus: !!config.noTimeBonus,
  });

  const newStreak = updateStreak(state.streak, correct);
  state.score = Math.min(GAME_CONFIG.MAX_SCORE, state.score + scoreResult.total);
  state.streak = newStreak;
  state.maxStreak = Math.max(state.maxStreak, state.streak);

  if (correct) {
    state.consecutiveMisses = 0;
    sfxOK();
    if (state.streak >= 3) sfxStreakBonus();
  } else {
    state.consecutiveMisses++;
    sfxError();
  }

  state.roundsData.push({
    round: state.round,
    correct,
    score: scoreResult.total,
    breakdown: scoreResult.breakdown,
  });

  updateHUD(state);

  // Play verify snippet
  showVerify();
  playSnippet(problem, () => {
    showRoundResult({
      correct,
      points: scoreResult.total,
      breakdown: scoreResult.breakdown,
      callback: () => {
        if (isGameOver(state.consecutiveMisses)) {
          endGame('gameover');
        } else {
          state.round++;
          startRound();
        }
      },
    });
  }, true, selArr);
}

function handleMiss(elapsed) {
  state.consecutiveMisses++;
  state.streak = 0;
  sfxError();

  state.roundsData.push({
    round: state.round,
    correct: false,
    score: 0,
    breakdown: 'Promašaj',
  });

  updateHUD(state);

  if (state.lives > 0) state.lives--;
  updateHUD(state);

  showRoundResult({
    correct: false,
    points: 0,
    breakdown: 'Promašaj — 0 bodova',
    callback: () => {
      if (isGameOver(state.consecutiveMisses)) {
        endGame('gameover');
      } else {
        state.round++;
        startRound();
      }
    },
  });
}

function stopTimer() {
  if (timer) {
    timer.stop();
    timer = null;
  }
}

function endGame(type) {
  stopTimer();
  stopSnippet();

  // Save highscore
  saveHighscore(state.score, state.maxStreak);

  if (type === 'win') {
    sfxOK();
    showWin(state);
  } else {
    sfxError();
    showGameOver(state);
  }

  stopRenderer();
}

// Boot
document.addEventListener('DOMContentLoaded', init);
