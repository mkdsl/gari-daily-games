import { GAME_DURATION_S, CLICK_ENERGY, CLICK_COINS, CLICK_COOLDOWN_MS, PASSIVE_COINS_PER_S } from './config.js';
import { getState, setState, saveState, loadState, getPassiveRetention, getCurrentZone, getZoneDrain } from './state.js';
import { setupInput } from './input.js';
import { initCanvas, renderFrame } from './render.js';
import { initUI, updateHUD, showScreen, hideScreen, setBodyZone } from './ui.js';
import { initAudio, startAmbient, playClick, playUpgradeBuy, playZoneTransition, playFail, playWin } from './audio.js';
import { canBuyUpgrade, buyUpgrade, getAvailableUpgrades } from './systems/upgrades.js';
import { checkZoneTransition, formatElapsed } from './systems/zones.js';

let tickIntervalId = null;

function _onTrackClick() {
  const state = getState();
  if (state.phase !== 'playing') return;
  initAudio();
  playClick();
  setState({
    crowd_energy: Math.min(100, state.crowd_energy + CLICK_ENERGY),
    music_coins: state.music_coins + CLICK_COINS,
    total_clicks: (state.total_clicks || 0) + 1,
  });
  updateHUD(getState());
}

function _onUpgradeBuy(upgradeId) {
  if (!canBuyUpgrade(upgradeId)) return;
  buyUpgrade(upgradeId);
  playUpgradeBuy();
  updateHUD(getState());
  saveState();
}

function _endGame(type) {
  clearInterval(tickIntervalId);
  setState({ phase: type });
  saveState();
  if (type === 'win') playWin(); else playFail();
  const state = getState();
  const zone = getCurrentZone();

  if (type === 'win') {
    showScreen(type, {
      elapsed_s: state.elapsed_s,
      peakZone: zone.id,
      totalClicks: state.total_clicks || 0,
      maxEnergy: state.max_energy || state.crowd_energy || 0,
      shareText: `Odslužio/la sam 6h smenu bez incidenta. Floor je bio pun. 🎧 #DJzaPultom`,
    });
  } else {
    showScreen(type, {
      elapsed_s: state.elapsed_s,
      peakZone: zone.id,
      totalClicks: state.total_clicks || 0,
      maxEnergy: state.max_energy || state.crowd_energy || 0,
      shareText: `Floor se ispraznio u ${zone.name} nakon ${formatElapsed(state.elapsed_s)}. Sledeći put — bolji USB. #DJzaPultom`,
      onRetry: () => { location.reload(); },
    });
  }
}

function _tick() {
  const state = getState();
  if (state.phase !== 'playing') return;

  const prevElapsed = state.elapsed_s;
  const newElapsed = prevElapsed + 1;
  const drain = getZoneDrain();
  const retention = getPassiveRetention();
  const netDrain = drain - retention;
  const newEnergy = Math.max(0, Math.min(100, state.crowd_energy - netDrain));
  const newCoins = state.music_coins + PASSIVE_COINS_PER_S;

  // Prati maksimalnu energiju
  const maxEnergy = Math.max(state.max_energy || 0, newEnergy);

  setState({ elapsed_s: newElapsed, crowd_energy: newEnergy, music_coins: newCoins, max_energy: maxEnergy });

  const transition = checkZoneTransition(prevElapsed, newElapsed);
  if (transition) {
    playZoneTransition(transition.id);
    startAmbient(transition.id);
    setBodyZone(transition.id);
  }

  if (newElapsed >= GAME_DURATION_S && newEnergy > 0) {
    _endGame('win');
    return;
  }

  if (newEnergy <= 0) {
    _endGame('fail');
    return;
  }

  saveState();
  updateHUD(getState());
}

function startGame() {
  initAudio();
  hideScreen();
  setState({ phase: 'playing' });
  startAmbient(getCurrentZone().id);
  setBodyZone(getCurrentZone().id);
  updateHUD(getState());
  tickIntervalId = setInterval(_tick, 1000);
  renderFrame(getState());
}

function init() {
  loadState();
  initUI(_onTrackClick, _onUpgradeBuy);
  initCanvas(document.getElementById('game-canvas'));
  showScreen('menu', { onStart: startGame });
}

init();
