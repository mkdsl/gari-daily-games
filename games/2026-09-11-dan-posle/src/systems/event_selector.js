/**
 * event_selector.js — Selekcija nodova po satu, redosled u sesiji
 */

import { selectNodesForHour } from './decision_engine.js';
import { HOURS } from '../config.js';

/**
 * Vrati uređenu listu nodova za jedan sat
 * Toma nodovi se stavljaju na kraj sata (emotivni closing)
 * Kluboslavija nodovi idu kao drugi
 * @param {number} hour
 * @param {boolean} isPrestige
 * @param {Array<string>} seenNodes
 * @returns {Array<DecisionNode>}
 */
export function getOrderedNodesForHour(hour, isPrestige = false, seenNodes = []) {
  const nodes = selectNodesForHour(hour, isPrestige, seenNodes);

  // Sortiraj: regular → kluboslavija → toma
  const regular = nodes.filter(n => !n.toma && !n.kluboslavija);
  const kl = nodes.filter(n => n.kluboslavija && !n.toma);
  const toma = nodes.filter(n => n.toma);

  return [...regular, ...kl, ...toma];
}

/**
 * Ukupan broj nodova za celu igru (za progress tracker)
 * @param {boolean} isPrestige
 * @returns {number}
 */
export function totalNodeCount(isPrestige = false) {
  let count = 0;
  for (const hour of HOURS) {
    count += selectNodesForHour(hour, isPrestige).length;
  }
  return count;
}

/**
 * Index noda u globalnom toku igre (za progress)
 * @param {number} hourIndex
 * @param {number} nodeIndexInHour
 * @param {boolean} isPrestige
 * @returns {number}
 */
export function globalNodeIndex(hourIndex, nodeIndexInHour, isPrestige = false) {
  let total = 0;
  for (let i = 0; i < hourIndex; i++) {
    total += selectNodesForHour(HOURS[i], isPrestige).length;
  }
  return total + nodeIndexInHour;
}

/**
 * Da li je ovo zadnji nod u igri?
 */
export function isVeryLastNode(hourIndex, nodeIndexInHour, isPrestige = false) {
  const lastHourIndex = HOURS.length - 1;
  if (hourIndex < lastHourIndex) return false;
  const lastHourNodes = selectNodesForHour(HOURS[lastHourIndex], isPrestige);
  return nodeIndexInHour >= lastHourNodes.length - 1;
}
