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
  // TODO: implementiraj
  // hud.innerHTML = `
  //   <div id="hud-hp" class="hud-block">♥♥♥</div>
  //   <div id="hud-score" class="hud-block">Score: 0</div>
  //   <div id="hud-level" class="hud-block">Lvl 1</div>
  //   <div id="hud-miss" class="hud-block miss-counter"></div>
  // `;
}

/**
 * Ažurira HUD svaki frame — HP srca, score, level, miss counter.
 * Poziva se iz main.js loop-a.
 *
 * @param {import('./state.js').GameState} state
 */
export function updateHUD(state) {
  // TODO: implementiraj
  // if (state.screen !== 'playing') return;
  //
  // // HP prikaz: ♥ za pun, ♡ za prazan (do HP_MAX)
  // const hpEl = document.getElementById('hud-hp');
  // if (hpEl) {
  //   hpEl.textContent = '♥'.repeat(state.hp) + '♡'.repeat(CONFIG.HP_MAX - state.hp);
  // }
  //
  // const scoreEl = document.getElementById('hud-score');
  // if (scoreEl) scoreEl.textContent = `Score: ${state.score}`;
  //
  // const levelEl = document.getElementById('hud-level');
  // if (levelEl) levelEl.textContent = `Lvl ${state.level}`;
  //
  // // Miss counter: prikaži X za svaki miss, puno 3 = game over
  // const missEl = document.getElementById('hud-miss');
  // if (missEl) {
  //   missEl.textContent = state.missCount > 0 ? `✕`.repeat(state.missCount) : '';
  //   missEl.classList.toggle('danger', state.missCount >= 2);
  // }
}

/**
 * Prikazuje main menu overlay.
 * Sadrži: naslov "PULSE RUNNER", PB iz state.highScore, PLAY dugme.
 *
 * @param {import('./state.js').GameState} state
 * @param {function(): void} onPlay - Callback za PLAY dugme
 */
export function showMainMenu(state, onPlay) {
  // TODO: implementiraj
  // menu.classList.remove('hidden');
  // menu.innerHTML = `
  //   <h1 class="game-title">PULSE RUNNER</h1>
  //   <p class="subtitle">Kreći se samo na kucaj srca</p>
  //   ${state.highScore > 0 ? `<p class="pb">Personal best: ${state.highScore}</p>` : ''}
  //   <button id="btn-play" class="btn-primary">PLAY</button>
  //   <p class="controls-hint">← → ↑ ↓ ili swipe</p>
  // `;
  // document.getElementById('btn-play').addEventListener('click', () => {
  //   hideOverlay();
  //   onPlay?.();
  // });
}

/**
 * Prikazuje game over overlay.
 * Sadrži: "GAME OVER", depth (nivo do kog je stigao), score, PB,
 * oznaku "NEW RECORD!" ako je novi PB, RESTART dugme.
 *
 * @param {import('./state.js').GameState} state
 * @param {function(): void} onRestart - Callback za RESTART dugme
 */
export function showGameOver(state, onRestart) {
  // TODO: implementiraj
  // const isNewPB = state.score >= state.highScore && state.score > 0;
  // menu.classList.remove('hidden');
  // menu.innerHTML = `
  //   <h2 class="game-over-title">GAME OVER</h2>
  //   ${isNewPB ? '<p class="new-record">★ NEW RECORD!</p>' : ''}
  //   <div class="stats-grid">
  //     <span>Depth</span><span>${state.depth}</span>
  //     <span>Score</span><span>${state.score}</span>
  //     <span>Best</span><span>${state.highScore}</span>
  //   </div>
  //   <button id="btn-restart" class="btn-primary">RESTART</button>
  // `;
  // document.getElementById('btn-restart').addEventListener('click', () => {
  //   hideOverlay();
  //   onRestart?.();
  // });
}

/**
 * Sakriva overlay (#menu) — na početku runa.
 */
export function hideOverlay() {
  // TODO: implementiraj
  // menu.classList.add('hidden');
  // menu.innerHTML = '';
}

/**
 * Triggeruje CSS screen shake animaciju na #game-root.
 * Poziva se iz pulse.js na puls eventu (vizuelni feedback).
 */
export function triggerScreenShake() {
  // TODO: implementiraj
  // const root = document.getElementById('game-root');
  // root.classList.remove('shake');
  // void root.offsetWidth; // force reflow da restart animaciju
  // root.classList.add('shake');
  // root.addEventListener('animationend', () => root.classList.remove('shake'), { once: true });
}
