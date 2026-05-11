// =============================================================================
// scenes/macro-planner.js — Macro Week 7×3 kalendar (v2)
// =============================================================================
// V2 (Jova 2026-05-11, per Joca UI Spec S1 v2):
//   - 7 dana × 3 slota = 21 kvadratića
//   - Sticker paleta: 9 vector + 3 recovery + 1 hobby + 1 substance (zovi)
//   - Drag-drop (touch + mouse). Sticker se može ukloniti tap-om na slot.
//   - Pressure indicator (skrivene time/energy → simptom boja)
//   - HUD simptomatski (color zones, ne brojevno — osim ako numeric_mode ON)
//   - Settings ikona dovodi do settings scene-a (Numeric Mode toggle)
//   - Persona Profile dugme → telesno stanje tab (S2)
// =============================================================================
import { el, clearChildren, pressureSignal } from '../util.js';
import {
  renderHUD, renderSacrificeBar, renderTierGrid,
  bigButton, peraQuote
} from '../ui.js';
import { STICKERS, STICKERS_BY_ID, DAYS_OF_WEEK, SLOT_LABELS, PRESSURE_THRESHOLDS } from '../data/stickers.js';
import { runWeek, getCurrentGigScheduled } from '../systems/macro.js';
import { saveState, createEmptyMacroGrid } from '../state.js';
import { isUnlocked as isRecklessUnlocked } from '../systems/vector-reckless.js';
import { triggerOverlay } from '../systems/pera-overlay.js';

export function renderMacroPlanner(mount, state, transition) {
  // Initialize grid if missing
  if (!state.macro_grid || state.macro_grid.length !== 21) {
    state.macro_grid = createEmptyMacroGrid();
  }

  let selectedSticker = null;  // current "pen" sticker
  let dragSticker = null;

  function build() {
    clearChildren(mount);
    const gig = getCurrentGigScheduled(state);
    const usedCount = state.macro_grid.filter(s => s.sticker).length;
    const pressure = pressureForCount(usedCount);

    mount.appendChild(el('div', { className: 'scene macro-scene-v2' },
      // Top bar: HUD simptomatski + settings + persona
      el('div', { className: 'top-bar' },
        renderHUD(state),
        el('div', { className: 'top-buttons' },
          el('button', {
            className: 'icon-btn persona-btn',
            onclick: () => transition('persona'),
            title: 'Tvoj profil + telesno stanje'
          }, '◐'),
          el('button', {
            className: 'icon-btn settings-btn',
            onclick: () => transition('settings'),
            title: 'Postavke'
          }, '⚙')
        )
      ),

      renderSacrificeBar(state),
      renderTierGrid(state),

      // Week header
      el('div', { className: 'planner-header-v2' },
        el('h2', null, `Nedelja ${state.week}`),
        gig
          ? el('div', { className: 'gig-indicator' },
              el('span', { className: 'gig-icon' }, '·'),
              el('span', null, 'Zurka ove nedelje.')
            )
          : el('div', { className: 'no-gig' }, 'Nema zurke ove nedelje.'),
        el('div', { className: `pressure-indicator ${pressure.cls}` },
          `Pritisak: ${pressure.label}`
        )
      ),

      // 7×3 GRID
      renderCalendarGrid(state, () => build(), getSelected, setSelected, getDrag, setDrag),

      // STICKER PALETTE
      renderStickerPalette(state, getSelected, setSelected, getDrag, setDrag),

      // RECKLESS HINT
      el('div', { className: 'reckless-hint-v2' },
        isRecklessUnlocked(state)
          ? 'V9 Reckless: otkljucan — aktivira se u zurci.'
          : 'V9 Reckless: zakljucano dok ne stignes Knowledge tier 2.'
      ),

      // CTA
      el('div', { className: 'planner-cta-v2' },
        el('button', {
          className: 'btn-secondary',
          onclick: () => {
            for (const slot of state.macro_grid) slot.sticker = null;
            state.substance.zovi_covika_this_week = 0;
            saveState(state);
            build();
          }
        }, 'Ocisti'),
        bigButton('Zavrsi nedelju', () => {
          const plan = buildPlanFromGrid(state.macro_grid);
          state.next_week_plan = plan;
          state.gigs_this_week = gig ? 1 : 0;
          const log = runWeek(state, plan);
          // Update substance tracking
          state.substance.zovi_covika_total += state.substance.zovi_covika_this_week;
          state.substance.zovi_covika_this_week = 0;
          saveState(state);

          // Pera overlay — symptom snapshot
          const lowest = lowestSymptomZone(state);
          if (lowest === 'red') triggerOverlay(state, 'symptom');
          else if (lowest === 'yellow' && Math.random() < 0.5) triggerOverlay(state, 'symptom');

          if (gig) {
            transition('micro', { weekLog: log });
          } else {
            transition('recap', { weekLog: log });
          }
        }, 'btn-primary btn-cta')
      ),

      // Pera last-week log
      state.pera_log.length > 0
        ? peraQuote(state.pera_log[state.pera_log.length - 1].line)
        : null
    ));
  }

  function getSelected() { return selectedSticker; }
  function setSelected(s) { selectedSticker = s; build(); }
  function getDrag() { return dragSticker; }
  function setDrag(s) { dragSticker = s; }

  build();
}

// =============================================================================
// CALENDAR GRID 7×3
// =============================================================================
function renderCalendarGrid(state, rerender, getSel, setSel, getDrag, setDrag) {
  const grid = state.macro_grid;
  const wrap = el('div', { className: 'cal-grid-wrap' });

  // Header row (Pon, Uto, ...)
  const headerRow = el('div', { className: 'cal-header-row' },
    el('div', { className: 'cal-corner' }, ''),
    ...DAYS_OF_WEEK.map(d => el('div', { className: 'cal-day-header' }, d))
  );
  wrap.appendChild(headerRow);

  // 3 slot rows (Jutro, Popodne, Vece)
  for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
    const row = el('div', { className: 'cal-slot-row' });
    row.appendChild(el('div', { className: 'cal-slot-label' }, SLOT_LABELS[slotIdx]));
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const slot = grid.find(s => s.day === dayIdx && s.slot === slotIdx);
      const cellEl = renderSlotCell(state, slot, rerender, getSel, setSel, getDrag, setDrag);
      row.appendChild(cellEl);
    }
    wrap.appendChild(row);
  }
  return wrap;
}

function renderSlotCell(state, slot, rerender, getSel, setSel, getDrag, setDrag) {
  const stickerId = slot.sticker;
  const sticker = stickerId ? STICKERS_BY_ID[stickerId] : null;

  const cls = `cal-cell ${sticker ? 'has-sticker' : 'empty'} ${sticker ? `cat-${sticker.cat}` : ''}`;
  const cell = el('div', {
    className: cls,
    style: sticker ? { borderColor: sticker.color } : {},
    dataset: { day: String(slot.day), slot: String(slot.slot) },
    onclick: () => {
      // Tap behavior:
      //   - if has sticker → remove
      //   - else if there's a selected sticker → place it
      if (sticker) {
        // Special: zovi_covika decrement counter
        if (sticker.id === 'zovi_covika') {
          state.substance.zovi_covika_this_week = Math.max(0, (state.substance.zovi_covika_this_week || 0) - 1);
        }
        slot.sticker = null;
        rerender();
        return;
      }
      const sel = getSel();
      if (sel) {
        if (sel.locked) return;
        // Recovery: check uses_left
        if (sel.cat === 'recovery') {
          const usesField = sel.uses_left_field;
          if ((state.substance.recovery_uses[usesField] || 0) >= 2) {
            // already used 2x this season — block
            return;
          }
        }
        slot.sticker = sel.id;
        if (sel.id === 'zovi_covika') {
          state.substance.zovi_covika_this_week = (state.substance.zovi_covika_this_week || 0) + 1;
        }
        if (sel.cat === 'recovery') {
          const f = sel.uses_left_field;
          state.substance.recovery_uses[f] = (state.substance.recovery_uses[f] || 0) + 1;
        }
        rerender();
      }
    },
    ondragover: e => { e.preventDefault(); cell.classList.add('drag-over'); },
    ondragleave: () => cell.classList.remove('drag-over'),
    ondrop: e => {
      e.preventDefault();
      cell.classList.remove('drag-over');
      const drag = getDrag();
      if (!drag || drag.locked) return;
      if (drag.cat === 'recovery') {
        const usesField = drag.uses_left_field;
        if ((state.substance.recovery_uses[usesField] || 0) >= 2) return;
        state.substance.recovery_uses[usesField] = (state.substance.recovery_uses[usesField] || 0) + 1;
      }
      if (drag.id === 'zovi_covika') {
        state.substance.zovi_covika_this_week = (state.substance.zovi_covika_this_week || 0) + 1;
      }
      slot.sticker = drag.id;
      rerender();
    }
  });

  if (sticker) {
    cell.appendChild(el('div', { className: 'cell-sticker' },
      el('div', { className: 'cs-short', style: { color: sticker.color } }, sticker.short),
      el('div', { className: 'cs-label' }, sticker.label)
    ));
  } else {
    cell.appendChild(el('div', { className: 'cell-placeholder' }, '+'));
  }

  return cell;
}

// =============================================================================
// STICKER PALETTE
// =============================================================================
function renderStickerPalette(state, getSel, setSel, getDrag, setDrag) {
  const palette = el('div', { className: 'sticker-palette' });
  palette.appendChild(el('div', { className: 'palette-hint' },
    'Selectuj sticker pa tap-uj kvadrat, ili drag-drop. Tap na zauzet kvadrat brise.'));

  const grid = el('div', { className: 'palette-grid' });
  for (const sticker of STICKERS) {
    const sel = getSel();
    const isSel = sel?.id === sticker.id;
    const usesLeft = (sticker.cat === 'recovery')
      ? 2 - (state.substance.recovery_uses[sticker.uses_left_field] || 0)
      : null;
    const isDisabled = sticker.locked || (sticker.cat === 'recovery' && usesLeft <= 0);

    const card = el('button', {
      className: `palette-sticker cat-${sticker.cat} ${isSel ? 'sel' : ''} ${isDisabled ? 'disabled' : ''}`,
      style: { borderColor: sticker.color },
      draggable: !isDisabled,
      onclick: () => { if (!isDisabled) setSel(sticker); },
      ondragstart: e => {
        if (isDisabled) { e.preventDefault(); return; }
        setDrag(sticker);
        e.dataTransfer?.setData('text/plain', sticker.id);
      },
      ondragend: () => setDrag(null)
    },
      el('div', { className: 'ps-short', style: { color: sticker.color } }, sticker.short),
      el('div', { className: 'ps-label' }, sticker.label)
    );

    // Locked badge
    if (sticker.locked) {
      card.appendChild(el('div', { className: 'ps-lock' }, '🔒'));
    }
    // Recovery uses-left counter
    if (usesLeft !== null) {
      card.appendChild(el('div', { className: 'ps-uses' }, `${usesLeft}/2`));
    }
    // Zovi covika cumulative counter
    if (sticker.id === 'zovi_covika') {
      const totalThisSeason = state.substance.zovi_covika_total || 0;
      const thisWeek = state.substance.zovi_covika_this_week || 0;
      card.appendChild(el('div', { className: 'ps-count' },
        `${thisWeek}× wk · ${totalThisSeason}× total`));
    }

    grid.appendChild(card);
  }
  palette.appendChild(grid);

  return palette;
}

// =============================================================================
// GRID → PLAN converter (za sistemski runWeek)
// =============================================================================
export function buildPlanFromGrid(grid) {
  const plan = {
    promo: { frequency: 0, ad_money: 0 },
    music: { source: 'digital', money_invested: 0 },
    knowledge: { source: 'citanje', hours: 0 },
    mixing: { session_length: 0, record_mixtape: false },
    visual: { category: 'none' },
    scene: { mingling_count: 0, atmospheric_count: 0, guest_set: false },
    finance: { sponsor_outreach: false, bookkeeping: false },
    energy: { san: false, joga: false, setnja: false, hobi: false, porodica: false, mirna_nedelja: false }
  };

  // Count stickers
  const counts = {};
  for (const slot of grid) {
    if (!slot.sticker) continue;
    counts[slot.sticker] = (counts[slot.sticker] || 0) + 1;
  }

  // Promo: 1 slot = 1x/wk, 2 = 3x, 3+ = 5x
  const promoSlots = counts.promo || 0;
  plan.promo.frequency = promoSlots >= 3 ? 5 : promoSlots === 2 ? 3 : promoSlots === 1 ? 1 : 0;
  plan.promo.ad_money = Math.min(50, promoSlots * 15);

  // Music: 1 slot = 50 RSD digital, 2+ = 100+ vinyl
  const musicSlots = counts.music || 0;
  plan.music.money_invested = musicSlots * 50;
  plan.music.source = musicSlots >= 2 ? 'vinyl' : 'digital';

  // Knowledge: 1 slot = 4h citanje, 2 = 8h podcast, 3+ = mentor
  const knowSlots = counts.knowledge || 0;
  plan.knowledge.hours = knowSlots * 4;
  plan.knowledge.source = knowSlots >= 3 ? 'mentor' : knowSlots === 2 ? 'podcast' : 'citanje';

  // Mixing: 1 = 60 min, 2 = 120, 3+ = 240
  const mixSlots = counts.mixing || 0;
  plan.mixing.session_length = mixSlots >= 3 ? 240 : mixSlots === 2 ? 120 : mixSlots === 1 ? 60 : 0;
  plan.mixing.record_mixtape = mixSlots >= 4;

  // Visual: 1 slot = garderoba, 2 = +fitness, 3 = +fotka
  if ((counts.visual || 0) >= 1) {
    plan.visual.category = (counts.visual >= 2) ? 'fitness' : 'garderoba';
  }

  // Scene: mingling = 1 slot, atmospheric = 2 slot, guest_set = 3+
  const sceneSlots = counts.scene || 0;
  plan.scene.mingling_count = Math.min(3, sceneSlots);
  plan.scene.atmospheric_count = sceneSlots >= 2 ? 1 : 0;
  plan.scene.guest_set = sceneSlots >= 3;

  // Finance: 1 slot = sponsor, 2 = +bookkeeping
  const finSlots = counts.finance || 0;
  plan.finance.sponsor_outreach = finSlots >= 1;
  plan.finance.bookkeeping = finSlots >= 2;

  // Energy: san aktivan ako bar 1 energy slot
  const eSlots = counts.energy || 0;
  plan.energy.san = eSlots >= 1;
  plan.energy.joga = eSlots >= 2;
  plan.energy.setnja = eSlots >= 3;

  // Hobby
  if ((counts.hobby || 0) >= 1) {
    plan.energy.hobi = true;
  }
  // 3+ hobby slots = mirna_nedelja
  if ((counts.hobby || 0) >= 3) {
    plan.energy.mirna_nedelja = true;
  }

  return plan;
}

function pressureForCount(c) {
  if (c <= PRESSURE_THRESHOLDS.light)    return { label: 'lagana nedelja', cls: 'sig-green' };
  if (c <= PRESSURE_THRESHOLDS.full)     return { label: 'puna nedelja',   cls: 'sig-yellow' };
  if (c <= PRESSURE_THRESHOLDS.pressure) return { label: 'pritisak',       cls: 'sig-orange' };
  return { label: 'pucas',                                                  cls: 'sig-red' };
}

function lowestSymptomZone(state) {
  const s = state.sacrifice || {};
  const vals = [s.health, s.odnosi, s.normalnost].filter(v => v != null);
  if (vals.length === 0) return 'green';
  const min = Math.min(...vals);
  if (min < 30) return 'red';
  if (min < 60) return 'yellow';
  return 'green';
}
