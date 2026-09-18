/**
 * shelf_renderer.js — Renderuje police sa teglama i sirovine (kategorije, kapacitet bar).
 * Mobile-first: svaki red min-height 52px, touch targets >= 44px.
 */

import { JAR_ICONS } from '../config.js';
import { usedCapacity, capacityPercent } from '../systems/capacity.js';
import { getCapacity } from '../entities/shelf.js';

/** Srpski nazivi za tipove tegli */
const JAR_NAMES = {
  ajvar:         'Ajvar',
  sos:           'Paradajz sos',
  pelat:         'Pelat',
  dzem:          'Džem',
  pekmez:        'Pekmez',
  tursija:       'Turšija',
  medenjaci:     'Medenjaci',
  kiseli_kupus:  'Kiseli kupus',
  suseno_voce:   'Sušeno voće',
  sušene_šljive: 'Sušene šljive',
  rakija:        'Rakija',
};

/** Srpski nazivi za sirovine */
const ING_NAMES = {
  paprike:    { name: 'Paprike',    icon: '🫑' },
  paradajz:   { name: 'Paradajz',   icon: '🍅' },
  jabuke:     { name: 'Jabuke',     icon: '🍎' },
  sljive:     { name: 'Šljive',     icon: '🫐' },
  krastavci:  { name: 'Krastavci',  icon: '🥒' },
  bostanusa:  { name: 'Bostanuša',  icon: '🌿' },
  kupus:      { name: 'Kupus',      icon: '🥬' },
};

/**
 * Renderuje police sa teglama i sirovine u zadani container element.
 * @param {HTMLElement} container
 * @param {object} state - Pun game state
 */
export function renderShelf(container, state) {
  container.innerHTML = '';

  const { tegle, sirovine, shelf_level } = state;
  const cap = getCapacity(shelf_level);
  const used = usedCapacity(tegle);
  const pct = cap > 0 ? Math.min(used / cap, 1) : 0;

  // 1. Kapacitet bar
  const capBar = buildCapacityBarEl(used, cap, pct);
  container.appendChild(capBar);

  // 2. Tegle po kategorijama
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'section-header';
  sectionHeader.textContent = 'Tegle';
  container.appendChild(sectionHeader);

  const ORDER = ['ajvar', 'sos', 'pelat', 'dzem', 'pekmez', 'tursija', 'kiseli_kupus',
                 'suseno_voce', 'sušene_šljive', 'medenjaci', 'rakija'];

  // Grupiši tegle po tipu
  /** @type {Map<string, {qty: number, items: Array}>} */
  const grouped = new Map();
  for (const jar of tegle) {
    if (!grouped.has(jar.type)) {
      grouped.set(jar.type, { qty: 0, items: [] });
    }
    const g = grouped.get(jar.type);
    g.qty += jar.qty;
    g.items.push(jar);
  }

  // Renderuj sve kategorije (i prazne)
  for (const type of ORDER) {
    const data = grouped.get(type);
    const qty = data ? data.qty : 0;
    const row = buildJarCategoryRow(type, qty);
    container.appendChild(row);
  }

  // 3. Sirovine
  const hasAnySirovine = Object.values(sirovine).some(v => v > 0.1);
  if (hasAnySirovine) {
    const srvHeader = document.createElement('div');
    srvHeader.className = 'section-header';
    srvHeader.textContent = 'Sirovine (kg)';
    container.appendChild(srvHeader);

    for (const [key, qty] of Object.entries(sirovine)) {
      if (qty < 0.05) continue;
      const chip = buildIngredientChip(key, qty);
      container.appendChild(chip);
    }
  }
}

/**
 * Gradi kapacitet bar element.
 * @param {number} used
 * @param {number} cap
 * @param {number} pct - 0 to 1
 * @returns {HTMLElement}
 */
function buildCapacityBarEl(used, cap, pct) {
  const wrap = document.createElement('div');
  wrap.className = 'capacity-bar-wrap';

  const label = document.createElement('div');
  label.className = 'capacity-bar-label';
  label.innerHTML = `<span>Police</span><span>${used.toFixed(1)} / ${cap} kg</span>`;

  const track = document.createElement('div');
  track.className = 'capacity-bar-track';

  const fill = document.createElement('div');
  fill.className = 'capacity-bar-fill' +
    (pct >= 1.0 ? ' full' : pct >= 0.75 ? ' warn' : '');
  fill.style.width = `${Math.round(pct * 100)}%`;

  track.appendChild(fill);
  wrap.appendChild(label);
  wrap.appendChild(track);
  return wrap;
}

/**
 * Gradi jedan red kategorije tegli.
 * @param {string} type - Tip tegle
 * @param {number} qty - Ukupna kg
 * @returns {HTMLElement}
 */
function buildJarCategoryRow(type, qty) {
  const row = document.createElement('div');
  row.className = 'jar-category' + (qty < 0.05 ? ' empty' : '');
  row.dataset.type = type;

  const icon = document.createElement('span');
  icon.className = 'jar-cat-icon';
  icon.textContent = JAR_ICONS[type] || '🫙';

  const info = document.createElement('div');
  info.className = 'jar-cat-info';

  const name = document.createElement('div');
  name.className = 'jar-cat-name';
  name.textContent = JAR_NAMES[type] || type;

  const qtyEl = document.createElement('div');
  qtyEl.className = 'jar-cat-qty';
  qtyEl.textContent = qty >= 0.05 ? `${qty.toFixed(1)} kg` : '—';

  info.appendChild(name);
  info.appendChild(qtyEl);

  row.appendChild(icon);
  row.appendChild(info);

  if (qty >= 0.05) {
    const actions = document.createElement('div');
    actions.className = 'jar-cat-actions';

    const sell1 = document.createElement('button');
    sell1.className = 'sell-btn';
    sell1.textContent = 'Prodaj 1';
    sell1.dataset.action = 'prodaja';
    sell1.dataset.type = type;
    sell1.dataset.qty = '1';

    const sellAll = document.createElement('button');
    sellAll.className = 'sell-btn';
    sellAll.textContent = 'Sve';
    sellAll.dataset.action = 'prodaja';
    sellAll.dataset.type = type;
    sellAll.dataset.qty = 'all';

    actions.appendChild(sell1);
    actions.appendChild(sellAll);
    row.appendChild(actions);
  }

  return row;
}

/**
 * Gradi ingredient chip za prikaz sirovine.
 * @param {string} key
 * @param {number} qty
 * @returns {HTMLElement}
 */
function buildIngredientChip(key, qty) {
  const info = ING_NAMES[key] || { name: key, icon: '🌿' };
  const chip = document.createElement('div');
  chip.className = 'ingredient-chip';
  chip.innerHTML = `<span class="ing-icon">${info.icon}</span><span>${info.name}</span><span class="ing-qty">${qty.toFixed(1)} kg</span>`;
  return chip;
}

/**
 * Renderuje kapacitet bar (standalone, za externe pozivaoce).
 * @param {HTMLElement} container
 * @param {number} used
 * @param {number} capacity
 */
export function renderCapacityBar(container, used, capacity) {
  container.innerHTML = '';
  const pct = capacity > 0 ? Math.min(used / capacity, 1) : 0;
  container.appendChild(buildCapacityBarEl(used, capacity, pct));
}

/**
 * Renderuje jednu teglu kao DOM element (za tooltip/modal prikaze).
 * @param {object} jar
 * @returns {HTMLElement}
 */
export function renderJar(jar) {
  const el = document.createElement('div');
  el.className = `jar jar-${jar.type}`;

  const icon = document.createElement('span');
  icon.className = 'jar-icon';
  icon.textContent = JAR_ICONS[jar.type] || '🫙';

  const qty = document.createElement('span');
  qty.className = 'jar-qty';
  qty.textContent = `${jar.qty.toFixed(1)}`;

  el.appendChild(icon);
  el.appendChild(qty);
  el.title = `${JAR_NAMES[jar.type] || jar.type}: ${jar.qty.toFixed(1)} kg`;
  return el;
}

/**
 * Gradi DOM za jednu policu (za legacy shelf grid prikaz).
 * @param {object[]} jarsOnShelf
 * @param {number} idx - Index police
 * @returns {HTMLElement}
 */
function buildShelfEl(jarsOnShelf, idx) {
  const el = document.createElement('div');
  el.className = 'shelf';
  el.dataset.shelfIdx = idx;
  el.dataset.label = `Polica ${idx + 1}`;
  for (const jar of jarsOnShelf) {
    el.appendChild(renderJar(jar));
  }
  return el;
}
