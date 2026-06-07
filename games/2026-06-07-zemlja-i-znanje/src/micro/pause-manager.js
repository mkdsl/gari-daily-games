/**
 * pause-manager.js — Pauza logika, trajanje, efekat na energiju
 */

import { bus, EVT } from '../events.js';
import { getBrandMessage, getBrandLinkHTML } from '../content/brand-hooks.js';
import { nextAforizem } from '../content/aforizmi.js';
import { el, createEl } from '../utils.js';

let _pauseStartTime = null;
let _pauseOverlay = null;

/**
 * Pauziraj sesiju
 * @param {string} reason — 'user', 'incident', 'slot_pauza'
 */
export function pauseSession(reason = 'user') {
  _pauseStartTime = Date.now();

  if (reason === 'user' || reason === 'slot_pauza') {
    showPauseOverlay();
  }

  bus.emit(EVT.SESSION_PAUSE, { reason });
  bus.emit(EVT.AUDIO_AMBIENT_STOP);

  if (reason === 'slot_pauza') {
    bus.emit(EVT.AUDIO_PLAY, { sound: 'pauza_ambient' });
  }
}

/**
 * Nastavi sesiju
 */
export function resumeSession() {
  hidePauseOverlay();
  _pauseStartTime = null;

  bus.emit(EVT.SESSION_RESUME);
  bus.emit(EVT.AUDIO_AMBIENT_START);
}

function showPauseOverlay() {
  const overlay = el('#ui-overlay');
  if (!overlay) return;

  hidePauseOverlay();

  _pauseOverlay = createEl('div', 'pause-overlay');
  _pauseOverlay.id = 'pause-overlay';

  const aforizem = nextAforizem();
  const brandHTML = getBrandLinkHTML('small');

  _pauseOverlay.innerHTML = `
    <div class="pause-content">
      <div class="pause-icon">☕</div>
      <h2 class="pause-title">Pauza</h2>
      <p class="pause-aforizem">"${aforizem}"</p>
      <div class="pause-brand">${brandHTML}</div>
      <button class="btn-primary" id="btn-resume-session">Nastavi ▶</button>
    </div>
  `;

  overlay.appendChild(_pauseOverlay);

  const btnResume = el('#btn-resume-session', _pauseOverlay);
  if (btnResume) {
    btnResume.addEventListener('click', resumeSession);
  }
}

function hidePauseOverlay() {
  if (_pauseOverlay && _pauseOverlay.parentNode) {
    _pauseOverlay.parentNode.removeChild(_pauseOverlay);
    _pauseOverlay = null;
  }
}

export function isPaused() {
  return _pauseStartTime !== null;
}

export function getPauseDuration() {
  if (!_pauseStartTime) return 0;
  return Date.now() - _pauseStartTime;
}
