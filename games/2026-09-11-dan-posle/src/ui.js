/**
 * ui.js — UI management: screens, HUD, ending, achievements, modali
 */

import { RESOURCES, ACHIEVEMENTS_DEF } from './config.js';
import { computeCS } from './state.js';
import { getEndingData } from './content/endings_data.js';
import { aforizmForEnding } from './content/aforizmi.js';
import { endingResourceSummary } from './systems/endings.js';
import { getAllUnlockedAchievements } from './systems/achievements.js';
import { generateScoreCard } from './share.js';
import { neredIcons } from './entities/event_aftermath.js';
import { formatHour } from './systems/timer.js';

/**
 * Prikaži intro screen
 * @param {string} introText
 * @param {boolean} prestigeUnlocked
 * @param {Function} onStart - callback(isPrestige)
 */
export function showIntroScreen(introText, prestigeUnlocked, onStart) {
  const screen = document.getElementById('screen-intro');
  if (!screen) return;

  const textEl = screen.querySelector('.intro-text');
  if (textEl) textEl.textContent = introText;

  const startBtn = screen.querySelector('#btn-start');
  if (startBtn) startBtn.addEventListener('click', () => onStart(false));

  const prestigeBtn = screen.querySelector('#btn-prestige');
  if (prestigeBtn) {
    if (prestigeUnlocked) {
      prestigeBtn.hidden = false;
      prestigeBtn.addEventListener('click', () => onStart(true));
    } else {
      prestigeBtn.hidden = true;
    }
  }

  showScreen('screen-intro');
}

/**
 * Prikaži ending screen
 * @param {GameState} state
 * @param {string} endingId
 * @param {Array<string>} newAchievements
 * @param {Function} onShare
 * @param {Function} onRestart
 */
export function showEndingScreen(state, endingId, newAchievements, onShare, onRestart) {
  const screen = document.getElementById('screen-ending');
  if (!screen) return;

  const data = getEndingData(endingId);
  const cs = computeCS(state);

  // Title & body
  setElText(screen, '.ending-emoji', data.emoji);
  setElText(screen, '.ending-title', data.title);
  setElText(screen, '.ending-headline', data.headline);
  setElText(screen, '.ending-body', data.body);
  setElText(screen, '.ending-tag', data.tag);
  setElText(screen, '.ending-aforizam', aforizmForEnding(endingId));
  setElText(screen, '.ending-cs', `Community Score: ${cs.toFixed(1)}`);

  // Accent color
  const titleEl = screen.querySelector('.ending-title');
  if (titleEl) titleEl.style.color = data.color;

  // Resource summary
  const resSummary = screen.querySelector('.ending-resources');
  if (resSummary) {
    resSummary.innerHTML = '';
    endingResourceSummary(state).forEach(r => {
      const item = document.createElement('div');
      item.className = 'ending-res-item';
      const label = document.createElement('span');
      label.className = 'ending-res-label';
      label.textContent = r.label + (r.inverted ? ' (manje=bolje)' : '');
      const val = document.createElement('span');
      val.className = 'ending-res-val';
      val.textContent = `${r.value}/10`;
      if (r.inverted) val.style.color = r.value <= 3 ? '#4a7c59' : '#b03030';
      else val.style.color = r.color;
      item.appendChild(label);
      item.appendChild(val);
      resSummary.appendChild(item);
    });
  }

  // Prestige message
  const prestigeMsg = screen.querySelector('.ending-prestige-msg');
  if (prestigeMsg) {
    if (data.prestigeUnlock) {
      prestigeMsg.hidden = false;
      prestigeMsg.textContent = data.prestigeMessage || '';
    } else {
      prestigeMsg.hidden = true;
    }
  }

  // New achievements
  const achSection = screen.querySelector('.ending-achievements');
  if (achSection && newAchievements.length > 0) {
    achSection.hidden = false;
    const list = achSection.querySelector('.ach-list');
    if (list) {
      list.innerHTML = '';
      newAchievements.forEach(id => {
        const def = ACHIEVEMENTS_DEF[id];
        if (!def) return;
        const item = document.createElement('div');
        item.className = 'ach-item ach-new';
        item.innerHTML = `<span class="ach-icon">${def.icon}</span><span class="ach-title">${def.title}</span>`;
        list.appendChild(item);
      });
    }
  } else if (achSection) {
    achSection.hidden = true;
  }

  // Buttons
  const shareBtn = screen.querySelector('#btn-share');
  if (shareBtn) shareBtn.addEventListener('click', onShare);

  const restartBtn = screen.querySelector('#btn-restart');
  if (restartBtn) restartBtn.addEventListener('click', onRestart);

  showScreen('screen-ending');
}

/**
 * Prikaži notification za achievement unlock
 * @param {string} achievementId
 */
export function showAchievementNotification(achievementId) {
  const def = ACHIEVEMENTS_DEF[achievementId];
  if (!def) return;

  const notif = document.createElement('div');
  notif.className = 'achievement-notif';
  notif.innerHTML = `<span class="ach-icon">${def.icon}</span> <span class="ach-title">${def.title}</span>`;
  document.body.appendChild(notif);

  requestAnimationFrame(() => {
    notif.classList.add('notif-visible');
    setTimeout(() => {
      notif.classList.remove('notif-visible');
      setTimeout(() => notif.remove(), 400);
    }, 2500);
  });
}

/**
 * Postavi tekst elementa unutar parent-a
 */
function setElText(parent, selector, text) {
  const el = parent.querySelector(selector);
  if (el) el.textContent = text;
}

/**
 * Prikaži određeni screen, sakrij ostale
 * @param {string} screenId
 */
export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.hidden = s.id !== screenId;
  });
}

/**
 * Renderuj HUD resurse (poziva se na svaku promenu)
 * @param {object} resources
 */
export function updateHUD(resources) {
  const hud = document.getElementById('hud');
  if (!hud) return;

  Object.entries(RESOURCES).forEach(([key, def]) => {
    const val = resources[key];
    const fill = hud.querySelector(`[data-resource="${key}"] .bar-fill`);
    const valEl = hud.querySelector(`[data-resource="${key}"] .bar-value`);
    const iconsEl = hud.querySelector(`[data-resource="${key}"] .nered-icons`);

    if (fill) fill.style.width = `${(val / def.max) * 100}%`;
    if (valEl) valEl.textContent = val;
    if (iconsEl && key === 'nered') iconsEl.textContent = neredIcons(val);
  });

  // CS
  const csEl = document.getElementById('cs-value');
  // CS će biti kalkuliran u main.js i prosleđen
}

/**
 * Update CS display
 * @param {number} cs
 */
export function updateCS(cs) {
  const csEl = document.getElementById('cs-value');
  if (csEl) csEl.textContent = cs.toFixed(1);
}

/**
 * Prikaži hour transition overlay
 * @param {number} fromHour
 * @param {number} toHour
 * @param {string} transitionText
 * @param {Function} callback
 */
export function showHourTransition(fromHour, toHour, transitionText, callback) {
  const overlay = document.getElementById('hour-overlay');
  if (!overlay) { callback(); return; }

  const timeEl = overlay.querySelector('.overlay-time');
  const textEl = overlay.querySelector('.overlay-text');

  if (timeEl) timeEl.textContent = formatHour(toHour);
  if (textEl) textEl.textContent = transitionText;

  overlay.hidden = false;
  overlay.classList.add('overlay-visible');

  setTimeout(() => {
    overlay.classList.remove('overlay-visible');
    setTimeout(() => {
      overlay.hidden = true;
      callback();
    }, 400);
  }, 1000);
}

/**
 * Update mute button state
 * @param {boolean} muted
 */
export function updateMuteButton(muted) {
  const btn = document.getElementById('btn-mute');
  if (btn) btn.textContent = muted ? '🔇' : '🔊';
  if (btn) btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
}

/**
 * Prikaži share toast
 * @param {string} method - 'native' | 'clipboard' | 'execCommand'
 */
export function showShareToast(method) {
  const msg = method === 'native' ? 'Podeljeno!' : 'Kopirano u clipboard!';
  const toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('toast-visible'), 10);
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 2000);
}
