/**
 * unlock-tree.js — 21 unlock po reputaciji
 */

export const UNLOCK_TREE = [
  {
    id: 'start',
    rep: 0,
    type: 'tema',
    value: 'suvozid',
    description: 'Suvozid tema dostupna. Max 4 polaznika. Alatko u timu.',
    icon: '🪨'
  },
  {
    id: 'u_25',
    rep: 25,
    type: 'achievement',
    value: 'prva_sesija',
    description: 'Achievement: Prva Sesija',
    icon: '🏆'
  },
  {
    id: 'u_50',
    rep: 50,
    type: 'multi',
    value: { tema: 'inokulacija', staff: 'brana' },
    description: 'Inokulacija tema. Brana Barakonja dostupan kao stručnjak.',
    icon: '🍄'
  },
  {
    id: 'u_75',
    rep: 75,
    type: 'participants',
    value: 5,
    description: 'Možeš primiti 5 polaznika.',
    icon: '👥'
  },
  {
    id: 'u_100',
    rep: 100,
    type: 'tema',
    value: 'rammed_earth',
    description: 'Rammed Earth tema unlock.',
    icon: '🏗️'
  },
  {
    id: 'u_125',
    rep: 125,
    type: 'staff',
    value: 'cana',
    description: 'Cana Ćup — konzervirana hrana +5 energije po obroku, -25% troškovi hrane.',
    icon: '🫙'
  },
  {
    id: 'u_150',
    rep: 150,
    type: 'incident_option',
    value: { incident: 'INC_03', option: 2 },
    description: 'INC_03: opcija "Pozajmi od komšije" dostupna.',
    icon: '🤝'
  },
  {
    id: 'u_175',
    rep: 175,
    type: 'participants',
    value: 6,
    description: 'Možeš primiti 6 polaznika.',
    icon: '👥'
  },
  {
    id: 'u_200',
    rep: 200,
    type: 'multi',
    value: { tema: 'permakultura', staff: 'zemljan' },
    description: 'Permakultura Dizajn tema. Zemljan Zidović stručnjak.',
    icon: '🌿'
  },
  {
    id: 'u_250',
    rep: 250,
    type: 'session_days',
    value: 2,
    description: '2-dnevna sesija unlock.',
    icon: '📅'
  },
  {
    id: 'u_300',
    rep: 300,
    type: 'applicant_pool',
    value: 20,
    description: 'Applicant pool +20 kandidata.',
    icon: '📋'
  },
  {
    id: 'u_350',
    rep: 350,
    type: 'participants',
    value: 7,
    description: 'Možeš primiti 7 polaznika.',
    icon: '👥'
  },
  {
    id: 'u_400',
    rep: 400,
    type: 'tema',
    value: 'akvakultura',
    description: 'Akvakultura tema.',
    icon: '🐟'
  },
  {
    id: 'u_450',
    rep: 450,
    type: 'tool_upgrade',
    value: { time_reduction: 0.20 },
    description: 'Premium alat — -20% vreme praktičnog rada.',
    icon: '🔨'
  },
  {
    id: 'u_500',
    rep: 500,
    type: 'multi',
    value: { achievement: 'polovina_puta', share_card: true },
    description: 'Achievement: Polovina Puta. Share karta aktivna.',
    icon: '⭐'
  },
  {
    id: 'u_550',
    rep: 550,
    type: 'multi',
    value: { participants: 8, session_days: 3 },
    description: 'Max 8 polaznika (v1 hard cap). 3-dnevna sesija unlock.',
    icon: '🎓'
  },
  {
    id: 'u_600',
    rep: 600,
    type: 'tema',
    value: 'kombinovani',
    description: 'Kombinovani Modul tema.',
    icon: '🏡'
  },
  {
    id: 'u_700',
    rep: 700,
    type: 'returning_participants',
    value: 2,
    description: '2 stalna polaznika se vraćaju svake sezone.',
    icon: '🔄'
  },
  {
    id: 'u_800',
    rep: 800,
    type: 'multi',
    value: { achievement: 'guncati_link', brand_active: true },
    description: 'Achievement + Guncati link aktivan na svim ekranima.',
    icon: '🌿'
  },
  {
    id: 'u_900',
    rep: 900,
    type: 'tema',
    value: 'muzika_prostor',
    description: '"Muzika i Prostor" tema.',
    icon: '🎵'
  },
  {
    id: 'u_950',
    rep: 950,
    type: 'canvas_building',
    value: 'nova_zgrada',
    description: 'Nova zgrada se pojavljuje na Canvas-u.',
    icon: '🏠'
  },
  {
    id: 'u_1000',
    rep: 1000,
    type: 'multi',
    value: {
      achievement: 'zivo_uciliste',
      prestige_prompt: true,
      mkdslend_secret: true
    },
    description: 'Achievement: Živo Učilište. Prestiž prompt. MKDSLend secret.',
    icon: '✨'
  }
];

/**
 * Vraca sve unlock-ove koji se triguju za dati rep range
 * @param {number} prevRep
 * @param {number} newRep
 * @returns {Array}
 */
export function getTriggeredUnlocks(prevRep, newRep) {
  return UNLOCK_TREE.filter(u => u.rep > prevRep && u.rep <= newRep);
}

/**
 * Vraca sve unlock-ove do repuatcije
 */
export function getUnlocksUpTo(rep) {
  return UNLOCK_TREE.filter(u => u.rep <= rep);
}
