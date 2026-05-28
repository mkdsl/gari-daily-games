const LABELS = ['A', 'B', 'C', 'D'];

function hideAll() {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
}

export function renderIntro(onStart) {
  hideAll();
  const screen = document.getElementById('screen-intro');
  screen.innerHTML = `
    <div class="intro-logo">KLUBOSLAVIJA</div>
    <div class="intro-title">🎛️ DJ Akademija</div>
    <div class="intro-subtitle">Prijavi se za Kluboslavija ekipu</div>
    <div class="intro-meta">10 pitanja &middot; 20 sekundi svako</div>
    <hr class="intro-divider" />
    <div class="intro-meta">Štrand, Novi Sad &mdash; 13. jun 2026.</div>
    <div class="intro-spacer"></div>
    <button class="btn" id="btn-start">▶ START</button>
  `;
  screen.classList.add('active');
  document.getElementById('btn-start').addEventListener('click', onStart);
}

export function renderQuestion(question, qIndex, totalQ) {
  hideAll();
  const screen = document.getElementById('screen-question');
  const optionsHTML = question.options
    .map(
      (opt, i) => `
      <button class="btn" data-idx="${i}">
        <span class="opt-label">${LABELS[i]}</span>${opt}
      </button>`
    )
    .join('');

  screen.innerHTML = `
    <div class="progress-text">Pitanje ${qIndex + 1} / ${totalQ}</div>
    <div class="timer-row">
      <div class="timer-bar"><div class="timer-fill"></div></div>
      <span class="timer-num">20s</span>
    </div>
    <div class="question-text">${question.text}</div>
    ${optionsHTML}
    <div class="fact-text"></div>
  `;
  screen.classList.add('active');
}

export function renderFeedback(question, selectedIdx, timedOut) {
  const screen = document.getElementById('screen-question');
  const buttons = screen.querySelectorAll('.btn[data-idx]');

  buttons.forEach((btn) => {
    btn.disabled = true;
    const idx = parseInt(btn.dataset.idx, 10);
    if (idx === question.correct) {
      btn.classList.add('correct');
    } else if (idx === selectedIdx) {
      btn.classList.add('wrong');
    }
  });

  if (timedOut) {
    const timeoutEl = document.createElement('div');
    timeoutEl.className = 'timeout-badge';
    timeoutEl.textContent = '⏱ Vreme je isteklo!';
    const factEl = screen.querySelector('.fact-text');
    if (factEl) screen.insertBefore(timeoutEl, factEl);
  }

  const factEl = screen.querySelector('.fact-text');
  if (factEl) factEl.textContent = question.fact;
}

export function renderFinal(score, title, onShare, best) {
  hideAll();
  const screen = document.getElementById('screen-final');
  const jackpotHTML =
    score === 10
      ? `<div class="jackpot-msg">🏆 Pošalji screenshot Kluboslavija DM-u za backstage akreditaciju!</div>`
      : '';

  screen.innerHTML = `
    <div class="final-header">📋 Rezultati</div>
    <div class="score-badge">${score} / 10</div>
    <div class="title-badge">${title}</div>
    <div class="best-score">Tvoj best: ${best} / 10</div>
    ${jackpotHTML}
    <div class="strand-cta">Spreman/a za Štrand 13. jun?</div>
    <button class="btn" id="btn-share">Podeli rezultat 📤</button>
    <button class="btn" id="btn-replay">Igraj ponovo 🔄</button>
    <div class="footer-text">© 2026 Kluboslavija</div>
  `;
  screen.classList.add('active');

  document.getElementById('btn-share').addEventListener('click', onShare);
  document.getElementById('btn-replay').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('dja:replay'));
  });
}
