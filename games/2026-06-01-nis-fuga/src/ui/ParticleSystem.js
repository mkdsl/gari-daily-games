/**
 * ParticleSystem.js — Canvas-based particle effects for UI events
 * Used for achievement unlocks, resource gains/losses, scene transitions
 * @module ParticleSystem
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';

/** @type {HTMLCanvasElement|null} */
let canvas = null;

/** @type {CanvasRenderingContext2D|null} */
let ctx2d = null;

/** @type {Array<Particle>} */
let particles = [];

/** @type {number|null} RAF id */
let rafId = null;

/** @type {boolean} */
let running = false;

/**
 * Particle class
 */
class Particle {
  /**
   * @param {object} opts
   */
  constructor({ x, y, vx, vy, color, size, alpha, decay, gravity, spin }) {
    this.x = x;
    this.y = y;
    this.vx = vx ?? (Math.random() - 0.5) * 4;
    this.vy = vy ?? (Math.random() * -4 - 2);
    this.color = color ?? '#E8A24A';
    this.size = size ?? (Math.random() * 6 + 2);
    this.alpha = alpha ?? 1;
    this.decay = decay ?? (Math.random() * 0.015 + 0.01);
    this.gravity = gravity ?? 0.15;
    this.spin = spin ?? (Math.random() - 0.5) * 0.2;
    this.rotation = 0;
    this.alive = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.98;
    this.alpha -= this.decay;
    this.rotation += this.spin;
    if (this.alpha <= 0) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

class CircleParticle extends Particle {
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class StarParticle extends Particle {
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    drawStar(ctx, 0, 0, 5, this.size, this.size / 2);
    ctx.restore();
  }
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      cx + Math.cos(rot) * outerRadius,
      cy + Math.sin(rot) * outerRadius
    );
    rot += step;
    ctx.lineTo(
      cx + Math.cos(rot) * innerRadius,
      cy + Math.sin(rot) * innerRadius
    );
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

/**
 * Initialize particle system
 */
export function init() {
  canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 7000;
    width: 100%;
    height: 100%;
  `;
  document.body.appendChild(canvas);

  ctx2d = canvas.getContext('2d');
  resize();

  window.addEventListener('resize', resize);

  // Subscribe to game events
  EventBus.on(EVENTS.ACHIEVEMENT_UNLOCKED, ({ id }) => {
    burstAchievement();
  });

  EventBus.on(EVENTS.RESOURCE_CHANGED, ({ resource, delta, to }) => {
    if (delta > 0) {
      emitResourceGain(resource, delta);
    } else if (delta < 0 && to <= 1) {
      emitResourceCritical(resource);
    }
  });

  EventBus.on(EVENTS.GAME_ENDING, ({ endingId }) => {
    if (endingId === 'legendarno' || endingId === 'secret_s2') {
      celebrationBurst();
    }
  });

  start();
}

function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function start() {
  if (running) return;
  running = true;
  loop();
}

function loop() {
  if (!running) return;
  rafId = requestAnimationFrame(loop);

  if (!ctx2d) return;
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter(p => {
    p.update();
    if (p.alive) p.draw(ctx2d);
    return p.alive;
  });
}

/**
 * Burst particles from a screen position
 * @param {number} x
 * @param {number} y
 * @param {Array<string>} colors
 * @param {number} count
 * @param {'square'|'circle'|'star'} [shape='square']
 */
export function burst(x, y, colors = ['#E8A24A', '#FFD700', '#F5E6C8'], count = 20, shape = 'square') {
  const ParticleClass = shape === 'circle' ? CircleParticle : shape === 'star' ? StarParticle : Particle;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    particles.push(new ParticleClass({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 3,
      alpha: 1,
      decay: Math.random() * 0.02 + 0.01,
      gravity: 0.1
    }));
  }
}

/**
 * Achievement unlock burst — stars from top of screen
 */
export function burstAchievement() {
  const cx = window.innerWidth * 0.5;
  const cy = 50;
  for (let i = 0; i < 30; i++) {
    particles.push(new StarParticle({
      x: cx + (Math.random() - 0.5) * 200,
      y: cy,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -3 - 1,
      color: ['#FFD700', '#FFA500', '#E8A24A', '#FFFFFF'][Math.floor(Math.random() * 4)],
      size: Math.random() * 10 + 4,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008,
      gravity: 0.08
    }));
  }
}

/**
 * Resource gain — green sparkles near HUD
 * @param {string} resource
 * @param {number} delta
 */
function emitResourceGain(resource, delta) {
  // Position near resource bar (top of screen)
  const sectionMap = { time: 0.125, morale: 0.375, reputation: 0.625, patience: 0.875 };
  const xPct = sectionMap[resource] ?? 0.5;
  const x = window.innerWidth * xPct;
  const y = 72; // HUD height

  for (let i = 0; i < Math.min(delta * 4, 12); i++) {
    particles.push(new CircleParticle({
      x: x + (Math.random() - 0.5) * 40,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -(Math.random() * 2 + 1),
      color: '#4A9A4A',
      size: Math.random() * 5 + 2,
      alpha: 0.8,
      decay: 0.02,
      gravity: 0.05
    }));
  }
}

/**
 * Resource critical warning — red particles
 * @param {string} resource
 */
function emitResourceCritical(resource) {
  const sectionMap = { time: 0.125, morale: 0.375, reputation: 0.625, patience: 0.875 };
  const xPct = sectionMap[resource] ?? 0.5;
  const x = window.innerWidth * xPct;
  const y = 36;

  for (let i = 0; i < 10; i++) {
    particles.push(new Particle({
      x: x + (Math.random() - 0.5) * 30,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * -2 - 0.5,
      color: '#C0392B',
      size: Math.random() * 4 + 2,
      alpha: 0.9,
      decay: 0.025,
      gravity: 0.08
    }));
  }
}

/**
 * Celebration burst for best endings
 */
export function celebrationBurst() {
  const colors = ['#E8A24A', '#FFD700', '#4A7FA5', '#FF6B9D', '#FFFFFF', '#27AE60'];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (let wave = 0; wave < 5; wave++) {
    setTimeout(() => {
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        particles.push(new StarParticle({
          x: cx + (Math.random() - 0.5) * 100,
          y: cy + (Math.random() - 0.5) * 50,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 12 + 4,
          alpha: 1,
          decay: Math.random() * 0.012 + 0.006,
          gravity: 0.12,
          spin: (Math.random() - 0.5) * 0.3
        }));
      }
    }, wave * 200);
  }
}

/**
 * Scene transition: sweep particles across screen
 */
export function transitionSweep() {
  const h = window.innerHeight;
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle({
      x: -10,
      y: Math.random() * h,
      vx: Math.random() * 10 + 5,
      vy: (Math.random() - 0.5) * 2,
      color: 'rgba(232,162,74,0.6)',
      size: Math.random() * 4 + 1,
      alpha: 0.8,
      decay: 0.005,
      gravity: 0
    }));
  }
}

/**
 * Stop particle system
 */
export function stop() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  particles = [];
}

export default { init, burst, burstAchievement, celebrationBurst, transitionSweep, stop };
