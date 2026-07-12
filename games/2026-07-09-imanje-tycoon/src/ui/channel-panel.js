import { GAME_CONFIG } from '../config.js';
import { formatDin, unlockChannel } from '../economy/market.js';

let initialized = false;

// ─── Main update ──────────────────────────────────────────────────────────────

/** Render/update channel panel inside container */
export function updateChannelPanel(container, state, gameRef) {
  if (!initialized || container.dataset.chInit !== '1') {
    container.innerHTML = buildChannelPanel(state);
    container.dataset.chInit = '1';
    initialized = true;
    bindChannelEvents(container, state, gameRef);
  }

  refreshChannelUI(container, state);
}

// ─── Refresh (partial update, no rebuild) ─────────────────────────────────────

function refreshChannelUI(container, state) {
  // Slider values
  const allChannels = ['direktna', 'pijaca', 'restoran', 'online'];
  for (const ch of allChannels) {
    const slider = container.querySelector(`[data-channel="${ch}"]`);
    const valueEl = container.querySelector(`[data-ch-val="${ch}"]`);
    if (slider && !slider.matches(':active')) {
      slider.value = state.channels[ch] || 0;
    }
    if (valueEl) valueEl.textContent = `${state.channels[ch] || 0}%`;
  }

  // Unlock buttons
  refreshUnlockButtons(container, state);

  // Channel row visibility
  ['pijaca', 'restoran', 'online'].forEach(ch => {
    const row = container.querySelector(`[data-ch-row="${ch}"]`);
    if (row) {
      row.style.display = state.unlockedChannels.includes(ch) ? '' : 'none';
    }
  });

  // Allocation total warning
  const total = Object.values(state.channels).reduce((s, v) => s + (v || 0), 0);
  const warningEl = container.querySelector('#channel-total');
  if (warningEl) {
    if (Math.abs(total - 100) > 1) {
      warningEl.textContent = `⚠️ Ukupno: ${total}% (mora biti 100%)`;
      warningEl.className = 'channel-total-warning warn-active';
    } else {
      warningEl.textContent = '';
      warningEl.className = 'channel-total-warning';
    }
  }

  // Analytics section
  updateChannelAnalytics(container, state);
  updateMasterclassChannelSection(container, state);
  updateChannelEfficiency(container, state);
}

function refreshUnlockButtons(container, state) {
  ['pijaca', 'restoran', 'online'].forEach(ch => {
    const btn = container.querySelector(`[data-unlock="${ch}"]`);
    if (!btn) return;
    const unlocked = state.unlockedChannels.includes(ch);
    const cost = GAME_CONFIG.CHANNEL_COSTS[ch];
    if (unlocked) {
      btn.textContent = `✓ ${channelLabel(ch)} otključan`;
      btn.disabled = true;
      btn.className = 'small-btn ch-unlock-btn ch-unlocked';
    } else {
      const canAfford = state.capital >= cost;
      btn.textContent = `🔓 ${channelLabel(ch)}: ${formatDin(cost)}`;
      btn.disabled = !canAfford;
      btn.className = `small-btn ch-unlock-btn ${canAfford ? 'btn-ready' : ''}`;
      btn.title = canAfford
        ? `Otključaj ${channelLabel(ch)} kanal za ${formatDin(cost)}`
        : `Treba ${formatDin(cost - state.capital)} više kapitala`;
    }
  });
}

// ─── Layout builder ───────────────────────────────────────────────────────────

function buildChannelPanel(state) {
  const chMulti = GAME_CONFIG.CHANNEL_MULTIPLIERS;
  const unl = state.unlockedChannels;

  return `
    <div class="channel-panel">

      <div class="channel-section-title">Raspored prodaje</div>
      <div class="channel-tip">Klizači raspoređuju 100% prihoda po kanalima. Direktna prima ostatak.</div>

      <div class="channel-rows">
        <div class="channel-row" data-ch-row="direktna">
          <div class="ch-label-wrap">
            <span class="ch-icon">🏠</span>
            <span class="ch-name">Direktna</span>
            <span class="ch-mult-badge">${chMulti.direktna}×</span>
          </div>
          <input type="range" class="ch-slider" data-channel="direktna"
            min="0" max="100" step="5" value="${state.channels.direktna || 0}"
            title="Direktna prodaja — osnovna cena, bez troškova">
          <span class="ch-val" data-ch-val="direktna">${state.channels.direktna || 0}%</span>
        </div>

        <div class="channel-row ${unl.includes('pijaca') ? '' : 'ch-row-locked'}" data-ch-row="pijaca"
             style="${unl.includes('pijaca') ? '' : 'display:none'}">
          <div class="ch-label-wrap">
            <span class="ch-icon">🛒</span>
            <span class="ch-name">Pijaca</span>
            <span class="ch-mult-badge">${chMulti.pijaca}×</span>
          </div>
          <input type="range" class="ch-slider" data-channel="pijaca"
            min="0" max="100" step="5" value="${state.channels.pijaca || 0}"
            title="Gradska pijaca — +20% cena, lokalni kupci">
          <span class="ch-val" data-ch-val="pijaca">${state.channels.pijaca || 0}%</span>
        </div>

        <div class="channel-row ${unl.includes('restoran') ? '' : 'ch-row-locked'}" data-ch-row="restoran"
             style="${unl.includes('restoran') ? '' : 'display:none'}">
          <div class="ch-label-wrap">
            <span class="ch-icon">🍽️</span>
            <span class="ch-name">Restoran</span>
            <span class="ch-mult-badge ch-mult-premium">${chMulti.restoran}×</span>
          </div>
          <input type="range" class="ch-slider" data-channel="restoran"
            min="0" max="100" step="5" value="${state.channels.restoran || 0}"
            title="Gastro kanal — +55% cena, stabilna porudžbina">
          <span class="ch-val" data-ch-val="restoran">${state.channels.restoran || 0}%</span>
        </div>

        <div class="channel-row ${unl.includes('online') ? '' : 'ch-row-locked'}" data-ch-row="online"
             style="${unl.includes('online') ? '' : 'display:none'}">
          <div class="ch-label-wrap">
            <span class="ch-icon">💻</span>
            <span class="ch-name">Online</span>
            <span class="ch-mult-badge ch-mult-premium">${chMulti.online}×</span>
          </div>
          <input type="range" class="ch-slider" data-channel="online"
            min="0" max="100" step="5" value="${state.channels.online || 0}"
            title="Online direktna dostava — +90% cena, širi doseg">
          <span class="ch-val" data-ch-val="online">${state.channels.online || 0}%</span>
        </div>
      </div>

      <div id="channel-total" class="channel-total-warning"></div>

      <div class="channel-unlocks">
        <button class="small-btn ch-unlock-btn ${unl.includes('pijaca') ? 'ch-unlocked' : (state.capital >= GAME_CONFIG.CHANNEL_COSTS.pijaca ? 'btn-ready' : '')}"
          data-unlock="pijaca" ${unl.includes('pijaca') ? 'disabled' : (state.capital < GAME_CONFIG.CHANNEL_COSTS.pijaca ? 'disabled' : '')}>
          ${unl.includes('pijaca') ? '✓ Pijaca otključan' : `🔓 Pijaca: ${formatDin(GAME_CONFIG.CHANNEL_COSTS.pijaca)}`}
        </button>
        <button class="small-btn ch-unlock-btn ${unl.includes('restoran') ? 'ch-unlocked' : (state.capital >= GAME_CONFIG.CHANNEL_COSTS.restoran ? 'btn-ready' : '')}"
          data-unlock="restoran" ${unl.includes('restoran') ? 'disabled' : (state.capital < GAME_CONFIG.CHANNEL_COSTS.restoran ? 'disabled' : '')}>
          ${unl.includes('restoran') ? '✓ Restoran otključan' : `🔓 Restoran: ${formatDin(GAME_CONFIG.CHANNEL_COSTS.restoran)}`}
        </button>
        <button class="small-btn ch-unlock-btn ${unl.includes('online') ? 'ch-unlocked' : (state.capital >= GAME_CONFIG.CHANNEL_COSTS.online ? 'btn-ready' : '')}"
          data-unlock="online" ${unl.includes('online') ? 'disabled' : (state.capital < GAME_CONFIG.CHANNEL_COSTS.online ? 'disabled' : '')}>
          ${unl.includes('online') ? '✓ Online otključan' : `🔓 Online: ${formatDin(GAME_CONFIG.CHANNEL_COSTS.online)}`}
        </button>
      </div>

      <div class="channel-section-title" style="margin-top:12px">Projekcija prihoda</div>
      <div id="channel-analytics" class="channel-analytics"></div>

      <div class="channel-section-title" style="margin-top:10px">Efektivnost mešavine</div>
      <div id="channel-efficiency" class="channel-efficiency"></div>

      <div id="channel-masterclass" class="channel-masterclass-section"></div>
    </div>
  `;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

function updateChannelAnalytics(container, state) {
  const el = container.querySelector('#channel-analytics');
  if (!el) return;

  const baseRevPerSeason = estimateBaseRevenuePerSeason(state);
  const chMulti = GAME_CONFIG.CHANNEL_MULTIPLIERS;
  const unl = state.unlockedChannels;

  // Build projection rows
  const channelDefs = [
    { id: 'direktna', icon: '🏠', label: 'Direktna', mult: chMulti.direktna, unlocked: true },
    { id: 'pijaca',   icon: '🛒', label: 'Pijaca',   mult: chMulti.pijaca,   unlocked: unl.includes('pijaca') },
    { id: 'restoran', icon: '🍽️', label: 'Restoran', mult: chMulti.restoran, unlocked: unl.includes('restoran') },
    { id: 'online',   icon: '💻', label: 'Online',   mult: chMulti.online,   unlocked: unl.includes('online') },
  ];

  const effectiveMult = getEffectiveMult(state);

  let rows = '';
  for (const ch of channelDefs) {
    const pct = (state.channels[ch.id] || 0);
    const contrib = baseRevPerSeason * (pct / 100) * ch.mult;
    const share = effectiveMult > 0 ? ((pct / 100 * ch.mult) / effectiveMult * 100).toFixed(0) : 0;

    if (!ch.unlocked) {
      const potentialAt50 = baseRevPerSeason * 0.5 * ch.mult;
      rows += `
        <div class="ch-proj-row ch-proj-locked">
          <span class="ch-proj-icon">${ch.icon}</span>
          <span class="ch-proj-name">${ch.label}</span>
          <span class="ch-proj-pct muted">—</span>
          <span class="ch-proj-val muted">Zaključan</span>
          <span class="ch-proj-hint">~${formatDin(potentialAt50)}/sezona @50%</span>
        </div>`;
    } else if (pct === 0) {
      rows += `
        <div class="ch-proj-row ch-proj-idle">
          <span class="ch-proj-icon">${ch.icon}</span>
          <span class="ch-proj-name">${ch.label}</span>
          <span class="ch-proj-pct muted">0%</span>
          <span class="ch-proj-val muted">Ne koristi se</span>
          <span class="ch-proj-hint">${ch.mult}× multiplikator</span>
        </div>`;
    } else {
      rows += `
        <div class="ch-proj-row">
          <span class="ch-proj-icon">${ch.icon}</span>
          <span class="ch-proj-name">${ch.label}</span>
          <span class="ch-proj-pct">${pct}%</span>
          <span class="ch-proj-val">${formatDin(Math.round(contrib))}</span>
          <span class="ch-proj-share">${share}% prihoda</span>
        </div>`;
    }
  }

  // Masterclass row
  if (state.phase >= 'C' || state.masterclassCount > 0) {
    const mcPct = state.channels.masterclass || 0;
    const mcMult = chMulti.masterclass;
    const mcContrib = baseRevPerSeason * (mcPct / 100) * mcMult;
    rows += `
      <div class="ch-proj-row ch-proj-masterclass">
        <span class="ch-proj-icon">🎓</span>
        <span class="ch-proj-name">Masterclass</span>
        <span class="ch-proj-pct">${mcPct}%</span>
        <span class="ch-proj-val">${mcPct > 0 ? formatDin(Math.round(mcContrib)) : '—'}</span>
        <span class="ch-proj-hint">${mcMult}× • edukativni prihod</span>
      </div>`;
  }

  const totalProjected = baseRevPerSeason * effectiveMult;
  rows += `
    <div class="ch-proj-total">
      <span>Ukupno/sezona (est.)</span>
      <span class="ch-proj-total-val">${formatDin(Math.round(totalProjected))}</span>
    </div>`;

  el.innerHTML = `<div class="ch-proj-table">${rows}</div>`;
}

function updateChannelEfficiency(container, state) {
  const el = container.querySelector('#channel-efficiency');
  if (!el) return;

  const effectiveMult = getEffectiveMult(state);
  const maxPossibleMult = getMaxPossibleMult(state);
  const efficiencyPct = maxPossibleMult > 0 ? Math.min(100, (effectiveMult / maxPossibleMult) * 100) : 100;
  const isOptimal = effectiveMult >= maxPossibleMult * 0.95;

  const baseRevPerSeason = estimateBaseRevenuePerSeason(state);
  const currentTotal = baseRevPerSeason * effectiveMult;
  const maxTotal = baseRevPerSeason * maxPossibleMult;
  const leavingOnTable = maxTotal - currentTotal;

  el.innerHTML = `
    <div class="ch-efficiency-wrap">
      <div class="ch-eff-row">
        <span class="ch-eff-label">Efikasnost mešavine:</span>
        <span class="ch-eff-val ${isOptimal ? 'eff-optimal' : 'eff-low'}">${efficiencyPct.toFixed(0)}%</span>
      </div>
      <div class="ch-eff-bar-wrap">
        <div class="ch-eff-bar">
          <div class="ch-eff-fill ${isOptimal ? 'eff-fill-high' : (efficiencyPct > 60 ? 'eff-fill-mid' : 'eff-fill-low')}"
               style="width:${efficiencyPct.toFixed(1)}%"></div>
        </div>
      </div>
      <div class="ch-eff-mult">
        Multiplikator: <strong>${effectiveMult.toFixed(3)}×</strong>
        ${isOptimal
          ? '<span class="eff-badge-ok">✓ Optimalno</span>'
          : `<span class="eff-badge-hint">Max: ${maxPossibleMult.toFixed(2)}×</span>`}
      </div>
      ${leavingOnTable > 100 && !isOptimal ? `
        <div class="ch-eff-hint">
          💡 Prebaci više na Premium kanale → +${formatDin(Math.round(leavingOnTable))}/sezona potencijala
        </div>` : ''}
      ${getChannelTip(state)}
    </div>
  `;
}

function updateMasterclassChannelSection(container, state) {
  const el = container.querySelector('#channel-masterclass');
  if (!el) return;

  const mcCount = state.masterclassCount || 0;
  const mcUnlockSeason = GAME_CONFIG.MASTERCLASS_UNLOCK_SEASON || 4;
  const isMcAvailable = state.season >= mcUnlockSeason;

  if (!isMcAvailable) {
    el.innerHTML = `
      <div class="mc-channel-teaser">
        <div class="mc-channel-title">🎓 Masterclass kanal</div>
        <div class="mc-channel-desc muted">
          Dostupan od Sezone ${mcUnlockSeason}. Edukativni prihod ${GAME_CONFIG.CHANNEL_MULTIPLIERS.masterclass}× — Tom Sawyer model.
        </div>
      </div>`;
    return;
  }

  const participants = GAME_CONFIG.MASTERCLASS_PARTICIPANTS_BASE + mcCount * 2;
  const revPerEvent = participants * GAME_CONFIG.MASTERCLASS_REVENUE_PER_PARTICIPANT;
  const reputation = state.reputation || 1.0;

  el.innerHTML = `
    <div class="mc-channel-card">
      <div class="mc-channel-title">🎓 Masterclass kanal</div>
      <div class="mc-channel-stats">
        <span>Organizovano: <strong>${mcCount}</strong></span>
        <span>Rep: <strong>${reputation.toFixed(2)}</strong></span>
        <span>Polaznici/event: <strong>~${participants}</strong></span>
        <span>Prihod/event: <strong>${formatDin(revPerEvent)}</strong></span>
      </div>
      <div class="mc-channel-desc">
        Masterclass kanal nosi ${GAME_CONFIG.CHANNEL_MULTIPLIERS.masterclass}× multiplikator na deo prihoda
        koji prolazi kroz edukativni program. ${mcCount === 0
          ? 'Organizuj prvi masterclass iz Makro panela!'
          : `${mcCount} event${mcCount > 1 ? 'a' : ''} — nastavi graditi alumni mrežu.`}
      </div>
      ${state.synergies?.ekosistem
        ? '<div class="mc-synergy-badge">🌿 Ekosistem sinergija aktivna — +5% sve grane po MC</div>'
        : '<div class="mc-channel-hint muted">Ekosistem sinergija: ≥3 MC + sve 3 grane aktivan</div>'
      }
    </div>
  `;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Estimate base revenue per season (before channel multipliers).
 * Uses historical average or rough branch estimates if early game.
 */
function estimateBaseRevenuePerSeason(state) {
  const season = Math.max(1, state.season);

  // Use total revenue per season if we have meaningful history
  const totalRev = (state.mushrooms?.revenueEarned || 0)
    + (state.greenhouse?.revenueEarned || 0)
    + (state.fishpond?.revenueEarned || 0);

  if (totalRev > 500) {
    // Divide by effective mult to get base, then per-season
    const em = getEffectiveMult(state);
    return (totalRev / season) / Math.max(1, em);
  }

  // Early game: rough estimate from branch states
  const mushroomEst = (state.mushrooms?.blocks?.length || 1) * 800; // ~800 din/season per block
  const ghEst = state.greenhouse?.unlocked ? (state.greenhouse.areaM2 || 20) * 4 : 0; // ~4 din/m2/season
  const fpEst = state.fishpond?.unlocked ? (state.fishpond.areaM2 || 200) * 2 : 0;

  return mushroomEst + ghEst + fpEst;
}

/** Compute current effective revenue multiplier given channel mix */
function getEffectiveMult(state) {
  const chMulti = GAME_CONFIG.CHANNEL_MULTIPLIERS;
  const ch = state.channels || {};
  let mult = 0;
  mult += (ch.direktna || 0) / 100 * chMulti.direktna;
  mult += (ch.pijaca || 0) / 100 * (chMulti.pijaca || 1.2);
  mult += (ch.restoran || 0) / 100 * (chMulti.restoran || 1.55);
  mult += (ch.online || 0) / 100 * (chMulti.online || 1.9);
  mult += (ch.masterclass || 0) / 100 * (chMulti.masterclass || 2.5);
  return mult > 0 ? mult : 1.0;
}

/** Max possible mult given unlocked channels (all % in best channel) */
function getMaxPossibleMult(state) {
  const chMulti = GAME_CONFIG.CHANNEL_MULTIPLIERS;
  const unl = state.unlockedChannels || [];
  const available = [
    { id: 'direktna', mult: chMulti.direktna, available: true },
    { id: 'pijaca', mult: chMulti.pijaca || 1.2, available: unl.includes('pijaca') },
    { id: 'restoran', mult: chMulti.restoran || 1.55, available: unl.includes('restoran') },
    { id: 'online', mult: chMulti.online || 1.9, available: unl.includes('online') },
    { id: 'masterclass', mult: chMulti.masterclass || 2.5, available: (state.masterclassCount || 0) > 0 },
  ].filter(c => c.available);
  return available.length > 0 ? Math.max(...available.map(c => c.mult)) : 1.0;
}

/** Helper to get channel display label */
function channelLabel(id) {
  const labels = { direktna: 'Direktna', pijaca: 'Pijaca', restoran: 'Restoran', online: 'Online', masterclass: 'Masterclass' };
  return labels[id] || id;
}

/** Contextual tip based on current channel state */
function getChannelTip(state) {
  const unl = state.unlockedChannels || [];
  const ch = state.channels || {};
  const chMulti = GAME_CONFIG.CHANNEL_MULTIPLIERS;

  if (!unl.includes('pijaca')) {
    return `<div class="ch-tip">💡 Otključaj Pijaca (${formatDin(GAME_CONFIG.CHANNEL_COSTS.pijaca)}) za +${((chMulti.pijaca - 1) * 100).toFixed(0)}% cenu</div>`;
  }
  if (!unl.includes('restoran')) {
    return `<div class="ch-tip">💡 Restoran kanal (${formatDin(GAME_CONFIG.CHANNEL_COSTS.restoran)}) donosi ${chMulti.restoran}× — isplati se na Fazi A</div>`;
  }
  if (!unl.includes('online')) {
    return `<div class="ch-tip">💡 Online kanal (${formatDin(GAME_CONFIG.CHANNEL_COSTS.online)}) daje ${chMulti.online}× — największy multiplikator za neperishable</div>`;
  }
  if ((ch.direktna || 0) > 40 && unl.includes('restoran')) {
    return `<div class="ch-tip">💡 Imaš ${ch.direktna}% na Direktnoj — prebaci više na Restoran (${chMulti.restoran}×) za veći prihod</div>`;
  }
  if ((ch.online || 0) + (ch.restoran || 0) >= 60) {
    return `<div class="ch-tip">✅ Dobar miks premium kanala!</div>`;
  }
  return '';
}

// ─── Event binding ────────────────────────────────────────────────────────────

function bindChannelEvents(container, state, gameRef) {
  // Sliders: adjust channel %
  container.addEventListener('input', (e) => {
    const slider = e.target.closest('.ch-slider');
    if (!slider) return;
    const ch = slider.getAttribute('data-channel');
    if (!ch || ch === 'direktna') return;

    const newVal = parseInt(slider.value, 10);
    const oldVal = state.channels[ch] || 0;
    const diff = newVal - oldVal;

    // Absorb diff from direktna
    const direktnaNew = (state.channels.direktna || 0) - diff;
    if (direktnaNew < 0) {
      slider.value = oldVal; // revert
      import('./modals.js').then(({ showToast }) => {
        showToast('⚠️ Direktna ne može ići ispod 0%');
      });
      return;
    }

    state.channels[ch] = newVal;
    state.channels.direktna = direktnaNew;

    // Update val displays
    const valEl = container.querySelector(`[data-ch-val="${ch}"]`);
    if (valEl) valEl.textContent = `${newVal}%`;
    const dirVal = container.querySelector('[data-ch-val="direktna"]');
    if (dirVal) dirVal.textContent = `${direktnaNew}%`;
    const dirSlider = container.querySelector('[data-channel="direktna"]');
    if (dirSlider) dirSlider.value = direktnaNew;

    // Live update analytics
    updateChannelAnalytics(container, state);
    updateChannelEfficiency(container, state);

    // Check total
    const total = Object.values(state.channels).reduce((s, v) => s + (v || 0), 0);
    const warningEl = container.querySelector('#channel-total');
    if (warningEl) {
      if (Math.abs(total - 100) > 1) {
        warningEl.textContent = `⚠️ Ukupno: ${total}% (mora biti 100%)`;
        warningEl.className = 'channel-total-warning warn-active';
      } else {
        warningEl.textContent = '';
        warningEl.className = 'channel-total-warning';
      }
    }
  });

  // Unlock buttons
  container.addEventListener('click', (e) => {
    const unlockBtn = e.target.closest('.ch-unlock-btn');
    if (!unlockBtn || unlockBtn.disabled) return;

    const ch = unlockBtn.getAttribute('data-unlock');
    if (!ch) return;

    const result = unlockChannel(state, ch);
    if (result) {
      initialized = false;
      updateChannelPanel(container, state, gameRef);
      import('./modals.js').then(({ showToast }) => {
        showToast(`✅ Kanal "${channelLabel(ch)}" otključan! (${GAME_CONFIG.CHANNEL_MULTIPLIERS[ch]}× multiplikator)`);
      });
      if (gameRef?.audio) gameRef.audio.playSfx('purchase');
    } else {
      import('./modals.js').then(({ showToast }) => {
        showToast(`⚠️ Ne može se otključati "${channelLabel(ch)}" — proveri kapital.`);
      });
    }
  });
}
