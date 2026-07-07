/**
 * AchievementSystem.js — Achievement tracker, unlock logic, display
 * Tracks 9 achievements (3 hidden) and triggers toast notifications
 * @module AchievementSystem
 */

import GameState from '../utils/GameState.js';
import EventBus, { EVENTS } from './EventBus.js';
import Analytics from '../utils/Analytics.js';

/** @type {Array<object>} */
let achievementsData = [];

/**
 * Initialize with achievements.json data
 * @param {Array} data
 */
export function init(data) {
  achievementsData = data;
}

/**
 * Get achievement definition by id
 * @param {string} id
 * @returns {object|null}
 */
export function getAchievement(id) {
  return achievementsData.find(a => a.id === id) ?? null;
}

/**
 * Try to unlock achievement
 * @param {string} id
 * @returns {boolean} newly unlocked
 */
export function unlock(id) {
  const def = getAchievement(id);
  if (!def) {
    console.warn(`[AchievementSystem] Unknown achievement: ${id}`);
    return false;
  }

  const wasNew = GameState.unlockAchievement(id);
  if (wasNew) {
    Analytics.logAchievement(id);
    EventBus.emit(EVENTS.ACHIEVEMENT_UNLOCKED, {
      id,
      name: def.name,
      desc: def.desc,
      hidden: def.hidden,
      icon: def.icon
    });

    // Show toast via UI event
    EventBus.emit(EVENTS.UI_TOAST_SHOW, {
      type: 'achievement',
      title: `Dostignuće: ${def.name}`,
      message: def.desc,
      duration: 3500,
      icon: getIconEmoji(def.icon)
    });
  }
  return wasNew;
}

/**
 * Get all achievements with unlock status
 * @returns {Array<{def: object, unlocked: boolean}>}
 */
export function getAll() {
  return achievementsData.map(def => ({
    def,
    unlocked: GameState.hasAchievement(def.id)
  }));
}

/**
 * Get count of unlocked achievements
 * @returns {number}
 */
export function getUnlockedCount() {
  return achievementsData.filter(a => GameState.hasAchievement(a.id)).length;
}

/**
 * Check all scene-based triggers
 * Called by scene modules at key moments
 * @param {string} trigger
 * @param {object} [ctx]
 */
export function checkTrigger(trigger, ctx = {}) {
  switch (trigger) {
    case 'scene1_option_a_rep0':
      if (GameState.getResource('reputation') <= 2) { // was 0 before choice
        unlock('dragoljubova_milost');
      }
      break;
    case 'scene2_option_a':
      unlock('bacamile_zna_sve');
      break;
    case 'scene5_nenad_secret':
      unlock('nis_logika');
      break;
    case 'ending_s2':
      unlock('tajni_gost');
      break;
    case 'ending_hard_fail':
      unlock('i_ovako_nekad_bude');
      break;
    case 'tvrdjava_zid_hotspot':
      unlock('rimska_logistika');
      break;
    case 'scene5_print_access':
      unlock('epson_legenda');
      break;
    case 'scene4_option_c':
      unlock('niva_do_petka');
      break;
    default:
      // Direct ID unlock
      if (achievementsData.find(a => a.id === trigger)) {
        unlock(trigger);
      }
      break;
  }
}

function getIconEmoji(icon) {
  const map = {
    badge: '🏅',
    kiosk: '🏪',
    mic: '🎤',
    key: '🔑',
    guitar: '🎸',
    clock: '⏰',
    wall: '🧱',
    printer: '🖨️',
    car: '🚗'
  };
  return map[icon] ?? '🏆';
}

export default { init, getAchievement, unlock, getAll, getUnlockedCount, checkTrigger };
