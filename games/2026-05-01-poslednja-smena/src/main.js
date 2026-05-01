import { createState, loadState, saveState } from './state.js';
import { initCanvas } from './render.js';
import { initUI, showScene, showEpilog, showTransition } from './ui.js';
import { initInput, setChoiceCallback, clearChoiceCallback } from './input.js';
import { getScene, applyChoice, determineEnding, getEpilog, isGameOver } from './systems/narrative.js';
import { initAudio, startDrone, playClick, playSceneTransition, playEnding } from './audio.js';

function presentScene(state) {
  const scene = getScene(state.currentSceneIndex);
  if (!scene) return;

  function onChoice(choiceIndex) {
    clearChoiceCallback();
    playClick();

    const newState = applyChoice(state, choiceIndex);
    saveState(newState);

    if (isGameOver(newState)) {
      const endingId = determineEnding(newState.stats);
      const finalState = { ...newState, ending: endingId, gamePhase: 'epilog' };
      saveState(finalState);
      playEnding();
      showTransition(() => {
        showEpilog(getEpilog(endingId), finalState.stats);
      });
    } else {
      playSceneTransition();
      showTransition(() => presentScene(newState));
    }
  }

  setChoiceCallback(onChoice);
  showScene(scene, onChoice);
}

function start() {
  const canvas = document.getElementById('illustration-canvas');
  initCanvas(canvas);
  initUI();
  initInput();
  initAudio();

  const state = loadState() ?? createState();

  // Unlock audio on first interaction
  document.addEventListener('click', () => startDrone(), { once: true });
  document.addEventListener('touchstart', () => startDrone(), { once: true });

  if (state.gamePhase === 'epilog' && state.ending) {
    showEpilog(getEpilog(state.ending), state.stats);
  } else {
    presentScene(state);
  }
}

start();
