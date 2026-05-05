/**
 * ui.js — DOM overlay UI za Bespuće
 * HUD: score, kristali, multiplier prikazani u render.js (Canvas).
 * Ekrani: MENU, DEAD, CHECKPOINT_SELECT, META_UPGRADE kao DOM overlayevi.
 * Eksportuje: initUI, updateUI
 */
import { CONFIG } from './config.js';

// ─── Power-up nazivi ─────────────────────────────────────────────────────────

const POWERUP_NAMES = {
  SHIELD:       '🛡 Štit',
  SLOW_TIME:    '⏱ Slow-mo',
  SCORE_2X:     '×2 Score',
  MAGNET_TEMP:  '🧲 Magnet',
  WIDE_SHIP:    '◈ Uski hitbox',
  SPEED_BURST:  '⚡ Turbo',
  GHOST_PASS:   '👻 Faza',
  CRYSTAL_RAIN: '💎 Kiša kristala',
};

// ─── Upgrade definicije ──────────────────────────────────────────────────────

const UPGRADE_DEFS = [
  {
    id:    'speed',
    label: 'Brzina',
    desc:  '+12% scroll/lvl',
    maxLevel: 3,
  },
  {
    id:    'shield',
    label: 'Štit',
    desc:  '+1 auto-štit/run',
    maxLevel: 2,
  },
  {
    id:    'magnet',
    label: 'Magnet',
    desc:  '+80px attract/lvl',
    maxLevel: 3,
  },
];

// ─── Interni callbacks ref ───────────────────────────────────────────────────

let _callbacks = {};

// ─── Helper: show/hide element ───────────────────────────────────────────────

function show(id, visible) {
  const el = document.getElementById(id);
  if (el) el.style.display = visible ? '' : 'none';
}

// ─── Kreiranje DOM strukture ─────────────────────────────────────────────────

/**
 * Generiši HTML za upgrade row.
 * @param {object} def
 * @param {object} meta
 */
function buildUpgradeRow(def, meta) {
  const level   = meta.upgrades[def.id] || 0;
  const costs   = CONFIG.UPGRADE_COSTS[def.id];
  const isMax   = level >= def.maxLevel;
  const cost    = isMax ? null : costs[level];
  const canAfford = !isMax && cost !== null && meta.totalCrystals >= cost;

  // Dots — puni kružići za kupljene nivoe
  let dotsHTML = '<span class="upgrade-dots">';
  for (let i = 0; i < def.maxLevel; i++) {
    dotsHTML += `<span${i < level ? ' class="filled"' : ''}></span>`;
  }
  dotsHTML += '</span>';

  const actionHTML = isMax
    ? `<span class="upgrade-maxed">MAX ✓</span>`
    : `<span class="upgrade-cost">💎${cost}</span>
       <button class="btn-buy" id="btn-buy-${def.id}" ${canAfford ? '' : 'disabled'}>Kupi</button>`;

  return `
    <div class="upgrade-row" id="upg-${def.id}">
      <span class="upgrade-name" title="${def.desc}">${def.label}</span>
      ${dotsHTML}
      ${actionHTML}
    </div>
  `;
}

/**
 * Kreira sve DOM ekrane i ubacuje ih u #ui-root.
 * Poziva se jednom pri startu. main.js prosledi state, callbacks opcionalno.
 * @param {object} state
 * @param {object} [callbacks]  - { onPowerupSelect, onStartGame, onOpenUpgrades, onMetaBack }
 */
export function initUI(state, callbacks = {}) {
  _callbacks = callbacks;

  const root = document.getElementById('ui-root');
  if (!root) return;

  // ── MENU ──────────────────────────────────────────────────────────────────
  const menuDiv = document.createElement('div');
  menuDiv.id = 'ui-menu';
  menuDiv.innerHTML = `
    <h1>BESPUĆE</h1>
    <p class="tagline">Pilotiraj kroz ruševine. Svakim runkom dalje.</p>
    <p id="menu-best-score">Best: 0</p>
    <div class="btn-row">
      <button id="btn-start">KRENI [SPACE]</button>
      <button id="btn-upgrades">NADOGRADNJE 🔧</button>
    </div>
  `;

  // ── DEAD ──────────────────────────────────────────────────────────────────
  const deadDiv = document.createElement('div');
  deadDiv.id    = 'ui-dead';
  deadDiv.style.display = 'none';
  deadDiv.innerHTML = `
    <h2>KRAJ</h2>
    <p id="dead-score">Score: 0</p>
    <p id="dead-crystals">+0 kristala</p>
    <p id="dead-new-record" style="display:none">NOVI REKORD! ★</p>
    <p class="dead-hint">nastavljam za trenutak…</p>
  `;

  // ── META_UPGRADE ──────────────────────────────────────────────────────────
  const metaDiv = document.createElement('div');
  metaDiv.id    = 'ui-meta';
  metaDiv.style.display = 'none';
  metaDiv.innerHTML = `
    <h2>NADOGRADNJE</h2>
    <p id="meta-crystals">Kristali: 0</p>
    <div id="upgrade-list"></div>
    <div class="meta-footer">
      <button id="btn-meta-back">NASTAVI →</button>
    </div>
  `;

  // ── CHECKPOINT_SELECT ─────────────────────────────────────────────────────
  const cpDiv = document.createElement('div');
  cpDiv.id    = 'ui-checkpoint';
  cpDiv.style.display = 'none';
  cpDiv.innerHTML = `
    <h3>CHECKPOINT</h3>
    <p id="checkpoint-timer">3</p>
    <div id="powerup-choices">
      <button class="powerup-btn" id="btn-powerup-0">?</button>
      <button class="powerup-btn" id="btn-powerup-1">?</button>
    </div>
  `;

  root.appendChild(menuDiv);
  root.appendChild(deadDiv);
  root.appendChild(metaDiv);
  root.appendChild(cpDiv);

  // ── Event listeners ───────────────────────────────────────────────────────

  document.getElementById('btn-start').addEventListener('click', () => {
    if (_callbacks.onStartGame) {
      _callbacks.onStartGame();
    } else {
      // Fire a synthetic Space keydown so main.js input handler picks it up
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
    }
  });

  document.getElementById('btn-upgrades').addEventListener('click', () => {
    if (_callbacks.onOpenUpgrades) {
      _callbacks.onOpenUpgrades();
    } else {
      state.screen = 'META_UPGRADE';
    }
  });

  document.getElementById('btn-meta-back').addEventListener('click', () => {
    if (_callbacks.onMetaBack) {
      _callbacks.onMetaBack();
    } else {
      state.screen = 'MENU';
    }
  });

  document.getElementById('btn-powerup-0').addEventListener('click', () => {
    _onPowerupClick(0, state);
  });

  document.getElementById('btn-powerup-1').addEventListener('click', () => {
    _onPowerupClick(1, state);
  });
}

// ─── Interni powerup handler ─────────────────────────────────────────────────

function _onPowerupClick(index, state) {
  const choices = state.run.checkpointChoices;
  if (!choices || !choices[index]) return;
  const id = choices[index];
  if (_callbacks.onPowerupSelect) {
    _callbacks.onPowerupSelect(id);
  }
}

// ─── Update upgrade rows ─────────────────────────────────────────────────────

/**
 * Precrta listu upgrade redova (poziva se kad je META_UPGRADE aktivan).
 * @param {object} state
 */
function updateUpgradeRows(state) {
  const list = document.getElementById('upgrade-list');
  if (!list) return;

  list.innerHTML = UPGRADE_DEFS.map(def => buildUpgradeRow(def, state.meta)).join('');

  // Poveži kupovinu
  for (const def of UPGRADE_DEFS) {
    const btn = document.getElementById(`btn-buy-${def.id}`);
    if (!btn) continue;

    btn.addEventListener('click', () => {
      const level  = state.meta.upgrades[def.id] || 0;
      const costs  = CONFIG.UPGRADE_COSTS[def.id];
      const isMax  = level >= def.maxLevel;
      if (isMax) return;

      const cost = costs[level];
      if (state.meta.totalCrystals < cost) return;

      state.meta.totalCrystals -= cost;
      state.meta.upgrades[def.id] = level + 1;

      // Odmah precrta
      updateUpgradeRows(state);
    });
  }
}

// ─── Glavni update poziv ─────────────────────────────────────────────────────

/**
 * Ažuriraj UI na osnovu state.screen — prikaži/sakrij overlayeve, osveži vrijednosti.
 * Poziva se svaki frame iz main.js.
 * @param {object} state
 */
export function updateUI(state) {
  const s = state.screen;

  show('ui-menu',       s === 'MENU');
  show('ui-dead',       s === 'DEAD');
  show('ui-meta',       s === 'META_UPGRADE');
  show('ui-checkpoint', s === 'CHECKPOINT_SELECT');

  // ── MENU ────────────────────────────────────────────────────────────────────
  if (s === 'MENU') {
    const el = document.getElementById('menu-best-score');
    if (el) el.textContent = `Best: ${state.meta.bestScore}`;
  }

  // ── DEAD ─────────────────────────────────────────────────────────────────────
  if (s === 'DEAD') {
    const scoreEl = document.getElementById('dead-score');
    if (scoreEl) scoreEl.textContent = `Score: ${state.run.score}`;

    const crystalEl = document.getElementById('dead-crystals');
    if (crystalEl) crystalEl.textContent = `+${state.run.crystals} kristala`;

    const recordEl = document.getElementById('dead-new-record');
    if (recordEl) {
      const isRecord = state.run.score > 0 && state.run.score >= state.meta.bestScore;
      recordEl.style.display = isRecord ? '' : 'none';
    }
  }

  // ── META_UPGRADE ─────────────────────────────────────────────────────────────
  if (s === 'META_UPGRADE') {
    const crystalEl = document.getElementById('meta-crystals');
    if (crystalEl) crystalEl.textContent = `Kristali: ${state.meta.totalCrystals}`;
    updateUpgradeRows(state);
  }

  // ── CHECKPOINT_SELECT ─────────────────────────────────────────────────────────
  if (s === 'CHECKPOINT_SELECT') {
    // Countdown timer
    if (state.run.checkpointTimer !== undefined) {
      const timerEl = document.getElementById('checkpoint-timer');
      if (timerEl) {
        const secs = Math.ceil(state.run.checkpointTimer);
        timerEl.textContent = secs > 0 ? secs : '…';
      }
    }

    // Power-up dugmad
    const choices = state.run.checkpointChoices || [];
    for (let i = 0; i < 2; i++) {
      const btn = document.getElementById(`btn-powerup-${i}`);
      if (!btn) continue;
      const id = choices[i];
      btn.textContent = id ? (POWERUP_NAMES[id] || id) : '?';
      btn.disabled = !id;
    }
  }
}
