import { TIMER_MS, FEEDBACK_TRANSITION_MS, QUESTIONS_COUNT } from './config.js';
import { QUESTIONS } from './questions.js';
import { startTimer, stopTimer } from './timer.js';
import { resetScoring, addAnswer, getScore, getTitle } from './scoring.js';
import { loadBestScore, saveBestScore } from './state.js';
import { setupInput } from './input.js';
import { renderIntro, renderQuestion, renderFeedback, renderFinal } from './ui.js';
import { shareResult } from './share.js';

const PLAY_URL = 'https://mkdsl.github.io/gari-daily-games/games/2026-05-28-dj-akademija/';

let phase = 'INTRO';
let questionIndex = 0;
let timerExpired = false;

function init() {
  setupInput(handleChoice);
  document.addEventListener('dja:replay', goIntro);
  goIntro();
}

function goIntro() {
  phase = 'INTRO';
  questionIndex = 0;
  resetScoring();
  renderIntro(goQuestion);
}

function goQuestion() {
  if (questionIndex >= QUESTIONS_COUNT) {
    goFinal();
    return;
  }
  phase = 'QUESTION';
  timerExpired = false;
  renderQuestion(QUESTIONS[questionIndex], questionIndex, QUESTIONS_COUNT);
  startTimer(TIMER_MS, onTimerTick, onTimerExpire);
}

function goFinal() {
  phase = 'FINAL';
  const score = getScore();
  const title = getTitle(score);
  saveBestScore(score);
  const best = loadBestScore();
  renderFinal(score, title, () => shareResult(title, score, PLAY_URL), best);
}

function onTimerTick(remaining) {
  const pct = (remaining / TIMER_MS) * 100;
  const fill = document.querySelector('.timer-fill');
  if (fill) fill.style.width = pct + '%';
  const num = document.querySelector('.timer-num');
  if (num) num.textContent = Math.ceil(remaining / 1000) + 's';
}

function onTimerExpire() {
  if (phase !== 'QUESTION') return;
  timerExpired = true;
  handleChoice(-1);
}

function handleChoice(selectedIdx) {
  if (phase !== 'QUESTION') return;
  if (timerExpired && selectedIdx !== -1) return;

  stopTimer();
  phase = 'FEEDBACK';

  const q = QUESTIONS[questionIndex];
  const isCorrect = selectedIdx === q.correct;
  addAnswer(isCorrect);
  renderFeedback(q, selectedIdx, selectedIdx === -1);

  setTimeout(() => {
    questionIndex++;
    goQuestion();
  }, FEEDBACK_TRANSITION_MS);
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn[data-idx]');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx, 10);
  handleChoice(idx);
});

document.addEventListener('DOMContentLoaded', init);
