// render.js — canvas renderer

import { LEVELS } from './levels/level_data.js';
import { state } from './state.js';
import { TERRAIN_COLORS, relToPixel, relPosToPixel } from './entities/map.js';
import { getSpeakerConePoints } from './entities/speakers.js';
import { getWindowLightColor } from './entities/neighbours.js';

let canvas, ctx;
let wave_phase = 0;
let wind_leaves = [];

export function initRenderer(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  initWindLeaves();
}

function initWindLeaves() {
  wind_leaves = [];
  for (let i = 0; i < 12; i++) {
    wind_leaves.push({
      x: Math.random(),
      y: Math.random(),
      speed: 0.05 + Math.random() * 0.08,
      size: 3 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2
    });
  }
}

export function renderFrame(dt_ms) {
  if (!canvas || !ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const level = LEVELS[state.current_level];
  if (!level) return;

  drawTerrain(W, H, level);
  drawStage(W, H, level);
  drawSpeakerCones(W, H, level);
  drawNeighbours(W, H, level);

  if (state.sim_running) {
    wave_phase += dt_ms / 1000;
    drawSoundWaves(W, H, level);
  } else {
    wave_phase = 0;
  }

  if (level.has_wind && state.sim_running) {
    updateWindLeaves(dt_ms, W, H);
    drawWindLeaves(W, H);
  }
}

// ---- TERRAIN ----

function drawTerrain(W, H, level) {
  // Base fill
  ctx.fillStyle = '#0d200d';
  ctx.fillRect(0, 0, W, H);

  for (const tile of level.terrain_tiles) {
    const [tx, ty, tw, th] = relToPixel(W, H, tile.rect);
    drawTerrainTile(tile.type, tx, ty, tw, th);
  }
}

function drawTerrainTile(type, tx, ty, tw, th) {
  const c = TERRAIN_COLORS[type];
  switch (type) {
    case 'open':
      ctx.fillStyle = c.base;
      ctx.fillRect(tx, ty, tw, th);
      // noise dots
      ctx.fillStyle = c.noise;
      for (let i = 0; i < tw * th / 150; i++) {
        const nx = tx + Math.random() * tw;
        const ny = ty + Math.random() * th;
        ctx.fillRect(Math.round(nx), Math.round(ny), 2, 2);
      }
      break;

    case 'forest':
      ctx.fillStyle = c.base;
      ctx.fillRect(tx, ty, tw, th);
      // crown grid 3x3
      ctx.fillStyle = c.crown;
      for (let gx = tx + 4; gx < tx + tw - 2; gx += 8) {
        for (let gy = ty + 4; gy < ty + th - 2; gy += 8) {
          ctx.fillRect(gx, gy, 4, 4);
          ctx.fillRect(gx + 1, gy - 2, 2, 2);
          ctx.fillRect(gx + 1, gy + 4, 2, 2);
        }
      }
      break;

    case 'valley':
      ctx.fillStyle = c.base;
      ctx.fillRect(tx, ty, tw, th);
      // svetlija u centru
      ctx.fillStyle = c.center;
      ctx.fillRect(tx + tw * 0.25, ty + th * 0.25, tw * 0.5, th * 0.5);
      break;

    case 'asphalt':
      ctx.fillStyle = c.base;
      ctx.fillRect(tx, ty, tw, th);
      // horizontalne linije
      ctx.fillStyle = c.line;
      for (let ly = ty + 4; ly < ty + th; ly += 8) {
        ctx.fillRect(tx, ly, tw, 1);
      }
      break;

    case 'hill_shadow':
      ctx.fillStyle = c.base;
      ctx.fillRect(tx, ty, tw, th);
      // cross-hatch
      ctx.fillStyle = c.cross;
      for (let li = 0; li < tw + th; li += 8) {
        ctx.fillRect(tx + li, ty, 1, th);
        ctx.fillRect(tx, ty + li, tw, 1);
      }
      break;

    default:
      ctx.fillStyle = '#1a3a1a';
      ctx.fillRect(tx, ty, tw, th);
  }
}

// ---- STAGE ----

function drawStage(W, H, level) {
  const [sx, sy] = relPosToPixel(W, H, level.stage_pos.x, level.stage_pos.y);

  // Bina — amber/zuta pravougaonik
  ctx.fillStyle = '#f0a020';
  ctx.fillRect(sx - 10, sy - 6, 20, 12);

  // Border
  ctx.strokeStyle = '#ffd060';
  ctx.lineWidth = 1;
  ctx.strokeRect(sx - 10, sy - 6, 20, 12);

  // Zvucnici - mali kvadrati
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(sx - 10, sy - 3, 4, 3);
  ctx.fillRect(sx + 6, sy - 3, 4, 3);

  // DJ text
  ctx.fillStyle = '#0a1a0a';
  ctx.font = '5px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DJ', sx, sy);
}

// ---- SPEAKER CONES ----

function drawSpeakerCones(W, H, level) {
  const [sx, sy] = relPosToPixel(W, H, level.stage_pos.x, level.stage_pos.y);
  const cone_len = Math.min(W, H) * 0.35;

  if (level.dual_speakers) {
    drawCone(sx, sy, state.angle_l, cone_len, '#f0a020', 0.18);
    drawCone(sx, sy, state.angle_r, cone_len, '#60c0f0', 0.18);
  } else {
    const pulse = 0.12 + 0.06 * Math.sin(wave_phase * 3);
    drawCone(sx, sy, state.angle, cone_len, '#f0a020', pulse);
  }
}

function drawCone(sx, sy, angle_deg, length, color, alpha) {
  const pts = getSpeakerConePoints(sx, sy, angle_deg, length, 40);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(pts.origin.x, pts.origin.y);
  ctx.lineTo(pts.left.x, pts.left.y);
  ctx.arc(
    pts.origin.x, pts.origin.y,
    length,
    ((angle_deg - 20) * Math.PI) / 180,
    ((angle_deg + 20) * Math.PI) / 180
  );
  ctx.lineTo(pts.origin.x, pts.origin.y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  // Ivica konusa
  ctx.save();
  ctx.globalAlpha = alpha + 0.1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pts.origin.x, pts.origin.y);
  ctx.lineTo(pts.left.x, pts.left.y);
  ctx.moveTo(pts.origin.x, pts.origin.y);
  ctx.lineTo(pts.right.x, pts.right.y);
  ctx.stroke();
  ctx.restore();
}

// ---- SOUND WAVES ----

function drawSoundWaves(W, H, level) {
  const [sx, sy] = relPosToPixel(W, H, level.stage_pos.x, level.stage_pos.y);
  const max_r = Math.min(W, H) * 0.4;

  for (let i = 0; i < 3; i++) {
    const t = (wave_phase * 0.7 + i * 0.33) % 1;
    const r = t * max_r;
    const alpha = (1 - t) * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#f0a020';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ---- NEIGHBOURS ----

function drawNeighbours(W, H, level) {
  level.neighbours.forEach((n, idx) => {
    const [nx, ny] = relPosToPixel(W, H, n.x, n.y);
    const kdb = state.neighbour_kdbs[idx] !== undefined ? state.neighbour_kdbs[idx] : -Infinity;
    const win_color = getWindowLightColor(kdb);
    drawHouse(nx, ny, win_color, n.label);
  });
}

function drawHouse(cx, cy, win_color, label) {
  // Base
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(cx - 8, cy - 4, 16, 10);

  // Krov
  ctx.fillStyle = '#5a1a1a';
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 4);
  ctx.lineTo(cx, cy - 10);
  ctx.lineTo(cx + 10, cy - 4);
  ctx.closePath();
  ctx.fill();

  // Prozor
  ctx.fillStyle = win_color;
  ctx.fillRect(cx - 3, cy - 2, 5, 5);

  // Label
  ctx.fillStyle = '#e8f4e8';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(label, cx, cy + 8);
}

// ---- WIND LEAVES ----

function updateWindLeaves(dt_ms, W, H) {
  const dt = dt_ms / 1000;
  const wind = state.wind_delta;
  const dir_x = Math.cos(wind * 0.3) * 0.04;
  const dir_y = Math.sin(wind * 0.3) * 0.02 + 0.01;

  wind_leaves.forEach(leaf => {
    leaf.x += dir_x * leaf.speed * dt * 60;
    leaf.y += dir_y * leaf.speed * dt * 60;
    leaf.phase += dt * 2;

    if (leaf.x > 1.05 || leaf.y > 1.05 || leaf.x < -0.05) {
      leaf.x = Math.random() < 0.5 ? -0.02 : Math.random();
      leaf.y = Math.random() < 0.5 ? -0.02 : Math.random();
    }
  });
}

function drawWindLeaves(W, H) {
  wind_leaves.forEach(leaf => {
    const lx = leaf.x * W;
    const ly = leaf.y * H;
    const s = leaf.size;
    const alpha = 0.5 + 0.3 * Math.sin(leaf.phase);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#30c030';
    ctx.translate(lx, ly);
    ctx.rotate(leaf.phase);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}
