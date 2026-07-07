/**
 * SceneBulevar.js — Scena 1: Parking na Bulevaru Nemanjića
 * NPC: Dragoljub (parking inspektor)
 * Morning light atmosphere, van rumble, Đole Balašević easter egg
 * @module SceneBulevar
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';
import AchievementSystem from '../engine/AchievementSystem.js';
import { populateBackground } from '../art/BackgroundRenderer.js';
import { createNpcElement } from '../art/NpcRenderer.js';
import FlavorDisplay from '../ui/FlavorDisplay.js';
import GameState from '../utils/GameState.js';

/** @type {HTMLElement|null} */
let sceneEl = null;

/** @type {Function[]} Cleanup callbacks */
let cleanups = [];

/** @type {number[]} Animation intervals */
let intervals = [];

/**
 * Setup scene 1 — called by SceneManager on scene load
 * @param {object} sceneDef
 */
export function setup(sceneDef) {
  sceneEl = document.querySelector('.scene-bg.bg-bulevar');
  if (!sceneEl) return;

  // Populate CSS background elements
  populateBackground(sceneEl, 'bulevar');

  // Build NPC sprite
  const npcEl = buildNpc();
  sceneEl.appendChild(npcEl);

  // Animate morning light — subtle sky color shift
  animateMorningLight();

  // Van music easter egg — random Đole riff plays out of van
  scheduleVanEasterEgg();

  // Listen for hotspot flavor events
  const unsubFlavor = EventBus.on(EVENTS.HOTSPOT_FLAVOR, ({ text }) => {
    FlavorDisplay.show(text, '🚐');
  });

  // Track choice A for achievement (Dragoljub convinced without reputation)
  const unsubChoice = EventBus.on(EVENTS.DIALOG_CHOICE_SELECT, ({ choiceId }) => {
    if (choiceId === 's1_a') {
      // Before this choice was made, rep was 0 — unlock achievement
      AchievementSystem.checkTrigger('scene1_option_a_rep0');
    }
  });

  // Dragoljub idle animation — occasionally looks at notepad
  animateNpc(npcEl);

  cleanups.push(unsubFlavor, unsubChoice);
}

/**
 * Build Dragoljub NPC element
 * @returns {HTMLElement}
 */
function buildNpc() {
  const npcEl = createNpcElement('dragoljub');
  npcEl.innerHTML = `
    <div class="npc-head"></div>
    <div class="npc-body"></div>
    <div class="npc-arm-l"></div>
    <div class="npc-arm-r"></div>
    <div class="npc-leg-l"></div>
    <div class="npc-leg-r"></div>
  `;
  return npcEl;
}

/**
 * Animate morning light gradient shift on sky background
 */
function animateMorningLight() {
  if (!sceneEl) return;

  // Start with warmer (earlier) light, gradually shift toward midday
  let step = 0;
  const interval = setInterval(() => {
    if (!sceneEl) { clearInterval(interval); return; }
    step++;
    if (step > 60) clearInterval(interval);

    // Subtle opacity shift on sky layer
    const sky = sceneEl.querySelector('::before');
    // We do this by shifting the overall scene hue slightly via a gradient overlay
    const alpha = Math.min(0.08, step * 0.0013);
    const existing = sceneEl.querySelector('.morning-light-overlay');
    if (existing) {
      existing.style.opacity = String(alpha);
    } else if (step === 1) {
      const overlay = document.createElement('div');
      overlay.className = 'morning-light-overlay';
      overlay.style.cssText = `
        position: absolute; inset: 0; pointer-events: none; z-index: 1;
        background: linear-gradient(180deg, rgba(245,200,150,0.12) 0%, transparent 60%);
        transition: opacity 0.5s;
      `;
      sceneEl.appendChild(overlay);
    }
  }, 200);

  intervals.push(interval);
}

/**
 * Schedule occasional van easter egg — Đole Balašević "leaks" from van
 */
function scheduleVanEasterEgg() {
  const timeout = setTimeout(() => {
    // Show a floating music note from van position
    const van = sceneEl?.querySelector('.bg-van');
    if (!van || !sceneEl) return;

    const note = document.createElement('div');
    note.textContent = '♫';
    note.style.cssText = `
      position: absolute;
      left: 19%;
      bottom: 46%;
      font-size: 18px;
      color: rgba(232,162,74,0.8);
      pointer-events: none;
      z-index: 5;
      animation: noteFloat 3s ease-out forwards;
    `;
    sceneEl.appendChild(note);

    // Inject keyframe if not present
    if (!document.getElementById('note-float-kf')) {
      const style = document.createElement('style');
      style.id = 'note-float-kf';
      style.textContent = `
        @keyframes noteFloat {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          20% { opacity: 1; transform: translateY(-8px) scale(1); }
          80% { opacity: 1; transform: translateY(-40px) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.7); }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => note.remove(), 3200);
  }, 3000);

  cleanups.push(() => clearTimeout(timeout));
}

/**
 * NPC animation — occasional notepad glance
 * @param {HTMLElement} npcEl
 */
function animateNpc(npcEl) {
  const interval = setInterval(() => {
    if (!npcEl.isConnected) { clearInterval(interval); return; }

    // Tilt head slightly
    const head = npcEl.querySelector('.npc-head');
    if (head) {
      head.style.transition = 'transform 0.4s ease';
      head.style.transform = 'rotate(-5deg)';
      setTimeout(() => {
        if (head.isConnected) head.style.transform = 'rotate(0deg)';
      }, 800);
    }
  }, 4500);

  intervals.push(interval);
}

export function teardown() {
  for (const fn of cleanups) {
    try { fn(); } catch {}
  }
  cleanups = [];

  for (const id of intervals) {
    clearInterval(id);
  }
  intervals = [];

  sceneEl = null;
}

export default { setup, teardown };
