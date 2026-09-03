/** @fileoverview Seasonal arcs for each volunteer — 3 story beats tied to WB milestones, and finale crisis detection */

import { getVolunteerCrisisEvent } from './events_data.js';

/**
 * @typedef {Object} VolunteerArc
 * @property {string} typeId
 * @property {{ phase: 'start'|'mid'|'finale', wbThreshold: number, text: string, tone: 'positive'|'neutral'|'warning' }[]} beats
 */

/**
 * Seasonal story arcs for each volunteer.
 * Phase 'start' = weeks 1-3, 'mid' = weeks 4-7, 'finale' = weeks 8-10.
 * Displayed as micro-narrative toast or tooltip when the WB threshold is crossed.
 * @type {Record<string, VolunteerArc>}
 */
export const VOLUNTEER_ARCS = {
  ana: {
    typeId: 'ana',
    beats: [
      {
        phase: 'start',
        wbThreshold: 70,
        text: 'Ana je puna energije. "Kažite mi šta treba i da ne pitam dva puta." Ekipa to voli.',
        tone: 'positive'
      },
      {
        phase: 'mid',
        wbThreshold: 50,
        text: 'Ana počinje da misli za sebe. "Trebalo bi da probamo drugačije." Pazi — možda je u pravu.',
        tone: 'neutral'
      },
      {
        phase: 'finale',
        wbThreshold: 40,
        text: 'Ana radi tiho. Nema više pitanja — samo posao. Finale bez Aninog glasa je drugačije.',
        tone: 'warning'
      }
    ]
  },
  mika: {
    typeId: 'mika',
    beats: [
      {
        phase: 'start',
        wbThreshold: 70,
        text: 'Mika nosi dvostruko od svih. "Nije teško, samo treba hteti." Terenska legenda u nastajanju.',
        tone: 'positive'
      },
      {
        phase: 'mid',
        wbThreshold: 50,
        text: 'Mika jede manje. Kopanje ide sporije. Niko to ne kaže naglas, ali svi vide.',
        tone: 'neutral'
      },
      {
        phase: 'finale',
        wbThreshold: 40,
        text: 'Mika sedi. Za Miku koji nikad ne sedi — to je alarm. Hrana i odmor odmah.',
        tone: 'warning'
      }
    ]
  },
  jovana: {
    typeId: 'jovana',
    beats: [
      {
        phase: 'start',
        wbThreshold: 70,
        text: 'Jovana peva u kuhinji. Miris hrane širi se terendom. "Niko ne sme da ostane gladan." Tom Sawyer na delu.',
        tone: 'positive'
      },
      {
        phase: 'mid',
        wbThreshold: 50,
        text: 'Jovana kuva bez pesme. Hrana je dobra, ali ekipa primeti razliku. Investiraj u Zajednicu.',
        tone: 'neutral'
      },
      {
        phase: 'finale',
        wbThreshold: 40,
        text: 'Jovana pravi čorbu bez ideja. "Nema sastojaka, nema inspiracije." Kuhinja tone sa vibe-om.',
        tone: 'warning'
      }
    ]
  },
  dragan: {
    typeId: 'dragan',
    beats: [
      {
        phase: 'start',
        wbThreshold: 70,
        text: 'Dragan hvata magičan kadar na terenu. "Ovo je priča koja se mora ispričati." Guncati postaje vizualan brand.',
        tone: 'positive'
      },
      {
        phase: 'mid',
        wbThreshold: 50,
        text: 'Dragan snima manje. Kamera je o vratu, ali prst ne pritiska okidač. Vidi nešto što mu se ne sviđa.',
        tone: 'neutral'
      },
      {
        phase: 'finale',
        wbThreshold: 40,
        text: 'Dragan je ostavio kameru u torbi. Finale bez fotografa — to je gubitak koji se oseti godinama.',
        tone: 'warning'
      }
    ]
  },
  djule: {
    typeId: 'djule',
    beats: [
      {
        phase: 'start',
        wbThreshold: 70,
        text: 'Đule tera sve pred sobom. "Samo reci — kopa se ili nosi se." Fizički stub festivala na delu.',
        tone: 'positive'
      },
      {
        phase: 'mid',
        wbThreshold: 50,
        text: 'Đule radi sporije. Telo govori ono što on neće. Hrana je odgovor, ne reči.',
        tone: 'neutral'
      },
      {
        phase: 'finale',
        wbThreshold: 40,
        text: 'Đule sedi na kamenu i gleda teren. Mišići koji miruju u finalu — festival nema temelje.',
        tone: 'warning'
      }
    ]
  },
  maja: {
    typeId: 'maja',
    beats: [
      {
        phase: 'start',
        wbThreshold: 70,
        text: 'Maja hoda po terenu uz slušalice, ali osmeh govori — ovde je pravo mesto. "Finale će biti nezaboravno."',
        tone: 'positive'
      },
      {
        phase: 'mid',
        wbThreshold: 50,
        text: 'Maja je tiša. Playlist radi automatski. Finale je bliže, ali nešto je promenilo tempo.',
        tone: 'neutral'
      },
      {
        phase: 'finale',
        wbThreshold: 40,
        text: 'Maja je spustila volumen. Kada DJ stišava — publika to čuje pre nego što razume zašto.',
        tone: 'warning'
      }
    ]
  },
  biljana: {
    typeId: 'biljana',
    beats: [
      {
        phase: 'start',
        wbThreshold: 70,
        text: 'Biljana ima 3 liste i backup. "Sve je pod kontrolom — pitaj me bilo što." Festival ima kičmu.',
        tone: 'positive'
      },
      {
        phase: 'mid',
        wbThreshold: 50,
        text: 'Biljana preskače kolone u listi. Maleni znaci haosa koje samo ona vidi. Logistika škripi.',
        tone: 'neutral'
      },
      {
        phase: 'finale',
        wbThreshold: 40,
        text: 'Biljana je ostavila listu polu-praznu. Raspored koji stane — festival koji ne zna šta sledi.',
        tone: 'warning'
      }
    ]
  }
};

/**
 * Get the story beat for a volunteer at the current game phase and WB level.
 * @param {string} typeId
 * @param {'start'|'mid'|'finale'} phase - determined from week: 1-3=start, 4-7=mid, 8-10=finale
 * @param {number} wbLevel - current WB (0-100)
 * @returns {{ text: string, tone: 'positive'|'neutral'|'warning' } | null}
 */
export function getVolunteerBeat(typeId, phase, wbLevel) {
  const arc = VOLUNTEER_ARCS[typeId];
  if (!arc) return null;
  const beat = arc.beats.find(b => b.phase === phase);
  if (!beat) return null;
  if (wbLevel < beat.wbThreshold - 30) {
    return { text: beat.text, tone: 'warning' };
  }
  if (wbLevel >= beat.wbThreshold) {
    return { text: beat.text, tone: beat.tone };
  }
  return null;
}

/**
 * Map week number to phase label
 * @param {number} week - 1-indexed
 * @returns {'start'|'mid'|'finale'}
 */
export function weekToPhase(week) {
  if (week <= 3) return 'start';
  if (week <= 7) return 'mid';
  return 'finale';
}

/**
 * Get all beats currently "active" for a set of volunteers
 * @param {Object[]} volunteers - state.volunteers
 * @param {number} week - current week number
 * @returns {Array<{ volunteerId: string, name: string, text: string, tone: string }>}
 */
export function getActiveBeats(volunteers, week) {
  const phase = weekToPhase(week);
  const results = [];
  for (const vol of volunteers) {
    const wb = ((vol.energija || 0) + (vol.vibe || 0)) / 2;
    const beat = getVolunteerBeat(vol.typeId, phase, wb);
    if (beat) {
      results.push({ volunteerId: vol.id, name: vol.name, ...beat });
    }
  }
  return results;
}

/**
 * Get volunteer-specific crisis events for all volunteers with WB < 30% during the finale.
 * These are personal breakdown moments the player must resolve in real-time.
 * @param {Object[]} volunteers - state.volunteers (with energija, vibe, typeId, id, name)
 * @returns {Array<{ volunteerId: string, name: string, event: Object }>}
 */
export function getVolunteerCrisisEvents(volunteers) {
  const results = [];
  for (const vol of volunteers) {
    const wb = ((vol.energija || 0) + (vol.vibe || 0)) / 2;
    if (wb < 30) {
      const event = getVolunteerCrisisEvent(vol.typeId);
      if (event) {
        results.push({ volunteerId: vol.id, name: vol.name, event });
      }
    }
  }
  return results;
}
