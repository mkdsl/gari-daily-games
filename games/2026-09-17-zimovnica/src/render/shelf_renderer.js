/**
 * shelf_renderer.js — Renderuje police sa teglama, kapacitet bar, animacije.
 */

import { JAR_ICONS } from '../config.js';
import { usedCapacity, capacityPercent } from '../systems/capacity.js';

/**
 * Renderuje police sa teglama u zadani container element.
 * @param {HTMLElement} container
 * @param {Array} tegle - Jar[] iz state-a
 * @param {number} shelfLevel
 * @param {number} totalCapacity
 */
export function renderShelf(container, tegle, shelfLevel, totalCapacity) {}

/**
 * Gradi DOM za jednu policu.
 * @param {object[]} jarsOnShelf
 * @param {number} idx - Index police
 * @returns {HTMLElement}
 */
function buildShelfEl(jarsOnShelf, idx) {
  const el = document.createElement('div');
  el.className = 'shelf';
  el.dataset.shelfIdx = idx;
  return el;
}

/**
 * Renderuje kapacitet bar (progress bar).
 * @param {HTMLElement} container
 * @param {number} used
 * @param {number} capacity
 */
export function renderCapacityBar(container, used, capacity) {}

/**
 * Renderuje jednu teglu kao DOM element.
 * @param {object} jar
 * @returns {HTMLElement}
 */
export function renderJar(jar) {
  const el = document.createElement('div');
  el.className = `jar jar-${jar.type}`;
  el.textContent = JAR_ICONS[jar.type] || '🫙';
  el.title = `${jar.type}: ${jar.qty.toFixed(1)} kg`;
  return el;
}
