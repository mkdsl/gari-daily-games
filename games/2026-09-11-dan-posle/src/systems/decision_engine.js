/**
 * decision_engine.js — getCurrentNodes, filterByPrestige, node selekcija po satu
 */

import { DECISIONS, DECISIONS_MAP } from '../content/decisions.js';
import { HOURS } from '../config.js';

/**
 * Vrati nodove za dati sat, uzimajući u obzir prestige run
 * U prestige runu: N9 se zamenjuje sa N9B_PRESTIGE, N26 opcije B/C se zamenjuju sa N26B_PRESTIGE
 * @param {number} hour
 * @param {boolean} isPrestige
 * @returns {Array<DecisionNode>}
 */
export function getNodesForHour(hour, isPrestige = false) {
  const nodes = DECISIONS.filter(d => d.hour === hour);
  const result = [];

  for (const node of nodes) {
    // Skip prestige-only nodes u normalnom runu
    if (node.prestige && !isPrestige) continue;
    // U prestige runu, skip noda koji prestige zamenjuje
    if (isPrestige && isReplacedByPrestige(node.id)) continue;
    result.push(node);
  }

  return result;
}

/**
 * Da li je dati ID zamenjen prestige nodom?
 */
function isReplacedByPrestige(nodeId) {
  // N9 je zamenjen sa N9B_PRESTIGE u prestige runu
  if (nodeId === 'N9') return true;
  // N26B_PRESTIGE zamenjuje opcije B i C od N26 — ali ne ceo N26, samo dodaje novi nod
  return false;
}

/**
 * Nodi koji se uvek prikazuju (Toma nodovi, branded nodovi) vs random pool
 * @param {Array} nodes
 * @returns {{ required: Array, optional: Array }}
 */
export function partitionNodes(nodes) {
  const required = nodes.filter(n => n.toma || n.kluboslavija || n.prestige);
  const optional = nodes.filter(n => !n.toma && !n.kluboslavija && !n.prestige);
  return { required, optional };
}

/**
 * Shuffle array (Fisher-Yates)
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Selektuj nodove za dati sat
 * Sve nodove prikazujemo (dizajn: 2-3 po satu, sve su birana)
 * @param {number} hour
 * @param {boolean} isPrestige
 * @param {Array<string>} seenNodes - već viđeni node ID-ovi (ne ponavljamo)
 * @returns {Array<DecisionNode>}
 */
export function selectNodesForHour(hour, isPrestige = false, seenNodes = []) {
  const all = getNodesForHour(hour, isPrestige);
  // Filter already seen (ne bi trebalo da se desi u normal flow)
  return all.filter(n => !seenNodes.includes(n.id));
}

/**
 * Vrati nod po ID-u
 * @param {string} id
 * @returns {DecisionNode|null}
 */
export function getNodeById(id) {
  return DECISIONS_MAP[id] || null;
}

/**
 * Sve opcije za nod, sa filtering za Energija=0
 * @param {DecisionNode} node
 * @param {object} resources
 * @returns {Array}
 */
export function getOptionsForNode(node, resources) {
  const depleted = resources.energija <= 0;
  if (!depleted) return node.options.map(o => ({ ...o, disabled: false, auto: false }));

  // Nađi opciju sa najmanjim E troškom (najveći e delta)
  let bestE = -Infinity;
  for (const opt of node.options) {
    const eDelta = opt.delta?.e ?? 0;
    if (eDelta > bestE) bestE = eDelta;
  }

  // Ako nijedna opcija ne pomaže energiji, sve ostaju enabled
  if (bestE <= 0) {
    return node.options.map(o => ({ ...o, disabled: false, auto: false }));
  }

  return node.options.map(opt => {
    const eDelta = opt.delta?.e ?? 0;
    const isBest = eDelta === bestE;
    return {
      ...opt,
      disabled: !isBest,
      auto: isBest
    };
  });
}

/**
 * Da li je sat poslednji?
 */
export function isLastHour(hourIndex) {
  return hourIndex >= HOURS.length - 1;
}

/**
 * Broj sati ostalo
 */
export function hoursRemaining(currentHourIndex) {
  return HOURS.length - 1 - currentHourIndex;
}
