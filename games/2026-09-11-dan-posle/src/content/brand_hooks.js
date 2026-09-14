/**
 * brand_hooks.js — Guncati / Kluboslavija CTA hooks po endingu
 */

const HOOKS = {
  zajednica: {
    label: 'Prijavi se za Guncati tim 2027 →',
    url: 'https://guncati.rs/volonteri',
    tooltip: 'Budi deo ekipe koja gradi Guncati svake godine'
  },
  prestige_sledeceleto: {
    label: 'Guncati grand finale — prati kad karte izađu →',
    url: 'https://guncati.rs',
    tooltip: 'Toma zna — Guncati grand finale čeka.'
  },
  default_kluboslavija: {
    label: 'Prati Kluboslavija →',
    url: 'https://instagram.com/kluboslavija',
    tooltip: null
  }
};

/**
 * Vrati CTA hook za dati ending
 * @param {string} endingId
 * @param {boolean} isPrestige
 * @param {number} cs
 * @returns {{ label: string, url: string, tooltip: string|null } | null}
 */
export function guncatiCTA(endingId, isPrestige = false, cs = 0) {
  if (endingId === 'zajednica') {
    return HOOKS.zajednica;
  }
  if (isPrestige && cs >= 8) {
    return HOOKS.prestige_sledeceleto;
  }
  return null;
}

/**
 * Achievement A3 promo tekst (šef zamenjuje pre narednog event-a)
 * @returns {string}
 */
export function achievementA3Promo() {
  return 'Prati Kluboslavija → instagram.com/kluboslavija';
}
