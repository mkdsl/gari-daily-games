// =============================================================================
// scenes/persona-profile.js — Persona Profile + Telesno stanje tab (S2)
// =============================================================================
// V2 (Jova 2026-05-11, per Joca UI Spec S2):
//   Tabs:
//     - Pregled (origin preset, klasa, week log)
//     - Telesno stanje (44 dijagnoza tier 1/2/3 color)
//     - Recovery (3 tipa × 2 use)
//     - Compound (venn-style overlap of active substances)
// =============================================================================
import { el, clearChildren } from '../util.js';
import { bigButton } from '../ui.js';
import { DIAGNOSES, DIAGNOSES_BY_ID, DIAGNOSES_BY_SUBSTANCE, SUBSTANCE_META, TIER_COLOR, detectCompounds } from '../data/pera-substance.js';
import { saveState } from '../state.js';

const TABS = [
  { id: 'pregled',  label: 'Pregled' },
  { id: 'telesno',  label: 'Telesno stanje' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'compound', label: 'Compound' }
];

export function renderPersonaProfile(mount, state, transition) {
  let activeTab = 'telesno';

  function rerender() {
    clearChildren(mount);
    mount.appendChild(build());
  }

  function build() {
    return el('div', { className: 'scene persona-scene' },
      el('div', { className: 'persona-header' },
        el('button', {
          className: 'icon-btn back-btn',
          onclick: () => transition('macro')
        }, '←'),
        el('h2', { className: 'scene-title' }, state.origin.preset_label || 'Profil'),
        el('div', { className: 'persona-sub' },
          `Nedelja ${state.week} · ${state.origin.class_name || 'Custom'}`
        )
      ),

      // Tabs
      el('div', { className: 'persona-tabs' },
        ...TABS.map(t =>
          el('button', {
            className: `persona-tab ${activeTab === t.id ? 'active' : ''}`,
            onclick: () => { activeTab = t.id; rerender(); }
          }, t.label)
        )
      ),

      // Tab content
      el('div', { className: 'persona-content' },
        activeTab === 'pregled'  ? renderPregled(state) :
        activeTab === 'telesno'  ? renderTelesnoStanje(state) :
        activeTab === 'recovery' ? renderRecoveryTab(state) :
        activeTab === 'compound' ? renderCompoundTab(state) :
          el('div', null, '?')
      )
    );
  }

  mount.appendChild(build());
}

// =============================================================================
// PREGLED TAB
// =============================================================================
function renderPregled(state) {
  return el('div', { className: 'tab-pregled' },
    el('div', { className: 'preset-summary' },
      el('div', { className: 'p-label' }, 'Origin:'),
      el('div', { className: 'p-value' }, state.origin.preset_label || '—')
    ),
    el('div', { className: 'preset-summary' },
      el('div', { className: 'p-label' }, 'Klasa baseline:'),
      el('div', { className: 'p-value' }, state.origin.class_name || '—')
    ),
    el('div', { className: 'preset-summary' },
      el('div', { className: 'p-label' }, 'Recognizability:'),
      el('div', { className: 'p-value' }, `Tier ${Math.floor(state.stats.recognizability)}/7`)
    ),
    el('div', { className: 'preset-summary' },
      el('div', { className: 'p-label' }, 'Reputation:'),
      el('div', { className: 'p-value' }, `Tier ${Math.floor(state.stats.reputation)}/7`)
    ),
    el('div', { className: 'week-log-preview' },
      el('h3', null, 'Poslednje nedelje'),
      ...(state.pera_log || []).slice(-5).reverse().map(entry =>
        el('div', { className: 'log-entry' },
          el('span', { className: 'log-week' }, `W${entry.week}`),
          el('span', { className: 'log-line' }, entry.line)
        )
      )
    )
  );
}

// =============================================================================
// TELESNO STANJE TAB (44 dijagnoze, tier 1/2/3 color zone)
// =============================================================================
function renderTelesnoStanje(state) {
  // Active diagnoses (per state.substance.active_substances)
  const active = state.substance?.active_substances || [];
  const activeDiag = computeActiveDiagnoses(state, active);

  // Group by substance
  const grouped = {};
  for (const d of DIAGNOSES) {
    grouped[d.substance] = grouped[d.substance] || [];
    grouped[d.substance].push(d);
  }

  const wrap = el('div', { className: 'tab-telesno' });

  wrap.appendChild(el('div', { className: 'telesno-intro' },
    'Telo prati. Svetla pokazuju cega ima i koliko. Brojevi: vidi Postavke.'
  ));

  for (const [substance, list] of Object.entries(grouped)) {
    const meta = SUBSTANCE_META[substance];
    if (!meta) continue;
    // count active diagnoses u toj substanci
    const activeCount = list.filter(d => activeDiag.has(d.id)).length;
    const block = el('div', { className: 'substance-block', style: { borderColor: meta.color } });
    block.appendChild(el('div', { className: 'substance-header', style: { color: meta.color } },
      el('span', { className: 'sb-label' }, meta.label),
      el('span', { className: 'sb-count' }, `${activeCount}/${list.length}`)
    ));

    const diagGrid = el('div', { className: 'diag-grid' });
    for (const diag of list) {
      const isActive = activeDiag.has(diag.id);
      const tierMeta = TIER_COLOR[diag.tier];
      const cls = `diag-card ${tierMeta.cls} ${isActive ? 'active' : 'inactive'}`;
      const card = el('div', {
        className: cls,
        style: isActive ? { borderColor: tierMeta.color } : {},
        title: diag.pera
      },
        el('div', { className: 'dc-label' }, diag.label),
        el('div', { className: 'dc-tier', style: { color: isActive ? tierMeta.color : '' } },
          isActive ? `T${diag.tier} ${tierMeta.name}` : '·'
        ),
        isActive
          ? el('div', { className: 'dc-pera' }, diag.pera)
          : null,
        // Numeric mode overlay
        state.settings?.numeric_mode && isActive
          ? el('div', { className: 'dc-numeric' }, `id: ${diag.id}`)
          : null
      );
      diagGrid.appendChild(card);
    }
    block.appendChild(diagGrid);
    wrap.appendChild(block);
  }

  return wrap;
}

// Compute aktivne dijagnoze iz state.substance.active_substances + tier escalation
function computeActiveDiagnoses(state, activeSubstances) {
  const result = new Set();
  const sub = state.substance || {};

  // Each active substance → its T1 minimum is active.
  // Tier escalates based on how long it's been active (weeks) — pseudo (state.week is the proxy).
  for (const subKey of activeSubstances) {
    const list = DIAGNOSES_BY_SUBSTANCE[subKey] || [];
    for (const d of list) {
      // Tier 1 always active if substance present
      if (d.tier === 1) result.add(d.id);
      // Tier 2 active if week >= 4
      else if (d.tier === 2 && state.week >= 4) result.add(d.id);
      // Tier 3 active if week >= 8 OR sacrifice low
      else if (d.tier === 3) {
        const minSac = Math.min(state.sacrifice.health, state.sacrifice.odnosi, state.sacrifice.normalnost);
        if (state.week >= 8 || minSac < 40) result.add(d.id);
      }
    }
  }

  // Compound detection
  const compounds = detectCompounds(activeSubstances);
  for (const c of compounds) result.add(c.id);

  // Behavioral/Mental tier 2-3 based on sacrifice low
  if (state.sacrifice.health < 40) {
    result.add('beh_sleep');
    result.add('mental_burnout');
  }
  if (state.sacrifice.normalnost < 40) {
    result.add('mental_dissociation');
    result.add('mental_anxiety');
  }
  if (state.sacrifice.odnosi < 40) {
    result.add('beh_sex');  // ne prima vrednost, znak da je veza distorted
  }

  return result;
}

// =============================================================================
// RECOVERY TAB — 3 tipa × 2 uses = 6 total
// =============================================================================
function renderRecoveryTab(state) {
  const types = [
    { key: 'tisina',       label: 'Tisina',        desc: 'Bez zvuka 48h. Sluh se vraca.' },
    { key: 'integration',  label: 'Integracija',   desc: 'Sam sa sobom 3 dana. Razlika postaje jasna.' },
    { key: 'reality',      label: 'Reality check', desc: 'Razgovor sa nekim van scene. 40 min.' }
  ];

  return el('div', { className: 'tab-recovery' },
    el('div', { className: 'recovery-intro' },
      '3 tipa, 2 koriscenja po sezoni svaki. Aktiviraj preko Macro Week kalendara.'
    ),
    el('div', { className: 'recovery-grid' },
      ...types.map(t => {
        const used = state.substance.recovery_uses[t.key] || 0;
        const left = 2 - used;
        const cls = left === 0 ? 'exhausted' : left === 1 ? 'half' : 'full';
        return el('div', { className: `recovery-card ${cls}` },
          el('div', { className: 'rc-label' }, t.label),
          el('div', { className: 'rc-desc' }, t.desc),
          el('div', { className: 'rc-slots' },
            el('span', { className: `slot-dot ${used >= 1 ? 'used' : 'free'}` }, used >= 1 ? '●' : '○'),
            el('span', { className: `slot-dot ${used >= 2 ? 'used' : 'free'}` }, used >= 2 ? '●' : '○')
          ),
          el('div', { className: 'rc-status' }, `${left}/2 ostalo`)
        );
      })
    )
  );
}

// =============================================================================
// COMPOUND TAB — venn-style overlap indikator
// =============================================================================
function renderCompoundTab(state) {
  const active = state.substance?.active_substances || [];
  const compounds = detectCompounds(active);

  const wrap = el('div', { className: 'tab-compound' });

  wrap.appendChild(el('div', { className: 'compound-intro' },
    'Sta se preklapa u tebi. Telo broji cak i kad ti ne brojis.'));

  if (compounds.length === 0) {
    wrap.appendChild(el('div', { className: 'no-compound' },
      'Nema aktivnih kombinacija. Solo upotreba je svoj prostor.'));
  }

  // Venn-style visualization: each active substance = circle
  const venn = el('div', { className: 'venn-wrap' });
  for (const subKey of active) {
    const meta = SUBSTANCE_META[subKey];
    if (!meta) continue;
    venn.appendChild(el('div', {
      className: 'venn-circle',
      style: { borderColor: meta.color, color: meta.color, background: meta.color + '22' }
    }, meta.label));
  }
  wrap.appendChild(venn);

  if (compounds.length > 0) {
    wrap.appendChild(el('div', { className: 'compound-list' },
      ...compounds.map(c => {
        const meta = SUBSTANCE_META[c.substance];
        return el('div', {
          className: 'compound-card',
          style: { borderColor: meta?.color || '#ff4040' }
        },
          el('div', { className: 'cc-label', style: { color: meta?.color } }, c.label),
          el('div', { className: 'cc-pera' }, c.pera)
        );
      })
    ));
  }

  return wrap;
}
