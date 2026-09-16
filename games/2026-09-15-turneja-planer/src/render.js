/** @module render — DOM orchestrator, screen manager, phase rendering */

import { CITY_MAP, CITIES } from './entities/city.js';
import { ALL_CREW, CREW_MAP, hasDJing, totalDailyRate } from './entities/crew_member.js';
import { getTopRoutes, getAllRoutableCityIds } from './systems/routing.js';
import { splitTotal } from './systems/budget.js';
import { updateHUD, updateRouteDots, createCardEl, toast, deltaHTML, showModal, hideModal } from './ui.js';
import { CARD_MAP } from './content/cards.js';
import { CITY_FLAVOR, getCityTagline, getArrivalMsg } from './content/cities.js';
import { CREW_PROFILES, getCrewBio, getCrewDialog } from './content/crew_profiles.js';
import { getEnding, ENDINGS } from './content/endings.js';
import { getEndingBrandLines } from './content/brand_hooks.js';
import { sfxCardFlip, sfxClick, sfxCityTransition, sfxWin, sfxFail, sfxOptionSelect, sfxPrestige, sfxBassThump, sfxBorderCrossing, sfxCrowdCheer as _sfxCrowdCheer } from './audio.js';
import { emit } from './input.js';
import { prestigeLabel } from './systems/prestige.js';

/** @type {HTMLElement} */
let root;

export function initRoot() {
  root = document.getElementById('game-root');
}

/**
 * Main router — render correct screen
 * @param {import('./state.js').GameState} state
 */
export function renderScreen(state) {
  if (!root) return;
  updateHUD(state.resources);
  if (state.route.length > 0) {
    updateRouteDots(state.route, state.city_index);
  }

  switch (state.screen) {
    case 'menu':       return renderMenu(state);
    case 'routing':    return renderRouting(state);
    case 'crew_select': return renderCrewSelect(state);
    case 'city_budget': return renderCityBudget(state);
    case 'cards':      return renderCards(state);
    case 'results':    return renderResults(state);
    case 'transit':    return renderTransit(state);
    case 'ending':     return renderEnding(state);
    case 'prestige':   return renderPrestige(state);
    default:           root.innerHTML = '<p class="error">Screen nepoznat</p>';
  }
}

// ---- MENU ----
function renderMenu(state) {
  const hasSave = state._hasSave;
  const lvl = state.prestige.level;
  root.innerHTML = `
    <div class="screen screen-menu">
      <div class="menu-logo">
        <div class="logo-icon">🎧</div>
        <h1 class="logo-title">Turneja Planer</h1>
        <p class="logo-sub">Kluboslavija 2026 · 5 gradova · 1 DJ · beskonačno muzike</p>
      </div>
      <div class="menu-buttons">
        ${hasSave ? `<button class="btn btn-primary" id="btn-continue">▶ Nastavi turneju</button>` : ''}
        <button class="btn ${hasSave ? 'btn-secondary' : 'btn-primary'}" id="btn-new">🎵 Nova turneja</button>
        ${lvl > 0 ? `<div class="prestige-badge">${prestigeLabel(state.prestige)}</div>` : ''}
      </div>
      <div class="menu-brand">
        <p>🌿 Guncati · 🎵 Kluboslavija · 🏗️ MKDSLend</p>
        <p class="menu-hint">5 gradova · 40 kartica · 4 završetka</p>
      </div>
    </div>
  `;
  document.getElementById('btn-new')?.addEventListener('click', () => { sfxClick(); emit('new_game', null); });
  document.getElementById('btn-continue')?.addEventListener('click', () => { sfxClick(); emit('continue_game', null); });
}

// ---- ROUTING ----
function renderRouting(state) {
  const cityIds = getAllRoutableCityIds(); // novi_sad, nis, sarajevo
  const routes = getTopRoutes(cityIds);

  root.innerHTML = `
    <div class="screen screen-routing">
      <h2 class="screen-title">📍 Planiraj rutu</h2>
      <p class="screen-sub">Start: <strong>Beograd</strong> · Finale: <strong>Guncati</strong> (zahteva Rep ≥ 6.0)</p>
      <p class="screen-sub budget-note">Budžet za put: <strong>€ ${state.resources.budget.toLocaleString()}</strong></p>
      <div class="route-options">
        ${routes.map((r, i) => `
          <div class="route-card" data-route="${r.route.join(',')}">
            <div class="route-rank">${['🥇', '🥈', '🥉'][i]}</div>
            <div class="route-label">${r.label}</div>
            <div class="route-cost">Putni troškovi: <strong>€ ${r.cost.toLocaleString()}</strong></div>
            <button class="btn btn-route" data-route="${r.route.join(',')}">Odaberi ovu rutu</button>
          </div>
        `).join('')}
      </div>
      <div class="route-tip">
        💡 Sarajevo = granični prelaz (extra €80 + troškovi incidenta 25% šanse)<br>
        Guncati uvek poslednji — ulaz samo sa Rep ≥ 6.0
      </div>
    </div>
  `;

  document.querySelectorAll('.btn-route').forEach(btn => {
    btn.addEventListener('click', () => {
      sfxClick();
      const route = btn.dataset.route.split(',');
      emit('route_selected', route);
    });
  });
}

// ---- CREW SELECT ----
function renderCrewSelect(state) {
  const selected = new Set(state.selected_crew_ids);
  const dailyTotal = ALL_CREW
    .filter(m => selected.has(m.id))
    .reduce((s, m) => s + m.daily_rate, 0);
  const days = state.route.length;

  root.innerHTML = `
    <div class="screen screen-crew">
      <h2 class="screen-title">👥 Odaberi crew</h2>
      <p class="screen-sub">Min 2, max 5 članova. Obavezan: DJ skill.</p>
      <div class="crew-info">
        Izabrano: <strong id="crew-count">${selected.size}/5</strong> ·
        Dnevni trošak: <strong>€ ${dailyTotal}/dan</strong> ·
        Ukupno (${days} gradova): <strong>€ ${dailyTotal * days}</strong>
      </div>
      <div class="crew-grid">
        ${ALL_CREW.map(m => {
          const isSelected = selected.has(m.id);
          const profile = CREW_PROFILES[m.id];
          const skillStr = Object.entries(m.skills).map(([k, v]) => `${k}:${v}`).join(' · ');
          return `
            <div class="crew-card ${isSelected ? 'selected' : ''}" data-crew="${m.id}">
              <div class="crew-emoji">${m.emoji}</div>
              <div class="crew-name">${m.name}</div>
              <div class="crew-role">${m.role}</div>
              <div class="crew-skills">${skillStr}</div>
              <div class="crew-rate">€${m.daily_rate}/dan</div>
              <div class="crew-resilience res-${m.resilience}">${m.resilience === 'high' ? '💪 Izdržljiv' : m.resilience === 'med' ? '😐 Prosečan' : '😰 Klonući'}</div>
              <div class="crew-bio-short">${profile?.strength || ''}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="crew-actions">
        <button class="btn btn-primary" id="btn-crew-confirm">Potvrdi crew →</button>
      </div>
    </div>
  `;

  document.querySelectorAll('.crew-card').forEach(card => {
    card.addEventListener('click', () => {
      sfxClick();
      emit('toggle_crew', card.dataset.crew);
    });
  });

  document.getElementById('btn-crew-confirm')?.addEventListener('click', () => {
    sfxClick();
    emit('crew_confirmed', null);
  });
}

// ---- CITY BUDGET ----
function renderCityBudget(state) {
  const city_id = state.route[state.city_index];
  const city = CITY_MAP.get(city_id);
  const flavor = CITY_FLAVOR[city_id] || {};
  const available = state.resources.budget;
  const split = state.budget_split;
  const total_spent = splitTotal(split);
  const remaining = available - total_spent;

  root.innerHTML = `
    <div class="screen screen-budget" style="--city-color: ${city.color}">
      <div class="city-header">
        <div class="city-emoji">${city.emoji}</div>
        <div>
          <h2 class="city-name">${city.name}</h2>
          <p class="city-tagline">${flavor.tagline || ''}</p>
          <p class="city-arrival">${getArrivalMsg(city_id)}</p>
        </div>
      </div>
      <div class="city-meta">
        <span>Publika: ${city.crowd_min}–${city.crowd_max}</span>
        <span>Rizik: ${'⚡'.repeat(city.risk)}</span>
        <span>Rep mult: ×${city.rep_mult}</span>
        ${city.border ? '<span class="border-warning">⚠️ Granični prelaz</span>' : ''}
      </div>

      <div class="budget-section">
        <h3>Rasporedi budžet za ovaj grad</h3>
        <div class="budget-available">Dostupno: <strong id="budget-remaining">€ ${Math.round(remaining).toLocaleString()}</strong></div>

        <div class="budget-sliders">
          ${renderSlider('transport', '🚗 Transport', split.transport, 0, Math.min(500, available))}
          ${renderSlider('promo', '📢 Promo', split.promo, 0, Math.min(1000, available))}
          ${renderSlider('tech', '🔊 Tech', split.tech, 0, Math.min(1500, available))}
        </div>

        <div class="budget-preview">
          <div class="preview-item">Transport: <strong>€ <span id="val-transport">${split.transport}</span></strong></div>
          <div class="preview-item">Promo: <strong>€ <span id="val-promo">${split.promo}</span></strong></div>
          <div class="preview-item">Tech: <strong>€ <span id="val-tech">${split.tech}</span></strong></div>
          <div class="preview-total">Ukupno: <strong>€ <span id="val-total">${total_spent}</span></strong></div>
        </div>
      </div>

      <div class="crew-cost-note">
        Crew: €${state.selected_crew_ids.reduce((s, id) => s + (CREW_MAP.get(id)?.daily_rate || 0), 0)}/dan (automatski oduzeto)
      </div>

      <button class="btn btn-primary" id="btn-budget-confirm">Kreni na nastup →</button>
    </div>
  `;

  // Wire sliders
  ['transport', 'promo', 'tech'].forEach(key => {
    const slider = document.getElementById(`slider-${key}`);
    if (slider) {
      slider.addEventListener('input', () => {
        emit('budget_slider', { key, value: Number(slider.value) });
      });
    }
  });

  document.getElementById('btn-budget-confirm')?.addEventListener('click', () => {
    sfxClick();
    emit('budget_confirmed', null);
  });
}

function renderSlider(key, label, value, min, max) {
  return `
    <div class="slider-row">
      <label class="slider-label">${label}</label>
      <input type="range" id="slider-${key}" class="budget-slider" min="${min}" max="${max}" step="10" value="${value}">
    </div>
  `;
}

// ---- CARDS ----
function renderCards(state) {
  const city_id = state.route[state.city_index];
  const city = CITY_MAP.get(city_id);
  const drawn = state.drawn_card_ids;
  const resolved = state.card_outcomes.length;

  root.innerHTML = `
    <div class="screen screen-cards" style="--city-color: ${city.color}">
      <div class="cards-header">
        <h2>${city.emoji} ${city.name} — Nastup</h2>
        <p class="cards-progress">Kartica ${Math.min(resolved + 1, drawn.length)} od ${drawn.length}</p>
      </div>
      <div class="cards-grid" id="cards-grid">
        ${drawn.map((card_id, i) => {
          const card = CARD_MAP.get(card_id);
          const isResolved = i < resolved;
          const isCurrent = i === resolved;
          const el = createCardEl(card, i + 1, isResolved);
          if (isCurrent) el.classList.add('card-current');
          if (isResolved) el.classList.add('card-done');
          return el.outerHTML;
        }).join('')}
      </div>
      <div id="card-action-area"></div>
    </div>
  `;

  // Wire current card
  const current_idx = resolved;
  if (current_idx < drawn.length) {
    const current_card_id = drawn[current_idx];
    const current_card = CARD_MAP.get(current_card_id);
    const card_el = document.getElementById(`card-${current_card_id}`);

    // Click to flip
    card_el?.addEventListener('click', (e) => {
      if (card_el.classList.contains('card-flipped')) return;
      sfxCardFlip();
      card_el.classList.add('card-flipped');
    });

    // Wire option buttons after flip
    card_el?.querySelectorAll('.card-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sfxOptionSelect();
        emit('card_option_chosen', {
          card_id: current_card_id,
          option: btn.dataset.option,
        });
      });
    });
  }
}

// ---- RESULTS ----
function renderResults(state) {
  const city_id = state.route[state.city_index];
  const city = CITY_MAP.get(city_id);
  const result = state.city_results[state.city_results.length - 1];
  const isLast = state.city_index >= state.route.length - 1;

  const border_section = state.border_incident ? `
    <div class="incident-box">
      <strong>⚠️ Granični incident:</strong> ${state.border_incident.incident?.label || 'Standardna kontrola'}
      ${state.border_incident.incident ? `<br>Efekti: ${Object.entries(state.border_incident.incident.effects).map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`).join(', ')}` : ''}
    </div>
  ` : '';

  root.innerHTML = `
    <div class="screen screen-results" style="--city-color: ${city.color}">
      <div class="results-header">
        <div class="results-city">${city.emoji} ${city.name}</div>
        <h2 class="results-title">Nastup gotov!</h2>
      </div>

      ${border_section}

      <div class="results-stats">
        <div class="stat-row">
          <span class="stat-label">Publika</span>
          <span class="stat-val">${result?.attendance || 0} osoba</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Crowd Quality</span>
          <span class="stat-val">${result?.crowd_quality?.toFixed(1) || '—'}/10</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Reputacija +/-</span>
          <span class="stat-val ${result?.rep_gain >= 0 ? 'pos' : 'neg'}">${result?.rep_gain >= 0 ? '+' : ''}${result?.rep_gain?.toFixed(2) || 0}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Budžet promene</span>
          <span class="stat-val ${result?.budget_delta >= 0 ? 'pos' : 'neg'}">${result?.budget_delta >= 0 ? '+' : ''}€ ${Math.round(result?.budget_delta || 0)}</span>
        </div>
      </div>

      <div class="card-outcomes-summary">
        <h3>Tvoje odluke:</h3>
        ${(state.card_outcomes || []).map(o => `
          <div class="outcome-row">
            <span class="outcome-card">${CARD_MAP.get(o.card_id)?.title || o.card_id}</span>
            <span class="outcome-option">${o.chosen_option}</span>
            <span class="outcome-effects">${deltaHTML(o.resolved_effects)}</span>
          </div>
        `).join('')}
      </div>

      <div class="results-actions">
        ${isLast
          ? `<button class="btn btn-primary" id="btn-to-ending">Pogledaj završetak →</button>`
          : `<button class="btn btn-primary" id="btn-transit">Kreni u sledeći grad →</button>`
        }
      </div>
    </div>
  `;

  _sfxCrowdCheer?.();

  document.getElementById('btn-transit')?.addEventListener('click', () => {
    sfxClick();
    emit('go_transit', null);
  });

  document.getElementById('btn-to-ending')?.addEventListener('click', () => {
    sfxClick();
    emit('go_ending', null);
  });
}

// ---- TRANSIT ----
function renderTransit(state) {
  const next_city_id = state.route[state.city_index];
  const next_city = CITY_MAP.get(next_city_id);

  sfxCityTransition(state.city_index);

  root.innerHTML = `
    <div class="screen screen-transit" style="--city-color: ${next_city?.color || '#666'}">
      <div class="transit-anim">
        <div class="transit-icon">🚐</div>
        <div class="transit-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
      <h2>U prevozu prema <strong>${next_city?.name}</strong></h2>
      <p class="transit-sub">Crew odmaraju (ili se svađaju)...</p>
      <button class="btn btn-primary" id="btn-arrive">Stigli smo! →</button>
    </div>
  `;

  document.getElementById('btn-arrive')?.addEventListener('click', () => {
    sfxBassThump();
    emit('city_arrived', null);
  });
}

// ---- ENDING ----
function renderEnding(state) {
  const ending = getEnding(state.ending_id);
  const brandLines = getEndingBrandLines(state.ending_id);

  sfxWin?.();

  root.innerHTML = `
    <div class="screen screen-ending" style="--ending-color: ${ending.color}">
      <div class="ending-header">
        <div class="ending-emoji">${ending.emoji}</div>
        <h1 class="ending-title">${ending.title}</h1>
      </div>

      <div class="ending-stats">
        <div class="stat-chip">€ ${Math.round(state.resources.budget).toLocaleString()}</div>
        <div class="stat-chip">⭐ ${state.resources.reputation.toFixed(1)}/10</div>
        <div class="stat-chip">📡 ${state.resources.reach.toFixed(1)}k reach</div>
        <div class="stat-chip">😊 Mood ${state.resources.crew_mood.toFixed(1)}</div>
      </div>

      <div class="ending-narrative">${ending.narrative}</div>

      <div class="ending-brand">
        ${brandLines.map(l => `<p class="brand-line">${l}</p>`).join('')}
      </div>

      <div class="ending-actions">
        ${ending.can_prestige
          ? `<button class="btn btn-prestige" id="btn-prestige">🌟 Nova sezona (Prestige)</button>`
          : ''}
        <button class="btn btn-primary" id="btn-restart">🔄 Ponovo igraj</button>
        <button class="btn btn-secondary" id="btn-share">📤 Podeli rezultat</button>
      </div>

      <div class="city-history">
        <h3>Rezultati po gradovima:</h3>
        ${state.city_results.map(r => `
          <div class="city-result-row">
            <span>${CITY_MAP.get(r.city_id)?.emoji} ${CITY_MAP.get(r.city_id)?.name || r.city_id}</span>
            <span>${r.attendance} ljudi</span>
            <span>CQ: ${r.crowd_quality?.toFixed(1)}</span>
            <span class="${r.rep_gain >= 0 ? 'pos' : 'neg'}">${r.rep_gain >= 0 ? '+' : ''}${r.rep_gain?.toFixed(2)} rep</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('btn-prestige')?.addEventListener('click', () => {
    sfxPrestige();
    emit('prestige', null);
  });
  document.getElementById('btn-restart')?.addEventListener('click', () => {
    sfxClick();
    emit('restart', null);
  });
  document.getElementById('btn-share')?.addEventListener('click', () => {
    sfxClick();
    emit('share', null);
  });
}

// ---- PRESTIGE ----
function renderPrestige(state) {
  root.innerHTML = `
    <div class="screen screen-prestige">
      <div class="prestige-header">
        <div class="prestige-icon">🌟</div>
        <h1>Prestige!</h1>
        <p>Sezona ${state.prestige.level} završena</p>
      </div>
      <div class="prestige-stats">
        <div class="prestige-stat">
          <div class="prestige-val">${state.prestige.fan_db.total.toLocaleString()}</div>
          <div class="prestige-label">Fan baza</div>
        </div>
        <div class="prestige-stat">
          <div class="prestige-val">+${(state.prestige.fan_db.promo_eff_bonus * 100).toFixed(0)}%</div>
          <div class="prestige-label">Promo bonus</div>
        </div>
        <div class="prestige-stat">
          <div class="prestige-val">€2500</div>
          <div class="prestige-label">Početni budžet</div>
        </div>
      </div>
      <p class="prestige-msg">${state.prestige.past_endings.length > 0 ? getEnding(state.prestige.past_endings[state.prestige.past_endings.length - 1]).prestige_msg || '' : ''}</p>
      <button class="btn btn-primary" id="btn-prestige-start">Kreni u Sezonu ${state.prestige.level + 1} →</button>
    </div>
  `;

  document.getElementById('btn-prestige-start')?.addEventListener('click', () => {
    sfxClick();
    emit('prestige_start', null);
  });
}

/** Update budget preview sliders without full re-render */
export function updateBudgetPreview(split, available) {
  const total = splitTotal(split);
  const remaining = available - total;
  const elR = document.getElementById('budget-remaining');
  const elT = document.getElementById('val-total');
  const elTr = document.getElementById('val-transport');
  const elPr = document.getElementById('val-promo');
  const elTech = document.getElementById('val-tech');
  if (elR) elR.textContent = `€ ${Math.round(remaining).toLocaleString()}`;
  if (elT) elT.textContent = Math.round(total);
  if (elTr) elTr.textContent = Math.round(split.transport || 0);
  if (elPr) elPr.textContent = Math.round(split.promo || 0);
  if (elTech) elTech.textContent = Math.round(split.tech || 0);
}

