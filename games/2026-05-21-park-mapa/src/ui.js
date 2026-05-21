const hud = document.getElementById('hud');
const menu = document.getElementById('menu');

export function initUI() {
  hud.innerHTML = '<div class="stat" id="stat-score">0</div>';
  menu.classList.add('hidden');
}

export function updateHUD(state) {
  document.getElementById('stat-score').textContent = state.score;
  menu.classList.toggle('hidden', !state.gameOver && !state.paused);
  if (state.gameOver) {
    menu.innerHTML = `<h2>GAME OVER</h2><p>Score: ${state.score}</p><button onclick="location.reload()">Restart</button>`;
  }
}
