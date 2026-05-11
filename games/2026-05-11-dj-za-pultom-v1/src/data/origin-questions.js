// =============================================================================
// data/origin-questions.js — 5 origin pitanja + 9 preseta (v2)
// =============================================================================
// V2 (Jova 2026-05-11):
//   - 9 preseta u JEDNOJ listi (NE kategorizovano "Klasični/Mladi")
//   - 4 klasični: punk_to_dj, classical_kontinuum, migrant_scene, kafanski_muzicar
//   - 5 mladih:   m1_gamer_producent, m2_net_samouk, m3_soundsystem_klinac,
//                 m4_stream_native, m5_brat_sestra_nasleduje
//   - Origin Creator scene-a renderuje sve u single-column scroll (mobile)
//     ili 2-3 col grid (desktop) — NEMA kategorija visible
// =============================================================================

export const ORIGIN_QUESTIONS = [
  {
    id: 'q1_class',
    key: 'q1_class',
    prompt: 'Šta ti je dalo telo da ovo radiš?',
    type: 'preset_selector',  // posebno se rukuje u sceni
    is_required: true
  },
  {
    id: 'q2_observed_djs',
    key: 'q2_observed_djs',
    prompt: 'Kako si gledao DJ-eve pre nego što si pomislio da budeš jedan?',
    type: 'single_choice',
    options: [
      { value: 'showman', label: 'Showmen koji drži salu', stat_mods: { visual: 0.3 } },
      { value: 'craftsman', label: 'Zanatlija — slušao sam mix', stat_mods: { mixing: 0.3, knowledge: 0.2 } },
      { value: 'curator', label: 'Kustos — šta pušta', stat_mods: { knowledge: 0.5 } },
      { value: 'host', label: 'Domaćin koji okuplja', stat_mods: { network: 0.4 } },
      { value: 'mystery', label: 'Nisam razumeo, osetio sam', stat_mods: { recognizability: 0.1, mixing: 0.1 } }
    ]
  },
  {
    id: 'q3_signature_taste',
    key: 'q3_signature_taste',
    prompt: 'Tvoj signature ukus — šta puštaš najviše?',
    type: 'single_choice',
    options: [
      { value: 'deep_minimal', label: 'Deep / minimal house', stat_mods: { knowledge: 0.3, mixing: 0.2 } },
      { value: 'techno_drive', label: 'Techno — pravolinijski', stat_mods: { mixing: 0.4, visual: 0.1 } },
      { value: 'balkan_fusion', label: 'Balkan folk + electro', stat_mods: { recognizability: 0.3, network: 0.2 } },
      { value: 'tech_house', label: 'Tech house / groovy', stat_mods: { mixing: 0.2, network: 0.2, visual: 0.1 } },
      { value: 'broken_beats', label: 'UKG / breaks / 140 / dnb', stat_mods: { knowledge: 0.2, recognizability: 0.2 } },
      { value: 'open_format', label: 'Open format', stat_mods: { visual: 0.2, network: 0.3 } }
    ]
  },
  {
    id: 'q4_first_decks',
    key: 'q4_first_decks',
    prompt: 'Ko te je prvi put pustio za pult?',
    type: 'single_choice',
    options: [
      { value: 'older_brother', label: 'Stariji brat ili rođak', stat_mods: { mixing: 0.4, knowledge: 0.2 } },
      { value: 'crew_friend', label: 'Drug iz kraja koji već radi kao DJ', stat_mods: { network: 0.5 } },
      { value: 'club_owner', label: 'Vlasnik kluba — popuni prazninu', stat_mods: { reputation: 0.3, network: 0.2 } },
      { value: 'self_taught', label: 'Sam — tutorijali, soba, ponavljanje', stat_mods: { knowledge: 0.4, mixing: 0.3 } },
      { value: 'random', label: 'Slučajno — neko nije došao', stat_mods: { reputation: 0.2 } }
    ]
  },
  {
    id: 'q5_apstinencija',
    key: 'q5_apstinencija',
    prompt: 'Tvoj odnos prema alkoholu i pušenju?',
    type: 'single_choice',
    options: [
      { value: 'apstinent', label: 'Apstinent — ne pijem, ne pušim', flags: { apstinent: true, pusi: false } },
      { value: 'drustveno', label: 'Pijem društveno, par piva', flags: { apstinent: false, pusi: false } },
      { value: 'scene_fitted', label: 'Pijem uz scenu', flags: { apstinent: false, pusi: false } },
      { value: 'dj_navike', label: 'Pivo i pušenje, ide uz pult', flags: { apstinent: false, pusi: true } }
    ]
  }
];

// =============================================================================
// 9 ORIGIN PRESETS — single flat list, no categories (v2)
// =============================================================================
// Svaki preset ima:
//   key, label, tag, tagline, long, stat_mods (start tier deltas),
//   class_baseline (fallback CLASS_MODIFIERS key u config.js: bogata/radnicka/posthumna/custom),
//   substance_baseline (S2 starter substances if any).
// =============================================================================
export const ORIGIN_PRESETS = [
  // --- 4 KLASIČNI ---
  {
    key: 'punk_to_dj',
    label: 'Punk → DJ',
    tag: 'Iz buke',
    tagline: 'Došo si iz scene koja ne traži dozvolu.',
    long: 'Distorzija ti je domaća. Glatko još nije.',
    class_baseline: 'custom',
    stat_mods: {
      knowledge: 0.4, mixing: 0.3, recognizability: 0.4,
      network: -0.2, visual: 0.2, reputation: 0.3
    },
    substance_baseline: ['alcohol', 'nicotine']
  },
  {
    key: 'classical_kontinuum',
    label: 'Klasična → kontinuum',
    tag: 'Iz note',
    tagline: 'Teorija ti je u uvu pre nego u ploči.',
    long: 'Sve znaš gde ide. Pitanje je da li zvuči toplo.',
    class_baseline: 'posthumna_penzija',
    stat_mods: {
      knowledge: 0.6, mixing: 0.5, visual: -0.1,
      network: -0.2, reputation: 0.1
    },
    substance_baseline: ['caffeine']
  },
  {
    key: 'migrant_scene',
    label: 'Strana zemlja → migrant',
    tag: 'Iz druge zemlje',
    tagline: 'Doneo si zvuk koji ovde niko ne pušta.',
    long: 'Tvoja kutija ploča je neko drugo more. Lokal te još ne zna.',
    class_baseline: 'custom',
    stat_mods: {
      knowledge: 0.5, recognizability: 0.5, network: -0.3,
      mixing: 0.2, reputation: -0.1
    },
    substance_baseline: []
  },
  {
    key: 'kafanski_muzicar',
    label: 'Kafanski muzičar → DJ',
    tag: 'Iz benda',
    tagline: 'Čitao si publiku pre nego što si pipnuo deck.',
    long: 'Stol te sluša kao da pevaš. Pult još nije naučeno.',
    class_baseline: 'radnicka_klasa',
    stat_mods: {
      visual: 0.5, network: 0.4, knowledge: 0.1,
      mixing: -0.1, reputation: 0.2
    },
    substance_baseline: ['alcohol', 'nicotine']
  },

  // --- 5 MLADI ---
  {
    key: 'm1_gamer_producent',
    label: 'Gamer → producent → DJ',
    tag: 'Iz FL Studija',
    tagline: 'Beat ti je u DAW-u pre nego u salu.',
    long: 'Sve sample-ove znaš napamet. Pitanje je da li pleješ za salu ili za sebe.',
    class_baseline: 'bogata_deca',
    stat_mods: {
      knowledge: 0.5, mixing: 0.4, network: -0.2,
      recognizability: 0.2, visual: 0.1
    },
    substance_baseline: ['caffeine']
  },
  {
    key: 'm2_net_samouk',
    label: 'Net-samouk',
    tag: 'YouTube generacija',
    tagline: 'Naučio si bez ikoga ko bi te video.',
    long: 'Sve tutorijale znaš. Niko nije gledao da kaže kad si fakat počeo.',
    class_baseline: 'custom',
    stat_mods: {
      knowledge: 0.4, mixing: 0.3, network: -0.4,
      recognizability: -0.1, visual: 0.1
    },
    substance_baseline: ['caffeine', 'cannabis']
  },
  {
    key: 'm3_soundsystem_klinac',
    label: 'Soundsystem klinac',
    tag: 'Iz reggae/dnb sistema',
    tagline: 'Bas ti je u rebrima pre nego u plejlistama.',
    long: 'Sistem ti je dao prvi nivo. Sad treba sve ostalo.',
    class_baseline: 'radnicka_klasa',
    stat_mods: {
      recognizability: 0.4, network: 0.4, mixing: 0.2,
      visual: 0.1, knowledge: -0.1
    },
    substance_baseline: ['cannabis']
  },
  {
    key: 'm4_stream_native',
    label: 'Stream-native (Twitch/IG)',
    tag: 'Iz online publike',
    tagline: 'Prvih 200 ljudi koji su te čuli — nikad nije bilo u istoj sobi.',
    long: 'Imaš metrike. Pitanje je da li imaš salu.',
    class_baseline: 'bogata_deca',
    stat_mods: {
      recognizability: 0.5, visual: 0.4, network: 0.2,
      mixing: -0.1, knowledge: 0.1
    },
    substance_baseline: ['caffeine']
  },
  {
    key: 'm5_brat_sestra_nasleduje',
    label: 'Brat/sestra naslijeđuje',
    tag: 'Iz porodičnog pulta',
    tagline: 'Neko ti je već gradio ime.',
    long: 'Pitanje je da li je tvoje. I koliko ćeš se boriti da ga ima.',
    class_baseline: 'custom',
    stat_mods: {
      network: 0.5, reputation: 0.3, recognizability: 0.2,
      mixing: 0.1, knowledge: 0.1
    },
    substance_baseline: []
  }
];

// Back-compat alias (stari kod referencirao CUSTOM_PRESETS)
export const CUSTOM_PRESETS = ORIGIN_PRESETS;

export function findPreset(key) {
  return ORIGIN_PRESETS.find(p => p.key === key) || null;
}

export function buildAnswersFromOriginUI(formAnswers) {
  return { ...formAnswers };
}

// Apply stat_mods iz Q2/Q3/Q4 + preset
export function applyOriginStatMods(state, answers) {
  const mods = [
    findMod(ORIGIN_QUESTIONS[1], answers.q2_observed_djs),
    findMod(ORIGIN_QUESTIONS[2], answers.q3_signature_taste),
    findMod(ORIGIN_QUESTIONS[3], answers.q4_first_decks)
  ];
  for (const m of mods) {
    if (!m) continue;
    for (const [stat, gain] of Object.entries(m.stat_mods || {})) {
      if (state.stats[stat] !== undefined) {
        state.stats[stat] += gain;
      }
    }
  }

  // Preset stat_mods
  const preset = answers.preset_key ? findPreset(answers.preset_key) : null;
  if (preset && preset.stat_mods) {
    for (const [stat, gain] of Object.entries(preset.stat_mods)) {
      if (state.stats[stat] !== undefined) {
        state.stats[stat] += gain;
      }
    }
  }

  // Apply flags from Q5
  const q5opt = findMod(ORIGIN_QUESTIONS[4], answers.q5_apstinencija);
  if (q5opt && q5opt.flags) {
    if (q5opt.flags.apstinent !== undefined) state.apstinent = q5opt.flags.apstinent;
    if (q5opt.flags.pusi !== undefined) state.pusi = q5opt.flags.pusi;
  }

  // Apply preset substance baseline (S2)
  if (preset && preset.substance_baseline && state.substance) {
    state.substance.baseline = [...preset.substance_baseline];
  }

  return state;
}

function findMod(question, value) {
  if (!question.options) return null;
  return question.options.find(o => o.value === value);
}
