/**
 * ui.js — DOM-based HUD i overlay ekrani za Pulse Runner.
 *
 * Odgovornosti:
 * - initUI(state, onStartRun): kreira HUD strukturu, vezuje RESTART dugme
 * - updateHUD(state): ažurira HP srca, score, level, miss counter svaki frame
 * - showMainMenu(state): prikazuje main menu overlay sa PLAY dugmetom i PB
 * - showGameOver(state, onRestart): prikazuje game over overlay sa depth/score/PB
 * - hideOverlay(): sakriva overlay (na startu runa)
 *
 * DOM struktura (iz index.html):
 *   #hud       — uvek vidljiv tokom igre (HP, score, level, miss)
 *   #menu      — overlay za main menu i game over
 *
 * NE crta na canvas — to radi render.js.
 * Stilovi su u styles/ui.css.
 */

import { CONFIG } from './config.js';

/** @type {HTMLElement} */
const hud = document.getElementById('hud');

/** @type {HTMLElement} */
const menu = document.getElementById('menu');

/**
 * Inicijalizuje HUD DOM strukturu i overlay event handler-e.
 * Poziva se jednom iz main.js.
 *
 * @param {import('./state.js').GameState} state
 * @param {function(import('./state.js').GameState): void} onStartRun - Callback kad igrač klikne PLAY/RESTART
 */
export function initUI(state, onStartRun) {
  // Kreiraj HUD blokove
  hud.innerHTML = `
    <div id="hud-hp" class="hud-block"></div>
    <div id="hud-score" class="hud-block">Score: 0</div>
    <div id="hud-level" class="hud-block">Lvl 1</div>
    <div id="hud-miss" class="hud-block"></div>
  `;
  // Inicijalni prikaz HP
  _renderHp(state.hp);
}

/**
 * Interno: renderuje HP srca u #hud-hp.
 * @param {number} hp
 */
function _renderHp(hp) {
  const el = document.getElementById('hud-hp');
  if (!el) return;
  el.textContent = '♥'.repeat(hp) + '♡'.repeat(CONFIG.HP_MAX - hp);
}

/**
 * Ažurira HUD svaki frame — HP srca, score, level, miss counter.
 * Poziva se iz main.js loop-a.
 *
 * @param {import('./state.js').GameState} state
 */
export function updateHUD(state) {
  if (state.screen !== 'playing') return;

  // HP prikaz: ♥ za pun, ♡ za prazan (do HP_MAX)
  _renderHp(state.hp);

  const scoreEl = document.getElementById('hud-score');
  if (scoreEl) scoreEl.textContent = `Score: ${state.score}`;

  const levelEl = document.getElementById('hud-level');
  if (levelEl) levelEl.textContent = `Lvl ${state.level}`;

  // Miss counter: ✕ za svaki miss, opasna zona na 2+ miss
  const missEl = document.getElementById('hud-miss');
  if (missEl) {
    missEl.textContent = state.missCount > 0 ? '✕'.repeat(state.missCount) : '';
    missEl.classList.toggle('danger', state.missCount >= 2);
  }
}

/**
 * Prikazuje main menu overlay.
 * Sadrži: naslov "PULSE RUNNER", PB iz state.highScore, PLAY dugme.
 *
 * @param {import('./state.js').GameState} state
 * @param {function(): void} [onPlay] - Callback za PLAY dugme
 */
export function showMainMenu(state, onPlay) {
  menu.classList.remove('hidden');
  menu.innerHTML = `
    <h1 class="game-title">PULSE RUNNER</h1>
    <p class="subtitle">Kreći se samo na kucaj srca</p>
    ${state.highScore > 0 ? `<p class="pb" id="menu-highscore">Personal best: ${state.highScore}</p>` : '<p class="pb" id="menu-highscore"></p>'}
    <button id="start-btn" class="btn-primary">PLAY</button>
    <p class="controls-hint">← → ↑ ↓ ili swipe</p>
  `;
  document.getElementById('start-btn').addEventListener('click', () => {
    hideOverlay();
    onPlay?.();
  });
}

/**
 * Prikazuje game over overlay.
 * Sadrži: "GAME OVER", depth (nivo do kog je stigao), score, PB,
 * oznaku "NEW RECORD!" ako je novi PB, RESTART dugme.
 *
 * @param {import('./state.js').GameState} state
 * @param {function(): void} [onRestart] - Callback za RESTART dugme
 */
export function showGameOver(state, onRestart) {
  const isNewPB = state.score > 0 && state.score >= state.highScore;
  menu.classList.remove('hidden');
  menu.innerHTML = `
    <h2 class="game-over-title">GAME OVER</h2>
    ${isNewPB ? '<p class="new-record">★ NEW RECORD!</p>' : ''}
    <div class="stats-grid">
      <span>Depth</span><span id="gameover-depth">${state.depth}</span>
      <span>Score</span><span id="gameover-score">${state.score}</span>
      <span>Best</span><span id="gameover-pb">${isNewPB ? 'NEW BEST! 🎉' : `Best: ${state.highScore}`}</span>
    </div>
    <button id="restart-btn" class="btn-primary">RESTART</button>
  `;
  document.getElementById('restart-btn').addEventListener('click', () => {
    hideOverlay();
    onRestart?.();
  });
}

/**
 * Sakriva overlay (#menu) — na početku runa.
 */
export function hideOverlay() {
  menu.classList.add('hidden');
  menu.innerHTML = '';
}

/**
 * Triggeruje CSS screen shake animaciju na #game-root.
 * Poziva se iz pulse.js na puls eventu (vizuelni feedback).
 */
export function triggerScreenShake() {
  const root = document.getElementById('game-root');
  if (!root) return;
  // Force reflow da restart animaciju ako je već aktivna
  root.classList.remove('shake');
  void root.offsetWidth;
  root.classList.add('shake');
  root.addEventListener('animationend', () => root.classList.remove('shake'), { once: true });
}
