// =============================================================================
// data/aforizmi.js — Pera Period bank (S1 final set, 2026-05-11)
// =============================================================================
// Autor: Pera Period + Dule Dubina (etička validacija combined)
// Reference:
//   - dule-eticki-filter.md sekcija 4 (Pera Subtekst Pravilnik)
//   - mile-gdd-v2-sezona1.md sekcija 12.3 (Pera ton po fazi)
//   - concept/v7-paths-ui-rethink.md (6 paths + meta)
//   - data/paths.js (Selektor / Faca / Žilav / Vezista / Promoter /
//                    Andergraund / Prkosni / Trajni / Tragični Genije)
//   - data/classes.js (Bogata deca / Radnička klasa / Posthumna penzija / Custom)
//
// Pera ton pravilnik (Dule potvrdio):
//   1. Observation, ne dijagnoza
//   2. Pitanje, ne osuda
//   3. Specifični brojevi, vremena, sećanja
//   4. Tonalitet po fazi (1-3 podržavajući, 4-12 neutral, 13+ brutal samo ako kolaps)
//
// Total: ~110 linija S1.
// =============================================================================

export const PERA_AFORIZMI = {

  // ---------------------------------------------------------------------------
  // ORIGIN COMPLETION (5 origin pitanja gotovih) — po klasi + ukus
  // ---------------------------------------------------------------------------
  origin_complete_bogata_deca: [
    'Tata ti je dao deck. Niko ti ga ne može oduzeti. Pitanje da li si zaslužio postavlja samo onaj koji ne razume da to nije pitanje.',
    'Imaš pristup pre nego što si tražio. Scena vidi tu razliku, ali ne onako kako misliš.',
    'Privilegija je alat. Pitanje je koji.'
  ],
  origin_complete_radnicka: [
    'Šest sati ti uzima drugi posao. Pet ti je za muziku. Tih pet su tvoji — gušće od dvanaest tuđih.',
    'Sve što ćeš napraviti, nosiš sam. Težina i zasluga su ista stvar.',
    'Nemaš vremena za suvišno. To ti niko neće ukrasti kasnije.'
  ],
  origin_complete_penzija: [
    'Imaš vremena. Pitanje je da li previše — to telo zna pre kalendara.',
    'Nije pitanje šta ćeš, već šta nećeš. Sloboda izbora je teža nego što izgleda.',
    'Faks kreće, podrška je tu. Pitanje koje samo ti znaš: čemu služi vreme koje ti je dato.'
  ],
  origin_complete_custom: [
    'Tvoj početak nije ni jedan od tri. Pitanje koje ne moraš da odgovoriš: da li ti je lakše ili teže što si izabrao sam.',
    'Sve klase imaju puteve do kraja. Različiti tempovi, ne različiti ishodi.',
    'Priču si poneo sam. Sad da vidimo koliko od nje stane u dvanaest nedelja.'
  ],

  // ---------------------------------------------------------------------------
  // MACRO WEEK START (jutro DJ-a, ponedeljak)
  // ---------------------------------------------------------------------------
  week_start: [
    'Nedelja je krenula. Niko još ne broji.',
    'Sedmica počinje sa onim što si poneo iz prošle. Više nego što misliš.',
    'Tri seta su pred tobom. Bar jedan će te iznenaditi.',
    'Jutro je tiše nego što pamtiš. To je dobar znak ili nije — saznaćeš u petak.',
    'Kalendar ti je prazan. To znači da ga ti pišeš ove nedelje.',
    'Ponedeljak. Glava ti još pamti subotu. Telo čuje sredu.',
    'Krenuo si bez plana ili sa planom. Petak će reći koje od to dvoje radi.'
  ],

  // ---------------------------------------------------------------------------
  // ACTIVITY FEEDBACK (posle pojedinih akcija po vektoru)
  // ---------------------------------------------------------------------------
  activity_promo: [
    'Pet objava ove nedelje. Četiri nije video niko. Petu vide oni koje si već znao.',
    'Story stigne brže nego što se setiš da si ga pustio.',
    'Promo se gleda dok je svež. Posle je reč od usta jača.'
  ],
  activity_music_research: [
    'Tri sata u digsu. Našao si dve pločice. Jedna će ti držati kraj seta sledeće nedelje.',
    'Slušao si pre nego što si pomislio da pustiš. Razlika između zanata i pokazivanja.',
    'Ono što pamti samo tvoje uvo — odatle dolazi signature.'
  ],
  activity_networking: [
    'Pio si sa scenom. Pitanje je koliko od scene si poneo, koliko od sebe si ostavio.',
    'Tri kontakta više u telefonu. Dva će te zvati. Jedan će te zaboraviti do utorka.',
    'Stari rezident te je primetio. Pamti i one koji nisu primećeni.'
  ],
  activity_mixing: [
    'Vežbao si dve nedelje istu tranziciju. Sad je nesvesna. Sledeća je teža.',
    'Miks se čuje. Igrač u sali ne razume zašto je dobro, ali ne odlazi.',
    'Četiri sata u sobi. Niko ti to neće priznati. Set u petak hoće.'
  ],
  activity_izgled: [
    'Persona se gradi pre nego što stigneš da je objasniš. Ako stigneš da je objasniš — već je kasno.',
    'Lice ti vide pre nego što čuju. Pitanje je šta vide.',
    'Outfit nije suština. Ali je signal — i signal radi.'
  ],
  activity_scene_presence: [
    'Bio si u sali iako nisi puštao. Vide ko ostane do kraja.',
    'Stojiš pored boksa kad ne moraš. To se zove prisustvo, ne navijanje.',
    'Tri sata u tuđoj žurci. Tvoj kraj nedelje kaže da nije bila tvoja noć. Sledeća će biti bliža.'
  ],
  activity_finansije: [
    'Honorar je stigao. Nije ti rešio nedelju, ali je dao da je preživiš.',
    'Račun je veći od fajla. To je matematika koja vraća, kasnije ili nikad.',
    'Pet evra manje za muziku znači sto manje za nešto što ne pamtiš.'
  ],
  activity_reckless_selection: [
    'Pustio si nešto što niko ne pušta. Tri u sali su odustala. Dvojica su ostala. Pitanje je da li ti je to dovoljno.',
    'Hrabro ili glupo — i dalje je tvoj potpis. Razlika je u onom što se sledeći put desi.',
    'Tuđi set ti se vrti u glavi. Tvoj je pušten — i to ti niko ne može oduzeti.'
  ],

  // ---------------------------------------------------------------------------
  // ŽRTVOVANJE DRAIN SIGNAL (Health / Odnosi / Normalnost)
  // ---------------------------------------------------------------------------
  health_low_50: [
    'Tri noći. Ogledalo ti i sutra govori isto.',
    'San je deo karijere. Onaj koji to ne primeti — pamti se kao dobar, ali ne dugo.',
    'Telo ti piše ono što kalendar neće.',
    'Četiri sata sna. Telo ti je popustilo prvo — glava još ne zna.'
  ],
  health_low_30: [
    'Došao si do publike. Do sutra još nisi.',
    'Telo ti je u zoni gde se ljudi mire da neće ustati u deset.',
    'Stomak prvi javi. Onda ramena. Glava poslednja stigne.',
    'Ono što ne može da se izvuče kafom — to je signal, ne stanje.'
  ],
  odnosi_low: [
    'Majka ti je zvala pre devet dana. Telefon ti je tu, ona zna.',
    'Tri prijatelja više nisu na listi. Nisi ih izbrisao — nisi ih pozvao.',
    'Sestra ti je rodila pre dva meseca. Čestitao si porukom. Tačkica posle imena znači da te poznaje.',
    'Drug iz srednje ti je pisao. Nisi odgovorio. Ne zato što nećeš — zato što si zaboravio kako se odgovara.'
  ],
  normalnost_low: [
    'Čitao si knjigu pre dva meseca. Ne sećaš se čije.',
    'Hobi slot ti je prazan šest nedelja. Ponekad je to u redu. Ne sad.',
    'Sunce si video kroz prozor kola. To se ne broji.',
    'Pisao si dnevnik. Sad pišeš samo set-listu. Razlika je teža nego što izgleda.'
  ],

  // ---------------------------------------------------------------------------
  // ŽURKA PRE-START (Micro Night ulazak)
  // ---------------------------------------------------------------------------
  pre_event: [
    'Set počinje za dvadeset minuta. Pripremio si dvadeset pločica. Iskoristićeš osam.',
    'Čas je. Telo zna šta sledi pre nego što ti kažeš.',
    'Niko još nije došao. Ti si tu prvi — to ti je posao.',
    'Stiglo je vreme. Pitanje je da li si stigao i ti.',
    'Set-lista ti je u glavi. Sala će je pisati drugačije.'
  ],

  // ---------------------------------------------------------------------------
  // ŽURKA POST-EVENT (po set quality)
  // ---------------------------------------------------------------------------
  set_high: [
    'Pustio si set kakav nisi očekivao da hoćeš.',
    'Sala te je držala ovaj put. Sledeći put ti držiš nju.',
    'Tranzicija oko četiri ujutro. To si nosio nedeljama. Sad si je rekao.',
    'Niko nije izašao za poslednjih sat. To se ne dešava slučajno.',
    'Pljesak je iskren. To znaš po tome što si ga osetio pre nego što ga je bilo.'
  ],
  set_low: [
    'Publika oseti. Nisi morao da im kažeš.',
    'Ovo nije bio tvoj set. Pitanje je šta ga je odvelo od tebe.',
    'Pločica koja je trebalo da otvori — zatvorila je. Sutra se vraća, ne zaboravlja se.',
    'Troje je izašlo u jednom trenutku. To je informacija, ne presuda.'
  ],
  set_average: [
    'Set je bio dovoljan. To je reč koja se često kaže, ali ne kaže sve.',
    'Niko nije izašao, niko nije pisao posle. Srednja zona — i ona ima svoju cenu.',
    'Sala se setila ko si. Pitanje je da li će se setiti i sledeće subote.'
  ],

  // ---------------------------------------------------------------------------
  // PATH LEAN SIGNAL (igrač jasno klizi ka jednom putu)
  // ---------------------------------------------------------------------------
  path_lean_selektor: [
    'Set ti je primarni alat. Ostalo je doplata. Tako se nešto gradi do kraja.',
    'Puštaš dovoljno često da te sala pamti po setu, ne po imenu. Teži smer, sigurniji put.'
  ],
  path_lean_faca: [
    'Vide te pre nego što čuju. Pitanje koje ne moraš da odgovoriš: šta sledi kad oboje dođu.',
    'Persona ti je porasla pre nego što si stigao da je objasniš. To je dar, ali i račun.'
  ],
  path_lean_vezista: [
    'Svako te zna. Ti znaš svakog. To je posao koji se ne sme prekinuti.',
    'Mreža ti raste brže nego set-lista. To je izbor, sa svojim ostavinama.'
  ],
  path_lean_promoter: [
    'Naplatio si scenu pre nego što te je scena platila. Matematika je tvoja — i njena.',
    'Tri honorara ove nedelje. Četvrti ti je odložio rođak. Tako se uči ko plaća kad.'
  ],
  path_lean_andergraund: [
    'Znaš po imenima. Puštaš po sekciji. To je put koji niko ne brza — i to mu je suština.',
    'Ne pojavljuješ se gde svi pišu. Pojavljuješ se gde se sluša.'
  ],
  path_lean_prkosni: [
    'Pustio si nešto što niko ne pušta. Sledeći put hoćeš ponovo. To je signature, ne pogrešno.',
    'Bezobrazan si u izboru. To je razlika između potpisa i kopije.'
  ],
  path_lean_zilav: [
    'Držao si glavu iznad vode. To se ne pamti kao slava, ali se pamti.',
    'Ovo je nedelja koju nisi mislio da ćeš dovući. Dovukao si.'
  ],

  // ---------------------------------------------------------------------------
  // WEEK RECAP (kraj nedelje, filozofski osvrt)
  // ---------------------------------------------------------------------------
  week_recap: [
    'Nedelja je gotova. Ono što pamtiš razlikuje se od onog što kalendar pamti.',
    'Ova nedelja te nije promenila. Pitanje je da li je trebalo.',
    'Više muzike nego izlaska. Sad ti se isplati.',
    'Više izlaska nego muzike. Sad ti se isplati.',
    'Sedam dana je prošlo. Četiri si pamtio, kroz tri si prošao.',
    'Brojiš šta si uradio. Sutra ćeš brojati šta nisi.',
    'Nedelja se zatvara. Ono što si poneo, ponećeš dalje. Ostalo ostaje gde si ga zaboravio.',
    'Kraj sedmice je tih. Bolji kraj nego početak.',
    'Sve što si stigao, stigao si. Sve što nisi — to je sledeća nedelja.',
    'Ništa preterano se nije desilo. To je takođe informacija.'
  ],

  // ---------------------------------------------------------------------------
  // FINALE PO PATH-U (6 path + Tragic Genius cascade + Lasting DJ)
  // ---------------------------------------------------------------------------
  finale_selektor: [
    'Sezona je gotova. Niko više ne pita ko će pustiti. Pitaju kad.'
  ],
  finale_faca: [
    'Persona je porasla. Lice te je pretrčalo. Sada glava treba da je sustigne.'
  ],
  finale_vezista: [
    'Krug je pun. Svako te zna. Pitanje koje ne moraš da odgovoriš: koga još znaš ti.'
  ],
  finale_promoter: [
    'Naplatio si nedelju. Naplatio si sezonu. Sledeće je da naplatiš sebi — to je teža naplata.'
  ],
  finale_andergraund: [
    'Sezona je zatvorena tiho. Tako se i otvara ona sledeća.'
  ],
  finale_prkosni: [
    'Pustio si do kraja ono što niko ne pušta. Sad imaš potpis. Pitanje je šta s njim sledeće sezone.'
  ],
  finale_trajni: [
    'Nikad ti se nije srušila kuća. Ne zato što si imao sreće — zato što si umeo da nosiš svoju težinu, a tuđu samo onoliko koliko si mogao.'
  ],
  finale_tragicni: [
    'Bio si prelep. Onda nije bilo nikog tu da te vidi. Razlika ti je trajala duže nego što si mislio.'
  ],

  // ---------------------------------------------------------------------------
  // HARD FAIL EVENTS (kolaps, ne moralizovanje)
  // ---------------------------------------------------------------------------
  hard_fail_health: [
    'Telo je reklo prvo. Ti ga sad čuješ.',
    'Ovo nije presuda. To je pauza koja te je već čekala.'
  ],
  hard_fail_odnosi: [
    'Niko nije pisao tri nedelje. To je više od slučajnosti.',
    'Ono što se izgubilo, ne mora da ostane izgubljeno. Ali neće se vratiti samo.'
  ],
  hard_fail_finansije: [
    'Račun je rekao ono što telo nije stiglo. Sad i jedno i drugo čekaju.',
    'Četiri evra na računu. Nedelja je dugačka, ali se završava.'
  ],
  hard_fail_normalnost: [
    'Zaboravio si kako se ne radi. To se uči ponovo, sa cenom.',
    'Ime ti niko nije rekao mesec dana — bez prezimena DJ. To je signal.'
  ],

  // ---------------------------------------------------------------------------
  // APSTINENT REFLECTION (q5 = apstinent)
  // ---------------------------------------------------------------------------
  apstinent_reflection: [
    'Bio si jedini trezan u sobi. Šta si video što ostali nisu.',
    'Nisi pio sedam godina. Niko te ne pamti zbog toga. Pitanje koje ne moraš da odgovoriš: da li je trebalo.',
    'Disciplina ti je tvoj alat. Pitanje koje sam sebi postavljaš — i to je dovoljno.'
  ],

  // ---------------------------------------------------------------------------
  // SUPPORTIVE PHASE (nedelja 1-3) — Dule pravilnik 4.4
  // ---------------------------------------------------------------------------
  supportive_phase: [
    'Prva nedelja. Niko još ne očekuje. Ni ti ne moraš.',
    'Niko se ne pamti po prvoj nedelji. Pamti se po dvanaestoj.',
    'Sve do sad bila je vežba. Sad je tu set koji će neko da pomene.',
    'Početak je tih. Tako počinju i oni koji ostaju.',
    'Treću nedelju radiš bez panike. To je već više od pola scene.'
  ],

  // ===========================================================================
  // EVENT TRIGGERS — immediate action loop (Pera v3, 2026-05-12)
  // ===========================================================================
  // Drop "week_recap" dump paradigm. Pera linije se javljaju POSLE key event-a
  // kontinualno (per Iskra gameplay-loop-rework + Mile GDD immediate action +
  // Dule Mitigacija C frequency cap 1 per 30-45min, topic rotation, soft pause).
  // ===========================================================================
  event_triggers: {

    // V1 PROMO
    action_promo_success: [
      'Tri lajka u prvom satu. Isti broj kao kad si ćutao.',
      'Insta priča ne broji ujutro. Algoritam pamti samo veče.',
      'Stavio si lice gore. Pitanje je da li te traže ili samo gledaju.',
      'Stiglo je do njih. Ne znaš kojih.'
    ],
    action_promo_fail: [
      'Niko se nije javio. Telefon ne laže.',
      'Reel je gledalo manje ljudi nego što ih ima u tvojoj fioci.',
      'Ad spend je legao u prazan plato.',
      'Pisalo je u prazno. Feed se okrenuo dva sata posle tebe.'
    ],
    action_promo_stale: [
      'Iste poze, iste oči. Sledeći put pokušaj nešto što te boli.',
      'Pet objava istih reči. Telo gledaoca vidi pre nego što oko stigne.',
      'Promo bez novosti je dnevnik koji niko ne otvori.'
    ],

    // V2 MUSIC RESEARCH
    action_music_breakthrough: [
      'Ploča ti je sela u stomak pre nego što ti je dotakla uvo.',
      'Jedna kompozicija ti je rekla nešto što tri nedelje nisu mogle.',
      'Sad imaš zvuk koji niko drugi nema. Pitanje je da li ćeš se setiti odakle.',
      'Nešto u tom redu nota ti je otvorilo prozor. Sutra si ti.'
    ],
    action_music_dud: [
      'Dva sata digovanja, nula plus.',
      'Sve te ploče zvuče kao prethodne. Možda si ti.',
      'Vinyl shop ti je pojeo pare i sat. Ostala ti je torba i ćutanje.',
      'Soundcloud feed ti je pružio ono što već imaš tri puta.'
    ],

    // V3 KNOWLEDGE
    action_knowledge_insight: [
      'Stranice gledaju iz tebe sad. Knjiga ti je dotakla nešto.',
      'Jedan red ti je premestio nešto u glavi. Ne znaš još šta.',
      'Posle ovog pasusa, slušaš drugačije.',
      'Dokumentarac ti je rekao staru priču. Sad je tvoja.'
    ],
    action_knowledge_mentor: [
      'Stariji ti je rekao u tri rečenice ono što si tražio tri meseca.',
      'On zna jer je grešio. Pitanje je da li ti smeš isti put.',
      'Ručao si sa nekim ko je ostao u igri dvadeset godina. To se ne kupi.'
    ],
    action_knowledge_dud: [
      'Podcast ti je ispao iz uha posle pet minuta. Telo zna kad nije telo.',
      'Knjiga ti se otvorila na strani gde već znaš sve. Ne ide ti danas.'
    ],

    // V4 MIXING
    action_mixing_improvement: [
      'Vežbu osećaš u prstima. Sutra ne moraš da misliš na to.',
      'Tranzicija ti je sela ovaj put. Telo pamti.',
      'Beatmatching ti se uvukao u disanje. Brojiš bez brojanja.',
      'Sad ti dekovi rade umesto tebe. To se ne dešava preko noći — dešava se posle tri sata noći koju nisi spavao.'
    ],
    action_mixing_regression: [
      'Sat vežbe, dva koraka unazad. Telo te traži.',
      'Ruka ti se trese više nego pre nedelju dana. Pitanje koje si potisnuo.',
      'Studio sesija ti je danas zvučala kao tuđa. Verovatno jeste.'
    ],

    // V5 IZGLED
    action_izgled_vanity: [
      'Frizer te je novom glavom poslao u sobu. Sutra će ti reći ko si.',
      'Garderoba ti je oduzela dve plate. Pitanje je da li su ti dale nešto što do sad nisi imao.',
      'Foto-sesija ti je dala lice koje će neko da pamti. Pamti i kad pita ko si.',
      'Fitnes sesija, sat na trenažeru. Telo te ne laže.'
    ],

    // V6 SCENE PRESENCE
    action_scene_networking_success: [
      'Razgovor ti je rekao nešto što nije pitao za odgovor.',
      'Stao si pored nekoga ko te nije morao da pozdravi.',
      'Mingling ti je dao dva broja i jedan razlog za sutra.',
      'Krju te je primio za sto. Bez pitanja, što je glasnije od pitanja.'
    ],
    action_scene_networking_dud: [
      'Stajao si dva sata. Niko nije pitao šta puštaš.',
      'Krug se zatvorio bez tebe. Sutra je drugi krug.',
      'Pratio si razgovor koji se ne tiče tebe. Energija ti je otišla.'
    ],

    // V7 FINANSIJE
    action_fin_gig_booked: [
      'Klub te je primio. Pamti broj — sutra je drugačiji.',
      'Pozvali su te. Pitanje je da li si ti ili je booker bio mamuran.',
      'Cifra ti je stigla bez pregovora. Znači da treba sledeći put više.'
    ],
    action_fin_sponsor: [
      'Brend ti je rekao da ćeš zarađivati. Pamti ko ti je platio prvo pivo.',
      'Sponzorsko pismo ti je palo u inboks. Otvori ga kad budeš sam.'
    ],
    action_fin_sljakanje: [
      'Sedam sati za platu koja je tek za pivo i kartu.',
      'Šljakanje ti je oduzelo dan. Vratilo ti dostojanstvo.',
      'Radio si dok su drugi digovali. Pitanje koje neko mora da postavi.',
      'Sad imaš pare i kičmu. Veza je tvoja.'
    ],

    // V8 ENERGIJA
    action_energy_siesta: [
      'Dva sata mira u sredini dana. Niko ti to nije propisao osim tela.',
      'Spavao si kad su drugi pričali. Snovi su ti rekli šta da pustiš.'
    ],
    action_energy_hobby: [
      'Tri sata sa nečim što nije muzika. Knjiga, lopta, ribnjak — svejedno.',
      'Hobi te vratio u nešto što si bio pre pulta.',
      'Sad si bio neko ko nije DJ. Vrati se sutra sa novim ušima.'
    ],
    action_energy_sleep: [
      'Osam sati. Telo te je naučilo da ima cenu kad se ne plaća.',
      'Spavao si bez slušalica. Sutra ti ne dolazi sa istom težinom.'
    ],

    // V9 RECKLESS
    action_reckless_signature: [
      'Iskovao si signature ploču. Sutra ćeš znati da li je tvoja ili pozajmica.',
      'Risk-research te je odveo u retku ploču. Sad ti je u torbi — i pitanje.',
      'Sad imaš oružje za sledeću subotu. Možda i protiv sebe.',
      'A/B test ti je rekao šta ne ide. To je veće od šta ide.'
    ],

    // GIG NIGHT — dan-of-week (uto/sre/cet/pet/sub) + miss
    gig_utorak_success: [
      'Utorak. Trideset ljudi. Niko se ne uda za tebe te noći, ali jedan te neće zaboraviti.',
      'Mali kafić ti je dao prvu klimu. Telo zna kad sala diše.',
      'Utorkom se ne pravi karijera. Utorkom se pravi telo za petak.'
    ],
    gig_utorak_fail: [
      'Mali klub, mala očekivanja, manji set. Niko te ne pita za sutra.',
      'Utorak ti je oduzeo veče za novac koji nije ni za pivo.'
    ],
    gig_sreda_success: [
      'Sreda, klub C, publika koja sluša prvi takt. Pamti kako si započeo — sutra će neko da pita.',
      'Sredinom nedelje sala ima drugi puls. Ti si ga osetio.',
      'Booker te je gledao iz ćoška. Ne mora da prilazi da bi pamtio.'
    ],
    gig_sreda_fail: [
      'Sreda nije bila tvoja. Plej-lista ti je bežala iz ruke.',
      'Klub C te je primio i pustio. Razlog ne znaš još.'
    ],
    gig_cetvrtak_success: [
      'Četvrtak, klub B, krju je seo pored pulta. Sad si bio za njih.',
      'Reputacija ti je radila pre tebe. Posle seta to znaš.',
      'Četvrtak je tvoj dan. Možda zato što ga niko drugi ne brani.'
    ],
    gig_cetvrtak_fail: [
      'Četvrtak je tražio od tebe više nego što si nosio.',
      'Klub B te je primio na pola. Booker neće zvati sledeće dve nedelje.'
    ],
    gig_petak_success: [
      'Petak, klub A, dvesta ljudi je znalo čije je veče. Tvoje je sad.',
      'Premijum veče ti je dalo cifru koja se pamti.',
      'Petak ti je dao publiku koju nije morao niko da pozove.'
    ],
    gig_petak_fail: [
      'Petak te skratio. Sala je odlazila pre kraja.',
      'A-tier klub te ne uvodi dva puta zaredom. Idi kući i misli.'
    ],
    gig_subota_success: [
      'Subota. Premijum veče. Sad imaš noć koja se pamti dvanaest nedelja.',
      'Sala te je nosila. Pitanje je da li ti je sutra dala mir ili glad.',
      'Najveća publika ti je dala najveću tišinu posle. Drži se te tišine.',
      'Subota je prošla. Sad si tu kuda si gledao osam nedelja.'
    ],
    gig_subota_fail: [
      'Subota te je iznajmila. Više se ne vraćaš na nju brzo.',
      'Premijum noć je pamtila set koji nije bio tvoj.',
      'A-tier prime ti je pokazao gde si. Sad piše.'
    ],
    gig_miss: [
      'Telefon nije zvonio. Subota je.',
      'Sala neće biti tvoja ovaj put. Sutra si ti.',
      'Niko te nije zvao. Pamti ko jeste, ne ko nije.'
    ],

    // COOLDOWN GRAY-OUT — spam pokušaj (free, ne troši sat)
    cooldown_promo_blocked: [
      'Već si objavio. Algoritam te ne voli više.',
      'Insta ti je rekao dosta. Sutra je drugi feed.',
      'Reel ti čeka dva segmenta. Ne juri pre sebe.',
      'DM lista ti je sveža. Pusti je da odradi posao.'
    ],
    cooldown_izgled_blocked: [
      'Frizer ne radi noću. Sutra.',
      'Iste poze, iste oči. Sledeća fotka je za tri nedelje.',
      'Garderoba ti je sveža. Ne kupuje se ista jakna dva puta u nedelji.',
      'Fitnes ti je telo dao danas. Daj mu jutro.'
    ],
    cooldown_money_blocked: [
      'Novac nije magični dvogled. Ad spend ima krov.',
      'Sponzor ti se neće javiti dva puta u istoj nedelji.'
    ],
    cooldown_scene_blocked: [
      'Već si bio tu večeras. Ekipa te ne čeka tri puta u istom veče.',
      'Guest set ti je odsviran. Sledeći te zovu kad zaborave pa se sete.'
    ],

    // PATH LEAN THRESHOLD — wk 4 (emerge) + wk 7 (mature)
    path_lean_selektor_wk4: [
      'Trčiš ka publici sa kompletom koji je već znao kako se zove. Drugi te zovu profesionalcem pre nego što si rekao.'
    ],
    path_lean_selektor_wk7: [
      'Imam te u uvu — kažu drugi. Sad znaš zašto te zovu drugi put.'
    ],
    path_lean_faca_wk4: [
      'Frizer, garderoba, fotka. Telo ti je postalo brend. Pitanje koje nećeš sebi.'
    ],
    path_lean_faca_wk7: [
      'Polako, ti si postao taj koji ulazi prvi u kadar. Sala te gleda pre nego što stigneš za pult.'
    ],
    path_lean_vezista_wk4: [
      'Brojevi ti se gomilaju u telefonu. Pamtiš lica više nego pesme.'
    ],
    path_lean_vezista_wk7: [
      'Sad si veza koja drugima otvara vrata. Pitanje je ko otvara tebi.'
    ],
    path_lean_promoter_wk4: [
      'Pare ti se nakupljaju. Pitanje je kojim ratama plaćaš.'
    ],
    path_lean_promoter_wk7: [
      'Postao si neko ko broji pre nego što pusti. Subota te zove. Pamti šta ne zoveš.'
    ],
    path_lean_andergraund_wk4: [
      'Skupljaš ploče sporo, ćutiš ih duže. Crna trkačka staza te traži.'
    ],
    path_lean_andergraund_wk7: [
      'Andergraund te primio bez aplauza. Pitanje je da li te primio ili te krije.'
    ],
    path_lean_prkosni_wk4: [
      'Rizikuješ ploču svake nedelje. Sala ti to još oprašta.'
    ],
    path_lean_prkosni_wk7: [
      'Sad si onaj koji ulazi sa retkim. Pitanje je da li biraš ti ili rizik bira tebe.'
    ],

    // FIRST-RUN ONBOARDING — prvi 3 klika (Dule Mitigacija D)
    onboarding_click_1: [
      'Prvi klik. Sat ti je krenuo. Ono što odeš sad — ne vraća se.'
    ],
    onboarding_click_2: [
      'Drugi klik. Telo počinje da prati. Stare strune ti se trzaju — to si ti, ne sistem.'
    ],
    onboarding_click_3: [
      'Treći klik. Sad razumeš kako diše. Brojevi se sklanjaju, sluh ostaje.'
    ],

    // WALL-CLOCK NUDGE — 25+ akcija u real-time sesiji (Dule Mitigacija E)
    wallclock_nudge: [
      'Sat ti se nije pomerio za vodu poslednjih dvadeset i pet poteza.',
      'Igraš dugo. Telo te zove — ne sad, samo da znaš.',
      'Dvadeset i pet klikova bez prozora. Pitanje koje ne traži odgovor.',
      'Sala u ekranu ti je dala dosta. Telo ti je dalo manje. Vidi to.',
      'Dugo ne pamtiš sebe izvan ovog kvadrata.',
      'Nije rok. Nije kazna. Samo prozor — ako hoćeš.'
    ]
  }
};

// =============================================================================
// CONTEXT SELECTOR — Mile sekcija 12.3
// =============================================================================
export function selectAforizam(state, context) {
  const week = state.week;
  const bank = PERA_AFORIZMI;

  // EVENT TRIGGER (v3 immediate action) — "event:<key>"
  // Iskra concept gameplay-loop-rework + Dule Mitigacija C
  if (typeof context === 'string' && context.startsWith('event:')) {
    const key = context.slice(6);
    if (bank.event_triggers && bank.event_triggers[key]) {
      return pick(bank.event_triggers[key]);
    }
    return pick(bank.supportive_phase);
  }

  // ORIGIN
  if (context === 'origin_complete') {
    const klasa = state.origin?.q1_class || 'custom';
    if (klasa === 'bogata_deca') return pick(bank.origin_complete_bogata_deca);
    if (klasa === 'radnicka_klasa') return pick(bank.origin_complete_radnicka);
    if (klasa === 'posthumna_penzija') return pick(bank.origin_complete_penzija);
    return pick(bank.origin_complete_custom);
  }

  // MACRO
  if (context === 'week_start') return pick(bank.week_start);
  if (context === 'week_recap') return pick(bank.week_recap);

  // ACTIVITY FEEDBACK (po vektoru)
  if (context === 'activity_promo') return pick(bank.activity_promo);
  if (context === 'activity_music_research') return pick(bank.activity_music_research);
  if (context === 'activity_networking') return pick(bank.activity_networking);
  if (context === 'activity_mixing') return pick(bank.activity_mixing);
  if (context === 'activity_izgled') return pick(bank.activity_izgled);
  if (context === 'activity_scene_presence') return pick(bank.activity_scene_presence);
  if (context === 'activity_finansije') return pick(bank.activity_finansije);
  if (context === 'activity_reckless_selection') return pick(bank.activity_reckless_selection);

  // ŽURKA
  if (context === 'pre_event') return pick(bank.pre_event);
  if (context === 'set_high') return pick(bank.set_high);
  if (context === 'set_low') return pick(bank.set_low);
  if (context === 'set_average') return pick(bank.set_average);

  // DRAIN
  if (context === 'health_low' && state.sacrifice?.health < 30) return pick(bank.health_low_30);
  if (context === 'health_low') return pick(bank.health_low_50);
  if (context === 'odnosi_low') return pick(bank.odnosi_low);
  if (context === 'normalnost_low') return pick(bank.normalnost_low);

  // PATH LEAN
  if (context === 'path_lean') {
    const path = state.path_lean?.dominant;
    if (path === 'pro_set') return pick(bank.path_lean_selektor);
    if (path === 'peak_maker') return pick(bank.path_lean_faca);
    if (path === 'networker') return pick(bank.path_lean_vezista);
    if (path === 'hustler') return pick(bank.path_lean_promoter);
    if (path === 'underground_craftsman') return pick(bank.path_lean_andergraund);
    if (path === 'reckless_selector') return pick(bank.path_lean_prkosni);
    if (path === 'survivor') return pick(bank.path_lean_zilav);
  }

  // FINALE
  if (context === 'finale') {
    const path = state.final_path;
    if (path === 'pro_set') return pick(bank.finale_selektor);
    if (path === 'peak_maker') return pick(bank.finale_faca);
    if (path === 'networker') return pick(bank.finale_vezista);
    if (path === 'hustler') return pick(bank.finale_promoter);
    if (path === 'underground_craftsman') return pick(bank.finale_andergraund);
    if (path === 'reckless_selector') return pick(bank.finale_prkosni);
    if (path === 'the_lasting_dj') return pick(bank.finale_trajni);
    if (path === 'the_tragic_genius') return pick(bank.finale_tragicni);
  }

  // HARD FAIL
  if (context === 'hard_fail_health') return pick(bank.hard_fail_health);
  if (context === 'hard_fail_odnosi') return pick(bank.hard_fail_odnosi);
  if (context === 'hard_fail_finansije') return pick(bank.hard_fail_finansije);
  if (context === 'hard_fail_normalnost') return pick(bank.hard_fail_normalnost);

  // APSTINENT (q5)
  if (state.origin?.q5_apstinencija === 'apstinent' && context === 'reflection') {
    return pick(bank.apstinent_reflection);
  }

  // PHASE-BASED DEFAULT
  if (week <= 3) return pick(bank.supportive_phase);

  return pick(bank.week_recap);
}

function pick(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

// =============================================================================
// BACKWARD COMPAT — Mile sistemi i ostali fajlovi import-uju AFORIZMI_PLACEHOLDER.
// Eksportujemo alias da se ne kvari postojeci kod dok se sve ne prebaci.
// =============================================================================
export const AFORIZMI_PLACEHOLDER = PERA_AFORIZMI;

// Stats — nested-aware (event_triggers je object od arrays)
export const AFORIZMI_COUNT = Object.values(PERA_AFORIZMI).reduce((sum, val) => {
  if (Array.isArray(val)) return sum + val.length;
  if (val && typeof val === 'object') {
    return sum + Object.values(val).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  }
  return sum;
}, 0);
