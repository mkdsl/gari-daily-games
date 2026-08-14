/** @fileoverview Onboarding modals (N1-N3), event decision popups, week result summary */

import { getState, setState } from '../state.js';
import { getVolunteerIntro } from '../content/volunteers_data.js';

/** @type {HTMLElement|null} */
let _overlayEl = null;

/**
 * Initialize modal overlay
 * @param {HTMLElement} overlayEl
 */
export function initModals(overlayEl) {
  _overlayEl = overlayEl;
  _overlayEl.addEventListener('click', (e) => {
    if (e.target === _overlayEl) closeModal();
  });
}

/**
 * Show a modal with custom content
 * @param {string} html
 * @param {{ closable?: boolean, className?: string }} opts
 * @returns {HTMLElement} modal element
 */
export function showModal(html, opts = {}) {
  if (!_overlayEl) return null;

  _overlayEl.innerHTML = `
    <div class="modal ${opts.className || ''}">
      ${opts.closable !== false ? '<button class="modal-close">✕</button>' : ''}
      ${html}
    </div>
  `;
  _overlayEl.classList.add('modal-overlay-active');
  const closeBtn = _overlayEl.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  return _overlayEl.querySelector('.modal');
}

/**
 * Close the active modal
 */
export function closeModal() {
  if (!_overlayEl) return;
  _overlayEl.classList.remove('modal-overlay-active');
  _overlayEl.innerHTML = '';
}

/**
 * Show onboarding modal for week N (N1-N3)
 * @param {number} week
 * @param {Function} onComplete
 */
export function showOnboarding(week, onComplete) {
  const state = getState();

  let html;
  if (week === 1) {
    html = `
      <div class="modal-header">
        <h2>🌄 Dobro došao u Guncati Grand</h2>
        <p class="modal-subtitle">Teren čeka. 10 nedelja do Grand Finale-a.</p>
      </div>
      <div class="modal-steps">
        <div class="step-card">
          <span class="step-num">1</span>
          <h3>Alociraš budžet</h3>
          <p>500 GC nedeljno. Raspodeli između Gradnje, Hrane, Marketinga i Zajednice.</p>
        </div>
        <div class="step-card">
          <span class="step-num">2</span>
          <h3>Raspoređuješ volontere</h3>
          <p>Svaki volonter ima jake i slabe strane. Prava osoba, pravi zadatak.</p>
        </div>
        <div class="step-card">
          <span class="step-num">3</span>
          <h3>Pratiš Wellbeing</h3>
          <p>WB iznad 60%? Tom Sawyer efekat — volonteri rade besplatno!</p>
        </div>
      </div>
      <div class="modal-note">
        <strong>Nedelja 1:</strong> Samo Gradnja i Hrana dostupni. Marketing i Zajednica se otključavaju u Nedelji 3.
      </div>
      <button class="btn-primary btn-large" id="onboarding-next">Kreni! 🚀</button>
    `;
  } else if (week === 2) {
    const ana = state.volunteers.find(v => v.typeId === 'ana');
    const intro = ana ? getVolunteerIntro('ana') : 'Ana je tu!';
    html = `
      <div class="modal-header">
        <h2>⭐ ${ana?.name || 'Ana'} se priključuje!</h2>
        <p class="modal-quote">"${intro}"</p>
      </div>
      <div class="modal-body">
        <p>Ana može da radi sve podjednako dobro — savršena za prvu nedelju.</p>
        <p>Sada možeš da dodeljuješ zadatke volonterima u <strong>Micro</strong> fazi.</p>
        <div class="volunteer-preview">
          <div class="stat-row">
            <span>Energija</span><div class="mini-bar" style="width:70%"></div>
          </div>
          <div class="stat-row">
            <span>Glad</span><div class="mini-bar" style="width:70%"></div>
          </div>
          <div class="stat-row">
            <span>Vibe</span><div class="mini-bar" style="width:70%"></div>
          </div>
        </div>
      </div>
      <button class="btn-primary btn-large" id="onboarding-next">Rasporedi Anu! 👷</button>
    `;
  } else if (week === 3) {
    html = `
      <div class="modal-header">
        <h2>✊ Svi slajderi otključani!</h2>
        <p class="modal-subtitle">Marketing i Zajednica su sada dostupni.</p>
      </div>
      <div class="modal-body">
        <div class="tip-box">
          <h3>Tom Sawyer Princip</h3>
          <p>WB iznad <strong>60%</strong> = svaki % štedi <strong>4 GC</strong> na volonterima.</p>
          <p>Sa WB 80% i 4 volontera → šteduješ <strong>80 GC</strong> nedeljno!</p>
        </div>
        <div class="tip-box">
          <h3>Volonterski Pool raste</h3>
          <p>Novi volonteri pristižu svake nedelje. Svaki donosi jedinstvene sposobnosti.</p>
        </div>
      </div>
      <button class="btn-primary btn-large" id="onboarding-next">Razumem! 🎯</button>
    `;
  } else {
    onComplete?.();
    return;
  }

  const modal = showModal(html, { closable: false, className: 'modal-onboarding' });
  if (modal) {
    const btn = modal.querySelector('#onboarding-next');
    if (btn) {
      btn.addEventListener('click', () => {
        closeModal();
        setState({ onboardingStep: week });
        onComplete?.();
      });
    }
  }
}

/**
 * Show week result summary
 * @param {Object} result - weeklyResult object
 * @param {Function} onContinue
 */
export function showWeekResult(result, onContinue) {
  const wbDeltaStr = result.wbDelta > 0 ? `+${result.wbDelta}` : `${result.wbDelta}`;
  const wbColor = result.wbDelta >= 0 ? '#4caf50' : '#f44336';

  const newVolHTML = result.newVolunteers?.length > 0
    ? `<div class="result-section">
         <h4>🎉 Novi volonteri!</h4>
         ${result.newVolunteers.map(n => `<span class="vol-badge">${n}</span>`).join('')}
       </div>`
    : '';

  const html = `
    <div class="modal-header">
      <h2>📊 Nedelja ${result.week} — Rezime</h2>
    </div>
    <div class="result-grid">
      <div class="result-item">
        <span class="result-label">WB promjena</span>
        <span class="result-value" style="color:${wbColor}">${wbDeltaStr}%</span>
      </div>
      <div class="result-item">
        <span class="result-label">Prihod</span>
        <span class="result-value result-positive">+${result.revenue} GC</span>
      </div>
      <div class="result-item">
        <span class="result-label">Publika</span>
        <span class="result-value">${result.crowdSize} posjetilaca</span>
      </div>
      <div class="result-item">
        <span class="result-label">Kapacitet</span>
        <span class="result-value">${result.crowdCap} max</span>
      </div>
    </div>
    ${newVolHTML}
    ${result.week >= 9 ? '<div class="finale-warning">⚡ Finale se bliži! Nedelja ' + (result.week + 1) + ' od 10.</div>' : ''}
    <button class="btn-primary btn-large" id="result-continue">
      ${result.week >= 10 ? '🎪 Kreni na Finale!' : `➡️ Nedelja ${result.week + 1}`}
    </button>
  `;

  const modal = showModal(html, { closable: false, className: 'modal-result' });
  if (modal) {
    modal.querySelector('#result-continue')?.addEventListener('click', () => {
      closeModal();
      onContinue?.();
    });
  }
}

/**
 * Show volunteer join modal
 * @param {Object} volunteer
 * @param {Function} onClose
 */
export function showVolunteerJoin(volunteer, onClose) {
  const intro = getVolunteerIntro(volunteer.typeId);
  const html = `
    <div class="modal-header">
      <div class="vol-join-emoji">${volunteer.emoji}</div>
      <h2>${volunteer.name} se priključuje!</h2>
      <p class="modal-quote">"${intro}"</p>
    </div>
    <div class="vol-stats-preview">
      <div class="stat-item">
        <label>Energija</label>
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${volunteer.energija}%;background:var(--c-fire)"></div></div>
      </div>
      <div class="stat-item">
        <label>Glad</label>
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${volunteer.glad}%;background:var(--c-gold)"></div></div>
      </div>
      <div class="stat-item">
        <label>Vibe</label>
        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${volunteer.vibe}%;background:var(--c-forest)"></div></div>
      </div>
    </div>
    <button class="btn-primary" id="vol-join-ok">Super! 🎉</button>
  `;

  const modal = showModal(html, { closable: false, className: 'modal-volunteer-join' });
  modal?.querySelector('#vol-join-ok')?.addEventListener('click', () => {
    closeModal();
    onClose?.();
  });
}

/**
 * Show confirmation dialog
 * @param {string} message
 * @param {Function} onConfirm
 * @param {Function} onCancel
 */
export function showConfirm(message, onConfirm, onCancel) {
  const html = `
    <div class="modal-header">
      <h2>⚠️ Potvrdi</h2>
      <p>${message}</p>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" id="confirm-cancel">Otkaži</button>
      <button class="btn-danger" id="confirm-ok">Potvrdi</button>
    </div>
  `;

  const modal = showModal(html, { closable: false });
  modal?.querySelector('#confirm-ok')?.addEventListener('click', () => {
    closeModal();
    onConfirm?.();
  });
  modal?.querySelector('#confirm-cancel')?.addEventListener('click', () => {
    closeModal();
    onCancel?.();
  });
}
