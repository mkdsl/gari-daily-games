// =============================================================================
// data/origin-questions.js — 5 origin pitanja (Mile sekcija 1.3)
// =============================================================================
// MOBILE-FIRST REDIZAJN (Jova 2026-05-11):
//   - SVI inputi su multiple choice (zero text inputs, zero AI/keyword backend)
//   - Q3 "signature taste" → 6 ponuđenih žanr preset-ova sa stat_mods
//   - Custom klasa "Tvoja prica" → 4 custom-path preset-a (custom_presets ispod)
//     umesto free-text paragrafa
// =============================================================================
// Klasa je primary (Q1). Q2-Q5 su narativne preferencije + stat tweaks.

export const ORIGIN_QUESTIONS = [
  {
    id: 'q1_class',
    key: 'q1_class',
    prompt: 'Kakav ti je bio kontekst kad si počeo ozbiljno da slušaš muziku?',
    type: 'class_or_custom',  // special handler — koristi CLASS_UI + CUSTOM_PRESETS
    is_required: true
  },
  {
    id: 'q2_observed_djs',
    key: 'q2_observed_djs',
    prompt: 'Kako si gledao DJ-eve pre nego što si pomislio da budeš jedan od njih?',
    type: 'single_choice',
    options: [
      { value: 'showman', label: 'Šoumen koji drži salu', stat_mods: { visual: 0.3 } },
      { value: 'craftsman', label: 'Zanatlija — slušao sam miks', stat_mods: { mixing: 0.3, knowledge: 0.2 } },
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
// CUSTOM PRESETS — kad igrač izabere klasu "Tvoja prica" (custom)
// =============================================================================
// Jova 2026-05-11: zamena za free-text paragraf. 4 predefined paths,
// svaki sa pre-podešenom stat distribucijom (slično 3 main klase).
// Šef proverava da li je 4. (kafanski) zadržan ili izbačen — flag-ovano u izveštaju.
//
// Stat brojevi su startni pct-ovi (0-100) koji se mapiraju ka tier 0-7,
// po istom obrascu kao CLASS_MODIFIERS u config.js.
// =============================================================================
export const CUSTOM_PRESETS = [
  {
    key: 'punk_to_dj',
    label: 'Punk → DJ',
    tag: 'Iz buke',
    tagline: 'Došao si iz scene koja ne traži dozvolu.',
    long: 'Distorzija ti je domaća. Glatko još nije.',
    stat_mods: {
      knowledge: 0.4,
      mixing: 0.3,
      recognizability: 0.4,
      network: -0.2,
      visual: 0.2,
      reputation: 0.3
    }
  },
  {
    key: 'classical_kontinuum',
    label: 'Klasična → kontinuum',
    tag: 'Iz note',
    tagline: 'Teorija ti je u uvu pre nego u ploči.',
    long: 'Sve znaš gde ide. Pitanje je da li zvuči toplo.',
    stat_mods: {
      knowledge: 0.6,
      mixing: 0.5,
      visual: -0.1,
      network: -0.2,
      reputation: 0.1
    }
  },
  {
    key: 'migrant_scene',
    label: 'Strana zemlja → migrant',
    tag: 'Iz druge zemlje',
    tagline: 'Doneo si zvuk koji ovde niko ne pušta.',
    long: 'Tvoja kutija ploča je neko drugo more. Lokal te još ne zna.',
    stat_mods: {
      knowledge: 0.5,
      recognizability: 0.5,
      network: -0.3,
      mixing: 0.2,
      reputation: -0.1
    }
  },
  {
    key: 'kafanski_muzicar',
    label: 'Kafanski muzičar → DJ',
    tag: 'Iz benda',
    tagline: 'Čitao si publiku pre nego što si pipnuo deck.',
    long: 'Sto te sluša kao da pevaš. Pult još nije naučen.',
    stat_mods: {
      visual: 0.5,
      network: 0.4,
      knowledge: 0.1,
      mixing: -0.1,
      reputation: 0.2
    },
    pending_approval: true  // šef da potvrdi da li ostaje ili se izbacuje
  }
];

export function buildAnswersFromOriginUI(formAnswers) {
  // formAnswers is plain object {q1_class, q2_observed_djs, q3_signature_taste, q4_first_decks, q5_apstinencija, custom_preset?}
  return { ...formAnswers };
}

// Apply stat_mods iz Q2/Q3/Q4 — male tier additions
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

  // Apply custom preset stat_mods (ako je klasa = custom + preset izabran)
  if (answers.q1_class === 'custom' && answers.custom_preset) {
    const preset = CUSTOM_PRESETS.find(p => p.key === answers.custom_preset);
    if (preset && preset.stat_mods) {
      for (const [stat, gain] of Object.entries(preset.stat_mods)) {
        if (state.stats[stat] !== undefined) {
          state.stats[stat] += gain;
        }
      }
    }
  }

  // Apply flags from Q5
  const q5opt = findMod(ORIGIN_QUESTIONS[4], answers.q5_apstinencija);
  if (q5opt && q5opt.flags) {
    if (q5opt.flags.apstinent !== undefined) state.apstinent = q5opt.flags.apstinent;
    if (q5opt.flags.pusi !== undefined) state.pusi = q5opt.flags.pusi;
  }
  return state;
}

function findMod(question, value) {
  if (!question.options) return null;
  return question.options.find(o => o.value === value);
}
