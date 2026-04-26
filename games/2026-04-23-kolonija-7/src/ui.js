// src/ui.js — HUD (resursi, radnice, bura timer), overlay-i (game over, prestige, meta win)

import { CONFIG } from './config.js';
import { getPrestigeOptions, doPrestige } from './systems/prestige.js';

const hud  = document.getElementById('hud');
const menu = document.getElementById('menu');

/**
 * Inicijalizuje HUD strukturu u DOM-u.
 * @param {import('./state.js').GameState} state
 */
export function initUI(state) {
  hud.innerHTML = `
    <div class="stat" id="stat-food">🌾 <span id="val-food">0</span></div>
    <div class="stat" id="stat-minerals">⛏ <span id="val-minerals">0</span></div>
    <div class="stat" id="stat-workers">🐜 <span id="val-workers">0</span></div>
    <div class="stat storm-timer" id="stat-storm">☁ <span id="val-storm">—</span></div>
    <div class="stat prestige-count" id="stat-prestige">⭐ <span id="val-prestige">0</span></div>
  `;
  menu.classList.add('hidden');
}

/**
 * Ažurira sve HUD vrednosti iz state-a.
 * @param {import('./state.js').GameState} state
 */
export function updateHUD(state) {
  const food      = document.getElementById('val-food');
  const minerals  = document.getElementById('val-minerals');
  const workers   = document.getElementById('val-workers');
  const stormEl   = document.getElementById('val-storm');
  const prestige  = document.getElementById('val-prestige');

  if (food)     food.textContent     = Math.floor(state.resources.food);
  if (minerals) minerals.textContent = Math.floor(state.resources.minerals);
  if (workers)  workers.textContent  = `${state.workers.count}/${state.workers.capacity}`;
  if (prestige) prestige.textContent = state.prestige.count;

  // Storm timer — Jova: uvezi getTimeUntilStorm i isStormWarning iz storm.js
  if (stormEl) {
    const stormPhase = state.storm?.phase ?? 'MIRNO';
    if (stormPhase === 'TELEGRAPH' || stormPhase === 'AKTIVNA') {
      stormEl.textContent = 'BURA!';
      document.getElementById('stat-storm')?.classList.add('storm-warning');
    } else {
      const sec = Math.ceil(state.storm?.nextStormIn ?? 0);
      stormEl.textContent = `${sec}s`;
      document.getElementById('stat-storm')?.classList.remove('storm-warning');
    }
  }

  // Prikaži overlay-e
  if (state.metaWin) {
    showMetaWin(state);
  } else if (state.showPrestigeScreen) {
    showPrestigeOverlay(state);
  } else if (state.gameOver) {
    showGameOver(state);
  } else {
    menu.classList.add('hidden');
    menu.innerHTML = '';
  }
}

/**
 * Prikazuje game over overlay.
 * @param {import('./state.js').GameState} state
 */
export function showGameOver(state) {
  menu.classList.remove('hidden');
  menu.innerHTML = `
    <h2>KOLONIJA UGAŠENA</h2>
    <p>Radnice: 0 — Bura ih je progutala.</p>
    <p>Prestige: ${state.prestige.count}</p>
    <button onclick="location.reload()">Nova Kolonija</button>
  `;
}

/**
 * Prikazuje prestige ekran sa izborom bonusa.
 * Jova: opcije generiše getPrestigeOptions(state) iz prestige.js
 * @param {import('./state.js').GameState} state
 * @param {string[]} [options] - lista PrestigeBonus opcija
 */
export function showPrestigeOverlay(state, options) {
  menu.classList.remove('hidden');

  const bonusOptions = options ?? getPrestigeOptions(state);

  const BONUS_NAMES = {
    BRZE_RADNICE: 'Brze Radnice — radnice skupljaju 50% brže',
    JACI_ZID:     'Jači Zid — ZID sobe smanjuju štetu od bure za 30%',
    VISE_RESURSA: 'Više Resursa — počni sa 80h/30m i 20% više resursa',
    BRZE_KOPANJE: 'Brže Kopanje — kopanje daje 50% više resursa'
  };

  menu.innerHTML = `
    <h2>PRESTIGE ${state.prestige.count + 1}</h2>
    <p>Kristal pronađen! Izaberi bonus za sledeću koloniju:</p>
    <div id="prestige-options"></div>
  `;

  const container = document.getElementById('prestige-options');
  if (!container) return;

  if (bonusOptions.length === 0) {
    container.innerHTML = '<p>Svi bonusi su već uzeti!</p>';
    const btn = document.createElement('button');
    btn.textContent = 'Nastavi';
    btn.onclick = () => { doPrestige(state, null); };
    container.appendChild(btn);
    return;
  }

  bonusOptions.forEach(bonus => {
    const btn = document.createElement('button');
    btn.textContent = BONUS_NAMES[bonus] ?? bonus;
    btn.style.cssText = 'display:block;width:100%;margin:6px 0;padding:8px;cursor:pointer;';
    btn.onclick = () => { doPrestige(state, bonus); };
    container.appendChild(btn);
  });
}

/**
 * Prikazuje meta win ekran.
 * @param {import('./state.js').GameState} state
 */
export function showMetaWin(state) {
  menu.classList.remove('hidden');
  menu.innerHTML = `
    <h2>KOLONIJA 7 — PREŽIVELA!</h2>
    <p>Drevni Kristal je aktiviran. Planetu čeka novo proleće.</p>
    <p>Prestige ciklusa: ${state.prestige.count}</p>
    <button onclick="location.reload()">Igraj Ponovo</button>
  `;
}

/**
 * Prikazuje kontekstualni meni za gradnju sobe na datoj ćeliji.
 * Jova: poziva buildRoom() iz rooms.js kada korisnik izabere tip.
 * @param {number} col
 * @param {number} row
 * @param {import('./state.js').GameState} state
 */
export function showRoomMenu(col, row, state) {
  // Ukloni stari meni ako postoji
  document.querySelectorAll('.room-menu').forEach(el => el.remove());

  const existingRoom = state.rooms.find(r => r.col === col && r.row === row);

  const menuEl = document.createElement('div');
  menuEl.className = 'room-menu';

  // Pozicioniranje blizu kliknute ćelije
  const cellSize = CONFIG.CELL_SIZE;
  const gridW = CONFIG.GRID_COLS * cellSize;
  const gridH = CONFIG.GRID_ROWS * cellSize;
  const offsetX = Math.max(0, Math.floor((window.innerWidth  - gridW) / 2));
  const offsetY = Math.max(30, Math.floor((window.innerHeight - gridH) / 2)) + 30;
  const rawX = offsetX + col * cellSize;
  const rawY = offsetY + row * cellSize;
  const menuX = Math.min(window.innerWidth  - 180, rawX);
  const menuY = Math.min(window.innerHeight - 220, rawY);
  menuEl.style.left = menuX + 'px';
  menuEl.style.top  = menuY + 'px';

  const ROOM_TYPES  = ['LEGLO', 'MAGACIN', 'ZID'];
  const ROOM_NAMES  = {
    LEGLO:   'Leglo (+5 radnica)',
    MAGACIN: 'Magacin (+100 cap)',
    ZID:     'Odbrambeni Zid'
  };
  // Troskovi kao labele (L0→L1, L1→L2, L2→L3)
  const ROOM_COST_LABELS = {
    LEGLO:   ['40h/10m', '80h/20m', '160h/40m'],
    MAGACIN: ['50h/20m', '100h/40m', '200h/80m'],
    ZID:     ['20h/60m', '40h/120m']
  };

  if (existingRoom) {
    const maxLevel = existingRoom.type === 'ZID' ? 2 : CONFIG.ROOM_MAX_LEVEL;
    menuEl.innerHTML = `<div class="room-menu-title">${existingRoom.type} L${existingRoom.level}</div>`;

    if (existingRoom.level < maxLevel) {
      const costLabel = (ROOM_COST_LABELS[existingRoom.type] ?? [])[existingRoom.level] ?? '?';
      const btn = document.createElement('div');
      btn.className = 'room-option';
      btn.textContent = `Upgrade → L${existingRoom.level + 1} (${costLabel})`;
      btn.onclick = () => {
        state._pendingRoom = { action: 'upgrade', type: existingRoom.type, col, row };
        menuEl.remove();
        state.showRoomMenu = null;
      };
      menuEl.appendChild(btn);
    } else {
      const info = document.createElement('div');
      info.className = 'room-option';
      info.style.color = CONFIG.COLORS.DIM;
      info.textContent = 'Max level dostignut';
      menuEl.appendChild(info);
    }
  } else {
    // Nova soba — ponudi sve tipove
    ROOM_TYPES.forEach(type => {
      const costLabel = (ROOM_COST_LABELS[type] ?? [])[0] ?? '?';
      const div = document.createElement('div');
      div.className = 'room-option';
      div.textContent = `${ROOM_NAMES[type]} (${costLabel})`;
      div.onclick = () => {
        state._pendingRoom = { action: 'build', type, col, row };
        menuEl.remove();
        state.showRoomMenu = null;
      };
      menuEl.appendChild(div);
    });
  }

  // Dugme za zatvaranje
  const closeBtn = document.createElement('div');
  closeBtn.className = 'room-option';
  closeBtn.style.color = CONFIG.COLORS.DIM;
  closeBtn.textContent = '✕ Zatvori';
  closeBtn.onclick = () => { menuEl.remove(); state.showRoomMenu = null; };
  menuEl.appendChild(closeBtn);

  document.body.appendChild(menuEl);
}

/**
 * Zatvara room meni.
 */
export function closeRoomMenu() {
  document.querySelectorAll('.room-menu').forEach(el => el.remove());
}
