/**
 * render.js — Canvas rendering za Graviton.
 *
 * Odgovornosti (redosled crtanja po frame-u):
 *   1. Pozadina (indigo #0D0D2B + zvezde + nebula parallax)
 *   2. Pod i plafon (crne trake + neon zelene ivice)
 *   3. Sve aktivne zone (obstacle-i: blokovi, šiljci, buzzsaw-ovi)
 *   4. Brod (pixel-art trokut 16×16, boja po g_overload_ratio, rotacija pri flipu)
 *   5. Death overlay (crni fade, alpha iz state.death_overlay_alpha)
 *   6. HUD (survival_time gore-levo, speed_level gore-desno) — samo u PLAYING/DEAD
 *
 * Ne crta start/end screen — to radi ui.js (renderUI).
 *
 * Koordinatni sistem: logički 800×450px (canvas je skaliran CSS-om).
 */

import { CONFIG } from './config.js';

// Pseudo-random zvezde — generisane jednom, ne svaki frame
const STARS = (() => {
  const arr = [];
  // LCG za deterministički raspored zvezda
  let s = 42;
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  for (let i = 0; i < 80; i++) {
    arr.push({ x: rng() * CONFIG.CANVAS_WIDTH, y: rng() * CONFIG.CANVAS_HEIGHT, r: rng() > 0.8 ? 1.5 : 1 });
  }
  return arr;
})();

/**
 * Glavni render poziv. Poziva se jednom po frame-u.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - Game state iz state.js
 */
export function render(ctx, state) {
  renderBackground(ctx, state.scroll_x);
  renderFloorCeil(ctx);
  renderZones(ctx, state.active_zones);
  renderPlayer(ctx, state.brod, state.zone_index);
  renderDeathOverlay(ctx, state.death_overlay_alpha);
  if (state.gamePhase === 'PLAYING' || state.gamePhase === 'DEAD') {
    renderHUD(ctx, state);
  }
}

/**
 * Crta pozadinsku zvezda maglu sa parallax scroll efektom.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} scrollX - Ukupno px scroll-ovano (za parallax offset)
 */
export function renderBackground(ctx, scrollX) {
  ctx.fillStyle = CONFIG.COLORS.BG;
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

  // Parallax offset — zvezde pomerene 10% brzine scroll-a
  const px = (scrollX * 0.1) % CONFIG.CANVAS_WIDTH;

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (const star of STARS) {
    // Wrap-around da zvezde ne nestaju s jedne strane
    const sx = ((star.x - px) % CONFIG.CANVAS_WIDTH + CONFIG.CANVAS_WIDTH) % CONFIG.CANVAS_WIDTH;
    ctx.beginPath();
    ctx.arc(sx, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nebula elipse — statične, samo boja
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = 'rgba(80,30,120,1)';
  ctx.beginPath();
  ctx.ellipse(200, 200, 180, 80, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(600, 150, 150, 60, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(700, 320, 120, 50, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Crta pod i plafon.
 * Pod: crna traka Y=FLOOR_Y, visina FLOOR_THICKNESS, gornja ivica neon zelena 2px.
 * Plafon: crna traka Y=0, visina CEIL_THICKNESS, donja ivica neon zelena 2px.
 * @param {CanvasRenderingContext2D} ctx
 */
export function renderFloorCeil(ctx) {
  const C = CONFIG;

  // Pod
  ctx.fillStyle = C.COLORS.FLOOR_CEIL;
  ctx.fillRect(0, C.FLOOR_Y, C.CANVAS_WIDTH, C.FLOOR_THICKNESS);
  ctx.fillStyle = C.COLORS.NEON_EDGE;
  ctx.fillRect(0, C.FLOOR_Y, C.CANVAS_WIDTH, 2);

  // Plafon
  ctx.fillStyle = C.COLORS.FLOOR_CEIL;
  ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CEIL_THICKNESS);
  ctx.fillStyle = C.COLORS.NEON_EDGE;
  ctx.fillRect(0, C.CEIL_THICKNESS - 2, C.CANVAS_WIDTH, 2);
}

/**
 * Crta sve prepreke iz aktivnih zona.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').Zone[]} activeZones
 */
export function renderZones(ctx, activeZones) {
  for (const zone of activeZones) {
    for (const obs of zone.obstacles) {
      switch (obs.type) {
        case 'block':   renderBlock(ctx, obs);   break;
        case 'spike':   renderSpike(ctx, obs);   break;
        case 'buzzsaw': renderBuzzsaw(ctx, obs); break;
      }
    }
  }
}

/**
 * Crta jedan pravougaoni blok.
 * Koordinate su već apsolutne (generator ih preračunava).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').Obstacle} obs
 */
export function renderBlock(ctx, obs) {
  ctx.fillStyle = CONFIG.COLORS.OBSTACLE;
  ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
}

/**
 * Crta spike trougao (sa poda ili sa plafona).
 * fromCeil=false: vrh gore (spike na podu), baza = obs.y + obs.h, vrh = obs.y
 * fromCeil=true:  vrh dole (spike na plafonu), baza = obs.y, vrh = obs.y + obs.h
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').Obstacle} obs
 */
export function renderSpike(ctx, obs) {
  const halfBase = CONFIG.SPIKE_BASE / 2;
  const cx = obs.x + obs.w / 2; // centar po X (obs.w = SPIKE_BASE)

  ctx.fillStyle = CONFIG.COLORS.OBSTACLE;
  ctx.beginPath();

  if (!obs.fromCeil) {
    // Spike na podu — vrh pokazuje gore
    const baseY = obs.y + obs.h;
    const tipY  = obs.y;
    ctx.moveTo(cx - halfBase, baseY);
    ctx.lineTo(cx + halfBase, baseY);
    ctx.lineTo(cx, tipY);
  } else {
    // Spike na plafonu — vrh pokazuje dole
    const baseY = obs.y;
    const tipY  = obs.y + obs.h;
    ctx.moveTo(cx - halfBase, baseY);
    ctx.lineTo(cx + halfBase, baseY);
    ctx.lineTo(cx, tipY);
  }

  ctx.closePath();
  ctx.fill();
}

/**
 * Crta rotirajući buzzsaw kvadrat sa zubima.
 * Rotacija se ažurira ovde — jedino vizualno mesto za nju.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').Obstacle} obs
 * @param {number} [dt] - Delta time u sekundama (opciono, za ažuriranje rotacije)
 */
export function renderBuzzsaw(ctx, obs, dt) {
  // Ažuriraj vizuelnu rotaciju ako je dt prosleđen
  if (dt !== undefined) {
    obs.rotation = (obs.rotation || 0) + dt * CONFIG.BUZZSAW_ROTATION_SPEED;
  }

  const cx = obs.x;
  const cy = obs.y;
  const half = 16; // 32×32 / 2

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(obs.rotation || 0);

  // Kvadrat 32×32
  ctx.fillStyle = CONFIG.COLORS.OBSTACLE;
  ctx.fillRect(-half, -half, half * 2, half * 2);

  // Zubi — 4 kratke linije od centara ivica prema spolja
  ctx.strokeStyle = CONFIG.COLORS.BG;
  ctx.lineWidth = 2;
  const tooth = 5;
  // gore, dole, levo, desno
  ctx.beginPath();
  ctx.moveTo(0, -half);    ctx.lineTo(0, -half - tooth);
  ctx.moveTo(0, half);     ctx.lineTo(0, half + tooth);
  ctx.moveTo(-half, 0);    ctx.lineTo(-half - tooth, 0);
  ctx.moveTo(half, 0);     ctx.lineTo(half + tooth, 0);
  ctx.stroke();

  ctx.restore();
}

/**
 * Crta brod kao 16×16 pixel-art trokut koji pokazuje DESNO (vrh desno, baza levo).
 * visual_angle=0: normalno (gravitacija dole), visual_angle=π: flipped (gravitacija gore).
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./state.js').BrodState} brod
 * @param {number} zoneIndex
 */
export function renderPlayer(ctx, brod, zoneIndex) {
  const color = getPlayerColor(brod.g_overload_ratio, zoneIndex);

  // brod.x/y su centar hitbox-a (konzistentno sa physics.js i collision.js)
  const cx = brod.x;
  const cy = brod.y;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(brod.visual_angle);

  // Trokut: brod leti DESNO — vrh na desno (+8,0), baza levo (-8,-7) i (-8,+7)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(8, 0);    // vrh — desno
  ctx.lineTo(-8, -7);  // gornji levi ugao baze
  ctx.lineTo(-8, 7);   // donji levi ugao baze
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Interpolira boju broda po g_overload_ratio.
 * 0.0–0.5: white → yellow, 0.5–1.0: yellow → red
 * @param {number} ratio - 0.0 do 1.0
 * @param {number} zoneIndex
 * @returns {string} CSS hex boja
 */
export function getPlayerColor(ratio, zoneIndex) {
  if (zoneIndex < CONFIG.G_OVERLOAD_ACTIVE_FROM_ZONE || ratio <= 0) {
    return CONFIG.COLORS.PLAYER_WHITE;
  }
  if (ratio < 0.5) {
    // 0→0.5: white → yellow, ali tek od threshold 0 → remapuj u 0–1
    return lerpColor(CONFIG.COLORS.PLAYER_WHITE, CONFIG.COLORS.PLAYER_YELLOW, ratio * 2);
  }
  // 0.5→1.0: yellow → orange-red → red
  const t = (ratio - 0.5) * 2; // 0→1
  return lerpColor(CONFIG.COLORS.PLAYER_YELLOW, CONFIG.COLORS.PLAYER_ORANGE_RED, t);
}

/**
 * Linearna interpolacija između dve hex boje.
 * @param {string} hex1
 * @param {string} hex2
 * @param {number} t - 0.0 do 1.0
 * @returns {string} CSS hex boja
 */
export function lerpColor(hex1, hex2, t) {
  const parse = (hex) => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

/**
 * Crta crni fade overlay pri death animaciji.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} alpha - 0.0 do 0.8
 */
export function renderDeathOverlay(ctx, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Formatira sekunde u "M:SS" string.
 * Ovde jer je i render.js koristi — export-ovana i iz ui.js.
 * @param {number} totalSeconds
 * @returns {string} npr. "1:23" ili "0:47"
 */
export function formatTime(totalSeconds) {
  const s = Math.floor(totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Crta HUD tokom PLAYING i DEAD faza.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state
 */
export function renderHUD(ctx, state) {
  const C = CONFIG;

  ctx.save();
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(formatTime(state.survival_time), 16, 10);

  ctx.font = '16px monospace';
  ctx.fillStyle = C.COLORS.NEON_EDGE;
  ctx.textAlign = 'right';
  ctx.fillText(`SPD ${state.speed_level}`, C.CANVAS_WIDTH - 16, 10);

  // G-overload progress bar (dole na ekranu, samo od zone 4 i ako ratio > 0)
  if (state.zone_index >= C.G_OVERLOAD_ACTIVE_FROM_ZONE && state.brod.g_overload_ratio > 0) {
    const barW = C.CANVAS_WIDTH;
    const barH = 4;
    const barY = C.CANVAS_HEIGHT - barH;
    const ratio = state.brod.g_overload_ratio;

    // Pozadina bara
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, barY, barW, barH);

    // Popunjeni deo — boja interpolira belo→crveno
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = getPlayerColor(ratio, state.zone_index);
    ctx.fillRect(0, barY, barW * ratio, barH);

    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
