/**
 * @module brana_dialogs
 * Brana's end-of-season comments based on player score rank.
 * Also contains educational tooltip texts for tasks.
 */

/**
 * Brana's post-season verdicts keyed by rank id
 * @type {Record<string, string>}
 */
export const BRANA_DIALOGS = {
  savrsena:
    'Savršena sezona. Brana bi bila ponosna. Zemlja pamti — i nagrađuje.',
  solidna:
    'Solidna sezona. Prezimićeš. Ima još prostora za rast — sledeće proleće pokušaj ekosistem bonus.',
  preziveces:
    'Preživećeš. Proleće će biti teže. Jedan propušten prozor košta — ali zemlja oprašta.',
  propala:
    'Zemlja nije zaboravila — ali ti si. Pokušaj ponovo od nule — bez bonusa.',
};

/**
 * Brana's brief intro monolog shown at game start
 */
export const BRANA_INTRO =
  '12 nedelja pre zime. 6 parcela. 3 radne grupe nedeljno. Svaki zadatak ima svoj prozor — pogodi ga, i zemlja ti vrati duplo.';

/**
 * Brana's weather forecast comments per preset
 * @type {Record<string, string>}
 */
export const WEATHER_COMMENTS = {
  suva_jesen:
    'Suva jesen — retka milost. Svaki prozor je otvoren. Ne prokockaj je.',
  kisna_jesen:
    'Kiša stiže. Gradnja u vlazi ne valja — pazi na suvi prozor.',
  rani_mraz:
    'Mraz stiže ranije ove godine. Micelij i rezidba — pohuri se.',
  vatreno_lisce:
    'Topli dani u avgustu. Ozimo ima malo više vremena. Kompost — ne čekaj.',
};

/**
 * Achievement unlock messages
 * @type {Record<string, string>}
 */
export const ACHIEVEMENT_MSGS = {
  ekosistem_bonus:
    'Ekosistem bonus! Micelij, Jezero i Kompost — sve tri u prozoru. Zemlja diše.',
  savrsena_sezona:
    'Savršena sezona! Sve šest zadataka u prozoru. Legendarno.',
  prestige_3:
    'Tri prestiža. Ti nisi tek farmer — ti si majstor sezona.',
  first_assign:
    'Prva dodela. Zemlja gleda.',
  no_weather_block:
    'Nijedan posao blokiran kišom. Sreća ide onima koji planiraju unapred.',
};

/**
 * Tooltip texts for educational pop-ups on task cards
 * These give real-world context for each task's seasonal window
 */
export const TASK_INFO = {
  micelij: {
    title: 'Micelij inokulacija',
    body: 'Bukovač inokulacija traži hlad i vlagu jeseni. Van avgusta–oktobra, micelijum ne stiže da se etablira pre mraza. Berba ide kroz novembar.',
    tip: 'Šumske parcele imaju prirodnu zaštitu od mraza — ali samo ako sadeš na vreme.',
  },
  ozimo: {
    title: 'Ozimo žito',
    body: 'Seje se do 20. septembra. Posle toga zemlja se hladi, klijanje kasni, prinos pada za 30–50%. Žetva je proleće.',
    tip: 'Što ranije u avgustu, to bolje — ali zemlja mora biti pripremljena.',
  },
  jezero: {
    title: 'Jezero zimska priprema',
    body: 'Ribe prezimljuju bolje uz oktobarska/novembarska aeracija. Kiseonik pada pod ledom ako ne postaviš airetor na vreme.',
    tip: 'Preskočiš li ovu pripremu, riblje stado se prepolovi do proleća.',
  },
  graditeljski: {
    title: 'Suvozid i tarabe',
    body: 'Kamen i malta ne drže u vlazi. Suvi prozor avgusta–septembra je jedini pravi. Dockan kišni rad pravi pukotine do proleća.',
    tip: 'Ako kiša stigne pre nego završiš, stani — šteta od loše gradnje je skuplja od čekanja.',
  },
  rezidba: {
    title: 'Zimska rezidba',
    body: 'Reže se posle prvih mrazeva, pre dubokog mirovanja. Prozor: sept 15 – okt 31. Ranije ili dockan smanjuje prinos za 20% idućeg proleća.',
    tip: 'Voćnjak koji nije rezan na vreme donosi upola manje idućeg leta.',
  },
  kompost: {
    title: 'Kompost zimski',
    body: 'Fermentacija je aktivna dok temperatura drži. Posle 20. oktobra mikrobi usporavaju — prolećno gnojivo gubi moć ako kasno napraviš.',
    tip: 'Tri do četiri nedelje fermentacije su minimum. Počni u avgustu — i kompost je spreman u oktobru.',
  },
};
