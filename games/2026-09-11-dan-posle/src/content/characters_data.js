/**
 * characters_data.js — Opisni tekstovi i bio za likove
 */

export const CHARACTERS_DATA = {
  toma: {
    name: 'Toma Pejović',
    role: 'Veteran Guncati imanja',
    description: 'Bio je tu od prvog festivala. Zna svaki kamen. Ne priča puno — ali kad priča, vredi čuti.',
    arc: {
      distantan: 'Ne pojavljuje se puno.',
      prisutan:  'Prati iz daljine.',
      blizak:    'Deli dan sa tobom.',
      porodica:  'Deo je ovoga. Uvek je bio.'
    },
    quotes: [
      '"Šta je drugačije ovog puta?"',
      '"Znam. I ja sam."',
      '"Već znam šta treba da popravimo."',
      '"Shvatam."'
    ]
  },
  slavko: {
    name: 'Slavko',
    role: 'Komšija',
    description: 'Buni se svake godine. Svake godine se pomiri. Na kraju — dobra priča.',
    quotes: [
      '"Muzika do 02:00, zna cela ulica."',
      '"Dobro, jutros sam ionako umoran."'
    ]
  },
  ana: {
    name: 'Ana',
    role: 'Volonter',
    description: 'Bila je tu od petka. Radila bez pitanja. Zaslužuje pravo zbogom.',
    quotes: [
      '"Hvala ti za sve."'
    ]
  },
  novinarka: {
    name: 'Novinarka',
    role: 'Mediji',
    description: 'Pita prava pitanja. Ako je odbiješ, priča ide bez tebe.',
    quotes: [
      '"Guncati ulazi u Kluboslavija turneju 2026?"'
    ]
  }
};

/**
 * Kratki bio za ending screen
 * @param {GameState} state
 * @returns {Array<{name, mood, detail}>}
 */
export function endingCharacterSummary(state) {
  const result = [];
  const tomaCount = (state.tomaChoicesA || []).length;

  result.push({
    name: 'Toma',
    mood: tomaCount >= 3 ? 'Bliski saradnik' : tomaCount >= 1 ? 'Prisutan' : 'Distanciran',
    detail: tomaCount >= 3 ? 'Svaki razgovor — pravi.' : 'Niste puno pričali.'
  });

  if (state.chosenOptions['N4A'] || state.chosenOptions['N4B']) {
    result.push({
      name: 'Slavko',
      mood: 'Pomiren',
      detail: 'Nije ostala zamjerka.'
    });
  }

  return result;
}
