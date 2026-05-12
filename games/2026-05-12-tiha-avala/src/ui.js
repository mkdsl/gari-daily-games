// ui.js — HUD, meraci, sliders DOM, level select

import { LEVELS } from './levels/level_data.js';
import { state } from './state.js';
import { getLevelBest } from './systems/score.js';
import { isLevelUnlocked } from './systems/progression.js';
import { BRAND } from './content/brand.js';
import { HINTS } from './content/hints.js';
import { WIN_DURATION_MS, SPL_WARN_THRESHOLD, SPL_FAIL_THRESHOLD } from './config.js';

let hud_el = null;
let on_slider_change = null;
let on_test_click = null;
let on_stop_click = null;
let on_retry_click = null;
let on_next_click = null;
let on_menu_click = null;
let on_level_select_click = null;

export function initUI(handlers) {
  hud_el = document.getElementById('hud');
  on_slider_change = handlers.on_slider_change || (() => {});
  on_test_click = handlers.on_test_click || (() => {});
  on_stop_click = handlers.on_stop_click || (() => {});
  on_retry_click = handlers.on_retry_click || (() => {});
  on_next_click = handlers.on_next_click || (() => {});
  on_menu_click = handlers.on_menu_click || (() => {});
  on_level_select_click = handlers.on_level_select_click || (() => {});
}

// ---- MENU ----

export function renderMenu(root_el) {
  root_el.innerHTML = `
    <div class="menu-content">
      <div class="menu-top">
        <h1 class="menu-title">${BRAND.title}</h1>
        <p class="menu-tagline">${BRAND.tagline}</p>
        <p class="menu-countdown">${BRAND.countdown()}</p>
      </div>
      <div class="menu-center">
        <button class="btn btn-play" id="btn-play">IGRAJ</button>
      </div>
      <div class="menu-footer">
        <a href="${BRAND.footer_url}" target="_blank" rel="noopener" class="brand-link">${BRAND.footer}</a>
      </div>
    </div>
  `;
}

// ---- LEVEL SELECT ----

export function renderLevelSelect(root_el) {
  const cards = LEVELS.map((lv, idx) => {
    const unlocked = isLevelUnlocked(idx);
    const best = getLevelBest(idx);
    const cls = [
      'level-card',
      !unlocked ? 'locked' : '',
      best !== null ? 'completed' : ''
    ].filter(Boolean).join(' ');
    const best_str = best !== null ? `Best: ${best.score}` : '?';
    const lock_icon = !unlocked ? '<span class="lock-icon">🔒</span>' : '';
    return `
      <div class="${cls}" data-level="${idx}">
        ${lock_icon}
        <div class="level-num">${idx + 1}</div>
        <div class="level-name">${lv.name}</div>
        <div class="level-sub">${lv.subtitle}</div>
        <div class="level-best">${best_str}</div>
      </div>
    `;
  }).join('');

  root_el.innerHTML = `
    <div class="level-select-content">
      <div class="level-select-header">
        <h2>ODABERI NIVO</h2>
        <button class="btn btn-secondary" id="btn-back-menu">← MENI</button>
      </div>
      <div class="level-grid">${cards}</div>
    </div>
  `;
}

// ---- GAME HUD ----

export function renderGameHUD(level) {
  if (!hud_el) return;

  if (level.dual_speakers) {
    renderDualHUD(level);
  } else {
    renderStandardHUD(level);
  }
}

function renderStandardHUD(level) {
  const hint = HINTS[level.hint_key] || {};
  hud_el.innerHTML = `
    <div class="hud-inner">
      <div class="hud-level-info">
        <span class="hud-level-num">NV ${level.id + 1}</span>
        <span class="hud-level-name">${level.name}</span>
        <span class="hud-level-sub">${level.subtitle}</span>
      </div>
      ${hint.intro ? `<div class="hud-hint">${hint.intro}</div>` : ''}
      <div class="meter-container">
        <div class="meter">
          <div class="meter-label happiness">PUBLIKA</div>
          <div class="meter-bar-bg" id="m-happiness-bg">
            <div class="meter-bar happiness-bar" id="m-happiness" style="width:0%"></div>
            <div class="meter-threshold-green" style="left: 70%"></div>
          </div>
          <div class="meter-value" id="m-happiness-val">0%</div>
        </div>
        <div class="meter">
          <div class="meter-label neighbour">KOMŠIJA dB</div>
          <div class="meter-bar-bg" id="m-kdb-bg">
            <div class="meter-bar neighbour-bar" id="m-kdb" style="width:0%"></div>
            <div class="meter-threshold"></div>
          </div>
          <div class="meter-value" id="m-kdb-val">--</div>
        </div>
      </div>
      <div class="slider-container">
        ${makeSlider('spl', 'Master SPL', state.spl, 80, 120, 1, 'dB')}
        ${makeSlider('bass', 'Bass Ratio', Math.round(state.bass_ratio * 100), 0, 100, 1, '%')}
        ${makeSlider('angle', 'Ugao zvučnika', state.angle, -60, 60, 1, '°')}
      </div>
      <div class="timer-bar-container" id="timer-bar-container" style="display:none">
        <div class="timer-bar" id="timer-bar" style="width:100%"></div>
      </div>
      <div class="hud-buttons">
        <button class="btn" id="btn-test">TESTIRAJ</button>
        <button class="btn btn-secondary hidden" id="btn-stop">ZAUSTAVI</button>
        <button class="btn btn-secondary" id="btn-level-select">NIVOI</button>
      </div>
    </div>
  `;
}

function renderDualHUD(level) {
  hud_el.innerHTML = `
    <div class="hud-inner">
      <div class="hud-level-info">
        <span class="hud-level-num">NV 6</span>
        <span class="hud-level-name">${level.name}</span>
        <span class="hud-level-sub">${level.subtitle}</span>
      </div>
      <div class="hud-hint">Dva zvučnika — tri komšije. Balansuj levi i desni.</div>
      <div class="meter-container">
        <div class="meter">
          <div class="meter-label happiness">PUBLIKA</div>
          <div class="meter-bar-bg">
            <div class="meter-bar happiness-bar" id="m-happiness" style="width:0%"></div>
          </div>
          <div class="meter-value" id="m-happiness-val">0%</div>
        </div>
      </div>
      <div class="meter-container" id="dual-kdb-meters">
        ${level.neighbours.map((n, i) => `
          <div class="meter meter-small">
            <div class="meter-label neighbour">${n.label}</div>
            <div class="meter-bar-bg">
              <div class="meter-bar neighbour-bar" id="m-kdb-${i}" style="width:0%"></div>
              <div class="meter-threshold"></div>
            </div>
            <div class="meter-value" id="m-kdb-val-${i}">--</div>
          </div>
        `).join('')}
      </div>
      <div class="slider-container dual-sliders">
        <div class="dual-col">
          <div class="dual-label">LEVI ZVUČNIK</div>
          ${makeSlider('spl_l', 'L-SPL', state.spl_l, 80, 120, 1, 'dB')}
          ${makeSlider('angle_l', 'L-Ugao', state.angle_l, -60, 0, 1, '°')}
        </div>
        <div class="dual-col">
          <div class="dual-label">DESNI ZVUČNIK</div>
          ${makeSlider('spl_r', 'R-SPL', state.spl_r, 80, 120, 1, 'dB')}
          ${makeSlider('angle_r', 'R-Ugao', state.angle_r, 0, 60, 1, '°')}
        </div>
      </div>
      <div class="timer-bar-container" id="timer-bar-container" style="display:none">
        <div class="timer-bar" id="timer-bar" style="width:100%"></div>
      </div>
      <div class="hud-buttons">
        <button class="btn" id="btn-test">TESTIRAJ</button>
        <button class="btn btn-secondary hidden" id="btn-stop">ZAUSTAVI</button>
        <button class="btn btn-secondary" id="btn-level-select">NIVOI</button>
      </div>
    </div>
  `;
}

function makeSlider(id, label, val, min, max, step, unit) {
  return `
    <div class="slider-row">
      <span class="slider-label">${label}</span>
      <input type="range" id="sl-${id}" min="${min}" max="${max}" step="${step}" value="${val}">
      <span class="slider-value" id="slv-${id}">${val}${unit}</span>
    </div>
  `;
}

// ---- HUD BIND EVENTS ----

export function bindHUDEvents(level) {
  // Sliders
  if (level.dual_speakers) {
    bindSlider('spl_l', (v) => { state.spl_l = v; on_slider_change(); });
    bindSlider('angle_l', (v) => { state.angle_l = v; on_slider_change(); });
    bindSlider('spl_r', (v) => { state.spl_r = v; on_slider_change(); });
    bindSlider('angle_r', (v) => { state.angle_r = v; on_slider_change(); });
  } else {
    bindSlider('spl', (v) => { state.spl = v; on_slider_change(); });
    bindSlider('bass', (v) => { state.bass_ratio = v / 100; on_slider_change(); });
    bindSlider('angle', (v) => { state.angle = v; on_slider_change(); });
  }

  const btn_test = document.getElementById('btn-test');
  const btn_stop = document.getElementById('btn-stop');
  const btn_ls = document.getElementById('btn-level-select');

  if (btn_test) btn_test.addEventListener('click', on_test_click);
  if (btn_stop) btn_stop.addEventListener('click', on_stop_click);
  if (btn_ls) btn_ls.addEventListener('click', on_level_select_click);
}

function bindSlider(id, cb) {
  const el = document.getElementById(`sl-${id}`);
  if (!el) return;
  el.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    const val_el = document.getElementById(`slv-${id}`);
    if (val_el) {
      const unit = el.dataset.unit || '';
      // reconstruct unit from label
      const label_map = { spl: 'dB', bass: '%', angle: '°', spl_l: 'dB', spl_r: 'dB', angle_l: '°', angle_r: '°' };
      val_el.textContent = v + (label_map[id] || '');
    }
    cb(v);
  });
}

export function setSliderDisabled(disabled, level) {
  const ids = level && level.dual_speakers
    ? ['spl_l', 'spl_r', 'angle_l', 'angle_r']
    : ['spl', 'bass', 'angle'];
  ids.forEach(id => {
    const el = document.getElementById(`sl-${id}`);
    if (el) el.disabled = disabled;
  });
}

// ---- METERS UPDATE ----

export function updateMeters(happiness, kdbs, level) {
  const hm = document.getElementById('m-happiness');
  const hv = document.getElementById('m-happiness-val');
  if (hm) hm.style.width = Math.round(happiness * 100) + '%';
  if (hv) hv.textContent = Math.round(happiness * 100) + '%';

  // Happiness bar color
  if (hm) {
    hm.style.background = happiness >= 0.7 ? 'var(--accent-green)' : happiness >= 0.5 ? '#c0a020' : '#e03030';
  }

  if (level && level.dual_speakers) {
    kdbs.forEach((kdb, i) => {
      const bar = document.getElementById(`m-kdb-${i}`);
      const val = document.getElementById(`m-kdb-val-${i}`);
      if (bar) {
        const pct = Math.min(100, Math.max(0, ((kdb + 20) / 130) * 100));
        bar.style.width = pct + '%';
        bar.style.background = kdb >= SPL_FAIL_THRESHOLD ? 'var(--accent-red)' : kdb >= SPL_WARN_THRESHOLD ? '#c0a020' : 'var(--accent-red)';
      }
      if (val) val.textContent = isFinite(kdb) ? kdb.toFixed(1) + ' dB' : '--';
    });
  } else {
    const kdb = kdbs.length > 0 ? Math.max(...kdbs) : -Infinity;
    const km = document.getElementById('m-kdb');
    const kv = document.getElementById('m-kdb-val');
    if (km) {
      const pct = Math.min(100, Math.max(0, ((kdb + 20) / 130) * 100));
      km.style.width = pct + '%';
      km.style.background = kdb >= SPL_FAIL_THRESHOLD ? '#ff3030' : kdb >= SPL_WARN_THRESHOLD ? '#c0a020' : 'var(--accent-red)';
    }
    if (kv) kv.textContent = isFinite(kdb) ? kdb.toFixed(1) + ' dB' : '--';
  }
}

// ---- TIMER BAR ----

export function updateTimerBar(win_start_time, now) {
  const container = document.getElementById('timer-bar-container');
  const bar = document.getElementById('timer-bar');
  if (!container || !bar) return;

  if (win_start_time) {
    container.style.display = 'block';
    const elapsed = now - win_start_time;
    const pct = Math.max(0, Math.min(100, 100 - (elapsed / WIN_DURATION_MS) * 100));
    bar.style.width = pct + '%';
    bar.style.background = pct > 50 ? 'var(--accent-green)' : pct > 20 ? '#c0a020' : 'var(--accent-red)';
  } else {
    container.style.display = 'none';
  }
}

export function showSimButtons(sim_running) {
  const btn_test = document.getElementById('btn-test');
  const btn_stop = document.getElementById('btn-stop');
  if (sim_running) {
    if (btn_test) btn_test.classList.add('hidden');
    if (btn_stop) btn_stop.classList.remove('hidden');
  } else {
    if (btn_test) btn_test.classList.remove('hidden');
    if (btn_stop) btn_stop.classList.add('hidden');
  }
}

// ---- WIN SCREEN ----

export function renderWinScreen(root_el, level, score, time_s, max_kdb, has_next) {
  const margin = (70 - max_kdb).toFixed(1);
  root_el.innerHTML = `
    <div class="result-overlay">
      <div class="result-title win">BRAVO!</div>
      <div class="result-level">${level.name}</div>
      <div class="result-score">${score}</div>
      <div class="result-details">
        <span>Vreme: ${time_s.toFixed(1)}s</span>
        <span>Margina: ${margin} dB</span>
      </div>
      <div class="result-buttons">
        <button class="btn" id="btn-retry">PONOVO</button>
        ${has_next ? `<button class="btn" id="btn-next">SLEDEĆI →</button>` : ''}
        <button class="btn btn-secondary" id="btn-to-levels">NIVOI</button>
      </div>
    </div>
  `;
}

export function bindWinButtons(has_next) {
  const btn_retry = document.getElementById('btn-retry');
  const btn_next = document.getElementById('btn-next');
  const btn_levels = document.getElementById('btn-to-levels');
  if (btn_retry) btn_retry.addEventListener('click', on_retry_click);
  if (btn_next && has_next) btn_next.addEventListener('click', on_next_click);
  if (btn_levels) btn_levels.addEventListener('click', on_level_select_click);
}

// ---- FAIL SCREEN ----

export function renderFailScreen(root_el, type) {
  const is_inspection = type === 'fail_inspection';
  const title = is_inspection ? 'INSPEKCIJA!' : 'PUBLIKA OTIŠLA';
  const quote = is_inspection
    ? 'Komšija je pozvao inspekciju. Smanji jačinu ili promeni ugao.'
    : 'Publika je razočarana i napušta festival. Pojačaj zvuk!';
  root_el.innerHTML = `
    <div class="result-overlay">
      <div class="result-title fail">${title}</div>
      <div class="result-fail-quote">${quote}</div>
      <div class="result-buttons">
        <button class="btn" id="btn-retry">POKUŠAJ PONOVO</button>
        <button class="btn btn-secondary" id="btn-to-levels">NIVOI</button>
      </div>
    </div>
  `;
}

export function bindFailButtons() {
  const btn_retry = document.getElementById('btn-retry');
  const btn_levels = document.getElementById('btn-to-levels');
  if (btn_retry) btn_retry.addEventListener('click', on_retry_click);
  if (btn_levels) btn_levels.addEventListener('click', on_level_select_click);
}
