import { CONFIG } from './config.js';

/**
 * @typedef {import('./state.js').GameState} GameState
 */

const hud  = document.getElementById('hud');
const menu = document.getElementById('menu');

// Callbacks wired by initUI so UI can drive state changes without circular deps
let _onStart         = () => {};
let _onRestart       = () => {};
let _onCheckpointUse = () => {};
let _onPowerupPick   = (_id) => {};

/**
 * Initialise UI — build HUD skeleton and attach menu-level event delegation.
 * Call once at startup before the first frame.
 * @param {GameState} state
 * @param {{
 *   onStart: Function,
 *   onRestart: Function,
 *   onCheckpointUse: Function,
 *   onPowerupPick: (id: string) => void
 * }} callbacks
 */
export function initUI(state, callbacks = {}) {
  _onStart         = callbacks.onStart         ?? _onStart;
  _onRestart       = callbacks.onRestart       ?? _onRestart;
  _onCheckpointUse = callbacks.onCheckpointUse ?? _onCheckpointUse;
  _onPowerupPick   = callbacks.onPowerupPick   ?? _onPowerupPick;

  hud.innerHTML = `
    <div class="stat" id="stat-level">LVL 1</div>
    <div class="stat" id="stat-score">0</div>
    <div id="stat-powerups" class="powerup-slots"></div>
  `;

  menu.classList.add('hidden');

  // Delegate click events on menu so we don't re-bind on every showScreen call
  menu.addEventListener('click', _handleMenuClick);
}

/**
 * Update HUD elements to reflect latest state.
 * Called every frame; must be cheap (only update changed values).
 * @param {GameState} state
 */
export function updateHUD(state) {
  const lvlEl   = document.getElementById('stat-level');
  const scoreEl = document.getElementById('stat-score');
  if (lvlEl)   lvlEl.textContent   = `LVL ${state.level}`;
  if (scoreEl) scoreEl.textContent = state.score;
  _renderPowerupSlots(state);
}

/**
 * Switch the visible menu overlay to the named screen.
 * Hides menu for 'game'; shows appropriate HTML for all others.
 * @param {'start'|'game'|'powerup'|'checkpoint'|'death'|'win'} screen
 * @param {GameState} [state] - needed for powerup/death/win screens
 */
export function showScreen(screen, state = null) {
  if (screen === 'game') {
    menu.classList.add('hidden');
    menu.innerHTML = '';
    return;
  }

  menu.classList.remove('hidden');

  switch (screen) {
    case 'start':
      menu.innerHTML = _tmplStart();
      break;
    case 'powerup':
      menu.innerHTML = _tmplPowerupChoice(state);
      break;
    case 'checkpoint':
      menu.innerHTML = _tmplCheckpoint(state);
      break;
    case 'death':
      menu.innerHTML = _tmplDeath(state);
      break;
    case 'win':
      menu.innerHTML = _tmplWin(state);
      break;
    default:
      menu.innerHTML = '';
  }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Handle delegated click events on the #menu overlay.
 * Reads data-action and data-powerup attributes from clicked element.
 * @param {MouseEvent} e
 */
function _handleMenuClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const powerupId = btn.dataset.powerup;

  switch (action) {
    case 'start':          _onStart();              break;
    case 'restart':        _onRestart();            break;
    case 'use-checkpoint': _onCheckpointUse();      break;
    case 'pick-powerup':   _onPowerupPick(powerupId); break;
  }
}

/**
 * Re-render the held power-up slots in the HUD.
 * @param {GameState} state
 */
function _renderPowerupSlots(state) {
  const el = document.getElementById('stat-powerups');
  if (!el) return;
  const held = state.heldPowerups ?? [];
  el.innerHTML = held.map(id => {
    const p = CONFIG.POWERUPS[id];
    return `<span class="powerup-slot filled" title="${p?.desc ?? id}">${p?.label?.[0] ?? '?'}</span>`;
  }).join('');
}

// ---------------------------------------------------------------------------
// Menu templates
// ---------------------------------------------------------------------------

/** @returns {string} */
function _tmplStart() {
  return `
    <div class="menu-card">
      <div class="signal-icon">◈</div>
      <h1 class="menu-title">SIGNAL LOST</h1>
      <p class="menu-sub">Usmeri signal kroz oštećenu mrežu čvorova</p>
      <p class="menu-sub dim">15 nivoa · Checkpoint sistem · Proceduralna generacija</p>
      <button class="btn btn-primary" data-action="start">POKRENI SIGNAL</button>
    </div>
  `;
}

/**
 * @param {GameState} state
 * @returns {string}
 */
function _tmplPowerupChoice(state) {
  const offer = state?.powerupOffer ?? [];
  const cards = offer.map(id => {
    const p = CONFIG.POWERUPS[id];
    if (!p) return '';
    return `
      <button class="powerup-card" data-action="pick-powerup" data-powerup="${p.id}">
        <strong>${p.label}</strong>
        <span>${p.desc}</span>
      </button>
    `;
  }).join('');

  return `
    <div class="menu-card">
      <h2 class="menu-title" style="font-size:clamp(22px,4vw,36px);letter-spacing:4px;">POWER-UP</h2>
      <p class="menu-sub">Izaberi jedan power-up za nastavak</p>
      <div class="powerup-options">${cards}</div>
    </div>
  `;
}

/**
 * @param {GameState} state
 * @returns {string}
 */
function _tmplCheckpoint(state) {
  return `
    <div class="menu-card">
      <div class="signal-icon checkpoint">◉</div>
      <h2 class="menu-title" style="color:#00e5ff;font-size:clamp(22px,4vw,38px);">CHECKPOINT</h2>
      <p class="menu-sub">Nivo ${state?.level ?? '?'} — progres automatski sačuvan</p>
      <p class="menu-sub dim">Nastavljaš odavde čak i ako sigal bude izgubljen</p>
      <button class="btn btn-primary" data-action="start">NASTAVI</button>
    </div>
  `;
}

/**
 * @param {GameState} state
 * @returns {string}
 */
function _tmplDeath(state) {
  const hasCkpt = !!(state?.checkpointLevel);
  return `
    <div class="menu-card">
      <div class="signal-icon fail">✕</div>
      <h2 class="menu-title" style="color:#ef4444;font-size:clamp(22px,4vw,44px);">SIGNAL LOST</h2>
      <p class="menu-sub">Nivo ${state?.level ?? 1} od ${CONFIG.MAX_LEVELS}</p>
      <p class="stat-display">SKOR: ${state?.score ?? 0}</p>
      <div class="btn-group">
        <button class="btn btn-primary" data-action="restart">NOVI RUN</button>
        ${hasCkpt ? `<button class="btn btn-secondary" data-action="use-checkpoint">NASTAVI OD NIVOA ${state.checkpointLevel}</button>` : ''}
      </div>
    </div>
  `;
}

/**
 * @param {GameState} state
 * @returns {string}
 */
function _tmplWin(state) {
  return `
    <div class="menu-card">
      <div class="signal-icon win">◈</div>
      <h1 class="menu-title">SIGNAL RESTORED</h1>
      <p class="menu-sub">Mreža je ponovo online</p>
      <p class="stat-display">KONAČNI SKOR: ${state?.score ?? 0}</p>
      <p class="menu-sub dim">15 od 15 nivoa završeno</p>
      <button class="btn btn-primary" data-action="restart">IGRAJ PONOVO</button>
    </div>
  `;
}
