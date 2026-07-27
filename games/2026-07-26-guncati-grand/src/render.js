/** @fileoverview DOM screen routing, farm visualization update, frame manager */

import { getState } from './state.js';
import { CONFIG } from './config.js';

/** @type {HTMLElement|null} */
let _farmVizEl = null;

/** @type {number|null} RAF id for any continuous render */
let _animRaf = null;

/**
 * Initialize render system
 * @param {HTMLElement} appEl
 */
export function initRender(appEl) {
  _farmVizEl = null; // Will be set per-screen
}

/**
 * Render farm visualization grid based on building levels
 * @param {HTMLElement} container - target element for farm grid
 * @param {Object} buildings - { id: level }
 * @param {number} wb - wellbeing %
 */
export function renderFarmGrid(container, buildings, wb) {
  if (!container) return;

  const cells = buildFarmCells(buildings, wb);
  container.innerHTML = `<div class="farm-grid-inner">${cells}</div>`;
}

/**
 * Build farm cell HTML
 * @param {Object} buildings
 * @param {number} wb
 * @returns {string}
 */
function buildFarmCells(buildings, wb) {
  const cells = [];
  const BUILDING_LAYOUTS = {
    pozornica: { row: 0, col: 2, label: '🎪' },
    wc:        { row: 2, col: 0, label: '🚻' },
    satre:     { row: 1, col: 1, label: '⛺' },
    bar:       { row: 2, col: 2, label: '🍺' },
    parking:   { row: 0, col: 0, label: '🅿️' }
  };

  // Build 3x3 grid
  const grid = Array.from({ length: 3 }, () => Array(3).fill(null));

  for (const [id, level] of Object.entries(buildings)) {
    if (level === 0) continue;
    const layout = BUILDING_LAYOUTS[id];
    if (!layout) continue;
    grid[layout.row][layout.col] = { id, level, label: layout.label };
  }

  // WB-based terrain color
  const terrainColor = wb >= 60 ? '#2d5016' : wb >= 40 ? '#4a6e2a' : '#8B4513';

  grid.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (cell) {
        const sizeClass = cell.level >= 3 ? 'cell-large' : cell.level >= 2 ? 'cell-medium' : 'cell-small';
        cells.push(`
          <div class="farm-cell ${sizeClass}" data-building="${cell.id}" title="${cell.id} L${cell.level}"
               style="grid-row:${ri+1};grid-column:${ci+1}">
            <span class="cell-emoji">${cell.label}</span>
            <span class="cell-level">L${cell.level}</span>
          </div>
        `);
      } else {
        cells.push(`
          <div class="farm-cell farm-cell-empty"
               style="grid-row:${ri+1};grid-column:${ci+1};background:${terrainColor}">
            <span class="cell-terrain">🌱</span>
          </div>
        `);
      }
    });
  });

  return cells.join('');
}

/**
 * Animate a building upgrade pulse
 * @param {string} buildingId
 */
export function animateBuildingUpgrade(buildingId) {
  const cell = document.querySelector(`[data-building="${buildingId}"]`);
  if (!cell) return;

  cell.classList.add('cell-upgrade-pulse');
  setTimeout(() => cell.classList.remove('cell-upgrade-pulse'), 800);
}

/**
 * WB pulse animation (when Tom Sawyer activates)
 * @param {HTMLElement} container
 */
export function animateWBPulse(container) {
  if (!container) return;
  container.classList.add('wb-pulse-active');
  setTimeout(() => container.classList.remove('wb-pulse-active'), 1000);
}

/**
 * Render crowd visualization (dots representing crowd size)
 * @param {HTMLElement} container
 * @param {number} crowdSize
 * @param {number} crowdCap
 * @param {number} mood - 0-100
 */
export function renderCrowdDots(container, crowdSize, crowdCap, mood) {
  if (!container) return;

  const pct = crowdCap > 0 ? crowdSize / crowdCap : 0;
  const dotCount = Math.min(Math.floor(pct * 20), 20);
  const moodEmoji = mood >= 70 ? '😄' : mood >= 50 ? '😊' : mood >= 30 ? '😐' : '😟';

  const dots = Array.from({ length: 20 }, (_, i) =>
    `<span class="crowd-dot ${i < dotCount ? 'crowd-dot-filled' : 'crowd-dot-empty'}"></span>`
  ).join('');

  container.innerHTML = `
    <div class="crowd-dots">${dots}</div>
    <div class="crowd-label">${moodEmoji} ${crowdSize}/${crowdCap}</div>
  `;
}

/**
 * Screen transition animation
 * @param {HTMLElement} container
 * @param {'in'|'out'} direction
 * @returns {Promise}
 */
export function animateScreenTransition(container, direction) {
  return new Promise(resolve => {
    container.classList.add(`screen-${direction}`);
    setTimeout(() => {
      container.classList.remove(`screen-${direction}`);
      resolve();
    }, 250);
  });
}

/**
 * Start a continuous render loop (for animations not tied to finale RAF)
 * @param {Function} onFrame - called each frame
 */
export function startRenderLoop(onFrame) {
  stopRenderLoop();
  const loop = (timestamp) => {
    onFrame(timestamp);
    _animRaf = requestAnimationFrame(loop);
  };
  _animRaf = requestAnimationFrame(loop);
}

/**
 * Stop the render loop
 */
export function stopRenderLoop() {
  if (_animRaf) {
    cancelAnimationFrame(_animRaf);
    _animRaf = null;
  }
}

/**
 * Shake screen effect (for critical events)
 * @param {HTMLElement} el
 * @param {number} intensity - 1-5
 */
export function screenShake(el, intensity = 2) {
  if (!el) return;
  el.style.transform = `translate(${intensity}px, ${intensity}px)`;
  setTimeout(() => {
    el.style.transform = `translate(-${intensity}px, 0)`;
    setTimeout(() => {
      el.style.transform = '';
    }, 50);
  }, 50);
}
