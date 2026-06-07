/**
 * feedback-collector.js — Kraj sesije evaluacija
 * Satisfaction agregacija, naučeni materijal, scores
 */

import { calcGroupSatisfaction, classifySatisfaction } from './satisfaction-calc.js';
import { getTotalLearnedScore } from './module-progress.js';
import { checkJournalistBonus } from './participant-manager.js';
import { createSessionResult } from '../state.js';
import { formatPct } from '../utils.js';

/**
 * Kreira finalni report za sesiju
 * @param {Object} microState
 * @returns {Object} sessionResult
 */
export function collectFeedback(microState) {
  const present = microState.participantStates.filter(p => p.isPresent);
  const avgSatisfaction = calcGroupSatisfaction(present);
  const classification = classifySatisfaction(avgSatisfaction);

  const learnedScore = getTotalLearnedScore(microState.moduleProgress || {});
  const journalistBonus = checkJournalistBonus(present);

  // Per-participant final stats
  const participantResults = present.map(p => ({
    id: p.id,
    name: p.name,
    archetypeId: p.archetypeId,
    satisfaction: Math.round(p.satisfaction),
    finalEnergy: Math.round(p.energy),
    learned: Math.round(p.learned),
    mood: p.mood
  }));

  const result = {
    completedAt: Date.now(),
    tema: microState.tema,
    participantsStarted: microState.participants?.length || 0,
    participantsFinished: present.length,
    avgSatisfaction,
    satisfactionLabel: classification.label,
    satisfactionGrade: classification.grade,
    totalLearned: Math.round(learnedScore),
    incidentCount: microState.incidentCount || 0,
    weatherDuringSession: microState.weather,
    endReason: microState.endReason || 'completed',
    journalistBonus,
    participantResults,
    gameMinutesPlayed: microState.gameMinute || 0
  };

  return result;
}

/**
 * Kreira HTML za evaluacija ekran
 */
export function renderEvaluationScreen(result, repGained) {
  const gradeColors = { S: '#F4C430', A: '#5aad5a', B: '#4A6741', C: '#C4956A', D: '#A0522D', F: '#cc3333' };
  const gradeColor = gradeColors[result.satisfactionGrade] || '#888';

  const participantHTML = result.participantResults.map(p => `
    <div class="eval-participant">
      <span class="eval-portrait">😊</span>
      <span class="eval-name">${p.name}</span>
      <span class="eval-sat" style="color:${p.satisfaction >= 80 ? '#5aad5a' : p.satisfaction >= 60 ? '#F4C430' : '#cc3333'}">${p.satisfaction}%</span>
      <span class="eval-mood">${getMoodEmoji(p.mood)}</span>
    </div>
  `).join('');

  return `
    <div class="evaluation-screen">
      <div class="eval-grade" style="color:${gradeColor}">
        ${result.satisfactionGrade}
        <div class="eval-label">${result.satisfactionLabel}</div>
      </div>
      <div class="eval-stats">
        <div class="eval-stat"><span>Zadovoljstvo:</span><span>${formatPct(result.avgSatisfaction)}</span></div>
        <div class="eval-stat"><span>Polaznici:</span><span>${result.participantsFinished}/${result.participantsStarted}</span></div>
        <div class="eval-stat"><span>Naučeno:</span><span>${result.totalLearned}%</span></div>
        <div class="eval-stat"><span>Incidenti:</span><span>${result.incidentCount}</span></div>
        ${result.journalistBonus ? `<div class="eval-stat pos"><span>Novinar bonus:</span><span>+${result.journalistBonus} rep</span></div>` : ''}
        <div class="eval-stat pos"><span>Reputacija:</span><span>+${Math.round(repGained)}</span></div>
      </div>
      <div class="eval-participants">${participantHTML}</div>
    </div>
  `;
}

function getMoodEmoji(mood) {
  const moods = { happy: '😊', neutral: '😐', tired: '😓', unhappy: '😞' };
  return moods[mood] || '😐';
}
