import { formatDin } from '../economy/market.js';
import { GAME_CONFIG } from '../config.js';
import { hireWorker } from '../systems/workers.js';
import { canOrganizeMasterclass, organizeMasterclass } from '../systems/masterclass.js';
import { updateChannelPanel } from './channel-panel.js';
import { updateSynergyTree } from './synergy-tree.js';
import { canPrestige } from '../systems/phases.js';

let _gameRef = null;
let macroInitialized = false;

export function initMacroPanel(gameRef) {
  _gameRef = gameRef;
  bindMacroPanelEvents(gameRef.state);
}

function bindMacroPanelEvents(state) {
  // Branch unlock buttons
  document.addEventListener('click', (e) => {
    const unlockBtn = e.target.closest('.branch-unlock-btn');
    if (unlockBtn) {
      const branch = unlockBtn.getAttribute('data-branch');
      const cost = parseInt(unlockBtn.getAttribute('data-cost'), 10);
      const audio = _gameRef?.audio;
      if (state.capital >= cost) {
        state.capital -= cost;
        if (branch === 'greenhouse') state.greenhouse.unlocked = true;
        if (branch === 'fishpond') state.fishpond.unlocked = true;
        if (audio) audio.playSfx('phase_unlock');
        import('./modals.js').then(({ showToast }) => {
          showToast(`✓ ${branch === 'greenhouse' ? 'Plastenik' : 'Jezero'} otključan!`);
        });
        updateMacroPanelUI(state);
      } else {
        import('./modals.js').then(({ showToast }) => {
          showToast(`⚠️ Nedovoljno kapitala (${formatDin(cost)} potrebno).`);
        });
      }
    }

    // Hire worker
    if (e.target.closest('#hire-worker-btn')) {
      const result = hireWorker(state, _gameRef?.audio);
      if (!result.success) {
        import('./modals.js').then(({ showToast }) => {
          showToast(`⚠️ ${result.reason}`);
        });
      }
    }

    // Masterclass
    if (e.target.closest('#masterclass-btn')) {
      const result = organizeMasterclass(state, _gameRef?.audio);
      if (!result.success) {
        import('./modals.js').then(({ showToast }) => {
          showToast(`⚠️ ${result.reason}`);
        });
      }
    }

    // Export save
    if (e.target.closest('#export-save-btn')) {
      import('../state.js').then(({ exportSave }) => {
        exportSave(state);
      });
    }

    // Prestige button
    if (e.target.closest('#prestige-btn')) {
      import('../systems/prestige.js').then(({ openPrestigeModal }) => {
        openPrestigeModal(state, _gameRef);
      });
    }
  });

  // Import save
  const importInput = document.getElementById('import-save-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      import('../state.js').then(({ importSave }) => {
        importSave(file,
          (newState) => {
            Object.assign(state, newState);
            import('./modals.js').then(({ showToast }) => {
              showToast('✓ Save uspešno učitan!');
            });
          },
          (err) => {
            import('./modals.js').then(({ showToast }) => {
              showToast(`⚠️ ${err}`);
            });
          }
        );
      });
    });
  }
}

/** Update macro panel content — called every tick */
export function updateMacroPanelUI(state) {
  // Branch items
  updateBranchItems(state);

  // Channel panel
  const chContainer = document.getElementById('channel-panel-container');
  if (chContainer) updateChannelPanel(chContainer, state, _gameRef);

  // Stats
  const totalRevEl = document.getElementById('total-revenue-display');
  if (totalRevEl) totalRevEl.textContent = formatDin(state.totalRevenue);
  const seasonRevEl = document.getElementById('season-revenue-display');
  if (seasonRevEl) seasonRevEl.textContent = formatDin(state.seasonRevenue || 0);

  const workersEl = document.getElementById('workers-display');
  if (workersEl) workersEl.textContent = `${state.workers.hired}/${GAME_CONFIG.MAX_WORKERS}`;

  const hireBtn = document.getElementById('hire-worker-btn');
  if (hireBtn) {
    const cost = GAME_CONFIG.WORKER_HIRE_COST;
    hireBtn.disabled = state.workers.hired >= GAME_CONFIG.MAX_WORKERS || state.capital < cost;
    hireBtn.title = `${formatDin(cost)}/radnik (+3 akcije/sez)`;
  }

  // Market forecast
  const forecastP = document.getElementById('forecast-paradajz');
  const forecastM = document.getElementById('forecast-mikro');
  if (forecastP && state.marketForecast) {
    const baseP = GAME_CONFIG.PRICE_PARADAJZ;
    const diff = state.marketForecast.paradajz - baseP;
    const pct = ((diff / baseP) * 100).toFixed(0);
    forecastP.textContent = `Paradajz: ${state.marketForecast.paradajz} din/kg (${diff >= 0 ? '+' : ''}${pct}%)`;
    forecastP.className = `forecast-item ${diff >= 0 ? 'forecast-up' : 'forecast-down'}`;
  }
  if (forecastM && state.marketForecast) {
    const baseM = GAME_CONFIG.PRICE_MIKROBILJKE;
    const diff = state.marketForecast.mikrobiljke - baseM;
    const pct = ((diff / baseM) * 100).toFixed(0);
    forecastM.textContent = `Mikrobiljke: ${state.marketForecast.mikrobiljke} din/kg (${diff >= 0 ? '+' : ''}${pct}%)`;
    forecastM.className = `forecast-item ${diff >= 0 ? 'forecast-up' : 'forecast-down'}`;
  }

  // Masterclass button
  const mcBtn = document.getElementById('masterclass-btn');
  if (mcBtn) {
    const canMc = canOrganizeMasterclass(state);
    mcBtn.disabled = !canMc;
    mcBtn.className = `masterclass-btn ${canMc ? 'mc-available' : ''}`;
  }
  const mcInfo = document.getElementById('masterclass-info');
  if (mcInfo) {
    mcInfo.textContent = `${state.masterclassCount} organizovano | Reputation: ${state.reputation.toFixed(2)}×`;
  }

  // Income preview
  const preview = document.getElementById('macro-income-preview');
  if (preview) {
    preview.textContent = formatDin(state.seasonRevenue || 0) + '/sez';
  }

  // Synergy tree
  const synTree = document.getElementById('synergy-tree-container');
  if (synTree) updateSynergyTree(synTree, state);

  // Prestige button (add if can prestige and not present)
  if (canPrestige(state)) {
    let prestigeBtn = document.getElementById('prestige-btn');
    if (!prestigeBtn) {
      const mcDiv = document.getElementById('macro-masterclass');
      if (mcDiv) {
        const pb = document.createElement('button');
        pb.id = 'prestige-btn';
        pb.className = 'prestige-trigger-btn';
        pb.textContent = '⭐ Prestiž Reset';
        mcDiv.appendChild(pb);
      }
    }
  }

  // Active event indicator
  const macroHeader = document.getElementById('macro-header');
  if (macroHeader) {
    if (state.activeEvent) {
      let evEl = macroHeader.querySelector('#active-event-badge');
      if (!evEl) {
        evEl = document.createElement('span');
        evEl.id = 'active-event-badge';
        evEl.className = 'event-badge';
        macroHeader.appendChild(evEl);
      }
      evEl.textContent = state.activeEvent.label;
    } else {
      const existing = macroHeader.querySelector('#active-event-badge');
      if (existing) existing.remove();
    }
  }
}

function updateBranchItems(state) {
  const ghItem = document.getElementById('branch-greenhouse');
  if (ghItem) {
    if (state.greenhouse.unlocked) {
      ghItem.className = 'branch-item branch-active';
      ghItem.innerHTML = `<span class="branch-icon">🌱</span><span class="branch-name">Plastenik</span><span class="branch-status-label">Aktivan</span>`;
    } else {
      const canAfford = state.capital >= GAME_CONFIG.GREENHOUSE_UNLOCK_COST;
      ghItem.className = `branch-item branch-locked ${canAfford ? 'branch-affordable' : ''}`;
      ghItem.innerHTML = `
        <span class="branch-icon">🌱</span>
        <span class="branch-name">Plastenik</span>
        <button class="branch-unlock-btn ${canAfford ? 'btn-ready' : ''}"
          data-branch="greenhouse" data-cost="${GAME_CONFIG.GREENHOUSE_UNLOCK_COST}">
          Otključaj<br>${formatDin(GAME_CONFIG.GREENHOUSE_UNLOCK_COST)}
        </button>
      `;
    }
  }

  const fpItem = document.getElementById('branch-fishpond');
  if (fpItem) {
    if (state.fishpond.unlocked) {
      fpItem.className = 'branch-item branch-active';
      fpItem.innerHTML = `<span class="branch-icon">🐟</span><span class="branch-name">Jezero</span><span class="branch-status-label">Aktivan</span>`;
    } else {
      const canAfford = state.capital >= GAME_CONFIG.FISHPOND_UNLOCK_COST;
      fpItem.className = `branch-item branch-locked ${canAfford ? 'branch-affordable' : ''}`;
      fpItem.innerHTML = `
        <span class="branch-icon">🐟</span>
        <span class="branch-name">Jezero</span>
        <button class="branch-unlock-btn ${canAfford ? 'btn-ready' : ''}"
          data-branch="fishpond" data-cost="${GAME_CONFIG.FISHPOND_UNLOCK_COST}">
          Otključaj<br>${formatDin(GAME_CONFIG.FISHPOND_UNLOCK_COST)}
        </button>
      `;
    }
  }
}
