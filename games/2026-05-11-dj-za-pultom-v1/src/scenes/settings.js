// =============================================================================
// scenes/settings.js — Settings scene (Numeric Mode toggle + ostale postavke)
// =============================================================================
import { el } from '../util.js';
import { bigButton } from '../ui.js';
import { saveState } from '../state.js';
import { stopCinematicBass } from '../systems/cinematic-audio.js';

export function renderSettings(mount, state, transition) {
  state.settings = state.settings || {};

  function rerender() {
    while (mount.firstChild) mount.removeChild(mount.firstChild);
    mount.appendChild(build());
  }

  function build() {
    return el('div', { className: 'scene settings-scene' },
      el('h2', { className: 'scene-title' }, 'Postavke'),

      // Numeric Mode toggle
      el('div', { className: 'setting-row' },
        el('label', { className: 'toggle-row' },
          el('input', {
            type: 'checkbox',
            checked: !!state.settings.numeric_mode,
            onchange: e => {
              state.settings.numeric_mode = e.target.checked;
              saveState(state);
              rerender();
            }
          }),
          el('span', { className: 'toggle-label' }, 'Pokaži brojeve'),
          el('span', { className: 'toggle-hint' },
            'Podrazumevano isključeno — svi pokazatelji su simptomatski (boja, krug, polica). Uključeno otkriva 0-100% za statove.'
          )
        )
      ),

      // Audio toggle
      el('div', { className: 'setting-row' },
        el('label', { className: 'toggle-row' },
          el('input', {
            type: 'checkbox',
            checked: state.settings.audio_enabled !== false,
            onchange: e => {
              state.settings.audio_enabled = e.target.checked;
              if (!e.target.checked) stopCinematicBass(0.3);
              saveState(state);
              rerender();
            }
          }),
          el('span', { className: 'toggle-label' }, 'Zvuk'),
          el('span', { className: 'toggle-hint' }, 'Dub bass + set zvuk (preporuka uključeno za Cinematic A).')
        )
      ),

      // Pera overlay toggle
      el('div', { className: 'setting-row' },
        el('label', { className: 'toggle-row' },
          el('input', {
            type: 'checkbox',
            checked: !state.settings.pera_overlay_off,
            onchange: e => {
              state.settings.pera_overlay_off = !e.target.checked;
              saveState(state);
              rerender();
            }
          }),
          el('span', { className: 'toggle-label' }, 'Pera Period titl'),
          el('span', { className: 'toggle-hint' }, 'Pri dnu ekrana, javlja se posle ključnog događaja.')
        )
      ),

      // Reset cinematic flag (za testing)
      el('div', { className: 'setting-row' },
        el('button', {
          className: 'btn-secondary',
          onclick: () => {
            state.settings.first_run_done = false;
            saveState(state);
            transition('cinematic');
          }
        }, 'Replay Cinematic A')
      ),

      // Back
      el('div', { className: 'settings-back' },
        bigButton('Nazad', () => transition('macro'), 'btn-primary')
      )
    );
  }

  mount.appendChild(build());
}
