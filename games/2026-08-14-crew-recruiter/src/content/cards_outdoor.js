// content/cards_outdoor.js — Outdoor signature cards (power 5)

/** @type {Array<{defId: string, name: string, role: string, power: number, rarity: string, flavor: string, eventSet: string}>} */
export const OUTDOOR_CARDS = [
  {
    defId: 'out-t', name: 'Terenska Legenda', role: 'tonac', power: 5, rarity: 'signature', eventSet: 'outdoor',
    flavor: 'Čuje razliku između vetra i basa. Prilagođava sistem na licu mesta.'
  },
  {
    defId: 'out-h', name: 'Polje Govori', role: 'host', power: 5, rarity: 'signature', eventSet: 'outdoor',
    flavor: 'Bez scene, bez problema. Njen glas dolazi do poslednjeg reda.'
  },
  {
    defId: 'out-c', name: 'Nebo i Kadar', role: 'content', power: 5, rarity: 'signature', eventSet: 'outdoor',
    flavor: 'Zlatni sat, drone, publika — sve u jednom snimku.'
  },
  {
    defId: 'out-l', name: 'Teren Spreman', role: 'logistika', power: 5, rarity: 'signature', eventSet: 'outdoor',
    flavor: 'Agregate, šatori, kablovi — lokacija postaje sala za sat vremena.'
  },
  {
    defId: 'out-o', name: 'Kapija Polja', role: 'obezbedjenje', power: 5, rarity: 'signature', eventSet: 'outdoor',
    flavor: 'Perimeter zatvoren. Deset tačaka, jedan odgovor: sve pod kontrolom.'
  }
];

/**
 * Guncati Grand Finale bonus cards — unlock after 6 completed runs in Outdoor tier.
 * Mix into Outdoor deck for experienced players; strengthen Guncati brand narrative.
 * @type {Array<{defId: string, name: string, role: string, power: number, rarity: string, flavor: string, eventSet: string}>}
 */
export const GUNCATI_GRAND_CARDS = [
  {
    defId: 'gf-t', name: 'Permakulturni Tonac', role: 'tonac', power: 5, rarity: 'signature', eventSet: 'outdoor-guncati',
    flavor: 'Guncati Grand Finale 2026 — povratak na selo. Bas koji raste iz zemlje.'
  },
  {
    defId: 'gf-h', name: 'Bašta Host', role: 'host', power: 5, rarity: 'signature', eventSet: 'outdoor-guncati',
    flavor: 'Guncati Grand Finale 2026 — povratak na selo. Svaki gost je sused.'
  },
  {
    defId: 'gf-l', name: 'Kompost Logistika', role: 'logistika', power: 5, rarity: 'signature', eventSet: 'outdoor-guncati',
    flavor: 'Guncati Grand Finale 2026 — povratak na selo. Nula otpada, nula kompromisa.'
  },
  {
    defId: 'gf-c', name: 'Seoska Content Kreatorka', role: 'content', power: 5, rarity: 'signature', eventSet: 'outdoor-guncati',
    flavor: 'Guncati Grand Finale 2026 — povratak na selo. Priroda je filter.'
  },
  {
    defId: 'gf-o', name: 'Prirodnjak Obezbeđenje', role: 'obezbedjenje', power: 5, rarity: 'signature', eventSet: 'outdoor-guncati',
    flavor: 'Guncati Grand Finale 2026 — povratak na selo. Teren poznaje bolje od tebe.'
  }
];
