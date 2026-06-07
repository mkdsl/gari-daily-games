/**
 * session-state.js — Micro temp state (atomarna sesija)
 * Clock, aktivna aktivnost, incident queue
 */

import { createMicroState } from '../state.js';
import { saveMicro, loadMicro } from '../save.js';
import { SESSION_SLOTS, SESSION_TOTAL_MINUTES, SLOT_DURATION_MINUTES } from '../config.js';
import { createParticipantSessionState } from '../macro/participant-profiles.js';

let _micro = null;

export function initSession(plan, participants, weather, staff, tema, guidedActive = false) {
  // Check for interrupted session
  const saved = loadMicro();
  if (saved && !saved.sessionEnded) {
    _micro = saved;
    return _micro;
  }

  _micro = createMicroState(plan, participants, weather, staff, tema);
  _micro.guidedActive = guidedActive;

  // Init participant runtime states
  _micro.participantStates = participants.map((p, i) =>
    createParticipantSessionState(p)
  );

  return _micro;
}

export function getMicroState() {
  return _micro;
}

export function saveMicroState() {
  if (_micro) saveMicro(_micro);
}

export function clearMicroState() {
  _micro = null;
}

/**
 * Advance clock by realSeconds * speed
 * Returns minutes elapsed this tick
 */
export function tickClock(deltaMs, speed = 1) {
  if (!_micro || _micro.isPaused || _micro.sessionEnded) return 0;

  // 1 game minute = 1 real second at speed 1
  const minutesElapsed = (deltaMs / 1000) * speed;
  _micro.gameMinute = Math.min(
    SESSION_TOTAL_MINUTES,
    _micro.gameMinute + minutesElapsed
  );

  // Calculate current slot (0-7)
  const newSlot = Math.min(SESSION_SLOTS - 1, Math.floor(_micro.gameMinute / SLOT_DURATION_MINUTES));
  const slotChanged = newSlot !== _micro.currentSlot;
  if (slotChanged) {
    _micro.currentSlot = newSlot;
  }

  _micro.slotProgress = (_micro.gameMinute % SLOT_DURATION_MINUTES) / SLOT_DURATION_MINUTES;

  // Check session end
  if (_micro.gameMinute >= SESSION_TOTAL_MINUTES) {
    _micro.sessionEnded = true;
    _micro.endReason = 'completed';
  }

  return { minutesElapsed, slotChanged, newSlot, minute: _micro.gameMinute };
}

export function pauseSession() {
  if (_micro) _micro.isPaused = true;
}

export function resumeSession() {
  if (_micro) _micro.isPaused = false;
}

export function setSpeed(speed) {
  if (_micro) _micro.speed = speed;
}

export function getCurrentActivity() {
  if (!_micro) return null;
  const slot = _micro.plan[_micro.currentSlot];
  return slot ? slot.activity : null;
}

/**
 * Vraca session_hour (0-8) od gameMinute
 */
export function getSessionHour() {
  if (!_micro) return 0;
  return _micro.gameMinute / 60;
}

/**
 * Vraca time context za incident spawning
 */
export function getTimeContext() {
  const hour = getSessionHour();
  if (hour < 2) return 'jutro';
  if (hour < 5) return 'podne';
  return 'popodne';
}

/**
 * Vraca display time: "10:30"
 */
export function getDisplayTime() {
  if (!_micro) return '08:00';
  const totalMin = 8 * 60 + Math.floor(_micro.gameMinute);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function recordIncidentHistory(incident, optionIndex, effect) {
  if (!_micro) return;
  _micro.incidentHistory.push({
    incidentId: incident.id,
    optionIndex,
    effect,
    gameMinute: _micro.gameMinute
  });
  _micro.incidentCount++;
}

export function updateSatisfactionSample(avgSatisfaction) {
  if (!_micro) return;
  _micro.totalSatisfaction += avgSatisfaction;
  _micro.satisfactionSamples++;
}
