let cachedSetlist = null;
let fetchPromise = null;

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
      console.warn('[SetlistLoader] Could not load setlist:', err);
      fetchPromise = null;
      return null;
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
