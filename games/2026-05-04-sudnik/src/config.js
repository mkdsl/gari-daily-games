// src/config.js — Sve CONFIG konstante iz GDD Appendix-a
// NE hardcode-ovati ove vrednosti u logici — uvek referišite CONFIG.X

export const CONFIG = {
  SAVE_KEY: 'sudnik-2026-05-04',

  TOTAL_CASES: 10,
  STARTING_MASA: 50,
  STARTING_VLAST: 50,
  STARTING_DECK_SIZE: 10,
  HAND_SIZE: 5,
  PRECEDENT_DURATION: 3,        // slučajeva koliko traje svaki presedant
  MAX_CARDS_TO_PLAY: 3,         // maks karata koje igrač može odigrati po slučaju
  MAX_CARDS_TO_DISCARD: 2,      // maks karata u "Odbaci i Povuci" akciji

  // Vaga vizuelni opseg
  BALANCE_DISPLAY_MIN: -10,
  BALANCE_DISPLAY_MAX: +10,

  // Prag boja na vagi (§5)
  BALANCE_STRONG_THRESHOLD: 4,  // |score| >= 4 → jako KRIV/SLOBODAN
  BALANCE_MILD_THRESHOLD: 1,    // |score| 1-3 → blago

  // Slučajne šanse
  RECIDIVIST_CHANCE: 0.30,
  WITNESS_CHANCE: 0.50,

  // Wealth modifier na reputaciju (§6)
  WEALTH_MODIFIERS: {
    siromasan: { masa: +2, vlast: -2 },
    srednji:   { masa:  0, vlast:  0 },
    bogat:     { masa: -3, vlast: +3 }
  },

  // Animacije (ms)
  CARD_PLAY_ANIM_MS: 200,
  BALANCE_ANIM_MS: 200,
  VERDICT_ANIM_MS: 600,
  PROFILE_CHAR_DELAY_MS: 50,    // typewriter efekat: ms po karakteru
  GAMEOVER_LAMP_MS: 1500,       // trajanje lamp-off animacije

  // Boje (CSS vrednosti za JS upotrebu)
  COLORS: {
    BG: '#0D0D0D',
    PAPER: '#E8DFC8',
    INK: '#1A1A2E',
    GUILTY: '#8B0000',
    FREE: '#4A7FA5'
  }
};

// ─── Tabele promena resursa po presudi + crimeType (GDD §6) ──────────────────

/** Tabela promena resursa za presudu KRIV po crimeType */
export const GUILTY_DELTAS = {
  'nasilje':            { masa: +8,  vlast: +5  },
  'krađa':              { masa: +5,  vlast: +3  },
  'korupcija':          { masa: +10, vlast: -3  },
  'ubistvo':            { masa: +10, vlast: +8  },
  'prevara':            { masa: +5,  vlast: +2  },
  'nasilje u porodici': { masa: +6,  vlast: +2  },
  'sitna krađa':        { masa: -3,  vlast: +3  },
  'pobuna':             { masa: -8,  vlast: +12 }
};

/** Tabela promena resursa za presudu SLOBODAN po crimeType */
export const FREE_DELTAS = {
  'nasilje':            { masa: -5,  vlast: -3  },
  'krađa':              { masa: -3,  vlast: -2  },
  'korupcija':          { masa: -8,  vlast: +5  },
  'ubistvo':            { masa: -10, vlast: -5  },
  'prevara':            { masa: -4,  vlast: -3  },
  'nasilje u porodici': { masa: -4,  vlast: -2  },
  'sitna krađa':        { masa: +5,  vlast: -2  },
  'pobuna':             { masa: +10, vlast: -10 }
};

// ─── Profile templates (GDD §8) ───────────────────────────────────────────────

/** 25 template rečenica za profil sudnika */
export const PROFILE_TEMPLATES = [
  // Nemilosrdni
  { id: 't01', strogost: 'nemilosrdan', klasni: 'kaznio_bogate',     starosni: 'neutralan_starost',   recidiv: 'bez_milosti_prema_recidivistima', text: 'Sudija koji ne prašta — ni moćnima ni slabima. Zakon je bio tvoja religija.' },
  { id: 't02', strogost: 'nemilosrdan', klasni: 'favorizuje_bogate', starosni: 'neutralan_starost',   recidiv: 'bez_milosti_prema_recidivistima', text: 'Sistem te je naučio ko je vredan slobode — a ko nije. Bogati su prolazili, ostali ne.' },
  { id: 't03', strogost: 'nemilosrdan', klasni: 'neutralan_klasa',   starosni: 'strog_prema_mladima', recidiv: 'bez_milosti_prema_recidivistima', text: 'Mladost te nije ublažavala. Svako ko greši, plaća — bez obzira na godine.' },
  { id: 't04', strogost: 'nemilosrdan', klasni: 'neutralan_klasa',   starosni: 'strog_prema_starima', recidiv: 'bez_milosti_prema_recidivistima', text: 'Godine nisu opravdanje. Starost ti nije donela milost — ni njima.' },
  { id: 't05', strogost: 'nemilosrdan', klasni: 'neutralan_klasa',   starosni: 'neutralan_starost',   recidiv: 'veruje_u_rehabilitaciju',         text: 'Kaznio si neumorno — ali drugi put si davao šansu. Kontradikcija je bila tvoja filozofija.' },

  // Strogi
  { id: 't06', strogost: 'strog',       klasni: 'kaznio_bogate',     starosni: 'neutralan_starost',   recidiv: 'bez_milosti_prema_recidivistima', text: 'Bogatstvo te nije kupilo, a greška se plaća. Tvoj sud je bio skup — ali pošten.' },
  { id: 't07', strogost: 'strog',       klasni: 'favorizuje_bogate', starosni: 'strog_prema_mladima', recidiv: 'neutralan_recidiv',               text: 'Mladi su ti izgledali opasno, a moć je bila respekt. Grad je to znao.' },
  { id: 't08', strogost: 'strog',       klasni: 'neutralan_klasa',   starosni: 'strog_prema_mladima', recidiv: 'neutralan_recidiv',               text: 'Mladi su te plašili — možda opravdano. Sudija strogih principa i sumnjičavog pogleda.' },
  { id: 't09', strogost: 'strog',       klasni: 'neutralan_klasa',   starosni: 'neutralan_starost',   recidiv: 'bez_milosti_prema_recidivistima', text: 'Jednom ogrešen — zauvek sumnjiv. Ko se ponovi, nema šanse.' },
  { id: 't10', strogost: 'strog',       klasni: 'kaznio_bogate',     starosni: 'strog_prema_mladima', recidiv: 'neutralan_recidiv',               text: 'Ni bogatstvo ni mladost nisu bila opravdanje. Samo činjenice su govorile.' },

  // Umereni
  { id: 't11', strogost: 'umeren',      klasni: 'neutralan_klasa',   starosni: 'neutralan_starost',   recidiv: 'neutralan_recidiv',               text: 'Balansiran sudija bez jasnih favorita. Da li je to pravda — ili oklijevanje?' },
  { id: 't12', strogost: 'umeren',      klasni: 'favorizuje_bogate', starosni: 'neutralan_starost',   recidiv: 'neutralan_recidiv',               text: 'Siromašni su češće odlazili u zatvor. Možda nisi ni primetio.' },
  { id: 't13', strogost: 'umeren',      klasni: 'kaznio_bogate',     starosni: 'neutralan_starost',   recidiv: 'neutralan_recidiv',               text: 'Moć nije bila zaštita pred tvojim stolom. Retko u ovom gradu.' },
  { id: 't14', strogost: 'umeren',      klasni: 'neutralan_klasa',   starosni: 'strog_prema_starima', recidiv: 'veruje_u_rehabilitaciju',         text: 'Starima nisi verovao, ali si davao drugima šansu. Čudna jednadžba.' },
  { id: 't15', strogost: 'umeren',      klasni: 'neutralan_klasa',   starosni: 'strog_prema_mladima', recidiv: 'veruje_u_rehabilitaciju',         text: 'Mladima si bio strog ali si verovao da se čovek može popraviti. Contradictio in adjecto.' },

  // Milostivi
  { id: 't16', strogost: 'milostiv',    klasni: 'neutralan_klasa',   starosni: 'neutralan_starost',   recidiv: 'neutralan_recidiv',               text: 'Sloboda je bila tvoj default. Grad te je zvao slabim — ti si to zvao humanošću.' },
  { id: 't17', strogost: 'milostiv',    klasni: 'kaznio_bogate',     starosni: 'neutralan_starost',   recidiv: 'neutralan_recidiv',               text: 'Siromašni su prolazili slobodni, bogati su plaćali. Možda jedini pravični sudija ovog grada.' },
  { id: 't18', strogost: 'milostiv',    klasni: 'favorizuje_bogate', starosni: 'neutralan_starost',   recidiv: 'neutralan_recidiv',               text: 'Bogati su prolazili — siromašni su plaćali. I ti si verovao da si pravedan.' },
  { id: 't19', strogost: 'milostiv',    klasni: 'neutralan_klasa',   starosni: 'strog_prema_mladima', recidiv: 'neutralan_recidiv',               text: 'Mladima nisi verovao, ali svima drugima si davao benefit of the doubt.' },
  { id: 't20', strogost: 'milostiv',    klasni: 'neutralan_klasa',   starosni: 'strog_prema_starima', recidiv: 'neutralan_recidiv',               text: 'Starima nisi verovao da se poprave. Svima ostalima — bio si blago.' },
  { id: 't21', strogost: 'milostiv',    klasni: 'neutralan_klasa',   starosni: 'neutralan_starost',   recidiv: 'bez_milosti_prema_recidivistima', text: 'Prvi put — opraštao si svima. Ko se ponovio, nije imao sreće.' },
  { id: 't22', strogost: 'milostiv',    klasni: 'neutralan_klasa',   starosni: 'neutralan_starost',   recidiv: 'veruje_u_rehabilitaciju',         text: 'Čovek se može popraviti — to je bila tvoja vera. Grad te je smatrao naivnim.' },

  // Specijalni (edge cases)
  { id: 't23', strogost: 'nemilosrdan', klasni: 'favorizuje_bogate', starosni: 'strog_prema_mladima', recidiv: 'bez_milosti_prema_recidivistima', text: 'Sistem u tebi je govorio glasnije od savesti. Nisi bio sudija — bio si alat.' },
  { id: 't24', strogost: 'milostiv',    klasni: 'kaznio_bogate',     starosni: 'strog_prema_mladima', recidiv: 'veruje_u_rehabilitaciju',         text: 'Paradoks: opraštao si, ali ne mladima ni bogatima. Tvoja filozofija ostaje misterija.' },
  { id: 't25', strogost: 'strog',       klasni: 'favorizuje_bogate', starosni: 'strog_prema_starima', recidiv: 'veruje_u_rehabilitaciju',         text: 'Vlast je bila zadovoljna tobom — a ti nisi znao zašto. Ili nisi hteo da znaš.' }
];
