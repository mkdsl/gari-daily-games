/**
 * SceneKafana.js — Scena 3: Kafana Kod Pante
 * NPC: Panta Stefanović (kafandžija)
 * Contains the 3-step soundcheck explanation dialog
 * Warm kafana atmosphere, džezva steam, Tvrđava window view
 * @module SceneKafana
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

/** @type {number[]} Interval IDs */
let intervals = [];

/**
 * Setup scene 3 — Kafana Kod Pante
 * @param {object} sceneDef
 */
export function setup(sceneDef) {
  sceneEl = document.querySelector('.scene-bg.bg-kafana');
  if (!sceneEl) return;

  populateBackground(sceneEl, 'kafana');

  // Build NPC sprite
  const npcEl = buildNpc();
  sceneEl.appendChild(npcEl);

  // Add džezva steam particle effect
  animateDzezva();

  // Window view — occasional cloud movement
  animateWindowView();

  // NPC idle
  animateNpc(npcEl);

  // Track soundcheck explanation steps
  let soundcheckSteps = 0;
  const unsubChoice = EventBus.on(EVENTS.DIALOG_CHOICE_SELECT, ({ choiceId }) => {
    if (choiceId === 's3_a') {
      soundcheckSteps = 1;
      GameState.advanceSoundcheckStep();
    }
    if (choiceId === 's3_e1_next') {
      soundcheckSteps = Math.max(soundcheckSteps, 1);
      GameState.advanceSoundcheckStep();
    }
    if (choiceId === 's3_p1_next') {
      soundcheckSteps = Math.max(soundcheckSteps, 2);
      GameState.advanceSoundcheckStep();
    }
    if (choiceId === 's3_e2_next') {
      soundcheckSteps = Math.max(soundcheckSteps, 3);
      GameState.advanceSoundcheckStep();
    }
    if (choiceId === 's3_p2_next') {
      soundcheckSteps = Math.max(soundcheckSteps, 4);
      GameState.advanceSoundcheckStep();
    }
    if (choiceId === 's3_res_end') {
      // All 3 explanation exchanges completed
      if (soundcheckSteps >= 3 || GameState.getSoundcheckStep() >= 3) {
        AchievementSystem.checkTrigger('scene3_full_explain');
      }
      // Panta's satisfied reaction animation
      animatePantaReaction(npcEl);
    }

    // Delay reaction on other options
    if (choiceId === 's3_b' || choiceId === 's3_c') {
      animatePantaShrug(npcEl);
    }
  });

  const unsubFlavor = EventBus.on(EVENTS.HOTSPOT_FLAVOR, ({ text }) => {
    FlavorDisplay.show(text, '☕');
  });

  cleanups.push(unsubChoice, unsubFlavor);
}

function buildNpc() {
  const npcEl = createNpcElement('panta');
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
 * Create džezva steam rising from sank position
 */
function animateDzezva() {
  const sank = sceneEl?.querySelector('.bg-sank');
  if (!sank || !sceneEl) return;

  if (!document.getElementById('dzezva-kf')) {
    const style = document.createElement('style');
    style.id = 'dzezva-kf';
    style.textContent = `
      @keyframes steamRise {
        0% { opacity: 0; transform: translateX(0) translateY(0) scale(0.8); }
        30% { opacity: 0.6; transform: translateX(2px) translateY(-12px) scale(1); }
        70% { opacity: 0.3; transform: translateX(-3px) translateY(-28px) scale(1.2); }
        100% { opacity: 0; transform: translateX(1px) translateY(-44px) scale(1.5); }
      }
    `;
    document.head.appendChild(style);
  }

  const interval = setInterval(() => {
    if (!sceneEl) { clearInterval(interval); return; }
    const steam = document.createElement('div');
    steam.style.cssText = `
      position: absolute;
      left: 18%;
      bottom: 52%;
      width: 6px;
      height: 6px;
      background: rgba(255,255,255,0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 3;
      animation: steamRise 2.5s ease-out forwards;
    `;
    sceneEl.appendChild(steam);
    setTimeout(() => steam.remove(), 2600);
  }, 1800);

  intervals.push(interval);
}

/**
 * Subtle window cloud movement
 */
function animateWindowView() {
  const prozor = sceneEl?.querySelector('.bg-prozor');
  if (!prozor) return;

  // Create small cloud div inside window
  const cloud = document.createElement('div');
  cloud.style.cssText = `
    position: absolute;
    top: 10%; left: -30%;
    width: 40%; height: 18%;
    background: rgba(255,255,255,0.25);
    border-radius: 50%;
    filter: blur(3px);
    animation: cloudMove 12s linear infinite;
  `;
  prozor.appendChild(cloud);

  if (!document.getElementById('cloud-move-kf')) {
    const style = document.createElement('style');
    style.id = 'cloud-move-kf';
    style.textContent = `
      @keyframes cloudMove {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(180%); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Panta satisfied animation after soundcheck explanation
 * @param {HTMLElement} npcEl
 */
function animatePantaReaction(npcEl) {
  const head = npcEl.querySelector('.npc-head');
  if (!head) return;

  // Nod sequence
  const nods = [8, -5, 4, 0];
  nods.forEach((deg, i) => {
    setTimeout(() => {
      if (head.isConnected) {
        head.style.transition = 'transform 0.25s ease';
        head.style.transform = `rotate(${deg}deg)`;
      }
    }, i * 300);
  });
}

/**
 * Panta shrug when player avoids explanation
 * @param {HTMLElement} npcEl
 */
function animatePantaShrug(npcEl) {
  const armL = npcEl.querySelector('.npc-arm-l');
  const armR = npcEl.querySelector('.npc-arm-r');
  if (!armL || !armR) return;

  armL.style.transition = 'transform 0.3s ease';
  armR.style.transition = 'transform 0.3s ease';
  armL.style.transform = 'rotate(-50deg) translateY(-8px)';
  armR.style.transform = 'rotate(50deg) translateY(-8px)';

  setTimeout(() => {
    if (armL.isConnected) armL.style.transform = '';
    if (armR.isConnected) armR.style.transform = '';
  }, 1200);
}

/**
 * NPC idle — wipe counter, adjust glasses
 * @param {HTMLElement} npcEl
 */
function animateNpc(npcEl) {
  const interval = setInterval(() => {
    if (!npcEl.isConnected) { clearInterval(interval); return; }

    const armL = npcEl.querySelector('.npc-arm-l');
    if (armL) {
      // Wipe counter motion
      armL.style.transition = 'transform 0.4s ease';
      armL.style.transform = 'rotate(-40deg) translateX(-4px)';
      setTimeout(() => {
        if (armL.isConnected) armL.style.transform = '';
      }, 800);
    }
  }, 6000);

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
