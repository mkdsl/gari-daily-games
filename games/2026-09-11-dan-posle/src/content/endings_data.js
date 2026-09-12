/**
 * endings_data.js — Tekstovi i opisi svakog endinga
 */

export const ENDINGS_DATA = {
  zajednica: {
    id: 'zajednica',
    title: 'Zajednica nastaje',
    emoji: '🌱',
    color: '#4a7c59',
    headline: 'Nije bio samo festival.',
    body: `Veze koje si izgradio ovog dana nisu nestale sa šatorima.
Sećanja su tu — u telefonu, u rukovanjima, u jutarnjoj kafi sa Tomom.

Guncati imanje nije lokacija. To je ono što ostaje u ljudima koji su bili tu.

Ti si to napravio.`,
    tag: 'Nisi bio organizator. Bio si katalizator.',
    shareQuote: 'Posle svakog festivala, zemlja se vraća sebi.'
  },

  dobar: {
    id: 'dobar',
    title: 'Dobar posao',
    emoji: '✓',
    color: '#3a6a9e',
    headline: 'Odradio si dobar dan.',
    body: `Ne sjajan. Ne savršen. Dobar.

Dan je zatvoren, imanje je (uglavnom) sređeno,
i svako ko je trebao da ode — otišao je sa osmehom.

To nije malo. Zapravo, to je tačno ono što je trebalo.`,
    tag: 'Dobar dan. Pravi dobar dan.',
    shareQuote: 'Dan koji se pravilno zatvori otvara sledeći.'
  },

  sledece: {
    id: 'sledece',
    title: 'Sledeće leto',
    emoji: '↩',
    color: '#c8820a',
    headline: 'Nešto se završilo. Nešto počinje.',
    body: `Nije bio tvoj najbolji dan. Ali si tu, i još imaš snage.

Sledeće leto — drugačije. Toma zna. Ti znaš.
Lista grešaka je duga, a to je dobro.

Greška koju znaš je već pola rešena.`,
    tag: 'Organizator zna: nije tvoje kad odeš. Ali jeste dok si tu.',
    shareQuote: 'Organizator zna: nije tvoje kad odeš. Ali jeste dok si tu.',
    prestigeUnlock: true,
    prestigeMessage: 'Prestige unlock: Toma pamti. Novi scenariji dostupni u sledećem playthroughu.'
  },

  sagoreo: {
    id: 'sagoreo',
    title: 'Sagoreo si',
    emoji: '◌',
    color: '#b03030',
    headline: 'Dao si previše.',
    body: `Dan je zatvoren — ali si i ti zatvoren zajedno sa njim.

Imanje je (nekako) sređeno, ali ti nisi.
Sagoreo si, i to se oseti.

Sledeći put — ostavi nešto i za sebe.
Nije sebično. Nužno je.`,
    tag: 'Nekad je najvažnija odluka dana — spavati.',
    shareQuote: 'Nekad je najvažnija odluka dana — spavati.'
  }
};

/**
 * Vrati ending data po ID-u
 * @param {string} id
 * @returns {object}
 */
export function getEndingData(id) {
  return ENDINGS_DATA[id] || ENDINGS_DATA.dobar;
}
