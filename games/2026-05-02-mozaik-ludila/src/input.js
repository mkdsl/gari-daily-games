/**
 * input.js — Mouse + touch + keyboard handleri za Mozaik Ludila.
 *
 * Input model: klik-za-selekciju (NE drag-and-drop). Sve akcije se resolvuju na press.
 *
 * Flow:
 *   1. Igrač klikne na aktivan fragment u fragment zoni → state.selectedFragment = true
 *   2. Kursor prolazi iznad grida → ažurira state.hoverCell → ghost preview
 *   3. Igrač klikne na grid ćeliju (dok je fragment selektovan):
 *      - isValidPlacement → postavi fragment (placeFragment) → evaluateMatches → applyScore
 *      - Nevalidna pozicija → shake animacija
 *   4. Klik van grida i van fragment zone → deselect
 *   5. R / tap na selektovani fragment → rotacija
 *   6. Escape → deselect
 *
 * Touch event preporuke (iz GDD sekcija 6):
 *   - touchstart sa passive: false (da preventDefault radi)
 *   - touchstart tretirati kao "klik" (ne čekati touchend)
 *   - getTouchCanvasPos: korigovati za getBoundingClientRect + canvas DPR
 *
 * Ovaj modul ne muta state direktno — vraća InputEvent objekte koje
 * systems/index.js procesira u update fazi.
 */

import { GRID_ROWS, GRID_COLS, PLACEMENT_SHAKE_FRAMES, PLACEMENT_SHAKE_OFFSET,
         INPUT_BLOCK_DURATION, MATCH_ANIM_DURATION } from './config.js';
import { isValidPlacement, placeFragment, checkGameOver } from './systems/placement.js';
import { evaluateMatches, clearMatchedCells } from './systems/matching.js';
import { applyScore } from './systems/scoring.js';
import { spawnParticles } from './particles.js';
import { SHAPES, enqueueNewFragment } from './entities/fragments.js';
import { saveState } from './state.js';
import { initAudio, playPlacement, playMatch, playCombo, playInvalid, playWin } from './audio.js';

/** @type {HTMLCanvasElement|null} */
let _canvas = null;

/**
 * Inicijalizuje sve event listenere na canvas-u.
 * Prihvata state po referenci — direktno muta ga na akcije igrača.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {import('./state.js').GameState} state — referenca (muta se direktno)
 * @param {function(): Object} getLayout — vraća trenutni layout objekat iz main.js
 * @param {function(): void} onReset — callback za restart igre
 */
export function initInput(canvas, state, getLayout, onReset) {
  _canvas = canvas;

  // Keyboard
  window.addEventListener('keydown', (e) => {
    _handleKey(e.key, state, getLayout);
  });

  // Mouse
  canvas.addEventListener('mousedown', (e) => {
    initAudio();
    const pos = _getCanvasPos(e, canvas);
    _handlePress(pos.x, pos.y, state, getLayout, onReset);
  });

  canvas.addEventListener('mousemove', (e) => {
    const pos = _getCanvasPos(e, canvas);
    _handleMove(pos.x, pos.y, state, getLayout);
  });

  // Touch (passive: false da preventDefault radi — sprečava scroll)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    const pos = _getTouchPos(e, canvas);
    _handlePress(pos.x, pos.y, state, getLayout, onReset);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const pos = _getTouchPos(e, canvas);
    _handleMove(pos.x, pos.y, state, getLayout);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    // Akcija je već procesirana u touchstart — ništa ovde
  });
}

// --- Privatne funkcije ---

/**
 * Konvertuje mouse event u logičke canvas koordinate.
 * @param {MouseEvent} e
 * @param {HTMLCanvasElement} canvas
 * @returns {{ x: number, y: number }}
 */
function _getCanvasPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

/**
 * Konvertuje touch event u logičke canvas koordinate.
 * @param {TouchEvent} e
 * @param {HTMLCanvasElement} canvas
 * @returns {{ x: number, y: number }}
 */
function _getTouchPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0] ?? e.changedTouches[0];
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width / (window.devicePixelRatio || 1)),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height / (window.devicePixelRatio || 1)),
  };
}

/**
 * Konvertuje logičke canvas koordinate u grid ćeliju.
 * Vraća null ako je van grida.
 * @param {number} x
 * @param {number} y
 * @param {Object} layout
 * @returns {{ row: number, col: number }|null}
 */
function _posToGrid(x, y, layout) {
  const { cellSize, gridOffsetX, gridOffsetY } = layout;
  const col = Math.floor((x - gridOffsetX) / cellSize);
  const row = Math.floor((y - gridOffsetY) / cellSize);
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
  return { row, col };
}

/**
 * Provjera da li je koordinata unutar fragment zone aktivnog fragmenta.
 * @param {number} x
 * @param {number} y
 * @param {Object} layout
 * @returns {boolean}
 */
function _isInActiveFragmentZone(x, y, layout) {
  const { logicalW, fragmentZoneY } = layout;
  // Aktivan fragment je u centru fragment zone (±80px x, ±60px y)
  const cx = logicalW / 2;
  const cy = fragmentZoneY + 50;
  return Math.abs(x - cx) < 80 && Math.abs(y - cy) < 60;
}

/**
 * Procesuira klik/tap.
 */
function _handlePress(x, y, state, getLayout, onReset) {
  if (state.inputBlocked) return;

  const layout = getLayout();

  // --- Win / Game Over: provjeri klik na dugme ---
  if (state.gamePhase === 'won' || state.gamePhase === 'lost') {
    const { logicalW, logicalH } = layout;
    const btnX = logicalW / 2 - 100;
    const btnY = logicalH / 2 + (state.gamePhase === 'won' ? 100 : 104);
    if (x >= btnX && x <= btnX + 200 && y >= btnY && y <= btnY + 44) {
      onReset();
    }
    return;
  }

  if (state.gamePhase !== 'playing') return;

  const gridCell = _posToGrid(x, y, layout);

  // --- Klik na grid ---
  if (gridCell && state.selectedFragment && state.activeFragment) {
    const { shapeId, rotationIndex, color } = state.activeFragment;
    const { row, col } = gridCell;

    if (isValidPlacement(state.grid, shapeId, rotationIndex, row, col)) {
      // Postavi fragment
      const tileCount = placeFragment(state.grid, shapeId, rotationIndex, row, col, color);
      state.stats.placedFragments++;
      state.selectedFragment = false;
      state.hoverCell = null;
      playPlacement(color);

      // Evaluiraj match
      const { matched, perfects } = evaluateMatches(state.grid);

      // Score (placement bonus + match score)
      applyScore(state, matched.size, perfects, tileCount);

      if (matched.size > 0) {
        playMatch(matched.size);
        if (state.combo >= 3) playCombo(state.combo);
        // Flash animacija za matched ćelije
        for (const key of matched) {
          const [r, c] = key.split(',').map(Number);
          state.animations.matchFlash.push({
            row: r, col: c,
            timer: MATCH_ANIM_DURATION,
            maxTimer: MATCH_ANIM_DURATION,
          });

          // Partikle: centar ćelije
          const { cellSize, gridOffsetX, gridOffsetY } = layout;
          const cx = gridOffsetX + c * cellSize + cellSize / 2;
          const cy = gridOffsetY + r * cellSize + cellSize / 2;
          const matchedColor = state.grid[r][c] ?? color; // boja pre brisanja
          spawnParticles(state.particles, cx, cy, color);
        }

        // Blokira input dok animacija traje (INPUT_BLOCK_DURATION ms)
        state.inputBlocked = true;
        state.inputBlockTimer = INPUT_BLOCK_DURATION;

        // Briši matched ćelije posle INPUT_BLOCK_DURATION, pa ažuriraj queue i provjeri game over
        setTimeout(() => {
          clearMatchedCells(state.grid, matched);
          // Queue update i game over check na čistom gridu
          state.fragmentQueue.shift();
          enqueueNewFragment(state.fragmentQueue, state.score);
          state.activeFragment = state.fragmentQueue[0] ?? null;
          if (state.gamePhase === 'won') {
            playWin();
          } else if (checkGameOver(state.grid, state.activeFragment)) {
            state.gamePhase = 'lost';
          }
          saveState(state);
        }, INPUT_BLOCK_DURATION);
      } else {
        // Nema match-a — queue update sinhron
        state.fragmentQueue.shift();
        enqueueNewFragment(state.fragmentQueue, state.score);
        state.activeFragment = state.fragmentQueue[0] ?? null;

        // Game Over / Win zvuk
        if (state.gamePhase === 'won') {
          playWin();
        }

        // Game Over provjera
        if (checkGameOver(state.grid, state.activeFragment)) {
          state.gamePhase = 'lost';
        }

        // Save
        saveState(state);
      }
    } else {
      // Nevalidna pozicija → shake
      state.animations.shakeTimer = PLACEMENT_SHAKE_FRAMES * 16; // ~3 frejmova
      playInvalid();
    }
    return;
  }

  // --- Klik na aktivan fragment (u fragment zoni) ---
  if (_isInActiveFragmentZone(x, y, layout)) {
    if (state.selectedFragment) {
      // Već selektovan → rotacija
      if (state.activeFragment) {
        const shape = SHAPES[state.activeFragment.shapeId];
        if (shape) {
          state.activeFragment.rotationIndex =
            (state.activeFragment.rotationIndex + 1) % shape.rotations.length;
        }
      }
    } else {
      // Selekcija
      state.selectedFragment = true;
    }
    return;
  }

  // --- Klik van grida i van fragment zone → deselect ---
  state.selectedFragment = false;
  state.hoverCell = null;
}

/**
 * Procesuira pomeranje kursora/prsta — ažurira ghost preview.
 */
function _handleMove(x, y, state, getLayout) {
  if (!state.selectedFragment) return;

  const layout = getLayout();
  const cell = _posToGrid(x, y, layout);
  state.hoverCell = cell;
}

/**
 * Procesuira keyboard input.
 */
function _handleKey(key, state, getLayout) {
  if (state.inputBlocked) return;

  if (key === 'r' || key === 'R') {
    // Rotacija aktivnog fragmenta
    if (state.activeFragment && state.selectedFragment) {
      const shape = SHAPES[state.activeFragment.shapeId];
      if (shape) {
        state.activeFragment.rotationIndex =
          (state.activeFragment.rotationIndex + 1) % shape.rotations.length;
      }
    }
  }

  if (key === 'Escape') {
    state.selectedFragment = false;
    state.hoverCell = null;
  }
}
