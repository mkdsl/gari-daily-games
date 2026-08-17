// ui/tutorial.js — First-run step-by-step tooltip overlay

import { TUTORIAL_DONE_KEY } from '../config.js';

const STEPS = [
  {
    title: 'Korak 1 — Vući karte',
    text:  'Svaka runda dobijaš 3 karte. Svaka karta ima ulogu (Tonac, Host…) i power (1–5).'
  },
  {
    title: 'Korak 2 — Popuni slotove',
    text:  'Klikni kartu pa klikni slot, ili prevuci kartom na slot. Svaka uloga ima jedan slot.'
  },
  {
    title: 'Korak 3 — Sinergija',
    text:  'Neke kombinacije uloga aktiviraju sinergiju i donose bonus Vibe. Eksperimentiši!'
  },
  {
    title: 'Korak 4 — Vibe Score',
    text:  'Tvoj Vibe Score raste po svakoj rundi. Prazni slotovi, niska snaga karte ili prečeste zamjene smanjuju ga. Cilj: 80+ za legendaran nastup!'
  }
];

let _currentStep  = 0;
let _onDoneCallback = null;

/**
 * Show tutorial overlay if first run.
 * @param {boolean} isFirstRun
 * @param {() => void} onDone
 */
export function maybeShowTutorial(isFirstRun, onDone) {
  if (!isFirstRun) { onDone(); return; }
  _onDoneCallback = onDone;
  _currentStep    = 0;
  _renderStep();
}

function _renderStep() {
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) { _finishTutorial(); return; }

  const step = STEPS[_currentStep];
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="tutorial-box">
      <h3 class="tutorial-title">${step.title}</h3>
      <p class="tutorial-text">${step.text}</p>
      <div class="tutorial-progress">${_currentStep + 1} / ${STEPS.length}</div>
      <button id="tutorial-next" class="btn btn-primary">
        ${_currentStep < STEPS.length - 1 ? 'Dalje' : 'Počni igru'}
      </button>
      <button id="tutorial-skip" class="btn btn-ghost">Preskoči</button>
    </div>
  `;

  document.getElementById('tutorial-next')?.addEventListener('click', () => {
    _currentStep++;
    if (_currentStep < STEPS.length) {
      _renderStep();
    } else {
      _finishTutorial();
    }
  });

  document.getElementById('tutorial-skip')?.addEventListener('click', _finishTutorial);
}

function _finishTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) overlay.classList.add('hidden');
  try {
    localStorage.setItem(TUTORIAL_DONE_KEY, 'true');
  } catch { /* ignore */ }
  if (_onDoneCallback) _onDoneCallback();
}
