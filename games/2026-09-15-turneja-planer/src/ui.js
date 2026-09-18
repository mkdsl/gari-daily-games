/** @module ui — HUD resource bars, modal overlays, screen helpers */

import { moodLabel, moodColor } from './systems/crew_mood.js';
import { reachTier } from './systems/reach.js';

/**
 * Update all HUD resource bars
 * @param {{ budget:number, crew_mood:number, reputation:number, reach:number }} resources
 */
export function updateHUD(resources) {
  const { budget, crew_mood, reputation, reach } = resources;

  setEl('hud-budget', `€ ${Math.round(budget).toLocaleString()}`);
  setEl('hud-budget-bar', null, { width: `${Math.max(0, Math.min(100, (budget / 5000) * 100))}%` });
  document.getElementById('hud-budget-bar')?.style.setProperty(
    'background', budget < 0 ? '#e63946' : budget < 500 ? '#f77f00' : '#52b788'
  );

  setEl('hud-mood', moodLabel(crew_mood));
  setEl('hud-mood-bar', null, { width: `${(crew_mood / 10) * 100}%` });
  document.getElementById('hud-mood-bar')?.style.setProperty('background', moodColor(crew_mood));

  setEl('hud-rep', `⭐ ${reputation.toFixed(1)}`);
  setEl('hud-rep-bar', null, { width: `${(reputation / 10) * 100}%` });

  setEl('hud-reach', reachTier(reach));
  setEl('hud-reach-val', `${reach.toFixed(1)}k`);
  setEl('hud-reach-bar', null, { width: `${(reach / 50) * 100}%` });
}

/**
 * Update city progress dots in HUD
 * @param {string[]} route
 * @param {number} current_index
 */
export function updateRouteDots(route, current_index) {
  const container = document.getElementById('hud-route');
  if (!container) return;
  container.innerHTML = '';
  const cityColors = {
    beograd: '#E63946', novi_sad: '#2EC4B6', nis: '#F77F00',
    sarajevo: '#A8DADC', guncati: '#52B788',
  };
  const cityEmoji = {
    beograd: '🏙️', novi_sad: '🌊', nis: '🔴', sarajevo: '🕌', guncati: '🌿',
  };
  route.forEach((city_id, i) => {
    const dot = document.createElement('div');
    dot.className = 'route-dot' + (i === current_index ? ' active' : '') + (i < current_index ? ' done' : '');
    dot.style.background = cityColors[city_id] || '#666';
    dot.title = city_id;
    dot.textContent = cityEmoji[city_id] || '•';
    container.appendChild(dot);
    if (i < route.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'route-arrow';
      arrow.textContent = '→';
      container.appendChild(arrow);
    }
  });
}

/**
 * Show a modal overlay
 * @param {string} title
 * @param {string} body_html
 * @param {Array<{label:string, id:string, primary?:boolean}>} buttons
 * @returns {HTMLElement} modal element
 */
export function showModal(title, body_html, buttons = []) {
  // Remove existing
  document.getElementById('modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  modal.innerHTML = `
    <h2 class="modal-title">${title}</h2>
    <div class="modal-body">${body_html}</div>
    <div class="modal-buttons">${buttons.map(b =>
      `<button id="${b.id}" class="btn ${b.primary ? 'btn-primary' : 'btn-secondary'}">${b.label}</button>`
    ).join('')}</div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Hide modal
 */
export function hideModal() {
  document.getElementById('modal-overlay')?.remove();
}

/**
 * Show a toast notification
 * @param {string} msg
 * @param {'info'|'success'|'warn'|'error'} type
 * @param {number} [dur=3000]
 */
export function toast(msg, type = 'info', dur = 3000) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  // Animate in
  requestAnimationFrame(() => el.classList.add('toast-show'));
  setTimeout(() => {
    el.classList.remove('toast-show');
    setTimeout(() => el.remove(), 400);
  }, dur);
}

/**
 * Create a card element
 * @param {import('./content/cards.js').Card} card
 * @param {number} card_num - 1-4
 * @param {boolean} flipped
 * @returns {HTMLElement}
 */
export function createCardEl(card, card_num, flipped = false) {
  const el = document.createElement('div');
  el.className = 'card' + (flipped ? ' card-flipped' : '');
  el.id = `card-${card.id}`;
  el.dataset.card_id = card.id;

  el.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <div class="card-num">Kartica ${card_num}</div>
        <div class="card-icon">🃏</div>
        <div class="card-tap">Klikni da vidiš</div>
      </div>
      <div class="card-back">
        <div class="card-category">${getCategoryLabel(card.category)}</div>
        <h3 class="card-title">${card.title}</h3>
        <div class="card-options">
          ${card.options.map((opt, i) => `
            <button class="card-option" data-option="${'ABC'[i]}">
              <span class="option-label">${opt.label}</span>
              <span class="option-effects">${formatEffectsPreview(opt.effects)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  return el;
}

/**
 * Create a resource delta display
 * @param {Object} delta
 * @returns {string} HTML
 */
export function deltaHTML(delta) {
  const parts = [];
  if (delta.budget) parts.push(`<span class="${delta.budget > 0 ? 'pos' : 'neg'}">${delta.budget > 0 ? '+' : ''}€${delta.budget}</span>`);
  if (delta.crew_mood) parts.push(`<span class="${delta.crew_mood > 0 ? 'pos' : 'neg'}">${delta.crew_mood > 0 ? '+' : ''}${delta.crew_mood.toFixed(1)} Mood</span>`);
  if (delta.reputation) parts.push(`<span class="${delta.reputation > 0 ? 'pos' : 'neg'}">${delta.reputation > 0 ? '+' : ''}${delta.reputation.toFixed(1)} Rep</span>`);
  if (delta.reach) parts.push(`<span class="${delta.reach > 0 ? 'pos' : 'neg'}">${delta.reach > 0 ? '+' : ''}${delta.reach.toFixed(1)} Reach</span>`);
  if (delta.cq_bonus) parts.push(`<span class="${delta.cq_bonus > 0 ? 'pos' : 'neg'}">${delta.cq_bonus > 0 ? '+' : ''}${delta.cq_bonus.toFixed(1)} CQ</span>`);
  return parts.length ? parts.join(' ') : '<span class="neutral">Nema efekta</span>';
}

// ---- Helpers ----

function setEl(id, text, styles) {
  const el = document.getElementById(id);
  if (!el) return;
  if (text !== null && text !== undefined) el.textContent = text;
  if (styles) Object.assign(el.style, styles);
}

function getCategoryLabel(cat) {
  const map = { L: '🚗 Logistika', CR: '👥 Crew', CE: '🎤 Publika', F: '💰 Finansije', R: '⭐ Reputacija' };
  return map[cat] || cat;
}

function formatEffectsPreview(effects) {
  const parts = [];
  if (effects.budget > 0) parts.push(`+€${effects.budget}`);
  else if (effects.budget < 0) parts.push(`€${effects.budget}`);
  if (effects.crew_mood > 0) parts.push(`+${effects.crew_mood}😊`);
  else if (effects.crew_mood < 0) parts.push(`${effects.crew_mood}😟`);
  if (effects.reputation > 0) parts.push(`+${effects.reputation}⭐`);
  else if (effects.reputation < 0) parts.push(`${effects.reputation}⭐`);
  if (effects.reach > 0) parts.push(`+${effects.reach}📡`);
  if (effects.cq_bonus > 0) parts.push(`+${effects.cq_bonus}🎵`);
  else if (effects.cq_bonus < 0) parts.push(`${effects.cq_bonus}🎵`);
  if (effects.random) parts.push('🎲');
  return parts.length ? parts.join(' ') : 'Neutralno';
}
