/**
 * decision-cards.js — DOM kartica odluka za incident
 * Opcije (2-3), efekti na satisfaction/energiju, SVG timer
 */

import { bus, EVT } from '../events.js';
import { resolveIncident, timeoutIncident } from './incident-queue.js';
import { INCIDENT_TIMER_NORMAL, INCIDENT_TIMER_GUIDED } from '../config.js';
import { el, clearEl } from '../utils.js';

let _card = null;
let _timerInterval = null;
let _timeRemaining = 0;
let _microStateRef = null;
let _guidedActive = false;
let _staffHired = [];
let _reputation = 0;

/**
 * Shows decision card for incident
 */
export function showDecisionCard(incident, microState, staffHired = [], reputation = 0, guidedActive = false) {
  _microStateRef = microState;
  _guidedActive = guidedActive;
  _staffHired = staffHired;
  _reputation = reputation;
  _timeRemaining = guidedActive ? INCIDENT_TIMER_GUIDED : INCIDENT_TIMER_NORMAL;

  const overlay = el('#ui-overlay');
  if (!overlay) return;

  // Remove existing
  hideDecisionCard();

  const options = filterOptions(incident.options, staffHired, reputation);

  _card = document.createElement('div');
  _card.id = 'incident-card';
  _card.className = 'incident-card slide-in';
  _card.innerHTML = `
    <div class="incident-header">
      <div class="incident-icon">⚡</div>
      <div class="incident-title">${incident.name}</div>
      <div class="incident-timer-wrap">
        <svg class="timer-svg" viewBox="0 0 36 36" width="40" height="40">
          <circle class="timer-bg" cx="18" cy="18" r="15" fill="none" stroke="#333" stroke-width="3"/>
          <circle class="timer-circle" id="incident-timer-arc" cx="18" cy="18" r="15"
            fill="none" stroke="#F4C430" stroke-width="3"
            stroke-dasharray="94.25" stroke-dashoffset="0"
            transform="rotate(-90 18 18)"/>
        </svg>
        <span class="timer-num" id="incident-timer-num">${_timeRemaining}</span>
      </div>
    </div>
    <div class="incident-description">${incident.description}</div>
    <div class="incident-options">
      ${options.map((opt, i) => `
        <button class="incident-option ${opt.disabled ? 'disabled' : ''}"
                data-option="${i}" ${opt.disabled ? 'disabled' : ''}>
          <span class="opt-icon">${opt.icon || '▶'}</span>
          <span class="opt-text">${opt.text}</span>
          ${opt.disabled ? '<span class="opt-lock">🔒</span>' : renderEffectPreview(opt.effect)}
        </button>
      `).join('')}
    </div>
  `;

  overlay.appendChild(_card);

  // Bind option clicks
  _card.querySelectorAll('.incident-option:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.option);
      handleDecision(idx);
    });
  });

  // Start timer
  startTimer(incident);

  // Stop game speed (pause micro clock while deciding)
  bus.emit(EVT.SESSION_PAUSE);
}

function filterOptions(options, staff, rep) {
  return options.map(opt => {
    let disabled = false;
    if (opt.requires_staff && !staff.includes(opt.requires_staff) && opt.requires_staff !== 'any') {
      disabled = true;
    }
    if (opt.requires_staff === 'any' && staff.length === 0) {
      disabled = true;
    }
    if (opt.requires_reputation && rep < opt.requires_reputation) {
      disabled = true;
    }
    return { ...opt, disabled };
  });
}

function renderEffectPreview(effect) {
  if (!effect) return '';
  const parts = [];
  if (effect.satisfaction) parts.push(`<span class="${effect.satisfaction > 0 ? 'pos' : 'neg'}">${effect.satisfaction > 0 ? '+' : ''}${effect.satisfaction} sat.</span>`);
  if (effect.energy) parts.push(`<span class="${effect.energy > 0 ? 'pos' : 'neg'}">${effect.energy > 0 ? '+' : ''}${effect.energy} energ.</span>`);
  if (effect.time_minutes) parts.push(`<span class="neg">${effect.time_minutes}min</span>`);
  if (effect.cost) parts.push(`<span class="neg">-${effect.cost}€</span>`);
  if (effect.rep_bonus) parts.push(`<span class="pos">+${effect.rep_bonus} rep</span>`);
  if (parts.length === 0) return '';
  return `<div class="opt-effects">${parts.join(' ')}</div>`;
}

function startTimer(incident) {
  const total = _timeRemaining;
  const arc = document.getElementById('incident-timer-arc');
  const numEl = document.getElementById('incident-timer-num');
  const circumference = 94.25;

  _timerInterval = setInterval(() => {
    _timeRemaining--;
    if (numEl) numEl.textContent = _timeRemaining;
    if (arc) {
      const ratio = _timeRemaining / total;
      arc.style.strokeDashoffset = String(circumference * (1 - ratio));
      arc.style.stroke = ratio > 0.5 ? '#F4C430' : ratio > 0.25 ? '#C4956A' : '#cc3333';
    }

    if (_timeRemaining <= 0) {
      clearInterval(_timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function handleDecision(optionIndex) {
  clearInterval(_timerInterval);
  if (!_microStateRef) return;

  const effect = resolveIncident(_microStateRef, optionIndex);
  hideDecisionCard();
  bus.emit(EVT.SESSION_RESUME);

  if (effect) {
    bus.emit(EVT.AUDIO_PLAY, { sound: effect.satisfaction > 0 ? 'decision_positive' : 'incident_signal' });
  }
}

function handleTimeout() {
  if (!_microStateRef) return;
  timeoutIncident(_microStateRef);
  hideDecisionCard();
  bus.emit(EVT.SESSION_RESUME);
  bus.emit(EVT.TOAST, { msg: 'Vreme isteklo — situacija se pogoršala.', type: 'warning' });
}

export function hideDecisionCard() {
  clearInterval(_timerInterval);
  if (_card && _card.parentNode) {
    _card.classList.add('slide-out');
    setTimeout(() => _card?.parentNode?.removeChild(_card), 300);
    _card = null;
  }
}
