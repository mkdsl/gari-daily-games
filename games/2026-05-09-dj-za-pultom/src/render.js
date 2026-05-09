/**
 * render.js — Canvas vizualizacija za DJ za pultom
 * Pera Piksel + Jova jQuery | Gari Daily Games
 */

import { getCurrentZone } from '../state.js';

// --- Konstante ---
const ZONE_COLORS = {
  zagrevanje:  { bg: '#0d2a1e', accent: '#00e676', tint: 'rgba(0,230,118,0.08)' },
  vrhunac:     { bg: '#1a0d00', accent: '#ff8c00', tint: 'rgba(255,140,0,0.10)' },
  after_hours: { bg: '#05080f', accent: '#7986cb', tint: 'rgba(121,134,203,0.08)' },
};

const DEFAULT_ZONE = ZONE_COLORS.zagrevanje;

// Avala silhueta — normalizovani poligon (x 0–1, y 0–1, y=0 je vrh)
const AVALA_POINTS = [
  [0.00, 1.00], [0.10, 1.00], [0.15, 0.72], [0.22, 0.60],
  [0.28, 0.55], [0.32, 0.48], [0.36, 0.38], [0.40, 0.42],
  [0.44, 0.52], [0.50, 0.35], [0.54, 0.40], [0.58, 0.50],
  [0.63, 0.58], [0.68, 0.62], [0.75, 0.55], [0.80, 0.65],
  [0.86, 0.70], [0.92, 0.75], [1.00, 1.00],
];

// --- Stanje renderera ---
let canvas = null;
let ctx = null;
let dpr = 1;
let animFrameId = null;
let lastState = null;

// --- Init ---
export function initCanvas(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  dpr = window.devicePixelRatio || 1;

  resizeCanvas();

  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Pokreni petlju
  startLoop();
}

function resizeCanvas() {
  if (!canvas) return;
  const parent = canvas.parentElement;
  const w = parent ? Math.min(parent.clientWidth, 480) : 375;
  const h = parent ? parent.clientHeight : 320;

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// --- Loop ---
function startLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  function loop() {
    if (lastState) renderFrame(lastState);
    animFrameId = requestAnimationFrame(loop);
  }

  animFrameId = requestAnimationFrame(loop);
}

// --- Main render ---
export function renderFrame(state) {
  lastState = state;
  if (!ctx || !canvas) return;

  const W = canvas.width / dpr;
  const H = canvas.height / dpr;
  const now = performance.now() / 1000; // sekunde

  const zoneName = (state && state.phase === 'playing')
    ? (getCurrentZone ? getCurrentZone() || 'zagrevanje' : 'zagrevanje')
    : 'zagrevanje';

  const zone = ZONE_COLORS[zoneName] || DEFAULT_ZONE;

  // 1. Pozadina
  drawBackground(W, H, zone, now, zoneName, state);

  // 2. Avala silhueta (samo after_hours)
  if (zoneName === 'after_hours') {
    drawAvala(W, H);
  }

  // 3. Crowd masa
  const energy = (state && state.crowd_energy != null) ? state.crowd_energy : 50;
  drawCrowd(W, H, energy, zone, now);

  // 4. Pult
  const elapsed = (state && state.elapsed_s != null) ? state.elapsed_s : 0;
  drawDeck(W, H, zone, now, elapsed, energy);

  // 5. BPM counter
  drawBPM(W, H, now, elapsed);
}

// --- Pozadina ---
function drawBackground(W, H, zone, now, zoneName, state) {
  // Gradijent iz zone boje
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, zone.bg);
  grad.addColorStop(1, '#0d1b2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Suptilni tint overlay
  ctx.fillStyle = zone.tint;
  ctx.fillRect(0, 0, W, H);

  // Ambijentalni "laserski" zraci u vrhucu
  if (zoneName === 'vrhunac') {
    drawLasers(W, H, now);
  }
}

function drawLasers(W, H, now) {
  const cx = W / 2;
  const cy = H * 0.35;
  const count = 6;

  ctx.save();
  ctx.globalAlpha = 0.07 + 0.04 * Math.sin(now * 1.3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI + now * 0.15;
    const len = H * 0.8;
    ctx.strokeStyle = i % 2 === 0 ? '#ff8c00' : '#e040fb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.restore();
}

// --- Avala silhueta ---
function drawAvala(W, H) {
  const silH = H * 0.45;
  const silY = H - silH;

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#1a237e';

  ctx.beginPath();
  AVALA_POINTS.forEach(([nx, ny], i) => {
    const x = nx * W;
    const y = silY + ny * silH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// --- Crowd masa ---
function drawCrowd(W, H, energy, zone, now) {
  const crowdH = H * 0.22;
  const crowdY = H - crowdH;
  const cols = 18;
  const rows = 5;
  const blockW = W / cols;
  const blockH = crowdH / rows;
  const filled = Math.round((energy / 100) * cols * rows);

  ctx.save();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= filled) continue;

      // Bobanje
      const bob = Math.sin(now * 2.2 + c * 0.5 + r * 0.8) * 2;
      const x = c * blockW + blockW * 0.1;
      const y = crowdY + r * blockH + bob;
      const bw = blockW * 0.8;
      const bh = blockH * 0.75;

      // Boja bloka — varijacija
      const hue = (idx * 7 + now * 20) % 360;
      ctx.fillStyle = `hsla(${hue},60%,55%,0.55)`;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(x, y, bw, bh, 2)
        : ctx.rect(x, y, bw, bh);
      ctx.fill();
    }
  }
  ctx.restore();
}

// --- Pult ---
function drawDeck(W, H, zone, now, elapsed, energy) {
  const cx = W / 2;
  const cy = H * 0.40;
  const deckW = Math.min(W * 0.68, 260);
  const deckH = deckW * 0.38;

  // BPM puls — intenzitet raste sa energijom
  const bpmSpeed = 120 + (elapsed / 21600) * 60; // 120→180
  const pulseFreq = bpmSpeed / 60;
  const pulse = 0.5 + 0.5 * Math.sin(now * pulseFreq * Math.PI * 2);
  const glowSize = 4 + pulse * 14 * (energy / 100);

  // Glow outline
  ctx.save();
  ctx.shadowColor = zone.accent;
  ctx.shadowBlur = glowSize;
  ctx.strokeStyle = zone.accent;
  ctx.lineWidth = 2 + pulse * 2;
  const rx = cx - deckW / 2;
  const ry = cy - deckH / 2;
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(rx - 4, ry - 4, deckW + 8, deckH + 8, 10)
    : ctx.rect(rx - 4, ry - 4, deckW + 8, deckH + 8);
  ctx.stroke();
  ctx.restore();

  // Tijelo pulta
  ctx.save();
  ctx.fillStyle = '#1c2736';
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(rx, ry, deckW, deckH, 8)
    : ctx.rect(rx, ry, deckW, deckH);
  ctx.fill();

  // Linija "mixer" u sredini
  ctx.fillStyle = '#263040';
  ctx.fillRect(cx - 18, ry + 6, 36, deckH - 12);

  ctx.restore();

  // Vinili
  drawVinyl(cx - deckW * 0.32, cy, deckH * 0.38, now, zone, energy);
  drawVinyl(cx + deckW * 0.32, cy, deckH * 0.38, now, zone, energy);

  // Fader linija (dekorativna)
  ctx.save();
  ctx.strokeStyle = '#e040fb';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy);
  ctx.lineTo(cx + 14, cy);
  ctx.stroke();

  // Fader dugme
  const faderX = cx + (Math.sin(now * 0.7) * 10);
  ctx.fillStyle = '#e040fb';
  ctx.beginPath();
  ctx.arc(faderX, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVinyl(x, y, r, now, zone, energy) {
  const speed = 0.8 + (energy / 100) * 1.2;

  ctx.save();
  ctx.translate(x, y);

  // Osnova vinila
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#111820';
  ctx.fill();

  // Grooves (rotiraju)
  ctx.rotate(now * speed);
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r * (i / 5), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.04 + i * 0.02})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.rotate(-now * speed);

  // Label u sredini
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = zone.accent;
  ctx.globalAlpha = 0.85;
  ctx.fill();

  // Centar tačka
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = '#0d1b2a';
  ctx.globalAlpha = 1;
  ctx.fill();

  ctx.restore();
}

// --- BPM counter ---
function drawBPM(W, H, now, elapsed) {
  const bpm = Math.round(120 + (elapsed / 21600) * 60 + Math.sin(now * 0.8) * 3);
  const cx = W / 2;
  const y = H * 0.62;

  // Flicker efekat
  const flicker = 0.85 + 0.15 * Math.abs(Math.sin(now * 7.3));

  ctx.save();
  ctx.globalAlpha = flicker;
  ctx.font = `bold ${Math.round(W * 0.065)}px 'system-ui', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f0f0f0';
  ctx.letterSpacing = '2px';
  ctx.fillText(`${bpm} BPM`, cx, y);

  // Podlinija
  ctx.globalAlpha = flicker * 0.5;
  ctx.font = `${Math.round(W * 0.03)}px 'system-ui', sans-serif`;
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('BEATS PER MINUTE', cx, y + Math.round(W * 0.048));
  ctx.restore();
}
