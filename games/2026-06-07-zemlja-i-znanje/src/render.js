/**
 * render.js — Canvas layer za Zemlja i Znanje
 * Izometrijska pozadina imanja, figurice polaznika, svetlo, kiša, particle efekti
 * PRAVILO: render.js NIKAD ne dira DOM. Samo canvas ctx.
 */

import { bus, EVT } from './events.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, FIGURE_FPS, FIGURE_SIZE, DAY_LIGHTING } from './config.js';
import { lerp, lerpColor, clamp } from './utils.js';

// === STATE ===
let _canvas = null;
let _ctx = null;
let _microState = null;
let _macroState = null;
let _metaState = null;

// Particles
let _particles = [];

// Rain drops
let _rainDrops = [];
let _isRaining = false;

// Figure animation
let _figureFrame = 0;
let _figureTimer = 0;

// Day lighting filter
let _lightingMode = 'morning';
let _lightingTransition = 0;

// Buildings unlocked
let _extraBuilding = false;

// Canvas size
let _W = CANVAS_WIDTH;
let _H = CANVAS_HEIGHT;

/**
 * Initialize renderer
 */
export function initRenderer(canvas) {
  _canvas = canvas;
  _ctx = canvas.getContext('2d');
  resizeCanvas();

  // Listen bus events
  bus.on(EVT.RAIN_START, () => { _isRaining = true; startRain(); });
  bus.on(EVT.RAIN_STOP, () => { _isRaining = false; _rainDrops = []; });
  bus.on(EVT.PARTICLE_CONFETTI, ({ x, y, count }) => spawnConfetti(x, y, count));
  bus.on(EVT.PARTICLE_GOLD, ({ x, y, count }) => spawnGold(x, y, count));
  bus.on(EVT.PARTICLE_ALERT, ({ x, y }) => spawnAlert(x, y));
  bus.on(EVT.SESSION_TICK, ({ micro }) => { _microState = micro; });
  bus.on(EVT.WEATHER_CHANGE, ({ weatherId }) => { _isRaining = weatherId === 'rainy' || weatherId === 'stormy'; });
}

export function setRenderState(micro, macro, meta) {
  _microState = micro;
  _macroState = macro;
  _metaState = meta;
  _extraBuilding = meta?.canvasBuildings?.includes('nova_zgrada') || false;
}

function resizeCanvas() {
  if (!_canvas) return;
  const container = _canvas.parentElement;
  const cw = container?.clientWidth || 800;
  const ch = container?.clientHeight || 500;
  _W = _canvas.width = cw;
  _H = _canvas.height = ch;
}

// === MAIN RENDER ===
export function renderFrame(timestamp, deltaMs) {
  if (!_ctx) return;

  resizeCanvas();
  _ctx.clearRect(0, 0, _W, _H);

  // Update figure animation
  _figureTimer += deltaMs;
  if (_figureTimer > 1000 / FIGURE_FPS) {
    _figureTimer = 0;
    _figureFrame = (_figureFrame + 1) % 4;
  }

  // Determine day lighting
  updateLighting();

  // Draw layers
  drawBackground();
  drawIsometricFarm();
  if (_extraBuilding) drawExtraBuilding();
  drawParticipantFigures();
  drawRain();
  drawParticles(deltaMs);
  applyLightingFilter();
}

// === BACKGROUND ===
function drawBackground() {
  // Sky gradient
  const skyColors = {
    morning:   ['#1A2416', '#2C3E2A'],
    midday:    ['#4A6741', '#5A7A52'],
    afternoon: ['#3D5230', '#2C3E2A']
  };
  const cols = skyColors[_lightingMode] || skyColors.morning;
  const grad = _ctx.createLinearGradient(0, 0, 0, _H * 0.5);
  grad.addColorStop(0, cols[0]);
  grad.addColorStop(1, cols[1]);
  _ctx.fillStyle = grad;
  _ctx.fillRect(0, 0, _W, _H);

  // Ground
  _ctx.fillStyle = '#2A3A1E';
  _ctx.fillRect(0, _H * 0.5, _W, _H * 0.5);
}

// === ISO FARM ===
function drawIsometricFarm() {
  const cx = _W / 2;
  const cy = _H * 0.55;

  // === TERASA (main platform) ===
  drawIsoPlatform(cx - 100, cy - 40, 220, 120, '#4A6741', '#3A5031', '#2A3822');

  // === ZIDOVI (stone wall) ===
  drawStoneWall(cx - 90, cy - 20, 80, 35);

  // === RADIONICA (workshop) ===
  drawWorkshop(cx + 20, cy - 60);

  // === JEZERCE (pond) ===
  drawPond(cx - 150, cy + 10);

  // === PATH ===
  drawPath(cx, cy + 50);

  // === TREES ===
  drawTree(cx - 200, cy - 20, 0.9);
  drawTree(cx + 170, cy - 30, 1.1);
  drawTree(cx - 180, cy + 60, 0.7);
}

function drawIsoPlatform(x, y, w, d, topColor, sideColor, shadowColor) {
  const h = d * 0.3;
  // Top face
  _ctx.fillStyle = topColor;
  _ctx.beginPath();
  _ctx.moveTo(x + w / 2, y);
  _ctx.lineTo(x + w, y + h);
  _ctx.lineTo(x + w / 2, y + h * 2);
  _ctx.lineTo(x, y + h);
  _ctx.closePath();
  _ctx.fill();
  // Right face
  _ctx.fillStyle = sideColor;
  _ctx.beginPath();
  _ctx.moveTo(x + w, y + h);
  _ctx.lineTo(x + w, y + h + 20);
  _ctx.lineTo(x + w / 2, y + h * 2 + 20);
  _ctx.lineTo(x + w / 2, y + h * 2);
  _ctx.closePath();
  _ctx.fill();
  // Left face
  _ctx.fillStyle = shadowColor;
  _ctx.beginPath();
  _ctx.moveTo(x, y + h);
  _ctx.lineTo(x, y + h + 20);
  _ctx.lineTo(x + w / 2, y + h * 2 + 20);
  _ctx.lineTo(x + w / 2, y + h * 2);
  _ctx.closePath();
  _ctx.fill();
}

function drawStoneWall(x, y, w, h) {
  // Stone wall using CSS-like pixel art approach
  _ctx.fillStyle = '#E8E0D0';
  _ctx.fillRect(x, y, w, h);
  // Stone texture (3×3 grid)
  _ctx.fillStyle = '#C8C0B0';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const offset = row % 2 === 0 ? 0 : w / 8;
      _ctx.fillRect(x + col * (w / 4) + offset + 1, y + row * (h / 3) + 1, w / 4 - 2, h / 3 - 2);
    }
  }
  // Shadow bottom
  _ctx.fillStyle = 'rgba(0,0,0,0.3)';
  _ctx.fillRect(x, y + h - 4, w, 4);
}

function drawWorkshop(x, y) {
  const bw = 60, bh = 50, rh = 20;
  // Wall
  _ctx.fillStyle = '#A0522D';
  _ctx.fillRect(x, y, bw, bh);
  // Roof
  _ctx.fillStyle = '#8B4513';
  _ctx.beginPath();
  _ctx.moveTo(x - 5, y);
  _ctx.lineTo(x + bw / 2, y - rh);
  _ctx.lineTo(x + bw + 5, y);
  _ctx.closePath();
  _ctx.fill();
  // Door
  _ctx.fillStyle = '#5C2D0E';
  _ctx.fillRect(x + 20, y + 25, 18, 25);
  // Window
  _ctx.fillStyle = '#87CEEB';
  _ctx.fillRect(x + 8, y + 10, 14, 14);
  _ctx.strokeStyle = '#5C2D0E';
  _ctx.lineWidth = 1;
  _ctx.strokeRect(x + 8, y + 10, 14, 14);
  // Sign
  _ctx.fillStyle = '#F4C430';
  _ctx.font = 'bold 7px sans-serif';
  _ctx.textAlign = 'center';
  _ctx.fillText('RADIONICA', x + bw / 2, y + 8);
  _ctx.textAlign = 'left';
}

function drawPond(x, y) {
  // Oval pond
  _ctx.fillStyle = '#2C5F6E';
  _ctx.beginPath();
  _ctx.ellipse(x, y, 40, 22, 0, 0, Math.PI * 2);
  _ctx.fill();
  // Ripple
  _ctx.strokeStyle = 'rgba(100,180,210,0.4)';
  _ctx.lineWidth = 1;
  _ctx.beginPath();
  _ctx.ellipse(x, y, 28, 14, 0, 0, Math.PI * 2);
  _ctx.stroke();
  // Water reflection shimmer
  _ctx.fillStyle = 'rgba(100,180,210,0.25)';
  _ctx.beginPath();
  _ctx.ellipse(x - 8, y - 5, 12, 6, -0.3, 0, Math.PI * 2);
  _ctx.fill();
}

function drawPath(x, y) {
  _ctx.fillStyle = '#C4956A';
  _ctx.beginPath();
  _ctx.moveTo(x - 15, y);
  _ctx.lineTo(x + 15, y);
  _ctx.lineTo(x + 20, y + 60);
  _ctx.lineTo(x - 20, y + 60);
  _ctx.closePath();
  _ctx.fill();
}

function drawTree(x, y, scale = 1.0) {
  const tw = 16 * scale, th = 30 * scale, ts = 6 * scale;
  // Trunk
  _ctx.fillStyle = '#6B4226';
  _ctx.fillRect(x - ts / 2, y, ts, th * 0.5);
  // Foliage layers
  _ctx.fillStyle = '#3A7A2A';
  for (let i = 0; i < 3; i++) {
    const w = (tw - i * 4 * scale);
    const layerY = y - (i * 12 * scale);
    _ctx.beginPath();
    _ctx.moveTo(x, layerY - 14 * scale);
    _ctx.lineTo(x + w / 2, layerY);
    _ctx.lineTo(x - w / 2, layerY);
    _ctx.closePath();
    _ctx.fill();
  }
}

function drawExtraBuilding() {
  const x = _W / 2 - 280, y = _H * 0.4;
  // New building: classroom
  _ctx.fillStyle = '#C4956A';
  _ctx.fillRect(x, y, 55, 45);
  _ctx.fillStyle = '#9B7040';
  _ctx.beginPath();
  _ctx.moveTo(x - 4, y);
  _ctx.lineTo(x + 27, y - 18);
  _ctx.lineTo(x + 59, y);
  _ctx.closePath();
  _ctx.fill();
  _ctx.fillStyle = '#F2EDE4';
  _ctx.font = 'bold 6px sans-serif';
  _ctx.textAlign = 'center';
  _ctx.fillText('UČIONICA', x + 27, y + 8);
  _ctx.textAlign = 'left';
}

// === FIGURICE POLAZNIKA ===
function drawParticipantFigures() {
  if (!_microState?.participantStates) return;

  const present = _microState.participantStates.filter(p => p.isPresent);
  const cx = _W / 2;
  const cy = _H * 0.62;
  const spacing = 36;
  const totalW = (present.length - 1) * spacing;
  const startX = cx - totalW / 2;

  present.forEach((p, i) => {
    const x = startX + i * spacing;
    const y = cy + Math.sin((Date.now() / 600 + i) * 0.8) * 2; // gentle bob
    drawFigure(x, y, p.mood, i);
  });
}

function drawFigure(x, y, mood, idx) {
  const frame = _figureFrame;
  const walkOffset = (frame === 1 || frame === 3) ? 1 : 0;

  // Shadow
  _ctx.fillStyle = 'rgba(0,0,0,0.2)';
  _ctx.beginPath();
  _ctx.ellipse(x, y + 22, 8, 3, 0, 0, Math.PI * 2);
  _ctx.fill();

  // Body color based on mood
  const bodyColors = { happy: '#5aad5a', neutral: '#4A6741', tired: '#A09060', unhappy: '#804040' };
  const bodyColor = bodyColors[mood] || bodyColors.neutral;

  // Legs (walk animation)
  _ctx.fillStyle = '#5C2D0E';
  _ctx.fillRect(x - 5, y + 13, 4, 8 + walkOffset);
  _ctx.fillRect(x + 1, y + 13, 4, 8 - walkOffset);

  // Body
  _ctx.fillStyle = bodyColor;
  _ctx.fillRect(x - 6, y + 3, 12, 12);

  // Arms
  _ctx.fillStyle = bodyColor;
  _ctx.fillRect(x - 10, y + 4, 4, 8);
  _ctx.fillRect(x + 6, y + 4, 4, 8);

  // Head
  _ctx.fillStyle = '#C4956A';
  _ctx.beginPath();
  _ctx.arc(x, y, 8, 0, Math.PI * 2);
  _ctx.fill();

  // Face
  _ctx.fillStyle = '#5C2D0E';
  if (mood === 'happy') {
    // Smile
    _ctx.beginPath();
    _ctx.arc(x, y + 2, 4, 0.1, Math.PI - 0.1);
    _ctx.stroke();
  } else if (mood === 'unhappy') {
    // Frown
    _ctx.beginPath();
    _ctx.arc(x, y + 5, 4, Math.PI + 0.1, -0.1);
    _ctx.stroke();
  }
  // Eyes
  _ctx.fillRect(x - 3, y - 2, 2, 2);
  _ctx.fillRect(x + 1, y - 2, 2, 2);
}

// === RAIN ===
function startRain() {
  _rainDrops = [];
  for (let i = 0; i < 80; i++) {
    _rainDrops.push({
      x: Math.random() * _W,
      y: Math.random() * _H,
      speed: 3 + Math.random() * 3,
      len: 8 + Math.random() * 8,
      opacity: 0.2 + Math.random() * 0.3
    });
  }
}

function drawRain() {
  if (!_isRaining || !_rainDrops.length) return;

  _ctx.save();
  _rainDrops.forEach(drop => {
    drop.y += drop.speed;
    drop.x -= drop.speed * 0.3;
    if (drop.y > _H) {
      drop.y = -drop.len;
      drop.x = Math.random() * _W;
    }

    _ctx.strokeStyle = `rgba(100, 180, 255, ${drop.opacity})`;
    _ctx.lineWidth = 1;
    _ctx.beginPath();
    _ctx.moveTo(drop.x, drop.y);
    _ctx.lineTo(drop.x - 2, drop.y + drop.len);
    _ctx.stroke();
  });
  _ctx.restore();
}

// === PARTICLES ===
function spawnConfetti(cx, cy, count) {
  const colors = ['#F4C430', '#4A6741', '#A0522D', '#2C5F6E', '#E8E0D0', '#C4956A'];
  for (let i = 0; i < count; i++) {
    _particles.push({
      type: 'confetti',
      x: cx + (Math.random() - 0.5) * 100,
      y: cy + (Math.random() - 0.5) * 50,
      vx: (Math.random() - 0.5) * 5,
      vy: -(Math.random() * 5 + 2),
      life: 1.0,
      decay: 0.01 + Math.random() * 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.3
    });
  }
}

function spawnGold(cx, cy, count) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    _particles.push({
      type: 'gold',
      x: cx, y: cy,
      vx: Math.cos(angle) * (2 + Math.random() * 3),
      vy: Math.sin(angle) * (2 + Math.random() * 3) - 2,
      life: 1.0,
      decay: 0.008,
      color: '#F4C430',
      size: 3 + Math.random() * 4
    });
  }
}

function spawnAlert(cx, cy) {
  for (let i = 0; i < 10; i++) {
    _particles.push({
      type: 'alert',
      x: cx, y: cy,
      vx: (Math.random() - 0.5) * 4,
      vy: -(Math.random() * 4 + 1),
      life: 1.0,
      decay: 0.03,
      color: '#cc3333',
      size: 5
    });
  }
}

function drawParticles(deltaMs) {
  const dt = deltaMs / 16.667;

  _particles = _particles.filter(p => p.life > 0);

  for (const p of _particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.15 * dt; // gravity
    p.life -= p.decay * dt;

    if (p.rot !== undefined) p.rot += (p.rotV || 0) * dt;

    _ctx.save();
    _ctx.globalAlpha = Math.max(0, p.life);

    if (p.type === 'confetti') {
      _ctx.translate(p.x, p.y);
      _ctx.rotate(p.rot || 0);
      _ctx.fillStyle = p.color;
      _ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      _ctx.fillStyle = p.color;
      _ctx.beginPath();
      _ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      _ctx.fill();
    }
    _ctx.restore();
  }
}

// === LIGHTING ===
function updateLighting() {
  if (!_microState) { _lightingMode = 'morning'; return; }
  const hour = _microState.gameMinute / 60;
  if (hour < 2) _lightingMode = 'morning';
  else if (hour < 5) _lightingMode = 'midday';
  else _lightingMode = 'afternoon';
}

function applyLightingFilter() {
  const lighting = DAY_LIGHTING[_lightingMode] || DAY_LIGHTING.morning;
  // Apply as CSS filter on canvas element (non-invasive)
  if (_canvas) {
    _canvas.style.filter = lighting.filter;
  }
}

export function clearParticles() {
  _particles = [];
}

export function getCanvasSize() {
  return { w: _W, h: _H };
}
