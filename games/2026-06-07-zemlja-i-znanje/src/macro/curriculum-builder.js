/**
 * curriculum-builder.js — Logika rasporeda modula u programu
 */

import { getModulesForTema, getRequiredModules } from './module-catalog.js';
import { SESSION_SLOTS, EVALUACIJA_REQUIRED_SLOT, PAUZA_FORBIDDEN_SLOTS } from '../config.js';

/**
 * Validira plan sesije
 * @param {Array} plan — [{slotIndex, activity}]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePlan(plan) {
  const errors = [];

  if (!plan || plan.length !== SESSION_SLOTS) {
    errors.push(`Plan mora imati tačno ${SESSION_SLOTS} slotova.`);
    return { valid: false, errors };
  }

  // Pauza ne sme biti u prva 2 ili poslednji slot
  for (const forbidden of PAUZA_FORBIDDEN_SLOTS) {
    const slot = plan[forbidden];
    if (slot && slot.activity === 'pauza') {
      errors.push(`Pauza nije dozvoljena u slotu ${forbidden + 1}.`);
    }
  }

  // Poslednji slot mora biti evaluacija
  const lastSlot = plan[SESSION_SLOTS - 1];
  if (!lastSlot || lastSlot.activity !== 'evaluacija') {
    errors.push('Poslednji slot mora biti Evaluacija.');
  }

  // Mora biti barem jedna pauza
  const hasPauza = plan.some(s => s.activity === 'pauza');
  if (!hasPauza) {
    errors.push('Mora biti barem jedna Pauza u sesiji.');
  }

  // Ne sme biti vise od 2 uzastopne teorije
  let consecutiveTheory = 0;
  for (const slot of plan) {
    if (slot.activity === 'teorija') {
      consecutiveTheory++;
      if (consecutiveTheory > 2) {
        errors.push('Ne sme biti više od 2 uzastopne teorije — polaznici se umaraju.');
        break;
      }
    } else {
      consecutiveTheory = 0;
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generise default validan plan za temu
 * @param {string} temaId
 * @returns {Array} plan
 */
export function generateDefaultPlan(temaId) {
  const plan = [
    { slotIndex: 0, activity: 'teorija',       locked: false },
    { slotIndex: 1, activity: 'demonstracija', locked: false },
    { slotIndex: 2, activity: 'prakticni_rad', locked: false },
    { slotIndex: 3, activity: 'teorija',       locked: false },
    { slotIndex: 4, activity: 'pauza',         locked: false },
    { slotIndex: 5, activity: 'prakticni_rad', locked: false },
    { slotIndex: 6, activity: 'demonstracija', locked: false },
    { slotIndex: 7, activity: 'evaluacija',    locked: true  }
  ];
  return plan;
}

/**
 * Optimalni plan za temu (favorizuje outdoor teme praktičnim radom)
 */
export function generateOptimalPlan(temaId) {
  const outdoorHeavy = ['suvozid', 'rammed_earth', 'akvakultura', 'kombinovani'];
  if (outdoorHeavy.includes(temaId)) {
    return [
      { slotIndex: 0, activity: 'teorija',       locked: false },
      { slotIndex: 1, activity: 'demonstracija', locked: false },
      { slotIndex: 2, activity: 'prakticni_rad', locked: false },
      { slotIndex: 3, activity: 'prakticni_rad', locked: false },
      { slotIndex: 4, activity: 'pauza',         locked: false },
      { slotIndex: 5, activity: 'prakticni_rad', locked: false },
      { slotIndex: 6, activity: 'demonstracija', locked: false },
      { slotIndex: 7, activity: 'evaluacija',    locked: true  }
    ];
  }
  return generateDefaultPlan(temaId);
}

/**
 * Vraca quality score plana (0-100)
 * Osnova za satisfaction bonus
 */
export function scorePlan(plan) {
  const { valid, errors } = validatePlan(plan);
  if (!valid) return 0;

  let score = 70; // base

  // Bonus za raznolikost aktivnosti
  const types = new Set(plan.map(s => s.activity));
  score += (types.size - 2) * 5;

  // Penalty za previše teorije na pocetku
  const firstThreeTheory = plan.slice(0, 3).filter(s => s.activity === 'teorija').length;
  if (firstThreeTheory >= 3) score -= 10;

  // Bonus za prakticni rad posle demonstracije
  for (let i = 1; i < plan.length; i++) {
    if (plan[i - 1].activity === 'demonstracija' && plan[i].activity === 'prakticni_rad') {
      score += 5;
    }
  }

  return Math.min(100, Math.max(0, score));
}
