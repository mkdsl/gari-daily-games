/**
 * season-summary.js — Kraj sezone ekran — stats, zarada, reputacija, unlock notifikacije
 */

import { getTriggeredUnlocks } from './unlock-tree.js';
import { formatEur, formatPct } from '../utils.js';
import { getBrandLinkHTML } from '../content/brand-hooks.js';
import { getAforizem } from '../content/aforizmi.js';

/**
 * Kreira summary objekat za kraj sezone
 * @param {Object} params
 * @param {Array} params.sessionResults
 * @param {number} params.income
 * @param {number} params.costs
 * @param {number} params.repGained
 * @param {number} params.prevRep
 * @param {number} params.newRep
 * @param {Array} params.achievementsUnlocked
 * @param {number} params.carryover
 */
export function buildSeasonSummary(params) {
  const {
    sessionResults = [],
    income = 0,
    costs = 0,
    repGained = 0,
    prevRep = 0,
    newRep = 0,
    achievementsUnlocked = [],
    carryover = 0
  } = params;

  const profit = income - costs;
  const avgSatisfaction = sessionResults.length > 0
    ? sessionResults.reduce((s, r) => s + r.avgSatisfaction, 0) / sessionResults.length
    : 0;

  const newUnlocks = getTriggeredUnlocks(prevRep, newRep);
  const aforizem = getAforizem('season');

  return {
    income,
    costs,
    profit,
    carryover,
    repGained,
    prevRep,
    newRep,
    avgSatisfaction,
    sessionResults,
    newUnlocks,
    achievementsUnlocked,
    aforizem,
    grade: calcSeasonGrade(avgSatisfaction, profit)
  };
}

function calcSeasonGrade(satisfaction, profit) {
  if (satisfaction >= 0.90 && profit > 0) return 'S';
  if (satisfaction >= 0.80 && profit > 0) return 'A';
  if (satisfaction >= 0.70)               return 'B';
  if (satisfaction >= 0.60)               return 'C';
  if (satisfaction >= 0.50)               return 'D';
  return 'F';
}

/**
 * Kreira HTML za season end screen
 */
export function renderSeasonSummaryHTML(summary) {
  const gradeColors = { S: '#F4C430', A: '#5aad5a', B: '#4A6741', C: '#C4956A', D: '#A0522D', F: '#cc3333' };
  const gradeColor = gradeColors[summary.grade] || '#888';

  const unlockItems = summary.newUnlocks.map(u =>
    `<div class="unlock-item">${u.icon} <span>${u.description}</span></div>`
  ).join('');

  return `
    <div class="season-summary">
      <div class="summary-grade" style="color:${gradeColor}">Ocena sezone: ${summary.grade}</div>
      <div class="summary-stats">
        <div class="stat-row"><span>Prihodi:</span><span class="val positive">${formatEur(summary.income)}</span></div>
        <div class="stat-row"><span>Troškovi:</span><span class="val negative">-${formatEur(summary.costs)}</span></div>
        <div class="stat-row"><span>Profit:</span><span class="val ${summary.profit >= 0 ? 'positive' : 'negative'}">${formatEur(summary.profit)}</span></div>
        <div class="stat-row"><span>Carry-over:</span><span class="val">${formatEur(summary.carryover)}</span></div>
        <div class="stat-row"><span>Zadovoljstvo:</span><span class="val">${formatPct(summary.avgSatisfaction)}</span></div>
        <div class="stat-row"><span>Reputacija:</span><span class="val positive">+${Math.round(summary.repGained)} (${Math.round(summary.newRep)} ukupno)</span></div>
      </div>
      ${unlockItems ? `<div class="new-unlocks"><h3>Novo otključano:</h3>${unlockItems}</div>` : ''}
      ${summary.achievementsUnlocked.length ? `<div class="achievements-earned">🏆 ${summary.achievementsUnlocked.join(', ')}</div>` : ''}
      <div class="season-aforizem">"${summary.aforizem}"</div>
      ${getBrandLinkHTML('small')}
    </div>
  `;
}
