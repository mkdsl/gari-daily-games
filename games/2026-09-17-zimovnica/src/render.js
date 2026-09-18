/**
 * render.js — DOM orchestrator za Zimovnicu.
 * Screen router: menu / game / event / ending / prestige.
 */

import { renderHUD } from './render/hud.js';
import { renderShelf } from './render/shelf_renderer.js';
import { renderCalendar } from './render/calendar_renderer.js';

/** @type {HTMLElement|null} */
let root = null;

/**
 * Glavni render entry point. Poziva se iz main.js na svakoj promeni state-a.
 * @param {object|null} state
 * @param {object|null} persistent
 * @param {string} screen
 */
export function render(state, persistent, screen) {
  if (!root) {
    root = document.getElementById('app');
    if (!root) return;
  }

  switch (screen) {
    case 'menu':    renderMenu(root, persistent); break;
    case 'game':    renderGame(root, state, persistent); break;
    case 'event':   renderEvent(root, state); break;
    case 'ending':  renderEnding(root, state, persistent); break;
    case 'prestige': renderPrestige(root, state, persistent); break;
    default:        renderMenu(root, persistent);
  }
}

/**
 * Renderuje glavni meni.
 * @param {HTMLElement} root
 * @param {object|null} persistent
 */
function renderMenu(root, persistent) {}

/**
 * Renderuje glavni game screen (HUD, police, akcioni slotovi, kalendar).
 * @param {HTMLElement} root
 * @param {object} state
 * @param {object} persistent
 */
function renderGame(root, state, persistent) {}

/**
 * Renderuje event card overlay.
 * @param {HTMLElement} root
 * @param {object} state
 */
function renderEvent(root, state) {}

/**
 * Renderuje ending screen sa skorom i aforizmom.
 * @param {HTMLElement} root
 * @param {object} state
 * @param {object} persistent
 */
function renderEnding(root, state, persistent) {}

/**
 * Renderuje prestige screen sa carry-over opcijama.
 * @param {HTMLElement} root
 * @param {object} state
 * @param {object} persistent
 */
function renderPrestige(root, state, persistent) {}
