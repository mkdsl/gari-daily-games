/** @fileoverview Guncati/Kluboslavija/MKDSLend narrative fragments for tooltips and ending */

/** Brand-specific narratives per brand */
export const BRAND_NARRATIVES = {
  guncati: {
    tagline: 'Guncati — Zabavni radni park povratka na selo',
    description: 'Ovo je priča o terenu, o volonterima i o muzici pod zvezdama.',
    winTexts: {
      legend: 'Guncati Grand je uspeo. Teren je živ. Tom Sawyer bi plakao od sreće.',
      decent: 'Festival je bio dobar. Guncati teren zaslužuje još jednu šansu.',
      fail: 'Teren vraća poruku. Priroda je strpljiva — i ti trebaš biti.'
    },
    tips: [
      'Wellbeing nije cena — investicija je.',
      'Tom Sawyer nije mitologija — testiraj ga iznad 60%.',
      'Pozornica je simbol. Gradi je kao legenda.'
    ]
  },
  kluboslavija: {
    tagline: 'Kluboslavija — Turneja 2026',
    description: 'Svaka igrica je koncepcija za turneju. Gradi publiku, gradi kulturu.',
    winTexts: {
      legend: 'Kluboslavija će ovo pamtiti. Avala, Štrand, Sarajevo — teren je tvoj.',
      decent: 'Dobar nastup. Ali Avala čeka nešto posebno.',
      fail: 'Klub vraća poruku. Probaj pre Guncatija grand finale-a.'
    },
    tips: [
      'Marketing bez zajednice je buka.',
      'DJ slot je ulaganje, ne trošak.',
      'Crowd cap je tvoj limit — sruši ga.'
    ]
  },
  mkdslend: {
    tagline: 'MKDSLend — Zabavni Radni Park',
    description: 'Krovni brand koji spaja Guncati i Kluboslaviju u jedan narativ.',
    winTexts: {
      legend: 'MKDSLend model potvrđen. Rad je zabava, zabava je rad.',
      decent: 'Zabavni park radi. Ali može bolje.',
      fail: 'Grad se ne gradi za jedan dan. Nastavi.'
    },
    tips: [
      'Zajednica je infrastruktura — ne opcija.',
      'Svaki volonter je čvor mreže.',
      'Reputacija se gradi sezona po sezona.'
    ]
  }
};

/** Post-finale brand hooks based on score */
export function getBrandEndingText(brand, tier) {
  const narratives = BRAND_NARRATIVES[brand];
  if (!narratives) return '';
  return narratives.winTexts[tier] || narratives.winTexts.decent;
}

/** In-game tooltip texts for each category */
export const CATEGORY_TOOLTIPS = {
  gradnja: {
    title: 'Gradnja',
    desc: 'Gradi kapacitet i infrastrukturu. Pozornica, WC, Šatre, Bar — sve kreće odavde.',
    brandHook: 'Guncati teren raste zahvaljujući fizičkom radu zajednice.'
  },
  hrana: {
    title: 'Hrana',
    desc: 'Hrana drži volontere srećnim i energičnim. WB raste, Tom Sawyer ulazi.',
    brandHook: 'Jovana bi rekla: gladna zajednica nije zajednica.'
  },
  marketing: {
    title: 'Marketing',
    desc: 'Privlači publiku i povećava prihod. Diminishing returns posle 150 GC.',
    brandHook: 'Kluboslavija živi od dobrog marketinga. Nije spam — priča je.'
  },
  zajednica: {
    title: 'Zajednica',
    desc: 'Najjači WB boost. Ekipa se oseća kao tim, ne kao radna snaga.',
    brandHook: 'MKDSLend model: zabava nastaje kada se zajednica gradi namerno.'
  }
};

/** Building brand hooks */
export const BUILDING_BRAND_HOOKS = {
  pozornica: 'Src festivala. Bez pozornice nema muzike. Bez muzike nema Guncatija.',
  wc: 'Logistika je sexy. WC blok je razlika između OK i savršenog festivala.',
  satre: 'Zaštita za sve vreme. Šatre su obećanje da brinemo o gostima.',
  bar: 'Bar je socijalno mesto. Ovde se grade prijateljstva i prihodi.',
  parking: 'Pristupačnost = više publike = više muzike = jača zajednica.'
};

/** Onboarding brand messages */
export const ONBOARDING_BRAND = {
  welcome: 'Dobro došao u Guncati Grand — festival koji gradi zajednicu.',
  week1: 'Teren je tvoj. Alociraš budžet i gradiš. Nedelja 1 od 10.',
  tom_sawyer: 'Tom Sawyer model: kad je wellbeing iznad 60%, volonteri rade za osmeh.',
  finale: 'Nedelja 10: Grand Finale. 15 minuta real-time gdje sve dolazi po račun.'
};

/** Score-based brand narratives */
export function getScoreNarrative(finalScore, state) {
  if (finalScore >= 9.0) {
    return {
      headline: '🌟 Legenda Guncatija!',
      body: 'Festival iz snova. Teren koji si zamislio — to si sada.',
      brand: 'Guncati Grand ostaje u srcima. Kluboslavija ovo želi na turneji.'
    };
  }
  if (finalScore >= 7.5) {
    return {
      headline: '🏆 Fenomenalan Festival!',
      body: 'Sve karte igrane dobro. Zajednica se oseća.',
      brand: 'MKDSLend model u akciji. Ovo je proof of concept.'
    };
  }
  if (finalScore >= 5.0) {
    return {
      headline: '😊 Dobar Festival',
      body: 'Nije legenda, ali je dobar. Naredna sezona — bolja.',
      brand: 'Teren uči. I ti uči sa njim.'
    };
  }
  return {
    headline: '🌱 Teren vraća poruku',
    body: 'Nije gotovo — ovo je početak. Svaka sezona uči.',
    brand: 'Guncati treba vizionare koji ne odustaju.'
  };
}

/**
 * Get random brand tip for week UI
 * @param {number} week
 * @returns {string}
 */
export function getWeekBrandTip(week) {
  const allTips = [
    ...BRAND_NARRATIVES.guncati.tips,
    ...BRAND_NARRATIVES.kluboslavija.tips,
    ...BRAND_NARRATIVES.mkdslend.tips
  ];
  return allTips[week % allTips.length];
}
