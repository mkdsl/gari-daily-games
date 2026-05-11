// =============================================================================
// data/pera-substance.js — Pera Period S2 bank (substance + 44 dijagnoze)
// =============================================================================
// Format: po dijagnozi 1 linija. Tier 1 suptilno, Tier 2 vidljivo, Tier 3 brutalno.
// =============================================================================

export const DIAGNOSES = [
  // ALKOHOL spectrum (4)
  { id: 'alc_t1', substance: 'alcohol', tier: 1, label: 'Pivo na pultu',
    pera: 'Pivo nije izdaja. Pitanje je samo da li ti je još piće.' },
  { id: 'alc_t2', substance: 'alcohol', tier: 2, label: 'Petlja sa setovima',
    pera: 'Tri šuljana piva. Onda misliš da si trezan. Onda si druga osoba za pultom.' },
  { id: 'alc_t3', substance: 'alcohol', tier: 3, label: 'DJ navika',
    pera: 'Pijan DJ pamti dobre noći. Trezna publika pamti loše setove.' },
  { id: 'alc_t3b', substance: 'alcohol', tier: 3, label: 'Jutarnji nastavak',
    pera: 'Sutra ujutru još nije gotovo. To si ti nazvao deo karijere.' },

  // NIKOTIN (3)
  { id: 'nic_t1', substance: 'nicotine', tier: 1, label: 'Druženje cigara',
    pera: 'Jedna posle seta. Niko ti ništa.' },
  { id: 'nic_t2', substance: 'nicotine', tier: 2, label: 'Paklica dnevno',
    pera: 'Glas ti je niži za pola tona. Setovi to još ne primećuju.' },
  { id: 'nic_t3', substance: 'nicotine', tier: 3, label: 'Dva paklica + jutarnja',
    pera: 'Disanje ti je počelo da broji takt sa tebe. Pitanje koliko još.' },

  // KOFEIN (3)
  { id: 'caf_t1', substance: 'caffeine', tier: 1, label: 'Tri kafe',
    pera: 'Kafa ti je radni alat. Pitanje je kad ti postane uloga.' },
  { id: 'caf_t2', substance: 'caffeine', tier: 2, label: 'Pet kafa + energetik',
    pera: 'Srce ti broji brže nego playlist. Pitanje koje od ova dva pre puca.' },
  { id: 'caf_t3', substance: 'caffeine', tier: 3, label: 'Kofein kao zamena za san',
    pera: 'Spavao bi. Ne daš. Sad ti telo plaća kamatu koju nisi zaračunao.' },

  // MARIHUANA (4)
  { id: 'mj_t1', substance: 'cannabis', tier: 1, label: 'Vikend joint',
    pera: 'Vikend, balkon, dva dima. Zovem to balansom.' },
  { id: 'mj_t2', substance: 'cannabis', tier: 2, label: 'Skoro svaki dan',
    pera: 'Kratkoročna memorija ti je počela da bira šta pamti. Setlisti to ne vole.' },
  { id: 'mj_t3', substance: 'cannabis', tier: 3, label: 'Pre seta blunt',
    pera: 'Sve ti zvuči dobro. Pitanje je da li si ti to čuo ili to drugo.' },
  { id: 'mj_t3b', substance: 'cannabis', tier: 3, label: 'Self-medikacija anksioznost',
    pera: 'Lečiš nešto čega nisi siguran. Sad imaš dva problema.' },

  // STIMULANSI (5) — speed/koks/MDMA
  { id: 'stim_t1', substance: 'stim', tier: 1, label: 'Liniju na žurci, retko',
    pera: 'Jednom je probaš. Onda se sećaš kako je bilo.' },
  { id: 'stim_t2', substance: 'stim', tier: 2, label: 'Svaki vikend',
    pera: 'Petak postaje obećanje koje ti telo daje pre nego što ga ti daš.' },
  { id: 'stim_t3', substance: 'stim', tier: 3, label: 'I za pultom',
    pera: 'Sad ti je set brži od BPM-a. Sala to oseti pre nego što ti vidiš.' },
  { id: 'stim_t3b', substance: 'stim', tier: 3, label: 'Comedown svuda',
    pera: 'Utorak ti je nedelja koju ne pamtiš. Pet ti je razlog koji ti ne treba.' },
  { id: 'mdma_t3', substance: 'stim', tier: 3, label: 'Empatija na pozajmici',
    pera: 'Voleo si ih sve. U sredu se nisi sećao zašto.' },

  // PSIHODELICI (4) — LSD/psilocybin
  { id: 'psy_t1', substance: 'psychedelic', tier: 1, label: 'Mikrodoze, dom',
    pera: 'Sad ti boje zvuče. Nikad ne znaš kome to kažeš.' },
  { id: 'psy_t2', substance: 'psychedelic', tier: 2, label: 'Trip vikendom',
    pera: 'Vratio si se. Ne sasvim. Razlika ti je deo soundscape-a.' },
  { id: 'psy_t3', substance: 'psychedelic', tier: 3, label: 'Na žurci, za pultom',
    pera: 'Sad si trip-sitter sebi i sali. Niko nije pristao na ovu ulogu.' },
  { id: 'psy_t3b', substance: 'psychedelic', tier: 3, label: 'HPPD/flashbacks',
    pera: 'Sad vidiš stvari koje ne pripadaju. Telo ti se nije setilo da ti kaže kad.' },

  // KETAMIN (3)
  { id: 'ket_t1', substance: 'dissociative', tier: 1, label: 'Mali bump u WC-u',
    pera: 'Pola sekunde rupa. Niko ti nije primetio. Tebi je bilo dovoljno.' },
  { id: 'ket_t2', substance: 'dissociative', tier: 2, label: 'K-hole čekanje',
    pera: 'Sad biraš koliko si tu. Pitanje je da li si te biraš ili ne.' },
  { id: 'ket_t3', substance: 'dissociative', tier: 3, label: 'Daily ritual',
    pera: 'Realnost ti je opcija. Sad ti telo plaća bubrege.' },

  // BENZODIAZEPINI / SLEEP MEDS (3)
  { id: 'benzo_t1', substance: 'depressant', tier: 1, label: 'Xanax pred let',
    pera: 'Jedan tableta — ok. Pitanje je kad postaje rutina.' },
  { id: 'benzo_t2', substance: 'depressant', tier: 2, label: 'Spavanje na rec',
    pera: 'Spavaš jer si pio. Pitanje je da li si ikad više sam spavao.' },
  { id: 'benzo_t3', substance: 'depressant', tier: 3, label: 'Zavisnost telesna',
    pera: 'Ne možeš da staneš. Telo ti se navklo. Sad je to drugi problem.' },

  // OPIOIDI (3)
  { id: 'op_t1', substance: 'opioid', tier: 1, label: 'Recept iza povrede',
    pera: 'Lek koji ti je dobro došao. Sad pitanje kad neće.' },
  { id: 'op_t2', substance: 'opioid', tier: 2, label: 'Pomaže za bol',
    pera: 'Boli te nešto drugo, ali ovo radi. Telo te uči da to bira opet.' },
  { id: 'op_t3', substance: 'opioid', tier: 3, label: 'Off-prescription',
    pera: 'Sad ti je telo dilirano. Sutra ti je ti dilirano.' },

  // POLY / COMPOUND (5)
  { id: 'poly_alc_stim', substance: 'compound', tier: 3, label: 'Alc + stim (kombo)',
    pera: 'Srce ti broji za dve osobe. Pitanje koja ti je tvoja.' },
  { id: 'poly_alc_benzo', substance: 'compound', tier: 3, label: 'Alc + benzo (opasno)',
    pera: 'Telo ti odlučuje za tebe da li dišeš. Niko nije pristao da im veruje.' },
  { id: 'poly_stim_psy', substance: 'compound', tier: 3, label: 'Stim + trip',
    pera: 'Brz si i daleko. Niko ti ne stiže da kaže da je predugačko.' },
  { id: 'poly_alc_cannabis', substance: 'compound', tier: 2, label: 'Alc + trava',
    pera: 'Mućenje. Set zna. Ti ne.' },
  { id: 'poly_full_chaos', substance: 'compound', tier: 3, label: 'Sve odjednom',
    pera: 'Sad si laboratorija. Pitanje koja reakcija prva izađe.' },

  // BEHAVIORAL (4) — sleep deprivation, food, sex, gambling
  { id: 'beh_sleep', substance: 'behavioral', tier: 2, label: 'Hronična neispavanost',
    pera: 'San ti je opcija. Telo ti je naplaćuje šest meseci kasnije.' },
  { id: 'beh_food', substance: 'behavioral', tier: 2, label: 'Junk food rutina',
    pera: 'Hrana ti je shut-up za telo. Pitanje šta još ćuti pod njom.' },
  { id: 'beh_sex', substance: 'behavioral', tier: 2, label: 'Posle žurke svaki put',
    pera: 'Telo ti pamti pre nego što ti kažeš. Pitanje koliko više pamti od tebe.' },
  { id: 'beh_gambling', substance: 'behavioral', tier: 2, label: 'Klađenje na set fee',
    pera: 'Stavljaš na sebe kao da si tuđi konj. Sad si i džokej i konj i kuća.' },

  // MENTAL (3)
  { id: 'mental_anxiety', substance: 'mental', tier: 2, label: 'Anksioznost pred set',
    pera: 'Tremor ti je sastojak. Tako si rekao. Pitanje koliko više.' },
  { id: 'mental_burnout', substance: 'mental', tier: 3, label: 'Burnout, niko ti ne veruje',
    pera: 'Sve ti je teško. Niko ne veruje jer si i dalje na liniji. To je još teže.' },
  { id: 'mental_dissociation', substance: 'mental', tier: 3, label: 'Disocijacija za pultom',
    pera: 'Set se odvija. Ti si negde drugde. Nikad ne znaš ko se vraća.' }
];

// Indeksi za brzu pretragu
export const DIAGNOSES_BY_ID = DIAGNOSES.reduce((acc, d) => { acc[d.id] = d; return acc; }, {});
export const DIAGNOSES_BY_SUBSTANCE = DIAGNOSES.reduce((acc, d) => {
  acc[d.substance] = acc[d.substance] || [];
  acc[d.substance].push(d);
  return acc;
}, {});

// =============================================================================
// SUPSTANCE META (UI kategorizacija)
// =============================================================================
export const SUBSTANCE_META = {
  alcohol:      { label: 'Alkohol',        color: '#c79a3b', icon: 'wine' },
  nicotine:     { label: 'Nikotin',        color: '#9a8a6b', icon: 'smoke' },
  caffeine:     { label: 'Kofein',         color: '#6b4423', icon: 'coffee' },
  cannabis:     { label: 'Marihuana',      color: '#5b8a4a', icon: 'leaf' },
  stim:         { label: 'Stimulansi',     color: '#d94e3a', icon: 'bolt' },
  psychedelic:  { label: 'Psihodelici',    color: '#a64bc4', icon: 'eye' },
  dissociative: { label: 'Disocijativi',   color: '#3b6dc7', icon: 'circle' },
  depressant:   { label: 'Depresanti',     color: '#4a4a6b', icon: 'moon' },
  opioid:       { label: 'Opioidi',        color: '#7a3a3a', icon: 'pill' },
  compound:     { label: 'Kombinacije',    color: '#ff4040', icon: 'venn' },
  behavioral:   { label: 'Ponašanje',      color: '#888888', icon: 'cycle' },
  mental:       { label: 'Mentalno',       color: '#4a7a9a', icon: 'mind' }
};

// Tier color za UI (T1 gray-zelen, T2 žut, T3 crven)
export const TIER_COLOR = {
  1: { name: 'suptilno',  cls: 'tier-1', color: '#6a8a6a' },
  2: { name: 'vidljivo',  cls: 'tier-2', color: '#c79a3b' },
  3: { name: 'urgentno',  cls: 'tier-3', color: '#d94e3a' }
};

// =============================================================================
// COMPOUND DETECTION
// =============================================================================
// Vraća listu aktivnih compound dijagnoza na osnovu state.substance.active_substances[]
export function detectCompounds(activeSubstances) {
  const result = [];
  const set = new Set(activeSubstances);
  if (set.has('alcohol') && set.has('stim')) result.push(DIAGNOSES_BY_ID.poly_alc_stim);
  if (set.has('alcohol') && set.has('depressant')) result.push(DIAGNOSES_BY_ID.poly_alc_benzo);
  if (set.has('stim') && set.has('psychedelic')) result.push(DIAGNOSES_BY_ID.poly_stim_psy);
  if (set.has('alcohol') && set.has('cannabis')) result.push(DIAGNOSES_BY_ID.poly_alc_cannabis);
  if (set.size >= 4) result.push(DIAGNOSES_BY_ID.poly_full_chaos);
  return result;
}

export const COUNT = DIAGNOSES.length;  // 44
