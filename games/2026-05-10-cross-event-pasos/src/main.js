// main.js — init, state machine orchestration
import { isFirstVisit, saveProfile, loadProfile } from './state.js';
import { renderPassport, showStampDetail, renderOnboarding } from './ui.js';
import { runOnboarding, openPassport, closePassport } from './animations.js';
import { initAudio } from './audio.js';
import { initShare } from './share.js';

// ─── State Machine ────────────────────────────────────────────────────────────────
// COVER_CLOSED | OPENING | PASSPORT_MAIN | STAMP_DETAIL
// REWARD_UNLOCK | EXPORT_MODAL | ONBOARDING

export let appState = 'COVER_CLOSED';

export function setState(next) {
  appState = next;
}

// ─── Boot ────────────────────────────────────────────────────────────────────────

function init() {
  // Lazy audio init na prvom user gesture
  document.addEventListener('click', initAudio, { once: true });
  document.addEventListener('touchstart', initAudio, { once: true });

  initShare();
  wireButtons();

  if (isFirstVisit()) {
    setState('ONBOARDING');
    renderOnboarding();
    runOnboarding(onOnboardingDone);
  } else {
    setState('COVER_CLOSED');
    renderPassport();
  }
}

function onOnboardingDone() {
  // Postavi default profil ako korisnik nije uneo ime
  if (!loadProfile()) saveProfile('Klubnik');
  setState('COVER_CLOSED');
  renderPassport();
}

// ─── Wire buttons ────────────────────────────────────────────────────────────────

function wireButtons() {
  // Cover — otvori pasoš
  const cover = document.getElementById('passport-cover');
  cover.addEventListener('click', onCoverClick);
  cover.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') onCoverClick(); });

  // Zatvori pasoš
  document.getElementById('btn-close-passport').addEventListener('click', () => {
    setState('COVER_CLOSED');
    closePassport();
  });

  // Export modal
  document.getElementById('btn-export').addEventListener('click', () => {
    setState('EXPORT_MODAL');
    document.getElementById('export-modal').classList.remove('hidden');
  });
  document.getElementById('export-close').addEventListener('click', () => {
    setState('PASSPORT_MAIN');
    document.getElementById('export-modal').classList.add('hidden');
  });

  // Stamp detail zatvori
  document.getElementById('stamp-detail-close').addEventListener('click', () => {
    setState('PASSPORT_MAIN');
    document.getElementById('stamp-detail').classList.add('hidden');
  });

  // Reward close
  document.getElementById('reward-close').addEventListener('click', () => {
    setState('PASSPORT_MAIN');
    document.getElementById('reward-overlay').classList.add('hidden');
  });

  // Escape zatvara overlay-e
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeTopOverlay();
  });

  // Klik na backdrop zatvara overlay
  ['stamp-detail', 'export-modal', 'reward-overlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target === e.currentTarget) closeTopOverlay();
    });
  });
}

function onCoverClick() {
  if (appState !== 'COVER_CLOSED') return;
  setState('OPENING');
  openPassport(() => {
    setState('PASSPORT_MAIN');
    renderPassport();
  });
}

function closeTopOverlay() {
  if (appState === 'STAMP_DETAIL') {
    setState('PASSPORT_MAIN');
    document.getElementById('stamp-detail').classList.add('hidden');
  } else if (appState === 'EXPORT_MODAL') {
    setState('PASSPORT_MAIN');
    document.getElementById('export-modal').classList.add('hidden');
  } else if (appState === 'REWARD_UNLOCK') {
    setState('PASSPORT_MAIN');
    document.getElementById('reward-overlay').classList.add('hidden');
  }
}

// ─── Public: stamp klik (poziva ui.js) ──────────────────────────────────────────

export function onStampClick(slug) {
  if (appState !== 'PASSPORT_MAIN') return;
  setState('STAMP_DETAIL');
  showStampDetail(slug);
}

document.addEventListener('DOMContentLoaded', init);
