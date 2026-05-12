// =============================================================================
// scenes/splash-cinematic.js — Cinematic A hook (Joca UI Spec S1 v2)
// =============================================================================
// Flow:
//   0.0s — crn screen
//   0.5s — dub bass kreće (procedural Web Audio sine sub-bass loop)
//   2.5s — 1 rečenica fade-in (Pera Period cinematic_hook)
//   3.0s — 2 button-a fade-in: "Pojačaj" i "Slušaj još"
//   prvi klik → fade out → Origin Creator
//   30s auto-move ako igrač ne klikne
// =============================================================================
import { el, clearChildren } from '../util.js';
import { selectAforizam } from '../data/aforizmi.js';
import { initAudioEngine, resumeOnUserGesture } from '../audio.js';
import { startCinematicBass, stopCinematicBass } from '../systems/cinematic-audio.js';
import { VERSION, SEASON } from '../config.js';
import { saveState } from '../state.js';

export function renderSplashCinematic(mount, state, transition) {
  // If user already finished cinematic once → skip to classic splash
  if (state.settings?.first_run_done) {
    return renderClassicSplash(mount, state, transition);
  }

  clearChildren(mount);

  const scene = el('div', { className: 'cinematic-scene' },
    el('div', { className: 'cinematic-veil' }),  // dark fade overlay
    el('div', { className: 'cinematic-content' },
      el('div', { className: 'cinematic-line', id: 'cine-line' },
        selectAforizam(state, 'cinematic_hook') ||
          'Niko ne počinje za pultom. Počinje od onoga što mu je život ostavio na podu.'
      ),
      el('div', { className: 'cinematic-buttons', id: 'cine-buttons' },
        bigCineButton('Pojačaj', () => proceed('amplify')),
        bigCineButton('Slušaj još', () => proceed('listen_more'))
      )
    ),
    el('div', { className: 'cinematic-version' }, `Sezona ${SEASON} · v${VERSION}`)
  );

  mount.appendChild(scene);

  // Audio: kick off dub bass procedural after first user gesture (iOS guard).
  // Da bismo izbegli AudioContext blocking, dub bass startuje SAMO posle prvog
  // dodira/klika bilo gde na ekranu (ne mora biti na button-u).
  let bassStarted = false;
  const tryStart = async () => {
    if (bassStarted) return;
    bassStarted = true;
    try {
      await initAudioEngine();
      await resumeOnUserGesture();
      startCinematicBass();
    } catch (e) {
      console.warn('[cinematic] bass start failed', e);
    }
  };
  scene.addEventListener('click', tryStart, { once: true });
  scene.addEventListener('touchstart', tryStart, { once: true, passive: true });

  // Animations — guard against non-browser env (boot-trace)
  const raf = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame : (cb) => setTimeout(cb, 16);
  raf(() => {
    if (scene.classList && scene.classList.add) scene.classList.add('cine-fade-veil');
    setTimeout(() => {
      const line = document.getElementById('cine-line');
      if (line && line.classList && line.classList.add) line.classList.add('cine-show');
    }, 2000);
    setTimeout(() => {
      const btns = document.getElementById('cine-buttons');
      if (btns && btns.classList && btns.classList.add) btns.classList.add('cine-show');
    }, 2700);
  });

  // Auto-move after 30s
  const autoTimer = setTimeout(() => proceed('auto'), 30000);

  function proceed(reason) {
    clearTimeout(autoTimer);
    state.settings = state.settings || {};
    state.settings.first_run_done = true;
    state.cinematic_choice = reason;  // za naratorske callback-e kasnije
    saveState(state);

    // Fade out
    if (scene && scene.classList && scene.classList.add) {
      scene.classList.add('cine-fade-out');
    }
    try { stopCinematicBass(2.0); } catch (e) { /* ignore */ }

    setTimeout(() => {
      transition('origin');
    }, 1500);
  }
}

function bigCineButton(label, onClick) {
  return el('button', {
    className: 'cine-btn',
    onclick: onClick
  }, label);
}

// =============================================================================
// Classic splash (posle prvog runa, ili kad postoji save)
// =============================================================================
function renderClassicSplash(mount, state, transition) {
  // Lazy import da izbegnemo cycle
  import('./splash.js').then(({ renderSplash }) => {
    renderSplash(mount, state, transition);
  });
}
