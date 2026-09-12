/**
 * transitions.js — Animacije prelaza između nodova i sati
 */

const IS_IOS = /iP(hone|ad)/.test(navigator.userAgent);
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Fade out element
 * @param {HTMLElement} el
 * @param {number} duration ms
 * @returns {Promise}
 */
export function fadeOut(el, duration = 200) {
  if (REDUCED_MOTION || IS_IOS) {
    el.style.opacity = '0';
    return Promise.resolve();
  }
  return new Promise(resolve => {
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = '0';
    setTimeout(resolve, duration);
  });
}

/**
 * Fade in element
 */
export function fadeIn(el, duration = 300) {
  if (REDUCED_MOTION || IS_IOS) {
    el.style.opacity = '1';
    return Promise.resolve();
  }
  el.style.opacity = '0';
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      el.style.transition = `opacity ${duration}ms ease`;
      el.style.opacity = '1';
      setTimeout(resolve, duration);
    });
  });
}

/**
 * Slide up (card appearing)
 */
export function slideUp(el, duration = 250) {
  if (REDUCED_MOTION || IS_IOS) {
    el.style.transform = 'none';
    el.style.opacity = '1';
    return Promise.resolve();
  }
  el.style.transform = 'translateY(16px)';
  el.style.opacity = '0';
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
      setTimeout(resolve, duration);
    });
  });
}

/**
 * Flash resurs bar kad se promeni vrednost
 */
export function flashResource(el, positive) {
  if (REDUCED_MOTION) return;
  const cls = positive ? 'flash-positive' : 'flash-negative';
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 600);
}

/**
 * Hour transition — kratki "sat menja" efekt
 * @param {HTMLElement} container
 * @param {Function} updateFn - callback koji renderuje novi sat
 */
export async function hourTransition(container, updateFn) {
  await fadeOut(container, 150);
  updateFn();
  await fadeIn(container, 300);
}

/**
 * Delta prikaz — bounce efekt na resurs baru
 */
export function bounceElement(el) {
  if (REDUCED_MOTION) return;
  el.classList.add('bounce');
  setTimeout(() => el.classList.remove('bounce'), 500);
}
