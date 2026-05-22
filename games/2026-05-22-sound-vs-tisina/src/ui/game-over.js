// game-over.js — game over screen logic
import { getRandomLine } from '../content/dialogue.js';
import { calculateSessionXP } from '../systems/progression.js';
import { shareScore } from '../share.js';

export function showGameOver(state, isWin) {
  const screen = document.getElementById('screen-gameover');
  if (!screen) return;

  const icon = document.getElementById('go-result-icon');
  const title = document.getElementById('go-title');
  const statsEl = document.getElementById('go-stats');
  const mentorEl = document.getElementById('go-mentor');

  if (icon) icon.textContent = isWin ? '\u{1F389}' : '\u{1F507}';
  if (title) title.textContent = isWin ? 'Sjajno veče!' : 'Inspekcija te ugasila.';

  const xpEarned = calculateSessionXP(state);
  const avgHappiness = state.sessionStats.maxHappiness.toFixed(0);
  const complaints = state.sessionStats.complaints;
  const venue = state.currentVenue ? state.currentVenue.name : '?';
  const minNeighborSPL = state.sessionStats.minNeighborSPL < 999
    ? state.sessionStats.minNeighborSPL.toFixed(1) + ' dB'
    : '—';

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">Teren</span>
        <span class="stat-value">${venue}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Sreća publike (max)</span>
        <span class="stat-value">${avgHappiness}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Min SPL komšije</span>
        <span class="stat-value">${minNeighborSPL}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Pritužbe</span>
        <span class="stat-value ${complaints > 0 ? 'stat-bad' : 'stat-good'}">${complaints} / 3</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">XP zarađen</span>
        <span class="stat-value stat-xp">+${xpEarned} XP</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Karijera ukupno</span>
        <span class="stat-value">${state.xp} XP</span>
      </div>
    `;
  }

  const mentorCategory = isWin ? 'win' : 'game_over';
  const mentorLine = getRandomLine(mentorCategory);
  if (mentorEl) mentorEl.textContent = mentorLine;

  // Show/hide next venue button
  const nextBtn = document.getElementById('btn-next-venue');
  if (nextBtn) nextBtn.style.display = isWin ? 'inline-flex' : 'none';

  // Avala CTA
  const ktBtn = document.getElementById('btn-karta');
  if (ktBtn) {
    ktBtn.onclick = () => window.open('https://app.bilet.rs/show/261', '_blank');
  }

  // Share button — inject if not present
  const goActions = document.querySelector('.go-actions');
  if (goActions && !document.getElementById('btn-share')) {
    const shareBtn = document.createElement('button');
    shareBtn.id = 'btn-share';
    shareBtn.className = 'btn-secondary';
    shareBtn.textContent = '\u{1F4E4} Podeli rezultat';
    shareBtn.onclick = () => shareScore(state);
    goActions.appendChild(shareBtn);
  } else if (document.getElementById('btn-share')) {
    document.getElementById('btn-share').onclick = () => shareScore(state);
  }
}
