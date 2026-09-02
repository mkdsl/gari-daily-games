/** @fileoverview WB formula, decay per week, Tom Sawyer threshold (60%), combo cap */

import { CONFIG } from '../config.js';

/**
 * Calculate wellbeing gain from hrana + zajednica allocation
 * @param {number} hranaGC
 * @param {number} zajednicaGC
 * @returns {number} WB gain (0-100 range, capped by WB_COMBO_CAP)
 */
export function calcWBGain(hranaGC, zajednicaGC) {
  // Hrana: base 10 + 1 per GC
  const hranaGain = CONFIG.CATEGORIES.hrana.baseEffect.wellbeing +
    hranaGC * CONFIG.CATEGORIES.hrana.perUnit.wellbeing;

  // Zajednica: base 12 + 1.25 per 8 GC
  const zajednicaGain = CONFIG.CATEGORIES.zajednica.baseEffect.wellbeing +
    (zajednicaGC / 8) * CONFIG.CATEGORIES.zajednica.perUnit.wellbeing;

  // Combined cap
  return Math.min(hranaGain + zajednicaGain, CONFIG.WB_COMBO_CAP);
}

/**
 * Calculate WB decay for a week
 * @param {boolean} investedInWB - whether hrana or zajednica > 0
 * @param {boolean} hadEvent - whether a major event happened this week
 * @returns {number} WB loss
 */
export function calcWBDecay(investedInWB, hadEvent) {
  let decay = 0;
  if (!investedInWB) decay += CONFIG.WB_DECAY_NO_INVEST;
  if (hadEvent) decay += CONFIG.WB_DECAY_POST_EVENT;
  return decay;
}

/**
 * Apply weekly WB update
 * @param {number} currentWB
 * @param {number} gain
 * @param {number} decay
 * @returns {number} new WB value
 */
export function updateWB(currentWB, gain, decay) {
  const newWB = currentWB + gain - decay;
  return Math.max(CONFIG.WB_MIN, Math.min(100, newWB));
}

/**
 * Calculate Tom Sawyer volunteer cost savings based on WB
 * @param {number} wb - current WB %
 * @returns {{ savingsPerVolunteer: number, isFree: boolean, overThreshold: number }}
 */
export function calcTomSawyerEffect(wb) {
  if (wb < CONFIG.TOM_SAWYER_THRESHOLD) {
    return { savingsPerVolunteer: 0, isFree: false, overThreshold: 0 };
  }
  const over = wb - CONFIG.TOM_SAWYER_THRESHOLD;
  const totalSavings = over * CONFIG.TOM_SAWYER_SAVINGS_PER_POINT;
  return {
    savingsPerVolunteer: CONFIG.TOM_SAWYER_SAVINGS_PER_POINT,
    totalSavings,
    isFree: totalSavings >= CONFIG.VOLUNTEER_COST,
    overThreshold: over
  };
}

/**
 * Get WB status label and color
 * @param {number} wb
 * @returns {{ label: string, color: string, tomSawyerActive: boolean }}
 */
export function getWBStatus(wb) {
  const tomSawyerActive = wb >= CONFIG.TOM_SAWYER_THRESHOLD;
  let label, color;

  if (wb >= 85) {
    label = '🌟 Zajednica cveta!';
    color = '#4caf50';
  } else if (wb >= 70) {
    label = '😊 Volonteri zadovoljni';
    color = '#8bc34a';
  } else if (wb >= CONFIG.TOM_SAWYER_THRESHOLD) {
    label = `✊ Tom Sawyer aktivan (${wb}%)`;
    color = '#2196f3';
  } else if (wb >= 40) {
    label = '😐 Solidno';
    color = '#ff9800';
  } else if (wb >= 30) {
    label = '😟 Nezadovoljni';
    color = '#f44336';
  } else {
    label = '⚠️ Kritično!';
    color = '#9c27b0';
  }

  return { label, color, tomSawyerActive };
}

/**
 * Calculate community vibe score (average WB from weeks 7-10, weighted)
 * @param {number[]} weeklyWB - WB values per week (index = week - 1)
 * @returns {number} 0-100
 */
export function calcCommunityVibe(weeklyWB) {
  if (!weeklyWB || weeklyWB.length === 0) return 0;
  const lateWeeks = weeklyWB.slice(6, 10); // weeks 7-10 (0-indexed 6-9)
  if (lateWeeks.length === 0) return weeklyWB.reduce((a, b) => a + b, 0) / weeklyWB.length;
  const avg = lateWeeks.reduce((a, b) => a + b, 0) / lateWeeks.length;
  return Math.min(100, avg * 2); // ×2 weighting as per spec, cap at 100
}

/**
 * WB effect from building wellbeing sum
 * @param {Object} buildings - { id: level }
 * @returns {number} bonus WB to add per week
 */
export function calcBuildingWBBonus(buildings) {
  let bonus = 0;
  const CONFIG_BUILDINGS = CONFIG.BUILDINGS;
  for (const [id, level] of Object.entries(buildings)) {
    if (level === 0) continue;
    const b = CONFIG_BUILDINGS[id];
    if (!b) continue;
    for (let l = 0; l < level; l++) {
      const def = b.levels[l];
      if (def && def.wellbeing) bonus += def.wellbeing;
    }
  }
  return bonus;
}

/**
 * Calculate volunteer vibe effect on WB
 * @param {Array} volunteers
 * @returns {number} vibe contribution delta
 */
export function calcVolunteerVibeContrib(volunteers) {
  if (!volunteers || volunteers.length === 0) return 0;
  const avgVibe = volunteers.reduce((sum, v) => sum + v.vibe, 0) / volunteers.length;
  // Vibe above 50 contributes positively, below negatively
  return (avgVibe - 50) * 0.1;
}

/** Lines shown when WB first crosses 60% (Tom Sawyer unlock) */
export const WB_MILESTONE_LINES = {
  threshold60: [
    'Ekipa je srećna! Ana trči bez pitanja zašto.',
    'Nešto se promenilo na terenu — volonteri daju više nego što im tražiš.',
    'Biljana se smeši. Pravi znak da je sve u redu.',
    'Mika je prestao da priča o odlasku. Tom Sawyer radi.'
  ],
  below40: [
    'Đule kasni. Maja sluša muziku na maksimumu. Ne dobro.',
    'Jovana nije kuvala jutros. Nešto je puklo.',
    'Dragan nije izvadio kameru ceo dan. To je loš znak.',
    'Biljana je prekrižila tri stvari na listi. Nijedna nije bila planirana.'
  ]
};

/**
 * Check if WB crossed a milestone threshold
 * @param {number} prevWB
 * @param {number} currentWB
 * @returns {'threshold60'|'below40'|null}
 */
export function checkWBMilestone(prevWB, currentWB) {
  if (prevWB < 60 && currentWB >= 60) return 'threshold60';
  if (prevWB >= 40 && currentWB < 40) return 'below40';
  return null;
}
