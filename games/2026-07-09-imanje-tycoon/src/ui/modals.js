import { PRESTIGE_SCENARIOS } from '../systems/prestige.js';
import { formatDin } from '../economy/market.js';

const modalsLayer = () => document.getElementById('modals-layer');
const toastContainer = () => document.getElementById('toast-container');

// ─── Toast ─────────────────────────────────────────────────────────────────

/** Show a simple toast message */
export function showToast(message, duration = 3000) {
  const tc = toastContainer();
  if (!tc) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-info';
  toast.textContent = message;
  tc.appendChild(toast);
  setTimeout(() => toast.classList.add('toast-visible'), 10);
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/** Show achievement unlock toast with educational text */
export function showAchievementToast(ach) {
  const tc = toastContainer();
  if (!tc) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-achievement';
  toast.innerHTML = `
    <div class="ach-toast-header">🏆 Achievement: <strong>${ach.name}</strong></div>
    <div class="ach-toast-edu">${ach.edu}</div>
  `;
  tc.appendChild(toast);
  setTimeout(() => toast.classList.add('toast-visible'), 10);
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// ─── Season End Summary ────────────────────────────────────────────────────

export function showSeasonEndModal(data, onClose) {
  const ml = modalsLayer();
  if (!ml) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop season-end-modal';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-title">🌱 Sezona ${data.season} završena</div>
      <div class="modal-body">
        <div class="season-stat"><span>Prihod sezone:</span><strong>${formatDin(data.revenue)}</strong></div>
        ${data.event ? `<div class="event-notice ${data.event.type}">${data.event.label} ${data.event.desc}</div>` : ''}
      </div>
      <button class="modal-btn primary" id="season-modal-close">Nastavi →</button>
    </div>
  `;
  ml.appendChild(modal);

  const closeBtn = modal.querySelector('#season-modal-close');
  closeBtn.addEventListener('click', () => {
    modal.remove();
    if (onClose) onClose();
  });

  // Auto-close after 4s
  setTimeout(() => {
    if (modal.parentNode) {
      modal.remove();
      if (onClose) onClose();
    }
  }, 4000);
}

// ─── Phase Unlock ──────────────────────────────────────────────────────────

export function showPhaseUnlockModal(phase, label) {
  const ml = modalsLayer();
  if (!ml) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop phase-unlock-modal';
  modal.innerHTML = `
    <div class="modal-box phase-unlock-box animate-phase-unlock">
      <div class="phase-unlock-icon">🎉</div>
      <div class="modal-title">Nova faza otključana!</div>
      <div class="phase-unlock-label">${label}</div>
      <button class="modal-btn primary" id="phase-close">Super!</button>
    </div>
  `;
  ml.appendChild(modal);
  modal.querySelector('#phase-close').addEventListener('click', () => modal.remove());
  setTimeout(() => { if (modal.parentNode) modal.remove(); }, 5000);
}

// ─── Prestige Modal ────────────────────────────────────────────────────────

export function showPrestigeModal(state, gameRef) {
  const ml = modalsLayer();
  if (!ml) return;

  const scenarios = PRESTIGE_SCENARIOS.map(s => {
    const unlocked = s.unlockCount <= state.prestige.count;
    return `
      <div class="prestige-scenario ${unlocked ? '' : 'locked'}" data-scenario="${s.id}">
        <div class="ps-header">${s.name}</div>
        <div class="ps-desc">${s.desc}</div>
        <ul class="ps-bonuses">${s.bonuses.map(b => `<li>✓ ${b}</li>`).join('')}</ul>
        ${unlocked
          ? `<button class="modal-btn prestige-select" data-scenario="${s.id}">Izaberi →</button>`
          : `<div class="ps-locked-msg">Zahteva ${s.unlockCount} prestiž</div>`}
      </div>
    `;
  }).join('');

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop prestige-modal';
  modal.innerHTML = `
    <div class="modal-box prestige-box">
      <div class="modal-title">⭐ Prestiž Reset</div>
      <div class="prestige-warning">
        Prestiž resetuje imanje, ali zadržavaš <strong>50% kapitala</strong>, sve achievement bonuse i pojačaš stalne multiplikatore.
      </div>
      <div class="prestige-carry">Kapital koji prenosiš: <strong>${formatDin(state.capital * 0.5)}</strong></div>
      <div class="prestige-scenarios">${scenarios}</div>
      <button class="modal-btn cancel" id="prestige-cancel">Otkaži</button>
    </div>
  `;
  ml.appendChild(modal);

  modal.querySelectorAll('.prestige-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = btn.getAttribute('data-scenario');
      import('../systems/prestige.js').then(({ doPrestige }) => {
        doPrestige(state, scenario, gameRef.audio);
        modal.remove();
        showToast('🌟 Prestiž uspešan! Imanje se vraća na početak sa novim bonusima.');
      });
    });
  });

  modal.querySelector('#prestige-cancel').addEventListener('click', () => modal.remove());
}

// ─── Event Alert ───────────────────────────────────────────────────────────

export function showEventModal(event, onClose) {
  const ml = modalsLayer();
  if (!ml) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop event-modal';
  modal.innerHTML = `
    <div class="modal-box event-box">
      <div class="event-icon">${event.label.split(' ')[0]}</div>
      <div class="modal-title">${event.label}</div>
      <div class="event-desc">${event.desc}</div>
      <button class="modal-btn primary" id="event-close">Razumem</button>
    </div>
  `;
  ml.appendChild(modal);

  modal.querySelector('#event-close').addEventListener('click', () => {
    modal.remove();
    if (onClose) onClose();
  });
  setTimeout(() => { if (modal.parentNode) { modal.remove(); if (onClose) onClose(); } }, 8000);
}

// ─── Projection Modal ─────────────────────────────────────────────────────

export function showProjectionModal(projectionData, upgradeName, onConfirm, onCancel) {
  const ml = modalsLayer();
  if (!ml) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop projection-modal';
  modal.innerHTML = `
    <div class="modal-box projection-box">
      <div class="modal-title">📊 Analiza investicije</div>
      <div class="proj-upgrade-name">${upgradeName}</div>
      <div class="proj-stats">
        <div class="proj-stat"><span>Investicija:</span><strong>${formatDin(projectionData.investment)}</strong></div>
        <div class="proj-stat"><span>Procenjeni prihod/sez.:</span><strong>${formatDin(projectionData.estimatedPerSeason)}</strong></div>
        <div class="proj-stat"><span>Breakeven:</span><strong>${projectionData.breakevenSeasons} sez.</strong></div>
        <div class="proj-stat"><span>ROI za 3 sez.:</span><strong class="${projectionData.roi3Seasons >= 0 ? 'positive' : 'negative'}">${projectionData.roi3Seasons}%</strong></div>
      </div>
      <div class="proj-actions">
        <button class="modal-btn primary" id="proj-confirm">✓ Kupi</button>
        <button class="modal-btn cancel" id="proj-cancel">✗ Otkaži</button>
      </div>
    </div>
  `;
  ml.appendChild(modal);

  modal.querySelector('#proj-confirm').addEventListener('click', () => { modal.remove(); if (onConfirm) onConfirm(); });
  modal.querySelector('#proj-cancel').addEventListener('click', () => { modal.remove(); if (onCancel) onCancel(); });
}
