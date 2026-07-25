/** Na Vezi — Bootstrap: wires macro→micro→meta petlju, game loop */

import { loadState, getState, updateState, saveState } from './state.js';
import { GAME_CONFIG } from './config.js';
import { EVENTS, on, emit } from './events.js';
import {
  initAudio, startAmbientPad, playOnAirJingle, playOffAirFade,
  toggleMute, resumeAudio, playSuccessChime, playPrestigeFanfare,
  isAudioReady
} from './audio.js';
import { initInput } from './input.js';
import {
  initRender, showScreen, renderTopBar,
  renderSignalBar, renderOffgridMeter, renderTimer,
  renderChatUpdate, renderAlarm, updateAlarmTimer,
  removeAlarmCard, renderEngagement, flashScreen,
  removeBatteryCriticalFlash
} from './render.js';
import {
  renderMainScreen, renderWeeklyBriefing,
  renderMacroPlanningScreen, renderPrestigeScreen,
  showAchievementToast, initAchievementToast
} from './ui.js';
import { startPlanningSession, lockInPlan, getCurrentStep, getDraftPlan, getTotalSteps, nextStep, prevStep, updateDraftPlan } from './macro/planning-session.js';
import { buyEquipment } from './macro/equipment-shop.js';
import { resolveWeeklyOutcome } from './macro/weekly-outcome.js';
import {
  initDashboardState, getDashboardState, updateDashboardState,
  tickTime, tickSignal, calcOverallEngagement,
  isEmisijaOver, resetDashboardState
} from './micro/dashboard-state.js';
import { passiveSignalRecover, resolveSignalAction } from './micro/signal-system.js';
import {
  tryGenerateAlarm, resolveAlarm, tickAlarms
} from './micro/alarm-generator.js';
import { resetEscalation, processEscalation, processResolution } from './micro/alarm-escalation.js';
import {
  tickEqWindow, isEqActive, getEqSession,
  confirmEq, updateEqValue, startEqMinigame, resetEqSession
} from './micro/eq-minigame.js';
import {
  tickChat, getRecentMessages, resetChatQueues,
  triggerTiktokSpike, getAllMomentum
} from './micro/chat-momentum.js';
import {
  calcPlatformEngagement, resetPlatformCurves,
  hasTiktokSpike, formatEngagement
} from './micro/platform-curves.js';
import {
  resetGuestRuntime, handleGuestArrival,
  tickGuestStandout, getStandoutMoment
} from './micro/guest-runtime.js';
import { resetOffgridRuntime, calcCurrentDrain, tickBattery } from './micro/offgrid-runtime.js';
import { resolveEmisija } from './micro/emisija-resolver.js';
import { checkAllAchievements } from './meta/achievements.js';
import { isPrestigeAvailable, executePrestige, getNextPrestigeMult } from './meta/prestige.js';
import { checkAndApplyUnlocks } from './meta/unlock-manager.js';
import { processAndSaveHighlights } from './meta/replay-highlights.js';
import { getSeasonStats } from './meta/season-stats.js';
import {
  isTutorialMode, applyTutorialClasses,
  checkTutorialEnd, getTutorialBannerHtml
} from './ui/tutorial-mode.js';
import { renderReplayScreen } from './ui/replay-screen.js';
import { initOffgridMeter } from './ui/offgrid-meter.js';

/** @type {number|null} RAF handle za micro loop */
let _rafId = null;
/** @type {number} Timestamp prethodnog frame-a */
let _lastFrameTs = 0;
/** @type {number} Akumulirani sekunde za tick logiku */
let _tickAccum = 0;
/** @type {Object|null} Cache poslednjeg emisijaResult za outcome/replay */
let _lastEmisijaResult = null;
/** @type {boolean} Flag da je emisija završena */
let _emisijaEnded = false;
/** @type {Object|null} Locked-in plan za tekuću emisiju */
let _currentPlan = null;
/** @type {number} Poslednje prikazano vreme za timer render (optimizacija) */
let _lastRenderedElapsed = -1;

/**
 * Gradi kompletnu HTML strukturu svih ekrana u #app
 * @param {HTMLElement} app
 */
function _buildHtml(app) {
  app.innerHTML = `
    <div id="achievement-toast-container" class="toast-container"></div>

    <!-- MAIN SCREEN -->
    <section id="screen-main" class="screen active">
      <div id="main-screen-content"></div>
    </section>

    <!-- WEEKLY BRIEFING -->
    <section id="screen-briefing" class="screen">
      <div id="briefing-content" class="scroll-area"></div>
    </section>

    <!-- MACRO PLANNING -->
    <section id="screen-macro" class="screen">
      <div id="top-bar"></div>
      <div id="macro-content" class="scroll-area" style="padding-bottom:80px;"></div>
    </section>

    <!-- LOCK-IN COUNTDOWN -->
    <section id="screen-lockin" class="screen">
      <div class="lockin-wrap">
        <div class="lockin-logo">📡 Guncati TV</div>
        <div class="lockin-subtitle">Odlazite NA VEZU za...</div>
        <div id="lockin-number" class="lockin-countdown">3</div>
        <div id="lockin-plan-summary" class="lockin-summary"></div>
      </div>
    </section>

    <!-- MICRO DASHBOARD (live emisija) -->
    <section id="screen-micro" class="screen">

      <!-- Mini top bar -->
      <div class="micro-topbar">
        <div class="onair-badge">
          <span class="onair-dot"></span>
          <span class="onair-text">NA VEZI</span>
        </div>
        <div class="micro-hud-chips">
          <span class="hud-chip" id="micro-capital">💰 --</span>
          <span class="hud-chip" id="micro-audience">👥 --</span>
        </div>
        <button class="btn btn-ghost btn-sm" id="mute-btn-micro" title="Mute/Unmute">🔊</button>
      </div>

      <div class="micro-body">

        <!-- Signal sekcija -->
        <div class="signal-section">
          <div class="signal-hdr">
            <span class="section-label">📡 Signal</span>
            <span id="signal-status" class="signal-pct ok">100%</span>
          </div>
          <div class="signal-bar-outer">
            <div id="signal-bar-fill" class="signal-bar-fill ok" style="width:100%;"></div>
          </div>
        </div>

        <!-- OFF-GRID METER — DOMINANTNA ZONA (25%+ dashboarda) -->
        <div id="offgrid-meter-container" class="offgrid-meter-zone"></div>

        <!-- Timer + Engagement red -->
        <div class="micro-stats-row">
          <div class="micro-timer-block">
            <div class="micro-stat-label">⏱ Vreme</div>
            <div id="micro-timer" class="timer-display">45:00</div>
          </div>
          <div class="micro-eng-block">
            <div class="micro-stat-label">📊 Engagement</div>
            <div class="eng-grid">
              <span class="eng-chip ig">IG</span>
              <span id="engagement-ig" class="eng-val">--</span>
              <span class="eng-chip tt" data-platform="tiktok">TT</span>
              <span id="engagement-tiktok" class="eng-val">--</span>
              <span class="eng-chip yt" data-platform="youtube">YT</span>
              <span id="engagement-youtube" class="eng-val">--</span>
            </div>
          </div>
        </div>

        <!-- Chat paneli (3 platforme) -->
        <div class="chat-panels-row" id="chat-panels-row">
          <div class="chat-panel" data-platform="ig">
            <div class="chat-panel-hdr">
              <span class="chat-plat-name">📷 Instagram</span>
              <div class="momentum-bar-outer">
                <div class="momentum-bar-fill" id="momentum-fill-ig" style="width:20%;"></div>
              </div>
            </div>
            <div class="chat-messages" id="chat-messages-ig"></div>
          </div>
          <div class="chat-panel" data-platform="tiktok">
            <div class="chat-panel-hdr">
              <span class="chat-plat-name">🎵 TikTok</span>
              <div class="momentum-bar-outer">
                <div class="momentum-bar-fill" id="momentum-fill-tiktok" style="width:20%;"></div>
              </div>
            </div>
            <div class="chat-messages" id="chat-messages-tiktok"></div>
          </div>
          <div class="chat-panel" data-platform="youtube">
            <div class="chat-panel-hdr">
              <span class="chat-plat-name">▶ YouTube</span>
              <div class="momentum-bar-outer">
                <div class="momentum-bar-fill" id="momentum-fill-youtube" style="width:20%;"></div>
              </div>
            </div>
            <div class="chat-messages" id="chat-messages-youtube"></div>
          </div>
        </div>

        <!-- EQ Minigame panel (skriveno, prikazuje se na feedback_glitch) -->
        <div id="eq-panel" class="eq-panel" style="display:none;">
          <div class="eq-panel-title">🎛 EQ Korekcija — Feedback Glitch</div>
          <div class="eq-track-wrap">
            <div class="eq-track" id="eq-track">
              <div class="eq-target-zone" id="eq-target-zone" style="left:35%; width:15%;"></div>
              <div class="eq-knob" id="eq-knob" style="left:0;">◆</div>
            </div>
          </div>
          <div class="eq-ctrl-row">
            <button class="btn btn-sm" id="eq-btn-left" title="◀ Arrow Left">◀</button>
            <span class="eq-val-label" id="eq-val-label">50</span>
            <button class="btn btn-sm" id="eq-btn-right" title="▶ Arrow Right">▶</button>
            <button class="btn btn-primary btn-sm" id="eq-btn-confirm">✓ Potvrdi</button>
          </div>
          <div class="eq-timer-track">
            <div class="eq-timer-fill" id="eq-timer-fill" style="width:100%;"></div>
          </div>
        </div>

        <!-- Kraj emisije dugme -->
        <div class="end-row">
          <button class="btn btn-ghost btn-sm" id="end-emisija-btn">⏹ Završi emisiju</button>
        </div>

      </div>

      <!-- Alarm overlay (floata iznad micro-body) -->
      <div id="alarm-overlay" class="alarm-overlay"></div>

    </section>

    <!-- OUTCOME SCREEN -->
    <section id="screen-outcome" class="screen">
      <div id="outcome-content" class="scroll-area"></div>
    </section>

    <!-- REPLAY SCREEN -->
    <section id="screen-replay" class="screen">
      <div id="replay-content"></div>
    </section>

    <!-- PRESTIGE SCREEN -->
    <section id="screen-prestige" class="screen">
      <div id="prestige-content" class="scroll-area"></div>
    </section>
  `;
}

/* ═══════════════════ SCREEN TRANSITIONS ═══════════════════ */

/**
 * Prikazuje main meni
 */
function _showMain() {
  const state = getState();
  const container = document.getElementById('main-screen-content');
  showScreen('main');
  renderMainScreen(container, {
    state,
    onStart: _showBriefing,
    prestigeAvailable: isPrestigeAvailable(),
    onPrestige: () => _showPrestige()
  });
}

/**
 * Prikazuje weekly briefing (pre makro planiranja)
 */
function _showBriefing() {
  resumeAudio();
  const state = getState();
  const container = document.getElementById('briefing-content');
  const stats = getSeasonStats();
  showScreen('briefing');
  renderWeeklyBriefing(container, {
    state,
    stats,
    week: state.week || 1,
    capacityInfo: {
      capacity: state.base_offgrid_capacity || 80,
      weatherBand: state.current_weather_band || 'prosecno'
    },
    prestigeAvailable: isPrestigeAvailable(),
    onStart: _showMacro,
    onPrestige: () => _showPrestige()
  });
}

/**
 * Prikazuje macro planning screen (5 koraka)
 */
function _showMacro() {
  startPlanningSession();
  const container = document.getElementById('macro-content');
  showScreen('macro');
  renderTopBar();
  _renderMacroStep(container);
}

/**
 * Re-renderuje trenutni korak macro planiranja
 * @param {HTMLElement} container
 */
function _renderMacroStep(container) {
  const draftPlan = getDraftPlan();
  const { index: currentStep } = getCurrentStep();
  const totalSteps = getTotalSteps();
  renderMacroPlanningScreen(container, draftPlan, currentStep, totalSteps, {
    onNext: () => { nextStep(); _renderMacroStep(container); },
    onPrev: () => { prevStep(); _renderMacroStep(container); },
    onLockIn: () => {
      const result = lockInPlan();
      if (result && result.ok) {
        _currentPlan = getState().weekly_plan;
        _showLockin(_currentPlan);
      }
    },
    onFormat: (formatId) => {
      updateDraftPlan({ format: formatId });
    },
    onAlloc: (platform, value) => {
      const current = getDraftPlan();
      const newAlloc = { ...current.platform_alloc, [platform]: value };
      updateDraftPlan({ platform_alloc: newAlloc });
      return newAlloc;
    },
    onEquip: (equipId) => {
      return buyEquipment(equipId);
    },
    onGuest: (guestId) => {
      updateDraftPlan({ chosen_guest_id: guestId });
    }
  });
  applyTutorialClasses(isTutorialMode());
}

/**
 * Odbroj 3-2-1 pre micro layera (lock-in countdown)
 * @param {Object} plan
 */
function _showLockin(plan) {
  showScreen('lockin');
  const numEl = document.getElementById('lockin-number');
  const summaryEl = document.getElementById('lockin-plan-summary');

  if (summaryEl && plan) {
    const alloc = plan.platform_alloc || {};
    const formatName = plan.format ? (plan.format.replace('_', ' ').toUpperCase()) : '--';
    summaryEl.innerHTML = `
      <div class="lockin-row"><span class="lockin-key">Format</span><strong>${formatName}</strong></div>
      <div class="lockin-row">
        <span class="lockin-key">Platforme</span>
        <span>IG ${alloc.ig || 0}% · TT ${alloc.tiktok || 0}% · YT ${alloc.youtube || 0}%</span>
      </div>
      ${plan.chosen_guest_id ? `<div class="lockin-row"><span class="lockin-key">Gost</span><strong>${plan.chosen_guest_id}</strong></div>` : ''}
      <div class="lockin-row"><span class="lockin-key">Off-grid</span><span>${Math.round(plan.weekly_capacity || 80)}%</span></div>
    `;
  }

  let count = 3;
  if (numEl) numEl.textContent = count;

  const iv = setInterval(() => {
    count--;
    if (numEl) {
      numEl.textContent = count > 0 ? count : '🔴';
      numEl.classList.add('countdown-pulse');
      setTimeout(() => numEl && numEl.classList.remove('countdown-pulse'), 350);
    }
    if (count <= 0) {
      clearInterval(iv);
      setTimeout(() => _startMicro(plan), 700);
    }
  }, 1000);
}

/**
 * Startuje micro layer — live emisija
 * @param {Object} plan
 */
function _startMicro(plan) {
  const state = getState();
  showScreen('micro');
  _emisijaEnded = false;
  _lastRenderedElapsed = -1;

  // Inicijalizuj sve micro subsisteme
  resetDashboardState(plan, state);
  resetOffgridRuntime();
  resetChatQueues();
  resetPlatformCurves();
  resetEscalation();
  resetGuestRuntime();
  resetEqSession();
  const _initSt = getState();
  const _initWp = _initSt.weekly_plan;
  initDashboardState(
    _initWp,
    _initSt.equipment,
    { arrived: false, gostId: _initWp.chosen_guest_id },
    _initWp.weekly_capacity
  );

  // Off-grid meter DOM
  const offgridContainer = document.getElementById('offgrid-meter-container');
  if (offgridContainer) {
    initOffgridMeter(offgridContainer);
  }

  // Tutorial CSS klase
  applyTutorialClasses(isTutorialMode());

  // Audio
  startAmbientPad();
  playOnAirJingle();

  // Gost dolazak (30-90s kašnjenje — simulira "ušao za kulisu")
  if (plan.chosen_guest_id) {
    const delay = 30 + Math.floor(Math.random() * 60);
    setTimeout(() => {
      if (!_emisijaEnded) {
        handleGuestArrival(plan.chosen_guest_id, getState());
      }
    }, delay * 1000);
  }

  // Wire interaktivne handlere
  _wireAlarmOverlay();
  _wireEqControls();
  _wireMicroButtons();

  // Pokretanje RAF petlje
  _lastFrameTs = performance.now();
  _tickAccum = 0;
  if (_rafId) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(_gameLoop);
}

/* ═══════════════════ MICRO GAME LOOP ═══════════════════ */

/**
 * requestAnimationFrame petlja — sve micro rendering i logika
 * @param {number} timestamp ms od page load
 */
function _gameLoop(timestamp) {
  if (_emisijaEnded) return;
  _rafId = requestAnimationFrame(_gameLoop);

  const delta = Math.min((timestamp - _lastFrameTs) / 1000, 0.2); // cap na 200ms (tab switch)
  _lastFrameTs = timestamp;

  // Akumuliraj za 1-sekunden tick
  _tickAccum += delta;
  while (_tickAccum >= 1.0) {
    _tickAccum -= 1.0;
    if (!_emisijaEnded) _tickMicro(1);
  }

  // Render svaki frame (smooth animacija)
  if (!_emisijaEnded) _renderMicro();
}

/**
 * Sekunden tick — sva game logika micro layera
 * @param {number} dt sekundi (uvek 1 u normalnom toku)
 */
function _tickMicro(dt) {
  const ds = getDashboardState();
  if (!ds || _emisijaEnded) return;
  const state = getState();
  const plan = _currentPlan || ds.plan || {};
  const alloc = plan.platform_alloc || { ig: 100, tiktok: 0, youtube: 0 };

  // 1. Timer napreduje
  tickTime(dt);

  // 2. Signal passive recovery (između alarmova)
  passiveSignalRecover(GAME_CONFIG.SIGNAL_RECOVER_RATE);
  tickSignal(GAME_CONFIG.SIGNAL_RECOVER_RATE);

  // 3. Off-grid baterija se prazni
  const drainPerSec = calcCurrentDrain();
  tickBattery(drainPerSec * dt, getDashboardState());

  // 4. Chat generacija po platformama
  const momentum = getAllMomentum();
  tickChat(dt, alloc, momentum);

  // 5. Platform engagement krive
  const currentDs = getDashboardState();
  for (const platform of ['ig', 'tiktok', 'youtube']) {
    if ((alloc[platform] || 0) > 0) {
      calcPlatformEngagement(
        platform,
        currentDs.elapsed || 0,
        alloc[platform],
        momentum[platform] || 0.2
      );
    }
  }

  // 6. TikTok spike detekcija (samo jednom)
  if (hasTiktokSpike() && !currentDs.tiktokSpikeTriggered) {
    updateDashboardState({ tiktokSpikeTriggered: true });
    triggerTiktokSpike('tiktok');
    flashScreen('signal');
    emit(EVENTS.TIKTOK_SPIKE, {});
  }

  // 7. Alarm generacija
  const freshDs = getDashboardState();
  const newAlarm = tryGenerateAlarm(freshDs.elapsed || 0, freshDs);
  if (newAlarm) _handleNewAlarm(newAlarm);

  // 8. Tick alarm tajmera (miss expired)
  tickAlarms(dt);

  // 9. Alarm escalacija (cross-alarm lanci)
  processEscalation(getDashboardState());

  // 10. EQ window tick
  if (isEqActive()) {
    const eqResult = tickEqWindow(dt);
    if (eqResult === 'timeout') {
      _handleEqTimeout();
    }
  }

  // 11. Guest standout event (random window tokom emisije)
  const standout = tickGuestStandout(dt, plan.chosen_guest_id);
  if (standout && !getDashboardState().guestStandoutDone) {
    updateDashboardState({ guestStandoutDone: true });
    _injectGuestStandoutChat(standout, plan.chosen_guest_id);
  }

  // 12. Periodičan save (svake 60s)
  const elapsed = getDashboardState().elapsed || 0;
  if (elapsed > 0 && elapsed % 60 === 0) {
    saveState();
  }

  // 13. Provjera kraja emisije
  if (isEmisijaOver() && !_emisijaEnded) {
    _endEmisija('natural');
  }
}

/**
 * Ubacuje standout poruku gosta u IG chat
 * @param {string} text
 * @param {string} gostName
 */
function _injectGuestStandoutChat(text, gostName) {
  const container = document.getElementById('chat-messages-ig');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'chat-msg hype standout-msg';
  el.innerHTML = `<span class="name">💫 ${gostName || 'Gost'}</span>: ${text}`;
  container.appendChild(el);
  while (container.children.length > 30) container.removeChild(container.firstChild);
  container.scrollTop = container.scrollHeight;
}

/* ═══════════════════ MICRO RENDER ═══════════════════ */

/**
 * Render micro dashboarda svaki frame
 */
function _renderMicro() {
  const ds = getDashboardState();
  if (!ds) return;
  const state = getState();
  const plan = _currentPlan || ds.plan || {};
  const alloc = plan.platform_alloc || { ig: 100, tiktok: 0, youtube: 0 };

  // Mini top bar — kapital i publika
  const capEl = document.getElementById('micro-capital');
  const audEl = document.getElementById('micro-audience');
  if (capEl) capEl.textContent = `💰 ${_fmtNum(state.capital)}`;
  if (audEl) {
    const total = (state.audience.ig || 0) + (state.audience.tiktok || 0) + (state.audience.youtube || 0);
    audEl.textContent = `👥 ${_fmtNum(total)}`;
  }

  // Signal bar
  renderSignalBar(ds.signal !== undefined ? ds.signal : 100);

  // Off-grid meter
  renderOffgridMeter(
    ds.offgrid !== undefined ? ds.offgrid : (state.base_offgrid_capacity || 80),
    state.base_offgrid_capacity || 100,
    state.current_weather_band || 'prosecno'
  );

  // Timer (samo kad se promeni)
  const elapsed = ds.elapsed || 0;
  if (elapsed !== _lastRenderedElapsed) {
    _lastRenderedElapsed = elapsed;
    renderTimer(elapsed, GAME_CONFIG.EMISIJA_DURATION);
  }

  // Chat — nove poruke po platformama
  for (const platform of ['ig', 'tiktok', 'youtube']) {
    if ((alloc[platform] || 0) > 0) {
      const newMsgs = getRecentMessages(platform);
      if (newMsgs && newMsgs.length > 0) {
        const mom = getAllMomentum();
        renderChatUpdate(platform, newMsgs, mom[platform] || 0.2);
      }
    }
  }

  // Engagement po platformama
  const engagement = {};
  for (const p of ['ig', 'tiktok', 'youtube']) {
    if ((alloc[p] || 0) > 0) {
      engagement[p] = calcOverallEngagement(p) || 0;
    } else {
      engagement[p] = 0;
    }
  }
  renderEngagement(engagement);

  // Alarm timer bars (event delegation — update fill)
  const overlay = document.getElementById('alarm-overlay');
  if (overlay && ds.alarmTimers) {
    overlay.querySelectorAll('[data-alarm-id]').forEach(card => {
      const id = card.dataset.alarmId;
      const rem = ds.alarmTimers[id];
      const lim = ds.alarmLimits ? ds.alarmLimits[id] : 30;
      if (rem !== undefined) updateAlarmTimer(id, rem, lim || 30);
    });
  }

  // EQ panel update
  _renderEqPanel();
}

/**
 * Render EQ minigame panela
 */
function _renderEqPanel() {
  const panel = document.getElementById('eq-panel');
  if (!panel) return;

  if (!isEqActive()) {
    if (panel.style.display !== 'none') panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';
  const session = getEqSession();
  if (!session) return;

  // Knob pozicija
  const track = document.getElementById('eq-track');
  const knob = document.getElementById('eq-knob');
  if (track && knob) {
    const w = track.offsetWidth || 280;
    const knobW = 20;
    knob.style.left = `${Math.round((session.current / 100) * (w - knobW))}px`;
  }

  // Target zona
  const targetZone = document.getElementById('eq-target-zone');
  if (targetZone) {
    const halfWin = 7.5; // 15% prozor / 2
    targetZone.style.left = `${Math.max(0, session.target - halfWin)}%`;
    targetZone.style.width = '15%';
  }

  // Value label
  const valLabel = document.getElementById('eq-val-label');
  if (valLabel) valLabel.textContent = Math.round(session.current);

  // Timer fill
  const timerFill = document.getElementById('eq-timer-fill');
  if (timerFill) {
    const prog = session.windowProgress !== undefined ? session.windowProgress : 1;
    timerFill.style.width = `${Math.max(0, prog * 100)}%`;
    timerFill.style.background = prog < 0.3
      ? 'var(--color-critical)'
      : prog < 0.6 ? 'var(--color-warn)'
      : 'var(--color-signal)';
  }
}

/* ═══════════════════ EVENT HANDLERS ═══════════════════ */

/**
 * Wire alarm overlay klikova (event delegation)
 */
function _wireAlarmOverlay() {
  const overlay = document.getElementById('alarm-overlay');
  if (!overlay) return;
  // Remove stari listener (fresh start svake emisije)
  const fresh = overlay.cloneNode(true);
  overlay.parentNode.replaceChild(fresh, overlay);
  const newOverlay = document.getElementById('alarm-overlay');

  newOverlay.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-alarm-id][data-action]');
    if (!btn) return;
    const alarmId = btn.dataset.alarmId;
    const action = btn.dataset.action;
    _handleAlarmAction(alarmId, action);
  });
}

/**
 * Handluje alarm akciju
 * @param {string} alarmId
 * @param {string} action
 */
function _handleAlarmAction(alarmId, action) {
  const ds = getDashboardState();
  if (!ds) return;

  if (action === 'diagnose' || action === 'eq_fix') {
    // Pokreni EQ minigame za feedback_glitch
    if (!isEqActive()) startEqMinigame();
    resolveAlarm(alarmId, action, ds);
    removeAlarmCard(alarmId);
    processResolution(alarmId, action, ds);
    return;
  }

  if (action === 'reroute') {
    // Reroute: troši off-grid kapacitet ali trenutno oporavlja signal
    resolveSignalAction('reroute', ds);
  } else if (action === 'push') {
    // Push: besplatno, postepeni oporavak
    resolveSignalAction('push', ds);
  } else if (action === 'restart') {
    // Platform hiccup: kratki restart
    resolveSignalAction('push', ds);
  }

  resolveAlarm(alarmId, action, ds);
  removeAlarmCard(alarmId);
  processResolution(alarmId, action, ds);
  playSuccessChime();
}

/**
 * Handluje novi alarm — render card + audio
 * @param {Object} alarm
 */
function _handleNewAlarm(alarm) {
  const overlay = document.getElementById('alarm-overlay');
  if (!overlay) return;

  renderAlarm(alarm, overlay);

  if (alarm.type === 'battery_critical') {
    flashScreen('battery');
  } else if (alarm.type === 'signal_drop') {
    flashScreen('signal');
  }
}

/**
 * EQ timeout — prozor je istekao, alarm propušten
 */
function _handleEqTimeout() {
  const panel = document.getElementById('eq-panel');
  if (panel) {
    panel.style.borderColor = 'var(--color-critical)';
    setTimeout(() => {
      if (panel) { panel.style.borderColor = ''; panel.style.display = 'none'; }
    }, 500);
  }
  resetEqSession();
}

/**
 * Wire EQ kontrola (dugmad + keyboard)
 */
function _wireEqControls() {
  const leftBtn = document.getElementById('eq-btn-left');
  const rightBtn = document.getElementById('eq-btn-right');
  const confirmBtn = document.getElementById('eq-btn-confirm');

  const moveLeft = () => { if (isEqActive()) updateEqValue(-5); };
  const moveRight = () => { if (isEqActive()) updateEqValue(5); };
  const doConfirm = () => {
    if (!isEqActive()) return;
    const result = confirmEq();
    const panel = document.getElementById('eq-panel');
    if (result.success) {
      playSuccessChime();
      if (panel) {
        panel.style.borderColor = 'var(--color-signal)';
        setTimeout(() => {
          if (panel) { panel.style.borderColor = ''; panel.style.display = 'none'; }
        }, 700);
      }
    } else {
      if (panel) {
        panel.style.borderColor = 'var(--color-critical)';
        setTimeout(() => {
          if (panel) { panel.style.borderColor = ''; panel.style.display = 'none'; }
        }, 700);
      }
    }
    resetEqSession();
  };

  if (leftBtn) leftBtn.onclick = moveLeft;
  if (rightBtn) rightBtn.onclick = moveRight;
  if (confirmBtn) confirmBtn.onclick = doConfirm;

  // Keyboard (stari listener se briše sa odlaskom sa ekrana)
  const keyHandler = (e) => {
    if (document.getElementById('screen-micro') &&
        !document.getElementById('screen-micro').classList.contains('active')) return;
    if (!isEqActive()) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); moveLeft(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); moveRight(); }
    else if (e.key === 'Enter') { e.preventDefault(); doConfirm(); }
  };
  document.addEventListener('keydown', keyHandler);
}

/**
 * Wire micro screen dugmad (mute, end emisija)
 */
function _wireMicroButtons() {
  const muteBtn = document.getElementById('mute-btn-micro');
  if (muteBtn) {
    muteBtn.onclick = () => {
      const muted = toggleMute();
      muteBtn.textContent = muted ? '🔇' : '🔊';
    };
  }

  const endBtn = document.getElementById('end-emisija-btn');
  if (endBtn) {
    endBtn.onclick = () => {
      if (!_emisijaEnded && (getDashboardState()?.elapsed || 0) > 30) {
        if (confirm('Završiti emisiju pre vremena?')) {
          _endEmisija('manual');
        }
      }
    };
  }
}

/* ═══════════════════ KRAJ EMISIJE → OUTCOME → REPLAY ═══════════════════ */

/**
 * Završava emisiju i prelazi na outcome
 * @param {'natural'|'manual'} reason
 */
function _endEmisija(reason) {
  if (_emisijaEnded) return;
  _emisijaEnded = true;

  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  playOffAirFade();
  removeBatteryCriticalFlash();

  const ds = getDashboardState();
  const state = getState();

  // Resolve micro layer
  const rawResult = resolveEmisija(ds, state, reason);

  // Apply weekly outcome na game state
  resolveWeeklyOutcome(rawResult, state);

  // Highlights
  processAndSaveHighlights(rawResult.highlights || [], state.week || 1);

  // Achievements
  const newState = getState();
  const newAch = checkAllAchievements(newState);
  if (newAch && newAch.length > 0) {
    newAch.forEach((ac, i) => setTimeout(() => showAchievementToast(ac), 300 + i * 800));
  }

  // Format unlock check
  checkAndApplyUnlocks(newState);

  // Tutorial end check
  const emisijeCount = (newState.emisije_count || 1);
  const tutEnded = checkTutorialEnd(emisijeCount);
  if (tutEnded) applyTutorialClasses(false);

  _lastEmisijaResult = rawResult;
  saveState();

  setTimeout(() => _showOutcome(rawResult), 1200);
}

/**
 * Prikazuje outcome screen posle emisije
 * @param {Object} result
 */
function _showOutcome(result) {
  showScreen('outcome');
  const container = document.getElementById('outcome-content');
  if (!container) return;

  const state = getState();
  const eng = result.overallEngagement || 0;
  const emoji = eng >= 0.65 ? '🔥' : eng >= 0.4 ? '✅' : eng >= 0.2 ? '😐' : '😬';
  const delta = result.capitalDelta || 0;
  const audDelta = result.audienceDelta || {};

  const buildAudRow = () => {
    const parts = [];
    if (audDelta.ig) parts.push(`IG ${audDelta.ig > 0 ? '+' : ''}${_fmtNum(audDelta.ig)}`);
    if (audDelta.tiktok) parts.push(`TT ${audDelta.tiktok > 0 ? '+' : ''}${_fmtNum(audDelta.tiktok)}`);
    if (audDelta.youtube) parts.push(`YT ${audDelta.youtube > 0 ? '+' : ''}${_fmtNum(audDelta.youtube)}`);
    return parts.length > 0 ? parts.join(' · ') : 'bez promene';
  };

  container.innerHTML = `
    <div class="outcome-wrap">
      <div class="outcome-hero">
        <div class="outcome-emoji">${emoji}</div>
        <h2 class="outcome-title">Emisija završena</h2>
        <p class="outcome-week">Nedelja ${state.week || 1}</p>
      </div>

      <div class="panel outcome-panel">
        <div class="outcome-row">
          <span class="outcome-label">Kapital</span>
          <span class="outcome-val ${delta >= 0 ? 'pos' : 'neg'}">${delta >= 0 ? '+' : ''}${_fmtNum(delta)} €</span>
        </div>
        <div class="outcome-row">
          <span class="outcome-label">Audience rast</span>
          <span class="outcome-val" style="font-size:0.85rem;">${buildAudRow()}</span>
        </div>
        <div class="outcome-row">
          <span class="outcome-label">Engagement</span>
          <span class="outcome-val" style="color:var(--color-signal);">${(eng * 100).toFixed(1)}%</span>
        </div>
        <div class="outcome-row">
          <span class="outcome-label">Signal uptime</span>
          <span class="outcome-val">${((result.signalUptime || 1) * 100).toFixed(0)}%</span>
        </div>
        ${result.batteryUsage ? `
          <div class="outcome-row">
            <span class="outcome-label">Baterija korišćena</span>
            <span class="outcome-val">${Math.round(result.batteryUsage)}%</span>
          </div>
        ` : ''}
      </div>

      ${result.noShow ? `
        <div class="panel" style="border-color:var(--color-warn); margin-top:12px;">
          <p style="color:var(--color-warn); margin:0;">⚠️ Gost nije stigao — pouzdanost gosta smanjena.</p>
        </div>
      ` : ''}
      ${result.tiktokSpike ? `
        <div class="panel" style="border-color:var(--color-tiktok,#69C9D0); margin-top:12px;">
          <p style="color:var(--color-tiktok,#69C9D0); margin:0;">⚡ TikTok spike — viralni momenat zabeležen!</p>
        </div>
      ` : ''}
      ${isPrestigeAvailable() ? `
        <div class="panel" style="border-color:var(--color-crt); margin-top:12px;">
          <p style="color:var(--color-crt); margin:0;">🌟 Prestiž dostupan! Idući put možeš da resetuješ za trajni bonus.</p>
        </div>
      ` : ''}

      <div class="outcome-actions">
        <button class="btn btn-primary flex-1" id="outcome-replay-btn">📼 Pogledaj Replay</button>
      </div>
    </div>
  `;

  const replayBtn = container.querySelector('#outcome-replay-btn');
  if (replayBtn) replayBtn.onclick = () => _showReplay(_lastEmisijaResult);
}

/**
 * Prikazuje replay/highlight screen
 * @param {Object} result
 */
function _showReplay(result) {
  showScreen('replay');
  const container = document.getElementById('replay-content');
  if (!container) return;

  renderReplayScreen(container, result, () => {
    // Posle replay: prestiž check ili main
    if (isPrestigeAvailable()) {
      _showPrestige();
    } else {
      _showMain();
    }
  });
}

/**
 * Prikazuje prestige screen
 */
function _showPrestige() {
  showScreen('prestige');
  const container = document.getElementById('prestige-content');
  if (!container) return;
  const state = getState();

  const doPrestige = () => {
    executePrestige();
    playPrestigeFanfare();
    const newState = getState();
    // Re-render sa novim state-om (prestiž je sad done)
    renderPrestigeScreen(container, {
      state: newState,
      nextMult: getNextPrestigeMult(),
      onPrestige: null, // jedanput po sesiji dovoljno
      onBack: _showMain
    });
    setTimeout(_showMain, 3500);
  };

  renderPrestigeScreen(container, {
    state,
    nextMult: getNextPrestigeMult(),
    onPrestige: doPrestige,
    onBack: _showMain
  });
}

/* ═══════════════════ SISTEM EVENTI ═══════════════════ */

/**
 * Wire sve aplikacijske evente
 */
function _wireSystemEvents() {
  on(EVENTS.BATTERY_CRITICAL, () => {
    if (!_emisijaEnded) flashScreen('battery');
  });

  on(EVENTS.BATTERY_RECOVERED, () => {
    removeBatteryCriticalFlash();
  });

  on(EVENTS.SIGNAL_DROP, () => {
    if (!_emisijaEnded) flashScreen('signal');
  });

  on(EVENTS.ACHIEVEMENT_UNLOCKED, (ac) => {
    showAchievementToast(ac);
  });

  on(EVENTS.EMISIJA_END, (result) => {
    if (!_emisijaEnded) {
      _emisijaEnded = true;
      _lastEmisijaResult = result;
      if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
      removeBatteryCriticalFlash();
      processAndSaveHighlights(result.highlights || [], (getState().week || 1));
      saveState();
      setTimeout(() => _showOutcome(result), 800);
    }
  });

  // Mute dugme na top baru (macro screen)
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'mute-btn') {
      const muted = toggleMute();
      e.target.textContent = muted ? '🔇' : '🔊';
    }
  });
}

/* ═══════════════════ UTILITIES ═══════════════════ */

/**
 * Formatuje broj u K/M/B
 * @param {number} n
 * @returns {string}
 */
function _fmtNum(n) {
  const v = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (v >= 1e9) return sign + (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return sign + (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return sign + (v / 1e3).toFixed(1) + 'k';
  return sign + Math.round(v).toString();
}

/* ═══════════════════ INIT ═══════════════════ */

/**
 * Inicijalizuje celu igru
 */
async function init() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('Na Vezi: #app element nije pronađen.');
    return;
  }

  // Load stare sesije
  loadState();

  // Build HTML struktura
  _buildHtml(app);

  // Init sistema
  initRender(app);
  initInput();
  initAchievementToast();
  initAudio();

  // Wire sistemske evente
  _wireSystemEvents();

  // Prikaži main screen
  _showMain();

  console.log('[Na Vezi] Igra inicijalizovana. Nedelja:', getState().week || 1);
}

// Boot — module skripte se izvršavaju posle HTML parsiranja (defer-like),
// pa je DOMContentLoaded često već opalio pre ovog listenera. Pokrivamo oba slučaja.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
