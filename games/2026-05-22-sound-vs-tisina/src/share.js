// share.js — score sharing via Web Share API
export async function shareScore(state) {
  const happiness = state.sessionStats.maxHappiness.toFixed(0);
  const venue = state.currentVenue ? state.currentVenue.name : 'nepoznat teren';
  const text = `🎛️ Sound vs Tišina — ${venue}: ${happiness}% sreća publike, ${state.sessionStats.complaints} pritužba. Avala 20. jun!`;
  const url = 'https://mkdsl.github.io/gari-daily-games/games/2026-05-22-sound-vs-tisina/';

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Sound vs Tišina', text, url });
      return;
    } catch (e) {
      // Fallback
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    showCopiedToast();
  } catch (e) {
    // ignore
  }
}

function showCopiedToast() {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'Link kopiran!';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
