/**
 * utils.js — Helpers: RNG sa seedom, lerp, clamp, formatters
 */

// === SEEDED RNG (mulberry32) ===
/**
 * Kreira seeded RNG funkciju
 * @param {number} seed
 * @returns {function(): number} — vraca float [0,1)
 */
export function createRng(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Global RNG (reseedable)
let _rng = createRng(Date.now());

export function reSeed(seed) {
  _rng = createRng(seed);
}

/** Vraca float [0, 1) */
export function random() {
  return _rng();
}

/** Vraca int [min, max] ukljucivo */
export function randomInt(min, max) {
  return Math.floor(_rng() * (max - min + 1)) + min;
}

/** Vraca float [min, max) */
export function randomFloat(min, max) {
  return _rng() * (max - min) + min;
}

/** Bira random element iz niza */
export function pick(arr) {
  return arr[Math.floor(_rng() * arr.length)];
}

/** Shuffla niz in-place (Fisher-Yates) */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(_rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Weighted random choice: items = [{item, weight}] */
export function weightedPick(items) {
  const total = items.reduce((s, x) => s + x.weight, 0);
  let r = _rng() * total;
  for (const x of items) {
    r -= x.weight;
    if (r <= 0) return x.item;
  }
  return items[items.length - 1].item;
}

// === MATH HELPERS ===
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

export function smoothstep(t) {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
}

export function mapRange(v, inMin, inMax, outMin, outMax) {
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// === FORMATTERS ===
/**
 * Format valuta: 1234 -> "1.234 €"
 */
export function formatEur(amount) {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M €';
  if (amount >= 1000)    return (amount / 1000).toFixed(1) + 'K €';
  return Math.round(amount) + ' €';
}

/**
 * Format procenat: 0.75 -> "75%"
 */
export function formatPct(ratio, decimals = 0) {
  return (ratio * 100).toFixed(decimals) + '%';
}

/**
 * Format vreme sesije: minuta od pocetka -> "08:45"
 */
export function formatSessionTime(minutesFromStart, startHour = 8) {
  const totalMinutes = startHour * 60 + minutesFromStart;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format duration: minuta -> "2h 15min"
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/**
 * Format broj sa separatorom: 12345 -> "12.345"
 */
export function formatNum(n) {
  return Math.round(n).toLocaleString('sr-RS');
}

/**
 * Reputation display: 0-1000, zaokruzeno
 */
export function formatRep(rep) {
  return `${Math.round(rep)} rep`;
}

// === DATE HELPERS ===
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// === DOM HELPERS ===
export function el(selector, parent = document) {
  return parent.querySelector(selector);
}

export function els(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function createEl(tag, classes = '', attrs = {}) {
  const e = document.createElement(tag);
  if (classes) e.className = classes;
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

export function clearEl(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

// === DEEP CLONE ===
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// === THROTTLE ===
export function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      return fn(...args);
    }
  };
}

// === EASING ===
export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeOutElastic(t) {
  const c4 = (2 * Math.PI) / 3;
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// === PRESTIGE MULTIPLIER ===
export function prestigeMultiplier(level) {
  return 1.0 + (level * 0.10) + (Math.pow(level, 1.3) * 0.03);
}

// === SATISFACTION REP MODIFIER ===
import { SATISFACTION_REP_MODIFIERS } from './config.js';

export function getSatisfactionRepModifier(satisfactionRatio) {
  let mod = 0;
  for (const entry of SATISFACTION_REP_MODIFIERS) {
    if (satisfactionRatio >= entry.threshold) mod = entry.multiplier;
  }
  return mod;
}

// === COLOR HELPERS ===
export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

export function lerpColor(hex1, hex2, t) {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  return rgbToHex(
    lerp(a.r, b.r, t),
    lerp(a.g, b.g, t),
    lerp(a.b, b.b, t)
  );
}
