/** @module content/crew_profiles — 10 crew bios, dialog snippets */

/**
 * @typedef {Object} CrewProfile
 * @property {string} id
 * @property {string} bio
 * @property {string[]} dialogs - kontekstualni dialozi
 * @property {string} strength
 * @property {string} weakness
 */

/**
 * @typedef {Object} CrewFarewells
 * @property {string} high - mood >= 7
 * @property {string} mid  - mood 4-6
 * @property {string} low  - mood <= 3
 * @property {string} [prestige] - prestige run variant
 */

/** @type {Record<string, CrewProfile>} */
export const CREW_PROFILES = {
  marko: {
    id: 'marko',
    bio: 'Veteran scene, 15 godina za pulom. Beograd, London, Berlin — Marko je bio svuda i vratio se sa pričom za svako mesto.',
    strength: 'Techno set koji ne greši nikad.',
    weakness: 'Ego velik kao sound sistem.',
    farewells: {
      high: '"Pozovi me za sledeću sezonu. Uvek."',
      mid:  '"Solidno. Moglo je bolje. Znaš gde me naći."',
      low:  '"Trebam odmor. I raise. U tom redosledu."',
      prestige: '"Vratio sam se. Znaš šta to znači."',
    },
    dialogs: [
      '"Slušaj, ja znam publiku bolje nego ona sebe."',
      '"Ovo mi je deseti put u Sarajevu. Uvek ista energija."',
      '"Treba mi raise. Jesam li te ikad razočarao?"',
      '"Guncati? Svirali smo u čardaku bez struje. Preživeli smo."',
    ],
  },
  ana: {
    id: 'ana',
    bio: 'Dizajner svetla i vizualnog identiteta. Ana pretvara svaki set u audiovizuelno iskustvo koje zapamtiš.',
    strength: 'Visual efekti koji dižu energiju za 40%.',
    weakness: 'Burnout posle trećeg grada.',
    farewells: {
      high: '"Gde sledeće? Daj mi adresu."',
      mid:  '"Vizuali su radili. Ja — manje."',
      low:  '"Malo bih spavala. Tri dana minimum."',
      prestige: '"Setove zapamtili. Vizuale — zapamtili više."',
    },
    dialogs: [
      '"Daj mi 3 sata za setup i publika neće znati gde je."',
      '"Projector je zakazao. Improvizujem sa LED trakama."',
      '"Nisam spavala 36 sati. Ali videla si finale?"',
      '"Guncati nemaju struję za vizuale? Sveće onda."',
    ],
  },
  bojan: {
    id: 'bojan',
    bio: 'Promo majstor starih i novih medija. Bojan je prodao "neizvediv" Niš nastup za 72 sata.',
    strength: 'Promo koji radi čak i za nepoznat brend.',
    weakness: 'Mrzovoljni kad mu plan ne prođe.',
    farewells: {
      high: '"Iduće sezone — veći budžet, isti rezultat."',
      mid:  '"Plan je pao na pola. Sledeći — drugačije."',
      low:  '"Flajeri su propali. Sve je propalo. Odlazim."',
      prestige: '"Znam ljude u svakom gradu. Mrežu sam gradio. Koristimo je."',
    },
    dialogs: [
      '"Flajeri su mrtvi. Ali ja ih i dalje štampam."',
      '"Za 150 EUR mogu da napunim Niš. Za 50 — Guncati."',
      '"Znam influensera koji radi po dogovoru."',
    ],
  },
  ivana: {
    id: 'ivana',
    bio: 'Social media nativa. Ivana je virusna pre nego što nastup počne.',
    strength: 'Reach +50% dok spava.',
    weakness: 'Iscrpljuje se brzo, low resilience.',
    farewells: {
      high: '"Svi story-ji viral. Vidimo se uskoro?"',
      mid:  '"Reach bio dobar. Ja — ne više."',
      low:  '"Telefon me ne prepoznaje. Odlazim spavati."',
      prestige: '"Fanovi te čekaju. I ja čekam sledeći run."',
    },
    dialogs: [
      '"Instagram story iz vana — već 2000 views."',
      '"TikTok algoritam mi je prijatelj."',
      '"Molim te, ne traj me još jednim prelazom."',
    ],
  },
  nikola: {
    id: 'nikola',
    bio: 'Sound tech koji čuje frekvencije koje drugi ne registruju. Nikola je čovek koji spašava nastupe.',
    strength: 'Tech rizik prepolovljen.',
    weakness: 'Ne komunicira kad je frustriran.',
    farewells: {
      high: '"Setap radio bez greške. Kao uvek."',
      mid:  '"Mixer je preživeo. Ja — jedva."',
      low:  '"Ovo nije posao, ovo je torture. Daj mi nedelju dana."',
      prestige: '"Stari sistem radi. I ja radim. Svaki put."',
    },
    dialogs: [
      '"Bas je iz faze. Daće mi 10 minuta."',
      '"Ovaj mixer je iz 2009. Ali znam šta radim."',
      '"Equipment failure? Rešio sam za dva sata na Exit-u. Ovo je lako."',
    ],
  },
  milena: {
    id: 'milena',
    bio: 'Support DJ sa sopstvenim fanovima. Milena greje publiku bolje nego što Marko zna.',
    strength: 'Backup DJ kad Marko padne.',
    weakness: 'Rivalitet s Markom.',
    farewells: {
      high: '"Set bio bolji od Markovog. Samo kažem."',
      mid:  '"Radila sam šta sam mogla. Vidimo se."',
      low:  '"Sledeći put — solo set ili ne idem. Ozbiljno."',
      prestige: '"Fanovi znaju ko je zapravo bio soul turneje."',
    },
    dialogs: [
      '"Hoću i ja solo set. Dvadeset minuta."',
      '"Publika peva moje pesme, a ne Markove."',
      '"Beograđani me poznaju. Mogu da otvorim show."',
    ],
  },
  dragan: {
    id: 'dragan',
    bio: 'Šofer, roadie, problem-solver. Dragan je prenoćio u 47 različitih parkirnga širom bivše Jugije.',
    strength: 'Travel cost -30% sa njim.',
    weakness: 'Neće da priča tokom vožnje.',
    farewells: {
      high: '"Prečica je radila. Rekao sam."',
      mid:  '"Stigli smo. To je bitno."',
      low:  '"Nisam vozač. Nisam roadie. Šta sam onda?"',
      prestige: '"Put pamtim napamet. Brži ću biti nego prošle sezone."',
    },
    dialogs: [
      '"Znam prečicu. Veruj mi ovaj put."',
      '"GPS greška? Nema veze — znam ovaj put naizust."',
      '"Granicu u Sarajevu sam prošao stotinu puta."',
    ],
  },
  sara: {
    id: 'sara',
    bio: 'Merch menadžer sa okom za brend. Sara je prodala za 2000 EUR mercha u jednoj noći u Novom Sadu.',
    strength: 'Merch prihod +25%.',
    weakness: 'Ne shvata ozbiljno logistiku.',
    farewells: {
      high: '"Merch rasprodato. Naruči duplo za sledeću sezonu."',
      mid:  '"Ostalo je malo na stoku. Iduće — bolje planiramo."',
      low:  '"Zaboravili smo majice u Nišu. I majice i mene."',
      prestige: '"Fanovi koji kupuju — pamte. Baza kupuje duplo."',
    },
    dialogs: [
      '"Majice su se rasprodaje za sat vremena. Donesemo više?"',
      '"Fanova ima — treba im samo ponuditi šta žele."',
      '"Guncati? Ekološka merch linija — zelenoj publici."',
    ],
  },
  petar: {
    id: 'petar',
    bio: 'Livestream stručnjak. Petar je streamovao set za 8000 gledaoca iz kombija na auto-putu.',
    strength: 'Reach × 2 tokom livestreama.',
    weakness: 'Low resilience, gubi signal.',
    farewells: {
      high: '"8000 gledalaca live. Stream je legenda."',
      mid:  '"Signal je padao. Ali ostalo je snimljeno."',
      low:  '"Umoran sam. Baterija i ja — oba na nuli."',
      prestige: '"Publika koja prati stream — prati tebe. I sledeću sezonu."',
    },
    dialogs: [
      '"Twitch ili YouTube? Pitaj me posle nastupa."',
      '"Signal je loš, ali idem na 720p."',
      '"Overflow crowd? Stream za sve koji nisu ušli."',
    ],
  },
  jovana: {
    id: 'jovana',
    bio: 'PR strateg koji je spasao karijere. Jovana zna kada da priča, a kada da ćuti.',
    strength: 'Reputacija +0.3 svaki grad.',
    weakness: 'Skuplja je od ostalih.',
    farewells: {
      high: '"Reputacija intaktna. Odličan posao. Oboje."',
      mid:  '"Moglo je gore. PR sam spasao što se dalo."',
      low:  '"Daj mi dan tišine. Samo jedan."',
      prestige: '"Priča je jača nego prošle sezone. Narativ se gradi."',
    },
    dialogs: [
      '"Negativna recenzija? Imam odgovor na gotovs."',
      '"Daj mi 15 minuta s novinarom. Promeniću narativ."',
      '"Reputacija se gradi godinama. Rušiti — sekunda."',
    ],
  },
};

/**
 * Get a random dialog for a crew member
 * @param {string} member_id
 * @returns {string}
 */
export function getCrewDialog(member_id) {
  const profile = CREW_PROFILES[member_id];
  if (!profile) return '"..."';
  const d = profile.dialogs;
  return d[Math.floor(Math.random() * d.length)];
}

/**
 * Get crew member bio
 * @param {string} member_id
 * @returns {string}
 */
export function getCrewBio(member_id) {
  return CREW_PROFILES[member_id]?.bio || '';
}
