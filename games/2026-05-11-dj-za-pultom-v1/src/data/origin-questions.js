// =============================================================================
// data/origin-questions.js — 5 origin pitanja (Mile sekcija 1.3)
// =============================================================================
// Klasa je primary (Q1). Q2-Q5 su narativne preferencije + stat tweaks.

export const ORIGIN_QUESTIONS = [
  {
    id: 'q1_class',
    key: 'q1_class',
    prompt: 'Kakav je bio tvoj kontekst kad si poceo da slusas muziku ozbiljno?',
    type: 'class_or_custom',  // special handler — koristi CLASS_UI
    is_required: true
  },
  {
    id: 'q2_observed_djs',
    key: 'q2_observed_djs',
    prompt: 'Kako si gledao DJ-eve pre nego sto si pomislio da budes jedan?',
    type: 'single_choice',
    options: [
      { value: 'showman', label: 'Kao showmen — neko ko vlada salom', stat_mods: { visual: 0.3 } },
      { value: 'craftsman', label: 'Kao zanatlije — sluсаm kako mix-uje', stat_mods: { mixing: 0.3, knowledge: 0.2 } },
      { value: 'curator', label: 'Kao kustosi — sta pusta vise nego kako', stat_mods: { knowledge: 0.5 } },
      { value: 'host', label: 'Kao domacin — okuplja ljude koje volim', stat_mods: { network: 0.4 } },
      { value: 'mystery', label: 'Nisam ih razumeo, samo sam osetio', stat_mods: { recognizability: 0.1, mixing: 0.1 } }
    ]
  },
  {
    id: 'q3_signature_taste',
    key: 'q3_signature_taste',
    prompt: 'Opisi svoj signature ukus u dva-tri reci. (Slobodan tekst — sistem cita)',
    type: 'free_text',
    placeholder: 'npr. "deep house sa minimalnim techno elementom" / "balkanski folk + electro" / "ne znam jos"',
    max_length: 200
  },
  {
    id: 'q4_first_decks',
    key: 'q4_first_decks',
    prompt: 'Ko te je prvi put pustio za pult? (mentor faktor)',
    type: 'single_choice',
    options: [
      { value: 'older_brother', label: 'Stariji brat / sestra ili rodjak', stat_mods: { mixing: 0.4, knowledge: 0.2 } },
      { value: 'crew_friend', label: 'Drug iz krv koji je vec DJ-ovao', stat_mods: { network: 0.5 } },
      { value: 'club_owner', label: 'Vlasnik kluba mi je dao 30 min "popunim prazninu"', stat_mods: { reputation: 0.3, network: 0.2 } },
      { value: 'self_taught', label: 'Sam sam doso do toga — gledao tutorijale, vezbao kod kuce', stat_mods: { knowledge: 0.4, mixing: 0.3 } },
      { value: 'random', label: 'Sasvim slucajno — neko nije dosao, ja sam tu bio', stat_mods: { reputation: 0.2 } }
    ]
  },
  {
    id: 'q5_apstinencija',
    key: 'q5_apstinencija',
    prompt: 'Kakav je tvoj odnos prema alkoholu i pusenju?',
    type: 'single_choice',
    options: [
      { value: 'apstinent', label: 'Apstinent — ne pijem, ne pusim', flags: { apstinent: true, pusi: false } },
      { value: 'drustveno', label: 'Pijem drustveno (1-2 piva po izlasku)', flags: { apstinent: false, pusi: false } },
      { value: 'scene_fitted', label: 'Pijem aktivno scene-fitted (5-10 piva nedeljno)', flags: { apstinent: false, pusi: false } },
      { value: 'dj_navike', label: 'DJ navike — pivo + pusenje, ide uz scenu', flags: { apstinent: false, pusi: true } }
    ]
  }
];

export function buildAnswersFromOriginUI(formAnswers) {
  // formAnswers is plain object {q1_class, q2_observed_djs, q3_signature_taste, q4_first_decks, q5_apstinencija, custom_text?}
  return { ...formAnswers };
}

// Apply stat_mods iz Q2/Q4 — male tier additions
export function applyOriginStatMods(state, answers) {
  const mods = [
    findMod(ORIGIN_QUESTIONS[1], answers.q2_observed_djs),
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
