/**
 * item.js — Predmeti koji se pojavljuju u nodovima (fotoaparat, igračka, novčanica...)
 */

/**
 * Predmeti referencisani u nodovima
 */
export const ITEMS = {
  fotoaparat: {
    id: 'fotoaparat',
    name: 'Stari analogni aparat',
    description: 'Mali, bez torbe. Možda ima film unutra.',
    node: 'N12',
    emoji: '📷'
  },
  igracka: {
    id: 'igracka',
    name: 'Crveni kamion',
    description: 'Dečija igračka. Jedna točkić kriva.',
    node: 'N20',
    emoji: '🚛'
  },
  fotografija: {
    id: 'fotografija',
    name: 'Stara fotografija',
    description: 'Pohabana. Lice koje ne poznaješ.',
    node: 'N11',
    emoji: '🖼️'
  },
  novcanica: {
    id: 'novcanica',
    name: 'Novčanica od 500 din',
    description: 'Nema načina da se zna čija je.',
    node: 'N25',
    emoji: '💴'
  },
  sintetizator: {
    id: 'sintetizator',
    name: 'DJ kofer sa sintetizatorom',
    description: 'Teški crni kofer. Vlasnik je nestao.',
    node: 'N27',
    emoji: '🎹'
  },
  sveska: {
    id: 'sveska',
    name: 'Tomina sveska',
    description: 'Tanke stranice, sitno pisanje. Beleške iz prošle godine.',
    node: 'N9B_PRESTIGE',
    emoji: '📓'
  }
};

/**
 * Nađi predmet po node ID-u
 * @param {string} nodeId
 * @returns {object|null}
 */
export function itemForNode(nodeId) {
  return Object.values(ITEMS).find(i => i.node === nodeId) || null;
}
