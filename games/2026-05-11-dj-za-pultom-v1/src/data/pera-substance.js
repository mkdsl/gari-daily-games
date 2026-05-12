// =============================================================================
// data/pera-substance.js — Pera Period S2 substance bank (~75 linija)
// =============================================================================
// Autor: Pera Period + Dule Dubina (etička validacija combined), 2026-05-11
// Reference:
//   - gdd/mile-gdd-s2-substance.md sekcija 15.9 (60-80 nove linije po brifu)
//   - concept/s2-substance-dijagnoze.md sekcija 1-5 (single dijagnoze)
//             sekcija 4.2.6 (compound C1-C8)
//             sekcija H.4 (Nega 6 imena reset)
//   - dule-eticki-filter.md sekcija 4 (Pera Pravilnik)
//
// Anti-glorifikacija strict za T2/T3 (Sekcija G u substance-dijagnoze):
//   T1 (blaga) — Pera dozvoljen suptilno pozitivan ton ("ima nešto u tome")
//   T2 (srednja) — sumnja, "trebao bih da pauziram"
//   T3 (jaka) — realan, ne PSA. Telo zna pre tebe.
//
// Po supstanci × tier × dijagnoza. Plus 8 compound. Plus tier escalation overlay.
// =============================================================================

export const PERA_SUBSTANCE = {

  // ===========================================================================
  // MARIHUANA — 7 dijagnoza
  // T1: M6 (Apetit Kao Sat), M1 (Šuma Između Reči)
  // T2: M2 (Kvar na Sutra), M3 (Sofa Postaje Mreža), M4 (Smeh Koji Stiže Sam)
  // T3: M5 (Mama Nedelja), M7 (Pesma Bez Početka)
  // ===========================================================================

  // T1 — Pera blago pozitivan ("ostrvce u nedelji")
  M6: 'Gladan si u dva. Ne za hranu. Za sebe pre toga.',
  M1: 'Reč je tu. Samo treba tri sekunde više da stigne.',

  // T2 — Pera sumnja ("ovo nije isto kao na pocetku")
  M2: 'Sutra je počelo bez tebe. Stići ćeš ga uveče — ali stiže prvo.',
  M3: 'Sve je tu gde si ga ostavio. Ti si jedini koji se nije pomerio.',
  M4: 'Smeješ se istoj šali sa istih troje. Šala se ne menja, troje se ne menja.',

  // T3 — Pera realan ("telo zna pre mene")
  M5: 'Sve dobre vesti čekaju ponedeljak. Ponedeljak čeka tebe.',
  M7: 'Producent si već tri meseca jedne pesme. Pesma je dobra. Početak je negde drugde.',

  // ===========================================================================
  // PSIHODELICI — 6 dijagnoza
  // T1: P3 (Jedanaest Stvari), P2 (Soba Koja Nije Cela)
  // T2: P1 (Šuma Između Mene i Mene), P5 (Bukvica Bez Stranica)
  // T3: P4 (Identitet Kao Soba Ogledala), P6 (Žurka Koja Te Ne Pušta)
  // ===========================================================================

  // T1 — pozitivan ton sa cost preview, Dule potvrdio P3
  P3: 'Pečurke su ti pokazale jedanaest stvari. Sutra je tvoj posao da se setiš. Nije ih jedanaest čekalo.',
  P2: 'Zid je tu. Samo ne sasvim.',

  // T2 — sumnja
  P1: 'Ogledalo radi. Samo ne odmah.',
  P5: 'Naučio si nešto važno. Nigde nije zapisano. Sutra je opet važno.',

  // T3 — realan, eksternalizovan (Dule pravilo: ne dijagnostikovati karakter)
  P4: 'Bio si pet ljudi sinoć. Pitanje koje ne moraš da odgovoriš: koji je doneo set kući.',
  P6: 'Žurka je gotova pre tri meseca. Pita te ko si i šta tu radiš.',

  // ===========================================================================
  // STIMULANSI — 9 dijagnoza
  // T1: S3 (Spavanje Kao Strana Rec), S6 (Zubi Koji Sami Pricaju)
  // T2: S1 (Sat Ti Se Ne Smiruje), S4 (Ogledalo Koje Laze), S8 (Racun)
  // T3: S5 (Krug Postaze Žica), S2 (Most Koji Ne Drži), S7 (Sve Okusi Isto),
  //     S9 (Sutra Koje Se Ne Vraca — PERMANENT)
  // ===========================================================================

  // T1 — kratak boost ali već imanentni umor; ne glorifikuj
  S3: 'San je negde. Nisi ti.',
  S6: 'Vilica radi sama. Ne pita te više.',

  // T2 — sumnja, "ovo nije ono sto je bilo"
  S1: 'Srce ti ne čeka muziku. Bilo je tu pre nje.',
  S4: 'Pričaš o sebi kao da neko drugi piše. Iz tuđe računice.',
  S8: 'Račun se piše dok ti spavaš. Sutra te čeka u kuhinji.',

  // T3 — realan, telo zna pre tebe
  S5: 'Niko ti nije rekao ništa. Ali znaš da su nešto rekli.',
  S2: 'Most je radio deset godina. Niko nije pitao kako.',
  S7: 'Doneo si veliki gig kući. Stoji u sobi i čeka da ga osetiš.',
  S9: 'Vratio si se. Nije se vratilo sve sa tobom.',

  // ===========================================================================
  // ALKOHOL — 8 dijagnoza
  // T1: A1 (Lice Koje Prepoznaje), A7 (Sutra Kao Juce)
  // T2: A2 (Pre-Noon Resilience), A4 (Unguarded Word), A6 (Misic Koji Zaboravi)
  // T3: A5 (Krug Koji Se Suzava), A3 (Jetra Sapuce — PERMANENT cap),
  //     A8 (Telo Drhti Pre Soundcheck — PERMANENT ritual)
  // ===========================================================================

  // T1 — Nega rename apply-ovan: Hair of the Dog → Pre-Noon Resilience (A2 sinergija u T2)
  A1: 'Pre nego što kažeš ime, neko ga je već rekao. Ne onako kako bi ti.',
  A7: 'Sedmica je prošla. Nije bila ovde.',

  // T2 — sumnja; A2 i A4 imena reformulisana po Negi
  A2: 'Doručak nije obrok. Nastavak je.',
  A4: 'Reči su otišle pre tebe. Sutra ih vraćaš peške.',
  A6: 'Ruke pamte. Kažu ti tek kasnije.',

  // T3 — realan, ne PSA
  A5: 'Krug se nije zatvorio. Samo si stao u jednu njegovu tačku.',
  A3: 'Tihi organ. Ne viče. Beleži.',
  A8: 'Pre svake muzike, telo pita za odgovor. Ti biraš koji.',

  // ===========================================================================
  // NIKOTIN — 6 dijagnoza
  // T1: N5 (Prsti Koji Sami Brojaju), N3 (Sat Koji Te Ceka Napolju)
  // T2: N1 (Pet Minuta), N2 (Glas Koji Trci)
  // T3: N4 (Pluca Sapucu), N6 (Telo Plaća Tihim Racunima — PERMANENT soft cap)
  // ===========================================================================

  // T1
  N5: 'Prsti su znali pre tebe. Sad žele drugu naviku.',
  N3: 'Došao si rano. Cigareta je bila pravi razlog.',

  // T2 — Mile sekcija 3.5 deceptively-benign middle period (suptilan signal)
  N1: 'Pet minuta. Sve odluke koje se zovu pet minuta.',
  N2: 'Glas je tu. Stiže promukao.',

  // T3
  N4: 'Stepenice su iste. Ti si drugačiji.',
  N6: 'Telo plaća. Tihim računima.',

  // ===========================================================================
  // COMPOUND — 8 dijagnoza
  // T2: C1 (M+A Soba Bez Vremena), C2 (M+P Vrata Bez Zakljucavanja — NO PLUS),
  //     C4 (A+N Disanje U Kolektivu), C5 (S+N Žica I Kafa)
  // T3: C3 (A+S Srce Na Dva Motora), C6 (P+S Kontrola Iskoči),
  //     C7 (M+A+N Sva Tri — Normalnost PERMANENT),
  //     C8 (A+S+N — Health PERMANENT, Nega Flag 7 mitigacija)
  // ===========================================================================

  // T2 compound — sumnja prevladava
  C1: 'Soba bez vremena. Pločica ti svira treći put — ili prvi. Pitanje koje ne moraš da odgovoriš.',
  C2: 'Vrata bez ključa. Niko nije ušao, ali ti se čini da jeste.',
  C4: 'Disanje u kolektivu. Krug ti pripada — i odbija sve što nije krug.',
  C5: 'Žica i kafa. Sat se vrti brže, dani prolaze sporije. Telo broji nešto treće.',

  // T3 compound — realan, kratak, ne dramatizovan (Nega Flag 7 strict)
  C3: 'Srce na dva motora. Jedan ga ubrzava, drugi ga drži budnim.',
  C6: 'Kontrola koja iskoči. Mesto ostane. Ti se vratiš tek sutra.',
  C7: 'Sva tri šalju istovremeno. Nedelja te ne čeka. Ti je više ne pratiš.',
  C8: 'Tri ruke vrte rulet. Srce broji kuglice.',

  // ===========================================================================
  // COMPOUND RECOVERY — kad jedna supstanca prestane, compound se "razgrada"
  // Sekcija 14 mile-gdd-s2: standing Pera linija na recovery prelaz
  // ===========================================================================

  compound_recovery: 'Motor se rasklopio. Delovi su tu, svaki sam.',

  // ===========================================================================
  // TIER ESCALATION OVERLAY — opšte Pera linije po tier-u (ne po dijagnozi)
  // Mile sekcija 11 onset cinematic; sekcija 3.5 N2/N1 mid-gradient signal
  // ===========================================================================

  tier_1_general: [
    'Ostrvce u nedelji. Ne menja nedelju — samo se vidi.',
    'Ima nešto u tome. Pitanje koje se otvara kasnije.',
    'Prvi put bez prebrojavanja. Sledeći će već da prebroji.'
  ],

  tier_2_general: [
    'Ovo nije isto kao na početku. Telo to zna pre kalendara.',
    'Trebao bih da pauziram. Rečenica koja se čuje često, izgovara retko.',
    'Sumnja je stigla. Ne presuda — samo sumnja.'
  ],

  tier_3_general: [
    'Ne mogu sam da se izvučem. To je rečenica koju nije lako reći. Lakša je nego onaj sutra koji dolazi.',
    'Telo zna pre mene. Čuo sam ga, sad ga slušam.',
    'Ovo nije faza. Ovo je adresa na koju sam stigao.'
  ],

  // ===========================================================================
  // SUBSTANCE ACCESS COUNTER (Mile sekcija 2 — "Zovi covika" friction)
  // Pera linija kad Numeric Mode OFF, umesto progress bar [Marihuana access: 14/25]
  // ===========================================================================

  access_early: 'Čovek koga ne znaš te još uvek ne zna. Sledeći put možda.',
  access_mid: 'Krug ti je sad sve bliži. Pitanje koje ne moraš da odgovoriš: zašto.',
  access_unlocked: 'Otključalo se. Ne znači da treba da otvoriš.',

  // ===========================================================================
  // RECOVERY SLOT (Sekcija 6.4 — proaktivni slotovi, ne reward)
  // Mile sekcija 11 "Telesno stanje" tab — hover Pera linije
  // ===========================================================================

  slot_tisina: 'Tišina ti je tu. Nedelja od žurki, ne od života.',
  slot_integration: 'Imaš dva poziva za tišinu. Ostavi ih za pravu nedelju.',
  slot_reality_check: 'Jednom ti je sopstvena procena bila bliža tuđoj. Sad provera vraća razliku.',

  // ===========================================================================
  // RELAPSE (Sekcija 7.3 — observation, ne osuda)
  // ===========================================================================

  relapse_light: 'Vratio si se istom mestu. Nije isto mesto sad.',
  relapse_medium: 'Pola koraka nazad. Telo broji od pola.',
  relapse_heavy: 'Vratio si se. Nije se vratilo sve sa tobom.'
};

// =============================================================================
// SELECTOR — koristi se iz systems/pera-period.js ili substance state engine
// =============================================================================
export function selectSubstanceLine(dijagnozaId, context) {
  // Direct lookup po dijagnoza ID (M1-M7, P1-P6, S1-S9, A1-A8, N1-N6, C1-C8)
  if (dijagnozaId && PERA_SUBSTANCE[dijagnozaId]) {
    return PERA_SUBSTANCE[dijagnozaId];
  }

  // Context overlay (tier general, access counter, slot, relapse)
  if (context === 'tier_1') return pick(PERA_SUBSTANCE.tier_1_general);
  if (context === 'tier_2') return pick(PERA_SUBSTANCE.tier_2_general);
  if (context === 'tier_3') return pick(PERA_SUBSTANCE.tier_3_general);

  if (context === 'access_early') return PERA_SUBSTANCE.access_early;
  if (context === 'access_mid') return PERA_SUBSTANCE.access_mid;
  if (context === 'access_unlocked') return PERA_SUBSTANCE.access_unlocked;

  if (context === 'slot_tisina') return PERA_SUBSTANCE.slot_tisina;
  if (context === 'slot_integration') return PERA_SUBSTANCE.slot_integration;
  if (context === 'slot_reality_check') return PERA_SUBSTANCE.slot_reality_check;

  if (context === 'compound_recovery') return PERA_SUBSTANCE.compound_recovery;

  if (context === 'relapse_light') return PERA_SUBSTANCE.relapse_light;
  if (context === 'relapse_medium') return PERA_SUBSTANCE.relapse_medium;
  if (context === 'relapse_heavy') return PERA_SUBSTANCE.relapse_heavy;

  return '';
}

function pick(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

// =============================================================================
// Stats — koliko linija sumarno
// =============================================================================
export const PERA_SUBSTANCE_COUNT = Object.entries(PERA_SUBSTANCE).reduce(
  (sum, [key, val]) => sum + (Array.isArray(val) ? val.length : 1),
  0
);

// =============================================================================
// ŠTA ČEKA ŠEFA (Pera nesigurnost — Mile sekcija 15 pattern)
// =============================================================================
// Pera linije sa "treba sef approval" tag (5 mesta gde Pera nije siguran):
//
//   1. A8 "Pre svake muzike, telo pita za odgovor. Ti birash koji."
//      → A8 je Dule Flag 6 (najjača i najrizičnija dijagnoza). Pera linija
//        namerno univerzalna, ali šef da potvrdi da NE prepoznaje konkretnog
//        DJ-a iz scene. Ako prepozna, zameniti.
//
//   2. C8 "Tri ruke vrte ruletu. Srce broji kuglice."
//      → Nega Flag 7 (poly-use PSA fear-mongering). Mile je vec validirao
//        ovaj redak. Šef da igra-testira da li je rulet metafora previse
//        dramatizovana ili je realan.
//
//   3. C2 "Vrata bez kljucanice. Niko nije usao, ali ti se cini da jesu."
//      → Mile C2 odluka = NO PLUS (compound dissociation). Pera linija mora
//        biti neutralna, ne romantizovana. "cini se" je granica — šef da
//        potvrdi da NE klizi u "interesantno iskustvo" frame.
//
//   4. S9 "Vratio si se. Nije se vratilo sve sa tobom."
//      → Permanent cap dijagnoza. Linija je 2 puta korišćena (S9 + relapse_heavy).
//        Šef da odluci: drzati istu liniju za oba ili pisati novu za relapse_heavy.
//
//   5. P3 "Pecurke su ti pokazale jedanaest stvari. Sutra je tvoj posao da se setis."
//      → Dule Flag 1 (insight gain). Linija je iz Dule etickog filtera (4.5.5)
//        ali je dopuna "Nije ih jedanaest cekalo" Perina dopuna 2026-05-11.
//        Šef da potvrdi da li dopuna dodaje ili oduzima od originala.
//
// Plus indirektno (ne flag, ali za info):
//   - "tier_3_general" — sve tri linije su nove (nisu iz Mile GDD ili Dule filter).
//     Pera je improvizovao "ne mogu sam da se izvucem" frame; ako sef misli da
//     to klizi u PSA, zameniti.
