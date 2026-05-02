/**
 * render.js — Sve canvas draw operacije za Mozaik Ludila.
 *
 * Odgovornost:
 *   - Full clear + full redraw svaki frejm (nema dirty rect optimizacije)
 *   - Grid (pozadina, fuge, popunjene ćelije, hint glow)
 *   - Ghost preview (validna = boja fragmenta opacity 0.45, nevalidna = crvena)
 *   - Match flash animacija (treperanje matched ćelija)
 *   - Fragment zona (aktivan + peek fragmenti ispod grida)
 *   - Partikle (delegira na particles.js)
 *   - HUD (delegira na ui.js)
 *   - Overlays: Game Over, Win ekran, Combo pulse
 *
 * NOTA: Ovaj modul crta direktno na canvas ctx — bez DOM elemenata.
 * Sve koordinate su u logičkim pikselima (DPR se primenjuje u main.js scale).
 */

import {
  BG_COLOR, GROUT_COLOR, TILE_COLORS, GHOST_INVALID_COLOR,
  GRID_ROWS, GRID_COLS, GRID_GAP,
  GHOST_OPACITY_VALID, GHOST_OPACITY_INVALID, GHOST_BORDER_COLOR, GHOST_BORDER_WIDTH,
  HINT_SHADOW_BLUR, HINT_THRESHOLD,
  SELECTED_SCALE, PEEK_SCALE, PEEK_OPACITY,
  MATCH_FLASH_PERIOD,
  COMBO_PULSE_OPACITY, COMBO_PULSE_DURATION, COMBO_TEXT_DURATION,
  SCORE_WIN,
  FRAGMENT_ZONE_HEIGHT, FRAGMENT_ZONE_PADDING,
} from './config.js';
import { drawParticles } from './particles.js';
import { SHAPES } from './entities/fragments.js';
import { isValidPlacement } from './systems/placement.js';

/**
 * Glavni render entry point — poziva se iz main.js svaki frejm.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').GameState} state
 * @param {{ cellSize: number, gridOffsetX: number, gridOffsetY: number, fragmentZoneY: number, logicalW: number, logicalH: number }} layout
 */
export function render(ctx, state, layout) {
  const { cellSize, gridOffsetX, gridOffsetY, fragmentZoneY, logicalW, logicalH } = layout;

  // --- Clear ---
  ctx.clearRect(0, 0, logicalW, logicalH);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, logicalW, logicalH);

  // --- Shake offset ---
  let shakeX = 0;
  if (state.animations.shakeTimer > 0) {
    shakeX = (Math.random() < 0.5 ? 1 : -1) * 4;
  }

  ctx.save();
  ctx.translate(shakeX, 0);

  // --- Grid pozadina (fuge) ---
  _drawGridBackground(ctx, gridOffsetX, gridOffsetY, cellSize, logicalW, logicalH);

  // --- Hint glow ---
  _drawHintGlow(ctx, state.grid, gridOffsetX, gridOffsetY, cellSize);

  // --- Popunjene ćelije ---
  _drawGridCells(ctx, state.grid, state.animations.matchFlash, gridOffsetX, gridOffsetY, cellSize);

  // --- Ghost preview ---
  if (state.selectedFragment && state.hoverCell && state.activeFragment) {
    _drawGhostPreview(ctx, state, gridOffsetX, gridOffsetY, cellSize);
  }

  // --- Match flash overlay (treperanje) ---
  // Već ugrađeno u _drawGridCells

  // --- Partikle ---
  drawParticles(ctx, state.particles);

  ctx.restore();

  // --- Fragment zona (ispod grida) ---
  _drawFragmentZone(ctx, state, gridOffsetX, gridOffsetY, cellSize, fragmentZoneY, logicalW);

  // --- Combo pulse overlay ---
  if (state.animations.comboPulse > 0) {
    _drawComboPulse(ctx, state.animations.comboPulse, logicalW, logicalH);
  }

  // --- Combo tekst ---
  if (state.animations.comboText) {
    _drawComboText(ctx, state.animations.comboText, logicalW, logicalH);
  }

  // --- HUD (score progress bar) ---
  _drawHUD(ctx, state, logicalW, gridOffsetY);

  // --- Win overlay ---
  if (state.gamePhase === 'won') {
    _drawWinOverlay(ctx, state, logicalW, logicalH);
  }

  // --- Game Over overlay ---
  if (state.gamePhase === 'lost') {
    _drawGameOverOverlay(ctx, state, logicalW, logicalH);
  }
}

// --- Privatne helper funkcije ---

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function _drawGridBackground(ctx, gridOffsetX, gridOffsetY, cellSize, logicalW, logicalH) {
  // Siva pozadina cele grid zone
  const gridW = GRID_COLS * cellSize;
  const gridH = GRID_ROWS * cellSize;
  ctx.fillStyle = GROUT_COLOR;
  ctx.fillRect(gridOffsetX, gridOffsetY, gridW, gridH);
}

/**
 * Crta popunjene ćelije. Matchovane ćelije koje su u flash animaciji trepere.
 */
function _drawGridCells(ctx, grid, matchFlash, gridOffsetX, gridOffsetY, cellSize) {
  const gap = GRID_GAP;
  const innerSize = cellSize - gap;

  // Napravi mapu flash timera za brzi lookup
  const flashMap = new Map();
  for (const f of matchFlash) {
    flashMap.set(`${f.row},${f.col}`, f);
  }

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const color = grid[r][c];
      if (!color) continue;

      const x = gridOffsetX + c * cellSize + gap;
      const y = gridOffsetY + r * cellSize + gap;

      // Flash: treperenje matched ćelija
      let alpha = 1;
      const flashEntry = flashMap.get(`${r},${c}`);
      if (flashEntry) {
        // Treperenje: sin wave na osnovu timera
        const phase = (flashEntry.timer / MATCH_FLASH_PERIOD) * Math.PI;
        alpha = 0.5 + 0.5 * Math.abs(Math.sin(phase));
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, innerSize, innerSize);

      // Dekorativni highlight (sjajna gornja-leva ivica)
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(x, y, innerSize, 3);
      ctx.fillRect(x, y, 3, innerSize);
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Crta hint glow oko redova/kolona/kvadranata koji imaju >= HINT_THRESHOLD iste boje.
 */
function _drawHintGlow(ctx, grid, gridOffsetX, gridOffsetY, cellSize) {
  const gridW = GRID_COLS * cellSize;
  const gridH = GRID_ROWS * cellSize;

  // --- Redovi ---
  for (let r = 0; r < GRID_ROWS; r++) {
    // Broji pločice po boji u ovom redu
    const colorCount = new Map();
    for (let c = 0; c < GRID_COLS; c++) {
      const color = grid[r][c];
      if (color) colorCount.set(color, (colorCount.get(color) ?? 0) + 1);
    }
    for (const [tileColor, count] of colorCount) {
      if (count >= HINT_THRESHOLD) {
        const x = gridOffsetX;
        const y = gridOffsetY + r * cellSize;
        const w = gridW;
        const h = cellSize;
        ctx.save();
        ctx.shadowColor = tileColor;
        ctx.shadowBlur = HINT_SHADOW_BLUR;
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = tileColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx.restore();
      }
    }
  }

  // --- Kolone ---
  for (let c = 0; c < GRID_COLS; c++) {
    const colorCount = new Map();
    for (let r = 0; r < GRID_ROWS; r++) {
      const color = grid[r][c];
      if (color) colorCount.set(color, (colorCount.get(color) ?? 0) + 1);
    }
    for (const [tileColor, count] of colorCount) {
      if (count >= HINT_THRESHOLD) {
        const x = gridOffsetX + c * cellSize;
        const y = gridOffsetY;
        const w = cellSize;
        const h = gridH;
        ctx.save();
        ctx.shadowColor = tileColor;
        ctx.shadowBlur = HINT_SHADOW_BLUR;
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = tileColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx.restore();
      }
    }
  }

  // --- 2×2 kvadranti ---
  for (let r = 0; r <= GRID_ROWS - 2; r++) {
    for (let c = 0; c <= GRID_COLS - 2; c++) {
      // Prikupi 4 ćelije 2×2 bloka
      const quadColors = [
        grid[r][c],
        grid[r][c + 1],
        grid[r + 1][c],
        grid[r + 1][c + 1],
      ];
      const colorCount = new Map();
      for (const color of quadColors) {
        if (color) colorCount.set(color, (colorCount.get(color) ?? 0) + 1);
      }
      for (const [tileColor, count] of colorCount) {
        if (count >= 3) {
          const x = gridOffsetX + c * cellSize;
          const y = gridOffsetY + r * cellSize;
          const w = 2 * cellSize;
          const h = 2 * cellSize;
          ctx.save();
          ctx.shadowColor = tileColor;
          ctx.shadowBlur = HINT_SHADOW_BLUR;
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = tileColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
          ctx.restore();
        }
      }
    }
  }
}

/**
 * Crta ghost preview fragmenta na hover poziciji.
 */
function _drawGhostPreview(ctx, state, gridOffsetX, gridOffsetY, cellSize) {
  const { activeFragment, hoverCell, grid } = state;
  if (!activeFragment || !hoverCell) return;

  const { shapeId, rotationIndex, color } = activeFragment;
  const shape = SHAPES[shapeId];
  if (!shape) return;

  const cells = shape.rotations[rotationIndex];
  const valid = isValidPlacement(grid, shapeId, rotationIndex, hoverCell.row, hoverCell.col);
  const gap = GRID_GAP;
  const innerSize = cellSize - gap;

  for (const [dr, dc] of cells) {
    const r = hoverCell.row + dr;
    const c = hoverCell.col + dc;

    // Ako je van granica — skip (nevalidna pozicija se vidi po boji, ne nestaje)
    if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;

    const x = gridOffsetX + c * cellSize + gap;
    const y = gridOffsetY + r * cellSize + gap;

    if (valid) {
      ctx.globalAlpha = GHOST_OPACITY_VALID;
      ctx.fillStyle = color;
    } else {
      ctx.globalAlpha = GHOST_OPACITY_INVALID;
      ctx.fillStyle = GHOST_INVALID_COLOR;
    }
    ctx.fillRect(x, y, innerSize, innerSize);

    // Border
    if (valid) {
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = GHOST_BORDER_COLOR;
      ctx.lineWidth = GHOST_BORDER_WIDTH;
      ctx.strokeRect(x + 0.5, y + 0.5, innerSize - 1, innerSize - 1);
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Crta fragment zonu ispod grida: aktivni fragment + 2 peek fragmenta.
 */
function _drawFragmentZone(ctx, state, gridOffsetX, gridOffsetY, cellSize, fragmentZoneY, logicalW) {
  const { fragmentQueue, activeFragment, selectedFragment } = state;
  if (!fragmentQueue || fragmentQueue.length === 0) return;

  // TODO: Implementirati kompletan fragment zone render u koraku 4d
  // Ovde samo placeholder crtanje aktivnog fragmenta
  const active = fragmentQueue[0] ?? activeFragment;
  if (!active) return;

  const previewCellSize = cellSize * 0.7;
  const shape = SHAPES[active.shapeId];
  if (!shape) return;

  const cells = shape.rotations[active.rotationIndex];
  const gap = GRID_GAP;

  // Izračunaj bounding box fragmenta
  const maxR = Math.max(...cells.map(([r]) => r));
  const maxC = Math.max(...cells.map(([, c]) => c));
  const fragW = (maxC + 1) * previewCellSize;
  const fragH = (maxR + 1) * previewCellSize;

  // Centriraj aktivan fragment
  const scale = selectedFragment ? SELECTED_SCALE : 1.0;
  const cx = logicalW / 2;
  const cy = fragmentZoneY + 50;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  for (const [dr, dc] of cells) {
    const x = (dc - (maxC / 2)) * previewCellSize - previewCellSize / 2 + gap;
    const y = (dr - (maxR / 2)) * previewCellSize - previewCellSize / 2 + gap;
    const s = previewCellSize - gap;
    ctx.fillStyle = active.color;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();

  // Peek fragmenti (2 sledeća)
  _drawPeekFragments(ctx, fragmentQueue, cellSize, fragmentZoneY, logicalW, cx);
}

/**
 * Crta peek fragmente (sledeća 2 u queue).
 */
function _drawPeekFragments(ctx, fragmentQueue, cellSize, fragmentZoneY, logicalW, activeCenterX) {
  const peek1 = fragmentQueue[1];
  const peek2 = fragmentQueue[2];
  const peekCellSize = cellSize * PEEK_SCALE * 0.7;
  const gap = GRID_GAP;

  const peekPositions = [
    activeCenterX - 120,
    activeCenterX + 120,
  ];

  [peek1, peek2].forEach((frag, i) => {
    if (!frag) return;
    const shape = SHAPES[frag.shapeId];
    if (!shape) return;
    const cells = shape.rotations[frag.rotationIndex];
    const maxR = Math.max(...cells.map(([r]) => r));
    const maxC = Math.max(...cells.map(([, c]) => c));

    ctx.save();
    ctx.globalAlpha = PEEK_OPACITY;
    ctx.translate(peekPositions[i], fragmentZoneY + 50);
    ctx.scale(PEEK_SCALE, PEEK_SCALE);

    for (const [dr, dc] of cells) {
      const x = (dc - maxC / 2) * peekCellSize - peekCellSize / 2 + gap;
      const y = (dr - maxR / 2) * peekCellSize - peekCellSize / 2 + gap;
      const s = peekCellSize - gap;
      ctx.fillStyle = frag.color;
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();

  });

  // Labele za oba peek fragmenta
  const peekLabels = ['+1', '+2'];
  [peek1, peek2].forEach((frag, i) => {
    if (!frag) return;
    ctx.globalAlpha = PEEK_OPACITY;
    ctx.fillStyle = '#8899aa';
    ctx.font = '11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(peekLabels[i], peekPositions[i], fragmentZoneY + 96);
    ctx.globalAlpha = 1;
  });
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

/**
 * Crta HUD: score progress bar na vrhu.
 */
function _drawHUD(ctx, state, logicalW, gridOffsetY) {
  const barY = 20;
  const barH = 18;
  const barX = 20;
  const barW = logicalW - 40;
  const progress = Math.min(state.score / SCORE_WIN, 1.0);

  // Pozadina bara
  ctx.fillStyle = GROUT_COLOR;
  ctx.fillRect(barX, barY, barW, barH);

  // Popunjenost
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(barX, barY, barW * progress, barH);

  // Score tekst
  ctx.fillStyle = '#fff';
  ctx.font = `bold 13px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`${state.score} / ${SCORE_WIN}`, barX + 6, barY + 13);

  // Desno: "RESTAURACIJA"
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.floor(progress * 100)}%`, barX + barW - 6, barY + 13);
  ctx.textAlign = 'left';

  // Combo indikator
  if (state.combo >= 2) {
    ctx.fillStyle = '#f0c040';
    ctx.font = `bold 14px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`×${state.combo}`, logicalW / 2, barY + 13);
    ctx.textAlign = 'left';
  }
}

/**
 * Crta zlatni combo pulse overlay.
 */
function _drawComboPulse(ctx, comboPulse, logicalW, logicalH) {
  // Bell curve: opacity ide 0 → max → 0 tokom trajanja pulse-a
  // progress: 1.0 na početku (puno ostalo), 0.0 na kraju (ništa nije ostalo)
  const progress = comboPulse / COMBO_PULSE_DURATION;
  // Bell: 0 kad je progress 1.0 ili 0.0, max kad je progress 0.5
  const bellT = 1 - Math.abs(progress * 2 - 1);
  const opacity = bellT * COMBO_PULSE_OPACITY;
  ctx.fillStyle = `rgba(240, 192, 64, ${opacity})`;
  ctx.fillRect(0, 0, logicalW, logicalH);
}

/**
 * Crta combo tekst na ekranu.
 */
function _drawComboText(ctx, comboText, logicalW, logicalH) {
  const opacity = comboText.timer / comboText.maxTimer;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#f0c040';
  ctx.font = `bold 36px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = '#c0405a';
  ctx.shadowBlur = 12;
  ctx.fillText(comboText.text, logicalW / 2, logicalH / 2 - 40);
  ctx.restore();
}

/**
 * Crta Win overlay.
 */
function _drawWinOverlay(ctx, state, logicalW, logicalH) {
  ctx.fillStyle = 'rgba(26, 29, 46, 0.85)';
  ctx.fillRect(0, 0, logicalW, logicalH);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#f0c040';
  ctx.font = `bold 40px Georgia, serif`;
  ctx.shadowColor = '#f0c040';
  ctx.shadowBlur = 20;
  ctx.fillText('MOZAIK RESTAURIRAN!', logicalW / 2, logicalH / 2 - 60);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = `22px Georgia, serif`;
  ctx.fillText(`Finalni skor: ${state.score}`, logicalW / 2, logicalH / 2);
  ctx.fillText(`Best combo: ×${state.stats.maxCombo}`, logicalW / 2, logicalH / 2 + 36);

  const elapsed = Date.now() - state.sessionStartTime;
  const mm = Math.floor(elapsed / 60000);
  const ss = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
  ctx.fillText(`Vreme: ${mm}:${ss}`, logicalW / 2, logicalH / 2 + 72);

  // Dugme
  ctx.fillStyle = '#4db87a';
  ctx.fillRect(logicalW / 2 - 100, logicalH / 2 + 100, 200, 44);
  ctx.fillStyle = '#fff';
  ctx.font = `bold 18px Georgia, serif`;
  ctx.fillText('Novi mozaik', logicalW / 2, logicalH / 2 + 128);

  ctx.textAlign = 'left';
}

/**
 * Crta Game Over overlay.
 */
function _drawGameOverOverlay(ctx, state, logicalW, logicalH) {
  ctx.fillStyle = 'rgba(26, 29, 46, 0.85)';
  ctx.fillRect(0, 0, logicalW, logicalH);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#c0405a';
  ctx.font = `bold 36px Georgia, serif`;
  ctx.shadowColor = '#c0405a';
  ctx.shadowBlur = 16;
  ctx.fillText('KRAJ RESTAURACIJE', logicalW / 2, logicalH / 2 - 60);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = `22px Georgia, serif`;
  ctx.fillText(`Skor: ${state.score}`, logicalW / 2, logicalH / 2);

  const pct = Math.floor((state.score / SCORE_WIN) * 100);
  ctx.fillText(`Restauracija: ${pct}%`, logicalW / 2, logicalH / 2 + 36);
  ctx.fillText(`Best combo: ×${state.stats.maxCombo}`, logicalW / 2, logicalH / 2 + 72);

  // Dugme "Ponovo"
  ctx.fillStyle = '#4a8dbf';
  ctx.fillRect(logicalW / 2 - 100, logicalH / 2 + 104, 200, 44);
  ctx.fillStyle = '#fff';
  ctx.font = `bold 18px Georgia, serif`;
  ctx.fillText('Ponovo', logicalW / 2, logicalH / 2 + 132);

  ctx.textAlign = 'left';
}
