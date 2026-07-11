import { GAME_CONFIG } from '../config.js';

const PHASE_ORDER = ['0', 'A', 'B', 'C'];

/** Labels for each phase */
export const PHASE_LABELS = {
  '0': 'Faza 0 — Start',
  'A': 'Faza A — Rast',
  'B': 'Faza B — Ekspanzija',
  'C': 'Faza C — Prestiž',
};

/**
 * Check if phase should advance.
 * Called every tick. Returns new phase if changed, null otherwise.
 */
export function evaluatePhase(state, audio, onUnlock) {
  const current = state.phase;
  const idx = PHASE_ORDER.indexOf(current);
  if (idx < 0 || idx >= PHASE_ORDER.length - 1) return null;

  const next = PHASE_ORDER[idx + 1];
  if (checkPhaseCondition(state, next)) {
    state.phase = next;

    // Phase B: masterclass becomes available at season 4+
    if (next === 'B') {
      state.masterclassUnlocked = state.season >= GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON;
    }
    if (next === 'C') {
      state.masterclassUnlocked = true;
    }

    if (audio) audio.playSfx('phase_unlock');
    if (onUnlock) onUnlock(next, PHASE_LABELS[next]);
    return next;
  }
  return null;
}

/** Check conditions for reaching a given phase */
function checkPhaseCondition(state, targetPhase) {
  switch (targetPhase) {
    case 'A':
      return state.totalRevenue >= GAME_CONFIG.PHASE_A_TOTAL_REVENUE;

    case 'B':
      return state.totalRevenue >= GAME_CONFIG.PHASE_B_TOTAL_REVENUE;

    case 'C': {
      // Need 3 consecutive seasons with monthly revenue >= 150k
      const recent = state.monthlyRevenue || [];
      if (recent.length < GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS) return false;
      const lastN = recent.slice(-GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS);
      return lastN.every(r => r >= GAME_CONFIG.PHASE_C_MONTHLY_SURPLUS);
    }

    default:
      return false;
  }
}

/** Can player prestige? (Faza C + 3 consecutive seasons) */
export function canPrestige(state) {
  if (state.phase !== 'C') return false;
  const recent = state.monthlyRevenue || [];
  if (recent.length < GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS) return false;
  const lastN = recent.slice(-GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS);
  return lastN.every(r => r >= GAME_CONFIG.PHASE_C_MONTHLY_SURPLUS);
}
