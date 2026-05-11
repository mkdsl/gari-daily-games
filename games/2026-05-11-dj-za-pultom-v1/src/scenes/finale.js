// =============================================================================
// scenes/finale.js — Season finale
// =============================================================================
import { el, clearChildren } from '../util.js';
import { renderHUD, renderSacrificeBar, renderTierGrid, bigButton, peraQuote, panel, infoLine } from '../ui.js';
import { evaluatePaths, getPrimaryPath } from '../systems/path-tracker.js';
import { PATH_UI } from '../data/paths.js';
import { PATHS } from '../config.js';
import { getAvgSetQuality, recklessSuccessRate, clearSave, saveState } from '../state.js';
import { getPecatStatus } from '../systems/pasos.js';

export function renderFinale(mount, state, transition) {
  state.flags.season_completed = true;
  saveState(state);

  const achieved = evaluatePaths(state);
  const primary = getPrimaryPath(achieved);
  const finalePera = primary && PATHS[primary] ? PATHS[primary].pera_finale : null;
  const pecati = getPecatStatus(state);

  mount.appendChild(el('div', { className: 'scene finale-scene' },
    renderHUD(state),
    renderSacrificeBar(state),
    renderTierGrid(state),

    el('h1', null, 'Sezona 1 — kraj'),

    state.flags.tragic_genius
      ? el('div', { className: 'finale-banner tragic' }, 'The Tragic Genius')
      : state.flags.lasting_dj
        ? el('div', { className: 'finale-banner lasting' }, 'The Lasting DJ')
        : null,

    panel('Path-finale',
      primary
        ? el('div', { className: 'primary-path' },
            el('h3', null, PATH_UI[primary]?.label || primary),
            el('div', { className: 'path-tag' }, PATH_UI[primary]?.tag || ''),
            el('div', { className: 'path-desc' }, PATH_UI[primary]?.description || '')
          )
        : el('div', null, 'Nije se zavrsio nijednim putem. Drugi tempo. Drugaciji izbori.')
    ),

    achieved.length > 1
      ? panel('Drugi putevi koje si dotakao',
          ...achieved.filter(p => p !== primary).map(p =>
            el('div', { className: 'path-tag-extra' }, PATH_UI[p]?.label || p)
          )
        )
      : null,

    panel('Sezonski rezime',
      infoLine('Zurke', state.gigs_played.length),
      infoLine('Prosecan set', Math.round(getAvgSetQuality(state))),
      infoLine('Signature pogodak', `${Math.round(recklessSuccessRate(state) * 100)}%`),
      infoLine('Pasos pecati', `${pecati.count} / ${pecati.cap}`),
      infoLine('Reputacijski trenuci', state.path_progress.reputation_events_triggered)
    ),

    peraQuote(finalePera),

    el('div', { className: 'finale-cta' },
      bigButton('Nova karijera (S1 reset)', () => {
        clearSave();
        transition('splash');
      }, 'btn-primary'),
      bigButton('Vidi save (debug)', () => {
        console.log('STATE', state);
        alert('State je u console.');
      }, 'btn-secondary')
    )
  ));
}
