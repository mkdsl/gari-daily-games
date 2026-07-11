import { formatDin } from '../economy/market.js';
import { getSpawnRatio, getWaveDuration, doInokulacija, harvestBlock } from '../economy/mushrooms.js';
import { getBranchUpgrades } from '../systems/upgrades.js';
import { updateUpgradesPanel } from './upgrades-panel.js';

let _gameRef = null;
let initialized = false;

export function initMushroomTab(gameRef) {
  _gameRef = gameRef;
}

/** Render/update mushroom tab content */
export function updateMushroomTab(state) {
  const panel = document.getElementById('tab-mushrooms');
  if (!panel) return;

  if (!initialized || panel.dataset.initialized !== '1') {
    panel.innerHTML = buildMushroomLayout();
    panel.dataset.initialized = '1';
    initialized = true;
    bindMushroomEvents(panel, state);
  }

  // Update block grid
  const blocksGrid = panel.querySelector('#blocks-grid');
  if (blocksGrid) {
    renderBlockGrid(blocksGrid, state);
  }

  // Stats
  const statsEl = panel.querySelector('#mushroom-stats');
  if (statsEl) {
    const spawnRatio = getSpawnRatio(state);
    const waveDur = getWaveDuration(state);
    statsEl.innerHTML = `
      <span>Spawn ratio: <strong>${(spawnRatio * 100).toFixed(0)}%</strong></span>
      <span>Talas: <strong>${waveDur.toFixed(0)}s</strong></span>
      <span>Blokovi: <strong>${state.mushrooms.blocks.length}/${state.mushrooms.maxBlocks}</strong></span>
      <span>Prihod ukupno: <strong>${formatDin(state.mushrooms.revenueEarned)}</strong></span>
    `;
  }

  // Upgrades side panel
  const upgradesEl = panel.querySelector('#mushroom-upgrades');
  if (upgradesEl) {
    updateUpgradesPanel(upgradesEl, state, 'mushrooms', _gameRef);
  }
}

function buildMushroomLayout() {
  return `
    <div class="tab-inner">
      <div class="tab-main">
        <div class="section-title">🍄 Pečurke — Blok inkubacija</div>
        <div id="mushroom-stats" class="stats-row"></div>
        <div id="blocks-grid" class="blocks-grid"></div>
      </div>
      <aside class="tab-side">
        <div class="section-title">Upgradi</div>
        <div id="mushroom-upgrades"></div>
      </aside>
    </div>
  `;
}

function renderBlockGrid(container, state) {
  // Reconcile: add/remove block cards as needed
  const existing = Array.from(container.querySelectorAll('.block-card'));
  const blocks = state.mushrooms.blocks;

  // Remove extra
  while (existing.length > blocks.length) {
    existing.pop().remove();
  }

  blocks.forEach((block, i) => {
    let card = container.querySelector(`[data-block-id="${block.id}"]`);
    if (!card) {
      card = document.createElement('div');
      card.className = 'block-card';
      card.setAttribute('data-block-id', block.id);
      container.appendChild(card);
    }

    const isReady = block.waveIndex >= block.totalWaves && block.pendingHarvest > 0;
    const isInokulacija = block.inokulacijaWindow;
    const isGrowing = !isReady && !isInokulacija;
    const pct = block.waveProgress * 100;
    const icon = block.type === 'oyster' ? '🦪' : '🍄';
    const price = block.type === 'oyster' ? '700 din/kg' : '400 din/kg';

    card.className = `block-card ${isReady ? 'block-ready' : ''} ${isInokulacija ? 'block-inokulacija' : ''} ${isGrowing ? 'block-growing' : ''}`;
    card.innerHTML = `
      <div class="block-header">
        <span class="block-icon">${icon}</span>
        <span class="block-type">${block.type === 'oyster' ? 'Oyster' : 'Bukovača'}</span>
        <span class="block-price">${price}</span>
      </div>
      <div class="block-wave-info">Talas ${Math.min(block.waveIndex + 1, block.totalWaves)}/${block.totalWaves}</div>
      ${isGrowing ? `
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="progress-label">${pct.toFixed(0)}%</div>
      ` : ''}
      ${isInokulacija ? `
        <div class="inokulacija-window">
          <div class="inok-timer">⏱ ${Math.ceil(block.inokulacijaTimer)}s</div>
          <button class="inok-btn action-btn" data-action="inokulacija" data-block="${block.id}">
            🌱 Inokulacija!
          </button>
        </div>
      ` : ''}
      ${isReady ? `
        <div class="harvest-ready">
          <div class="harvest-kg">${block.pendingHarvest.toFixed(2)} kg čeka</div>
          <button class="harvest-btn action-btn" data-action="harvest" data-block="${block.id}">
            🧺 Beri
          </button>
        </div>
      ` : ''}
      ${block.type === 'bukovaca' && state.mushrooms.oysterUnlocked ? `
        <button class="switch-type-btn small-btn" data-action="switch-type" data-block="${block.id}" data-type="oyster">
          Prebaci na Oyster
        </button>
      ` : ''}
    `;
  });

  // Empty slots
  const emptySlots = state.mushrooms.maxBlocks - blocks.length;
  const existing2 = container.querySelectorAll('.block-empty');
  existing2.forEach(e => e.remove());
  for (let i = 0; i < emptySlots; i++) {
    const empty = document.createElement('div');
    empty.className = 'block-card block-empty';
    empty.innerHTML = `<div class="block-empty-label">Slot slobodan<br>(kupi upgrade)</div>`;
    container.appendChild(empty);
  }
}

function bindMushroomEvents(panel, state) {
  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const blockId = parseInt(btn.getAttribute('data-block'), 10);
    const audio = _gameRef?.audio;

    if (action === 'inokulacija') {
      doInokulacija(state, blockId, audio);
    } else if (action === 'harvest') {
      const rev = harvestBlock(state, blockId, audio);
      if (rev > 0) {
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
      }
    }
    // Re-render immediately
    initialized = false;
  });
}
