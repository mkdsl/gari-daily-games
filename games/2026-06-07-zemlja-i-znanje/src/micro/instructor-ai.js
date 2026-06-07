/**
 * instructor-ai.js — Stub: passive bonus iz STAFF_BONUSES config
 * Nema AI logike v1 — samo passive bonus primena
 */

import { STAFF_BONUSES } from '../config.js';

/**
 * Primenjuje pasivne staff bonuse na satisfaction (per-tick)
 * @param {Array} participantStates
 * @param {Array} hiredStaff — ['brana', 'alatko', ...]
 * @param {string} activityId
 */
export function applyInstructorPassiveBonuses(participantStates, hiredStaff = [], activityId = 'teorija') {
  let bonusDelta = 0;

  for (const staffId of hiredStaff) {
    const bonus = STAFF_BONUSES[staffId];
    if (!bonus) continue;

    // Brana: +5 satisfaction bonus global
    if (staffId === 'brana' && bonus.satisfaction_bonus) {
      bonusDelta += bonus.satisfaction_bonus / 480; // spread over session minutes
    }
  }

  if (bonusDelta > 0) {
    for (const p of participantStates) {
      if (p.isPresent) {
        p.satisfaction = Math.min(100, p.satisfaction + bonusDelta);
      }
    }
  }
}

/**
 * Vraca passive bonus description za planning screen
 */
export function getStaffPassiveDesc(staffId) {
  const bonus = STAFF_BONUSES[staffId];
  if (!bonus) return '';

  if (staffId === 'brana') return '+5 zadovoljstvo (spread po sesiji)';
  if (staffId === 'alatko') return '-15% vreme praktičnog rada';
  if (staffId === 'cana') return '+5 energija per pauza, -25% hrana';
  if (staffId === 'zemljan') return '+15 learned za rammed earth temu';
  return '';
}
