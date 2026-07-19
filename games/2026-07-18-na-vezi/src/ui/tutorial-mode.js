/** Progressive-disclosure state flag za onboarding nedelju */
import { getState, updateState } from '../state.js';

/**
 * Je li tutorial mode aktivan?
 * @returns {boolean}
 */
export function isTutorialMode() {
  return !!getState().tutorialMode;
}

/**
 * Završava tutorial mode
 */
export function endTutorialMode() {
  const state = getState();
  if (!state.tutorialMode) return;
  updateState({ tutorialMode: false });
}

/**
 * Aplicira tutorial CSS klase na platformske panele
 * @param {boolean} tutMode
 */
export function applyTutorialClasses(tutMode) {
  const tiktokPanels = document.querySelectorAll('[data-platform="tiktok"]');
  const youtubePanels = document.querySelectorAll('[data-platform="youtube"]');

  if (tutMode) {
    tiktokPanels.forEach(el => el.classList.add('hidden-tutorial'));
    youtubePanels.forEach(el => el.classList.add('hidden-tutorial'));
  } else {
    tiktokPanels.forEach(el => el.classList.remove('hidden-tutorial'));
    youtubePanels.forEach(el => el.classList.remove('hidden-tutorial'));
    // Dodaj notice za TikTok unlock
    _showPlatformUnlockNotice();
  }
}

/**
 * Prikazuje notice za unlock TikTok/YouTube
 */
function _showPlatformUnlockNotice() {
  const existingNotice = document.getElementById('platform-unlock-notice');
  if (existingNotice) return;

  const notice = document.createElement('div');
  notice.id = 'platform-unlock-notice';
  notice.className = 'platform-unlock-notice';
  notice.textContent = '🎉 TikTok i YouTube su sad dostupni! Dodaj ih u alokaciju.';

  const app = document.getElementById('app');
  if (app) {
    app.insertBefore(notice, app.firstChild);
    setTimeout(() => notice.remove(), 5000);
  }
}

/**
 * Vraća tutorial konfiguraciju za macro planning
 * @returns {Object}
 */
export function getTutorialConfig() {
  return {
    format: 'dj_lajv',
    platformAlloc: { ig: 100, tiktok: 0, youtube: 0 },
    lockedPlatforms: ['tiktok', 'youtube'],
    allowedAlarms: ['feedback_glitch'],
    showFormatHint: true,
    showPlatformHint: true,
  };
}

/**
 * Proverava da li treba završiti tutorial (posle prve emisije)
 * @param {number} emisijeCount
 */
export function checkTutorialEnd(emisijeCount) {
  if (emisijeCount >= 1 && isTutorialMode()) {
    endTutorialMode();
    return true;
  }
  return false;
}

/**
 * Tutorial banner HTML
 * @returns {string}
 */
export function getTutorialBannerHtml() {
  return `<div class="tutorial-banner">
    <strong>Prva emisija</strong> — Tutorial nedelja. Samo IG platforma, format DJ Lajv.
    Nauči osnove pre nego što otključaš ostalo!
  </div>`;
}
