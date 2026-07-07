/**
 * DialogEngine.js — Dialog tree parser and traversal engine
 * Processes dialogs.json nodes, applies effects, emits events
 * @module DialogEngine
 */

import EventBus, { EVENTS } from './EventBus.js';
import { applyEffects, checkRequirement } from './ResourceManager.js';
import { setFlag } from '../utils/FlagManager.js';
import GameState from '../utils/GameState.js';
import AchievementSystem from './AchievementSystem.js';
import Analytics from '../utils/Analytics.js';
import { autoSave } from '../utils/SaveSystem.js';

/** @type {object} All dialog nodes keyed by id */
let dialogNodes = {};

/** @type {string|null} Currently active dialog node id */
let currentNodeId = null;

/** @type {Function|null} Callback when dialog completes */
let onCompleteCallback = null;

/**
 * Initialize with dialogs.json data
 * @param {object} data - { nodes: {...} }
 */
export function init(data) {
  dialogNodes = data.nodes ?? {};
}

/**
 * Start a dialog by node id
 * @param {string} nodeId
 * @param {Function} [onComplete] - Called when dialog tree ends
 */
export function startDialog(nodeId, onComplete) {
  onCompleteCallback = onComplete ?? null;
  showNode(nodeId);
}

/**
 * Show a specific dialog node
 * @param {string} nodeId
 */
function showNode(nodeId) {
  const node = dialogNodes[nodeId];
  if (!node) {
    console.error(`[DialogEngine] Node not found: ${nodeId}`);
    endDialog();
    return;
  }

  currentNodeId = nodeId;
  GameState.setDialogNode(nodeId);

  // Build choices with requirement check
  const choices = (node.choices ?? []).map(choice => {
    const req = checkRequirement(choice.requires);
    return {
      ...choice,
      available: req.ok,
      disabledReason: req.reason
    };
  });

  EventBus.emit(EVENTS.DIALOG_NODE, {
    node: { ...node },
    choices,
    nodeId
  });
}

/**
 * Player selects a choice
 * @param {string} choiceId
 */
export function selectChoice(choiceId) {
  const node = dialogNodes[currentNodeId];
  if (!node) return;

  const choice = node.choices?.find(c => c.id === choiceId);
  if (!choice) {
    console.warn(`[DialogEngine] Choice not found: ${choiceId} in node ${currentNodeId}`);
    return;
  }

  // Check requirement again (defensive)
  const req = checkRequirement(choice.requires);
  if (!req.ok) {
    EventBus.emit(EVENTS.UI_TOAST_SHOW, {
      type: 'warning',
      title: 'Nije moguće',
      message: req.reason,
      duration: 2000
    });
    return;
  }

  // Log choice
  Analytics.logChoice(GameState.raw().currentScene, choiceId, choice.effects);

  EventBus.emit(EVENTS.DIALOG_CHOICE_SELECT, {
    nodeId: currentNodeId,
    choiceId,
    choice
  });

  // Apply effects
  if (choice.effects) {
    applyEffects(choice.effects);

    // Handle flag_set inside effects
    if (choice.effects.flag_set) {
      setFlag(choice.effects.flag_set, true);
    }
  }

  // Handle achievement triggers
  if (choice.achievement) {
    AchievementSystem.checkTrigger(choice.achievement);
  }
  if (choice.achievement_hidden) {
    AchievementSystem.checkTrigger(choice.achievement_hidden);
  }

  // Auto-save after choice
  autoSave();

  // Determine next step
  if (choice.action === 'next_scene') {
    // Final choice in scene — let caller handle via onComplete
    const sceneId = GameState.raw().currentScene;
    endDialog(choice.action, sceneId);
    return;
  }

  if (choice.action === 'ending') {
    endDialog('ending', null);
    return;
  }

  if (choice.next) {
    showNode(choice.next);
  } else {
    endDialog(null, null);
  }
}

/**
 * End current dialog
 * @param {string|null} action
 * @param {any} data
 */
function endDialog(action, data) {
  currentNodeId = null;
  EventBus.emit(EVENTS.DIALOG_END, { action, data });
  if (onCompleteCallback) {
    const cb = onCompleteCallback;
    onCompleteCallback = null;
    cb(action, data);
  }
}

/**
 * Get current node id
 * @returns {string|null}
 */
export function getCurrentNodeId() {
  return currentNodeId;
}

/**
 * Check if dialog is active
 * @returns {boolean}
 */
export function isActive() {
  return currentNodeId !== null;
}

/**
 * Get node by id (for preview/debug)
 * @param {string} nodeId
 * @returns {object|null}
 */
export function getNode(nodeId) {
  return dialogNodes[nodeId] ?? null;
}

export default { init, startDialog, selectChoice, getCurrentNodeId, isActive, getNode };
