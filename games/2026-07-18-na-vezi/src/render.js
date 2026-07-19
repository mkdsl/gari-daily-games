/** Koordinira DOM/Canvas rendering, orkestrira sve trake */
import { getState } from './state.js';
import { formatCapital, formatAudience } from './config.js';
import { updateOffgridMeter } from './ui/offgrid-meter.js';
import { getDashboardState } from './micro/dashboard-state.js';
import { getSignalQuality } from './micro/signal-system.js';
import { getRecentMessages } from './micro/chat-momentum.js';
import { formatCapacityInfo } from './micro/offgrid-runtime.js';
import { calcCurrentDrain } from './micro/offgrid-runtime.js';
import { formatEngagement } from './micro/platform-curves.js';

/** @type {HTMLElement} */
let _appEl = null;

/** @type {Map<string, HTMLElement>} Cachiran DOM po screen ID-u */
const _screens = new Map();

/**
 * Inicijalizuje render sistem
 * @param {HTMLElement} appEl
 */
export function initRender(appEl) {
  _appEl = appEl;
}

/**
 * Prikazuje ekran, skriva ostale
 * @param {string} screenId
 */
export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.add('active');
  }
}

/**
 * Render top bar HUD (kapital, audience, multiplier)
 */
export function renderTopBar() {
  const state = getState();
  const topBar = document.getElementById('top-bar');
  if (!topBar) return;

  const totalAud = (state.audience.ig || 0) + (state.audience.tiktok || 0) + (state.audience.youtube || 0);
  topBar.innerHTML = `
    <div class="hud-item">
      <span class="hud-value">${formatCapital(state.capital)}</span>
      <span class="hud-label">💰 Kapital</span>
    </div>
    <div class="hud-divider"></div>
    <div class="hud-item">
      <span class="hud-value">${formatAudience(totalAud)}</span>
      <span class="hud-label">👥 Publika</span>
    </div>
    <div class="hud-divider"></div>
    <div class="hud-item">
      <span class="hud-value">S${state.prestige_count + 1}E${state.emisije_u_sezoni + 1}</span>
      <span class="hud-label">📺 Sezona</span>
    </div>
    <div class="hud-spacer"></div>
    ${state.prestige_count > 0 ? `
      <div class="hud-item">
        <span class="hud-value" style="color:var(--color-crt);">×${state.season_multiplier.toFixed(2)}</span>
        <span class="hud-label">⚡ Mult</span>
      </div>
    ` : ''}
    <button class="btn btn-ghost btn-sm" id="mute-btn">🔊</button>
  `;
}

/**
 * Render micro dashboard — signal traka
 * @param {number} signal 0-100
 */
export function renderSignalBar(signal) {
  const bar = document.getElementById('signal-bar-fill');
  const status = document.getElementById('signal-status');
  const quality = getSignalQuality(signal);

  if (bar) {
    bar.style.width = `${signal}%`;
    bar.style.background = quality.cssClass === 'ok'
      ? 'var(--color-signal)'
      : quality.cssClass === 'warn'
      ? 'var(--color-warn)'
      : 'var(--color-critical)';
    bar.className = `signal-bar-fill ${quality.cssClass === 'critical' ? 'dropping' : ''}`;
  }

  if (status) {
    status.textContent = `${Math.round(signal)}%`;
    status.style.color = quality.cssClass === 'ok'
      ? 'var(--color-signal)'
      : quality.cssClass === 'warn'
      ? 'var(--color-warn)'
      : 'var(--color-critical)';
  }
}

/**
 * Render micro dashboard — off-grid meter
 * @param {number} capacity
 * @param {number} maxCapacity
 * @param {string} weatherBand
 */
export function renderOffgridMeter(capacity, maxCapacity, weatherBand) {
  const drainPerSec = calcCurrentDrain();
  updateOffgridMeter(capacity, maxCapacity, drainPerSec, weatherBand);
}

/**
 * Render micro dashboard — timer
 * @param {number} elapsed
 * @param {number} duration
 */
export function renderTimer(elapsed, duration) {
  const timerEl = document.getElementById('micro-timer');
  if (!timerEl) return;

  const remaining = Math.max(0, duration - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

  if (remaining < 60) {
    timerEl.style.color = 'var(--color-warn)';
  } else {
    timerEl.style.color = 'var(--color-text)';
  }
}

/**
 * Render chat panel sa novim porukama
 * @param {string} platform
 * @param {Array} newMessages
 * @param {number} momentum 0-1
 */
export function renderChatUpdate(platform, newMessages, momentum) {
  const chatContainer = document.getElementById(`chat-messages-${platform}`);
  if (!chatContainer) return;

  for (const msg of newMessages) {
    const el = document.createElement('div');
    el.className = `chat-msg ${msg.tag}`;
    el.innerHTML = `<span class="name">${msg.name}</span>: ${_escapeHtml(msg.text.replace(msg.name, '').trim() || msg.text)}`;
    chatContainer.appendChild(el);
  }

  // Max 30 visible poruka
  while (chatContainer.children.length > 30) {
    chatContainer.removeChild(chatContainer.firstChild);
  }

  // Auto-scroll
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Momentum bar
  const momentumFill = document.getElementById(`momentum-fill-${platform}`);
  if (momentumFill) {
    momentumFill.style.width = `${Math.round(momentum * 100)}%`;
  }
}

/**
 * Render alarm na overlay
 * @param {Object} alarm
 * @param {HTMLElement} overlay
 */
export function renderAlarm(alarm, overlay) {
  const existingCard = overlay.querySelector(`[data-alarm-id="${alarm.id}"]`);
  if (existingCard) return; // Already rendered

  const card = document.createElement('div');
  card.className = `alarm-card${alarm.severity === 'critical' ? ' critical' : ''}`;
  card.dataset.alarmId = alarm.id;

  card.innerHTML = `
    <div class="alarm-title">${alarm.title}</div>
    <div class="alarm-desc">${alarm.desc}</div>
    <div class="alarm-timer-bar">
      <div class="alarm-timer-fill" id="alarm-timer-${alarm.id}" style="width:100%;"></div>
    </div>
    <div class="alarm-actions">
      ${alarm.actions.map(a => `
        <button class="btn btn-sm${a.id === 'reroute' || a.id === 'diagnose' ? ' btn-primary' : ''}"
                data-alarm-id="${alarm.id}" data-action="${a.id}">
          ${a.label}
        </button>
      `).join('')}
    </div>
  `;

  overlay.appendChild(card);
}

/**
 * Ažurira timer bar za alarm
 * @param {string} alarmId
 * @param {number} timeRemaining
 * @param {number} timeLimit
 */
export function updateAlarmTimer(alarmId, timeRemaining, timeLimit) {
  const fill = document.getElementById(`alarm-timer-${alarmId}`);
  if (fill) {
    const pct = Math.max(0, (timeRemaining / timeLimit) * 100);
    fill.style.width = `${pct}%`;
    if (pct < 30) {
      fill.style.background = 'var(--color-critical)';
    }
  }
}

/**
 * Uklanja alarm card
 * @param {string} alarmId
 */
export function removeAlarmCard(alarmId) {
  const card = document.querySelector(`[data-alarm-id="${alarmId}"]`);
  if (card) card.remove();
}

/**
 * HTML escape helper
 * @param {string} str
 * @returns {string}
 */
function _escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render engagement po platformi u micro layeru
 * @param {Object} engagement
 */
export function renderEngagement(engagement) {
  for (const p of ['ig', 'tiktok', 'youtube']) {
    const el = document.getElementById(`engagement-${p}`);
    if (el) {
      el.textContent = formatEngagement(engagement[p] || 0);
    }
  }
}

/**
 * Flash screen efekat (signal drop, baterija)
 * @param {'signal'|'battery'} type
 */
export function flashScreen(type) {
  const micro = document.getElementById('screen-micro');
  if (!micro) return;
  if (type === 'battery') {
    micro.classList.toggle('battery-critical', true);
  } else {
    micro.classList.toggle('signal-drop-active', true);
    setTimeout(() => micro.classList.remove('signal-drop-active'), 1000);
  }
}

/**
 * Uklanja battery critical flash
 */
export function removeBatteryCriticalFlash() {
  const micro = document.getElementById('screen-micro');
  if (micro) micro.classList.remove('battery-critical');
}
