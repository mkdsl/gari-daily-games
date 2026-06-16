import { CONFIG } from '../config.js';

// Season palettes
const SEASON_PALETTES = {
  1: {
    name: 'Proleće / Leto 2026',
    bg: '#0D1B2A',
    pultAccent: '#BF5FFF',
    binaAccent: '#FFB830',
    sumaAccent: '#40C87E',
    gold: '#FFD700',
    text: '#E8DCC8',
    starColor: '#E8DCC8',
    cloudColor: '#4a6080'
  },
  2: {
    name: 'Jesen 2026',
    bg: '#1A120A',
    pultAccent: '#FF6B35',
    binaAccent: '#C8A020',
    sumaAccent: '#8B4513',
    gold: '#DAA520',
    text: '#F0D9B5',
    starColor: '#F0D9B5',
    cloudColor: '#3a2a18'
  }
};

let activeSeason = 1;

export function applySeasonSkin(seasonNumber) {
  const palette = SEASON_PALETTES[seasonNumber] || SEASON_PALETTES[1];
  activeSeason = seasonNumber;

  const root = document.documentElement;
  root.style.setProperty('--bg', palette.bg);
  root.style.setProperty('--pult-accent', palette.pultAccent);
  root.style.setProperty('--bina-accent', palette.binaAccent);
  root.style.setProperty('--suma-accent', palette.sumaAccent);
  root.style.setProperty('--gold', palette.gold);
  root.style.setProperty('--text', palette.text);
  root.style.setProperty('--star-color', palette.starColor);
  root.style.setProperty('--cloud-color', palette.cloudColor);
}

export function getCurrentSeasonPalette() {
  return SEASON_PALETTES[activeSeason] || SEASON_PALETTES[1];
}

export function getSeasonName(seasonNumber) {
  return SEASON_PALETTES[seasonNumber]?.name || `Sezona ${seasonNumber}`;
}

export function initSeasonSkin(state) {
  applySeasonSkin(state?.season || 1);
}

// Calculate current season day (1-28)
export function getSeasonDay() {
  const seasonStart = new Date(CONFIG.SEASON_START || '2026-06-13');
  const now = new Date();
  const diffDays = Math.floor((now - seasonStart) / (1000 * 60 * 60 * 24));
  return Math.min(CONFIG.SEASON_DAYS || 28, Math.max(1, diffDays + 1));
}

export function getSeasonProgress() {
  const day = getSeasonDay();
  const total = CONFIG.SEASON_DAYS || 28;
  return { day, total, progress: day / total };
}
