// render.js — Canvas: VU meter (3 zones, 60fps)
import { getAnalyser } from './audio.js';

const ZONES = [
  { label: 'BASS',  binStart: 0,  binEnd: 4,  color: '#00FF88' },
  { label: 'MID',   binStart: 5,  binEnd: 15, color: '#00CFFF' },
  { label: 'HIGHS', binStart: 16, binEnd: 30, color: '#F5A623' },
];

let canvas, ctx2d, rafId;
let running = false;

export function initRenderer(canvasEl) {
  canvas = canvasEl;
  ctx2d = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = Math.min(rect.width, 480);
  const h = 120;
  canvas.width = w;
  canvas.height = h;
  canvas.style.height = h + 'px';
}

export function startRenderer() {
  if (running) return;
  running = true;
  renderFrame();
}

export function stopRenderer() {
  running = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (ctx2d && canvas) {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function renderFrame() {
  if (!running) return;

  const analyser = getAnalyser();
  const W = canvas.width;
  const H = canvas.height;
  const padding = 12;
  const gap = 8;
  const zoneCount = ZONES.length;
  const barWidth = (W - padding * 2 - gap * (zoneCount - 1)) / zoneCount;

  ctx2d.clearRect(0, 0, W, H);

  // Background
  ctx2d.fillStyle = '#111111';
  ctx2d.fillRect(0, 0, W, H);

  if (analyser) {
    const bufLen = analyser.frequencyBinCount;
    const dataArr = new Uint8Array(bufLen);
    analyser.getByteFrequencyData(dataArr);

    ZONES.forEach((zone, i) => {
      const x = padding + i * (barWidth + gap);

      // Average the bins in this zone
      let sum = 0;
      const count = zone.binEnd - zone.binStart + 1;
      for (let b = zone.binStart; b <= zone.binEnd && b < bufLen; b++) {
        sum += dataArr[b];
      }
      const avg = sum / count; // 0-255
      const level = avg / 255; // 0-1
      const barH = Math.max(2, level * (H - 20));
      const y = H - 10 - barH;

      // Background track
      ctx2d.fillStyle = '#1E1E1E';
      roundRect(ctx2d, x, 10, barWidth, H - 20, 4);
      ctx2d.fill();

      // Color gradient based on level
      let barColor = zone.color;
      if (level > 0.85) barColor = '#FF3B3B';
      else if (level > 0.6) barColor = '#F5A623';

      const grad = ctx2d.createLinearGradient(x, y + barH, x, y);
      grad.addColorStop(0, barColor);
      grad.addColorStop(1, barColor + 'AA');
      ctx2d.fillStyle = grad;
      roundRect(ctx2d, x, y, barWidth, barH, 4);
      ctx2d.fill();

      // Label
      ctx2d.fillStyle = '#666666';
      ctx2d.font = '10px Courier New, monospace';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(zone.label, x + barWidth / 2, H - 1);
    });
  } else {
    // No audio: draw idle bars
    ZONES.forEach((zone, i) => {
      const x = padding + i * (barWidth + gap);
      ctx2d.fillStyle = '#1E1E1E';
      roundRect(ctx2d, x, 10, barWidth, H - 20, 4);
      ctx2d.fill();
      ctx2d.fillStyle = '#333333';
      roundRect(ctx2d, x, H - 10 - 4, barWidth, 4, 4);
      ctx2d.fill();
      ctx2d.fillStyle = '#444444';
      ctx2d.font = '10px Courier New, monospace';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(zone.label, x + barWidth / 2, H - 1);
    });
  }

  rafId = requestAnimationFrame(renderFrame);
}

function roundRect(ctx, x, y, w, h, r) {
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
