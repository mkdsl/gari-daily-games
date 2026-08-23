/** @fileoverview Volunteer flavor text, dialogs, onboarding lines */

/** Intro dialog shown when volunteer first joins */
export const VOLUNTEER_INTROS = {
  ana: [
    'Hej! Zovem se Ana. Radim sve — ali ne budi sebičan, daj mi pravi zadatak.',
    'Ana je tu. Gde treba?',
    'Sveznalica Ana, na usluzi.'
  ],
  mika: [
    'Ćao. Mika. Daj mi nešto za nositi ili kopati, ne volim kamere.',
    'Kopamo? Tesamo? Kaži samo.',
    'Brz sam kad treba graditi. Spor kad treba pričati.'
  ],
  jovana: [
    'Jovana, vaša kuvarica! Gde je kuhinja?',
    'Ja kuvam, vi jedete, svi su srećni. Dogovor?',
    'Hrana je ljubav. Dajte mi vatru i lonac.'
  ],
  dragan: [
    'Dragan, fotograf. Sjajan svetlo danas. Gde da uhvatim moment?',
    'Svaki festival zaslužuje dobre fotke. Ja sam tu za to.',
    'Kamera je uvek sa mnom. Bar znam snimati.'
  ],
  djule: [
    'Đule. Gde kopam?',
    'Kopaj, nosi, gradi. To znam. Hrana je problem.',
    'Jel ima nešto teško za podizati? To je moje.'
  ],
  maja: [
    'Hej, DJ Maja! Uhh, mogu i da pomažem. Ali finale... znaš.',
    'Za pultom sam kao riba u vodi. Ostatak — meh.',
    'Muzika je sve. Kuvanje je... alternativa.'
  ],
  biljana: [
    'Biljana, koordinatorka. Lista napravljena, raspored spreman. Šta ti treba?',
    'Organizacija je moja supermoć. Samo kaži.',
    'Admin, logistika, koordinacija. Sve na čeklistu.'
  ]
};

/** Task result flavor text per volunteer per task */
export const TASK_RESULTS = {
  mika: {
    kopanje: ['Mika kopa kao mašina! Teren spreman.', 'Brzo i kvalitetno. Mika zadovoljan.'],
    tesanje: ['Majstor u akciji. Drvena konstrukcija stabilna.', 'Čekić zvoni. Mika crta. Savršeno.'],
    kuvanje: ['Mika pokušao kuvati. Hrana... jestiva.', 'Kastrola preživela. Jedva.'],
    foto:    ['Mika sa kamerom. Tamno je. Nema fokusa.', 'Fotka loša. Snaga nije sve.'],
    bar:     ['Mika za barom. Pivo natočeno. Solidno.', 'Ne omili svima, ali radi.'],
    admin:   ['Mika sa olovkom. Lista nepotpuna.', 'Papiri izgledaju... papirima.']
  },
  jovana: {
    kopanje: ['Jovana kopa! Sporijе, ali veselo.', 'Hrana iz džepa. Makar je nahranjeno.'],
    tesanje: ['Nož umesto pile. Neka vrsta tesanja.', 'Radi ali nije za pohvaliti.'],
    kuvanje: ['Jovana u svom elementu! Miris se širi celog ternena.', 'Čorba sezone! Svi u red.'],
    foto:    ['Jovana snima hranu! Foodie fotke odlične.', 'Portret nije baš, ali jelo sjaji.'],
    bar:     ['Jovana za barom. Kokteli kao napitak!', 'Topli osmeh, dobar napitak. Svi zadovoljni.'],
    admin:   ['Jovana organizuje. Malo spora, ali tačna.', 'Lista gotova. Uz recept.']
  },
  dragan: {
    kopanje: ['Dragan kopa uz fotoaparat o vratu.', 'Neefikasno ali dokumentovano.'],
    tesanje: ['Dragan teše. Kosa u lice. Makar pokušava.', 'Ruke nisu za pilu.'],
    kuvanje: ['Dragan kuva. Hrana izgleda dobro na slici, ukus... drugi story.', 'Lepo je, platio si.'],
    foto:    ['Dragan lovi magičan kadar! Zlatni sat.', 'Blic, klik, legenda. Galerija puna.'],
    bar:     ['Dragan za barom. Piće natoči uz selfie.', 'Zabavan barmen, spor servis.'],
    admin:   ['Dragan piše. Lista ima dosta fotografija.', 'Admin... radi. Na kraju.']
  },
  djule: {
    kopanje: ['Đule kopa. Teren gotov za 10 minuta.', 'Snaga kao buldožer. Bravo!'],
    tesanje: ['Đule sa pilom! Drvena kuća u dva sata.', 'Krupne ruke, precizna tesana.'],
    kuvanje: ['Đule u kuhinji. Lonac na kolenima. Hrana žrtvovana.', 'Pokušaj vredeo.'],
    foto:    ['Đule sa kamerom. Prst ispred objektiva.', 'Fotke od Đuleta. Nešto crno.'],
    bar:     ['Đule za barom. Čaše postoje. Toliko.', 'Natoči pivo. Isplije malo. Solidno.'],
    admin:   ['Đule piše. Rukopis nečitljiv.', 'Lista postoji. Ne može se pročitati.']
  },
  maja: {
    kopanje: ['Maja kopa. Slušalice u ušima. Polako.', 'Radi, ali misli na BPM.'],
    tesanje: ['Maja teše. Ritam alata je jedini ritam koji poznaje.', 'Prihvatljivo.'],
    kuvanje: ['Maja kuva uz beat. Supa ima ritam.', 'Hrana jestiva. DJ karijera bezbedna.'],
    foto:    ['Maja snima! Koncerti su njena zona.', 'Muzičke fotke — odlično. Portret — meh.'],
    bar:     ['Maja za barom. Muzika ide iz mobitela.', 'Dobre vibracije. Piće dolazi.'],
    admin:   ['Maja piše. Playlist kreira umesto liste.', 'Admin gotov. Negde između nota.']
  },
  biljana: {
    kopanje: ['Biljana kopa po planu. Efikasno.', 'Svaki metar iskopan po rasporedu.'],
    tesanje: ['Biljana teše. Precizno, ali ne brzo.', 'Alat na mestu. Tesanje uredno.'],
    kuvanje: ['Biljana kuva po receptu tačno.', 'Hrana tačna. Bez improvizacije.'],
    foto:    ['Biljana snima. Kompozicija po uputstvu.', 'Fotke uredno. Bez emocije.'],
    bar:     ['Biljana za barom. Servis kao sat.', 'Svaka narudžbina zabeležena.'],
    admin:   ['Biljana u svom elementu! Lista kompletna.', 'Raspored perfektan. Sve na čeklistu.']
  }
};

/** Weekly check-in messages (random per week) */
export const WEEKLY_CHECKINS = [
  'Ekipa je nasmejana. Dobro predznanje.',
  'Vibe na terenu je dobar. Nastavi ovako.',
  'Volonteri rade. Nedelja prolazi brzo.',
  'Gradnja napreduje. Muzika se bliži.',
  'Pola sezone iza nas. Tempo ne popušta.',
  'Finale se oseća u vazduhu. Sve brže.',
  'Sedam nedelja. Teren se preobražava.',
  'Osma nedelja. Zadnja priprema.',
  'Deveta nedelja. Sve je na mestu.',
  'FINALE NEDELJA! Guncati te čeka!'
];

/** Tom Sawyer activation messages */
export const TOM_SAWYER_MESSAGES = [
  'Volonteri rade besplatno. Tom Sawyer bi bio ponosan.',
  'WB iznad 60% — ekipa sama vuče!',
  'Zajednica je snaga. Niko ne gleda cenu.',
  'Dobre vibracije = besplatan rad. Matematika sela.'
];

/** Low WB warnings */
export const LOW_WB_WARNINGS = [
  'Volonteri su umorni. Hrana ili Zajednica hitno.',
  'Vibe pada. Ako nastavimo ovako, niko neće doći na finale.',
  'Ekipa nezadovoljna. Tom Sawyer plačе u uglu.',
  'Loše raspoloženje je zarazno. Intervenišite!'
];

/** Burn-out retrospective fragments — shown on score screen when energija < 30 AND vibe < 30 */
export const BURNOUT_FRAGMENTS = {
  ana: 'Ana je ćutala ceo poslednji dan. Previše je traženo od nje.',
  mika: 'Mika je spavao između testanja. Nije rekao ništa — ali sve je rekao.',
  jovana: 'Jovana je kuvala praznu čorbu na kraju. Kada je Jovana bez ideja, ekipa to oseti.',
  dragan: 'Dragan je odložio kameru. Nije snimio finale. To je rečito.',
  djule: 'Đule je ostao sedeći na kamenu. Telo kaže šta reči ne mogu.',
  maja: 'Maja je isključila muziku sat pre finala. Kada DJ stišava, nešto je pogrešno.',
  biljana: 'Biljana je napustila svoju listu. Kad ona odustane od rasporeda — stvari su ozbiljne.'
};

/**
 * Get random intro for volunteer type
 * @param {string} typeId
 * @returns {string}
 */
export function getVolunteerIntro(typeId) {
  const lines = VOLUNTEER_INTROS[typeId];
  if (!lines || lines.length === 0) return 'Tu sam i spreman!';
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Get task result flavor text
 * @param {string} typeId
 * @param {string} taskId
 * @returns {string}
 */
export function getTaskResultText(typeId, taskId) {
  const results = TASK_RESULTS[typeId]?.[taskId];
  if (!results || results.length === 0) return 'Zadatak završen.';
  return results[Math.floor(Math.random() * results.length)];
}

/**
 * Get weekly check-in message
 * @param {number} week - 1-indexed
 * @returns {string}
 */
export function getWeeklyCheckin(week) {
  return WEEKLY_CHECKINS[Math.min(week - 1, WEEKLY_CHECKINS.length - 1)];
}
