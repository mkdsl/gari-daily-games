/**
 * session-runner.js — Glavna petlja sesije
 * Clock tick, aktivnost switch, incident spawn, end condition
 */

import { bus, EVT } from '../events.js';
import {
  getMicroState, tickClock, pauseSession as pauseMicro,
  resumeSession as resumeMicro, setSpeed, getCurrentActivity,
  getSessionHour, getTimeContext, saveMicroState
} from './session-state.js';
import { processIncidentQueue } from './incident-queue.js';
import { updateParticipants, getPresentCount } from './participant-manager.js';
import { applyInstructorPassiveBonuses } from './instructor-ai.js';
import { updateModuleProgress } from './module-progress.js';
import { updateSessionUI } from './session-ui.js';
import { collectFeedback, renderEvaluationScreen } from './feedback-collector.js';
import { calcGroupSatisfaction } from './satisfaction-calc.js';
import { updateSatisfactionSample } from './session-state.js';
import { getWeather, getWeatherEnergyMod } from '../macro/weather.js';
import { ACTIVITY_TYPES, MICRO_SAVE_INTERVAL_SECONDS } from '../config.js';
import { el, clearEl } from '../utils.js';

let _running = false;
let _lastTimestamp = 0;
let _animFrame = null;
let _realSecondsAccumulated = 0;
let _autoSaveTimer = 0;
let _macroStateRef = null;
let _metaStateRef = null;

/**
 * Pokreće sesiju
 */
export function startSessionRunner(macroState, metaState) {
  if (_running) return;
  _running = true;
  _macroStateRef = macroState;
  _metaStateRef = metaState;
  _lastTimestamp = performance.now();
  _realSecondsAccumulated = 0;

  bus.emit(EVT.SESSION_START, { tema: getMicroState()?.tema });
  bus.emit(EVT.AUDIO_AMBIENT_START);

  _animFrame = requestAnimationFrame(loop);
}

function loop(timestamp) {
  if (!_running) return;

  const deltaMs = Math.min(timestamp - _lastTimestamp, 200); // cap at 200ms
  _lastTimestamp = timestamp;

  const micro = getMicroState();
  if (!micro) return;

  if (!micro.isPaused && !micro.sessionEnded) {
    const speed = micro.speed || 1;
    const realDeltaSec = deltaMs / 1000;
    _realSecondsAccumulated += realDeltaSec;

    // Tick game clock
    const { minutesElapsed, slotChanged, newSlot } = tickClock(deltaMs, speed);

    // Update participant states
    const activity = getCurrentActivity();
    const weather = getWeather(micro.weather);
    const weatherEnergyMod = weather.energy_mod;
    const weatherOutdoorBonus = weather.outdoor_bonus;
    const hasCana = (_macroStateRef?.hiredStaff || []).includes('cana');

    updateParticipants(micro.participantStates, activity, minutesElapsed, {
      staff: _macroStateRef?.hiredStaff || [],
      weather: micro.weather,
      hasCana,
      weatherEnergyMod,
      weatherOutdoorBonus,
      sessionHour: getSessionHour()
    });

    // Instructor passive bonuses
    applyInstructorPassiveBonuses(micro.participantStates, _macroStateRef?.hiredStaff || [], activity);

    // Module progress
    if (!micro.moduleProgress) micro.moduleProgress = {};
    updateModuleProgress(micro.moduleProgress, activity, micro.currentSlot, minutesElapsed);

    // Sample satisfaction every 30 game minutes
    if (Math.floor(micro.gameMinute / 30) > Math.floor((micro.gameMinute - minutesElapsed) / 30)) {
      const groupSat = calcGroupSatisfaction(micro.participantStates);
      updateSatisfactionSample(groupSat);
    }

    // Slot change event
    if (slotChanged) {
      bus.emit(EVT.SESSION_SLOT_ADVANCE, { slot: newSlot, activity: activity });

      // Pauza slot — auto-pause and show effects
      const newActivity = micro.plan[newSlot]?.activity;
      if (newActivity === 'pauza') {
        bus.emit(EVT.AUDIO_PLAY, { sound: 'pauza_ambient' });
      }
    }

    // Incident check every real second
    if (_realSecondsAccumulated >= 1.0) {
      const timeContext = getTimeContext();
      processIncidentQueue(micro, _realSecondsAccumulated, {
        sessionHour: getSessionHour(),
        weatherMod: weather.incident_mod,
        participantStates: micro.participantStates,
        staff: _macroStateRef?.hiredStaff || [],
        tema: micro.tema,
        guidedActive: micro.guidedActive,
        currentActivity: activity
      });
      _realSecondsAccumulated = 0;
    }

    // Auto-save
    _autoSaveTimer += deltaMs / 1000;
    if (_autoSaveTimer >= MICRO_SAVE_INTERVAL_SECONDS) {
      _autoSaveTimer = 0;
      saveMicroState();
    }

    // Session end
    if (micro.sessionEnded) {
      endSession(micro);
      return;
    }

    // Rain check for render
    if (weather.rain) {
      bus.emit(EVT.RAIN_START);
    }
  }

  // Update UI
  updateSessionUI(micro, deltaMs);
  bus.emit(EVT.SESSION_TICK, { micro, deltaMs });

  _animFrame = requestAnimationFrame(loop);
}

function endSession(micro) {
  _running = false;
  if (_animFrame) cancelAnimationFrame(_animFrame);

  bus.emit(EVT.AUDIO_AMBIENT_STOP);
  bus.emit(EVT.AUDIO_PLAY, { sound: micro.participantStates && calcGroupSatisfaction(micro.participantStates) > 0.6 ? 'session_success' : 'session_fail' });

  const result = collectFeedback(micro);

  // Rep gain calculation
  const avgSat = result.avgSatisfaction;
  const satMod = getSatisfactionRepModifier(avgSat);
  const seasonMult = getSeasonMultiplier(_macroStateRef?.currentSeason || 1);
  const repGained = Math.round(result.participantsFinished * avgSat * 100 * satMod * seasonMult);

  bus.emit(EVT.SESSION_END, { result, repGained });

  // Show evaluation screen overlay
  showEvaluationOverlay(result, repGained);
}

function showEvaluationOverlay(result, repGained) {
  const overlay = el('#ui-overlay');
  if (!overlay) return;

  const evalEl = document.createElement('div');
  evalEl.id = 'evaluation-overlay';
  evalEl.className = 'evaluation-overlay';

  evalEl.innerHTML = `
    ${renderEvaluationScreen(result, repGained)}
    <button class="btn-primary btn-continue" id="btn-continue-after-session">
      Nastavi →
    </button>
  `;

  overlay.appendChild(evalEl);

  const btnContinue = el('#btn-continue-after-session', evalEl);
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      evalEl.parentNode?.removeChild(evalEl);
      bus.emit(EVT.SCREEN_CHANGE, { screen: 'season_summary' });
    });
  }

  // Particle confetti
  bus.emit(EVT.PARTICLE_CONFETTI, { x: 400, y: 250, count: 80 });
}

function getSatisfactionRepModifier(sat) {
  if (sat >= 0.95) return 1.5;
  if (sat >= 0.85) return 1.2;
  if (sat >= 0.75) return 1.0;
  if (sat >= 0.65) return 0.8;
  if (sat >= 0.50) return 0.5;
  return 0;
}

function getSeasonMultiplier(season) {
  const mults = [1.0, 1.2, 1.4, 1.6, 2.0];
  return mults[Math.min(season - 1, mults.length - 1)] || 1.0;
}

export function stopSessionRunner() {
  _running = false;
  if (_animFrame) cancelAnimationFrame(_animFrame);
}

export function isRunning() {
  return _running;
}

// Listen for speed changes
bus.on(EVT.SESSION_SPEED_CHANGE, ({ speed }) => {
  setSpeed(speed);
});

bus.on(EVT.SESSION_PAUSE, () => {
  pauseMicro();
});

bus.on(EVT.SESSION_RESUME, () => {
  resumeMicro();
});
