/**
 * @file ui.js
 * @description HUD, menji i overlay ekrani za Frekventni Grad.
 *
 * Sve funkcije crtaju direktno na Canvas koristeći isti ctx koji prima render.js.
 * Sve boje i dimenzije dolaze iz CONFIG.
 *
 * Poziva se iz main.js:
 *   - renderHUD(state, ctx, w, h) — svaki frame dok je gamePhase === 'playing'
 *   - renderMenu(ctx, w, h)       — gamePhase === 'menu'
 *   - renderNightSummary(state, ctx, w, h) — gamePhase === 'night_summary'
 *   - renderGameOver(state, ctx, w, h)     — gamePhase === 'game_over'
 *   - renderSetlistCards(options, ctx, w, h) — između pesama
 *
 * @module ui
 */

import { CONFIG } from './config.js';

/**
 * @typedef {Object} SetlistOption
 * @property {string} label       - Naziv pesme / mood kartice
 * @property {number} themeIndex  - Indeks u CONFIG.SETLIST_THEMES (0/1/2)
 */

/**
 * Crta HUD: score (gore desno), combo × multiplier badge (gore levo),
 * energy bar (dole, puna širina) i lastHitResult flash (centar).
 *
 * @param {import('./state.js').GameState} state
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - Logička širina (px)
 * @param {number} h - Logička visina (px)
 * @returns {void}
 */
export function renderHUD(state, ctx, w, h) {
  // TODO: implementirati
  // Score top-right
  // Combo × multiplier badge top-left
  // Energy bar bottom (full width, thin)
  // lastHitResult flash — centar ekrana, fade po lastHitTime
}

/**
 * Crta glavni meni (naslov, dugme Start, credit footer).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @returns {void}
 */
export function renderMenu(ctx, w, h) {
  // TODO: implementirati
  // Neon naslov "FREKVENTNI GRAD"
  // "Pritisni ENTER ili tapni da počneš"
  // A / S / D oznake lanova
}

/**
 * Crta night summary overlay na kraju noći.
 * Prikazuje PERFECT/GOOD/MISS count, max combo, score.
 *
 * @param {import('./state.js').GameState} state
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @returns {void}
 */
export function renderNightSummary(state, ctx, w, h) {
  // TODO: implementirati
  // Tamni overlay
  // "NOĆ X ZAVRŠENA"
  // nightSummary.perfectCount / goodCount / missCount
  // maxCombo, scoreGained
  // "Pritisni ENTER za sledeću noć"
}

/**
 * Crta game over overlay.
 *
 * @param {import('./state.js').GameState} state
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @returns {void}
 */
export function renderGameOver(state, ctx, w, h) {
  // TODO: implementirati
  // "GAME OVER" u crvenoj neon boji
  // Finaln score
  // Noć i klub na kojoj je igrač pao
  // "Pritisni ENTER za restart"
}

/**
 * Crta 3 setlist kartice između pesama (kozmetičke teme).
 * Igrač bira jednu od 3 kartice; svaka menja samo boju teme.
 *
 * @param {SetlistOption[]} options  - Tačno 3 opcije
 * @param {number} selectedIndex     - Koja kartica je trenutno selektovana (keyboard nav)
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @returns {void}
 */
export function renderSetlistCards(options, selectedIndex, ctx, w, h) {
  // TODO: implementirati
  // 3 kartice horizontalno, svaka sa CONFIG.SETLIST_THEMES bojama
  // Selektovana kartica ima glow border
  // "Izaberi mood za sledeću pesmu"
}

/**
 * Crta kratku poruku u centru ekrana (npr. "PERFECT!", "COMBO LOST").
 * Fade-out posle CONFIG.HIT_RING_DURATION * 2 sekundi.
 *
 * @param {string} text
 * @param {string} color  - CSS boja
 * @param {number} alpha  - 0.0–1.0
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @returns {void}
 */
export function renderCenterFlash(text, color, alpha, ctx, w, h) {
  // TODO: implementirati
}
