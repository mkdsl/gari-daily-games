/**
 * EndingScreen.js — Ending reveal overlay with Kluboslavija CTA
 * Shows score, ending story, and replay/ticket links
 * @module EndingScreen
 */

import EventBus, { EVENTS } from '../engine/EventBus.js';
import AchievementSystem from '../engine/AchievementSystem.js';
import SfxPlayer from '../audio/SfxPlayer.js';
import AmbientPlayer from '../audio/AmbientPlayer.js';
import { ENDINGS } from '../engine/ResourceManager.js';

/** @type {HTMLElement|null} */
let overlay = null;

/** @type {Function|null} */
let onRestartCallback = null;

/**
 * Initialize ending screen
 * @param {HTMLElement} parent
 * @param {Function} onRestart
 */
export function init(parent, onRestart) {
  onRestartCallback = onRestart;

  overlay = document.createElement('div');
  overlay.className = 'ending-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Kraj igre');
  overlay.style.display = 'none';
  parent.appendChild(overlay);

  EventBus.on(EVENTS.GAME_ENDING, ({ endingId, score, endingData }) => {
    show(endingId, score, endingData);
  });
}

/**
 * Show ending screen
 * @param {string} endingId
 * @param {number} score
 * @param {object} endingData
 */
export function show(endingId, score, endingData) {
  if (!overlay) return;

  AmbientPlayer.stop();

  // Play ending stinger
  const stingerMap = {
    legendarno: 'ending_legendarno',
    solidno: 'ending_solidno',
    proslo_nekako: 'ending_proslo',
    chaos: 'ending_chaos',
    hard_fail: 'ending_fail',
    secret_s1: 'ending_secret',
    secret_s2: 'ending_secret'
  };
  setTimeout(() => {
    SfxPlayer.play(stingerMap[endingId] ?? 'ending_solidno');
  }, 600);

  const data = endingData ?? ENDINGS[endingId];
  const isSecret = data?.secret ?? false;
  const achs = AchievementSystem.getAll();
  const unlockedCount = AchievementSystem.getUnlockedCount();

  overlay.innerHTML = buildHTML(endingId, score, data, isSecret, achs, unlockedCount);
  overlay.style.display = 'flex';

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('ending-visible'));
  });

  // Wire buttons
  const restartBtn = overlay.querySelector('.ending-btn-restart');
  restartBtn?.addEventListener('click', handleRestart);
  restartBtn?.addEventListener('touchend', handleRestart);

  const shareBtn = overlay.querySelector('.ending-btn-share');
  shareBtn?.addEventListener('click', handleShare);
}

function buildHTML(endingId, score, data, isSecret, achs, unlockedCount) {
  const ctaLink = 'https://bilet.rs/show/261';
  const isStandardEnding = !isSecret && endingId !== 'hard_fail';

  return `
    <div class="ending-card">
      <div class="ending-header">
        <div class="ending-brand">Kluboslavija Niš 2026</div>
        ${isSecret ? '<div class="ending-secret-badge">Tajna završnica!</div>' : ''}
      </div>

      <div class="ending-title" style="color: ${data?.color ?? '#E8A24A'}">
        ${data?.title ?? 'Kraj'}
      </div>
      <div class="ending-subtitle">${data?.subtitle ?? ''}</div>

      <div class="ending-story">${data?.text ?? ''}</div>

      <div class="ending-score">
        <span class="ending-score-label">Jutarnji skor:</span>
        <span class="ending-score-val" style="color: ${data?.color ?? '#E8A24A'}">${score}</span>
      </div>

      ${data?.replayNote ? `<div class="ending-replay-note">${data.replayNote}</div>` : ''}

      <div class="ending-achievements">
        <div class="ending-ach-title">Dostignuća: ${unlockedCount}/9</div>
        <div class="ending-ach-grid">
          ${achs.map(({ def, unlocked }) => `
            <div class="ending-ach-item ${unlocked ? 'unlocked' : 'locked'}" title="${unlocked ? def.desc : (def.hidden ? '???' : def.name)}">
              <div class="ending-ach-icon">${unlocked ? getIconEmoji(def.icon) : (def.hidden ? '?' : '🔒')}</div>
              <div class="ending-ach-name">${unlocked ? def.name : (def.hidden ? '???' : def.name)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="ending-actions">
        ${isStandardEnding ? `
          <a href="${ctaLink}" target="_blank" rel="noopener" class="ending-btn ending-btn-cta">
            Kupite kartu — bilet.rs/show/261
          </a>
        ` : ''}
        <button class="ending-btn ending-btn-restart">Igraj ponovo</button>
        <button class="ending-btn ending-btn-share">Podeli rezultat</button>
      </div>

      <div class="ending-fine-print">
        Igra je deo Kluboslavija ekosistema — gde muzika živi.
      </div>
    </div>
  `;
}

function handleRestart() {
  overlay?.classList.remove('ending-visible');
  setTimeout(() => {
    if (overlay) overlay.style.display = 'none';
    EventBus.emit(EVENTS.GAME_RESTART, {});
    onRestartCallback?.();
  }, 400);
}

async function handleShare() {
  const state = {
    score: overlay?.querySelector('.ending-score-val')?.textContent ?? '?',
    title: overlay?.querySelector('.ending-title')?.textContent?.trim() ?? 'Niš Fuga'
  };

  const text = `Odigrao/la sam Niš Fugu — Kluboslavija 2026!\nEnding: "${state.title}" | Skor: ${state.score}\nPokreni i ti: ${window.location.href}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Niš Fuga', text, url: window.location.href });
    } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(text);
      EventBus.emit(EVENTS.UI_TOAST_SHOW, {
        type: 'info',
        title: 'Kopirano!',
        message: 'Rezultat je kopiran u clipboard.',
        duration: 2500
      });
    } catch {}
  }
}

function getIconEmoji(icon) {
  const map = {
    badge: '🏅', kiosk: '🏪', mic: '🎤', key: '🔑',
    guitar: '🎸', clock: '⏰', wall: '🧱', printer: '🖨️', car: '🚗'
  };
  return map[icon] ?? '🏆';
}

export default { init, show };
