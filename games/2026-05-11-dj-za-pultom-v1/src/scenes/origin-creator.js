// =============================================================================
// scenes/origin-creator.js — Origin selection scene (Custom DEFAULT)
// =============================================================================
// MOBILE-FIRST (Jova 2026-05-11):
//   - 0 text inputs / 0 textarea / 0 prompt() / 0 word matching
//   - Q3 single_choice + Custom klasa preset picker (4 ponuđena puta)
// =============================================================================
import { el } from '../util.js';
import { bigButton, peraQuote } from '../ui.js';
import { CLASSES_UI_ORDER, CLASS_UI, CLASS_INTRO_TEXT } from '../data/classes.js';
import { ORIGIN_QUESTIONS, CUSTOM_PRESETS } from '../data/origin-questions.js';
import { processOriginCompletion } from '../systems/origin.js';
import { getPeraNudge } from '../systems/pera-period.js';

export function renderOriginCreator(mount, state, transition) {
  const formAnswers = {
    q1_class: 'custom',  // default per Dule Korekcija 2
    q2_observed_djs: null,
    q3_signature_taste: null,        // multiple choice (Jova 2026-05-11)
    q4_first_decks: null,
    q5_apstinencija: 'drustveno',
    custom_preset: null              // izbor iz CUSTOM_PRESETS kad je q1_class='custom'
  };

  function rerenderForm() {
    while (mount.firstChild) mount.removeChild(mount.firstChild);
    mount.appendChild(buildForm());
  }

  function buildForm() {
    return el('div', { className: 'scene origin-scene' },
      el('h2', { className: 'scene-title' }, 'Tvoja prica'),
      el('div', { className: 'intro-text' }, CLASS_INTRO_TEXT),

      // Q1: Class selection — Custom first
      el('div', { className: 'question q1' },
        el('div', { className: 'q-label' }, ORIGIN_QUESTIONS[0].prompt),
        el('div', { className: 'class-grid' },
          ...CLASSES_UI_ORDER.map(key => {
            const ui = CLASS_UI[key];
            const selected = formAnswers.q1_class === key;
            return el('button', {
              className: `class-card ${selected ? 'sel' : ''} ${key === 'custom' ? 'custom-default' : ''}`,
              onclick: () => {
                formAnswers.q1_class = key;
                // reset custom_preset kad korisnik prebaci na non-custom
                if (key !== 'custom') formAnswers.custom_preset = null;
                rerenderForm();
              }
            },
              el('div', { className: 'class-card-label' }, ui.label),
              el('div', { className: 'class-card-tag' }, ui.short),
              el('div', { className: 'class-card-tagline' }, ui.tagline),
              el('div', { className: 'class-card-long' }, ui.long)
            );
          })
        ),
        // Custom preset picker — pojavljuje se samo kad je klasa custom
        formAnswers.q1_class === 'custom'
          ? el('div', { className: 'custom-presets-wrap' },
              el('div', { className: 'custom-presets-prompt' },
                'Izaberi koji put te najvise opisuje:'),
              el('div', { className: 'custom-presets-grid' },
                ...CUSTOM_PRESETS.map(preset => {
                  const sel = formAnswers.custom_preset === preset.key;
                  return el('button', {
                    className: `custom-preset-card ${sel ? 'sel' : ''}`,
                    onclick: () => {
                      formAnswers.custom_preset = preset.key;
                      rerenderForm();
                    }
                  },
                    el('div', { className: 'cp-label' }, preset.label),
                    el('div', { className: 'cp-tag' }, preset.tag),
                    el('div', { className: 'cp-tagline' }, preset.tagline),
                    el('div', { className: 'cp-long' }, preset.long)
                  );
                })
              )
            )
          : null
      ),

      // Q2 — single choice
      questionBlock(ORIGIN_QUESTIONS[1], formAnswers, rerenderForm),

      // Q3 — single choice (bivši free_text — Jova 2026-05-11)
      questionBlock(ORIGIN_QUESTIONS[2], formAnswers, rerenderForm),

      // Q4 — single choice
      questionBlock(ORIGIN_QUESTIONS[3], formAnswers, rerenderForm),

      // Q5 (apstinencija) — single choice
      questionBlock(ORIGIN_QUESTIONS[4], formAnswers, rerenderForm),

      // Submit
      el('div', { className: 'scene-cta' },
        bigButton('Krecem', () => {
          if (!validate(formAnswers)) {
            alert('Molim te odgovori na sva pitanja pre nego sto krenes.');
            return;
          }
          processOriginCompletion(state, formAnswers);
          const teaser = getPeraNudge(state, 'origin_complete');
          transition('macro', { peraTeaser: teaser });
        }, 'btn-primary btn-cta')
      ),

      peraQuote('Sve klase imaju puteve do finala. Razliciti tempovi, ne razliciti ishodi.')
    );
  }

  mount.appendChild(buildForm());
}

function validate(a) {
  if (!a.q1_class) return false;
  // kad je custom — mora i preset
  if (a.q1_class === 'custom' && !a.custom_preset) return false;
  return a.q2_observed_djs && a.q3_signature_taste && a.q4_first_decks && a.q5_apstinencija;
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
