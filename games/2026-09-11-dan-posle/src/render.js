/**
 * render.js — DOM rendering, decision card factory, resource bars
 */

import { RESOURCES } from './config.js';
import { neredIcons } from './entities/event_aftermath.js';
import { formatHour } from './systems/timer.js';
import { flashResource, bounceElement } from './transitions.js';

/**
 * Renderuj HUD (resource bars)
 * @param {object} resources
 * @param {HTMLElement} container
 */
export function renderHUD(resources, container) {
  const bars = container.querySelectorAll('.resource-bar');
  bars.forEach(bar => {
    const key = bar.dataset.resource;
    const val = resources[key];
    const def = RESOURCES[key];
    if (!def) return;

    const fill = bar.querySelector('.bar-fill');
    const label = bar.querySelector('.bar-value');
    const icons = bar.querySelector('.nered-icons');

    if (fill) {
      const pct = (val / def.max) * 100;
      fill.style.width = `${pct}%`;
      fill.style.backgroundColor = def.color;
    }
    if (label) {
      label.textContent = val;
    }
    if (icons && key === 'nered') {
      icons.textContent = neredIcons(val);
    }
  });
}

/**
 * Flash resource bars kad se promeni vrednost
 * @param {object} deltaActual - { energija, veze, secanja, nered }
 * @param {HTMLElement} hudContainer
 */
export function flashResourceBars(deltaActual, hudContainer) {
  for (const [key, delta] of Object.entries(deltaActual)) {
    if (delta === 0) continue;
    const bar = hudContainer.querySelector(`[data-resource="${key}"]`);
    if (!bar) continue;
    // Za nered: smanjenje je pozitivno (bolje)
    const def = RESOURCES[key];
    const positive = def?.inverted ? delta < 0 : delta > 0;
    flashResource(bar, positive);
  }
}

/**
 * Renderuj decision card
 * @param {DecisionNode} node
 * @param {Array} options - sa .disabled i .auto flagovima
 * @param {Function} onChoose - callback(option)
 * @param {boolean} isPrestige
 * @returns {HTMLElement}
 */
export function renderDecisionCard(node, options, onChoose, isPrestige = false) {
  const card = document.createElement('div');
  card.className = 'decision-card';
  card.dataset.nodeId = node.id;

  // Header
  const header = document.createElement('div');
  header.className = 'card-header';

  const time = document.createElement('span');
  time.className = 'card-time';
  time.textContent = formatHour(node.hour);

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = node.title;

  // Badge (Toma / Kluboslavija)
  if (node.toma) {
    const badge = document.createElement('span');
    badge.className = 'badge badge-toma';
    badge.textContent = '👴 Toma';
    header.appendChild(badge);
  }
  if (node.kluboslavija) {
    const badge = document.createElement('span');
    badge.className = 'badge badge-kl';
    badge.textContent = '🎵 Kluboslavija';
    header.appendChild(badge);
  }

  header.appendChild(time);
  header.appendChild(title);
  card.appendChild(header);

  // Tekst
  const text = document.createElement('p');
  text.className = 'card-text';
  // U prestige runu, koristi textPrestige ako postoji
  text.textContent = (isPrestige && node.textPrestige) ? node.textPrestige : node.text;
  card.appendChild(text);

  // Opcije
  const optionsEl = document.createElement('div');
  optionsEl.className = 'card-options';

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    if (option.disabled) btn.classList.add('option-disabled');
    if (option.auto) btn.classList.add('option-auto');
    btn.dataset.optionId = option.id;

    const labelEl = document.createElement('span');
    labelEl.className = 'option-label';
    labelEl.textContent = option.label + (option.auto ? ' (automatski)' : '');

    const deltaEl = renderDeltaPreview(option.delta);

    btn.appendChild(labelEl);
    btn.appendChild(deltaEl);

    if (!option.disabled) {
      btn.addEventListener('click', () => onChoose(option));
    }
    optionsEl.appendChild(btn);
  });

  card.appendChild(optionsEl);
  return card;
}

/**
 * Renderuj delta preview (mali tagovi +E, -N itd.)
 * @param {object} delta - { e, v, s, n }
 * @returns {HTMLElement}
 */
function renderDeltaPreview(delta) {
  const el = document.createElement('div');
  el.className = 'delta-preview';

  const MAP = [
    { key: 'e', label: 'E', resource: 'energija' },
    { key: 'v', label: 'V', resource: 'veze' },
    { key: 's', label: 'S', resource: 'secanja' },
    { key: 'n', label: 'N', resource: 'nered', inverted: true }
  ];

  MAP.forEach(({ key, label, resource, inverted }) => {
    const v = delta?.[key] || 0;
    if (v === 0) return;
    const tag = document.createElement('span');
    const positive = inverted ? v < 0 : v > 0;
    tag.className = `delta-tag ${positive ? 'delta-pos' : 'delta-neg'}`;
    tag.textContent = `${v > 0 ? '+' : ''}${v}${label}`;
    el.appendChild(tag);
  });

  return el;
}

/**
 * Renderuj result text posle izabrane opcije
 * @param {string} text
 * @param {string|null} reactionText
 * @returns {HTMLElement}
 */
export function renderChoiceResult(text, reactionText) {
  const el = document.createElement('div');
  el.className = 'choice-result';

  const main = document.createElement('p');
  main.className = 'result-text';
  main.textContent = text;
  el.appendChild(main);

  if (reactionText) {
    const reaction = document.createElement('p');
    reaction.className = 'result-reaction';
    reaction.textContent = reactionText;
    el.appendChild(reaction);
  }

  return el;
}

/**
 * Renderuj delta prikaz (šta se promenilo)
 * @param {Array} displayItems - formatDeltaDisplay output
 * @returns {HTMLElement}
 */
export function renderDeltaDisplay(displayItems) {
  const el = document.createElement('div');
  el.className = 'delta-display';

  displayItems.forEach(item => {
    const tag = document.createElement('span');
    tag.className = `delta-display-tag ${item.positive ? 'delta-pos' : 'delta-neg'}`;
    tag.textContent = `${item.value > 0 ? '+' : ''}${item.value} ${item.label}`;
    el.appendChild(tag);
  });

  return el;
}

/**
 * Renderuj sat header
 * @param {number} hour
 * @param {string} locationName
 * @param {string} atmLabel
 * @returns {HTMLElement}
 */
export function renderHourHeader(hour, locationName, atmLabel) {
  const el = document.createElement('div');
  el.className = 'hour-header';

  const timeEl = document.createElement('div');
  timeEl.className = 'hour-time';
  timeEl.textContent = formatHour(hour);

  const loc = document.createElement('div');
  loc.className = 'hour-location';
  loc.textContent = locationName;

  const atm = document.createElement('div');
  atm.className = 'hour-atm-label';
  atm.textContent = atmLabel;

  el.appendChild(timeEl);
  el.appendChild(loc);
  el.appendChild(atm);
  return el;
}

/**
 * Renderuj progress bar (cela igra)
 * @param {number} ratio - 0..1
 * @param {HTMLElement} el - bar element
 */
export function renderProgress(ratio, el) {
  if (!el) return;
  el.style.width = `${Math.min(100, ratio * 100)}%`;
}
