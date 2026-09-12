/**
 * dialogue.js — Dijalozi, reakcije, kratki tekstovi po situacijama
 */

/**
 * Reakcija posle izabrane opcije (flavor text)
 * @param {string} optionId
 * @returns {string|null}
 */
export function optionReaction(optionId) {
  const reactions = {
    // N1
    N1A: 'Put do stanice traje tačno 47 minuta. Razgovarate ceo put.',
    N1B: 'Kauč je malo kratak za njega. Nimalo ga ne smeta.',
    N1C: 'Taksi stiže za 12 minuta. Efikasno.',

    // N3
    N3A: 'Toma klima. "Znam. I ja sam."',
    N3B: 'Toma te gleda još sekund. Pa se okreće sa kafom.',

    // N4
    N4A: 'Slavko na kraju odlazi sa "vidimo se" umesto "žalim se".',
    N4B: 'Kafa sutra. Lista se produžuje za jedan stav.',
    N4C: 'Slavkova vrata se zatvaraju tiho.',

    // N7
    N7A: 'Novinarka upisuje: "Guncati — Kluboslavija 2026. Finale."',

    // N9
    N9A: 'Toma upisuje: "Šator 3 — pogledati dren." Detalji.',
    N9bA: 'Stranica sa "Muzička oprema — nedostaje backup" zadrži pogled.',

    // N14
    N14B: 'Dve parče, dve priče. Toma pita: "I šta smo naučili?"',
    N14C: 'Volonteri uzimaju uz "hvala" koji zvuči kao da to misle.',

    // N21
    N21A: '"Već znam šta treba da popravimo." Toma počinje da piše.',
    N21B: '"Shvatam." Toma zapiše i zatvori svesku.',

    // N22
    N22B: 'Story: "Posle svakog festivala, zemlja se vraća sebi." 14 reposta.',

    // N30
    N30B: 'Dva ključa. Kratka tišina. Isto.',

    // N31
    N31A: 'Petnaest minuta. Sve što se desilo sedne negde u grudima.',

    // N32
    N32A: 'Stavka 1: "Baterija za tablicu." Stavka 2: "Slavkova kafa."',
    N32C: '"Brate, bilo je stvarno dobro." — Marko, 23:47'
  };
  return reactions[optionId] || null;
}

/**
 * Intro tekst za svaki sat
 * @param {number} hour
 * @returns {string}
 */
export function hourIntroText(hour) {
  const intros = {
    7:  'Sunce je izašlo. Kafa je hladna. Dan počinje.',
    8:  'Jutro postaje stvarno. Komšija kuca na kapiji.',
    9:  'Svet se probudio. Telefon ne čeka.',
    10: 'Teren govori istinu. Sve se vidi na jutarnjoj svetlosti.',
    11: 'Predmeti bez vlasnika. Sitni problemi, pravi izbori.',
    12: 'Podne. Telo traži pauzu. Dan ne staje.',
    13: 'Gosti odlaze. Šta ostaje posle njih?',
    14: 'Popodnevno sunce je teško. Neke stvari se ne mogu ignorisati.',
    15: 'Zamor i komunikacija. Kako zatvoriti petlje.',
    16: 'Dan naginje. Poslednje prilike za male geste.',
    17: 'Zlatni sat. Ono što nisi uradio — sad ili nikad.',
    18: 'Sumrak i poslednji napori. Telo zna da se bliži kraj.',
    19: 'Dan se zatvara. Šta ostaje — to si ti odabrao.'
  };
  return intros[hour] || 'Dan ide dalje.';
}

/**
 * Transition poruka između sati
 * @param {number} fromHour
 * @param {number} toHour
 * @returns {string}
 */
export function hourTransitionText(fromHour, toHour) {
  const transitions = {
    '7-8':   'Jutro ulazi.',
    '8-9':   'Svet se budi.',
    '9-10':  'Sunce visoko.',
    '10-11': 'Dan se otvara.',
    '11-12': 'Podne dolazi.',
    '12-13': 'Pauza prošla.',
    '13-14': 'Popodne.',
    '14-15': 'Malo hladnije.',
    '15-16': 'Senke se proteže.',
    '16-17': 'Zlatni sat.',
    '17-18': 'Sumrak.',
    '18-19': 'Kraj dana.'
  };
  return transitions[`${fromHour}-${toHour}`] || `${toHour}:00`;
}
