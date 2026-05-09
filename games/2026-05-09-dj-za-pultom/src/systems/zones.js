import { ZONES } from '../config.js';

/**
 * Pronađi zonu za dati elapsed_s.
 * Ako je elapsed_s van svih zona, vraća poslednju zonu.
 */
function findZone(elapsed_s) {
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (elapsed_s >= ZONES[i].start_s) return ZONES[i];
  }
  return ZONES[0];
}

/**
 * Proveri da li je tokom ovog ticka prešena granica između zona.
 * Vraća novi zone objekat AKO je prešao granicu, inače null.
 *
 * Koristi se u main.js da triggeruje zone transition animaciju/audio.
 */
export function checkZoneTransition(prevElapsed, newElapsed) {
  const prevZone = findZone(prevElapsed);
  const newZone = findZone(newElapsed);

  if (prevZone.id !== newZone.id) {
    return newZone;
  }

  return null;
}

/**
 * Koliko smo kroz trenutnu zonu — float 0.0 do 1.0.
 * Korisno za progress bar vizual u HUD-u.
 */
export function getZoneProgress(elapsed_s) {
  const zone = findZone(elapsed_s);
  const duration = zone.end_s - zone.start_s;
  if (duration <= 0) return 1.0;

  const progress = (elapsed_s - zone.start_s) / duration;
  return Math.min(1.0, Math.max(0.0, progress));
}

/**
 * Formatira sekunde u "HH:MM:SS" string za HUD sat.
 */
export function formatElapsed(elapsed_s) {
  const total = Math.floor(elapsed_s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const pad = n => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
