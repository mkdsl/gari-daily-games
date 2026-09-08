/**
 * scene-overlay.js — narativni text overlay, dialogue box, fade-in/out
 * Koristi se za etapa intro linije i ambient tekstove.
 */

/**
 * @typedef {{
 *   lines: string[],
 *   tipLine?: string|null,
 *   continueLabel?: string,
 *   onDone?: () => void
 * }} SceneOverlayOptions
 */

// ============================================================
// Scene intro overlay (full-screen fade)
// ============================================================

/**
 * Prikaže narativni overlay sa linijama koje se pojavljuju jednu po jednu.
 * Klik/tap (ili Space/Enter) preskače na sledeću liniju ili zatvara overlay.
 *
 * @param {HTMLElement} container - #scene-viewport ili #overlay-layer
 * @param {SceneOverlayOptions} opts
 * @returns {{ close: () => void }}
 */
export function showSceneOverlay(container, opts) {
  const {
    lines = [],
    tipLine = null,
    continueLabel = 'Tapni za nastavak',
    onDone = () => {}
  } = opts;

  // Kreiraj overlay element
  const el = document.createElement('div');
  el.className = 'scene-overlay';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'false');
  el.setAttribute('tabindex', '-1');

  const linesHTML = lines
    .map((line, i) => `<p class="scene-overlay__line" data-index="${i}">${_escape(line)}</p>`)
    .join('');

  const tipHTML = tipLine
    ? `<p class="scene-overlay__line scene-overlay__line--small" data-index="${lines.length}">${_escape(tipLine)}</p>`
    : '';

  el.innerHTML = `
    <div class="scene-overlay__lines">
      ${linesHTML}
      ${tipHTML}
    </div>
    <div class="scene-overlay__continue" aria-live="polite">${_escape(continueLabel)}</div>
  `;

  container.appendChild(el);

  // Activiraj overlay layer
  const overlayLayer = container.closest('#overlay-layer') || container;
  overlayLayer.classList.add('has-overlay');

  // Fade in
  requestAnimationFrame(() => {
    el.classList.add('visible');
    el.focus();
  });

  // Postepeno prikaži linije
  const allLineEls = el.querySelectorAll('.scene-overlay__line');
  let currentLine = 0;

  function revealNextLine() {
    if (currentLine < allLineEls.length) {
      allLineEls[currentLine].classList.add('show');
      currentLine++;
    }
  }

  // Prikaži prvu liniju odmah, ostale sa kašnjenjem
  revealNextLine();
  const lineIntervals = [];
  for (let i = 1; i < allLineEls.length; i++) {
    const delay = i * 600;
    lineIntervals.push(setTimeout(revealNextLine, delay));
  }

  // Zatvaranje
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    lineIntervals.forEach(clearTimeout);
    el.classList.remove('visible');
    overlayLayer.classList.remove('has-overlay');
    el.removeEventListener('click', handleInteraction);
    el.removeEventListener('keydown', handleKey);
    setTimeout(() => {
      el.remove();
      onDone();
    }, 400);
  }

  // Interaction handlers
  function handleInteraction() {
    // Ako nisu sve linije prikazane — prikaži ih odmah
    const hidden = el.querySelectorAll('.scene-overlay__line:not(.show)');
    if (hidden.length > 0) {
      lineIntervals.forEach(clearTimeout);
      allLineEls.forEach(l => l.classList.add('show'));
      currentLine = allLineEls.length;
    } else {
      close();
    }
  }

  function handleKey(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleInteraction();
    }
    if (e.key === 'Escape') {
      close();
    }
  }

  el.addEventListener('click', handleInteraction);
  el.addEventListener('keydown', handleKey);

  return { close };
}

// ============================================================
// Dialogue box (bottom sheet)
// ============================================================

/**
 * @typedef {{
 *   speaker?: string|null,
 *   text: string,
 *   tapHint?: string,
 *   onDone?: () => void,
 *   autoClose?: number|null
 * }} DialogueOptions
 */

/**
 * Prikazuje dialogue box (bottom sheet) u containeru.
 * Klik/tap zatvara.
 *
 * @param {HTMLElement} container - tipično #scene-viewport
 * @param {DialogueOptions} opts
 * @returns {{ close: () => void, updateText: (text: string) => void }}
 */
export function showDialogue(container, opts) {
  const {
    speaker = null,
    text = '',
    tapHint = 'Tapni za zatvaranje',
    onDone = () => {},
    autoClose = null
  } = opts;

  const el = document.createElement('div');
  el.className = 'dialogue-box';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'false');
  el.setAttribute('tabindex', '-1');

  el.innerHTML = `
    ${speaker ? `<div class="dialogue-box__speaker">${_escape(speaker)}</div>` : ''}
    <div class="dialogue-box__text">${_escape(text)}</div>
    <div class="dialogue-box__tap-hint">${_escape(tapHint)}</div>
  `;

  container.appendChild(el);

  // Slide up
  requestAnimationFrame(() => {
    el.classList.add('open');
    el.focus();
  });

  let autoCloseTimer = null;
  let closed = false;

  function close() {
    if (closed) return;
    closed = true;
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    el.classList.remove('open');
    el.removeEventListener('click', close);
    el.removeEventListener('keydown', handleKey);
    setTimeout(() => {
      el.remove();
      onDone();
    }, 380);
  }

  function handleKey(e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  el.addEventListener('click', close);
  el.addEventListener('keydown', handleKey);

  if (autoClose && autoClose > 0) {
    autoCloseTimer = setTimeout(close, autoClose);
  }

  function updateText(newText) {
    const textEl = el.querySelector('.dialogue-box__text');
    if (textEl) textEl.textContent = newText;
  }

  return { close, updateText };
}

// ============================================================
// Radio aforizam overlay (toast-style)
// ============================================================

/**
 * Prikazuje radio aforizam kao toast u donjem delu ekrana.
 * Auto-zatvara se posle 'duration' ms.
 *
 * @param {string} text - aforizam tekst
 * @param {number} [duration=4000] - ms do auto-close
 * @returns {{ close: () => void }}
 */
export function showRadioAforizam(text, duration = 4000) {
  const el = document.createElement('div');
  el.className = 'radio-aforizam';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `
    <span class="radio-aforizam__icon">📻</span>
    <p class="radio-aforizam__text">"${_escape(text)}"</p>
  `;

  document.body.appendChild(el);

  requestAnimationFrame(() => el.classList.add('show'));

  let closed = false;
  const timer = setTimeout(close, duration);

  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    el.classList.remove('show');
    setTimeout(() => el.remove(), 350);
  }

  el.addEventListener('click', close);

  return { close };
}

// ============================================================
// Utility
// ============================================================

/**
 * HTML escape za tekst koji ide u innerHTML.
 * @param {string} str
 * @returns {string}
 */
function _escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
