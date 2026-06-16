/**
 * Park Mapa — MKDSLend Ambient Persistent Experience
 * Main bootstrap: initializes all systems, wires event bus, runs game loop.
 * @module main
 */

import { CONFIG } from './config.js';
import { createInitialState, createEventBus } from './state.js';
import { initRenderer, renderFrame, resizeCanvas } from './render.js';
import { initInput } from './input.js';
import { initUI, renderHUD, showFlavorScreen, showToast, updatePTDisplay, showUpgradeModal } from './ui.js';
import { initAudio, resumeAudio, startAmbient, playEggSound, playZoneActivation, playLevelUp, playClosureFanfare, playPTEarn, playUIClick, isAudioReady } from './audio.js';

// Systems
import { saveGame, loadGame } from './systems/savegame.js';
import { earnPT, checkAndResetWeeklyBudget } from './systems/economy.js';
import { initDailyLightForToday, isDailyLightComplete, completeDailyLight } from './systems/daily-light.js';
import { getDailyEggsState, collectEgg, checkEggClick } from './systems/easter-eggs.js';
import { initZoneUIStates, getZoneAtPoint, isActiveZone, canCheckIn, checkInZone, getZoneCooldownRemaining, formatCooldownRemaining, upgradeZone, ZONE_STATE } from './systems/zone-manager.js';
import { updateNpcMissionProgress, initNpcMissions } from './systems/npc-board.js';
import { updateDailyStreak, getZoneLevelCost, canLevelUpZone } from './systems/progression.js';
import { addEggEntry, addMiniStoryEntry, addZoneMilestone } from './systems/logbook.js';

// UI panels
import { showSplash, hideSplash } from './ui/splash.js';
import { showClosure, isClosureShown } from './ui/closure.js';
import { openLogbook, closeLogbook, isLogbookOpen, toggleLogbook } from './ui/logbook-panel.js';
import { openNpcPanel, closeNpcPanel, isNpcPanelOpen, toggleNpcPanel, renderNpcPanel } from './ui/npc-panel.js';
import { initSeasonSkin } from './ui/season-skin.js';
import { initCursorManager, updateCursorForContext, resetCursor } from './ui/cursor-manager.js';

// Zone content
import { setSetlistData } from './zones/bina.js';
import { fetchSetlist } from './content/bina-setlist-loader.js';

// ─── State ────────────────────────────────────────────────────────────────────
let state = null;
let bus = null;
let canvas = null;
let ctx = null;
let animFrameId = null;
let hoverZone = null;
let saveTimer = 0;
let ptEarnedToday = 0;

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function init() {
  // 1. Load or create state
  const saved = loadGame();
  if (saved) {
    state = saved;
  } else {
    state = createInitialState();
  }

  // 2. Create event bus
  bus = createEventBus();

  // 3. Wire event handlers
  wireEvents();

  // 4. Setup canvas
  canvas = document.getElementById('game-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    document.getElementById('game-root')?.appendChild(canvas);
  }
  ctx = canvas.getContext('2d');
  initRenderer(canvas);

  // 5. Init systems
  initZoneUIStates();
  initDailyLightForToday(state);
  initNpcMissions(state);
  checkAndResetWeeklyBudget(state);
  updateDailyStreak(state);

  // 6. Init season skin
  initSeasonSkin(state);

  // 7. Init UI
  const root = document.getElementById('game-root') || document.body;
  initUI(root, state, bus.emit.bind(bus));
  renderHUD(state, bus.emit.bind(bus));

  // 8. Init cursor manager
  initCursorManager(canvas);

  // 9. Init input
  initInput(canvas, {
    onMove: handlePointerMove,
    onClick: handleClick,
    onDown: null,
    onUp: null,
    onLeave: () => { hoverZone = null; resetCursor(); }
  });

  // 10. Load setlist data asynchronously
  fetchSetlist().then(data => {
    if (data) setSetlistData(data);
  });

  // 11. Show daily splash (first interaction of the day)
  setTimeout(() => showSplash(state), 400);

  // 12. Start game loop
  startGameLoop();

  // 13. Auto-save interval
  setInterval(() => {
    saveGame(state);
  }, CONFIG.SAVE_INTERVAL_SEC * 1000);

  // Save on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveGame(state);
  });
  window.addEventListener('beforeunload', () => saveGame(state));

  // Init audio on first click
  document.addEventListener('click', () => {
    if (!isAudioReady()) {
      initAudio();
      startAmbient();
    } else {
      resumeAudio();
    }
  }, { once: true });
}

// ─── Event Bus Wiring ────────────────────────────────────────────────────────
function wireEvents() {
  // Toggle panels
  bus.on('toggleLogbook', () => toggleLogbook(state));
  bus.on('toggleNpc', () => {
    if (isNpcPanelOpen()) closeNpcPanel();
    else openNpcPanel(state, bus.emit.bind(bus));
  });
  bus.on('toggleAudio', () => {
    if (isAudioReady()) {
      // Toggle mute (simple: just log for now, could add full mute)
      showToast('Audio aktivan', 'info');
    } else {
      initAudio();
      startAmbient();
      showToast('Audio uključen', 'success');
    }
  });

  // PT earned
  bus.on('ptEarned', ({ amount, reason }) => {
    ptEarnedToday += amount;
    updatePTDisplay(state.pt);
    renderHUD(state, bus.emit.bind(bus));
  });

  // Zone check-in
  bus.on('zoneCheckin', ({ zoneId, ptReward, isDailyLight, storiesUnlocked }) => {
    playZoneActivation(zoneId);
    playPTEarn();

    // Update NPC missions
    updateNpcMissionProgress(state, 'zoneCheckin', { zoneId });
    if (isDailyLight) {
      updateNpcMissionProgress(state, 'dailyLightCheckin', { zoneId });
      completeDailyLight(state, bus.emit.bind(bus));
    }

    // Add logbook entries for newly unlocked stories
    if (storiesUnlocked > 0) {
      addMiniStoryEntry(state, zoneId, storiesUnlocked - 1, getStoryText(zoneId, storiesUnlocked - 1));
    }

    showToast(`+${ptReward} PT — Check-in ${CONFIG.ZONE_DISPLAY_NAMES?.[zoneId] || zoneId}${isDailyLight ? ' ⭐' : ''}`, 'pt');
    renderHUD(state, bus.emit.bind(bus));
    checkDailyCompletion();
  });

  // Egg collected
  bus.on('eggCollected', ({ egg, ptValue }) => {
    playEggSound();
    playPTEarn();
    ptEarnedToday += ptValue;

    // Add to logbook (first time seeing this egg type)
    addEggEntry(state, egg);

    // Update Mara's NPC mission
    updateNpcMissionProgress(state, 'eggCollected', {});

    showToast(`+${ptValue} PT — ${egg.type.name}`, 'egg');
    updatePTDisplay(state.pt);
    renderHUD(state, bus.emit.bind(bus));
    checkDailyCompletion();
  });

  // Zone upgraded
  bus.on('zoneUpgraded', ({ zoneId, newLevel, cost }) => {
    playLevelUp();
    addZoneMilestone(state, zoneId, newLevel);
    updateNpcMissionProgress(state, 'ptSpent', { amount: cost });
    showToast(`${CONFIG.ZONE_DISPLAY_NAMES?.[zoneId] || zoneId} → Lv${newLevel}!`, 'success');
    renderHUD(state, bus.emit.bind(bus));
  });

  // Daily light complete
  bus.on('dailyLightComplete', () => {
    showToast('Dnevno Svetlo završeno! +10 PT bonus', 'success');
    renderHUD(state, bus.emit.bind(bus));
  });

  // NPC reward claimed
  bus.on('npcRewardClaimed', ({ npcId, reward }) => {
    playPTEarn();
    ptEarnedToday += reward;
    updateNpcMissionProgress(state, 'ptSpent', { amount: 0 }); // no spend, just track
    showToast(`NPC nagrada: +${reward} PT`, 'pt');
    updatePTDisplay(state.pt);
    renderHUD(state, bus.emit.bind(bus));
    // Re-render NPC panel if open
    if (isNpcPanelOpen()) renderNpcPanel(state, bus.emit.bind(bus));
  });

  // Prestige hint (disabled in V0.3)
  bus.on('prestigeHint', () => {
    showToast('Prestige dolazi u Sezoni 2!', 'info', 3000);
  });

  // Flavor dismissed
  bus.on('flavorDismissed', ({ zoneId }) => {
    // No-op, game continues
  });

  // Closure dismissed
  bus.on('closureDismissed', () => {
    showToast('Vidimo se sutra!', 'info');
  });
}

// ─── Input Handlers ──────────────────────────────────────────────────────────
function handlePointerMove(pos) {
  // Detect hover zone
  const zone = getZoneAtPoint(pos.x, pos.y, canvas.width, canvas.height);

  if (zone !== hoverZone) {
    hoverZone = zone;

    // Update cursor
    if (zone) {
      updateCursorForContext({
        zone,
        isLocked: !isActiveZone(zone),
        isEgg: false,
        isButton: false
      });
    } else {
      resetCursor();
    }
  }

  // Check if hovering over egg (override cursor)
  const today = new Date().toISOString().slice(0, 10);
  const eggs = getDailyEggsState(state, today);
  const egg = checkEggClick(eggs, pos.x, pos.y);
  if (egg) {
    updateCursorForContext({ zone: null, isLocked: false, isEgg: true, isButton: false });
  }
}

function handleClick(pos) {
  // Resume audio on click
  if (isAudioReady()) resumeAudio();

  // Check egg clicks first (highest priority)
  const today = new Date().toISOString().slice(0, 10);
  const eggs = getDailyEggsState(state, today);
  const egg = checkEggClick(eggs, pos.x, pos.y);
  if (egg) {
    const ptEarned = collectEgg(state, egg.id, today, bus.emit.bind(bus));
    if (ptEarned > 0) {
      earnPT(state, ptEarned, 'egg');
      bus.emit('ptEarned', { amount: ptEarned, reason: 'egg' });
      saveGame(state);
    }
    return;
  }

  // Check zone clicks
  const zone = getZoneAtPoint(pos.x, pos.y, canvas.width, canvas.height);
  if (!zone) return;

  if (!isActiveZone(zone)) {
    showToast(`${CONFIG.ZONE_DISPLAY_NAMES?.[zone] || zone} — U izgradnji...`, 'info');
    return;
  }

  // Active zone: check if can check in
  const today2 = new Date().toISOString().slice(0, 10);
  const dlZone = state.dailyLight?.zone;

  if (canCheckIn(state, zone)) {
    // Perform check-in
    const result = checkInZone(state, zone, dlZone, bus.emit.bind(bus));
    if (result) {
      earnPT(state, result.ptReward, `checkin_${zone}`);
      bus.emit('ptEarned', { amount: result.ptReward, reason: `checkin_${zone}` });
      showFlavorScreen(state, zone, result.ptReward, bus.emit.bind(bus));
      saveGame(state);
    }
  } else {
    // Show cooldown info and upgrade option
    const remaining = getZoneCooldownRemaining(state, zone);
    if (remaining > 0) {
      showToast(`${CONFIG.ZONE_DISPLAY_NAMES?.[zone] || zone}: CD ${formatCooldownRemaining(remaining)}`, 'info');
    }

    // Show upgrade modal if affordable
    if (canLevelUpZone(state, zone)) {
      const cost = getZoneLevelCost(state.zones[zone]?.level || 1);
      showUpgradeModal(state, zone, cost, () => {
        const success = upgradeZone(state, zone, bus.emit.bind(bus));
        if (success) saveGame(state);
      });
    }
  }
}

// ─── Game Loop ───────────────────────────────────────────────────────────────
function startGameLoop() {
  function loop(ts) {
    animFrameId = requestAnimationFrame(loop);

    if (ctx && canvas) {
      renderFrame(canvas, ctx, state, hoverZone, ts);
    }
  }
  animFrameId = requestAnimationFrame(loop);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStoryText(zoneId, index) {
  const stories = {
    pult: [
      'Ovde je počelo sve. Jedan miks, tri seta, puno ljudi koji nisu znali za šta su došli.',
      'Rekli su da neon ne gori kad je mokro. Grešili su. Pult svetli i kad kiša pada.',
      'DJevi dolaze i odlaze. Pult ostaje. Stara škola kaže: šank je svedok.',
      'Neko je zaboravio torbicu pod barom. Unutra: trakasti rekorder i kaseta bez natpisa.',
      'Poslednji set te noći trajao je 4 sata. Niko nije otišao kući.'
    ],
    bina: [
      'Bina je prazna u jutro. Ali zvuk koji ostane — taj ostane danima.',
      'Avala čeka. Šuma iza bine pamti svakog ko je stajao tamo pre tebe.',
      'Setlist se nikad ne zna unapred. To je tajna. Znaju samo oni koji su bili tu.',
      'Zvučni sistem se proverava u podne. Proba u 18. Show u 21. Sve je ritual.',
      'Jedan ton u Avala šumi putuje drugačije. Biolozi bi rekli akustika. Mi kažemo magija.'
    ],
    suma: [
      'Mara kaže: ako slušaš šumu dovoljno dugo, čuješ frekvencije koje se ne snimaju.',
      'Stari puteljak je zatravao. Ispod njega su stari koreni koji pamte drugačije vreme.',
      'Bioluminiscencija nije samo efekt. To je jezik koji gljive pričaju u mraku.',
      'Đorđe je ovde posadio prve biljke. Kaže: sve počinje u šumi, sve se i vraća tu.',
      'Noć u šumi nije crna. Noć u šumi ima 47 nijansi zelene.'
    ]
  };
  return stories[zoneId]?.[index] || '';
}

function checkDailyCompletion() {
  // Check if all 7 eggs collected AND all zones checked in today
  const today = new Date().toISOString().slice(0, 10);
  const eggs = getDailyEggsState(state, today);
  const allEggsCollected = eggs.every(e => e.collected);

  const zonesCheckedIn = CONFIG.ACTIVE_ZONES.every(z => {
    const zone = state.zones[z];
    if (!zone?.lastCheckin) return false;
    const d = new Date(zone.lastCheckin);
    return d.toISOString().slice(0, 10) === today;
  });

  if (allEggsCollected && zonesCheckedIn && !isClosureShown()) {
    // Add daily closure PT
    earnPT(state, CONFIG.PT_REWARDS.DAILY_CLOSURE, 'daily_closure');
    ptEarnedToday += CONFIG.PT_REWARDS.DAILY_CLOSURE;
    playClosureFanfare();
    setTimeout(() => showClosure(ptEarnedToday, bus.emit.bind(bus)), 1000);
    saveGame(state);
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────
init().catch(err => {
  console.error('[ParkMapa] Init failed:', err);
  // Show error to user
  const root = document.getElementById('game-root') || document.body;
  root.innerHTML = `
    <div style="padding: 40px; font-family: monospace; color: #ff4444; background: #0D1B2A; min-height: 100vh;">
      <h2>Park Mapa — Init Error</h2>
      <pre>${err.message}\n${err.stack}</pre>
    </div>
  `;
});
