// cities.js — City data and modifier helpers

export const CITIES = [
  {
    id: "avala",
    name: "Avala",
    date: "20. jun",
    modifier: "forest_acoustics",
    modVal: 0.10,
    icon: "🌲",
    flavor: "Šuma reflektuje zvuk. Akustika je prirodna, ali publika dolazi po iskustvo — ne buku."
  },
  {
    id: "nis",
    name: "Niš",
    date: "jul",
    modifier: "resident_crew",
    modVal: 1,
    icon: "🔥",
    flavor: "Ekipa iz Niša zna posao. Resident crew pridružuje turneja timu — cela noć je naša."
  },
  {
    id: "strand",
    name: "Štrand",
    date: "avg",
    modifier: "beach_crowd",
    modVal: 0.20,
    icon: "🏖️",
    flavor: "Letnja publika je raspuštena. Svaki beat se širi po pesku. +20% crowd."
  },
  {
    id: "sarajevo",
    name: "Sarajevo",
    date: "sept",
    modifier: "balkanski_media",
    modVal: 1.50,
    icon: "🎭",
    flavor: "Balkanski mediji sve prate. 1.5x media coverage — ali i više pogleda na greške."
  },
  {
    id: "guncati",
    name: "Guncati",
    date: "okt",
    modifier: "finale_crowd",
    modVal: 0.35,
    icon: "🏆",
    flavor: "Finale turneje. Sve se odlučuje večeras. Publika je došla po istorijsku noć."
  }
];

/**
 * Get a city object by id
 */
export function getCity(cityId) {
  return CITIES.find(c => c.id === cityId) || CITIES[0];
}

/**
 * Get the modifier multiplier for a specific category in a city
 * @param {string} cityId
 * @param {string} category - 'fan' | 'media' | 'revenue'
 * @returns {number} multiplier (1.0 = no change)
 */
export function getCityModifier(cityId, category) {
  const city = getCity(cityId);
  if (!city) return 1.0;

  switch (city.modifier) {
    case 'forest_acoustics':
      return category === 'media' ? 1 + city.modVal : 1.0;

    case 'resident_crew':
      return 1.1; // +10% all categories

    case 'beach_crowd':
      return category === 'fan' ? 1 + city.modVal : 1.0;

    case 'balkanski_media':
      return category === 'media' ? city.modVal : 1.0;

    case 'finale_crowd':
      if (category === 'fan' || category === 'revenue') return 1 + city.modVal;
      return 1.0;

    default:
      return 1.0;
  }
}

/**
 * Get city by index in tour order
 */
export function getCityByIndex(index) {
  return CITIES[Math.min(index, CITIES.length - 1)];
}

/**
 * Get city tour progress label
 */
export function getTourProgress(completedCount) {
  return `${completedCount} / ${CITIES.length} gradova`;
}
