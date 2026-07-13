/**
 * systems/phases.js — Phase tracker (0 → A → B → C).
 *
 * Phases control unlock gating: channels, workers, prestige.
 * evaluatePhase() is called every tick — cheap condition checks only.
 */

import { GAME_CONFIG } from '../config.js';

// ─── Phase definitions ────────────────────────────────────────────────────────

const PHASE_ORDER = ['0', 'A', 'B', 'C'];

export const PHASE_LABELS = {
  '0': 'Faza 0 — Početak',
  'A': 'Faza A — Rast',
  'B': 'Faza B — Ekspanzija',
  'C': 'Faza C — Prestiž spreman',
};

export const PHASE_COLORS = {
  '0': 'var(--clr-text-dim)',
  'A': '#A8D5A2',
  'B': '#3A7BD5',
  'C': '#D4A017',
};

export const PHASE_DESCRIPTIONS = {
  '0': 'Imanje u razvoju. Pečurke su jedina grana, kapital raste polako.',
  'A': 'Prva komercijalna berba. Pijaca kanal otključan. Radnici dostupni.',
  'B': 'B2B ugovor. Restoran plaća 1.55×. Masterclass dostupan od S4.',
  'C': 'Permakulturni vrh. Sve grane, svi kanali, alumni mreža aktivna.',
};

export const PHASE_UNLOCKS = {
  '0': [],
  'A': ['Pijaca kanal (×1.2)', 'Angažuj radnika (+3 akcije)'],
  'B': ['Restoran kanal (×1.55)', 'Masterclass od sezone 4', 'Online kanal (×1.9)'],
  'C': ['Prestiž reset', 'Alumni mreža bonus', 'Sve sinergije aktivne'],
};

// ─── Phase evaluation ─────────────────────────────────────────────────────────

/**
 * Check if phase should advance this tick.
 * Returns new phase if changed, null otherwise.
 * @param {object} state
 * @param {object|null} audio
 * @param {Function|null} onUnlock - callback(phase, label)
 * @returns {string|null} new phase or null
 */
export function evaluatePhase(state, audio, onUnlock) {
  const current = state.phase;
  const idx = PHASE_ORDER.indexOf(current);
  if (idx < 0 || idx >= PHASE_ORDER.length - 1) return null;

  const next = PHASE_ORDER[idx + 1];
  if (!checkPhaseCondition(state, next)) return null;

  // Advance phase
  state.phase = next;

  // Phase-specific unlocks
  if (next === 'A') {
    // Pijaca channel becomes available but requires payment
    // (no auto-unlock, player buys it)
  }
  if (next === 'B') {
    // Masterclass unlocks once season reaches S4
    if (state.season >= GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON) {
      state.masterclassUnlocked = true;
    }
  }
  if (next === 'C') {
    state.masterclassUnlocked = true;
  }

  if (audio) audio.playSfx('phase_unlock');
  if (onUnlock) onUnlock(next, PHASE_LABELS[next]);
  return next;
}

// ─── Phase conditions ─────────────────────────────────────────────────────────

/**
 * Check if the condition for reaching a target phase is met.
 * @param {object} state
 * @param {string} targetPhase
 * @returns {boolean}
 */
function checkPhaseCondition(state, targetPhase) {
  switch (targetPhase) {
    case 'A':
      return state.totalRevenue >= GAME_CONFIG.PHASE_A_TOTAL_REVENUE;

    case 'B':
      // Need total revenue AND greenhouse unlocked
      return state.totalRevenue >= GAME_CONFIG.PHASE_B_TOTAL_REVENUE
        && state.greenhouse.unlocked;

    case 'C': {
      // Need 3 consecutive seasons with monthly revenue >= 150k
      if (!state.fishpond.unlocked) return false;
      if (state.masterclassCount < 1) return false;
      const recent = state.monthlyRevenue || [];
      if (recent.length < GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS) return false;
      const lastN = recent.slice(-GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS);
      return lastN.every(r => r >= GAME_CONFIG.PHASE_C_MONTHLY_SURPLUS);
    }

    default:
      return false;
  }
}

// ─── Phase progress helpers ───────────────────────────────────────────────────

/**
 * Get progress (0.0–1.0) toward the next phase.
 * @param {object} state
 * @returns {{ pct: number, current: number, target: number, desc: string }}
 */
export function getPhaseProgress(state) {
  const current = state.phase;
  const idx = PHASE_ORDER.indexOf(current);

  if (idx >= PHASE_ORDER.length - 1) {
    return { pct: 1.0, current: 0, target: 0, desc: 'Maksimalna faza dostiguta!' };
  }

  const next = PHASE_ORDER[idx + 1];

  switch (next) {
    case 'A': {
      const val = state.totalRevenue;
      const tgt = GAME_CONFIG.PHASE_A_TOTAL_REVENUE;
      return {
        pct: Math.min(1.0, val / tgt),
        current: val,
        target: tgt,
        desc: `Ukupan prihod: ${Math.floor(val).toLocaleString()} / ${tgt.toLocaleString()} din`,
      };
    }

    case 'B': {
      const val = state.totalRevenue;
      const tgt = GAME_CONFIG.PHASE_B_TOTAL_REVENUE;
      const ghOk = state.greenhouse.unlocked;
      return {
        pct: Math.min(1.0, val / tgt) * (ghOk ? 1 : 0.5),
        current: val,
        target: tgt,
        desc: `Prihod: ${Math.floor(val).toLocaleString()}/${tgt.toLocaleString()} din` +
              (ghOk ? '' : ' | Otključaj Plastenik'),
      };
    }

    case 'C': {
      const recent = state.monthlyRevenue || [];
      const target = GAME_CONFIG.PHASE_C_MONTHLY_SURPLUS;
      const needed = GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS;
      const qualifying = recent.filter(r => r >= target).length;
      const last3 = recent.slice(-needed);
      const consecutiveOk = last3.length >= needed && last3.every(r => r >= target);

      const fishOk = state.fishpond.unlocked;
      const mcOk = state.masterclassCount >= 1;

      const condsMet = [
        consecutiveOk,
        fishOk,
        mcOk,
      ].filter(Boolean).length;

      return {
        pct: condsMet / 3,
        current: qualifying,
        target: needed,
        desc: [
          `3 sezone ≥${(target / 1000).toFixed(0)}k: ${consecutiveOk ? '✓' : `${last3.filter(r => r >= target).length}/3`}`,
          `Jezero: ${fishOk ? '✓' : '✗'}`,
          `Masterclass: ${mcOk ? '✓' : '✗'}`,
        ].join(' | '),
      };
    }

    default:
      return { pct: 0, current: 0, target: 0, desc: '' };
  }
}

/**
 * Get requirements list for the next phase.
 * @param {object} state
 * @returns {Array<{ label: string, met: boolean }>}
 */
export function getNextPhaseRequirements(state) {
  const current = state.phase;
  const idx = PHASE_ORDER.indexOf(current);
  if (idx >= PHASE_ORDER.length - 1) return [];
  const next = PHASE_ORDER[idx + 1];

  switch (next) {
    case 'A':
      return [
        {
          label: `Prihod ≥ ${GAME_CONFIG.PHASE_A_TOTAL_REVENUE.toLocaleString()} din`,
          met: state.totalRevenue >= GAME_CONFIG.PHASE_A_TOTAL_REVENUE,
        },
      ];
    case 'B':
      return [
        {
          label: `Prihod ≥ ${GAME_CONFIG.PHASE_B_TOTAL_REVENUE.toLocaleString()} din`,
          met: state.totalRevenue >= GAME_CONFIG.PHASE_B_TOTAL_REVENUE,
        },
        {
          label: 'Plastenik otključan',
          met: state.greenhouse.unlocked,
        },
      ];
    case 'C': {
      const recent = (state.monthlyRevenue || []).slice(-3);
      const needed = GAME_CONFIG.PHASE_C_MONTHLY_SURPLUS;
      const ok = recent.length >= 3 && recent.every(r => r >= needed);
      return [
        {
          label: `3 uzastopne sezone ≥ ${(needed / 1000).toFixed(0)}k din`,
          met: ok,
        },
        {
          label: 'Jezero otključano',
          met: state.fishpond.unlocked,
        },
        {
          label: 'Bar 1 Masterclass organizovan',
          met: state.masterclassCount >= 1,
        },
      ];
    }
    default:
      return [];
  }
}

// ─── Prestige check ───────────────────────────────────────────────────────────

/**
 * Check if player is eligible for prestige.
 * Requires: Faza C + 3 consecutive seasons >= PHASE_C_MONTHLY_SURPLUS.
 * @param {object} state
 * @returns {boolean}
 */
export function canPrestige(state) {
  if (state.phase !== 'C') return false;
  const recent = state.monthlyRevenue || [];
  if (recent.length < GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS) return false;
  const lastN = recent.slice(-GAME_CONFIG.PHASE_C_CONSECUTIVE_SEASONS);
  return lastN.every(r => r >= GAME_CONFIG.PHASE_C_MONTHLY_SURPLUS);
}

/**
 * Get next phase name (or null if at max).
 * @param {object} state
 * @returns {string|null}
 */
export function getNextPhase(state) {
  const idx = PHASE_ORDER.indexOf(state.phase);
  return idx < PHASE_ORDER.length - 1 ? PHASE_ORDER[idx + 1] : null;
}
