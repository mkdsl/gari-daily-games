import { formatDin } from '../economy/market.js';
import { GAME_CONFIG } from '../config.js';
import { hireWorker, fireWorker, getWorkerStatus } from '../systems/workers.js';
import { canOrganizeMasterclass, organizeMasterclass, getMasterclassStats, getMasterclassTheme } from '../systems/masterclass.js';
import { updateChannelPanel } from './channel-panel.js';
import { updateSynergyTree } from './synergy-tree.js';
import { canPrestige, getPhaseProgress, getNextPhaseRequirements } from '../systems/phases.js';
import { getPrestigeHistory } from '../systems/prestige.js';
import { getPendingAchievements } from '../systems/achievements.js';

let _gameRef = null;

// ─── Init ──────────────────────────────────────────────────────────────────────

export function initMacroPanel(gameRef) {
  _gameRef = gameRef;
  bindMacroPanelEvents(gameRef.state);
}

// ─── Event binding ────────────────────────────────────────────────────────────

function bindMacroPanelEvents(state) {
  document.addEventListener('click', (e) => {
    const audio = _gameRef?.audio;

    // Branch unlock buttons
    const unlockBtn = e.target.closest('.branch-unlock-btn');
    if (unlockBtn) {
      const branch = unlockBtn.getAttribute('data-branch');
      const cost = parseInt(unlockBtn.getAttribute('data-cost'), 10);
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
      return;
    }

    // Hire worker
    if (e.target.closest('#hire-worker-btn')) {
      const result = hireWorker(state, audio);
      if (!result.success) {
        import('./modals.js').then(({ showToast }) => showToast(`⚠️ ${result.reason}`));
      } else {
        import('./modals.js').then(({ showToast }) => {
          showToast(`✓ Radnik angažovan! Dnevne akcije: +${GAME_CONFIG.ACTIONS_PER_WORKER}`);
        });
      }
      return;
    }

    // Fire worker
    if (e.target.closest('#fire-worker-btn')) {
      import('./modals.js').then(({ showConfirmDialog }) => {
        showConfirmDialog(
          'Otpusti radnika?',
          `Dobijaš 50% refund (${formatDin(GAME_CONFIG.WORKER_HIRE_COST * 0.5)}). Ovo smanjuje dnevne akcije.`,
          () => {
            const result = fireWorker(state);
            if (result.success) {
              import('./modals.js').then(({ showToast }) => showToast(`✓ Radnik otpušten. Refund: ${formatDin(result.refund)}`));
            }
          }
        );
      });
      return;
    }

    // Masterclass
    if (e.target.closest('#masterclass-btn')) {
      const result = organizeMasterclass(state, audio);
      if (!result.success) {
        import('./modals.js').then(({ showToast }) => showToast(`⚠️ ${result.reason}`));
      }
      return;
    }

    // Achievement gallery
    if (e.target.closest('#ach-gallery-btn')) {
      import('./modals.js').then(({ showAchievementGallery }) => showAchievementGallery(state));
      return;
    }

    // Export save
    if (e.target.closest('#export-save-btn')) {
      import('../state.js').then(({ exportSave }) => exportSave(state));
      return;
    }

    // Prestige button
    if (e.target.closest('#prestige-btn')) {
      import('../systems/prestige.js').then(({ openPrestigeModal }) => openPrestigeModal(state, _gameRef));
      return;
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
            import('./modals.js').then(({ showToast }) => showToast('✓ Save uspešno učitan!'));
          },
          (err) => {
            import('./modals.js').then(({ showToast }) => showToast(`⚠️ ${err}`));
          }
        );
      });
    });
  }
}

// ─── Main update ──────────────────────────────────────────────────────────────

/**
 * Update macro panel content — called every tick.
 * @param {object} state
 */
export function updateMacroPanelUI(state) {
  updateBranchItems(state);
  updateChannelPanelSection(state);
  updateStatsSection(state);
  updateWorkerSection(state);
  updateMasterclassSection(state);
  updatePhaseProgressSection(state);
  updateMarketForecast(state);
  updateSynergySection(state);
  updatePrestigeSection(state);
  updateEventBadge(state);
  updateAchievementHints(state);
}

// ─── Branch items ─────────────────────────────────────────────────────────────

function updateBranchItems(state) {
  updateBranchItem(
    'branch-greenhouse',
    '🌱', 'Plastenik',
    state.greenhouse.unlocked,
    state.capital,
    GAME_CONFIG.GREENHOUSE_UNLOCK_COST,
    'greenhouse',
    state.greenhouse.unlocked ? `${state.greenhouse.areaM2} m² | ${state.greenhouse.currentCrop}` : null
  );

  updateBranchItem(
    'branch-fishpond',
    '🐟', 'Jezero',
    state.fishpond.unlocked,
    state.capital,
    GAME_CONFIG.FISHPOND_UNLOCK_COST,
    'fishpond',
    state.fishpond.unlocked ? `${state.fishpond.areaM2} m² | ${state.fishpond.fishType}` : null
  );
}

function updateBranchItem(elId, icon, name, unlocked, capital, cost, branch, detail) {
  const el = document.getElementById(elId);
  if (!el) return;

  if (unlocked) {
    el.className = 'branch-item branch-active';
    el.innerHTML = `
      <span class="branch-icon">${icon}</span>
      <div class="branch-info">
        <span class="branch-name">${name}</span>
        ${detail ? `<span class="branch-detail">${detail}</span>` : ''}
      </div>
      <span class="branch-status-label active-label">Aktivan</span>
    `;
  } else {
    const canAfford = capital >= cost;
    el.className = `branch-item branch-locked ${canAfford ? 'branch-affordable' : ''}`;
    el.innerHTML = `
      <span class="branch-icon">${icon}</span>
      <div class="branch-info">
        <span class="branch-name">${name}</span>
        <span class="branch-cost-label">${formatDin(cost)}</span>
      </div>
      <button class="branch-unlock-btn ${canAfford ? 'btn-ready' : 'btn-disabled'}"
        data-branch="${branch}" data-cost="${cost}"
        ${canAfford ? '' : 'disabled'}>
        ${canAfford ? 'Otključaj' : 'Nedovoljno'}
      </button>
    `;
  }
}

// ─── Channel panel ────────────────────────────────────────────────────────────

function updateChannelPanelSection(state) {
  const chContainer = document.getElementById('channel-panel-container');
  if (chContainer) updateChannelPanel(chContainer, state, _gameRef);
}

// ─── Stats section ────────────────────────────────────────────────────────────

function updateStatsSection(state) {
  const totalRevEl = document.getElementById('total-revenue-display');
  if (totalRevEl) totalRevEl.textContent = formatDin(state.totalRevenue);

  const seasonRevEl = document.getElementById('season-revenue-display');
  if (seasonRevEl) seasonRevEl.textContent = formatDin(state.seasonRevenue || 0);

  // Per-branch breakdown
  const mushRevEl = document.getElementById('mushroom-rev-breakdown');
  if (mushRevEl) mushRevEl.textContent = formatDin(state.mushrooms.revenueEarned || 0);
  const ghRevEl = document.getElementById('greenhouse-rev-breakdown');
  if (ghRevEl) ghRevEl.textContent = formatDin(state.greenhouse.revenueEarned || 0);
  const fpRevEl = document.getElementById('fishpond-rev-breakdown');
  if (fpRevEl) fpRevEl.textContent = formatDin(state.fishpond.revenueEarned || 0);
}

// ─── Worker section ───────────────────────────────────────────────────────────

function updateWorkerSection(state) {
  const status = getWorkerStatus(state);

  const workersEl = document.getElementById('workers-display');
  if (workersEl) {
    workersEl.textContent = `${state.workers.hired}/${GAME_CONFIG.MAX_WORKERS}`;
    workersEl.title = status.tooltip;
  }

  const hireBtn = document.getElementById('hire-worker-btn');
  if (hireBtn) {
    const cost = GAME_CONFIG.WORKER_HIRE_COST;
    const canHire = state.workers.hired < GAME_CONFIG.MAX_WORKERS && state.capital >= cost;
    hireBtn.disabled = !canHire;
    hireBtn.title = canHire
      ? `Angažuj radnika: ${formatDin(cost)} (+${GAME_CONFIG.ACTIONS_PER_WORKER} akcije/sez)`
      : state.workers.hired >= GAME_CONFIG.MAX_WORKERS
        ? 'Maksimalan broj radnika'
        : `Nedovoljno kapitala (${formatDin(cost)})`;
  }

  const fireBtn = document.getElementById('fire-worker-btn');
  if (fireBtn) {
    fireBtn.disabled = state.workers.hired === 0;
    fireBtn.title = state.workers.hired > 0 ? `Otpusti radnika (50% refund: ${formatDin(GAME_CONFIG.WORKER_HIRE_COST * 0.5)})` : '';
    fireBtn.style.display = state.workers.hired > 0 ? '' : 'none';
  }
}

// ─── Masterclass section ──────────────────────────────────────────────────────

function updateMasterclassSection(state) {
  const mcBtn = document.getElementById('masterclass-btn');
  if (mcBtn) {
    const canMc = canOrganizeMasterclass(state);
    mcBtn.disabled = !canMc;
    mcBtn.className = `masterclass-btn ${canMc ? 'mc-available btn-ready' : ''}`;
    if (!state.masterclassUnlocked) {
      mcBtn.textContent = `🎓 Masterclass (sez. ${GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON}+)`;
    } else if (canMc) {
      mcBtn.textContent = '🎓 Organizuj Masterclass';
    } else {
      const actionsLeft = state.workers.dailyActionsTotal - state.workers.dailyActionsUsed;
      mcBtn.textContent = actionsLeft < 2
        ? `🎓 Masterclass (treba 2 akcije, imaš ${actionsLeft})`
        : '🎓 Masterclass';
    }
  }

  const mcInfo = document.getElementById('masterclass-info');
  if (mcInfo) {
    const stats = getMasterclassStats(state);
    if (state.masterclassUnlocked) {
      mcInfo.innerHTML = `
        <span>${stats.count} organizovano</span>
        <span>Rep: ${state.reputation.toFixed(2)}×</span>
        <span>Sledeći: ~${formatDin(stats.nextProjected)}</span>
      `;
    } else {
      mcInfo.innerHTML = `<span class="muted">Dostupno od sezone ${GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON}</span>`;
    }
  }

  const mcThemeEl = document.getElementById('mc-theme-display');
  if (mcThemeEl && state.masterclassUnlocked) {
    mcThemeEl.textContent = `Tema: "${getMasterclassTheme(state)}"`;
  }
}

// ─── Phase progress section ───────────────────────────────────────────────────

function updatePhaseProgressSection(state) {
  const phaseProgressEl = document.getElementById('phase-progress-bar-fill');
  const phaseGoalEl = document.getElementById('phase-goal-text');
  const phaseReqsEl = document.getElementById('phase-requirements-list');

  const progress = getPhaseProgress(state);

  if (phaseProgressEl) {
    phaseProgressEl.style.width = `${progress.pct.toFixed(1)}%`;
  }

  if (phaseGoalEl && state.phase !== 'C') {
    phaseGoalEl.textContent = `${progress.desc} (${progress.pct.toFixed(0)}%)`;
  } else if (phaseGoalEl) {
    phaseGoalEl.textContent = '✓ Faza C dostiguta — Prestiž dostupan!';
  }

  if (phaseReqsEl) {
    const reqs = getNextPhaseRequirements(state);
    if (reqs.length > 0) {
      phaseReqsEl.innerHTML = reqs.map(r =>
        `<li class="${r.met ? 'req-met' : 'req-unmet'}">${r.met ? '✓' : '○'} ${r.label}</li>`
      ).join('');
    } else {
      phaseReqsEl.innerHTML = '';
    }
  }
}

// ─── Market forecast ──────────────────────────────────────────────────────────

function updateMarketForecast(state) {
  if (!state.marketForecast) return;

  const forecastP = document.getElementById('forecast-paradajz');
  if (forecastP) {
    const baseP = GAME_CONFIG.PRICE_PARADAJZ;
    const diff = state.marketForecast.paradajz - baseP;
    const pct = ((diff / baseP) * 100).toFixed(0);
    forecastP.textContent = `Paradajz: ${state.marketForecast.paradajz} din/kg (${diff >= 0 ? '+' : ''}${pct}%)`;
    forecastP.className = `forecast-item ${diff >= 0 ? 'forecast-up' : 'forecast-down'}`;
  }

  const forecastM = document.getElementById('forecast-mikro');
  if (forecastM) {
    const baseM = GAME_CONFIG.PRICE_MIKROBILJKE;
    const diff = state.marketForecast.mikrobiljke - baseM;
    const pct = ((diff / baseM) * 100).toFixed(0);
    forecastM.textContent = `Mikrobiljke: ${state.marketForecast.mikrobiljke} din/kg (${diff >= 0 ? '+' : ''}${pct}%)`;
    forecastM.className = `forecast-item ${diff >= 0 ? 'forecast-up' : 'forecast-down'}`;
  }
}

// ─── Synergy section ──────────────────────────────────────────────────────────

function updateSynergySection(state) {
  const synTree = document.getElementById('synergy-tree-container');
  if (synTree) updateSynergyTree(synTree, state);
}

// ─── Prestige section ─────────────────────────────────────────────────────────

function updatePrestigeSection(state) {
  if (canPrestige(state)) {
    let prestigeBtn = document.getElementById('prestige-btn');
    if (!prestigeBtn) {
      const mcDiv = document.getElementById('macro-masterclass');
      if (mcDiv) {
        const pb = document.createElement('button');
        pb.id = 'prestige-btn';
        pb.className = 'prestige-trigger-btn btn-ready';
        pb.innerHTML = '⭐ Prestiž Reset';
        mcDiv.appendChild(pb);
      }
    }
    if (prestigeBtn) {
      prestigeBtn.style.display = '';
      const ph = getPrestigeHistory(state);
      prestigeBtn.title = `Prestiž #${ph.count + 1}\nYield: ×${ph.yieldMult.toFixed(3)} → vyšší\nKapital carry: 50%`;
    }
  } else {
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) prestigeBtn.style.display = 'none';
  }

  // Prestige count display
  const pcEl = document.getElementById('prestige-count-display');
  if (pcEl) {
    const ph = getPrestigeHistory(state);
    pcEl.textContent = ph.count > 0
      ? `${ph.count}× (${ph.scenarioName}) | Yield ×${ph.yieldMult.toFixed(2)}`
      : 'Bez prestiža';
  }
}

// ─── Event badge ──────────────────────────────────────────────────────────────

function updateEventBadge(state) {
  const macroHeader = document.getElementById('macro-header');
  if (!macroHeader) return;

  if (state.activeEvent) {
    let evEl = macroHeader.querySelector('#active-event-badge');
    if (!evEl) {
      evEl = document.createElement('span');
      evEl.id = 'active-event-badge';
      evEl.className = `event-badge event-sev-${state.activeEvent.severity}`;
      macroHeader.appendChild(evEl);
    }
    evEl.textContent = state.activeEvent.label;
    evEl.title = state.activeEvent.desc;
  } else {
    const existing = macroHeader.querySelector('#active-event-badge');
    if (existing) existing.remove();
  }
}

// ─── Achievement hints ────────────────────────────────────────────────────────

function updateAchievementHints(state) {
  const hintsEl = document.getElementById('ach-hints');
  if (!hintsEl) return;

  const pending = getPendingAchievements(state);
  if (pending.length === 0) {
    hintsEl.innerHTML = '';
    return;
  }

  const top = pending.slice(0, 2);
  hintsEl.innerHTML = top.map(({ ach, pct }) => `
    <div class="ach-hint-item">
      <span class="ach-hint-name">⏳ ${ach.name}</span>
      <div class="ach-hint-bar">
        <div class="ach-hint-fill" style="width:${(pct * 100).toFixed(0)}%"></div>
      </div>
    </div>
  `).join('');
}
