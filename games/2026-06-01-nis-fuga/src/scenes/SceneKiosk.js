/**
 * SceneKiosk.js — Scena 2: Kiosk Medijana
 * NPC: Baca Mile (vlasnik kioska)
 * Busy morning scene, printer sounds, queue animation
 * @module SceneKiosk
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
 * Setup scene 2 — Kiosk Medijana
 * @param {object} sceneDef
 */
export function setup(sceneDef) {
  sceneEl = document.querySelector('.scene-bg.bg-kiosk');
  if (!sceneEl) return;

  populateBackground(sceneEl, 'kiosk');

  // Build NPC
  const npcEl = buildNpc();
  sceneEl.appendChild(npcEl);

  // Add queue characters with stagger animation
  buildQueue();

  // Animate printer (signal bar flicker = signal hunting)
  animateSignalBars();

  // Kiosk rolo-kapak open/close animation
  animateKioskRolo();

  // NPC idle — occasionally looks at customer
  animateNpc(npcEl);

  const unsubFlavor = EventBus.on(EVENTS.HOTSPOT_FLAVOR, ({ text }) => {
    FlavorDisplay.show(text, '🏪');
  });

  cleanups.push(unsubFlavor);
}

function buildNpc() {
  const npcEl = createNpcElement('bacamile');
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
 * Build animated queue of waiting customers
 */
function buildQueue() {
  const queueEl = sceneEl?.querySelector('.bg-queue');
  if (!queueEl) return;

  const customerColors = ['#8B6030', '#C8803A', '#6B5040', '#A07850'];
  const customerNames = ['Penzioner', 'Majka', 'Tinejdžer', 'Radnik'];

  customerColors.forEach((color, idx) => {
    const fig = document.createElement('div');
    fig.className = `queue-person queue-person-${idx}`;
    fig.title = customerNames[idx];
    fig.style.cssText = `
      width: 18px;
      height: 38px;
      background: ${color};
      border-radius: 9px 9px 2px 2px;
      position: relative;
      transform: translateY(${idx % 2 === 0 ? 0 : 2}px);
      transition: transform 0.8s ease;
      animation: queueWait ${2 + idx * 0.5}s ease-in-out infinite;
      animation-delay: ${idx * 0.3}s;
    `;

    // Head
    const head = document.createElement('div');
    head.style.cssText = `
      position: absolute;
      top: -10px; left: 50%;
      transform: translateX(-50%);
      width: 14px; height: 14px;
      background: ${color};
      filter: brightness(1.2);
      border-radius: 50%;
    `;
    fig.appendChild(head);
    queueEl.appendChild(fig);
  });

  // Inject queue animation keyframe
  if (!document.getElementById('queue-wait-kf')) {
    const style = document.createElement('style');
    style.id = 'queue-wait-kf';
    style.textContent = `
      @keyframes queueWait {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Animate signal bars to show weak/no signal
 */
function animateSignalBars() {
  const signalEl = sceneEl?.querySelector('.bg-signal');
  if (!signalEl) return;

  const bars = signalEl.querySelectorAll('span');
  let tick = 0;

  const interval = setInterval(() => {
    tick++;
    // Flicker pattern — no signal most of the time, occasionally 1 bar
    const active = tick % 8 === 0 ? 1 : 0;
    bars.forEach((bar, i) => {
      bar.style.background = i < active
        ? 'rgba(232,162,74,0.9)'
        : 'rgba(0,0,0,0.2)';
      bar.style.transition = 'background 0.15s';
    });
  }, 600);

  intervals.push(interval);
}

/**
 * Animate kiosk rolo-kapak with subtle movement
 */
function animateKioskRolo() {
  const kioskBox = sceneEl?.querySelector('.bg-kiosk-box');
  if (!kioskBox) return;

  // Periodic shimmer on the rolo stripes
  let shimmerDir = 1;
  const interval = setInterval(() => {
    if (!kioskBox.isConnected) { clearInterval(interval); return; }

    // Small brightness flicker on awning — simulating light change
    kioskBox.style.filter = `brightness(${0.97 + Math.random() * 0.06})`;
  }, 2000);

  intervals.push(interval);
}

/**
 * NPC idle animation — turns toward customer occasionally
 * @param {HTMLElement} npcEl
 */
function animateNpc(npcEl) {
  const interval = setInterval(() => {
    if (!npcEl.isConnected) { clearInterval(interval); return; }

    const body = npcEl.querySelector('.npc-body');
    if (body) {
      // Lean toward counter
      body.style.transition = 'transform 0.5s ease';
      body.style.transform = 'rotate(-3deg) translateX(-2px)';
      setTimeout(() => {
        if (body.isConnected) body.style.transform = '';
      }, 1000);
    }
  }, 5000);

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
