// main.js — entry point, game loop, tick logika
import {
  GAME_DURATION_S,
  PASSIVE_COINS_PER_S,
  CLICK_ENERGY,
  CLICK_COINS,
} from './config.js';
import {
  getState,
  setState,
  saveState,
  loadState,
  getPassiveRetention,
  getZoneDrain,
} from './state.js';
import { setupInput }              from './input.js';
import { render }                  from './render.js';
import { updateUI, showEndScreen } from './ui.js';
import { initAudio, stopAudio }    from './audio.js';
import { buyUpgrade }              from './systems/upgrades.js';
import { checkZoneTransition }     from './systems/zones.js';

// ---------------------------------------------------------------------------
// Loop state
// ---------------------------------------------------------------------------

let _animFrameId = null;
let _lastTs      = null;   // DOMHighResTimeStamp prethodnog frejma
let _tickAccum   = 0;      // akumulirani ms do sljedećeg tika

const TICK_INTERVAL_MS = 1000; // tik jednom u sekundi
const DELTA_CAP_MS     = 100;  // cap delta — zaštita od tab-switch freeze

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Inicijalizuje igru: učitava state, podešava input, ažurira UI.
 * Poziva se iz index.html <script type="module">.
 */
export function init() {
  loadState();
  updateUI(getState());
  setupInput(_onTrackClick, _onUpgradeBuy);

  // Ako je reload desio tokom aktivne igre — nastavi odmah
  if (getState().phase === 'playing') {
    _startLoop();
  }
}

/**
 * Pokreće igru iz menu faze.
 * Poziva se iz UI dugmeta "Počni".
 */
export function startGame() {
  setState({ phase: 'playing' });
  saveState();
  initAudio();
  _startLoop();
}

/**
 * Zaustavlja rAF loop i resetuje akumulatore.
 */
export function stopLoop() {
  if (_animFrameId !== null) {
    cancelAnimationFrame(_animFrameId);
    _animFrameId = null;
  }
  _lastTs    = null;
  _tickAccum = 0;
}

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

function _startLoop() {
  stopLoop(); // sprečava dupli loop
  _animFrameId = requestAnimationFrame(_gameLoop);
}

/**
 * requestAnimationFrame callback.
 * @param {DOMHighResTimeStamp} ts
 */
function _gameLoop(ts) {
  const state = getState();

  // Izlaz ako igra nije aktivna
  if (state.phase !== 'playing') {
    _animFrameId = null;
    return;
  }

  // Delta time
  if (_lastTs === null) {
    _lastTs = ts;
  }
  let delta_ms = ts - _lastTs;
  _lastTs = ts;

  // Cap — ne preskači više od 100ms odjednom
  if (delta_ms > DELTA_CAP_MS) {
    delta_ms = DELTA_CAP_MS;
  }

  _tickAccum += delta_ms;

  // Jedan tick po sekundi (može biti više u jednom frejmu ako je bio lag)
  while (_tickAccum >= TICK_INTERVAL_MS) {
    _tickAccum -= TICK_INTERVAL_MS;
    _tick(TICK_INTERVAL_MS / 1000);
  }

  // Render svaki frejm — smooth vizualizacija
  render(getState());

  _animFrameId = requestAnimationFrame(_gameLoop);
}

// ---------------------------------------------------------------------------
// Tick — izvršava se 1x/s
// ---------------------------------------------------------------------------

/**
 * Jedna sekunda igre: napreduje elapsed, dodaje coins, mijenja energiju,
 * provjerava win/fail, sprema state i osvježava UI.
 * @param {number} dt — delta u sekundama (tipično 1.0)
 */
function _tick(dt) {
  const s = getState();

  // 1. Napredi elapsed
  const new_elapsed = s.elapsed_s + dt;

  // 2. Pasivni Music Coins
  const new_coins = s.music_coins + PASSIVE_COINS_PER_S * dt;

  // 3. Net promjena energije: retencija - drain
  const retention  = getPassiveRetention();
  const drain      = getZoneDrain();
  const net_delta  = (retention - drain) * dt;
  let   new_energy = s.crowd_energy + net_delta;

  // 4. Clamp na [0, 100]
  new_energy = Math.min(Math.max(new_energy, 0.0), 100.0);

  // 5. FAIL: energija pala na 0
  const isFail = new_energy <= 0.0;

  // 6. WIN: prošlo 6 sati uz energy > 0
  const isWin = !isFail && new_elapsed >= GAME_DURATION_S;

  // 7. Primijeni state
  setState({
    elapsed_s:    isWin ? GAME_DURATION_S : new_elapsed,
    music_coins:  new_coins,
    crowd_energy: isFail ? 0.0 : new_energy,
  });

  // 8. Zone tranzicija provjera
  checkZoneTransition(s.elapsed_s, new_elapsed);

  // 9. Kraj igre
  if (isFail || isWin) {
    _endGame(isWin ? 'win' : 'fail');
    return;
  }

  // 10. Periodični save + UI refresh
  saveState();
  updateUI(getState());
}

// ---------------------------------------------------------------------------
// End game
// ---------------------------------------------------------------------------

function _endGame(outcome) {
  setState({ phase: outcome });
  saveState();
  stopLoop();
  stopAudio();
  showEndScreen(outcome, getState());
}

// ---------------------------------------------------------------------------
// Input callbacks
// ---------------------------------------------------------------------------

/**
 * Callback za "Next Track" klik iz input.js.
 */
function _onTrackClick() {
  const s = getState();
  if (s.phase !== 'playing') return;

  const new_energy = Math.min(s.crowd_energy + CLICK_ENERGY, 100.0);
  const new_coins  = s.music_coins + CLICK_COINS;

  setState({ crowd_energy: new_energy, music_coins: new_coins });
  updateUI(getState());
}

/**
 * Callback za kupovinu upgrada iz input.js.
 * @param {string} upgradeId
 */
function _onUpgradeBuy(upgradeId) {
  const success = buyUpgrade(upgradeId);
  if (success) {
    updateUI(getState());
  }
}
