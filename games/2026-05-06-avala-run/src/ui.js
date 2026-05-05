import { CONFIG } from './config.js';

export function initFaceUpload() {
  const btn = document.getElementById('btn-face');
  const input = document.getElementById('face-input');
  if (!btn || !input) return;

  // If face already saved, show confirmation
  if (localStorage.getItem('avala-run-face')) {
    btn.textContent = '✓ FACA UČITANA';
  }

  btn.addEventListener('click', () => input.click());
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
        // Downscale to 12x12
        const c = document.createElement('canvas');
        c.width = 12; c.height = 12;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 12, 12);
        localStorage.setItem('avala-run-face', c.toDataURL());
        btn.textContent = '✓ FACA UČITANA';
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
  document.getElementById('card-display').textContent = '\u{1F3AB} ' + state.cardCount;
  document.getElementById('trash-display').textContent = '\u{1F5D1}️ ' + state.trashCount;
}

export function showGameOver(state, onRestart) {
  const el = document.getElementById('game-over');
  el.classList.remove('hidden');

  const distMeters = Math.floor(state.distance / 10);
  const aforizm = CONFIG.AFORIZMI[Math.floor(Math.random() * CONFIG.AFORIZMI.length)];
  const scores = state.daily.scores;
  const trash  = state.daily.trash;

  const fmtScores = scores.length
    ? scores.map((s, i) => `${i + 1}. ${s}`).join('  ')
    : '—';
  const fmtTrash = trash.length
    ? trash.map((s, i) => `${i + 1}. ${s}`).join('  ')
    : '—';

  el.innerHTML = `
    <div class="go-inner">
      <div class="go-title">GAME OVER</div>
      <div class="go-stats">
        Prešao: ${distMeters}m &nbsp; \u{1F3AB} Karte: ${state.cardCount} &nbsp; \u{1F5D1}️ Smeće: ${state.trashCount}
      </div>
      <div class="go-aforizm">"${aforizm}"<br><em>— Pera</em></div>
      <hr>
      <a href="${CONFIG.TICKET_URL}" target="_blank" rel="noopener" class="go-ticket">\u{1F3AB} Uzmi kartu — app.bilet.rs/show/261</a>
      <div class="go-rules">Učešćem prihvataš Pravila — Kluboslavija IG bio</div>
      <hr>
      <div class="go-highscore">
        <div><strong>DANAŠNJI REKORD</strong></div>
        <div>Top Score:&nbsp; ${fmtScores}</div>
        <div>Top Smeće:&nbsp; ${fmtTrash}</div>
      </div>
      <button class="go-restart" id="btn-restart">POKUŠAJ PONOVO</button>
    </div>
  `;

  document.getElementById('btn-restart').addEventListener('click', onRestart);
}

export function hideGameOver() {
  document.getElementById('game-over').classList.add('hidden');
}
