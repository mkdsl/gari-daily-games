/**
 * unlock-manager.js — Provera rep thresholds, trigger unlock notifikacija
 */

import { bus, EVT } from '../events.js';
import { getTriggeredUnlocks } from '../macro/unlock-tree.js';
import { getMetaState, setMaxParticipants, saveMetaState } from './meta-state.js';
import { STAFF_LIST } from '../macro/staff-roster.js';

/**
 * Proverava i primenjuje sve nove unlock-ove
 * @param {number} prevRep
 * @param {number} newRep
 * @returns {Array} triggered unlocks
 */
export function processUnlocks(prevRep, newRep) {
  const triggered = getTriggeredUnlocks(prevRep, newRep);
  if (!triggered.length) return [];

  const meta = getMetaState();
  if (!meta) return triggered;

  for (const unlock of triggered) {
    applyUnlock(unlock, meta);
    bus.emit(EVT.UNLOCK, { unlock });
    bus.emit(EVT.TOAST, {
      msg: `${unlock.icon} Novo: ${unlock.description}`,
      type: 'unlock',
      duration: 4000
    });
  }

  saveMetaState();
  return triggered;
}

function applyUnlock(unlock, meta) {
  const { type, value } = unlock;

  switch (type) {
    case 'tema':
      if (!meta.unlockedThemes) meta.unlockedThemes = ['suvozid'];
      if (!meta.unlockedThemes.includes(value)) meta.unlockedThemes.push(value);
      break;

    case 'staff':
      if (!meta.unlockedStaff) meta.unlockedStaff = ['alatko'];
      if (!meta.unlockedStaff.includes(value)) meta.unlockedStaff.push(value);
      break;

    case 'participants':
      meta.maxParticipants = Math.max(meta.maxParticipants || 4, value);
      break;

    case 'session_days':
      meta.maxSessionDays = Math.max(meta.maxSessionDays || 1, value);
      break;

    case 'multi':
      if (value.tema) {
        if (!meta.unlockedThemes) meta.unlockedThemes = ['suvozid'];
        if (!meta.unlockedThemes.includes(value.tema)) meta.unlockedThemes.push(value.tema);
      }
      if (value.staff) {
        if (!meta.unlockedStaff) meta.unlockedStaff = ['alatko'];
        if (!meta.unlockedStaff.includes(value.staff)) meta.unlockedStaff.push(value.staff);
      }
      if (value.participants) {
        meta.maxParticipants = Math.max(meta.maxParticipants || 4, value.participants);
      }
      if (value.session_days) {
        meta.maxSessionDays = Math.max(meta.maxSessionDays || 1, value.session_days);
      }
      if (value.share_card) {
        meta.shareCardUnlocked = true;
      }
      if (value.brand_active) {
        meta.brandLinkActive = true;
      }
      if (value.prestige_prompt) {
        meta.prestigePromptUnlocked = true;
      }
      if (value.mkdslend_secret) {
        meta.mkdslendSecretUnlocked = true;
      }
      break;

    case 'tool_upgrade':
      if (!meta.toolUpgrades) meta.toolUpgrades = {};
      Object.assign(meta.toolUpgrades, value);
      break;

    case 'applicant_pool':
      meta.extraApplicantPool = (meta.extraApplicantPool || 0) + value;
      break;

    case 'canvas_building':
      meta.canvasBuildings = [...(meta.canvasBuildings || []), value];
      break;
  }
}
