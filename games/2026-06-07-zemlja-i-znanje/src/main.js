/**
 * main.js — Bootstrap, screen manager, wire sve module
 * Entry point za "Zemlja i Znanje"
 */

import { bus, EVT } from './events.js';
import { initRenderer, renderFrame, setRenderState } from './render.js';
import { initInput } from './input.js';
import { initAudio, playSound } from './audio.js';
import { initUI, showStartScreen, showSeasonSummary, showMetaScreen, showGuidedEndMessage, showToast } from './ui.js';
import { initMeta, getMetaState, saveMetaState, updateReputation, getTotalSessions, isGuidedModeActive, incrementTotalSessions, addTotalParticipants } from './meta/meta-state.js';
import { initMacro, getMacroState, saveMacroState, startNewSeason, completeSeason, setCurrentReputation } from './macro/macro-state.js';
import { mountPlanningUI } from './macro/planning-ui.js';
import { initSession, getMicroState, saveMicroState, clearMicroState } from './micro/session-state.js';
import { mountSessionUI, unmountSessionUI } from './micro/session-ui.js';
import { startSessionRunner, stopSessionRunner } from './micro/session-runner.js';
import { collectFeedback } from './micro/feedback-collector.js';
import { calcRepGain } from './meta/reputation.js';
import { processUnlocks } from './meta/unlock-manager.js';
import { checkSessionAchievements, checkRepAchievements } from './meta/achievements.js';
import { buildSeasonSummary } from './macro/season-summary.js';
import { saveResult, startAutoSave, stopAutoSave, registerAutoResolve, clearMicro } from './save.js';
import { generateApplicantPool, selectParticipants } from './macro/applicant-pool.js';
import { rollWeather, getCurrentSeason as getWeatherSeason } from './macro/weather.js';
import { getWeather } from './macro/weather.js';
import { checkAndUnlock } from './meta/achievements.js';
import { ACHIEVEMENT_IDS, GUIDED_MODE_MAX_SESSIONS } from './config.js';
import { clearEl, el } from './utils.js';

// === DOM ELEMENTS ===
const canvas = document.getElementById('game-canvas');
const uiOverlay = document.getElementById('ui-overlay');

// Main screen container (outside canvas)
let _mainScreenDiv = null;

// === GAME STATE ===
let _screen = 'start'; // 'start' | 'planning' | 'session' | 'season_summary' | 'meta'
let _renderLoop = null;
let _lastTimestamp = 0;

// === INIT ===
async function init() {
  // Resize canvas
  function resize() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth || 800;
    canvas.height = container.clientHeight || 500;
  }
  resize();
  window.addEventListener('resize', resize);

  // Get/create main screen div (sibling to canvas)
  _mainScreenDiv = el('#main-screen');
  if (!_mainScreenDiv) {
    _mainScreenDiv = document.createElement('div');
    _mainScreenDiv.id = 'main-screen';
    canvas.parentElement.appendChild(_mainScreenDiv);
  }

  // Init subsystems
  initRenderer(canvas);
  initInput(canvas);
  initAudio();
  initUI(uiOverlay, _mainScreenDiv);

  // Init meta + macro
  const meta = initMeta();
  const macro = initMacro(meta);
  setCurrentReputation(meta.reputation || 0);

  // Register auto-resolve for browser close
  registerAutoResolve(getMicroState, (result) => {
    console.log('[auto-resolve]', result);
  });

  // Bus: screen changes from sub-modules
  bus.on(EVT.SCREEN_CHANGE, ({ screen, data }) => navigateTo(screen, data));

  // Bus: session end
  bus.on(EVT.SESSION_END, ({ result, repGained }) => onSessionEnd(result, repGained));

  // Bus: planning confirmed
  bus.on(EVT.MACRO_PLAN_CONFIRM, (planData) => onPlanConfirmed(planData));

  // Start render loop
  startRenderLoop();

  // Navigate to start
  navigateTo('start');
}

// === NAVIGATION ===
function navigateTo(screen, data = {}) {
  _screen = screen;
  const meta = getMetaState();
  const macro = getMacroState();

  // Unmount session if leaving
  if (screen !== 'session') {
    unmountSessionUI();
    stopSessionRunner();
  }

  switch (screen) {
    case 'start':
      showStartScreen(_mainScreenDiv);
      bindStartScreenEvents();
      break;

    case 'planning':
      clearEl(_mainScreenDiv);
      _mainScreenDiv.className = 'screen planning-screen-wrap';
      mountPlanningUI(_mainScreenDiv, meta, macro);
      break;

    case 'session':
      clearEl(_mainScreenDiv);
      _mainScreenDiv.className = 'screen hidden'; // hide main, session runs via overlay

      if (!macro.participants || !macro.participants.length) {
        showToast('Nema polaznika — vrati se u planning.', 'warning');
        navigateTo('planning');
        return;
      }

      // Init session
      const micro = initSession(
        macro.sessionPlan,
        macro.participants,
        macro.weatherForecast || 'sunny',
        macro.hiredStaff || [],
        macro.selectedTema || 'suvozid',
        isGuidedModeActive()
      );

      // Set render state
      setRenderState(micro, macro, meta);

      // Mount session UI
      mountSessionUI(uiOverlay, micro, macro, meta);

      // Start runner
      startSessionRunner(macro, meta);

      // Auto-save setup
      startAutoSave(getMacroState, getMicroState, 30000, 10000);

      bus.emit(EVT.AUDIO_AMBIENT_START);
      break;

    case 'season_summary':
      clearEl(_mainScreenDiv);
      _mainScreenDiv.className = 'screen';

      const lastResult = data.result || {};
      const repGained = data.repGained || 0;
      const prevRep = meta.reputation;
      const newRep = Math.min(1000, prevRep + repGained);

      const summary = buildSeasonSummary({
        sessionResults: [lastResult],
        income: lastResult.income || 0,
        costs: lastResult.costs || 0,
        repGained,
        prevRep,
        newRep,
        achievementsUnlocked: data.achievementsUnlocked || [],
        carryover: macro.carryoverBudget || 0
      });

      showSeasonSummary(_mainScreenDiv, summary, meta, macro);
      bindSeasonSummaryEvents();
      break;

    case 'meta':
      clearEl(_mainScreenDiv);
      _mainScreenDiv.className = 'screen';
      showMetaScreen(_mainScreenDiv, meta, macro);
      break;
  }
}

function bindStartScreenEvents() {
  const btnNew = el('#btn-new-game', _mainScreenDiv);
  const btnContinue = el('#btn-continue-game', _mainScreenDiv);

  if (btnNew) btnNew.addEventListener('click', () => {
    bus.emit(EVT.AUDIO_PLAY, { sound: 'ui_click' });
    navigateTo('planning');
  });

  if (btnContinue) {
    // Check for saved game
    const meta = getMetaState();
    if (!meta || meta.totalSessions === 0) {
      btnContinue.disabled = true;
      btnContinue.style.opacity = '0.5';
    } else {
      btnContinue.addEventListener('click', () => navigateTo('planning'));
    }
  }
}

function bindSeasonSummaryEvents() {
  const btnNext = el('#btn-next-season', _mainScreenDiv);
  const btnMeta = el('#btn-view-meta', _mainScreenDiv);

  if (btnNext) btnNext.addEventListener('click', () => {
    navigateTo('planning');
  });

  if (btnMeta) btnMeta.addEventListener('click', () => {
    navigateTo('meta');
  });
}

// === PLANNING CONFIRMED → START SESSION ===
function onPlanConfirmed(planData) {
  const meta = getMetaState();
  const macro = getMacroState();

  // Select actual participants
  const selected = selectParticipants(planData.candidates, planData.participantCount);

  // Start season in macro
  startNewSeason({
    tema: planData.tema,
    participantCount: planData.participantCount,
    days: planData.days,
    hiredStaff: planData.hiredStaff,
    sessionPlan: planData.plan
  });

  // Update macro with selected participants and weather
  macro.participants = selected;
  macro.weatherForecast = planData.weather;
  macro.hiredStaff = planData.hiredStaff;

  saveMacroState();
  navigateTo('session');
}

// === SESSION END ===
function onSessionEnd(result, repGained) {
  const meta = getMetaState();
  const macro = getMacroState();

  stopAutoSave();
  clearMicro(); // clear temp state
  setRenderState(null, macro, meta);

  // Update meta
  const prevRep = meta.reputation;
  updateReputation(repGained);
  const newRep = meta.reputation;

  incrementTotalSessions();
  addTotalParticipants(result.participantsFinished || 0);

  // Process unlocks
  const newUnlocks = processUnlocks(prevRep, newRep);

  // Check achievements
  const unlockedAch = checkSessionAchievements(result, meta);
  checkRepAchievements(newRep);

  // Guided mode: check if done
  if (meta.totalSessions === GUIDED_MODE_MAX_SESSIONS) {
    if (!meta.shownGuidedEnd) {
      meta.shownGuidedEnd = true;
      showGuidedEndMessage(uiOverlay);
    }
  }

  // Save result
  saveResult(result);
  saveMetaState();
  saveMacroState();

  // Navigate to season summary
  navigateTo('season_summary', { result, repGained, achievementsUnlocked: unlockedAch });
}

// === RENDER LOOP ===
function startRenderLoop() {
  let lastTs = performance.now();

  function frame(ts) {
    const delta = Math.min(ts - lastTs, 100);
    lastTs = ts;

    renderFrame(ts, delta);
    _renderLoop = requestAnimationFrame(frame);
  }

  _renderLoop = requestAnimationFrame(frame);
}

// === BOOT ===
init().catch(err => {
  console.error('[main] Init failed:', err);
  document.body.innerHTML = `<div style="color:#cc3333;padding:40px;font-family:sans-serif;">
    <h2>Greška pri pokretanju igre</h2>
    <pre>${err.message}</pre>
    <button onclick="location.reload()">Pokušaj ponovo</button>
  </div>`;
});
