import { CONFIG } from './config.js';
import { refreshFace, getFaceImage } from './face.js';

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

  el.innerHTML = `
    <div class="go-inner">
      <img src="sprites/logo.png" class="go-logo" alt="Kluboslavija">
      <div class="go-player-wrap">
        <canvas id="go-player-canvas" width="120" height="180"></canvas>
        ${rankText ? `<div class="go-rank">${rankText}</div>` : ''}
      </div>
      <div class="go-title">GAME OVER</div>
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

  // Draw enlarged player character on game over canvas
  requestAnimationFrame(() => {
    const c = document.getElementById('go-player-canvas');
    if (!c) return;
    const pctx = c.getContext('2d');
    const cx = 60, cy = 90;

    // Body (hoodie)
    const bodyW = 56, bodyH = 100;
    const bodyGrad = pctx.createLinearGradient(cx - bodyW/2, cy - 20, cx + bodyW/2, cy - 20 + bodyH);
    bodyGrad.addColorStop(0, '#1e1e38');
    bodyGrad.addColorStop(0.5, '#14142a');
    bodyGrad.addColorStop(1, '#0a0a1e');
    pctx.fillStyle = bodyGrad;
    pctx.beginPath();
    if (pctx.roundRect) {
      pctx.roundRect(cx - bodyW/2, cy - 20, bodyW, bodyH, 6);
    } else {
      pctx.rect(cx - bodyW/2, cy - 20, bodyW, bodyH);
    }
    pctx.fill();
    // Hoodie highlight
    pctx.fillStyle = 'rgba(100,120,180,0.15)';
    pctx.fillRect(cx - bodyW/2, cy - 16, 4, bodyH - 8);
    // Pocket
    pctx.fillStyle = 'rgba(0,0,0,0.2)';
    pctx.fillRect(cx - 16, cy + 50, 32, 12);

    // Head area
    const headW = 50, headH = 44;
    const headY = cy - 58;

    // Face
    const face = getFaceImage();
    if (face && face.complete) {
      pctx.save();
      pctx.beginPath();
      pctx.ellipse(cx, headY + headH/2, headW * 0.42, headH * 0.46, 0, 0, Math.PI * 2);
      pctx.clip();
      pctx.drawImage(face, cx - headW/2 - 3, headY - 5, headW + 6, headH + 10);
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
    pctx.arc(cx, headY + 2, 28, Math.PI * 1.1, Math.PI * -0.1);
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
  });

  document.getElementById('btn-restart').addEventListener('click', onRestart);
}

export function hideGameOver() {
  document.getElementById('game-over').classList.add('hidden');
}
