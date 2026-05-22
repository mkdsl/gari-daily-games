// events-pool.js — dynamic event pool with seeded random
export const EVENT_POOL = [
  {
    id: 'wind_shift',
    label: 'Vjetar zakreće!',
    icon: '💨',
    duration: 60,
    windBonus: 2,
    desc: 'Vjetar prenosi zvuk prema susedima +2 dB'
  },
  {
    id: 'crowd_spike',
    label: 'Publika traži više!',
    icon: '🙌',
    duration: 120,
    happinessMult: 1.15,
    desc: 'Sreća publike x1.15 tokom trajanja'
  },
  {
    id: 'inspection',
    label: 'Inspekcija!',
    icon: '🕵️',
    duration: 30,
    neighborLimit: -5,
    desc: 'Limit privremeno -5 dB dok inspektor ne ode'
  },
  {
    id: 'equipment_fail',
    label: 'Kvar opreme!',
    icon: '⚡',
    duration: 45,
    zoneDbPenalty: -10,
    desc: 'Main Stage -10 dB dok ekipa ne popravi'
  },
  {
    id: 'media_arrival',
    label: 'Mediji stigli!',
    icon: '🎥',
    duration: 180,
    mediaBonus: true,
    desc: 'Reputacija x2 za ovaj period'
  },
  {
    id: 'neighbor_baby',
    label: 'Komšijino dete plače!',
    icon: '👶',
    duration: 90,
    neighborLimit: -3,
    desc: 'Limit -3 dB dok dete ne zaspi'
  },
  {
    id: 'rain',
    label: 'Kiša!',
    icon: '🌧️',
    duration: 120,
    reflectionBonus: -2,
    desc: 'Kiša smanjuje refleksije -2 dB'
  },
  {
    id: 'dj_request',
    label: 'DJ traži pojačanje!',
    icon: '🏍️',
    duration: 30,
    requestDb: 5,
    desc: 'DJ hoće +5 dB — publika će biti srećnija'
  }
];

// Seeded LCG random for reproducible events per venue/time
export function seededRng(seed) {
  let s = seed >>> 0;
  return {
    next() {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 0x100000000;
    },
    nextInt(max) {
      return Math.floor(this.next() * max);
    }
  };
}
