/**
 * ui.js — HUD i overlay rendering delegat za Mozaik Ludila.
 *
 * NOTA: Svi elementi se crtaju direktno na canvas-u (nema DOM elemenata za HUD).
 * Ovaj modul je odgovoran za:
 *   - Score progress bar ("Restauracija X%")
 *   - Combo tekst i pulse overlay
 *   - Win ekran animacija (tekst se pojavljuje pločicu po pločicu, random boje)
 *   - Game Over ekran (skor, % restauracije, best combo, dugme "Ponovo")
 *   - Fragment zona labeling ("Klikni na grid | R = rotacija" tekst)
 *   - Highscore prikaz
 *
 * Sve draw funkcije primaju (ctx, state, layout) i crtaju direktno.
 * Pozivaju se iz render.js.
 */

import { SCORE_WIN } from './config.js';
import { saveHighScore } from './state.js';

/**
 * Inicijalizuje UI — uklanja stare DOM elemente ako postoje.
 * Poziva se jednom na startu iz main.js.
 */
export function initUI() {
  // Ukloni legacy DOM hud i menu elemente ako postoje (template ostatak)
  const legacyHud = document.getElementById('hud');
  const legacyMenu = document.getElementById('menu');
  if (legacyHud) legacyHud.style.display = 'none';
  if (legacyMenu) legacyMenu.style.display = 'none';
}

/**
 * Briše saved highscore i pokreće reset sesije.
 * Poziva se kada igrač klikne "Ponovo" ili "Novi mozaik".
 * @param {import('./state.js').GameState} state — muta gamePhase i score
 * @param {function} onReset — callback koji vraća novi state (iz main.js)
 */
export function handleRestartClick(state, onReset) {
  if (state.gamePhase === 'won') {
    saveHighScore(state.score, Date.now() - state.sessionStartTime);
  }
  onReset();
}

/**
 * Provjera da li je klik/tap na "Ponovo" / "Novi mozaik" dugme u overlay-u.
 * Vraća true ako je klik bio na dugme.
 *
 * @param {number} x — logička X koordinata klika
 * @param {number} y — logička Y koordinata klika
 * @param {number} logicalW — logička širina canvasa
 * @param {number} logicalH — logička visina canvasa
 * @param {'won'|'lost'} phase
 * @returns {boolean}
 */
export function isRestartButtonClick(x, y, logicalW, logicalH, phase) {
  if (phase !== 'won' && phase !== 'lost') return false;
  const btnX = logicalW / 2 - 100;
  const btnY = logicalH / 2 + (phase === 'won' ? 100 : 104);
  const btnW = 200;
  const btnH = 44;
  return x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH;
}
