/**
 * aftermath.js — Aftermath stack manager
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import { AFTERMATH_STACK_MAX } from '../config.js';

/**
 * Push new aftermath onto the stack
 * If stack is full (MAX = 3), removes oldest before pushing
 *
 * @param {Object[]} stack - Current aftermath stack (mutated)
 * @param {Object} newAftermath - {type, magnitude, duration, statAffected, label}
 * @returns {Object[]} Updated stack
 */
export function pushAftermath(stack, newAftermath) {
  if (!newAftermath) return stack;

  // If full, remove oldest (index 0)
  if (stack.length >= AFTERMATH_STACK_MAX) {
    stack.shift();
  }

  // Add new aftermath
  stack.push({ ...newAftermath, remainingDuration: newAftermath.duration });
  return stack;
}

/**
 * Apply aftermath modifiers to a base stat value
 * Multiplicative: (1 + Σbuffs) × (1 - Σdebuffs) for the given stat
 *
 * @param {number} baseStat - Base stat value
 * @param {string} statKey - 'E'|'S'|'P'|'L'
 * @param {Object[]} stack - Current aftermath stack
 * @returns {number} Modified stat value
 */
export function applyAftermathToStat(baseStat, statKey, stack) {
  if (!stack.length) return baseStat;

  let buffTotal = 0;
  let debuffTotal = 0;

  for (const aftermath of stack) {
    if (aftermath.statAffected !== statKey && aftermath.statAffected !== 'all') continue;
    if (aftermath.magnitude === 0) continue;

    if (aftermath.type === 'buff') {
      buffTotal += aftermath.magnitude;
    } else if (aftermath.type === 'debuff') {
      debuffTotal += aftermath.magnitude;
    }
    // 'neutral' type doesn't affect stats
  }

  const modified = baseStat * (1 + buffTotal) * (1 - Math.min(debuffTotal, 0.8));
  return Math.max(0, modified);
}

/**
 * Get the combined modifier for a stat as a multiplier
 * @param {string} statKey
 * @param {Object[]} stack
 * @returns {number} Combined multiplier (1.0 = no change)
 */
export function getAftermathMultiplier(statKey, stack) {
  if (!stack.length) return 1.0;

  let buffTotal = 0;
  let debuffTotal = 0;

  for (const aftermath of stack) {
    if (aftermath.statAffected !== statKey && aftermath.statAffected !== 'all') continue;
    if (aftermath.type === 'buff') buffTotal += aftermath.magnitude;
    else if (aftermath.type === 'debuff') debuffTotal += aftermath.magnitude;
  }

  return (1 + buffTotal) * (1 - Math.min(debuffTotal, 0.8));
}

/**
 * Tick aftermath stack — reduce duration by 1, remove expired
 * Call this at the END of each scenario resolution
 *
 * @param {Object[]} stack - Current aftermath stack (mutated)
 * @returns {Object[]} Updated stack with expired items removed
 */
export function tickAftermath(stack) {
  for (let i = stack.length - 1; i >= 0; i--) {
    stack[i].remainingDuration = (stack[i].remainingDuration || stack[i].duration) - 1;
    if (stack[i].remainingDuration <= 0) {
      stack.splice(i, 1);
    }
  }
  return stack;
}

/**
 * Remove first debuff from stack (Dragan ability)
 * @param {Object[]} stack
 * @returns {{removed: Object|null, message: string}}
 */
export function removeFirstDebuff(stack) {
  const idx = stack.findIndex(a => a.type === 'debuff');
  if (idx !== -1) {
    const removed = stack.splice(idx, 1)[0];
    return { removed, message: `Debuff uklonjeno: "${removed.label}"` };
  }
  return { removed: null, message: 'Nema aktivnih debuffova.' };
}

/**
 * Convert worst debuff to neutral (Pedja ability)
 * @param {Object[]} stack
 * @returns {{converted: boolean, message: string}}
 */
export function convertWorstDebuffToNeutral(stack) {
  // Find debuff with highest magnitude
  let worstIdx = -1;
  let worstMag = 0;

  for (let i = 0; i < stack.length; i++) {
    if (stack[i].type === 'debuff' && stack[i].magnitude > worstMag) {
      worstMag = stack[i].magnitude;
      worstIdx = i;
    }
  }

  if (worstIdx !== -1) {
    stack[worstIdx].type = 'neutral';
    stack[worstIdx].magnitude = 0;
    stack[worstIdx].label = 'Zdravica (neutralizovano)';
    return { converted: true, message: 'Pedja diže čašu — debuff neutralizovan!' };
  }
  return { converted: false, message: 'Nema debuffova za neutralizovati.' };
}

/**
 * Clear entire aftermath stack (Stefan emergency protocol)
 * @param {Object[]} stack
 * @returns {{cleared: number, message: string}}
 */
export function clearAftermathStack(stack) {
  const count = stack.length;
  stack.splice(0, stack.length);
  return { cleared: count, message: `Stefan aktivira protokol — ${count} aftermath-a uklonjeno!` };
}

/**
 * Apply duration reduction to all debuffs (SYN04)
 * @param {Object[]} stack
 * @param {number} reduction
 */
export function applyDurationReduction(stack, reduction) {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].type === 'debuff') {
      stack[i].remainingDuration = Math.max(0, (stack[i].remainingDuration || stack[i].duration) - reduction);
      if (stack[i].remainingDuration <= 0) {
        stack.splice(i, 1);
      }
    }
  }
}

/**
 * Get summary of active aftermaths for display
 * @param {Object[]} stack
 * @returns {Object[]} Display-ready aftermath data
 */
export function getAftermathSummary(stack) {
  return stack.map(a => ({
    type: a.type,
    label: a.label,
    statAffected: a.statAffected,
    magnitude: a.magnitude,
    remainingDuration: a.remainingDuration || a.duration,
    icon: a.type === 'buff' ? '↑' : a.type === 'debuff' ? '↓' : '—',
    color: a.type === 'buff' ? '#39ff14' : a.type === 'debuff' ? '#ff4444' : '#94a3b8'
  }));
}

/**
 * Check if aftermath stack has any active debuffs
 * @param {Object[]} stack
 * @returns {boolean}
 */
export function hasActiveDebuffs(stack) {
  return stack.some(a => a.type === 'debuff' && a.magnitude > 0);
}

/**
 * Count buffs and debuffs
 * @param {Object[]} stack
 * @returns {{buffs: number, debuffs: number}}
 */
export function countAftermaths(stack) {
  return {
    buffs: stack.filter(a => a.type === 'buff').length,
    debuffs: stack.filter(a => a.type === 'debuff').length
  };
}
