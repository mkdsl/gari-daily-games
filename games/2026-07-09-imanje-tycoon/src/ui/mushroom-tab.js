import { formatDin } from '../economy/market.js';
import { getSpawnRatio, getWaveDuration, doInokulacija, harvestBlock, getBlockRevenueProjection } from '../economy/mushrooms.js';
import { GAME_CONFIG } from '../config.js';
import { updateUpgradesPanel } from './upgrades-panel.js';
import { spawnRevenueParticle } from '../render.js';

let _gameRef = null;
let initialized = false;
let _mushroomClickCtrl = null;

// ─── Init ──────────────────────────────────────────────────────────────────────

export function initMushroomTab(gameRef) {
  _gameRef = gameRef;
}

// ─── Main update ──────────────────────────────────────────────────────────────

/**
 * Render/update mushroom tab content.
 * @param {object} state
 */
export function updateMushroomTab(state) {
  const panel = document.getElementById('tab-mushrooms');
  if (!panel) return;

  if (!initialized || panel.dataset.initialized !== 'mush1') {
    panel.innerHTML = buildMushroomLayout(state);
    panel.dataset.initialized = 'mush1';
    initialized = true;
    bindMushroomEvents(panel, state);
  }

  // Update block grid
  const blocksGrid = panel.querySelector('#blocks-grid');
  if (blocksGrid) renderBlockGrid(blocksGrid, state);

  // Stats row
  updateMushroomStats(panel, state);

  // Inokulacija streak display
  const streakEl = panel.querySelector('#inok-streak-display');
  if (streakEl) {
    const streak = state.mushrooms.inokulacijaStreak || 0;
    streakEl.textContent = streak > 0 ? `🔥 Streak: ${streak}` : '';
    streakEl.title = `Uzastopnih uspešnih inokulacija: ${streak}`;
  }

  // Revenue breakdown
  const revEl = panel.querySelector('#mushroom-total-rev');
  if (revEl) revEl.textContent = formatDin(state.mushrooms.revenueEarned || 0);

  // Upgrades side panel
  const upgradesEl = panel.querySelector('#mushroom-upgrades');
  if (upgradesEl) updateUpgradesPanel(upgradesEl, state, 'mushrooms', _gameRef);

  // Edu fact
  updateMushroomEduFact(panel, state);
}

// ─── Layout builder ───────────────────────────────────────────────────────────

function buildMushroomLayout(state) {
  const spawnRatio = getSpawnRatio(state);
  const waveDur = getWaveDuration(state);
  return `
    <div class="tab-inner">
      <div class="tab-main">
        <div class="section-title">🍄 Pečurke — Blok inkubacija</div>
        <div id="mushroom-stats" class="stats-row"></div>
        <div id="mushroom-streak-row" class="streak-row">
          <span id="inok-streak-display" class="streak-badge"></span>
          <span id="mushroom-total-rev" class="rev-total"></span>
        </div>
        <div id="blocks-grid" class="blocks-grid"></div>
        <div id="mushroom-edu" class="edu-fact"></div>
      </div>
      <aside class="tab-side">
        <div class="section-title">Upgradi</div>
        <div id="mushroom-upgrades"></div>
      </aside>
    </div>
  `;
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function updateMushroomStats(panel, state) {
  const statsEl = panel.querySelector('#mushroom-stats');
  if (!statsEl) return;

  const spawnRatio = getSpawnRatio(state);
  const waveDur = getWaveDuration(state);
  const blocks = state.mushrooms.blocks;
  const readyBlocks = blocks.filter(b => b.waveIndex >= b.totalWaves && b.pendingHarvest > 0).length;
  const inokulacijaBlocks = blocks.filter(b => b.inokulacijaWindow).length;

  let statusBadge = '';
  if (inokulacijaBlocks > 0) {
    statusBadge = `<span class="status-badge badge-inokulacija pulse">⏱ Inokulacija! ${inokulacijaBlocks}×</span>`;
  } else if (readyBlocks > 0) {
    statusBadge = `<span class="status-badge badge-harvest">🧺 Spremo! ${readyBlocks}×</span>`;
  }

  statsEl.innerHTML = `
    <span>Spawn ratio: <strong>${(spawnRatio * 100).toFixed(0)}%</strong></span>
    <span>Talas: <strong>${waveDur.toFixed(0)}s</strong></span>
    <span>Blokovi: <strong>${blocks.length}/${state.mushrooms.maxBlocks}</strong></span>
    ${statusBadge}
    ${state.mushrooms.oysterUnlocked
      ? '<span class="oyster-badge">🦪 Oyster otključan</span>'
      : '<span class="muted">Bukovača</span>'}
  `;
}

// ─── Block grid ───────────────────────────────────────────────────────────────

function renderBlockGrid(container, state) {
  const blocks = state.mushrooms.blocks;

  // Remove extra cards
  const existingCards = Array.from(container.querySelectorAll('.block-card[data-block-id]'));
  const existingIds = new Set(existingCards.map(c => parseInt(c.getAttribute('data-block-id'), 10)));

  // Add new / update existing
  for (const block of blocks) {
    let card = container.querySelector(`[data-block-id="${block.id}"]`);
    if (!card) {
      card = document.createElement('div');
      card.className = 'block-card';
      card.setAttribute('data-block-id', block.id);
      container.appendChild(card);
    }

    renderBlockCard(card, block, state);
  }

  // Remove stale cards
  for (const card of existingCards) {
    const id = parseInt(card.getAttribute('data-block-id'), 10);
    if (!blocks.find(b => b.id === id)) card.remove();
  }

  // Remove old empty slots and re-render
  container.querySelectorAll('.block-empty').forEach(e => e.remove());

  // Empty slots
  const emptyCount = state.mushrooms.maxBlocks - blocks.length;
  for (let i = 0; i < emptyCount; i++) {
    const empty = document.createElement('div');
    empty.className = 'block-card block-empty';
    empty.innerHTML = `
      <div class="block-empty-icon">➕</div>
      <div class="block-empty-label">Slot slobodan<br><small>Kupi upgrade za novi blok</small></div>
    `;
    container.appendChild(empty);
  }
}

function renderBlockCard(card, block, state) {
  const isReady = block.waveIndex >= block.totalWaves && block.pendingHarvest > 0;
  const isInokulacija = block.inokulacijaWindow;
  const isGrowing = !isReady && !isInokulacija;
  const pct = Math.min(100, block.waveProgress * 100);
  const icon = block.type === 'oyster' ? '🦪' : '🍄';
  const priceLabel = block.type === 'oyster' ? '700 din/kg' : '400 din/kg';
  const typeName = block.type === 'oyster' ? 'Oyster' : 'Bukovača';

  // Revenue projection per block
  let revProjection = '';
  if (typeof getBlockRevenueProjection === 'function') {
    const proj = getBlockRevenueProjection(state, block);
    if (proj > 0) revProjection = `~${formatDin(proj)}/sez`;
  }

  card.className = [
    'block-card',
    isReady ? 'block-ready' : '',
    isInokulacija ? 'block-inokulacija' : '',
    isGrowing ? 'block-growing' : '',
  ].filter(Boolean).join(' ');

  card.innerHTML = `
    <div class="block-header">
      <span class="block-icon">${icon}</span>
      <div class="block-meta">
        <span class="block-type">${typeName}</span>
        <span class="block-price">${priceLabel}</span>
      </div>
      ${revProjection ? `<span class="block-proj">${revProjection}</span>` : ''}
    </div>
    <div class="block-wave-info">
      Talas <strong>${Math.min(block.waveIndex + 1, block.totalWaves)}/${block.totalWaves}</strong>
      ${block.inokulacijaBonus > 0 ? `<span class="inok-bonus-badge">+${(block.inokulacijaBonus * 100).toFixed(0)}%</span>` : ''}
    </div>

    ${isGrowing ? `
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct.toFixed(1)}%"></div>
      </div>
      <div class="progress-label">${pct.toFixed(0)}%</div>
    ` : ''}

    ${isInokulacija ? `
      <div class="inokulacija-window">
        <div class="inok-countdown">
          <span class="inok-timer-label">Prozor:</span>
          <span class="inok-timer">${Math.ceil(block.inokulacijaTimer)}s</span>
        </div>
        <div class="inok-benefit">+${(GAME_CONFIG.INOKULACIJA_BONUS * 100).toFixed(0)}% prinos za pravo vreme!</div>
        <button class="inok-btn action-btn btn-ready" data-action="inokulacija" data-block="${block.id}">
          🌱 Inokulacija!
        </button>
      </div>
    ` : ''}

    ${isReady ? `
      <div class="harvest-ready">
        <div class="harvest-kg">${block.pendingHarvest.toFixed(2)} kg čeka</div>
        <div class="harvest-value">~${formatDin(block.pendingHarvest * (block.type === 'oyster' ? GAME_CONFIG.PRICE_OYSTER : GAME_CONFIG.PRICE_BUKOVACA))}</div>
        <button class="harvest-btn action-btn btn-ready" data-action="harvest" data-block="${block.id}">
          🧺 Beri
        </button>
      </div>
    ` : ''}

    ${block.type === 'bukovaca' && state.mushrooms.oysterUnlocked && !isInokulacija ? `
      <button class="switch-type-btn small-btn" data-action="switch-type" data-block="${block.id}" data-type="oyster">
        Prebaci na Oyster (700 din/kg)
      </button>
    ` : ''}
    ${block.type === 'oyster' && !isInokulacija ? `
      <button class="switch-type-btn small-btn" data-action="switch-type" data-block="${block.id}" data-type="bukovaca">
        Prebaci na Bukovača (400 din/kg)
      </button>
    ` : ''}
  `;
}

// ─── Edu fact ─────────────────────────────────────────────────────────────────

function updateMushroomEduFact(panel, state) {
  const eduEl = panel.querySelector('#mushroom-edu');
  if (!eduEl) return;

  const facts = [
    'Bukovača raste na piljevini jer joj celuloza daje ugljenik koji pretvara u proteine.',
    'Oyster pečurke čiste zaraženu piljevinu razgrađujući teške molekule — bioremedijacija.',
    'Micelij je "koren" pečurke — inokulacija u pravom trenutku = čvršći, zdraviji micelij.',
    'Pečurke u plastenicima daju 3-4 talasa berbe po bloku supstrata.',
    'Oyster pečurke rastu za 10-14 dana od inokulacije do pune berbe na 20-24°C.',
  ];

  if (!panel._factIdx) panel._factIdx = 0;

  // Rotate fact every 30 seasons
  const factIdx = Math.floor(state.season / 6) % facts.length;
  eduEl.textContent = `💡 ${facts[factIdx]}`;
}

// ─── Event binding ────────────────────────────────────────────────────────────

function bindMushroomEvents(panel, state) {
  if (_mushroomClickCtrl) _mushroomClickCtrl.abort();
  _mushroomClickCtrl = new AbortController();
  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;

    const action = btn.getAttribute('data-action');
    const blockId = parseInt(btn.getAttribute('data-block'), 10);
    const audio = _gameRef?.audio;

    if (action === 'inokulacija') {
      const result = doInokulacija(state, blockId, audio);
      if (result && result.success) {
        // Spawn particle feedback
        const card = panel.querySelector(`[data-block-id="${blockId}"]`);
        if (card) spawnRevenueParticle(card, 0, result.bonus ? `+${(result.bonus * 100).toFixed(0)}% bonus!` : 'Inokulisano!');
      }
    } else if (action === 'harvest') {
      const rev = harvestBlock(state, blockId, audio);
      if (rev > 0) {
        const card = panel.querySelector(`[data-block-id="${blockId}"]`);
        if (card) spawnRevenueParticle(card, rev);
        import('./modals.js').then(({ showToast }) => {
          showToast(`🍄 Berba: +${formatDin(rev)}`);
        });
      }
    } else if (action === 'switch-type') {
      const newType = btn.getAttribute('data-type');
      const block = state.mushrooms.blocks.find(b => b.id === blockId);
      if (block) {
        block.type = newType;
        block.waveProgress = 0;
        block.waveIndex = 0;
        block.pendingHarvest = 0;
        block.inokulacijaWindow = false;
        block.inokulacijaBonus = 0;
        if (audio) audio.playSfx('purchase');
      }
    }

    // Force re-render on next tick
    initialized = false;
  }, { signal: _mushroomClickCtrl.signal });
}
