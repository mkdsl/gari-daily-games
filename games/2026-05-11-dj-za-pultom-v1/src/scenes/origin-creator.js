// =============================================================================
// scenes/origin-creator.js — Origin Selection scene (v2: 9 preseta single list)
// =============================================================================
// V2 (Jova 2026-05-11):
//   - 9 origin preseta u JEDNOJ flat listi (single-column scroll mobile,
//     2-3 col grid desktop) — NEMA kategorija "Klasični/Mladi" visible
//   - Preset izbor zamenjuje stari class + custom_preset tree
//   - Q2-Q5 ostaju kao single-choice
// =============================================================================
import { el } from '../util.js';
import { bigButton, peraQuote } from '../ui.js';
import { ORIGIN_QUESTIONS, ORIGIN_PRESETS, findPreset } from '../data/origin-questions.js';
import { CLASS_INTRO_TEXT } from '../data/classes.js';
import { processOriginCompletion } from '../systems/origin.js';
import { getPeraNudge } from '../systems/pera-period.js';
import { showPeraOverlay } from '../systems/pera-overlay.js';

export function renderOriginCreator(mount, state, transition) {
  const formAnswers = {
    q1_class: 'preset',           // v2: uvek preset
    preset_key: null,             // 1 od 9
    q2_observed_djs: null,
    q3_signature_taste: null,
    q4_first_decks: null,
    q5_apstinencija: null
  };

  function rerenderForm() {
    while (mount.firstChild) mount.removeChild(mount.firstChild);
    mount.appendChild(buildForm());
  }

  function buildForm() {
    return el('div', { className: 'scene origin-scene-v2' },
      el('h2', { className: 'scene-title' }, 'Tvoja priča'),
      el('div', { className: 'intro-text' }, CLASS_INTRO_TEXT),

      // PRESET PICKER — 9 cards u single flat list
      el('div', { className: 'preset-block' },
        el('div', { className: 'q-label' }, 'Šta ti je dalo telo da ovo radiš?'),
        el('div', { className: 'preset-grid-v2' },
          ...ORIGIN_PRESETS.map(preset => {
            const sel = formAnswers.preset_key === preset.key;
            return el('button', {
              className: `preset-card-v2 ${sel ? 'sel' : ''}`,
              onclick: () => {
                formAnswers.preset_key = preset.key;
                rerenderForm();
              }
            },
              el('div', { className: 'pc-label' }, preset.label),
              el('div', { className: 'pc-tag' }, preset.tag),
              el('div', { className: 'pc-tagline' }, preset.tagline),
              el('div', { className: 'pc-long' }, preset.long)
            );
          })
        )
      ),

      // Q2 — single choice
      questionBlock(ORIGIN_QUESTIONS[1], formAnswers, rerenderForm),
      // Q3 — single choice
      questionBlock(ORIGIN_QUESTIONS[2], formAnswers, rerenderForm),
      // Q4 — single choice
      questionBlock(ORIGIN_QUESTIONS[3], formAnswers, rerenderForm),
      // Q5 — single choice
      questionBlock(ORIGIN_QUESTIONS[4], formAnswers, rerenderForm),

      // Submit
      el('div', { className: 'scene-cta' },
        bigButton('Krećem', () => {
          if (!validate(formAnswers)) {
            showInlineError(mount, 'Izaberi početak i odgovori na pitanja pre nego što kreneš.');
            return;
          }
          processOriginCompletion(state, formAnswers);
          const teaser = getPeraNudge(state, 'origin_complete');
          if (teaser) showPeraOverlay(state, teaser);
          transition('macro', { peraTeaser: teaser });
        }, 'btn-primary btn-cta')
      ),

      peraQuote('Sve klase imaju puteve do finala. Različiti tempovi, ne različiti ishodi.')
    );
  }

  mount.appendChild(buildForm());
}

function validate(a) {
  if (!a.preset_key) return false;
  return a.q2_observed_djs && a.q3_signature_taste && a.q4_first_decks && a.q5_apstinencija;
}

function showInlineError(mount, msg) {
  let err = mount.querySelector('.inline-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'inline-error';
    mount.querySelector('.scene-cta')?.appendChild(err);
  }
  err.textContent = msg;
}

function questionBlock(q, formAnswers, rerender) {
  return el('div', { className: `question ${q.id}` },
    el('div', { className: 'q-label' }, q.prompt),
    el('div', { className: 'q-options' },
      ...q.options.map(opt => {
        const selected = formAnswers[q.key] === opt.value;
        return el('button', {
          className: `q-option ${selected ? 'sel' : ''}`,
          onclick: () => {
            formAnswers[q.key] = opt.value;
            rerender();
          }
        }, opt.label);
      })
    )
  );
}
