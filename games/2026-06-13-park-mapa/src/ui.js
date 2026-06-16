import { CONFIG } from './config.js';
import { formatPT } from './systems/economy.js';
import { getParkLegendRank, getRankProgress } from './systems/progression.js';
import { getDailyLightZone, isDailyLightComplete } from './systems/daily-light.js';
import { getCollectedEggCount } from './systems/easter-eggs.js';

// DOM element references
let hudEl = null;
let toastContainer = null;
let flavorOverlay = null;
let upgradeModal = null;

export function initUI(rootEl, state, emit) {
  // Create HUD
  hudEl = document.getElementById('hud');
  if (!hudEl) {
    hudEl = document.createElement('div');
    hudEl.id = 'hud';
    rootEl.appendChild(hudEl);
  }

  // Toast container
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 800;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 6px;
    pointer-events: none;
  `;
  document.body.appendChild(toastContainer);

  // Create flavor overlay (hidden by default)
  createFlavorOverlay(rootEl, emit);

  renderHUD(state, emit);
}

export function renderHUD(state, emit) {
  if (!hudEl) return;

  const today = new Date().toISOString().slice(0, 10);
  const dlZone = getDailyLightZone(today);
  const dlComplete = isDailyLightComplete(state);
  const eggsToday = getCollectedEggCount(state, today);
  const rankData = getRankProgress(state);
  const dlZoneNames = { pult: 'Pult', bina: 'Bina', suma: 'Šuma' };
  const dlZoneColors = { pult: '#BF5FFF', bina: '#FFB830', suma: '#40C87E' };
  const dlAccent = dlZoneColors[dlZone] || '#FFD700';

  hudEl.innerHTML = `
    <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
      <!-- Park name + season -->
      <div>
        <span style="font-size:13px; font-weight:bold; color:var(--text);">MKDSLend Park</span>
        <span style="font-size:9px; color:#444; margin-left:6px;">S${state.season || 1}</span>
      </div>

      <!-- PT Balance -->
      <div style="display:flex; align-items:center; gap:4px;">
        <span style="font-size:10px; color:#888;">PT</span>
        <span id="pt-balance" style="font-size:16px; font-weight:bold; color:var(--gold);">${formatPT(state.pt)}</span>
      </div>

      <!-- Rank -->
      <div style="font-size:10px; color:${rankData.current ? '#5BA4CF' : '#888'};">
        ${rankData.current?.name || 'Izletnik'}
      </div>

      <!-- Daily Light indicator -->
      <div style="display:flex; align-items:center; gap:4px;">
        <span style="font-size:10px; color:#555;">Svetlo:</span>
        <span style="font-size:10px; color:${dlAccent}; ${dlComplete ? 'text-decoration:line-through; opacity:0.5' : ''}">
          ${dlZoneNames[dlZone] || dlZone} ${dlComplete ? '✓' : '⭐'}
        </span>
      </div>

      <!-- Eggs today -->
      <div style="font-size:10px; color:#555;">
        Eggs: <span style="color:var(--gold);">${eggsToday}/7</span>
      </div>

      <!-- Nav buttons -->
      <div style="margin-left:auto; display:flex; gap:6px;">
        <button id="btn-logbook" style="background:transparent; border:1px solid #333; color:#888; padding:4px 8px;
                border-radius:3px; cursor:pointer; font-family:monospace; font-size:10px;">
          Logbook
        </button>
        <button id="btn-npc" style="background:transparent; border:1px solid #333; color:#888; padding:4px 8px;
                border-radius:3px; cursor:pointer; font-family:monospace; font-size:10px;">
          NPC
        </button>
        <button id="btn-audio" style="background:transparent; border:1px solid #333; color:#888; padding:4px 8px;
                border-radius:3px; cursor:pointer; font-family:monospace; font-size:10px;">
          ♪
        </button>
      </div>
    </div>
  `;

  // Button event listeners
  hudEl.querySelector('#btn-logbook')?.addEventListener('click', () => {
    if (emit) emit('toggleLogbook', {});
  });
  hudEl.querySelector('#btn-npc')?.addEventListener('click', () => {
    if (emit) emit('toggleNpc', {});
  });
  hudEl.querySelector('#btn-audio')?.addEventListener('click', () => {
    if (emit) emit('toggleAudio', {});
  });
}

function createFlavorOverlay(rootEl, emit) {
  flavorOverlay = document.createElement('div');
  flavorOverlay.id = 'flavor-overlay';
  flavorOverlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(13, 27, 42, 0.95);
    z-index: 600;
    display: none;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    backdrop-filter: blur(6px);
  `;
  document.body.appendChild(flavorOverlay);
}

export function showFlavorScreen(state, zoneId, ptReward, emit) {
  if (!flavorOverlay) return;

  const zoneConfig = {
    pult: { name: 'Pult', accent: '#BF5FFF', stories: import('./zones/pult.js') },
    bina: { name: 'Bina', accent: '#FFB830', stories: import('./zones/bina.js') },
    suma: { name: 'Šuma', accent: '#40C87E', stories: import('./zones/suma.js') }
  };

  const cfg = zoneConfig[zoneId] || { name: zoneId, accent: '#E8DCC8', stories: Promise.resolve(null) };

  cfg.stories.then(mod => {
    const zoneState = state.zones[zoneId];
    const storiesUnlocked = zoneState?.storiesUnlocked || 0;

    let storiesHtml = '';
    for (let i = 0; i < storiesUnlocked; i++) {
      let storyText = '';
      if (mod) {
        if (zoneId === 'pult' && mod.getPultStory) storyText = mod.getPultStory(i);
        else if (zoneId === 'bina' && mod.getBinaStory) storyText = mod.getBinaStory(i);
        else if (zoneId === 'suma' && mod.getSumaStory) storyText = mod.getSumaStory(i);
      }
      storiesHtml += `
        <div style="margin-bottom: 8px; padding: 10px; background: rgba(0,0,0,0.4); border-left: 2px solid ${cfg.accent}; border-radius: 0 4px 4px 0; font-size: 12px; color: #aaa; line-height: 1.6;">
          <span style="color: #444; font-size: 9px; margin-right: 6px;">${i + 1}.</span>
          ${storyText || '...'}
        </div>
      `;
    }

    flavorOverlay.innerHTML = `
      <div style="max-width: 480px; width: 90%; padding: 32px; text-align: center;">
        <div style="font-size: 11px; color: #555; letter-spacing: 2px; margin-bottom: 8px;">CHECK-IN</div>
        <h2 style="font-size: 28px; font-weight: bold; color: ${cfg.accent}; margin: 0 0 8px 0;">${cfg.name}</h2>

        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,215,0,0.1);
                    border: 1px solid rgba(255,215,0,0.3); border-radius: 6px; padding: 8px 16px; margin: 12px 0 20px;">
          <span style="color: #FFD700; font-size: 20px; font-weight: bold;">+${ptReward}</span>
          <span style="color: #888; font-size: 11px;">Parktokena zarađeno</span>
        </div>

        ${storiesUnlocked > 0 ? `
          <div style="text-align: left; margin-bottom: 20px;">
            <div style="font-size: 10px; color: #555; letter-spacing: 1px; margin-bottom: 8px;">MINI-PRIČE (${storiesUnlocked}/5)</div>
            ${storiesHtml}
          </div>
        ` : `
          <div style="font-size: 13px; color: #444; margin-bottom: 20px; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 4px;">
            Prva poseta! Vrati se sutra za više priča iz ove zone.
          </div>
        `}

        <button id="flavor-continue" style="
          background: ${cfg.accent};
          color: #0D1B2A;
          border: none;
          border-radius: 4px;
          padding: 12px 32px;
          font-family: monospace;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          width: 100%;
        ">Nastavi</button>
      </div>
    `;

    flavorOverlay.style.display = 'flex';

    flavorOverlay.querySelector('#flavor-continue')?.addEventListener('click', () => {
      hideFlavorScreen();
      if (emit) emit('flavorDismissed', { zoneId });
    });

    // Also close on backdrop click
    flavorOverlay.addEventListener('click', (e) => {
      if (e.target === flavorOverlay) hideFlavorScreen();
    }, { once: true });
  });
}

export function hideFlavorScreen() {
  if (flavorOverlay) flavorOverlay.style.display = 'none';
}

export function showUpgradeModal(state, zoneId, cost, onConfirm) {
  if (upgradeModal) upgradeModal.remove();

  const zoneNames = { pult: 'Pult', bina: 'Bina', suma: 'Šuma' };
  const currentLevel = state.zones[zoneId]?.level || 1;

  upgradeModal = document.createElement('div');
  upgradeModal.style.cssText = `
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #0a1520;
    border: 2px solid #FFD700;
    border-radius: 8px;
    padding: 24px;
    z-index: 700;
    font-family: monospace;
    color: #E8DCC8;
    text-align: center;
    min-width: 280px;
    box-shadow: 0 0 40px rgba(0,0,0,0.8);
  `;

  upgradeModal.innerHTML = `
    <div style="font-size: 11px; color: #555; letter-spacing: 2px; margin-bottom: 8px;">ZONA UPGRADE</div>
    <div style="font-size: 20px; font-weight: bold; color: #FFD700; margin-bottom: 4px;">
      ${zoneNames[zoneId] || zoneId}
    </div>
    <div style="font-size: 13px; color: #888; margin-bottom: 16px;">
      Lv${currentLevel} → Lv${currentLevel + 1}
    </div>
    <div style="font-size: 16px; color: #FFD700; margin-bottom: 20px;">
      Cena: <strong>${cost} PT</strong>
    </div>
    <div style="font-size: 11px; color: #444; margin-bottom: 20px;">
      Tvoj balans: ${state.pt} PT
    </div>
    <div style="display: flex; gap: 8px;">
      <button id="upgrade-cancel" style="flex:1; background:transparent; border:1px solid #333; color:#888;
              padding:10px; border-radius:4px; cursor:pointer; font-family:monospace;">Otkaži</button>
      <button id="upgrade-confirm" style="flex:1; background:#FFD700; color:#0D1B2A; border:none;
              padding:10px; border-radius:4px; cursor:pointer; font-family:monospace; font-weight:bold;">
        Upgrade!
      </button>
    </div>
  `;

  document.body.appendChild(upgradeModal);

  upgradeModal.querySelector('#upgrade-cancel')?.addEventListener('click', () => {
    upgradeModal?.remove();
    upgradeModal = null;
  });

  upgradeModal.querySelector('#upgrade-confirm')?.addEventListener('click', () => {
    upgradeModal?.remove();
    upgradeModal = null;
    if (onConfirm) onConfirm();
  });
}

export function showToast(message, type = 'info', duration = 2500) {
  if (!toastContainer) return;

  const colors = {
    info: '#5BA4CF',
    success: '#40C87E',
    pt: '#FFD700',
    error: '#FF4444',
    egg: '#FFD700'
  };
  const color = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: rgba(10, 21, 32, 0.95);
    border: 1px solid ${color};
    border-radius: 4px;
    padding: 8px 16px;
    font-family: monospace;
    font-size: 12px;
    color: ${color};
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s, transform 0.25s;
    transform: translateY(8px);
    white-space: nowrap;
    max-width: 300px;
    text-align: center;
  `;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function updatePTDisplay(pt) {
  const el = document.getElementById('pt-balance');
  if (el) {
    el.textContent = formatPT(pt);
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'ptPulse 0.4s ease-out';
  }
}
