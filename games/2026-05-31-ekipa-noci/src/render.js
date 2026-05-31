/**
 * render.js — DOM card rendering for Ekipa Noći
 * Kreira card elemente, fan layout, selected state
 */

// Tier boja mapa za base_score
const TIER_CLASS = {
  1: 'tier-teal',
  2: 'tier-purple',
  3: 'tier-gold'
};

// Trait badge boje
const TRAIT_COLORS = {
  Veteran:     'trait-veteran',
  Rookie:      'trait-rookie',
  Wildcard:    'trait-wildcard',
  Ekstrovert:  'trait-extrovert',
  Introvert:   'trait-introvert',
  HeavyHitter: 'trait-heavyhitter'
};

// Portrait CSS klase po arhetipima
const ARCHETYPE_PORTRAIT = {
  Veteran:     'portrait-veteran',
  Rookie:      'portrait-rookie',
  Wildcard:    'portrait-wildcard',
  HeavyHitter: 'portrait-heavyhitter',
  Ekstrovert:  'portrait-extrovert',
  Introvert:   'portrait-introvert'
};

/**
 * Vraća dominantni arhetip iz niza traits radi portreta.
 */
function getDominantArchetype(traits) {
  if (!traits || traits.length === 0) return 'Rookie';
  const priority = ['Wildcard', 'HeavyHitter', 'Veteran', 'Ekstrovert', 'Introvert', 'Rookie'];
  for (const p of priority) {
    if (traits.includes(p)) return p;
  }
  return traits[0];
}

/**
 * Kreira HTML element za jednu kartu.
 *
 * @param {Object} cardData       — podaci o karti iz game logike
 * @param {boolean} isSelected    — da li je karta trenutno selektovana
 * @param {boolean} isRetained    — da li je karta retained (loyaly crew)
 * @param {number}  loyaltyBonus  — 0 | 2 | 4 | 6, prikazuje se kao 🔥+N overlay
 * @returns {HTMLElement}
 */
export function createCardElement(cardData, isSelected = false, isRetained = false, loyaltyBonus = 0) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.cardId = cardData.id;
  card.dataset.role = cardData.role || '';

  if (isSelected)  card.classList.add('card--selected');
  if (isRetained)  card.classList.add('card--retained');

  const tier = cardData.tier || 1;
  card.classList.add(TIER_CLASS[tier] || 'tier-teal');

  // --- PORTRAIT ---
  const archetype = getDominantArchetype(cardData.traits);
  const portrait = document.createElement('div');
  portrait.classList.add('card__portrait', ARCHETYPE_PORTRAIT[archetype] || 'portrait-rookie');

  // Pixel art detalji unutar portreta (CSS-only silueta)
  const silhouette = document.createElement('div');
  silhouette.classList.add('card__silhouette');
  portrait.appendChild(silhouette);

  // Role icon chip unutar portreta (gornji levi)
  if (cardData.role) {
    const roleChip = document.createElement('span');
    roleChip.classList.add('card__role-chip');
    roleChip.textContent = roleIconFor(cardData.role);
    portrait.appendChild(roleChip);
  }

  card.appendChild(portrait);

  // --- NAME ---
  const name = document.createElement('div');
  name.classList.add('card__name');
  name.textContent = (cardData.name || 'UNKNOWN').toUpperCase();
  card.appendChild(name);

  // --- TRAITS ---
  if (cardData.traits && cardData.traits.length > 0) {
    const traitsEl = document.createElement('div');
    traitsEl.classList.add('card__traits');
    cardData.traits.forEach(trait => {
      const badge = document.createElement('span');
      badge.classList.add('trait-badge', TRAIT_COLORS[trait] || 'trait-default');
      badge.textContent = trait;
      traitsEl.appendChild(badge);
    });
    card.appendChild(traitsEl);
  }

  // --- BOTTOM ROW: cost + base_score ---
  const bottom = document.createElement('div');
  bottom.classList.add('card__bottom');

  const cost = document.createElement('span');
  cost.classList.add('card__cost');
  cost.textContent = `${cardData.cost ?? '?'} BP`;
  bottom.appendChild(cost);

  const score = document.createElement('span');
  score.classList.add('card__score', TIER_CLASS[tier] || 'tier-teal');
  score.textContent = cardData.base_score ?? '0';
  bottom.appendChild(score);

  card.appendChild(bottom);

  // --- LOYALTY BONUS OVERLAY ---
  if (loyaltyBonus > 0) {
    const loyaltyOverlay = document.createElement('div');
    loyaltyOverlay.classList.add('card__loyalty-overlay');
    loyaltyOverlay.textContent = `🔥+${loyaltyBonus}`;
    card.appendChild(loyaltyOverlay);
  }

  // --- RETAINED BANNER ---
  if (isRetained) {
    const retainedBanner = document.createElement('div');
    retainedBanner.classList.add('card__retained-banner');
    retainedBanner.textContent = 'EKIPA';
    card.appendChild(retainedBanner);
  }

  return card;
}

/**
 * Vraća emoji/tekst ikonu za rolu.
 */
function roleIconFor(role) {
  const map = {
    DJ:       '🎵',
    Host:     '🎤',
    Sound:    '🔊',
    Video:    '📹',
    Security: '🛡'
  };
  return map[role] || '★';
}

/**
 * Renderuje 3 karte u fan layout u zadati kontejner.
 *
 * @param {HTMLElement} containerEl   — #card-hand element
 * @param {Array}       cards         — niz od 3 card objekta
 * @param {string|null} selectedCardId
 * @param {Function}    onCardClick   — callback(cardId)
 */
export function renderHand(containerEl, cards, selectedCardId = null, onCardClick = null) {
  clearHand(containerEl);

  if (!cards || cards.length === 0) return;

  const fanPositions = [
    { rotate: -5, translateX: -20, translateY: 10, zIndex: 1 },
    { rotate:  0, translateX:   0, translateY:  0, zIndex: 2 },
    { rotate:  5, translateX:  20, translateY: 10, zIndex: 1 }
  ];

  cards.forEach((cardData, idx) => {
    const pos = fanPositions[Math.min(idx, fanPositions.length - 1)];
    const isSelected = selectedCardId !== null && String(cardData.id) === String(selectedCardId);
    const loyaltyBonus = cardData._loyaltyBonus || 0;
    const isRetained   = cardData._retained || false;

    const cardEl = createCardElement(cardData, isSelected, isRetained, loyaltyBonus);

    // Fan pozicija kao CSS custom properties
    cardEl.style.setProperty('--fan-rotate',     `${pos.rotate}deg`);
    cardEl.style.setProperty('--fan-translateX',  `${pos.translateX}px`);
    cardEl.style.setProperty('--fan-translateY',  `${pos.translateY}px`);
    cardEl.style.zIndex = pos.zIndex;
    cardEl.classList.add('card--fan');

    // Hover: ispravlja rotaciju
    cardEl.addEventListener('mouseenter', () => {
      if (!cardEl.classList.contains('card--selected')) {
        cardEl.style.transform = `translateX(${pos.translateX}px) translateY(-8px) rotateZ(0deg)`;
      }
    });
    cardEl.addEventListener('mouseleave', () => {
      if (!cardEl.classList.contains('card--selected')) {
        cardEl.style.transform = '';
      }
    });

    // Click handler
    if (onCardClick) {
      cardEl.addEventListener('click', () => onCardClick(cardData.id));
      cardEl.style.cursor = 'pointer';
    }

    // Animacija ulaska — malo kasnjenje po indeksu
    cardEl.style.animationDelay = `${idx * 80}ms`;
    cardEl.classList.add('card--entering');

    containerEl.appendChild(cardEl);
  });
}

/**
 * Briše sve karte iz kontejnera.
 *
 * @param {HTMLElement} containerEl
 */
export function clearHand(containerEl) {
  while (containerEl.firstChild) {
    containerEl.removeChild(containerEl.firstChild);
  }
}

/**
 * Ažurira selected state bez re-rendera — prebacuje CSS klase.
 *
 * @param {HTMLElement} containerEl
 * @param {string}      cardId
 */
export function updateSelectedCard(containerEl, cardId) {
  const allCards = containerEl.querySelectorAll('.card');
  allCards.forEach(cardEl => {
    const isThis = String(cardEl.dataset.cardId) === String(cardId);
    cardEl.classList.toggle('card--selected', isThis);
    // Reset inline transform da selected state preuzme
    if (isThis) {
      cardEl.style.transform = '';
    }
  });
}
