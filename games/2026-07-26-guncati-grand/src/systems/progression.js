/** @fileoverview Week advancement, building unlock check, volunteer pool expansion */

import { CONFIG } from '../config.js';
import { getState, setState, saveState } from '../state.js';
import { createVolunteer, VOLUNTEER_TYPES } from '../entities/volunteer.js';
import { calcCrowdSize, calcCrowdCap } from '../entities/crowd.js';
import { calcWeeklyRevenue, applyAllocationEffects } from './economy.js';
import { updateWB, calcWBGain, calcBuildingWBBonus, calcVolunteerVibeContrib } from './wellbeing.js';
import { resolveMicro } from './micro.js';

/**
 * Advance the game to the next week
 * Applies all weekly effects: WB update, revenue, crowd growth, volunteer recovery
 * @param {Object} microResult - output from resolveMicro
 * @returns {Object} week result summary
 */
export function advanceWeek(microResult) {
  const state = getState();
  const { allocation, volunteers, buildings, currentWB, week } = state;

  // WB calculation
  const hranaGC = allocation.hrana || 0;
  const zajednicaGC = allocation.zajednica || 0;
  const investedInWB = hranaGC > 0 || zajednicaGC > 0;
  const wbGain = calcWBGain(hranaGC, zajednicaGC);
  const buildingWBBonus = calcBuildingWBBonus(buildings);
  const vibeContrib = calcVolunteerVibeContrib(volunteers);
  const microFoodBonus = microResult?.foodWBBonus || 0;
  const totalGain = wbGain + buildingWBBonus * 0.5 + vibeContrib + microFoodBonus;

  // Decay: no invest in WB
  const wbDecay = investedInWB ? 0 : CONFIG.WB_DECAY_NO_INVEST;
  const newWB = updateWB(currentWB, totalGain, wbDecay);

  // Revenue
  const weekRevenue = calcWeeklyRevenue(state);

  // Crowd
  applyAllocationEffects(state, allocation);
  const newCrowdCap = calcCrowdCap(state);
  const newCrowdSize = calcCrowdSize(state);

  // Update volunteers with weekly recovery
  const updatedVolunteers = (microResult?.updatedVolunteers || volunteers).map(v => {
    // Partial energy recovery between weeks
    const energyRecovery = investedInWB ? 30 : 15;
    return {
      ...v,
      energija: Math.min(100, v.energija + energyRecovery),
      memoryWeeks: Math.max(0, (v.memoryWeeks || 0) - 1)
    };
  });

  // Check for new volunteer unlocks
  const newVolunteers = checkVolunteerUnlocks(week, updatedVolunteers);

  // Build weekly result
  const weeklyResult = {
    week,
    newWB,
    wbDelta: newWB - currentWB,
    revenue: weekRevenue,
    crowdSize: newCrowdSize,
    crowdCap: newCrowdCap,
    microOutput: microResult?.totalOutput || 0,
    newVolunteers: newVolunteers.map(v => v.name)
  };

  // Record weekly WB
  const weeklyWB = [...(state.weeklyWB || []), newWB];

  // State update
  setState({
    week: week + 1,
    currentWB: newWB,
    totalRevenue: (state.totalRevenue || 0) + weekRevenue,
    crowdSize: newCrowdSize,
    seasonCrowdCap: newCrowdCap,
    volunteers: [...updatedVolunteers, ...newVolunteers],
    weeklyWB,
    buildingUpgradesThisWeek: 0,
    allocationLocked: false,
    allocation: { gradnja: 0, hrana: 0, marketing: 0, zajednica: 0 },
    volunteerAssignments: {},
    weeklyResults: [...(state.weeklyResults || []), weeklyResult]
  });

  saveState();
  return weeklyResult;
}

/**
 * Check if new volunteers should join this week
 * @param {number} week
 * @param {Object[]} existingVolunteers
 * @returns {Object[]} new volunteer instances
 */
export function checkVolunteerUnlocks(week, existingVolunteers) {
  const schedule = CONFIG.VOLUNTEER_UNLOCK_SCHEDULE;
  const existingTypeIds = new Set(existingVolunteers.map(v => v.typeId));
  const newOnes = [];

  for (const [unlockWeek, typeIds] of Object.entries(schedule)) {
    if (week + 1 === parseInt(unlockWeek)) { // they join at start of NEXT week
      for (const typeId of typeIds) {
        if (!existingTypeIds.has(typeId)) {
          newOnes.push(createVolunteer(typeId));
          existingTypeIds.add(typeId);
        }
      }
    }
  }

  return newOnes;
}

/**
 * Get progress toward finale (week 10)
 * @param {number} week
 * @returns {{ progress: number, label: string, urgency: string }}
 */
export function getFinaleProgress(week) {
  const progress = (week - 1) / (CONFIG.WEEKS - 1);
  let label, urgency;

  if (week <= 3) {
    label = 'Rana faza — gradi temelje';
    urgency = 'low';
  } else if (week <= 6) {
    label = 'Sredina sezone — ubrzan ritam';
    urgency = 'medium';
  } else if (week <= 8) {
    label = 'Finale se bliži!';
    urgency = 'high';
  } else {
    label = `Nedelja ${week} od ${CONFIG.WEEKS} — poslednji trčaj!`;
    urgency = 'critical';
  }

  return { progress, label, urgency };
}

/**
 * Check if the game should transition to finale
 * @param {number} week
 * @returns {boolean}
 */
export function shouldStartFinale(week) {
  return week > CONFIG.WEEKS;
}

/**
 * Resolve building upgrade during macro phase
 * @param {string} buildingId
 * @param {Object} state - mutable via setState
 * @returns {{ success: boolean, cost: number, newLevel: number }}
 */
export function resolveBuildingUpgrade(buildingId) {
  const state = getState();
  const currentLevel = state.buildings[buildingId] || 0;
  const building = CONFIG.BUILDINGS[buildingId];
  if (!building) return { success: false, cost: 0, newLevel: currentLevel };

  const levelDef = building.levels[currentLevel];
  if (!levelDef) return { success: false, cost: 0, newLevel: currentLevel, reason: 'Max level' };

  const cost = levelDef.cost;
  if (state.gcBalance < cost) return { success: false, cost, newLevel: currentLevel, reason: 'Nema dovoljno GC' };
  if (state.buildingUpgradesThisWeek >= CONFIG.MAX_BUILDING_UPGRADES_PER_WEEK) {
    return { success: false, cost, newLevel: currentLevel, reason: 'Max upgrade-a ove nedelje' };
  }

  const newLevel = currentLevel + 1;
  setState({
    buildings: { ...state.buildings, [buildingId]: newLevel },
    gcBalance: state.gcBalance - cost,
    buildingUpgradesThisWeek: state.buildingUpgradesThisWeek + 1
  });

  // Handle building unlocks
  if (levelDef.unlockBuilding) {
    // Mark newly accessible buildings (they just become visible)
  }

  return { success: true, cost, newLevel };
}
