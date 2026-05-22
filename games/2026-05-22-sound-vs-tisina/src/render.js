// render.js — canvas orchestrator
import { renderHeatmap } from './render/heatmap.js';
import { renderTerrain } from './render/terrain.js';
import { renderZones, renderHUD } from './render/ui-elements.js';

let animFrame = null;
let lastRender = 0;
const TARGET_MS = 1000 / 30; // 30 FPS

export function startRenderLoop(canvas, getState) {
  const ctx = canvas.getContext('2d');

  function frame(ts) {
    animFrame = requestAnimationFrame(frame);
    if (ts - lastRender < TARGET_MS) return;
    lastRender = ts;

    const state = getState();
    if (state.phase !== 'running') return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderHeatmap(ctx, state);
    renderTerrain(ctx, state.currentVenue);
    renderZones(ctx, state);
    renderHUD(ctx, state);
  }

  animFrame = requestAnimationFrame(frame);
}

export function stopRenderLoop() {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}
