/**
 * @module etapa3-skretanje — tri table DOM, choice logic
 */
import { STAGE_COLORS, ROUTES } from '../../config.js';
import { selectRoute } from '../../systems/branching.js';
import { finalizeEtapa3 } from '../../systems/pripremljenost.js';
import { createBranaCard } from '../characters.js';
import { saveState } from '../../state.js';

let _cleanup = null;

/**
 * @param {HTMLElement} container
 * @param {Object} state
 * @param {{next: Function}} callbacks
 */
export function mount(container, state, callbacks) {
  _applyCSS();
  const c = STAGE_COLORS[3];

  container.style.cssText = `
    background:${c.bg}; color:${c.text}; font-family:system-ui,sans-serif;
    position:relative; overflow:hidden; height:100%;
  `;

  container.innerHTML = `
    <div class="e3-wrap">
      <div class="e3-label">Etapa 3 — Odabir puta</div>

      <div class="e3-road-scene">
        <div class="e3-divider"></div>
      </div>

      <div class="e3-brana-strip">
        🌳 <em>Brana: "Sve tri staze vode do nas — pitanje je samo kakav si raspoložen da stigneš."</em>
      </div>

      <div class="e3-signs" id="e3-signs">
        ${Object.entries(ROUTES).map(([key, r]) => `
          <button class="e3-sign" data-route="${key}">
            <span class="e3-sign-icon">${r.icon}</span>
            <span class="e3-sign-text">
              <strong>${r.label}</strong>
              <span class="e3-sign-desc">${r.desc}</span>
            </span>
          </button>
        `).join('')}
      </div>

      <div id="e3-brana-popup" class="e3-brana-popup" hidden></div>
    </div>
  `;

  const signsEl   = container.querySelector('#e3-signs');
  const branaPopup = container.querySelector('#e3-brana-popup');
  const signs     = signsEl.querySelectorAll('.e3-sign');

  signs.forEach(sign => {
    sign.addEventListener('pointerdown', () => {
      const route = sign.dataset.route;

      // Tilt animation
      sign.classList.add('tilt');
      setTimeout(() => sign.classList.remove('tilt'), 420);

      // Highlight + disable
      signs.forEach(s => { s.disabled = true; s.style.opacity = '0.55'; });
      sign.style.opacity = '1';
      sign.style.outline = `3px solid ${c.accent}`;

      if (route === 'slikovitije') {
        branaPopup.hidden = false;
        branaPopup.innerHTML = '';
        branaPopup.appendChild(createBranaCard([
          'A, "Slikovitiji put"!',
          'Prođeš kroz Obrenovac, pa skratiš kod Umke.',
          'Ja sam taj put išao sa traktorom — 2 sata, ali slike vrede.'
        ]));
        setTimeout(() => _proceed(route, callbacks, saveState, branaPopup), 2600);
      } else if (route === 'brze') {
        _showToast(container, 'Kraća ruta — vidiš se u šumskom putu.', () => _proceed(route, callbacks, saveState));
      } else {
        _showToast(container, 'Poznata ruta — pažljivo napred.', () => _proceed(route, callbacks, saveState));
      }
    });
  });

  _cleanup = () => {};
  return _cleanup;
}

function _showToast(container, message, onDone) {
  const toast = document.createElement('div');
  toast.className = 'e3-toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    onDone();
  }, 1500);
}

function _proceed(route, callbacks, saveState, popupEl) {
  selectRoute(route);
  finalizeEtapa3(route);
  saveState();
  if (popupEl) popupEl.hidden = true;
  callbacks.next();
}

export function unmount(container) {
  if (_cleanup) { _cleanup(); _cleanup = null; }
  container.innerHTML = '';
}

function _applyCSS() {
  if (document.getElementById('etapa3-css')) return;
  const s = document.createElement('style');
  s.id = 'etapa3-css';
  s.textContent = `
    .e3-wrap {
      display:flex; flex-direction:column; height:100%; padding:1rem; gap:0.8rem;
    }
    .e3-label { font-size:0.78rem; opacity:0.6; }
    .e3-road-scene {
      height:54px; background:#b8c88a; border-radius:8px; position:relative; overflow:hidden;
    }
    .e3-divider {
      position:absolute; top:50%; left:0; right:0; height:4px;
      background:repeating-linear-gradient(to right,#5a7a2a 0 18px,transparent 18px 36px);
      transform:translateY(-50%);
    }
    .e3-brana-strip {
      background:rgba(90,122,42,0.2); border-radius:6px;
      padding:0.5rem 0.75rem; font-size:0.82rem; color:#2a2a1a;
    }
    .e3-signs { flex:1; display:flex; flex-direction:column; gap:0.7rem; justify-content:center; }
    .e3-sign {
      display:flex; align-items:center; gap:0.8rem;
      background:#f5f0c0; border:2px solid #c8c060; border-radius:10px;
      padding:0.85rem 1rem; cursor:pointer; width:100%; color:#2a2a1a;
      text-align:left; transition:transform 0.15s;
    }
    .e3-sign:not(:disabled):active { transform:scale(0.97); }
    .e3-sign.tilt { animation:signTilt 0.42s ease; }
    .e3-sign-icon { font-size:1.7rem; flex-shrink:0; }
    .e3-sign-text { display:flex; flex-direction:column; gap:0.1rem; }
    .e3-sign-desc { font-size:0.75rem; opacity:0.7; }
    .e3-brana-popup {
      position:absolute; bottom:1rem; left:1rem; right:1rem; z-index:40;
    }
    @keyframes signTilt {
      0%  { transform:rotate(0deg); }
      25% { transform:rotate(-5deg); }
      75% { transform:rotate(5deg); }
      100%{ transform:rotate(0deg); }
    }
    .e3-toast {
      position:absolute; bottom:5rem; left:50%; transform:translateX(-50%);
      background:rgba(42,42,26,0.92); color:#f5f0c0; border-radius:8px;
      padding:0.65rem 1.2rem; font-size:0.9rem; white-space:nowrap;
      z-index:50; animation:e3toastIn 0.25s ease;
    }
    @keyframes e3toastIn {
      from { opacity:0; transform:translateX(-50%) translateY(8px); }
      to   { opacity:1; transform:translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(s);
}
