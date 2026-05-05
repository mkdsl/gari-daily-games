import { CONFIG } from './config.js';

export function showMenu(onStart) {
  const el = document.getElementById('menu');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="menu-inner">
      <h1>AVALA RUN</h1>
      <div class="subtitle">Kluboslavija · Avala · 20. jun 2026.</div>
      <div class="controls">
        <div>⬆ ArrowUp / Space / W — Skok</div>
        <div>⬇ ArrowDown / S — Duck</div>
        <div>📱 Tap gore — Skok &nbsp; Tap dole — Duck</div>
      </div>
      <button class="btn-start" id="btn-menu-start">KRETANJE!</button>
    </div>
  `;
  document.getElementById('btn-menu-start').addEventListener('click', () => {
    onStart();
  });
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
      <a href="${CONFIG.TICKET_URL}" target="_blank" rel="noopener" class="go-ticket">\u{1F3AB} Uzmi kartu — bilet.rs/show/261</a>
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
