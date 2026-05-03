/**
 * @file render.js
 * Fermenter — Varenički Bunt
 * Canvas animacije: bubble efekti i prestiže particle explosion.
 * Canvas overlay-uje cijeli ekran (pointer-events: none).
 */

import { CONFIG } from './config.js';

/** @type {CanvasRenderingContext2D|null} */
let ctx = null;

/** @type {HTMLCanvasElement|null} */
let _canvas = null;

/** @type {Array<Bubble>} */
let bubbles = [];

/** @type {Array<Particle>} */
let particles = [];

/** true dok traje prestiže explosion — privremeno gasi normalni bubble render */
let explosionActive = false;

/** rAF ID za čišćenje */
let rafId = null;

/**
 * @typedef {{ x: number, y: number, r: number, maxR: number, opacity: number, color: string, born: number }} Bubble
 * @typedef {{ x: number, y: number, vx: number, vy: number, opacity: number, color: string, born: number, life: number }} Particle
 */

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Inicijalizuje renderer: postavi canvas dimensions i pokreni rAF loop.
 * @param {HTMLCanvasElement} canvas
 */
export function initRenderer(canvas) {
  _canvas = canvas;
  ctx = canvas.getContext('2d');

  _resize();
  window.addEventListener('resize', _resize);

  _startLoop();
}

/**
 * Spawna bubble animacije na datim ekranskim koordinatama.
 * @param {number} x — clientX pozicija
 * @param {number} y — clientY pozicija
 * @param {number} count — broj bubbles (3–5)
 */
export function spawnBubbles(x, y, count) {
  if (!ctx) return;

  // Canvas je full-screen, koordinate su direktno clientX/Y
  const now = performance.now();
  const colors = ['#d4a017', '#f5f0e8', '#d4a017', '#c8910e'];

  for (let i = 0; i < count; i++) {
    if (bubbles.length >= CONFIG.MAX_BUBBLES) break;
    bubbles.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 30,
      r: 2,
      maxR: 8 + Math.random() * 10, // 8–18
      opacity: 1.0,
      color: colors[Math.floor(Math.random() * colors.length)],
      born: now,
    });
  }
}

/**
 * Triggeruje prestiže particle explosion (40 čestica, 1s animacija).
 * Privremeno gasi normalni bubble render tokom +0.5s buffer-a.
 * @param {HTMLCanvasElement} canvas — ignorise se, koristimo interni _canvas
 * @param {Function} onComplete — poziva se posle 1.0s
 */
export function triggerPrestigeExplosion(canvas, onComplete) {
  if (!ctx || !_canvas) {
    // Renderer nije inicijalizovan — odmah pozovi callback
    if (onComplete) onComplete();
    return;
  }

  explosionActive = true;
  particles = [];
  bubbles = []; // Očisti bubbles

  const cx = _canvas.width / 2;
  const cy = _canvas.height / 2;
  const count = CONFIG.PRESTIGE_PARTICLE_COUNT;
  const now = performance.now();
  const colors = ['#d4a017', '#f5f0e8', '#c8910e', '#ffd700', '#b8860b'];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
    const speed = 80 + Math.random() * 160; // px/s
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      opacity: 1.0,
      color: colors[Math.floor(Math.random() * colors.length)],
      born: now,
      life: 900 + Math.random() * 200, // ms — 0.9–1.1s
    });
  }

  // Callback posle 1.0s, explosion flag se gasi posle 1.5s
  setTimeout(() => {
    if (onComplete) onComplete();
  }, 1000);

  setTimeout(() => {
    explosionActive = false;
    particles = [];
  }, 1500);
}

/**
 * Triggeruje vizuelni pulse na barrel elementu (scale 1.0 → 1.04 → 1.0, 120ms).
 * Koristi CSS klasu 'pulsing-barrel' koja se uklanja posle animacije.
 * @param {HTMLElement} barrelEl
 */
export function pulseBarrel(barrelEl) {
  if (!barrelEl) return;
  barrelEl.classList.remove('pulsing-barrel');
  // Reflow da se reset animacije aktivira
  void barrelEl.offsetWidth;
  barrelEl.classList.add('pulsing-barrel');
  setTimeout(() => {
    barrelEl.classList.remove('pulsing-barrel');
  }, 150);
}

// ── Interni render loop ─────────────────────────────────────────────────────

function _startLoop() {
  if (rafId !== null) cancelAnimationFrame(rafId);

  function loop(timestamp) {
    rafId = requestAnimationFrame(loop);
    _render(timestamp);
  }

  rafId = requestAnimationFrame(loop);
}

/**
 * Render frame — čisti canvas i crta sve aktivne animacije.
 * @param {number} timestamp — performance.now()
 */
function _render(timestamp) {
  if (!ctx || !_canvas) return;

  ctx.clearRect(0, 0, _canvas.width, _canvas.height);

  if (explosionActive) {
    _renderParticles(timestamp);
  } else {
    _renderBubbles(timestamp);
  }
}

/**
 * Crta i ažurira bubble animacije.
 * @param {number} now — performance.now()
 */
function _renderBubbles(now) {
  const duration = 400; // ms — trajanje bubble animacije

  bubbles = bubbles.filter(b => {
    const age = now - b.born;
    if (age > duration) return false;

    const progress = age / duration; // 0 → 1
    b.r = 2 + (b.maxR - 2) * progress;
    b.opacity = 1.0 - progress;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = b.color;
    ctx.globalAlpha = b.opacity * 0.85;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    return true;
  });
}

/**
 * Crta i ažurira prestiže particle explosion.
 * @param {number} now — performance.now()
 */
function _renderParticles(now) {
  particles = particles.filter(p => {
    const age = now - p.born;
    if (age > p.life) return false;

    const progress = age / p.life; // 0 → 1
    p.opacity = 1.0 - progress;

    // Gravitacija: vy raste blago
    const t = age / 1000; // sekunde
    const px = p.x + p.vx * t;
    const py = p.y + p.vy * t + 40 * t * t; // blaga gravitacija

    const radius = 4 + 3 * (1 - progress);

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.fill();
    ctx.globalAlpha = 1;

    return true;
  });
}

// ── Canvas resize ────────────────────────────────────────────────────────────

function _resize() {
  if (!_canvas) return;
  _canvas.width = window.innerWidth;
  _canvas.height = window.innerHeight;
}
