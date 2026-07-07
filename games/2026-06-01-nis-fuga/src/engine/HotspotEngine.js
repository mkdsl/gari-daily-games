/**
 * HotspotEngine.js — Click/touch hotspot detection for scene backgrounds
 * Hotspot positions are defined as percentage of container dimensions
 * @module HotspotEngine
 */

import EventBus, { EVENTS } from './EventBus.js';
import GameState from '../utils/GameState.js';
import AchievementSystem from './AchievementSystem.js';

/** @type {Array<object>} Current scene's hotspots */
let activeHotspots = [];

/** @type {string} Current scene id */
let currentSceneId = '';

/** @type {HTMLElement|null} Container element */
let containerEl = null;

/** @type {HTMLElement|null} Tooltip element */
let tooltipEl = null;

/** @type {Function} Cleanup listeners */
let cleanup = null;

/**
 * Initialize hotspot engine on a container element
 * @param {HTMLElement} container
 */
export function init(container) {
  containerEl = container;

  // Create tooltip element
  tooltipEl = document.createElement('div');
  tooltipEl.className = 'hotspot-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');
  document.body.appendChild(tooltipEl);
}

/**
 * Load hotspots for a scene
 * @param {string} sceneId
 * @param {Array} hotspots
 */
export function loadHotspots(sceneId, hotspots) {
  currentSceneId = sceneId;
  activeHotspots = hotspots ?? [];

  // Remove existing hotspot overlays
  containerEl?.querySelectorAll('.hotspot-overlay').forEach(el => el.remove());

  if (!containerEl) return;

  // Create hotspot overlay elements
  for (const hs of activeHotspots) {
    const el = createHotspotElement(hs);
    containerEl.appendChild(el);
  }

  attachListeners();
}

/**
 * Create a hotspot DOM element
 * @param {object} hs
 * @returns {HTMLElement}
 */
function createHotspotElement(hs) {
  const el = document.createElement('div');
  el.className = 'hotspot-overlay';
  el.dataset.id = hs.id;
  el.style.cssText = `
    position: absolute;
    left: ${hs.x}%;
    top: ${hs.y}%;
    width: ${hs.w}%;
    height: ${hs.h}%;
    cursor: pointer;
    z-index: 10;
    min-width: 48px;
    min-height: 48px;
  `;

  // Label
  const label = document.createElement('div');
  label.className = 'hotspot-label';
  label.textContent = hs.label;
  el.appendChild(label);

  // Check if visited once
  if (hs.once && GameState.isHotspotVisited(currentSceneId, hs.id)) {
    el.classList.add('visited');
  }

  return el;
}

/**
 * Attach click and hover listeners
 */
function attachListeners() {
  if (!containerEl) return;

  if (cleanup) cleanup();

  const handleClick = (e) => {
    const target = e.target.closest('.hotspot-overlay');
    if (!target) return;
    handleHotspotClick(target.dataset.id, e);
  };

  const handleMouseMove = (e) => {
    const target = e.target.closest('.hotspot-overlay');
    if (target) {
      handleHotspotHover(target.dataset.id, e);
    } else {
      hideTooltip();
    }
  };

  const handleMouseLeave = () => hideTooltip();

  // Touch support
  const handleTouch = (e) => {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.hotspot-overlay');
    if (target) {
      e.preventDefault();
      handleHotspotClick(target.dataset.id, touch);
    }
  };

  containerEl.addEventListener('click', handleClick);
  containerEl.addEventListener('mousemove', handleMouseMove);
  containerEl.addEventListener('mouseleave', handleMouseLeave);
  containerEl.addEventListener('touchend', handleTouch, { passive: false });

  cleanup = () => {
    containerEl.removeEventListener('click', handleClick);
    containerEl.removeEventListener('mousemove', handleMouseMove);
    containerEl.removeEventListener('mouseleave', handleMouseLeave);
    containerEl.removeEventListener('touchend', handleTouch);
    hideTooltip();
  };
}

/**
 * Handle hotspot click
 * @param {string} hotspotId
 * @param {Event} e
 */
function handleHotspotClick(hotspotId, e) {
  const hs = activeHotspots.find(h => h.id === hotspotId);
  if (!hs) return;

  // Check if once-visited
  const visited = GameState.isHotspotVisited(currentSceneId, hotspotId);
  if (hs.once && visited) return;

  EventBus.emit(EVENTS.HOTSPOT_CLICK, {
    sceneId: currentSceneId,
    hotspot: hs,
    x: e.clientX ?? 0,
    y: e.clientY ?? 0
  });

  if (hs.once) {
    GameState.visitHotspot(currentSceneId, hotspotId);
    // Update element
    containerEl?.querySelector(`[data-id="${hotspotId}"]`)?.classList.add('visited');
  }

  // Handle flavor text
  if (hs.flavor) {
    EventBus.emit(EVENTS.HOTSPOT_FLAVOR, {
      sceneId: currentSceneId,
      hotspot: hs,
      text: hs.flavor
    });
  }

  // Handle achievement
  if (hs.achievement) {
    AchievementSystem.checkTrigger(hs.achievement);
  }

  // Handle dialog action
  if (hs.action === 'dialog' && hs.dialog) {
    EventBus.emit(EVENTS.DIALOG_START, {
      nodeId: hs.dialog,
      sceneId: currentSceneId
    });
  }
}

/**
 * Handle hotspot hover
 * @param {string} hotspotId
 * @param {MouseEvent} e
 */
function handleHotspotHover(hotspotId, e) {
  const hs = activeHotspots.find(h => h.id === hotspotId);
  if (!hs) return;

  EventBus.emit(EVENTS.HOTSPOT_HOVER, { hotspot: hs });
  showTooltip(hs.label, e.clientX, e.clientY);
}

function showTooltip(text, x, y) {
  if (!tooltipEl) return;
  tooltipEl.textContent = text;
  tooltipEl.style.left = `${x + 12}px`;
  tooltipEl.style.top = `${y - 30}px`;
  tooltipEl.classList.add('visible');
}

function hideTooltip() {
  tooltipEl?.classList.remove('visible');
}

/**
 * Destroy engine (cleanup)
 */
export function destroy() {
  if (cleanup) cleanup();
  tooltipEl?.remove();
  tooltipEl = null;
}

export default { init, loadHotspots, destroy };
