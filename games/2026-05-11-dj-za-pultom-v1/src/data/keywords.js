// =============================================================================
// data/keywords.js — Custom origin keyword bank (Mile sekcija 5.5)
// =============================================================================
// Cita Q3 signature taste textual + custom_text iz Origin Creator
// Aproksimira ka klasi.

export const ORIGIN_KEYWORDS = {
  bogata_deca: [
    'skup', 'skupa', 'novac nije bio', 'porodica je sponzorisala', 'imali smo sve',
    'roditelji su mi kupili', 'kupili su mi', 'imanje', 'studije u inostranstvu',
    'apartman', 'kola', 'kreditna kartica'
  ],
  radnicka_klasa: [
    'sljakao', 'šljakao', 'drugi posao', 'radio', 'cash crisis', 'nismo imali',
    'kredit', 'minus na racunu', 'plata mala', 'roditelji rade', 'fabrika',
    'gradiliste', 'masina', 'smene', 'sef je rekao'
  ],
  posthumna_penzija: [
    'stipendija', 'primanja od kuce', 'porodica je pomagala', 'penzija',
    'roditelj umro', 'baba mi je ostavila', 'naslede', 'stan na uzivanje',
    'faks pocinje', 'jos nisam zavrsio faks', 'pauza izmedju'
  ],
  apstinent: [
    'nisam pio', 'apstinent', 'trezno', 'ne pijem', 'odustao sam od alkohola',
    'cista glava', 'nikad nisam pio'
  ],
  mentor: [
    'stariji brat', 'mentor', 'prijatelj DJ', 'neko ko mi je pomogao',
    'pokazao mi je', 'naucio sam od', 'gledao sam ga', 'pratio sam'
  ],
  monomania: [
    'samo muzika', 'sve vreme slusam', 'opsednut', 'nista drugo me ne zanima',
    'samo to volim', 'svaki dan'
  ]
};

export function approximateClassFromText(text) {
  const lower = text.toLowerCase();
  const scores = {
    bogata_deca: 0,
    radnicka_klasa: 0,
    posthumna_penzija: 0
  };
  for (const [klasa, words] of Object.entries(scores)) {
    for (const kw of ORIGIN_KEYWORDS[klasa]) {
      if (lower.includes(kw)) scores[klasa] += 1;
    }
  }

  // Side flags
  const flags = {
    apstinent_hint: ORIGIN_KEYWORDS.apstinent.some(kw => lower.includes(kw)),
    mentor_hint: ORIGIN_KEYWORDS.mentor.some(kw => lower.includes(kw)),
    monomania_hint: ORIGIN_KEYWORDS.monomania.some(kw => lower.includes(kw))
  };

  // Find max
  let max = 0;
  let chosen = 'custom';
  for (const [klasa, score] of Object.entries(scores)) {
    if (score > max) {
      max = score;
      chosen = klasa;
    }
  }

  // Fallback: if no matches, stay custom
  if (max === 0) chosen = 'custom';

  return { chosen_class_hint: chosen, scores, flags };
}
