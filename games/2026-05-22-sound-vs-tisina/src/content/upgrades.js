// upgrades.js — 24 upgrade items
export const UPGRADES = [
  // TIER 1 — basic gear
  { id: 'subwoofer',     name: 'Subwoofer',          cost: 800,  bonus: { maxDb: 5 },    requires: null,          desc: '+5 dB bas udarac na Main Stage' },
  { id: 'fill_speaker',  name: 'Fill Speaker',        cost: 600,  bonus: { fillDb: 8 },   requires: null,          desc: '+8 dB raspored za Fill Zone' },
  { id: 'di_box',        name: 'DI Box',              cost: 300,  bonus: { clarity: 1 },  requires: null,          desc: 'Smanjuje distorziju, +5% happiness' },
  { id: 'stage_monitor', name: 'Stage Monitor',       cost: 400,  bonus: { monDb: 5 },    requires: null,          desc: '+5 dB za Monitor zonu' },

  // TIER 2 — mid-level
  { id: 'line_array',    name: 'Line Array',          cost: 2000, bonus: { maxDb: 3, range: 20 }, requires: 'subwoofer',  desc: '+3 dB + bolji domet signala' },
  { id: 'horn_tweeter',  name: 'Horn Tweeter',        cost: 900,  bonus: { fillDb: 3 },   requires: 'fill_speaker', desc: 'Bolje rasipanje visina za Fill' },
  { id: 'delay_tower',   name: 'Delay Tower',         cost: 1200, bonus: { delayDb: 7 },  requires: null,          desc: 'Novi delay zvucnik, pokriva back zone' },
  { id: 'bass_trap',     name: 'Bass Trap',           cost: 700,  bonus: { reflectionMod: -2 }, requires: null,     desc: 'Smanjuje refleksije, -2 dB komšija' },
  { id: 'soundwall',     name: 'Zvucni Zid',          cost: 1500, bonus: { neighborBlock: 3 }, requires: 'bass_trap', desc: '-3 dB prema susednoj strani' },
  { id: 'cardioid_sub',  name: 'Kardioidni Sub',      cost: 1800, bonus: { neighborBlock: 4 }, requires: 'subwoofer', desc: 'Usmerava bas prema plesištu' },

  // TIER 3 — pro gear
  { id: 'dsp_processor', name: 'DSP Procesor',        cost: 2500, bonus: { happiness: 10 }, requires: 'line_array', desc: '+10% happiness efikasnost' },
  { id: 'active_xover',  name: 'Aktivni Crossover',   cost: 1800, bonus: { clarity: 2 },  requires: 'dsp_processor', desc: 'Pro zvuk, +8% happiness' },
  { id: 'amp_upgrade',   name: 'Upgrade Pojačala',    cost: 1200, bonus: { maxDb: 4 },    requires: 'line_array',  desc: '+4 dB kapacitet' },
  { id: 'monitor_wedge', name: 'Wedge Monitor',       cost: 1100, bonus: { monDb: 6 },    requires: 'stage_monitor', desc: '+6 dB za monitor, bolji groove za DJ' },

  // TIER 4 — venue upgrades
  { id: 'acoustic_panels', name: 'Akustične Ploce',   cost: 3000, bonus: { reflectionMod: -3 }, requires: 'soundwall', desc: 'Obloge smanjuju refleksije za -3 dB' },
  { id: 'crowd_barrier',   name: 'Ograda Publike',    cost: 800,  bonus: { safety: 1 },   requires: null,          desc: 'Bolja zona kontrole gomile' },
  { id: 'tent_stage',      name: 'Tendni Krov',       cost: 2200, bonus: { rainProtect: true }, requires: null,      desc: 'Zastita od kiše, nema refleksija' },
  { id: 'generator_pro',   name: 'Pro Generator',     cost: 1600, bonus: { failProof: true }, requires: null,       desc: 'Sprečava equipment_fail event' },

  // TIER 5 — elite
  { id: 'line_array_v2',  name: 'Line Array v2',      cost: 4000, bonus: { maxDb: 6, range: 30 }, requires: 'line_array', desc: '+6 dB, pokriva čitav teren' },
  { id: 'arc_system',     name: 'ARC Sistem',         cost: 5000, bonus: { autoEQ: true },  requires: 'dsp_processor', desc: 'Auto-EQ prilagodava se live' },
  { id: 'crowd_mics',     name: 'Crowd Mikrofoni',    cost: 1500, bonus: { happyFeedback: true }, requires: null,    desc: 'Meri odziv publike, +feedback' },
  { id: 'vip_zone',       name: 'VIP Zona',           cost: 2800, bonus: { reputationBonus: 20 }, requires: null,   desc: '+20 reputacija po eventu' },
  { id: 'laser_rig',      name: 'Laser Rig',          cost: 3500, bonus: { happinessBonus: 15 }, requires: 'vip_zone', desc: '+15 happiness vizuelnim efektom' },
  { id: 'avala_ready',    name: 'Avala Setup',         cost: 8000, bonus: { allZones: 3 }, requires: 'arc_system',  desc: 'Pun festival setup, +3 dB svuda' }
];
