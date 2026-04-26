import { CONFIG } from './config.js';

const hud = document.getElementById('hud');
const toolbar = document.getElementById('toolbar');
const overlay = document.getElementById('overlay');

let _onAction = null;
let _onEndTurn = null;
let _selectedAction = 'MOVE';  // 'MOVE' | 'SHOOT' | 'CHARGE' | 'SMOKE'

export function initUI(onAction, onEndTurn) {
  _onAction = onAction;
  _onEndTurn = onEndTurn;

  hud.innerHTML = `
    <div class="hud-row">
      <span class="hud-label">POTEZ</span><span id="hud-turn">0/${CONFIG.MAX_TURNS}</span>
      <span class="hud-label">MECI</span><span id="hud-ammo">0</span>
      <span class="hud-label">LINIJE</span><span id="hud-lines">0/3</span>
    </div>
  `;

  toolbar.innerHTML = `
    <div class="toolbar-inner">
      <button class="action-btn active" data-action="MOVE" title="Pomeranje (besplatno)">⬆ POMERI</button>
      <button class="action-btn" data-action="SHOOT" title="Pucanje (-2 metka)">🎯 PUCAJ</button>
      <button class="action-btn" data-action="CHARGE" title="Juriš (gubi 1 HP)">⚔ JURIŠ</button>
      <button class="action-btn" data-action="SMOKE" title="Dimna zavesa (-3 metka)">💨 DIM</button>
      <button class="end-turn-btn" id="btn-end-turn">POTEZ ▶</button>
    </div>
  `;

  toolbar.querySelectorAll('.action-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      _selectedAction = btn.dataset.action;
      toolbar.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('btn-end-turn').addEventListener('click', () => {
    if (_onEndTurn) _onEndTurn();
  });
}

export function getSelectedAction() { return _selectedAction; }

export function updateHUD(state) {
  if (state.phase === 'MENU') {
    hud.classList.add('hidden');
    toolbar.classList.add('hidden');
    overlay.classList.add('hidden');
    return;
  }

  hud.classList.remove('hidden');
  toolbar.classList.remove('hidden');

  document.getElementById('hud-turn').textContent = `${state.turn}/${CONFIG.MAX_TURNS}`;
  document.getElementById('hud-ammo').textContent = state.ammo;
  document.getElementById('hud-lines').textContent = `${countClearedLines(state)}/3`;

  // Disable buttons based on ammo
  const shootBtn = toolbar.querySelector('[data-action="SHOOT"]');
  const smokeBtn = toolbar.querySelector('[data-action="SMOKE"]');
  if (shootBtn) shootBtn.classList.toggle('disabled', state.ammo < CONFIG.AMMO_SHOOT);
  if (smokeBtn) smokeBtn.classList.toggle('disabled', state.ammo < CONFIG.AMMO_SMOKE);

  // End-turn button during animation
  const endTurnBtn = document.getElementById('btn-end-turn');
  if (endTurnBtn) {
    endTurnBtn.disabled = state.phase === 'ANIMATING';
    endTurnBtn.textContent = state.phase === 'ANIMATING' ? '...' : 'POTEZ ▶';
  }

  if (state.phase === 'GAMEOVER') {
    showGameOver(state);
  } else {
    overlay.classList.add('hidden');
  }
}

function showGameOver(state) {
  const r = state.result;
  const victory = r?.victory;
  const grade = r?.grade || '?';

  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="gameover-box">
      <div class="gameover-title">${victory ? '🏆 POBEDA' : '💀 PORAZ'}</div>
      <div class="gameover-grade grade-${grade}">${grade}</div>
      <div class="gameover-stats">
        <div>Potezi: <b>${r?.turns ?? '?'}</b> / ${CONFIG.MAX_TURNS}</div>
        <div>Meci ostalo: <b>${r?.ammoLeft ?? '?'}</b></div>
        <div>Izgubljeni vojnici: <b>${r?.losses ?? '?'}</b></div>
      </div>
      <button class="restart-btn" onclick="location.reload()">PONOVI</button>
    </div>
  `;
}

function countClearedLines(state) {
  return CONFIG.LINE_Y.filter((lineY, i) =>
    state.lineEnemiesSpawned[i] &&
    !Object.values(state.units).some(u => u.side === 'enemy' && u.y === lineY && u.hp > 0)
  ).length;
}
