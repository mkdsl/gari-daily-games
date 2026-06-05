/** @module aforizmi — Pera Period mikro-aforizmi za Festival Mreža */

export const AFORIZMI = [
  'Balkan noć ne pita za dozvolu.',
  'Kada DJ ćuti, publika se priseti zašto je došla.',
  'Svaki grad pamti zvuk koji ga je prebudio.',
  'Mreža se ne pravi, plete se.',
  'Tišina pre prvog basa je najglasniji momenat.',
  'Nije važno gde si počeo — važno je čijom rukom si stisao ruku na kraju.',
  'Publika ne aplaudira teniku — aplaudira trenutku.',
  'Svaki promo flajer je obećanje. Svaki event je odgovor.',
  'Ko zna kad da spusti BPM, zna i kad da podigne sobu.',
  'Reputacija je valuta koja ne devalvira — samo se troši.',
  'Na Balkanu se ne ide na koncert. Ide se na susret.',
  'Dobra energija putuje ispred nas — loša nas čeka iza ugla.',
  'Koordinator koji ostaje nije plaćen — on veruje.',
  'Overflow nije problem. Problem je što nisi planirao za njega.',
  'Svaki grad ima svoju frekvenciju. Promoter koji je pronađe — pobeđuje.',
  'Buzz je eho onoga što si izgradio pre nego što si ušao u grad.',
  'Tri sekunde oklevanja na slideru koštaju minut raspoloženja.',
  'Iz Niša do Avale nije put — to je sazrevanje.',
  'Prestige nije nagrada za pobednike. Nagrada je znanje koje nosiš u sledeći pokušaj.',
  'Grand finale nije kraj. Guncati uvek otvara sledeće poglavlje.',
];

/** @returns {string} random aforizam */
export function randomAforizam() {
  return AFORIZMI[Math.floor(Math.random() * AFORIZMI.length)];
}
