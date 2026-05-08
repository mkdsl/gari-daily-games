import { CONFIG } from './config.js';

const aforizmEl = document.getElementById('aforizam-text');
const toastEl = document.getElementById('toast');
const controlsEl = document.getElementById('controls');

let transitioning = false;
let toastTimer = null;

export function isTransitioning() {
  return transitioning;
}

export async function showAforizam(text) {
  if (transitioning) return;
  transitioning = true;
  controlsEl.style.pointerEvents = 'none';

  // Fade out
  aforizmEl.style.animation = `fadeOut ${CONFIG.FADE_OUT_MS}ms ease forwards`;
  await delay(CONFIG.FADE_OUT_MS);

  // Swap text
  aforizmEl.textContent = text;

  // Bug 1 fix: reset animation i force reflow da browser pokrene novu animaciju
  aforizmEl.style.animation = ''; // reset
  void aforizmEl.offsetWidth;     // force reflow

  // Fade in
  aforizmEl.style.animation = `fadeIn ${CONFIG.FADE_IN_MS}ms ease forwards`;
  await delay(CONFIG.FADE_IN_MS);

  aforizmEl.style.animation = '';
  controlsEl.style.pointerEvents = '';
  transitioning = false;
}

export function showAforizmImmediate(text) {
  aforizmEl.textContent = text;
  aforizmEl.style.animation = `fadeIn ${CONFIG.FADE_IN_MS}ms ease forwards`;
  setTimeout(() => {
    aforizmEl.style.animation = '';
  }, CONFIG.FADE_IN_MS);
}

export function showToast(msg, ms) {
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.classList.add('toast--visible');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('toast--visible');
    toastTimer = null;
  }, ms);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
