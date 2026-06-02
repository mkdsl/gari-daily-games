// share.js — Web Share API + clipboard fallback

/**
 * Dijeli rezultat koristeći Web Share API ili clipboard fallback.
 * @param {number} score
 * @param {number} level
 * @returns {Promise<void>}
 */
export async function shareScore(score, level) {
  const text = [
    `Pečurka Inokulator — ${score.toLocaleString()} poena, nivo ${level}/10!`,
    'Guncati inokulaciona akademija 🍄',
    'https://mkdsl.github.io/gari-daily-games/games/2026-06-02-pecurka-inokulator/',
  ].join('\n');

  try {
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await copyToClipboard(text);
    }
  } catch (err) {
    // Korisnik je otkazao share — ne reportuj kao grešku
    if (err?.name === 'AbortError') return;
    // Fallback: pokušaj clipboard
    try {
      await copyToClipboard(text);
    } catch {
      // Tiho ne uspijevamo (private mode, iframe sandbox...)
    }
  }
}

/**
 * Kopira tekst u clipboard.
 * @param {string} text
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Stari fallback: execCommand
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}
