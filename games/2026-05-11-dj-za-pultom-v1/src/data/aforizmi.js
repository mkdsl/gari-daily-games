// =============================================================================
// data/aforizmi.js — Pera Period bank (S1 v3 — event-trigger immediate action)
// =============================================================================
// Tonalitet: telo, opservacija, pitanje. Ne dijagnoza, ne savet.
// Po fazi: nedelja 1-3 supportive, 4-12 neutral observation, kraj može brutal.
//
// v3 dodaci (Pera Period 2026-05-12, immediate action time-tax loop):
//   - event_triggers — nove kategorije za immediate action paradigm:
//       action_<vektor>_<success|fail|stale|breakthrough> — per-akcija feedback
//       gig_<dan>_<success|fail> — gig night dan-of-week (uto-sub) + gig_miss
//       cooldown_<akcija>_blocked — gray-out shake response (free, ne troši sat)
//       path_lean_<path>_<wk4|wk7> — path emerge milestone (Negini pacing pragovi)
//       onboarding_click_<n> — prvi 3 klika (Dule Mitigacija D: numerik balon overlay)
//       wallclock_nudge — 25+ akcija u real-time sesiji (Dule Mitigacija E)
//
// DROP iz v2: week_end_generic (week recap dump — Iskra concept eksplicitno OUT)
//
// Frequency cap mehanika (Dule Mitigacija C):
//   - 1 linija per 30-45min internal default; upper bound 1 per 15min
//   - Topic rotation: dve uzastopne ne smeju isti vector
//   - Soft pause posle event-Pera: sledeće 2-3 standardne se preskoče
//   - Event-trigger linije imaju prioritet nad random per-action
//
// v2 dodaci (Jova 2026-05-11):
//   - cinematic_hook (Cinematic A boot scena)
//   - origin_intro (pre/posle Origin Creator)
//   - symptom_zone_yellow / red — overlay subtitle posle key event-a
//   - recovery_slot_use (Tišina / Integration / Reality check)
//   - rec_decay (recognizability normalnost-low decay)
// =============================================================================

export const AFORIZMI = {

  // ===========================================================================
  // CINEMATIC A HOOK — boot scena, dub bass, 1 rečenica fade-in
  // ===========================================================================
  cinematic_hook: [
    'Niko ne počinje za pultom. Počinje od onoga što mu je život ostavio na podu.',
    'Sat ti broji. Sala ne. Pitanje je čije pamćenje hoćeš.',
    'Bas ti udara u grudni koš pre nego što stigne do ušiju. Tu si.',
    'Nisi izabrao zvuk. Zvuk te je našao kad si ćutao.',
    'Pet nedelja unapred zna se ko si. Dvanaest unapred niko.',
    'Jedna ploča je dovoljna da te zapamte. Pitanje je da li si je ti birao ili ona tebe.',
    'Petak je. Telo ti zna pre nego što ti kažeš.',
    'Sve što si do sad puštao bila je vežba. Sad ti neko broji.'
  ],

  // ===========================================================================
  // ORIGIN INTRO — pre/posle Origin Creator
  // ===========================================================================
  origin_intro: [
    'Tvoj početak nije presuda. Pitanje je šta ćeš nositi od njega.',
    'Sve klase imaju puteve do kraja. Različiti tempovi, ne različiti ishodi.',
    'Pitanje nije odakle si. Pitanje je šta si ostavio iza sebe da bi došao.'
  ],

  origin_complete: [
    'Klasa nije sudbina. Klasa je teret. Teret može da te ojača ili da te slomi.',
    'Sad imaš ime. Sad imaš početak. Ostalo je tvoje.',
    'Pre ovog ekrana — slušalac. Posle — neko ko misli da zna.'
  ],

  // ===========================================================================
  // WEEK OPEN — kad ponedeljak jutro stigne (immediate action, ne planner)
  // ===========================================================================
  week_open: [
    'Ponedeljak. Telo zna pre nego što ti kažeš.',
    'Nova nedelja. Sat nije pitao da li si spreman.',
    'Sedam dana ispred. Niko ne piše unapred za tebe.',
    'Klikni i počni. Ostalo se piše posle.'
  ],

  // ===========================================================================
  // SUPPORTIVE PHASE (nedelje 1-3)
  // ===========================================================================
  supportive_phase: [
    'Prva nedelja. Niko još ne očekuje. Ni ti ne moraš.',
    'Niko se ne pamti po prvoj nedelji. Pamti se po dvanaestoj.',
    'Sve do sad bila je vežba. Sad je tu set koji će neko da pomene.',
    'Sad si u tunelu. Svetlo nije obećanje, ali nije ni laž.'
  ],

  observation_neutral: [
    'Tri seta ove nedelje. Niko se ne seća kako je krenuo prvi.',
    'Reputaciju nosiš u tuđim telefonima. Tvoj ti je ostao tih.',
    'Pio si sa publikom. Pitanje je kad ćeš početi da piješ za nju.',
    'Šest nedelja iza, šest ispred. Pola si već.',
    'Ono što voliš da pustiš nije isto što i ono što treba da pustiš.'
  ],

  brutal_phase: [
    'Ovo nije više igra. Ovo je ono što si izabrao da budeš.',
    'Sad piše. Sad piše šta će ti pisati posle godinu dana.'
  ],

  // ===========================================================================
  // SIMPTOMATSKI ZONE — overlay posle event-a (color zone trigger)
  // ===========================================================================
  symptom_health_yellow: [
    'Telo ti je počelo da odgovara sporije. Sutra ćeš i ti.',
    'Tri noći loš san. Ogledalo i sutra govori isto.',
    'San je deo karijere. Onaj koji to ne primeti — pamti se kao dobar, ali ne dugo.'
  ],
  symptom_health_red: [
    'Došao si do publike. Do sutra još nisi.',
    'Telo ti je u zoni gde se ljudi mire da neće ustati u deset.',
    'Mlad si dok ti se to ne sruši. Onda nisi.',
    'Plan B nemaš. Telo je tvoj jedini.'
  ],

  symptom_odnosi_yellow: [
    'Majka ti je zvala pre devet dana.',
    'Tri prijatelja više nije na listi. Nisi ih izbrisao — nisi ih pozvao.',
    'Drugovima si poslednji put pisao u temi kojoj se ne sećaš.'
  ],
  symptom_odnosi_red: [
    'Niko te ne zove. Ti si misao da je to mir. Nije.',
    'Ostavili su te poslednji oni koji su ti rekli istinu pre tri godine.',
    'Sad si sam u dobrom smislu. Sutra si sam u onom drugom.'
  ],

  symptom_normalnost_yellow: [
    'Čitao si knjigu pre dva meseca. Ne sećaš se čije.',
    'Hobby slot ti je prazan šest nedelja. Ponekad je to ok. Ne sad.',
    'Pričao si o muzici 14 dana zaredom. Pitanje je da li se neko još slušao.'
  ],
  symptom_normalnost_red: [
    'Sve što radiš je muzika. Pitanje je koga to interesuje osim tebe.',
    'Identitet ti je polica sa pločama. Polica može da padne.',
    'Kad si poslednji put bio bez slušalica i bez razloga?'
  ],

  // ===========================================================================
  // SET QUALITY
  // ===========================================================================
  set_high: [
    'Pustio si set kakav nisi očekivao da hoćeš.',
    'Sala te je držala ovaj put. Sledeći put ti drži nju.',
    'Sada znaš kako zvuči kad si bio tu. Pamti.'
  ],
  set_low: [
    'Publika oseti. Nisi morao da im kažeš.',
    'Ovo nije bio tvoj set. Pitanje je šta ga je odvelo od tebe.',
    'Plejao si za sebe. Sala je to videla.'
  ],

  // ===========================================================================
  // REPUTATION EVENTS
  // ===========================================================================
  rep_event_positive: [
    'Stari rezident te je primetio. Pamti i one koji nisu primećeni.',
    'Booker je gledao set. Ne mora se javiti da znači.',
    'Neko ti je seo na bar i pitao gde su drugi tvoji setovi.'
  ],
  rep_event_negative: [
    'Neko te je preporučio. Onaj kome je preporučio nije zvao.',
    'Ime ti je palo. Ne znaš čije usne, znaš da je palo.'
  ],

  // ===========================================================================
  // RECOGNIZABILITY DECAY (normalnost low)
  // ===========================================================================
  rec_decay: [
    'Niko te ne pominje već dve nedelje. Ne zato što si nestao — zato što više nema gde.',
    'Bio si u priči. Sad si u fusnoti.',
    'Ono što te je činilo prepoznatljivim sad zvuči kao svi ostali.'
  ],

  // ===========================================================================
  // BOOZE / NAVIKE
  // ===========================================================================
  apstinent_reflection: [
    'Bio si jedini trezni u sobi. Šta si video što ostali nisu.',
    'Ne piješ godinama. Niko te zbog toga ne pamti. Pitanje koje ne mora odgovor.'
  ],
  alcohol_problem: [
    'Pijan DJ pamti dobre noći. Trezna publika pamti loše setove.',
    'Pivo nije izdaja. Drugo te nije lagalo. Petnaesto te je već deceniju uvuklo.'
  ],

  // ===========================================================================
  // RECOVERY SLOT (S2)
  // ===========================================================================
  recovery_tisina: [
    'Bio si bez zvuka 48 sati. Sad ti se vraća sluh za ono što nisi čuo.',
    'Tišina nije pauza. Tišina je sluh koji se vraća.'
  ],
  recovery_integration: [
    'Tri dana razgovora sa sobom. Sad znaš šta si nosio bez da znaš.',
    'Ono što si nedelju dana radio — to si ti ili to nije ti. Sad razlikuješ.'
  ],
  recovery_reality: [
    'Telefonski razgovor sa nekim ko ne zna ko je tvoj rezidens. Ozdravljaš.',
    'Pričao si o nečemu što nije muzika 40 minuta. Telo ti je bilo zahvalno.'
  ],

  // ===========================================================================
  // ZOVI ČOVIKA (S2 — substance call)
  // ===========================================================================
  zovi_covika_first: [
    'Zvao si ga. Niko te nije terao. Ovo je tvoja odluka.',
    'On uvek odgovori. Pitanje je da li ti uvek treba.'
  ],
  zovi_covika_repeat: [
    'Treći put ove nedelje. Pamti broj.',
    'Sad je rutina. Rutina ima cenu koja nije u parama.',
    'Više ga zoveš nego majku. Pitanje koje ne traži odgovor.'
  ],

  // ===========================================================================
  // SUBSTANCE COMPOUND (poly use)
  // ===========================================================================
  compound_warning: [
    'Tri komada u krvi. Telo broji čak i kad ti ne brojiš.',
    'Compound nije sabiranje. Compound je novi prostor u kome nisi bio.',
    'Sad ti telo radi matematiku koju ti nećeš razumeti dok ne stigne.'
  ],

  // ===========================================================================
  // CASCADE / HARD FAIL
  // ===========================================================================
  cascade_warning: [
    'Tri stuba se ljuljaju. Trećina od jednog je dovoljna da krene.',
    'Sad biraš koji ćeš da ispustiš. Posle te neće niko pitati.'
  ],

  // ===========================================================================
  // FINALE / WEEK 12
  // ===========================================================================
  finale_neutral: [
    'Sezona je gotova. Pitanje je da li si ti.',
    'Dvanaest nedelja. Tri imena će se setiti. Pet će zaboraviti.',
    'Sad imaš priču. Sledeća sezona je pitanje da li je još ista.'
  ],

  // ===========================================================================
  // EVENT TRIGGERS — immediate action loop (Pera v3, 2026-05-12)
  // ===========================================================================
  // Per Dule Mitigacija C (frequency cap 1 per 30-45min internal, topic rotation,
  // soft pause posle event-Pera). Per Iskra concept gameplay-loop-rework sekcija 6.
  // Per Mile GDD sekcija 8 (substance) + sekcija 6 (gig nights).
  // ===========================================================================
  event_triggers: {

    // -------------------------------------------------------------------------
    // V1 PROMO — per-akcija success/fail/stale
    // -------------------------------------------------------------------------
    action_promo_success: [
      'Tri lajka u prvom satu. Isti broj kao kad si ćutao.',
      'Insta priča ne broji u jutro. Algoritam pamti samo večeru.',
      'Stavio si lice gore. Pitanje je da li te traže ili samo gledaju.',
      'Stigao je do njih. Ne znaš kojih.'
    ],
    action_promo_fail: [
      'Niko se nije javio. Telefon ne laže.',
      'Reel je gledalo manje ljudi nego što ima u tvojoj fioci.',
      'Ad spend je legao u prazan plato.',
      'Pisalo je u prazno. Feed se okrenuo dva sata posle tebe.'
    ],
    action_promo_stale: [
      'Iste pose, iste oči. Sledeći put pokušaj nešto što te boli.',
      'Pet postova istih reči. Telo gledaoca vidi pre nego što oko stigne.',
      'Promo bez novosti je dnevnik koji niko ne otvori.'
    ],

    // -------------------------------------------------------------------------
    // V2 MUSIC RESEARCH — dud / breakthrough
    // -------------------------------------------------------------------------
    action_music_breakthrough: [
      'Ploča ti je sela u stomak pre nego što ti je dotakla uvo.',
      'Jedna kompozicija ti je rekla nešto što tri nedelje nisu mogle.',
      'Sad imaš zvuk koji niko drugi nema. Pitanje je da li ćeš se setiti odakle.',
      'Nešto u tom redu nota ti je otvorilo prozor. Sutra je ti.'
    ],
    action_music_dud: [
      'Dva sata digovanja, nula plus.',
      'Sve te ploče zvuče kao prethodne. Možda si ti.',
      'Vinyl shop ti je pojeo pare i sat. Ostala ti je torba i ćutanje.',
      'Soundcloud feed ti je pružio ono što već imaš tri puta.'
    ],

    // -------------------------------------------------------------------------
    // V3 KNOWLEDGE — insight / mentorship reflection / dud
    // -------------------------------------------------------------------------
    action_knowledge_insight: [
      'Stranice gledaju iz tebe sad. Knjiga ti dotakla nešto.',
      'Jedan red ti je premestio nešto u glavi. Ne znaš još šta.',
      'Posle ovog pasusa, slušaš drugačije.',
      'Doc film ti je rekao staru priču. Sad je tvoja.'
    ],
    action_knowledge_mentor: [
      'Stariji ti je rekao u tri rečenice ono što si tražio tri meseca.',
      'On zna jer je grešio. Pitanje je da li ti smeš isti put.',
      'Ručao si sa nekim ko je ostao u igri dvadeset godina. To se ne kupi.'
    ],
    action_knowledge_dud: [
      'Podcast ti je pao iz uha posle pet minuta. Telo zna kad nije telo.',
      'Knjiga ti se otvorila na strani gde već znaš sve. Ne ide ti danas.'
    ],

    // -------------------------------------------------------------------------
    // V4 MIXING — improvement / regression
    // -------------------------------------------------------------------------
    action_mixing_improvement: [
      'Vežbu osećaš u prstima. Sutra ne moraš da misliš na to.',
      'Tranzicija ti je sela ovaj put. Telo pamti.',
      'Beatmatching ti se uvukao u disanje. Brojiš bez brojanja.',
      'Sad ti decka rade umesto tebe. To se ne dešava preko noći — dešava se posle tri sata noći koju nisi spavao.'
    ],
    action_mixing_regression: [
      'Sat vežbe, dva koraka unazad. Telo te traži.',
      'Ruka ti se trese više nego pre nedelje. Pitanje koje si potisnuo.',
      'Studio sesija ti je danas zvučala kao tuđa. Verovatno jeste.'
    ],

    // -------------------------------------------------------------------------
    // V5 IZGLED — vanity moment
    // -------------------------------------------------------------------------
    action_izgled_vanity: [
      'Frizer te je novim glavom poslao u sobu. Sutra će ti reći ko si.',
      'Garderoba ti je oduzela dve plate. Pitanje je da li su ti dale nešto što si do sad nemao.',
      'Foto sesija ti je dala lice koje će neko da pamti. Pamti i kad pita ko si.',
      'Fitness session, sat na trenažeru. Telo te ne laže.'
    ],

    // -------------------------------------------------------------------------
    // V6 SCENE PRESENCE — networking / mingling outcomes
    // -------------------------------------------------------------------------
    action_scene_networking_success: [
      'Razgovor ti je rekao nešto što nije pitao za odgovor.',
      'Stao si pored nekoga ko te nije morao da pozdravi.',
      'Mingling ti je dao dva broja i jedan razlog za sutra.',
      'Crew te je primio za sto. Bez pitanja, što je glasnije od pitanja.'
    ],
    action_scene_networking_dud: [
      'Stajao si dva sata. Niko nije pitao šta puštaš.',
      'Krug se zatvorio bez tebe. Sutra je drugi krug.',
      'Pratio si razgovor koji se ne tiče tebe. Energija ti je otišla.'
    ],

    // -------------------------------------------------------------------------
    // V7 FINANSIJE — gig book / sponsor / šljakanje
    // -------------------------------------------------------------------------
    action_fin_gig_booked: [
      'Klub te je primio. Pamti broj — sutra je drugačiji.',
      'Pozvali su te. Pitanje je da li si ti ili je booker bio mamuran.',
      'Cifra ti stigla bez pregovora. Znači da treba sledeći put više.'
    ],
    action_fin_sponsor: [
      'Brend ti je rekao da ćeš zarađivati. Pamti ko ti je platio prvo pivo.',
      'Sponsor pismo ti je palo u inbox. Otvori ga kad budeš sam.'
    ],
    action_fin_sljakanje: [
      'Sedam sati za platu koja je tek za pivo i kartu.',
      'Šljakanje ti je oduzelo dan. Vratilo ti dostojanstvo.',
      'Radio si dok su drugi diggovali. Pitanje koje neko mora da postavi.',
      'Sad imaš pare i kičmu. Veza je tvoja.'
    ],

    // -------------------------------------------------------------------------
    // V8 ENERGIJA — siesta / hobby / sleep
    // -------------------------------------------------------------------------
    action_energy_siesta: [
      'Dva sata mira u sredini dana. Niko ti to nije propisao osim tela.',
      'Spavao si kad su drugi pričali. Snovi su ti rekli šta da pustiš.'
    ],
    action_energy_hobby: [
      'Tri sata sa nečim što nije muzika. Knjiga, lopta, ribljak — svejedno.',
      'Hobi te vratio u nešto što si bio pre pulta.',
      'Sad si bio neko ko nije DJ. Vrati se sutra sa novim ušima.'
    ],
    action_energy_sleep: [
      'Osam sati. Telo te je naučilo da ima cenu kad se ne plaća.',
      'Spavao si bez slušalica. Sutra ti ne dolazi sa istom težinom.'
    ],

    // -------------------------------------------------------------------------
    // V9 RECKLESS — signature risk
    // -------------------------------------------------------------------------
    action_reckless_signature: [
      'Crafted si signature ploču. Sutra ćeš znati da li je tvoja ili pozajmica.',
      'Risk research te je odveo u retku ploču. Sad ti je u torbi — i pitanje.',
      'Sad imaš oružje za sledeću subotu. Možda i protiv sebe.',
      'A/B test ti je rekao šta ne ide. To je veće od šta ide.'
    ],

    // -------------------------------------------------------------------------
    // GIG NIGHT — dan-of-week success / fail
    // -------------------------------------------------------------------------
    gig_utorak_success: [
      'Utorak. Trideset ljudi. Niko se ne uda za tebe te noći, ali jedan te neće zaboraviti.',
      'Mali kafić ti je dao prvu klimu. Telo zna kad sala diše.',
      'Utorkom se ne pravi karijera. Utorkom se pravi telo za petak.'
    ],
    gig_utorak_fail: [
      'Mali klub, mala očekivanja, manji set. Niko te ne pita za sutra.',
      'Utorak ti je oduzeo veče za novac koji nije za pivo.'
    ],
    gig_sreda_success: [
      'Sreda, klub C, publika koja sluša prvi takt. Pamti kako si započeo — sutra će neko da pita.',
      'Sredinom nedelje sala ima drugi puls. Ti si ga osetio.',
      'Bookera te je gledao iz ćoška. Ne mora da prilazi da bi pamtio.'
    ],
    gig_sreda_fail: [
      'Sreda nije bila tvoja. Plej-lista ti je bežala iz ruke.',
      'Klub C te je primio i pustio. Razlog ne znaš još.'
    ],
    gig_cetvrtak_success: [
      'Četvrtak, klub B, crew je seo pored pulta. Sad si bio za njih.',
      'Reputation ti je radila pre tebe. Posle seta to znaš.',
      'Četvrtak je tvoj dan. Možda zato što niko drugi ne brani.'
    ],
    gig_cetvrtak_fail: [
      'Čet je tražio od tebe više nego što si nosio.',
      'Klub B te primio na pola. Booker neće zvati sledeće dve nedelje.'
    ],
    gig_petak_success: [
      'Petak, klub A, dvesta ljudi su znala čije je veče. Tvoje je sad.',
      'Premium veče ti je dalo cifru koja se pamti.',
      'Petak ti je dao publiku koju nije morao niko da pozove.'
    ],
    gig_petak_fail: [
      'Petak te skratio. Sala je odlazila pre kraja.',
      'A-tier klub te ne uvodi dva puta zaredom. Idi kući i misli.'
    ],
    gig_subota_success: [
      'Subota. Premium veče. Sad imaš noć koja se pamti dvanaest nedelja.',
      'Sala te je nosila. Pitanje je da li ti je sutra dala mir ili glad.',
      'Najveća publika ti je dala najveću tišinu posle. Drži se te tišine.',
      'Subota je prošla. Sad si tu kuda si gledao osam nedelja.'
    ],
    gig_subota_fail: [
      'Subota te je iznajmila. Više se ne vraćaš na nju brzo.',
      'Premium noć je pamtila set koji nije bio tvoj.',
      'A-tier prime ti je pokazao gde si. Sad piše.'
    ],
    gig_miss: [
      'Telefon nije zvonio. Subota je.',
      'Sala neće biti tvoja ovaj put. Sutra je ti.',
      'Niko te nije zvao. Pamti ko jeste, ne ko nije.'
    ],

    // -------------------------------------------------------------------------
    // COOLDOWN GRAY-OUT — spam pokušaj, shake response (free, ne troši sat)
    // -------------------------------------------------------------------------
    cooldown_promo_blocked: [
      'Već si objavio. Algoritam te ne voli više.',
      'Insta ti je rekao dosta. Sutra je drugi feed.',
      'Reel ti čeka dva segmenta. Ne juri pre sebe.',
      'DM lista ti je sveža. Pusti je da odradi posao.'
    ],
    cooldown_izgled_blocked: [
      'Frizer ne radi noću. Sutra.',
      'Iste pose, iste oči. Sledeća foto je za tri nedelje.',
      'Garderoba ti je sveža. Ne kupuje se ista jakna dva puta u nedelji.',
      'Fitness ti je telo dao danas. Daj mu jutro.'
    ],
    cooldown_money_blocked: [
      'Money ne magičan dvogled. Ad spend ima krov.',
      'Sponsor ti se neće javiti dva puta u istoj nedelji.'
    ],
    cooldown_scene_blocked: [
      'Već si bio tu večeras. Ekipa te ne čeka tri puta isto veče.',
      'Guest set ti je odsviran. Sledeći te zovu kad zaborave i sete se.'
    ],

    // -------------------------------------------------------------------------
    // PATH LEAN THRESHOLD — wk 4 (emerge) + wk 7 (mature) per Nega pacing
    // -------------------------------------------------------------------------
    path_lean_selektor_wk4: [
      'Trkaš ka publici sa kompletom koji je već znao kako se zove. Drugi te zovu profesionalcem pre nego što si rekao.'
    ],
    path_lean_selektor_wk7: [
      'Imam te u uvu — kažu drugi. Sad znaš zašto te zovu drugi put.'
    ],
    path_lean_faca_wk4: [
      'Frizer, garderoba, foto. Telo ti je postalo brand. Pitanje koje nećeš sebi.'
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
      'Pare ti se nakupljaju. Pitanje je kojim plate-om plaćaš.'
    ],
    path_lean_promoter_wk7: [
      'Postao si neko ko broji pre nego što pusti. Subota te zove. Pamti šta ne zoveš.'
    ],
    path_lean_andergraund_wk4: [
      'Skupljaš ploče sporo, ćutiš ih duže. Crna trkačka stezna te traži.'
    ],
    path_lean_andergraund_wk7: [
      'Andergraund te primio bez aplauza. Pitanje je da li te primio ili te krije.'
    ],
    path_lean_prkosni_wk4: [
      'Riskuješ ploču svake nedelje. Sala ti to još oprašta.'
    ],
    path_lean_prkosni_wk7: [
      'Sad si onaj koji ulazi sa retkim. Pitanje je da li biraš ti ili rizik bira tebe.'
    ],

    // -------------------------------------------------------------------------
    // FIRST-RUN ONBOARDING — prvi 3 klika (Dule Mitigacija D)
    // Numerik balon overlay paralelno, ovo je telesni layer
    // -------------------------------------------------------------------------
    onboarding_click_1: [
      'Prvi klik. Sat ti je krenuo. Ono što odeš sad — ne vraća se.'
    ],
    onboarding_click_2: [
      'Drugi klik. Telo počinje da prati. Stat strune ti se trzaju — to si ti, ne sistem.'
    ],
    onboarding_click_3: [
      'Treći klik. Sad razumeš kako diše. Brojevi se sklanjaju, sluh ostaje.'
    ],

    // -------------------------------------------------------------------------
    // WALL-CLOCK NUDGE — 25+ akcija u real-time sesiji (Dule Mitigacija E)
    // Indistractable stil — observation, ne kazna, ne block
    // -------------------------------------------------------------------------
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
// CONTEXT-AWARE PICKER
// =============================================================================
// Event-trigger format: "event:<key>" — npr. "event:gig_subota_success",
//   "event:cooldown_promo_blocked", "event:path_lean_andergraund_wk7"
// Legacy context (v2): direktni ključ (npr. "supportive_phase", "set_high")
// =============================================================================
export function selectAforizam(state, context) {
  const week = state ? state.week : 1;
  const bank = AFORIZMI;

  // Event-trigger prefix routing (v3 immediate action)
  if (typeof context === 'string' && context.startsWith('event:')) {
    const key = context.slice(6);
    if (bank.event_triggers && bank.event_triggers[key]) {
      return pick(bank.event_triggers[key]);
    }
    // Fallback ako event key fali — observation_neutral, ne kazna
    return pick(bank.observation_neutral);
  }

  // Direct context match (v2 legacy)
  if (bank[context]) return pick(bank[context]);

  // Context-with-zone mapping
  if (context === 'symptom' && state) {
    const lowest = lowestSymptom(state);
    if (lowest.zone === 'red') return pick(bank[`symptom_${lowest.key}_red`] || bank.symptom_health_red);
    if (lowest.zone === 'yellow') return pick(bank[`symptom_${lowest.key}_yellow`] || bank.symptom_health_yellow);
  }

  // Substance — Zovi covika repeat?
  if (context === 'zovi_covika' && state) {
    const total = state.substance?.zovi_covika_total || 0;
    if (total <= 1) return pick(bank.zovi_covika_first);
    return pick(bank.zovi_covika_repeat);
  }

  // Set quality
  if (context === 'set_high') return pick(bank.set_high);
  if (context === 'set_low')  return pick(bank.set_low);
  if (context === 'rep_event_positive') return pick(bank.rep_event_positive);
  if (context === 'rep_event_negative') return pick(bank.rep_event_negative);

  // Drinking
  if (context === 'alcohol_problem') return pick(bank.alcohol_problem);
  if (state && state.apstinent && context === 'reflection') return pick(bank.apstinent_reflection);

  // Phase-based fallback
  if (week <= 3) return pick(bank.supportive_phase);
  if (week <= 9) return pick(bank.observation_neutral);
  if (week <= 12) return pick(bank.brutal_phase || bank.observation_neutral);

  return pick(bank.observation_neutral);
}

function lowestSymptom(state) {
  const s = state.sacrifice || {};
  const arr = [
    { key: 'health',     val: s.health ?? 100 },
    { key: 'odnosi',     val: s.odnosi ?? 100 },
    { key: 'normalnost', val: s.normalnost ?? 100 }
  ];
  arr.sort((a, b) => a.val - b.val);
  const low = arr[0];
  let zone = 'green';
  if (low.val < 30) zone = 'red';
  else if (low.val < 60) zone = 'yellow';
  return { key: low.key, val: low.val, zone };
}

function pick(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

// Back-compat alias za stari placeholder import path
export const AFORIZMI_PLACEHOLDER = AFORIZMI;

export const TOTAL_COUNT = Object.values(AFORIZMI).reduce((sum, val) => {
  if (Array.isArray(val)) return sum + val.length;
  if (val && typeof val === 'object') {
    // nested (event_triggers) — sum over inner arrays
    return sum + Object.values(val).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  }
  return sum;
}, 0);
