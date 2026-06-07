/**
 * timing-engine.js — Tajming mehanika, prozori za Q&A, pauzu, evaluaciju
 */

import { SESSION_SLOTS, SLOT_DURATION_MINUTES, REAL_SECONDS_PER_GAME_MINUTE } from '../config.js';

/**
 * Vraca slot na osnovu gameMinute
 */
export function getSlotIndex(gameMinute) {
  return Math.min(SESSION_SLOTS - 1, Math.floor(gameMinute / SLOT_DURATION_MINUTES));
}

/**
 * Vraca progress unutar slota (0-1)
 */
export function getSlotProgress(gameMinute) {
  return (gameMinute % SLOT_DURATION_MINUTES) / SLOT_DURATION_MINUTES;
}

/**
 * Konvertuje gameMinutes u real milliseconds (za speed)
 */
export function gameMinutesToRealMs(minutes, speed = 1) {
  return (minutes * REAL_SECONDS_PER_GAME_MINUTE * 1000) / speed;
}

/**
 * Konvertuje real milliseconds u game minutes
 */
export function realMsToGameMinutes(ms, speed = 1) {
  return (ms / 1000) / REAL_SECONDS_PER_GAME_MINUTE * speed;
}

/**
 * Intensity po dobu dana
 */
export function getIntensityModifier(sessionHour) {
  if (sessionHour < 2) return 0.5;
  if (sessionHour < 4) return 0.9;
  if (sessionHour < 5) return 0.7;
  if (sessionHour < 6) return 0.8;
  return 1.3; // crescendo
}

/**
 * Vraca window status: je li u Q&A prozoru, pause prozoru
 */
export function getTimingWindows(gameMinute, plan) {
  const slotIdx = getSlotIndex(gameMinute);
  const slotProg = getSlotProgress(gameMinute);
  const currentAct = plan[slotIdx]?.activity;

  return {
    inQAWindow: currentAct === 'teorija' && slotProg > 0.7,
    inPauseWindow: currentAct === 'pauza',
    inEvalWindow: currentAct === 'evaluacija',
    nearSlotEnd: slotProg > 0.85,
    slotIdx,
    slotProg,
    currentActivity: currentAct
  };
}

/**
 * Format game clock display: minuta -> "10:30"
 */
export function formatGameClock(gameMinute, startHour = 8) {
  const totalMin = Math.floor(startHour * 60 + gameMinute);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
