import { PRESTIGE_SCENARIOS } from '../systems/prestige.js';
import { formatDin } from '../economy/market.js';
import { getAchievementsByStatus, getRewardDescription, getAchievementSummary, getAchievementProgress } from '../systems/achievements.js';
import { GAME_CONFIG } from '../config.js';

const modalsLayer = () => document.getElementById('modals-layer');
const toastContainer = () => document.getElementById('toast-container');

// ─── Toast ─────────────────────────────────────────────────────────────────────

/**
 * Show a simple toast message.
 * @param {string} message
 * @param {number} [duration]
 */
export function showToast(message, duration = 3000) {
  const tc = toastContainer();
  if (!tc) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-info';
  toast.textContent = message;
  tc.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
  }, duration);
}

/**
 * Show achievement unlock toast with educational text.
 * @param {object} ach - achievement definition
 */
export function showAchievementToast(ach) {
  const tc = toastContainer();
  if (!tc) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-achievement';
  const rewardDesc = getRewardDescription(ach.reward);
  toast.innerHTML = `
    <div class="ach-toast-header">🏆 Achievement: <strong>${ach.name}</strong></div>
    <div class="ach-toast-reward">${rewardDesc}</div>
    <div class="ach-toast-edu">${ach.edu}</div>
  `;
  tc.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
  }, 6000);
}

// ─── Close helpers ────────────────────────────────────────────────────────────

function closeTopModal() {
  const ml = modalsLayer();
  if (!ml) return;
  const modals = ml.querySelectorAll('.modal-backdrop');
  if (modals.length > 0) {
    modals[modals.length - 1].remove();
  }
}

// Escape closes top modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeTopModal();
});

// ─── Season End Summary ────────────────────────────────────────────────────────

/**
 * Show end-of-season summary modal.
 * @param {object} data - { season, revenue, event, clearedEvent, averageRevenue }
 * @param {Function|null} onClose
 */
export function showSeasonEndModal(data, onClose) {
  const ml = modalsLayer();
  if (!ml) return;

  const trend = data.averageRevenue > 0
    ? data.revenue > data.averageRevenue * 1.05 ? '📈 Rast' : data.revenue < data.averageRevenue * 0.95 ? '📉 Pad' : '📊 Stabilno'
    : '';

  const eventSection = data.event
    ? `<div class="season-event-notice sev-${data.event.severity}">
        ${data.event.icon} <strong>${data.event.label}</strong><br>
        <span class="event-desc-small">${data.event.desc}</span>
        ${data.event.seasonsLeft > 0 ? `<span class="event-duration">(ostalo ${data.event.seasonsLeft} sezona)</span>` : ''}
      </div>`
    : '';

  const clearedSection = data.clearedEvent
    ? `<div class="season-cleared-notice">✓ Završen event: ${data.clearedEvent.label}</div>`
    : '';

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop season-end-modal';
  modal.innerHTML = `
    <div class="modal-box season-box">
      <div class="season-end-header">
        <div class="modal-title">🌱 Sezona ${data.season} završena</div>
        <div class="season-trend-badge">${trend}</div>
      </div>
      <div class="modal-body">
        <div class="season-stats-grid">
          <div class="season-stat">
            <span class="stat-label">Prihod ove sezone</span>
            <strong class="stat-value">${formatDin(data.revenue)}</strong>
          </div>
          ${data.averageRevenue > 0 ? `
          <div class="season-stat">
            <span class="stat-label">Prosek (posl. 3 sez.)</span>
            <strong class="stat-value">${formatDin(data.averageRevenue)}</strong>
          </div>` : ''}
        </div>
        ${eventSection}
        ${clearedSection}
      </div>
      <button class="modal-btn primary" id="season-modal-close">Nastavi →</button>
    </div>
  `;
  ml.appendChild(modal);

  const closeBtn = modal.querySelector('#season-modal-close');
  const doClose = () => {
    if (modal.parentNode) modal.remove();
    if (onClose) onClose();
  };
  closeBtn.addEventListener('click', doClose);

  // Auto-close after 5s
  const timer = setTimeout(doClose, 5000);
  closeBtn.addEventListener('click', () => clearTimeout(timer));
}

// ─── Phase Unlock ──────────────────────────────────────────────────────────────

/**
 * Show phase unlock celebration modal.
 * @param {string} phase
 * @param {string} label
 */
export function showPhaseUnlockModal(phase, label) {
  const ml = modalsLayer();
  if (!ml) return;

  const phaseDetails = {
    'A': { icon: '🌱', unlocks: 'Plastenik (15.000 din), Kanal Pijaca (5.000 din)' },
    'B': { icon: '🌿', unlocks: 'Restoran kanal (20.000 din), Masterclass (sezona 4+)' },
    'C': { icon: '🏡', unlocks: 'Prestiž Reset — pokreni novi ciklus sa bonusima!' },
  };
  const details = phaseDetails[phase] || { icon: '🎉', unlocks: '' };

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop phase-unlock-modal';
  modal.innerHTML = `
    <div class="modal-box phase-unlock-box animate-phase-unlock">
      <div class="phase-unlock-icon">${details.icon}</div>
      <div class="modal-title">Nova faza otključana!</div>
      <div class="phase-unlock-label">${label}</div>
      ${details.unlocks ? `<div class="phase-unlock-desc">Novo dostupno:<br><strong>${details.unlocks}</strong></div>` : ''}
      <button class="modal-btn primary" id="phase-close">Super! 🎉</button>
    </div>
  `;
  ml.appendChild(modal);
  modal.querySelector('#phase-close').addEventListener('click', () => modal.remove());
  setTimeout(() => { if (modal.parentNode) modal.remove(); }, 6000);
}

// ─── Prestige Modal ────────────────────────────────────────────────────────────

/**
 * Show prestige scenario selection modal.
 * @param {object} state
 * @param {object} gameRef
 */
export function showPrestigeModal(state, gameRef) {
  const ml = modalsLayer();
  if (!ml) return;

  const carryCapital = Math.floor(state.capital * GAME_CONFIG.PRESTIGE_CAPITAL_CARRY);
  const nextCount = state.prestige.count + 1;
  const newYieldMult = Math.pow(GAME_CONFIG.PRESTIGE_YIELD_MULTIPLIER_BASE, nextCount);
  const newSpeedMult = 1.0 + GAME_CONFIG.PRESTIGE_SPEED_PER_COUNT * nextCount;

  const scenarios = PRESTIGE_SCENARIOS.map(s => {
    const unlocked = s.unlockCount <= state.prestige.count;
    return `
      <div class="prestige-scenario ${unlocked ? 'ps-unlocked' : 'ps-locked'}">
        <div class="ps-header">${s.name}</div>
        <div class="ps-desc">${s.desc}</div>
        <ul class="ps-bonuses">${s.bonuses.map(b => `<li>✓ ${b}</li>`).join('')}</ul>
        ${unlocked
          ? `<button class="modal-btn prestige-select" data-scenario="${s.id}">Izaberi →</button>`
          : `<div class="ps-locked-msg">🔒 Zahteva ${s.unlockCount} prestiž reset(a) (trenutno: ${state.prestige.count})</div>`}
      </div>
    `;
  }).join('');

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop prestige-modal';
  modal.innerHTML = `
    <div class="modal-box prestige-box">
      <div class="modal-title">⭐ Prestiž Reset</div>
      <div class="prestige-info-grid">
        <div class="prestige-warning">
          ⚠️ Prestiž resetuje imanje, ali zadržavaš <strong>50% kapitala</strong>,
          sve achievement bonuse i pojačavaš stalne multiplikatore.
        </div>
        <div class="prestige-bonuses-preview">
          <div class="prestige-carry">Kapital koji prenosiš: <strong>${formatDin(carryCapital)}</strong></div>
          <div class="prestige-mults">
            Novi yield mult: <strong>×${newYieldMult.toFixed(3)}</strong> |
            Brzina: <strong>×${newSpeedMult.toFixed(2)}</strong>
          </div>
        </div>
      </div>
      <div class="prestige-scenarios">${scenarios}</div>
      <button class="modal-btn cancel" id="prestige-cancel">✗ Otkaži</button>
    </div>
  `;
  ml.appendChild(modal);

  modal.querySelectorAll('.prestige-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = btn.getAttribute('data-scenario');
      import('../systems/prestige.js').then(({ doPrestige }) => {
        const success = doPrestige(state, scenario, gameRef?.audio);
        if (success) {
          modal.remove();
          showToast('🌟 Prestiž uspešan! Imanje se vraća na početak sa novim bonusima.');
          showPrestigeSuccessModal(state);
        } else {
          showToast('⚠️ Prestiž nije moguć.');
        }
      });
    });
  });

  modal.querySelector('#prestige-cancel').addEventListener('click', () => modal.remove());
}

function showPrestigeSuccessModal(state) {
  const ml = modalsLayer();
  if (!ml) return;
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop prestige-success-modal';
  modal.innerHTML = `
    <div class="modal-box animate-phase-unlock">
      <div class="phase-unlock-icon">⭐</div>
      <div class="modal-title">Prestiž ${state.prestige.count} aktiviran!</div>
      <div class="prestige-new-stats">
        <div>Yield: <strong>×${state.prestige.yieldMultiplier.toFixed(3)}</strong></div>
        <div>Brzina: <strong>×${state.prestige.speedMultiplier.toFixed(2)}</strong></div>
        <div>Kapital: <strong>${formatDin(state.capital)}</strong></div>
      </div>
      <button class="modal-btn primary" id="prestige-success-close">Počni ponovo! 🌱</button>
    </div>
  `;
  ml.appendChild(modal);
  modal.querySelector('#prestige-success-close').addEventListener('click', () => modal.remove());
  setTimeout(() => { if (modal.parentNode) modal.remove(); }, 8000);
}

// ─── Event Alert ───────────────────────────────────────────────────────────────

/**
 * Show seasonal event alert modal.
 * @param {object} event - active event object
 * @param {Function|null} onClose
 */
export function showEventModal(event, onClose) {
  const ml = modalsLayer();
  if (!ml) return;

  const sevClass = event.severity === 'positive' ? 'event-positive' : 'event-negative';

  const modal = document.createElement('div');
  modal.className = `modal-backdrop event-modal ${sevClass}`;
  modal.innerHTML = `
    <div class="modal-box event-box">
      <div class="event-icon-large">${event.icon || '⚡'}</div>
      <div class="modal-title">${event.label}</div>
      <div class="event-desc">${event.desc}</div>
      ${event.seasonsLeft > 0
        ? `<div class="event-duration-label">Traje još: <strong>${event.seasonsLeft} sezonu/e</strong></div>`
        : '<div class="event-duration-label">Kratkotrajna — završava odmah</div>'
      }
      <button class="modal-btn primary" id="event-close">Razumem</button>
    </div>
  `;
  ml.appendChild(modal);

  const doClose = () => {
    if (modal.parentNode) modal.remove();
    if (onClose) onClose();
  };
  modal.querySelector('#event-close').addEventListener('click', doClose);
  setTimeout(doClose, 8000);
}

// ─── Projection Modal ──────────────────────────────────────────────────────────

/**
 * Show upgrade investment projection modal.
 * @param {object} projectionData
 * @param {string} upgradeName
 * @param {Function} onConfirm
 * @param {Function} onCancel
 */
export function showProjectionModal(projectionData, upgradeName, onConfirm, onCancel) {
  const ml = modalsLayer();
  if (!ml) return;

  const roiClass = projectionData.roi3Seasons >= 0 ? 'roi-positive' : 'roi-negative';
  const roiIcon = projectionData.roi3Seasons >= 100 ? '🚀' : projectionData.roi3Seasons >= 0 ? '📈' : '📉';

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop projection-modal';
  modal.innerHTML = `
    <div class="modal-box projection-box">
      <div class="modal-title">📊 Analiza investicije</div>
      <div class="proj-upgrade-name">${upgradeName}</div>
      <div class="proj-stats">
        <div class="proj-stat">
          <span class="proj-stat-label">Investicija</span>
          <strong class="proj-stat-val">${formatDin(projectionData.investment)}</strong>
        </div>
        <div class="proj-stat">
          <span class="proj-stat-label">Proc. prihod/sez.</span>
          <strong class="proj-stat-val">${formatDin(projectionData.estimatedPerSeason)}</strong>
        </div>
        <div class="proj-stat">
          <span class="proj-stat-label">Breakeven</span>
          <strong class="proj-stat-val">${projectionData.breakevenSeasons > 0 ? projectionData.breakevenSeasons + ' sez.' : 'odmah'}</strong>
        </div>
        <div class="proj-stat">
          <span class="proj-stat-label">ROI za 3 sez. ${roiIcon}</span>
          <strong class="proj-stat-val ${roiClass}">${projectionData.roi3Seasons}%</strong>
        </div>
      </div>
      <div class="proj-advice">
        ${projectionData.breakevenSeasons <= 2
          ? '✅ Dobra investicija — brz povrat!'
          : projectionData.breakevenSeasons <= 5
            ? '⚠️ Srednja investicija — isplati se dugoročno.'
            : '🤔 Skupa investicija — razmisli o prioritetu.'
        }
      </div>
      <div class="proj-actions">
        <button class="modal-btn primary" id="proj-confirm">✓ Kupi</button>
        <button class="modal-btn cancel" id="proj-cancel">✗ Otkaži</button>
      </div>
    </div>
  `;
  ml.appendChild(modal);

  modal.querySelector('#proj-confirm').addEventListener('click', () => {
    modal.remove();
    if (onConfirm) onConfirm();
  });
  modal.querySelector('#proj-cancel').addEventListener('click', () => {
    modal.remove();
    if (onCancel) onCancel();
  });
}

// ─── Achievement Gallery ──────────────────────────────────────────────────────

/**
 * Show full achievement gallery modal.
 * @param {object} state
 */
export function showAchievementGallery(state) {
  const ml = modalsLayer();
  if (!ml) return;

  const { unlocked, available, locked } = getAchievementsByStatus(state);
  const summary = getAchievementSummary(state);

  const renderAch = (ach, status, pct) => {
    const progBar = status === 'available' && typeof pct === 'number'
      ? `<div class="ach-progress-bar"><div class="ach-progress-fill" style="width:${(pct * 100).toFixed(0)}%"></div></div>`
      : '';
    return `
      <div class="ach-item ach-${status}">
        <div class="ach-item-header">
          <span class="ach-icon">${status === 'unlocked' ? '🏆' : status === 'available' ? '⏳' : '🔒'}</span>
          <span class="ach-name">${ach.name}</span>
        </div>
        ${progBar}
        <div class="ach-edu">${ach.edu}</div>
        ${status === 'unlocked' ? `<div class="ach-reward-done">✓ ${getRewardDescription(ach.reward)}</div>` : ''}
      </div>
    `;
  };

  let html = `
    <div class="modal-box ach-gallery-box">
      <div class="modal-title">🏆 Achievements</div>
      <div class="ach-summary">
        ${summary.unlocked}/${summary.total} otključano (${summary.pct}%) |
        Revenue bonus: +${summary.revenueBonusPct}%
      </div>
      <div class="ach-gallery">
  `;

  if (unlocked.length > 0) {
    html += `<div class="ach-section-title">Otključano (${unlocked.length})</div>`;
    html += unlocked.map(a => renderAch(a, 'unlocked')).join('');
  }

  if (available.length > 0) {
    html += `<div class="ach-section-title">U toku (${available.length})</div>`;
    html += available.map(a => {
      const { pct } = getAchievementProgress(state, a);
      return renderAch(a, 'available', pct);
    }).join('');
  }

  if (locked.length > 0) {
    html += `<div class="ach-section-title">Zaključano (${locked.length})</div>`;
    html += locked.slice(0, 5).map(a => renderAch(a, 'locked')).join('');
    if (locked.length > 5) {
      html += `<div class="ach-more">... i još ${locked.length - 5} zaključano</div>`;
    }
  }

  html += `</div>
    <button class="modal-btn primary" id="ach-gallery-close">Zatvori</button>
  </div>`;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop ach-gallery-modal';
  modal.innerHTML = html;
  ml.appendChild(modal);

  modal.querySelector('#ach-gallery-close').addEventListener('click', () => modal.remove());
}

// ─── Help overlay ─────────────────────────────────────────────────────────────

/**
 * Show keyboard/controls help overlay.
 */
export function showHelpOverlay() {
  const ml = modalsLayer();
  if (!ml) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop help-modal';
  modal.innerHTML = `
    <div class="modal-box help-box">
      <div class="modal-title">⌨️ Kontrole i Pomoć</div>
      <div class="help-sections">
        <div class="help-section">
          <div class="help-section-title">Tasteri</div>
          <div class="help-row"><kbd>1</kbd> Pečurke tab</div>
          <div class="help-row"><kbd>2</kbd> Plastenik tab</div>
          <div class="help-row"><kbd>3</kbd> Jezero tab</div>
          <div class="help-row"><kbd>M</kbd> Makro panel toggle</div>
          <div class="help-row"><kbd>Esc</kbd> Zatvori modal</div>
          <div class="help-row"><kbd>H</kbd> Ova pomoć</div>
        </div>
        <div class="help-section">
          <div class="help-section-title">Gameplay kratko</div>
          <div class="help-row">🍄 Inokulacija pečurki: klikni u roku od 10s za +10% bonus</div>
          <div class="help-row">🌱 Mikrobiljke: beri u roku od 8s od dospijavanja za +5%</div>
          <div class="help-row">🐟 Hranjenje ribe: klikni kad se otvori prozor (15s)</div>
          <div class="help-row">🎓 Masterclass: troši 2 akcije, donosi prihod i reputaciju</div>
          <div class="help-row">⭐ Prestiž: Faza C + 3 sezone surplus = novi ciklus</div>
        </div>
        <div class="help-section">
          <div class="help-section-title">Kanali prodaje</div>
          <div class="help-row">🏠 Direktna: 1.0× — uvek dostupna</div>
          <div class="help-row">🛒 Pijaca: 1.2× — 5.000 din</div>
          <div class="help-row">🍽️ Restoran: 1.55× — 20.000 din</div>
          <div class="help-row">💻 Online: 1.9× — 35.000 din</div>
          <div class="help-row">🎓 Masterclass: 2.5× — organski prihod</div>
        </div>
      </div>
      <button class="modal-btn primary" id="help-close">Razumeo/la ✓</button>
    </div>
  `;
  ml.appendChild(modal);
  modal.querySelector('#help-close').addEventListener('click', () => modal.remove());
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

/**
 * Show a generic confirm dialog.
 * @param {string} title
 * @param {string} body
 * @param {Function} onConfirm
 * @param {Function} [onCancel]
 */
export function showConfirmDialog(title, body, onConfirm, onCancel) {
  const ml = modalsLayer();
  if (!ml) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop confirm-modal';
  modal.innerHTML = `
    <div class="modal-box confirm-box">
      <div class="modal-title">${title}</div>
      <div class="confirm-body">${body}</div>
      <div class="confirm-actions">
        <button class="modal-btn primary" id="conf-ok">Potvrdi</button>
        <button class="modal-btn cancel" id="conf-cancel">Otkaži</button>
      </div>
    </div>
  `;
  ml.appendChild(modal);

  modal.querySelector('#conf-ok').addEventListener('click', () => {
    modal.remove();
    if (onConfirm) onConfirm();
  });
  modal.querySelector('#conf-cancel').addEventListener('click', () => {
    modal.remove();
    if (onCancel) onCancel();
  });
}
