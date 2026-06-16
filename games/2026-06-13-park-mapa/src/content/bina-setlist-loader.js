let cachedSetlist = null;
let fetchPromise = null;

const SETLIST_FALLBACK = {
  season: 'Kluboslavija 2026',
  dates: [
    { date: '2026-06-20', venue: 'Avala', city: 'Beograd', url: 'https://app.bilet.rs/show/261', avala_exclusive: true },
    { date: '2026-07-15', venue: 'Štrand', city: 'Novi Sad', url: null },
    { date: '2026-08-10', venue: 'TBD', city: 'Sarajevo', url: null },
    { date: '2026-09-20', venue: 'Guncati', city: 'Guncati', url: null, grand_finale: true }
  ]
};

export async function fetchSetlist() {
  if (cachedSetlist) return cachedSetlist;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('./data/bina-setlist.json')
    .then(r => {
      if (!r.ok) throw new Error('Failed to load setlist');
      return r.json();
    })
    .then(data => {
      cachedSetlist = data;
      // Parse date objects
      cachedSetlist.parsedDates = data.dates.map(d => ({
        ...d,
        dateObj: new Date(d.date)
      }));
      return cachedSetlist;
    })
    .catch(err => {
      console.warn('[SetlistLoader] Could not load setlist, using fallback:', err);
      fetchPromise = null;
      cachedSetlist = SETLIST_FALLBACK;
      cachedSetlist.parsedDates = SETLIST_FALLBACK.dates.map(d => ({
        ...d,
        dateObj: new Date(d.date)
      }));
      return cachedSetlist;
    });

  return fetchPromise;
}

export function getCachedSetlist() {
  return cachedSetlist;
}

export function isAvalaWeek() {
  const avalaDate = new Date('2026-06-20');
  const now = new Date();
  const diffMs = Math.abs(now - avalaDate);
  return diffMs / (1000 * 60 * 60 * 24) <= 3;
}

export function getUpcomingEvents() {
  if (!cachedSetlist) return [];
  const now = new Date();
  return (cachedSetlist.parsedDates || [])
    .filter(d => d.dateObj >= now)
    .sort((a, b) => a.dateObj - b.dateObj);
}

export function getNextEvent() {
  const upcoming = getUpcomingEvents();
  return upcoming[0] || null;
}
