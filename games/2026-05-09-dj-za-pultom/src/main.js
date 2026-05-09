// main.js — entry point, game loop, tick logika
import {
  GAME_DURATION_S,
  PASSIVE_COINS_PER_S,
} from './config.js';
import {
  getState,
  setState,
  saveState,
  loadState,
  getPassiveRetention,
  getZoneDrain,
} from './state.js';
import { setupInput }      from './input.js';
import { render }          from './render.js';
import { updateUI, showEndScreen } from './ui.js';
import { initAudio, stopAudio }    from './audio.js';
import { buyUpgrade }              from './systems/upgrades.js';
import { checkZoneTransition }     from './systems/zones.js';

// ---------------------------------------------------------------------------
// Interni loop state
// ---------------------------------------------------------------------------

let _animFrameId  = null;
let _lastTs       = null;      // DOMHighResTimeStamp prethodnog frejma
let _tickAccum    = 0;         // akumulirani ms do sledećeg tika

const TICK_INTERVAL_MS = 1000; // tik svake sekunde
const DELTA_CAP_MS     = 100;  // cap delta da ne skočiš pri tab-switch

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Inicijalizuje igru: učitava state, podešava input, starta loop.
 * Poziva se iz index.html <script type="module">.
 */
export function init() {
  loadState();
  updateUI(getState());

  setupInput(_onTrackClick, _onUpgradeBuy);

  // Ako je igra već bila u toku (reload tokom igre), nastavi odmah
  const { phase } = getState();
  if (phase === 'playing') {
    _startLoop();
  }
}

/**
 * Pokreće igru (poziva se iz UI-a pri kliku "Počni").
 */
export function startGame() {
  setState({ phase: 'playing' });
  saveState();
  initAudio();
  _startLoop();
}

/**
 * Zaustavlja loop i čisti resurse.
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
// Loop
// ---------------------------------------------------------------------------

function _startLoop() {
  stopLoop(); // osiguraj da nema duplog lopa
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

  // Cap delta — zaštita od tab-switch / freeze
  if (delta_ms > DELTA_CAP_MS) {
    delta_ms = DELTA_CAP_MS;
  }

  _tickAccum += delta_ms;

  // Tik svake sekunde (može biti više tikova u jednom frejmu ako je delta bio > 1s)
  while (_tickAccum >= TICK_INTERVAL_MS) {
    _tickAccum -= TICK_INTERVAL_MS;
    _tick(TICK_INTERVAL_MS / 1000); // proslijedi sekunde
  }

  // Render svaki frejm (smooth animacije)
  render(getState());

  _animFrameId = requestAnimationFrame(_gameLoop);
}

// ---------------------------------------------------------------------------
// Tick — game logika 1x/s
// ---------------------------------------------------------------------------

/**
 * @param {number} dt — delta u sekundama (tipično 1.0)
 */
function _tick(dt) {
  const s = getState();

  // 1. Napredi elapsed
  const new_elapsed = s.elapsed_s + dt;

  // 2. Pasivni Music Coins
  const new_coins = s.music_coins + PASSIVE_COINS_PER_S * dt;

  // 3. Energija: retencija - drain
  const retention   = getPassiveRetention();
  const drain       = getZoneDrain();
  const net_delta   = (retention - drain) * dt;
  let new_energy    = s.crowd_energy + net_delta;

  // 4. Clamp energije
  new_energy = Math.min(Math.max(new_energy, 0.0), 100.0);

  // 5. Provjeri FAIL — energija dostigla 0 (bez clampa bi bila negativna)
  const isFail = new_energy <= 0.0;

  // 6. Provjeri WIN — isteklo vrijeme uz energy > 0
  const isWin = !isFail && new_elapsed >= GAME_DURATION_S;

  // 7. Primijeni novi state
  setState({
    elapsed_s:    isWin ? GAME_DURATION_S : new_elapsed,
    music_coins:  new_coins,
    crowd_energy: isFail ? 0.0 : new_energy,
  });

  // 8. Zone tranzicija (emituje event, ne mijenja state direktno)
  checkZoneTransition(s.elapsed_s, new_elapsed);

  // 9. Kraj igre
  if (isFail || isWin) {
    _endGame(isWin ? 'win' : 'fail');
    return;
  }

  // 10. Save + UI update jednom u sekundi
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
 * Poziva se iz input.js kada korisnik klikne "Next Track".
 */
function _onTrackClick() {
  const s = getState();
  if (s.phase !== 'playing') return;

  const new_energy = Math.min(s.crowd_energy + 2.5, 100.0);
  const new_coins  = s.music_coins + 5;

  setState({ crowd_energy: new_energy, music_coins: new_coins });
  updateUI(getState());
}

/**
 * Poziva se iz input.js kada korisnik klikne dugme za kupovinu upgrada.
 * @param {string} upgradeId
 */
function _onUpgradeBuy(upgradeId) {
  const success = buyUpgrade(upgradeId);
  if (success) {
    updateUI(getState());
  }
}
