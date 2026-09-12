/**
 * main.js — Entry point, wire sve module, game loop
 */

import { HOURS, ATMOSPHERE } from './config.js';
import {
  createInitialState, loadState, saveState, clearState,
  computeCS, currentHour, loadPrestige, loadAchievements
} from './state.js';
import { applyDelta, formatDeltaDisplay } from './systems/resource_manager.js';
import { getOrderedNodesForHour } from './systems/event_selector.js';
import { getOptionsForNode, isLastHour as isLastHourIdx } from './systems/decision_engine.js';
import { markNodeSeen, recordChoice, trackTomaChoice, trackHelpUsage } from './systems/narrative_state.js';
import { detectEnding } from './systems/endings.js';
import { checkEndgameAchievements, unlockMidgameAchievement } from './systems/achievements.js';
import { unlockPrestige, isPrestigeUnlocked, startPrestigeRun, prestigeBonus } from './systems/prestige.js';
import { getCurrentHour, advanceHour, progressRatio, hoursLeft, formatHour } from './systems/timer.js';
import { setAtmosphere, initAtmosphere } from './atmosphere.js';
import { hourTransition, fadeIn, slideUp } from './transitions.js';
import { initAudio, startAmbient, sfxClick, sfxGain, sfxLoss, sfxEndingSwell, sfxAchievement, setMuted, isMuted } from './audio.js';
import { renderDecisionCard, renderHUD, renderChoiceResult, renderDeltaDisplay, renderHourHeader, renderProgress, flashResourceBars } from './render.js';
import {
  showIntroScreen, showEndingScreen, showScreen, updateHUD, updateCS,
  showHourTransition, updateMuteButton, showAchievementNotification, showShareToast
} from './ui.js';
import { shareResult } from './share.js';
import { hourIntroText, hourTransitionText, optionReaction } from './content/dialogue.js';
import { locationByHour } from './entities/location.js';
import { INTRO_TEXT } from './entities/organizer.js';

// ── State ────────────────────────────────────────────────────────
let state = null;
let currentNodes = [];
let currentNodeIndex = 0;
let audioStarted = false;

// ── DOM refs ─────────────────────────────────────────────────────
const gameArea = document.getElementById('game-area');
const hudEl = document.getElementById('hud');
const progressFill = document.getElementById('progress-fill');
const hourLabelEl = document.getElementById('hour-label');
const introTextEl = document.querySelector('.intro-text');

// ── Boot ─────────────────────────────────────────────────────────
function boot() {
  const savedState = loadState();
  const prestigeInfo = loadPrestige();

  if (savedState && !savedState.gameOver) {
    // Resume
    state = savedState;
    startGame(false);
  } else {
    // Show intro
    showIntroScreen(INTRO_TEXT, isPrestigeUnlocked(), (isPrestige) => {
      if (isPrestige) {
        startPrestigeRun();
        state = createInitialState(true);
      } else {
        clearState();
        state = createInitialState(false);
      }
      startGame(true);
    });
  }

  // Mute button
  const muteBtn = document.getElementById('btn-mute');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const nowMuted = !isMuted();
      setMuted(nowMuted);
      updateMuteButton(nowMuted);
      if (!nowMuted && audioStarted) {
        startAmbient(getCurrentHour(state));
      }
    });
    updateMuteButton(isMuted());
  }

  // First user interaction → init audio
  document.addEventListener('click', onFirstClick, { once: true });
  document.addEventListener('keydown', onFirstClick, { once: true });
  document.addEventListener('touchstart', onFirstClick, { once: true });
}

function onFirstClick() {
  if (!audioStarted) {
    initAudio();
    audioStarted = true;
    if (state && !isMuted()) {
      startAmbient(getCurrentHour(state));
    }
  }
}

// ── Game Start ───────────────────────────────────────────────────
function startGame(fresh) {
  showScreen('screen-game');
  initAtmosphere(getCurrentHour(state));
  updateHUD(state.resources);
  updateCS(computeCS(state));
  renderProgressBar();

  if (fresh) {
    loadCurrentHourNodes();
  } else {
    // Resume: rebuild node list for current hour
    loadCurrentHourNodes();
  }
}

// ── Hour Management ──────────────────────────────────────────────
function loadCurrentHourNodes() {
  const hour = getCurrentHour(state);
  currentNodes = getOrderedNodesForHour(hour, state.isPrestige, state.seenNodes);
  currentNodeIndex = 0;

  // Update hour label
  if (hourLabelEl) hourLabelEl.textContent = formatHour(hour);

  // Update atmosphere
  setAtmosphere(hour);

  // Audio
  if (audioStarted && !isMuted()) {
    startAmbient(hour);
  }

  showNextNode();
}

function showNextNode() {
  if (currentNodeIndex >= currentNodes.length) {
    // Svi nodovi za ovaj sat završeni — idi na sledeći sat
    advanceToNextHour();
    return;
  }

  const node = currentNodes[currentNodeIndex];

  // Mark as seen
  markNodeSeen(state, node.id);

  const options = getOptionsForNode(node, state.resources);
  const card = renderDecisionCard(node, options, onOptionChosen, state.isPrestige);

  // Renderuj u game area
  if (gameArea) {
    gameArea.innerHTML = '';

    // Hour header
    const hour = getCurrentHour(state);
    const loc = locationByHour(hour);
    const atmLabel = ATMOSPHERE[hour]?.label || '';
    const header = renderHourHeader(hour, loc.name, atmLabel);
    gameArea.appendChild(header);

    // Intro text za sat (samo na prvom nodu u satu)
    if (currentNodeIndex === 0) {
      const introEl = document.createElement('p');
      introEl.className = 'hour-intro';
      introEl.textContent = hourIntroText(hour);
      gameArea.appendChild(introEl);
    }

    gameArea.appendChild(card);
    slideUp(card);
  }

  saveState(state);
}

// ── Option chosen ────────────────────────────────────────────────
async function onOptionChosen(option) {
  sfxClick();

  // Primeni delta
  const actualDelta = applyDelta(state.resources, option.delta);

  // Sound effects za resurse
  const hasGain = Object.values(actualDelta).some(v => v > 0);
  const hasLoss = Object.entries(actualDelta).some(([k, v]) => {
    // Za nered, povećanje je "loss" iz igrač perspektive
    return k === 'nered' ? v > 0 : v < 0;
  });
  if (hasGain) sfxGain();
  if (hasLoss) setTimeout(() => sfxLoss(), 80);

  // Flash bars
  flashResourceBars(actualDelta, hudEl);

  // Update HUD
  updateHUD(state.resources);
  updateCS(computeCS(state));

  // Record choice
  recordChoice(state, option.id);
  trackTomaChoice(state, option);
  trackHelpUsage(state, option);

  // Midgame achievements
  if (option.achievement) {
    unlockMidgameAchievement(state, option.achievement);
    sfxAchievement();
    showAchievementNotification(option.achievement);
  }

  // Prikaži result
  if (gameArea) {
    const card = gameArea.querySelector('.decision-card');
    if (card) {
      // Disable all options
      card.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
      });
      // Highlight chosen
      const chosenBtn = card.querySelector(`[data-option-id="${option.id}"]`);
      if (chosenBtn) {
        chosenBtn.style.opacity = '1';
        chosenBtn.classList.add('option-chosen');
      }

      // Reaction text
      const reaction = optionReaction(option.id);
      const resultEl = renderChoiceResult(option.text, reaction);

      // Delta display
      const deltaItems = formatDeltaDisplay(actualDelta);
      if (deltaItems.length > 0) {
        const deltaEl = renderDeltaDisplay(deltaItems);
        resultEl.appendChild(deltaEl);
      }

      card.appendChild(resultEl);

      // Continue button
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn-continue';
      continueBtn.textContent = 'Nastavi →';
      continueBtn.addEventListener('click', () => {
        currentNodeIndex++;
        showNextNode();
      });
      card.appendChild(continueBtn);
    }
  }

  saveState(state);
}

// ── Hour advance ─────────────────────────────────────────────────
function advanceToNextHour() {
  const currentH = getCurrentHour(state);

  if (isLastHourIdx(state.currentHourIndex)) {
    // Kraj igre
    endGame();
    return;
  }

  const nextH = HOURS[state.currentHourIndex + 1];
  const transText = hourTransitionText(currentH, nextH);

  showHourTransition(currentH, nextH, transText, () => {
    advanceHour(state);
    renderProgressBar();
    loadCurrentHourNodes();
  });
}

// ── End game ─────────────────────────────────────────────────────
function endGame() {
  sfxEndingSwell();
  state.gameOver = true;

  const ending = detectEnding(state);
  state.endingId = ending.id;

  if (ending.prestigeUnlock) {
    unlockPrestige();
  }

  const newAchievements = checkEndgameAchievements(state, ending.id);
  newAchievements.forEach(id => {
    sfxAchievement();
    showAchievementNotification(id);
  });

  saveState(state);

  setTimeout(() => {
    showEndingScreen(
      state,
      ending.id,
      newAchievements,
      async () => {
        const result = await shareResult(state, ending.id);
        showShareToast(result.method || 'clipboard');
      },
      () => {
        clearState();
        state = null;
        window.location.reload();
      }
    );
  }, 500);
}

// ── Utils ────────────────────────────────────────────────────────
function renderProgressBar() {
  if (!progressFill) return;
  const ratio = progressRatio(state);
  renderProgress(ratio, progressFill);

  // Hour label
  if (hourLabelEl) hourLabelEl.textContent = formatHour(getCurrentHour(state));
}

// ── Start ────────────────────────────────────────────────────────
boot();
