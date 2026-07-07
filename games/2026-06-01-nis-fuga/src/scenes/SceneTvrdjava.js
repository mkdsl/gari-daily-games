/**
 * SceneTvrdjava.js — Scena 4: Niška Tvrđava
 * NPC: Bojan Tasić (lokalni gitarista)
 * Historical walls, park atmosphere, Bojan's guitar case
 * @module SceneTvrdjava
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
 * Setup scene 4 — Niška Tvrđava
 * @param {object} sceneDef
 */
export function setup(sceneDef) {
  sceneEl = document.querySelector('.scene-bg.bg-tvrdjava');
  if (!sceneEl) return;

  populateBackground(sceneEl, 'tvrdjava');

  // Build NPC sprite
  const npcEl = buildNpc();
  sceneEl.appendChild(npcEl);

  // Add birds flying over fortress
  spawnBirds();

  // Grass wave animation
  animateGrass();

  // NPC idle — strum guitar case
  animateNpc(npcEl);

  // Guitar case visual on bench
  addGuitarCaseLabel();

  const unsubFlavor = EventBus.on(EVENTS.HOTSPOT_FLAVOR, ({ hotspot, text }) => {
    const icons = {
      hs_zid: '🧱',
      hs_klupa: '🎸',
      hs_npc: '🎵'
    };
    FlavorDisplay.show(text, icons[hotspot.id] ?? '🏰');

    // Hidden achievement for Tvrđava wall hotspot
    if (hotspot.id === 'hs_zid') {
      AchievementSystem.checkTrigger('tvrdjava_zid_hotspot');
    }
  });

  const unsubChoice = EventBus.on(EVENTS.DIALOG_CHOICE_SELECT, ({ choiceId }) => {
    if (choiceId === 's4_c') {
      // Lied to Bojan — sad animation
      animateBojansReaction(npcEl, 'sad');
      AchievementSystem.checkTrigger('scene4_option_c');
    }
    if (choiceId === 's4_a') {
      // Happy to join — bounce animation
      animateBojansReaction(npcEl, 'happy');
    }
    if (choiceId === 's4_b') {
      // Neutral — taxi okay
      animateBojansReaction(npcEl, 'neutral');
    }
  });

  cleanups.push(unsubFlavor, unsubChoice);
}

function buildNpc() {
  const npcEl = createNpcElement('bojan');
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
 * Add "Do petka — Darko M." label near bench
 */
function addGuitarCaseLabel() {
  if (!sceneEl) return;
  const label = document.createElement('div');
  label.style.cssText = `
    position: absolute;
    right: 17%; bottom: 25%;
    font-size: 9px;
    color: rgba(245,230,200,0.5);
    font-family: monospace;
    pointer-events: none;
    z-index: 4;
    transform: rotate(-2deg);
    font-style: italic;
  `;
  label.textContent = 'Do petka – Darko M.';
  sceneEl.appendChild(label);
}

/**
 * Spawn birds flying over the fortress
 */
function spawnBirds() {
  if (!sceneEl) return;

  if (!document.getElementById('bird-fly-kf')) {
    const style = document.createElement('style');
    style.id = 'bird-fly-kf';
    style.textContent = `
      @keyframes birdFly {
        0% { transform: translateX(-60px) translateY(0); opacity: 0; }
        10% { opacity: 1; }
        45% { transform: translateX(40vw) translateY(-20px); }
        55% { transform: translateX(60vw) translateY(-15px); }
        90% { opacity: 1; }
        100% { transform: translateX(110vw) translateY(-10px); opacity: 0; }
      }
      @keyframes birdWing {
        0%, 100% { d: path('M0,0 Q3,-4 6,0'); }
        50% { d: path('M0,0 Q3,2 6,0'); }
      }
    `;
    document.head.appendChild(style);
  }

  const spawnBird = () => {
    if (!sceneEl) return;
    const bird = document.createElement('div');
    const yPct = 15 + Math.random() * 20;
    bird.style.cssText = `
      position: absolute;
      left: -30px;
      top: ${yPct}%;
      width: 12px; height: 6px;
      pointer-events: none;
      z-index: 3;
      animation: birdFly ${8 + Math.random() * 6}s linear forwards;
    `;
    // Simple bird shape via border
    bird.innerHTML = `
      <div style="
        width: 12px; height: 3px;
        border-top: 2px solid rgba(50,30,20,0.7);
        border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        position: absolute; left: 0; top: 0;
      "></div>
    `;
    sceneEl.appendChild(bird);
    setTimeout(() => bird.remove(), 15000);
  };

  spawnBird();
  const interval = setInterval(() => {
    if (!sceneEl) { clearInterval(interval); return; }
    spawnBird();
  }, 6000);
  intervals.push(interval);
}

/**
 * Subtle grass wave animation
 */
function animateGrass() {
  const grass = sceneEl?.querySelector('.bg-grass');
  if (!grass) return;

  if (!document.getElementById('grass-wave-kf')) {
    const style = document.createElement('style');
    style.id = 'grass-wave-kf';
    style.textContent = `
      @keyframes grassWave {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.05); }
      }
    `;
    document.head.appendChild(style);
  }
  grass.style.animation = 'grassWave 4s ease-in-out infinite';
}

/**
 * Bojan reaction animations
 * @param {HTMLElement} npcEl
 * @param {'happy'|'sad'|'neutral'} reaction
 */
function animateBojansReaction(npcEl, reaction) {
  const head = npcEl.querySelector('.npc-head');
  const body = npcEl.querySelector('.npc-body');
  if (!head || !body) return;

  switch (reaction) {
    case 'happy':
      // Bounce up
      body.style.transition = 'transform 0.3s ease';
      body.style.transform = 'translateY(-6px)';
      setTimeout(() => { if (body.isConnected) body.style.transform = ''; }, 600);
      break;

    case 'sad':
      // Head down
      head.style.transition = 'transform 0.5s ease';
      head.style.transform = 'rotate(15deg) translateY(3px)';
      setTimeout(() => { if (head.isConnected) head.style.transform = ''; }, 1500);
      break;

    case 'neutral':
      // Small nod
      head.style.transition = 'transform 0.3s ease';
      head.style.transform = 'rotate(5deg)';
      setTimeout(() => { if (head.isConnected) head.style.transform = ''; }, 500);
      break;
  }
}

/**
 * NPC idle — adjusts guitar case occasionally
 * @param {HTMLElement} npcEl
 */
function animateNpc(npcEl) {
  const interval = setInterval(() => {
    if (!npcEl.isConnected) { clearInterval(interval); return; }

    const armL = npcEl.querySelector('.npc-arm-l');
    if (armL) {
      // Adjust strap / pat guitar case
      armL.style.transition = 'transform 0.5s ease';
      armL.style.transform = 'rotate(-25deg)';
      setTimeout(() => {
        if (armL.isConnected) armL.style.transform = '';
      }, 900);
    }
  }, 5500);

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
