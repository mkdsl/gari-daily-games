/**
 * aforizmi.js — Aforizmi za ending screen i log poruke (Guncati-flavor).
 * Autor: Pera Period.
 */

/** Aforizmi za ending screen po kategoriji */
export const AFORIZMI = {
  jesen: [
    'Jesen ne prihvata izgovore. Uzima šta je uzela i odlazi.',
    'U jesen radimo za januar — januar ne pita zašto nisi stigao.',
    'Berba je govor koji biljka jednom godišnje izgovori. Slušaj.',
    'Zrelo voće pada samo ako je drvo zdravo. I čovek tako.',
    'Jesen je godišnji ispit. Zima su rezultati.',
  ],
  ajvar: [
    'Ajvar je strpljenje ukuvano. Niko ga nije napravio u žurbi.',
    'Svaka tegla ajvara je paprika koja je dočekala smisao.',
    'Miriš li onaj momenat kad ajvar prelazi u nešto više od paprike? To je zanat.',
  ],
  tursija: [
    'Turšija čeka da ti ne treba da čekaš. Mudrost podruma.',
    'Salamura zna šta pravi. Ti samo ne mešaj.',
    'Kiselo i slano su dogovor stariji od nas. Ne menjaj recept.',
  ],
  bacva: [
    'Bačva nije posuda — bačva je rokovanje sa vremenom.',
    'Ko propusti bačvu, ne propušta kupus. Propušta zimu.',
    'Sol i kupus su stari saveznici. Ti samo povezi ih na vreme.',
  ],
  rakija: [
    'Rakija nije piće. Rakija je filozofija destilisana.',
    'Šljiva postaje rakija. I čovek postaje ono kroz šta prođe.',
    'Domaća rakija ne traži etiketu. Nosi je sama.',
  ],
  guncati: [
    'Guncati nije imanje. Guncati je odluka da živiš drugačije.',
    'Zemlja vraća onoliko koliko joj daš pažnje. Ne dinar više.',
    'Svaka biljka koja raste na Guncatiju zna nešto što mi zaboravljamo.',
    'Selo nije nostalgija. Selo je odgovor.',
  ],
  prestige: [
    'Drugi put naučeni čovek. Treći put — majstor.',
    'Greška iz prošle sezone je seme za bolju narednu.',
    'Ko preživi prvu zimu, sledećoj se smeje.',
  ],
};

/**
 * Vraća nasumičan aforizam iz kategorije.
 * @param {string} category
 * @returns {string}
 */
export function randomAforiz(category = 'jesen') {
  const pool = AFORIZMI[category] || AFORIZMI.jesen;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Vraća aforizam koji odgovara tipu ereignaja.
 * @param {string} eventType - 'ajvar'|'tursija'|'bacva'|'rakija'|'jesen'
 * @returns {string}
 */
export function aforizmForEvent(eventType) {
  return randomAforiz(eventType);
}
