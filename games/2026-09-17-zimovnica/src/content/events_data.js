/**
 * events_data.js — Event pool: komšija, kiša, berač, tegla, mesna, pH check, Bačva KO.
 */

/** @type {Array} */
export const EVENTS_DATA = [
  {
    id: 'komsija_menja',
    type: 'opportunity',
    title: 'Komšija menja!',
    text: 'Jovan sa sela nudi 10 kg jabuka za 5 kg ajvara. Da li prihvataš?',
    icon: '🤝',
    immediate: false,
    choices: [
      {
        label: 'Prihvati',
        tooltip: '+10 kg jabuka, -5 kg ajvara',
        effect: (state, persistent) => {
          const hasAjvar = state.tegle.some(j => j.type === 'ajvar' && j.qty >= 5);
          if (!hasAjvar) return { state, persistent };
          const newTegle = state.tegle.map(j => {
            if (j.type === 'ajvar' && j.qty >= 5) return { ...j, qty: j.qty - 5 };
            return j;
          }).filter(j => j.qty > 0.01);
          const newSirovine = { ...state.sirovine, jabuke: (state.sirovine.jabuke || 0) + 10 };
          return { state: { ...state, tegle: newTegle, sirovine: newSirovine }, persistent };
        }
      },
      { label: 'Odbij', tooltip: 'Nema efekta', effect: (s, p) => ({ state: s, persistent: p }) }
    ],
  },
  {
    id: 'iznenadna_kisa',
    type: 'risk',
    title: 'Iznenadna kiša!',
    text: 'Paprike ostavljene napolju — kiša je ubrzala kvarenje.',
    icon: '🌧️',
    immediate: true,
    requires_bacva: false,
    effect: (state, persistent) => {
      const loss = (state.sirovine.paprike || 0) * 0.15;
      const newSirovine = { ...state.sirovine, paprike: Math.max(0, state.sirovine.paprike - loss) };
      return { state: { ...state, sirovine: newSirovine }, persistent };
    },
    choices: [],
  },
  {
    id: 'unajmljeni_berac',
    type: 'opportunity',
    title: 'Unajmljeni berač',
    text: 'Može da pomogne danas za 300 dinara — dodaje jedan akcioni slot.',
    icon: '👨‍🌾',
    immediate: false,
    choices: [
      {
        label: 'Angažuj (300 din)',
        tooltip: '+1 akcioni slot danas',
        effect: (state, persistent) => {
          if (state.kasa < 300) return { state, persistent };
          return { state: { ...state, kasa: state.kasa - 300, slots: state.slots + 1 }, persistent };
        }
      },
      { label: 'Otpusti', effect: (s, p) => ({ state: s, persistent: p }) }
    ],
  },
  {
    id: 'slomljena_tegla',
    type: 'risk',
    title: 'Pukla tegla!',
    text: 'Jedna tegla pukla u podrumu. Sadržaj propao.',
    icon: '💔',
    immediate: true,
    effect: (state, persistent) => {
      if (state.tegle.length === 0) return { state, persistent };
      // Gubi random teglu
      const idx = Math.floor(Math.random() * state.tegle.length);
      const jar = state.tegle[idx];
      const lossQty = Math.min(jar.qty, 2);
      const newTegle = state.tegle.map((j, i) => {
        if (i !== idx) return j;
        return { ...j, qty: j.qty - lossQty };
      }).filter(j => j.qty > 0.01);
      return { state: { ...state, tegle: newTegle }, persistent };
    },
    choices: [],
  },
  {
    id: 'mesna_zajednica',
    type: 'opportunity',
    title: 'Mesna zajednica',
    text: 'Otkupljuju zimovnicu za kuhinje u školi. Bonus cena +20%.',
    icon: '🏫',
    immediate: false,
    choices: [
      {
        label: 'Prodaj (bonus cena)',
        tooltip: 'Prodaješ sve tegle po +20% ceni',
        effect: (state, persistent) => {
          let revenue = 0;
          const { JAR_PRICES } = require('../config.js');
          for (const jar of state.tegle) {
            revenue += (JAR_PRICES[jar.type] || 0) * jar.qty * 1.2;
          }
          return { state: { ...state, tegle: [], kasa: state.kasa + revenue }, persistent };
        }
      },
      { label: 'Odbij', effect: (s, p) => ({ state: s, persistent: p }) }
    ],
  },
  {
    id: 'ph_check',
    type: 'neutral',
    title: 'pH provera bačve',
    text: 'Sused Bogić kaže da treba proveriti kiseonost bačve. Troši 1 slot, ali sprečava kvar.',
    icon: '🧪',
    requires_bacva: true,
    immediate: false,
    choices: [
      {
        label: 'Proveri (1 slot)',
        tooltip: 'Sprečava potencijalni kvar fermentacije',
        effect: (state, persistent) => {
          if (state.slots < 1) return { state, persistent };
          // Small chance to prevent barrel failure
          const s = { ...state, slots: state.slots - 1 };
          return { state: s, persistent };
        }
      },
      { label: 'Preskoči', effect: (s, p) => ({ state: s, persistent: p }) }
    ],
  },
  {
    id: 'bacva_ko',
    type: 'barrel_fail',
    title: 'Bačva KO!',
    text: 'Bačva nije inicirana na vreme. Kupus propada bez fermentacije.',
    icon: '💀',
    immediate: true,
    requires_bacva: false,
    effect: (state, persistent) => {
      const newSirovine = { ...state.sirovine, kupus: 0 };
      return { state: { ...state, sirovine: newSirovine, bačva_status: 'failed' }, persistent };
    },
    choices: [],
  },
  {
    id: 'suncan_dan',
    type: 'opportunity',
    title: 'Izuzetno sunčan dan',
    text: 'Idealno za sušenje! Sušeno voće i šljive završavaju za 1 dan umesto 2.',
    icon: '☀️',
    immediate: true,
    effect: (state, persistent) => {
      const newJobs = state.passive_jobs.map(j => {
        if (j.recipe === 'suseno_voce' || j.recipe === 'sušene_šljive') {
          return { ...j, end_day: Math.max(j.end_day - 1, state.day + 1) };
        }
        return j;
      });
      return { state: { ...state, passive_jobs: newJobs }, persistent };
    },
    choices: [],
  },
  {
    id: 'guncati_poseta',
    type: 'opportunity',
    title: 'Guncati poseta',
    text: 'Ekipa iz Guncatija dolazi — posebno cene autentičnu ajvar i rakiju. Prodaj im?',
    icon: '🌿',
    min_day: 7,
    immediate: false,
    choices: [
      {
        label: 'Da, prodaj (prestige cene)',
        tooltip: 'Ajvar i rakija po prestige cenama',
        effect: (state, persistent) => {
          let revenue = 0;
          const { JAR_PRICES } = require('../config.js');
          const newTegle = [];
          for (const jar of state.tegle) {
            if (jar.type === 'ajvar' || jar.type === 'rakija') {
              const mult = JAR_PRICES.prestige_mult?.[jar.type] || 1.5;
              revenue += (JAR_PRICES[jar.type] || 0) * jar.qty * mult;
            } else {
              newTegle.push(jar);
            }
          }
          return { state: { ...state, tegle: newTegle, kasa: state.kasa + revenue }, persistent };
        }
      },
      { label: 'Čuvam za zimu', effect: (s, p) => ({ state: s, persistent: p }) }
    ],
  },
];
