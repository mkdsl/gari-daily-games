/**
 * participant-archetypes.js — 7 arhetipova polaznika
 * Stats, reakcije na incidente, specijalni efekti
 */

export const ARCHETYPES = {
  radoznali_student: {
    id: 'radoznali_student',
    name: 'Radoznali Student',
    emoji: '🎓',
    description: 'Entuzijastičan, pun pitanja, ponekad previše.',
    base_energy: 90,
    base_curiosity: 95,
    base_physical: 60,
    energy_decay_rate: 1.0,   // multiplikator standardnog pada energije
    satisfaction_baseline: 0.7,
    // Incident modifikatori
    incident_weights: { INC_01: 2 },  // INC_01 cescije kad je u grupi
    // Specijalni efekti
    special: {
      // Zadovoljstvo pada ako nema pitanja >2h
      no_questions_penalty: { hours: 2, satisfaction_delta: -5 }
    },
    // Reakcija na aktivnosti (multiplikator satisfaction_base)
    activity_reaction: {
      teorija: 1.2,
      demonstracija: 1.0,
      prakticni_rad: 0.9,
      pauza: 1.0,
      evaluacija: 1.1
    },
    portraits: ['🎓', '📖', '🔬']  // random emoji portret
  },

  iskusni_farmer: {
    id: 'iskusni_farmer',
    name: 'Iskusni Farmer',
    emoji: '👨‍🌾',
    description: 'Dekade iskustva na terenu. Nestrpljiv sa teorijom.',
    base_energy: 75,
    base_curiosity: 50,
    base_physical: 95,
    energy_decay_rate: 0.8,
    satisfaction_baseline: 0.6,
    incident_weights: {},
    special: {
      // Teorija >2h triguje INC_13 sa weight+3
      theory_impatience: { hours: 2, inc_weight_boost: { INC_13: 3 } },
      // Praktični rad uvek +5 zadovoljstvo
      hands_on_bonus: 5
    },
    activity_reaction: {
      teorija: 0.6,
      demonstracija: 1.1,
      prakticni_rad: 1.5,
      pauza: 0.9,
      evaluacija: 0.8
    },
    portraits: ['👨‍🌾', '🌾', '🚜']
  },

  kuvar_u_tranziciji: {
    id: 'kuvar_u_tranziciji',
    name: 'Kuvar u Tranziciji',
    emoji: '👨‍🍳',
    description: 'Traži promenu karijere, zainteresovan za fermentaciju i hranu.',
    base_energy: 80,
    base_curiosity: 80,
    base_physical: 70,
    energy_decay_rate: 0.95,
    satisfaction_baseline: 0.65,
    incident_weights: {},
    special: {
      // INC_09 (hrana) daje -20 zadovoljstvo specifično njemu
      inc09_extra_penalty: -20,
      // Inokulacija tema daje +10 satisfaction
      inokulacija_bonus: 10
    },
    activity_reaction: {
      teorija: 0.9,
      demonstracija: 1.2,
      prakticni_rad: 1.1,
      pauza: 1.3,   // voli pauze, jelo
      evaluacija: 1.0
    },
    portraits: ['👨‍🍳', '🍽️', '🌿']
  },

  umirovljeni_inzenjer: {
    id: 'umirovljeni_inzenjer',
    name: 'Umirovljeni Inženjer',
    emoji: '👴',
    description: 'Precizno razmišljanje, fizički slabiji posle podne.',
    base_energy: 60,
    base_curiosity: 85,
    base_physical: 50,
    energy_decay_rate: 1.2,   // brze pada energija
    satisfaction_baseline: 0.65,
    incident_weights: {},
    special: {
      // Posle slota 5 (14:00) energija pada duplo brze
      afternoon_fatigue_multiplier: 2.0,
      afternoon_starts_slot: 5,
      // Uvek +5 learned, bez obzira na aktivnost
      always_learned_bonus: 5
    },
    activity_reaction: {
      teorija: 1.3,
      demonstracija: 1.2,
      prakticni_rad: 0.7,
      pauza: 1.1,
      evaluacija: 1.2
    },
    portraits: ['👴', '📐', '⚙️']
  },

  mladi_preduzetnik: {
    id: 'mladi_preduzetnik',
    name: 'Mladi Preduzetnik',
    emoji: '💼',
    description: 'Energičan, umrežen, traži poslovne prilike čak i na imanju.',
    base_energy: 100,
    base_curiosity: 80,
    base_physical: 80,
    energy_decay_rate: 0.7,
    satisfaction_baseline: 0.6,
    incident_weights: {},
    special: {
      // INC_10 (mediji) daje njemu +2 zadovoljstvo
      inc10_media_bonus: 2,
      // Share uvek — pri evaluaciji šalje link (rep +2)
      share_on_eval: { rep_bonus: 2 }
    },
    activity_reaction: {
      teorija: 0.8,
      demonstracija: 1.0,
      prakticni_rad: 1.2,
      pauza: 1.0,
      evaluacija: 1.3   // voli strukturiran end, networking
    },
    portraits: ['💼', '📱', '🚀']
  },

  ekolog_aktivista: {
    id: 'ekolog_aktivista',
    name: 'Ekolog/Aktivista',
    emoji: '🌍',
    description: 'Strastveni zaštitnik prirode. INC_12 ga pogađa jako; kiša ne smeta.',
    base_energy: 85,
    base_curiosity: 90,
    base_physical: 75,
    energy_decay_rate: 0.9,
    satisfaction_baseline: 0.7,
    incident_weights: {},
    special: {
      // INC_12 (vetar srusio) → auto -20 zadovoljstvo
      inc12_auto_penalty: -20,
      // INC_02 opcija C (kiša je lekcija) → +20 zadovoljstvo
      inc02_option_c_bonus: 20,
      // Permakultura/akvakultura tema +10 satisfaction bonus
      ecology_tema_bonus: { teme: ['permakultura', 'akvakultura', 'prirodna_gradnja'], bonus: 10 }
    },
    activity_reaction: {
      teorija: 1.1,
      demonstracija: 1.2,
      prakticni_rad: 1.3,
      pauza: 0.9,
      evaluacija: 1.0
    },
    portraits: ['🌍', '♻️', '🌱']
  },

  lokalni_novinar: {
    id: 'lokalni_novinar',
    name: 'Lokalni Novinar',
    emoji: '📰',
    description: 'Neutralan, pažljiv, piše priče. Dobra sezona s njim = PR zlato.',
    base_energy: 70,
    base_curiosity: 100,
    base_physical: 65,
    energy_decay_rate: 0.85,
    satisfaction_baseline: 0.65,
    incident_weights: {},
    special: {
      // Ako satisfaction >=80% na kraju → +10 rep bonus za sezonu
      journalist_rep_bonus: { threshold: 0.80, bonus: 10 },
      // Uvek +1 na opte satisfaction grupe (piše dobre priče, motivise)
      group_morale_lift: 1
    },
    activity_reaction: {
      teorija: 1.0,
      demonstracija: 1.2,
      prakticni_rad: 1.1,
      pauza: 1.1,
      evaluacija: 1.3   // voli zaključke, citate
    },
    portraits: ['📰', '✏️', '📷']
  }
};

/**
 * Kreira profil polaznika sa randomizovanim varijacijama
 * @param {string} archetypeId
 * @param {number} idx — index za ID
 * @param {function} rng — seeded RNG
 */
export function createParticipant(archetypeId, idx, rng = Math.random) {
  const arch = ARCHETYPES[archetypeId];
  if (!arch) throw new Error(`Unknown archetype: ${archetypeId}`);

  const variance = () => (rng() * 20) - 10; // ±10
  const portrait = arch.portraits[Math.floor(rng() * arch.portraits.length)];

  return {
    id: `p_${idx}`,
    archetypeId,
    name: generateName(archetypeId, idx),
    portrait,
    // Base stats sa variance
    energy: Math.round(clamp(arch.base_energy + variance(), 50, 100)),
    maxEnergy: arch.base_energy,
    curiosity: Math.round(clamp(arch.base_curiosity + variance(), 40, 100)),
    physical: Math.round(clamp(arch.base_physical + variance(), 30, 100)),
    // Runtime
    satisfaction: Math.round(arch.satisfaction_baseline * 100),
    mood: 'neutral',   // 'happy', 'neutral', 'tired', 'unhappy'
    learned: 0
  };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

const NAMES_BY_ARCHETYPE = {
  radoznali_student:    ['Ana M.', 'Marko P.', 'Teodora J.', 'Luka S.', 'Jovana D.'],
  iskusni_farmer:       ['Dragan K.', 'Milovan B.', 'Dragica N.', 'Zoran R.', 'Slavko T.'],
  kuvar_u_tranziciji:   ['Nemanja O.', 'Aleksandra F.', 'Darko G.', 'Milena A.', 'Bojan L.'],
  umirovljeni_inzenjer: ['Slobodan M.', 'Vojislav R.', 'Vesna T.', 'Radoslav K.', 'Milorad D.'],
  mladi_preduzetnik:    ['Stefan I.', 'Nikolina B.', 'Pavle J.', 'Isidora V.', 'Filip C.'],
  ekolog_aktivista:     ['Jelena S.', 'Vladimir P.', 'Maja O.', 'Dejan N.', 'Katarina L.'],
  lokalni_novinar:      ['Dragana P.', 'Miloš T.', 'Silvija K.', 'Branko M.', 'Tijana R.']
};

function generateName(archetypeId, idx) {
  const names = NAMES_BY_ARCHETYPE[archetypeId] || ['Polaznik'];
  return names[idx % names.length];
}

export function getArchetype(id) {
  return ARCHETYPES[id] || null;
}

export const ARCHETYPE_IDS = Object.keys(ARCHETYPES);
