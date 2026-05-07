// main.js — Entry point, event wiring, screen switcher
// GDD: Mile Mehanika | 2026-05-07 | v1.0

import { QUESTIONS } from './config.js';
import { state, recordAnswer, calculateResult, resetState } from './state.js';
import { showScreen, renderQuestion, renderResult, showLoading, showToast } from './ui.js';

// ─── History / beforeunload zaštita (GDD §1, Edge case 3) ─────────────────────

let quizActive = false;

function pushQuizState() {
  history.pushState({ quiz: true }, '');
}

window.addEventListener('popstate', (e) => {
  if (quizActive) {
    // Blokira browser back tokom quiza — gura novi state umesto nazad
    pushQuizState();
  }
});

window.addEventListener('beforeunload', (e) => {
  if (quizActive) {
    e.preventDefault();
    // Moderni browser-i ignorišu custom poruke, ali dijalog se prikazuje
    e.returnValue = 'Da li si siguran? Tvoj progres neće biti sačuvan.';
  }
});

// ─── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  showScreen('splash');

  // ── Start dugme ────────────────────────────────────────────────────────────
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      quizActive = true;
      pushQuizState();
      showScreen('quiz');
      renderQuestion(QUESTIONS[0], 0, QUESTIONS.length);
    });
  }

  // ── Answer klikovi (event delegation na #answers) ──────────────────────────
  const answersContainer = document.getElementById('answers');
  if (answersContainer) {
    answersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.answer-btn');
      if (!btn) return;

      // Vizuelni feedback — selektovan odgovor
      const allBtns = answersContainer.querySelectorAll('.answer-btn');
      allBtns.forEach(b => b.classList.remove('answer-btn--selected'));
      btn.classList.add('answer-btn--selected');

      // Onemogući dalje klikove dok tranzicija ne završi
      allBtns.forEach(b => { b.disabled = true; });

      const questionId = btn.dataset.questionId;
      const answerIndex = parseInt(btn.dataset.answerIndex, 10);

      // Pronađi pitanje i odgovor
      const question = QUESTIONS.find(q => q.id === questionId);
      if (!question) return;

      const answer = question.answers[answerIndex];
      if (!answer) return;

      recordAnswer(questionId, answer.scores, answerIndex);

      // Kratka pauza za vizuelni feedback pre tranzicije
      setTimeout(() => {
        if (state.currentQ < QUESTIONS.length) {
          // Sledeće pitanje
          renderQuestion(
            QUESTIONS[state.currentQ],
            state.currentQ,
            QUESTIONS.length
          );
        } else {
          // Quiz završen — loading screen, pa result
          quizActive = false; // beforeunload više nije aktivan
          showLoading(() => {
            const resultKey = calculateResult();
            showScreen('result');
            renderResult(resultKey);
          });
        }
      }, 250);
    });
  }

  // ── Share dugme ────────────────────────────────────────────────────────────
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const text = window.__shareText || '';
      if (!text) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => showToast('Kopirano! Spremi za FB/IG. 📋'))
          .catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    });
  }

  // ── Restart dugme ──────────────────────────────────────────────────────────
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetState();
      quizActive = false;
      showScreen('splash');
    });
  }
});

// ─── Clipboard fallback (document.execCommand — stari mobilni) ─────────────────

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Kopirano! Spremi za FB/IG. 📋');
  } catch {
    showToast('Kopiraj ručno: ' + text);
  }
  document.body.removeChild(textarea);
}
