// ============================================================
//  content/aforizmi.js — Sarajevo ili Smrt
//  Per-kvart crowd reactions, unlock texts, prestige flavor.
//  Written by Pera Period — mikro-aforizmi za inner monologue.
// ============================================================

export const CROWD_REACTIONS = {
  bascarsija: {
    good: [
      'Brate, ovo je kao burek u 4 ujutru — savršeno.',
      'Jesi li siguran da nisi iz Sarajeva?',
      'Daj nam tu pjesmu, ne znamo ni kako se zove al\' je naša.',
      'Ej, ovo se zna. Sviralo se i prije rata.',
      'Ma gdje si bio dosad?',
      'Kafana diše kad ti sviraš.'
    ],
    bad: [
      'Ode kapija.',
      'Ovo i moja baka ne bi puštala.',
      'Ugasi, sram te.',
      'Ko ti dao mikrofon?',
      'Idem po čaj. Možda se popraviti dok se vratim.',
      'Šta je ovo, vjenčanje u Zenici?'
    ],
    legend: [
      'Baščaršija te pamti.',
      'Postala si dio naše priče.',
      'Ovako se ne svira. Ovo se živi.',
      'Kafana je stala. Svi slušaju. Ti si to.'
    ]
  },

  marijin_dvor: {
    good: [
      'Konačno nešto moderno u ovom gradu.',
      'Ovo je world-class.',
      'Gdje si do sada bio?',
      'Pošalji mi setlistu.',
      'Ljude šaljem po prijatelje. Čekaju ih.',
      'Ovaj grad konačno ima šta pokazati.'
    ],
    bad: [
      'Naša publika zahtijeva više.',
      'Vrati se kad naučiš.',
      'Ovo nije pravo level.',
      'Čuj glazbu, javi se kad budeš spreman.',
      'Nije loše. Ali ovo nije Ibiza.',
      'Crowd odlazi. Slijedi ih ili promijeni track.'
    ],
    legend: [
      'Marijin Dvor klanja.',
      'Postavio si novi standard.',
      'Ovo ide na playlist. Odmah.',
      'Svi pričaju. Ime ti se pamti večeras.'
    ]
  },

  grbavica: {
    good: [
      'Napokon neko tko nije prodao dušu.',
      'Grbavica ne laže — ti si pravi.',
      'Siđi poslije, imam neke ljude za upoznati.',
      'Podrum prihvaća samo autentične.',
      'Znaš šta radiš. To se osjeća.',
      'Ovdje ne možeš lažirati. Publika zna.'
    ],
    bad: [
      'Ode kapija.',
      'Pokušaj sutra, možda si bolji ujutro.',
      'Grbavica ne čeka.',
      'Podrum odbacuje lažnjake.',
      'Izlaz je desno. Dođi spreman.',
      'Ni muzika ni publika ti ne vjeruju. Fix it.'
    ],
    legend: [
      'Grbavica te primila.',
      'Legenda se rodila u podrumu.',
      'Rijetki dočekaju ovakvu noć u podrumu.',
      'Podrum 88 dobio je novu legendu. Ti si to.'
    ]
  }
};

// ----------------------------------------------------------------
//  Prestige flavor texts
// ----------------------------------------------------------------
export const PRESTIGE_FLAVORS = [
  'Umro si ali Sarajevo pamti. Počni ponovo, lakše je drugi put.',
  'Svaka smrt uči. Džabe-Konekti ostaju.',
  'Reset nije kraj — to je novi rund sa boljom kartom.',
  'Sarajevo te slomilo. Sarajevo te naučilo. Opet kreni.',
  'Publika zaboravlja. Ti ne smiješ. Vrati se jači.',
  'Konekti su tvoji. Sve ostalo — zasluži ponovo.'
];

// ----------------------------------------------------------------
//  Unlock texts — shown on kvart/event first-appear
// ----------------------------------------------------------------
export const UNLOCK_TEXTS = {
  marijin_dvor: 'Marinji Dvor se otvorio. Moderna publika. Visoka očekivanja.',
  grbavica: 'Podrum, dim i najiskrenije kritike koje ćeš čuti u životu.',
  grbavica_legend: 'Grbavica te krštava. Od sada — underground legenda.',
  bjelasnica: 'Festival na planini. Pristupačno samo onima koji su preživjeli Grbavicu.',
  avala: 'Sarajevo te naučilo. Avala te čeka. Laku noć, legendo.'
};

// ----------------------------------------------------------------
//  Session start motivational blurb (shown on transition)
// ----------------------------------------------------------------
export const SESSION_INTROS = {
  bascarsija: [
    'Kafana čeka. Talas nije tvoj prijatelj — tek.',
    'Mahala sudi odmah. Nema druge prilike.',
    'Baščaršija ili smrt. Bukvalnog smisla.'
  ],
  marijin_dvor: [
    'Moderne uši, visoki standardi. Pokažu se.',
    'Ne treba im sevdah — treba im razlog da ostanu.',
    'Marinji Dvor pamti setliste. I DJ-eve koje ne poziva ponovo.'
  ],
  grbavica: [
    'Podrum. Beton. Nema kompromisa.',
    'Autentičnost ili izlaz. Podrum 88 bira.',
    'Crowd ispod 20 — rizik je stvaran. Drži ih gore.'
  ]
};

// ----------------------------------------------------------------
//  Achievement toast texts
// ----------------------------------------------------------------
export const ACHIEVEMENT_TEXTS = {
  sarajevo_achievement: 'Sve tri mahale — Sarajevo se otvara.',
  first_legend_moment: 'Legenda noći! Gari ovo bilježi.',
  first_prestige: 'Prestige I. Konekti ostaju, sve ostalo opet zasluži.',
  grbavica_legend: 'Grbavica legenda! Crowd 90+ u podrumu.',
  avala_headliner_eligible: '🏔 Avala Headliner — poziv je stvaran. Klikni i rezerviši.'
};

// ----------------------------------------------------------------
//  Idle LP flavor (shown in idle counter tooltip)
// ----------------------------------------------------------------
export const IDLE_FLAVORS = [
  'Mahala se pomiče čak i kad spavaš.',
  'Konekti rade noću kad ti ne možeš.',
  'Rep se gradi i između noći.',
  'Klub radi, novac ulazi.'
];
