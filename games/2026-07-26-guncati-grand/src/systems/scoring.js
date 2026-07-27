/** @fileoverview Final Score formula, win condition check, achievement unlock */

import { CONFIG } from '../config.js';
import { calcCommunityVibe } from './wellbeing.js';
import { calcSeasonRevenue } from './economy.js';

/**
 * Calculate final score breakdown
 * @param {Object} state - full game state at end
 * @returns {Object} score breakdown
 */
export function calcFinalScore(state) {
  const { finale, weeklyWB, totalRevenue, buildings, volunteers, reputation } = state;

  // 1. Crowd Happiness = crowdMood_final / 100
  const crowdHappiness = (finale?.crowdMood || 50) / 100;

  // 2. Revenue = all season + finale revenue
  const totalRev = (totalRevenue || 0) + (finale?.revenue || 0);
  const revenueScore = Math.min(totalRev / CONFIG.REVENUE_TARGET, 1.5); // can exceed target

  // 3. Community Vibe = avg WB nedelje 7-10 × 2 (weighted), capped at 100
  const communityVibe = calcCommunityVibe(weeklyWB) / 100;

  // Raw score
  const raw =
    crowdHappiness * CONFIG.SCORE_HAPPINESS_WEIGHT +
    revenueScore * CONFIG.SCORE_REVENUE_WEIGHT +
    communityVibe * CONFIG.SCORE_COMMUNITY_WEIGHT;

  const finalScore = Math.min(raw * 10, 10);

  return {
    finalScore: Math.round(finalScore * 10) / 10,
    crowdHappiness: Math.round(crowdHappiness * 100),
    revenueScore: Math.round(revenueScore * 100),
    communityVibe: Math.round(communityVibe * 100),
    totalRevenue: Math.floor(totalRev),
    rawScore: Math.round(raw * 100) / 100
  };
}

/**
 * Get win condition based on score
 * @param {number} score
 * @returns {{ win: boolean, tier: string, message: string, emoji: string }}
 */
export function getWinCondition(score) {
  if (score >= CONFIG.WIN_LEGEND) {
    return {
      win: true,
      tier: 'legend',
      message: 'Legenda Guncatija!',
      subtitle: 'Sve planine pokleknuše pred tvojim festivalom.',
      emoji: '🏆',
      canPrestige: true
    };
  }
  if (score >= CONFIG.WIN_DECENT) {
    return {
      win: true,
      tier: 'decent',
      message: 'Lepo, ali...',
      subtitle: 'Dobar festival. Ali znaš da možeš bolje.',
      emoji: '🌟',
      canPrestige: false
    };
  }
  return {
    win: false,
    tier: 'fail',
    message: 'Teren vraća poruku',
    subtitle: 'Zemlja je tvoj učitelj. Proba ponovo.',
    emoji: '🌱',
    canPrestige: false
  };
}

/**
 * Unlock achievements based on run performance
 * @param {Object} state
 * @param {Object} scoreBreakdown
 * @returns {string[]} achievement ids unlocked this run
 */
export function checkAchievements(state, scoreBreakdown) {
  const unlocked = [];
  const { finalScore, crowdHappiness, communityVibe, totalRevenue } = scoreBreakdown;
  const { volunteers, buildings, currentWB, weeklyWB, reputation } = state;

  // Tom Sawyer Master — WB >= 80% for 3 consecutive weeks
  const consecutive = countConsecutiveAbove(weeklyWB || [], 80);
  if (consecutive >= 3) unlocked.push('tom_sawyer_master');

  // Full House — crowd cap reached on finale
  if (state.finale?.crowdCurrent >= state.finale?.crowdCap * 0.95) {
    unlocked.push('full_house');
  }

  // Maximum Infrastructure — all buildings at level 3
  const allMaxed = Object.values(buildings || {}).every(l => l >= 3);
  if (allMaxed) unlocked.push('max_infra');

  // Perfect Crew — all 7 volunteers joined
  if (volunteers?.length >= 7) unlocked.push('full_crew');

  // Pristine Vibe — community vibe >= 90
  if (communityVibe >= 90) unlocked.push('pristine_community');

  // Revenue King — exceeded target by 50%
  if (totalRevenue >= CONFIG.REVENUE_TARGET * 1.5) unlocked.push('revenue_king');

  // Legend — top score
  if (finalScore >= CONFIG.WIN_LEGEND) unlocked.push('legend');

  // Prestige — returning player
  if (state.prestigeRuns > 0) unlocked.push('old_hand');

  // Fixer — resolved 5+ events during finale
  if ((state.finale?.triggeredEvents?.length || 0) >= 5) unlocked.push('event_handler');

  return [...new Set(unlocked)]; // dedupe
}

/**
 * Get achievement display info
 * @param {string} id
 * @returns {{ name: string, desc: string, emoji: string }}
 */
export function getAchievementInfo(id) {
  const ACHIEVEMENTS = {
    tom_sawyer_master: { name: 'Tom Sawyer Majstor', desc: 'WB >= 80% tri uzastopne nedelje', emoji: '✊' },
    full_house: { name: 'Puna Kuća', desc: 'Finale sa punim kapacitetom publike', emoji: '🎪' },
    max_infra: { name: 'Graditelj', desc: 'Sve zgrade na maksimalnom nivou', emoji: '🏗️' },
    full_crew: { name: 'Ceo Tim', desc: 'Svih 7 volontera u jednoj sezoni', emoji: '👥' },
    pristine_community: { name: 'Zajednica Cveta', desc: 'Community Vibe >= 90', emoji: '🌸' },
    revenue_king: { name: 'Kralj Prihoda', desc: 'Prihod 150% od cilja', emoji: '💰' },
    legend: { name: 'Legenda Guncatija', desc: 'Final Score >= 7.5', emoji: '🏆' },
    old_hand: { name: 'Veteran', desc: 'Igraš ponovo (Stara Šaraga mode)', emoji: '🎓' },
    event_handler: { name: 'Krizni Menadžer', desc: '5+ eventi na Finalu', emoji: '🚨' }
  };
  return ACHIEVEMENTS[id] || { name: id, desc: '', emoji: '⭐' };
}

/**
 * Count consecutive weeks above threshold
 * @param {number[]} weeklyWB
 * @param {number} threshold
 * @returns {number}
 */
function countConsecutiveAbove(weeklyWB, threshold) {
  let maxConsec = 0, cur = 0;
  for (const wb of weeklyWB) {
    if (wb >= threshold) { cur++; maxConsec = Math.max(maxConsec, cur); }
    else cur = 0;
  }
  return maxConsec;
}

/**
 * Format final score for share card
 * @param {Object} breakdown
 * @returns {string}
 */
export function formatScoreCard(breakdown) {
  const { finalScore, crowdHappiness, totalRevenue, communityVibe } = breakdown;
  return [
    `Guncati Grand: ${finalScore}/10`,
    `Publika: ${crowdHappiness}% sreće`,
    `Prihod: ${totalRevenue} GC`,
    `Zajednica: ${communityVibe}%`
  ].join(' | ');
}
