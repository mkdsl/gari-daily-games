// =============================================================================
// boot-trace.mjs — Simulate the browser DOM well enough to trace what main.js does
// =============================================================================
// Run: node scripts/boot-trace.mjs

class FakeNode {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.attrs = {};
    this.dataset = {};
    this.style = {};
    this.firstChild = null;
    this.classList_ = new Set();
    this.textContent_ = '';
    this.parent = null;
    this._listeners = {};
  }
  get className() { return [...this.classList_].join(' '); }
  set className(v) { this.classList_ = new Set(String(v).split(/\s+/).filter(Boolean)); }
  appendChild(child) {
    if (!child) return;
    this.children.push(child);
    child.parent = this;
    this.firstChild = this.children[0] || null;
    return child;
  }
  removeChild(child) {
    const i = this.children.indexOf(child);
    if (i >= 0) this.children.splice(i, 1);
    this.firstChild = this.children[0] || null;
    return child;
  }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(ev, cb) { (this._listeners[ev] = this._listeners[ev] || []).push(cb); }
  querySelector(sel) { return null; }
  remove() { if (this.parent) this.parent.removeChild(this); }
  innerHTML_get() {
    const attrStr = Object.entries(this.attrs).map(([k, v]) => ` ${k}="${v}"`).join('');
    const cls = this.className ? ` class="${this.className}"` : '';
    const inner = this.children.map(c => c.outerHTML || c.textContent_ || '').join('');
    return `<${this.tag}${cls}${attrStr}>${inner}</${this.tag}>`;
  }
  get outerHTML() { return this.innerHTML_get(); }
  get innerHTML() {
    return this.children.map(c => c.outerHTML || c.textContent_ || '').join('');
  }
}

class FakeText {
  constructor(text) { this.textContent_ = text; }
  get outerHTML() { return this.textContent_; }
}

const fakeBody = new FakeNode('body');
const fakeApp = new FakeNode('main');
fakeApp.attrs.id = 'app';
fakeBody.appendChild(fakeApp);

global.document = {
  readyState: 'complete',
  body: fakeBody,
  addEventListener: () => {},
  getElementById: (id) => (id === 'app' ? fakeApp : null),
  createElement: (tag) => new FakeNode(tag),
  createTextNode: (txt) => new FakeText(String(txt))
};
global.window = {};
global.Node = FakeNode;
global.localStorage = {
  _d: {},
  getItem(k) { return this._d[k] ?? null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; }
};

const BASE = new URL('..', import.meta.url).pathname;

console.log('--- importing main.js ---');
try {
  await import(BASE + 'src/main.js');
} catch (e) {
  console.error('IMPORT ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
}
console.log('--- main.js loaded (boot should have run) ---');

console.log('app children count:', fakeApp.children.length);
console.log('app innerHTML (first 2000 chars):');
console.log(fakeApp.innerHTML.substring(0, 2000));

// Simulate clicking "Nova karijera"
function findButton(node, label) {
  if (!node || !node.children) return null;
  if (node.tag === 'button') {
    const txt = node.children.map(c => c.textContent_ || '').join('');
    if (txt.includes(label)) return node;
  }
  for (const c of node.children) {
    const r = findButton(c, label);
    if (r) return r;
  }
  return null;
}

console.log('\n--- Click "Pojacaj" in cinematic ---');
const cineBtn = findButton(fakeApp, 'Pojacaj');
if (cineBtn && cineBtn._listeners.click) {
  try {
    // Patch requestAnimationFrame / classList for cinematic-audio if needed
    global.requestAnimationFrame = global.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
    cineBtn._listeners.click[0]();
    // Cinematic uses 1.5s setTimeout to transition. Use small wait.
    await new Promise(r => setTimeout(r, 1700));
    console.log('app innerHTML after Pojacaj (first 1500 chars):');
    console.log(fakeApp.innerHTML.substring(0, 1500));
  } catch (e) {
    console.error('CLICK ERROR:', e.message);
    console.error(e.stack);
  }
} else {
  console.log('No Pojacaj button found');
}

// We're now in Origin scene. Check first 9 preset cards visible.
console.log('\n--- Check ORIGIN preset cards ---');
function findAllButtons(node) {
  const out = [];
  if (!node || !node.children) return out;
  if (node.tag === 'button') out.push(node);
  for (const c of node.children) out.push(...findAllButtons(c));
  return out;
}
const allBtns = findAllButtons(fakeApp);
console.log('total buttons in scene:', allBtns.length);
// Click first preset
const punkBtn = findButton(fakeApp, 'Punk → DJ');
if (punkBtn && punkBtn._listeners.click) {
  console.log('Found Punk → DJ preset card. Clicking...');
  try {
    punkBtn._listeners.click[0]();
    console.log('After preset click — scene still in origin? Buttons:', findAllButtons(fakeApp).length);
  } catch (e) {
    console.error('PRESET CLICK ERROR:', e.message);
  }
} else {
  console.log('No "Punk → DJ" preset button found');
}
