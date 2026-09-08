/**
 * @module characters — Brana, putnik, Pera CSS pixel sprite-ovi
 */

_injectCSS();

const SCALE = 4; // px per "pixel"

/**
 * @param {'brana'|'putnik'|'pera'} type
 * @returns {HTMLElement}
 */
export function createCharacter(type) {
  const cfg = CONFIGS[type];
  const wrap = document.createElement('div');
  wrap.className = `character character-${type}`;
  if (!cfg) return wrap;

  wrap.style.cssText = `
    width:${cfg.w}px; height:${cfg.h}px;
    display:inline-block; position:relative; flex-shrink:0;
  `;
  const dot = document.createElement('div');
  dot.style.cssText = `
    width:1px; height:1px; position:absolute; top:0; left:0;
    box-shadow:${cfg.pixels};
  `;
  wrap.appendChild(dot);
  return wrap;
}

/**
 * @param {string[]} lines
 * @returns {HTMLElement}
 */
export function createBranaCard(lines) {
  const el = document.createElement('div');
  el.className = 'brana-card';
  el.style.cssText = `
    display:flex; align-items:flex-start; gap:0.75rem;
    background:rgba(0,0,0,0.45); border-radius:10px;
    padding:0.75rem 1rem; max-width:340px;
    border-left:3px solid #5a7a2a;
    animation:branaSlide 0.35s ease-out;
  `;
  const sprite = createCharacter('brana');
  el.appendChild(sprite);

  const text = document.createElement('div');
  text.style.cssText = 'flex:1; font-size:0.88rem; line-height:1.55;';
  lines.forEach(line => {
    const p = document.createElement('p');
    p.style.margin = '0 0 0.35rem';
    p.textContent = line;
    text.appendChild(p);
  });
  el.appendChild(text);
  return el;
}

/** @returns {HTMLElement} */
export function createPutnik() {
  return createCharacter('putnik');
}

// ── Pixel art ───────────────────────────────────────────────────────────────

function px(col, row, color) {
  return `${col * SCALE}px ${row * SCALE}px 0 ${SCALE - 1}px ${color}`;
}

function build(grid, palette) {
  const shadows = [];
  grid.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch === ' ' || ch === '.') return;
      shadows.push(px(c + 1, r + 1, palette[ch] || '#fff'));
    });
  });
  return shadows.join(',');
}

const CONFIGS = {
  brana: (() => {
    const p = { H:'#8B5E3C', S:'#f5d0a9', B:'#4a7c2a', J:'#2a4d1a', E:'#333' };
    const g = [
      '  HHH  ',
      ' HHHHH ',
      ' SSSSS ',
      ' SESES ',
      ' SSSSS ',
      '  BBB  ',
      ' BBBBB ',
      ' BJJJB ',
      '  J J  ',
      '  J J  ',
    ];
    return { w: 9*SCALE, h: 10*SCALE, pixels: build(g, p) };
  })(),

  putnik: (() => {
    const p = { H:'#333', S:'#f5d0a9', B:'#2255aa', J:'#111144', E:'#111' };
    const g = [
      '  HHH  ',
      ' HHHHH ',
      ' SSSSS ',
      ' SESES ',
      ' SSSSS ',
      '  BBB  ',
      ' BBBBB ',
      ' BJJJB ',
      '  J J  ',
      '  J J  ',
    ];
    return { w: 9*SCALE, h: 10*SCALE, pixels: build(g, p) };
  })(),

  pera: (() => {
    const p = { H:'#8B5E3C', S:'#f5d0a9', B:'#aa2222', J:'#441111', G:'#888' };
    const g = [
      '  HHH  ',
      ' HHHHH ',
      ' SSSSS ',
      ' SGGGS ',
      ' SSSSS ',
      '  BBB  ',
      ' BBBBB ',
      ' BJJJB ',
      '  J J  ',
      '  J J  ',
    ];
    return { w: 9*SCALE, h: 10*SCALE, pixels: build(g, p) };
  })()
};

function _injectCSS() {
  if (document.getElementById('characters-css')) return;
  const s = document.createElement('style');
  s.id = 'characters-css';
  s.textContent = `
    .character { image-rendering: pixelated; }
    @keyframes branaSlide {
      from { transform:translateY(20px); opacity:0; }
      to   { transform:translateY(0);    opacity:1; }
    }
  `;
  document.head.appendChild(s);
}
