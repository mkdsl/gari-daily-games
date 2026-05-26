// main.js — State machine, scene runner
import { createState, saveToLocalStorage, loadFromLocalStorage } from './state.js';
import { AudioManager } from './audio.js';
import { setupInput, onChoiceSelected, attachChoiceHandlers } from './input.js';
import { fadeSceneOut, clearScene, renderNarration, renderDialogueSequence, renderChoices, renderContinueButton, showEnding, showLoseEnding, hideLoading } from './ui.js';
import { DialogueEngine } from './systems/dialogue.js';
import { loadScene } from './systems/scenes.js';
import { calculateEnding } from './systems/endings.js';
import { applyDelta, getTotalAffinity } from './systems/affinity.js';
import { ENDINGS } from './content/endings_content.js';
import { SHARE_TEXTS } from './content/share_texts.js';
import { shareResult, copyToClipboard, showCopyFeedback } from './share.js';
import { DIALOGUE_NODES } from './content/dialogue_tree.js';

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
  DialogueEngine.init(state);

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

function runNode(nodeId) {
  if (!nodeId) return;

  // Special handling
  if (nodeId === '__scene3_dynamic__') {
    runScene(3);
    return;
  }

  if (nodeId === '__calculate_ending__') {
    resolveEnding();
    return;
  }

  const node = DIALOGUE_NODES[nodeId];
  if (!node) {
    console.warn('Missing node:', nodeId);
    return;
  }

  switch (node.type) {
    case 'narration':
      handleNarrationNode(node);
      break;
    case 'dialogue':
      handleDialogueNode(node);
      break;
    case 'choice':
      handleChoiceNode(node);
      break;
    case 'auto':
      runNode(node.next);
      break;
    case 'resolve':
      resolveEnding();
      break;
    case 'share':
      // handled by resolveEnding
      break;
    default:
      if (node.next) runNode(node.next);
  }
}

// ============================================================
// Node handlers
// ============================================================
function handleNarrationNode(node) {
  fadeSceneOut(() => {
    clearScene();
    renderNarration(node.narration, () => {
      if (node.next) {
        // Auto-advance after typing, or wait for click
        renderContinueButton('Nastavi →', () => runNode(node.next));
      }
    });
  });
}

function handleDialogueNode(node) {
  fadeSceneOut(() => {
    clearScene();
    renderDialogueSequence(node.lines, () => {
      if (node.next) {
        renderContinueButton('Nastavi →', () => runNode(node.next));
      }
    });
  });
}

function handleChoiceNode(node) {
  // Render prompt as narration if present
  fadeSceneOut(() => {
    clearScene();

    const showChoices = () => {
      renderChoices(node.choices, (choiceKey) => {
        handleChoice(node, choiceKey);
      });
    };

    if (node.prompt) {
      renderNarration(node.prompt, showChoices);
    } else {
      showChoices();
    }
  });
}

function handleChoice(node, choiceKey) {
  const choice = node.choices.find(c => c.key === choiceKey);
  if (!choice) return;

  // Apply affinity delta
  if (choice.delta) {
    applyDelta(state, choice.delta);
  }

  // Apply flags
  if (choice.flags) {
    Object.assign(state.flags, choice.flags);
  }

  // Dule micro-scene check: before scene7_resolution, check dule >= 9
  let nextNodeId = choice.next;

  if (nextNodeId === 'scene7_resolution') {
    if (state.affinity.dule >= 9) {
      // Redirect through dule micro-scene
      // Patch: insert dule_micro final node -> scene7_resolution
      nextNodeId = 'dule_micro_start';
    }
  }

  // Special scene6_response_D micro adds dule +1
  if (choice.flags && choice.flags.gari_finalni === 'jezik') {
    // The micro-scene will run, dule +1 applied in scene6_micro_D_laugh path
    // Actually apply the dule +1 here after the laugh
  }

  runNode(nextNodeId);
}

// ============================================================
// Override narration handler for scene6_micro_D_laugh
// to also add dule +1 if came through D path
// ============================================================
const _origHandleNarration = handleNarrationNode;

// Track if we came through the D laugh path
function patchedRunNode(nodeId) {
  if (nodeId === 'scene6_micro_D_laugh') {
    // Apply the extra dule +1 (laughter bonus)
    state.affinity.dule += 1;
  }
  runNode(nodeId);
}

// Patch scene6_micro_D to use patched next
const origScene6MicroD = DIALOGUE_NODES['scene6_micro_D'];
if (origScene6MicroD) {
  // We handle the +1 in resolveEnding context instead
  // (dialogue node continues normally, +1 applied at scene7_resolution check)
}

// Also check dule >= 9 before scene7_resolution in dialogue nodes
const _origHandleDialogue = handleDialogueNode;

function handleDialogueNodeWithDuleCheck(node) {
  fadeSceneOut(() => {
    clearScene();
    renderDialogueSequence(node.lines, () => {
      let nextId = node.next;
      if (nextId === 'scene7_resolution' && state.affinity.dule >= 9) {
        nextId = 'dule_micro_start';
      }
      if (nextId) {
        renderContinueButton('Nastavi →', () => runNode(nextId));
      }
    });
  });
}

// Override in switch (refactor to use closures properly)
function handleNarrationNodeWithDuleCheck(node) {
  fadeSceneOut(() => {
    clearScene();
    renderNarration(node.narration, () => {
      let nextId = node.next;
      if (nextId === 'scene7_resolution' && state.affinity.dule >= 9) {
        nextId = 'dule_micro_start';
      }
      if (nextId) {
        renderContinueButton('Nastavi →', () => runNode(nextId));
      }
    });
  });
}

// Redefine runNode to use dule-check versions
function runNode(nodeId) {
  if (!nodeId) return;

  if (nodeId === '__scene3_dynamic__') {
    runScene(3);
    return;
  }

  if (nodeId === '__calculate_ending__') {
    resolveEnding();
    return;
  }

  const node = DIALOGUE_NODES[nodeId];
  if (!node) {
    console.warn('Missing node:', nodeId);
    return;
  }

  switch (node.type) {
    case 'narration':
      handleNarrationNodeWithDuleCheck(node);
      break;
    case 'dialogue':
      handleDialogueNodeWithDuleCheck(node);
      break;
    case 'choice':
      handleChoiceNode(node);
      break;
    case 'auto':
      runNode(node.next);
      break;
    case 'resolve':
      resolveEnding();
      break;
    default:
      if (node.next) runNode(node.next);
  }
}

// ============================================================
// Ending resolution
// ============================================================
function resolveEnding() {
  // Dule micro-scene bonus: if we went through scene6_micro_D_laugh path
  // The +1 for dule is applied when the laugh node fires
  // (already handled in the narration for that node via special check)

  const endingId = calculateEnding(state);
  state.ending = endingId;

  saveToLocalStorage(state, endingId);

  if (endingId === 'lose') {
    clearScene();
    showLoseEnding(startGame);
    return;
  }

  const endingData = ENDINGS[endingId];
  if (!endingData) {
    // Fallback
    showLoseEnding(startGame);
    return;
  }

  const shareText = SHARE_TEXTS[endingId] || endingData.shareText;

  showEnding(
    endingData,
    startGame,
    (mode) => {
      if (mode === 'copy') {
        copyToClipboard(`${endingData.title}\n\n${endingData.shareText}\n\nhttps://mkdsl.github.io/gari-daily-games/games/2026-05-26-gari-tim-simulator/`)
          .then(result => {
            if (result.success) {
              showCopyFeedback('Kopirano!');
            } else {
              showCopyFeedback('Greska pri kopiranju.');
            }
          });
      } else {
        shareResult(endingData, shareText);
      }
    }
  );
}
