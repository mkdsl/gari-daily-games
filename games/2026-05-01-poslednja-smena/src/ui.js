/**
 * ui.js — DOM manager za narativnu igru "Poslednja Smena"
 *
 * Upravlja prikazom scena, opcija i epilog kartice.
 * Nema game loop — sve je event-driven (klik/tap na opcije).
 *
 * @module ui
 */

import { CONFIG } from './config.js';
import { drawIllustration } from './render.js';

// ─── DOM reference cache ──────────────────────────────────────────────────────

/** @type {HTMLCanvasElement} */
let canvasEl;
/** @type {CanvasRenderingContext2D} */
let ctx;
/** @type {HTMLElement} */
let sceneContainer;
/** @type {HTMLElement} */
let sceneTitleEl;
/** @type {HTMLElement} */
let sceneTextEl;
/** @type {HTMLElement} */
let optionsListEl;
/** @type {HTMLElement} */
let epilogContainer;

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Traži DOM elemente i inicijalizuje canvas.
 * Mora se zvati pre bilo koje druge funkcije iz ovog modula.
 */
export function initUI() {
  canvasEl       = document.getElementById('illustration-canvas');
  sceneContainer = document.getElementById('scene-container');
  sceneTitleEl   = document.getElementById('scene-title');
  sceneTextEl    = document.getElementById('scene-text');
  optionsListEl  = document.getElementById('options-list');
  epilogContainer = document.getElementById('epilog-container');

  if (!canvasEl || !sceneContainer || !sceneTitleEl || !sceneTextEl || !optionsListEl || !epilogContainer) {
    console.error('[ui] Nedostaje DOM element — proveri index.html strukturu.');
    return;
  }

  // ctx se dohvata iz canvasEl — main.js je već pozvao initCanvas() i skalirao kontekst
  ctx = canvasEl.getContext('2d');

  // Osiguraj da su kontejneri u ispravnom početnom stanju
  epilogContainer.classList.add('hidden');
  sceneContainer.classList.remove('hidden');

  // Fiksni audio toggle (prikaz uvek vidljiv u gornjem desnom uglu)
  const audioBtn = document.createElement('button');
  audioBtn.id = 'audio-toggle';
  audioBtn.className = 'audio-toggle-btn';
  audioBtn.textContent = '🔊';
  audioBtn.setAttribute('type', 'button');
  audioBtn.setAttribute('aria-label', 'Toggle zvuk');
  audioBtn.addEventListener('click', () => {
    // Import audio dinamički da izbegnemo circular dependency
    import('./audio.js').then(({ setEnabled, isEnabled }) => {
      const next = !isEnabled();
      setEnabled(next);
      audioBtn.textContent = next ? '🔊' : '🔇';
    });
  });
  document.getElementById('game-root')?.appendChild(audioBtn);
}

// ─── Scene display ────────────────────────────────────────────────────────────

/**
 * Prikazuje scenu: naslov, ilustraciju, tekst i opcije kao dugmad.
 *
 * @param {{ id: string, title: string, illustrationKey: string, text: string, options: Array<{text: string, effects: Object}> }} scene
 * @param {function(number): void} onChoice  — poziva se s indeksom odabrane opcije
 */
export function showScene(scene, onChoice) {
  if (!sceneTitleEl) return;

  // Naslov
  sceneTitleEl.textContent = scene.title ?? '';

  // Ilustracija — dimenzije su logičke (CSS px), bez dpr multiplikatora
  if (canvasEl && ctx) {
    const w = canvasEl.offsetWidth  || parseInt(canvasEl.style.width,  10) || 200;
    const h = canvasEl.offsetHeight || parseInt(canvasEl.style.height, 10) || 200;
    drawIllustration(ctx, scene.illustrationKey ?? '', w, h);
    canvasEl.classList.remove('hidden');
  }

  // Tekst — postavi paragraf po paragraf (split na \n\n ako postoji)
  sceneTextEl.innerHTML = '';
  const paragraphs = (scene.text ?? '').split(/\n\n+/);
  paragraphs.forEach(para => {
    const p = document.createElement('p');
    p.textContent = para.trim();
    sceneTextEl.appendChild(p);
  });

  // Opcije
  optionsListEl.innerHTML = '';
  (scene.options ?? []).forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.setAttribute('type', 'button');

    // Oba eventa — klik i touch — da smo sigurni na mobilnom
    btn.addEventListener('click', () => {
      _disableOptions();
      onChoice(idx);
    });

    optionsListEl.appendChild(btn);
  });

  // Fokusiraj prvu opciju za keyboard navigaciju
  const first = optionsListEl.querySelector('.option-btn');
  if (first) first.focus();
}

/**
 * Prikazuje epilog karticu na kraju igre.
 *
 * @param {{ title: string, epitaph: string, statsLabel: string }} epilog
 * @param {{ ponos: number, gorčina: number, umor: number, solidarnost: number }} stats
 */
export function showEpilog(epilog, stats) {
  if (!epilogContainer) return;

  // Sakrij scenu
  if (sceneContainer) sceneContainer.classList.add('hidden');
  if (canvasEl)       canvasEl.classList.add('hidden');

  // Izgradi epitaf karticu
  epilogContainer.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'epilog-card';

  // Naslov kraja
  const h2 = document.createElement('h2');
  h2.className = 'epilog-title';
  h2.textContent = epilog.title ?? '';
  card.appendChild(h2);

  // Separator
  const sep = document.createElement('div');
  sep.className = 'epilog-sep';
  card.appendChild(sep);

  // Epitaf tekst
  const epText = document.createElement('p');
  epText.className = 'epilog-text';
  epText.textContent = epilog.epitaph ?? '';
  card.appendChild(epText);

  // Stat opisi (prikazuje se samo ako statistika prelazi HIGH = 65)
  const HIGH = CONFIG.STAT_START + CONFIG.HIDDEN_THRESHOLD; // 65

  const statLines = _buildStatLines(stats, HIGH);
  if (statLines.length > 0) {
    const statDiv = document.createElement('div');
    statDiv.className = 'epilog-stats';
    statLines.forEach(line => {
      const p = document.createElement('p');
      p.className = 'epilog-stat-line';
      p.textContent = line;
      statDiv.appendChild(p);
    });
    card.appendChild(statDiv);
  } else {
    // Defaultni opis kad nijedna statistika nije visoka
    const p = document.createElement('p');
    p.className = 'epilog-stat-line epilog-stat-default';
    p.textContent = 'Bio si isti čovek na kraju kao na početku.';
    card.appendChild(p);
  }

  // Dugme za restart
  const restartBtn = document.createElement('button');
  restartBtn.className = 'epilog-restart-btn';
  restartBtn.setAttribute('type', 'button');
  restartBtn.textContent = '↩ Odigraj ponovo';
  restartBtn.addEventListener('click', () => {
    // Obrisi sačuvano stanje i reloaduj
    try { localStorage.removeItem(CONFIG.SAVE_KEY); } catch { /* ignore */ }
    location.reload();
  });
  card.appendChild(restartBtn);

  epilogContainer.appendChild(card);
  epilogContainer.classList.remove('hidden');

  // Skroluj na vrh kartice
  epilogContainer.scrollTop = 0;
}

/**
 * Fade-out → callback → fade-in tranzicija.
 * Koristi CSS klasu `.fading` i `CONFIG.TRANSITION_MS`.
 *
 * @param {function(): void} callback  — zove se na sredini tranzicije (dok je ekran taman)
 */
export function showTransition(callback) {
  const root = document.getElementById('game-root');
  if (!root) {
    callback();
    return;
  }

  const ms = CONFIG.TRANSITION_MS ?? 600;

  root.classList.add('fading');

  setTimeout(() => {
    callback();
    // Mali tick da browser uradi layout pre fade-in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('fading');
      });
    });
  }, ms);
}

/**
 * Čisti scene kontejner (tekst + opcije + ilustraciju).
 * Korisno pri tranziciji između scena.
 */
export function clearScene() {
  if (sceneTitleEl)  sceneTitleEl.textContent = '';
  if (sceneTextEl)   sceneTextEl.innerHTML = '';
  if (optionsListEl) optionsListEl.innerHTML = '';
  if (canvasEl && ctx) {
    const w = canvasEl.offsetWidth  || 200;
    const h = canvasEl.offsetHeight || 200;
    ctx.clearRect(0, 0, w, h);
  }
}

// ─── Interne pomoćne funkcije ─────────────────────────────────────────────────

/**
 * Onemogući sva opciona dugmad (sprečava dvostruki klik).
 */
function _disableOptions() {
  if (!optionsListEl) return;
  optionsListEl.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = true;
    btn.classList.add('disabled');
  });
}

/**
 * Gradi listu tekstualnih opisa na osnovu stat vrednosti.
 *
 * @param {{ ponos: number, gorčina: number, umor: number, solidarnost: number }} stats
 * @param {number} high  — prag iznad kojeg se smatra da statistika dominira
 * @returns {string[]}
 */
function _buildStatLines(stats, high) {
  const lines = [];

  if (stats.ponos        >= high) lines.push('Ostao si dostojanstven.');
  if (stats.solidarnost  >= high) lines.push('Nisi bio sam.');
  if (stats.umor         >= high) lines.push('Bio si pošteno umoran.');
  if (stats.gorčina      >= high) lines.push('Imao si razlog za gorčinu.');

  return lines;
}
