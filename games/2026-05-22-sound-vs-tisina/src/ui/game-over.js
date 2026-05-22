// game-over.js — game over screen logic
import { getRandomLine } from '../content/dialogue.js';
import { calculateSessionXP } from '../systems/progression.js';

export function showGameOver(state, isWin) {
  const screen = document.getElementById('screen-gameover');
  if (!screen) return;

  const icon = document.getElementById('go-result-icon');
  const title = document.getElementById('go-title');
  const statsEl = document.getElementById('go-stats');
  const mentorEl = document.getElementById('go-mentor');

  if (icon) icon.textContent = isWin ? '🎉' : '🔇';
  if (title) title.textContent = isWin ? 'Sjajna večera!' : 'Inspekcija te ugasila.';

  const xpEarned = calculateSessionXP(state);
  const avgHappiness = state.sessionStats.maxHappiness.toFixed(0);
  const complaints = state.sessionStats.complaints;

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">Sreća publike</span>
        <span class="stat-value">${avgHappiness}%</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Pritužbe</span>
        <span class="stat-value ${complaints > 0 ? 'stat-bad' : 'stat-good'}">${complaints} / 3</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">XP zaraden</span>
        <span class="stat-value stat-xp">+${xpEarned} XP</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Karijera</span>
        <span class="stat-value">${state.xp} XP ukupno</span>
      </div>
    `;
  }

  const mentorCategory = isWin ? 'win' : 'game_over';
  const mentorLine = getRandomLine(mentorCategory);
  if (mentorEl) mentorEl.textContent = mentorLine;

  // Show/hide next venue button
  const nextBtn = document.getElementById('btn-next-venue');
  if (nextBtn) nextBtn.style.display = isWin ? 'inline-flex' : 'none';

  // CTA
  const ktBtn = document.getElementById('btn-karta');
  if (ktBtn) {
    ktBtn.onclick = () => window.open('https://app.bilet.rs/show/261', '_blank');
  }
}
