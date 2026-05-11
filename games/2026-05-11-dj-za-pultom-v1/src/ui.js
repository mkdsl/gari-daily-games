// =============================================================================
// ui.js — UI components (HUD, stat displays, modal helpers)
// =============================================================================
import { el, formatRSD, formatTier, symptomSignal, pct } from './util.js';
import { WEEKS_PER_SEASON } from './config.js';

export function renderHUD(state) {
  return el('div', { className: 'hud' },
    el('div', { className: 'hud-row hud-week' },
      el('span', { className: 'hud-label' }, 'Nedelja'),
      el('span', { className: 'hud-value' }, `${state.week} / ${WEEKS_PER_SEASON}`)
    ),
    el('div', { className: 'hud-row hud-money' },
      el('span', { className: 'hud-label' }, 'Money'),
      el('span', { className: 'hud-value' }, formatRSD(state.money))
    ),
    el('div', { className: 'hud-row hud-energy' },
      el('span', { className: 'hud-label' }, 'Energija'),
      meterBar(state.energy, 100, 'energy-meter')
    ),
    el('div', { className: 'hud-row hud-rsvp' },
      el('span', { className: 'hud-label' }, 'RSVP sledeca'),
      el('span', { className: 'hud-value' }, Math.round(state.rsvp_next))
    ),
    el('div', { className: 'hud-row hud-class' },
      el('span', { className: 'hud-label' }, 'Origin'),
      el('span', { className: 'hud-value' }, state.origin.class_name || '—')
    )
  );
}

export function renderSacrificeBar(state) {
  return el('div', { className: 'sacrifice-bar' },
    renderSymptomTile('Health', state.sacrifice.health, 'telo, san'),
    renderSymptomTile('Odnosi', state.sacrifice.odnosi, 'porodica, prijatelji'),
    renderSymptomTile('Normalnost', state.sacrifice.normalnost, 'zivot van muzike')
  );
}

function renderSymptomTile(label, value, sub) {
  const sig = symptomSignal(value);
  return el('div', { className: `symptom-tile ${sig.cls}` },
    el('div', { className: 'sym-label' }, label),
    el('div', { className: 'sym-value' }, `${Math.round(value)}%`),
    el('div', { className: 'sym-sub' }, sub)
  );
}

export function renderTierGrid(state) {
  return el('div', { className: 'tier-grid' },
    tierBadge('Knowledge', state.stats.knowledge),
    tierBadge('Mixing', state.stats.mixing),
    tierBadge('Visual', state.stats.visual),
    tierBadge('Network', state.stats.network),
    tierBadge('Recogn.', state.stats.recognizability),
    tierBadge('Reputation', state.stats.reputation)
  );
}

function tierBadge(label, value) {
  const tier = Math.floor(value);
  return el('div', { className: 'tier-badge', dataset: { tier } },
    el('div', { className: 'tier-label' }, label),
    el('div', { className: 'tier-value' }, `${tier}/7`),
    el('div', { className: 'tier-progress' },
      el('div', {
        className: 'tier-progress-fill',
        style: { width: `${(value % 1) * 100}%` }
      })
    )
  );
}

export function meterBar(value, max, cls = '') {
  const p = Math.max(0, Math.min(100, (value / max) * 100));
  return el('div', { className: `meter ${cls}` },
    el('div', { className: 'meter-fill', style: { width: `${p}%` } }),
    el('span', { className: 'meter-text' }, `${Math.round(value)}/${max}`)
  );
}

export function bigButton(label, onClick, extraCls = '') {
  return el('button', { className: `big-btn ${extraCls}`, onclick: onClick }, label);
}

export function panel(title, ...content) {
  return el('div', { className: 'panel' },
    el('div', { className: 'panel-title' }, title),
    el('div', { className: 'panel-body' }, ...content)
  );
}

export function peraQuote(line) {
  if (!line) return null;
  return el('blockquote', { className: 'pera-quote' },
    el('span', { className: 'pera-marker' }, 'Pera Period —'),
    el('span', { className: 'pera-line' }, line)
  );
}

export function infoLine(label, value) {
  return el('div', { className: 'info-line' },
    el('span', { className: 'info-label' }, label),
    el('span', { className: 'info-value' }, value)
  );
}

export function deltaLine(label, before, after, unit = '') {
  const delta = after - before;
  const sign = delta > 0 ? '+' : '';
  const cls = delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : 'delta-flat';
  return el('div', { className: `delta-line ${cls}` },
    el('span', { className: 'd-label' }, label),
    el('span', { className: 'd-before' }, `${Math.round(before * 10) / 10}${unit}`),
    el('span', { className: 'd-arrow' }, '→'),
    el('span', { className: 'd-after' }, `${Math.round(after * 10) / 10}${unit}`),
    el('span', { className: 'd-delta' }, `(${sign}${Math.round(delta * 10) / 10})`)
  );
}
