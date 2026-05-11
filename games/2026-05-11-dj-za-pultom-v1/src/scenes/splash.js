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
      '"DJ ne pocinje za pultom. DJ pocinje sa onim sto ti je zivot dao, ',
      'i onim sto ti je dragog dovoljno da to ne izgubis dok stignes."'
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
        ? bigButton('Obrisi save', () => {
            clearSave();
            mount.querySelector('.splash-buttons').remove();
            mount.appendChild(el('div', { className: 'splash-info' }, 'Save obrisan. Osvezi stranicu.'));
          }, 'btn-secondary')
        : null
    ),
    el('div', { className: 'splash-credits' },
      el('div', null, 'GDD: Mile Mehanika'),
      el('div', null, 'Audio engine: Ceca Cujka (placeholder)'),
      el('div', null, 'Implementacija: Jova jQuery'),
      el('div', null, 'Aforizmi placeholder: Pera Period (full set sutra)'),
      el('div', null, 'UI mockups: Zoki Piksel (pending)'),
      el('div', null, 'NPC dialog: Sine Scenario (pending)')
    )
  ));
}
