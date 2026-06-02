// systems/collision.js — 1D range check na timing baru

/**
 * Provjerava da li je klik unutar timing window-a.
 *
 * Redoslijed provjere:
 *   1. Fake zona (uvijek greška, čak i ako se preklapa sa zelenom)
 *   2. Golden window (2× score ako je aktivan)
 *   3. Zeleni prozor (normalan pogodak)
 *   4. Miss (van svega)
 *
 * @param {number} clickXNorm - normalizovana X pozicija klika na timing baru (0-1)
 * @param {Object} timingState - rezultat timing.getState()
 * @returns {{ hit: boolean, type: 'green'|'golden'|'fake'|'miss' }}
 */
export function checkClick(clickXNorm, timingState) {
  const { windowBounds, fakeBounds, goldenBounds } = timingState;

  // 1. Fake zona — uvijek greška
  if (fakeBounds) {
    if (clickXNorm >= fakeBounds.left && clickXNorm <= fakeBounds.right) {
      return { hit: false, type: 'fake' };
    }
  }

  // 2. Golden window — provjeravamo PRVO od zelene jer se može preklapati
  if (goldenBounds) {
    if (clickXNorm >= goldenBounds.left && clickXNorm <= goldenBounds.right) {
      return { hit: true, type: 'golden' };
    }
  }

  // 3. Zeleni prozor — ako je blink OFF (nevidljiv), klik ne važi (miss)
  if (windowBounds) {
    if (timingState.blinkState === false) {
      return { hit: false, type: 'miss' };
    }
    if (clickXNorm >= windowBounds.left && clickXNorm <= windowBounds.right) {
      return { hit: true, type: 'green' };
    }
  }

  // 4. Miss
  return { hit: false, type: 'miss' };
}
