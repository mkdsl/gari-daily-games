// venue-select.js — venue selection grid
import { VENUES } from '../content/venues.js';
import { isLevelUnlocked, getCareerTitle } from '../systems/progression.js';

export function renderVenueSelect(state, onSelect) {
  const grid = document.getElementById('venue-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const badge = document.getElementById('career-badge');
  if (badge) badge.textContent = getCareerTitle(state.xp);

  VENUES.forEach((venue, index) => {
    const unlocked = isLevelUnlocked(index, state);
    const card = document.createElement('div');
    card.className = `venue-card ${unlocked ? 'unlocked' : 'locked'}`;
    card.dataset.venueIndex = index;

    const stars = '★'.repeat(venue.difficultyStars) + '☆'.repeat(5 - venue.difficultyStars);

    card.innerHTML = `
      <div class="vc-emoji">${unlocked ? venue.emoji : '🔒'}</div>
      <div class="vc-name">${venue.name}</div>
      <div class="vc-capacity">${venue.capacity.toLocaleString()} people</div>
      <div class="vc-stars">${stars}</div>
      ${!unlocked ? '<div class="vc-lock">Završi prethodni level</div>' : ''}
    `;

    if (unlocked) {
      card.addEventListener('click', () => onSelect(index));
      card.addEventListener('touchend', (e) => { e.preventDefault(); onSelect(index); });
    }

    grid.appendChild(card);
  });
}
