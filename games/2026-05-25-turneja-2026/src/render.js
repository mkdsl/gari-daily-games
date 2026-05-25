// render.js — Canvas renderer for Micro event visuals

const CROWD_COLORS = ['#4ecdc4', '#f4a22d', '#2ecc71', '#9b59b6', '#3498db', '#e74c3c', '#f1c40f'];

let _synergyFlashTimer = null;

/**
 * Draw crowd meter — animated silhouette of people
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} fanScore - current fan score
 * @param {number} maxFans - target fans
 * @param {number} bpm - current BPM for animation
 * @param {number} animPhase - animation phase (0-1, increases over time)
 */
export function drawCrowdMeter(ctx, fanScore, maxFans, bpm, animPhase) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  const ratio = Math.min(fanScore / Math.max(maxFans, 1), 1);
  const beatPhase = animPhase % 1;
  const beatAnim = Math.sin(beatPhase * Math.PI * 2);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0d1b2a');
  bgGrad.addColorStop(1, '#1a2f45');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Floor line
  ctx.strokeStyle = '#2a4060';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H - 20);
  ctx.lineTo(W, H - 20);
  ctx.stroke();

  // Draw crowd people (pixel art silhouettes)
  const personWidth = 8;
  const gap = 4;
  const totalPeople = Math.floor(W / (personWidth + gap));
  const activePeople = Math.floor(totalPeople * ratio);
  const startX = Math.floor((W - totalPeople * (personWidth + gap)) / 2);

  for (let i = 0; i < totalPeople; i++) {
    const x = startX + i * (personWidth + gap);
    const isActive = i < activePeople;

    // Wave animation for active people
    const waveOffset = isActive ? Math.sin((i / totalPeople * Math.PI * 4) + beatPhase * Math.PI * 2) * 6 * (bpm / 130) : 0;
    const baseHeight = isActive ? 28 + Math.floor(ratio * 12) : 16;
    const personH = baseHeight + (isActive ? waveOffset : 0);
    const y = H - 20 - personH;

    // Color by position in crowd (rainbow effect at high scores)
    if (isActive) {
      const colorIdx = Math.floor((i / activePeople) * CROWD_COLORS.length) % CROWD_COLORS.length;
      const color = CROWD_COLORS[colorIdx];
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7 + ratio * 0.3;
    } else {
      ctx.fillStyle = '#1e3a52';
      ctx.globalAlpha = 0.5;
    }

    // Body
    ctx.fillRect(x, y, personWidth, personH);

    // Head
    ctx.beginPath();
    ctx.arc(x + personWidth / 2, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Arms up animation for active
    if (isActive && waveOffset > 2) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath();
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x - 4, y - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + personWidth, y + 6);
      ctx.lineTo(x + personWidth + 4, y - 2);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;

  // Fan score text overlay
  ctx.fillStyle = '#f4a22d';
  ctx.font = `bold 11px 'Courier New', monospace`;
  ctx.textAlign = 'right';
  ctx.fillText(`${fanScore.toLocaleString()} FANS`, W - 6, 14);

  // BPM indicator
  ctx.fillStyle = '#4ecdc4';
  ctx.font = `10px 'Courier New', monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.round(bpm)} BPM`, 6, 14);

  // Beat flash effect
  if (beatPhase > 0.95 || beatPhase < 0.05) {
    ctx.fillStyle = 'rgba(244, 162, 45, 0.06)';
    ctx.fillRect(0, 0, W, H);
  }

  // Progress bar at bottom
  const barH = 4;
  const barY = H - barH;
  ctx.fillStyle = '#152233';
  ctx.fillRect(0, barY, W, barH);
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, '#4ecdc4');
  barGrad.addColorStop(0.5, '#f4a22d');
  barGrad.addColorStop(1, '#f1c40f');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, barY, W * ratio, barH);
}

/**
 * Draw block progress indicator (3 blocks)
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} blockIndex - current block (0, 1, 2)
 * @param {Array} blockScores - scores for completed blocks
 */
export function drawBlockProgress(ctx, blockIndex, blockScores) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const LABELS = ['OPEN\n22:00', 'PEAK\n01:00', 'CLOSE\n04:00'];
  const blockW = W / 3;

  for (let i = 0; i < 3; i++) {
    const x = i * blockW;
    const isDone = i < blockIndex;
    const isActive = i === blockIndex;

    // Block background
    ctx.fillStyle = isDone ? 'rgba(46, 204, 113, 0.15)' :
                   isActive ? 'rgba(244, 162, 45, 0.15)' :
                              'rgba(21, 34, 51, 0.8)';
    ctx.fillRect(x, 0, blockW, H);

    // Border
    ctx.strokeStyle = isDone ? '#2ecc71' : isActive ? '#f4a22d' : '#2a4060';
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.strokeRect(x + 1, 1, blockW - 2, H - 2);

    // Label
    const labelLines = LABELS[i].split('\n');
    ctx.fillStyle = isDone ? '#2ecc71' : isActive ? '#f4a22d' : '#5c7a99';
    ctx.font = `bold 9px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(labelLines[0], x + blockW / 2, H / 2 - 6);
    ctx.font = `8px 'Courier New', monospace`;
    ctx.fillStyle = isDone ? '#2ecc71' : isActive ? '#4ecdc4' : '#3a5570';
    ctx.fillText(labelLines[1], x + blockW / 2, H / 2 + 6);

    // Score for done blocks
    if (isDone && blockScores && blockScores[i] !== undefined) {
      ctx.fillStyle = '#2ecc71';
      ctx.font = `bold 10px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`+${blockScores[i]}`, x + blockW / 2, H - 6);
    }

    // Active pulse indicator
    if (isActive) {
      ctx.fillStyle = '#f4a22d';
      ctx.beginPath();
      ctx.arc(x + blockW / 2, 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Trigger synergy flash overlay on canvas
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} isPositive - green or red flash
 */
export function drawSynergyFlash(canvas, isPositive) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  if (_synergyFlashTimer) clearTimeout(_synergyFlashTimer);

  let alpha = 0.4;
  const color = isPositive ? `rgba(46, 204, 113, ${alpha})` : `rgba(231, 76, 60, ${alpha})`;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);

  // Fade out
  const fadeInterval = setInterval(() => {
    alpha -= 0.05;
    if (alpha <= 0) {
      clearInterval(fadeInterval);
      return;
    }
    ctx.fillStyle = isPositive ?
      `rgba(46, 204, 113, ${alpha})` :
      `rgba(231, 76, 60, ${alpha})`;
    ctx.fillRect(0, 0, W, H);
  }, 30);

  _synergyFlashTimer = setTimeout(() => clearInterval(fadeInterval), 600);
}

/**
 * Create and animate a canvas element for block phase
 */
export function createBlockCanvas(container) {
  const existing = container.querySelector('#block-canvas');
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.id = 'block-canvas';

  // Responsive sizing
  const W = Math.min(container.clientWidth || 375, 480);
  canvas.width = W;
  canvas.height = 140;
  canvas.style.width = '100%';
  canvas.style.height = '140px';

  container.appendChild(canvas);
  return canvas;
}

/**
 * Animation loop for canvas
 * Returns cancel function
 */
export function startCanvasLoop(canvas, getState) {
  let animPhase = 0;
  let lastTime = performance.now();
  let rafId = null;

  function tick(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    const state = getState();
    if (!state) { rafId = requestAnimationFrame(tick); return; }

    const { fanScore, maxFans, bpm, blockIndex, blockScores } = state;
    const ctx = canvas.getContext('2d');

    // Resize if needed
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && canvas.width !== Math.floor(rect.width)) {
      canvas.width = Math.floor(rect.width);
    }

    animPhase += dt * (bpm / 60);
    drawCrowdMeter(ctx, fanScore, maxFans, bpm, animPhase);

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
  return () => { if (rafId) cancelAnimationFrame(rafId); };
}
