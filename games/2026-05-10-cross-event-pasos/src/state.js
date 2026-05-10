// state.js — localStorage load/save, wraps pasos-sdk
import { utisniPecat, imaPecat } from '../pasos-sdk.js';
import {
  STAMPS, REWARD_THRESHOLDS,
  STORAGE_PREFIX, STORAGE_PROFILE, STORAGE_REWARDS,
  STORAGE_STATE, STORAGE_CREW
} from './config.js';

function safeGet(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

function safeSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch { return false; }
}

// ─── Profile ────────────────────────────────────────────────────────────────

export function loadProfile() {
  return safeGet(STORAGE_PROFILE);
}

export function saveProfile(name) {
  const profile = { name, created: new Date().toISOString().slice(0, 10) };
  safeSet(STORAGE_PROFILE, profile);
  return profile;
}

export function isFirstVisit() {
  return !safeGet(STORAGE_PROFILE);
}

// ─── Stamps ─────────────────────────────────────────────────────────────────

export function loadStampRecord(slug) {
  // SDK koristi 'pasos_stamp_' prefix — čitamo odatle
  return safeGet(STORAGE_PREFIX + slug);
}

export function claimStamp(slug) {
  if (imaPecat(slug)) return { success: false, error: 'ALREADY_CLAIMED' };
  const result = utisniPecat(slug, { method: 'manual' });
  if (!result.success) return result;
  updateRewards();
  persistFullState();
  return { success: true };
}

export function isStampClaimed(slug) {
  // Provjeri i SDK zapis i naš manual zapis (isti key)
  return imaPecat(slug);
}

export function getClaimedCount() {
  return STAMPS.filter(s => isStampClaimed(s.slug)).length;
}

// ─── Rewards ────────────────────────────────────────────────────────────────

export function loadRewards() {
  return safeGet(STORAGE_REWARDS) || { avatar_frame: false, ekipni_covek: false, crew_member: false };
}

export function updateRewards() {
  const count = getClaimedCount();
  const current = loadRewards();
  const updated = { ...current };
  const newlyUnlocked = [];

  for (const [key, threshold] of Object.entries(REWARD_THRESHOLDS)) {
    if (count >= threshold && !current[key]) {
      updated[key] = true;
      newlyUnlocked.push(key);
    }
  }

  if (newlyUnlocked.length) {
    safeSet(STORAGE_REWARDS, updated);
    if (updated.crew_member) {
      try { localStorage.setItem(STORAGE_CREW, 'true'); } catch {}
    }
  }

  return { rewards: updated, newlyUnlocked };
}

// ─── Full state persist (za export) ─────────────────────────────────────────

export function persistFullState() {
  const stamps = {};
  STAMPS.forEach(s => { stamps[s.slug] = loadStampRecord(s.slug); });
  const state = {
    profile: loadProfile(),
    stamps,
    rewards: loadRewards(),
    exported_at: new Date().toISOString()
  };
  safeSet(STORAGE_STATE, state);
  return state;
}

export function importState(json) {
  // Merge: nikad ne briši postojeće pečate
  if (json.stamps) {
    for (const [slug, record] of Object.entries(json.stamps)) {
      if (record && record.claimed && !isStampClaimed(slug)) {
        safeSet(STORAGE_PREFIX + slug, record);
      }
    }
  }
  if (json.profile && !loadProfile()) {
    safeSet(STORAGE_PROFILE, json.profile);
  }
  updateRewards();
  persistFullState();
}
