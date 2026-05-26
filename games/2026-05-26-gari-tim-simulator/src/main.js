// main.js — State machine, scene runner
import { createState, saveToLocalStorage } from './state.js';
import { AudioManager } from './audio.js';
import { setupInput } from './input.js';
import {
  fadeSceneOut, clearScene,
  renderNarration, renderDialogueSequence,
  renderChoices, renderContinueButton,
  showEnding, showLoseEnding, hideLoading
} from './ui.js';
import { loadScene } from './systems/scenes.js';
import { calculateEnding } from './systems/endings.js';
import { applyDelta } from './systems/affinity.js';
import { ENDINGS } from './content/endings_content.js';
import { SHARE_TEXTS } from './content/share_texts.js';
import { shareResult, copyToClipboard, showCopyFeedback } from './share.js';
import { DIALOGUE_NODES } from './content/dialogue_tree.js';

// ============================================================
// State
// ============================================================
let state = createState();

// ============================================================
// Boot
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  hideLoading();
  setupInput();

  // First user interaction → init audio
  const firstInteraction = () => {
    AudioManager.init();
    AudioManager.resume();
    AudioManager.playAmbient();
    document.removeEventListener('click', firstInteraction);
    document.removeEventListener('touchstart', firstInteraction);
    document.removeEventListener('keydown', firstInteraction);
  };
  document.addEventListener('click', firstInteraction);
  document.addEventListener('touchstart', firstInteraction);
  document.addEventListener('keydown', firstInteraction);

  startGame();
});

// ============================================================
// Game start / restart
// ============================================================
function startGame() {
  state = createState();

  const shareCard = document.getElementById('share-card');
  if (shareCard) shareCard.classList.add('hidden');

  clearScene();
  runScene(0);
}

// ============================================================
// Scene runner
// ============================================================
function runScene(sceneIndex) {
  state.scene = sceneIndex;
  AudioManager.setScene(sceneIndex);
  const firstNodeId = loadScene(sceneIndex, state);
  runNode(firstNodeId);
}

// ============================================================
// Node runner (central dispatcher)
// ============================================================
function runNode(nodeId) {
  if (!nodeId) return;

  // Dynamic scene 3
  if (nodeId === '__scene3_dynamic__') {
    runScene(3);
    return;
  }

  // Ending calculation
  if (nodeId === '__calculate_ending__') {
    resolveEnding();
    return;
  }

  const node = DIALOGUE_NODES[nodeId];
  if (!node) {
    console.warn('[GTS] Missing node:', nodeId);
    return;
  }

  switch (node.type) {
    case 'narration': handleNarrationNode(node); break;
    case 'dialogue':  handleDialogueNode(node);  break;
    case 'choice':    handleChoiceNode(node);    break;
    case 'auto':      runNode(node.next);        break;
    case 'resolve':   resolveEnding();           break;
    default:
      if (node.next) runNode(node.next);
  }
}

// ============================================================
// Resolve next node: checks dule micro-scene trigger
// ============================================================
function resolveNext(nextId) {
  // Dule micro-scene: insert before scene7_resolution if dule >= 9
  if (nextId === 'scene7_resolution' && state.affinity.dule >= 9) {
    runNode('dule_micro_start');
    return;
  }
  if (nextId) runNode(nextId);
}

// ============================================================
// Node type handlers
// ============================================================
function handleNarrationNode(node) {
  fadeSceneOut(() => {
    clearScene();
    renderNarration(node.narration, () => {
      if (node.next) {
        // scene6_micro_D_laugh bonus: dule +1
        if (node.id === 'scene6_micro_D_laugh') {
          state.affinity.dule += 1;
        }
        renderContinueButton('Nastavi →', () => resolveNext(node.next));
      }
    });
  });
}

function handleDialogueNode(node) {
  fadeSceneOut(() => {
    clearScene();
    renderDialogueSequence(node.lines, () => {
      if (node.next) {
        renderContinueButton('Nastavi →', () => resolveNext(node.next));
      }
    });
  });
}

function handleChoiceNode(node) {
  fadeSceneOut(() => {
    clearScene();

    const showChoices = () => {
      renderChoices(node.choices, (choiceKey) => {
        const choice = node.choices.find(c => c.key === choiceKey);
        if (!choice) return;

        // Apply affinity delta
        if (choice.delta) applyDelta(state, choice.delta);

        // Apply flags
        if (choice.flags) Object.assign(state.flags, choice.flags);

        resolveNext(choice.next);
      });
    };

    if (node.prompt) {
      renderNarration(node.prompt, showChoices);
    } else {
      showChoices();
    }
  });
}

// ============================================================
// Ending resolution
// ============================================================
function resolveEnding() {
  const endingId = calculateEnding(state);
  state.ending = endingId;

  saveToLocalStorage(state, endingId);

  if (endingId === 'lose') {
    fadeSceneOut(() => {
      clearScene();
      showLoseEnding(startGame);
    });
    return;
  }

  const endingData = ENDINGS[endingId];
  if (!endingData) {
    showLoseEnding(startGame);
    return;
  }

  const shareText = SHARE_TEXTS[endingId] || endingData.shareText;

  showEnding(
    endingData,
    startGame,
    (mode) => {
      if (mode === 'copy') {
        const fullText = `${endingData.title}\n\n${endingData.shareText}\n\nhttps://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/`;
        copyToClipboard(fullText).then(result => {
          showCopyFeedback(result.success ? 'Kopirano!' : 'Greška pri kopiranju.');
        });
      } else {
        shareResult(endingData, shareText);
      }
    }
  );
}
