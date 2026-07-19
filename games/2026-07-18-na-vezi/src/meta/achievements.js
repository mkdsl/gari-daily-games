/** 14 achievement provera */
import { ACHIEVEMENTS, GAME_CONFIG } from '../config.js';
import { getState, unlockAchievement } from '../state.js';
import { emit, EVENTS } from '../events.js';

/**
 * Proverava sve achievement-e posle emisije
 * @param {Object} emisijaResult
 * @returns {string[]} lista novih achievement ID-eva
 */
export function checkAllAchievements(emisijaResult) {
  const newUnlocks = [];
  const state = getState();

  const checkers = [
    () => checkAC1(emisijaResult, state),
    () => checkAC2(emisijaResult, state),
    () => checkAC3(emisijaResult, state),
    () => checkAC4(emisijaResult, state),
    () => checkAC5(state),
    () => checkAC6(emisijaResult),
    () => checkAC7(emisijaResult, state),
    () => checkAC8(state),
    () => checkAC9(state),
    () => checkAC10(emisijaResult),
    () => checkAC11(emisijaResult),
    () => checkAC12(state),
    () => checkAC13(state),
    () => checkAC14(emisijaResult),
  ];

  for (const checker of checkers) {
    const result = checker();
    if (result) newUnlocks.push(result);
  }

  return newUnlocks;
}

/**
 * Triggeruje achievement unlock event
 * @param {string} achievementId
 * @returns {string|null}
 */
function _unlock(achievementId) {
  const isNew = unlockAchievement(achievementId);
  if (isNew) {
    const ach = ACHIEVEMENTS[achievementId];
    emit(EVENTS.ACHIEVEMENT_UNLOCKED, { achievementId, achievement: ach });
    return achievementId;
  }
  return null;
}

// ======= INDIVIDUAL CHECKERS =======

function checkAC1(result, state) {
  if (state.achievements.ac1) return null;
  if (!result.hasCriticalAlarm) return _unlock('ac1');
  return null;
}

function checkAC2(result, state) {
  if (state.achievements.ac2) return null;
  // 4 uzastopne bez critical + engagement prag + gost bez no-show
  const newStreak = !result.hasCriticalAlarm ? state.signal_stabilan_streak + 1 : 0;
  const state2 = getState();
  state2.signal_stabilan_streak = newStreak;

  const engagementOk = result.overallEngagement >= GAME_CONFIG.AC2_ENGAGEMENT_PRAG;
  const gostOk = !result.noShow;

  // Ažuriraj flag za gost u ovoj nedelji
  if (gostOk && result.gostId !== 'g8') {
    state2.emisija_sa_gostom_bez_noshow = true;
  }

  if (newStreak >= GAME_CONFIG.AC2_STREAK_NEEDED && engagementOk && state2.emisija_sa_gostom_bez_noshow) {
    return _unlock('ac2');
  }
  return null;
}

function checkAC3(result, state) {
  if (state.achievements.ac3) return null;
  // Emisija >80% iskorišćenog kapaciteta bez otpada (kapacitet ostao visok)
  const used = result.batteryUsagePct;
  const left = result.batteryLeftPct;
  if (used > 0.8 && left < 0.1 && result.emisijaComplete) {
    return _unlock('ac3');
  }
  return null;
}

function checkAC4(result, state) {
  if (state.achievements.ac4) return null;
  if (result.weather === 'oblacno' && result.emisijaComplete && !result.hasCriticalAlarm) {
    return _unlock('ac4');
  }
  return null;
}

function checkAC5(state) {
  if (state.achievements.ac5) return null;
  const alloc = state.weekly_plan.platform_alloc;
  const vals = [alloc.ig, alloc.tiktok, alloc.youtube].filter(v => v > 0);
  if (vals.length < 3) return null;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  if (max - min <= 10) return _unlock('ac5');
  return null;
}

function checkAC6(result) {
  if (getState().achievements.ac6) return null;
  if (result.tiktokSpikeEarly) return _unlock('ac6');
  return null;
}

function checkAC7(result, state) {
  if (state.achievements.ac7) return null;
  if (result.format === 'podkast') {
    const ytEng = result.engagement?.youtube || 0;
    if (ytEng >= 0.75) return _unlock('ac7');
  }
  return null;
}

function checkAC8(state) {
  if (state.achievements.ac8) return null;
  const reliabilities = Object.values(state.guest_reliability);
  if (reliabilities.some(r => r >= 90)) return _unlock('ac8');
  return null;
}

function checkAC9(state) {
  if (state.achievements.ac9) return null;
  if ((state.consecutive_noshow_free || 0) >= 5) return _unlock('ac9');
  return null;
}

function checkAC10(result) {
  if (getState().achievements.ac10) return null;
  if (result.alarmChainCount >= 2 && result.alarmsMissed === 0) return _unlock('ac10');
  return null;
}

function checkAC11(result) {
  if (getState().achievements.ac11) return null;
  if (result.highlights && result.highlights.length > 0) return _unlock('ac11');
  return null;
}

function checkAC12(state) {
  if (state.achievements.ac12) return null;
  if (state.prestige_count >= 1) return _unlock('ac12');
  return null;
}

function checkAC13(state) {
  if (state.achievements.ac13) return null;
  if (state.unlocked_formats.length >= 3) return _unlock('ac13');
  return null;
}

function checkAC14(result) {
  if (getState().achievements.ac14) return null;
  if (result.offgridFinal < 10 && result.emisijaComplete) return _unlock('ac14');
  return null;
}

/**
 * Vraća listu svih achievement-a sa statusom
 * @returns {Array}
 */
export function getAchievementList() {
  const state = getState();
  return Object.values(ACHIEVEMENTS).map(ach => ({
    ...ach,
    unlocked: !!state.achievements[ach.id],
  }));
}

/**
 * Broj otključanih achievement-a
 * @returns {number}
 */
export function getUnlockedCount() {
  const state = getState();
  return Object.values(state.achievements).filter(Boolean).length;
}
