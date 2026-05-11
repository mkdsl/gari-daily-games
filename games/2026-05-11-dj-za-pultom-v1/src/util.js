// =============================================================================
// util.js — Pomocne funkcije
// =============================================================================

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function chance(p) {
  return Math.random() < p;
}

export function formatRSD(amount) {
  return new Intl.NumberFormat('sr-RS').format(Math.round(amount)) + ' RSD';
}

export function formatTier(value, max = 7) {
  return `Tier ${Math.floor(value)}/${max}`;
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  const a = attrs == null ? {} : attrs;
  for (const [key, val] of Object.entries(a)) {
    if (key === 'className') node.className = val;
    else if (key === 'style' && typeof val === 'object') Object.assign(node.style, val);
    else if (key.startsWith('on') && typeof val === 'function') node.addEventListener(key.slice(2).toLowerCase(), val);
    else if (key === 'dataset' && typeof val === 'object') Object.assign(node.dataset, val);
    else if (val !== null && val !== undefined && val !== false) node.setAttribute(key, val);
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      node.appendChild(child);
    }
  }
  return node;
}

export function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function pct(value, total = 100) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Symptom signal — convert hidden stat to gradient label
export function symptomSignal(value, max = 100) {
  const p = value / max;
  if (p > 0.75) return { label: 'zeleno', cls: 'sig-green' };
  if (p > 0.5)  return { label: 'zuto',   cls: 'sig-yellow' };
  if (p > 0.25) return { label: 'narandzasto', cls: 'sig-orange' };
  return { label: 'crveno', cls: 'sig-red' };
}

// Time pressure (hidden time budget → symptom)
export function pressureSignal(used, budget = 100) {
  const p = used / budget;
  if (p < 0.7)  return { label: 'lagana nedelja', cls: 'sig-green' };
  if (p < 0.9)  return { label: 'puna nedelja',   cls: 'sig-yellow' };
  if (p < 1.05) return { label: 'pritisak',       cls: 'sig-orange' };
  return { label: 'pucas',                        cls: 'sig-red' };
}
