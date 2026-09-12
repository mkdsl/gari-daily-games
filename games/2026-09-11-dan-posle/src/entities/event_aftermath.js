/**
 * event_aftermath.js — Aftermath stanje imanja, fizički i emotivni ostaci festivala
 */

/**
 * Opis stanja imanja po satu i nered vrednosti
 * @param {number} hour
 * @param {number} nered
 * @returns {{ scene: string, detail: string }}
 */
export function afftermath(hour, nered) {
  if (hour <= 8) {
    if (nered >= 8) {
      return {
        scene: 'Jutarnji haos',
        detail: 'Vreće, flaše, šatori — svuda. Jutarnje sunce otkriva sve.'
      };
    }
    return {
      scene: 'Jutro posle',
      detail: 'Miris trave i ostataka. Dan počinje.'
    };
  }

  if (hour <= 12) {
    if (nered >= 6) {
      return {
        scene: 'Nered u podnevnom suncu',
        detail: 'Toplota pojačava mirise. Lista se produžuje.'
      };
    }
    return {
      scene: 'Polako sredimo',
      detail: 'Napredak je spor, ali primetan.'
    };
  }

  if (hour <= 16) {
    if (nered >= 5) {
      return {
        scene: 'Popodnevni zamor',
        detail: 'Nered ostaje. Energija pada.'
      };
    }
    return {
      scene: 'Imanje se vraća',
      detail: 'Livada počinje da se vidi. Dobar znak.'
    };
  }

  // 17-19
  if (nered >= 4) {
    return {
      scene: 'Dan se zatvara neuredno',
      detail: 'Neke stvari čekaju sutra.'
    };
  }
  return {
    scene: 'Počišćeno',
    detail: 'Imanje diše. Zemlja diše.'
  };
}

/**
 * Opis stanja po nered vrednosti (za HUD tooltip)
 * @param {number} nered
 * @returns {string}
 */
export function neredDescription(nered) {
  if (nered >= 9) return 'Potpuni haos.';
  if (nered >= 7) return 'Svuda nered.';
  if (nered >= 5) return 'Ima još posla.';
  if (nered >= 3) return 'Postepeno se sređuje.';
  if (nered >= 1) return 'Skoro počišćeno.';
  return 'Savršen red.';
}

/**
 * Ikone nereda — smanjuju se sa vrednosti
 * @param {number} nered - 0..10
 * @returns {string} - string od 🗑️ ikonica
 */
export function neredIcons(nered) {
  const count = Math.round(nered / 2); // 0..5 ikona
  return '🗑️'.repeat(count);
}
