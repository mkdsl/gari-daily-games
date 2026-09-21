/**
 * render.js — DOM orchestrator za Zimovnicu.
 * Screen router: menu / game / event / ending / prestige.
 * Svaka funkcija briše #app i crta novi sadržaj od nule.
 */

import { renderHUD, renderBacvaWidget } from './render/hud.js';
import { renderShelf } from './render/shelf_renderer.js';
import { renderCalendar } from './render/calendar_renderer.js';
import { renderUI, renderLog } from './ui.js';
import { GAME_DAYS, JAR_ICONS, SHELF_UPGRADES } from './config.js';
import { getNextUpgrade } from './entities/shelf.js';

/** @type {HTMLElement|null} */
let root = null;

/**
 * Glavni render entry point. Poziva se iz main.js na svakoj promeni state-a.
 * @param {object|null} state
 * @param {object|null} persistent
 * @param {string} screen
 */
export function render(state, persistent, screen) {
  if (!root) {
    root = document.getElementById('app');
    if (!root) return;
  }

  // Ukloni loading screen ako još postoji
  const loading = document.getElementById('loading');
  if (loading) loading.remove();

  switch (screen) {
    case 'menu':     renderMenu(root, persistent); break;
    case 'game':     renderGame(root, state, persistent); break;
    case 'event':    renderEventScreen(root, state); break;
    case 'ending':   renderEnding(root, state, persistent); break;
    case 'prestige': renderPrestige(root, state, persistent); break;
    default:         renderMenu(root, persistent);
  }

  // Wire event listeners posle renderovanja
  renderUI(state, persistent);
}

/* ════════════════════════════════════════════════════════════
   MENU SCREEN
════════════════════════════════════════════════════════════ */

/**
 * Renderuje glavni meni.
 * @param {HTMLElement} root
 * @param {object|null} persistent
 */
function renderMenu(root, persistent) {
  root.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'menu-screen screen';

  // Dekorativna ikonica
  const deco = document.createElement('div');
  deco.style.cssText = 'font-size:3.5rem;';
  deco.textContent = '🫙';
  screen.appendChild(deco);

  // Naslov
  const title = document.createElement('h1');
  title.className = 'menu-title';
  title.textContent = 'Zimovnica';
  screen.appendChild(title);

  // Subtitle
  const sub = document.createElement('p');
  sub.className = 'menu-subtitle';
  sub.textContent = '14 dana da preradiš berbu. Ajvar, turšija, kiseli kupus — strategija prezimljavanja.';
  screen.appendChild(sub);

  // Brand tag
  const brand = document.createElement('div');
  brand.className = 'menu-brand';
  brand.textContent = 'Guncati × MKDSLend';
  screen.appendChild(brand);

  // Run info (ako postoji persistent)
  if (persistent && persistent.run_number > 1) {
    const info = document.createElement('div');
    info.className = 'menu-run-info';
    info.textContent = `Run #${persistent.run_number} | Beste: ${persistent.best_kasa.toLocaleString('sr')} RSD`;
    screen.appendChild(info);
  }

  // Start dugme
  const startBtn = document.createElement('button');
  startBtn.className = 'menu-btn';
  startBtn.textContent = 'Počni sezonu';
  startBtn.dataset.action = 'start_game';
  screen.appendChild(startBtn);

  // Prestige start (ako ima prethodni run)
  if (persistent && persistent.run_number > 1) {
    const prestigeBtn = document.createElement('button');
    prestigeBtn.className = 'menu-btn secondary';
    prestigeBtn.textContent = `Novi run (prestige #${persistent.run_number})`;
    prestigeBtn.dataset.action = 'start_prestige';
    screen.appendChild(prestigeBtn);
  }

  root.appendChild(screen);
}

/* ════════════════════════════════════════════════════════════
   GAME SCREEN
════════════════════════════════════════════════════════════ */

/**
 * Renderuje glavni game screen.
 * @param {HTMLElement} root
 * @param {object} state
 * @param {object} persistent
 */
function renderGame(root, state, persistent) {
  root.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'screen';

  // ── HUD ──
  const hud = document.createElement('div');
  hud.className = 'hud';
  renderHUD(hud, state);
  screen.appendChild(hud);

  // ── Bačva progress bar (samo kad active) ──
  if (state.bačva_status !== 'unsalted') {
    const bacvaBar = document.createElement('div');
    bacvaBar.className = 'bacva-widget-wrap';
    renderBacvaWidget(bacvaBar, state.bačva_status, state.bačva_days_remaining);
    screen.appendChild(bacvaBar);
  }

  // ── Passive Jobs Strip ──
  if (state.passive_jobs && state.passive_jobs.length > 0) {
    const jobsStrip = buildPassiveJobsStrip(state.passive_jobs, state.day);
    screen.appendChild(jobsStrip);
  }

  // ── Calendar Strip ──
  const calWrap = document.createElement('div');
  calWrap.className = 'calendar-strip';
  renderCalendar(calWrap, state.day, state.today_weather, state.tomorrow_weather, state.passive_jobs || []);
  screen.appendChild(calWrap);

  // ── Middle: Shelf + Actions (scrollable) ──
  const middle = document.createElement('div');
  middle.className = 'fill scroll-y';

  // Shelf / ingredients
  const shelfSection = document.createElement('div');
  shelfSection.className = 'shelf-section';
  renderShelf(shelfSection, state);
  middle.appendChild(shelfSection);

  // Action grid
  const actionsEl = buildActionGrid(state);
  middle.appendChild(actionsEl);

  screen.appendChild(middle);

  // ── Log (bottom strip) ──
  if (state.log && state.log.length > 0) {
    const logPanel = document.createElement('div');
    logPanel.className = 'log-panel';
    const recent = state.log.slice(-8).reverse();
    for (const entry of recent) {
      const div = document.createElement('div');
      div.className = `log-entry ${entry.type || 'info'}`;
      div.textContent = `[D${entry.day}] ${entry.text}`;
      logPanel.appendChild(div);
    }
    screen.appendChild(logPanel);
  }

  // ── Next Day button ──
  const nextBtn = document.createElement('button');
  nextBtn.className = 'next-day-btn';
  nextBtn.dataset.action = 'next_day';
  const daysLeft = GAME_DAYS - state.day;
  nextBtn.textContent = daysLeft > 0
    ? `Sledeći dan → (${daysLeft} preostalo)`
    : 'Završi sezonu 🏁';

  screen.appendChild(nextBtn);

  root.appendChild(screen);
}

/**
 * Gradi passive jobs strip (chip-ovi za svaki aktivan posao).
 * @param {object[]} jobs
 * @param {number} currentDay
 * @returns {HTMLElement}
 */
function buildPassiveJobsStrip(jobs, currentDay) {
  const strip = document.createElement('div');
  strip.className = 'passive-jobs-strip';

  const JOB_ICONS = { tursija: '🥒', kiseli_kupus: '🥬', suseno: '🍎', dzem: '🍓', pekmez: '🫐' };

  for (const job of jobs) {
    const chip = document.createElement('div');
    chip.className = 'job-chip';
    const icon = JOB_ICONS[job.recipe] || JOB_ICONS[job.type] || '⏳';
    const daysLeft = job.end_day - currentDay;
    chip.innerHTML = `${icon} ${job.recipe || job.type} <span class="job-days-left">${daysLeft}d</span>`;
    strip.appendChild(chip);
  }

  return strip;
}

/**
 * Gradi grid sa svim dostupnim akcijama.
 * @param {object} state
 * @returns {HTMLElement}
 */
function buildActionGrid(state) {
  const grid = document.createElement('div');
  grid.className = 'action-grid';

  const slotsLeft = state.slots;
  const s = state.sirovine;

  const actions = [
    {
      action: 'berba',
      icon: '🌾',
      label: 'Berba',
      cost: '1 slot',
      disabled: slotsLeft < 1 || state.harvest_done_today,
      title: state.harvest_done_today ? 'Već berbljeno danas' : 'Beri sirovine iz bašte',
    },
    {
      action: 'kuvanje',
      params: { recipe: 'ajvar' },
      kg: Math.max(0, s.paprike || 0),
      icon: JAR_ICONS.ajvar,
      label: 'Peči ajvar',
      cost: `2 slota • paprike`,
      disabled: slotsLeft < 2 || (s.paprike || 0) < 5,
      title: 'Trebaš ≥5 kg paprika',
    },
    {
      action: 'kuvanje',
      params: { recipe: 'sos' },
      kg: Math.max(0, s.paradajz || 0),
      icon: JAR_ICONS.sos,
      label: 'Paradajz sos',
      cost: '1 slot • paradajz',
      disabled: slotsLeft < 1 || (s.paradajz || 0) < 5,
      title: 'Trebaš ≥5 kg paradajza',
    },
    {
      action: 'kuvanje',
      params: { recipe: 'pelat' },
      kg: Math.max(0, s.paradajz || 0),
      icon: JAR_ICONS.pelat,
      label: 'Pelat',
      cost: '1 slot • paradajz',
      disabled: slotsLeft < 1 || (s.paradajz || 0) < 5,
      title: 'Trebaš ≥5 kg paradajza',
    },
    {
      action: 'kuvanje',
      params: { recipe: 'dzem' },
      kg: Math.max(0, s.jabuke || 0),
      icon: JAR_ICONS.dzem,
      label: 'Džem',
      cost: '1 slot • jabuke/šljive',
      disabled: slotsLeft < 1 || ((s.jabuke || 0) + (s.sljive || 0)) < 3,
      title: 'Trebaš ≥3 kg voća',
    },
    {
      action: 'kuvanje',
      params: { recipe: 'pekmez' },
      kg: Math.max(0, s.sljive || 0),
      icon: JAR_ICONS.pekmez,
      label: 'Pekmez',
      cost: '1 slot • šljive',
      disabled: slotsLeft < 1 || (s.sljive || 0) < 4,
      title: 'Trebaš ≥4 kg šljiva',
    },
    {
      action: 'kuvanje',
      params: { recipe: 'tursija' },
      kg: Math.max(0, (s.krastavci || 0) + (s.bostanusa || 0)),
      icon: JAR_ICONS.tursija,
      label: 'Turšija (3d)',
      cost: '1 slot • krastavci+bostanuša',
      disabled: slotsLeft < 1 || (s.krastavci || 0) < 2 || (s.bostanusa || 0) < 1,
      title: 'Trebaš ≥2 kg krastavaca i ≥1 kg bostanuše',
    },
  ];

  // Bačva (posebno)
  if (state.bačva_status === 'unsalted' || state.bačva_status === 'critical_window') {
    actions.push({
      action: 'bacva_init',
      kg: Math.max(0, s.kupus || 0),
      icon: '🥬',
      label: 'Pokreni bačvu',
      cost: '2 slota • kupus',
      disabled: slotsLeft < 2 || (s.kupus || 0) < 10,
      title: 'Trebaš ≥10 kg kupusa i 2 slota',
    });
  }

  // Rakija
  if (state.unlocks && state.unlocks.rakija) {
    const rakijaKg = Math.max(0, (s.jabuke || 0) >= 15 ? (s.jabuke || 0) : (s.sljive || 0));
    actions.push({
      action: 'kuvanje',
      params: { recipe: 'rakija' },
      kg: rakijaKg,
      icon: JAR_ICONS.rakija || '🫗',
      label: 'Rakija',
      cost: '3 slota • šljive/jabuke',
      disabled: slotsLeft < 3 || (s.sljive || 0) < 8,
      title: 'Trebaš ≥8 kg šljiva ili 15 kg jabuka i 3 slota',
    });
  }

  // Shelf upgrade
  const nextUpgrade = getNextUpgrade(state.shelf_level, state.prestige_active);
  if (nextUpgrade) {
    actions.push({
      action: 'shelf_upgrade',
      icon: '📦',
      label: `Polica +${nextUpgrade.capacity - SHELF_UPGRADES[state.shelf_level].capacity} kg`,
      cost: `${nextUpgrade.cost} RSD`,
      disabled: slotsLeft < 1 || state.kasa < nextUpgrade.cost,
      title: `Proširi kapacitet na ${nextUpgrade.capacity} kg`,
    });
  }

  for (const a of actions) {
    const btn = buildActionBtn(a, slotsLeft);
    grid.appendChild(btn);
  }

  return grid;
}

/**
 * Gradi jedno action dugme.
 * @param {object} actionDef
 * @param {number} slotsLeft
 * @returns {HTMLElement}
 */
function buildActionBtn(actionDef, slotsLeft) {
  const btn = document.createElement('button');
  btn.className = 'action-btn';
  btn.disabled = actionDef.disabled;
  btn.dataset.action = actionDef.action;
  if (actionDef.params) {
    for (const [k, v] of Object.entries(actionDef.params)) {
      btn.dataset[k] = v;
    }
  }
  if (actionDef.kg !== undefined) btn.dataset.kg = String(actionDef.kg);
  if (actionDef.title) btn.title = actionDef.title;

  const icon = document.createElement('span');
  icon.className = 'icon';
  icon.textContent = actionDef.icon;

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = actionDef.label;

  const cost = document.createElement('span');
  cost.className = 'cost';
  cost.textContent = actionDef.cost;

  btn.appendChild(icon);
  btn.appendChild(label);
  btn.appendChild(cost);
  return btn;
}

/* ════════════════════════════════════════════════════════════
   EVENT SCREEN
════════════════════════════════════════════════════════════ */

/**
 * Renderuje event card overlay iznad game screen-a.
 * @param {HTMLElement} root
 * @param {object} state
 */
function renderEventScreen(root, state) {
  // Prvo renderiraj game screen u pozadini
  renderGame(root, state, null);

  const event = state.today_events && state.today_events[0];
  if (!event) return;

  const overlay = document.createElement('div');
  overlay.className = 'event-overlay';

  const card = buildEventCard(event, state);
  overlay.appendChild(card);
  root.appendChild(overlay);
}

/**
 * Gradi event card element.
 * @param {object} event - {id, title, description, icon?, choices: [{id, text, effect_text?}]}
 * @param {object} state
 * @returns {HTMLElement}
 */
function buildEventCard(event, state) {
  const card = document.createElement('div');
  card.className = 'event-card';

  if (event.icon) {
    const icon = document.createElement('span');
    icon.className = 'event-icon';
    icon.textContent = event.icon;
    card.appendChild(icon);
  }

  const title = document.createElement('div');
  title.className = 'event-title';
  title.textContent = event.title;
  card.appendChild(title);

  if (event.description) {
    const desc = document.createElement('div');
    desc.className = 'event-text';
    desc.textContent = event.description;
    card.appendChild(desc);
  }

  const choices = document.createElement('div');
  choices.className = 'event-choices';

  const eventChoices = event.choices || [{ id: 'ok', text: 'U redu' }];
  for (const choice of eventChoices) {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice.text + (choice.effect_text ? ` (${choice.effect_text})` : '');
    btn.dataset.action = 'event_choice';
    btn.dataset.eventId = event.id;
    btn.dataset.choiceId = choice.id;
    choices.appendChild(btn);
  }

  card.appendChild(choices);
  return card;
}

/* ════════════════════════════════════════════════════════════
   ENDING SCREEN
════════════════════════════════════════════════════════════ */

/**
 * Renderuje ending screen sa skorom i aforizmom.
 * @param {HTMLElement} root
 * @param {object} state
 * @param {object} persistent
 */
function renderEnding(root, state, persistent) {
  root.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'ending-screen screen';

  const ending = state.ending;

  if (ending) {
    const icon = document.createElement('div');
    icon.className = 'ending-icon';
    icon.textContent = ending.icon || '🫙';
    screen.appendChild(icon);

    const title = document.createElement('h1');
    title.className = 'ending-title';
    title.textContent = ending.title || 'Kraj sezone';
    screen.appendChild(title);

    if (ending.subtitle) {
      const sub = document.createElement('div');
      sub.className = 'ending-subtitle';
      sub.textContent = ending.subtitle;
      screen.appendChild(sub);
    }

    if (ending.description) {
      const desc = document.createElement('p');
      desc.className = 'ending-description';
      desc.textContent = ending.description;
      screen.appendChild(desc);
    }

    if (ending.aforizam) {
      const afor = document.createElement('blockquote');
      afor.className = 'ending-aforizam';
      afor.textContent = `"${ending.aforizam}"`;
      screen.appendChild(afor);
    }
  }

  // Stats grid
  const stats = buildEndingStats(state);
  screen.appendChild(stats);

  // CTA
  const brand = document.createElement('div');
  brand.className = 'guncati-accent';
  brand.textContent = '↑ Guncati × MKDSLend';
  screen.appendChild(brand);

  const restartBtn = document.createElement('button');
  restartBtn.className = 'menu-btn';
  restartBtn.dataset.action = 'start_prestige';
  restartBtn.textContent = 'Novi run (prestige)';
  screen.appendChild(restartBtn);

  const menuBtn = document.createElement('button');
  menuBtn.className = 'menu-btn secondary';
  menuBtn.dataset.action = 'go_menu';
  menuBtn.textContent = 'Meni';
  screen.appendChild(menuBtn);

  root.appendChild(screen);
}

/**
 * Gradi stats grid za ending screen.
 * @param {object} state
 * @returns {HTMLElement}
 */
function buildEndingStats(state) {
  const grid = document.createElement('div');
  grid.className = 'ending-stats';

  const totalJars = state.tegle.reduce((s, j) => s + j.qty, 0);
  const items = [
    { label: 'Kasa', value: `${state.kasa.toLocaleString('sr')} RSD` },
    { label: 'Tegle', value: `${totalJars.toFixed(1)} kg` },
    { label: 'Dan', value: `${state.day}/${GAME_DAYS}` },
  ];

  for (const item of items) {
    const label = document.createElement('div');
    label.className = 'ending-stat-label';
    label.textContent = item.label;

    const value = document.createElement('div');
    value.className = 'ending-stat-value';
    value.textContent = item.value;

    grid.appendChild(label);
    grid.appendChild(value);
  }

  // Hack: grid je 3-col, ali smo stavili label/value par — treba 3 para = 6 cells
  // Gornji kod dodaje label i value odvojeno, ali grid je 3-col pa label ide u col1, value u col2, itd.
  // Bolje: uredi grid da bude 2-col po paru
  grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  grid.style.textAlign = 'center';

  return grid;
}

/* ════════════════════════════════════════════════════════════
   PRESTIGE SCREEN
════════════════════════════════════════════════════════════ */

/**
 * Renderuje prestige screen sa carry-over opcijama.
 * @param {HTMLElement} root
 * @param {object} state
 * @param {object} persistent
 */
function renderPrestige(root, state, persistent) {
  root.innerHTML = '';

  const screen = document.createElement('div');
  screen.className = 'prestige-screen screen';

  const badge = document.createElement('div');
  badge.className = 'prestige-badge';
  badge.textContent = '🏅';
  screen.appendChild(badge);

  const title = document.createElement('h2');
  title.textContent = `Prestige — Run #${(persistent?.run_number || 1)}`;
  screen.appendChild(title);

  const sub = document.createElement('p');
  sub.textContent = 'Sledeća sezona nosi bonuse iz ove. Izaberi šta nosiš.';
  screen.appendChild(sub);

  // Bonus lista (iz persistent carry_bonuses)
  if (persistent) {
    const bonuses = persistent.carry_bonuses || {};
    const bonusList = document.createElement('div');
    bonusList.className = 'prestige-bonuses';

    const allBonuses = [
      { key: 'kasa_bonus',           label: 'Startna kasa', value: bonuses.kasa_bonus ? `+${bonuses.kasa_bonus} RSD` : 'nema' },
      { key: 'recipe_efficiency',    label: 'Prinos recepta', value: bonuses.recipe_efficiency ? `×${bonuses.recipe_efficiency.toFixed(2)}` : '×1.00' },
      { key: 'market_unlocked',      label: 'Pijaca', value: bonuses.market_unlocked ? 'Otključana' : 'Zaključana' },
      { key: 'commander_bačva',      label: 'Bačva komandant', value: bonuses.commander_bačva ? 'DA' : 'NE' },
      { key: 'extra_shelf',          label: 'Extra polica', value: bonuses.extra_shelf ? 'DA' : 'NE' },
    ];

    for (const b of allBonuses) {
      const row = document.createElement('div');
      row.className = 'prestige-bonus-row';

      const labelEl = document.createElement('span');
      labelEl.className = 'bonus-label';
      labelEl.textContent = b.label;

      const valueEl = document.createElement('span');
      valueEl.className = 'bonus-value';
      valueEl.textContent = b.value;

      row.appendChild(labelEl);
      row.appendChild(valueEl);
      bonusList.appendChild(row);
    }

    screen.appendChild(bonusList);
  }

  // Stats
  const totalJars = state.tegle.reduce((s, j) => s + j.qty, 0);
  const statP = document.createElement('p');
  statP.style.cssText = 'margin-top:12px;font-size:0.85rem;';
  statP.textContent = `Ovaj run: ${state.kasa.toLocaleString('sr')} RSD, ${totalJars.toFixed(1)} kg tegli`;
  screen.appendChild(statP);

  // CTA
  const goBtn = document.createElement('button');
  goBtn.className = 'menu-btn';
  goBtn.dataset.action = 'start_prestige';
  goBtn.textContent = 'Kreni novu sezonu →';
  screen.appendChild(goBtn);

  root.appendChild(screen);
}
