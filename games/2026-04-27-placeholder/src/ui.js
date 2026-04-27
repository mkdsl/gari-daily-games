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
 *   - renderSetlistCards(options, selectedIndex, ctx, w, h) — između pesama
 *
 * @module ui
 */

import { CONFIG } from './config.js';

/**
 * @typedef {Object} SetlistOption
 * @property {string} label       - Naziv pesme / mood kartice
 * @property {number} themeIndex  - Indeks u CONFIG.SETLIST_THEMES (0/1/2)
 */

// ─── Blink timer (za "pritisni taster") ──────────────────────────────────────
let _blinkVisible = true;
let _blinkLast = 0;
const BLINK_INTERVAL_MS = 600;

function _updateBlink(now) {
  if (now - _blinkLast > BLINK_INTERVAL_MS) {
    _blinkVisible = !_blinkVisible;
    _blinkLast = now;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Crta neon tekst sa shadow glow.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @param {string} font
 * @param {string} [align='center']
 * @param {number} [glowBlur=18]
 */
function _neonText(ctx, text, x, y, color, font, align = 'center', glowBlur = 18) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = /** @type {CanvasTextAlign} */ (align);
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = glowBlur;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Crta polu-proziran overlay rect.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {number} [alpha=0.82]
 */
function _dimOverlay(ctx, w, h, alpha = 0.82) {
  ctx.save();
  ctx.fillStyle = `rgba(13,13,26,${alpha})`;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Vraća multiplier iz combo vrijednosti.
 * @param {number} combo
 * @returns {number}
 */
function _comboMultiplier(combo) {
  const m = 1 + Math.floor(combo / CONFIG.COMBO_PER_MULTIPLIER);
  return Math.min(m, CONFIG.MULTIPLIER_MAX);
}

// ─── Javne funkcije ───────────────────────────────────────────────────────────

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
  const now = performance.now();

  // ── Score (gore desno) ──────────────────────────────────────────────────────
  const score = state.score ?? 0;
  _neonText(
    ctx,
    score.toString().padStart(7, '0'),
    w - 20,
    28,
    CONFIG.COLORS.TEXT_PRIMARY,
    'bold 22px ui-monospace, monospace',
    'right',
    6,
  );

  // ── Combo × multiplier (gore levo) ─────────────────────────────────────────
  const combo = state.combo ?? 0;
  const mult = _comboMultiplier(combo);

  if (combo > 0) {
    const multStr = `×${mult}`;
    const comboStr = `${combo} COMBO`;

    // Multiplier trepeće kad dostigne 4×
    const highMult = mult >= CONFIG.MULTIPLIER_MAX;
    const blinkAlpha = highMult ? (Math.sin(now / 180) * 0.4 + 0.6) : 1;

    ctx.save();
    ctx.globalAlpha = blinkAlpha;

    _neonText(
      ctx,
      multStr,
      20,
      24,
      CONFIG.COLORS.COMBO,
      'bold 28px ui-monospace, monospace',
      'left',
      20,
    );
    _neonText(
      ctx,
      comboStr,
      20,
      48,
      CONFIG.COLORS.TEXT_DIM,
      '13px ui-monospace, monospace',
      'left',
      0,
    );

    ctx.restore();
  }

  // ── Energy bar (dole, puna širina) ─────────────────────────────────────────
  const energy = Math.max(0, Math.min(CONFIG.ENERGY_MAX, state.energy ?? CONFIG.ENERGY_START));
  const energyRatio = energy / CONFIG.ENERGY_MAX;
  const BAR_H = 8;
  const BAR_Y = h - 20;

  // Pozadina
  ctx.save();
  ctx.fillStyle = CONFIG.COLORS.ENERGY_BG;
  ctx.fillRect(0, BAR_Y, w, BAR_H);

  // Fill
  const fillW = w * energyRatio;
  const highEnergy = energyRatio > 0.8;

  let fillColor = CONFIG.COLORS.ENERGY_FILL;
  let fillAlpha = 1;
  if (highEnergy) {
    // Pulsira brže kad je energy > 80%
    fillAlpha = 0.75 + Math.sin(now / 120) * 0.25;
    ctx.shadowBlur = 12;
    ctx.shadowColor = fillColor;
  }

  ctx.globalAlpha = fillAlpha;
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, BAR_Y, fillW, BAR_H);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Label (% desno od belta)
  _neonText(
    ctx,
    `${Math.round(energy)}%`,
    w - 6,
    BAR_Y - 10,
    CONFIG.COLORS.TEXT_DIM,
    '11px ui-monospace, monospace',
    'right',
    0,
  );

  ctx.restore();

  // ── lastHitResult flash (centar) ────────────────────────────────────────────
  const lastHitResult = state.lastHitResult;
  const lastHitTime = state.lastHitTime ?? 0;
  const FLASH_DURATION_MS = 500;

  if (lastHitResult && lastHitTime > 0) {
    const elapsed = now - lastHitTime;
    if (elapsed < FLASH_DURATION_MS) {
      const alpha = 1 - elapsed / FLASH_DURATION_MS;

      let flashColor;
      let flashText;
      if (lastHitResult === 'PERFECT') {
        flashColor = CONFIG.COLORS.HIT_PERFECT;
        flashText = 'PERFECT!';
      } else if (lastHitResult === 'GOOD') {
        flashColor = CONFIG.COLORS.HIT_GOOD;
        flashText = 'GOOD';
      } else {
        flashColor = CONFIG.COLORS.HIT_MISS;
        flashText = 'MISS';
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      _neonText(
        ctx,
        flashText,
        w / 2,
        h / 2 - 40,
        flashColor,
        'bold 36px ui-monospace, monospace',
        'center',
        24,
      );
      ctx.restore();
    }
  }

  // ── Lane key labels (dno, nad timing linijom) ───────────────────────────────
  const laneXs = [w * 0.25, w * 0.50, w * 0.75];
  const laneKeys = ['A', 'S', 'D'];
  const tlY = h - CONFIG.TIMING_LINE_Y_OFFSET;
  laneXs.forEach((x, i) => {
    _neonText(
      ctx,
      laneKeys[i],
      x,
      tlY + 20,
      CONFIG.COLORS.BEAT_LANE[i],
      'bold 14px ui-monospace, monospace',
      'center',
      6,
    );
  });
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
  const now = performance.now();
  _updateBlink(now);

  _dimOverlay(ctx, w, h, 0.92);

  // Dekorativne trake po lane bojama (tanke, vertikalne)
  const laneXs = [w * 0.25, w * 0.50, w * 0.75];
  ctx.save();
  laneXs.forEach((x, i) => {
    ctx.strokeStyle = CONFIG.COLORS.BEAT_LANE[i];
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;
    ctx.shadowBlur = 8;
    ctx.shadowColor = CONFIG.COLORS.BEAT_LANE[i];
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  ctx.restore();

  const centerX = w / 2;

  // Naziv igre
  _neonText(
    ctx,
    'FREKVENTNI GRAD',
    centerX,
    h * 0.32,
    CONFIG.COLORS.GLOW_COLOR,
    'bold 48px ui-monospace, monospace',
    'center',
    30,
  );

  // Podnaslov
  _neonText(
    ctx,
    'RHYTHM · REFLEX · NEON',
    centerX,
    h * 0.32 + 56,
    CONFIG.COLORS.TEXT_DIM,
    '16px ui-monospace, monospace',
    'center',
    0,
  );

  // Uputstvo za lane-ove
  const laneDesc = [
    { key: 'A', color: CONFIG.COLORS.BEAT_LANE[0], label: 'LEVO' },
    { key: 'S', color: CONFIG.COLORS.BEAT_LANE[1], label: 'CENTAR' },
    { key: 'D', color: CONFIG.COLORS.BEAT_LANE[2], label: 'DESNO' },
  ];
  const descY = h * 0.55;
  laneDesc.forEach(({ key, color, label }, i) => {
    const x = w * 0.25 + i * w * 0.25;
    // Krug za dugme
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, descY, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    _neonText(ctx, key, x, descY, color, 'bold 22px ui-monospace, monospace', 'center', 10);
    _neonText(
      ctx,
      label,
      x,
      descY + 38,
      CONFIG.COLORS.TEXT_DIM,
      '12px ui-monospace, monospace',
      'center',
      0,
    );
  });

  // "Pritisni taster" — treperi
  if (_blinkVisible) {
    _neonText(
      ctx,
      'Pritisni bilo koji taster da počneš',
      centerX,
      h * 0.75,
      CONFIG.COLORS.TEXT_PRIMARY,
      '18px ui-monospace, monospace',
      'center',
      8,
    );
  }

  // Footer
  _neonText(
    ctx,
    'Frekventni Grad  ·  Gari Daily Games',
    centerX,
    h - 20,
    CONFIG.COLORS.TEXT_DIM,
    '11px ui-monospace, monospace',
    'center',
    0,
  );
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
  const now = performance.now();
  _updateBlink(now);

  _dimOverlay(ctx, w, h, 0.88);

  const centerX = w / 2;
  const summary = state.nightSummary ?? {};

  const nightNum = (state.currentNight ?? 0) + 1;
  const clubName = _clubName(state.currentClub ?? 0);

  // Naslov
  _neonText(
    ctx,
    `NOĆ ${nightNum} ZAVRŠENA`,
    centerX,
    h * 0.2,
    CONFIG.COLORS.HIT_PERFECT,
    'bold 36px ui-monospace, monospace',
    'center',
    22,
  );

  // Klub
  _neonText(
    ctx,
    clubName.toUpperCase(),
    centerX,
    h * 0.2 + 48,
    CONFIG.COLORS.TEXT_DIM,
    '14px ui-monospace, monospace',
    'center',
    0,
  );

  // Statistike
  const stats = [
    { label: 'PERFECT', value: summary.perfectCount ?? 0, color: CONFIG.COLORS.HIT_PERFECT },
    { label: 'GOOD', value: summary.goodCount ?? 0, color: CONFIG.COLORS.HIT_GOOD },
    { label: 'MISS', value: summary.missCount ?? 0, color: CONFIG.COLORS.HIT_MISS },
    { label: 'MAX COMBO', value: summary.maxCombo ?? 0, color: CONFIG.COLORS.COMBO },
  ];

  const startY = h * 0.38;
  const rowH = 44;
  stats.forEach(({ label, value, color }, i) => {
    const y = startY + i * rowH;
    // Label
    ctx.save();
    ctx.font = '13px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
    ctx.fillText(label, centerX - 12, y);
    ctx.restore();
    // Value
    _neonText(ctx, String(value), centerX + 12, y, color, 'bold 18px ui-monospace, monospace', 'left', 8);
  });

  // Score noći
  const scoreGained = summary.scoreGained ?? state.score ?? 0;
  _neonText(
    ctx,
    `SCORE: ${scoreGained}`,
    centerX,
    h * 0.72,
    CONFIG.COLORS.TEXT_PRIMARY,
    'bold 28px ui-monospace, monospace',
    'center',
    12,
  );

  // "Pritisni da nastaviš" — treperi
  if (_blinkVisible) {
    _neonText(
      ctx,
      'Pritisni ENTER za sledeću noć',
      centerX,
      h * 0.86,
      CONFIG.COLORS.TEXT_DIM,
      '16px ui-monospace, monospace',
      'center',
      4,
    );
  }
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
  const now = performance.now();
  _updateBlink(now);

  _dimOverlay(ctx, w, h, 0.92);

  const centerX = w / 2;

  // Naslov
  _neonText(
    ctx,
    'NOĆ PROPALA',
    centerX,
    h * 0.28,
    CONFIG.COLORS.HIT_MISS,
    'bold 44px ui-monospace, monospace',
    'center',
    28,
  );

  // Klub i noć
  const clubName = _clubName(state.currentClub ?? 0);
  const nightNum = (state.currentNight ?? 0) + 1;
  _neonText(
    ctx,
    `${clubName.toUpperCase()}  ·  NOĆ ${nightNum}`,
    centerX,
    h * 0.28 + 54,
    CONFIG.COLORS.TEXT_DIM,
    '14px ui-monospace, monospace',
    'center',
    0,
  );

  // Finalni score
  _neonText(
    ctx,
    `SCORE: ${state.score ?? 0}`,
    centerX,
    h * 0.52,
    CONFIG.COLORS.TEXT_PRIMARY,
    'bold 32px ui-monospace, monospace',
    'center',
    14,
  );

  // Energija je pala na 0
  _neonText(
    ctx,
    'Energija pala na 0 — publika te je istresla',
    centerX,
    h * 0.62,
    CONFIG.COLORS.TEXT_DIM,
    '13px ui-monospace, monospace',
    'center',
    0,
  );

  // "Pritisni da ponovo pokušaš" — treperi
  if (_blinkVisible) {
    _neonText(
      ctx,
      'Pritisni ENTER da ponovo pokušaš',
      centerX,
      h * 0.78,
      CONFIG.COLORS.HIT_MISS,
      '16px ui-monospace, monospace',
      'center',
      10,
    );
  }
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
  const now = performance.now();
  _updateBlink(now);

  _dimOverlay(ctx, w, h, 0.85);

  const centerX = w / 2;

  _neonText(
    ctx,
    'IZABERI MOOD ZA SLEDEĆU PESMU',
    centerX,
    h * 0.2,
    CONFIG.COLORS.COMBO,
    'bold 20px ui-monospace, monospace',
    'center',
    14,
  );

  const CARD_W = Math.min(w * 0.25, 180);
  const CARD_H = CARD_W * 1.4;
  const GAP = w * 0.04;
  const totalW = CARD_W * 3 + GAP * 2;
  const startX = (w - totalW) / 2;
  const cardY = h * 0.33;

  const safeOptions = options && options.length === 3 ? options : [
    { label: 'TECH', themeIndex: 0 },
    { label: 'AMBIENT', themeIndex: 1 },
    { label: 'HOUSE', themeIndex: 2 },
  ];

  safeOptions.forEach((opt, i) => {
    const themeIdx = opt.themeIndex ?? i;
    const [lightColor, darkColor] = CONFIG.SETLIST_THEMES[themeIdx] ?? CONFIG.SETLIST_THEMES[0];
    const cx = startX + i * (CARD_W + GAP);
    const isSelected = i === selectedIndex;

    ctx.save();

    // Kartica pozadina
    ctx.fillStyle = darkColor;
    ctx.globalAlpha = isSelected ? 0.95 : 0.7;
    _roundRect(ctx, cx, cardY, CARD_W, CARD_H, 8);
    ctx.fill();

    // Glow border za selektovanu karticu
    if (isSelected) {
      ctx.strokeStyle = lightColor;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = lightColor;
      ctx.globalAlpha = 1;
      _roundRect(ctx, cx, cardY, CARD_W, CARD_H, 8);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = lightColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      _roundRect(ctx, cx, cardY, CARD_W, CARD_H, 8);
      ctx.stroke();
    }

    // Dekorativni krug u gornjoj trećini
    ctx.globalAlpha = isSelected ? 0.85 : 0.45;
    ctx.fillStyle = lightColor;
    ctx.shadowBlur = isSelected ? 18 : 6;
    ctx.shadowColor = lightColor;
    ctx.beginPath();
    ctx.arc(cx + CARD_W / 2, cardY + CARD_H * 0.35, CARD_W * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label
    ctx.globalAlpha = 1;
    _neonText(
      ctx,
      opt.label.toUpperCase(),
      cx + CARD_W / 2,
      cardY + CARD_H * 0.75,
      isSelected ? lightColor : CONFIG.COLORS.TEXT_DIM,
      `bold 14px ui-monospace, monospace`,
      'center',
      isSelected ? 12 : 0,
    );

    // Lane key hint
    const laneKeys = ['A', 'S', 'D'];
    _neonText(
      ctx,
      `[ ${laneKeys[i]} ]`,
      cx + CARD_W / 2,
      cardY + CARD_H * 0.9,
      isSelected ? lightColor : CONFIG.COLORS.TEXT_DIM,
      `12px ui-monospace, monospace`,
      'center',
      0,
    );

    ctx.restore();
  });

  // "Potvrdi sa ENTER"
  if (_blinkVisible) {
    _neonText(
      ctx,
      'Pritisni A / S / D za izbor  ·  ENTER za potvrdu',
      centerX,
      cardY + CARD_H + 36,
      CONFIG.COLORS.TEXT_DIM,
      '13px ui-monospace, monospace',
      'center',
      0,
    );
  }
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
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  _neonText(
    ctx,
    text,
    w / 2,
    h / 2 - 40,
    color,
    'bold 36px ui-monospace, monospace',
    'center',
    20,
  );
  ctx.restore();
}

// ─── Privatni helperi ─────────────────────────────────────────────────────────

/**
 * Vraća naziv kluba po indeksu.
 * @param {number} idx
 * @returns {string}
 */
function _clubName(idx) {
  const names = ['Podrum', 'Krov', 'Metro', 'Orbita'];
  return names[idx] ?? `Klub ${idx + 1}`;
}

/**
 * Crta zaobljeni pravougaonik (path only, bez fill/stroke).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - Radijus zaobljenosti
 */
function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
