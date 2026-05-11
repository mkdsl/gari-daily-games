// =============================================================================
// data/aforizmi.js — Pera Period bank (S1 v2 — proširen za cinematic + simptomi)
// =============================================================================
// Tonalitet: telo, opservacija, pitanje. Ne dijagnoza, ne savet.
// Po fazi: nedelja 1-3 supportive, 4-12 neutral observation, kraj može brutal.
// v2 dodaci (Jova 2026-05-11):
//   - cinematic_hook (Cinematic A boot scena)
//   - origin_intro (pre/posle Origin Creator)
//   - macro_open (kad se Macro Week otvori)
//   - symptom_zone_yellow / orange / red — overlay subtitle posle key event-a
//   - recovery_slot_use (Tišina / Integration / Reality check)
//   - rec_decay (recognizability normalnost-low decay)
// =============================================================================

export const AFORIZMI = {

  // ===========================================================================
  // CINEMATIC A HOOK — boot scena, dub bass, 1 rečenica fade-in
  // ===========================================================================
  cinematic_hook: [
    'Niko ne počinje za pultom. Počinje od onoga što mu je život ostavio na podu.',
    'Sat ti broji. Sala ne. Pitanje je čije pamćenje hoćeš.',
    'Bas ti udara u grudni koš pre nego što stigne do ušiju. Tu si.',
    'Nisi izabrao zvuk. Zvuk te je našao kad si ćutao.',
    'Pet nedelja unapred zna se ko si. Dvanaest unapred niko.',
    'Jedna ploča je dovoljna da te zapamte. Pitanje je da li si je ti birao ili ona tebe.',
    'Petak je. Telo ti zna pre nego što ti kažeš.',
    'Sve što si do sad puštao bila je vežba. Sad ti neko broji.'
  ],

  // ===========================================================================
  // ORIGIN INTRO — pre/posle Origin Creator
  // ===========================================================================
  origin_intro: [
    'Tvoj početak nije presuda. Pitanje je šta ćeš nositi od njega.',
    'Sve klase imaju puteve do kraja. Različiti tempovi, ne različiti ishodi.',
    'Pitanje nije odakle si. Pitanje je šta si ostavio iza sebe da bi došao.'
  ],

  origin_complete: [
    'Klasa nije sudbina. Klasa je teret. Teret može da te ojača ili da te slomi.',
    'Sad imaš ime. Sad imaš početak. Ostalo je tvoje.',
    'Pre ovog ekrana — slušalac. Posle — neko ko misli da zna.'
  ],

  // ===========================================================================
  // MACRO OPEN — kad se nova nedelja otvori (planner scena)
  // ===========================================================================
  macro_open: [
    'Nedelja ima 21 slot. Ti imaš telo koje će 21 podneti ili ne.',
    'Plan je tvoj. Posledica nije.',
    'Sedam dana, tri komada svaki. Sad biraj šta žrtvuješ.',
    'Šta staviš ovde — to si i ti.'
  ],

  // ===========================================================================
  // SUPPORTIVE PHASE (nedelje 1-3)
  // ===========================================================================
  supportive_phase: [
    'Prva nedelja. Niko još ne očekuje. Ni ti ne moraš.',
    'Niko se ne pamti po prvoj nedelji. Pamti se po dvanaestoj.',
    'Sve do sad bila je vežba. Sad je tu set koji će neko da pomene.',
    'Sad si u tunelu. Svetlo nije obećanje, ali nije ni laž.'
  ],

  observation_neutral: [
    'Tri seta ove nedelje. Niko se ne seća kako je krenuo prvi.',
    'Reputaciju nosiš u tuđim telefonima. Tvoj ti je ostao tih.',
    'Pio si sa publikom. Pitanje je kad ćeš početi da piješ za nju.',
    'Šest nedelja iza, šest ispred. Pola si već.',
    'Ono što voliš da pustiš nije isto što i ono što treba da pustiš.'
  ],

  brutal_phase: [
    'Ovo nije više igra. Ovo je ono što si izabrao da budeš.',
    'Sad piše. Sad piše šta će ti pisati posle godinu dana.'
  ],

  // ===========================================================================
  // SIMPTOMATSKI ZONE — overlay posle event-a (color zone trigger)
  // ===========================================================================
  symptom_health_yellow: [
    'Telo ti je počelo da odgovara sporije. Sutra ćeš i ti.',
    'Tri noći loš san. Ogledalo i sutra govori isto.',
    'San je deo karijere. Onaj koji to ne primeti — pamti se kao dobar, ali ne dugo.'
  ],
  symptom_health_red: [
    'Došao si do publike. Do sutra još nisi.',
    'Telo ti je u zoni gde se ljudi mire da neće ustati u deset.',
    'Mlad si dok ti se to ne sruši. Onda nisi.',
    'Plan B nemaš. Telo je tvoj jedini.'
  ],

  symptom_odnosi_yellow: [
    'Majka ti je zvala pre devet dana.',
    'Tri prijatelja više nije na listi. Nisi ih izbrisao — nisi ih pozvao.',
    'Drugovima si poslednji put pisao u temi kojoj se ne sećaš.'
  ],
  symptom_odnosi_red: [
    'Niko te ne zove. Ti si misao da je to mir. Nije.',
    'Ostavili su te poslednji oni koji su ti rekli istinu pre tri godine.',
    'Sad si sam u dobrom smislu. Sutra si sam u onom drugom.'
  ],

  symptom_normalnost_yellow: [
    'Čitao si knjigu pre dva meseca. Ne sećaš se čije.',
    'Hobby slot ti je prazan šest nedelja. Ponekad je to ok. Ne sad.',
    'Pričao si o muzici 14 dana zaredom. Pitanje je da li se neko još slušao.'
  ],
  symptom_normalnost_red: [
    'Sve što radiš je muzika. Pitanje je koga to interesuje osim tebe.',
    'Identitet ti je polica sa pločama. Polica može da padne.',
    'Kad si poslednji put bio bez slušalica i bez razloga?'
  ],

  // ===========================================================================
  // SET QUALITY
  // ===========================================================================
  set_high: [
    'Pustio si set kakav nisi očekivao da hoćeš.',
    'Sala te je držala ovaj put. Sledeći put ti drži nju.',
    'Sada znaš kako zvuči kad si bio tu. Pamti.'
  ],
  set_low: [
    'Publika oseti. Nisi morao da im kažeš.',
    'Ovo nije bio tvoj set. Pitanje je šta ga je odvelo od tebe.',
    'Plejao si za sebe. Sala je to videla.'
  ],

  // ===========================================================================
  // REPUTATION EVENTS
  // ===========================================================================
  rep_event_positive: [
    'Stari rezident te je primetio. Pamti i one koji nisu primećeni.',
    'Booker je gledao set. Ne mora se javiti da znači.',
    'Neko ti je seo na bar i pitao gde su drugi tvoji setovi.'
  ],
  rep_event_negative: [
    'Neko te je preporučio. Onaj kome je preporučio nije zvao.',
    'Ime ti je palo. Ne znaš čije usne, znaš da je palo.'
  ],

  // ===========================================================================
  // RECOGNIZABILITY DECAY (normalnost low)
  // ===========================================================================
  rec_decay: [
    'Niko te ne pominje već dve nedelje. Ne zato što si nestao — zato što više nema gde.',
    'Bio si u priči. Sad si u fusnoti.',
    'Ono što te je činilo prepoznatljivim sad zvuči kao svi ostali.'
  ],

  // ===========================================================================
  // BOOZE / NAVIKE
  // ===========================================================================
  apstinent_reflection: [
    'Bio si jedini trezni u sobi. Šta si video što ostali nisu.',
    'Ne piješ godinama. Niko te zbog toga ne pamti. Pitanje koje ne mora odgovor.'
  ],
  alcohol_problem: [
    'Pijan DJ pamti dobre noći. Trezna publika pamti loše setove.',
    'Pivo nije izdaja. Drugo te nije lagalo. Petnaesto te je već deceniju uvuklo.'
  ],

  // ===========================================================================
  // RECOVERY SLOT (S2)
  // ===========================================================================
  recovery_tisina: [
    'Bio si bez zvuka 48 sati. Sad ti se vraća sluh za ono što nisi čuo.',
    'Tišina nije pauza. Tišina je sluh koji se vraća.'
  ],
  recovery_integration: [
    'Tri dana razgovora sa sobom. Sad znaš šta si nosio bez da znaš.',
    'Ono što si nedelju dana radio — to si ti ili to nije ti. Sad razlikuješ.'
  ],
  recovery_reality: [
    'Telefonski razgovor sa nekim ko ne zna ko je tvoj rezidens. Ozdravljaš.',
    'Pričao si o nečemu što nije muzika 40 minuta. Telo ti je bilo zahvalno.'
  ],

  // ===========================================================================
  // ZOVI ČOVIKA (S2 — substance call)
  // ===========================================================================
  zovi_covika_first: [
    'Zvao si ga. Niko te nije terao. Ovo je tvoja odluka.',
    'On uvek odgovori. Pitanje je da li ti uvek treba.'
  ],
  zovi_covika_repeat: [
    'Treći put ove nedelje. Pamti broj.',
    'Sad je rutina. Rutina ima cenu koja nije u parama.',
    'Više ga zoveš nego majku. Pitanje koje ne traži odgovor.'
  ],

  // ===========================================================================
  // SUBSTANCE COMPOUND (poly use)
  // ===========================================================================
  compound_warning: [
    'Tri komada u krvi. Telo broji čak i kad ti ne brojiš.',
    'Compound nije sabiranje. Compound je novi prostor u kome nisi bio.',
    'Sad ti telo radi matematiku koju ti nećeš razumeti dok ne stigne.'
  ],

  // ===========================================================================
  // CASCADE / HARD FAIL
  // ===========================================================================
  cascade_warning: [
    'Tri stuba se ljuljaju. Trećina od jednog je dovoljna da krene.',
    'Sad biraš koji ćeš da ispustiš. Posle te neće niko pitati.'
  ],

  // ===========================================================================
  // FINALE / WEEK 12
  // ===========================================================================
  finale_neutral: [
    'Sezona je gotova. Pitanje je da li si ti.',
    'Dvanaest nedelja. Tri imena će se setiti. Pet će zaboraviti.',
    'Sad imaš priču. Sledeća sezona je pitanje da li je još ista.'
  ],

  week_end_generic: [
    'Nedelja je gotova. Ono što pamtiš razlikuje se od onog što kalendar pamti.',
    'Ova nedelja te nije promenila. Pitanje je da li je trebalo.',
    'Više muzike nego izlaska. Sad ti se isplati.',
    'Više izlaska nego muzike. Sad ti se isplati.'
  ]
};

// =============================================================================
// CONTEXT-AWARE PICKER
// =============================================================================
export function selectAforizam(state, context) {
  const week = state ? state.week : 1;
  const bank = AFORIZMI;

  // Direct context match
  if (bank[context]) return pick(bank[context]);

  // Context-with-zone mapping
  if (context === 'symptom' && state) {
    const lowest = lowestSymptom(state);
    if (lowest.zone === 'red') return pick(bank[`symptom_${lowest.key}_red`] || bank.symptom_health_red);
    if (lowest.zone === 'yellow') return pick(bank[`symptom_${lowest.key}_yellow`] || bank.symptom_health_yellow);
  }

  // Substance — Zovi covika repeat?
  if (context === 'zovi_covika' && state) {
    const total = state.substance?.zovi_covika_total || 0;
    if (total <= 1) return pick(bank.zovi_covika_first);
    return pick(bank.zovi_covika_repeat);
  }

  // Set quality
  if (context === 'set_high') return pick(bank.set_high);
  if (context === 'set_low')  return pick(bank.set_low);
  if (context === 'rep_event_positive') return pick(bank.rep_event_positive);
  if (context === 'rep_event_negative') return pick(bank.rep_event_negative);

  // Drinking
  if (context === 'alcohol_problem') return pick(bank.alcohol_problem);
  if (state && state.apstinent && context === 'reflection') return pick(bank.apstinent_reflection);

  // Phase-based fallback
  if (week <= 3) return pick(bank.supportive_phase);
  if (week <= 9) return pick(bank.observation_neutral);
  if (week <= 12) return pick(bank.brutal_phase || bank.observation_neutral);

  return pick(bank.week_end_generic);
}

function lowestSymptom(state) {
  const s = state.sacrifice || {};
  const arr = [
    { key: 'health',     val: s.health ?? 100 },
    { key: 'odnosi',     val: s.odnosi ?? 100 },
    { key: 'normalnost', val: s.normalnost ?? 100 }
  ];
  arr.sort((a, b) => a.val - b.val);
  const low = arr[0];
  let zone = 'green';
  if (low.val < 30) zone = 'red';
  else if (low.val < 60) zone = 'yellow';
  return { key: low.key, val: low.val, zone };
}

function pick(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

// Back-compat alias za stari placeholder import path
export const AFORIZMI_PLACEHOLDER = AFORIZMI;

export const TOTAL_COUNT = Object.values(AFORIZMI).reduce((sum, arr) => sum + arr.length, 0);
