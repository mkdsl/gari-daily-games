// systems/ending.js — Ending type logic

import { BRAND_CTAS } from '../content/brand_hooks.js';

/**
 * @param {number} vibeScore
 * @param {boolean} [crashed] - true if vibe hit 0 before final round
 * @returns {'legendary'|'solid'|'weak'|'crash'}
 */
export function getEndingType(vibeScore, crashed = false) {
  if (crashed || vibeScore <= 0) return 'crash';
  if (vibeScore >= 80)           return 'legendary';
  if (vibeScore >= 50)           return 'solid';
  return 'weak';
}

/**
 * @param {'legendary'|'solid'|'weak'|'crash'} type
 * @returns {string}
 */
export function getTagline(type) {
  switch (type) {
    case 'legendary': return 'Crew je spreman. Svi znaju šta im je posao.';
    case 'solid':     return 'Solidno. Malo još rada na sinergiji.';
    case 'weak':      return 'Sutra probaj ponovo. Crew se gradi vremenom.';
    case 'crash':     return 'Sutra probaj ponovo. Crew se gradi vremenom.';
    default:          return '';
  }
}

/**
 * Return brand CTA for the ending screen — differentiated by tier and event type.
 * Always returns a Guncati or MKDSLend hook; never empty.
 * @param {'legendary'|'solid'|'weak'|'crash'} type
 * @param {string} [eventType] - 'outdoor' | 'klub' | 'intimate'
 * @returns {{ text: string, url: string }}
 */
/** @returns {boolean} true during Guncati Grand Finale window (Aug 20–30, any year) */
function isGuncatiGrandWindow() {
  const now   = new Date();
  const month = now.getMonth(); // 0-indexed
  const day   = now.getDate();
  return month === 7 && day >= 20 && day <= 30; // August = 7
}

export function getCTA(type, eventType) {
  if (isGuncatiGrandWindow()) {
    return {
      text: 'Igrao si regrutera — 23.8. vidimo se na Guncati Grand Finalu. Masterclass prijave: guncati.rs',
      url:  'https://guncati.rs/masterclass',
      context: 'Guncati Grand Finale 2026 — povratak na selo.'
    };
  }

  const isOutdoor = eventType === 'outdoor';
  if (type === 'legendary') {
    return isOutdoor ? BRAND_CTAS.legendary_outdoor : BRAND_CTAS.legendary_default;
  }
  if (type === 'solid') {
    return isOutdoor ? BRAND_CTAS.solid_outdoor : BRAND_CTAS.solid_default;
  }
  // weak / crash — Guncati as a place that builds teams over time
  return BRAND_CTAS.weak_crash;
}

/** @type {Record<string, string[]>} */
const PHASE_LESSONS = {
  setup:      ['Setup je bio slab — sledeći put sastavi crew ranije.', 'Bez solidnog setufa, sve pada posle.'],
  soundcheck: ['Soundcheck je bio problem — Tonac mora biti spremniji.', 'Zvuk u soundchecku određuje noć.'],
  opening:    ['Opening nije zapalio publiku — Host mora biti bolji izbor.', 'Prva utisak je bio slab.'],
  climax:     ['Climax je sišao nizbrdo — to je bila ključna faza.', 'Vrhunac nije bio tu kad je trebalo.'],
  breakdown:  ['Breakdown je izneo crew — sinerija se raspadala.', 'Kraj večeri je bio previše haotičan.'],
  recap:      ['Recap je ostavio loš ukus — sitnice su se nagomilale.', 'Finale bez kontrole poništava sve pre.']
};

const GENERIC_CRASH_LESSONS = [
  'Crew bez sinergije se sipa pod pritiskom.',
  'Prazan slot u ključnoj fazi košta noć.',
  'Pravi tim se gradi pažljivo — ne žurom.'
];

/**
 * Find the phase with the largest negative vibe delta.
 * @param {Record<string, number>} phaseDeltas — { phaseName: vibeChange }
 * @returns {string|null} phase name or null if no negative deltas
 */
export function getWorstPhase(phaseDeltas) {
  if (!phaseDeltas) return null;
  let worst = null;
  let worstDelta = 0;
  for (const [phase, delta] of Object.entries(phaseDeltas)) {
    if (delta < worstDelta) { worstDelta = delta; worst = phase; }
  }
  return worst;
}

/**
 * Get a one-sentence diagnostic lesson for a crash/weak ending.
 * @param {string|null} worstPhase
 * @returns {string}
 */
export function getCrashLesson(worstPhase) {
  if (worstPhase && PHASE_LESSONS[worstPhase]) {
    const lines = PHASE_LESSONS[worstPhase];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  return GENERIC_CRASH_LESSONS[Math.floor(Math.random() * GENERIC_CRASH_LESSONS.length)];
}

/** @type {Record<string, Record<string, string>>} 3 event types × 4 ending types */
const EVENT_ENDINGS = {
  klub: {
    legendary: 'Jutro te zatiče sa still-hot mikserom i 400 zadovoljnih lica.',
    solid:     'Posao je urađen. Veći deo publike odlazi zadovoljan.',
    weak:      'Par sjajnih momenata. Sutra pokušaj ponovo.',
    crash:     'Nešto je krenulo naopako. Koji deo ćeš popraviti sledeći put?'
  },
  outdoor: {
    legendary: 'Sve pod nebom je kliknulo. Festival koji se pamti.',
    solid:     'Priroda je bila tu. Crew — uglavnom.',
    weak:      'Open air bez solidnog crew-a je izazov. Sledeći put — bolje.',
    crash:     'Kiša je počela u fazi 4. Niko nije imao plan B.'
  },
  intimate: {
    legendary: 'Intimno do bola. Svako lice u sali pamtiće ovu večer.',
    solid:     'Trideset ljudi. Svi su ostali do kraja, niko nije uzeo jaknu.',
    weak:      'Intimni format zahteva savršenu ekipu. Ova — skoro.',
    crash:     'Trideset gledalaca, trideset neispunjenih očekivanja.'
  }
};

/**
 * Event-specific epilog line — replaces generic tagline.
 * Falls back to getTagline() when eventType is unknown.
 * @param {'legendary'|'solid'|'weak'|'crash'} type
 * @param {string} [eventType]
 * @returns {string}
 */
export function getEventEpilog(type, eventType) {
  return EVENT_ENDINGS[eventType]?.[type] ?? getTagline(type);
}

/**
 * Return emoji flair for score display.
 * @param {'legendary'|'solid'|'weak'|'crash'} type
 * @returns {string}
 */
export function getEndingEmoji(type) {
  switch (type) {
    case 'legendary': return '🏆';
    case 'solid':     return '👍';
    case 'weak':      return '💪';
    case 'crash':     return '💥';
    default:          return '';
  }
}
