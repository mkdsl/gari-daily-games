// config.js — Pitanja, bodovna matrica, arhetipovi
// GDD: Mile Mehanika | 2026-05-07 | v1.0

/**
 * QUESTIONS — 8 pitanja, svako sa 3 odgovora.
 * scores: +1 tačno jednom arhetip po odgovoru (iz GDD bodovne matrice).
 *
 * Matrica (GDD §4):
 * Q1: A→DJ, B→PK, C→SE
 * Q2: A→DJ, B→PK, C→CB
 * Q3: A→EH, B→SG, C→SG  (B i C oba boduju SG — namerno, vid. GDD §4 napomenu)
 * Q4: A→DJ, B→PK, C→EH
 * Q5: A→DJ, B→SE, C→CB
 * Q6: A→SG, B→SE, C→EH
 * Q7: A→DJ, B→SE, C→CB
 * Q8: A→SG, B→EH, C→CB
 */
export const QUESTIONS = [
  {
    id: 'Q1',
    text: 'Nalaziš se u nepoznatom gradu, imaš 2 slobodna sata. Šta radiš?',
    answers: [
      {
        text: 'Tražim klub, bar ili mesto gde nešto svira — živu muziku, DJ set, bilo šta sa dobrim zvukom.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Tražim pijacu, park ili baštu — nešto zeleno gde mogu da vidim kako grad uzgaja hranu.',
        scores: { DJ: 0, PK: 1, SG: 0, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Pitam prvog zanimljivog tipa koga sretnem šta bi on radio, pa pratim.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 1 }
      }
    ]
  },
  {
    id: 'Q2',
    text: 'Zamišljaš idealan vikend u MKDSLendu. Koji element je neophodan?',
    answers: [
      {
        text: 'Da postoji barem jedan set koji vredi pamtiti — dobre bine, dobar zvuk, prava energija.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Da radim nešto rukama — zemlja, drvo, vatra, ili bašta — nešto što ostavlja trag.',
        scores: { DJ: 0, PK: 1, SG: 0, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Da dovedem celu svoju ekipu i vidim kako se snalaze na novom mestu.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 1, SE: 0 }
      }
    ]
  },
  {
    id: 'Q3',
    text: 'Na eventu, set počinje. Zvuk je odličan. Šta primećuješ prvo?',
    answers: [
      {
        text: 'Energija poda — da li plesači "love" muziku ili samo stoje.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0 }
      },
      {
        text: 'Detalje u miks-u — šta je u mid-rangeu, da li je bas čist, gde su efekti postavljeni.',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Ko je za aparatom i kako cela postavka izgleda iznutra.',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0 }
      }
    ]
  },
  {
    id: 'Q4',
    text: 'MKDSLend ima i šumu i livadu. Kako ih koristiš tokom vikenda?',
    answers: [
      {
        text: 'Šetam kad mi treba vazduh između setova — ali ne idem daleko od zvuka.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'To je pola razloga zašto sam tu — tlo, drveće, biodiverzitet. Gledam ko je tu od biljaka.',
        scores: { DJ: 0, PK: 1, SG: 0, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Organizujem da ima aktivnosti napolju za ljude koji ne plešu — svako treba nešto za sebe.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0 }
      }
    ]
  },
  {
    id: 'Q5',
    text: 'Stigla je nova grupa na event i deluje izgubljena. Šta ti radiš?',
    answers: [
      {
        text: 'Objanim ko svira i što pre ih odvučem na podijum.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Ignorem — oni će se snaći. Ja sam zauzet nečim.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 1 }
      },
      {
        text: 'Povežem ih s nekim iz svoje ekipe ko će ih uvesti u tok.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 1, SE: 0 }
      }
    ]
  },
  {
    id: 'Q6',
    text: 'Tokom postavljanja zvuka nešto ne radi — hum u sistemu, loš kabl, nejasno odakle. Šta radiš?',
    answers: [
      {
        text: 'Tražim šta u signal chain-u može biti uzrok — sistematično, od izvora do zvučnika.',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Zovem tehničara ili koga god zna — nije moje da kopam po kablovima.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 1 }
      },
      {
        text: 'Dok neko drugi rešava tehnikum, organizujem ljude da problem ne utiče na program.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0 }
      }
    ]
  },
  {
    id: 'Q7',
    text: 'Pozivu te na event koji ne poznaješ, prvi put. Šta tipično "uneseš" u prostor?',
    answers: [
      {
        text: 'Muziku — u glavi, u razgovoru, ili bukvalno na USB-u.',
        scores: { DJ: 1, PK: 0, SG: 0, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Pitanja — puno pitanja o tome kako mesto funkcioniše, ko je tu i zašto.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 0, SE: 1 }
      },
      {
        text: 'Ljude — retko dolazim sam, a kad dođem, brzo napravim krug.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 1, SE: 0 }
      }
    ]
  },
  {
    id: 'Q8',
    text: 'Vikend je završen. Sutradan ujutru, šta si ti?',
    answers: [
      {
        text: 'Razmišljam o setovima — šta je prošlo, šta nije, šta bih promenio.',
        scores: { DJ: 0, PK: 0, SG: 1, EH: 0, CB: 0, SE: 0 }
      },
      {
        text: 'Već planiram sledeće — lokacija, datum, ko dolazi, šta treba organizovati.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 1, CB: 0, SE: 0 }
      },
      {
        text: 'Pričam sa novim ljudima koje sam upoznao — ili im šaljem poruku dok je sve još sveže.',
        scores: { DJ: 0, PK: 0, SG: 0, EH: 0, CB: 1, SE: 0 }
      }
    ]
  }
];

/**
 * ARCHETYPES — 6 arhetipova sa opisima, citatima i CTA linkovima.
 * Ključevi su uppercase skraćenice (DJ, PK, SG, EH, CB, SE).
 */
export const ARCHETYPES = {
  DJ: {
    name: 'DJ',
    description: 'Zvuk je za tebe jezik, ne pozadina. Znaš šta znači da set "radi" i znaš kada ne radi — i to osećaš pre nego što to iko drugi primeti. U MKDSLendu tražiš ozvučenje, prostor za probe i ljude koji slušaju kako treba.',
    quote: '"Loš zvuk je loša komunikacija."',
    shareText: 'DJ — "Loš zvuk je loša komunikacija." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti',
    cta: {
      text: '→ Igraj Setlistu',
      url: 'https://mkdsl.games/setlista'
    }
  },
  PK: {
    name: 'Permakultura Nerd',
    description: 'Zemlja, kompost, polinatori i regenerativni sistemi — ovo ti nije hobi, ovo ti je način razmišljanja. MKDSLend vidiš kao živi laboratorij, ne kao vikend odmorište. Dok drugi traže program, ti gledaš u tlo.',
    quote: '"Zemlja nije podloga. Zemlja je sistem."',
    shareText: 'Permakultura Nerd — "Zemlja nije podloga. Zemlja je sistem." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti',
    cta: {
      text: '→ Igraj Šta Raste?',
      url: 'https://mkdsl.games/sta-raste'
    }
  },
  SG: {
    name: 'Sound Geek',
    description: 'Nisi nužno DJ, ali znaš razliku između sub-basa i mid-basa i imaš mišljenje o tome. Kablovi, miksete, akustika prostora — tvoja zona udobnosti. Voliš da razumeš sisteme iznutra, a ne samo da uživaš u rezultatu.',
    quote: '"Signal chain je biografija zvuka."',
    shareText: 'Sound Geek — "Signal chain je biografija zvuka." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti',
    cta: {
      text: '→ Igraj Signal Chain',
      url: 'https://mkdsl.games/signal-chain'
    }
  },
  EH: {
    name: 'Event Host',
    description: 'Ti si onaj zbog koga se ljudi dobro provode a da ne znaju zašto. Logistika, energija prostora, tajming — osećaš to instinktivno. MKDSLend za tebe nije destinacija nego platforma za ono što tek treba da se desi.',
    quote: '"Dobar event je nevidljiv. Loš event je jedini koji svi primete."',
    shareText: 'Event Host — "Dobar event je nevidljiv." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti',
    cta: {
      text: '→ Igraj Program Menadžer',
      url: 'https://mkdsl.games/program-menager'
    }
  },
  CB: {
    name: 'Crew Builder',
    description: 'Zajednica nije apstrakcija za tebe — to su konkretni ljudi koje si doveo, povezao i čuvaš. Mrežiš bez da mrežiš. MKDSLend vidiš kao mesto gde tvoja ekipa može da postane nešto veće od zbira pojedinaca.',
    quote: '"Dolazim sam samo kad testiram novo mesto. Posle dolazim sa svima."',
    shareText: 'Crew Builder — "Dolazim sam samo kad testiram novo mesto." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti',
    cta: {
      text: '→ Igraj Ko Je Ko?',
      url: 'https://mkdsl.games/ko-je-ko'
    }
  },
  SE: {
    name: 'Slobodan Elektron',
    description: 'Ne dolaziš po programu — dolaziš po mogućnostima. Istraživaš sisteme, postavljaš neočekivana pitanja i pronalaziš veze koje drugi ne vide. U svakoj zajednici, Slobodan Elektron je katalizator: nema fiksnu ulogu, ali sve malo pokrene.',
    quote: '"Najzanimljiviji deo svakog mesta je ono što niko nije planirao."',
    shareText: 'Slobodan Elektron — "Najzanimljiviji deo svakog mesta je ono što niko nije planirao." Koji si ti u MKDSLendu? → https://mkdsl.games/koji-tip-si-ti',
    cta: {
      text: '→ Igraj Prvu Posetu',
      url: 'https://mkdsl.games/prva-poseta'
    }
  }
};
