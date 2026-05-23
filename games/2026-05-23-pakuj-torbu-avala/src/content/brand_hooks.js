// Avala copy, grade messages, bilet URL
export const BRAND = {
  name: 'Kluboslavija',
  event: 'Avala',
  eventDate: '20. jun 2026',
  biletUrl: 'https://app.bilet.rs/show/261',
  hashtag: '#Avala2026',
};

export const GRADE_MESSAGES = [
  {
    minScore: 300,
    grade: 'Savršeno pakovanje',
    subtitle: 'Sišao si na Avalu ko profesionalac!',
    emoji: '🏆',
    color: '#FFD700',
  },
  {
    minScore: 150,
    grade: 'Solidno',
    subtitle: 'Možeš na Avalu, ali ćeš nešto zaboraviti...',
    emoji: '👍',
    color: '#66BB6A',
  },
  {
    minScore: 0,
    grade: 'Nosi manje — živiš bolje',
    subtitle: 'Avala teče bez torbe? Možda...',
    emoji: '🤦',
    color: '#EF5350',
  },
];

export function getGrade(score) {
  for (const g of GRADE_MESSAGES) {
    if (score >= g.minScore) return g;
  }
  return GRADE_MESSAGES[GRADE_MESSAGES.length - 1];
}

export const CTA_COPY = {
  primary: 'AVALA RUN. 20. JUN.',
  secondary: 'Kluboslavija • Muzika • Zajednica',
  buttonText: '🎫 Uzmi kartu',
  buttonHint: 'bilet.rs/show/261',
};

export const LEVEL_INTROS = [
  'Level 1 — Osnovna oprema',
  'Level 2 — Dodaj štić za sunce',
  'Level 3 — Puna torba',
  'Level 4 — Festival veteran',
  'Level 5 — Avala sprinter',
];

export const PACKED_REMINDER = [
  'Ne zaboravi kartu!',
  'Boca vode je obavezna na Avali.',
  'Slušalice su must-have.',
  'Krema za sunce nije opcija!',
  'Kabel za punjenje — uvek.',
];

export function getRandomReminder() {
  return PACKED_REMINDER[Math.floor(Math.random() * PACKED_REMINDER.length)];
}
