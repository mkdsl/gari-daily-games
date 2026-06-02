// ui.js — DOM overlay menji + HUD (ne canvas)
import { CONFIG } from './config.js';

const P = CONFIG.PALETTE;

export class UI {
  constructor() {
    this.hud  = document.getElementById('hud');
    this.menu = document.getElementById('menu');
    this._hudBuilt = false;
    this._tutorialOverlay = null;
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────

  _ensureHUD() {
    if (this._hudBuilt) return;
    this._hudBuilt = true;
    this.hud.innerHTML = `
      <div class="hud-left">
        <div class="hud-score-label">SCORE</div>
        <div class="hud-score" id="hud-score">0</div>
      </div>
      <div class="hud-center">
        <div class="hud-lives" id="hud-lives">
          <span class="life life-1">💉</span>
          <span class="life life-2">💉</span>
          <span class="life life-3">💉</span>
        </div>
        <div class="hud-streak hidden" id="hud-streak"></div>
      </div>
      <div class="hud-right">
        <div class="hud-level-label">NIVO</div>
        <div class="hud-level" id="hud-level">1</div>
      </div>
    `;
  }

  /**
   * @param {number} score
   * @param {number} lives
   * @param {number} level
   * @param {number} streak
   */
  updateHUD(score, lives, level, streak) {
    this._ensureHUD();

    const scoreEl  = document.getElementById('hud-score');
    const levelEl  = document.getElementById('hud-level');
    const livesEl  = document.getElementById('hud-lives');
    const streakEl = document.getElementById('hud-streak');

    if (scoreEl)  scoreEl.textContent  = score.toLocaleString();
    if (levelEl)  levelEl.textContent  = level;

    // Životi — vizuelno ukloni ikonice
    if (livesEl) {
      const lifeIcons = livesEl.querySelectorAll('.life');
      lifeIcons.forEach((el, i) => {
        el.classList.toggle('life-lost', i >= lives);
      });
    }

    // Streak counter — prikaži samo kad >= threshold1
    if (streakEl) {
      const show = streak >= CONFIG.STREAK_MULTIPLIER.threshold1;
      streakEl.classList.toggle('hidden', !show);
      if (show) {
        const mult = streak >= CONFIG.STREAK_MULTIPLIER.threshold2
          ? CONFIG.STREAK_MULTIPLIER.mult2
          : CONFIG.STREAK_MULTIPLIER.mult1;
        streakEl.textContent = `×${mult.toFixed(1)} (${streak})`;
        streakEl.classList.toggle('streak-max', streak >= CONFIG.STREAK_MULTIPLIER.threshold2);
      }
    }
  }

  // ─── Start screen ─────────────────────────────────────────────────────────

  /**
   * @param {Array} highscore - top 3 lista [{score, level, combo, date}]
   */
  showStartScreen(highscore) {
    this._tutorialOverlay = null;
    this.menu.className   = 'menu-overlay start-screen';

    const hsRows = highscore.length > 0
      ? highscore.map((h, i) =>
          `<div class="hs-row"><span class="hs-rank">#${i + 1}</span>
           <span class="hs-score">${h.score.toLocaleString()}</span>
           <span class="hs-meta">Nv${h.level} / ×${h.combo}</span></div>`
        ).join('')
      : '<div class="hs-empty">Nema rezultata još.</div>';

    this.menu.innerHTML = `
      <div class="start-logo">
        <div class="start-mushroom">🍄</div>
        <h1 class="start-title">Pečurka<br>Inokulator</h1>
        <div class="start-subtitle">Guncati × GDG</div>
      </div>
      <div class="start-desc">
        Klikni u zeleni prozor da inokuliraš supstrat.<br>
        10 nivoa — sve brži, sve kompleksniji.
      </div>
      <button class="btn-primary" id="btn-start">POČNI INOKULACIJU</button>
      <div class="highscore-panel">
        <div class="hs-title">Danas</div>
        ${hsRows}
      </div>
      <div class="start-brand">guncati.rs — uzgoj pečuraka</div>
    `;

    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.hideMenu();
    });
  }

  // ─── Tutorial overlay ─────────────────────────────────────────────────────

  /**
   * @param {function(): void} onSkip
   */
  showTutorial(onSkip) {
    // Ako već postoji, ne dodaj ponovo
    if (this._tutorialOverlay) return;

    const div = document.createElement('div');
    div.className = 'tutorial-overlay';
    div.id        = 'tutorial-overlay';
    div.innerHTML = `
      <div class="tutorial-box">
        <div class="tutorial-arrow">↓</div>
        <div class="tutorial-text">
          <strong>Klikni kad si u<br>zelenoj zoni!</strong><br>
          <span class="tutorial-hint">Zelena = uspeh · Siva = greška · Zlatna = 2× score</span>
        </div>
        <button class="btn-skip" id="btn-tutorial-skip">Razumio, počni</button>
      </div>
    `;

    document.getElementById('game-root').appendChild(div);
    this._tutorialOverlay = div;

    document.getElementById('btn-tutorial-skip')?.addEventListener('click', () => {
      div.remove();
      this._tutorialOverlay = null;
      if (onSkip) onSkip();
    });
  }

  hideTutorial() {
    if (this._tutorialOverlay) {
      this._tutorialOverlay.remove();
      this._tutorialOverlay = null;
    }
  }

  // ─── Level clear ──────────────────────────────────────────────────────────

  /**
   * @param {number} level
   * @param {number} levelScore
   * @param {string} fact
   * @param {function(): void} onContinue
   */
  showLevelClear(level, levelScore, fact, onContinue) {
    this.menu.className = 'menu-overlay level-clear-screen';
    this.menu.innerHTML = `
      <div class="lc-icon">✅</div>
      <h2 class="lc-title">Nivo ${level} Završen!</h2>
      <div class="lc-score">+${levelScore.toLocaleString()} poena</div>
      <div class="lc-fact">
        <div class="fact-label">🍄 Guncati Fact</div>
        <div class="fact-text">"${fact}"</div>
      </div>
      <button class="btn-primary" id="btn-next-level">
        ${level >= 10 ? 'FINALE!' : `Nivo ${level + 1} →`}
      </button>
    `;

    const btn = document.getElementById('btn-next-level');
    btn?.addEventListener('click', () => {
      this.hideMenu();
      onContinue();
    });

    // Auto-advance posle 3s ako korisnik ne klikne
    const timer = setTimeout(() => {
      this.hideMenu();
      onContinue();
    }, CONFIG.LEVEL_CLEAR_AUTO_MS);

    btn?.addEventListener('click', () => clearTimeout(timer), { once: true });
  }

  // ─── Game Over ────────────────────────────────────────────────────────────

  /**
   * @param {number} score
   * @param {number} bestCombo
   * @param {number} level
   * @param {Array} highscore
   * @param {string} fact
   * @param {boolean} gameWon
   * @param {function(): void} onRestart
   * @param {function(): void} onShare
   */
  showGameOver(score, bestCombo, level, highscore, fact, gameWon, onRestart, onShare) {
    this.hideTutorial();
    this.menu.className = `menu-overlay gameover-screen ${gameWon ? 'game-won' : ''}`;

    const title = gameWon
      ? '🍄 MAJSTOR INOKULANT!'
      : '💀 Kontaminacija!';

    const hsRows = highscore.length > 0
      ? highscore.map((h, i) =>
          `<div class="hs-row ${h.score === score ? 'hs-current' : ''}">
            <span class="hs-rank">#${i + 1}</span>
            <span class="hs-score">${h.score.toLocaleString()}</span>
            <span class="hs-meta">Nv${h.level}</span>
          </div>`
        ).join('')
      : '';

    this.menu.innerHTML = `
      <div class="go-header">
        <h2 class="go-title">${title}</h2>
        ${gameWon ? '<div class="go-win-sub">Svi supstrati inokulisani!</div>' : ''}
      </div>
      <div class="go-stats">
        <div class="go-stat-row">
          <span class="go-stat-label">Poeni</span>
          <span class="go-stat-val">${score.toLocaleString()}</span>
        </div>
        <div class="go-stat-row">
          <span class="go-stat-label">Nivo dostignut</span>
          <span class="go-stat-val">${level}/10</span>
        </div>
        <div class="go-stat-row">
          <span class="go-stat-label">Najbolji combo</span>
          <span class="go-stat-val">×${bestCombo}</span>
        </div>
      </div>
      ${hsRows ? `<div class="go-highscore"><div class="hs-title">Danas</div>${hsRows}</div>` : ''}
      <div class="go-fact">
        <div class="fact-label">🌾 Guncati Akademija</div>
        <div class="fact-text">"${fact}"</div>
      </div>
      <div class="go-actions">
        <button class="btn-primary" id="btn-restart">Ponovi</button>
        <button class="btn-secondary" id="btn-share">Podijeli 📤</button>
      </div>
      <div class="go-brand">guncati.rs — inokulaciona radionica jesen 2026.</div>
    `;

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.hideMenu();
      onRestart();
    });
    document.getElementById('btn-share')?.addEventListener('click', async () => {
      await onShare();
      // Brief "Kopirano!" feedback
      const btn = document.getElementById('btn-share');
      if (btn) {
        btn.textContent = 'Kopirano! ✓';
        setTimeout(() => { if (btn) btn.textContent = 'Podijeli 📤'; }, 2000);
      }
    });
  }

  // ─── Utils ────────────────────────────────────────────────────────────────

  hideMenu() {
    this.menu.innerHTML  = '';
    this.menu.className  = 'menu-overlay hidden';
  }

  /**
   * Prikaži kratkotrajni toast (npr. "Kopirano!").
   * @param {string} msg
   * @param {number} durationMs
   */
  showToast(msg, durationMs = 2000) {
    const existing = document.getElementById('ui-toast');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.id        = 'ui-toast';
    div.className = 'ui-toast';
    div.textContent = msg;
    document.getElementById('game-root').appendChild(div);

    setTimeout(() => div.remove(), durationMs);
  }
}
