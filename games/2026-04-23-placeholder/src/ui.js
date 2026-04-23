// src/ui.js — HUD (resursi, radnice, bura timer), overlay-i (game over, prestige, meta win)

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
  // Jova: generiši dugmad za svaki bonus u options[]
  menu.innerHTML = `
    <h2>PRESTIGE ${state.prestige.count + 1}</h2>
    <p>Kristal pronađen! Izaberi bonus za sledeću koloniju:</p>
    <div id="prestige-options"></div>
  `;
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
  // Jova: napravi floating DOM element pozicioniran blizu kliknute ćelije
}

/**
 * Zatvara room meni.
 */
export function closeRoomMenu() {
  state.showRoomMenu = null;
  // Jova: ukloni floating meni iz DOM-a
}
