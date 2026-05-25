// config.js — All game constants

export const BUDGET_START = 15000;
export const WIN_TARGET = 10000;
export const MORALE_GAMEOVER = 0;
export const REPUTATION_MAX = 100;
export const MAX_CARDS_PER_BLOCK = 3;

export const CITIES = [
  { id: "avala",    name: "Avala",    date: "20. jun", modifier: "forest_acoustics",  modVal: 0.10, icon: "🌲" },
  { id: "nis",      name: "Niš",      date: "jul",     modifier: "resident_crew",      modVal: 1,    icon: "🔥" },
  { id: "strand",   name: "Štrand",   date: "aug",     modifier: "beach_crowd",        modVal: 0.20, icon: "🏖️" },
  { id: "sarajevo", name: "Sarajevo", date: "sept",    modifier: "balkanski_media",    modVal: 1.50, icon: "🎭" },
  { id: "guncati",  name: "Guncati",  date: "okt",     modifier: "finale_crowd",       modVal: 0.35, icon: "🏆" }
];

export const ROLES = ["DJ", "Host", "Tonac", "Video", "Security", "MC"];

export const ROLE_ICONS = {
  "DJ":       "🎧",
  "Host":     "🎤",
  "Tonac":    "🎚️",
  "Video":    "📹",
  "Security": "🛡️",
  "MC":       "🎙️"
};

export const ROLE_DESCRIPTIONS = {
  "DJ":       "Muzika i tempo. Srce svakog bloka.",
  "Host":     "Vodi publiku. Povećava engagement.",
  "Tonac":    "Zvučna tehnika. Štiti od struje.",
  "Video":    "Snima i šeruje. Podiže media coverage.",
  "Security": "Čuva red. Mitigira chaos evente.",
  "MC":       "Pumpa energiju. Sinergira sa DJ-em."
};

// Positive synergies: key = sorted pair, value = { desc, category, multiplierKey, value }
export const SYNERGIES = {
  "DJ+MC":       { desc: "+15% hype",          category: "fan_score",    value: 0.15 },
  "DJ+Tonac":    { desc: "+10% sound",          category: "media",        value: 0.10 },
  "Host+Security":{ desc: "+5% morale",         category: "morale",       value: 0.05 },
  "Tonac+Video": { desc: "+10% media",          category: "media",        value: 0.10 },
  "MC+Host":     { desc: "+20% engagement",     category: "fan_score",    value: 0.20 },
  "DJ+Video":    { desc: "+12% social",         category: "fan_base",     value: 0.12 },
  "Security+MC": { desc: "-50% neg event šansa",category: "event_reduce", value: 0.50 },
  "Host+Video":  { desc: "+8% promo recycle",   category: "fan_preboost", value: 0.08 }
};

export const CONTRA_SYNERGIES = {
  "DJ+Security": { desc: "-5% hype",            category: "fan_score",  value: -0.05 },
  "Host+Tonac":  { desc: "-5% sound",           category: "media",      value: -0.05 },
  "Video+MC":    { desc: "-8% media",           category: "media",      value: -0.08 }
};

export const EVENT_POOL = [
  { id: "struja",    label: "Nestanak struje", icon: "⚡", cities: ["all"],                chance: 0.15, mitigates: "Tonac",    effectKey: "fanScore*0.6",    desc: "Zvuk ispada na 40 minuta." },
  { id: "kisa",      label: "Kiša",           icon: "🌧️", cities: ["avala","guncati"],    chance: 0.20, mitigates: "Security", effectKey: "crowd*0.8",       desc: "Publika odlazi sa scene." },
  { id: "vip",       label: "VIP drama",      icon: "👔", cities: ["all"],                chance: 0.10, mitigates: "MC",       effectKey: "miss2xmedia",     desc: "VIP gost pravi incident." },
  { id: "susedi",    label: "Susedi zovu",    icon: "📞", cities: ["nis","sarajevo"],      chance: 0.12, mitigates: "Security", effectKey: "reputation-10",   desc: "Žalba na buku. Ozbiljno." },
  { id: "oprema",    label: "Kvar opreme",    icon: "🔧", cities: ["all"],                chance: 0.08, mitigates: "Video",    effectKey: "revenue*0.75",    desc: "Mešalica zakazuje." },
  { id: "media_inc", label: "Medijski incident", icon: "📰", cities: ["sarajevo","strand"], chance: 0.10, mitigates: "Host",  effectKey: "reputation-20",   desc: "Negativan clanak online." }
];

export const BOOKING_TIERS = [
  {
    id: "budget",
    name: "Budget DJ",
    cost: 1000,
    hypeBonus: 0,
    moraleBonus: 0,
    equipRisk: 0.20,
    tier: 1,
    desc: "Lokalni talent. Jeftin, ali nepouzdan."
  },
  {
    id: "mid",
    name: "Resident Pro",
    cost: 2500,
    hypeBonus: 0.10,
    moraleBonus: 5,
    equipRisk: 0.08,
    tier: 2,
    desc: "Iskusan resident. Solidna opcija."
  },
  {
    id: "star",
    name: "Star DJ",
    cost: 5000,
    hypeBonus: 0.25,
    moraleBonus: 10,
    equipRisk: 0.02,
    tier: 3,
    desc: "Zvijezda sa bookingom. Publika ludi."
  }
];

export const PROMO_OPTIONS = [
  {
    id: "none",
    name: "Bez promo",
    cost: 0,
    fanPre: 0,
    mediaBonus: 0,
    cityModApplied: false,
    desc: "Nema investicije u marketing."
  },
  {
    id: "online",
    name: "Online promo",
    cost: 1500,
    fanPre: 200,
    mediaBonus: 0.05,
    cityModApplied: false,
    desc: "Socijalne mreže i targetovani ads."
  },
  {
    id: "full",
    name: "Full promo",
    cost: 3000,
    fanPre: 500,
    mediaBonus: 0.15,
    cityModApplied: true,
    desc: "Puna kampanja + grad modifier bonus."
  }
];

export const CREW_ACTIONS = [
  {
    id: "none",
    name: "Nema",
    cost: 0,
    moraleBonus: 0,
    desc: "Bez crew akcije."
  },
  {
    id: "odmor",
    name: "Crew odmor",
    cost: 2000,
    moraleBonus: 15,
    desc: "Tim se odmori. +15 morale."
  },
  {
    id: "backline",
    name: "Backline upgrade",
    cost: 4000,
    moraleBonus: 0,
    revenueBonus: 0.25,
    desc: "+25% revenue na sledećem eventu."
  }
];

// Base fan gains per block index (0=Open, 1=Peak, 2=Close)
export const BLOCK_BASE = {
  fan_gain:     [300, 500, 400],
  revenue_base: [800, 1200, 600],
  media_base:   [20,  35,  25]
};

// Synergy key builder (sorted alphabetically for consistent lookup)
export function makeSynergyKey(roleA, roleB) {
  return [roleA, roleB].sort().join('+');
}
