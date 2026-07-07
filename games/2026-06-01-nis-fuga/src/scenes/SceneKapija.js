/**
 * SceneKapija.js — Scena 5: Kapija Kluba Tonika (noćna)
 * NPC: Nenad Stojković (čuvar, resource-gated opcije)
 * Neon night atmosphere, bass pulsing visual, bouncer animation
 * @module SceneKapija
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
 * Setup scene 5 — Kapija Kluba
 * @param {object} sceneDef
 */
export function setup(sceneDef) {
  sceneEl = document.querySelector('.scene-bg.bg-kapija');
  if (!sceneEl) return;

  populateBackground(sceneEl, 'kapija');

  // Build NPC — bouncer stance
  const npcEl = buildNpc();
  sceneEl.appendChild(npcEl);

  // Animate neon sign
  animateNeonSign();

  // Bass pulse visual on background
  animateBassPulse();

  // Star twinkling
  animateStars();

  // NPC idle — shift weight, check phone
  animateNpc(npcEl);

  // Show time pressure badge when time is running low
  checkTimeStatus();

  const unsubFlavor = EventBus.on(EVENTS.HOTSPOT_FLAVOR, ({ text }) => {
    FlavorDisplay.show(text, '🎵');
  });

  const unsubChoice = EventBus.on(EVENTS.DIALOG_CHOICE_SELECT, ({ choiceId }) => {
    if (choiceId === 's5_e_end') {
      AchievementSystem.checkTrigger('scene5_nenad_secret');
      animateNenadLetIn(npcEl);
    }
    if (choiceId === 's5_p_end') {
      AchievementSystem.checkTrigger('scene5_print_access');
      animateNenadImpressed(npcEl);
    }
    if (choiceId === 's5_b_end') {
      animateNenadLetIn(npcEl);
    }
  });

  // Resource change listener for time critical indicator
  const unsubResource = EventBus.on(EVENTS.RESOURCE_CRITICAL, ({ resource }) => {
    if (resource === 'time') {
      showUrgencyEffect();
    }
  });

  cleanups.push(unsubFlavor, unsubChoice, unsubResource);
}

function buildNpc() {
  const npcEl = createNpcElement('nenad');
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
 * Animate TONIKA neon sign with flicker effect
 */
function animateNeonSign() {
  const door = sceneEl?.querySelector('.bg-door');
  if (!door) return;

  let flickerCount = 0;
  const interval = setInterval(() => {
    if (!door.isConnected) { clearInterval(interval); return; }
    flickerCount++;

    // Occasional flicker
    if (flickerCount % 12 === 0) {
      door.style.setProperty('--neon-intensity', '0.2');
      setTimeout(() => {
        if (door.isConnected) door.style.removeProperty('--neon-intensity');
      }, 80);
    }
  }, 500);

  intervals.push(interval);
}

/**
 * Bass pulse visual — background brightness on kick
 */
function animateBassPulse() {
  if (!sceneEl) return;

  let beat = 0;
  const interval = setInterval(() => {
    if (!sceneEl) { clearInterval(interval); return; }
    beat++;

    if (beat % 4 === 0) {
      // On kick beat — subtle brightness flash
      sceneEl.style.transition = 'filter 0.05s';
      sceneEl.style.filter = 'brightness(1.08) saturate(1.1)';
      setTimeout(() => {
        if (sceneEl) sceneEl.style.filter = '';
      }, 100);
    }
  }, 500); // 120 BPM = 500ms per beat

  intervals.push(interval);
}

/**
 * Animate stars twinkling
 */
function animateStars() {
  const starsEl = sceneEl?.querySelector('.bg-stars');
  if (!starsEl || !sceneEl) return;

  if (!document.getElementById('star-twinkle-kf')) {
    const style = document.createElement('style');
    style.id = 'star-twinkle-kf';
    style.textContent = `
      @keyframes twinkleA { 0%,100% { opacity: 0.8; } 50% { opacity: 0.2; } }
      @keyframes twinkleB { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
    `;
    document.head.appendChild(style);
  }

  // Add individual star dots
  for (let i = 0; i < 20; i++) {
    const star = document.createElement('div');
    const x = Math.random() * 100;
    const y = Math.random() * 40;
    const size = 1 + Math.random() * 2;
    const dur = 2 + Math.random() * 3;
    const delay = Math.random() * 2;
    const anim = Math.random() > 0.5 ? 'twinkleA' : 'twinkleB';

    star.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255,255,255,0.8);
      border-radius: 50%;
      animation: ${anim} ${dur}s ${delay}s ease-in-out infinite;
      pointer-events: none;
    `;
    sceneEl.appendChild(star);
  }
}

/**
 * Check time status and show urgency if low
 */
function checkTimeStatus() {
  const time = GameState.getResource('time');
  if (time <= 10) {
    showUrgencyEffect();
  }
}

/**
 * Show visual urgency when time is critical
 */
function showUrgencyEffect() {
  if (!sceneEl) return;

  // Red vignette effect
  let vignette = sceneEl.querySelector('.urgency-vignette');
  if (!vignette) {
    vignette = document.createElement('div');
    vignette.className = 'urgency-vignette';
    vignette.style.cssText = `
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at center, transparent 60%, rgba(192,57,43,0.3) 100%);
      pointer-events: none; z-index: 8;
      animation: urgencyPulse 1s ease-in-out infinite;
    `;
    sceneEl.appendChild(vignette);
  }

  if (!document.getElementById('urgency-pulse-kf')) {
    const style = document.createElement('style');
    style.id = 'urgency-pulse-kf';
    style.textContent = `
      @keyframes urgencyPulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Nenad stepping aside animation (access granted)
 * @param {HTMLElement} npcEl
 */
function animateNenadLetIn(npcEl) {
  const body = npcEl.querySelector('.npc-body');
  const armL = npcEl.querySelector('.npc-arm-l');
  const armR = npcEl.querySelector('.npc-arm-r');

  if (body) {
    body.style.transition = 'transform 0.5s ease';
    body.style.transform = 'translateX(20px)';
  }
  if (armL) {
    armL.style.transition = 'transform 0.5s ease';
    armL.style.transform = 'rotate(-60deg)';
  }
  if (armR) {
    armR.style.transition = 'transform 0.5s ease';
    armR.style.transform = 'rotate(10deg)';
  }
}

/**
 * Nenad impressed animation (sees print)
 * @param {HTMLElement} npcEl
 */
function animateNenadImpressed(npcEl) {
  const head = npcEl.querySelector('.npc-head');
  if (!head) return;

  // Double take
  head.style.transition = 'transform 0.2s ease';
  head.style.transform = 'rotate(-10deg)';
  setTimeout(() => {
    if (head.isConnected) head.style.transform = 'rotate(5deg)';
    setTimeout(() => {
      if (head.isConnected) head.style.transform = '';
    }, 300);
  }, 250);
}

/**
 * NPC idle — shift weight, occasional phone check
 * @param {HTMLElement} npcEl
 */
function animateNpc(npcEl) {
  const interval = setInterval(() => {
    if (!npcEl.isConnected) { clearInterval(interval); return; }

    const body = npcEl.querySelector('.npc-body');
    if (body && Math.random() > 0.5) {
      // Weight shift
      body.style.transition = 'transform 0.8s ease';
      body.style.transform = 'translateX(-3px)';
      setTimeout(() => {
        if (body.isConnected) body.style.transform = '';
      }, 1500);
    } else {
      // Look at phone (arm comes up)
      const armR = npcEl.querySelector('.npc-arm-r');
      if (armR) {
        armR.style.transition = 'transform 0.4s ease';
        armR.style.transform = 'rotate(-80deg) translateY(-10px)';
        setTimeout(() => {
          if (armR.isConnected) armR.style.transform = '';
        }, 1200);
      }
    }
  }, 4000);

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

  // Remove star elements
  sceneEl?.querySelectorAll('[style*="twinkle"]').forEach(el => el.remove());

  sceneEl = null;
}

export default { setup, teardown };
