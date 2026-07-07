/**
 * ResourceBar.js — HUD resource display: clock, morale, reputation, patience
 * Always-visible resource panel at top of screen
 * @module ResourceBar
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';
import GameState, { RESOURCE_CAPS } from '../utils/GameState.js';

/** @type {HTMLElement|null} */
let container = null;

/** @type {object} DOM element references */
const els = {};

/**
 * Initialize resource bar
 * @param {HTMLElement} parent
 */
export function init(parent) {
  container = document.createElement('div');
  container.className = 'resource-bar';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-label', 'Resursi');
  container.innerHTML = buildHTML();
  parent.appendChild(container);

  // Cache element references
  els.clockMinute = container.querySelector('.rb-clock-minute');
  els.clockHour = container.querySelector('.rb-clock-hour');
  els.timeVal = container.querySelector('.rb-time-value');
  els.morale = container.querySelector('.rb-morale-figures');
  els.patience = container.querySelector('.rb-patience-fill');
  els.patienceVal = container.querySelector('.rb-patience-value');
  els.reputation = container.querySelector('.rb-reputation-hearts');

  // Listen for resource changes
  EventBus.on(EVENTS.RESOURCE_CHANGED, ({ resource, to, from }) => {
    updateResource(resource, to, from);
  });

  // Initial render
  renderAll();
}

function buildHTML() {
  return `
    <div class="rb-section rb-section-time" title="Vreme do soundchecka">
      <div class="rb-clock" aria-label="Analogni sat">
        <div class="rb-clock-face">
          <div class="rb-clock-hand rb-clock-hour"></div>
          <div class="rb-clock-hand rb-clock-minute"></div>
          <div class="rb-clock-center"></div>
        </div>
      </div>
      <div class="rb-time-value">60 min</div>
      <div class="rb-label">Vreme</div>
    </div>
    <div class="rb-section rb-section-morale" title="Moral ekipe">
      <div class="rb-morale-figures">
        ${Array.from({ length: 4 }, (_, i) => `<div class="rb-figure rb-figure-${i}" aria-hidden="true"></div>`).join('')}
      </div>
      <div class="rb-label">Moral</div>
    </div>
    <div class="rb-section rb-section-reputation" title="Reputacija">
      <div class="rb-reputation-hearts">
        ${Array.from({ length: 5 }, (_, i) => `<div class="rb-heart rb-heart-${i}" aria-hidden="true">♥</div>`).join('')}
      </div>
      <div class="rb-label">Rep</div>
    </div>
    <div class="rb-section rb-section-patience" title="Strpljenje">
      <div class="rb-patience-bar">
        <div class="rb-patience-fill"></div>
      </div>
      <div class="rb-patience-value">4</div>
      <div class="rb-label">Strp.</div>
    </div>
  `;
}

function renderAll() {
  const r = GameState.raw().resources;
  updateResource('time', r.time, r.time);
  updateResource('morale', r.morale, r.morale);
  updateResource('reputation', r.reputation, r.reputation);
  updateResource('patience', r.patience, r.patience);
}

/**
 * Update a single resource display
 * @param {string} resource
 * @param {number} to
 * @param {number} from
 */
function updateResource(resource, to, from) {
  switch (resource) {
    case 'time':
      updateClock(to);
      if (els.timeVal) {
        els.timeVal.textContent = `${to} min`;
        els.timeVal.classList.toggle('critical', to <= 10);
      }
      break;

    case 'morale':
      updateMoraleFigures(to);
      break;

    case 'reputation':
      updateReputationHearts(to);
      break;

    case 'patience':
      updatePatienceBar(to);
      break;
  }

  // Flash animation on change
  if (from !== to && container) {
    const section = container.querySelector(`.rb-section-${resource}`);
    if (section) {
      const cls = to < from ? 'rb-flash-down' : 'rb-flash-up';
      section.classList.add(cls);
      setTimeout(() => section.classList.remove(cls), 600);
    }
  }
}

/**
 * Update analog clock display
 * time = 0-60 min remaining → clock shows 13:00 + (60 - time) minutes = 14:00
 * @param {number} timeLeft
 */
function updateClock(timeLeft) {
  // Game starts at 13:00, soundcheck at 14:00
  // timeLeft=60 → 13:00, timeLeft=0 → 14:00
  const totalMinutesPast = 60 - timeLeft; // 0-60 minutes past 13:00
  const hour = 13 + Math.floor(totalMinutesPast / 60);
  const minute = totalMinutesPast % 60;

  const minuteDeg = minute * 6; // 360/60
  const hourDeg = (hour % 12) * 30 + minute * 0.5; // 360/12 + offset

  if (els.clockMinute) els.clockMinute.style.transform = `rotate(${minuteDeg}deg)`;
  if (els.clockHour) els.clockHour.style.transform = `rotate(${hourDeg}deg)`;
}

/**
 * Update morale figures (greyed out as morale drops)
 * @param {number} value 0-4
 */
function updateMoraleFigures(value) {
  if (!els.morale) return;
  const figures = els.morale.querySelectorAll('.rb-figure');
  figures.forEach((fig, i) => {
    fig.classList.toggle('active', i < value);
    fig.classList.toggle('inactive', i >= value);
  });
}

/**
 * Update reputation hearts
 * @param {number} value 0-5
 */
function updateReputationHearts(value) {
  if (!els.reputation) return;
  const hearts = els.reputation.querySelectorAll('.rb-heart');
  hearts.forEach((heart, i) => {
    heart.classList.toggle('filled', i < value);
    heart.classList.toggle('empty', i >= value);
  });
}

/**
 * Update patience thermometer bar
 * @param {number} value 0-5
 */
function updatePatienceBar(value) {
  if (els.patience) {
    const pct = (value / RESOURCE_CAPS.patience) * 100;
    els.patience.style.height = `${pct}%`;
    els.patience.classList.toggle('critical', value <= 1);
  }
  if (els.patienceVal) {
    els.patienceVal.textContent = value;
  }
}

export default { init };
