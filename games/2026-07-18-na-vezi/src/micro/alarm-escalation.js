/** Lanac-logika za alarm eskalaciju — ZASEBAN od alarm-generator-a */
import { GAME_CONFIG } from '../config.js';
import { getDashboardState, updateDashboardState } from './dashboard-state.js';
import { emit, EVENTS } from '../events.js';

/** Prati eskalacione bonuse po alarm tipu za ovaj tick */
let _escalationBonuses = {};

/** Broj promašenih alarma u ovoj sesiji */
let _missedCount = 0;

/**
 * Resetuje eskalacioni tracker (na početku emisije)
 */
export function resetEscalation() {
  _escalationBonuses = {};
  _missedCount = 0;
}

/**
 * Ažurira eskalaciju posle promašenog alarma
 * @param {Object} missedAlarm - iz alarm-generator-a
 */
export function processEscalation(missedAlarm) {
  const ds = getDashboardState();
  if (!ds) return;

  _missedCount++;
  const escalation = GAME_CONFIG.ESCALATION;

  // Specifična eskalacija po tipu
  switch (missedAlarm.type) {
    case 'signal_drop':
      _addBonus('battery_critical', escalation.signal_drop_unresolved.bonus);
      break;
    case 'battery_critical':
      _addBonus('signal_drop', escalation.battery_critical_unresolved.bonus);
      break;
    case 'feedback_glitch':
      // Povećava sledeći bilo koji alarm
      _addBonus('_any_next', escalation.feedback_glitch_missed.bonus);
      break;
  }

  // Ako je drugi promašeni u sesiji — hardware fault bonus
  if (_missedCount >= 2) {
    _addBonus('hardware_fault', escalation.second_unresolved_in_session.bonus);
    // Ažuriraj chain count za AC10
    updateDashboardState({ alarmChainCount: ds.alarmChainCount + 1 });
  }

  emit(EVENTS.ALARM_ESCALATED, {
    missedAlarm,
    escalationBonuses: { ..._escalationBonuses },
    missedCount: _missedCount,
  });
}

/**
 * Vraća trenutne eskalacione bonuse za alarm generator
 * @returns {Object} { alarmType: bonus }
 */
export function getEscalationBonuses() {
  const bonuses = { ..._escalationBonuses };

  // Aplicira _any_next bonus na sve tipove
  if (bonuses._any_next) {
    const anyBonus = bonuses._any_next;
    delete bonuses._any_next;
    for (const type of ['signal_drop', 'feedback_glitch', 'battery_critical', 'platform_hiccup']) {
      bonuses[type] = (bonuses[type] || 0) + anyBonus;
    }
  }

  return bonuses;
}

/**
 * Registruje uspešno rešen alarm (smanjuje eskalaciju)
 * @param {Object} resolvedAlarm
 */
export function processResolution(resolvedAlarm) {
  // Rešen alarm smanjuje bonus za taj tip
  if (_escalationBonuses[resolvedAlarm.type]) {
    _escalationBonuses[resolvedAlarm.type] = Math.max(
      0,
      _escalationBonuses[resolvedAlarm.type] - 0.05
    );
  }
}

/**
 * Proverava AC10 — Alarm Lanac Prekinut (2+ alarma u lancu, svi rešeni)
 * @returns {boolean}
 */
export function checkChainBroken() {
  const ds = getDashboardState();
  if (!ds) return false;
  // Chain je "prekinut" ako je alarmChainCount >= 2 I nije bilo promašenih
  return ds.alarmChainCount >= 2 && ds.alarmsMissed === 0;
}

/**
 * Vraća težinu aktuelne eskalacije (za UI display)
 * @returns {number} 0-1
 */
export function getEscalationLevel() {
  const total = Object.values(_escalationBonuses).reduce((s, v) => s + v, 0);
  return Math.min(total / 0.5, 1);
}

function _addBonus(type, amount) {
  _escalationBonuses[type] = Math.min(
    (_escalationBonuses[type] || 0) + amount,
    0.5
  );
}
