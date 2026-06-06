/**
 * crew_data.js — Sva 12 crew member statična data
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

export const CREW_DATA = {
  maja: {
    id: 'maja',
    name: 'Maja Magnetar',
    archetype: 'Energizer',
    stats: { E: 5, S: 4, P: 3, L: 2 },
    primaryRole: 'hype',
    passiveTrait: {
      id: 'contagious',
      name: 'Zarazna energija',
      desc: 'Na početku Faze Vrh svi crew dobijaju +1E za tu fazu',
      trigger: 'phase_start',
      triggerPhase: 'peak',
      apply(crew) {
        // Returns stat delta map for all crew members
        return crew.map(m => ({ memberId: m.id, stat: 'E', delta: 1, temporary: true, duration: 'phase' }));
      }
    },
    activeAbility: {
      id: 'spark',
      name: 'Iskra',
      desc: '+8 Night Score odmah (1× po noći)',
      use(state) {
        state.nightScore = Math.min(state.nightScore + 8, 100);
        return { scoreBonus: 8, message: 'Maja zapali atmosferu — +8 poena!' };
      }
    },
    starterUnlocked: true,
    unlockCondition: null,
    portraitColor: '#39ff14',
    portraitEmoji: '⚡',
    shortDesc: 'Uvek prva na podijumu.',
    flavorText: 'Pita je gde žurka, nije da li.'
  },

  dragan: {
    id: 'dragan',
    name: 'Dragan Navigatorović',
    archetype: 'Planner',
    stats: { E: 2, S: 3, P: 1, L: 5 },
    primaryRole: 'navigator',
    passiveTrait: {
      id: 'always_has_plan',
      name: 'Uvek ima plan',
      desc: 'Logistika scenariji minimum 50% resolution — nikad potpuni fail',
      trigger: 'scenario_resolve',
      scenarioType: 'L',
      apply(crewScore, scenario) {
        // Ensures L scenarios never fully fail — minimum partial
        if (scenario.type === 'L' && crewScore < scenario.partialThreshold) {
          return { forceMinOutcome: 'partial' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'reroute',
      name: 'Promena kursa',
      desc: 'Poništi jedan Aftermath debuff (1× po noći)',
      use(aftermathStack) {
        const debuffIdx = aftermathStack.findIndex(a => a.type === 'debuff');
        if (debuffIdx !== -1) {
          const removed = aftermathStack.splice(debuffIdx, 1)[0];
          return { removed, message: `Dragan ukida: "${removed.label}"` };
        }
        return { removed: null, message: 'Nema aktivnih debuffova.' };
      }
    },
    starterUnlocked: true,
    unlockCondition: null,
    portraitColor: '#4df5ff',
    portraitEmoji: '🗺️',
    shortDesc: 'Zna sve ulice i prečice.',
    flavorText: 'Uvek ima plan B. I plan C.'
  },

  ana: {
    id: 'ana',
    name: 'Ana Atmosfera',
    archetype: 'Connector',
    stats: { E: 3, S: 5, P: 2, L: 2 },
    primaryRole: 'anchor',
    passiveTrait: {
      id: 'webs',
      name: 'Poznaje sve',
      desc: 'Social scenariji daju +3 Night Score bonus kad Ana je u ekipi',
      trigger: 'scenario_resolve',
      scenarioType: 'S',
      apply(outcome, scenario) {
        if (scenario.type === 'S' && (outcome === 'win' || outcome === 'partial')) {
          return { scoreBonus: 3, message: 'Ana je znala prave ljude — +3!' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'connect',
      name: 'Konekcija',
      desc: 'Failed Social scenario → partial win (1× po noći)',
      use(lastOutcome, scenario) {
        if (scenario && scenario.type === 'S' && lastOutcome === 'fail') {
          return { overrideOutcome: 'partial', message: 'Ana spasava situaciju — partial win!' };
        }
        return { overrideOutcome: null, message: 'Sposobnost nije primenljiva.' };
      }
    },
    starterUnlocked: true,
    unlockCondition: null,
    portraitColor: '#ff8c42',
    portraitEmoji: '🌐',
    shortDesc: 'Zna sve i svakog.',
    flavorText: 'Njen imenik nije kontakti, to je atlas.'
  },

  bojan: {
    id: 'bojan',
    name: 'Bojan Breakdancer',
    archetype: 'Dance Captain',
    stats: { E: 2, S: 2, P: 5, L: 1 },
    primaryRole: 'dance_captain',
    passiveTrait: {
      id: 'floor_commander',
      name: 'Komandant poda',
      desc: 'Dance scenariji u Fazi Vrh +25% resolution score',
      trigger: 'scenario_resolve',
      scenarioType: 'P',
      apply(crewScore, scenario, phase) {
        if (scenario.type === 'P' && phase === 'peak') {
          return { scoreMultiplier: 1.25, message: 'Bojan preuzima pod — +25% bonus!' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'solo',
      name: 'Solo',
      desc: 'Dance scenario auto-win (1× po noći)',
      use(scenario) {
        if (scenario.type === 'P') {
          return { forceOutcome: 'win', message: 'Bojan ulazi u solo — auto WIN!' };
        }
        return { forceOutcome: null, message: 'Radi samo na Dance scenarijima.' };
      }
    },
    starterUnlocked: true,
    unlockCondition: null,
    portraitColor: '#a855f7',
    portraitEmoji: '🕺',
    shortDesc: 'Bas ga pokreće.',
    flavorText: 'Kad krene muzika, telo preuzima.'
  },

  lena: {
    id: 'lena',
    name: 'Lena Lokalni Znalac',
    archetype: 'Insider',
    stats: { E: 3, S: 3, P: 2, L: 4 },
    primaryRole: 'logistics',
    passiveTrait: {
      id: 'home_turf',
      name: 'Domaći teren',
      desc: 'Navigation/Logistics scenariji garantovano minimum partial win',
      trigger: 'scenario_resolve',
      scenarioType: 'L',
      apply(crewScore, scenario) {
        if (scenario.type === 'L') {
          return { forceMinOutcome: 'partial' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'shortcut',
      name: 'Prečica',
      desc: 'Preskoči 1 Logistics scenario — auto-resolve neutral (1× po noći)',
      use(scenario) {
        return { skipScenario: true, neutralScore: 5, message: 'Lena zna prečicu — preskačemo!' };
      }
    },
    starterUnlocked: true,
    unlockCondition: null,
    portraitColor: '#22c55e',
    portraitEmoji: '📍',
    shortDesc: 'Avala je njen kvart.',
    flavorText: 'Zna gde je rezervni izlaz.'
  },

  pedja: {
    id: 'pedja',
    name: 'Pedja Sentimental',
    archetype: 'Heart',
    stats: { E: 4, S: 4, P: 3, L: 1 },
    primaryRole: 'anchor',
    passiveTrait: {
      id: 'memory_keeper',
      name: 'Čuvar uspomena',
      desc: 'Na kraju svake Faze ekipa dobija +5 Night Score bonus',
      trigger: 'phase_end',
      apply(phase) {
        return { scoreBonus: 5, message: `Pedja čuva sećanje — kraj ${phase} +5!` };
      }
    },
    activeAbility: {
      id: 'toast',
      name: 'Zdravica',
      desc: 'Konvertuj 1 Kaos Aftermath → Neutral (1× po noći)',
      use(aftermathStack) {
        const worstIdx = aftermathStack.findIndex(a => a.type === 'debuff');
        if (worstIdx !== -1) {
          aftermathStack[worstIdx].type = 'neutral';
          aftermathStack[worstIdx].magnitude = 0;
          aftermathStack[worstIdx].label = 'Zdravica (neutralizovano)';
          return { message: 'Pedja diže čašu — debuff neutralizovan!' };
        }
        return { message: 'Nema debuffova za neutralizovati.' };
      }
    },
    starterUnlocked: true,
    unlockCondition: null,
    portraitColor: '#eab308',
    portraitEmoji: '💛',
    shortDesc: 'Svako veče je priča.',
    flavorText: 'Posle deset godina, on je taj koji priča.'
  },

  mirko: {
    id: 'mirko',
    name: 'Mirko Multiresurs',
    archetype: 'Wildcard',
    stats: { E: 3, S: 3, P: 3, L: 3 },
    primaryRole: 'anchor',
    passiveTrait: {
      id: 'flexible',
      name: 'Fleksibilan',
      desc: 'Može popuniti bilo koju ulogu bez penala — nema role mismatch debuff',
      trigger: 'always',
      apply() {
        return { noRolePenalty: true };
      }
    },
    activeAbility: {
      id: 'adapt',
      name: 'Adaptacija',
      desc: 'Kopiraj stat bonus poslednjeg aktivnog crew member-a (1× po noći)',
      use(lastActiveMemberStats, state) {
        if (lastActiveMemberStats) {
          const bonusKey = Object.keys(lastActiveMemberStats).reduce(
            (best, k) => lastActiveMemberStats[k] > (lastActiveMemberStats[best] || 0) ? k : best,
            'E'
          );
          return { copiedStat: bonusKey, value: lastActiveMemberStats[bonusKey], message: `Mirko kopira ${bonusKey}: +${lastActiveMemberStats[bonusKey]}` };
        }
        return { message: 'Nema prethodnog bonus-a za kopirati.' };
      }
    },
    starterUnlocked: false,
    unlockCondition: 'xp_9',
    unlockConditionLabel: 'Osvoji 9 XP ukupno',
    portraitColor: '#94a3b8',
    portraitEmoji: '🎭',
    shortDesc: 'Jack of all trades.',
    flavorText: 'Nije najbolji ni u čemu, ali nikad ne zakaže.'
  },

  tanja: {
    id: 'tanja',
    name: 'Tanja Techno',
    archetype: 'DJ Adjacent',
    stats: { E: 2, S: 3, P: 5, L: 2 },
    primaryRole: 'dance_captain',
    passiveTrait: {
      id: 'bpm_locked',
      name: 'BPM Locked',
      desc: 'Dance scenariji +30% u SVIM fazama (ne samo Vrh)',
      trigger: 'scenario_resolve',
      scenarioType: 'P',
      apply(crewScore, scenario) {
        if (scenario.type === 'P') {
          return { scoreMultiplier: 1.30, message: 'Tanja je uvek u taktu — +30%!' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'drop',
      name: 'Drop',
      desc: 'Sledeći scenario postaje Dance tip (1× po noći)',
      use(state) {
        state.forceNextScenarioType = 'P';
        return { message: 'Tanja najavljuje drop — sledeći scenario je P!' };
      }
    },
    starterUnlocked: false,
    unlockCondition: 'bond_bojan_2',
    unlockConditionLabel: 'Bojan i Tanja — Bond nivo 2',
    portraitColor: '#f472b6',
    portraitEmoji: '🎧',
    shortDesc: 'Živi za 128 BPM.',
    flavorText: 'Pita šta pušta DJ, pa ga uči.'
  },

  stefan: {
    id: 'stefan',
    name: 'Stefan Stres',
    archetype: 'Anxious Organizer',
    stats: { E: 4, S: 2, P: 2, L: 5 },
    primaryRole: 'navigator',
    passiveTrait: {
      id: 'worst_case_prepared',
      name: 'Spreman na najgore',
      desc: 'Kad Night Score < 40, svi Logistics resolution +15%',
      trigger: 'scenario_resolve',
      scenarioType: 'L',
      apply(crewScore, scenario, phase, state) {
        if (scenario.type === 'L' && state.nightScore < 40) {
          return { scoreMultiplier: 1.15, message: 'Stefan aktivira krizni plan — +15%!' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'emergency_protocol',
      name: 'Vanredni protokol',
      desc: 'Briše ceo Aftermath stack odjednom (1× po noći)',
      use(aftermathStack) {
        const count = aftermathStack.length;
        aftermathStack.splice(0, aftermathStack.length);
        return { cleared: count, message: `Stefan aktivira protokol — ${count} aftermath-a uklonjeno!` };
      }
    },
    starterUnlocked: false,
    unlockCondition: 'nights_5',
    unlockConditionLabel: 'Završi 5 noći',
    portraitColor: '#ef4444',
    portraitEmoji: '😰',
    shortDesc: 'Uvek pita "a šta ako..."',
    flavorText: 'Ima backup plan za backup plan.'
  },

  ivana: {
    id: 'ivana',
    name: 'Ivana Influencer',
    archetype: 'Documenter',
    stats: { E: 3, S: 5, P: 2, L: 3 },
    primaryRole: 'hype',
    passiveTrait: {
      id: 'content_machine',
      name: 'Mašina za sadržaj',
      desc: 'Svaki WIN scenario daje +2 Night Score bonus',
      trigger: 'scenario_resolve',
      apply(outcome) {
        if (outcome === 'win') {
          return { scoreBonus: 2, message: 'Ivana beleži pobednički momenat — +2!' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'story_time',
      name: 'Story za Instagram',
      desc: 'Share Score multiplier +20% za ovu noć (1× po noći)',
      use(state) {
        state.shareScoreMultiplier = (state.shareScoreMultiplier || 1) * 1.2;
        return { message: 'Ivana pravi priču — Share Score +20%!' };
      }
    },
    starterUnlocked: false,
    unlockCondition: 'bond_ana_2',
    unlockConditionLabel: 'Ana i Ivana — Bond nivo 2',
    portraitColor: '#fb923c',
    portraitEmoji: '📸',
    shortDesc: 'Svaki momenat je content.',
    flavorText: 'Već razmišlja o kapšnu dok se dešava.'
  },

  guncati: {
    id: 'guncati',
    name: 'Guncati Lokalni',
    archetype: 'Rural Mystic',
    stats: { E: 4, S: 3, P: 1, L: 4 },
    primaryRole: 'logistics',
    passiveTrait: {
      id: 'rural_calm',
      name: 'Seoski mir',
      desc: 'Energy scenariji nikad ne daju Exhausted status — E floor ostaje 1',
      trigger: 'scenario_resolve',
      scenarioType: 'E',
      apply(outcome, scenario) {
        if (scenario.type === 'E') {
          return { preventExhausted: true, message: 'Guncati ostaje miran — nema Exhausted!' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'slow_down',
      name: 'Polako',
      desc: 'Pauzira Aftermath snowball za naredna 2 scenarija (1× po noći)',
      use(state) {
        state.aftermathFrozenFor = 2;
        return { message: 'Guncati smiriva situaciju — aftermath zamrznuti 2 scenarija!' };
      }
    },
    starterUnlocked: false,
    unlockCondition: 'prestige_1',
    unlockConditionLabel: 'Dostigni Prestige nivo 1',
    portraitColor: '#84cc16',
    portraitEmoji: '🌿',
    shortDesc: 'Donosi prirodni mir.',
    flavorText: 'Zna šta je važno. I šta nije.'
  },

  tonovic: {
    id: 'tonovic',
    name: 'Tonović DJ',
    archetype: 'Professional',
    stats: { E: 2, S: 4, P: 5, L: 1 },
    primaryRole: 'dance_captain',
    passiveTrait: {
      id: 'professional_ear',
      name: 'Profesionalno uvo',
      desc: 'Dance i Social scenariji daju dvostruki Night Score bonus',
      trigger: 'scenario_resolve',
      apply(outcome, scenario) {
        if ((scenario.type === 'P' || scenario.type === 'S') && outcome === 'win') {
          return { scoreMultiplier: 2.0, message: 'Tonović prepoznaje pravi zvuk — dvostruki bonus!' };
        }
        return null;
      }
    },
    activeAbility: {
      id: 'set_peak',
      name: 'Peak Set',
      desc: 'Sve preostale Vrh scenarije dobijaju +15% resolution (1× po noći)',
      use(state) {
        state.peakPhaseBonus = (state.peakPhaseBonus || 0) + 0.15;
        return { message: 'Tonović pustio peak set — Vrh +15% za ostatak noći!' };
      }
    },
    starterUnlocked: false,
    unlockCondition: 'achievement_legendary',
    unlockConditionLabel: 'Osvoji Legendarna noć achievement',
    portraitColor: '#6366f1',
    portraitEmoji: '🎵',
    isKluboslavijaCard: true,
    comingSoonFrom: 1,
    shortDesc: 'Pravi profesionalac.',
    flavorText: 'Zna razliku između dobrog i savršenog seta.'
  }
};

/**
 * Returns an array of starter-unlocked member IDs
 * @returns {string[]}
 */
export function getStarterMemberIds() {
  return Object.values(CREW_DATA)
    .filter(m => m.starterUnlocked)
    .map(m => m.id);
}

/**
 * Get member data by ID, safe
 * @param {string} id
 * @returns {Object|null}
 */
export function getMemberById(id) {
  return CREW_DATA[id] || null;
}
