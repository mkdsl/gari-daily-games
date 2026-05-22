// event-feed.js — scrolling event ticker
const FADE_DURATION_MS = 3000;
const MAX_ITEMS = 5;

const shownEvents = new Set();

export function updateEventFeed(state) {
  const feed = document.getElementById('event-feed');
  if (!feed) return;

  for (const ev of state.dynamicEvents) {
    if (shownEvents.has(ev.id + ev.startTime)) continue;
    shownEvents.add(ev.id + ev.startTime);
    addFeedItem(feed, ev);
  }

  // Prune old items
  while (feed.children.length > MAX_ITEMS) {
    feed.removeChild(feed.firstChild);
  }
}

function addFeedItem(feed, ev) {
  const item = document.createElement('div');
  item.className = 'feed-item feed-item-enter';
  item.innerHTML = `<span class="feed-icon">${ev.icon || 'ℹ️'}</span> <strong>${ev.label}</strong> <span class="feed-desc">${ev.desc || ''}</span>`;
  feed.appendChild(item);

  // Fade out after duration
  const fadeDelay = (ev.duration * 1000) - FADE_DURATION_MS;
  setTimeout(() => {
    item.classList.add('feed-item-fade');
    setTimeout(() => item.remove(), FADE_DURATION_MS);
  }, Math.max(500, fadeDelay));
}

export function addFeedMessage(text, icon = 'ℹ️') {
  const feed = document.getElementById('event-feed');
  if (!feed) return;
  addFeedItem(feed, { label: text, icon, desc: '', duration: 5, startTime: Date.now() });
}

export function clearFeed() {
  shownEvents.clear();
  const feed = document.getElementById('event-feed');
  if (feed) feed.innerHTML = '';
}
