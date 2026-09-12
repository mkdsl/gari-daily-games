/**
 * location.js — Guncati imanje lokacije i opis po satu
 */

/**
 * Opis lokacije/scene po satu
 * @param {number} hour
 * @returns {{ name: string, description: string }}
 */
export function locationByHour(hour) {
  const scenes = {
    7:  { name: 'Kuhinja', description: 'Kafu praviš. Kroz prozor — livada u beloj izmaglici.' },
    8:  { name: 'Kapija', description: 'Slavko stoji. Vreće đubreta blistaju na jutarnjem suncu.' },
    9:  { name: 'Terasa', description: 'Telefon zvoni. Novinarka je napolju, čeka.' },
    10: { name: 'Livada', description: 'Toma hoda sporim korakom. Sve se vidi sad na dnevnoj svetlosti.' },
    11: { name: 'Šatori', description: 'Poslednji šatori se pakouju. Pronalazaš stvari.' },
    12: { name: 'Terasa u hladu', description: 'Podne. Hrana, zamor, razgovor.' },
    13: { name: 'Kamp zona', description: 'Poslednji gosti. Tišina počinje da se vraća.' },
    14: { name: 'Magacin', description: 'Inventar, popravke, liste. Popodnevno sunce je teško.' },
    15: { name: 'Instagram DM', description: 'Ekran. Poruke, reakcije. Virtuelni ostatak festivala.' },
    16: { name: 'Dvorište', description: 'Senka se proteže. Dan se naginje.' },
    17: { name: 'Sala za meeting', description: 'Sto, beleške, zlatni sat kroz prozor.' },
    18: { name: 'Polje', description: 'Trava, sumrak, poslednji napor.' },
    19: { name: 'Kapija — odlazak', description: 'Dan se zatvara. Kapija. Tišina.' }
  };
  return scenes[hour] || { name: 'Guncati imanje', description: 'Festival je završen.' };
}

/**
 * Brand info za Guncati
 */
export const GUNCATI_INFO = {
  name: 'Guncati imanje',
  tagline: 'Zabavni radni park',
  region: 'Srbija',
  brand: 'MKDSLend'
};

/**
 * Kluboslavija info (za N7 nod)
 */
export const KLUBOSLAVIJA_INFO = {
  name: 'Kluboslavija',
  turneja2026: ['Avala (20.06)', 'Štrand', 'Sarajevo', 'Guncati (grand finale)'],
  tagline: 'Turneja 2026'
};
