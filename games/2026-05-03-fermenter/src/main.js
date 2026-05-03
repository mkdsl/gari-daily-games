/**
 * @file main.js
 * Fermenter — Varenički Bunt
 * Bootstrap, game loop, i orkestrator svih modula.
 */

import { CONFIG } from './config.js';
import { createInitialState, loadState, saveState, computeDerivedStats } from './state.js';
import { initInput } from './input.js';
import { initRenderer, spawnBubbles, triggerPrestigeExplosion, pulseBarrel } from './render.js';
import {
  initUI,
  updateHUD,
  renderUpgradePanel,
  showPrestigeButton,
  hidePrestigeButton,
  showMutationModal,
  showWinScreen,
} from './ui.js';
import { tickFermentation, checkDegradation } from './systems/fermentation.js';
import { canPrestige, doPrestige, checkWinState } from './systems/prestige.js';
import { buyUpgrade } from './systems/upgrades.js';
import { getRandomMutationOptions } from './entities/mutations.js';
import { initAudio, playClickSound, playPrestigeSound, playDegradationWarning, setFermentRate } from './audio.js';

// ── Modul-level varijable ───────────────────────────────────────────────────

/** @type {GameState} */
let state = null;

/** Pauzira game loop kad je true (prestiže animacija, win screen) */
let paused = false;

/** Timestamp prethodnog frame-a za delta time računanje */
let lastFrameTime = 0;

/** Akumulator za UI refresh throttle (ms) */
let uiAccumulator = 0;

/** Akumulator za autosave throttle (ms) */
let autosaveAccumulator = 0;

/** Akumulator za auto-klik I (ms) */
let autoClick1Accumulator = 0;

/** Akumulator za auto-klik II (ms) */
let autoClick2Accumulator = 0;

/** Da li je prestiže dugme trenutno prikazano */
let prestigeButtonVisible = false;

// ── Glavni entry point ──────────────────────────────────────────────────────

/**
 * Inicijalizuje igru i startuje loop.
 * Poziva se jednom kad se DOM učita.
 */
export function init() {
  // Učitaj save ili kreiraj svježe stanje
  state = loadState() || createInitialState();

  // Resetuj timestamp aktivnosti da se degradacija ne aktivira odmah
  state.lastActivityTime = Date.now();

  // Inicijalizuj renderer (Canvas)
  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    initRenderer(canvas);
  }

  // Inicijalizuj UI i prikaži početno stanje
  initUI(state);
  renderUpgradePanel(state, handleUpgradeBuy);

  // Inicijalizuj input handlere
  initInput(state, handleBarrelClick, handleUpgradeBuy);

  // Audio inicijalizacija (AudioContext se kreira na prvi klik)
  initAudio();

  // Pokreni loop
  startLoop();
}

// ── Game Loop ───────────────────────────────────────────────────────────────

/**
 * Startuje requestAnimationFrame petlju.
 */
export function startLoop() {
  lastFrameTime = performance.now();
  requestAnimationFrame(loopFrame);
}

/**
 * Jedan frame game loop-a.
 * @param {number} timestamp — performance.now() od rAF
 */
function loopFrame(timestamp) {
  requestAnimationFrame(loopFrame);

  if (paused) return;

  // Delta time — cap na 250ms da ne eksplodira posle tab switch
  let dt = (timestamp - lastFrameTime) / 1000; // sekunde
  if (dt > CONFIG.DELTA_CAP_MS / 1000) dt = CONFIG.DELTA_CAP_MS / 1000;
  lastFrameTime = timestamp;

  const dtMs = dt * 1000;
  const now = Date.now();

  // ── Tick sistemi ─────────────────────────────────────────────────────────
  const wasDegraded = state.isDegraded;
  tickFermentation(state, dt);
  checkDegradation(state, now);
  if (!wasDegraded && state.isDegraded) playDegradationWarning();
  setFermentRate(state.fermentRate);

  // ── M1 Termofilni Kvasac: reset stack na >10s pauzu ──────────────────────
  if (state.activeMutations.includes('M1')) {
    tickThermoMutation(state, now);
  }

  // ── Auto-klik za Auto-Ferment I (svakih 3s) ───────────────────────────────
  if ((state.upgrades['auto_ferment_1'] || 0) > 0) {
    autoClick1Accumulator += dtMs;
    if (autoClick1Accumulator >= CONFIG.AUTO_FERMENT_1_INTERVAL) {
      autoClick1Accumulator -= CONFIG.AUTO_FERMENT_1_INTERVAL;
      performAutoClick();
    }
  }

  // ── Auto-klik za Auto-Ferment II (svakih 1s) ──────────────────────────────
  if ((state.upgrades['auto_ferment_2'] || 0) > 0) {
    autoClick2Accumulator += dtMs;
    if (autoClick2Accumulator >= CONFIG.AUTO_FERMENT_2_INTERVAL) {
      autoClick2Accumulator -= CONFIG.AUTO_FERMENT_2_INTERVAL;
      performAutoClick();
    }
  }

  // ── Prestiže dugme prikaz/sakrivanje ──────────────────────────────────────
  const canP = canPrestige(state);
  if (canP && !prestigeButtonVisible) {
    prestigeButtonVisible = true;
    showPrestigeButton(handlePrestigeClick);
  } else if (!canP && prestigeButtonVisible) {
    prestigeButtonVisible = false;
    hidePrestigeButton();
  }

  // ── UI throttle — osvežavamo HUD svakih 100ms ─────────────────────────────
  uiAccumulator += dtMs;
  if (uiAccumulator >= CONFIG.UI_UPDATE_INTERVAL) {
    uiAccumulator -= CONFIG.UI_UPDATE_INTERVAL;
    updateHUD(state);
    renderUpgradePanel(state, handleUpgradeBuy);
  }

  // ── Autosave throttle ─────────────────────────────────────────────────────
  autosaveAccumulator += dtMs;
  if (autosaveAccumulator >= CONFIG.AUTOSAVE_INTERVAL) {
    autosaveAccumulator -= CONFIG.AUTOSAVE_INTERVAL;
    state.totalTime += CONFIG.AUTOSAVE_INTERVAL / 1000;
    saveState(state);
  }
}

// ── Event Handlers ──────────────────────────────────────────────────────────

/**
 * Handler kad igrač klikne na bure.
 * @param {MouseEvent|TouchEvent} [event]
 */
export function handleBarrelClick(event) {
  if (paused) return;

  // Osiguraj da je AudioContext resume-ovan (Chrome zahteva user gesture)
  initAudio();

  const now = Date.now();
  state.lastActivityTime = now;

  // Oporavak od degradacije pri aktivnosti
  if (state.isDegraded) {
    state.isDegraded = false;
    state.degradationFactor = 1.0;
    computeDerivedStats(state);
  }

  // M1 Termofilni Kvasac: beleži klik za stack akumulaciju
  if (state.activeMutations.includes('M1')) {
    recordThermoClick(state, now);
  }

  let gained = state.clickPower;

  // M3 Sporo Sazrevanje: 20% šansa za +5 FJ instant umesto +SJ
  if (state.activeMutations.includes('M3') && Math.random() < 0.2) {
    state.fj += 5;
    // Vizuelni feedback — bure pulse
    const barrelEl = document.getElementById('barrel');
    if (barrelEl) pulseBarrel(barrelEl);
    return;
  }

  // Normalan klik — dodaj SJ (ne preko kapaciteta)
  state.sj = Math.min(state.sj + gained, CONFIG.SJ_CAPACITY);

  // Audio + vizuelni feedback
  playClickSound();
  const barrelEl = document.getElementById('barrel');
  if (barrelEl) pulseBarrel(barrelEl);

  // Spawn bubble efekt na mestu klika
  if (event) {
    const x = event.clientX || (event.touches && event.touches[0] && event.touches[0].clientX) || 0;
    const y = event.clientY || (event.touches && event.touches[0] && event.touches[0].clientY) || 0;
    spawnBubbles(x, y, 3);
  }
}

/**
 * Handler za kupovinu upgrade-a.
 * @param {string} upgradeId
 */
export function handleUpgradeBuy(upgradeId) {
  if (paused) return;

  const prevLevel = state.upgrades[upgradeId] || 0;
  buyUpgrade(state, upgradeId);
  const newLevel = state.upgrades[upgradeId] || 0;

  if (newLevel > prevLevel) {
    // Uspešna kupovina — obeležimo aktivnost
    state.lastActivityTime = Date.now();

    // Refresh upgrade panela da prikaže novu cenu i nivo
    renderUpgradePanel(state, handleUpgradeBuy);
  }
}

/**
 * Handler za pritisak Prestiže dugmeta.
 */
function handlePrestigeClick() {
  if (paused) return;
  if (!canPrestige(state)) return;

  // Dobij 3 random opcije mutacija (filtrirane na one koje igrač nema)
  const options = getRandomMutationOptions(state);

  if (options.length === 0) {
    // Nema dostupnih mutacija — obavi prestiže bez izbora
    executePrestige(null);
    return;
  }

  // Prikaži modal za izbor mutacije
  showMutationModal(options, (selectedMutationId) => {
    executePrestige(selectedMutationId);
  });
}

/**
 * Izvršava prestiže sa izabranom mutacijom.
 * @param {string|null} mutationId
 */
function executePrestige(mutationId) {
  paused = true;
  prestigeButtonVisible = false;
  hidePrestigeButton();

  // Audio prestiže zvuk + particle explosion animacija
  playPrestigeSound();
  const canvas = document.getElementById('game-canvas');
  triggerPrestigeExplosion(canvas, () => {
    // Posle animacije — obavi prestiže reset
    doPrestige(state, mutationId);

    // Rekalkuliši stats posle reseta
    computeDerivedStats(state);

    // Osvježi UI
    renderUpgradePanel(state, handleUpgradeBuy);
    updateHUD(state);

    // Provjeri win state
    if (checkWinState(state)) {
      paused = true;
      saveState(state);
      showWinScreen(state);
      return;
    }

    // Resetuj auto-klik akumulatore da nema burst-a posle prestiže
    autoClick1Accumulator = 0;
    autoClick2Accumulator = 0;

    paused = false;
  });
}

/**
 * Auto-klik (iz Auto-Ferment I / II) — dodaje SJ bez vizuelnih efekata.
 */
function performAutoClick() {
  if (paused) return;

  state.sj = Math.min(state.sj + state.clickPower, CONFIG.SJ_CAPACITY);
}

// ── M1 Termofilni Kvasac helpers ────────────────────────────────────────────

/**
 * Beleži klik za M1 stack mehaniku.
 * @param {GameState} state
 * @param {number} now — Date.now()
 */
function recordThermoClick(state, now) {
  state.mutationState.thermoLastClickTime = now;
}

/**
 * Tik za M1 — provjeri da li je prošlo >10s bez klika (reset stack),
 * ili akumuliraj vreme za dupliranje.
 * @param {GameState} state
 * @param {number} now — Date.now()
 */
function tickThermoMutation(state, now) {
  const ms = state.mutationState;
  if (ms.thermoLastClickTime === 0) return;

  const secSinceClick = (now - ms.thermoLastClickTime) / 1000;

  if (secSinceClick > CONFIG.THERMO_RESET_PAUSE) {
    // Pauza > 10s — resetuj stack
    if (ms.thermoClickStack > 1) {
      ms.thermoClickStack = 1;
      ms.thermoActiveSeconds = 0;
      computeDerivedStats(state);
    }
    return;
  }

  // Aktivni klik: akumuliraj vreme (koristimo dt ali ovde koristimo real time diff)
  // Stack se penje na svakih THERMO_STACK_INTERVAL sekundi aktivnosti
  // "Aktivno" = nije pauza. Aproksimacija: dok je secSinceClick < 10, poslednji klik je bio skoro.
  // Main loop poziva ovu funkciju svaki frame, ali samo dok je aktivnost prisutna.
  // Pratimo vreme na osnovu lastFrameTime da akumuliramo prave sekunde.
  // Koristimo dt koji se prenosi kroz globalnu varijablu — ali to komplikuje API.
  // Umesto toga: gledamo thermoLastClickTime kao "kliker je aktivan" signal.
  // Svaki frame dok je secSinceClick < 10, igrač se smatra aktivnim.
  // Nema direktnog dt-a ovde, ali ga dobijamo iz loop-a posrednim putem.
  // Rešenje: pratimo ukupne sekunde u aktivnoj sesiji koristeći gameloop lastFrameTime.
  // Za sada: stack se povećava kad thermoActiveSeconds pređe interval.
  // Pozivamo iz loop-a sa dt, ali ovde koristimo approximation:
  // Svaki put kad smo "aktivni" (secSinceClick < resetPause), dodajemo mali inkrement.
  // NOTA: Ova funkcija je pozivana ~60puta/s, pa 1/60 ≈ 0.0167s po pozivu.
  // Koristimo 1/60 kao aproksimacioni dt.
  const approxDt = 1 / 60;
  ms.thermoActiveSeconds += approxDt;

  if (ms.thermoActiveSeconds >= CONFIG.THERMO_STACK_INTERVAL * ms.thermoClickStack) {
    if (ms.thermoClickStack < CONFIG.THERMO_MAX_STACK) {
      ms.thermoClickStack = Math.min(ms.thermoClickStack + 1, CONFIG.THERMO_MAX_STACK);
      computeDerivedStats(state);
    }
  }
}

// ── DOM ready ───────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
