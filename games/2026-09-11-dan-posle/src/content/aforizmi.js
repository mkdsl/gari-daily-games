/**
 * aforizmi.js — Guncati/organizator aforistički micro-citati
 * Kratke filozofske rečenice za share i inner monologue
 */

export const AFORIZMI = [
  'Posle svakog festivala, zemlja se vraća sebi.',
  'Dan koji se pravilno zatvori otvara sledeći.',
  'Umor je nagrada za posao koji si stvarno odradio.',
  'Zajednica nije broj — to je ko ostaje da pomete.',
  'Nered uvek zna koliko si radio. Ne laže.',
  'Šator se pakuje — ali priča ostaje u travi.',
  'Organizator zna: nije tvoje kad odeš. Ali jeste dok si tu.',
  'Veza nije ono što kažeš. To je ono što uradiš u 08:20 kad zoveš taksi.',
  'Slavko će biti tu i sledeće godine. To nije pretnja — to je obećanje.',
  'Sećanja se ne prave na bini. Prave se za stolom sa kašom.',
  'Festival je završen kad zadnja vreća bude u kontejneru.',
  'Guncati je živo dok ima ko da digne olovku s trave.',
  'Ako si tu na jutrо, bio si pravi deo toga.',
  'Nekad je najvažnija odluka dana — spavati.'
];

/**
 * Random aforizam
 * @returns {string}
 */
export function randomAforizam() {
  return AFORIZMI[Math.floor(Math.random() * AFORIZMI.length)];
}

/**
 * Aforizam za ending
 * @param {string} endingId
 * @returns {string}
 */
export function aforizmForEnding(endingId) {
  const map = {
    zajednica: 'Posle svakog festivala, zemlja se vraća sebi.',
    dobar:     'Dan koji se pravilno zatvori otvara sledeći.',
    sledece:   'Organizator zna: nije tvoje kad odeš. Ali jeste dok si tu.',
    sagoreo:   'Nekad je najvažnija odluka dana — spavati.'
  };
  return map[endingId] || AFORIZMI[0];
}

/**
 * Share text za Instagram/Web Share
 * @param {string} endingId
 * @param {number} cs - Community Score
 * @returns {string}
 */
export function shareText(endingId, cs) {
  const aforizam = aforizmForEnding(endingId);
  return `"${aforizam}"\n\nDan Posle — ${cs.toFixed(1)} CS\ngari-daily-games`;
}
