// =============================================================================
// ui.js — UI components (v2 — simptomatski HUD, color zones default)
// =============================================================================
// V2 (Jova 2026-05-11):
//   - Money brojevno (uvek vidljivo)
//   - Health/Odnosi/Normalnost — color zone (zelena/zuta/crvena), broj samo ako numeric_mode ON
//   - Knowledge — "polica sa plocama" vizuelni metafor (tier 0-7 = broj ploca)
//   - Network — krug silueta (count = tier+1)
//   - Energija — uze/struna (puknuta na low)
//   - Reckless — muzicki zastitni znak (zvezda)
// =============================================================================
import { el, formatRSD } from './util.js';
import { WEEKS_PER_SEASON } from './config.js';

export function renderHUD(state) {
  const num = !!state.settings?.numeric_mode;

  return el('div', { className: 'hud hud-v2' },
    el('div', { className: 'hud-row hud-week' },
      el('span', { className: 'hud-label' }, 'Nedelja'),
      el('span', { className: 'hud-value' }, `${state.week} / ${WEEKS_PER_SEASON}`)
    ),
    el('div', { className: 'hud-row hud-money' },
      el('span', { className: 'hud-label' }, 'Pare'),
      el('span', { className: 'hud-value money' }, formatRSD(state.money))
    ),
    renderEnergyMetaphor(state, num),
    renderRSVPSilhouettes(state, num),
    el('div', { className: 'hud-row hud-class' },
      el('span', { className: 'hud-label' }, 'Origin'),
      el('span', { className: 'hud-value class-name' }, state.origin.preset_label || state.origin.class_name || '—')
    )
  );
}

// Energija = uže/struna metafor
function renderEnergyMetaphor(state, num) {
  const e = state.energy / 100;
  let condition = 'tight';   // uže napregnuto
  let icon = '═';            // hum
  if (e > 0.8)      { condition = 'tight';    icon = '═══════'; }
  else if (e > 0.6) { condition = 'taut';     icon = '══════·'; }
  else if (e > 0.4) { condition = 'loose';    icon = '═════··'; }
  else if (e > 0.2) { condition = 'fraying';  icon = '═══····'; }
  else              { condition = 'broken';   icon = '══···  '; }

  return el('div', { className: `hud-row hud-energy condition-${condition}` },
    el('span', { className: 'hud-label' }, 'Uze'),
    el('span', { className: 'hud-rope' }, icon),
    num ? el('span', { className: 'hud-numeric' }, `${Math.round(state.energy)}/100`) : null
  );
}

// RSVP = krug silueta
function renderRSVPSilhouettes(state, num) {
  const rsvp = Math.round(state.rsvp_next);
  let silhouettes = '';
  const count = Math.min(7, Math.floor(rsvp / 15));
  for (let i = 0; i < count; i++) silhouettes += '☺';
  if (silhouettes.length === 0) silhouettes = '·';

  return el('div', { className: 'hud-row hud-rsvp' },
    el('span', { className: 'hud-label' }, 'RSVP'),
    el('span', { className: 'hud-circle' }, silhouettes),
    num ? el('span', { className: 'hud-numeric' }, `${rsvp}`) : null
  );
}

export function renderSacrificeBar(state) {
  const num = !!state.settings?.numeric_mode;
  return el('div', { className: 'sacrifice-bar sac-v2' },
    renderSymptomTile('Telo',       state.sacrifice.health,     'kako se osecas', num),
    renderSymptomTile('Odnosi',     state.sacrifice.odnosi,     'ko te jos zove', num),
    renderSymptomTile('Normalnost', state.sacrifice.normalnost, 'svet van muzike', num)
  );
}

function renderSymptomTile(label, value, sub, num) {
  const zone = zoneFor(value);
  // Symbolic state (no numbers default)
  return el('div', { className: `symptom-tile zone-${zone.id}` },
    el('div', { className: 'sym-label' }, label),
    el('div', { className: 'sym-icon' }, zone.icon),
    el('div', { className: 'sym-sub' }, sub),
    num ? el('div', { className: 'sym-numeric' }, `${Math.round(value)}%`) : null
  );
}

function zoneFor(value) {
  if (value > 75) return { id: 'green',  label: 'mir',       icon: '●' };
  if (value > 50) return { id: 'yellow', label: 'pripaze',   icon: '◐' };
  if (value > 25) return { id: 'orange', label: 'crveno se javlja', icon: '◑' };
  return            { id: 'red',    label: 'pucanje',   icon: '◯' };
}

export function renderTierGrid(state) {
  const num = !!state.settings?.numeric_mode;
  return el('div', { className: 'tier-grid tier-v2' },
    knowledgeShelf(state, num),
    mixingSliderMetaphor(state, num),
    visualShirts(state, num),
    networkSilhouettes(state, num),
    recognizabilityRipple(state, num),
    reputationStar(state, num)
  );
}

// Knowledge = polica sa pločama (tier 0-7 = broj ploča)
function knowledgeShelf(state, num) {
  const tier = Math.floor(state.stats.knowledge);
  let plocas = '';
  for (let i = 0; i < tier; i++) plocas += '◤';
  if (plocas === '') plocas = '·';
  return el('div', { className: 'tier-card tc-knowledge' },
    el('div', { className: 'tc-label' }, 'Knowledge'),
    el('div', { className: 'tc-icon shelf' }, plocas),
    num ? el('div', { className: 'tc-numeric' }, `${tier}/7`) : null
  );
}

// Mixing = slider metafor (tier 0-7)
function mixingSliderMetaphor(state, num) {
  const tier = Math.floor(state.stats.mixing);
  const dots = ['○', '○', '○', '○', '○', '○', '○'];
  for (let i = 0; i < tier; i++) dots[i] = '●';
  return el('div', { className: 'tier-card tc-mixing' },
    el('div', { className: 'tc-label' }, 'Mixing'),
    el('div', { className: 'tc-icon slider' }, dots.join('')),
    num ? el('div', { className: 'tc-numeric' }, `${tier}/7`) : null
  );
}

// Visual = kosulja icons
function visualShirts(state, num) {
  const tier = Math.floor(state.stats.visual);
  let s = '';
  for (let i = 0; i < tier; i++) s += '◇';
  return el('div', { className: 'tier-card tc-visual' },
    el('div', { className: 'tc-label' }, 'Izgled'),
    el('div', { className: 'tc-icon shirts' }, s || '·'),
    num ? el('div', { className: 'tc-numeric' }, `${tier}/7`) : null
  );
}

// Network = krug silueta
function networkSilhouettes(state, num) {
  const tier = Math.floor(state.stats.network);
  let s = '';
  for (let i = 0; i < tier; i++) s += '☻';
  return el('div', { className: 'tier-card tc-network' },
    el('div', { className: 'tc-label' }, 'Network'),
    el('div', { className: 'tc-icon people-circle' }, s || '·'),
    num ? el('div', { className: 'tc-numeric' }, `${tier}/7`) : null
  );
}

// Recognizability = ripple
function recognizabilityRipple(state, num) {
  const tier = Math.floor(state.stats.recognizability);
  let s = '';
  for (let i = 0; i < tier; i++) s += '~';
  return el('div', { className: 'tier-card tc-recog' },
    el('div', { className: 'tc-label' }, 'Recog.'),
    el('div', { className: 'tc-icon ripple' }, s || '·'),
    num ? el('div', { className: 'tc-numeric' }, `${tier}/7`) : null
  );
}

// Reputation = zvezda count
function reputationStar(state, num) {
  const tier = Math.floor(state.stats.reputation);
  let s = '';
  for (let i = 0; i < tier; i++) s += '★';
  return el('div', { className: 'tier-card tc-rep' },
    el('div', { className: 'tc-label' }, 'Reputacija'),
    el('div', { className: 'tc-icon stars' }, s || '·'),
    num ? el('div', { className: 'tc-numeric' }, `${tier}/7`) : null
  );
}

// Backwards-compat
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
