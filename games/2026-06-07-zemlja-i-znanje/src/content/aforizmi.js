/**
 * aforizmi.js — Mikro-aforizmi u stilu Pera Period
 * Telesni, regionalni, filozofski, kratki, share-friendly
 */

export const AFORIZMI = [
  "Nema zanata bez greške — ima zanata bez predaje.",
  "Zemlja pamti svaki alat koji joj je pokazan.",
  "Dobra radionica počinje tišinom, a završava pesmom.",
  "Ko zna zašto, naučiće i kako.",
  "Kiša nije prepreka — to je lekcija koja dolazi neplanirano.",
  "Svaki polaznik koji ode zna nešto što ti nisi mogao da naučiš u knjizi.",
  "Čovek koji radi i čovek koji gleda — između njih stoji jedan alat.",
  "Suvozid traje duže od brige — ali briga ga gradi.",
  "Niko ne dolazi na imanje da čuje teoriju. Dolaze da osete materijal.",
  "Lošeg učitelja prepoznaš po umoru polaznika.",
  "Kad zemlja vlažna, ruke suše znanje.",
  "Skupo nije cena — skupo je kad ne vredi.",
  "Reputacija je suma svakog rukoveta koji si dignuo sa poda.",
  "Pečurka raste u mraku, ali cveta na svetlu dobrog znanja.",
  "Radionica bez incidenta nije imala pravu grupu.",
  "Ono što rukom napraviš, srcem zadrži.",
  "Svaka sezona nauči nešto što plan nije predvideo.",
  "Energija grupe jača je od energije učitelja.",
  "Kada polaznik postavi pravo pitanje, sezona je već uspela.",
  "Priroda ne pravi grešku — ona samo čeka da je pitaš."
];

/** Aforizmi za incident resolve (pozitivni ishodi) */
export const AFORIZMI_INCIDENT_RESOLVE = [
  "Svaka prepreka je test — ne kazna.",
  "Dobar tim rešava problem pre nego što postane priča.",
  "Incident nije neuspeh — neodlučnost jeste."
];

/** Aforizmi za prestiž reset */
export const AFORIZMI_PRESTIGE = [
  "Početi iznova nije poraz — to je zrelost.",
  "Svaki novi krug nosi mudrost prethodnog.",
  "Zemlja se obrće — i mi se vraćamo, ali ne isti."
];

/** Aforizmi za season end */
export const AFORIZMI_SEASON_END = [
  "Sezona je završena. Zemlja pamti šta ste uradili.",
  "Polaznici odlaze sa rukama koje znaju više od reči.",
  "Svaka sezona je rečenica u dužoj priči."
];

/** Random aforizem iz skupa */
export function getAforizem(set = 'main') {
  const sets = {
    main:     AFORIZMI,
    incident: AFORIZMI_INCIDENT_RESOLVE,
    prestige: AFORIZMI_PRESTIGE,
    season:   AFORIZMI_SEASON_END
  };
  const arr = sets[set] || AFORIZMI;
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Sekvencijalni aforizem (rotira bez ponavljanja) */
let _mainIdx = 0;
export function nextAforizem() {
  const a = AFORIZMI[_mainIdx % AFORIZMI.length];
  _mainIdx++;
  return a;
}
