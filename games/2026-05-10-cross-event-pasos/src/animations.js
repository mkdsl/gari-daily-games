// animations.js — CSS class toggles, timing, state transitions
import { REWARD_META } from './config.js';
import { playOpen } from './audio.js';

const FLIP_DURATION = 650; // ms, malo više od CSS 0.6s za sigurnost

// ─── Passport open/close ───────────────────────────────────────────────────────────

export function openPassport(onDone) {
  const cover = document.getElementById('passport-cover');
  const main  = document.getElementById('passport-main');

  playOpen();
  cover.classList.add('opening');

  setTimeout(() => {
    cover.classList.add('hidden');
    cover.classList.remove('opening');
    main.classList.remove('hidden');
    main.classList.add('entering');
    // Skloni entering klasu posle animacije
    setTimeout(() => main.classList.remove('entering'), 400);
    if (onDone) onDone();
  }, FLIP_DURATION);
}

export function closePassport() {
  const cover = document.getElementById('passport-cover');
  const main  = document.getElementById('passport-main');
  main.classList.add('hidden');
  cover.classList.remove('hidden');
}

// ─── Stamp claim animation ──────────────────────────────────────────────────────────

export function animateStampClaim(el) {
  // just-claimed CSS klasa pokreće inkSpread keyframe
  el.addEventListener('animationend', () => {
    el.classList.remove('just-claimed');
  }, { once: true });
}

// ─── Reward unlock overlay ─────────────────────────────────────────────────────────

export function showRewardUnlock(key, onClose) {
  const meta = REWARD_META[key];
  document.getElementById('reward-icon').textContent  = meta.icon;
  document.getElementById('reward-title').textContent = meta.label.toUpperCase() + ' OTKLJUČANO!';
  document.getElementById('reward-desc').textContent  = meta.desc;

  const overlay = document.getElementById('reward-overlay');
  overlay.classList.remove('hidden');

  // Unlock glow na reward item u listu
  const rewardEl = document.getElementById(`reward-${key}`);
  if (rewardEl) {
    rewardEl.classList.add('just-unlocked');
    rewardEl.addEventListener('animationend', () =>
      rewardEl.classList.remove('just-unlocked'), { once: true });
  }

  document.getElementById('reward-close').onclick = () => {
    overlay.classList.add('hidden');
    if (onClose) onClose();
  };
}

// ─── Onboarding step machine ─────────────────────────────────────────────────────────

export function runOnboarding(onDone) {
  const frames = document.querySelectorAll('.onboarding-frame');
  const dots   = document.querySelectorAll('.dot');
  const btn    = document.getElementById('onboarding-next');
  const overlay = document.getElementById('onboarding');
  let current = 0;

  function goTo(idx) {
    frames.forEach((f, i) => f.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    current = idx;
    btn.textContent = current < frames.length - 1 ? 'Nastavi →' : 'Počni!';
  }

  btn.addEventListener('click', () => {
    if (current < frames.length - 1) {
      goTo(current + 1);
    } else {
      overlay.classList.add('hidden');
      if (onDone) onDone();
    }
  });

  goTo(0);
}
