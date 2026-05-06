export const LEVEL_THRESHOLDS = [
  { level: 0, streakRequired: 0,  name: 'Čuvar u obuci',  badge: '🌱', xpBonus: 0  },
  { level: 1, streakRequired: 3,  name: 'Mladi ranger',   badge: '🌿', xpBonus: 25 },
  { level: 2, streakRequired: 7,  name: 'Park Ranger',    badge: '🌲', xpBonus: 25 },
  { level: 3, streakRequired: 14, name: 'Stariji Ranger', badge: '🌳', xpBonus: 25 },
  { level: 5, streakRequired: 30, name: 'Čuvar Šume',     badge: '🦅', xpBonus: 25 },
  { level: 7, streakRequired: 60, name: 'Park Legenda',   badge: '⭐',       xpBonus: 50 },
];

export const XP_PER_QUEST = 10;
export const XP_LEVEL_UP_BONUS = 25;

export const KATEGORIJA_ICONS = { Telo: '💧', Fokus: '🧠', Veze: '💬', Priroda: '🌿' };
export const TEZINA_LABELS = { easy: 'LAKO', medium: 'SREDNJE', hard: 'TEŠKO' };

export const CUVAR_PORUKE = {
  done: ['Bravo, Rangeru. Svaki korak gradi put.', 'Danas si bio/la prisutan/na. To se računa.', 'Park pamti tvoja dela. Nastavi.', 'Dobro si odradio/la. Vidiš li razliku?', 'Čuvar Parka je ponosan na tebe.'],
  mood_happy: ['Ta energija — zadrži je. Sutra po još.', 'Vidim to. Park oseća tvoju snagu.', 'Radost je gorivo. Napuni tank dobro.'],
  mood_neutral: ['Neutral je okej. Bitno je da si izašao/la.', 'Ne mora svaki dan biti magičan. Uradi ga svejedno.', 'Konzistentnost pobeđuje inspiraciju.'],
  mood_low: ['I to je hrabrost — uraditi nešto kad nisi u fondu.', 'Park te čuje. Sutra se vraćaš jači/a.', 'Teški dani grade najjače Rangere.'],
  streak_reset: ['Pad nije kraj. Svaki veliki čuvar je pao i ustao.', 'Resetujemo se. Krenemo iznova od danas.', 'Nema stida u ponovnom početku.'],
  propusnica: ['Dobro što si se vratio/la. Streak je sačuvan.', 'Park Propusnica iskorišćena. Koristi je mudro.'],
  level_up: ['Vidim transformaciju. Nisi više isti/a.', 'Ovaj nivo si zaslužio/la svakim danom.', 'Park Legenda se ne proglašava — ona se živi.', 'Ti si dokaz da male odluke prave veliku razliku.'],
};

export const LEVEL_UP_MESSAGES = {
  1: 'Prvih 3 dana završeno. Ti si sada Mladi Ranger.',
  2: 'Nedelja dana zaredom. Navika se gradi. Ti si Park Ranger.',
  3: 'Dve nedelje. Misli koje su postale dela. Stariji Ranger.',
  5: 'Mesec dana. Drveće bi ti odalo počast. Čuvar Šume.',
  7: 'Šezdeset dana. Legenda. Park Legenda. Zauvek.',
};

export const COLORS = { bg: '#0D1F0F', panel: '#1A3320', neon: '#39FF14', amber: '#F5A623', text: '#E8F0E9', dimText: '#8FA892', danger: '#FF4444', gold: '#FFD700' };
export const QUEST_HISTORY_MAX = 30;
export const QUEST_COOLDOWN_DAYS = 7;

export const AUDIO_NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50,
};
