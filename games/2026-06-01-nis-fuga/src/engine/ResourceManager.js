/**
 * ResourceManager.js — Resource tracker + endings formula engine
 * Manages time, patience, morale, reputation and computes ending scores
 * @module ResourceManager
 */

import GameState, { RESOURCE_CAPS, RESOURCE_MINS } from '../utils/GameState.js';
import { getFlag } from '../utils/FlagManager.js';
import EventBus, { EVENTS } from './EventBus.js';

export const RESOURCE_LABELS = {
  time: 'Vreme',
  patience: 'Strpljenje',
  morale: 'Moral ekipe',
  reputation: 'Reputacija'
};

export const RESOURCE_UNITS = {
  time: 'min',
  patience: '',
  morale: '',
  reputation: ''
};

const CRITICAL_THRESHOLDS = {
  time: 10,
  patience: 1,
  morale: 1,
  reputation: null
};

/**
 * Apply effects from a dialog choice
 * @param {object} effects - { time, patience, morale, reputation, flag_set, complication }
 */
export function applyEffects(effects) {
  if (!effects) return {};

  const resourceDeltas = {};
  for (const key of ['time', 'patience', 'morale', 'reputation']) {
    if (key in effects && effects[key] !== 0) {
      resourceDeltas[key] = effects[key];
    }
  }

  let changed = {};
  if (Object.keys(resourceDeltas).length > 0) {
    changed = GameState.applyResourceDelta(resourceDeltas);

    // Emit resource change events
    for (const [key, change] of Object.entries(changed)) {
      EventBus.emit(EVENTS.RESOURCE_CHANGED, {
        resource: key,
        from: change.from,
        to: change.to,
        delta: change.delta
      });

      // Check critical thresholds
      const threshold = CRITICAL_THRESHOLDS[key];
      if (threshold !== null && change.to <= threshold && change.from > threshold) {
        EventBus.emit(EVENTS.RESOURCE_CRITICAL, { resource: key, value: change.to });
      }
    }
  }

  // Handle flag effects
  if (effects.flag_set) {
    const FlagManager = window.__flagManager__;
    if (FlagManager) {
      FlagManager.setFlag(effects.flag_set, true);
    } else {
      // Direct GameState fallback
      GameState.setFlag(effects.flag_set, true);
    }
  }

  // Handle scene 3 complication
  if (effects.complication) {
    GameState.addScene3Complication(effects.complication);
  }

  return changed;
}

/**
 * Check if a choice requirement is met
 * @param {object|null} requires - { reputation: N } or { flag: 'name' } or null
 * @returns {{ ok: boolean, reason: string|null }}
 */
export function checkRequirement(requires) {
  if (!requires) return { ok: true, reason: null };

  if ('reputation' in requires) {
    const val = GameState.getResource('reputation');
    if (val < requires.reputation) {
      return {
        ok: false,
        reason: `Treba reputacija ≥ ${requires.reputation} (imaš ${val})`
      };
    }
  }

  if ('patience' in requires) {
    const val = GameState.getResource('patience');
    if (val < requires.patience) {
      return {
        ok: false,
        reason: `Treba strpljenje ≥ ${requires.patience} (imaš ${val})`
      };
    }
  }

  if ('flag' in requires) {
    const val = getFlag(requires.flag);
    if (!val) {
      const labels = {
        setlista_printovana: 'setlista printovana',
        tonika_potvrdjeno: 'Tonika potvrđeno',
        bojan_happy: 'Bojan u kombiju'
      };
      return {
        ok: false,
        reason: `Potrebno: ${labels[requires.flag] ?? requires.flag}`
      };
    }
  }

  return { ok: true, reason: null };
}

/**
 * Check if time is depleted (hard fail condition)
 * @returns {boolean}
 */
export function isTimeDepleted() {
  return GameState.getResource('time') <= 0;
}

/**
 * Apply scene 3 complication to time (call at start of scene 5 if applicable)
 */
export function applyScene3Complication() {
  const minutes = GameState.getScene3Complication();
  if (minutes > 0) {
    const tokaPotvrdjen = getFlag('tonika_potvrdjeno');
    const actualMinus = tokaPotvrdjen ? 5 : minutes;
    const before = GameState.getResource('time');
    GameState.applyResourceDelta({ time: -actualMinus });
    const after = GameState.getResource('time');
    EventBus.emit(EVENTS.RESOURCE_CHANGED, {
      resource: 'time',
      from: before,
      to: after,
      delta: -actualMinus,
      reason: 'scene3_complication'
    });
  }
}

/**
 * Compute endings score and determine ending ID
 * E = time_left + (morale * 8) + (reputation * 4)
 * @returns {{ score: number, endingId: string, endingData: object }}
 */
export function computeEnding() {
  const state = GameState.raw();
  const { time, morale, reputation } = state.resources;
  const flags = state.flags;

  // Hard fail — time depleted
  if (time <= 0) {
    return {
      score: 0,
      endingId: 'hard_fail',
      endingData: ENDINGS.hard_fail
    };
  }

  const score = time + (morale * 8) + (reputation * 4);

  // Check secret endings first (override)
  if (reputation >= 4 && morale <= 1) {
    return {
      score,
      endingId: 'secret_s1',
      endingData: ENDINGS.secret_s1
    };
  }

  if (flags.bojan_happy && flags.setlista_printovana && score >= 50) {
    return {
      score,
      endingId: 'secret_s2',
      endingData: ENDINGS.secret_s2
    };
  }

  // Standard endings by score
  let endingId;
  if (score >= 70) endingId = 'legendarno';
  else if (score >= 50) endingId = 'solidno';
  else if (score >= 30) endingId = 'proslo_nekako';
  else endingId = 'chaos';

  return {
    score,
    endingId,
    endingData: ENDINGS[endingId]
  };
}

export const ENDINGS = {
  legendarno: {
    id: 'legendarno',
    title: 'Legendarno jutro',
    subtitle: 'Jedina ekipa koja je ikad stigla ranije od Gorana u Nišu.',
    text: 'Ton-majstor čeka sa kafom. Goran stoji kod miksete sa osmehom na licu koji nisi viđao pre. "Jedina ekipa koja je ikad stigla ranije od mene u Nišu." Soundcheck počinje u 13:48. Sve je savršeno podešeno do 15:00. Večeras će biti legendarno.',
    scoreRange: '70+',
    color: '#FFD700',
    ctaNote: null,
    replayNote: null
  },
  solidno: {
    id: 'solidno',
    title: 'Solidno jutro',
    subtitle: 'Panta je zapravo u publici večeras.',
    text: 'Stigli ste na vreme. Soundcheck ide standardno. Basista kaže "dosta dobro". Goran klimne glavom. Posle soundchecka, čuješ kako Panta iz kafane razgovara sa nekim u publici — navukao se. Solidno jutro.',
    scoreRange: '50-69',
    color: '#4A7FA5',
    ctaNote: null,
    replayNote: 'Bojan kaže da je dobro prošlo. Pitaš se da li je moglo bolje.'
  },
  proslo_nekako: {
    id: 'proslo_nekako',
    title: 'Prošlo je nekako',
    subtitle: 'Pet minuta pre soundchecka. Basista: "Half-soundcheck."',
    text: 'Trčite kroz Kapiju u 13:55. Basista gleda sat i izgovara "half-soundcheck" tonom čoveka kome to nije prvi put. Goran zavrne kepu. "Radimo." Prešlo je nekako — ali Niš zna razliku.',
    scoreRange: '30-49',
    color: '#E8A24A',
    ctaNote: null,
    replayNote: null
  },
  chaos: {
    id: 'chaos',
    title: 'Chaos morning',
    subtitle: 'Stigli šutljivi. Svira dobro ali jutro se oseti.',
    text: 'Ulazite na kapiju sa licem koje ne govori ništa dobrog. Nenad pravi korak u stranu bez reči. Goran ne pita ništa. Soundcheck je haotičan ali event na kraju prođe. Niš prašta. Ali pamti.',
    scoreRange: '10-29',
    color: '#C0392B',
    ctaNote: null,
    replayNote: null
  },
  hard_fail: {
    id: 'hard_fail',
    title: 'Nismo stigli',
    subtitle: '14:47 h. Goran: "Ovo nije prvi put."',
    text: 'Sat na telefonu pokazuje 14:47. Soundcheck je bio u 14:00. Goran podiže slušalicu i izgovara rečenicu koja se ne zaboravlja: "Ovo nije prvi put." Nišu ne sviđa kašnjenje. Ni vama.',
    scoreRange: 'time=0',
    color: '#2C2C2C',
    ctaNote: null,
    replayNote: 'Možda sledeći put... Niš čeka.',
    achievement: 'i_ovako_nekad_bude'
  },
  secret_s1: {
    id: 'secret_s1',
    title: 'Svi te vole, ekipa te mrzi',
    subtitle: 'Nišlije te obožavaju. Ekipa ti ne priča na povratku.',
    text: 'Dragoljub ti šalje sms posle eventa. Panta rezerviše sto za sledeći put. Bojan te hvali svim drugarima. Ekipa? Ekipa sedi u kombiju i gleda kroz prozor u tišini. Reputacija je sve. Moral je nešto drugo.',
    scoreRange: 'rep≥4, moral≤1',
    color: '#9B59B6',
    ctaNote: 'Ovo je tajna završnica.',
    replayNote: null,
    secret: true
  },
  secret_s2: {
    id: 'secret_s2',
    title: 'Niš nas je primio',
    subtitle: 'Bojan posveti pesmu Kluboslavija ekipi.',
    text: 'Na kraju prvog seta, Bojan staje pred mikrofon: "Ova sledeća je za ekipu koja me dovezla kad je Niva bila kod majstora. I za Baću Mileta. I za Panta, koji nam dao WiFi." Publika peva. Niš vas je primio.',
    scoreRange: 'bojan+setlista+score≥50',
    color: '#27AE60',
    ctaNote: null,
    replayNote: null,
    secret: true,
    achievement: 'tajni_gost'
  }
};

export default {
  applyEffects,
  checkRequirement,
  isTimeDepleted,
  applyScene3Complication,
  computeEnding,
  ENDINGS,
  RESOURCE_LABELS,
  RESOURCE_UNITS
};
