/**
 * ui.js — DOM HUD i screen management za DJ za pultom
 * Pera Piksel + Jova jQuery | Gari Daily Games
 */

import { formatElapsed, getZoneProgress } from '../../systems/zones.js';
import { getAvailableUpgrades, canBuyUpgrade } from '../../systems/upgrades.js';

// --- Interne reference ---
let _onTrackClick = null;
let _onUpgradeBuy = null;
let _drawerOpen = false;
let _root = null;

// --- Zona labele ---
const ZONE_LABELS = {
  zagrevanje:  { name: 'ZAGREVANJE',  multi: '×1.0', cls: 'zona-zagrevanje' },
  vrhunac:     { name: 'VRHUNAC',     multi: '×1.5', cls: 'zona-vrhunac'    },
  after_hours: { name: 'AFTER HOURS', multi: '×2.0', cls: 'zona-after-hours'},
};

// --- initUI ---
export function initUI(onTrackClick, onUpgradeBuy) {
  _onTrackClick = onTrackClick;
  _onUpgradeBuy = onUpgradeBuy;

  _root = document.getElementById('game-root');
  if (!_root) return;

  _root.innerHTML = '';
  _root.appendChild(_buildHUD());
}

function _buildHUD() {
  const wrap = _el('div', { id: 'hud-wrap' });

  // Top bar
  const topBar = _el('div', { id: 'top-bar', role: 'banner' });
  topBar.appendChild(_el('span', { id: 'hud-time', 'aria-label': 'Vreme' }, '00:00:00'));
  topBar.appendChild(_el('span', { id: 'hud-coins', 'aria-label': 'Music Coins' }, '🎵 0 MC'));
  wrap.appendChild(topBar);

  // Energy bar
  const energyWrap = _el('div', { id: 'energy-bar-wrap', role: 'group', 'aria-label': 'Crowd energy' });
  const barTrack = _el('div', { id: 'energy-track' });
  const barFill = _el('div', { id: 'energy-fill', role: 'progressbar', 'aria-valuenow': '50', 'aria-valuemin': '0', 'aria-valuemax': '100' });
  barTrack.appendChild(barFill);
  energyWrap.appendChild(barTrack);
  energyWrap.appendChild(_el('span', { id: 'energy-pct' }, '50%'));
  wrap.appendChild(energyWrap);

  // Zona badge
  const badge = _el('div', { id: 'zone-badge', 'aria-live': 'polite' });
  badge.appendChild(_el('span', { id: 'zone-name' }, 'ZAGREVANJE'));
  badge.appendChild(_el('span', { id: 'zone-multi' }, '×1.0'));
  wrap.appendChild(badge);

  // Canvas wrap
  const canvasWrap = _el('div', { id: 'canvas-wrap' });
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvasWrap.appendChild(canvas);
  wrap.appendChild(canvasWrap);

  // Track button
  const trackBtn = _el('button', {
    id: 'track-btn',
    type: 'button',
    'aria-label': 'Pusti sledeći track',
  }, '▶ NEXT TRACK');
  trackBtn.addEventListener('click', () => {
    if (!trackBtn.disabled && _onTrackClick) _onTrackClick();
  });
  wrap.appendChild(trackBtn);

  // Upgrade drawer
  wrap.appendChild(_buildDrawer());

  return wrap;
}

function _buildDrawer() {
  const drawer = _el('div', { id: 'upgrade-drawer' });

  const trigger = _el('button', {
    id: 'drawer-trigger',
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': 'drawer-content',
  }, 'UPGRADES ▲');

  trigger.addEventListener('click', () => {
    _drawerOpen = !_drawerOpen;
    trigger.setAttribute('aria-expanded', String(_drawerOpen));
    trigger.textContent = _drawerOpen ? 'UPGRADES ▼' : 'UPGRADES ▲';
    drawer.classList.toggle('drawer--open', _drawerOpen);
  });

  const content = _el('div', { id: 'drawer-content', 'aria-label': 'Dostupni upgrades' });
  content.setAttribute('role', 'region');

  drawer.appendChild(trigger);
  drawer.appendChild(content);
  return drawer;
}

// --- updateHUD ---
export function updateHUD(state) {
  if (!state) return;

  _updateTime(state.elapsed_s);
  _updateCoins(state.music_coins);
  _updateEnergy(state.crowd_energy);
  _updateZone();
  _updateTrackBtn(state);
  _updateUpgrades();
  _updateBodyZone();
}

function _updateTime(elapsed_s) {
  const el = document.getElementById('hud-time');
  if (el) el.textContent = '⏱ ' + formatElapsed(elapsed_s || 0);
}

function _updateCoins(coins) {
  const el = document.getElementById('hud-coins');
  if (!el) return;
  const formatted = _formatNumber(coins || 0);
  el.textContent = '🎵 ' + formatted + ' MC';
}

function _updateEnergy(energy) {
  const pct = Math.max(0, Math.min(100, energy || 0));
  const fill = document.getElementById('energy-fill');
  const pctEl = document.getElementById('energy-pct');

  if (fill) {
    fill.style.width = pct + '%';
    fill.setAttribute('aria-valuenow', String(Math.round(pct)));

    // Boja prema razini
    let colorClass = 'energy--high';
    if (pct < 30) colorClass = 'energy--low';
    else if (pct < 60) colorClass = 'energy--mid';

    fill.className = colorClass;
  }

  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
}

function _updateZone() {
  const nameEl = document.getElementById('zone-name');
  const multiEl = document.getElementById('zone-multi');
  const badge = document.getElementById('zone-badge');
  if (!nameEl || !multiEl) return;

  // Pokušaj dobiti zonu direktno — state.js getCurrentZone
  let zoneName = 'zagrevanje';
  try {
    // getCurrentZone nije importovan direktno da izbjegnemo cirkularnu zavisnost
    // — zona badge se ažurira vanjskim pozivom updateHUD(state) koji već ima zonu
    // Fallback: pročitaj s body klase
    const body = document.body;
    if (body.classList.contains('zona-vrhunac')) zoneName = 'vrhunac';
    else if (body.classList.contains('zona-after-hours')) zoneName = 'after_hours';
  } catch (_) {}

  const info = ZONE_LABELS[zoneName] || ZONE_LABELS.zagrevanje;
  nameEl.textContent = 'Zona: ' + info.name;
  multiEl.textContent = info.multi;

  if (badge) {
    badge.className = '';
    badge.classList.add('zone-badge--' + zoneName.replace('_', '-'));
  }
}

function _updateTrackBtn(state) {
  const btn = document.getElementById('track-btn');
  if (!btn) return;

  const canClick = state.phase === 'playing' && state.crowd_energy > 0;
  btn.disabled = !canClick;
  btn.setAttribute('aria-disabled', String(!canClick));
}

function _updateUpgrades() {
  const content = document.getElementById('drawer-content');
  if (!content) return;

  let available = [];
  try { available = getAvailableUpgrades() || []; } catch (_) { available = []; }

  content.innerHTML = '';

  if (available.length === 0) {
    const empty = _el('p', { class: 'upgrade-empty' }, 'Nema dostupnih upgradea.');
    content.appendChild(empty);
    return;
  }

  const list = _el('div', { class: 'upgrade-list' });

  available.forEach(upg => {
    let canBuy = false;
    try { canBuy = canBuyUpgrade(upg.id); } catch (_) {}

    const card = _el('div', { class: 'upgrade-card' + (canBuy ? '' : ' upgrade-card--disabled') });

    const info = _el('div', { class: 'upgrade-info' });
    info.appendChild(_el('strong', { class: 'upgrade-name' }, upg.name || upg.id));
    info.appendChild(_el('span', { class: 'upgrade-effect' }, upg.description || upg.effect || ''));
    info.appendChild(_el('span', { class: 'upgrade-price' }, _formatNumber(upg.cost || upg.price || 0) + ' MC'));

    const buyBtn = _el('button', {
      type: 'button',
      class: 'upgrade-buy-btn',
      'aria-label': 'Kupi upgrade ' + (upg.name || upg.id),
      'aria-disabled': String(!canBuy),
      'data-upgrade-id': upg.id,
    }, 'KUPI');

    if (!canBuy) buyBtn.disabled = true;

    buyBtn.addEventListener('click', () => {
      if (canBuy && _onUpgradeBuy) _onUpgradeBuy(upg.id);
    });

    card.appendChild(info);
    card.appendChild(buyBtn);
    list.appendChild(card);
  });

  content.appendChild(list);
}

function _updateBodyZone() {
  const body = document.body;
  body.classList.remove('zona-zagrevanje', 'zona-vrhunac', 'zona-after-hours');
  // Pokušaj da se postavi klasa na osnovu zone — pozivač (game.js) bi trebao
  // direktno pozvati setBodyZone(), ali kao fallback koristimo getZoneProgress
  try {
    const prog = getZoneProgress ? getZoneProgress() : null;
    if (prog && prog.zone) {
      const cls = 'zona-' + prog.zone.replace('_', '-');
      body.classList.add(cls);
    }
  } catch (_) {}
}

// Javna funkcija za direktno postavljanje zone klase (poziva je game.js)
export function setBodyZone(zoneName) {
  const body = document.body;
  body.classList.remove('zona-zagrevanje', 'zona-vrhunac', 'zona-after-hours');
  if (zoneName) {
    body.classList.add('zona-' + zoneName.replace('_', '-'));
  }

  // Ažuriraj badge odmah
  const nameEl = document.getElementById('zone-name');
  const multiEl = document.getElementById('zone-multi');
  const badge = document.getElementById('zone-badge');
  const info = ZONE_LABELS[zoneName] || ZONE_LABELS.zagrevanje;
  if (nameEl) nameEl.textContent = 'Zona: ' + info.name;
  if (multiEl) multiEl.textContent = info.multi;
  if (badge) {
    badge.className = '';
    badge.classList.add('zone-badge--' + (zoneName || 'zagrevanje').replace('_', '-'));
  }
}

// --- showScreen ---
export function showScreen(type, data) {
  hideScreen();

  const overlay = _el('div', { id: 'screen-overlay', role: 'dialog', 'aria-modal': 'true' });
  const modal = _el('div', { class: 'screen-modal' });

  if (type === 'menu') {
    modal.appendChild(_el('h1', { class: 'screen-title' }, 'DJ ZA PULTOM'));
    modal.appendChild(_el('p', { class: 'screen-sub' }, '6-satna smena. Održi publiku živom.'));
    const startBtn = _el('button', {
      type: 'button',
      class: 'screen-btn screen-btn--primary',
      id: 'start-btn',
    }, '▶ POČNI SMENU');
    startBtn.addEventListener('click', () => {
      if (data && data.onStart) data.onStart();
    });
    modal.appendChild(startBtn);
  } else if (type === 'win') {
    modal.appendChild(_el('h1', { class: 'screen-title screen-title--win' }, 'SMENA ZAVRŠENA!'));
    modal.appendChild(_el('p', { class: 'screen-sub' }, 'Publika je bila vaša cijelu noć.'));
    modal.appendChild(_buildStats(data));
    if (data && data.shareText) {
      const shareBtn = _el('button', {
        type: 'button',
        class: 'screen-btn screen-btn--share',
      }, '📤 PODIJELI REZULTAT');
      shareBtn.addEventListener('click', () => _share(data.shareText));
      modal.appendChild(shareBtn);
    }
  } else if (type === 'fail') {
    modal.appendChild(_el('h1', { class: 'screen-title screen-title--fail' }, 'SMENA JE GOTOVA.'));
    modal.appendChild(_el('p', { class: 'screen-sub' }, 'Pre vremena. Publika je napustila klub.'));
    modal.appendChild(_buildStats(data));
    if (data && data.shareText) {
      const shareBtn = _el('button', {
        type: 'button',
        class: 'screen-btn screen-btn--share',
      }, '📤 PODIJELI');
      shareBtn.addEventListener('click', () => _share(data.shareText));
      modal.appendChild(shareBtn);
    }
    if (data && data.onRetry) {
      const retryBtn = _el('button', {
        type: 'button',
        class: 'screen-btn screen-btn--primary',
      }, '↺ POKUŠAJ PONOVO');
      retryBtn.addEventListener('click', data.onRetry);
      modal.appendChild(retryBtn);
    }
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Focus trap
  requestAnimationFrame(() => {
    const first = overlay.querySelector('button');
    if (first) first.focus();
  });
}

function _buildStats(data) {
  if (!data) return _el('div');
  const stats = _el('div', { class: 'screen-stats' });
  const rows = [
    ['Vreme igre', formatElapsed(data.elapsed_s || 0)],
    ['Peak zona', (ZONE_LABELS[data.peakZone] || {}).name || '—'],
    ['Ukupno klikova', _formatNumber(data.totalClicks || 0)],
    ['Max energy', Math.round(data.maxEnergy || 0) + '%'],
  ];
  rows.forEach(([label, val]) => {
    const row = _el('div', { class: 'stat-row' });
    row.appendChild(_el('span', { class: 'stat-label' }, label));
    row.appendChild(_el('span', { class: 'stat-val' }, val));
    stats.appendChild(row);
  });
  return stats;
}

// --- hideScreen ---
export function hideScreen() {
  const existing = document.getElementById('screen-overlay');
  if (existing) existing.remove();
}

// --- Helpers ---
function _el(tag, attrs = {}, text = null) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (text !== null) el.textContent = text;
  return el;
}

function _formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(Math.floor(n));
}

function _share(text) {
  if (navigator.share) {
    navigator.share({ text }).catch(() => _copyFallback(text));
  } else {
    _copyFallback(text);
  }
}

function _copyFallback(text) {
  navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {});
}
