// brand_hooks.js — Avala CTA and city flavor text

export const AVALA_CTA = {
  url: "https://app.bilet.rs/show/261",
  label: "Kupi kartu za Avalu — 20. jun",
  sublabel: "Kluboslavija | Forest Stage | 20. jun 2026.",
  threshold_score: 2500
};

export const CITY_FLAVOR = {
  avala:    "Avala čeka. Šuma polje zvuka. Proba je za noć — prava stvar je 20. jun.",
  nis:      "Ekipa iz Niša ne prašta. Gde god idete, Niš ide s vama.",
  strand:   "Štrand u avgustu je najjača fešta na Balkanu. Petak, pesak, 4 ujutru.",
  sarajevo: "Sarajevo prati sve. Jedan korak pogrešno — i ceo region zna.",
  guncati:  "Guncati finale. Zadnje karte. Ko nije bio — požaleće."
};

export const BLOCK_FLAVOR = {
  open: [
    "Publika ulazi. Energija raste.",
    "22:00. Prvi takt. Sve počinje.",
    "Vrata su otvorena. Ko dolazi, ostaje."
  ],
  peak: [
    "01:00. Vrhunac noći. Ništa ne može stati.",
    "Svaki beat je udar. Publika ne diše.",
    "Peak hour. Najjači DJ set počinje."
  ],
  close: [
    "04:00. Poslednji sati. Pravi fanovi ostaju.",
    "Zvuk se topi u jutro. Ali pamćenje ostaje.",
    "Close set. Ko izdrži — pamti zauvek."
  ]
};

export const EVENT_FLAVOR = {
  struja:    "⚡ Struja ode. Tišina. Publika pita: 'šta sad?'",
  kisa:      "🌧️ Kiša pada na Avalu. Ko nema kapu — odlazi.",
  vip:       "👔 VIP gost pravi haos. MC, reši ovo!",
  susedi:    "📞 Policija na vratima. Situacija je ozbiljna.",
  oprema:    "🔧 Mešalica kaže 'ne'. Tonac se znoji.",
  media_inc: "📰 Novinar uhvatio loš ugao. Sutra objava."
};

export const TUTORIAL_STEPS = [
  {
    title: "Dobrodošao u Turneja 2026",
    text: "Ti si menadžer Kluboslavija turneje. Pet gradova. Jedan bus. Počinjemo sa Avalom.",
    highlight: null
  },
  {
    title: "DJ Karta",
    text: "DJ je srce svakog bloka. Bez njega — nema muzike. Vucanjem u blok počinje set.",
    highlight: "DJ",
    role: "DJ"
  },
  {
    title: "MC Karta",
    text: "MC pumpa publiku između setova. DJ+MC sinergija = +15% hype. Zlatna kombinacija.",
    highlight: "MC",
    role: "MC"
  },
  {
    title: "Tonac Karta",
    text: "Tonac drži zvuk. Ako nestane struja — Tonac sređuje. Neophodan za stabilnost.",
    highlight: "Tonac",
    role: "Tonac"
  },
  {
    title: "Video Karta",
    text: "Video snima i šeruje. Povećava media coverage. DJ+Video = +12% social shares.",
    highlight: "Video",
    role: "Video"
  },
  {
    title: "Host Karta",
    text: "Host vodi publiku kroz noć. MC+Host = +20% engagement. Najjača fan sinergija.",
    highlight: "Host",
    role: "Host"
  },
  {
    title: "Security Karta",
    text: "Security drži red. Kisa, susedi, chaos — Security rešava. Esencijalan za Avalu.",
    highlight: "Security",
    role: "Security"
  },
  {
    title: "Sinergije",
    text: "Kad kombinuješ 2 karte koje se slažu — zelenilo! Proba: stavi DJ i MC zajedno.",
    highlight: null
  },
  {
    title: "Spreman!",
    text: "Ti si spreman. Avala čeka. Slobodan si da igraš turnir! Stavi 3 karte u blok i klikni PLAY.",
    highlight: null
  }
];

export const GAMEOVER_MESSAGES = {
  gameover_morale: "Ekipa je pala. Bez morala — nema turneje. Okrenulo se loše.",
  gameover_budget: "Novac je nestao. Bez budžeta — sledeći grad nije opcija.",
  partial_win: "Turneja je završena, ali fanovi su hteli više. Solidno — ali ne legendarno.",
  win: "LEGENDARNO! Kluboslavija turneja 2026 je istorija balkanskog klupskog zvuka!"
};
