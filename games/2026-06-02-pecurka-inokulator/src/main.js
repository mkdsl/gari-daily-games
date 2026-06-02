// main.js — entry point, game loop, wire svih modula
import { CONFIG } from './config.js';
import { initialState, saveHighscore } from './state.js';
import { createBagsForLevel } from './entities/bag.js';
import { TimingManager } from './timing.js';
import { initInput } from './input.js';
import { checkClick } from './systems/collision.js';
import {
  calcHitScore,
  calcPerfectBonus,
  isLevelComplete,
  advanceLevel,
  isGameWon,
} from './systems/progression.js';
import { render, triggerScreenShake } from './render.js';
import { UI } from './ui.js';
import {
  initAudio,
  playTick,
  playHit,
  playFail,
  playGoldenHit,
  playStreakActivation,
  playLevelClear,
  playGameOver,
} from './audio.js';
import { GUNCATI_FACTS_GAMEOVER, GUNCATI_FACTS_LEVELCLEAR, getRandomFact } from './content/facts.js';
import { shareScore } from './share.js';

// ─── Canvas setup ─────────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

canvas.width  = CONFIG.CANVAS_W;
canvas.height = CONFIG.CANVAS_H;

// CSS skaliranje: canvas je logički 480×640, skira se na ekran
function resizeCanvas() {
  const maxW  = window.innerWidth;
  const maxH  = window.innerHeight;
  const ratio = CONFIG.CANVAS_W / CONFIG.CANVAS_H;

  let cssW = maxW;
  let cssH = cssW / ratio;
  if (cssH > maxH) {
    cssH = maxH;
    cssW = cssH * ratio;
  }

  canvas.style.width   = `${cssW}px`;
  canvas.style.height  = `${cssH}px`;
  canvas.style.left    = `${(maxW - cssW) / 2}px`;
  canvas.style.top     = `${(maxH - cssH) / 2}px`;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── Moduli ───────────────────────────────────────────────────────────────

let state        = initialState();
const timing     = new TimingManager();
const ui         = new UI();
let lastTime     = 0;
let inputCleanup = null;
let audioReady   = false;

// Score popups (floating +NNN animacije)
state.scorePopups = [];

// ─── Audio init (lazy — čeka user gesture) ───────────────────────────────

async function ensureAudio() {
  if (audioReady) return;
  try {
    await initAudio();
    audioReady = true;
  } catch {
    // Web Audio nije dostupan (SSR, stari browser) — tiho preskačemo
  }
}

// ─── Score popup helper ───────────────────────────────────────────────────

function spawnScorePopup(score, x, y, isGolden) {
  if (!state.scorePopups) state.scorePopups = [];
  state.scorePopups.push({
    score,
    x,
    y,
    alpha:    1.0,
    vy:       -0.9,        // px/ms
    fontSize: isGolden ? 18 : 14,
    isGolden,
    life:     700,         // ms ukupno
  });
}

function updateScorePopups(dt) {
  if (!state.scorePopups) return;
  for (const sp of state.scorePopups) {
    sp.life  -= dt;
    sp.y     += sp.vy * dt;
    sp.alpha  = Math.max(0, sp.life / 700);
  }
  // Čisti istrošene
  state.scorePopups = state.scorePopups.filter(sp => sp.life > 0);
}

// ─── Level init ───────────────────────────────────────────────────────────

function startLevel() {
  const levelCfg = CONFIG.LEVELS[state.level - 1];

  state.bags           = createBagsForLevel(levelCfg, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
  state.activeBagIndex = 0;
  state.levelScore     = 0;
  state.missCount      = 0;
  state.scorePopups    = [];

  // Timing manager — deterministički seed na first run
  timing.reset(levelCfg, !state.firstRunDone);

  state.screen = 'playing';

  // Tutorial na nivou 1 ako još nije viđen
  if (!state.tutorialSeen && state.level === 1) {
    ui.showTutorial(() => {
      state.tutorialSeen = true;
      localStorage.setItem(CONFIG.LS_TUTORIAL, '1');
    });
  }
}

// ─── Input handler ────────────────────────────────────────────────────────

function handleAction(normX) {
  ensureAudio();

  // Klik na start ekranu → startuje igru
  if (state.screen === 'start') {
    ui.hideMenu();
    startLevel();
    return;
  }

  if (state.screen !== 'playing') return;

  const levelCfg   = CONFIG.LEVELS[state.level - 1];
  const timingState = timing.getState();
  const result      = checkClick(normX, timingState);

  const activeBag = state.bags[state.activeBagIndex];
  if (!activeBag) return; // sve vreće gotove — ignoriši klik

  // ── Greška (fake zona ili miss) ───────────────────────────────────────
  if (!result.hit) {
    state.lives--;
    state.streak = 0;
    state.missCount++;
    state.lastHitType = result.type;

    activeBag.startAnim('fail', 400);
    triggerScreenShake(canvas);

    if (audioReady) playFail();

    if (state.lives <= 0) {
      // Malo kašnjenje da se vidi fail animacija
      setTimeout(gameOver, 450);
      return;
    }
    return;
  }

  // ── Pogodak ───────────────────────────────────────────────────────────
  state.streak++;
  if (state.streak > state.bestCombo) state.bestCombo = state.streak;

  const scoreGain    = calcHitScore(levelCfg, result.type, state.streak);
  state.score       += scoreGain;
  state.levelScore  += scoreGain;
  state.lastHitType  = result.type;

  activeBag.inoculationsDone++;
  activeBag.startAnim('success', 500);

  // Score popup iznad vreće
  spawnScorePopup(
    scoreGain,
    activeBag.x,
    activeBag.y - activeBag.height / 2 - 10,
    result.type === 'golden'
  );

  if (audioReady) {
    if (result.type === 'golden') {
      playGoldenHit();
    } else {
      playHit();
    }
    if (
      state.streak === CONFIG.STREAK_MULTIPLIER.threshold1 ||
      state.streak === CONFIG.STREAK_MULTIPLIER.threshold2
    ) {
      playStreakActivation();
    }
  }

  // ── Prelaz na sljedeću vreću / level clear ───────────────────────────
  if (activeBag.inoculationsDone >= activeBag.inoculationsNeeded) {
    activeBag.status = 'inoculated';
    state.activeBagIndex++;

    // Aktiviraj sljedeću vreću u sekvenci
    if (state.activeBagIndex < state.bags.length) {
      state.bags[state.activeBagIndex].status = 'active';
    }

    if (isLevelComplete(state)) {
      // Malo kašnjenje da se vidi success animacija
      setTimeout(levelClear, 550);
    }
  }
}

// ─── Level clear ─────────────────────────────────────────────────────────

function levelClear() {
  const levelCfg = CONFIG.LEVELS[state.level - 1];

  // Perfect bonus ako nema grešaka
  if (state.missCount === 0) {
    const bonus      = calcPerfectBonus(levelCfg);
    state.score     += bonus;
    state.levelScore += bonus;
  }

  if (audioReady) playLevelClear();

  const fact = getRandomFact(GUNCATI_FACTS_LEVELCLEAR, state.factIndex);
  state.factIndex++;

  // Mark first run kao done
  if (!state.firstRunDone) {
    state.firstRunDone = true;
    localStorage.setItem(CONFIG.LS_FIRSTRUN, '1');
  }

  if (isGameWon(state)) {
    state.gameWon = true;
    gameOver();
    return;
  }

  state.screen = 'levelclear';
  ui.showLevelClear(state.level, state.levelScore, fact, () => {
    advanceLevel(state);
    startLevel();
  });
}

// ─── Game over ────────────────────────────────────────────────────────────

function gameOver() {
  saveHighscore(state);
  if (audioReady) playGameOver();

  state.screen = 'gameover';

  const fact = getRandomFact(GUNCATI_FACTS_GAMEOVER, state.factIndex);

  ui.showGameOver(
    state.score,
    state.bestCombo,
    state.level,
    state.highscore,
    fact,
    state.gameWon,
    () => {
      // Restart
      state        = initialState();
      state.scorePopups = [];
      showStart();
    },
    () => shareScore(state.score, state.level)
  );
}

// ─── Start screen ────────────────────────────────────────────────────────

function showStart() {
  state.screen = 'start';
  ui.showStartScreen(state.highscore);
}

// ─── Game loop ────────────────────────────────────────────────────────────

function gameLoop(timestamp) {
  const dt = Math.min(timestamp - lastTime, 50); // cap na 50ms (tab blur)
  lastTime  = timestamp;

  if (state.screen === 'playing') {
    const { tick } = timing.update(dt);

    if (tick && audioReady) {
      playTick(CONFIG.LEVELS[state.level - 1].speed);
    }

    // Bag animacije
    for (const bag of state.bags) {
      bag.update(dt);
    }

    // Score popup animacije
    updateScorePopups(dt);
  }

  // Render
  const timingState = timing.getState();
  render(ctx, state, timingState, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  // HUD (DOM)
  ui.updateHUD(state.score, state.lives, state.level, state.streak);

  requestAnimationFrame(gameLoop);
}

// ─── Init ────────────────────────────────────────────────────────────────

inputCleanup = initInput(canvas, handleAction);
showStart();

requestAnimationFrame(ts => {
  lastTime = ts;
  requestAnimationFrame(gameLoop);
});
