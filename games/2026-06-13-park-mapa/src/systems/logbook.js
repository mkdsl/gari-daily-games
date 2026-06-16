/**
 * logbook.js — Permanent logbook: add entries, query, export/import
 * Park Mapa | Jova jQuery
 *
 * Logbook is append-only and never resets.  All entries live in state.logbook
 * (an array).  Persistence is handled by savegame.js — this module only
 * manipulates the in-memory array.
 *
 * Entry shape:
 *   {
 *     id:          string   — globally unique (prevents duplicate entries)
 *     category:    string   — one of LOGBOOK_CATEGORIES
 *     title:       string   — display title
 *     content:     string   — 1-3 sentences of flavour / lore
 *     zoneId:      string|null
 *     date:        string   — 'YYYY-MM-DD' of discovery
 *     unlockedAt:  number   — Date.now() timestamp of first unlock
 *   }
 */

import { CONFIG } from '../config.js';

// ─── Category constants ────────────────────────────────────────────────────────

/** Valid logbook entry categories. */
export const LOGBOOK_CATEGORIES = Object.freeze([
  'mini-price',      // Zone mini-stories unlocked via check-in
  'lore-fragment',   // NPC mission rewards
  'egg-zapis',       // First-collect record for each egg type
  'zona-milestone',  // Zone level-up milestones
  'exclusive',       // One-time event / brand exclusive entries
]);

// ─── Core CRUD ────────────────────────────────────────────────────────────────

/**
 * Ensure state.logbook is initialised.
 * @param {Object} state
 */
function ensureLogbook(state) {
  if (!Array.isArray(state.logbook)) {
    state.logbook = [];
  }
}

/**
 * Add a new logbook entry.  Silently skips duplicate IDs (idempotent).
 *
 * @param {Object} state
 * @param {{
 *   id:       string,
 *   category: string,
 *   title:    string,
 *   content:  string,
 *   zoneId?:  string|null,
 *   date?:    string
 * }} entry
 * @returns {boolean}  true if added, false if duplicate
 */
export function addLogbookEntry(state, entry) {
  ensureLogbook(state);

  if (state.logbook.some(e => e.id === entry.id)) {
    return false; // Already unlocked — no-op
  }

  const today = new Date().toISOString().slice(0, 10);

  state.logbook.push({
    id:         entry.id,
    category:   entry.category,
    title:      entry.title,
    content:    entry.content,
    zoneId:     entry.zoneId ?? null,
    date:       entry.date ?? today,
    unlockedAt: Date.now(),
  });

  return true;
}

/**
 * Query logbook entries with optional filters.
 * Results are sorted newest-first (by unlockedAt).
 *
 * @param {Object} state
 * @param {{ category?: string, zoneId?: string, dateStr?: string }|null} [filter]
 * @returns {Array}
 */
export function getLogbookEntries(state, filter) {
  ensureLogbook(state);

  let entries = state.logbook.slice();

  if (filter?.category) {
    entries = entries.filter(e => e.category === filter.category);
  }
  if (filter?.zoneId !== undefined && filter.zoneId !== null) {
    entries = entries.filter(e => e.zoneId === filter.zoneId);
  }
  if (filter?.dateStr) {
    entries = entries.filter(e => e.date === filter.dateStr);
  }

  return entries.sort((a, b) => b.unlockedAt - a.unlockedAt);
}

/**
 * Check whether a specific entry ID has been unlocked.
 * @param {Object} state
 * @param {string} entryId
 * @returns {boolean}
 */
export function isLogbookEntryUnlocked(state, entryId) {
  ensureLogbook(state);
  return state.logbook.some(e => e.id === entryId);
}

/**
 * Count logbook entries, optionally filtered by category.
 * @param {Object} state
 * @param {string} [category]  If omitted, counts all entries.
 * @returns {number}
 */
export function getLogbookCount(state, category) {
  ensureLogbook(state);
  if (!category) return state.logbook.length;
  return state.logbook.filter(e => e.category === category).length;
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Add a zone mini-story entry (category: 'mini-price').
 * storyIndex is 0-based; display title shows it as 1-based.
 *
 * @param {Object} state
 * @param {string} zoneId
 * @param {number} storyIndex  0-based index of the story (0..4 for V0.3)
 * @param {string} storyText   The story body text (1-3 sentences)
 * @returns {boolean}
 */
export function addMiniStoryEntry(state, zoneId, storyIndex, storyText) {
  const displayName = CONFIG.ZONE_DISPLAY_NAMES?.[zoneId] ?? zoneId;
  return addLogbookEntry(state, {
    id:       `story_${zoneId}_${storyIndex}`,
    category: 'mini-price',
    title:    `${displayName} — Priča ${storyIndex + 1}`,
    content:  storyText,
    zoneId,
  });
}

/**
 * Record the first discovery of an egg type (category: 'egg-zapis').
 * One logbook entry per egg type ID, not per individual egg.
 *
 * @param {Object} state
 * @param {{ type: { id: string, name: string, desc: string } }} egg
 * @returns {boolean}
 */
export function addEggEntry(state, egg) {
  return addLogbookEntry(state, {
    id:       `egg_type_${egg.type.id}`,
    category: 'egg-zapis',
    title:    egg.type.name,
    content:  egg.type.desc,
    zoneId:   null,
  });
}

/**
 * Record a zone reaching a new level (category: 'zona-milestone').
 * Entry ID encodes both zone and level to allow one entry per transition.
 *
 * @param {Object} state
 * @param {string} zoneId
 * @param {number} level  The NEW level just reached (2–5)
 * @returns {boolean}
 */
export function addZoneMilestone(state, zoneId, level) {
  const displayName = CONFIG.ZONE_DISPLAY_NAMES?.[zoneId] ?? zoneId;
  return addLogbookEntry(state, {
    id:       `milestone_${zoneId}_lvl${level}`,
    category: 'zona-milestone',
    title:    `${displayName} — Nivo ${level}`,
    content:  `Zona ${displayName} je dostigla nivo ${level}. ${_milestoneFlavor(zoneId, level)}`,
    zoneId,
  });
}

/**
 * Add a brand-exclusive logbook entry (category: 'exclusive').
 * Used for Avala 2026, Guncati Finale, etc.
 *
 * @param {Object} state
 * @param {string} id        Unique entry ID (e.g. 'avala-2026-badge')
 * @param {string} title
 * @param {string} content
 * @param {string|null} [zoneId]
 * @returns {boolean}
 */
export function addExclusiveEntry(state, id, title, content, zoneId = null) {
  return addLogbookEntry(state, {
    id,
    category: 'exclusive',
    title,
    content,
    zoneId,
  });
}

/**
 * Add a lore fragment entry from an NPC mission reward (category: 'lore-fragment').
 *
 * @param {Object} state
 * @param {string} npcId      e.g. 'vlado', 'mara', 'ace', 'djordje'
 * @param {string} fragmentId Unique fragment id (mission-scoped)
 * @param {string} title
 * @param {string} content
 * @param {string|null} [zoneId]
 * @returns {boolean}
 */
export function addLoreFragment(state, npcId, fragmentId, title, content, zoneId = null) {
  return addLogbookEntry(state, {
    id:       `lore_${npcId}_${fragmentId}`,
    category: 'lore-fragment',
    title,
    content,
    zoneId,
  });
}

// ─── Export / Import ─────────────────────────────────────────────────────────

/**
 * Serialise the full logbook to a JSON string suitable for user export.
 * @param {Object} state
 * @returns {string}
 */
export function exportLogbook(state) {
  ensureLogbook(state);
  return JSON.stringify({ version: 1, logbook: state.logbook }, null, 2);
}

/**
 * Import logbook entries from a previously exported JSON string.
 * Only entries not already present (by ID) are merged in.
 * Returns { added, skipped } counts.
 *
 * @param {Object} state
 * @param {string} jsonStr
 * @returns {{ added: number, skipped: number }}
 */
export function importLogbook(state, jsonStr) {
  ensureLogbook(state);

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { added: 0, skipped: 0 };
  }

  if (!Array.isArray(parsed?.logbook)) {
    return { added: 0, skipped: 0 };
  }

  let added = 0;
  let skipped = 0;

  for (const entry of parsed.logbook) {
    if (!entry?.id || !entry?.category) {
      skipped++;
      continue;
    }
    const wasAdded = addLogbookEntry(state, entry);
    if (wasAdded) added++;
    else skipped++;
  }

  return { added, skipped };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Short flavour text for a zone milestone entry.
 * @param {string} zoneId
 * @param {number} level
 * @returns {string}
 */
function _milestoneFlavor(zoneId, level) {
  const flavors = {
    pult: [
      '',
      'Lampioni su uključeni. Neon počinje da treperi.',
      'Equalizer pulsira. Prva silueta je stigla.',
      'Neon natpis "PULT" svetli noću.',
      'Holografski sjaj puni celu zonu. Park nikad nije bio ovakav.',
    ],
    bina: [
      '',
      'Spotlight pada na praznu pozornicu.',
      'Akustični talasi se šire. Ace je tu.',
      'Setlist Tabla postaje vidljiva. Datumi su stvarni.',
      'Zvezdani spotlight. Bina je dostigla legendarni status.',
    ],
    suma: [
      '',
      'Tri bioluminiscentne tačke počinju da pulsiraju.',
      'Lišće pada. Mara hoda starim puteljcima.',
      'Baterijska lampa prati svaki korak u šumi.',
      'Šuma živi. Bioluminiscentne životinje svetle iz tame.',
    ],
  };

  const zFlavors = flavors[zoneId];
  if (zFlavors && level >= 1 && level <= 5) {
    return zFlavors[level - 1] || 'Park raste.';
  }
  return 'Park raste.';
}
