// =============================================================================
// scenes/origin-creator.js — Origin selection scene (Custom DEFAULT)
// =============================================================================
import { el } from '../util.js';
import { bigButton, peraQuote } from '../ui.js';
import { CLASSES_UI_ORDER, CLASS_UI, CLASS_INTRO_TEXT } from '../data/classes.js';
import { ORIGIN_QUESTIONS } from '../data/origin-questions.js';
import { processOriginCompletion } from '../systems/origin.js';
import { getPeraNudge } from '../systems/pera-period.js';

export function renderOriginCreator(mount, state, transition) {
  const formAnswers = {
    q1_class: 'custom',  // default per Dule Korekcija 2
    q2_observed_djs: null,
    q3_signature_taste: '',
    q4_first_decks: null,
    q5_apstinencija: 'drustveno',
    custom_text: ''
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
        formAnswers.q1_class === 'custom'
          ? el('div', { className: 'custom-text-wrap' },
              el('div', { className: 'custom-text-prompt' }, 'Napisi par recenica o tvojoj pozadini (sistem cita):'),
              el('textarea', {
                className: 'custom-text-area',
                placeholder: 'npr. "Rodjen sam u Borci, otac radio na gradilistu, gledao sam starije iz krv kako pustaju na proslavama..."',
                maxlength: 1000,
                rows: 4,
                oninput: (e) => { formAnswers.custom_text = e.target.value; }
              })
            )
          : null
      ),

      // Q2
      questionBlock(ORIGIN_QUESTIONS[1], formAnswers, rerenderForm),

      // Q3 — free text
      el('div', { className: 'question q3' },
        el('div', { className: 'q-label' }, ORIGIN_QUESTIONS[2].prompt),
        el('input', {
          type: 'text',
          className: 'free-text',
          placeholder: ORIGIN_QUESTIONS[2].placeholder,
          maxlength: ORIGIN_QUESTIONS[2].max_length,
          oninput: (e) => { formAnswers.q3_signature_taste = e.target.value; }
        })
      ),

      // Q4
      questionBlock(ORIGIN_QUESTIONS[3], formAnswers, rerenderForm),

      // Q5 (apstinencija)
      questionBlock(ORIGIN_QUESTIONS[4], formAnswers, rerenderForm),

      // Submit
      el('div', { className: 'scene-cta' },
        bigButton('Krecem', () => {
          if (!validate(formAnswers)) {
            alert('Molim te odgovori na Q2, Q4, Q5 pre nego sto krenes.');
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
  return a.q1_class && a.q2_observed_djs && a.q4_first_decks && a.q5_apstinencija;
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
