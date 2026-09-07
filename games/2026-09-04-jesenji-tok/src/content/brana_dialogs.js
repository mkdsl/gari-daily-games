/**
 * @module brana_dialogs
 * Brana's voice: end-of-season verdicts, weather commentary, achievement messages,
 * and educational tooltip content.
 *
 * Brana Barakonja is the player character — a seasoned permaculture farmer.
 * His commentary is terse, wise, and occasionally melancholic — the voice of
 * someone who has seen many seasons turn.
 */

// ─── End-of-Season Verdicts ───────────────────────────────────────────────────

/**
 * Brana's post-season verdicts keyed by rank id.
 * Displayed on the score screen after bura reveals the results.
 * @type {Record<string, string>}
 */
export const BRANA_DIALOGS = {
  savrsena:
    'Savršena sezona. Brana bi bio ponosan. Zemlja pamti — i nagrađuje one koji je slušaju.',
  solidna:
    'Solidna sezona. Prezimićeš. Ima još prostora za rast — sledeće proleće pokušaj ekosistem bonus.',
  preziveces:
    'Preživećeš. Proleće će biti teže. Jedan propušten prozor košta — ali zemlja oprašta ako se vratiš.',
  propala:
    'Zemlja nije zaboravila — ali ti si. Pokušaj ponovo od nule — svaka sezona je nova lekcija.',
};

/**
 * Extended verdicts — longer versions for score screens with more space.
 * @type {Record<string, string[]>}
 */
export const BRANA_VERDICTS_EXTENDED = {
  savrsena: [
    'Savršena sezona.',
    'Svaki zadatak u svom prozoru. Ekosistem radi. Brana ćuti — ni reč nije potrebna.',
    'Zemlja te prepoznaje.',
  ],
  solidna: [
    'Solidna sezona.',
    'Nisi pogodio sve, ali si pogodio ono što je važno.',
    'Sledeća sezona: gledaj ekosistem bonus — Micelij, Jezero, Kompost zajedno.',
  ],
  preziveces: [
    'Preživećeš.',
    'Proleće dolazi bez zaleta.',
    'Koji prozor si propustio? Idi nazad i pogledaj — zemlja ne laže.',
  ],
  propala: [
    'Ova sezona je izgubljena.',
    'Ali gubiti je deo učenja.',
    'Sledeći put: počni sa Ozozmom i Suvozid-om — oni imaju najuži prozor.',
  ],
};

// ─── Intro Text ───────────────────────────────────────────────────────────────

/**
 * Brana's intro monologue shown at game start.
 */
export const BRANA_INTRO =
  '12 nedelja pre zime. 6 parcela. 3 radne grupe nedeljno. Svaki zadatak ima svoj prozor — pogodi ga, i zemlja ti vrati duplo.';

/**
 * Short Brana quips shown when player first opens the game (before FTUE).
 * @type {string[]}
 */
export const BRANA_FIRST_WORDS = [
  'Brana kaže: jesen ne čeka.',
  'Zemlja ima pamćenje. Plan ima smisao.',
  '12 nedelja. Koliko ih znaš da iskoristiš?',
];

// ─── Weather Comments ─────────────────────────────────────────────────────────

/**
 * Brana's comment at game start based on the weather preset.
 * Shown in the intro message.
 * @type {Record<string, string>}
 */
export const WEATHER_COMMENTS = {
  suva_jesen:
    'Suva jesen — retka milost. Svaki prozor je otvoren. Ne prokockaj je.',
  kisna_jesen:
    'Kiša stiže. Gradnja u vlazi ne valja — pazi na suvi prozor za Suvozid.',
  rani_mraz:
    'Mraz stiže ranije ove godine. Micelij i Rezidba — pohuri se, prozor se zatvara.',
  vatreno_lisce:
    'Topli dani u avgustu. Ozimo ima malo više vremena. Kompost — ne čekaj toplinu, ona kvari.',
};

/**
 * Extended weather commentary shown in the forecast header.
 * @type {Record<string, { title: string, detail: string }>}
 */
export const WEATHER_EXTENDED = {
  suva_jesen: {
    title: 'Suva jesen',
    detail: 'Nema kiše, nema mraza. Idealni uslovi za sve zadatke. Maksimalni score je dosegljiv.',
  },
  kisna_jesen: {
    title: 'Kisna jesen',
    detail: 'Kiša stiže u 3 uzastopne nedelje negde u N1–N8. Suvozid ne može u kišu — proveri prognozu pre dodele.',
  },
  rani_mraz: {
    title: 'Rani mraz',
    detail: 'Mraz od N10. Micelij i Rezidba imaju skraćen prozor — N9 je poslednja šansa. Planiranje mora biti ranije.',
  },
  vatreno_lisce: {
    title: 'Vatreno lišće',
    detail: 'Vruće N1–N2. Ozimo ima +1 nedelju prozora. Kompost u vrućini gubi 10% poena — planiraj ga posle N2.',
  },
};

// ─── Achievement Messages ─────────────────────────────────────────────────────

/**
 * Toast messages shown when achievements are unlocked.
 * Should be brief enough to fit in a single line.
 * @type {Record<string, string>}
 */
export const ACHIEVEMENT_MSGS = {
  ekosistem_bonus:
    '🌿 Ekosistem bonus! Micelij, Jezero i Kompost — sve u prozoru. Zemlja diše.',
  savrsena_sezona:
    '🌟 Savršena sezona! Sve šest u prozoru. Legendarno.',
  prestige_3:
    '🏅 Tri prestiža. Ti nisi tek farmer — ti si majstor sezona.',
  first_assign:
    '🌱 Prva dodela. Zemlja gleda.',
  no_weather_block:
    '☀️ Nijedan posao blokiran kišom. Sreća ide onima koji planiraju unapred.',
  under_600_first:
    '📚 Ispod 600. Ali si završio — a to je početak.',
  eco_without_forecast:
    '🦉 Ekosistem bez pune prognoze. Pravo seosko osećanje.',
  all_tasks_week1:
    '⚡ Sve u prvih 5 nedelja. Ili si genije, ili smeš od brzine.',
};

// ─── Hint Strings ─────────────────────────────────────────────────────────────

/**
 * Brana's in-game hints shown when player has been idle for a while.
 * @type {string[]}
 */
export const BRANA_HINTS = [
  'Tapni karticu, pa tapni ćeliju — to je sve.',
  'Ozimo i Suvozid imaju najuži prozor. Rasporedi ih prve.',
  'Ekosistem bonus: Micelij + Jezero + Kompost sva tri u prozoru = ×1.5.',
  'Kiša blokira jedino Suvozid i tarabe. Ostalo radi po vlazi.',
  'Mraz od N10 skraćuje Micelij i Rezidbu. Pazi na prognozu.',
  'Kapacitet je 3 grupe nedeljno. Micelij košta 2 — pazi gde ga stavljaš.',
  'Broj 1–6 na tastaturi bira zadatak direktno.',
  'Tap iste kartice ponovo = deselektuj.',
];

// ─── Educational Tooltips ─────────────────────────────────────────────────────

/**
 * Full educational tooltip content for each task.
 * Shown when player taps the ⓘ button on a task card.
 * @type {Record<string, { title: string, body: string, tip: string }>}
 */
export const TASK_INFO = {
  micelij: {
    title: 'Micelij inokulacija',
    body: 'Bukovač inokulacija traži hlad i vlagu jeseni. Van avgusta–oktobra, micelijum ne stiže da se etablira pre mraza. Berba ide kroz novembar i decembar. Inokulacija zakasni li, pečurke ne niču do proleća.',
    tip: 'Šumske parcele imaju prirodnu zaštitu od mraza — ali samo ako sadeš na vreme. Ide uz Jezero i Kompost za Ekosistem bonus.',
  },
  ozimo: {
    title: 'Ozimo žito',
    body: 'Seje se do 20. septembra. Posle toga zemlja se hladi, klijanje kasni, a prinos pada za 30–50%. Žetva je sledeće proleće. Semenke trebaju minimalno 3 nedelje da ukorene pre zime.',
    tip: 'Što ranije u avgustu, to bolje — ali zemlja mora biti pripremljena. Vatreno lišće mu daje +1 nedelju prostora.',
  },
  jezero: {
    title: 'Jezero zimska priprema',
    body: 'Ribe prezimljuju bolje uz oktobarska i novembarska aeracija. Kiseonik pada pod ledom ako ne postaviš airetor na vreme. Bez pripreme, riblje stado se smanjuje za 30–60% do proleća. Priprema uključuje i čišćenje obala.',
    tip: 'Prozor N6–N11 je širok — ali kasnija dodela znači lošije oksigenisanje pre zamrzavanja. Ide uz Micelij i Kompost.',
  },
  graditeljski: {
    title: 'Suvozid i tarabe',
    body: 'Kamen i malta ne drže u vlazi. Suvi prozor avgusta i septembra (N1–N6) je jedini pravi. Dockan kišni rad pravi pukotine do proleća, i sav posao ide ponovo. Suvozid (bez malte) je malo otporniji, ali i njemu treba suvo.',
    tip: 'Ako kiša stigne pre nego završiš, stani — šteta od loše gradnje je skuplja od čekanja. Blokira se kišom automatski.',
  },
  rezidba: {
    title: 'Zimska rezidba',
    body: 'Reže se posle prvih mrazeva, pre dubokog mirovanja voćnjaka. Prozor: 15. septembra – 31. oktobra. Prerana rezidba izlaže rane gljivicama; kasna rezidba gubi aktivni sap. Prinos sledećeg leta pada za 20% u oba slučaja.',
    tip: 'Voćnjak koji nije rezan na vreme donosi upola manje idućeg leta. Rani mraz skraćuje ovaj prozor.',
  },
  kompost: {
    title: 'Kompost zimski',
    body: 'Fermentacija je aktivna dok temperatura drži — idealno iznad 15°C. Posle 20. oktobra mikrobi usporavaju, a gnojivo koje se fermentisalo na hladnoći ima 30–40% manju aktivnost. Minimalno 3–4 nedelje fermentacije.',
    tip: 'Tri do četiri nedelje fermentacije su minimum. Počni u avgustu — kompost je spreman u oktobru. U toplim N1–N2 ima -10% poena.',
  },
};

// ─── Prestige Voice ───────────────────────────────────────────────────────────

/**
 * Brana's first-person voice for each prestige option.
 * Shown as a subtle italic line below the option card's mechanical description.
 * @type {Record<string, string>}
 */
export const PRESTIGE_BRANA_VOICE = {
  extra_group: 'Prošle sezone mi je falilo jedno jutro. Ovaj put hoću rezervu.',
  cheap_micelij: 'Micelij oduzima previše snage — kad košta manje, sve ostalo diše.',
  full_forecast: 'Naučio sam da ne igram na sreću sa kišom. Hoću celu sliku.',
};

// ─── Agroecological Weather Advice ───────────────────────────────────────────

/**
 * Deeper agroecological advice per weather preset.
 * Double-serves as in-game dialog and Guncati edu-snippet shareable on Stories.
 * @type {Record<string, string>}
 */
export const WEATHER_AGR_ADVICE = {
  kisna_jesen:
    'Kiša u avgustu znači graditeljski radovi gotovi do 25. — uvek imam plan B.',
  suva_jesen:
    'Suva sezona: micelij inokulacija može i do kraja oktobra, jezero treba više vode.',
  rani_mraz:
    'Pazi na oklop — prognoza laže svakih 10 dana u jesen.',
  vatreno_lisce:
    'Magla ne kvasi duboko — graditeljski rade, ali kompost traži okretanje.',
};

// ─── Task Diagnostics ─────────────────────────────────────────────────────────

/**
 * Brana's diagnose messages for the "Šta je puklo" section on the score screen.
 * Placeholders: {task} = task name, {week} = week number, {pts} = lost points.
 * @type {Record<string, string>}
 */
export const BRANA_TASK_DIAGNOSE = {
  skipped: '{task} nije raspoređen — {pts}p propušteno. Zemlja ne čeka.',
  out_window: '{task} dodeljen u nedelji {week}, van prozora — {pts}p izgubljeno.',
  hot_penalty: '{task} kažnjen toplinom ranog perioda — {pts}p izgubljeno.',
};
