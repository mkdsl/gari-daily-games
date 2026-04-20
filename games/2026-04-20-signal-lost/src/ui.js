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

  // TODO: build HUD HTML — level indicator, score, held power-up slots
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
  // TODO: update level, score, power-up slot indicators
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
  // TODO: render up to 3 power-up slot indicators (held power-ups)
  const el = document.getElementById('stat-powerups');
  if (!el) return;
  // placeholder — no rendering until implementation
}

// ---------------------------------------------------------------------------
// Menu templates
// ---------------------------------------------------------------------------

/** @returns {string} */
function _tmplStart() {
  // TODO: title screen with game name, tagline, and Start button
  return `
    <h1 class="menu-title">SIGNAL LOST</h1>
    <p class="menu-sub">Usmeri signal kroz oštećenu mrežu</p>
    <button data-action="start">START</button>
  `;
}

/**
 * @param {GameState} state
 * @returns {string}
 */
function _tmplPowerupChoice(state) {
  // TODO: display 3 random power-up choices from state.powerupOffer
  // state.powerupOffer = ['SLOW_SIGNAL', 'FREEZE', 'ECHO'] (set by powerups.js)
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
    <h2>POWER-UP</h2>
    <p class="menu-sub">Izaberi jedan</p>
    <div class="powerup-options">${cards}</div>
  `;
}

/**
 * @param {GameState} state
 * @returns {string}
 */
function _tmplCheckpoint(state) {
  // TODO: checkpoint reached screen with "Continue" and optional "Save & Quit"
  return `
    <h2>CHECKPOINT</h2>
    <p class="menu-sub">Nivo ${state?.level ?? '?'} — progres sačuvan</p>
    <button data-action="start">NASTAVI</button>
  `;
}

/**
 * @param {GameState} state
 * @returns {string}
 */
function _tmplDeath(state) {
  // TODO: show final score, offer restart from checkpoint if one exists
  const hasCkpt = !!(state?.checkpointLevel);
  return `
    <h2>SIGNAL LOST</h2>
    <p class="menu-sub">Nivo: ${state?.level ?? 1} | Skor: ${state?.score ?? 0}</p>
    <button data-action="restart">PONOVO</button>
    ${hasCkpt ? `<button data-action="use-checkpoint">NASTAVI OD NIVOA ${state.checkpointLevel}</button>` : ''}
  `;
}

/**
 * @param {GameState} state
 * @returns {string}
 */
function _tmplWin(state) {
  // TODO: victory screen with final score breakdown
  return `
    <h2>SIGNAL RESTORED</h2>
    <p class="menu-sub">Skor: ${state?.score ?? 0}</p>
    <button data-action="restart">IGRAJ PONOVO</button>
  `;
}
