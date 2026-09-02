/** @fileoverview Stara Šaraga mode: reset + Reputation carry, prestige bonuses */

import { CONFIG } from '../config.js';
import { getState, prestigeReset } from '../state.js';

/**
 * Calculate reputation from a completed run
 * @param {number} finalScore - 0-10
 * @param {number} prestigeRuns - number of completed prestige cycles
 * @param {number} communityVibeAvg - 0-100
 * @returns {number} reputation points gained
 */
export function calcReputationGain(finalScore, prestigeRuns, communityVibeAvg) {
  const scorePoints = finalScore * 10;
  const runBonus = prestigeRuns * 5;
  const communityBonus = communityVibeAvg * 0.5;
  return Math.floor(scorePoints + runBonus + communityBonus);
}

/**
 * Calculate total reputation after a run
 * @param {number} currentRep
 * @param {number} gain
 * @returns {number}
 */
export function calcNewReputation(currentRep, gain) {
  return currentRep + gain;
}

/**
 * Get all active prestige bonuses for a reputation level
 * @param {number} reputation
 * @returns {Object[]} active bonuses
 */
export function getPrestigeBonuses(reputation) {
  const bonuses = [];

  if (reputation >= CONFIG.PRESTIGE_REP_THRESHOLDS[0]) { // >= 30
    bonuses.push({
      threshold: 30,
      name: 'Tom Sawyer Pro',
      description: 'Tom Sawyer efekat ×1.25 (5 GC/1% WB umesto 4)',
      id: 'tom_sawyer_boost'
    });
  }

  if (reputation >= CONFIG.PRESTIGE_REP_THRESHOLDS[1]) { // >= 50
    bonuses.push({
      threshold: 50,
      name: 'DJ Network',
      description: 'DJ slot se otključava 2 nedelje ranije',
      id: 'dj_early_unlock'
    });
  }

  if (reputation >= CONFIG.PRESTIGE_REP_THRESHOLDS[2]) { // >= 70
    bonuses.push({
      threshold: 70,
      name: 'Veteranski Budžet',
      description: 'Nedeljni budžet = 550 GC',
      id: 'budget_boost'
    });
  }

  if (reputation >= CONFIG.PRESTIGE_REP_THRESHOLDS[3]) { // >= 90
    bonuses.push({
      threshold: 90,
      name: 'VIP Connections',
      description: 'VIP Gost event garantovan na Finalu',
      id: 'vip_guaranteed'
    });
  }

  if (reputation >= CONFIG.PRESTIGE_REP_THRESHOLDS[4]) { // >= 110
    bonuses.push({
      threshold: 110,
      name: 'Legenda Guncatija',
      description: 'Svi volonteri startuju sa +2 Vibe',
      id: 'vibe_start_bonus'
    });
  }

  return bonuses;
}

/**
 * Apply prestige bonuses to initial state
 * @param {Object} state - mutable initial state
 * @param {number} reputation
 */
export function applyPrestigeBonuses(state, reputation) {
  const bonuses = getPrestigeBonuses(reputation);
  for (const bonus of bonuses) {
    switch (bonus.id) {
      case 'budget_boost':
        state.gcBalance = 550;
        break;
      case 'vibe_start_bonus':
        state.volunteers = state.volunteers.map(v => ({
          ...v,
          vibe: Math.min(100, v.vibe + 20)
        }));
        break;
      // Other bonuses are applied in their respective systems via getPrestigeBonuses checks
    }
  }
}

/**
 * Calculate Tom Sawyer modifier (with prestige bonus if applicable)
 * @param {number} reputation
 * @returns {number} GC savings per WB % over threshold
 */
export function getTomSawyerRate(reputation) {
  const base = CONFIG.TOM_SAWYER_SAVINGS_PER_POINT;
  if (reputation >= CONFIG.PRESTIGE_REP_THRESHOLDS[0]) {
    return Math.round(base * 1.25);
  }
  return base;
}

/**
 * Get DJ unlock week for current prestige level
 * @param {number} reputation
 * @returns {number} week at which extra DJ slots unlock
 */
export function getDJUnlockWeek(reputation) {
  // Base: week 4 for slot 2; prestige >= 50 gives week 2 early unlock
  if (reputation >= CONFIG.PRESTIGE_REP_THRESHOLDS[1]) {
    return 2; // 2 weeks earlier
  }
  return 4; // default
}

/**
 * Initiate prestige if conditions met
 * @returns {{ canPrestige: boolean, reason: string }}
 */
export function checkPrestigeEligibility() {
  const state = getState();
  if (state.screen !== 'SCORE') return { canPrestige: false, reason: 'Nije kraj sezone' };
  if (state.finalScore === null) return { canPrestige: false, reason: 'Nema final score' };
  if (state.finalScore < CONFIG.WIN_LEGEND) {
    return { canPrestige: false, reason: `Potreban score >= ${CONFIG.WIN_LEGEND} za prestige` };
  }
  return { canPrestige: true, reason: '' };
}

/**
 * Get next prestige threshold info
 * @param {number} reputation
 * @returns {{ next: number|null, label: string }}
 */
export function getNextPrestigeThreshold(reputation) {
  for (const threshold of CONFIG.PRESTIGE_REP_THRESHOLDS) {
    if (reputation < threshold) {
      return {
        next: threshold,
        label: `${threshold - reputation} reputacije do sledećeg bonus-a`
      };
    }
  }
  return { next: null, label: 'Sve prestige bonuse otključane!' };
}

/**
 * Sezonski dnevnik — 3 auto-generisane linije iz prethodnog runa, prikazuju se
 * pri ulasku u Stara Šaraga mode umesto suvog "+X% reputacija".
 * Linija 1: najveća budžetska kategorija poslednje nedelje.
 * Linija 2: volonter sa najvišim i najnižim WB proxy skorom ((energija+vibe)/2).
 * Linija 3: finale moment (šta je nosilo poslednju noć — publika ili DJ).
 * @param {Object} state
 * @returns {string[]} tačno 3 linije, srpski, u tonu igre
 */
export function buildSeasonJournal(state) {
  const lines = [];

  // 1. Najveća budžetska kategorija
  const allocation = state.allocation || {};
  const catLabels = {
    gradnja: 'gradnju',
    hrana: 'hranu',
    marketing: 'marketing',
    zajednica: 'zajednicu'
  };
  const catEntries = Object.entries(allocation).filter(([, v]) => typeof v === 'number');
  const spentTotal = catEntries.reduce((sum, [, v]) => sum + v, 0);
  if (spentTotal > 0) {
    const [topCat, topVal] = catEntries.reduce((a, b) => (b[1] > a[1] ? b : a));
    lines.push(`Najviše GC je otišlo na ${catLabels[topCat] || topCat} — ${Math.round(topVal)} GC prošle sezone.`);
  } else {
    lines.push('Ova sezona nije ostavila trag u budžetskoj knjizi.');
  }

  // 2. Volonter sa najvišim / najnižim WB proxy skorom
  const volunteers = state.volunteers || [];
  if (volunteers.length === 1) {
    const only = volunteers[0];
    lines.push(`${only.name} nosi celu sezonu na sebi — nije bilo drugog izbora.`);
  } else if (volunteers.length > 1) {
    const withWB = volunteers.map(v => ({ ...v, wb: ((v.energija ?? 0) + (v.vibe ?? 0)) / 2 }));
    const best = withWB.reduce((a, b) => (b.wb > a.wb ? b : a));
    const worst = withWB.reduce((a, b) => (b.wb < a.wb ? b : a));
    if (best.name === worst.name) {
      lines.push(`${best.name} drži isti ritam ceo sezonu — ni gore ni bolje.`);
    } else {
      lines.push(`${best.name} se vraća, pamti te — ${worst.name} jedva izdržava do kraja.`);
    }
  } else {
    lines.push('Ova sezona nije imala volontere — niko da posvedoči šta se desilo.');
  }

  // 3. Finale moment
  const finale = state.finale;
  if (finale && typeof finale.crowdMood === 'number' && typeof finale.djHype === 'number') {
    const crowdMood = Math.round(finale.crowdMood);
    const djHype = Math.round(finale.djHype);
    if (crowdMood >= djHype) {
      lines.push(`Publika pamti raspoloženje (${crowdMood}%) više od bine te noći.`);
    } else {
      lines.push(`DJ hype (${djHype}%) nosi finale te noći, publika prati.`);
    }
  } else {
    lines.push('Finale se gubi u sećanju — dnevnik ćuti o njemu.');
  }

  return lines;
}

/**
 * Format reputation for display
 * @param {number} rep
 * @returns {string}
 */
export function formatReputation(rep) {
  if (rep >= 110) return `⭐⭐⭐ ${rep} (Legenda)`;
  if (rep >= 90)  return `⭐⭐ ${rep} (VIP)`;
  if (rep >= 70)  return `⭐ ${rep} (Veteran)`;
  if (rep >= 50)  return `🎵 ${rep} (DJ Network)`;
  if (rep >= 30)  return `✊ ${rep} (Tom Sawyer Pro)`;
  return `${rep} reputacije`;
}
