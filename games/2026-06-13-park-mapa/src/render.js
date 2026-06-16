import { CONFIG } from './config.js';
import { renderParkBoard, renderEggOverlay, updateParkBoard } from './systems/park-board.js';
import { getDailyEggsState } from './systems/easter-eggs.js';
import { renderRankBadge } from './systems/park-legend.js';

let lastTime = 0;

export function initRenderer(canvas) {
  // Set canvas size to match window (responsive)
  resizeCanvas(canvas);
  window.addEventListener('resize', () => resizeCanvas(canvas));
}

export function resizeCanvas(canvas) {
  // Maintain aspect ratio 5:3 (900:540), fill available space
  const maxW = Math.min(window.innerWidth, 1200);
  const maxH = window.innerHeight - 60; // reserve 60px for HUD header

  const aspectW = 900, aspectH = 540;
  let w = maxW;
  let h = Math.round(w * aspectH / aspectW);

  if (h > maxH) {
    h = maxH;
    w = Math.round(h * aspectW / aspectH);
  }

  canvas.width = aspectW;  // internal resolution always 900x540
  canvas.height = aspectH;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
}

export function renderFrame(canvas, ctx, state, hoverZone, currentTime) {
  const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // cap at 100ms
  lastTime = currentTime;

  // Update animations
  updateParkBoard(dt);

  const time = currentTime / 1000; // seconds

  // Render main park board
  renderParkBoard(ctx, canvas, state, hoverZone, time);

  // Render egg overlay on top
  const today = new Date().toISOString().slice(0, 10);
  const eggs = getDailyEggsState(state, today);
  renderEggOverlay(ctx, canvas, eggs, time);

  // Render rank badge (bottom-right of canvas)
  renderRankBadge(ctx, canvas.width - 170, canvas.height - 46, state);
}

export function getCanvasScale(canvas) {
  return canvas.width / parseInt(canvas.style.width || canvas.width);
}
