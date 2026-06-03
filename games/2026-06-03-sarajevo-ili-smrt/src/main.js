// ============================================================
//  main.js — Sarajevo ili Smrt
//  Bootstrap, wires all modules, game loop.
// ============================================================

import { SAVE_INTERVAL_SEC, COLORS } from './config.js';
import { createInitialState, loadState, saveState } from './state.js';
import { initInput, readInput } from './input.js';
import { render, resizeCanvas } from './render.js';
import { initUI, updateHUD, showScreen, showUpgradeModal, hideUpgradeModal, showPrestigeScreen, showPrestigeConfirm, hidePrestigeConfirm, showToast, showOfflinePopup, showUnlockNotification, setupWinScreen } from './ui.js';
import { tickIdleLP, applyOfflineProgress } from './systems/idle.js';
import { startSession, updateSession, endSession, clearSession } from './systems/session.js';
import { applySessionRep, checkAchievements, checkGrbavicaUnlock, checkMarijinDvorUnlock } from './systems/progression.js';
import { processNightEnd } from './systems/season.js';
import { buyUpgrade } from './systems/upgrades.js';
import { doPrestige1, doPrestige2, buyDKItem } from './systems/prestige.js';
import { generateDailyChallenge, isDailyCompleted, completeDailyChallenge, applyDailyHandicap, getDailyLeaderboard } from './systems/daily_challenge.js';
import { shareResult } from './share.js';
import { ACHIEVEMENT_TEXTS, UNLOCK_TEXTS, PRESTIGE_FLAVORS } from './content/aforizmi.js';
import { initAudio, playKvartAmbient, stopAmbient, playSFX, resumeContext } from './audio.js';

// ----------------------------------------------------------------
//  State
// ----------------------------------------------------------------
let state = loadState();
if (state) {
  const offline = applyOfflineProgress(state);
  state._offline_popup = offline;
} else {
  state = createInitialState();
}

// Ensure we're on start screen
state.current_screen = 'start';
state.active_session = null; // never resume mid-session on reload

// ----------------------------------------------------------------
//  UI init — builds DOM (must come FIRST, replaces document.body content)
// ----------------------------------------------------------------
initUI(state);
showScreen('start');

// ----------------------------------------------------------------
//  Canvas setup — after initUI has built the DOM with #session-canvas
// ----------------------------------------------------------------
let canvas = document.getElementById('session-canvas');
let ctx = canvas ? canvas.getContext('2d') : null;

function _setupCanvas() {
  canvas = document.getElementById('session-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', _setupCanvas);
_setupCanvas();

// ----------------------------------------------------------------
//  Input init — after canvas exists in DOM
// ----------------------------------------------------------------
initInput(canvas);

// Audio — init on first user gesture (iOS Safari requirement)
document.addEventListener('pointerdown', () => { resumeContext(); initAudio(); }, { once: true });

// Show offline popup after DOM is ready
if (state._offline_popup?.gained_lp > 0) {
  setTimeout(() => {
    showOfflinePopup(state, state._offline_popup.gained_lp, state._offline_popup.hours_elapsed);
  }, 300);
  delete state._offline_popup;
}

// Populate DJ name input if returning player
const nameInput = document.getElementById('dj-name-input');
if (nameInput && state.player_name && state.player_name !== 'DJ Neznani') {
  nameInput.value = state.player_name;
}

// ----------------------------------------------------------------
//  Game Loop
// ----------------------------------------------------------------
let lastTime    = performance.now();
let saveTimer   = 0;

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  // Read input once per frame; pass to both action processor and session updater
  const input = readInput();
  _processInputFrame(input);
  _update(dt, input);
  _renderFrame();

  saveTimer += dt;
  if (saveTimer >= SAVE_INTERVAL_SEC) {
    saveState(state);
    saveTimer = 0;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// ----------------------------------------------------------------
//  Input processing — convert actions to state mutations
// ----------------------------------------------------------------
function _processInputFrame(input) {

  for (const act of input.actions) {
    switch (act.action) {
      case 'start_game':
        state.current_screen = 'macro';
        playSFX('click');
        saveState(state);
        break;

      case 'set_name':
        state.player_name = act.payload || 'DJ Neznani';
        break;

      case 'start_daily': {
        const challenge = generateDailyChallenge();
        if (isDailyCompleted(state)) {
          showToast('Daily challenge već završen danas!');
          break;
        }
        const kvart = challenge.kvart;
        const ks = state.kvartovi[kvart];
        if (ks && ks.locked) {
          showToast(`${challenge.kvart_name} još nije dostupan. Osvoji rep prvo.`);
          break;
        }
        state.kvartovi[kvart].active = true;
        startSession(state, kvart, true, challenge.lp_multiplier);
        if (state.active_session) {
          applyDailyHandicap(state.active_session, challenge.handicap, state);
          state.active_session._daily_challenge_data = challenge;
        }
        playKvartAmbient(kvart);
        showScreen('session');
        break;
      }

      case 'select_kvart': {
        const kvart = act.payload;
        if (!state.kvartovi[kvart]?.locked) {
          state.selected_kvart = kvart;
        }
        break;
      }

      case 'play_night': {
        const kvart = state.selected_kvart;
        if (!kvart) break;
        const ks = state.kvartovi[kvart];
        if (!ks || ks.locked || !ks.active) break;
        startSession(state, kvart, false, 1.0);
        playKvartAmbient(kvart);
        showScreen('session');
        break;
      }

      case 'open_upgrade':
        state.show_upgrade_modal = true;
        showUpgradeModal(state);
        break;

      case 'close_upgrade':
        state.show_upgrade_modal = false;
        hideUpgradeModal();
        break;

      case 'buy_upgrade': {
        const branch = act.payload;
        const result = buyUpgrade(state, branch);
        if (result.ok) {
          playSFX('unlock');
          showToast(`${branch} nivo ${result.new_level} kupljen!`);
          // Refresh modal
          if (state.show_upgrade_modal) showUpgradeModal(state);
          // Check unlocks
          _checkAllUnlocks();
        } else {
          showToast(result.reason ?? 'Ne može se kupiti.');
        }
        break;
      }

      case 'open_prestige':
        state.current_screen = 'prestige';
        showPrestigeScreen(state);
        break;

      case 'back_macro':
        state.current_screen = 'macro';
        break;

      case 'prestige_confirm':
        showPrestigeConfirm(state);
        break;

      case 'prestige_do': {
        hidePrestigeConfirm();
        let result = null;
        if (state.prestige_level === 0) {
          result = doPrestige1(state);
        } else if (state.prestige_level === 1) {
          result = doPrestige2(state);
        }
        if (result) {
          playSFX('prestige');
          showToast(`Prestige! +${result.dk_earned} DK zaraženo.`);
          if (state.current_screen === 'win') {
            setupWinScreen(state);
          } else {
            state.current_screen = 'macro';
          }
          saveState(state);
        }
        break;
      }

      case 'prestige_cancel':
        hidePrestigeConfirm();
        break;

      case 'buy_dk_item': {
        const item_id = act.payload;
        const result = buyDKItem(state, item_id);
        if (result.ok) {
          showToast(`DK item kupljen!`);
          showPrestigeScreen(state); // refresh
        } else {
          showToast(result.reason ?? 'Ne može se kupiti.');
        }
        break;
      }

      case 'dismiss_session': {
        // Player clicked canvas after session ended
        if (state.active_session?.done || state.active_session?.failed) {
          stopAmbient();
          _postSessionProcessing();
          clearSession(state);
          state.current_screen = 'macro';
          showScreen('macro');
        }
        break;
      }

      case 'share_result':
        shareResult(state, state.active_session).catch(() => {});
        break;

      case 'new_run':
        // New Game+ — prestige and restart
        if (state.prestige_level >= 2) {
          // Reset to P2 state with all DK kept
          state.lp = 0;
          state.total_lp_earned_this_run = 0;
          state.upgrades = { A: 1, B: 0, C: 0, Cplus: 0, D: 0, E: 0 };
          state.season = { number: 1, nights_played: 0, bad_rep_events_total: 0 };
          for (const kvart of ['bascarsija', 'marijin_dvor', 'grbavica']) {
            state.kvartovi[kvart].mahala_reputacija = 0;
            state.kvartovi[kvart].sessions_played = 0;
            state.kvartovi[kvart].klub_tier = 1;
          }
          state.kvartovi.bascarsija.active = true;
          state.kvartovi.marijin_dvor.active = false;
          state.kvartovi.grbavica.locked = true;
          state.current_screen = 'macro';
          saveState(state);
        }
        break;

      case 'view_leaderboard': {
        const today = new Date().toISOString().slice(0, 10);
        const lb = getDailyLeaderboard(today);
        if (lb.length === 0) {
          showToast('Nema rezultata za danas. Igraj daily challenge!');
        } else {
          showToast('Top: ' + lb.slice(0, 3).map((e, i) => `${i + 1}. ${e.name} ${e.score}LP`).join(' | '));
        }
        break;
      }

      case 'slider_nudge':
      case 'slider_center':
        // Handled inside session.js updateSession via input.actions passthrough
        break;
    }
  }
}

// ----------------------------------------------------------------
//  Post-session processing — rep, unlocks, night counter
// ----------------------------------------------------------------
function _postSessionProcessing() {
  const sess = state.active_session;
  if (!sess) return;

  // Audio feedback for session result
  if (!sess.failed && sess.crowd_level >= 90) playSFX('legend_moment');
  else if (sess.failed) playSFX('bad_rep');
  else if (sess.lp_earned > 0) playSFX('lp_gain');

  // Apply rep gain/loss
  applySessionRep(state, sess.kvart, sess.lp_earned, sess.failed);

  // Daily challenge completion
  if (sess.is_daily_challenge && !sess.failed) {
    completeDailyChallenge(state, sess.lp_earned);
    showToast(`Daily challenge završen! ${Math.floor(sess.lp_earned)} LP. Legenda.`);
  }

  // Process night end (unlock checks, season end)
  const nightResult = processNightEnd(state);

  if (nightResult.unlocked_grbavica) {
    showUnlockNotification(UNLOCK_TEXTS.grbavica);
  }
  if (nightResult.unlocked_marijin_dvor) {
    showUnlockNotification(UNLOCK_TEXTS.marijin_dvor);
  }
  if (nightResult.season_ended) {
    showToast(`Sezona ${nightResult.season_summary.season_number - 1} završena! Nova sezona počinje.`);
  }

  // Achievement checks
  const ach_before = { ...state.achievements };
  checkAchievements(state);
  for (const [key, val] of Object.entries(state.achievements)) {
    if (val && !ach_before[key]) {
      const text = ACHIEVEMENT_TEXTS[key];
      if (text) showToast(text, 4000);
    }
  }

  // Win condition
  if (state.achievements.avala_headliner_eligible) {
    state.current_screen = 'win';
    setupWinScreen(state);
  }

  saveState(state);
}

// ----------------------------------------------------------------
//  Unlock checks (after upgrades)
// ----------------------------------------------------------------
function _checkAllUnlocks() {
  const md_unlocked = checkMarijinDvorUnlock(state);
  if (md_unlocked) showUnlockNotification(UNLOCK_TEXTS.marijin_dvor);

  const grb_unlocked = checkGrbavicaUnlock(state);
  if (grb_unlocked) showUnlockNotification(UNLOCK_TEXTS.grbavica);
}

// ----------------------------------------------------------------
//  Update — game logic per frame
// ----------------------------------------------------------------
function _update(dt, input) {
  if (state.current_screen === 'session' && state.active_session) {
    updateSession(state, input, dt);

    // Auto-dismiss after done (tiny delay so player can see result)
    if (state.active_session?.done && !state.active_session._dismiss_timer) {
      state.active_session._dismiss_timer = true;
      // Don't auto-dismiss — let player click
    }
  } else {
    // Idle LP accrual on non-session screens
    tickIdleLP(state, dt);
  }
}

// ----------------------------------------------------------------
//  Render frame
// ----------------------------------------------------------------
function _renderFrame() {
  if (state.current_screen === 'session' && ctx) {
    render(ctx, state);
  }
  updateHUD(state);
}
