// =============================================================================
// scenes/micro-night.js — Žurka (Micro layer) — PLACEHOLDER simplified
// =============================================================================
import { el, clearChildren } from '../util.js';
import { renderHUD, renderSacrificeBar, bigButton, panel, peraQuote, infoLine } from '../ui.js';
import { simulateSet, getDesyncTimer } from '../systems/micro.js';
import { saveState } from '../state.js';
import { getPeraNudge } from '../systems/pera-period.js';
import { isUnlocked as isRecklessUnlocked } from '../systems/vector-reckless.js';

export function renderMicroNight(mount, state, transition) {
  const choices = {
    effort: 'normal',
    pre_drinks: 0,
    attempt_signatures: 0
  };
  let setResult = null;
  let peraLine = null;

  function build() {
    clearChildren(mount);
    if (setResult === null) {
      mount.appendChild(buildPrepUI());
    } else {
      mount.appendChild(buildResultsUI());
    }
  }

  function buildPrepUI() {
    const recklessReady = isRecklessUnlocked(state);
    return el('div', { className: 'scene micro-scene' },
      renderHUD(state),
      el('h2', null, `Zurka — nedelja ${state.week}`),
      el('div', { className: 'micro-placeholder-note' },
        'Micro layer V1: SIMPLIFIED PLACEHOLDER. ',
        'Diner Dash 2-deck beat-tap mechanic dolazi u sledecu iteraciju kad Ceca audio engine bude integrisan.'
      ),

      panel('Tvoj plan za set',
        el('div', null,
          el('label', null, 'Effort level: '),
          el('select', {
            onchange: e => { choices.effort = e.target.value; }
          },
            ['low', 'normal', 'high', 'max'].map(v =>
              el('option', { value: v, selected: choices.effort === v }, v)
            )
          )
        ),
        el('div', null,
          el('label', null, 'Pivo pre seta: '),
          el('input', {
            type: 'number', min: 0, max: 10, value: choices.pre_drinks,
            onchange: e => { choices.pre_drinks = Number(e.target.value); }
          })
        ),
        recklessReady
          ? el('div', null,
              el('label', null, 'Signature pick attempts: '),
              el('input', {
                type: 'number', min: 0, max: 5, value: choices.attempt_signatures,
                onchange: e => { choices.attempt_signatures = Number(e.target.value); }
              }),
              el('span', { className: 'hint' }, ` (Knowledge tier ${Math.floor(state.stats.knowledge)} — gating ≥ 2 ✓)`)
            )
          : el('div', { className: 'hint locked' },
              'Reckless Selection zakljucana (potrebno Knowledge tier 2+).'
            )
      ),

      panel('Stanje',
        infoLine('Health', `${Math.round(state.sacrifice.health)}%`),
        infoLine('Mixing tier', `${Math.floor(state.stats.mixing)}/7`),
        infoLine('Music katalog svezina', `${Math.round(state.music_catalog.avg_freshness * 100)}%`),
        infoLine('De-sync timer ce krenuti', `~${getDesyncTimer(state)}s (placeholder — nije live u V1)`)
      ),

      bigButton('Idi za pult', () => {
        setResult = simulateSet(state, choices);
        // Pera komentar
        if (setResult.canceled) {
          peraLine = getPeraNudge(state, 'health_low');
        } else if (setResult.quality > 80) {
          peraLine = getPeraNudge(state, 'set_high');
        } else if (setResult.quality < 40) {
          peraLine = getPeraNudge(state, 'set_low');
        } else {
          peraLine = getPeraNudge(state, 'observation_neutral');
        }
        saveState(state);
        build();
      }, 'btn-primary btn-cta')
    );
  }

  function buildResultsUI() {
    return el('div', { className: 'scene micro-results' },
      renderHUD(state),
      renderSacrificeBar(state),
      el('h2', null, setResult.canceled ? 'Zurka otkazana' : 'Set odsviran'),
      setResult.canceled
        ? el('div', { className: 'cancel-note' },
            'Health je u zoni gde telo odgovara umesto tebe. Reputation -1.'
          )
        : panel('Rezultat',
            infoLine('Set quality', Math.round(setResult.quality) + ' / 150'),
            infoLine('Gig fee', setResult.gigFee + ' RSD'),
            infoLine('RSVP delta', (setResult.rsvpDelta >= 0 ? '+' : '') + setResult.rsvpDelta),
            infoLine('Reputation delta', (setResult.reputationDelta >= 0 ? '+' : '') + setResult.reputationDelta.toFixed(2)),
            infoLine('Recogn. delta', (setResult.recogDelta >= 0 ? '+' : '') + setResult.recogDelta.toFixed(2)),
            setResult.sigAttempts > 0
              ? infoLine('Signature picks', `${setResult.sigSuccessCount}/${setResult.sigAttempts} uspeh`)
              : null,
            infoLine('De-sync sekundi', setResult.desyncSeconds)
          ),

      peraQuote(peraLine),

      bigButton('Nedelja zakljucena', () => {
        transition('recap', { setResult, peraLine });
      }, 'btn-primary btn-cta')
    );
  }

  build();
}
