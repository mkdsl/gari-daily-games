/**
 * synergies_data.js — Svih 12 sinergija za Avala Crew
 * 8 starter (vidljive od početka) + 4 unlock sinergije
 */

export const SYNERGIES_DATA = {

  // ============ STARTER SINERGIJE (vidljive od početka) ============

  SYN01: {
    id: 'SYN01',
    members: ['maja', 'ana'],
    name: 'Magnetar × Mreža',
    desc: 'Maja i Ana zajedno pojačavaju Social scenarije — energija plus konekcije.',
    shortDesc: '+20% S scenariji',
    visible: true,
    effect: {
      type: 'scenario_bonus',
      scenarioType: 'S',
      stat: 'S',
      bonus: 0.20,
      scope: 'social_scenarios',
      label: 'Magnetar × Mreža: S scenariji +20%'
    }
  },

  SYN02: {
    id: 'SYN02',
    members: ['dragan', 'lena'],
    name: 'Navigator × Domaći teren',
    desc: 'Dragan planira, Lena zna prečice. Logistika postaje neprobojiva.',
    shortDesc: 'L scenariji: uvek partial minimum',
    visible: true,
    effect: {
      type: 'floor_guarantee',
      scenarioType: 'L',
      minOutcome: 'partial',
      label: 'Navigator × Domaći teren: L scenariji min. partial'
    }
  },

  SYN03: {
    id: 'SYN03',
    members: ['bojan', 'maja'],
    name: 'Pod komandanta',
    desc: 'Bojan vodi, Maja inspiriše. Dance + Energy kombinacija eksplodira.',
    shortDesc: 'P+E scenariji: +2 Night Score bonus',
    visible: true,
    effect: {
      type: 'score_bonus',
      scenarioTypes: ['P', 'E'],
      scoreBonus: 2,
      label: 'Pod komandanta: +2 Night Score za P i E scenarije'
    }
  },

  SYN04: {
    id: 'SYN04',
    members: ['pedja', 'ana'],
    name: 'Srce i Mreža',
    desc: 'Pedja i Ana su tim koji drži grupu zajedno kada pritisak raste.',
    shortDesc: 'Aftermath debuff trajanje -1',
    visible: true,
    effect: {
      type: 'aftermath_reduction',
      durationReduction: 1,
      affectsType: 'debuff',
      label: 'Srce i Mreža: svi debuffovi -1 trajanje'
    }
  },

  SYN05: {
    id: 'SYN05',
    members: ['dragan', 'pedja'],
    name: 'Plan i Sećanje',
    desc: 'Dragan zna kuda idu, Pedja zna zašto idu. Ekipa ima svrhu.',
    shortDesc: 'Kraj svake faze: +8 Night Score',
    visible: true,
    effect: {
      type: 'phase_bonus',
      scoreBonus: 8,
      trigger: 'phase_end',
      label: 'Plan i Sećanje: +8 Night Score na kraju svake faze'
    }
  },

  SYN06: {
    id: 'SYN06',
    members: ['lena', 'ana'],
    name: 'Lokalna mreža',
    desc: 'Lena zna mesta, Ana zna ljude. Kombinacija koja otvara svaka vrata.',
    shortDesc: 'S+L scenariji: +15% resolution',
    visible: true,
    effect: {
      type: 'scenario_bonus',
      scenarioTypes: ['S', 'L'],
      bonus: 0.15,
      label: 'Lokalna mreža: S i L scenariji +15%'
    }
  },

  SYN07: {
    id: 'SYN07',
    members: ['maja', 'pedja'],
    name: 'Iskra i Toplina',
    desc: 'Maja pali vatru, Pedja je čuva. Energija koja ne nestaje.',
    shortDesc: 'E statistike ekipe: minimum 1 bez mogućnosti pada',
    visible: true,
    effect: {
      type: 'stat_floor',
      stat: 'E',
      floor: 1,
      label: 'Iskra i Toplina: E ne može pasti ispod 1'
    }
  },

  SYN08: {
    id: 'SYN08',
    members: ['bojan', 'lena'],
    name: 'Avala veterans',
    desc: 'Oboje su bili ovde ranije. Znaju gde su izlazi, gde je pod, gde je sve.',
    shortDesc: 'Svaki WIN u departure: +5 Night Score',
    visible: true,
    effect: {
      type: 'phase_win_bonus',
      phase: 'departure',
      scoreBonus: 5,
      label: 'Avala veterans: WIN u Rastanku +5 Night Score'
    }
  },

  // ============ UNLOCK SINERGIJE (skrivene dok se ne otključaju) ============

  SYN09: {
    id: 'SYN09',
    members: ['bojan', 'tanja'],
    name: 'Techno duo',
    desc: 'Bojan i Tanja na podu su neuhvatljivi. Dance scenariji u Peak fazi postaju skoro nezaustavljivi.',
    shortDesc: 'P scenariji u Peak: +40% resolution',
    visible: false,
    unlockCondition: 'bond_bojan_tanja_2',
    effect: {
      type: 'phase_scenario_bonus',
      phase: 'peak',
      scenarioType: 'P',
      bonus: 0.40,
      label: 'Techno duo: P scenariji u Vrhu +40%'
    }
  },

  SYN10: {
    id: 'SYN10',
    members: ['ana', 'ivana'],
    name: 'Content queendom',
    desc: 'Ana kreira prilike, Ivana ih beleži. Svaki WIN scenarij postaje PR momenat.',
    shortDesc: 'WIN scenariji: dvostruki Night Score',
    visible: false,
    unlockCondition: 'bond_ana_ivana_2',
    effect: {
      type: 'win_score_multiplier',
      multiplier: 2.0,
      label: 'Content queendom: WIN scenariji = dvostruki Night Score'
    }
  },

  SYN11: {
    id: 'SYN11',
    members: ['dragan', 'stefan'],
    name: 'Paranoja i plan',
    desc: 'Stefan strahuje od svega, Dragan ima plan za sve. Zajedno su neprobojna logistička sila.',
    shortDesc: 'L scenariji: fail nemoguć',
    visible: false,
    unlockCondition: 'nights_5_dragan_stefan',
    effect: {
      type: 'fail_immunity',
      scenarioType: 'L',
      label: 'Paranoja i plan: L scenariji nikad ne failuju'
    }
  },

  SYN12: {
    id: 'SYN12',
    members: ['tonovic', 'bojan'],
    name: 'Profesionalac i entuzijast',
    desc: 'Tonović DJ zna zanat, Bojan zna ljubav prema muzici. Zajedno su bridge između scene i publike.',
    shortDesc: 'Sve P+S scenariji: +30%, Night Score cap +10',
    visible: false,
    unlockCondition: 'unlock_tonovic',
    effect: {
      type: 'multi_bonus',
      scenarioTypes: ['P', 'S'],
      bonus: 0.30,
      scoreCapBonus: 10,
      label: 'Profesionalac i entuzijast: P+S +30%, score cap +10'
    }
  }
};

/**
 * Get all visible synergies (for roster preview)
 * @returns {Object[]}
 */
export function getVisibleSynergies() {
  return Object.values(SYNERGIES_DATA).filter(s => s.visible);
}

/**
 * Get synergy by ID safely
 * @param {string} id
 * @returns {Object|null}
 */
export function getSynergyById(id) {
  return SYNERGIES_DATA[id] || null;
}

/**
 * Get synergies that involve a specific member
 * @param {string} memberId
 * @returns {Object[]}
 */
export function getSynergiesForMember(memberId) {
  return Object.values(SYNERGIES_DATA).filter(s => s.members.includes(memberId));
}
