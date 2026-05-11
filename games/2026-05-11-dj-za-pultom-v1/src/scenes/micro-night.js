// =============================================================================
// scenes/micro-night.js — Žurka (Micro layer) — PLACEHOLDER simplified
// =============================================================================
import { el, clearChildren } from '../util.js';
import { renderHUD, renderSacrificeBar, bigButton, panel, peraQuote, infoLine } from '../ui.js';
import { simulateSet, getDesyncTimer } from '../systems/micro.js';
import { saveState } from '../state.js';
import { getPeraNudge } from '../systems/pera-period.js';
import { isUnlocked as isRecklessUnlocked } from '../systems/vector-reckless.js';
import {
  resumeOnUserGesture, startSet, applyTransition, applyHalfBeatDelay,
  getEngine, isAudioReady
} from '../audio.js';
import { getDesyncProfile } from '../systems/cinematic-audio.js';
import { triggerOverlay } from '../systems/pera-overlay.js';

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
              el('label', null, 'Signature pick — koliko puta: '),
              el('input', {
                type: 'number', min: 0, max: 5, value: choices.attempt_signatures,
                onchange: e => { choices.attempt_signatures = Number(e.target.value); }
              })
            )
          : el('div', { className: 'hint locked' },
              'Reckless Selection jos zakljucana.'
            )
      ),

      panel('Stanje',
        infoLine('Health', `${Math.round(state.sacrifice.health)}%`),
        infoLine('Mixing tier', `${Math.floor(state.stats.mixing)}/7`),
        infoLine('Svezina kataloga', `${Math.round(state.music_catalog.avg_freshness * 100)}%`),
        infoLine('De-sync timer', `~${getDesyncTimer(state)}s`)
      ),

      bigButton('Idi za pult', async () => {
        // Audio: resume AudioContext iz user gesture (iOS Safari requirement),
        // start set ako su tracks dostupni. Setlist se za sad konstruiše iz
        // music_catalog tracks; placeholder fallback je prazan setlist.
        await resumeOnUserGesture();
        const energyLevel = { low: 0.25, normal: 0.5, high: 0.75, max: 1.0 }[choices.effort] ?? 0.5;
        const setlist = buildSetlistFromCatalog(state);
        if (isAudioReady() && setlist.length > 0) {
          startSet(setlist, energyLevel);
        }

        setResult = simulateSet(state, choices);

        // Audio: half-beat delay kao default transition effect tokom result faze
        // (šef brief: "delay daje brzinu i urgentnost u prelazu")
        const eng = getEngine();
        if (eng) {
          const deckA = eng.getDeck && eng.getDeck('A');
          if (deckA) {
            const intensity = setResult.canceled ? 0 : Math.min(1, 0.3 + (setResult.quality / 150) * 0.5);
            applyHalfBeatDelay(deckA, intensity);
          }
        }

        // Substance de-sync audio cue (anti-stylish per Nega)
        const activeSubs = state.substance?.active_substances || [];
        if (eng && activeSubs.length > 0) {
          const profile = getDesyncProfile(activeSubs);
          const deckA = eng.getDeck && eng.getDeck('A');
          if (deckA) {
            // Drift = mali pomak tempa (BPM creep) — predstavlja distorziju tempa
            try {
              if (deckA.setPlaybackRate) {
                const drift = 1 + (Math.random() - 0.5) * 2 * profile.drift_pct;
                deckA.setPlaybackRate(drift);
              }
              if (profile.chaos > 0.3 && deckA.applyHalfBeatDelay) {
                // Psihodelici: extra delay layering
                deckA.applyHalfBeatDelay(Math.min(1, profile.chaos + 0.3));
              }
            } catch (err) { /* silent */ }
          }
        }

        // Pera komentar
        if (setResult.canceled) {
          peraLine = getPeraNudge(state, 'symptom_health_red');
        } else if (setResult.quality > 80) {
          peraLine = getPeraNudge(state, 'set_high');
        } else if (setResult.quality < 40) {
          peraLine = getPeraNudge(state, 'set_low');
        } else {
          peraLine = getPeraNudge(state, 'observation_neutral');
        }
        if (peraLine) triggerOverlay(state, peraLine.startsWith('SET:') ? 'set_high' : 'observation_neutral');
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
            'Telo je odgovorilo umesto tebe.'
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

// =============================================================================
// Setlist constructor (placeholder)
// =============================================================================
// V1: vrača prazan array — engine je inicijalizovan ali nema realnih track-ova
// dok šef ne dropne OGG opus fajlove sa BPM-KEY-name-BARS.opus naming-om.
// Kad budu, jednostavno populisati `tracks` array sa {url, bpm, key, name, bars}.
function buildSetlistFromCatalog(state) {
  // TODO (post-Ceca asset drop): vraćaj real setlist iz state.music_catalog
  // Privremeno — ostavljamo prazno, audio engine init i half-beat delay
  // logika su funkcionalne ali bez actual playback-a.
  return [];
}
