/**
 * ui.js — HUD + paleta + modali
 *
 * DOM ID-jevi (iz index.html):
 *   #hud, #hudRow1, #hudRow2
 *   #hudFlow, #hudPH, #hudEco, #hudWeek, #hudTimer, #hudAP, #hudPhase, #hudEvent
 *   #palette
 *   #btnSimulate
 *   #weekLog
 *   #shareOverlay, #shareScore, #shareRank, #shareClose
 *   #cardModal, #cardModalTitle, #cardModalBody, #cardModalClose, #cardPinBtn, #cardNextBtn
 *   #debugPanel, #debugContent
 *   #loading
 */

// ─── AP bule helper ───────────────────────────────────────────────────────────

function apBullets(ap, max = 5) {
  const filled = Math.max(0, Math.min(ap, max));
  return '●'.repeat(filled) + '○'.repeat(Math.max(0, max - filled));
}

// ─── Inicijalizacija ──────────────────────────────────────────────────────────

export function initUI() {
  buildPalette();

  const btnSim = document.getElementById('btnSimulate');
  if (btnSim) {
    btnSim.addEventListener('click', () => {
      import('./main.js').then(m => {
        if (typeof m.triggerSimulation === 'function') m.triggerSimulation();
      });
    });
  }

  // Zatvori card modal
  const closeCard = document.getElementById('cardModalClose');
  if (closeCard) {
    closeCard.addEventListener('click', () => closeModal('cardModal'));
  }

  // Zatvori share overlay
  const closeShare = document.getElementById('shareClose');
  if (closeShare) {
    closeShare.addEventListener('click', () => closeModal('shareOverlay'));
  }

  // Backdrop klik zatvara oba modala
  ['cardModal', 'shareOverlay'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.classList.contains('modal-backdrop')) {
        closeModal(id);
      }
    });
  });
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden', 'true');
}

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden', 'false');
}

// ─── HUD update ───────────────────────────────────────────────────────────────

export function updateHUD(state) {
  const avgPH    = calcAvgPH(state.lakes);
  const lastScore = state.weeklyScores?.at(-1)?.score ?? 0;
  const sourceRate = state.source?.rate ?? 0;
  const maxAP    = state.difficulty === 'fazaB' ? 4 : 5;

  safeSet('hudFlow',  `${sourceRate.toFixed(2)} / 0.40 l/s`);
  safeSet('hudPH',    `pH ${avgPH.toFixed(1)}`);
  safeSet('hudEco',   `Eco ${lastScore.toFixed(0)}%`);
  safeSet('hudWeek',  `Nedelja ${state.week ?? 1} / 12`);
  safeSet('hudTimer', `${Math.ceil(state.apTimer ?? 0)}s`);
  safeSet('hudAP',    `AP ${apBullets(state.ap ?? 0, maxAP)}`);
  safeSet('hudPhase', state.phase === 'planning' ? 'Planiranje' : 'Simulacija');

  // Simulate button
  const btn = document.getElementById('btnSimulate');
  if (btn) {
    const inPlanning = state.phase === 'planning';
    btn.disabled    = !inPlanning;
    btn.textContent = inPlanning
      ? `SIMULIRAJ NEDELJU ${state.week ?? 1} →`
      : 'Simulacija u toku…';
  }

  // AP timer boja — upozorenje ispod 10s
  const timerEl = document.getElementById('hudTimer');
  if (timerEl) {
    timerEl.classList.toggle('hud-timer-warn', (state.apTimer ?? 99) < 10);
  }

  // pH HUD boja
  const phEl = document.getElementById('hudPH');
  if (phEl) {
    phEl.classList.remove('status-healthy', 'status-warning', 'status-critical');
    if (avgPH >= 6.5 && avgPH <= 8.5)      phEl.classList.add('status-healthy');
    else if (avgPH >= 6.0 && avgPH <= 9.0) phEl.classList.add('status-warning');
    else                                    phEl.classList.add('status-critical');
  }
}

function calcAvgPH(lakes) {
  if (!lakes) return 7.0;
  const vals = Object.values(lakes).map(l => l?.pH).filter(v => typeof v === 'number');
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 7.0;
}

function safeSet(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE_DEFS = [
  { type: 'drainage',  label: 'Drenaža',     apCost: 1 },
  { type: 'biofilter', label: 'Biofilter',   apCost: 2 },
  { type: 'wetland',   label: 'Močvara',     apCost: 1 },
  { type: 'lake1',     label: 'Jezero I',    apCost: 2 },
  { type: 'lake2',     label: 'Jezero II',   apCost: 3 },
  { type: 'dam',       label: 'Brana',       apCost: 2 },
  { type: 'remove',    label: 'Ukloni',      apCost: 1 },
];

function buildPalette() {
  const palette = document.getElementById('palette');
  if (!palette) return;
  palette.innerHTML = '';

  import('./config.js').then(({ TILE_CONFIG, TILE_TYPES }) => {
    PALETTE_DEFS.forEach(({ type, label, apCost }) => {
      let emoji;
      if (type === 'remove')       emoji = '✖';
      else if (type === 'lake1')   emoji = TILE_CONFIG[TILE_TYPES.LAKE_1]?.emoji  || '💧';
      else if (type === 'lake2')   emoji = TILE_CONFIG[TILE_TYPES.LAKE_2]?.emoji  || '💧';
      else                         emoji = TILE_CONFIG[type]?.emoji || '?';

      const btn = document.createElement('button');
      btn.className         = 'palette-btn';
      btn.dataset.tile      = type;
      btn.setAttribute('aria-label', `${label} — ${apCost} AP`);
      btn.setAttribute('type', 'button');
      btn.innerHTML = `
        <span class="icon" aria-hidden="true">${emoji}</span>
        <span class="label">${label}</span>
        <span class="cost">${apCost} AP</span>
      `;
      btn.addEventListener('click', () => selectTile(type));
      palette.appendChild(btn);
    });
  });
}

export function selectTile(tileType) {
  document.querySelectorAll('.palette-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.tile === tileType);
  });

  import('./state.js').then(m => {
    if (typeof m.setState === 'function') m.setState({ selectedTile: tileType });
  });
}

/** Deselectuje sve paleta dugmadi (poziva se posle simulacije itd.) */
export function clearTileSelection() {
  document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('selected'));
}

// ─── Event banner ─────────────────────────────────────────────────────────────

export function showEventBanner(event) {
  const el = document.getElementById('hudEvent');
  if (!el) return;

  const label = event?.label || event?.type || 'Događaj';
  const desc  = event?.description || '';

  el.textContent = `⚡ ${label}${desc ? ': ' + desc : ''}`;
  el.removeAttribute('hidden');
  el.style.display = '';

  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.setAttribute('hidden', '');
  }, 5000);
}

// ─── Week log ─────────────────────────────────────────────────────────────────

export function addWeekLog(week, score, event) {
  const log = document.getElementById('weekLog');
  if (!log) return;

  const item = document.createElement('div');
  item.className = 'log-item';

  const pctClass =
    score >= 80 ? 'status-healthy' :
    score >= 50 ? 'status-warning' : 'status-critical';

  item.innerHTML =
    `<span class="log-week">N${week}</span>` +
    `<span class="log-score ${pctClass}">${score.toFixed(0)}%</span>` +
    (event ? `<span class="log-event">⚡${event}</span>` : '');

  log.prepend(item);

  // Drži max 12 stavki
  while (log.children.length > 12) log.removeChild(log.lastChild);
}

// ─── Victory / share screen ───────────────────────────────────────────────────

export function showVictoryScreen(state, result) {
  const overlay   = document.getElementById('shareOverlay');
  const scoreEl   = document.getElementById('shareScore');
  const rankEl    = document.getElementById('shareRank');
  const restartBtn = document.getElementById('btnRestart');
  const shareBtn  = document.getElementById('btnShare');
  const dlBtn     = document.getElementById('btnDownload');
  if (!overlay) return;

  if (scoreEl) {
    scoreEl.innerHTML = `
      <div class="result-emoji">${result.emoji}</div>
      <h2>${result.label}</h2>
      <p>Eco Score: <strong>${result.score.toFixed(0)}%</strong></p>
      <p>12 nedelja završeno · ${state.difficulty ?? 'Faza A'}</p>
      <p class="guncati-cta">Brana gradi ovo u stvarnosti → <a href="https://guncati.rs" target="_blank" rel="noopener noreferrer">guncati.rs</a></p>
    `;
  }

  if (rankEl) {
    rankEl.textContent = '';
    state.weeklyScores?.forEach((ws, i) => {
      const span = document.createElement('span');
      span.className = 'rank-dot';
      span.title     = `Nedelja ${i + 1}: ${ws.score?.toFixed(0)}%`;
      const pct = ws.score ?? 0;
      span.style.background =
        pct >= 80 ? 'var(--color-healthy)' :
        pct >= 50 ? 'var(--color-warning)' : 'var(--color-critical)';
      rankEl.appendChild(span);
    });
  }

  // Restart dugme
  if (restartBtn) {
    restartBtn.onclick = () => {
      closeModal('shareOverlay');
      if (typeof window.startNewGame === 'function') window.startNewGame();
    };
  }

  // Share dugme (Web Share API sa fallback)
  if (shareBtn) {
    shareBtn.onclick = () => shareResult(result, state);
  }

  // Download dugme (screenshot canvas)
  if (dlBtn) {
    dlBtn.onclick = () => downloadShareCanvas();
  }

  openModal('shareOverlay');
}

function shareResult(result, state) {
  const text =
    `Akva-Sklop — Guncati Imanje\n` +
    `${result.emoji} ${result.label}\n` +
    `Eco Score: ${result.score.toFixed(0)}% · ${state.difficulty}\n` +
    `https://mkdsl.github.io/gari-daily-games/games/2026-05-30-akva-sklop/`;

  if (navigator.share) {
    navigator.share({ title: 'Akva-Sklop', text }).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  navigator.clipboard?.writeText(text).then(() => {
    showToast('Rezultat kopiran u clipboard!');
  }).catch(() => {
    showToast('Podeli: ' + text.split('\n')[1]);
  });
}

function downloadShareCanvas() {
  const sc = document.getElementById('shareCanvas');
  if (!sc) return;
  const a   = document.createElement('a');
  a.download = `akva-sklop-${Date.now()}.png`;
  a.href     = sc.toDataURL('image/png');
  a.click();
}

// ─── Card modal ───────────────────────────────────────────────────────────────

export function showCard(card) {
  const title  = document.getElementById('cardModalTitle');
  const body   = document.getElementById('cardModalBody');
  const pinBtn = document.getElementById('cardPinBtn');
  const nextBtn = document.getElementById('cardNextBtn');
  if (!title || !body) return;

  title.textContent = card.title;
  body.innerHTML = `
    <p>${card.text}</p>
    ${card.verified === false
      ? `<p class="card-verified">[pending Brana verification]</p>`
      : `<p class="card-verified">✓ Verifikovano</p>`}
  `;

  if (pinBtn) {
    pinBtn.style.display = card.pinnable ? '' : 'none';
    pinBtn.onclick = () => {
      import('./state.js').then(m => {
        if (typeof m.setState === 'function') {
          m.setState({ pinnedCard: card });
        }
      });
      closeModal('cardModal');
      showToast(`"${card.title}" prikvačeno na HUD`);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      import('./cards.js').then(m => {
        if (typeof m.showNextCard === 'function') m.showNextCard();
      });
    };
  }

  openModal('cardModal');
}

// ─── Debug panel ──────────────────────────────────────────────────────────────

export function toggleDebugPanel(debugData) {
  const panel = document.getElementById('debugPanel');
  if (!panel) return;

  const isHidden = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !isHidden);
  panel.setAttribute('aria-hidden', String(!isHidden)); // toggle

  if (isHidden && debugData) {
    const content = document.getElementById('debugContent');
    if (content) content.textContent = JSON.stringify(debugData, null, 2);
  }
}

// ─── Loading screen ───────────────────────────────────────────────────────────

export function hideLoadingScreen() {
  const loading = document.getElementById('loading');
  if (!loading) return;
  loading.classList.add('hidden');
  // Ukloni iz DOM-a posle animacije
  loading.addEventListener('animationend', () => loading.remove(), { once: true });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(message) {
  let toast = document.getElementById('_toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = '_toast';
    toast.style.cssText = `
      position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.85); color: #fff;
      padding: 0.5rem 1.2rem; border-radius: 6px;
      font-size: 0.8rem; z-index: 999; pointer-events: none;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}
