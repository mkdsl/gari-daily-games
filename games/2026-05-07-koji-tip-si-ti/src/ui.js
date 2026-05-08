// ui.js — Render logika za sve ekrane
// GDD: Mile Mehanika | 2026-05-07 | v1.0

import { ARCHETYPES } from './config.js';

/**
 * showScreen — Sakriva sve .screen divove, prikazuje onaj sa data-screen="{id}".
 * Koristi CSS klasu .screen--active.
 * @param {string} id — 'splash' | 'quiz' | 'result' | 'loading'
 */
export function showScreen(id) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('screen--active'));

  const target = document.querySelector(`[data-screen="${id}"]`);
  if (target) {
    target.classList.add('screen--active');
  }
}

/**
 * renderQuestion — Popunjava quiz ekran za dato pitanje.
 * @param {object} q — pitanje iz QUESTIONS (id, text, answers[])
 * @param {number} qIndex — 0-bazirani indeks (0–7)
 * @param {number} total — ukupan broj pitanja (8)
 */
export function renderQuestion(q, qIndex, total) {
  // Tekst pitanja
  const questionEl = document.getElementById('question-text');
  if (questionEl) {
    questionEl.textContent = q.text;
  }

  // Progress bar
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');
  const percent = Math.round(((qIndex + 1) / total) * 100);

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
  if (progressLabel) {
    progressLabel.textContent = `${qIndex + 1} / ${total}`;
  }

  // Odgovori
  const answersEl = document.getElementById('answers');
  if (!answersEl) return;

  // Remove old buttons completely — prevents ghost selection
  while (answersEl.firstChild) answersEl.removeChild(answersEl.firstChild);

  q.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer.text;
    btn.dataset.questionId = q.id;
    btn.dataset.answerIndex = index;
    answersEl.appendChild(btn);
  });
}

/**
 * renderResult — Popunjava result screen sa podacima arhetipa.
 * @param {string} archetypeKey — 'DJ' | 'PK' | 'SG' | 'EH' | 'CB' | 'SE'
 */
export function renderResult(archetypeKey) {
  const arch = ARCHETYPES[archetypeKey];
  if (!arch) return;

  const nameEl = document.getElementById('archetype-name');
  const descEl = document.getElementById('archetype-desc');
  const ctaLink = document.getElementById('cta-link');
  const quoteEl = document.getElementById('archetype-quote');

  if (nameEl) nameEl.textContent = arch.name;
  if (descEl) descEl.textContent = arch.description;
  if (ctaLink) {
    ctaLink.textContent = arch.cta.text;
    ctaLink.href = arch.cta.url;
  }
  if (quoteEl) quoteEl.textContent = arch.quote;

  // Postavi share tekst na window za main.js
  setShareText(archetypeKey);
}

/**
 * setShareText — Postavlja globalni window.__shareText za clipboard.
 * @param {string} archetypeKey
 */
export function setShareText(archetypeKey) {
  const arch = ARCHETYPES[archetypeKey];
  if (arch) {
    window.__shareText = arch.shareText;
  }
}

/**
 * showLoading — Prikazuje loading ekran, zatim poziva callback.
 * GDD §1: "Analiziramo tvoj profil..." — 1.5s fake delay.
 * @param {Function} callback — poziva se nakon delay-a
 */
export function showLoading(callback) {
  showScreen('loading');
  setTimeout(callback, 1500);
}

/**
 * showToast — Prikazuje kratku toast notifikaciju.
 * @param {string} message
 * @param {number} [duration=2000] — trajanje u ms
 */
export function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('toast--visible');

  setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, duration);
}
