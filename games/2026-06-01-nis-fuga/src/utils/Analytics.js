/**
 * Analytics.js — Simple session event logger (localStorage only)
 * Prati gameplay decisions za replay/design insights
 * @module Analytics
 */

import GameState from './GameState.js';

const ANALYTICS_KEY = 'nis_fuga_analytics_v1';
const MAX_EVENTS = 500;

const sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Log a gameplay event
 * @param {string} type - Event type
 * @param {object} [data] - Extra data
 */
export function logEvent(type, data = {}) {
  const event = {
    sessionId,
    type,
    data,
    ts: Date.now(),
    scene: GameState.raw().currentScene,
    resources: { ...GameState.raw().resources }
  };

  GameState.addAnalyticsEvent(event);

  // Persist to localStorage (non-blocking)
  try {
    const stored = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    stored.push(event);
    // Cap events
    const trimmed = stored.slice(-MAX_EVENTS);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {
    // Non-critical — silently fail
  }
}

/**
 * Log a dialog choice
 * @param {string} sceneId
 * @param {string} choiceId
 * @param {object} effects
 */
export function logChoice(sceneId, choiceId, effects) {
  logEvent('choice', { sceneId, choiceId, effects });
}

/**
 * Log scene transition
 * @param {string} from
 * @param {string} to
 */
export function logSceneTransition(from, to) {
  logEvent('scene_transition', { from, to });
}

/**
 * Log achievement unlock
 * @param {string} achievementId
 */
export function logAchievement(achievementId) {
  logEvent('achievement', { achievementId });
}

/**
 * Log ending reached
 * @param {string} endingId
 * @param {number} score
 */
export function logEnding(endingId, score) {
  logEvent('ending', { endingId, score });
}

/**
 * Get all stored analytics events
 * @returns {Array}
 */
export function getStoredEvents() {
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Get session summary
 * @returns {object}
 */
export function getSessionSummary() {
  const events = GameState.raw().analyticsEvents ?? [];
  const choices = events.filter(e => e.type === 'choice');
  const achievements = events.filter(e => e.type === 'achievement');
  const ending = events.find(e => e.type === 'ending');

  return {
    sessionId,
    totalEvents: events.length,
    choicesMade: choices.length,
    achievementsUnlocked: achievements.length,
    endingReached: ending?.data?.endingId ?? null,
    duration: events.length > 0
      ? (events[events.length - 1].ts - events[0].ts) / 1000
      : 0
  };
}

export default { logEvent, logChoice, logSceneTransition, logAchievement, logEnding, getStoredEvents, getSessionSummary };
