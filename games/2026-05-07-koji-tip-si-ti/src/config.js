// config.js — Pitanja, bodovna matrica, arhetipovi
// GDD: Mile Mehanika | 2026-05-07 | v2.0 (9 arhetipova, 10 pitanja, 4 odgovora)

/**
 * QUESTIONS — 10 pitanja, svako sa 4 odgovora.
 * scores: +1 tačno jednom arhetip po odgovoru (iz GDD bodovne matrice).
 *
 * Matrica (GDD §4, v2):
 * Q1:  A→DJ,  B→PK,  C→SE,  D→GI
 * Q2:  A→DJ,  B→PK,  C→CB,  D→BH
 * Q3:  A→EH,  B→SG,  C→SG,  D→TČ   (B i C oba boduju SG — namerno, vid. GDD §4 napomenu)
 * Q4:  A→DJ,  B→PK,  C→EH,  D→BH
 * Q5:  A→DJ,  B→SE,  C→CB,  D→GI
 * Q6:  A→SG,  B→SE,  C→EH,  D→TČ
 * Q7:  A→DJ,  B→SE,  C→CB,  D→GI
 * Q8:  A→SG,  B→EH,  C→CB,  D→TČ
 * Q9:  A→GI,  B→BH,  C→TČ,  D→EH
 * Q10: A→BH,  B→PK,  C→SG,  D→GI
 *
 * Bodovni zbir po arhetipu (min 4, max 5):
 * DJ=5  PK=4  SG=5  EH=5  CB=4  SE=4  GI=5  BH=4  TČ=4
 * Ukupno: 40 slotova (10×4)
 */
export const QUESTIONS = [
  {
    id: 'Q1',
    text: 'Nalaziš se u nepoznatom gradu, imaš 2 slobodna sata. Šta radiš?',
    answers: [
      {
        text: 'Tražim klub, bar ili mesto gde nešto svira — živu muziku, DJ set, bilo šta sa dobrim zvukom.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Tražim pijacu, park ili baštu — nešto zeleno gde mogu da vidim kako grad uzgaja hranu.',
        scores: { DJ: 0, PK: 1, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Pitam prvog zanimljivog tipa koga sretnem šta bi on radio, pa pratim.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 1, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Idem u lokalni restoran ili pekaru — probam ono što samo tu prave, što nema kod kuće.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 1, BH: 0, TČ: 0 }
      }
    ]
  },
  {
    id: 'Q2',
    text: 'Zamišljaš idealan vikend u MKDSLendu. Koji element je neophodan?',
    answers: [
      {
        text: 'Da postoji barem jedan set koji vredi pamtiti — dobre bine, dobar zvuk, prava energija.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Da radim nešto rukama — zemlja, drvo, vatra, ili bašta — nešto što ostavlja trag.',
        scores: { DJ: 0, PK: 1, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Da dovedem celu svoju ekipu i vidim kako se snalaze na novom mestu.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 1, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Da imam jutarnju rutinu — hladan tuš, disanje, kretanje pre nego što dan počne.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 1, TČ: 0 }
      }
    ]
  },
  {
    id: 'Q3',
    text: 'Na eventu, set počinje. Zvuk je odličan. Šta primećuješ prvo?',
    answers: [
      {
        text: 'Energija poda — da li plesači "love" muziku ili samo stoje.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Detalje u miks-u — šta je u mid-rangeu, da li je bas čist, gde su efekti postavljeni.',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Ko je za aparatom i kako cela postavka izgleda iznutra.',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Kako je bina postavljena — konstrukcija, statika, kablovi, da li sve drži kako treba.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 1 }
      }
    ]
  },
  {
    id: 'Q4',
    text: 'MKDSLend ima i šumu i livadu. Kako ih koristiš tokom vikenda?',
    answers: [
      {
        text: 'Šetam kad mi treba vazduh između setova — ali ne idem daleko od zvuka.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'To je pola razloga zašto sam tu — tlo, drveće, biodiverzitet. Gledam ko je tu od biljaka.',
        scores: { DJ: 0, PK: 1, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Organizujem da ima aktivnosti napolju za ljude koji ne plešu — svako treba nešto za sebe.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Koristim jutro za vežbanje napolju — barefoot po travi, istezanje, sunce na koži.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 1, TČ: 0 }
      }
    ]
  },
  {
    id: 'Q5',
    text: 'Stigla je nova grupa na event i deluje izgubljena. Šta ti radiš?',
    answers: [
      {
        text: 'Objasnim ko svira i što pre ih odvučem na podijum.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Ignorem — oni će se snaći. Ja sam zauzet nečim.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 1, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Povežem ih s nekim iz svoje ekipe ko će ih uvesti u tok.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 1, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Pitam ih jesu li gladni i vodim ih do kuhinje — uz hranu se najbrže opustiš.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 1, BH: 0, TČ: 0 }
      }
    ]
  },
  {
    id: 'Q6',
    text: 'Tokom postavljanja zvuka nešto ne radi — hum u sistemu, loš kabl, nejasno odakle. Šta radiš?',
    answers: [
      {
        text: 'Tražim šta u signal chain-u može biti uzrok — sistematično, od izvora do zvučnika.',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Zovem tehničara ili koga god zna — nije moje da kopam po kablovima.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 1, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Dok neko drugi rešava tehnikum, organizujem ljude da problem ne utiče na program.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Gledam kabl, konektor, uzemljenje — verovatno mogu da sredim bez da ikoga zovem.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 1 }
      }
    ]
  },
  {
    id: 'Q7',
    text: 'Pozovu te na event koji ne poznaješ, prvi put. Šta tipično "uneseš" u prostor?',
    answers: [
      {
        text: 'Muziku — u glavi, u razgovoru, ili bukvalno na USB-u.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Pitanja — puno pitanja o tome kako mesto funkcioniše, ko je tu i zašto.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 1, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Ljude — retko dolazim sam, a kad dođem, brzo napravim krug.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 1, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Nešto za jelo — uvek imam neku domaću turšiju, rakiju ili tortu u gepeku.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 1, BH: 0, TČ: 0 }
      }
    ]
  },
  {
    id: 'Q8',
    text: 'Vikend je završen. Sutradan ujutru, šta si ti?',
    answers: [
      {
        text: 'Razmišljam o setovima — šta je prošlo, šta nije, šta bih promenio.',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Već planiram sledeće — lokacija, datum, ko dolazi, šta treba organizovati.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Pričam sa novim ljudima koje sam upoznao — ili im šaljem poruku dok je sve još sveže.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 1, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: 'Gledam šta treba popraviti — ako je nešto puklo ili se olabavilo tokom vikenda, to me vuče.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 1 }
      }
    ]
  },
  {
    id: 'Q9',
    text: 'MKDSLend ima otvorenu kuhinju, radionicu i livadu. Gde te najpre nalaze?',
    answers: [
      {
        text: 'U kuhinji — gledam šta je sezonsko, šta se može zakiseliti, skuvati ili isprobati.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 1, BH: 0, TČ: 0 }
      },
      {
        text: 'Na livadi pre svih — jutarnje vežbe, disanje, hladna voda ako ima potok.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 1, TČ: 0 }
      },
      {
        text: 'U radionici — nešto uvek treba sastaviti, popraviti ili osmisliti od onoga što ima.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 1 }
      },
      {
        text: 'Tamo gde je najveća gužva — gledam da li sve teče kako treba i ko kome treba.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      }
    ]
  },
  {
    id: 'Q10',
    text: 'Koji kompliment te najviše pogodi — ne zato što je lep, nego zato što je tačan?',
    answers: [
      {
        text: '"Ti bukvalno izgledaš bolje svaki put kad te vidim."',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 1, TČ: 0 }
      },
      {
        text: '"Tvoja bašta izgleda kao da zna šta radi."',
        scores: { DJ: 0, PK: 1, SG: 0, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: '"Ti čuješ stvari koje ja ne čujem."',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0, GI: 0, BH: 0, TČ: 0 }
      },
      {
        text: '"Ova tvoja turšija je ozbiljna stvar."',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0, GI: 1, BH: 0, TČ: 0 }
      }
    ]
  }
];

/**
 * ARCHETYPES — 9 arhetipova sa opisima, citatima i CTA linkovima.
 * Ključevi su uppercase skraćenice (DJ, PK, SG, EH, CB, SE, GI, BH, TČ).
 */
export const ARCHETYPES = {
  DJ: {
    name: 'DJ',
    description: 'Zvuk je za tebe jezik, ne pozadina. Znaš šta znači da set "radi" i znaš kada ne radi — i to osećaš pre nego što to iko drugi primeti. U MKDSLendu tražiš ozvučenje, prostor za probe i ljude koji slušaju kako treba.',
    quote: '"Loš zvuk je loša komunikacija."',
    shareText: 'DJ — "Loš zvuk je loša komunikacija." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Igraj Avala Run',
      url: 'https://mkdsl.github.io/gari-daily-games/games/2026-05-06-avala-run/'
    }
  },
  PK: {
    name: 'Permakultura Nerd',
    description: 'Zemlja, kompost, polinatori i regenerativni sistemi — ovo ti nije hobi, ovo ti je način razmišljanja. MKDSLend vidiš kao živi laboratorij, ne kao vikend odmorište. Dok drugi traže program, ti gledaš u tlo.',
    quote: '"Zemlja nije podloga. Zemlja je sistem."',
    shareText: 'Permakultura Nerd — "Zemlja nije podloga. Zemlja je sistem." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Istraži GDG',
      url: 'https://mkdsl.github.io/gari-daily-games/'
    }
  },
  SG: {
    name: 'Sound Geek',
    description: 'Nisi nužno DJ, ali znaš razliku između sub-basa i mid-basa i imaš mišljenje o tome. Kablovi, miksete, akustika prostora — tvoja zona udobnosti. Voliš da razumeš sisteme iznutra, a ne samo da uživaš u rezultatu.',
    quote: '"Signal chain je biografija zvuka."',
    shareText: 'Sound Geek — "Signal chain je biografija zvuka." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Igraj Frekventni Grad',
      url: 'https://mkdsl.github.io/gari-daily-games/games/2026-04-27-frekventni-grad/'
    }
  },
  EH: {
    name: 'Event Host',
    description: 'Ti si onaj zbog koga se ljudi dobro provode a da ne znaju zašto. Logistika, energija prostora, tajming — osećaš to instinktivno. MKDSLend za tebe nije destinacija nego platforma za ono što tek treba da se desi.',
    quote: '"Dobar event je nevidljiv. Loš event je jedini koji svi primete."',
    shareText: 'Event Host — "Dobar event je nevidljiv." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Istraži GDG',
      url: 'https://mkdsl.github.io/gari-daily-games/'
    }
  },
  CB: {
    name: 'Crew Builder',
    description: 'Zajednica nije apstrakcija za tebe — to su konkretni ljudi koje si doveo, povezao i čuvaš. Mrežiš bez da mrežiš. MKDSLend vidiš kao mesto gde tvoja ekipa može da postane nešto veće od zbira pojedinaca.',
    quote: '"Dolazim sam samo kad testiram novo mesto. Posle dolazim sa svima."',
    shareText: 'Crew Builder — "Dolazim sam samo kad testiram novo mesto." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Istraži GDG',
      url: 'https://mkdsl.github.io/gari-daily-games/'
    }
  },
  SE: {
    name: 'Slobodan Elektron',
    description: 'Ne dolaziš po programu — dolaziš po mogućnostima. Istraživaš sisteme, postavljaš neočekivana pitanja i pronalaziš veze koje drugi ne vide. U svakoj zajednici, Slobodan Elektron je katalizator: nema fiksnu ulogu, ali sve malo pokrene.',
    quote: '"Najzanimljiviji deo svakog mesta je ono što niko nije planirao."',
    shareText: 'Slobodan Elektron — "Najzanimljiviji deo svakog mesta je ono što niko nije planirao." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Igraj Signal Lost',
      url: 'https://mkdsl.github.io/gari-daily-games/games/2026-04-20-signal-lost/'
    }
  },
  GI: {
    name: 'Gastro Istraživač',
    description: 'Za tebe je ukus terenska mapa. Gde god da dođeš, prvo pitaš šta se tu jede i ko to pravi. MKDSLend ti je otvorena kuhinja — sezonsko povrće, turšije od juče, rakija od lani. Dok drugi traže program, ti tražiš teglu.',
    quote: '"Ako nemaš dobar ajvar, nemaš šta da mi pričaš o gostoprimstvu."',
    shareText: 'Gastro Istraživač — "Ako nemaš dobar ajvar, nemaš šta da mi pričaš o gostoprimstvu." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Istraži GDG',
      url: 'https://mkdsl.github.io/gari-daily-games/'
    }
  },
  BH: {
    name: 'Biohaker',
    description: 'Telo ti je projekat koji nikad nije gotov. Hladan tuš, disanje, spavanje po protokolu, sunce u oči ujutru — ti ne živiš po navici, živiš po sistemu. MKDSLend koristiš kao poligon: livada za vežbu, potok za hladnoću, tišina za reset.',
    quote: '"Telo pamti sve što mu radiš. I sve što mu ne radiš."',
    shareText: 'Biohaker — "Telo pamti sve što mu radiš. I sve što mu ne radiš." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Istraži GDG',
      url: 'https://mkdsl.github.io/gari-daily-games/'
    }
  },
  TČ: {
    name: 'Tehno Čovek',
    description: 'Dok drugi pričaju šta treba, ti to već praviš. Alat, konstrukcija, improvizacija od onoga što imaš — tvoje ruke misle brže od tvoje glave. MKDSLend je za tebe mesto gde se uvek nešto gradi, popravlja ili sklapa iz delova.',
    quote: '"Daj mi šraf, žicu i pola sata. Ostalo ću da smislim."',
    shareText: 'Tehno Čovek — "Daj mi šraf, žicu i pola sata. Ostalo ću da smislim." Koji si ti u MKDSLendu? → https://mkdsl.github.io/gari-daily-games/games/2026-05-07-koji-tip-si-ti/',
    cta: {
      text: '→ Istraži GDG',
      url: 'https://mkdsl.github.io/gari-daily-games/'
    }
  }
};
