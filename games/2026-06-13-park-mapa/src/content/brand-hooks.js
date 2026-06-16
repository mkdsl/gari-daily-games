export const MKDSLEND_LORE = [
  'MKDSLend nije samo park. To je ideja koja čeka pravo vreme.',
  'Svaki ugao MKDSLend-a priča svoju priču.',
  'Park je nastao iz sna da se radi i živi na istom mestu.',
  'MKDSLend: Zabavni radni park koji se gradi svaki dan.',
  'Svaka zona je poglavlje u istoriji koja se još piše.',
  'Ovde se eksperimentiše. Ovde se greši. Ovde se uči.',
  'Parkovi prolaze. MKDSLend ostaje.',
  'Ideja za MKDSLend je stara. Izvedba počinje sada.',
  'Svaki posetilac je deo projekta, svesno ili ne.',
  'MKDSLend: gde rad i igra gube granicu.'
];

export const KLUBOSLAVIJA_LORE = [
  'Kluboslavija 2026: turneja koja spaja gradove muzikom.',
  'Avala, Štrand, Sarajevo, Guncati — četiri poglavlja.',
  'Svaki Klub nastup je i nastup za ono što dolazi.',
  'Bina je ista svuda. Masa je uvek drugačija.',
  'Kluboslavija: ne idete na koncert. Idete kući.'
];

export const GUNCATI_LORE = [
  'Guncati: tu se zemlja obrađuje i zvuk neguje.',
  'Grand finale Guncati. Sve ceste vode tamo.',
  'Staklenici čekaju. Biljke rastu. Plan se izvršava.'
];

export function getRandomMKDSLendLore() {
  return MKDSLEND_LORE[Math.floor(Math.random() * MKDSLEND_LORE.length)];
}

export function getRandomKluboslavijaLore() {
  return KLUBOSLAVIJA_LORE[Math.floor(Math.random() * KLUBOSLAVIJA_LORE.length)];
}

export function getKluboslavijaHook() {
  // Returns the Avala exclusive hook if in avala week
  const avalaDate = new Date('2026-06-20');
  const now = new Date();
  const diffDays = Math.abs(now - avalaDate) / (1000 * 60 * 60 * 24);
  if (diffDays <= 3) {
    return {
      type: 'avala_exclusive',
      text: 'Avala Run — 20. jun 2026. Bina čeka. Bilet: app.bilet.rs/show/261',
      url: 'https://app.bilet.rs/show/261',
      urgent: diffDays <= 1
    };
  }
  return {
    type: 'upcoming',
    text: 'Kluboslavija turneja 2026. Avala, Štrand, Sarajevo, Guncati.',
    url: null,
    urgent: false
  };
}

export function getBrandTextForZone(zoneId) {
  const brandMap = {
    pult:       'DJ za Pultom v2 — MKDSLend brand story.',
    bina:       'Kluboslavija Avala 2026 — event companion.',
    suma:       'Guncati — povratak na selo. Šuma pamti.',
    staklenici: 'Guncati staklenici — Sezona 2. Uskoro.',
  };
  return brandMap[zoneId] || 'MKDSLend Park — Zabavni radni park.';
}
