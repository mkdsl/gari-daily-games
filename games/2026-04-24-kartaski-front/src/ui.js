/**
 * ui.js — DOM menadžer za Kartaški Front.
 *
 * Sve što NIJE Canvas. Karte su DOM div-ovi.
 * Klik na karte hvata input.js event delegation — ui.js ih samo kreira.
 * Overlay klikovi (reward, map, restart) hvata onOverlayClick iz input.js.
 *
 * Exports:
 *   renderHand(state)          — kreira .card divove u #hand-zone
 *   updateToolbar(state)       — ažurira toolbar span-ove
 *   showMapScreen(state)       — overlay: čvor info + "Na boj!" dugme
 *   showRewardScreen(state)    — overlay: 3 reward karte za izbor
 *   showGameOver(state)        — overlay: game over statistike
 *   showVictory(state)         — overlay: victory statistike
 *   hideOverlay()              — sakrije #overlay
 *   showDamageNumber(x,y,v,c) — floating damage/heal number
 *
 * @typedef {import('./state.js').GameState} GameState
 * @typedef {import('./config.js').CardDef} CardDef
 */

import { CONFIG } from './config.js';

// ── Init & screen flash ────────────────────────────────────────────────────

/**
 * Inicijalizuj UI — postavi listener za "Kraj runde" dugme.
 * @param {GameState} _state
 * @param {{ onEndTurn: () => void }} handlers
 */
export function initUI(_state, { onEndTurn }) {
  const btn = document.getElementById('btn-end-turn');
  if (btn) btn.addEventListener('click', () => onEndTurn());
}

/**
 * Kratak colored flash na celom ekranu.
 * @param {'red'|'green'} color
 */
export function screenFlash(color) {
  const el = document.createElement('div');
  el.className = `screen-flash flash-${color}`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

// ── Toolbar ───────────────────────────────────────────────────────────────

/**
 * Ažurira sve toolbar span-ove prema trenutnom state-u.
 * @param {GameState} state
 */
export function updateToolbar(state) {
  const nodeEl    = document.getElementById('node-info');
  const energyEl  = document.getElementById('energy-info');
  const deckEl    = document.getElementById('deck-info');
  const btnEnd    = /** @type {HTMLButtonElement|null} */ (document.getElementById('btn-end-turn'));

  if (nodeEl) {
    nodeEl.textContent = state.node > 0
      ? `Čvor: ${state.node}/${CONFIG.TOTAL_NODES}`
      : 'Kartaški Front';
  }

  if (energyEl) {
    const e = state.player.energy;
    const max = CONFIG.PLAYER_ENERGY_PER_TURN;
    energyEl.textContent = `⚡ ${e}/${max}`;
    energyEl.className = `toolbar-stat energy-stat${e === 0 ? ' energy-empty' : ''}`;
  }

  if (deckEl) {
    deckEl.textContent =
      `Špil: ${state.deck.length} | Dis: ${state.discard.length}`;
  }

  // HP igrača (optional span #hp-info)
  const hpEl = document.getElementById('hp-info');
  if (hpEl) {
    hpEl.textContent = `❤ ${state.player.hp}/${state.player.maxHp}`;
    hpEl.className = `toolbar-stat hp-stat${state.player.hp <= state.player.maxHp * 0.3 ? ' hp-low' : ''}`;
  }

  if (btnEnd) {
    const active = state.phase === CONFIG.PHASES.PLAYER_TURN;
    btnEnd.disabled = !active;
    btnEnd.className = `btn-primary${active ? '' : ' btn-inactive'}`;
  }
}

// ── Hand rendering ─────────────────────────────────────────────────────────

/**
 * Čisti #hand-zone i kreira .card div za svaku kartu u state.hand.
 * @param {GameState} state
 * @param {((card: CardDef, index: number) => void) | null} [onCardClick]
 */
export function renderHand(state, onCardClick) {
  const zone = document.getElementById('hand-zone');
  if (!zone) return;
  zone.innerHTML = '';

  const canPlay = state.phase === CONFIG.PHASES.PLAYER_TURN;

  state.hand.forEach((card, i) => {
    const affordable = state.player.energy >= card.cost;
    const isDisabled = !canPlay || !affordable;

    const el = document.createElement('div');
    el.className = [
      'card',
      `card-${card.type}`,
      isDisabled ? 'card-disabled' : '',
    ].filter(Boolean).join(' ');

    el.dataset.index = String(i);
    el.dataset.id    = card.id;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', isDisabled ? '-1' : '0');
    el.setAttribute(
      'aria-label',
      `${card.name}, cost ${card.cost}${isDisabled ? ' (nije dostupna)' : ''}`
    );

    el.innerHTML = `
      <div class="card-cost">${card.cost}</div>
      <div class="card-icon">${_typeIcon(card.type)}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${_cardDesc(card)}</div>
    `;

    if (!isDisabled && onCardClick) {
      el.addEventListener('click', () => onCardClick(card, i));
    }

    zone.appendChild(el);
  });
}

// ── Overlay helper ─────────────────────────────────────────────────────────

/**
 * Prikaži overlay sa HTML sadržajem.
 * @param {string} html
 */
function _showOverlay(html) {
  const el = document.getElementById('overlay');
  if (!el) return;
  el.innerHTML = html;
  el.classList.remove('hidden');
  el.classList.add('visible');
}

/** Sakrij overlay i očisti sadržaj. */
export function hideOverlay() {
  const el = document.getElementById('overlay');
  if (!el) return;
  el.classList.remove('visible');
  el.classList.add('hidden');
  setTimeout(() => {
    if (el.classList.contains('hidden')) el.innerHTML = '';
  }, 300);
}

// ── Map screen ─────────────────────────────────────────────────────────────

/**
 * Linearni map screen — prikaže sledeći čvor koji igrač može da izabere.
 * @param {GameState} state
 * @param {(() => void) | null} [onStartBattle]
 */
export function showMapScreen(state, onStartBattle) {
  const nodes = Array.from({ length: CONFIG.TOTAL_NODES }, (_, i) => {
    const n        = i + 1;
    const enemyKey = CONFIG.NODE_ENEMIES[i];
    const enemy    = CONFIG.ENEMIES[enemyKey];
    const isBoss   = n === CONFIG.TOTAL_NODES;

    // State prikazivanja čvora (prošao, aktivan, budući)
    // state.node = poslednji završeni čvor (0 = ni jedan), sledeći = state.node + 1
    const isPast    = n <= state.node;
    const isCurrent = n === state.node + 1;

    const cls   = isPast ? 'node-past' : isCurrent ? 'node-active' : 'node-future';
    const icon  = isBoss ? '☠' : '⚔';
    const label = `${icon} ${enemy.name}`;

    return `
      <button class="map-node ${cls}"
              data-action="map-node"
              data-node="${n}"
              ${!isCurrent ? 'disabled aria-disabled="true"' : ''}>
        <span class="node-num">${n}/${CONFIG.TOTAL_NODES}</span>
        <span class="node-label">${label}</span>
        <span class="node-hp">❤ ${enemy.hp}</span>
        ${isBoss ? '<span class="node-boss-tag">BOSS</span>' : ''}
      </button>
    `;
  }).join('<span class="node-connector" aria-hidden="true">▶</span>');

  _showOverlay(`
    <div class="overlay-panel map-panel">
      <h2 class="overlay-title">⚔ Karta sveta</h2>
      <p class="overlay-sub">Izaberi sledećeg protivnika</p>
      <div class="map-path">${nodes}</div>
      <p class="map-hp-hint">Tvoj HP: <strong class="${state.player.hp <= 10 ? 'danger-text' : ''}">${state.player.hp}/${state.player.maxHp}</strong>
         &nbsp;|&nbsp; Karte: <strong>${state.deck.length + state.discard.length + state.hand.length}</strong></p>
    </div>
  `);

  if (onStartBattle) {
    const activeBtn = document.querySelector('.map-node.node-active');
    if (activeBtn) activeBtn.addEventListener('click', onStartBattle, { once: true });
  }
}

// ── Reward screen ──────────────────────────────────────────────────────────

/**
 * Prikaži ekran za izbor nagrade — 3 karte.
 * @param {CardDef[]} rewardOptions
 * @param {((card: CardDef) => void) | null} [onPick]
 */
export function showRewardScreen(rewardOptions, onPick) {
  const cards = (rewardOptions ?? []).map(card => `
    <div class="card card-${card.type} reward-card"
         data-action="reward-pick"
         data-id="${card.id}"
         role="button"
         tabindex="0"
         aria-label="Izaberi ${card.name}">
      <div class="card-cost">${card.cost}</div>
      <div class="card-icon">${_typeIcon(card.type)}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${_cardDesc(card)}</div>
    </div>
  `).join('');

  _showOverlay(`
    <div class="overlay-panel reward-panel">
      <div class="reward-trophy">⚔</div>
      <h2 class="overlay-title">Pobeda! Izaberi nagradu</h2>
      <p class="overlay-sub">Jedna karta ulazi u tvoj špil zauvek</p>
      <div class="reward-row">${cards}</div>
    </div>
  `);

  if (onPick) {
    document.querySelectorAll('.reward-card').forEach((el, i) => {
      el.addEventListener('click', () => onPick(rewardOptions[i]), { once: true });
    });
  }
}

// ── Game Over ──────────────────────────────────────────────────────────────

/**
 * Prikaži game over ekran sa statistikama runa.
 * @param {GameState} state
 * @param {(() => void) | null} [onRestart]
 */
export function showGameOver(state, onRestart) {
  const totalCards = state.deck.length + state.hand.length + state.discard.length;

  _showOverlay(`
    <div class="overlay-panel gameover-panel">
      <div class="go-icon">💀</div>
      <h2 class="overlay-title go-title">Pao si!</h2>
      <p class="overlay-sub go-sub">
        ${state.node > 0
          ? `Poginuo na čvoru ${state.node}/${CONFIG.TOTAL_NODES}`
          : 'Nisi stigao ni do prvog čvora'}
      </p>
      <div class="stats-grid">
        <div class="stat-row"><span class="stat-l">HP ostalo</span><span class="stat-v">0 / ${state.player.maxHp}</span></div>
        <div class="stat-row"><span class="stat-l">Šteta nanesena</span><span class="stat-v">${state.stats.totalDamageDealt}</span></div>
        <div class="stat-row"><span class="stat-l">Karte odigrane</span><span class="stat-v">${state.stats.totalCardsPlayed}</span></div>
        <div class="stat-row"><span class="stat-l">Runde</span><span class="stat-v">${state.stats.roundsPlayed}</span></div>
        <div class="stat-row"><span class="stat-l">Karte u špilu</span><span class="stat-v">${totalCards}</span></div>
      </div>
      <button class="btn-primary btn-restart" data-action="restart">Novi run</button>
    </div>
  `);

  if (onRestart) {
    document.querySelector('.btn-restart')
      ?.addEventListener('click', onRestart, { once: true });
  }
}

// ── Victory ────────────────────────────────────────────────────────────────

/**
 * Prikaži victory ekran sa scoreom i statistikama.
 * @param {GameState} state
 * @param {(() => void) | null} [onRestart]
 */
export function showVictory(state, onRestart) {
  const score = Math.floor(
    state.player.hp * 10 +
    state.stats.totalDamageDealt / 5 +
    state.node * 50
  );
  const totalCards = state.deck.length + state.hand.length + state.discard.length;

  _showOverlay(`
    <div class="overlay-panel victory-panel">
      <div class="victory-icon">🏆</div>
      <h2 class="overlay-title victory-title">POBEDNIK!</h2>
      <p class="overlay-sub victory-sub">Kartaški Front se pokorava tvom špilu!</p>
      <div class="score-display">
        <span class="score-num">${score}</span>
        <span class="score-label"> poena</span>
      </div>
      <div class="stats-grid">
        <div class="stat-row"><span class="stat-l">HP ostalo</span><span class="stat-v hp-green">${state.player.hp} / ${state.player.maxHp}</span></div>
        <div class="stat-row"><span class="stat-l">Šteta nanesena</span><span class="stat-v">${state.stats.totalDamageDealt}</span></div>
        <div class="stat-row"><span class="stat-l">Karte odigrane</span><span class="stat-v">${state.stats.totalCardsPlayed}</span></div>
        <div class="stat-row"><span class="stat-l">Runde</span><span class="stat-v">${state.stats.roundsPlayed}</span></div>
        <div class="stat-row"><span class="stat-l">Karte u špilu</span><span class="stat-v">${totalCards}</span></div>
      </div>
      <button class="btn-primary btn-victory" data-action="restart">Novi run</button>
    </div>
  `);
}

// ── Damage number animacija ────────────────────────────────────────────────

/**
 * Prikaži floating damage/heal broj na ekranu.
 * @param {number} x         — clientX
 * @param {number} y         — clientY
 * @param {number} value     — uvek pozitivan
 * @param {string} [color]   — CSS boja teksta (default crvena)
 */
export function showDamageNumber(x, y, value, color = '#ff4444') {
  const el = document.createElement('div');
  el.className   = 'damage-number';
  el.textContent = value > 0 ? `-${value}` : `+${Math.abs(value)}`;
  el.style.left  = `${x}px`;
  el.style.top   = `${y}px`;
  el.style.color = color;
  document.body.appendChild(el);

  // Force reflow
  void el.offsetHeight;
  el.classList.add('damage-number-fly');
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

// ── Privatni helperi ───────────────────────────────────────────────────────

/**
 * Emoji ikona tipa karte.
 * @param {string} type
 * @returns {string}
 */
function _typeIcon(type) {
  return type === 'attack' ? '⚔' : type === 'block' ? '🛡' : '✨';
}

/**
 * Kratak opis karte.
 * @param {CardDef} card
 * @returns {string}
 */
function _cardDesc(card) {
  if (card.type === 'attack') {
    let s = card.hits && card.hits > 1
      ? `${card.hits}×${card.damage} dmg`
      : `${card.damage} dmg`;
    if (card.lifesteal) s += ` +${card.lifesteal}❤`;
    return s;
  }
  if (card.type === 'block') return `+${card.shield} shield`;

  switch (card.effect) {
    case 'heal':               return `+${card.value} HP`;
    case 'next_attack_bonus':  return `+${card.value} napad`;
    case 'poison':             return `Otrov ${card.value}×${card.duration}r`;
    case 'burn':               return `Burn ${card.value}×${card.duration}r`;
    case 'regen':              return `Regen ${card.value}×${card.duration}r`;
    case 'weak':               return `Slabost ${card.duration}r`;
    default:                   return card.effect ?? '–';
  }
}
