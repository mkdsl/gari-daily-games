import { CONFIG } from '../config.js';
import { getNpcMissions, claimNpcReward, getMissionTemplate } from '../systems/npc-board.js';

let panelEl = null;
let isOpen = false;
let currentState = null;
let emitFn = null;

export function createNpcPanel() {
  if (panelEl) return panelEl;

  panelEl = document.createElement('div');
  panelEl.id = 'npc-panel';
  panelEl.style.cssText = `
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 320px;
    background: #0a1520;
    border-left: 2px solid #1a2d42;
    z-index: 400;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    font-family: monospace;
    overflow: hidden;
  `;

  document.body.appendChild(panelEl);
  return panelEl;
}

function getNpcAccent(npcId) {
  const accents = {
    vlado: CONFIG.COLORS?.PULT_ACCENT || '#BF5FFF',
    ace: CONFIG.COLORS?.BINA_ACCENT || '#FFB830',
    mara: CONFIG.COLORS?.SUMA_ACCENT || '#40C87E',
    djordje: '#78B7A0'
  };
  return accents[npcId] || '#E8DCC8';
}

function renderMissionCard(mission) {
  const accent = getNpcAccent(mission.npcId);
  const progress = mission.progress || 0;
  const target = mission.target || 1;
  const pct = Math.min(100, Math.round((progress / target) * 100));
  const completed = mission.completed || false;
  const claimed = mission.claimed || false;

  return `
    <div class="npc-card" data-npc="${mission.npcId}" style="
      margin-bottom: 12px;
      padding: 12px;
      background: #0d1825;
      border-left: 3px solid ${claimed ? '#333' : accent};
      border-radius: 0 6px 6px 0;
      opacity: ${claimed ? 0.5 : 1};
    ">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div>
          <div style="font-size: 12px; font-weight: bold; color: ${accent};">${escHtml(mission.name)}</div>
          <div style="font-size: 10px; color: #667; margin-top: 2px;">${escHtml(mission.description)}</div>
        </div>
        <div style="text-align: right; flex-shrink: 0; margin-left: 8px;">
          <div style="font-size: 16px; font-weight: bold; color: #FFD700;">${mission.reward || '?'} PT</div>
          <div style="font-size: 9px; color: #444;">nagrada</div>
        </div>
      </div>

      <!-- Progress bar -->
      <div style="background: #0a1020; border-radius: 2px; height: 6px; margin-bottom: 8px;">
        <div style="background: ${accent}; width: ${pct}%; height: 6px; border-radius: 2px; transition: width 0.3s;"></div>
      </div>
      <div style="font-size: 9px; color: #555; margin-bottom: 8px;">
        ${mission.type === 'daily_light_checkin' ? (completed ? 'Kompletiran' : 'Čeka daily light check-in') : `${progress} / ${target}`}
      </div>

      ${completed && !claimed ? `
        <button class="npc-claim-btn" data-npc="${mission.npcId}" style="
          width: 100%;
          background: ${accent};
          color: #0D1B2A;
          border: none;
          border-radius: 4px;
          padding: 7px;
          font-family: monospace;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
        ">Predaj misiju (+${mission.reward} PT)</button>
      ` : claimed ? `
        <div style="font-size: 10px; color: #333; text-align: center;">Isplaćeno</div>
      ` : ''}
    </div>
  `;
}

function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderNpcPanel(state, emit) {
  currentState = state;
  emitFn = emit;

  const el = createNpcPanel();
  const missions = getNpcMissions(state);

  el.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #1a2d42; flex-shrink: 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; color: #555; letter-spacing: 2px;">NEDELJNE</div>
          <div style="font-size: 18px; font-weight: bold; color: #E8DCC8;">NPC Misije</div>
        </div>
        <button id="npc-close" style="
          background: transparent; border: 1px solid #333;
          color: #888; width: 28px; height: 28px;
          border-radius: 4px; cursor: pointer; font-size: 14px; font-family: monospace;
        ">x</button>
      </div>
      <div style="font-size: 10px; color: #444; margin-top: 6px;">
        Reset: svaki ponedeljak u 00:00 UTC
      </div>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 12px;">
      ${missions.map(m => renderMissionCard(m)).join('')}
    </div>
  `;

  el.querySelector('#npc-close')?.addEventListener('click', closeNpcPanel);

  el.querySelectorAll('.npc-claim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const npcId = btn.dataset.npc;
      const earned = claimNpcReward(state, npcId, emit);
      if (earned > 0) {
        renderNpcPanel(state, emit); // re-render
      }
    });
  });
}

export function openNpcPanel(state, emit) {
  const el = createNpcPanel();
  renderNpcPanel(state, emit);
  requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; });
  isOpen = true;
}

export function closeNpcPanel() {
  if (!panelEl) return;
  panelEl.style.transform = 'translateX(100%)';
  isOpen = false;
}

export function isNpcPanelOpen() { return isOpen; }
export function toggleNpcPanel(state, emit) {
  if (isOpen) closeNpcPanel(); else openNpcPanel(state, emit);
}
