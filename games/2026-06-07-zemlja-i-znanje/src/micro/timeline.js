/**
 * timeline.js — Timeline traka za micro sesiju
 * Progress indicator, current slot highlight, time markers
 */

import { SESSION_SLOTS, ACTIVITY_TYPES } from '../config.js';
import { formatGameClock } from './timing-engine.js';
import { el, clearEl } from '../utils.js';

let _container = null;

/**
 * Mount timeline strip
 * @param {HTMLElement} container
 * @param {Array} plan — [{slotIndex, activity}]
 */
export function mountTimeline(container, plan) {
  _container = container;
  clearEl(_container);

  _container.className = 'micro-timeline';

  plan.forEach((slot, i) => {
    const act = ACTIVITY_TYPES[slot.activity] || ACTIVITY_TYPES.teorija;
    const timeLabel = formatGameClock(i * 60, 8);

    const slotEl = document.createElement('div');
    slotEl.className = 'micro-slot';
    slotEl.id = `micro-slot-${i}`;
    slotEl.style.borderColor = act.color;
    slotEl.innerHTML = `
      <div class="ms-time">${timeLabel}</div>
      <div class="ms-icon">${act.icon}</div>
      <div class="ms-name">${act.name}</div>
      <div class="ms-progress-bar"><div class="ms-progress-fill" id="slot-fill-${i}"></div></div>
    `;
    _container.appendChild(slotEl);
  });
}

/**
 * Update timeline vizual na osnovu micro state
 */
export function updateTimeline(microState) {
  if (!_container) return;

  const currentSlot = microState.currentSlot;
  const slotProgress = microState.slotProgress;

  for (let i = 0; i < SESSION_SLOTS; i++) {
    const slotEl = el(`#micro-slot-${i}`, _container);
    if (!slotEl) continue;

    slotEl.classList.remove('active', 'completed');

    if (i < currentSlot) {
      slotEl.classList.add('completed');
    } else if (i === currentSlot) {
      slotEl.classList.add('active');
      const fillEl = el(`#slot-fill-${i}`, _container);
      if (fillEl) fillEl.style.width = `${Math.round(slotProgress * 100)}%`;
    }
  }
}
