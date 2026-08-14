/** @fileoverview Volunteer task assignment engine, compatibility check, output calculation */

import { CONFIG } from '../config.js';
import {
  VOLUNTEER_TYPES,
  TASK_ENERGY_COST,
  getTaskEffectiveness,
  applyTaskDecay,
  applyRest,
  applyFoodRecovery,
  isDjuleContagious
} from '../entities/volunteer.js';

/**
 * Assign a task to a volunteer
 * @param {Object} volunteer - mutable
 * @param {string} taskId
 * @returns {{ success: boolean, reason: string }}
 */
export function assignTask(volunteer, taskId) {
  if (taskId === 'rest') {
    applyRest(volunteer);
    return { success: true, reason: '' };
  }

  if (taskId === 'hrana_r') {
    const hasBar = false; // passed from caller if needed
    applyFoodRecovery(volunteer, hasBar);
    return { success: true, reason: '' };
  }

  const energyCost = (TASK_ENERGY_COST[taskId] || 2) * 10;
  if (volunteer.energija < energyCost) {
    return { success: false, reason: `${volunteer.name} nema energije za ${taskId}` };
  }

  applyTaskDecay(volunteer, taskId, volunteer.typeId);
  volunteer.tasksCompletedTotal = (volunteer.tasksCompletedTotal || 0) + 1;
  return { success: true, reason: '' };
}

/**
 * Get task output score for a volunteer-task pair
 * @param {string} typeId
 * @param {string} taskId
 * @param {number} energija - current energy (0-100)
 * @param {number} vibe - current vibe (0-100)
 * @returns {number} output score 0-100
 */
export function getTaskOutput(typeId, taskId, energija, vibe) {
  const eff = getTaskEffectiveness(typeId, taskId);
  const energyFactor = energija / 100;
  const vibeFactor = 0.7 + (vibe / 100) * 0.3;
  return Math.round(eff * energyFactor * vibeFactor * 100);
}

/**
 * Resolve all volunteer assignments for the week
 * @param {Object[]} volunteers
 * @param {Object} assignments - { volunteerId: taskId }
 * @param {Object} state - game state for context
 * @returns {Object} micro result
 */
export function resolveMicro(volunteers, assignments, state) {
  const results = [];
  const unassigned = [];
  let totalOutput = 0;
  let buildProgress = 0;
  let foodQuality = 0;
  let photoCount = 0;
  let adminBonus = 0;
  let barBonus = 0;

  // Find Đule for contagion check
  const djule = volunteers.find(v => v.typeId === 'djule');
  const djuleContagious = isDjuleContagious(djule);

  // Process each volunteer
  const mutVolunteers = volunteers.map(v => ({ ...v }));

  for (const volunteer of mutVolunteers) {
    const taskId = assignments[volunteer.id];
    if (!taskId) {
      unassigned.push(volunteer.name);
      continue;
    }

    // Apply Đule contagion
    if (djuleContagious && volunteer.typeId !== 'djule') {
      volunteer.vibe = Math.max(0, volunteer.vibe - 10);
    }

    const output = getTaskOutput(volunteer.typeId, taskId, volunteer.energija, volunteer.vibe);
    const eff = getTaskEffectiveness(volunteer.typeId, taskId);

    // Accumulate task-specific outputs
    switch (taskId) {
      case 'kopanje':
      case 'tesanje':
        buildProgress += output;
        break;
      case 'kuvanje':
        foodQuality += output;
        break;
      case 'foto':
        photoCount += output;
        break;
      case 'admin':
        adminBonus += output;
        break;
      case 'bar':
        barBonus += output;
        break;
    }

    totalOutput += output;

    results.push({
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      taskId,
      output,
      effectiveness: eff,
      energijaBefore: volunteers.find(v => v.id === volunteer.id)?.energija,
      energijaAfter: volunteer.energija
    });

    // Apply decay
    if (taskId !== 'rest' && taskId !== 'hrana_r') {
      applyTaskDecay(volunteer, taskId, volunteer.typeId);
    }
  }

  // Normalize outputs to bonuses
  const avgOutput = results.length > 0 ? totalOutput / results.length : 0;

  // Build progress contributes to crowd cap
  const buildBonus = Math.floor(buildProgress / 100);

  // Food quality contributes to WB
  const foodWBBonus = Math.floor((foodQuality / 100) * 5);

  // Photo boosts marketing effectiveness for next week
  const photoMarketingBonus = Math.floor(photoCount / 100);

  // Admin reduces next week's overhead
  const adminCostReduction = Math.floor(adminBonus / 100) * 5;

  // Bar quality affects WB during finale
  const barWBBonus = Math.floor(barBonus / 100) * 3;

  return {
    taskResults: results,
    unassigned,
    totalOutput: Math.floor(avgOutput),
    buildBonus,
    foodWBBonus,
    photoMarketingBonus,
    adminCostReduction,
    barWBBonus,
    djuleContagionActive: djuleContagious,
    updatedVolunteers: mutVolunteers
  };
}

/**
 * Calculate volunteer pool for a given week
 * @param {number} week
 * @param {boolean} isPrestige
 * @returns {string[]} typeIds available to unlock
 */
export function getAvailableVolunteerTypes(week, isPrestige) {
  const schedule = CONFIG.VOLUNTEER_UNLOCK_SCHEDULE;
  const available = [];
  for (const [unlockWeek, types] of Object.entries(schedule)) {
    if (week >= parseInt(unlockWeek)) {
      available.push(...types);
    }
  }
  return available;
}

/**
 * Get task assignments summary for display
 * @param {Object[]} volunteers
 * @param {Object} assignments
 * @returns {Object[]}
 */
export function getAssignmentSummary(volunteers, assignments) {
  return volunteers.map(v => ({
    volunteer: v,
    task: assignments[v.id] || null,
    output: assignments[v.id]
      ? getTaskOutput(v.typeId, assignments[v.id], v.energija, v.vibe)
      : 0
  }));
}

/**
 * Suggest optimal task for volunteer
 * @param {Object} volunteer
 * @param {string[]} availableTasks
 * @returns {string} suggested taskId
 */
export function suggestTask(volunteer, availableTasks) {
  if (volunteer.energija < 20) return 'rest';
  if (volunteer.glad < 20) return 'hrana_r';

  let best = null;
  let bestEff = -1;
  for (const taskId of availableTasks) {
    const eff = getTaskEffectiveness(volunteer.typeId, taskId);
    if (eff > bestEff) {
      bestEff = eff;
      best = taskId;
    }
  }
  return best || 'rest';
}
