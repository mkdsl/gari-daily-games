// render.js — canvas rendering za Pečurka Inokulator
// SVE BOJE DOLAZE IZ CONFIG.PALETTE — ne hard-code ovdje!
import { CONFIG } from './config.js';

const P = CONFIG.PALETTE; // shorthand

// ─── Screen Shake ──────────────────────────────────────────────────────────

/**
 * Dodaje CSS shake klasu na canvas i uklanja je posle 300ms.
 * @param {HTMLCanvasElement} canvas
 */
export function triggerScreenShake(canvas) {
  canvas.classList.remove('shake');
  // Force reflow da CSS animacija ponovo starte
  void canvas.offsetWidth;
  canvas.classList.add('shake');
  setTimeout(() => canvas.classList.remove('shake'), 300);
}

// ─── Pixel-art mushroom (Pleurotus silhueta) ──────────────────────────────

/**
 * Crta pixel-art Pleurotus pečurku koristeći fillRect "piksele".
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - centar X
 * @param {number} cy - donji rub (noga)
 * @param {number} scale - 1 = 8px po "pikselu"
 * @param {number} alpha - transparentnost (0-1)
 * @param {string} color - fill boja
 */
function drawMushroom(ctx, cx, cy, scale, alpha, color) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = color;

  const px = scale; // veličina jednog piksela

  // Pixel grid: 1 = popunjen piksel, 0 = prazan
  // Koordinate su relativne (col, row) gdje je (0,0) gore-lijevo klobuka
  const cap = [
    //  0  1  2  3  4  5  6  7
    [0, 0, 1, 1, 1, 1, 0, 0],  // row 0 — vrh klobuka
    [0, 1, 1, 1, 1, 1, 1, 0],  // row 1
    [1, 1, 1, 1, 1, 1, 1, 1],  // row 2
    [1, 1, 1, 1, 1, 1, 1, 1],  // row 3 — najširi
    [0, 1, 1, 1, 1, 1, 1, 0],  // row 4 — pod klobukom
  ];

  // Noga (stipe)
  const stipe = [
    [0, 0, 1, 1, 1, 1, 0, 0],  // row 5
    [0, 0, 1, 1, 1, 1, 0, 0],  // row 6
    [0, 0, 1, 1, 1, 1, 0, 0],  // row 7
  ];

  const grid    = [...cap, ...stipe];
  const cols    = 8;
  const rows    = grid.length;
  const offsetX = cx - (cols / 2) * px;
  const offsetY = cy - rows * px;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) {
        ctx.fillRect(offsetX + c * px, offsetY + r * px, px, px);
      }
    }
  }
  ctx.restore();
}

// ─── Background ────────────────────────────────────────────────────────────

function renderBackground(ctx, canvasW, canvasH) {
  // Gradijent pozadine
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
  grad.addColorStop(0, P.dark_green);
  grad.addColorStop(0.5, P.bg);
  grad.addColorStop(1, P.bar_bg);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Suptilna grid tekstura
  ctx.strokeStyle = 'rgba(123, 198, 122, 0.04)';
  ctx.lineWidth   = 1;
  const gridStep  = 24;
  for (let x = 0; x < canvasW; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasH);
    ctx.stroke();
  }
  for (let y = 0; y < canvasH; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasW, y);
    ctx.stroke();
  }
}

function renderPleurotusDecor(ctx, canvasW, canvasH) {
  // Pozadinske pečurke — suptilne silhuete
  const mushrooms = [
    { x: 35,          y: 180, scale: 5, alpha: 0.06 },
    { x: canvasW - 40, y: 220, scale: 4, alpha: 0.05 },
    { x: 50,          y: 320, scale: 3, alpha: 0.04 },
    { x: canvasW - 30, y: 130, scale: 6, alpha: 0.04 },
    { x: canvasW / 2 - 80, y: 90,  scale: 4, alpha: 0.03 },
    { x: canvasW / 2 + 90, y: 400, scale: 3, alpha: 0.04 },
  ];

  for (const m of mushrooms) {
    drawMushroom(ctx, m.x, m.y, m.scale, m.alpha, P.light_green);
  }
}

// ─── Sto ───────────────────────────────────────────────────────────────────

function renderTable(ctx, canvasW, canvasH) {
  const tableTop = canvasH * 0.52;
  const tableH   = canvasH - tableTop;

  // Drvene daske — main površina
  ctx.fillStyle = P.wood;
  ctx.fillRect(0, tableTop, canvasW, tableH);

  // Drveni grain (horizontalni prugasti efekt)
  for (let i = 0; i < 8; i++) {
    const y = tableTop + 6 + i * 14;
    ctx.fillStyle = i % 2 === 0 ? P.wood_dark : P.wood_light;
    ctx.fillRect(0, y, canvasW, 7);
  }

  // Ivica stola (gornja linija)
  ctx.fillStyle = P.wood_dark;
  ctx.fillRect(0, tableTop, canvasW, 5);

  // Sjaj gornje ivice
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(0, tableTop + 5, canvasW, 2);
}

// ─── Bags (vreće) ──────────────────────────────────────────────────────────

/**
 * Crta jednu vreću supstrata.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} bag - Bag instanca
 * @param {boolean} isActive
 * @param {boolean} showArrow - da li prikazati strelicu iznad aktivne vreće
 */
function renderBag(ctx, bag, isActive, showArrow) {
  const x = bag.x;
  const y = bag.y;
  const w = bag.width;
  const h = bag.height;
  const left   = x - w / 2;
  const top    = y - h / 2;
  const radius = 10;

  ctx.save();

  // Sjenka ispod vreće
  ctx.shadowColor   = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur    = 8;
  ctx.shadowOffsetY = 4;

  // Tijelo vreće
  let bagColor;
  if (bag.status === 'inoculated') {
    bagColor = P.light_green;
  } else if (bag.status === 'contaminated') {
    bagColor = P.mold;
  } else if (isActive) {
    bagColor = P.cream;
  } else {
    bagColor = 'rgba(245, 240, 232, 0.55)';
  }

  ctx.fillStyle = bagColor;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(left, top, w, h, radius);
  } else {
    _roundRect(ctx, left, top, w, h, radius);
  }
  ctx.fill();

  // Ivica vreće
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur  = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = isActive ? P.green : 'rgba(180,165,145,0.6)';
  ctx.lineWidth   = isActive ? 2.5 : 1.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(left, top, w, h, radius);
  } else {
    _roundRect(ctx, left, top, w, h, radius);
  }
  ctx.stroke();

  // Detalji po varijantu (vezivanje/traka)
  if (bag.variant === 0) {
    // Plastična traka pri vrhu
    ctx.fillStyle = isActive ? 'rgba(100,160,100,0.5)' : 'rgba(150,150,150,0.3)';
    ctx.fillRect(left + 8, top + h * 0.15, w - 16, 5);
  } else if (bag.variant === 1) {
    // Čvor (dva ovalna luka)
    ctx.strokeStyle = isActive ? P.mid_green : P.mold;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.ellipse(x - 6, top + 10, 6, 4, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + 6, top + 10, 6, 4, 0.3, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Zip-tie (zickice)
    ctx.strokeStyle = 'rgba(100,100,100,0.4)';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(left + 12, top + 14);
    ctx.lineTo(left + w - 12, top + 14);
    ctx.stroke();
  }

  // Label "G" (Guncati logo mikro)
  if (bag.status !== 'inoculated' && bag.status !== 'contaminated') {
    ctx.fillStyle   = 'rgba(45, 106, 79, 0.35)';
    ctx.font        = `bold ${Math.round(w * 0.35)}px monospace`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', x, y + 8);
  }

  // Double inoculation progress pip-ovi
  if (bag.inoculationsNeeded === 2) {
    for (let i = 0; i < 2; i++) {
      const filled = i < bag.inoculationsDone;
      ctx.fillStyle = filled ? P.green : 'rgba(123,198,122,0.25)';
      ctx.beginPath();
      ctx.arc(x - 7 + i * 14, top + h - 12, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  // Animacije iznad vreće
  renderBagAnimation(ctx, bag, x, y);

  // Strelica iznad aktivne vreće (multi-bag mode)
  if (showArrow) {
    renderActiveArrow(ctx, x, top - 14);
  }
}

/**
 * Crta micelij (success) ili plesni blob (fail) animaciju.
 */
function renderBagAnimation(ctx, bag, cx, cy) {
  if (!bag.isAnimating) return;
  ctx.save();

  if (bag.animType === 'success') {
    // Micelij — radijalne bijele linije
    for (const p of bag.particles) {
      if (p.alpha <= 0) continue;
      ctx.globalAlpha  = p.alpha * 0.9;
      ctx.strokeStyle  = P.mycelium;
      ctx.lineWidth    = 1.5;
      ctx.lineCap      = 'round';
      const progress   = 1 - p.life;
      const startDist  = 10 + progress * 8;
      const endDist    = startDist + p.len + progress * 15;
      const sx = cx + Math.cos(p.angle) * startDist;
      const sy = cy + Math.sin(p.angle) * startDist;
      const ex = cx + Math.cos(p.angle) * endDist;
      const ey = cy + Math.sin(p.angle) * endDist;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    // Centralni glow
    const glowAlpha = Math.max(0, (bag.animTimer / 500));
    ctx.globalAlpha = glowAlpha * 0.5;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
    grad.addColorStop(0, P.light_green);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fill();

  } else if (bag.animType === 'fail') {
    // Plesni blob — expanding zeleno-narandžasti krugovi
    for (const p of bag.particles) {
      if (p.alpha <= 0) continue;
      ctx.globalAlpha = p.alpha * 0.8;
      const progress  = 1 - p.life;
      const dist      = progress * 22;
      const bx = cx + Math.cos(p.angle) * dist;
      const by = cy + Math.sin(p.angle) * dist;
      const rr = p.radius * (0.5 + progress);
      // Zeleno-narandžasti blob
      ctx.fillStyle = progress < 0.5 ? P.orange : P.mid_green;
      ctx.beginPath();
      ctx.arc(bx, by, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    // Crveni vignette flash
    const flashAlpha = Math.max(0, (bag.animTimer / 400)) * 0.35;
    ctx.globalAlpha  = flashAlpha;
    ctx.fillStyle    = P.red;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Strelica (▼) iznad aktivne vreće u multi-bag modu.
 */
function renderActiveArrow(ctx, cx, tipY) {
  ctx.save();
  ctx.fillStyle   = P.green;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(cx,     tipY);
  ctx.lineTo(cx - 7, tipY - 12);
  ctx.lineTo(cx + 7, tipY - 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderBags(ctx, bags, activeBagIndex, canvasW) {
  if (!bags || bags.length === 0) return;

  // Provjeri je li multi-bag mode (više bag-ova istovremeno u grupi)
  const isMultiBag = bags.length > 1 &&
    bags.some(b => b.groupIndex !== undefined);

  if (isMultiBag) {
    // Prikaži samo tekuću grupu (groupIndex === activeBagIndex-ova vrijednost)
    // Aktivna vreca je bags[activeBagIndex]; njena groupIndex je ciljna
    const activeGroup = activeBagIndex < bags.length
      ? (bags[activeBagIndex]?.groupIndex ?? 0)
      : (bags[bags.length - 1]?.groupIndex ?? 0);

    for (let i = 0; i < bags.length; i++) {
      const bag = bags[i];
      if (bag.groupIndex !== activeGroup) continue;
      const isActive = i === activeBagIndex;
      const showArrow = isActive && bags.filter(b => b.groupIndex === activeGroup).length > 1;
      renderBag(ctx, bag, isActive, showArrow);
    }
  } else {
    // Sekvencijalni — prikaži samo jednu aktivnu + prethodno inokulisane (fade)
    for (let i = 0; i < bags.length; i++) {
      const bag = bags[i];
      if (bag.status === 'waiting' && i !== activeBagIndex) continue;
      const isActive = i === activeBagIndex;
      renderBag(ctx, bag, isActive, false);
    }
  }
}

// ─── Timing Bar ────────────────────────────────────────────────────────────

function renderTimingBar(ctx, timingState, canvasW, canvasH) {
  const barW   = canvasW * CONFIG.TIMING_BAR.width;
  const barH   = CONFIG.TIMING_BAR.height;
  const barX   = (canvasW - barW) / 2;
  const barY   = canvasH * CONFIG.TIMING_BAR.y_offset - barH / 2;
  const radius = barH / 2;

  // Pozadina bara
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur    = 6;
  ctx.fillStyle     = P.bar_bg;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(barX, barY, barW, barH, radius);
  } else {
    _roundRect(ctx, barX, barY, barW, barH, radius);
  }
  ctx.fill();
  ctx.shadowBlur    = 0;

  // Ivica bara
  ctx.strokeStyle   = P.bar_border;
  ctx.lineWidth     = 1.5;
  ctx.stroke();

  // Fake zone (siva, prikazi uvijek)
  if (timingState.fakeBounds) {
    const fb = timingState.fakeBounds;
    const fx = barX + fb.left * barW;
    const fw = (fb.right - fb.left) * barW;
    ctx.fillStyle = P.fake;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(fx, barY + 2, fw, barH - 4, radius - 1);
    } else {
      ctx.fillRect(fx, barY + 2, fw, barH - 4);
    }
    ctx.fill();
    ctx.globalAlpha = 1;
    // Fake label
    ctx.fillStyle   = P.white;
    ctx.font        = '7px monospace';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕', fx + fw / 2, barY + barH / 2);
  }

  // Golden window (zlatna zona)
  if (timingState.goldenBounds) {
    const gb  = timingState.goldenBounds;
    const gx  = barX + gb.left * barW;
    const gw  = (gb.right - gb.left) * barW;
    const glowGrad = ctx.createLinearGradient(gx, barY, gx, barY + barH);
    glowGrad.addColorStop(0, P.gold);
    glowGrad.addColorStop(0.5, '#ffe566');
    glowGrad.addColorStop(1, P.gold_dark);
    ctx.fillStyle   = glowGrad;
    ctx.globalAlpha = 0.95;
    ctx.shadowColor = P.gold;
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(gx, barY + 1, gw, barH - 2, radius - 1);
    } else {
      ctx.fillRect(gx, barY + 1, gw, barH - 2);
    }
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
  }

  // Zeleni prozor
  const wBounds  = timingState.windowBounds;
  const wx       = barX + wBounds.left * barW;
  const ww       = timingState.windowWidthNorm * barW;
  const isVisible = timingState.blinkState; // false = blink sakriven

  if (isVisible || timingState.type !== 'green') {
    const winGrad = ctx.createLinearGradient(wx, barY, wx, barY + barH);
    winGrad.addColorStop(0, P.light_green);
    winGrad.addColorStop(0.5, P.green);
    winGrad.addColorStop(1, P.mid_green);
    ctx.fillStyle   = winGrad;
    ctx.globalAlpha = isVisible ? 0.95 : 0.0; // nevidljiv tokom blink-off
    ctx.shadowColor = P.green;
    ctx.shadowBlur  = isVisible ? 8 : 0;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(wx, barY + 1, ww, barH - 2, radius - 1);
    } else {
      ctx.fillRect(wx, barY + 1, ww, barH - 2);
    }
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
  }

  // "Kursor" — vertikalna linija u centru bara (fiksna referentna tačka)
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(barX + barW / 2, barY - 4);
  ctx.lineTo(barX + barW / 2, barY + barH + 4);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label na dnu bara (hint za tutorial nivo)
  ctx.restore();
}

// ─── Score popup ────────────────────────────────────────────────────────────

/**
 * Floating score text (+NNN) pri pogotku.
 * Renderuje se jednom i decay-uje. State se drži van ove funkcije —
 * main.js prosljeđuje listu aktivnih popupa u state.scorePopups.
 */
function renderScorePopups(ctx, scorePopups) {
  if (!scorePopups || scorePopups.length === 0) return;
  ctx.save();
  for (const sp of scorePopups) {
    if (sp.alpha <= 0) continue;
    ctx.globalAlpha = sp.alpha;
    ctx.fillStyle   = sp.isGolden ? P.gold : P.green;
    ctx.font        = `bold ${sp.fontSize}px monospace`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${sp.score}`, sp.x, sp.y);
  }
  ctx.restore();
}

// ─── Lives display ─────────────────────────────────────────────────────────

/**
 * Crta 3 igle (syringe) kao živote direktno na canvasu (backup ako HUD nije spreman).
 * Ukloniti ako UI.js radi HUD kroz DOM.
 */
function renderLivesCanvas(ctx, lives, canvasW) {
  // Ovo je canvas verzija za fallback — prava verzija je u ui.js DOM HUD-u
  ctx.save();
  const totalLives = 3;
  const iconW = 16;
  const gap   = 8;
  const totalW = totalLives * iconW + (totalLives - 1) * gap;
  const startX = (canvasW - totalW) / 2;
  const y      = 24;

  for (let i = 0; i < totalLives; i++) {
    const filled = i < lives;
    const x      = startX + i * (iconW + gap);
    ctx.fillStyle = filled ? P.red : 'rgba(192,57,43,0.22)';
    // Igla: pravougaonik + trougao na vrhu
    ctx.fillRect(x + 5, y + 6, 6, 12);
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 4, y + 7);
    ctx.lineTo(x + 12, y + 7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ─── Guncati logo ──────────────────────────────────────────────────────────

function renderGuncatiLogo(ctx, canvasW, canvasH) {
  ctx.save();
  ctx.fillStyle   = 'rgba(123, 198, 122, 0.20)';
  ctx.font        = '9px monospace';
  ctx.textAlign   = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('guncati.rs', canvasW - 8, canvasH - 6);
  ctx.restore();
}

// ─── Streak indicator ──────────────────────────────────────────────────────

function renderStreakIndicator(ctx, streak, canvasW, canvasH) {
  if (streak < CONFIG.STREAK_MULTIPLIER.threshold1) return;

  const x   = canvasW / 2;
  const y   = canvasH * CONFIG.TIMING_BAR.y_offset + CONFIG.TIMING_BAR.height + 24;
  const mult = streak >= CONFIG.STREAK_MULTIPLIER.threshold2
    ? CONFIG.STREAK_MULTIPLIER.mult2
    : CONFIG.STREAK_MULTIPLIER.mult1;

  ctx.save();
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';

  // Bubble pozadina
  ctx.fillStyle = P.streak_bg;
  const text    = `🔥 ×${mult.toFixed(1)} (${streak} streak)`;
  ctx.font      = 'bold 11px monospace';
  const tw      = ctx.measureText(text).width + 18;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x - tw / 2, y - 11, tw, 22, 6);
    ctx.fill();
  } else {
    ctx.fillRect(x - tw / 2, y - 11, tw, 22);
  }

  ctx.fillStyle = P.white;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ─── Level indicator (canvas layer) ────────────────────────────────────────

function renderLevelBanner(ctx, level, canvasW) {
  ctx.save();
  ctx.fillStyle   = `rgba(123,198,122,0.12)`;
  ctx.font        = `bold 11px monospace`;
  ctx.textAlign   = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`NV ${level}/10`, canvasW - 10, 10);
  ctx.restore();
}

// ─── Helper: roundRect polyfill ─────────────────────────────────────────────

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

// ─── Main render ───────────────────────────────────────────────────────────

/**
 * Glavni render — poziva se svaki frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - game state
 * @param {Object} timingState - timing.getState()
 * @param {number} canvasW
 * @param {number} canvasH
 */
export function render(ctx, state, timingState, canvasW, canvasH) {
  // Čišćenje
  ctx.clearRect(0, 0, canvasW, canvasH);

  // 1. Pozadina
  renderBackground(ctx, canvasW, canvasH);

  // 2. Dekorativne pečurke u pozadini
  renderPleurotusDecor(ctx, canvasW, canvasH);

  // 3. Sto
  renderTable(ctx, canvasW, canvasH);

  // 4. Vreće
  if (state.screen === 'playing' || state.screen === 'levelclear') {
    renderBags(ctx, state.bags, state.activeBagIndex, canvasW);
  }

  // 5. Timing bar (samo tokom igre)
  if (state.screen === 'playing') {
    renderTimingBar(ctx, timingState, canvasW, canvasH);
  }

  // 6. Score popups
  if (state.scorePopups && state.scorePopups.length > 0) {
    renderScorePopups(ctx, state.scorePopups);
  }

  // 7. Streak indicator
  if (state.screen === 'playing') {
    renderStreakIndicator(ctx, state.streak, canvasW, canvasH);
  }

  // 8. Level mini-indicator
  if (state.screen === 'playing') {
    renderLevelBanner(ctx, state.level, canvasW);
  }

  // 9. Guncati logo (donji desni, uvijek vidljiv)
  renderGuncatiLogo(ctx, canvasW, canvasH);
}
