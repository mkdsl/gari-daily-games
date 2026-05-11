// parser.js — naming convention parser
// Format: BPM-KEY-name-BARS.opus
// Primer: "128-8A-acid_run-16.opus" -> {bpm:128, key:"8A", name:"acid_run", bars:16}

// strict regex: integer BPM, Camelot key (1A-12A ili 1B-12B),
// name = bilo koji [a-zA-Z0-9_]+, bars = 8 ili 16
const TRACK_NAME_RE = /^(\d{2,3})-(1[0-2]|[1-9])([AB])-([a-zA-Z0-9_]+)-(8|16)\.(opus|ogg|wav)$/;

/**
 * Parsira filename u TrackMeta. Vraca null ako naming nije valid.
 * @param {string} filename samo bazno ime fajla (bez putanje)
 * @returns {{bpm:number, key:string, name:string, bars:number, ext:string}|null}
 */
export function parseTrackName(filename) {
  // ocisti putanju ako je prosledena
  const base = filename.split('/').pop().split('\\').pop();
  const m = TRACK_NAME_RE.exec(base);
  if (!m) return null;
  const bpm = parseInt(m[1], 10);
  const camelotNum = parseInt(m[2], 10);
  const camelotLetter = m[3];
  const name = m[4];
  const bars = parseInt(m[5], 10);
  const ext = m[6];

  // validacija opsega
  if (bpm < 60 || bpm > 200) return null;
  if (camelotNum < 1 || camelotNum > 12) return null;
  if (bars !== 8 && bars !== 16) return null;

  return {
    bpm,
    key: `${camelotNum}${camelotLetter}`,
    name,
    bars,
    ext,
    filename: base,
  };
}

/**
 * Izracunaj trajanje track-a u sekundama na osnovu BPM-a i bara.
 * 1 bar = 4 beats; trajanje = (bars * 4 * 60) / bpm
 */
export function expectedDuration(bpm, bars) {
  return (bars * 4 * 60) / bpm;
}
