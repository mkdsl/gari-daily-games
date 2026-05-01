/**
 * render.js — Canvas renderer za ASCII/simbolične ilustracije
 *
 * Svaka scena ima illustrationKey koji mapira na jedan od crteža ispod.
 * Sve ilustracije su simbolične (geometrija + tekst), ne realistične.
 * Boje se uzimaju iz CONFIG.COLORS.
 *
 * @module render
 */

import { CONFIG } from './config.js';

const { TEXT, ACCENT_RED, ACCENT_GREEN, DIM, BG } = CONFIG.COLORS;

// ─── Canvas setup ─────────────────────────────────────────────────────────────

/**
 * Inicijalizuje canvas dimenzije i pixel-ratio skaliranje.
 *
 * @param {HTMLCanvasElement} canvasEl
 */
export function initCanvas(canvasEl) {
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(200, canvasEl.parentElement?.clientWidth || 200);

  canvasEl.width  = size * dpr;
  canvasEl.height = size * dpr;
  canvasEl.style.width  = size + 'px';
  canvasEl.style.height = size + 'px';

  const ctx = canvasEl.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Crta ilustraciju za dati ključ na canvas kontekstu.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} key  — illustrationKey iz scene objekta
 * @param {number} w    — logička širina (px, bez dpr-a)
 * @param {number} h    — logička visina (px, bez dpr-a)
 */
export function drawIllustration(ctx, key, w, h) {
  // Čisti pozadinu
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);

  switch (key) {
    case 'LETTER':      drawLetter(ctx, w, h);     break;
    case 'WOMAN':
    case 'COWORKER':    drawWoman(ctx, w, h);       break;
    case 'BOSS':        drawBoss(ctx, w, h);        break;
    case 'MACHINE':     drawMachine(ctx, w, h);     break;
    case 'YOUTH':
    case 'YOUNG_WORKER': drawYouth(ctx, w, h);     break;
    case 'MIRROR':      drawMirror(ctx, w, h);      break;
    case 'GATE':
    case 'EXIT_GATE':   drawGate(ctx, w, h);        break;
    default:            drawDefault(ctx, w, h, key); break;
  }
}

// ─── Pomocne funkcije ─────────────────────────────────────────────────────────

/** Setuje font za ASCII crtanje */
function setFont(ctx, size = 11) {
  ctx.font = `${size}px ${CONFIG.FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
}

/** Crta horizontalnu liniju */
function hLine(ctx, x1, x2, y, color = DIM) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

/** Crta vertikalnu liniju */
function vLine(ctx, x, y1, y2, color = DIM) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();
}

/** Crta pravougaonik (samo outline) */
function rect(ctx, x, y, w, h, color = DIM, lw = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.strokeRect(x, y, w, h);
}

// ─── Ilustracije ──────────────────────────────────────────────────────────────

/**
 * LETTER — koverta sa vidljivim linijama teksta unutra
 */
function drawLetter(ctx, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const ew = w * 0.58;
  const eh = w * 0.42;
  const ex = cx - ew / 2;
  const ey = cy - eh / 2 - 4;

  // Telo koverte
  rect(ctx, ex, ey, ew, eh, TEXT, 1.5);

  // Dijagonale (V-simetrija koverte)
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(cx, ey + eh * 0.45);
  ctx.lineTo(ex + ew, ey);
  ctx.stroke();

  // Linije teksta unutar koverte (3 reda)
  const lineY = [ey + eh * 0.55, ey + eh * 0.68, ey + eh * 0.81];
  const lineX1 = ex + ew * 0.12;
  const lineX2 = ex + ew * 0.88;
  const lineX2short = ex + ew * 0.55;

  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1;
  lineY.forEach((ly, i) => {
    const x2 = i === 2 ? lineX2short : lineX2;
    hLine(ctx, lineX1, x2, ly, DIM);
  });

  // Firmini pečat — mali kvadrat gore levo
  rect(ctx, ex + ew * 0.07, ey + eh * 0.10, ew * 0.14, eh * 0.18, ACCENT_RED);

  // Tekst ispod koverte
  setFont(ctx, 9);
  ctx.fillStyle = DIM;
  ctx.textAlign = 'center';
  ctx.fillText('1. maja 2026.', cx, ey + eh + 10);
}

/**
 * WOMAN / COWORKER — silueta žene sa pregačom
 */
function drawWoman(ctx, w, h) {
  const cx = w / 2;

  // Glava
  ctx.strokeStyle = TEXT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, h * 0.18, h * 0.07, 0, Math.PI * 2);
  ctx.stroke();

  // Telo
  ctx.strokeStyle = TEXT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.26);
  ctx.lineTo(cx, h * 0.58);
  ctx.stroke();

  // Ramena / ruke
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.17, h * 0.34);
  ctx.lineTo(cx, h * 0.30);
  ctx.lineTo(cx + w * 0.17, h * 0.34);
  ctx.stroke();

  // Ruke dole (do struka)
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.17, h * 0.34);
  ctx.lineTo(cx - w * 0.15, h * 0.50);
  ctx.moveTo(cx + w * 0.17, h * 0.34);
  ctx.lineTo(cx + w * 0.15, h * 0.50);
  ctx.stroke();

  // Noge
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.58);
  ctx.lineTo(cx - w * 0.10, h * 0.78);
  ctx.moveTo(cx, h * 0.58);
  ctx.lineTo(cx + w * 0.10, h * 0.78);
  ctx.stroke();

  // Pregača — pravougaonik ispred tela
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.09, h * 0.33, w * 0.18, h * 0.24);

  // Mrlja na pregači (ACCENT_RED)
  ctx.fillStyle = ACCENT_RED;
  ctx.fillRect(cx - w * 0.03, h * 0.42, w * 0.06, h * 0.05);

  setFont(ctx, 9);
  ctx.fillStyle = DIM;
  ctx.textAlign = 'center';
  ctx.fillText('Vesna', cx, h * 0.83);
}

/**
 * BOSS — figura za stolom sa stolicom
 */
function drawBoss(ctx, w, h) {
  const cx = w / 2;

  // Sto — horizontalna linija
  rect(ctx, w * 0.12, h * 0.54, w * 0.76, h * 0.06, TEXT, 1.5);

  // Noge stola
  vLine(ctx, w * 0.17, h * 0.60, h * 0.78, DIM);
  vLine(ctx, w * 0.83, h * 0.60, h * 0.78, DIM);

  // Stolica (iza stola)
  rect(ctx, cx - w * 0.10, h * 0.62, w * 0.20, h * 0.14, DIM);
  vLine(ctx, cx - w * 0.08, h * 0.76, h * 0.84, DIM);
  vLine(ctx, cx + w * 0.08, h * 0.76, h * 0.84, DIM);
  // naslon
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.10, h * 0.62);
  ctx.lineTo(cx - w * 0.10, h * 0.50);
  ctx.lineTo(cx + w * 0.10, h * 0.50);
  ctx.lineTo(cx + w * 0.10, h * 0.62);
  ctx.stroke();

  // Figura — glava
  ctx.strokeStyle = TEXT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, h * 0.22, h * 0.07, 0, Math.PI * 2);
  ctx.stroke();

  // Torzo (sedi — kraće)
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.30);
  ctx.lineTo(cx, h * 0.52);
  ctx.stroke();

  // Ramena
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.14, h * 0.38);
  ctx.lineTo(cx, h * 0.32);
  ctx.lineTo(cx + w * 0.14, h * 0.38);
  ctx.stroke();

  // Ruka sa hemijskom
  ctx.strokeStyle = TEXT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.14, h * 0.38);
  ctx.lineTo(cx + w * 0.18, h * 0.52);
  ctx.stroke();
  // hemijska
  ctx.strokeStyle = ACCENT_RED;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.18, h * 0.52);
  ctx.lineTo(cx + w * 0.22, h * 0.56);
  ctx.stroke();

  // Sat na levoj ruci
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx - w * 0.18, h * 0.50, 4, 0, Math.PI * 2);
  ctx.stroke();

  setFont(ctx, 9);
  ctx.fillStyle = DIM;
  ctx.textAlign = 'center';
  ctx.fillText('Branko', cx, h * 0.87);
}

/**
 * MACHINE — industrijska mašina s cilindrom, osovinom i urezanim "7"
 */
function drawMachine(ctx, w, h) {
  const cx = w / 2;

  // Baza mašine
  rect(ctx, w * 0.15, h * 0.62, w * 0.70, h * 0.20, TEXT, 1.5);

  // Glavni cilindar (levo)
  rect(ctx, w * 0.18, h * 0.28, w * 0.28, h * 0.34, TEXT, 1.5);
  // elipsa na vrhu cilindra
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(w * 0.18 + w * 0.14, h * 0.28, w * 0.14, h * 0.04, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Manji cilindar (desno)
  rect(ctx, w * 0.54, h * 0.38, w * 0.22, h * 0.24, DIM, 1);
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(w * 0.54 + w * 0.11, h * 0.38, w * 0.11, h * 0.03, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Osovina koja ih spaja
  hLine(ctx, w * 0.46, w * 0.54, h * 0.50, TEXT);
  hLine(ctx, w * 0.46, w * 0.54, h * 0.52, TEXT);

  // Vijci / detalji — tačke
  ctx.fillStyle = DIM;
  [[w*0.22, h*0.32], [w*0.38, h*0.32], [w*0.22, h*0.56], [w*0.38, h*0.56]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Urezani broj "7" na telu mašine
  setFont(ctx, 22);
  ctx.fillStyle = ACCENT_GREEN;
  ctx.textAlign = 'center';
  ctx.fillText('7', w * 0.32, h * 0.38);

  // Natpis "1994."
  setFont(ctx, 8);
  ctx.fillStyle = DIM;
  ctx.textAlign = 'left';
  ctx.fillText('─ 1994. ─', w * 0.20, h * 0.82);

  // Kapljica ulja
  ctx.fillStyle = ACCENT_RED;
  ctx.beginPath();
  ctx.arc(w * 0.30, h * 0.70, 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * YOUTH / YOUNG_WORKER — mlada figura sa neizgrebanim kacigom
 */
function drawYouth(ctx, w, h) {
  const cx = w / 2;

  // Glava
  ctx.strokeStyle = TEXT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, h * 0.17, h * 0.07, 0, Math.PI * 2);
  ctx.stroke();

  // Kaciga — polukružni luk iznad glave
  ctx.strokeStyle = ACCENT_GREEN;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, h * 0.17, h * 0.10, Math.PI, 0);
  ctx.stroke();
  // štitnik kacige
  ctx.beginPath();
  ctx.moveTo(cx - h * 0.10, h * 0.17);
  ctx.lineTo(cx - h * 0.12, h * 0.20);
  ctx.stroke();

  // Telo — pravo, ravne linije
  ctx.strokeStyle = TEXT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.25);
  ctx.lineTo(cx, h * 0.60);
  ctx.stroke();

  // Ramena
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.16, h * 0.33);
  ctx.lineTo(cx, h * 0.28);
  ctx.lineTo(cx + w * 0.16, h * 0.33);
  ctx.stroke();

  // Ruke uz telo
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.16, h * 0.33);
  ctx.lineTo(cx - w * 0.14, h * 0.54);
  ctx.moveTo(cx + w * 0.16, h * 0.33);
  ctx.lineTo(cx + w * 0.14, h * 0.54);
  ctx.stroke();

  // Noge — ravne, vojnički stav
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.60);
  ctx.lineTo(cx - w * 0.08, h * 0.80);
  ctx.moveTo(cx, h * 0.60);
  ctx.lineTo(cx + w * 0.08, h * 0.80);
  ctx.stroke();

  // Cipele — sjajne (svetle)
  ctx.fillStyle = TEXT;
  ctx.fillRect(cx - w * 0.12, h * 0.80, w * 0.08, h * 0.03);
  ctx.fillRect(cx + w * 0.04, h * 0.80, w * 0.08, h * 0.03);

  setFont(ctx, 8);
  ctx.fillStyle = DIM;
  ctx.textAlign = 'center';
  ctx.fillText('↑ nov kacigar', cx, h * 0.86);
}

/**
 * MIRROR — pravougaonik sa "pukotinom" linijom
 */
function drawMirror(ctx, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const mw = w * 0.48;
  const mh = h * 0.66;
  const mx = cx - mw / 2;
  const my = cy - mh / 2;

  // Okvir ogledala (dupli, za debljinu)
  rect(ctx, mx - 3, my - 3, mw + 6, mh + 6, DIM, 1);
  rect(ctx, mx, my, mw, mh, TEXT, 2);

  // Površina ogledala — blago drugačija nijansa
  ctx.fillStyle = 'rgba(232, 213, 183, 0.04)';
  ctx.fillRect(mx + 1, my + 1, mw - 2, mh - 2);

  // Refleksija (horizontalne linije na 1/3 i 2/3)
  ctx.strokeStyle = 'rgba(232, 213, 183, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mx + 2, my + mh * 0.33);
  ctx.lineTo(mx + mw - 2, my + mh * 0.33);
  ctx.moveTo(mx + 2, my + mh * 0.66);
  ctx.lineTo(mx + mw - 2, my + mh * 0.66);
  ctx.stroke();

  // Pukotina — tanka kosa linija od donjeg desnog ugla
  ctx.strokeStyle = ACCENT_RED;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + mw * 0.30, my + mh * 0.60);
  ctx.lineTo(cx + mw * 0.42, my + mh * 0.85);
  ctx.stroke();

  // Mala zvezdica na pukotini
  ctx.fillStyle = ACCENT_RED;
  ctx.beginPath();
  ctx.arc(cx + mw * 0.30, my + mh * 0.60, 2, 0, Math.PI * 2);
  ctx.fill();

  // Natpis
  setFont(ctx, 8);
  ctx.fillStyle = DIM;
  ctx.textAlign = 'center';
  ctx.fillText('2019.', cx, my + mh + 10);
}

/**
 * GATE / EXIT_GATE — fabričke kapije
 */
function drawGate(ctx, w, h) {
  const cx = w / 2;

  // Pod/zemlja
  hLine(ctx, w * 0.05, w * 0.95, h * 0.78, DIM);

  // Levi stub
  rect(ctx, w * 0.10, h * 0.22, w * 0.10, h * 0.56, TEXT, 1.5);
  // Desni stub
  rect(ctx, w * 0.80, h * 0.22, w * 0.10, h * 0.56, TEXT, 1.5);

  // Leva kapija (polu-otvorena)
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(w * 0.20, h * 0.22, w * 0.22, h * 0.56);
  // Horizontalne šipke kapije (4)
  for (let i = 1; i <= 4; i++) {
    hLine(ctx, w * 0.20, w * 0.42, h * 0.22 + (h * 0.56 * i / 5), DIM);
  }

  // Desna kapija (zatvorena — spojena)
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(w * 0.58, h * 0.22, w * 0.22, h * 0.56);
  for (let i = 1; i <= 4; i++) {
    hLine(ctx, w * 0.58, w * 0.80, h * 0.22 + (h * 0.56 * i / 5), DIM);
  }

  // Luk iznad kapija
  ctx.strokeStyle = TEXT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, h * 0.22, w * 0.35, Math.PI, 0);
  ctx.stroke();

  // Svetlost koja prolazi kroz kapiju — vertikalne linije svetla
  ctx.strokeStyle = 'rgba(232, 213, 183, 0.15)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const lx = w * 0.24 + i * (w * 0.06);
    vLine(ctx, lx, h * 0.24, h * 0.76, 'rgba(232, 213, 183, 0.12)');
  }

  // Mesec / svetlo spolja
  ctx.fillStyle = 'rgba(232, 213, 183, 0.25)';
  ctx.beginPath();
  ctx.arc(cx, h * 0.12, h * 0.05, 0, Math.PI * 2);
  ctx.fill();

  setFont(ctx, 8);
  ctx.fillStyle = DIM;
  ctx.textAlign = 'center';
  ctx.fillText('22:00', cx, h * 0.86);
}

/**
 * Fallback — iscrta upitnik i ključ
 */
function drawDefault(ctx, w, h, key) {
  setFont(ctx, 13);
  ctx.fillStyle = DIM;
  ctx.textAlign = 'center';
  ctx.fillText('[ ' + key + ' ]', w / 2, h / 2 - 8);
}
