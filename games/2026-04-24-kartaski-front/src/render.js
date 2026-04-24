/**
 * render.js — Canvas battlefield renderer za Kartaški Front.
 *
 * Canvas pokriva samo #battlefield-wrap (50vh).
 * Sve što je DOM (karte, toolbar, overlay) — radi ui.js.
 *
 * @typedef {import('./state.js').GameState} GameState
 * @typedef {import('./state.js').EnemyState} EnemyState
 * @typedef {import('./state.js').PlayerState} PlayerState
 */

import { CONFIG } from './config.js';

// ── Canvas inicijalizacija ───────────────────────────────────────────────────

/**
 * Inicijalizuj Canvas veličinu prema parent div-u.
 * Pozovi jednom iz main.js, pa na svakom resize-u.
 * @param {HTMLCanvasElement} canvas
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
 */
export function initCanvas(canvas) {
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

  function resize() {
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width         = Math.round(rect.width  * dpr);
    canvas.height        = Math.round(rect.height * dpr);
    canvas.style.width   = rect.width  + 'px';
    canvas.style.height  = rect.height + 'px';
    // Reset transform, pa postavi scale
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  return { canvas, ctx };
}

// ── Glavni render entrypoint ─────────────────────────────────────────────────

/**
 * Poziva se eksplicitno iz main.js posle svake akcije.
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 */
export function render(ctx, state) {
  const dpr = window.devicePixelRatio || 1;
  const W = ctx.canvas.width  / dpr;
  const H = ctx.canvas.height / dpr;

  _clearBackground(ctx, W, H);

  // Bez neprijatelja (MAP faza, pre borbe) — samo draw pozadinu
  if (!state.enemy.def) {
    _drawMapBackground(ctx, W, H);
    return;
  }

  const enemyX  = W * 0.25;
  const playerX = W * 0.75;
  const figureY = H * 0.42; // vertikalni centar figure (gornja ivica glave)

  // Leva strana — neprijatelj
  _drawEnemySilhouette(ctx, state.enemy, enemyX, figureY);
  _drawHPBar(ctx, state.enemy,  enemyX,  figureY + 78, 130, false);
  _drawShieldIndicator(ctx, state.enemy,  enemyX,  figureY - 62);
  _drawEffectIcons(ctx, state.enemy,  enemyX,  figureY + 104);
  _drawIntentIcon(ctx, state, enemyX, figureY - 88);

  // Desna strana — igrač
  _drawPlayerSilhouette(ctx, state.player, playerX, figureY);
  _drawHPBar(ctx, state.player, playerX, figureY + 78, 130, true);
  _drawShieldIndicator(ctx, state.player, playerX, figureY - 62);
  _drawEffectIcons(ctx, state.player, playerX, figureY + 104);

  // Središnja linija
  _drawDivider(ctx, W, H);
}

// ── Pozadina ─────────────────────────────────────────────────────────────────

function _clearBackground(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = CONFIG.COLORS.BATTLEFIELD;
  ctx.fillRect(0, 0, W, H);

  // Suptilni radijalni gradient — malo svetliji centar
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.65);
  grad.addColorStop(0, 'rgba(30, 30, 60, 0.45)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function _drawMapBackground(ctx, W, H) {
  // Prikaži "?" u sredini kad smo na MAP ekranu
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.min(W, H) * 0.25}px monospace`;
  ctx.fillStyle = 'rgba(226, 185, 111, 0.06)';
  ctx.fillText('⚔', W / 2, H / 2);
}

function _drawDivider(ctx, W, H) {
  ctx.save();
  ctx.strokeStyle = 'rgba(226, 185, 111, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 9]);
  ctx.beginPath();
  ctx.moveTo(W / 2, H * 0.08);
  ctx.lineTo(W / 2, H * 0.92);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ── Neprijatelj ──────────────────────────────────────────────────────────────

/**
 * Crta neprijatelja kao demona — rogovi, telo, ruke.
 * Boja dolazi iz enemy.def.color.
 * @param {CanvasRenderingContext2D} ctx
 * @param {EnemyState} enemy
 * @param {number} cx  centar X
 * @param {number} cy  vrh glave Y
 */
function _drawEnemySilhouette(ctx, enemy, cx, cy) {
  const color = enemy.def?.color ?? CONFIG.COLORS.ENEMY_GREMLIN;
  const dark  = _darken(color, 0.35);

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur  = 16;

  // --- Telo (pravougaonik zaobljenih ivica) ---
  const bW = 44, bH = 52;
  _roundRect(ctx, cx - bW / 2, cy + 32, bW, bH, 6);
  ctx.fillStyle = dark;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // --- Glava (krug) ---
  ctx.beginPath();
  ctx.arc(cx, cy + 18, 20, 0, Math.PI * 2);
  ctx.fillStyle = dark;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // --- Rogovi (demo/demon stilizacija) ---
  ctx.strokeStyle = color;
  ctx.lineWidth   = 3;
  ctx.lineCap     = 'round';
  // Levi rog
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 2);
  ctx.lineTo(cx - 18, cy - 14);
  ctx.lineTo(cx - 8, cy - 4);
  ctx.stroke();
  // Desni rog
  ctx.beginPath();
  ctx.moveTo(cx + 10, cy + 2);
  ctx.lineTo(cx + 18, cy - 14);
  ctx.lineTo(cx + 8, cy - 4);
  ctx.stroke();

  // --- Oči (crvene točke) ---
  ctx.fillStyle = '#ff4444';
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(cx - 7, cy + 16, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 7, cy + 16, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // --- Ruke (leva i desna, kosi pravci) ---
  ctx.shadowBlur = 0;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 4;
  ctx.lineCap     = 'round';
  // Leva ruka
  ctx.beginPath();
  ctx.moveTo(cx - bW / 2, cy + 46);
  ctx.lineTo(cx - bW / 2 - 14, cy + 62);
  ctx.stroke();
  // Desna ruka
  ctx.beginPath();
  ctx.moveTo(cx + bW / 2, cy + 46);
  ctx.lineTo(cx + bW / 2 + 14, cy + 62);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();

  // Ime ispod figure
  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.font         = 'bold 11px monospace';
  ctx.fillStyle    = color;
  ctx.fillText(enemy.def?.name ?? '', cx, cy + 88);
  ctx.restore();
}

// ── Igrač ────────────────────────────────────────────────────────────────────

/**
 * Crta igrača kao mađioničara — elegantna silhueta, šešir, štap.
 * @param {CanvasRenderingContext2D} ctx
 * @param {PlayerState} player
 * @param {number} cx
 * @param {number} cy
 */
function _drawPlayerSilhouette(ctx, player, cx, cy) {
  const color = CONFIG.COLORS.PLAYER_COLOR; // zlatna #e2b96f
  const dark  = _darken(color, 0.40);

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur  = 14;

  // --- Telo ---
  const bW = 38, bH = 50;
  _roundRect(ctx, cx - bW / 2, cy + 32, bW, bH, 5);
  ctx.fillStyle = dark;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // --- Ogrtač (trapez odozdo) ---
  ctx.beginPath();
  ctx.moveTo(cx - bW / 2, cy + 60);
  ctx.lineTo(cx - bW / 2 - 8, cy + 82);
  ctx.lineTo(cx + bW / 2 + 8, cy + 82);
  ctx.lineTo(cx + bW / 2, cy + 60);
  ctx.closePath();
  ctx.fillStyle = 'rgba(226, 185, 111, 0.18)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- Glava ---
  ctx.beginPath();
  ctx.arc(cx, cy + 18, 18, 0, Math.PI * 2);
  ctx.fillStyle = dark;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // --- Šešir čarobnjaka (trougao) ---
  ctx.strokeStyle = color;
  ctx.fillStyle   = dark;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10);       // vrh šešira
  ctx.lineTo(cx - 18, cy + 4);   // levo krilo
  ctx.lineTo(cx + 18, cy + 4);   // desno krilo
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Obod šešira
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --- Oči (zlatne) ---
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(cx - 6, cy + 18, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 6, cy + 18, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // --- Štap (desna strana) ---
  ctx.shadowBlur = 0;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 3;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + bW / 2, cy + 44);
  ctx.lineTo(cx + bW / 2 + 18, cy + 76);
  ctx.stroke();
  // Vrh štapa — mali krug
  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;
  ctx.beginPath();
  ctx.arc(cx + bW / 2 + 20, cy + 78, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();

  // "Mađioničar" label
  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.font         = 'bold 11px monospace';
  ctx.fillStyle    = color;
  ctx.fillText('Mađioničar', cx, cy + 88);
  ctx.restore();
}

// ── HP traka ─────────────────────────────────────────────────────────────────

/**
 * Crta HP traku ispod figure.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ hp: number, maxHp: number }} entity
 * @param {number} cx   centar X
 * @param {number} y    gornja ivica trake
 * @param {number} barW širina trake
 * @param {boolean} isPlayer
 */
function _drawHPBar(ctx, entity, cx, y, barW, isPlayer) {
  const pct      = Math.max(0, Math.min(1, entity.hp / entity.maxHp));
  const barColor = isPlayer ? CONFIG.COLORS.HP_PLAYER : CONFIG.COLORS.HP_ENEMY;
  const x        = cx - barW / 2;
  const barH     = 9;
  const r        = 3;

  // Pozadina
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  _roundRect(ctx, x, y, barW, barH, r);
  ctx.fill();

  // Popuna (clip na isti roundrect)
  if (pct > 0) {
    const fillW = barW * pct;
    // Low HP warning — menja boju u žutu/crvenu
    let fill = barColor;
    if (pct < 0.25) fill = '#e74c3c';
    else if (pct < 0.5) fill = '#f39c12';
    ctx.fillStyle = fill;
    ctx.save();
    _roundRect(ctx, x, y, barW, barH, r);
    ctx.clip();
    ctx.fillRect(x, y, fillW, barH);
    ctx.restore();
  }

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth   = 1;
  _roundRect(ctx, x, y, barW, barH, r);
  ctx.stroke();

  // HP label
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.font         = '10px monospace';
  ctx.fillStyle    = entity.hp < entity.maxHp * 0.25 ? '#ff6b6b' : CONFIG.COLORS.TEXT;
  ctx.fillText(`${entity.hp} / ${entity.maxHp}`, cx, y + barH + 3);

  ctx.restore();
}

// ── Shield ───────────────────────────────────────────────────────────────────

/**
 * Crta shield vrednost iznad figure (samo ako shield > 0).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ shield: number }} entity
 * @param {number} cx
 * @param {number} y    centar Y labele
 */
function _drawShieldIndicator(ctx, entity, cx, y) {
  if (!entity.shield || entity.shield <= 0) return;

  ctx.save();

  // Sitan okrugli badge
  const label = `🛡 ${entity.shield}`;
  ctx.font  = 'bold 12px monospace';
  const tw  = ctx.measureText(label).width;
  const pad = 6;
  const bW  = tw + pad * 2;
  const bH  = 18;
  const bX  = cx - bW / 2;
  const bY  = y - bH / 2;

  ctx.fillStyle = 'rgba(52, 152, 219, 0.22)';
  _roundRect(ctx, bX, bY, bW, bH, 4);
  ctx.fill();

  ctx.strokeStyle = CONFIG.COLORS.SHIELD;
  ctx.lineWidth   = 1.5;
  _roundRect(ctx, bX, bY, bW, bH, 4);
  ctx.stroke();

  ctx.fillStyle    = CONFIG.COLORS.SHIELD;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, y);

  ctx.restore();
}

// ── Efekti ───────────────────────────────────────────────────────────────────

/**
 * Crta aktivne efekte kao mini-badge-ove.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ effects: import('./state.js').ActiveEffect[] }} entity
 * @param {number} cx
 * @param {number} y    baseline Y
 */
function _drawEffectIcons(ctx, entity, cx, y) {
  if (!entity.effects || !entity.effects.length) return;

  const ICON  = { burn: '🔥', poison: '💀', weak: '⚠', regen: '💚' };
  const COLOR = { burn: '#e74c3c', poison: '#8e44ad', weak: '#7f8c8d', regen: '#27ae60' };

  const count  = entity.effects.length;
  const iconW  = 30; // širina po ikoni
  const totalW = count * iconW;
  const startX = cx - totalW / 2 + iconW / 2;

  ctx.save();
  entity.effects.forEach((eff, i) => {
    const icon  = ICON[eff.name]  ?? '?';
    const color = COLOR[eff.name] ?? '#aaa';
    const ex    = startX + i * iconW;

    // Mini badge pozadina
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    _roundRect(ctx, ex - 13, y - 11, 26, 16, 3);
    ctx.fill();

    ctx.font         = '10px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Emoji ikona
    ctx.fillText(icon, ex - 4, y - 3);

    // Trajanje
    ctx.fillStyle = color;
    ctx.font      = 'bold 9px monospace';
    ctx.fillText(`${eff.duration}`, ex + 8, y - 3);
  });
  ctx.restore();
}

// ── Intent ikona ──────────────────────────────────────────────────────────────

/**
 * Crta intent neprijatelja iznad figure.
 * attack → ⚔ + damage vrednost
 * block  → 🛡 + shield vrednost
 * buff   → ☠ + "debuff"
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {number} cx
 * @param {number} y    centar Y
 */
function _drawIntentIcon(ctx, state, cx, y) {
  if (!state.enemy.def) return;
  const pattern = state.enemy.def.intentPattern;
  if (!pattern || !pattern.length) return;
  const intent = pattern[state.enemy.intentIndex % pattern.length];

  ctx.save();

  // Badge pozadina
  const bgColor = intent.type === 'attack' ? 'rgba(192,57,43,0.22)'
                : intent.type === 'block'  ? 'rgba(41,128,185,0.22)'
                :                            'rgba(142,68,173,0.22)';

  const borderColor = intent.type === 'attack' ? '#e74c3c'
                    : intent.type === 'block'  ? '#3498db'
                    :                            '#8e44ad';

  const emoji = intent.type === 'attack' ? '⚔'
              : intent.type === 'block'  ? '🛡'
              :                            '☠';

  const label = intent.type === 'attack' ? `${intent.value} dmg`
              : intent.type === 'block'  ? `${intent.value} shi`
              :                            'debuff';

  // Badge
  const bW = 68, bH = 36;
  ctx.fillStyle = bgColor;
  _roundRect(ctx, cx - bW / 2, y - bH / 2, bW, bH, 6);
  ctx.fill();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth   = 1.5;
  _roundRect(ctx, cx - bW / 2, y - bH / 2, bW, bH, 6);
  ctx.stroke();

  // Emoji
  ctx.font         = '18px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = borderColor;
  ctx.fillText(emoji, cx, y - 6);

  // Label vrednost
  ctx.font      = 'bold 10px monospace';
  ctx.fillStyle = CONFIG.COLORS.TEXT_DIM;
  ctx.fillText(label, cx, y + 10);

  ctx.restore();
}

// ── Utility ───────────────────────────────────────────────────────────────────

/**
 * Iscrtava rounded rect path (bez fill/stroke — caller to radi).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r  border radius
 */
function _roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Potamni hex boju za senku i ispunu.
 * @param {string} hex  npr. '#aa8844'
 * @param {number} amt  0–1, koliko potamni
 * @returns {string}
 */
function _darken(hex, amt) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = Math.round(parseInt(hex.slice(0, 2), 16) * (1 - amt));
  const g = Math.round(parseInt(hex.slice(2, 4), 16) * (1 - amt));
  const b = Math.round(parseInt(hex.slice(4, 6), 16) * (1 - amt));
  return `rgb(${r},${g},${b})`;
}
