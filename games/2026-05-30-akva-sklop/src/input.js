/**
 * input.js — Click / tap / hover handler za canvas
 *
 * Sve korisničke interakcije sa grid-om prolaze ovde.
 * Validacija pozicije i AP oduzimanje rade se pre setCell.
 */

import { GRID_COLS, GRID_ROWS, TILE_TYPES, TILE_CONFIG } from './config.js';
import { getState, setState } from './state.js';

let canvas = null;
let gridRef = null;   // referenca na grid[] niz (živući, nije kopija)

// ─── Inicijalizacija ──────────────────────────────────────────────────────────

export function initInput(canvasEl, grid) {
  canvas  = canvasEl;
  gridRef = grid;

  canvas.addEventListener('click',      handleClick);
  canvas.addEventListener('mousemove',  handleHover);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('touchstart', handleTouch,  { passive: false });
  canvas.addEventListener('touchmove',  handleTouchMove, { passive: false });
}

// ─── Koordinate ───────────────────────────────────────────────────────────────

function getGridCoords(clientX, clientY) {
  const rect   = canvas.getBoundingClientRect();
  // Skaliranje: canvas logički prostor vs vizuelna veličina
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const x      = (clientX - rect.left) * scaleX;
  const y      = (clientY - rect.top)  * scaleY;
  const col    = Math.floor(x / (canvas.width  / GRID_COLS));
  const row    = Math.floor(y / (canvas.height / GRID_ROWS));
  return { col, row };
}

function inBounds(col, row) {
  return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
}

// ─── Click handler ────────────────────────────────────────────────────────────

function handleClick(e) {
  const state        = getState();
  const selectedTile = state.selectedTile;

  // Ne reaguje van planning faze
  if (state.phase !== 'planning') return;
  if (!selectedTile) {
    flashCanvasError('Izaberi tile na paleti');
    return;
  }

  const { col, row } = getGridCoords(e.clientX, e.clientY);
  if (!inBounds(col, row)) return;

  const cellIdx   = row * GRID_COLS + col;
  const cell      = gridRef[cellIdx];
  const isRemove  = selectedTile === 'remove';

  // ─── Validacija ───────────────────────────────────────────────────────────

  // Terrain je uvek blokirano
  if (cell?.type === TILE_TYPES.TERRAIN) {
    flashCanvasError('Neprohodna zona');
    return;
  }

  // Izvor se ne može ukloniti
  if (cell?.type === TILE_TYPES.SOURCE) {
    if (isRemove) {
      flashCanvasError('Izvor se ne može ukloniti');
      return;
    }
    // Postavljanje na SOURCE tile je takođe zabranjeno
    flashCanvasError('Zauzeto: Izvor');
    return;
  }

  // Prazno polje — ne može se remove-ovati
  if (isRemove && (!cell || cell.type === TILE_TYPES.EMPTY)) {
    flashCanvasError('Nema tile-a za uklanjanje');
    return;
  }

  // lake2 zahteva lake1 na istoj poziciji
  if (selectedTile === 'lake2') {
    if (cell?.type !== TILE_TYPES.LAKE_1) {
      flashCanvasError('Jezero II zahteva Jezero I na ovoj poziciji');
      return;
    }
  }

  // AP provera
  const apCost = getApCost(selectedTile, cell);
  if (state.ap < apCost) {
    flashCanvasError(`Nedovoljno AP (treba ${apCost}, imaš ${state.ap})`);
    flashPaletteBtn(selectedTile);
    return;
  }

  // ─── Primeni akciju ───────────────────────────────────────────────────────

  import('./grid.js').then(({ setCell }) => {
    if (isRemove) {
      setCell(gridRef, col, row, TILE_TYPES.EMPTY);
    } else {
      // Mapiraj string type na TILE_TYPES konstantu
      const tileTypeKey = tileStringToType(selectedTile);
      setCell(gridRef, col, row, tileTypeKey);
    }

    // Oduzmi AP
    setState({ ap: state.ap - apCost });

    // Audio feedback
    import('./audio.js').then(audio => {
      if (typeof audio.playTilePlaced === 'function') audio.playTilePlaced();
    });
  });
}

// ─── Hover handler ────────────────────────────────────────────────────────────

function handleHover(e) {
  const { col, row } = getGridCoords(e.clientX, e.clientY);
  if (inBounds(col, row)) {
    setState({ hoverCell: { col, row } });
  } else {
    setState({ hoverCell: null });
  }
}

function handleMouseLeave() {
  setState({ hoverCell: null });
}

// ─── Touch handlers ───────────────────────────────────────────────────────────

function handleTouch(e) {
  e.preventDefault(); // sprečava scroll
  if (e.touches.length === 0) return;
  const touch = e.touches[0];
  // Simuliramo hover na touch poziciji
  handleHover({ clientX: touch.clientX, clientY: touch.clientY });
  handleClick({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchMove(e) {
  e.preventDefault();
  if (e.touches.length === 0) return;
  const touch = e.touches[0];
  handleHover({ clientX: touch.clientX, clientY: touch.clientY });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getApCost(selectedTile, existingCell) {
  if (selectedTile === 'remove') {
    // Cena remove-a je uvek 1 AP (po config-u)
    return TILE_CONFIG[TILE_TYPES.REMOVE]?.apCost ?? 1;
  }
  const tileType = tileStringToType(selectedTile);
  return TILE_CONFIG[tileType]?.apCost ?? 1;
}

function tileStringToType(str) {
  // Mapira palette string ('lake1', 'lake2', itd.) na TILE_TYPES konstantu
  const map = {
    drainage:  TILE_TYPES.DRAINAGE,
    biofilter: TILE_TYPES.BIOFILTER,
    wetland:   TILE_TYPES.WETLAND,
    lake1:     TILE_TYPES.LAKE_1,
    lake2:     TILE_TYPES.LAKE_2,
    dam:       TILE_TYPES.DAM,
    remove:    TILE_TYPES.REMOVE,
  };
  return map[str] ?? str;
}

// ─── Visual feedback ──────────────────────────────────────────────────────────

let _errorTimer = null;

function flashCanvasError(reason) {
  const el = document.getElementById('gameCanvas');
  if (!el) return;

  el.style.outline = '3px solid #f44336';
  clearTimeout(_errorTimer);
  _errorTimer = setTimeout(() => {
    el.style.outline = '';
  }, 350);

  // Kratki toast za razlog
  showInputToast(reason);
}

function flashPaletteBtn(tileType) {
  const btn = document.querySelector(`[data-tile="${tileType}"]`);
  if (!btn) return;
  btn.classList.add('btn-error');
  setTimeout(() => btn.classList.remove('btn-error'), 400);
}

let _toastTimer = null;
let _toastEl    = null;

function showInputToast(message) {
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    _toastEl.id = '_inputToast';
    _toastEl.style.cssText = `
      position: fixed; bottom: 5.5rem; left: 50%; transform: translateX(-50%);
      background: rgba(244,67,54,0.9); color: #fff;
      padding: 0.35rem 1rem; border-radius: 5px;
      font-size: 0.75rem; z-index: 99; pointer-events: none;
      transition: opacity 0.25s;
    `;
    document.body.appendChild(_toastEl);
  }
  _toastEl.textContent = message;
  _toastEl.style.opacity = '1';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    _toastEl.style.opacity = '0';
  }, 1800);
}
