/**
 * @file ui.js
 * Fermenter — Varenički Bunt
 * DOM manipulacija: HUD, upgrade panel, prestiže dugme, mutation modal, win screen.
 */

import { CONFIG } from './config.js';

// ── Interni state ────────────────────────────────────────────────────────────

/** Timestamp startа igre za tajmer na win screen-u */
let _gameStartTime = 0;

/** Referenca na prestiže dugme (kreira se dinamički) */
let _prestigeBtn = null;

// ── Init ─────────────────────────────────────────────────────────────────────

/**
 * Gradi punu DOM strukturu igre i inicijalizuje UI.
 * Poziva se jednom na startu.
 * @param {GameState} state
 */
export function initUI(state) {
  _gameStartTime = state.gameStartTime;

  // Sakrij generički menu overlay iz template-a
  const menuEl = document.getElementById('menu');
  if (menuEl) menuEl.classList.add('hidden');

  // Postavi HUD strukturu
  const hud = document.getElementById('hud');
  if (hud) {
    hud.innerHTML = `
      <div class="hud-stat" id="hud-sj">
        <span class="hud-label">SJ</span>
        <span class="hud-value" id="sj-display">0</span>
      </div>
      <div class="hud-stat" id="hud-fjs">
        <span class="hud-label">FJ/s</span>
        <span class="hud-value" id="fjs-display">0.20</span>
      </div>
      <div class="hud-stat" id="hud-pressure-label">
        <span class="hud-label">Pritisak</span>
        <span class="hud-value" id="pressure-display">0.0%</span>
      </div>
      <div class="hud-stat hud-prestige">
        <span class="hud-label">Prestiž</span>
        <span class="hud-value" id="prestige-display">0 / ${CONFIG.MAX_PRESTIGES}</span>
      </div>
    `;
    hud.style.pointerEvents = 'none';
  }

  // Kreiraj game-container ispod canvas-a
  const root = document.getElementById('game-root');
  if (!root) return;

  // Ukloni stari game-container ako postoji
  let existing = document.getElementById('game-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'game-container';
  container.innerHTML = `
    <div id="barrel-area">
      <div id="barrel" role="button" tabindex="0" aria-label="Klikni da fermentišeš">
        <div id="barrel-foam"></div>
        <div id="barrel-label">🍺</div>
        <div id="barrel-inner"></div>
      </div>
    </div>
    <div id="pressure-container">
      <div id="pressure-bar-wrap">
        <div id="pressure-bar"></div>
        <span id="pressure-fill-label">0%</span>
      </div>
    </div>
    <div id="mutation-badges-area"></div>
    <div id="upgrade-panel">
      <h3 class="panel-title">UPGREJDI</h3>
      <div id="upgrade-list"></div>
    </div>
  `;

  // Ubaci iza canvas-a ali ispred HUD-a
  const canvas = document.getElementById('game-canvas');
  if (canvas && canvas.nextSibling) {
    root.insertBefore(container, canvas.nextSibling);
  } else {
    root.appendChild(container);
  }
}

// ── HUD Update ───────────────────────────────────────────────────────────────

/**
 * Ažurira sve HUD elemente iz trenutnog state-a.
 * Poziva se svakih 100ms iz main loop-a.
 * @param {GameState} state
 */
export function updateHUD(state) {
  // SJ display
  const sjEl = document.getElementById('sj-display');
  if (sjEl) sjEl.textContent = formatNumber(state.sj) + ' SJ';

  // FJ/s display
  const fjsEl = document.getElementById('fjs-display');
  if (fjsEl) fjsEl.textContent = formatNumber(state.fermentRate, 2) + ' FJ/s';

  // Pressure tekst u HUD-u
  const pressureEl = document.getElementById('pressure-display');
  if (pressureEl) pressureEl.textContent = state.pressure.toFixed(1) + '%';

  // Prestiže brojač
  const prestigeEl = document.getElementById('prestige-display');
  if (prestigeEl) prestigeEl.textContent = state.prestigeCount + ' / ' + CONFIG.MAX_PRESTIGES;

  // Pressure bar širina
  const bar = document.getElementById('pressure-bar');
  if (bar) {
    const pct = Math.min(100, state.pressure);
    bar.style.width = pct + '%';

    if (pct >= CONFIG.PRESSURE_PULSE_THRESHOLD) {
      bar.classList.add('pulsing');
    } else {
      bar.classList.remove('pulsing');
    }
  }

  // Fill label
  const fillLabel = document.getElementById('pressure-fill-label');
  if (fillLabel) fillLabel.textContent = Math.floor(state.pressure) + '%';

  // Barrel degradacija
  const barrelEl = document.getElementById('barrel');
  if (barrelEl) {
    if (state.isDegraded) {
      barrelEl.classList.add('degraded');
    } else {
      barrelEl.classList.remove('degraded');
    }
  }

  // Mutation badges
  _updateMutationBadges(state);
}

// ── Upgrade Panel ─────────────────────────────────────────────────────────────

/**
 * Renderuje upgrade panel (innerHTML replace svaki put).
 * @param {GameState} state
 * @param {function(string): void} onBuy
 */
export function renderUpgradePanel(state, onBuy) {
  const list = document.getElementById('upgrade-list');
  if (!list) return;

  const hasMutationM6 = state.activeMutations && state.activeMutations.includes('M6');
  const autoFermentIds = new Set(['auto_ferment_1', 'auto_ferment_2']);

  list.innerHTML = CONFIG.UPGRADES.map(upg => {
    const level = state.upgrades[upg.id] || 0;
    const isMax = level >= upg.maxLevel;

    // Računaj cenu sledećeg nivoa
    let cost = Math.ceil(upg.baseCost * Math.pow(upg.growthFactor, level));

    // M6 discount na auto-ferment upgrades
    if (hasMutationM6 && autoFermentIds.has(upg.id)) {
      cost = Math.ceil(cost * 0.70);
    }

    const canAfford = !isMax && state.sj >= cost;
    const btnClass = isMax ? 'upgrade-btn maxed' : canAfford ? 'upgrade-btn' : 'upgrade-btn disabled';
    const btnText = isMax ? 'MAX' : `${formatNumber(cost)} SJ`;

    return `
      <div class="upgrade-item${isMax ? ' upgrade-maxed' : ''}">
        <div class="upgrade-info">
          <div class="upgrade-name">${upg.name}</div>
          <div class="upgrade-desc">${upg.description}${hasMutationM6 && autoFermentIds.has(upg.id) ? ' <span class="m6-tag">-30%</span>' : ''}</div>
        </div>
        <div class="upgrade-right">
          <div class="upgrade-level">${level}<span class="upgrade-max">/${upg.maxLevel}</span></div>
          <button
            class="${btnClass}"
            data-id="${upg.id}"
            ${isMax || !canAfford ? 'disabled' : ''}
            aria-label="${upg.name} — ${btnText}"
          >${btnText}</button>
        </div>
      </div>
    `;
  }).join('');

  // Dodaj event listenere na dugmad
  list.querySelectorAll('.upgrade-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (id) onBuy(id);
    });
  });
}

// ── Prestiže Button ───────────────────────────────────────────────────────────

/**
 * Prikazuje prestiže dugme sa slide-in animacijom.
 * @param {function(): void} onClick
 */
export function showPrestigeButton(onClick) {
  if (_prestigeBtn) return; // Već postoji

  const btn = document.createElement('button');
  btn.id = 'prestige-btn';
  btn.textContent = 'MUTACIJA →';
  btn.setAttribute('aria-label', 'Aktiviraj prestiž i izaberi mutaciju');

  btn.addEventListener('click', onClick);

  const root = document.getElementById('game-root');
  if (root) root.appendChild(btn);

  _prestigeBtn = btn;
}

/**
 * Uklanja prestiže dugme iz DOM-a.
 */
export function hidePrestigeButton() {
  if (_prestigeBtn) {
    _prestigeBtn.remove();
    _prestigeBtn = null;
  }
}

// ── Mutation Modal ────────────────────────────────────────────────────────────

/**
 * Prikazuje full-screen modal za izbor mutacije.
 * @param {Array<{id: string, name: string, badge: string, description: string}>} options
 * @param {function(string): void} onSelect
 */
export function showMutationModal(options, onSelect) {
  // Ukloni stari modal ako postoji
  const old = document.getElementById('mutation-modal');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'mutation-modal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Izaberi mutaciju kvasca');

  overlay.innerHTML = `
    <div class="modal-inner">
      <h2 class="modal-title">MUTACIJA KVASCA</h2>
      <p class="modal-subtitle">Izaberi trajnu evoluciju za ovaj soj</p>
      <div class="mutation-cards">
        ${options.map(opt => `
          <div class="mutation-card">
            <div class="mutation-badge-large" aria-hidden="true">${opt.badge}</div>
            <div class="mutation-card-name">${opt.name}</div>
            <div class="mutation-card-desc">${opt.description}</div>
            <button class="mutation-select-btn" data-id="${opt.id}">
              IZABERI
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Event listeneri na dugmad
  overlay.querySelectorAll('.mutation-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      overlay.remove();
      if (id) onSelect(id);
    });
  });

  document.body.appendChild(overlay);
}

// ── Win Screen ────────────────────────────────────────────────────────────────

/**
 * Prikazuje win screen overlay.
 * @param {GameState} state
 */
export function showWinScreen(state) {
  const old = document.getElementById('win-screen');
  if (old) old.remove();

  const elapsed = Math.floor((Date.now() - _gameStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');

  // Pronađi mutacije iz CONFIG za prikaz
  const mutationList = (state.activeMutations || []).map(id => {
    const m = CONFIG.MUTATIONS.find(m => m.id === id);
    return m ? `<span class="win-badge">${m.badge}</span> ${m.name}` : id;
  });

  const overlay = document.createElement('div');
  overlay.id = 'win-screen';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="win-inner">
      <div class="win-title">SAVRŠENI KVASAC</div>
      <div class="win-subtitle">Varenički bunt je uspeo!</div>
      <div class="win-stats">
        <div class="win-stat-row">
          <span class="win-stat-label">Vreme</span>
          <span class="win-stat-value">${minutes}:${seconds}</span>
        </div>
        <div class="win-stat-row">
          <span class="win-stat-label">Prestiži</span>
          <span class="win-stat-value">${state.prestigeCount} / ${CONFIG.MAX_PRESTIGES}</span>
        </div>
      </div>
      ${mutationList.length > 0 ? `
        <div class="win-mutations">
          <div class="win-mut-label">Aktivne mutacije:</div>
          ${mutationList.map(m => `<div class="win-mut-item">${m}</div>`).join('')}
        </div>
      ` : ''}
      <div class="win-buttons">
        <button id="win-new-game" class="win-btn win-btn-primary">NOVA PARTIJA</button>
        <button id="win-stay" class="win-btn win-btn-secondary">OSTAVI</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('win-new-game').addEventListener('click', () => {
    localStorage.removeItem(CONFIG.SAVE_KEY);
    window.location.reload();
  });

  document.getElementById('win-stay').addEventListener('click', () => {
    overlay.remove();
  });
}

// ── Interni helpers ───────────────────────────────────────────────────────────

/**
 * Ažurira mutation badges u corner-u ekrana.
 * @param {GameState} state
 */
function _updateMutationBadges(state) {
  const area = document.getElementById('mutation-badges-area');
  if (!area) return;

  const active = state.activeMutations || [];
  if (active.length === 0) {
    area.innerHTML = '';
    return;
  }

  area.innerHTML = active.map(id => {
    const m = CONFIG.MUTATIONS.find(m => m.id === id);
    if (!m) return '';
    return `<span class="mutation-badge" title="${m.name}: ${m.description}">${m.badge}</span>`;
  }).join('');
}

/**
 * Formatuje broj za HUD prikaz.
 * @param {number} n
 * @param {number} [decimals=0]
 * @returns {string}
 */
function formatNumber(n, decimals = 0) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return decimals > 0 ? n.toFixed(decimals) : Math.floor(n).toString();
}
