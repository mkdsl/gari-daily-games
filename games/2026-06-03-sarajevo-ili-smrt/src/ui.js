// ============================================================
//  ui.js — Sarajevo ili Smrt
//  DOM UI manager: all non-canvas screens.
//  Manages screen switching, macro map, upgrade modal,
//  prestige screen, win screen.
// ============================================================

import { COLORS, KVART_NAMES, KVART_ORDER, DK_SHOP_ITEMS } from './config.js';
import { pushAction } from './input.js';
import { getUpgradeShopData } from './systems/upgrades.js';
import { getPrestigePreview, calcDKEarned } from './systems/prestige.js';
import { getRepLabel, getRepColor } from './systems/reputation.js';
import { getSeasonPlannerData, getNightsRemaining } from './systems/season.js';
import { generateDailyChallenge, isDailyCompleted } from './systems/daily_challenge.js';
import { getDJStatus } from './entities/dj.js';
import { getAllKlubData } from './entities/klub.js';
import { AVALA_CTA, WIN_SCREEN, PRESTIGE_AD } from './content/brand_hooks.js';
import { UNLOCK_TEXTS, ACHIEVEMENT_TEXTS, PRESTIGE_FLAVORS, SESSION_INTROS } from './content/aforizmi.js';
import { shareResult } from './share.js';
import { canPrestige1, canPrestige2, idleLPPerHour } from './state.js';

// ----------------------------------------------------------------
//  State reference (set by initUI)
// ----------------------------------------------------------------
let _state = null;

// ----------------------------------------------------------------
//  Init — build DOM structure, attach event delegations
// ----------------------------------------------------------------
export function initUI(state) {
  _state = state;
  _buildDOM();
  _attachGlobalDelegation();
  showScreen(state.current_screen);
}

function _buildDOM() {
  document.body.innerHTML = `
    <div id="game-root">
      <!-- Session canvas -->
      <canvas id="session-canvas" style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;touch-action:none;"></canvas>

      <!-- Start Screen -->
      <div id="screen-start" class="screen" style="display:none;">
        <div class="screen-content">
          <h1 class="game-title">SARAJEVO ILI SMRT</h1>
          <p class="game-subtitle">Idle/Incremental DJ Sim</p>
          <p class="game-tagline">Tri mahale. Dva prestige-a. Jedan cilj — Avala.</p>
          <div id="offline-popup" class="offline-popup" style="display:none;"></div>
          <input type="text" id="dj-name-input" class="dj-name-input" placeholder="Upiši DJ ime..." maxlength="24" />
          <button class="btn-primary" id="btn-start-game">Počni igru</button>
          <button class="btn-secondary" id="btn-daily-challenge" style="margin-top:8px;">Daily Challenge</button>
          <div class="tutorial-box">
            <p><strong>Kako igrati:</strong> Vuci slider da uskladiš sa vibe talasom. Drži crowd iznad 20 tokom 120 sekundi. Osvoji LP, kupi upgrades, osvoji 3 mahale.</p>
          </div>
        </div>
      </div>

      <!-- Macro Screen -->
      <div id="screen-macro" class="screen" style="display:none;">
        <div class="macro-top-bar">
          <div class="lp-display" id="lp-display">0 LP</div>
          <div class="idle-display" id="idle-display">0 LP/h</div>
          <div class="dk-display" id="dk-display">0 DK</div>
          <button class="btn-icon" id="btn-open-upgrade" title="Upgrades">⬆</button>
          <button class="btn-icon" id="btn-open-prestige" title="Prestige" style="display:none;">★</button>
        </div>

        <div class="sarajevo-map" id="sarajevo-map">
          <div class="kvart-zone kvart-bascarsija" id="zone-bascarsija" data-kvart="bascarsija">
            <div class="kvart-label">Baščaršija</div>
            <div class="kvart-rep-bar"><div class="kvart-rep-fill" id="rep-bascarsija"></div></div>
            <div class="kvart-info" id="info-bascarsija"></div>
          </div>
          <div class="kvart-zone kvart-marijin-dvor" id="zone-marijin_dvor" data-kvart="marijin_dvor">
            <div class="kvart-label">Marijin Dvor</div>
            <div class="kvart-rep-bar"><div class="kvart-rep-fill" id="rep-marijin_dvor"></div></div>
            <div class="kvart-info" id="info-marijin_dvor"></div>
          </div>
          <div class="kvart-zone kvart-grbavica kvart-locked" id="zone-grbavica" data-kvart="grbavica">
            <div class="kvart-label">Grbavica</div>
            <div class="kvart-rep-bar"><div class="kvart-rep-fill" id="rep-grbavica"></div></div>
            <div class="kvart-info" id="info-grbavica"></div>
            <div class="kvart-locked-overlay" id="lock-overlay-grbavica">🔒 Baščaršija + MD rep 50+</div>
          </div>
        </div>

        <div class="macro-bottom-bar">
          <div class="season-info" id="season-info"></div>
          <button class="btn-primary" id="btn-play-night" disabled>Odaberi kvart</button>
          <button class="btn-secondary" id="btn-view-leaderboard">Daily LB</button>
        </div>

        <!-- Notification strip -->
        <div id="notification-strip" class="notification-strip" style="display:none;"></div>
      </div>

      <!-- Prestige Screen -->
      <div id="screen-prestige" class="screen" style="display:none;">
        <div class="screen-content">
          <h2 class="prestige-title">PRESTIGE</h2>
          <div id="prestige-preview"></div>
          <div id="dk-shop"></div>
          <button class="btn-primary btn-danger" id="btn-confirm-prestige" style="display:none;">RESET + Uzmi DK</button>
          <button class="btn-secondary" id="btn-back-macro">← Nazad</button>
        </div>
      </div>

      <!-- Win Screen -->
      <div id="screen-win" class="screen" style="display:none;">
        <div class="screen-content win-content">
          <h1 class="win-title">${WIN_SCREEN.title}</h1>
          <h2 class="win-subtitle">${WIN_SCREEN.subtitle}</h2>
          <p class="win-body">${WIN_SCREEN.body}</p>
          <a href="${WIN_SCREEN.cta_url}" target="_blank" class="btn-primary btn-avala">
            ${WIN_SCREEN.cta_text}
          </a>
          <button class="btn-secondary" id="btn-share-win">Podjeli rezultat</button>
          <button class="btn-secondary" id="btn-new-run">Nova igra (New Game+)</button>
        </div>
      </div>

      <!-- Upgrade Modal -->
      <div id="modal-upgrade" class="modal-backdrop" style="display:none;">
        <div class="modal-box upgrade-modal">
          <div class="modal-header">
            <h3>UPGRADES</h3>
            <button class="btn-close" id="btn-close-upgrade">✕</button>
          </div>
          <div id="upgrade-grid" class="upgrade-grid"></div>
        </div>
      </div>

      <!-- Prestige Confirm Modal -->
      <div id="modal-prestige-confirm" class="modal-backdrop" style="display:none;">
        <div class="modal-box">
          <h3>Potvrdi Prestige Reset</h3>
          <div id="prestige-confirm-content"></div>
          <div class="modal-actions">
            <button class="btn-primary btn-danger" id="btn-do-prestige">Prestige!</button>
            <button class="btn-secondary" id="btn-cancel-prestige">Odustani</button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div id="toast" class="toast" style="display:none;"></div>
    </div>
  `;
}

// ----------------------------------------------------------------
//  Event delegation
// ----------------------------------------------------------------
function _attachGlobalDelegation() {
  document.body.addEventListener('click', e => {
    const id = e.target.id || e.target.closest('[id]')?.id;
    const data = e.target.dataset || {};

    switch (id) {
      case 'btn-start-game':        pushAction('start_game');       break;
      case 'btn-daily-challenge':   pushAction('start_daily');      break;
      case 'btn-play-night':        pushAction('play_night');       break;
      case 'btn-open-upgrade':      pushAction('open_upgrade');     break;
      case 'btn-close-upgrade':     pushAction('close_upgrade');    break;
      case 'btn-open-prestige':     pushAction('open_prestige');    break;
      case 'btn-back-macro':        pushAction('back_macro');       break;
      case 'btn-confirm-prestige':  pushAction('prestige_confirm'); break;
      case 'btn-do-prestige':       pushAction('prestige_do');      break;
      case 'btn-cancel-prestige':   pushAction('prestige_cancel');  break;
      case 'btn-share-win':         pushAction('share_result');     break;
      case 'btn-new-run':           pushAction('new_run');          break;
      case 'btn-view-leaderboard':  pushAction('view_leaderboard'); break;
    }

    // Kvart zone clicks
    const zone = e.target.closest('.kvart-zone');
    if (zone?.dataset.kvart) {
      pushAction('select_kvart', zone.dataset.kvart);
    }

    // Upgrade buy button
    const upg_btn = e.target.closest('[data-upgrade-branch]');
    if (upg_btn?.dataset.upgradeBranch) {
      pushAction('buy_upgrade', upg_btn.dataset.upgradeBranch);
    }

    // DK shop buy button
    const dk_btn = e.target.closest('[data-dk-item]');
    if (dk_btn?.dataset.dkItem) {
      pushAction('buy_dk_item', dk_btn.dataset.dkItem);
    }
  });

  // DJ name input
  document.body.addEventListener('input', e => {
    if (e.target.id === 'dj-name-input') {
      pushAction('set_name', e.target.value.trim() || 'DJ Neznani');
    }
  });

  // Session canvas click/tap — dismiss result overlay
  document.body.addEventListener('click', e => {
    if (e.target.id === 'session-canvas' && _state?.active_session?.done) {
      pushAction('dismiss_session');
    }
  });
}

// ----------------------------------------------------------------
//  Screen switching
// ----------------------------------------------------------------
export function showScreen(screen_name) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => { s.style.display = 'none'; });
  const canvas = document.getElementById('session-canvas');
  if (canvas) canvas.style.display = 'none';

  if (screen_name === 'session') {
    if (canvas) canvas.style.display = 'block';
    // Show motivational intro text for current kvart
    const sess = _state?.active_session;
    if (sess?.kvart) {
      const intros = SESSION_INTROS[sess.kvart];
      if (intros?.length) {
        const txt = intros[Math.floor(Math.random() * intros.length)];
        showToast(txt, 3000);
      }
    }
    return;
  }

  const el = document.getElementById(`screen-${screen_name}`);
  if (el) el.style.display = 'flex';
}

// ----------------------------------------------------------------
//  Update HUD — called every frame
// ----------------------------------------------------------------
export function updateHUD(state) {
  if (state.current_screen !== state._last_screen) {
    state._last_screen = state.current_screen;
    showScreen(state.current_screen);
  }

  if (state.current_screen === 'macro') {
    _updateMacro(state);
  }
}

// ----------------------------------------------------------------
//  Macro screen update
// ----------------------------------------------------------------
function _updateMacro(state) {
  const dj = getDJStatus(state);
  const lp_el    = document.getElementById('lp-display');
  const idle_el  = document.getElementById('idle-display');
  const dk_el    = document.getElementById('dk-display');
  const btn_play = document.getElementById('btn-play-night');
  const btn_pres = document.getElementById('btn-open-prestige');
  const season_el = document.getElementById('season-info');

  if (lp_el)    lp_el.textContent    = `${_fmt(dj.lp)} LP`;
  if (idle_el)  idle_el.textContent  = `${_fmt(Math.round(idleLPPerHour(state)))}/h`;
  if (dk_el)    dk_el.textContent    = `${dj.dk} DK`;
  if (btn_pres) btn_pres.style.display = (canPrestige1(state) || canPrestige2(state) || state.prestige_level > 0) ? 'inline-flex' : 'none';

  if (btn_play) {
    const sel = state.selected_kvart;
    const can_play = sel && state.kvartovi[sel]?.active && !state.kvartovi[sel]?.locked;
    btn_play.disabled = !can_play;
    btn_play.textContent = can_play ? `Igraj noć — ${KVART_NAMES[sel]}` : 'Odaberi kvart';
  }

  // Season info
  if (season_el) {
    const planData = getSeasonPlannerData(state);
    season_el.innerHTML = `
      <span>Sezona ${planData.season_number}</span>
      <span class="sep">·</span>
      <span>Noć ${planData.nights_played}/${planData.total_nights}</span>
      <span class="sep">·</span>
      <span>P${state.prestige_level} ×${state.prestige_multiplier.toFixed(1)}</span>
    `;
  }

  // Kvart zones
  for (const kvart of KVART_ORDER) {
    _updateKvartZone(state, kvart);
  }
}

function _updateKvartZone(state, kvart) {
  const zone = document.getElementById(`zone-${kvart}`);
  const rep_fill = document.getElementById(`rep-${kvart}`);
  const info_el  = document.getElementById(`info-${kvart}`);
  const lock_el  = document.getElementById(`lock-overlay-${kvart}`);
  const ks = state.kvartovi[kvart];

  if (!zone || !ks) return;

  const selected = state.selected_kvart === kvart;
  zone.classList.toggle('kvart-selected', selected);
  zone.classList.toggle('kvart-locked', ks.locked);
  zone.classList.toggle('kvart-inactive', !ks.active && !ks.locked);

  if (rep_fill) {
    rep_fill.style.width = `${ks.mahala_reputacija}%`;
    rep_fill.style.background = getRepColor(ks.mahala_reputacija);
  }

  if (info_el) {
    const tier_name = `Tier ${ks.klub_tier}`;
    const rep_label = getRepLabel(ks.mahala_reputacija);
    info_el.innerHTML = `
      <span class="kvart-rep-text">${ks.mahala_reputacija} rep — ${rep_label}</span>
      <span class="kvart-tier">${tier_name}</span>
    `;
  }

  if (lock_el) lock_el.style.display = ks.locked ? 'flex' : 'none';
}

// ----------------------------------------------------------------
//  Show upgrade modal
// ----------------------------------------------------------------
export function showUpgradeModal(state) {
  const modal = document.getElementById('modal-upgrade');
  const grid  = document.getElementById('upgrade-grid');
  if (!modal || !grid) return;

  const upgrades = getUpgradeShopData(state);
  grid.innerHTML = upgrades.map(u => {
    const cls = [
      'upgrade-card',
      u.maxed ? 'upgrade-card-maxed' : '',
      u.can_afford && u.prereq_ok && !u.maxed ? 'upgrade-card-affordable' : '',
      !u.prereq_ok ? 'upgrade-card-locked' : ''
    ].filter(Boolean).join(' ');

    const cost_text = u.maxed ? 'MAX' : u.cost !== null ? `${_fmt(Math.ceil(u.cost))} LP` : '—';
    const disabled  = u.maxed || !u.can_afford || !u.prereq_ok;

    return `
      <div class="${cls}">
        <div class="upg-header">
          <span class="upg-icon">${u.icon}</span>
          <span class="upg-name">${u.name}</span>
          <span class="upg-level">${u.current_level}/${u.max_level}</span>
        </div>
        <div class="upg-desc">${u.next_level_desc || u.current_level_desc || ''}</div>
        <div class="upg-footer">
          <span class="upg-cost">${cost_text}</span>
          <button class="btn-buy ${disabled ? 'btn-disabled' : ''}"
            data-upgrade-branch="${u.branch}"
            ${disabled ? 'disabled' : ''}>
            ${u.maxed ? '✓' : u.prereq_ok ? 'Kupi' : u.prereq_reason ?? 'Locked'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  modal.style.display = 'flex';
}

export function hideUpgradeModal() {
  const modal = document.getElementById('modal-upgrade');
  if (modal) modal.style.display = 'none';
}

// ----------------------------------------------------------------
//  Show prestige screen
// ----------------------------------------------------------------
export function showPrestigeScreen(state) {
  const preview_el = document.getElementById('prestige-preview');
  const dk_shop_el = document.getElementById('dk-shop');
  const confirm_btn = document.getElementById('btn-confirm-prestige');

  if (preview_el) {
    const preview = getPrestigePreview(state);
    const p_level = state.prestige_level;

    if (canPrestige1(state) || canPrestige2(state)) {
      preview_el.innerHTML = `
        <div class="prestige-preview-box">
          <p class="prestige-flavor">${PRESTIGE_FLAVORS[Math.floor(Math.random() * PRESTIGE_FLAVORS.length)]}</p>
          <div class="prestige-columns">
            <div>
              <strong>Ostaje:</strong>
              <ul>${preview.keeps.map(k => `<li>${k}</li>`).join('')}</ul>
            </div>
            <div>
              <strong>Gubi se:</strong>
              <ul class="loses">${preview.loses.map(l => `<li>${l}</li>`).join('')}</ul>
            </div>
          </div>
          <p class="dk-earn">Zarađuješ: <strong>${preview.dk_preview} DK</strong></p>
        </div>
      `;
      if (confirm_btn) confirm_btn.style.display = 'block';
    } else {
      const lp_needed = p_level === 0 ? 500 : 2500;
      const missing   = !state.achievements.sarajevo_achievement && p_level === 0;
      preview_el.innerHTML = `
        <p>Prestige P${p_level + 1} nije dostupan.</p>
        <p>Trebaš: <strong>${_fmt(lp_needed)} LP total</strong>${missing ? ' + Sarajevo achievement (3 kvarta)' : ''}.</p>
        <p>Trenutno: ${_fmt(Math.floor(state.total_lp_earned_this_run))} LP zaraženo ovim runom.</p>
      `;
      if (confirm_btn) confirm_btn.style.display = 'none';
    }
  }

  // DK Shop
  if (dk_shop_el) {
    _renderDKShop(state, dk_shop_el);
  }
}

function _renderDKShop(state, container) {
  _renderDKShopSync(state, container);
}

function _renderDKShopSync(state, container) {
  const items = DK_SHOP_ITEMS;

  container.innerHTML = `
    <h4>DK Shop — ${state.dk} DK dostupno</h4>
    <div class="dk-shop-grid">
      ${items.map(item => {
        const bought    = state.dk_shop_purchases.includes(item.id);
        const can_buy   = !bought && state.dk >= item.cost;
        return `
          <div class="upgrade-card ${bought ? 'upgrade-card-maxed' : can_buy ? 'upgrade-card-affordable' : ''}">
            <div class="upg-name">${item.name}</div>
            <div class="upg-desc">${item.description}</div>
            <div class="upg-footer">
              <span class="upg-cost">${item.cost} DK</span>
              <button class="btn-buy ${bought || !can_buy ? 'btn-disabled' : ''}"
                data-dk-item="${item.id}"
                ${bought || !can_buy ? 'disabled' : ''}>
                ${bought ? '✓ Kupljeno' : 'Kupi'}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ----------------------------------------------------------------
//  Prestige confirm modal
// ----------------------------------------------------------------
export function showPrestigeConfirm(state) {
  const modal   = document.getElementById('modal-prestige-confirm');
  const content = document.getElementById('prestige-confirm-content');
  if (!modal || !content) return;

  const preview = getPrestigePreview(state);
  content.innerHTML = `
    <p>Zarađuješ <strong>${preview.dk_preview} DK</strong>.</p>
    <p>Gubiš ${Math.floor(state.lp)} LP i sve upgrade-e (osim A1).</p>
    <p>Sigurno?</p>
  `;
  modal.style.display = 'flex';
}

export function hidePrestigeConfirm() {
  const modal = document.getElementById('modal-prestige-confirm');
  if (modal) modal.style.display = 'none';
}

// ----------------------------------------------------------------
//  Toast notification
// ----------------------------------------------------------------
export function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, duration);
}

// ----------------------------------------------------------------
//  Offline popup
// ----------------------------------------------------------------
export function showOfflinePopup(state, gained_lp, hours_elapsed) {
  const el = document.getElementById('offline-popup');
  if (!el) return;
  if (gained_lp <= 0) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.innerHTML = `
    <strong>Offline dohodak:</strong><br>
    +${_fmt(gained_lp)} LP za ${hours_elapsed}h odsutnosti.
    <button id="btn-dismiss-offline">OK</button>
  `;
  document.getElementById('btn-dismiss-offline')?.addEventListener('click', () => {
    el.style.display = 'none';
  });
}

// ----------------------------------------------------------------
//  Unlock notification
// ----------------------------------------------------------------
export function showUnlockNotification(message) {
  const strip = document.getElementById('notification-strip');
  if (!strip) return;
  strip.textContent = message;
  strip.style.display = 'block';
  setTimeout(() => { strip.style.display = 'none'; }, 4000);
}

// ----------------------------------------------------------------
//  Win screen setup
// ----------------------------------------------------------------
export function setupWinScreen(state) {
  // Already rendered in _buildDOM, just update stats
  const share_btn = document.getElementById('btn-share-win');
  if (share_btn) {
    share_btn.onclick = () => shareResult(state, state.active_session);
  }
}

// ----------------------------------------------------------------
//  Format number helper
// ----------------------------------------------------------------
function _fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}
