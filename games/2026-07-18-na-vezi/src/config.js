/** @type {Object} Sve tuning konstante za Na Vezi */
export const GAME_CONFIG = {
  // ======= OFF-GRID (0-100 apstraktna skala) =======
  BASE_OFFGRID_CAPACITY_START: 55,
  WEATHER_BANDS: {
    oblacno:  { chance: 0.25, min: 0.45, max: 0.65 },
    prosecno: { chance: 0.50, min: 0.80, max: 1.00 },
    suncano:  { chance: 0.25, min: 1.00, max: 1.15 },
  },

  // ======= ALARM BAZE =======
  ALARM_DECAY: 0.80,
  BASE_ALARM_CHANCE: {
    signal_drop:     0.22,
    feedback_glitch: 0.15,
    battery_critical: 0.18,
    platform_hiccup: 0.12,
    hardware_fault:  0.08,
  },
  MIN_ALARM_CHANCE: {
    signal_drop:     0.04,
    feedback_glitch: 0.03,
    battery_critical: 0.05,
    platform_hiccup: 0.03,
    hardware_fault:  0.02,
  },

  // ======= ESKALACIJA ALARMA =======
  ESCALATION: {
    signal_drop_unresolved:      { target: 'battery_critical', bonus: 0.15 },
    battery_critical_unresolved: { target: 'signal_drop',      bonus: 0.20 },
    feedback_glitch_missed:      { target: 'any_next',         bonus: 0.10 },
    second_unresolved_in_session:{ target: 'hardware_fault',   bonus: 0.25 },
  },

  // ======= DRAIN RATES (po sekundi, 0-100 skala) =======
  BASE_DRAIN_RATE: { dj_lajv: 0.25, podkast: 0.12, vlog_uzivo: 0.18 },
  LIGHTING_DRAW:   { none: 0, r1: 0.08, r2: 0.03, r3: 0.18 },
  PLATFORM_DRAW:   { ig: 0.05, tiktok: 0.06, youtube: 0.09 },
  REROUTE_COST: 8,

  // ======= PLATFORM KRIVE =======
  PLATFORM_COST_PER_UNIT: { ig: 1.0, tiktok: 1.15, youtube: 1.6 },
  IG_GROWTH_RATE:      0.06,
  TIKTOK_SPIKE_MULT:   1.8,
  TIKTOK_DECAY_NO_ALLOC: 0.12,
  YOUTUBE_GROWTH_RATE: 1.03,

  // ======= FORMAT-PLATFORM AFINITET =======
  FORMAT_PLATFORM_BONUS: {
    dj_lajv:    { tiktok: 1.4,  ig: 1.0,  youtube: 0.8  },
    podkast:    { youtube: 1.35, ig: 1.05, tiktok: 0.7  },
    vlog_uzivo: { ig: 1.2,      tiktok: 0.9, youtube: 0.85 },
  },

  // ======= GOST =======
  RELIABILITY_GAIN_STANDARD: 5,
  RELIABILITY_GAIN_STANDOUT: 9,
  RELIABILITY_LOSS_NO_SHOW:  15,
  NO_SHOW_ADJUST_PER_POINT:  0.006,

  // ======= PRESTIGE =======
  SEASON_LENGTH_EMISIJE: 8,
  PRESTIGE_MULT_BASE:    1.12,
  LOYAL_CORE_CARRY:      0.15,

  // ======= KAPITAL =======
  BASE_CAPITAL:          500,
  MONETIZATION_WEIGHT:   { ig: 1.0, tiktok: 0.85, youtube: 1.2 },
  UPKEEP_COST_PER_WEEK:  50,

  // ======= TRAJANJE EMISIJE =======
  EMISIJA_DURATION: 480,       // 8 minuta simuliranih
  ALARM_CHECK_INTERVAL: 60,    // svakih 60s simuliranih

  // ======= CHAT =======
  CHAT_NAME_POOL_SIZE:    18,
  CHAT_TEMPLATES_PER_TAG: 13,
  CHAT_CONTEXT_TAGS:       4,

  // ======= SIGNAL =======
  SIGNAL_BASE: 100,
  SIGNAL_DROP_AMOUNT: 35,
  SIGNAL_RECOVER_RATE: 8,       // % per second kad nije u alarmu
  SIGNAL_REROUTE_RECOVER: 60,   // trenutni skok kad reroute

  // ======= EQ MINIGAME =======
  EQ_WINDOW_DURATION: 3.0,     // sekunde da se reši
  EQ_WINDOW_BONUS_A1:  0.8,    // +0.8s sa A1
  EQ_WINDOW_BONUS_A3:  1.2,    // +1.2s sa A3

  // ======= ENGAGEMENT =======
  BASE_ENGAGEMENT:       0.5,
  ENGAGEMENT_SIGNAL_WEIGHT: 0.4,
  ENGAGEMENT_CHAT_WEIGHT:   0.3,
  ENGAGEMENT_GUEST_WEIGHT:  0.3,

  // ======= AUDIENCE BASE =======
  AUDIENCE_BASE: { ig: 100, tiktok: 50, youtube: 20 },

  // ======= SEASON AC2 PRAG =======
  AC2_STREAK_NEEDED:    4,
  AC2_ENGAGEMENT_PRAG:  0.6,
};

// ======= OPREMA — 18 stavki =======
export const EQUIPMENT = {
  e1: { id: 'e1', name: 'Rezervni encoder',      icon: '📡', cost: 1800,  category: 'signal',  effect: 'signal alarm −1 nivo',         alarmType: 'signal_drop',     decayLevel: 1 },
  e2: { id: 'e2', name: 'Encoder Pro',            icon: '📡', cost: 4500,  category: 'signal',  effect: 'signal alarm −2 nivoa',        alarmType: 'signal_drop',     decayLevel: 2, requires: 'e1' },
  e3: { id: 'e3', name: 'Auto-failover modul',    icon: '🔄', cost: 9000,  category: 'signal',  effect: 'signal −3, hardware −1',       alarmType: 'signal_drop',     decayLevel: 3, requires: 'e2' },
  e4: { id: 'e4', name: 'Enterprise encoder',     icon: '🏢', cost: 22000, category: 'signal',  effect: 'signal −4 (cap), reroute −20%',alarmType: 'signal_drop',     decayLevel: 4, requires: 'e3' },
  a1: { id: 'a1', name: 'Bolji mikrofon',         icon: '🎙', cost: 2200,  category: 'audio',   effect: 'feedback −1, +5% podkast',     alarmType: 'feedback_glitch', decayLevel: 1 },
  a2: { id: 'a2', name: 'Zvučna izolacija',       icon: '🔇', cost: 3800,  category: 'audio',   effect: 'feedback −2',                  alarmType: 'feedback_glitch', decayLevel: 2, requires: 'a1' },
  a3: { id: 'a3', name: 'Mixer DSP EQ',           icon: '🎛', cost: 8500,  category: 'audio',   effect: 'feedback −3, EQ window +1s',   alarmType: 'feedback_glitch', decayLevel: 3, requires: 'a2' },
  a4: { id: 'a4', name: 'Studio audio interfejs', icon: '🎚', cost: 16000, category: 'audio',   effect: 'feedback −4 (cap)',             alarmType: 'feedback_glitch', decayLevel: 4, requires: 'a3' },
  r1: { id: 'r1', name: 'LED rasveta',            icon: '💡', cost: 1500,  category: 'lighting',effect: '+6% DJ lajv, draw +r1',         alarmType: null,              decayLevel: 0 },
  r2: { id: 'r2', name: 'String lights',          icon: '✨', cost: 2600,  category: 'lighting',effect: '+4% sve formate',               alarmType: null,              decayLevel: 0 },
  r3: { id: 'r3', name: 'Profesionalna rasveta',  icon: '🔦', cost: 12000, category: 'lighting',effect: '+15% DJ lajv, draw +r3',        alarmType: null,              decayLevel: 0 },
  l1: { id: 'l1', name: 'Drugi internet link',    icon: '🌐', cost: 5000,  category: 'link',    effect: 'signal −2 dodatno, reroute −40%',alarmType: 'signal_drop',    decayLevel: 2 },
  l2: { id: 'l2', name: 'Bandwidth optimizer',    icon: '📶', cost: 3200,  category: 'link',    effect: 'platform_hiccup −1',           alarmType: 'platform_hiccup', decayLevel: 1 },
  l3: { id: 'l3', name: 'Redundantni SIM',        icon: '📱', cost: 7500,  category: 'link',    effect: 'signal −3 dodatno, battery −8', alarmType: 'signal_drop',    decayLevel: 3 },
  b1: { id: 'b1', name: 'Baterijska banka',       icon: '🔋', cost: 6000,  category: 'offgrid', effect: 'BASE_OFFGRID +10',             alarmType: 'battery_critical',decayLevel: 0, capacityBonus: 10 },
  b2: { id: 'b2', name: 'MPPT/solar panel',       icon: '☀', cost: 14000, category: 'offgrid', effect: 'BASE_OFFGRID +15, variance −35%',alarmType: 'battery_critical',decayLevel: 0, capacityBonus: 15, varianceReduction: true },
  b3: { id: 'b3', name: 'Efficient encoder mod',  icon: '⚡', cost: 9500,  category: 'offgrid', effect: 'platform cost sve −15%',        alarmType: null,              decayLevel: 0 },
  b4: { id: 'b4', name: 'Battery health monitor', icon: '📊', cost: 4200,  category: 'offgrid', effect: 'battery alarm −2, rano upoz.',  alarmType: 'battery_critical',decayLevel: 2 },
};

// ======= FORMATE =======
export const FORMATS = {
  dj_lajv:    { id: 'dj_lajv',    name: 'DJ Lajv',    icon: '🎧', hint: 'TikTok spike, visoka energija' },
  podkast:    { id: 'podkast',    name: 'Podkast',    icon: '🎙', hint: 'YouTube retencija, long-form' },
  vlog_uzivo: { id: 'vlog_uzivo', name: 'Vlog Uživo', icon: '📹', hint: 'IG rast, srednji ritam' },
};

// ======= ACHIEVEMENTS =======
export const ACHIEVEMENTS = {
  ac1:  { id: 'ac1',  name: 'Prvi Signal',               icon: '📡', desc: 'Prva emisija bez kritičnog pada signala' },
  ac2:  { id: 'ac2',  name: 'Signal Stabilan',            icon: '🏆', desc: '4 uzastopne emisije stabilno, engagement prag i gost bez no-show' },
  ac3:  { id: 'ac3',  name: 'Sunčan Rezervni Fond',       icon: '☀', desc: 'Emisija >80% iskorišćenog kapaciteta bez otpada' },
  ac4:  { id: 'ac4',  name: 'Oblačna Nedelja Preživljena',icon: '☁', desc: 'Puna emisija u oblačnoj nedelji bez downgrade-a' },
  ac5:  { id: 'ac5',  name: 'Tri Platforme u Ravnoteži',  icon: '⚖', desc: 'Alokacija sve tri platforme unutar 10% jedne od druge' },
  ac6:  { id: 'ac6',  name: 'TikTok Spike Uhvaćen',       icon: '🚀', desc: 'Prvih 2 minuta emisije uspešno iskorišćena na TikTok-u' },
  ac7:  { id: 'ac7',  name: 'YouTube Maratonac',           icon: '🎬', desc: 'Podkast format sa top-tier retencijom' },
  ac8:  { id: 'ac8',  name: 'Gost Kome Veruješ',          icon: '🤝', desc: 'Gost sa reliability >= 90' },
  ac9:  { id: 'ac9',  name: 'Nikad Ne Kasni',             icon: '⏱', desc: '5 bookinga zaredom bez no-show-a' },
  ac10: { id: 'ac10', name: 'Alarm Lanac Prekinut',        icon: '⛓', desc: 'Rešen eskalirajući lanac (2+ alarma u istoj emisiji)' },
  ac11: { id: 'ac11', name: 'Highlight Reel',             icon: '🎞', desc: 'Prvi highlight generisan' },
  ac12: { id: 'ac12', name: 'Sezonski Reset',             icon: '🔄', desc: 'Prvi prestige' },
  ac13: { id: 'ac13', name: 'Simulcast Otključan',         icon: '📺', desc: 'Simultcast format dostignut' },
  ac14: { id: 'ac14', name: 'Baterija na Ivici',           icon: '🪫', desc: 'Emisija završena sa kapacitetom < 10' },
};

// ======= HELPERS =======
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function formatCapital(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return Math.round(n).toString();
}

export function formatAudience(n) {
  return formatCapital(n);
}
