import { CONFIG } from '../config.js';
import { getLogbookEntries, getLogbookCount, LOGBOOK_CATEGORIES } from '../systems/logbook.js';

let panelEl = null;
let isOpen = false;
let currentCategory = null;

export function createLogbookPanel() {
  if (panelEl) return panelEl;

  panelEl = document.createElement('div');
  panelEl.id = 'logbook-panel';
  panelEl.style.cssText = `
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 360px;
    background: #0a1520;
    border-right: 2px solid #1a2d42;
    z-index: 400;
    transform: translateX(-100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    font-family: monospace;
    overflow: hidden;
  `;

  document.body.appendChild(panelEl);
  return panelEl;
}

function getCategoryLabel(cat) {
  const labels = {
    'mini-price': 'Mini-Priče',
    'lore-fragment': 'Lore',
    'egg-zapis': 'Egg Zapisi',
    'zona-milestone': 'Milestones'
  };
  return labels[cat] || cat;
}

function getCategoryColor(cat) {
  const colors = {
    'mini-price': '#BF5FFF',
    'lore-fragment': '#5BA4CF',
    'egg-zapis': '#FFD700',
    'zona-milestone': '#40C87E'
  };
  return colors[cat] || '#E8DCC8';
}

export function renderLogbookPanel(state) {
  const el = createLogbookPanel();
  const cats = LOGBOOK_CATEGORIES || ['mini-price', 'lore-fragment', 'egg-zapis', 'zona-milestone'];

  const totalCount = state.logbook.length;

  el.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #1a2d42; flex-shrink: 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; color: #555; letter-spacing: 2px;">MKDSLEND</div>
          <div style="font-size: 18px; font-weight: bold; color: #E8DCC8;">Logbook</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: bold; color: #FFD700;">${totalCount}</div>
          <div style="font-size: 9px; color: #555;">zapisa</div>
        </div>
      </div>
      <button id="logbook-close" style="
        position: absolute; top: 12px; right: 12px;
        background: transparent; border: 1px solid #333;
        color: #888; width: 28px; height: 28px;
        border-radius: 4px; cursor: pointer; font-size: 14px;
      ">x</button>
    </div>

    <div style="display: flex; padding: 8px; gap: 4px; border-bottom: 1px solid #1a2d42; flex-shrink: 0; flex-wrap: wrap;">
      <button class="lb-tab ${currentCategory === null ? 'active' : ''}" data-cat="null"
              style="flex: 1; padding: 5px; background: ${currentCategory === null ? '#FFD700' : 'transparent'};
                     color: ${currentCategory === null ? '#0D1B2A' : '#666'}; border: 1px solid #222;
                     border-radius: 3px; cursor: pointer; font-family: monospace; font-size: 9px;">
        SVE (${totalCount})
      </button>
      ${cats.map(cat => {
        const count = getLogbookCount(state, cat);
        const active = currentCategory === cat;
        const color = getCategoryColor(cat);
        return `<button class="lb-tab" data-cat="${cat}"
                        style="flex: 1; padding: 5px; background: ${active ? color : 'transparent'};
                               color: ${active ? '#0D1B2A' : '#666'}; border: 1px solid #222;
                               border-radius: 3px; cursor: pointer; font-family: monospace; font-size: 9px;">
                  ${getCategoryLabel(cat).split('-')[0]} (${count})
                </button>`;
      }).join('')}
    </div>

    <div id="logbook-entries" style="flex: 1; overflow-y: auto; padding: 8px;">
      ${renderEntries(state)}
    </div>
  `;

  // Event listeners
  el.querySelector('#logbook-close')?.addEventListener('click', closeLogbook);
  el.querySelectorAll('.lb-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat === 'null' ? null : btn.dataset.cat;
      currentCategory = cat;
      renderLogbookPanel(state);
    });
  });
}

function renderEntries(state) {
  const entries = getLogbookEntries(state, currentCategory ? { category: currentCategory } : {});

  if (entries.length === 0) {
    return `<div style="text-align: center; padding: 40px 20px; color: #333; font-size: 12px;">
      Nema zapisa još.<br>
      <span style="font-size: 10px; color: #222;">Istraži park da otključaš priče.</span>
    </div>`;
  }

  return entries.map(entry => {
    const color = getCategoryColor(entry.category);
    const date = entry.date || '';
    return `
      <div style="margin-bottom: 8px; padding: 10px; background: #0d1825; border-left: 3px solid ${color}; border-radius: 0 4px 4px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <div style="font-size: 11px; font-weight: bold; color: ${color};">${escHtml(entry.title)}</div>
          <div style="font-size: 9px; color: #333;">${date}</div>
        </div>
        <div style="font-size: 11px; color: #8899aa; line-height: 1.5;">${escHtml(entry.content)}</div>
      </div>
    `;
  }).join('');
}

function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function openLogbook(state) {
  const el = createLogbookPanel();
  renderLogbookPanel(state);
  requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; });
  isOpen = true;
}

export function closeLogbook() {
  if (!panelEl) return;
  panelEl.style.transform = 'translateX(-100%)';
  isOpen = false;
}

export function isLogbookOpen() { return isOpen; }
export function toggleLogbook(state) {
  if (isOpen) closeLogbook(); else openLogbook(state);
}
