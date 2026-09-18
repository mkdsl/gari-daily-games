/**
 * share.js — Screenshot i share funkcionalnost.
 * html2canvas screenshot + Web Share API. Cross-event glue za Guncati/MKDSLend.
 */

/**
 * Generiše share tekst na osnovu game stanja.
 * @param {import('./state.js').GameState} state
 * @returns {string}
 */
export function generateShareText(state) {
  const tegleCount = state.tegle ? state.tegle.reduce((s, t) => s + (t.qty || 0), 0) : 0;
  const kasa = state.kasa || 0;
  const day = state.day || 1;
  return `Zimovnica — Dan ${day}/14, ${tegleCount} tegli, ${kasa} RSD kase. Igraj: https://mkdsl.github.io/gari-daily-games/games/2026-09-17-zimovnica/`;
}

/**
 * Deli score via Web Share API, fallback na clipboard.
 * @param {import('./state.js').GameState} state
 * @param {string} [endingId] - opcionalni ending ID za kontekst
 */
export async function shareScore(state, endingId) {
  const text = generateShareText(state);
  const url = 'https://mkdsl.github.io/gari-daily-games/games/2026-09-17-zimovnica/';

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Zimovnica', text, url });
      return { ok: true, method: 'native' };
    } catch (e) {
      if (e.name !== 'AbortError') {
        // Pad na clipboard ako nije korisnik otkazao
        return _clipboardFallback(text);
      }
      return { ok: false, method: 'cancelled' };
    }
  } else {
    return _clipboardFallback(text);
  }
}

/**
 * Pravi screenshot #app elementa i deli ga (sa score tekstom kao fallback).
 * Koristi html2canvas ako je dostupan, inače shareScore.
 * @param {import('./state.js').GameState} state
 */
export async function captureAndShare(state) {
  if (typeof html2canvas !== 'undefined') {
    try {
      const appEl = document.getElementById('app');
      const canvas = await html2canvas(appEl, {
        backgroundColor: '#1A120B',
        scale: 1,
        useCORS: false,
        logging: false
      });
      const blob = await _canvasToBlob(canvas);
      const file = new File([blob], 'zimovnica.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Zimovnica',
            text: generateShareText(state),
            files: [file]
          });
          return { ok: true, method: 'native-image' };
        } catch (e) {
          if (e.name !== 'AbortError') {
            return shareScore(state);
          }
          return { ok: false, method: 'cancelled' };
        }
      } else {
        // Browser ne podržava file share — deli kao tekst
        return shareScore(state);
      }
    } catch (e) {
      // html2canvas pao — deli kao tekst
      return shareScore(state);
    }
  } else {
    return shareScore(state);
  }
}

/**
 * Proverava da li je Web Share API dostupan.
 * @returns {boolean}
 */
export function canShare() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Proverava da li je sharing fajlova podržano.
 * @returns {boolean}
 */
export function canShareFiles() {
  if (!canShare()) return false;
  try {
    return navigator.canShare && navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] });
  } catch (e) {
    return false;
  }
}

// --- Privatne helper funkcije ---

/**
 * @param {string} text
 * @returns {Promise<{ok: boolean, method: string}>}
 */
async function _clipboardFallback(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true, method: 'clipboard' };
  } catch (e) {
    // Clipboard blokiran (file:// ili permission) — silent fail, caller prikazuje toast
    return { ok: false, method: 'clipboard-blocked' };
  }
}

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob>}
 */
function _canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}
