// =============================================================================
// scenes/splash.js — Splash / title screen
// =============================================================================
import { el } from '../util.js';
import { bigButton } from '../ui.js';
import { loadState, clearSave } from '../state.js';
import { VERSION, SEASON } from '../config.js';

export function renderSplash(mount, state, transition) {
  const existing = loadState();

  mount.appendChild(el('div', { className: 'splash' },
    el('h1', { className: 'splash-title' }, 'DJ za Pultom'),
    el('div', { className: 'splash-subtitle' }, `Sezona ${SEASON} · v${VERSION}`),
    el('div', { className: 'splash-mantra' },
      '"DJ ne počinje za pultom. Počinje sa onim što ti je život dao, i sa onim što ne pristaješ da izgubiš dok stigneš."'
    ),
    el('div', { className: 'splash-buttons' },
      existing && !existing.flags?.season_completed && !existing.flags?.season_lost
        ? bigButton(`Nastavi (nedelja ${existing.week})`, () => transition('continue'), 'btn-primary')
        : null,
      bigButton('Nova karijera', () => {
        clearSave();
        transition('new');
      }, 'btn-primary'),
      existing
        ? bigButton('Obriši save', () => {
            clearSave();
            mount.querySelector('.splash-buttons').remove();
            mount.appendChild(el('div', { className: 'splash-info' }, 'Save obrisan. Osveži stranicu.'));
          }, 'btn-secondary')
        : null
    ),
    el('div', { className: 'splash-credits' },
      el('div', null, 'GDD: Mile Mehanika'),
      el('div', null, 'Audio: Ceca Čujka'),
      el('div', null, 'Kod: Jova jQuery'),
      el('div', null, 'Aforizmi: Pera Period'),
      el('div', null, 'UI: Zoki Piksel'),
      el('div', null, 'Dijalog: Sine Scenario')
    )
  ));
}
