/**
 * decisions.js — Svih 32 decision noda sa deltama resursa
 * Format delta: { e: Energija, v: Veze, s: Secanja, n: Nered }
 * Pozitivno = +, negativno = −
 * hour: sat u kom se pojavljuje (7-19)
 * prestige: true = pojavljuje se samo u prestige runu
 * replaces: ID koji zamenjuje u prestige runu
 * toma: true = Toma NPC interakcija
 * kluboslavija: true = Kluboslavija brand moment
 */

/** @type {Array<DecisionNode>} */
export const DECISIONS = [
  // ── 07:00 JUTRO ──────────────────────────────────────────────
  {
    id: 'N1',
    hour: 7,
    title: 'Volonter propustio autobus',
    text: 'Zovete te u 07:12 — jedan od volontera stoji na putu bez prevoza. Festival je gotov, ali on i dalje čeka.',
    options: [
      {
        id: 'N1A',
        label: 'Voziš ga do stanice',
        delta: { e: -2, v: 2, s: 1, n: -1 },
        text: 'Uzimаš ključeve. Još jedan sat vožnje, ali nije bitno.'
      },
      {
        id: 'N1B',
        label: 'Noćeva kod tebe',
        delta: { e: 0, v: 1, s: 2, n: 1 },
        text: 'Kaša u frižideru, kauč slobodan. Jutarnji razgovor na terasi.'
      },
      {
        id: 'N1C',
        label: 'Organizuješ taksi',
        delta: { e: -1, v: 1, s: 0, n: -1 },
        text: 'Dve minute na telefonu, problem rešen. Efikasno.'
      }
    ]
  },
  {
    id: 'N2',
    hour: 7,
    title: 'Sponzorska zahvalnica',
    text: 'SMS od sponzora: "Sjajno veče. Hvala na pozivu." Odgovaraš odmah ili čekaš?',
    options: [
      {
        id: 'N2A',
        label: 'Zahvaljuješ odmah',
        delta: { e: 0, v: 1, s: 0, n: 0 },
        text: '"Drago nam je što ste bili tu. Do sledećeg puta." Poslato.'
      },
      {
        id: 'N2B',
        label: 'Ignorišeš za sad',
        delta: { e: 0, v: 0, s: 0, n: 1 },
        text: 'Staviš telefon. Još jedan nepročitani poruka.'
      }
    ]
  },
  {
    id: 'N3',
    hour: 7,
    toma: true,
    title: 'Toma: "Kako si?"',
    text: 'Toma stoji pored kafemata i gleda te. "Kako si, stvarno?" — pita, ne tek tako.',
    options: [
      {
        id: 'N3A',
        label: 'Iskreno — umoran si',
        delta: { e: 0, v: 0, s: 1, n: 0 },
        text: '"Iscedilo me je. Ali bilo je pravo." Toma klima glavom.'
      },
      {
        id: 'N3B',
        label: '"Okej sam" — formalno',
        delta: { e: 1, v: 0, s: 0, n: 0 },
        text: '"Okej sam." Toma te gleda još sekund, pa se okreće.'
      }
    ]
  },

  // ── 08:00 KOMŠIJA I ĐUBRE ────────────────────────────────────
  {
    id: 'N4',
    hour: 8,
    title: 'Komšija Slavko buni se',
    text: 'Slavko dolazi u 08:20 sa vidno napetim licem. Muzika do 02:00, kaze. Zna celu ulicu.',
    options: [
      {
        id: 'N4A',
        label: 'Izvinjenje i razgovor',
        delta: { e: -1, v: 2, s: 0, n: -2 },
        text: 'Dvadeset minuta na kapiji. Na kraju mu pruži ruku.'
      },
      {
        id: 'N4B',
        label: 'Kafa sutra, dogovorćemo se',
        delta: { e: 0, v: 1, s: 1, n: -1 },
        text: 'Slave se malo smekša. "Dobro, jutros sam ionako umoran."'
      },
      {
        id: 'N4C',
        label: 'Javljam upravi imanja',
        delta: { e: 0, v: -1, s: 0, n: -1 },
        text: 'Slavko se vraća bez reči. Veza se tanja.'
      }
    ]
  },
  {
    id: 'N5',
    hour: 8,
    title: 'Vreće đubreta',
    text: 'Na livadi — dvanaest crnih vreća, par razbacanих flaša. Treba neko da to uredi.',
    options: [
      {
        id: 'N5A',
        label: 'Sam skupljam sve',
        delta: { e: -2, v: 0, s: 0, n: -3 },
        text: 'Ručice se kidaju, ali livada se vidi.'
      },
      {
        id: 'N5B',
        label: 'Organizujem ekipu',
        delta: { e: -1, v: 1, s: 0, n: -2 },
        text: 'Tri čoveka, pola sata. Nered nestaje kolektivno.'
      },
      {
        id: 'N5C',
        label: 'Ostavljam za popodne',
        delta: { e: 0, v: 0, s: 0, n: 0 },
        text: 'Sunce već pritiska. Popodne — ako bude ko.'
      }
    ]
  },
  {
    id: 'N6',
    hour: 8,
    title: 'Hladna kafa na stolu',
    text: 'Kafu si zaboravio pola sata. Stoji hladna, ali prihvatljiva.',
    options: [
      {
        id: 'N6A',
        label: 'Piješ hladnu',
        delta: { e: 1, v: 0, s: 0, n: 0 },
        text: 'Nekako prođe. Kofein je kofein.'
      },
      {
        id: 'N6B',
        label: 'Praviš novu, sveže',
        delta: { e: 2, v: 0, s: 1, n: 0 },
        text: 'Miris sveže kafe puni kuhinju. Deset minuta za sebe.'
      }
    ]
  },

  // ── 09:00 MEDIJI ─────────────────────────────────────────────
  {
    id: 'N7',
    hour: 9,
    kluboslavija: true,
    title: 'Novinarka pita o turneji 2026',
    text: 'Novinarka portala zove — "Da li Guncati ulazi u Kluboslavija turneju 2026? Možete li 20 minuta?"',
    options: [
      {
        id: 'N7A',
        label: '20 min razgovor, pomeneš turneju',
        delta: { e: -2, v: 1, s: 2, n: 0 },
        text: 'Pričaš o Avali, Štrandu, Sarajevu. Guncati dobija mesto na mapi.',
        achievement: 'A3'
      },
      {
        id: 'N7B',
        label: 'Odbijaš, premalo energije',
        delta: { e: 1, v: -1, s: 0, n: 1 },
        text: '"Nije pravo vreme." Novinarka razume, ali to se ne zaboravlja.'
      },
      {
        id: 'N7C',
        label: 'Šalješ je ka Brani',
        delta: { e: -1, v: 1, s: 1, n: 0 },
        text: '"Brana zna više od mene." Delegirano, ali prisutno.'
      }
    ]
  },
  {
    id: 'N8',
    hour: 9,
    title: 'WhatsApp "BRAVO" od prijatelja',
    text: 'Dvadeset poruka od juče, sve čestitke. Jedna od Marka: "Bre, to je bio pravi festival."',
    options: [
      {
        id: 'N8A',
        label: 'Odgovaraš odmah svima',
        delta: { e: 0, v: 1, s: 0, n: 0 },
        text: 'Sat vremena pisanja, ali svako dobija odgovor.'
      },
      {
        id: 'N8B',
        label: 'Screenshot za story',
        delta: { e: 0, v: 0, s: 1, n: 0 },
        text: '"Hvala svima ❤️" — i slika poruke. Digitalno sećanje.'
      },
      {
        id: 'N8C',
        label: 'Sačuvaš za kasno veče',
        delta: { e: 0, v: 0, s: 0, n: 0 },
        text: 'Mute notifikacije. Radiš.'
      }
    ]
  },

  // ── 10:00 TEREN I DETALJI ────────────────────────────────────
  {
    id: 'N9',
    hour: 10,
    toma: true,
    title: 'Toma: inspekcija terena',
    text: 'Toma dolazi sa notesом. "Hajde da prođemo teren, vidim šta ostaje za sutra."',
    options: [
      {
        id: 'N9A',
        label: 'Zajedno obilazite sve',
        delta: { e: -1, v: 1, s: 2, n: 0 },
        text: 'Sat hoda, sto priča. Tomin notes se puni.',
        tomaA: true
      },
      {
        id: 'N9B',
        label: 'Šalješ ga kući da spava',
        delta: { e: 0, v: 0, s: 1, n: -1 },
        text: '"Idi odmori, ja imam ovo." Toma odlazi, ali ostavi notes.'
      },
      {
        id: 'N9C',
        label: 'Toma ide kod Slavka',
        delta: { e: 0, v: 2, s: 0, n: -2 },
        text: 'Toma i Slavko sređuju dvorište zajedno. Neočekivana koalicija.'
      }
    ]
  },
  {
    id: 'N9B_PRESTIGE',
    hour: 10,
    prestige: true,
    replaces: 'N9',
    toma: true,
    title: 'Toma pokazuje svesku sa beleškama',
    text: 'Toma vadi tanku svesku. "Prošle godine sam pisao. Evo — šta smo obećali, šta nismo uradili."',
    options: [
      {
        id: 'N9bA',
        label: 'Čitate svesku zajedno',
        delta: { e: 0, v: 1, s: 3, n: 0 },
        text: 'Stranica po stranica. Prošlost se vratiла kao mapa.',
        tomaA: true
      },
      {
        id: 'N9bB',
        label: '"Sačuvaj za kućicu"',
        delta: { e: 0, v: 0, s: 1, n: 0 },
        text: 'Toma stavlja svesku u džep. "Imaš pravo. Ne treba nam sve odjednom."'
      }
    ]
  },
  {
    id: 'N10',
    hour: 10,
    title: 'Strujna tablica — baterija ispražnjena',
    text: 'Tehničar javlja: prenosna baterija za tablicu je potpuno prazna. Neko je zaboravio da je puni.',
    options: [
      {
        id: 'N10A',
        label: 'Pronalaziš punjače u magacinu',
        delta: { e: -1, v: 0, s: 0, n: -1 },
        text: 'Pola sata pretrage. Ali nađeno.'
      },
      {
        id: 'N10B',
        label: 'Naručuješ kurirom',
        delta: { e: 0, v: 0, s: 0, n: -1 },
        text: 'Stižе za dva sata. Nered se smanjuje pasivno.'
      },
      {
        id: 'N10C',
        label: 'Preskačeš, nije hitno',
        delta: { e: 0, v: 0, s: 0, n: 2 },
        text: 'Baterija ostaje prazna. Nered se gomila bez aktivne odluke.'
      }
    ]
  },
  {
    id: 'N11',
    hour: 10,
    title: 'Stara fotografija u travi',
    text: 'Na uglu livade — pohabana fotografija lica koje ne poznaješ. Neko ju je izgubio sinoć.',
    options: [
      {
        id: 'N11A',
        label: 'Čuvaš je u džepu',
        delta: { e: 0, v: 0, s: 2, n: 0 },
        text: 'Nije tvoja priča, ali čuvaš je.'
      },
      {
        id: 'N11B',
        label: 'Postiraš story odmah',
        delta: { e: 0, v: 1, s: 1, n: 0 },
        text: '"Da li je neko izgubio ovo sinoć?" Trinaest reakcija za sat.'
      },
      {
        id: 'N11C',
        label: 'Ne gledaš, baciš',
        delta: { e: 0, v: 0, s: 0, n: 0 },
        text: 'Nije tvoje. Nastaviš dalje.'
      }
    ]
  },

  // ── 11:00 PREDMETI ───────────────────────────────────────────
  {
    id: 'N12',
    hour: 11,
    title: 'Fotoaparat bez vlasnika',
    text: 'Na stolu u šatoru — mali analogni aparat, bez torbe, bez laka. Niko ga ne traži.',
    options: [
      {
        id: 'N12A',
        label: 'Čuvaš kod sebe',
        delta: { e: 0, v: 0, s: 1, n: 1 },
        text: 'U torbu. Napiši post-it: "Nađeno 11:00".'
      },
      {
        id: 'N12B',
        label: 'Story odmah sa lokacijom',
        delta: { e: -1, v: 1, s: 2, n: 0 },
        text: 'Foto aparata na terasi, pa story. Vlasnik piše za 40 minuta.'
      },
      {
        id: 'N12C',
        label: 'Ostavljaš na vidnom mestu',
        delta: { e: 0, v: 0, s: 1, n: -1 },
        text: 'Na stolu kod ulaza. Neko će videti.'
      }
    ]
  },
  {
    id: 'N13',
    hour: 11,
    title: 'Voda se iscrpila',
    text: 'Zadnja flaša prazna. Ekipa od pet volontera i dalje radi na suncu.',
    options: [
      {
        id: 'N13A',
        label: 'Kupuješ više boce u selu',
        delta: { e: 1, v: 0, s: 0, n: 0 },
        text: 'Pet minuta vožnje, problem rešen. Svi su zahvalni.'
      },
      {
        id: 'N13B',
        label: 'Pronalazite česmu na imanju',
        delta: { e: 0, v: 0, s: 1, n: 0 },
        text: '"Ima stara česma iza staje." Toma je znao.'
      },
      {
        id: 'N13C',
        label: 'Šalješ volontera da trči',
        delta: { e: 1, v: -1, s: 0, n: 0 },
        text: 'Volonter odlazi znojeći se. Malo nezadovoljno lice.'
      }
    ]
  },

  // ── 12:00 PODNE ──────────────────────────────────────────────
  {
    id: 'N14',
    hour: 12,
    toma: true,
    title: 'Ručak — poslednji komad pice',
    text: 'Jedna parče pice ostala od juče. Ti si jedini koji nije jeo od jutros. Toma sedi u hladu.',
    options: [
      {
        id: 'N14A',
        label: 'Jedeš sam, zaslužio si',
        delta: { e: 2, v: -1, s: 0, n: 0 },
        text: 'Hladan sir, testo. Jedete u tišini. Dovoljno.'
      },
      {
        id: 'N14B',
        label: 'Pozivaš Tomu da podeli',
        delta: { e: 1, v: 1, s: 1, n: 0 },
        text: 'Dva zalogaja svako. Priča traje duže od pice.'
      },
      {
        id: 'N14C',
        label: 'Daješ volonterima',
        delta: { e: -1, v: 2, s: 1, n: 0 },
        text: 'Oni uzimaju uz osmehe. Ti nastaviš na vodi.'
      }
    ]
  },
  {
    id: 'N15',
    hour: 12,
    toma: true,
    title: 'Toma se smeje nečemu',
    text: 'Toma sedi sam i tiho se smeje gledajući u daljinu. Šta je? Ne kaže.',
    options: [
      {
        id: 'N15A',
        label: 'Pitaš ga šta je',
        delta: { e: 0, v: 1, s: 2, n: 0 },
        text: '"Setio sam se onoga pijanca koji je tražio kablovsku." Smejete se oboje.',
        tomaA: true
      },
      {
        id: 'N15B',
        label: 'Nastaviš da radiš',
        delta: { e: 0, v: 0, s: 0, n: 0 },
        text: 'Toma i dalje sedi. Priča ostaje između njega i daljine.'
      }
    ]
  },
  {
    id: 'N16',
    hour: 12,
    title: 'SMS od lokalnog medija',
    text: '"Možete li par minuta za komentar o festivalu?" — lokalnih.rs, čitanost mala ali stvarna.',
    options: [
      {
        id: 'N16A',
        label: 'Daješ 5 minuta, odmah',
        delta: { e: -1, v: 1, s: 1, n: 0 },
        text: 'Kratko, konkretno. Sutra na portalu.'
      },
      {
        id: 'N16B',
        label: 'Odbijaš, nije prioritet',
        delta: { e: 1, v: 0, s: 0, n: 0 },
        text: 'Sačuvana energija. Priča se ne priča.'
      },
      {
        id: 'N16C',
        label: 'Šalješ linku na stories',
        delta: { e: 0, v: 0, s: 1, n: 0 },
        text: '"Evo slika, slobodno koristite." Dovoljno za lokalni kontekst.'
      }
    ]
  },

  // ── 13:00 GOSTI ──────────────────────────────────────────────
  {
    id: 'N17',
    hour: 13,
    title: 'Kamp-gost hoće da ostane',
    text: 'Jedan šator još nije spakovan. Momak unutra: "Mogu još dan? Ovde je prelepo."',
    options: [
      {
        id: 'N17A',
        label: 'Da, ostaje',
        delta: { e: 0, v: 1, s: 1, n: 1 },
        text: 'Šator ostaje. Nered ostaje. Ali priča se produžuje.'
      },
      {
        id: 'N17B',
        label: 'Ne, molim te',
        delta: { e: 0, v: -1, s: 0, n: -1 },
        text: 'Momak pakuje bez reči. Nered se smanjuje. Veza tanja.'
      },
      {
        id: 'N17C',
        label: 'Ostaje ako pomaže',
        delta: { e: 0, v: 1, s: 1, n: -2 },
        text: '"Uzmi metle, daj ruke — ostani koliko hoćeš." Prihvata.'
      }
    ]
  },
  {
    id: 'N18',
    hour: 13,
    title: 'Buka iz starog šatora',
    text: 'Glasanje, smeh — iz šatora koji bi trebao biti prazan. Šta je tamo?',
    options: [
      {
        id: 'N18A',
        label: 'Proveraš sam',
        delta: { e: -1, v: 0, s: 1, n: 0 },
        text: 'Dvoje dece gradi bazu od jastuka. Smeješ se i ideš.'
      },
      {
        id: 'N18B',
        label: 'Šalješ nekoga',
        delta: { e: 0, v: 0, s: 0, n: 0 },
        text: 'Volonter odlazi, vraća se sa osmehom. "Deca."'
      },
      {
        id: 'N18C',
        label: 'Ostavljaš da se razreši',
        delta: { e: 0, v: 0, s: 0, n: 1 },
        text: 'Buka traje. Nered se nagomilava u pozadini.'
      }
    ]
  },

  // ── 14:00 POPODNE ────────────────────────────────────────────
  {
    id: 'N19',
    hour: 14,
    title: 'Baštenski sto slomljen',
    text: 'Drveni sto na terasi ima slomljenu nogu. Nečiji se stub oslonilo previše.',
    options: [
      {
        id: 'N19A',
        label: 'Prijavljuješ vlasnicima imanja',
        delta: { e: 0, v: 1, s: 0, n: -1 },
        text: 'Pošten poziv. Razumevaju. Šalju majstora sutra.'
      },
      {
        id: 'N19B',
        label: 'Popravljaš sam',
        delta: { e: -2, v: 0, s: 0, n: -2 },
        text: 'Čavli, čekić, sat vremena. Drži za sad.'
      },
      {
        id: 'N19C',
        label: 'Ostavljaš za sutra',
        delta: { e: 0, v: 0, s: 0, n: 1 },
        text: 'Sto ostaje nakrivljen. Neko će se spotaknuti.'
      }
    ]
  },
  {
    id: 'N20',
    hour: 14,
    title: 'Dete zaboravilo igračku',
    text: 'Mala crvena igračka na stazi — kamion, jedna točkić kriva. Niko je nije uzeo.',
    options: [
      {
        id: 'N20A',
        label: 'Čuvaš, praviš zapis',
        delta: { e: 0, v: 0, s: 1, n: 1 },
        text: 'Foto, datum, polica za izgubljene stvari. Nered se malo poveća, ali prisutno.'
      },
      {
        id: 'N20B',
        label: 'Pozivaš roditelje odmah',
        delta: { e: -1, v: 1, s: 0, n: 0 },
        text: 'Broj sa liste gostiju. "Oh hvala!" Stižu za 20 minuta.'
      },
      {
        id: 'N20C',
        label: 'Ostavljaš na ulazu',
        delta: { e: 0, v: 0, s: 0, n: -1 },
        text: 'Vidno mesto. Neko će uzeti.'
      }
    ]
  },
  {
    id: 'N21',
    hour: 14,
    toma: true,
    title: 'Toma pita o sledećem letu',
    text: '"Da li radimo sledeće leto?" — Toma gleda ravno u tebe. Čeka pravi odgovor.',
    textPrestige: '"Rekao si isto prošle godine. Šta je drugačije ovog puta?" — Toma ne blefa.',
    options: [
      {
        id: 'N21A',
        label: '"Da, radimo!"',
        delta: { e: -1, v: 2, s: 2, n: 0 },
        text: 'Toma se smeje. "Dobro. Već znam šta treba da popravimo."',
        tomaA: true
      },
      {
        id: 'N21B',
        label: '"Možda, vidimo"',
        delta: { e: 0, v: 1, s: 1, n: 0 },
        text: '"Shvatam." Toma zapiše nešto u notes.'
      },
      {
        id: 'N21C',
        label: '"Ne znam još"',
        delta: { e: 1, v: 0, s: 0, n: 0 },
        text: 'Toma klima. "Iskrenost je dobra." Odlazi bez pritiska.'
      }
    ]
  },

  // ── 15:00 KOMUNIKACIJA ───────────────────────────────────────
  {
    id: 'N22',
    hour: 15,
    title: 'Instagram recap request',
    text: 'DM od menadžera: "Možeš li napisati recap za story? Tri rečenice ili aforizam, šta god."',
    options: [
      {
        id: 'N22A',
        label: 'Pišeš tri rečenice',
        delta: { e: -1, v: 1, s: 1, n: 0 },
        text: '"Festival je završen. Imanje diše. Hvala svima koji su bili tu."'
      },
      {
        id: 'N22B',
        label: 'Šalješ aforizam',
        delta: { e: 0, v: 1, s: 2, n: 0 },
        text: '"Posle svakog festivala, zemlja se vraća sebi." Repost za 12 minuta.',
        achievement: 'A5'
      },
      {
        id: 'N22C',
        label: 'Ne pišeš ništa',
        delta: { e: 1, v: 0, s: 0, n: 1 },
        text: 'Energija ostaje. Priča se ne priča.'
      }
    ]
  },
  {
    id: 'N23',
    hour: 15,
    title: 'Poslednji volonter odlazi',
    text: 'Ana slaže torbu kod kapije. Bila je tu od petka. Gleda te i čeka da kaže zbogom kako treba.',
    options: [
      {
        id: 'N23A',
        label: 'Grliš je, razgovarate',
        delta: { e: -1, v: 2, s: 1, n: 0 },
        text: 'Petnaest minuta na kapiji. Obećavaš da će biti poziv za sledeće leto.'
      },
      {
        id: 'N23B',
        label: 'Zahvaljuješ formalno',
        delta: { e: 0, v: 1, s: 0, n: 0 },
        text: '"Hvala ti, Ana. Bila si odlična." Ruka, osmeh.'
      },
      {
        id: 'N23C',
        label: 'Daješ joj ostatak hrane',
        delta: { e: -1, v: 1, s: 1, n: 0 },
        text: '"Uzmi ovo za put." Kesa sa sirom i hlebom iz magacina.'
      }
    ]
  },

  // ── 16:00 KRAJ DANA ──────────────────────────────────────────
  {
    id: 'N24',
    hour: 16,
    title: 'Susedovo dete pomaže',
    text: 'Dete od osam-devet godina uzima metle bez pitanja i počinje da mete terasu.',
    options: [
      {
        id: 'N24A',
        label: 'Prihvataš pomoć',
        delta: { e: 1, v: 1, s: 0, n: -1 },
        text: 'Mete pola sata. Terasa čista. Dete odlazi zadovoljno.'
      },
      {
        id: 'N24B',
        label: 'Odbijaš, ne treba',
        delta: { e: 0, v: 0, s: 0, n: 1 },
        text: '"Idi se igraj." Dete odlazi. Terasa ostaje ista.'
      },
      {
        id: 'N24C',
        label: 'Nudiš mu keks',
        delta: { e: 0, v: 1, s: 1, n: 0 },
        text: 'Dete uzima keks i nastavlja da mete. Mali dogovor.'
      }
    ]
  },
  {
    id: 'N25',
    hour: 16,
    title: 'Nađena novčanica',
    text: 'Iza stola — previjena novčanica od 500 dinara. Nema načina da se zna čija je.',
    options: [
      {
        id: 'N25A',
        label: 'Prijavljuješ izgubljenima',
        delta: { e: 0, v: 1, s: 1, n: 0 },
        text: 'Post u grupi festivala. Niko se ne javlja. Novac ostaje u kuverti.'
      },
      {
        id: 'N25B',
        label: 'Čuvaš za sebe',
        delta: { e: 1, v: -1, s: 0, n: 0 },
        text: 'U džep. Sitnica, ali ostaje tamo negde.'
      },
      {
        id: 'N25C',
        label: 'Fond za sledeći festival',
        delta: { e: 0, v: 1, s: 1, n: 0 },
        text: '"500 dinara za sledeću godinu." U koverat sa oznakom.',
        achievement: 'A8'
      }
    ]
  },

  // ── 17:00 RETROSPEKTIVA ──────────────────────────────────────
  {
    id: 'N26',
    hour: 17,
    title: 'Retrospektiva meeting',
    text: 'Ekipa još nije otišla u potpunosti. Možeš skupiti ko je ostao — ili ostaviti za nedelju dana.',
    options: [
      {
        id: 'N26A',
        label: 'Odmah, danas, dok je svežо',
        delta: { e: -2, v: 1, s: 2, n: 0 },
        text: 'Sat pričanja. Sve ide na papir. Toma piše.'
      },
      {
        id: 'N26B',
        label: 'Za nedelju dana, kad odmorimo',
        delta: { e: 0, v: 0, s: 1, n: 0 },
        text: 'Pošalješ poziv. Calendar blok. Pamet čeka.'
      },
      {
        id: 'N26C',
        label: 'DM svima, neka pišu',
        delta: { e: -1, v: 1, s: 1, n: 0 },
        text: '"Pišite šta vam je palo na pamet." Stižu odgovori do ponoći.'
      }
    ]
  },
  {
    id: 'N26B_PRESTIGE',
    hour: 17,
    prestige: true,
    replaces: 'N26_BC',
    toma: true,
    title: 'Toma donosi gotov retrospektiva draft',
    text: 'Toma vadi papire: "Napisao sam draft, ako hoćeš pogledaj." Preuzima inicijativu.',
    options: [
      {
        id: 'N26bA',
        label: 'Prihvataš, čitaš zajedno',
        delta: { e: 1, v: 2, s: 2, n: 0 },
        text: 'Toma je već uradio posao. Ti dodaješ dve beleške. Gotovo.'
      },
      {
        id: 'N26bB',
        label: 'Radite zajedno od nule',
        delta: { e: -1, v: 1, s: 2, n: 0 },
        text: 'Drafts idu na stranu. Počinjete sa praznom stranicom — tvoj instinkt.'
      }
    ]
  },
  {
    id: 'N27',
    hour: 17,
    title: 'Muzička oprema, vlasnik nije stigao',
    text: 'Veliki crni kofer sa sintetizatorom stoji sam. DJ-a nema — verovatno zaboravio u žurbi.',
    options: [
      {
        id: 'N27A',
        label: 'Čuvaš bezbedno, zaključaš',
        delta: { e: -1, v: 0, s: 0, n: -1 },
        text: 'U magacin, zakljucano. Pošalješ mu poruku.'
      },
      {
        id: 'N27B',
        label: 'Ostavljaš napola spakovano',
        delta: { e: 0, v: 0, s: 0, n: 0 },
        text: 'Prekriješ ceradom. Jutros će neko doći.'
      },
      {
        id: 'N27C',
        label: 'Šalješ u opštinski depo',
        delta: { e: 0, v: 0, s: 0, n: -2 },
        text: 'Rešeno sistemski. DJ-u će biti komplikovanije da uzme.'
      }
    ]
  },

  // ── 18:00 POSLEDNJI NAPOR ────────────────────────────────────
  {
    id: 'N28',
    hour: 18,
    title: 'Završno čišćenje',
    text: 'Sunce pada. Ostalo je još — šatori, kese, razbacan pribor. Poslednja runda.',
    options: [
      {
        id: 'N28A',
        label: 'Radiš sve sam do kraja',
        delta: { e: -3, v: 0, s: 0, n: -3 },
        text: 'Znoj, mrak, livada čista. Jedini si ostao.'
      },
      {
        id: 'N28B',
        label: 'Tražiš pomoć ko je tu',
        delta: { e: -1, v: 1, s: 0, n: -2 },
        text: 'Troje pomažu sat vremena. Bučno, ali gotovo.'
      },
      {
        id: 'N28C',
        label: 'Ostavljaš na jutro',
        delta: { e: 0, v: 0, s: 0, n: 1 },
        text: 'Sutra je jutro. Imanje spava neočišćeno.'
      }
    ]
  },
  {
    id: 'N29',
    hour: 18,
    title: 'Bivši volonter piše "Hvala ti"',
    text: 'Poruka od Nikole koji je bio na prvom festivalu, pre tri godine: "Setio sam se nas. Hvala."',
    options: [
      {
        id: 'N29A',
        label: 'Duga zahvalnica, iskrena',
        delta: { e: -1, v: 2, s: 1, n: 0 },
        text: 'Pišeš pet minuta. Šalješ. On odgovara odmah sa "❤️".'
      },
      {
        id: 'N29B',
        label: 'Emoji, brzo',
        delta: { e: 0, v: 1, s: 0, n: 0 },
        text: '"🙏❤️" Dovoljno za sada.'
      },
      {
        id: 'N29C',
        label: 'Čitaš, odgovaraš sutra',
        delta: { e: 0, v: 0, s: 0, n: 1 },
        text: 'Poruka ostaje nepročitana. Toplina čeka.'
      }
    ]
  },

  // ── 19:00 ZATVARANJE ─────────────────────────────────────────
  {
    id: 'N30',
    hour: 19,
    toma: true,
    title: 'Kapija',
    text: 'Vreme je da se zaključa kapija imanja. Ovo je zadnji gest dana.',
    options: [
      {
        id: 'N30A',
        label: 'Sam zaključavaš',
        delta: { e: -1, v: 0, s: 1, n: 0 },
        text: 'Kliktaj brave. Tišina. Tvoja.'
      },
      {
        id: 'N30B',
        label: 'Sa Tomom zajedno',
        delta: { e: -1, v: 1, s: 2, n: 0 },
        text: 'Dva ključa. Toma drži jednu stranu. Kratka tišina.'
      },
      {
        id: 'N30C',
        label: 'Telefonom, daljinski',
        delta: { e: 0, v: 0, s: 0, n: -1 },
        text: 'Smart lock, jedna poruka. Efikasno i malo tužno.'
      }
    ]
  },
  {
    id: 'N31',
    hour: 19,
    title: 'Poslednji pogled na polje',
    text: 'Pre nego što odeš — livada u sumraku. Trava ugažena, ali imanje diše.',
    options: [
      {
        id: 'N31A',
        label: 'Ostaneš da gledaš',
        delta: { e: -1, v: 0, s: 2, n: 0 },
        text: 'Petnaest minuta u tišini. Sve što se desilo sedne.'
      },
      {
        id: 'N31B',
        label: 'Fotografišeš',
        delta: { e: 0, v: 1, s: 1, n: 0 },
        text: 'Telefon gore, sumrak u objektiv. Sačuvano.'
      },
      {
        id: 'N31C',
        label: 'Odmah ideš kući',
        delta: { e: 1, v: 0, s: 0, n: 0 },
        text: 'Kola, put, kuća. Dan se zatvara u pokretu.'
      }
    ]
  },
  {
    id: 'N32',
    hour: 19,
    title: 'Šta ćeš sutra?',
    text: 'Poslednje pitanje dana — sebi. Pre nego što legneš.',
    options: [
      {
        id: 'N32A',
        label: 'Pišeš plan za sledeće leto',
        delta: { e: -1, v: 1, s: 1, n: 0 },
        text: 'Notes, olovka, dvadeset stavki. Prva je već jasna.'
      },
      {
        id: 'N32B',
        label: 'Samo spavaš',
        delta: { e: 2, v: 0, s: 0, n: 0 },
        text: 'Glava na jastuku. Dan je završen.'
      },
      {
        id: 'N32C',
        label: 'Zoveš prijatelja da pričaš',
        delta: { e: -1, v: 2, s: 1, n: 0 },
        text: 'Sat razgovora u mraku. Sledeće leto počinje ovde.'
      }
    ]
  }
];

/** Pomoćna mapa: ID noda → nod */
export const DECISIONS_MAP = Object.fromEntries(DECISIONS.map(d => [d.id, d]));

/** Nodovi po satu (bez prestige nodova) */
export function getNodesForHour(hour, isPrestige = false) {
  return DECISIONS.filter(d => {
    if (d.hour !== hour) return false;
    if (d.prestige && !isPrestige) return false;
    if (d.replaces && isPrestige) return false; // prestige node handles replaces logic separately
    return true;
  });
}
