import { CONFIG } from './config.js';
import { refreshFace, getFaceImage } from './face.js';

let _goAnimId = null;
let _confettiParticles = [];
let _confettiAnimId = null;

export function initFaceUpload() {
  const btn = document.getElementById('btn-face');
  const input = document.getElementById('face-input');
  if (!btn || !input) return;

  // If face already saved, show option to change
  if (localStorage.getItem('avala-run-face')) {
    btn.textContent = 'PROMENI FACU';
  }

  function triggerUpload() {
    // Reset file input so same file can be re-selected
    input.value = '';
    input.click();
  }
  btn.addEventListener('click', triggerUpload);
  // Mobile: touchend ensures the file picker opens on iOS/Android
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    triggerUpload();
  });
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Crop center square
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        // Downscale to 48x48 for better quality at various render sizes
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 48, 48);
        localStorage.setItem('avala-run-face', c.toDataURL());
        refreshFace();
        btn.textContent = 'PROMENI FACU';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function showMenu(onStart) {
  const el = document.getElementById('menu');
  el.classList.remove('hidden');
  // Menu content is pre-rendered in HTML for instant visibility
  document.getElementById('btn-menu-start').addEventListener('click', () => {
    onStart();
  });
  initFaceUpload();
}

export function hideMenu() {
  document.getElementById('menu').classList.add('hidden');
}

export function updateHUD(state) {
  document.getElementById('score-display').textContent = state.score;
  document.getElementById('trash-display').textContent = state.trashCount + ' smeća';
}

export function showGameOver(state, onRestart) {
  const el = document.getElementById('game-over');
  el.classList.remove('hidden');

  const distMeters = Math.floor(state.distance / 10);
  const aforizm = CONFIG.AFORIZMI[Math.floor(Math.random() * CONFIG.AFORIZMI.length)];
  const scores = state.daily.scores;

  const fmtScores = scores.length
    ? scores.map((s, i) => `${i + 1}. ${s}`).join('  ')
    : '—';

  // Render player character with face on a canvas for game over
  const faceDataUrl = localStorage.getItem('avala-run-face') || '';
  const rank = scores.length ? scores.indexOf(state.score) + 1 : 0;
  const rankText = rank === 1 ? '#1 DANAS!' : rank > 0 ? `#${rank} danas` : '';

  const isFirst = rank === 1;

  el.innerHTML = `
    <canvas id="go-confetti-canvas" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;"></canvas>
    <div class="go-inner">
      <img src="sprites/logo.png" class="go-logo" alt="Kluboslavija">
      <div class="go-player-wrap">
        <canvas id="go-player-canvas" width="120" height="180"></canvas>
        ${rankText ? `<div class="go-rank">${rankText}</div>` : ''}
      </div>
      <div class="go-title">KRAJ TRKE</div>
      <div class="go-stats">
        Score: ${state.score} &nbsp; | &nbsp; ${distMeters}m &nbsp; | &nbsp; ${state.trashCount} smeća
      </div>
      <div class="go-aforizm">"${aforizm}"<br><em>— Pera</em></div>
      <hr>
      <a href="${CONFIG.TICKET_URL}" target="_blank" rel="noopener" class="go-ticket">Uzmi kartu — app.bilet.rs/show/261</a>
      <div class="go-rules">Učešćem prihvataš Pravila — Kluboslavija IG bio</div>
      <hr>
      <div class="go-highscore">
        <div><strong>DANAŠNJI REKORD</strong></div>
        <div>Top Score:&nbsp; ${fmtScores}</div>
      </div>
      <button class="go-restart" id="btn-restart">POKUŠAJ PONOVO</button>
    </div>
  `;

  // Dancing animation loop
  function drawGameOverChar() {
    const c = document.getElementById('go-player-canvas');
    if (!c) return;
    const pctx = c.getContext('2d');
    pctx.clearRect(0, 0, 120, 180);

    // ~129 BPM dance beat — 2 beats per cycle
    const t = Date.now() * 0.006;
    const beat = Math.sin(t);
    const beatAbs = Math.abs(beat);
    const beatSign = beat > 0 ? 1 : -1;

    // Bounce down on beat (knees bend)
    const bounce = beatAbs * 8;
    // Sway left/right alternating
    const sway = Math.sin(t * 0.5) * 4;
    // Shoulder tilt
    const tilt = Math.sin(t * 0.5) * 0.06;

    const cx = 60 + sway, cy = 90 + bounce;

    pctx.save();
    pctx.translate(cx, cy);
    pctx.rotate(tilt);
    pctx.translate(-cx, -cy);

    // Legs — alternating knee bends
    const leftKnee = beat > 0 ? 6 : -2;
    const rightKnee = beat > 0 ? -2 : 6;
    pctx.strokeStyle = '#0f0f22';
    pctx.lineWidth = 7;
    pctx.lineCap = 'round';
    // Left leg
    pctx.beginPath();
    pctx.moveTo(cx - 10, cy + 55);
    pctx.lineTo(cx - 14 - leftKnee * 0.5, cy + 75 - leftKnee);
    pctx.lineTo(cx - 16, 165);
    pctx.stroke();
    // Right leg
    pctx.beginPath();
    pctx.moveTo(cx + 10, cy + 55);
    pctx.lineTo(cx + 14 + rightKnee * 0.5, cy + 75 - rightKnee);
    pctx.lineTo(cx + 16, 165);
    pctx.stroke();
    // Shoes (fixed to ground)
    pctx.fillStyle = '#2a1a3d';
    pctx.fillRect(cx - 20, 163, 10, 6);
    pctx.fillRect(cx + 12, 163, 10, 6);

    // Body (hoodie)
    const bodyW = 52, bodyH = 75;
    const bodyTop = cy - 18;
    const bodyGrad = pctx.createLinearGradient(cx - bodyW/2, bodyTop, cx + bodyW/2, bodyTop + bodyH);
    bodyGrad.addColorStop(0, '#1e1e38');
    bodyGrad.addColorStop(0.5, '#14142a');
    bodyGrad.addColorStop(1, '#0a0a1e');
    pctx.fillStyle = bodyGrad;
    pctx.beginPath();
    pctx.moveTo(cx - bodyW/2 + 8, bodyTop);
    pctx.quadraticCurveTo(cx - bodyW/2, bodyTop, cx - bodyW/2, bodyTop + 12);
    pctx.lineTo(cx - bodyW/2, bodyTop + bodyH - 6);
    pctx.quadraticCurveTo(cx - bodyW/2, bodyTop + bodyH, cx - bodyW/2 + 6, bodyTop + bodyH);
    pctx.lineTo(cx + bodyW/2 - 6, bodyTop + bodyH);
    pctx.quadraticCurveTo(cx + bodyW/2, bodyTop + bodyH, cx + bodyW/2, bodyTop + bodyH - 6);
    pctx.lineTo(cx + bodyW/2, bodyTop + 12);
    pctx.quadraticCurveTo(cx + bodyW/2, bodyTop, cx + bodyW/2 - 8, bodyTop);
    pctx.closePath();
    pctx.fill();
    // Highlight + zip
    pctx.fillStyle = 'rgba(100,120,180,0.12)';
    pctx.fillRect(cx - bodyW/2 + 1, bodyTop + 8, 3, bodyH - 16);
    pctx.fillStyle = 'rgba(100,120,180,0.2)';
    pctx.fillRect(cx - 1, bodyTop + 8, 2, bodyH - 16);
    // Pocket
    pctx.fillStyle = 'rgba(0,0,0,0.18)';
    pctx.fillRect(cx - 14, bodyTop + bodyH - 22, 28, 10);

    // Arms — pumping up on beat
    const leftArmUp = beat > 0 ? 20 : 5;
    const rightArmUp = beat > 0 ? 5 : 20;
    pctx.strokeStyle = '#14142a';
    pctx.lineWidth = 6;
    pctx.lineCap = 'round';
    // Left arm
    pctx.beginPath();
    pctx.moveTo(cx - bodyW/2, bodyTop + 14);
    pctx.lineTo(cx - bodyW/2 - 10, bodyTop + 30 - leftArmUp);
    pctx.stroke();
    // Right arm
    pctx.beginPath();
    pctx.moveTo(cx + bodyW/2, bodyTop + 14);
    pctx.lineTo(cx + bodyW/2 + 10, bodyTop + 30 - rightArmUp);
    pctx.stroke();

    // Head — bobbing
    const headBob = Math.sin(t + 0.3) * 3;
    const headW = 56, headH = 50;
    const headY = cy - 65 + headBob;

    const face = getFaceImage();
    if (face && face.complete) {
      pctx.save();
      pctx.beginPath();
      pctx.ellipse(cx, headY + headH/2, headW * 0.50, headH * 0.54, 0, 0, Math.PI * 2);
      pctx.clip();
      pctx.drawImage(face, cx - headW/2 - 6, headY - 8, headW + 12, headH + 16);
      pctx.restore();
    } else {
      const hGrad = pctx.createLinearGradient(cx - headW/2, headY, cx + headW/2, headY + headH);
      hGrad.addColorStop(0, '#2a2a44');
      hGrad.addColorStop(1, '#1a1a30');
      pctx.fillStyle = hGrad;
      pctx.beginPath();
      pctx.ellipse(cx, headY + headH/2, headW/2, headH/2, 0, 0, Math.PI * 2);
      pctx.fill();
    }

    // Headphones
    pctx.strokeStyle = '#5577BB';
    pctx.lineWidth = 5;
    pctx.beginPath();
    pctx.arc(cx, headY + 4, 30, Math.PI * 1.1, Math.PI * -0.1);
    pctx.stroke();
    pctx.fillStyle = '#5577BB';
    pctx.fillRect(cx - 28, headY + 2, 8, 14);
    pctx.fillRect(cx + 20, headY + 2, 8, 14);
    pctx.fillStyle = '#3a5599';
    pctx.fillRect(cx - 26, headY + 5, 4, 8);
    pctx.fillRect(cx + 22, headY + 5, 4, 8);

    // DJ Bag
    const bagX = cx + 22, bagY = cy - 10, bagH = 40;
    const bagGrad = pctx.createLinearGradient(bagX, bagY, bagX + 18, bagY + bagH);
    bagGrad.addColorStop(0, '#2a2a44');
    bagGrad.addColorStop(1, '#16162a');
    pctx.fillStyle = bagGrad;
    pctx.fillRect(bagX, bagY, 18, bagH);
    pctx.fillStyle = '#6688AA';
    pctx.fillRect(bagX + 8, bagY + 4, 2, bagH - 8);
    // Strap
    pctx.strokeStyle = '#4466AA';
    pctx.lineWidth = 3;
    pctx.beginPath();
    pctx.moveTo(bagX, bagY);
    pctx.lineTo(cx + 10, cy - 30);
    pctx.stroke();

    pctx.restore();
    _goAnimId = requestAnimationFrame(drawGameOverChar);
  }

  if (_goAnimId) cancelAnimationFrame(_goAnimId);
  requestAnimationFrame(drawGameOverChar);

  // Confetti explosion on end screen
  if (_confettiAnimId) cancelAnimationFrame(_confettiAnimId);
  _confettiParticles = [];
  const cc = document.getElementById('go-confetti-canvas');
  if (cc) {
    const rect = el.getBoundingClientRect();
    cc.width = rect.width;
    cc.height = rect.height;
    const cctx = cc.getContext('2d');
    const cw = rect.width, ch = rect.height;
    const count = isFirst ? 200 : 80;
    const spread = isFirst ? 1.0 : 0.5; // fraction of screen covered
    const colors = isFirst
      ? ['#FFD700', '#ff4466', '#ff88aa', '#ffee44', '#44ff88', '#88aaff', '#fff', '#cc2244']
      : ['#cc2244', '#ff4466', '#8899AA', '#aabbcc', '#fff'];
    // Spawn from center of screen
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * (isFirst ? 500 : 250);
      _confettiParticles.push({
        x: cw / 2 + (Math.random() - 0.5) * cw * 0.1,
        y: ch * 0.35 + (Math.random() - 0.5) * ch * 0.1,
        vx: Math.cos(angle) * speed * spread,
        vy: Math.sin(angle) * speed * spread - (isFirst ? 200 : 100),
        size: isFirst ? 4 + Math.random() * 8 : 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 14,
        alpha: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    let lastT = performance.now();
    function animConfetti(now) {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      cctx.clearRect(0, 0, cw, ch);
      for (const p of _confettiParticles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 300 * dt;
        p.vx *= 0.99;
        p.rot += p.rotV * dt;
        p.alpha = Math.max(0, p.alpha - dt * 0.3);
        if (p.alpha <= 0) continue;
        cctx.save();
        cctx.globalAlpha = p.alpha;
        cctx.translate(p.x, p.y);
        cctx.rotate(p.rot);
        cctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          cctx.beginPath();
          cctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          cctx.fill();
        } else {
          cctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        cctx.restore();
      }
      _confettiParticles = _confettiParticles.filter(p => p.alpha > 0.01);
      if (_confettiParticles.length > 0) {
        _confettiAnimId = requestAnimationFrame(animConfetti);
      } else {
        _confettiAnimId = null;
      }
    }
    _confettiAnimId = requestAnimationFrame(animConfetti);
  }

  document.getElementById('btn-restart').addEventListener('click', onRestart);
}

export function hideGameOver() {
  if (_goAnimId) { cancelAnimationFrame(_goAnimId); _goAnimId = null; }
  if (_confettiAnimId) { cancelAnimationFrame(_confettiAnimId); _confettiAnimId = null; }
  _confettiParticles = [];
  document.getElementById('game-over').classList.add('hidden');
}
