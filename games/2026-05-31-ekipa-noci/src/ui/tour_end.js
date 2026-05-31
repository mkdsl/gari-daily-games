/**
 * tour_end.js — Tour End screen za Ekipa Noći
 * Finalni lineup, Tour Score, event arc bar chart, share + bilet.rs CTA
 */

import { createCardElement } from '../render.js';

const BILET_RS_URL = 'https://bilet.rs/show/261';

/**
 * Renderuje Tour End screen.
 *
 * @param {Object}   tourData
 * @param {Array}    tourData.event_scores     — niz od 5 scoreova (brojevi)
 * @param {Array}    tourData.event_names      — niz od 5 imena evenata
 * @param {number}   tourData.tour_score       — ukupni tour score
 * @param {Array}    tourData.final_crew       — Card[] finalnog crew-a
 * @param {Object}   tourData.loyalty_bonuses  — { [cardId]: loyaltyBonus }
 * @param {string}   tourData.tour_rank        — 'S' | 'A' | 'B' | 'C' | 'D'
 *
 * @param {Function} onShare      — callback za share dugme
 * @param {Function} onPlayAgain  — callback za play again
 */
export function renderTourEnd(tourData, onShare, onPlayAgain) {
  const screenEl = document.getElementById('screen-tour-end');
  if (!screenEl) return;

  screenEl.innerHTML = '';

  const eventScores    = tourData.event_scores    || [];
  const eventNames     = tourData.event_names     || [];
  const tourScore      = tourData.tour_score      ?? 0;
  const finalCrew      = tourData.final_crew      || [];
  const loyaltyBonuses = tourData.loyalty_bonuses || {};
  const tourRank       = tourData.tour_rank       || _calcRank(tourScore);

  // --- HERO SECTION ---
  const heroEl = document.createElement('div');
  heroEl.classList.add('tour-end__hero');

  const heroLabel = document.createElement('p');
  heroLabel.classList.add('tour-end__hero-label');
  heroLabel.textContent = 'TURNEJA ZAVRŠENA';
  heroEl.appendChild(heroLabel);

  const rankEl = document.createElement('div');
  rankEl.classList.add('tour-end__rank', `tour-rank--${tourRank.toLowerCase()}`);
  rankEl.textContent = tourRank;
  heroEl.appendChild(rankEl);

  const tourScoreLabel = document.createElement('p');
  tourScoreLabel.classList.add('tour-end__score-label');
  tourScoreLabel.textContent = 'Tour Score';
  heroEl.appendChild(tourScoreLabel);

  const tourScoreEl = document.createElement('div');
  tourScoreEl.classList.add('tour-end__score');
  tourScoreEl.textContent = '0';
  heroEl.appendChild(tourScoreEl);

  screenEl.appendChild(heroEl);

  // Animiran count-up
  _animateCountUp(tourScoreEl, 0, tourScore, 1500);

  // --- EVENT ARC (bar chart) ---
  const arcSection = document.createElement('div');
  arcSection.classList.add('tour-end__arc');

  const arcTitle = document.createElement('h3');
  arcTitle.classList.add('tour-end__section-title');
  arcTitle.textContent = 'Event Results';
  arcSection.appendChild(arcTitle);

  const barChart = document.createElement('div');
  barChart.classList.add('tour-bar-chart');

  const maxScore = Math.max(...eventScores, 1);

  eventScores.forEach((score, idx) => {
    const barGroup = document.createElement('div');
    barGroup.classList.add('bar-group');

    const barLabel = document.createElement('span');
    barLabel.classList.add('bar-group__label');
    barLabel.textContent = eventNames[idx] || `Event ${idx + 1}`;
    barGroup.appendChild(barLabel);

    const barTrack = document.createElement('div');
    barTrack.classList.add('bar-group__track');

    const barFill = document.createElement('div');
    barFill.classList.add('bar-group__fill');
    // Boja po score-u
    if (score >= 60) barFill.classList.add('bar-fill--great');
    else if (score >= 31) barFill.classList.add('bar-fill--ok');
    else barFill.classList.add('bar-fill--bad');

    // Animiran width
    barFill.style.width = '0%';
    setTimeout(() => {
      barFill.style.width = `${(score / maxScore) * 100}%`;
    }, 200 + idx * 150);

    const barValue = document.createElement('span');
    barValue.classList.add('bar-group__value');
    barValue.textContent = score;

    barTrack.appendChild(barFill);
    barGroup.appendChild(barTrack);
    barGroup.appendChild(barValue);
    barChart.appendChild(barGroup);
  });

  arcSection.appendChild(barChart);
  screenEl.appendChild(arcSection);

  // --- FINALNI CREW ---
  const crewSection = document.createElement('div');
  crewSection.classList.add('tour-end__crew');

  const crewTitle = document.createElement('h3');
  crewTitle.classList.add('tour-end__section-title');
  crewTitle.textContent = 'Finalna Ekipa';
  crewSection.appendChild(crewTitle);

  const crewGrid = document.createElement('div');
  crewGrid.classList.add('tour-crew-grid');

  finalCrew.forEach(card => {
    const loyalty = loyaltyBonuses[card.id] || 0;
    const cardEl  = createCardElement(card, false, true, loyalty);
    cardEl.classList.add('tour-crew-card');

    // Loyalty badge
    if (loyalty > 0) {
      const loyaltyBadge = document.createElement('div');
      loyaltyBadge.classList.add('crew-loyalty-badge');
      loyaltyBadge.textContent = `🔥 Loyalty +${loyalty}`;
      cardEl.appendChild(loyaltyBadge);
    }

    crewGrid.appendChild(cardEl);
  });

  crewSection.appendChild(crewGrid);
  screenEl.appendChild(crewSection);

  // --- CTA SEKCIJA ---
  const ctaSection = document.createElement('div');
  ctaSection.classList.add('tour-end__cta');

  // Share dugme
  const shareBtn = document.createElement('button');
  shareBtn.classList.add('btn', 'btn--primary', 'btn--share');
  shareBtn.innerHTML = `<span>📤</span> Podeli rezultat`;
  shareBtn.addEventListener('click', () => {
    if (onShare) onShare({ tourScore, tourRank, eventScores });
    _handleShare(tourScore, tourRank, eventScores, eventNames);
  });
  ctaSection.appendChild(shareBtn);

  // bilet.rs CTA
  const biletLink = document.createElement('a');
  biletLink.classList.add('btn', 'btn--accent', 'btn--bilet');
  biletLink.href = BILET_RS_URL;
  biletLink.target = '_blank';
  biletLink.rel = 'noopener noreferrer';
  biletLink.innerHTML = `<span>🎫</span> Kupi kartu za pravu Avalu`;
  ctaSection.appendChild(biletLink);

  // Play Again
  const playAgainBtn = document.createElement('button');
  playAgainBtn.classList.add('btn', 'btn--ghost', 'btn--play-again');
  playAgainBtn.textContent = '↺ Igraj ponovo';
  playAgainBtn.addEventListener('click', () => {
    if (onPlayAgain) onPlayAgain();
  });
  ctaSection.appendChild(playAgainBtn);

  screenEl.appendChild(ctaSection);
}

/**
 * Handle share — Web Share API ili clipboard fallback.
 */
function _handleShare(tourScore, tourRank, eventScores, eventNames) {
  const text = [
    `🎵 Ekipa Noći — Tour završena!`,
    `Rank: ${tourRank} | Tour Score: ${tourScore}`,
    eventScores.map((s, i) => `${eventNames[i] || `Event ${i+1}`}: ${s}`).join(' | '),
    `Gari Daily Games — Odigraj i ti!`
  ].join('\n');

  if (navigator.share) {
    navigator.share({ title: 'Ekipa Noći', text })
      .catch(() => _copyToClipboard(text));
  } else {
    _copyToClipboard(text);
  }
}

function _copyToClipboard(text) {
  navigator.clipboard?.writeText(text)
    .then(() => alert('Rezultat kopiran u clipboard!'))
    .catch(() => console.warn('Clipboard not available'));
}

/**
 * Kalkuliše rank po tour score-u.
 */
function _calcRank(score) {
  if (score >= 280) return 'S';
  if (score >= 220) return 'A';
  if (score >= 160) return 'B';
  if (score >= 100) return 'C';
  return 'D';
}

/**
 * Animira count-up broj od start do end za duration ms.
 */
function _animateCountUp(el, start, end, duration) {
  const startTime = performance.now();
  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent  = Math.round(start + (end - start) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
