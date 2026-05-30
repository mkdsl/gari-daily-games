import { GUNCATI_CARDS } from './config.js';
import { saveToStorage } from './state.js';

const LS_KEY = 'akvasklop_cards';

export function initCards(state) {
  // Učitaj prethodno unlock-ovane kartice iz localStorage
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    state.unlockedCards = saved;
  } catch { state.unlockedCards = []; }
}

export function unlockNextCard(state) {
  // Posle svakog završenog runa, unlock sledeću kartu po redu
  // state.unlockedCards = lista card id-jeva
  // Ako sve 5 su unlocked, nema ništa
  const allIds = GUNCATI_CARDS.map(c => c.id);
  const nextId = allIds.find(id => !state.unlockedCards.includes(id));
  if (nextId) {
    state.unlockedCards.push(nextId);
    saveCardsToStorage(state.unlockedCards);
    return GUNCATI_CARDS.find(c => c.id === nextId);
  }
  return null;
}

function saveCardsToStorage(unlockedIds) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(unlockedIds));
  } catch {}
}

export function getUnlockedCards(state) {
  return GUNCATI_CARDS.filter(c => state.unlockedCards.includes(c.id));
}

export function showCardModal(card) {
  // Prikaži modal sa karticom
  const modal = document.getElementById('cardModal');
  const body = document.getElementById('cardModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="card-inner">
      <div style="font-size:2rem; margin-bottom:0.5rem">🌿</div>
      <h3>Guncati Zna: ${card.title}</h3>
      <p>${card.text}</p>
      ${!card.verified ? '<p class="card-verified">* Čeka verifikaciju od Brane</p>' : ''}
    </div>
  `;
  modal.classList.add('open');

  // Pin button
  document.getElementById('cardPinBtn')?.addEventListener('click', () => {
    // Nema pin funkcionalnosti u v1, samo close
    closeCardModal();
  });
  document.getElementById('cardNextBtn')?.addEventListener('click', closeCardModal);
}

export function closeCardModal() {
  document.getElementById('cardModal')?.classList.remove('open');
}

export function showAllCardsUI(state) {
  // Klik na "Guncati Knows" dugme u HUD — prikaži sve unlock-ovane kartice
  const unlocked = getUnlockedCards(state);
  if (unlocked.length === 0) {
    // Toast: "Završi prvi run da otključaš kartice"
    return;
  }
  // Prikaži prvu, sa "Sledeća" dugmetom za navigaciju
  let currentIdx = 0;
  const showCurrent = () => showCardModal(unlocked[currentIdx]);

  document.getElementById('cardNextBtn')?.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % unlocked.length;
    if (currentIdx === 0) closeCardModal();
    else showCurrent();
  });

  showCurrent();
}
