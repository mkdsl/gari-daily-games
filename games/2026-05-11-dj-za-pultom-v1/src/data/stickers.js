// =============================================================================
// data/stickers.js — Macro Week 7×3 sticker paleta (v2)
// =============================================================================
// 9 Macro vektora + Recovery (3 tipa) + Hobby + Zovi covika (S2)
// =============================================================================

export const STICKERS = [
  // 9 Macro vector stickers
  { id: 'promo',      cat: 'vector', label: 'Promo',     short: 'V1', icon: 'megaphone', color: '#ff7a00' },
  { id: 'music',      cat: 'vector', label: 'Music',     short: 'V2', icon: 'disc',      color: '#ffb24a' },
  { id: 'knowledge',  cat: 'vector', label: 'Knowledge', short: 'V3', icon: 'book',      color: '#7ac0ff' },
  { id: 'mixing',     cat: 'vector', label: 'Mixing',    short: 'V4', icon: 'sliders',   color: '#9af28a' },
  { id: 'visual',     cat: 'vector', label: 'Izgled',    short: 'V5', icon: 'shirt',     color: '#d77af2' },
  { id: 'scene',      cat: 'vector', label: 'Scena',     short: 'V6', icon: 'users',     color: '#f0e155' },
  { id: 'finance',    cat: 'vector', label: 'Pare',      short: 'V7', icon: 'dollar',    color: '#7af2c1' },
  { id: 'energy',     cat: 'vector', label: 'San/Energija', short: 'V8', icon: 'moon',  color: '#5e85ff' },
  { id: 'reckless',   cat: 'vector', label: 'Reckless',  short: 'V9', icon: 'star',      color: '#ff4040',
    locked: true, unlock_hint: 'Knowledge tier 2+' },

  // Recovery (S2) — 3 tipa × 2 use = 6 total per sezona
  { id: 'recovery_tisina',       cat: 'recovery', label: 'Tisina',         short: 'R1', icon: 'silence', color: '#88a8b8', uses_left_field: 'tisina' },
  { id: 'recovery_integration',  cat: 'recovery', label: 'Integracija',    short: 'R2', icon: 'spiral',  color: '#a890c8', uses_left_field: 'integration' },
  { id: 'recovery_reality',      cat: 'recovery', label: 'Reality check',  short: 'R3', icon: 'eye',     color: '#7088b8', uses_left_field: 'reality' },

  // Hobby slot
  { id: 'hobby',      cat: 'lifestyle', label: 'Hobi', short: 'H', icon: 'leaf', color: '#9ab85a' },

  // Substance — Zovi covika (S2)
  { id: 'zovi_covika', cat: 'substance', label: 'Zovi covika', short: 'Z', icon: 'phone', color: '#c84a4a' }
];

export const STICKERS_BY_ID = STICKERS.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});

export const STICKERS_BY_CAT = STICKERS.reduce((acc, s) => {
  acc[s.cat] = acc[s.cat] || [];
  acc[s.cat].push(s);
  return acc;
}, {});

// Dani u nedelji (UI labels)
export const DAYS_OF_WEEK = ['Pon', 'Uto', 'Sre', 'Cet', 'Pet', 'Sub', 'Ned'];

// Slot delovi dana
export const SLOT_LABELS = ['Jutro', 'Popodne', 'Vece'];

// Pressure thresholds (skriveno time/energy budget — pretvara se u boju)
export const PRESSURE_THRESHOLDS = {
  light: 12,        // <= 12 slotova = lagana
  full: 17,         // <= 17 slotova = puna
  pressure: 19,     // <= 19 = pritisak
  // > 19 = pucas (crveno)
};
