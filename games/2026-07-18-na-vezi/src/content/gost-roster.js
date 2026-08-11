/** 8 gostiju sa base reliability profilima */
import { getState } from '../state.js';
import { GAME_CONFIG, clamp } from '../config.js';

/** @type {Array<GostProfile>} */
export const GOST_ROSTER = [
  {
    id: 'g1',
    name: 'Domaćin sa Imanja',
    icon: '👨‍🌾',
    formats: ['dj_lajv', 'podkast', 'vlog_uzivo'],
    baseReliability: 85,
    baseNoShow: 0.05,
    engagementBonus: 0.08,
    desc: 'Domaći i pouzdan. Svi formati. Publika voli autentičnost.',
    standoutNote: 'Pita publiku za savete — chat eksplodira',
  },
  {
    id: 'g2',
    name: 'DJ Susedovo Dvorište',
    icon: '🎧',
    formats: ['dj_lajv'],
    baseReliability: 60,
    baseNoShow: 0.15,
    engagementBonus: 0.22,
    formatBonus: { dj_lajv: 0.22, podkast: 0.05, vlog_uzivo: 0.05 },
    desc: 'Lokalni DJ heroj. Visok engagement ali ne uvek pouzdan.',
    standoutNote: 'Pušta track koji je hit — TikTok spike',
  },
  {
    id: 'g3',
    name: 'DJ Iz Grada',
    icon: '🏙',
    formats: ['dj_lajv'],
    baseReliability: 45,
    baseNoShow: 0.25,
    engagementBonus: 0.30,
    formatBonus: { dj_lajv: 0.30 },
    tiktokSpikeGuarantee: true,
    desc: 'Urbani DJ. Ako dođe, publika poludi. Ali neredovno stiže.',
    standoutNote: 'Ekskluzivni drop — TikTok prolazi kroz krov',
  },
  {
    id: 'g4',
    name: 'Kum sa Farme',
    icon: '🐄',
    formats: ['podkast', 'vlog_uzivo'],
    baseReliability: 75,
    baseNoShow: 0.08,
    engagementBonus: 0.15,
    formatBonus: { podkast: 0.15, vlog_uzivo: 0.15 },
    desc: 'Priče sa sela. YouTube retencija odlična, IG priča savršena.',
    standoutNote: 'Ispriča priču o dedi — YouTube retencija skaci na 85%',
  },
  {
    id: 'g5',
    name: 'Gost-stručnjak',
    icon: '🎓',
    formats: ['podkast'],
    baseReliability: 65,
    baseNoShow: 0.12,
    engagementBonus: 0.18,
    formatBonus: { podkast: 0.18 },
    youtubeRetentionBonus: 0.20,
    desc: 'Expert intervju. YouTube zlatnik. TikTok ne razume.',
    standoutNote: 'Otkriva insajder info — komentari na YouTube-u se pale',
  },
  {
    id: 'g6',
    name: 'Sused (rotirajući)',
    icon: '🏡',
    formats: ['vlog_uzivo', 'podkast'],
    baseReliability: 70,
    baseNoShow: 0.10,
    engagementBonus: 0.06,
    desc: 'Drag ali skroman boost. Dobro za filling, ne za spike.',
    standoutNote: 'Spontana šala — publika se priključi',
  },
  {
    id: 'g7',
    name: 'DJ Prvi Put',
    icon: '🌟',
    formats: ['dj_lajv'],
    baseReliability: 40,
    baseNoShow: 0.30,
    engagementBonus: 0.35,
    formatBonus: { dj_lajv: 0.35 },
    highRiskHighReward: true,
    desc: 'Debi nastup. Ako uspe — legenda. Ako ne... no-show.',
    standoutNote: 'Prekida set spontano, publika ore — rekordni momentum',
  },
  {
    id: 'g8',
    name: 'Niko (solo)',
    icon: '🎙',
    formats: ['dj_lajv', 'podkast', 'vlog_uzivo'],
    baseReliability: 100,
    baseNoShow: 0.00,
    engagementBonus: 0.00,
    desc: 'Sigurni fallback. Bez iznenađenja, bez rizika.',
    isSolo: true,
  },
];

/**
 * Vraća profil gosta sa ažuriranom reliability iz state-a
 * @param {string} gostId
 * @returns {Object}
 */
export function getGostProfile(gostId) {
  const base = GOST_ROSTER.find(g => g.id === gostId);
  if (!base) return null;
  const state = getState();
  const currentReliability = gostId === 'g8' ? 100 :
    (state.guest_reliability[gostId] ?? base.baseReliability);
  return { ...base, reliability: currentReliability };
}

/**
 * Izračunava šansu za no-show
 * @param {Object} gostProfile - iz getGostProfile()
 * @returns {number} 0-1
 */
export function calcNoShowChance(gostProfile) {
  if (!gostProfile) return 0.5;
  if (gostProfile.isSolo) return 0;
  const base = gostProfile.baseNoShow;
  const adj = (gostProfile.reliability - 50) * GAME_CONFIG.NO_SHOW_ADJUST_PER_POINT;
  return clamp(base - adj, 0.03, 0.55);
}

/**
 * Filtrira goste kompatibilne sa formatom
 * @param {string} format
 * @returns {Array}
 */
export function getCompatibleGuests(format) {
  const state = getState();
  return GOST_ROSTER.map(g => ({
    ...g,
    reliability: g.id === 'g8' ? 100 : (state.guest_reliability[g.id] ?? g.baseReliability),
  })).filter(g => g.formats.includes(format));
}

/**
 * Razrešava da li gost dolazi (na početku emisije)
 * @param {string} gostId
 * @returns {{ arrived: boolean, noShow: boolean }}
 */
export function resolveGostArrival(gostId) {
  if (gostId === 'g8' || !gostId) return { arrived: true, noShow: false };
  const profile = getGostProfile(gostId);
  if (!profile) return { arrived: false, noShow: true };
  const chance = calcNoShowChance(profile);
  const noShow = Math.random() < chance;
  return { arrived: !noShow, noShow };
}

/**
 * Izračunava engagement bonus od gosta
 * @param {string} gostId
 * @param {string} format
 * @param {boolean} standout
 * @returns {number}
 */
export function calcGostEngagementBonus(gostId, format, standout) {
  if (gostId === 'g8') return 0;
  const profile = getGostProfile(gostId);
  if (!profile) return 0;
  const formatSpecific = profile.formatBonus?.[format] ?? profile.engagementBonus;
  return standout ? formatSpecific * 1.4 : formatSpecific;
}
