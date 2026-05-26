// dialogue_tree.js — DIALOGUE_NODES: svi node-ovi za sve scene (Scene 0-8 kompletno)
// Format node: { id, type, narration?, lines?, choices?, next? }
// type: 'narration' | 'dialogue' | 'choice' | 'resolve' | 'auto'

export const DIALOGUE_NODES = {

  // ============================================================
  // SCENE 0 — Ulaz
  // ============================================================
  scene0_start: {
    id: 'scene0_start',
    type: 'narration',
    scene: 0,
    narration: 'Vrata sale za sastanke su odškrinuta. Svi su već unutra. Gari nešto crta na tabli — izgleda kao flow chart ali sa previše linija. Mici tipka brže nego što može da prati. Brana sedi dalje od svih, gleda u papir. Tonket ima slušalice oko vrata ali ih ne nosi. Dule piše nešto sitno u rokovniku. I Pera Period — na ugaonoj stolici, beležnica na krilu, olovka u ruci, ne gleda nikud konkretno.',
    next: 'scene0_choices',
  },

  scene0_choices: {
    id: 'scene0_choices',
    type: 'choice',
    scene: 0,
    prompt: 'Ima jedna slobodna stolica pored Garija. Jedna pored Mici. Jedna pored Brane. I možeš da ostaneš kod vrata.',
    choices: [
      {
        key: 'A',
        text: 'Sedeš pored Garija.',
        delta: { gari: 2 },
        flags: { scene0_choice: 'A' },
        next: 'scene1_start',
      },
      {
        key: 'B',
        text: 'Sedeš pored Mici.',
        delta: { mici: 2 },
        flags: { scene0_choice: 'B' },
        next: 'scene1_start',
      },
      {
        key: 'C',
        text: 'Sedeš pored Brane.',
        delta: { brana: 2 },
        flags: { scene0_choice: 'C' },
        next: 'scene1_start',
      },
      {
        key: 'D',
        text: 'Ostaješ kod vrata.',
        delta: { pera: 1, tonket: 1 },
        flags: { scene0_choice: 'D' },
        next: 'scene1_start',
      },
    ],
  },

  // ============================================================
  // SCENE 1 — Uvod krug
  // ============================================================
  scene1_start: {
    id: 'scene1_start',
    type: 'narration',
    scene: 1,
    narration: 'Gari ne gleda gore ali zna da si unutra. „OK,“ kaže. „Idemo dalje. Svako zna šta radi.“ Brza runda statusa: Mici je zaklopila laptop, kaže „community je spreman kad mi damo signal.“ Brana kaže „Guncati ima drenaž pitanje koje blokira fazu.“ Tonket kaže „SPL merenje je zakazano, ali lokacija nije potvrđena.“ Dule samo kaže „copy čeka sign-off.“ Pera nešto piše u svesku i ne gleda gore.',
    next: 'scene1_gari_pitanje',
  },

  scene1_gari_pitanje: {
    id: 'scene1_gari_pitanje',
    type: 'dialogue',
    scene: 1,
    lines: [
      { speaker: 'gari', text: 'Gari kima. Onda gleda tebe.' },
      { speaker: 'gari', text: 'I ti — ko si?' },
    ],
    next: 'scene1_choices',
  },

  scene1_choices: {
    id: 'scene1_choices',
    type: 'choice',
    scene: 1,
    prompt: 'Svi čekaju. Pera nešto piše.',
    choices: [
      {
        key: 'A',
        text: '„Zovem se [ime], vidim da treba nešto da se sredi.“',
        delta: { gari: 2, brana: 1 },
        flags: { predstavljanje_tip: 'sistem' },
        next: 'scene1_response_A',
      },
      {
        key: 'B',
        text: '„Stigao/la sam jer sam čuo/la da je dobra ekipa.“',
        delta: { mici: 2, gari: 1 },
        flags: { predstavljanje_tip: 'ljude' },
        next: 'scene1_response_B',
      },
      {
        key: 'C',
        text: '„Nisam siguran/na zašto sam ovde, ali biću koristan/na.“',
        delta: { dule: 2, pera: 1 },
        flags: { predstavljanje_tip: 'humorno' },
        next: 'scene1_response_C',
      },
      {
        key: 'D',
        text: '[klimneš glavom, ništa ne kažeš]',
        delta: { tonket: 3, brana: 1 },
        flags: { predstavljanje_tip: 'tiho' },
        next: 'scene1_response_D',
      },
    ],
  },

  scene1_response_A: {
    id: 'scene1_response_A',
    type: 'dialogue',
    scene: 1,
    lines: [
      { speaker: 'gari', text: 'Gari kima. „OK. Nešto što se sredi.“' },
      { speaker: 'brana', text: 'Brana gleda bez komentara. To je komplement.' },
    ],
    next: 'scene2_start',
  },

  scene1_response_B: {
    id: 'scene1_response_B',
    type: 'dialogue',
    scene: 1,
    lines: [
      { speaker: 'mici', text: 'Mici se smeška. „Kakvа ekipa.“' },
      { speaker: 'gari', text: 'Gari kaže „dobro“ i odmah prelazi dalje.' },
    ],
    next: 'scene2_start',
  },

  scene1_response_C: {
    id: 'scene1_response_C',
    type: 'dialogue',
    scene: 1,
    lines: [
      { speaker: 'dule', text: 'Dule piše nešto sitno. Možda o tebi. Možda ne.' },
      { speaker: 'gari', text: '„OK,“ kaže Gari. „Prilike ima.“' },
    ],
    next: 'scene2_start',
  },

  scene1_response_D: {
    id: 'scene1_response_D',
    type: 'dialogue',
    scene: 1,
    lines: [
      { speaker: 'tonket', text: 'Tonket te gleda pravo. Kima.' },
      { speaker: 'gari', text: 'Gari kaže „u redu“ i nastavlja. Kao da je dovoljno.' },
    ],
    next: 'scene2_start',
  },

  // ============================================================
  // SCENE 2 — Zadatak + Gari/Tonket divergencija
  // ============================================================
  scene2_start: {
    id: 'scene2_start',
    type: 'narration',
    scene: 2,
    narration: 'Gari kaže: „Imamo jedan zadatak koji treba rešiti do Avale. Terenski kontakt u zoni gde imamo i zvuk i logistiku.“ Tonket odmah kaže: „Znači merenje, lokacija, decibeli. Ništa više.“ Gari odgovori mirno: „Ili komunikacija sa timom koji je tamo.“ Kratka pauza.',
    next: 'scene2_divergencija',
  },

  scene2_divergencija: {
    id: 'scene2_divergencija',
    type: 'dialogue',
    scene: 2,
    lines: [
      { speaker: 'tonket', text: 'Tonket i Gari se ne svadđaju — ali soba oseca da se ne slažu.' },
      { speaker: 'gari',   text: 'Svi čekaju ko će nešto reći.' },
    ],
    next: 'scene2_choices',
  },

  scene2_choices: {
    id: 'scene2_choices',
    type: 'choice',
    scene: 2,
    prompt: 'Možeš da kažeš nešto.',
    choices: [
      {
        key: 'A',
        text: '„Ako ima teren, mora biti merenje prvo.“',
        delta: { tonket: 3, brana: 1 },
        next: 'scene2_response_A',
      },
      {
        key: 'B',
        text: '„Koordinacija je i komunikacija, ne samo tehnikalije.“',
        delta: { gari: 3, mici: 1 },
        next: 'scene2_response_B',
      },
    ],
  },

  scene2_response_A: {
    id: 'scene2_response_A',
    type: 'dialogue',
    scene: 2,
    lines: [
      { speaker: 'tonket', text: 'Tonket kima jednom. To je dosta.' },
      { speaker: 'brana',  text: 'Brana zatvara beležnicu. Spreman.' },
    ],
    next: 'scene3_dispatch',
  },

  scene2_response_B: {
    id: 'scene2_response_B',
    type: 'dialogue',
    scene: 2,
    lines: [
      { speaker: 'gari', text: 'Gari te pogleda drugi put. Registruje.' },
      { speaker: 'mici', text: 'Mici: „Tačno.“ Zaklopila laptop.' },
    ],
    next: 'scene3_dispatch',
  },

  // scene3_dispatch is a virtual node handled in main.js
  scene3_dispatch: {
    id: 'scene3_dispatch',
    type: 'auto',
    scene: 2,
    next: '__scene3_dynamic__',
  },

  // ============================================================
  // SCENE 3 — 1-na-1 — GARI verzija
  // ============================================================
  scene3_gari_start: {
    id: 'scene3_gari_start',
    type: 'narration',
    scene: 3,
    narration: 'Gari te uhvata za vreme kratke pauze kad svi idu po kafu. Nema nešto posebno da pita — ili tako izgleda. Prve dve sekunde su tišina.',
    next: 'scene3_gari_callback',
  },

  scene3_gari_callback: {
    id: 'scene3_gari_callback',
    type: 'dialogue',
    scene: 3,
    lines: [
      { speaker: 'gari', text: 'Primetio sam da si seo/la pored mene. To nije slučajno, ili jeste?' },
    ],
    next: 'scene3_gari_q1',
  },

  scene3_gari_q1: {
    id: 'scene3_gari_q1',
    type: 'choice',
    scene: 3,
    prompt: 'Gari: „Kad vidiš problem, šta prvo gledaš?“',
    choices: [
      {
        key: 'A',
        text: '„Šta ga uzrokuje.“',
        delta: { gari: 3 },
        next: 'scene3_gari_q1_A',
      },
      {
        key: 'B',
        text: '„Ko je uključen.“',
        delta: { mici: 2, gari: 1 },
        next: 'scene3_gari_q1_B',
      },
      {
        key: 'C',
        text: '„Šta se može odmah popraviti.“',
        delta: { brana: 2, tonket: 1 },
        next: 'scene3_gari_q1_C',
      },
    ],
  },

  scene3_gari_q1_A: {
    id: 'scene3_gari_q1_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: 'Gari kima polako. „I uvek je nešto uzrokovalo uzrok.“' }],
    next: 'scene3_gari_q2',
  },
  scene3_gari_q1_B: {
    id: 'scene3_gari_q1_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: '„Proces ili lju-di. Oboje, obično.“ Kaže Gari.' }],
    next: 'scene3_gari_q2',
  },
  scene3_gari_q1_C: {
    id: 'scene3_gari_q1_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: '„Praktično.“ Kaže Gari. Ne dodaje ništa.' }],
    next: 'scene3_gari_q2',
  },

  scene3_gari_q2: {
    id: 'scene3_gari_q2',
    type: 'choice',
    scene: 3,
    prompt: 'Gari: „Radiš bolje sam/a ili u grupi?“',
    choices: [
      {
        key: 'A',
        text: '„Zavisi od zadatka.“',
        delta: { gari: 2, dule: 1 },
        next: 'scene3_gari_q2_A',
      },
      {
        key: 'B',
        text: '„Volim grupu.“',
        delta: { mici: 3 },
        next: 'scene3_gari_q2_B',
      },
      {
        key: 'C',
        text: '„Sam/a, ali pokazujem rezultate.“',
        delta: { brana: 2 },
        next: 'scene3_gari_q2_C',
      },
    ],
  },

  scene3_gari_q2_A: {
    id: 'scene3_gari_q2_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: '„To je jedini ispravan odgovor.“ Gari se ne smeje ali mu oči malo promene.' }],
    next: 'scene3_gari_q3',
  },
  scene3_gari_q2_B: {
    id: 'scene3_gari_q2_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: '„Grupa radi dobro kad zna ko šta radi.“' }],
    next: 'scene3_gari_q3',
  },
  scene3_gari_q2_C: {
    id: 'scene3_gari_q2_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: '„Rezultati su dobri. Proces se uči.“' }],
    next: 'scene3_gari_q3',
  },

  scene3_gari_q3: {
    id: 'scene3_gari_q3',
    type: 'choice',
    scene: 3,
    prompt: 'Gari: „Šta ti je dosadno u poslu?“',
    choices: [
      {
        key: 'A',
        text: '„Ponavljanje bez svrhe.“',
        delta: { gari: 2, dule: 1 },
        next: 'scene3_gari_q3_A',
      },
      {
        key: 'B',
        text: '„Kad se ne čuje terenska realnost.“',
        delta: { tonket: 3 },
        next: 'scene3_gari_q3_B',
      },
      {
        key: 'C',
        text: '„Kad nema strukture.“',
        delta: { gari: 3 },
        next: 'scene3_gari_q3_C',
      },
    ],
  },

  scene3_gari_q3_A: {
    id: 'scene3_gari_q3_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: '„Svrha se napravi.“ Kaže Gari. Vraćaju se u salu.' }],
    next: 'scene4_start',
  },
  scene3_gari_q3_B: {
    id: 'scene3_gari_q3_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: '„Tonket kaže isto.“ Gari pogleda prema sali. „Ide.“' }],
    next: 'scene4_start',
  },
  scene3_gari_q3_C: {
    id: 'scene3_gari_q3_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'gari', text: '„Struktura postoji. Neko mora da je vidi.“ Gleda tebe.' }],
    next: 'scene4_start',
  },

  // ============================================================
  // SCENE 3 — 1-na-1 — MICI verzija
  // ============================================================
  scene3_mici_start: {
    id: 'scene3_mici_start',
    type: 'narration',
    scene: 3,
    narration: 'Mici te uhvata za vreme kratke pauze kad svi idu po kafu. Ima nešto u načinu na koji stoji — kao da je razgovor već počeo.',
    next: 'scene3_mici_q1',
  },

  scene3_mici_q1: {
    id: 'scene3_mici_q1',
    type: 'choice',
    scene: 3,
    prompt: 'Mici: „Kome bi prvo rekao/la kad nešto saznaš?“',
    choices: [
      {
        key: 'A',
        text: '„Svima odjednom, javno.“',
        delta: { mici: 3 },
        next: 'scene3_mici_q1_A',
      },
      {
        key: 'B',
        text: '„Pre svega onome koga se tiče.“',
        delta: { gari: 2, brana: 1 },
        next: 'scene3_mici_q1_B',
      },
      {
        key: 'C',
        text: '„Zapisao/la bih pa video/la.“',
        delta: { dule: 2 },
        next: 'scene3_mici_q1_C',
      },
    ],
  },

  scene3_mici_q1_A: {
    id: 'scene3_mici_q1_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: 'Mici klima. „To volim.“' }],
    next: 'scene3_mici_q2',
  },
  scene3_mici_q1_B: {
    id: 'scene3_mici_q1_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: '„Precizno. Ali ponekad cela soba treba da čuje.“' }],
    next: 'scene3_mici_q2',
  },
  scene3_mici_q1_C: {
    id: 'scene3_mici_q1_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: '„Dule isto radi. Kažu da radi.“' }],
    next: 'scene3_mici_q2',
  },

  scene3_mici_q2: {
    id: 'scene3_mici_q2',
    type: 'choice',
    scene: 3,
    prompt: 'Mici: „Šta misliš o Kluboslaviji?“',
    choices: [
      {
        key: 'A',
        text: '„Odlična ideja.“',
        delta: { mici: 2 },
        next: 'scene3_mici_q2_A',
      },
      {
        key: 'B',
        text: '„Nisam upoznat/a, ali zvuci interesantno.“',
        delta: { mici: 1, pera: 1 },
        next: 'scene3_mici_q2_B',
      },
      {
        key: 'C',
        text: '„Kako funkcióniše tačno?“',
        delta: { mici: 3, brana: 1 },
        next: 'scene3_mici_q2_C',
      },
    ],
  },

  scene3_mici_q2_A: {
    id: 'scene3_mici_q2_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: 'Mici se smeška. „Znam, znam.“' }],
    next: 'scene3_mici_q3',
  },
  scene3_mici_q2_B: {
    id: 'scene3_mici_q2_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: '„Peri Period bi tačno to rekao. Vi se volite.“ Šali se, ali nije.' }],
    next: 'scene3_mici_q3',
  },
  scene3_mici_q2_C: {
    id: 'scene3_mici_q2_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: 'Mici se ozari. Počinje da priča. Tri rečenice. Sve su važne.' }],
    next: 'scene3_mici_q3',
  },

  scene3_mici_q3: {
    id: 'scene3_mici_q3',
    type: 'choice',
    scene: 3,
    prompt: 'Mici: „Da li pratiš šta publika kaže?“',
    choices: [
      {
        key: 'A',
        text: '„Uvek, to mi je merilo.“',
        delta: { mici: 3 },
        next: 'scene3_mici_q3_A',
      },
      {
        key: 'B',
        text: '„Ponekad, kad imam vremena.“',
        delta: { mici: 1 },
        next: 'scene3_mici_q3_B',
      },
      {
        key: 'C',
        text: '„Ne direktno, ali osecam.“',
        delta: { dule: 2, pera: 1 },
        next: 'scene3_mici_q3_C',
      },
    ],
  },

  scene3_mici_q3_A: {
    id: 'scene3_mici_q3_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: '„Ti i ja radimo isti posao.“ Vraćaju se u salu.' }],
    next: 'scene4_start',
  },
  scene3_mici_q3_B: {
    id: 'scene3_mici_q3_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: '„Vreme treba napraviti.“ Kaže Mici. Ne ljutito. Iskreno.' }],
    next: 'scene4_start',
  },
  scene3_mici_q3_C: {
    id: 'scene3_mici_q3_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'mici', text: '„Osećanje je podatak. Samo tiši.“ Mici zamišljeno.' }],
    next: 'scene4_start',
  },

  // ============================================================
  // SCENE 3 — 1-na-1 — BRANA verzija
  // ============================================================
  scene3_brana_start: {
    id: 'scene3_brana_start',
    type: 'narration',
    scene: 3,
    narration: 'Brana te uhvata za vreme kratke pauze kad svi idu po kafu. Stoji kraj prozora, šolja čaja u ruci. Ne gleda napolje — gleda tebe.',
    next: 'scene3_brana_callback',
  },

  scene3_brana_callback: {
    id: 'scene3_brana_callback',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: 'Dobar znak kad neko ne priča odmah.' }],
    next: 'scene3_brana_q1',
  },

  scene3_brana_q1: {
    id: 'scene3_brana_q1',
    type: 'choice',
    scene: 3,
    prompt: 'Brana: „Jesi li ikad radio/la na imanju?“',
    choices: [
      {
        key: 'A',
        text: '„Da, volim fizički rad.“',
        delta: { brana: 3, tonket: 1 },
        next: 'scene3_brana_q1_A',
      },
      {
        key: 'B',
        text: '„Nisam, ali učio/la bih.“',
        delta: { brana: 2 },
        next: 'scene3_brana_q1_B',
      },
      {
        key: 'C',
        text: '„Ne, ali mogu koordinisati.“',
        delta: { gari: 1, brana: 1 },
        next: 'scene3_brana_q1_C',
      },
    ],
  },

  scene3_brana_q1_A: {
    id: 'scene3_brana_q1_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: 'Brana kima. „Guncati treba ljude koji znaju šta znaju ruke.“' }],
    next: 'scene3_brana_q2',
  },
  scene3_brana_q1_B: {
    id: 'scene3_brana_q1_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: '„Učeće se nešto ne može naučiti ni školom ni knji-gom.“' }],
    next: 'scene3_brana_q2',
  },
  scene3_brana_q1_C: {
    id: 'scene3_brana_q1_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: '„Koordinacija nije loša. Samo ne zaboravi teren.“' }],
    next: 'scene3_brana_q2',
  },

  scene3_brana_q2: {
    id: 'scene3_brana_q2',
    type: 'choice',
    scene: 3,
    prompt: 'Brana: „Šta misliš o permaculture principima?“',
    choices: [
      {
        key: 'A',
        text: '„Znam ih, primenjujem.“',
        delta: { brana: 3 },
        next: 'scene3_brana_q2_A',
      },
      {
        key: 'B',
        text: '„Nisam stručnjak, ali logika ima smisla.“',
        delta: { brana: 2 },
        next: 'scene3_brana_q2_B',
      },
      {
        key: 'C',
        text: '„To je za Guncati — ja sam za druge stvari.“',
        delta: { tonket: 1 },
        next: 'scene3_brana_q2_C',
      },
    ],
  },

  scene3_brana_q2_A: {
    id: 'scene3_brana_q2_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: 'Brana pogleda kao da prvi put vidi tebe. „Gde si učio/la?“' }],
    next: 'scene3_brana_q3',
  },
  scene3_brana_q2_B: {
    id: 'scene3_brana_q2_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: '„Princip koji ima smisla, radi. Bez obzira na naziv.“' }],
    next: 'scene3_brana_q3',
  },
  scene3_brana_q2_C: {
    id: 'scene3_brana_q2_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: 'Brana ne komentariše. Piše nešto u beležnicu.' }],
    next: 'scene3_brana_q3',
  },

  scene3_brana_q3: {
    id: 'scene3_brana_q3',
    type: 'choice',
    scene: 3,
    prompt: 'Brana: „Koliko ti je važna preciznost?“',
    choices: [
      {
        key: 'A',
        text: '„Bez preciznosti nema smisla.“',
        delta: { brana: 3, dule: 1 },
        next: 'scene3_brana_q3_A',
      },
      {
        key: 'B',
        text: '„Važna, ali ne paralisati se.“',
        delta: { gari: 2, brana: 1 },
        next: 'scene3_brana_q3_B',
      },
      {
        key: 'C',
        text: '„Brzina je ponekad bitnija.“',
        delta: { mici: 2 },
        next: 'scene3_brana_q3_C',
      },
    ],
  },

  scene3_brana_q3_A: {
    id: 'scene3_brana_q3_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: '„Vidiš stvari kako treba.“ Brana zatvori beležnicu. Vraćaju se.' }],
    next: 'scene4_start',
  },
  scene3_brana_q3_B: {
    id: 'scene3_brana_q3_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: '„Ravnoteža.“ Kaže Brana. „Re-tka stvar.“' }],
    next: 'scene4_start',
  },
  scene3_brana_q3_C: {
    id: 'scene3_brana_q3_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'brana', text: 'Brana ti dâ pogled koji nije ni osuda ni saglasnost. „Idemo.“' }],
    next: 'scene4_start',
  },

  // ============================================================
  // SCENE 3 — 1-na-1 — TONKET verzija
  // ============================================================
  scene3_tonket_start: {
    id: 'scene3_tonket_start',
    type: 'narration',
    scene: 3,
    narration: 'Tonket te uhvata za vreme kratke pauze kad svi idu po kafu. Ima slušalice oko vrata. Ne nosi ih. Stoji mir-no — ali pazi na svaki zvuk u hodniku.',
    next: 'scene3_tonket_q1',
  },

  scene3_tonket_q1: {
    id: 'scene3_tonket_q1',
    type: 'choice',
    scene: 3,
    prompt: 'Tonket: „Koliko glasno je premalo glasno?“',
    choices: [
      {
        key: 'A',
        text: '„Zavisi od prostora.“',
        delta: { tonket: 2, brana: 1 },
        next: 'scene3_tonket_q1_A',
      },
      {
        key: 'B',
        text: '„Kad ne čujes detalje.“',
        delta: { tonket: 3 },
        next: 'scene3_tonket_q1_B',
      },
      {
        key: 'C',
        text: '„Kad se publika žali.“',
        delta: { mici: 2 },
        next: 'scene3_tonket_q1_C',
      },
    ],
  },

  scene3_tonket_q1_A: {
    id: 'scene3_tonket_q1_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: '„Tačno. Svaki prostor ima svoju kalibraciju.“' }],
    next: 'scene3_tonket_q2',
  },
  scene3_tonket_q1_B: {
    id: 'scene3_tonket_q1_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: 'Tonket stane. „To je pravi odgovor.“' }],
    next: 'scene3_tonket_q2',
  },
  scene3_tonket_q1_C: {
    id: 'scene3_tonket_q1_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: '„Publika se žali kasno. Čuj problem pre njih.“' }],
    next: 'scene3_tonket_q2',
  },

  scene3_tonket_q2: {
    id: 'scene3_tonket_q2',
    type: 'choice',
    scene: 3,
    prompt: 'Tonket: „Da li bi izašao/la na teren?“',
    choices: [
      {
        key: 'A',
        text: '„Odmah.“',
        delta: { tonket: 3, brana: 2 },
        next: 'scene3_tonket_q2_A',
      },
      {
        key: 'B',
        text: '„Ako je potrebno, da.“',
        delta: { gari: 1, tonket: 1 },
        next: 'scene3_tonket_q2_B',
      },
      {
        key: 'C',
        text: '„Preferiram koordinaciju odavde.“',
        delta: { gari: 2 },
        next: 'scene3_tonket_q2_C',
      },
    ],
  },

  scene3_tonket_q2_A: {
    id: 'scene3_tonket_q2_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: 'Tonket kima jednom. Kratko. „Dobro.“' }],
    next: 'scene3_tonket_q3',
  },
  scene3_tonket_q2_B: {
    id: 'scene3_tonket_q2_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: '„Uvek je potrebno.“ Kaže Tonket mirno.' }],
    next: 'scene3_tonket_q3',
  },
  scene3_tonket_q2_C: {
    id: 'scene3_tonket_q2_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: '„Koordinacija je moćna. Ali teren te ispravi.“' }],
    next: 'scene3_tonket_q3',
  },

  scene3_tonket_q3: {
    id: 'scene3_tonket_q3',
    type: 'choice',
    scene: 3,
    prompt: 'Tonket: „Šta je lošije: loš zvuk ili loša organizacija?“',
    choices: [
      {
        key: 'A',
        text: '„Loš zvuk — ubija iskustvo.“',
        delta: { tonket: 3 },
        next: 'scene3_tonket_q3_A',
      },
      {
        key: 'B',
        text: '„Loša organizacija — zvuk se popravi.“',
        delta: { gari: 2 },
        next: 'scene3_tonket_q3_B',
      },
      {
        key: 'C',
        text: '„Oboje podjednako loše.“',
        delta: { dule: 1, pera: 1 },
        next: 'scene3_tonket_q3_C',
      },
    ],
  },

  scene3_tonket_q3_A: {
    id: 'scene3_tonket_q3_A',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: 'Tonket stavi slušalice na uši nakratko, pa ih skine. „Idemo.“' }],
    next: 'scene4_start',
  },
  scene3_tonket_q3_B: {
    id: 'scene3_tonket_q3_B',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: '„Zvuk se ne popravi lako. Ali u redu.“ Tonket se vraća u salu.' }],
    next: 'scene4_start',
  },
  scene3_tonket_q3_C: {
    id: 'scene3_tonket_q3_C',
    type: 'dialogue',
    scene: 3,
    lines: [{ speaker: 'tonket', text: '„Fer odgovor.“ Kaže Tonket. Ide bez reči više.' }],
    next: 'scene4_start',
  },

  // ============================================================
  // SCENE 4 — Konfrontacija Brana/Mici
  // ============================================================
  scene4_start: {
    id: 'scene4_start',
    type: 'narration',
    scene: 4,
    narration: 'Brana se vraća sa šoljom čaja koji ne pije. Mici je zaklopila laptop. Gari čeka. Brana kaže bez uvoda: „Ne možemo ići u akciju dok nemamo precizne podatke s terena. Avala nije koncertna hala.“ Mici brzo: „Čekanje na podatke je izgubljena publika. Window se zatvori.“ Pera nešto piše u svesku i ne gleda gore.',
    next: 'scene4_tonket_aside',
  },

  scene4_tonket_aside: {
    id: 'scene4_tonket_aside',
    type: 'dialogue',
    scene: 4,
    lines: [
      { speaker: 'tonket', text: 'Tonket ne kaže ništa — ali klima glavom uz Branu.' },
      { speaker: 'gari', text: 'Gari ćuti. I soba čeka tebe.' },
    ],
    next: 'scene4_choices',
  },

  scene4_choices: {
    id: 'scene4_choices',
    type: 'choice',
    scene: 4,
    prompt: 'Možeš da kažeš nešto.',
    choices: [
      {
        key: 'A',
        text: '„Brana je u pravu — bez podataka delujemo nasumično.“',
        delta: { brana: 4, tonket: 2, gari: 1 },
        flags: { strana_konfrontacije: 'brana' },
        next: 'scene4_response_A',
      },
      {
        key: 'B',
        text: '„Mici ima poenu — window of opportunity se zatvori.“',
        delta: { mici: 4, gari: 2 },
        flags: { strana_konfrontacije: 'mici' },
        next: 'scene4_response_B',
      },
      {
        key: 'C',
        text: '„Oboje ima smisla — može li se paralelno?“',
        delta: { gari: 3, dule: 1 },
        flags: { strana_konfrontacije: 'neutralan' },
        next: 'scene4_response_C',
      },
      {
        key: 'D',
        text: '„Pitanje nije kad — pitanje je ko to radi.“',
        delta: { gari: 2, dule: 2, pera: 1 },
        flags: { strana_konfrontacije: 'preusmeri' },
        next: 'scene4_response_D',
      },
    ],
  },

  scene4_response_A: {
    id: 'scene4_response_A',
    type: 'dialogue',
    scene: 4,
    lines: [
      { speaker: 'brana', text: 'Brana kima. Kao da je očekivao.' },
      { speaker: 'mici',  text: 'Mici zatvori laptop. Ne slaže se, ali ne nastavlja.' },
    ],
    next: 'scene5_start',
  },

  scene4_response_B: {
    id: 'scene4_response_B',
    type: 'dialogue',
    scene: 4,
    lines: [
      { speaker: 'mici', text: 'Mici te pogleda kao saveznika. Otvori laptop nazad.' },
      { speaker: 'gari', text: 'Gari: „OK. Mici, šta treba?“' },
    ],
    next: 'scene5_start',
  },

  scene4_response_C: {
    id: 'scene4_response_C',
    type: 'dialogue',
    scene: 4,
    lines: [
      { speaker: 'gari', text: 'Gari: „Paralelno znači dva tima. Ima smisla.“' },
      { speaker: 'brana', text: 'Brana i Mici se ne slažu ali prihvataju.' },
    ],
    next: 'scene5_start',
  },

  scene4_response_D: {
    id: 'scene4_response_D',
    type: 'dialogue',
    scene: 4,
    lines: [
      { speaker: 'dule', text: 'Dule prestaje da piše. Gleda tebe.' },
      { speaker: 'gari', text: 'Gari: „Ko radi — dobro pitanje.“' },
    ],
    next: 'scene5_start',
  },

  // ============================================================
  // SCENE 5 — Tonketov test
  // ============================================================
  scene5_start: {
    id: 'scene5_start',
    type: 'narration',
    scene: 5,
    narration: 'Tonket čeka dok ostali raspravljaju oko logistike. Tek kad se soba utiša, kaže ti jednu rečenicu.',
    next: 'scene5_tonket_pitanje',
  },

  scene5_tonket_pitanje: {
    id: 'scene5_tonket_pitanje',
    type: 'dialogue',
    scene: 5,
    lines: [
      { speaker: 'tonket', text: 'Imam jedno pitanje za tebe. Ti meni jedno.' },
      { speaker: 'tonket', text: 'Čeka.' },
    ],
    next: 'scene5_choices',
  },

  scene5_choices: {
    id: 'scene5_choices',
    type: 'choice',
    scene: 5,
    prompt: 'Pitaš Tonketa:',
    choices: [
      {
        key: 'A',
        text: '„Koji je bio najgori zvuk koji si ikad čuo na terenu?“',
        delta: { tonket: 4, brana: 1 },
        flags: { tonket_pitanje: 'A' },
        next: 'scene5_tonket_A',
      },
      {
        key: 'B',
        text: '„Kako znaš kad je nešto dovoljno dobro?“',
        delta: { tonket: 2, dule: 2, pera: 2 },
        flags: { tonket_pitanje: 'B' },
        next: 'scene5_tonket_B',
      },
      {
        key: 'C',
        text: '„Šta bi promenio/la u ovom timu?“',
        delta: { gari: 1, dule: 1, pera: 3 },
        flags: { tonket_pitanje: 'C' },
        next: 'scene5_tonket_C',
      },
    ],
  },

  scene5_tonket_A: {
    id: 'scene5_tonket_A',
    type: 'dialogue',
    scene: 5,
    lines: [
      { speaker: 'tonket', text: 'Bina u Nišu. Subwoofer koji je bio okrenut prema publici.' },
      { speaker: 'tonket', text: 'Čuо sam to samo jednom — nije ponovljeno.' },
    ],
    next: 'scene6_start',
  },

  scene5_tonket_B: {
    id: 'scene5_tonket_B',
    type: 'dialogue',
    scene: 5,
    lines: [
      { speaker: 'tonket', text: 'Kad slušaš i nema sta da popraviš. Retko se desi.' },
      { speaker: 'tonket', text: 'Kad se desi, ne kaješ se.' },
    ],
    next: 'scene6_start',
  },

  scene5_tonket_C: {
    id: 'scene5_tonket_C',
    type: 'dialogue',
    scene: 5,
    lines: [
      { speaker: 'tonket', text: '[pauza]' },
      { speaker: 'tonket', text: 'Ništa. Ako promeniš tim, promeniš sistem. A sistem radi.' },
    ],
    next: 'scene6_start',
  },

  // ============================================================
  // SCENE 6 — Garijev direktan poziv
  // ============================================================
  scene6_start: {
    id: 'scene6_start',
    type: 'narration',
    scene: 6,
    narration: 'Gari zatvara meeting. „Svako zna šta radi.“ Pogleda tebe. Mici čeka odgovor. Brana gleda u papir ali sluša. Tonket ima slušalice na ušima ali ne sluša muziku. Pera Period sklapa beležnicu polako.',
    next: 'scene6_gari_poziv',
  },

  scene6_gari_poziv: {
    id: 'scene6_gari_poziv',
    type: 'dialogue',
    scene: 6,
    lines: [
      { speaker: 'gari', text: 'Ti — šta ti hoćeš da radiš ovde?' },
      { speaker: 'gari', text: 'Nije retoričko.' },
    ],
    next: 'scene6_choices',
  },

  scene6_choices: {
    id: 'scene6_choices',
    type: 'choice',
    scene: 6,
    prompt: 'Svi slušaju.',
    choices: [
      {
        key: 'A',
        text: '„Hoću da vidim kako sistem funkcióniše iznutra.“',
        delta: { gari: 3 },
        flags: { gari_finalni: 'struktura' },
        next: 'scene6_response_A',
      },
      {
        key: 'B',
        text: '„Hoću da radim sa ljudima, ne iza ekrana.“',
        delta: { mici: 3 },
        flags: { gari_finalni: 'ljude' },
        next: 'scene6_response_B',
      },
      {
        key: 'C',
        text: '„Hoću da izađem na teren i vidim sa čim radimo.“',
        delta: { brana: 2, tonket: 2 },
        flags: { gari_finalni: 'teren' },
        next: 'scene6_response_C',
      },
      {
        key: 'D',
        text: '„Hoću da ti postavim pitanje pre nego što odgovorim.“',
        delta: { dule: 2, pera: 2 },
        flags: { gari_finalni: 'jezik' },
        next: 'scene6_response_D',
      },
    ],
  },

  scene6_response_A: {
    id: 'scene6_response_A',
    type: 'dialogue',
    scene: 6,
    lines: [
      { speaker: 'gari', text: 'Gari kima jednom. „OK.“' },
      { speaker: 'gari', text: 'To je sve. I dosta.' },
    ],
    next: 'scene7_resolution',
  },

  scene6_response_B: {
    id: 'scene6_response_B',
    type: 'dialogue',
    scene: 6,
    lines: [
      { speaker: 'mici', text: 'Mici podigne pogled. „To znam da čujem.“' },
      { speaker: 'gari', text: 'Gari: „OK. Mici, uzmi ovo.“' },
    ],
    next: 'scene7_resolution',
  },

  scene6_response_C: {
    id: 'scene6_response_C',
    type: 'dialogue',
    scene: 6,
    lines: [
      { speaker: 'brana', text: 'Brana spakuje papire. „Ideš sa mnom sutra.“' },
      { speaker: 'tonket', text: 'Tonket kima. Tiho.' },
    ],
    next: 'scene7_resolution',
  },

  scene6_response_D: {
    id: 'scene6_response_D',
    type: 'dialogue',
    scene: 6,
    lines: [
      { speaker: 'gari', text: 'Gari stane. „OK. Pitaj.“' },
    ],
    next: 'scene6_micro_D',
  },

  // Micro-scene opcija D (uvek se desi ako je D izabran)
  scene6_micro_D: {
    id: 'scene6_micro_D',
    type: 'dialogue',
    scene: 6,
    lines: [
      { speaker: 'player', text: '„Ko donosi odluke ovde?“' },
      { speaker: 'gari',   text: '[pauza]' },
      { speaker: 'gari',   text: 'Svi. I niko. Što je isto.' },
    ],
    next: 'scene6_micro_D_laugh',
  },

  scene6_micro_D_laugh: {
    id: 'scene6_micro_D_laugh',
    type: 'narration',
    scene: 6,
    narration: 'Smeh u sobi. Kratki. Iskreni. Dule prestaje da piše i pogleda gore, prvi put u poslednjih sat vremena.',
    next: 'scene7_resolution',
  },

  // ============================================================
  // SCENE 7 — Rezolucija (auto kalkulacija)
  // ============================================================
  scene7_resolution: {
    id: 'scene7_resolution',
    type: 'resolve',
    scene: 7,
    next: '__calculate_ending__',
  },

  // ============================================================
  // SCENE 8 — Share card (renderovano posebno)
  // ============================================================
  scene8_share: {
    id: 'scene8_share',
    type: 'share',
    scene: 8,
  },

  // ============================================================
  // DULE MICRO-SCENE (između Scene 6 i 7, SAMO ako dule >= 9)
  // Ovo se ubacuje pre scene7_resolution ako je uslov ispunjen
  // ============================================================
  dule_micro_start: {
    id: 'dule_micro_start',
    type: 'narration',
    scene: 7,
    narration: 'Dule te hvata u hodniku dok ostali skupljaju stvari.',
    next: 'dule_micro_line1',
  },

  dule_micro_line1: {
    id: 'dule_micro_line1',
    type: 'dialogue',
    scene: 7,
    lines: [
      { speaker: 'dule', text: 'Primetan/a si.' },
    ],
    next: 'dule_micro_continue',
  },

  dule_micro_continue: {
    id: 'dule_micro_continue',
    type: 'narration',
    scene: 7,
    narration: '[Nastaviš hodati. Nema šta da kažeš. Ili ima, ali Dule već govori.]',
    next: 'dule_micro_line2',
  },

  dule_micro_line2: {
    id: 'dule_micro_line2',
    type: 'dialogue',
    scene: 7,
    lines: [
      { speaker: 'dule', text: 'Biraš reči pažljivo. Neko je morao da primeti.' },
    ],
    next: 'scene7_resolution',
  },
};
