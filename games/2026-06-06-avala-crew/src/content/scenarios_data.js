/**
 * scenarios_data.js — Svih 20 scenarija za Avala Crew
 * S01-S08: Sabiranje (Gathering) faza
 * V01-V07: Vrh (Peak) faza
 * R01-R05: Rastanak (Departure) faza
 */

export const SCENARIOS_DATA = {

  // ============ SABIRANJE (GATHERING) — S01-S08 ============

  S01: {
    id: 'S01',
    name: 'Ko vozi?',
    text: 'Svi u grupi imaju piće, niko nema auto, Uber košta 1500. Ko organizuje prijevoz za pet osoba na Avalu u razumno vreme?',
    type: 'L',
    baseScore: 10,
    successThreshold: 18,
    partialThreshold: 10,
    phase: 'gathering',
    winAftermath: {
      type: 'buff',
      magnitude: 0.05,
      duration: 2,
      statAffected: 'L',
      label: 'Organizovani +5% L (2 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.10,
      duration: 2,
      statAffected: 'E',
      label: 'Kasnimo, stres -10% E (2 scen.)'
    },
    winText: 'Dragan je već napravio raspored — tačan dolazak, minimalni trošak. Svi dolaze na vreme i raspoloženi.',
    partialText: 'Uspeli ste da se organizujete, ali sa zakašnjenjem i gužvama. Festival već počeo.',
    failText: 'Sat vremena Viber prepirke. Ko ide s kim, ko plaća šta. Stižete poslednji i umorno.',
    choices: null
  },

  S02: {
    id: 'S02',
    name: 'Kapija i lista',
    text: 'Ulaz u VIP zonu je zapušen. Neko zna nekoga ko zna nekog ko je stavio vas na listu — ali treba to potvrditi ODMAH.',
    type: 'S',
    baseScore: 11,
    successThreshold: 20,
    partialThreshold: 12,
    phase: 'gathering',
    winAftermath: {
      type: 'buff',
      magnitude: 0.08,
      duration: 3,
      statAffected: 'S',
      label: 'VIP status +8% S (3 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.08,
      duration: 1,
      statAffected: 'S',
      label: 'Odbijeni na kapiji -8% S (1 scen.)'
    },
    winText: 'Ana je imala broj. Jedan poziv, jedan osmeh — lista nađena, svi unutra.',
    partialText: 'Ušli ste, ali ne u VIP. Standard ulaz, bolja mesta ne dolaze u obzir.',
    failText: 'Niko nije znao nikoga. Čekanje u redu pola sata kao svi ostali.',
    choices: null
  },

  S03: {
    id: 'S03',
    name: 'Gde smo tačno?',
    text: 'Avala je velika, mapa nema signal, i četiri člana ekipe su se razdvojila. Ko ih pronalazi?',
    type: 'L',
    baseScore: 9,
    successThreshold: 16,
    partialThreshold: 9,
    phase: 'gathering',
    winAftermath: {
      type: 'buff',
      magnitude: 0.06,
      duration: 2,
      statAffected: 'L',
      label: 'Ekipa kompletna +6% L (2 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.12,
      duration: 2,
      statAffected: 'E',
      label: 'Hodanje traženja -12% E (2 scen.)'
    },
    winText: 'Lena je znala tačno gde su — rezervna tačka kod fontane. Ekipa kompletna za 5 minuta.',
    partialText: 'Pronašli ste se, ali tek posle dosta hodanja. Noge bole, raspoloženje mlako.',
    failText: 'Polovina ekipe provela prvih sat na telefonu pokušavajući da nađe drugu polovinu.',
    choices: null
  },

  S04: {
    id: 'S04',
    name: 'Prva runda',
    text: 'Bar je gužva. Konobar ne vidi vas. Neko želi pivo, neko sok, neko rakiju, neko nešto "posebno". Ko preuzima komandu?',
    type: 'E',
    baseScore: 8,
    successThreshold: 16,
    partialThreshold: 9,
    phase: 'gathering',
    winAftermath: {
      type: 'buff',
      magnitude: 0.07,
      duration: 2,
      statAffected: 'E',
      label: 'Dobro naliveni +7% E (2 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.07,
      duration: 1,
      statAffected: 'S',
      label: 'Žedni i nervozni -7% S (1 scen.)'
    },
    winText: 'Maja je probila gužvu osmehom i glasom. Sve naručeno, sve plaćeno, svi srećni za 3 minuta.',
    partialText: 'Naručili ste, ali ne sve — neko je ostao bez pića, ali niko ne priča o tome.',
    failText: 'Čekanje 20 minuta, pogrešne narudžbine, suvišni trošak. Loš start.',
    choices: null
  },

  S05: {
    id: 'S05',
    name: 'Stari drug koji kompliciuje',
    text: 'Pedja je sreo starog druga koji nudi da se priključi. Ostatak ekipe ima mešana osećanja. Priključiti se ili ostati?',
    type: 'S',
    baseScore: 9,
    successThreshold: 19,
    partialThreshold: 11,
    phase: 'gathering',
    winAftermath: {
      type: 'buff',
      magnitude: 0.05,
      duration: 3,
      statAffected: 'S',
      label: 'Proširena mreža +5% S (3 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.10,
      duration: 2,
      statAffected: 'E',
      label: 'Nelagoda u grupi -10% E (2 scen.)'
    },
    winText: 'Ana je elegantno integrisala novog člana. Večer postaje bogatija, atmosfera otvorenija.',
    partialText: 'Drug se priključio, ali dinamika je malo čudna. Niko ne kaže ništa direktno.',
    failText: 'Nespretan razgovor, neko se uvredilo, Pedja se oseća krivo. Neugodan start.',
    choices: null
  },

  S06: {
    id: 'S06',
    name: 'Parking apokalipsa',
    text: 'Jedino slobodno parking mesto je daleko, a neko ne želi hodati, a neko ne želi plaćati skupe parkiralište.',
    type: 'L',
    baseScore: 8,
    successThreshold: 15,
    partialThreshold: 8,
    phase: 'gathering',
    winAftermath: {
      type: 'buff',
      magnitude: 0.04,
      duration: 1,
      statAffected: 'L',
      label: 'Rešeno parkiranje +4% L (1 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.08,
      duration: 2,
      statAffected: 'E',
      label: 'Hodali previše -8% E (2 scen.)'
    },
    winText: 'Dragan je pronašao skriveno besplatno mesto 5 minuta peške. Ekipa stignula sveža.',
    partialText: 'Parkirali daleko, hodali, ali niko ne priča o tome. Sitna nelagoda.',
    failText: 'Vozili krug za krugom. Platili skupo. Kasnili. Noge bole od hoda u pogrešnim cipelama.',
    choices: null
  },

  S07: {
    id: 'S07',
    name: 'Selfie borba',
    text: 'Svi žele zajedničku fotografiju na ulazu. Svetlo loše, pozadina loša, niko ne zna kako postaviti kadar. Pet pokušaja.',
    type: 'P',
    baseScore: 7,
    successThreshold: 14,
    partialThreshold: 7,
    phase: 'gathering',
    winAftermath: {
      type: 'buff',
      magnitude: 0.06,
      duration: 2,
      statAffected: 'S',
      label: 'Savršena fotka +6% S (2 scen.)'
    },
    failAftermath: null,
    winText: 'Bojan je postavio kadar, Ivana je znala pravi ugao. Fotografija za Instagram priče — svi izgledaju odlično.',
    partialText: 'Fotografija nije loša, ali mogla je biti bolja. Niko nije zadovoljan, ali niko ne kaže ništa.',
    failText: 'Deset pokušaja, nijedno dobro. Neko je treptao, neko je gledao na stranu. Nema zajedničke fotke.',
    choices: null
  },

  S08: {
    id: 'S08',
    name: 'Sat pre otvaranja',
    text: 'Stigli ste sat ranije. Šta sada? Čekati u redu i osigurati dobra mesta, ili otići na kafu negde?',
    type: 'E',
    baseScore: 10,
    successThreshold: 17,
    partialThreshold: 9,
    phase: 'gathering',
    winAftermath: {
      type: 'buff',
      magnitude: 0.10,
      duration: 3,
      statAffected: 'E',
      label: 'Odmoreni i raspoloženi +10% E (3 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.06,
      duration: 1,
      statAffected: 'L',
      label: 'Loša mesta -6% L (1 scen.)'
    },
    winText: 'Maja je povela na kafu — idealna energija za noć. Stižete opušteni na mesta koja su baš OK.',
    partialText: 'Čekali u redu. Mesta su dobra, ali noge su umorne od stajanja.',
    failText: 'Kafu i red — pogrešno vreme za oboje. Na kraju ni odmor, ni dobra mesta.',
    choices: {
      a: { text: 'Ostajemo u redu', statBonus: { L: 2 }, statPenalty: { E: -1 } },
      b: { text: 'Idemo na kafu', statBonus: { E: 2 }, statPenalty: { L: -1 } }
    }
  },

  // ============ VRH (PEAK) — V01-V07 ============

  V01: {
    id: 'V01',
    name: 'Muzika udara',
    text: 'DJ pušta to nešto. Ceo pod se kreće. Neko želi da ide napred, neko želi da ostane na sigurnom mestu. Ritam poziva.',
    type: 'P',
    baseScore: 14,
    successThreshold: 22,
    partialThreshold: 13,
    phase: 'peak',
    winAftermath: {
      type: 'buff',
      magnitude: 0.12,
      duration: 3,
      statAffected: 'P',
      label: 'U ritmu +12% P (3 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.08,
      duration: 1,
      statAffected: 'E',
      label: 'Izgubili ritam -8% E (1 scen.)'
    },
    winText: 'Bojan je vodio ekipu na pod, a ostali su pratili. Jedan od onih momenata koje pamtite godinama.',
    partialText: 'Plesali ste, ali ne svi, ne zajedno. Nešto je falilo — možda hrabrosti, možda kohezije.',
    failText: 'Niko nije hteo da bude prvi. Ekipa stoji uz zid, muzika prolazi bez vas.',
    choices: null
  },

  V02: {
    id: 'V02',
    name: 'Sreli smo DJ-a',
    text: 'Tonović DJ prolazi pored vas između setova. Neko iz ekipe ga poznaje — ili misli da poznaje. Šta se radi?',
    type: 'S',
    baseScore: 13,
    successThreshold: 21,
    partialThreshold: 12,
    phase: 'peak',
    winAftermath: {
      type: 'buff',
      magnitude: 0.10,
      duration: 4,
      statAffected: 'S',
      label: 'DJ konekcija +10% S (4 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.07,
      duration: 1,
      statAffected: 'S',
      label: 'Sramota -7% S (1 scen.)'
    },
    winText: 'Ana je znala kako pristupiti. Kratki razgovor, razmena kontakata, možda prilike za sledeći festival.',
    partialText: 'Razmenili ste par reči, ali nije ostavilo utisak. Neutrično, zaboravljivo.',
    failText: 'Neko se nagurao nervozno. Tonović je klimnuo i otišao. Nelagodna tišina posle.',
    choices: null
  },

  V03: {
    id: 'V03',
    name: 'Energija pada',
    text: 'Posle dva sata, neko iz ekipe pokazuje znake umora. Pauza ili pushovanje do kraja? Ekipa se deli u mišljenjima.',
    type: 'E',
    baseScore: 12,
    successThreshold: 20,
    partialThreshold: 11,
    phase: 'peak',
    winAftermath: {
      type: 'buff',
      magnitude: 0.08,
      duration: 3,
      statAffected: 'E',
      label: 'Drugi vetar +8% E (3 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.15,
      duration: 2,
      statAffected: 'E',
      label: 'Iscrpljeni -15% E (2 scen.)'
    },
    winText: 'Maja je procenila — kratka pauza na svežem vazduhu, i ekipa se vratila dvostruko jača.',
    partialText: 'Nastavili ste, ali ko je umoran ostao umoran. Ritam nije isti do kraja.',
    failText: 'Ignorisali znakove. Jedan član je na kraju morao da sedne — i ostao tamo ostatak večeri.',
    choices: {
      a: { text: 'Kratka pauza napolju', statBonus: { E: 3 }, statPenalty: {} },
      b: { text: 'Nastavljamo, nema predaje', statBonus: { P: 1 }, statPenalty: { E: -2 } }
    }
  },

  V04: {
    id: 'V04',
    name: 'Techno poglavlje',
    text: 'DJ prešao na teži, besniji techno. Deo ekipe obožava, deo ne zna kako da se nosi sa tim. Moment koji definiše ekipu.',
    type: 'P',
    baseScore: 15,
    successThreshold: 23,
    partialThreshold: 13,
    phase: 'peak',
    winAftermath: {
      type: 'buff',
      magnitude: 0.15,
      duration: 3,
      statAffected: 'P',
      label: 'Techno konverzija +15% P (3 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.10,
      duration: 1,
      statAffected: 'P',
      label: 'Ritam izgubljen -10% P (1 scen.)'
    },
    winText: 'Tanja ili Bojan su preuzeli inicijativu. Naučili ostatak ekipe kako se diše sa techno-om. Transformativan momenat.',
    partialText: 'Nekako ste se provukli. Niste bili sjajni, ali niste ni pobegli.',
    failText: 'Polovina ekipe se povukla od poda. Techno je pobedio.',
    choices: null
  },

  V05: {
    id: 'V05',
    name: 'Pogrešan razgovor',
    text: 'Negde između rundi, razgovor je skrenuo na temu koja ne treba. Stari konflikti, nova nelagoda. Ko navigira?',
    type: 'S',
    baseScore: 11,
    successThreshold: 19,
    partialThreshold: 10,
    phase: 'peak',
    winAftermath: {
      type: 'buff',
      magnitude: 0.06,
      duration: 2,
      statAffected: 'S',
      label: 'Iscijeljivanje +6% S (2 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.12,
      duration: 3,
      statAffected: 'S',
      label: 'Napeta atmosfera -12% S (3 scen.)'
    },
    winText: 'Pedja je preusmerio razgovor sa mekoćom. Šali, zdravici, svi prašta i zaboravlja za ovu noć.',
    partialText: 'Razgovor je završen, ali neka reč je ostala da lebdi. Niko ne priča o tome.',
    failText: 'Rečeno je nešto što se ne može nekazati. Neko je tih ostatak večeri.',
    choices: null
  },

  V06: {
    id: 'V06',
    name: 'Pronađeni su',
    text: 'Vaša ekipa je naišla na poznata lica — organizatori, influenseri, novinari sa kameram. Moment za vidljivost Kluboslavija projekta.',
    type: 'S',
    baseScore: 13,
    successThreshold: 22,
    partialThreshold: 12,
    phase: 'peak',
    winAftermath: {
      type: 'buff',
      magnitude: 0.08,
      duration: 4,
      statAffected: 'S',
      label: 'Medijsko prisustvo +8% S (4 scen.)'
    },
    failAftermath: null,
    winText: 'Ana je organizovala kratak intervju, Ivana napravila sadržaj. Noć je postala deo priče o Kluboslavija.',
    partialText: 'Razmenili ste kontakte, ali bez konkretne priče. Možda nešto od toga ostane.',
    failText: 'Propustili ste momenat. Prošli su, mi smo gledali.',
    choices: null
  },

  V07: {
    id: 'V07',
    name: 'Kulminacija',
    text: 'Ovo je trenutak. DJ pušta ono najjače, svetla idu na maksimum, svi su u transu. Ekipa mora biti kompletna, prisutna, zajedno.',
    type: 'X',
    baseScore: 18,
    successThreshold: 25,
    partialThreshold: 14,
    phase: 'peak',
    winAftermath: {
      type: 'buff',
      magnitude: 0.20,
      duration: 4,
      statAffected: 'E',
      label: 'Noćni vrhunac +20% E (4 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.10,
      duration: 2,
      statAffected: 'E',
      label: 'Propušteni trenutak -10% E (2 scen.)'
    },
    winText: 'Sve se spojilo. Muzika, ekipa, momenat. Ovakve noći se pamte decenijama i prepričavaju na kafu godinama kasnije.',
    partialText: 'Bio je to dobar momenat, ali ne savršen. Nešto je malo falilo — ko zna šta.',
    failText: 'Ekipa je bila rascepkana upravo kada je trebalo biti zajedno. Kulminacija je prošla bez vas.',
    choices: null
  },

  // ============ RASTANAK (DEPARTURE) — R01-R05 ============

  R01: {
    id: 'R01',
    name: 'Kraj noći — poslednje piće',
    text: 'Svi su u posebnim stanjima. Bar se prazni, ali niko ne želi da bude prvi koji kaže da ide kući.',
    type: 'S',
    baseScore: 8,
    successThreshold: 17,
    partialThreshold: 9,
    phase: 'departure',
    winAftermath: {
      type: 'buff',
      magnitude: 0.05,
      duration: 1,
      statAffected: 'S',
      label: 'Elegantni kraj +5% S (1 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.08,
      duration: 1,
      statAffected: 'E',
      label: 'Ošamućeni odlazak -8% E (1 scen.)'
    },
    winText: 'Pedja je predložio zdravicu za kraj. Svi su se složili. Elegantan kraj koji se oseća kao tačka, ne kao tačka-zarez.',
    partialText: 'Otišli ste, ali bez jasnog trenutka rastanka. Samo rastajanje na različite strane.',
    failText: 'Ostali predugo. Neko je zaspao za stolom. Odlazak je bio haotičan i naporan.',
    choices: null
  },

  R02: {
    id: 'R02',
    name: 'Ko čega ima?',
    text: 'Na kraju noći: neko je izgubio telefon. Neko drugi ima previše stvari. Neko treba lift. Organizacija rastanka.',
    type: 'L',
    baseScore: 9,
    successThreshold: 16,
    partialThreshold: 9,
    phase: 'departure',
    winAftermath: {
      type: 'buff',
      magnitude: 0.05,
      duration: 1,
      statAffected: 'L',
      label: 'Organizovani rastanak +5% L (1 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.06,
      duration: 2,
      statAffected: 'L',
      label: 'Izgubili stvari -6% L (2 scen.)'
    },
    winText: 'Dragan je preuzeo kontrolu. Telefon nađen, liftovi organizovani, svi kući u razumnom vremenu.',
    partialText: 'Nekako ste se organizovali, ali nešto je ostalo za sutra da se reši.',
    failText: 'Telefon nije nađen. Liftoivu nije uspelo. Neko čeka Uber sat vremena napolju.',
    choices: null
  },

  R03: {
    id: 'R03',
    name: 'Fotografija za uspomenu',
    text: 'Kraj noći, svi zajedno. Poslednja grupna fotografija pod zvezdama Avale — ako uspete da organizujete ljude.',
    type: 'P',
    baseScore: 7,
    successThreshold: 14,
    partialThreshold: 7,
    phase: 'departure',
    winAftermath: {
      type: 'buff',
      magnitude: 0.05,
      duration: 1,
      statAffected: 'S',
      label: 'Savršena uspomena +5% S (1 scen.)'
    },
    failAftermath: null,
    winText: 'Ivana je uhvatila savršeni kadar. Fotografija koja postaje cover za "Avala Crew noć 2026".',
    partialText: 'Fotografija postoji, ali nije sjajan. Vredeće za sećanje, ne za Instagram.',
    failText: 'Svi su bili previše umorni za fotografiju. Noć ostaje bez vizuelnog dokaza.',
    choices: null
  },

  R04: {
    id: 'R04',
    name: 'Sledeća runda?',
    text: 'Neko predlaže after partiju. Drugi žele kući. Treći su neizvesni. Klasična noćna dilema koja deli ekipe.',
    type: 'E',
    baseScore: 6,
    successThreshold: 15,
    partialThreshold: 8,
    phase: 'departure',
    winAftermath: {
      type: 'buff',
      magnitude: 0.10,
      duration: 1,
      statAffected: 'E',
      label: 'Dobra odluka +10% E (1 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.10,
      duration: 1,
      statAffected: 'E',
      label: 'Loša odluka -10% E (1 scen.)'
    },
    winText: 'Maja je precizno procenila stanje ekipe. Pravi izbor za pravi momenat — ili idete dalje u sjaju, ili odlazite dok je sjajno.',
    partialText: 'Otišli su nekima, ostali nekima. Ekipa se razdvojila, ali bez loših osećanja.',
    failText: 'Pogrešna odluka. Afterparty koji nije vredeo, ili odlazak koji je kaznio one koji su hteli nastavak.',
    choices: {
      a: { text: 'After party — nastavljamo!', statBonus: { E: 3 }, statPenalty: { L: -2 } },
      b: { text: 'Kući — savršen kraj', statBonus: { L: 2 }, statPenalty: { E: -1 } }
    }
  },

  R05: {
    id: 'R05',
    name: 'Avala noć — zatvaranje kruga',
    text: 'Svitanje počinje. Avala je bila ono što ste napravili od nje. Ekipa stoji zajedno poslednji put pre nego što se raziđete.',
    type: 'X',
    baseScore: 12,
    successThreshold: 20,
    partialThreshold: 11,
    phase: 'departure',
    winAftermath: {
      type: 'buff',
      magnitude: 0.15,
      duration: 1,
      statAffected: 'S',
      label: 'Krug zatvoren +15% S (1 scen.)'
    },
    failAftermath: {
      type: 'debuff',
      magnitude: 0.05,
      duration: 1,
      statAffected: 'S',
      label: 'Nedovršena priča -5% S (1 scen.)'
    },
    winText: 'Neko je rekao nešto pravo. Nije bio govor — bila je rečenica, ali prava. Svi su je čuli. Krug je zatvoren.',
    partialText: 'Otišli ste. Bilo je dobro. Nije bila magija, ali nije bila banalnost.',
    failText: 'Rastali ste se bez trenutka. Svako na svoju stranu, noć rasplinuta u umoru.',
    choices: null
  }
};

/**
 * Get scenarios by phase
 * @param {string} phase - 'gathering'|'peak'|'departure'
 * @returns {Object[]}
 */
export function getScenariosByPhase(phase) {
  return Object.values(SCENARIOS_DATA).filter(s => s.phase === phase);
}

/**
 * Get scenario by ID safely
 * @param {string} id
 * @returns {Object|null}
 */
export function getScenarioById(id) {
  return SCENARIOS_DATA[id] || null;
}

/**
 * All scenario IDs by phase
 */
export const SCENARIO_POOLS = {
  gathering: Object.values(SCENARIOS_DATA).filter(s => s.phase === 'gathering').map(s => s.id),
  peak: Object.values(SCENARIOS_DATA).filter(s => s.phase === 'peak').map(s => s.id),
  departure: Object.values(SCENARIOS_DATA).filter(s => s.phase === 'departure').map(s => s.id)
};
