/** @module main — Entry point, game loop wire, layer switch (macro/micro/meta) */

import { CONFIG } from './config.js';
import {
  createMacroState, createMicroState, createMetaState,
  loadMacroState, loadMetaState, saveMacroState, saveMetaState
} from './state.js';
import { initInput } from './input.js';
import { initCanvases, render } from './render.js';
import {
  showScreen, renderMacroScreen, renderMicroScreen,
  renderVictoryScreen, renderPrestigeScreen, showLoadingScreen,
  showCoordinatorDialog, updateBPMCueText
} from './ui.js';
import { initIncidentModal, setOnResolveCallback } from './rendering/incident_modal.js';
import { updateMacroHUD, showTextCue } from './rendering/hud_renderer.js';
import { recordFrame } from './systems/performance_monitor.js';
import { initMicroEvent, updateMicro } from './systems/micro_engine.js';
import { initSeed } from './systems/crowd_spawner.js';
import { getCurrentCityInfo, advanceToNextCity, initCityMacro, checkTourVictory } from './systems/macro_engine.js';
import { calculateCarryOverBuzz, getBuzzSatisfactionBonus, injectCarryOverGuests } from './systems/carry_over.js';
import { calculateFinalSatisfaction } from './systems/satisfaction_tracker.js';
import { checkAchievements, checkCareerTierUpgrade, checkUnlockConditions } from './systems/progression.js';
import { executePrestige, canPrestige } from './systems/prestige_manager.js';
import { computeUpgradeEffects } from './systems/upgrade_manager.js';
import { createDefaultZones } from './entities/zone.js';
import { AudioAPI } from './audio.js';
import { shareResult } from './share.js';
import { randomAforizam } from './content/aforizmi.js';
import { COORDINATORS } from './content/coordinators_data.js';
import { getBPMRange } from './systems/bpm_controller.js';

// ─────────────────────────────────────────
// GAME STATE
// ─────────────────────────────────────────

let meta = loadMetaState();
let macro = loadMacroState(meta.career_tier);
let micro = createMicroState();
let layer = 'macro';  // 'macro' | 'micro' | 'meta'

let lastSaveTimer = 0;
let lastTime = null;
let _upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);

// Shared game state object passed to input system
const gameState = {
  get macro() { return macro; },
  get micro() { return micro; },
  get meta() { return meta; },
  get _upgradeEffects() { return _upgradeEffects; },
  onStartEvent,
  onMacroAction,
  onPrestige,
  onShare,
};

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────

function init() {
  showLoadingScreen(randomAforizam());

  initCanvases();
  initInput(gameState);
  initIncidentModal();

  setOnResolveCallback((outcome) => {
    if (outcome) showTextCue(outcome, '#ffb830');
  });

  // Start on macro screen after brief loading delay
  setTimeout(() => {
    showScreen('macro');
    layer = 'macro';
    renderMacroScreen(macro, meta);

    // Check pending dialog from previous session
    if (macro._pendingDialog) {
      const dialog = macro._pendingDialog;
      const coordData = COORDINATORS[dialog.coordId];
      if (coordData) {
        const d = coordData.dialogs?.find(d => d.trigger === dialog.trigger) || coordData.dialog;
        if (d) showCoordinatorDialog(coordData.name, d.text, coordData.portraitColor);
      }
      macro._pendingDialog = null;
    }

    requestAnimationFrame(gameLoop);
  }, 600);
}

// ─────────────────────────────────────────
// GAME LOOP
// ─────────────────────────────────────────

function gameLoop(now) {
  requestAnimationFrame(gameLoop);

  const dt = lastTime === null ? 0 : Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  recordFrame(now);

  if (layer === 'macro') {
    render('macro', macro, micro, meta, now);
    // Periodic macro UI refresh (every 500ms)
    renderMacroScreen(macro, meta);
  }

  if (layer === 'micro') {
    // Update micro systems
    const result = updateMicro(micro, macro, meta, dt, now);
    render('micro', macro, micro, meta, now);
    renderMicroScreen(micro, macro, meta);

    // BPM cue text
    const bpmRange = getBPMRange(micro.current_bpm, _upgradeEffects);
    if (Math.random() < 0.003) updateBPMCueText(micro.current_bpm, bpmRange);

    if (result.eventEnded) {
      onEventEnd();
    }
  }

  // Auto-save every 15s
  lastSaveTimer += dt;
  if (lastSaveTimer >= CONFIG.SAVE_INTERVAL_SEC) {
    lastSaveTimer = 0;
    saveMacroState(macro);
    saveMetaState(meta);
  }
}

// ─────────────────────────────────────────
// EVENT HANDLERS
// ─────────────────────────────────────────

/**
 * Start event for current city
 */
function onStartEvent() {
  const { cityId, venueCapacity, buzz, upgradeEffects } = getCurrentCityInfo(macro);

  // Calculate carry-over from previous city
  let carryOverBuzz = 0;
  let startingBonus = 0;
  if (macro.event_results.length > 0) {
    const lastResult = macro.event_results[macro.event_results.length - 1];
    carryOverBuzz = calculateCarryOverBuzz(lastResult.satisfactionScore, upgradeEffects,
      macro.active_coordinators.some(c => c.activeAbility === 'guncati_koren'));
    startingBonus = getBuzzSatisfactionBonus(carryOverBuzz, upgradeEffects, meta.veteran_insights);

    if (carryOverBuzz > 0) {
      AudioAPI.onCarryOverGuests(carryOverBuzz);
      showTextCue(`Carry-over gosti! +${Math.round(startingBonus)}% satisfaction bonus`, '#ffb830');
    }
  }

  // Add city buzz to starting bonus
  startingBonus += buzz * CONFIG.SATISFACTION_BONUS_FROM_BUZZ;

  // Init procedural seed
  const dayUnix = Math.floor(Date.now() / 86400000);
  const tierIdx = CONFIG.CAREER_TIERS.indexOf(meta.career_tier);
  const cityIdx = macro.current_city_index;
  initSeed(dayUnix, tierIdx, cityIdx);

  // Create zone instances
  const microCanvas = document.getElementById('micro-canvas');
  const w = microCanvas ? microCanvas.getBoundingClientRect().width : 600;
  const h = microCanvas ? microCanvas.getBoundingClientRect().height : 400;
  const zones = createDefaultZones(venueCapacity, w, h);

  // Init micro event
  micro = createMicroState();
  micro._startingBonus = startingBonus;
  injectCarryOverGuests(carryOverBuzz, venueCapacity, micro);
  initMicroEvent(micro, macro, meta, cityId, zones, venueCapacity, carryOverBuzz);

  // Update upgrade effects
  _upgradeEffects = upgradeEffects;
  gameState._upgradeEffects = upgradeEffects;

  // Switch to micro layer
  layer = 'micro';
  showScreen('micro');

  // Coordinator dialogs
  initCityMacro(macro, meta, micro);
  if (macro._pendingDialog) {
    const d = macro._pendingDialog;
    const coordData = COORDINATORS[d.coordId];
    if (coordData) {
      const dialog = coordData.dialogs?.find(dl => dl.trigger === d.trigger) || coordData.dialog;
      if (dialog) setTimeout(() => showCoordinatorDialog(coordData.name, dialog.text, coordData.portraitColor), 1000);
    }
    macro._pendingDialog = null;
  }
}

/**
 * Called when micro event ends
 */
function onEventEnd() {
  const startingBonus = micro._startingBonus || 0;
  const finalSatisfaction = calculateFinalSatisfaction(micro, startingBonus, _upgradeEffects);

  AudioAPI.onEventEnd(finalSatisfaction);

  // Apply result
  advanceToNextCity(macro, meta, finalSatisfaction);

  // Check achievements + tier upgrades
  checkAchievements(meta, macro, micro);
  checkCareerTierUpgrade(macro, meta);
  checkUnlockConditions(macro, meta);

  // Save
  saveMacroState(macro);
  saveMetaState(meta);

  // Check tour victory
  const { won, avalaScore, isGrandFinale } = checkTourVictory(macro);

  if (won) {
    layer = 'macro';
    showScreen('victory');
    renderVictoryScreen(macro, meta);
    return;
  }

  // Show result banner then return to macro
  showTextCue(
    `${CITIES_NAMES[macro.city_order[macro.current_city_index - 1]] || 'Event'}: ${Math.round(finalSatisfaction)}% satisfaction`,
    finalSatisfaction >= 70 ? '#4a7c59' : '#ff4444'
  );

  setTimeout(() => {
    layer = 'macro';
    showScreen('macro');
    renderMacroScreen(macro, meta);
  }, 2000);
}

/** Simple city name lookup for cue text */
const CITIES_NAMES = { nis: 'Niš', sarajevo: 'Sarajevo', strand: 'Štrand', guncati: 'Guncati', avala: 'Avala' };

/**
 * Handle macro action callbacks from input.js
 */
function onMacroAction(action, param) {
  _upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);
  renderMacroScreen(macro, meta);
}

/**
 * Trigger prestige reset
 */
function onPrestige() {
  if (!canPrestige(macro, meta)) return;
  showScreen('prestige');
  renderPrestigeScreen(meta, (selectedInsights) => {
    executePrestige(macro, meta, selectedInsights, createMacroState);
    saveMacroState(macro);
    saveMetaState(meta);
    _upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);
    layer = 'macro';
    showScreen('macro');
    renderMacroScreen(macro, meta);
  });
}

/**
 * Trigger share flow
 */
async function onShare() {
  await shareResult(macro, meta);
}

// ─────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
