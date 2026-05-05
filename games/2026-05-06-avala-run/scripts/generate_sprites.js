const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'sprites');

// ── Palette ──────────────────────────────────────────
const C = {
  bg:       '#0a0d1a',
  bg2:      '#1a1a2e',
  bg3:      '#2d1244',
  gold:     '#FFD700',
  goldDark: '#B8960F',
  red:      '#cc2244',
  redDark:  '#881133',
  blue:     '#5577BB',
  blueDark: '#334477',
  can:      '#8899AA',
  canDark:  '#667788',
  bottle:   '#7A5C3A',
  bottleDk: '#5A3C1A',
  paper:    '#D0D0C0',
  paperDk:  '#A0A090',
  green:    '#1B5E20',
  greenDk:  '#0D3810',
  greenLt:  '#2E7D32',
  brown:    '#5D4037',
  brownDk:  '#3E2723',
  gray:     '#78909C',
  grayDk:   '#455A64',
  grayLt:   '#B0BEC5',
  white:    '#E0E0E0',
  black:    '#000000',
  outline:  '#0a0a12',
  skin:     '#C9A882',
  skinDk:   '#9C7A5A',
  hoodie:   '#1a1a2e',
  hoodieLt: '#2a2a4e',
  shoe:     '#333355',
  shoeLt:   '#444466',
  tire:     '#222222',
  headlamp: '#FFEE88',
  propBlur: '#88AACC',
  ledRed:   '#FF2244',
  skyPurp:  '#150825',
  skyPurp2: '#1F0F35',
  mountain: '#1a1030',
  mountLt:  '#2a1a40',
  tower:    '#444466',
  towerLt:  '#666688',
  partyPnk: '#FF44AA',
  partyBlu: '#44AAFF',
  partyGrn: '#44FF88',
};

// ── Helpers ──────────────────────────────────────────
function px(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function saveCanvas(canvas, name) {
  const buf = canvas.toBuffer('image/png');
  const p = path.join(OUT, name);
  fs.writeFileSync(p, buf);
  console.log(`  ✓ ${name} (${canvas.width}x${canvas.height})`);
}

// ── A) Player sprite sheet (128x64, 4x2 grid of 32x32) ──
function generatePlayer() {
  const canvas = createCanvas(128, 64);
  const ctx = canvas.getContext('2d');

  function drawBase(ox, oy, opts = {}) {
    const { legPhase = 0, jumping = false, ducking = false, dead = false } = opts;

    // Outline helper
    const o = (x, y, c) => { px(ctx, ox+x, oy+y, c); };

    if (dead) {
      // Fallen sideways
      // Body horizontal
      rect(ctx, ox+6, oy+20, 20, 6, C.hoodie);
      rect(ctx, ox+7, oy+21, 18, 4, C.hoodieLt);
      // Head
      rect(ctx, ox+4, oy+18, 5, 5, C.skin);
      rect(ctx, ox+5, oy+19, 3, 3, C.skinDk);
      // Headphones on ground
      px(ctx, ox+4, oy+17, C.blue);
      px(ctx, ox+5, oy+17, C.blueDark);
      // X eyes
      px(ctx, ox+5, oy+19, C.red);
      px(ctx, ox+7, oy+19, C.red);
      // Bag
      rect(ctx, ox+22, oy+18, 4, 6, C.brownDk);
      // Legs
      rect(ctx, ox+26, oy+22, 3, 2, C.shoe);
      // Outline
      for (let i = 3; i <= 29; i++) { px(ctx, ox+i, oy+26, C.outline); }
      return;
    }

    if (ducking) {
      // Crouching — shorter body
      // Legs
      rect(ctx, ox+10, oy+26, 4, 4, C.shoe);
      rect(ctx, ox+18, oy+26, 4, 4, C.shoe);
      rect(ctx, ox+11, oy+27, 2, 2, C.shoeLt);
      rect(ctx, ox+19, oy+27, 2, 2, C.shoeLt);
      // Body (low)
      rect(ctx, ox+9, oy+20, 14, 6, C.hoodie);
      rect(ctx, ox+10, oy+21, 12, 4, C.hoodieLt);
      // Head (ducked down)
      rect(ctx, ox+8, oy+16, 7, 5, C.skin);
      rect(ctx, ox+9, oy+17, 5, 3, C.skinDk);
      // Headphones
      rect(ctx, ox+7, oy+15, 2, 3, C.blue);
      rect(ctx, ox+14, oy+15, 2, 3, C.blue);
      rect(ctx, ox+8, oy+14, 7, 2, C.blueDark);
      // Eye
      px(ctx, ox+10, oy+18, C.white);
      px(ctx, ox+13, oy+18, C.white);
      // Bag on back
      rect(ctx, ox+20, oy+18, 5, 5, C.brown);
      rect(ctx, ox+21, oy+19, 3, 3, C.brownDk);
      // Outline bottom
      for (let i = 8; i <= 26; i++) { px(ctx, ox+i, oy+30, C.outline); }
      return;
    }

    const bodyY = jumping ? oy - 2 : oy;

    // Shoes / Legs
    if (jumping) {
      // Legs tucked
      rect(ctx, ox+10, oy+26, 4, 3, C.shoe);
      rect(ctx, ox+18, oy+26, 4, 3, C.shoe);
      rect(ctx, ox+11, oy+24, 3, 3, C.hoodie);
      rect(ctx, ox+19, oy+24, 3, 3, C.hoodie);
    } else {
      // Running legs
      const legOff1 = legPhase === 0 ? -2 : legPhase === 2 ? 2 : 0;
      const legOff2 = legPhase === 0 ? 2 : legPhase === 2 ? -2 : 0;

      // Left leg
      rect(ctx, ox+10+legOff1, oy+25, 4, 5, C.hoodie);
      rect(ctx, ox+10+legOff1, oy+28, 4, 3, C.shoe);
      rect(ctx, ox+11+legOff1, oy+29, 2, 1, C.shoeLt);

      // Right leg
      rect(ctx, ox+18+legOff2, oy+25, 4, 5, C.hoodie);
      rect(ctx, ox+18+legOff2, oy+28, 4, 3, C.shoe);
      rect(ctx, ox+19+legOff2, oy+29, 2, 1, C.shoeLt);
    }

    // Torso
    rect(ctx, ox+9, bodyY+14, 14, 11, C.hoodie);
    rect(ctx, ox+10, bodyY+15, 12, 9, C.hoodieLt);
    // Hoodie pocket line
    rect(ctx, ox+12, bodyY+21, 8, 1, C.hoodie);

    // Bag on back
    rect(ctx, ox+21, bodyY+13, 5, 9, C.brown);
    rect(ctx, ox+22, bodyY+14, 3, 7, C.brownDk);
    // Bag strap
    px(ctx, ox+20, bodyY+14, C.brownDk);
    px(ctx, ox+20, bodyY+15, C.brownDk);

    // Head
    rect(ctx, ox+10, bodyY+6, 9, 8, C.skin);
    rect(ctx, ox+11, bodyY+7, 7, 6, C.skinDk);

    // Headphones
    rect(ctx, ox+9, bodyY+6, 2, 5, C.blue);
    rect(ctx, ox+18, bodyY+6, 2, 5, C.blue);
    rect(ctx, ox+10, bodyY+4, 9, 3, C.blueDark);
    // Headphone highlight
    px(ctx, ox+9, bodyY+6, C.blue);
    px(ctx, ox+19, bodyY+6, C.blue);

    // Eyes
    px(ctx, ox+12, bodyY+9, C.white);
    px(ctx, ox+15, bodyY+9, C.white);
    px(ctx, ox+12, bodyY+10, C.outline);
    px(ctx, ox+15, bodyY+10, C.outline);

    // Mouth
    px(ctx, ox+13, bodyY+12, C.outline);
    px(ctx, ox+14, bodyY+12, C.outline);

    // Arms
    if (jumping) {
      // Arms up
      rect(ctx, ox+7, bodyY+10, 2, 6, C.hoodie);
      rect(ctx, ox+23, bodyY+10, 2, 6, C.hoodie);
      px(ctx, ox+7, bodyY+10, C.skin);
      px(ctx, ox+24, bodyY+10, C.skin);
    } else {
      const armSwing = legPhase === 1 || legPhase === 3 ? 0 : legPhase === 0 ? -1 : 1;
      rect(ctx, ox+7, bodyY+15+armSwing, 2, 7, C.hoodie);
      rect(ctx, ox+7, bodyY+21+armSwing, 2, 2, C.skin);
    }

    // Shadow on ground
    rect(ctx, ox+8, oy+30, 16, 1, C.outline);
  }

  // Row 0: run_0, run_1, run_2, run_3
  drawBase(0, 0, { legPhase: 0 });
  drawBase(32, 0, { legPhase: 1 });
  drawBase(64, 0, { legPhase: 2 });
  drawBase(96, 0, { legPhase: 3 });

  // Row 1: jump, duck, idle, dead
  drawBase(0, 32, { jumping: true });
  drawBase(32, 32, { ducking: true });
  drawBase(64, 32, { legPhase: 1 }); // idle = standing
  drawBase(96, 32, { dead: true });

  saveCanvas(canvas, 'player.png');
}

// ── B) Obstacles (192x64, 4x1 grid of 48x64) ──
function generateObstacles() {
  const canvas = createCanvas(192, 64);
  const ctx = canvas.getContext('2d');

  // 1. Bor (pine tree)
  function drawBor(ox, oy) {
    // Trunk
    rect(ctx, ox+21, oy+40, 6, 22, C.brown);
    rect(ctx, ox+22, oy+42, 4, 18, C.brownDk);

    // Canopy layers (triangular)
    // Bottom layer
    for (let row = 0; row < 10; row++) {
      const w = 24 - row * 2;
      const x = ox + 12 + row;
      rect(ctx, x, oy+30+row, w, 1, C.greenDk);
    }
    // Middle layer
    for (let row = 0; row < 10; row++) {
      const w = 20 - row * 2;
      const x = ox + 14 + row;
      rect(ctx, x, oy+20+row, w, 1, C.green);
    }
    // Top layer
    for (let row = 0; row < 10; row++) {
      const w = 16 - row * 1.5;
      const x = ox + 16 + Math.floor(row * 0.75);
      rect(ctx, Math.floor(x), oy+10+row, Math.ceil(w), 1, C.greenLt);
    }
    // Tip
    rect(ctx, ox+23, oy+6, 2, 5, C.greenLt);
    px(ctx, ox+24, oy+5, C.greenLt);

    // Snow/highlight dots
    px(ctx, ox+18, oy+22, C.grayLt);
    px(ctx, ox+26, oy+26, C.grayLt);
    px(ctx, ox+15, oy+34, C.grayLt);
    px(ctx, ox+30, oy+32, C.grayLt);

    // Outline
    px(ctx, ox+24, oy+4, C.outline);
    for (let i = 10; i < 40; i++) {
      px(ctx, ox+11, oy+i, C.outline);
      px(ctx, ox+36, oy+i, C.outline);
    }
  }

  // 2. Kamen (rock)
  function drawKamen(ox, oy) {
    // Irregular rock shape
    const rockBody = [
      [16,50, 16, 12, C.gray],
      [14,46, 20, 16, C.gray],
      [12,42, 24, 12, C.grayDk],
      [18,38, 14, 8, C.grayDk],
    ];
    rockBody.forEach(([x,y,w,h,c]) => rect(ctx, ox+x, oy+y, w, h, c));

    // Highlight top-left
    rect(ctx, ox+14, oy+42, 8, 3, C.grayLt);
    rect(ctx, ox+18, oy+38, 6, 2, C.grayLt);

    // Cracks
    px(ctx, ox+20, oy+48, C.outline);
    px(ctx, ox+21, oy+49, C.outline);
    px(ctx, ox+22, oy+50, C.outline);
    px(ctx, ox+22, oy+51, C.outline);

    px(ctx, ox+28, oy+46, C.outline);
    px(ctx, ox+28, oy+47, C.outline);
    px(ctx, ox+29, oy+48, C.outline);

    // Shadow
    rect(ctx, ox+12, oy+60, 24, 2, C.outline);

    // Outline
    for (let i = 12; i <= 36; i++) px(ctx, ox+i, oy+62, C.outline);
  }

  // 3. Kamion (security vehicle)
  function drawKamion(ox, oy) {
    // Body
    rect(ctx, ox+4, oy+24, 40, 24, C.blueDark);
    rect(ctx, ox+5, oy+25, 38, 22, '#223355');

    // Cabin front
    rect(ctx, ox+36, oy+20, 10, 28, C.blueDark);
    rect(ctx, ox+37, oy+22, 8, 10, '#334466'); // windshield
    rect(ctx, ox+38, oy+23, 6, 8, '#112233'); // glass

    // Wheels
    rect(ctx, ox+8, oy+48, 10, 10, C.tire);
    rect(ctx, ox+10, oy+50, 6, 6, C.grayDk);
    rect(ctx, ox+12, oy+52, 2, 2, C.gray);

    rect(ctx, ox+30, oy+48, 10, 10, C.tire);
    rect(ctx, ox+32, oy+50, 6, 6, C.grayDk);
    rect(ctx, ox+34, oy+52, 2, 2, C.gray);

    // Headlights
    rect(ctx, ox+44, oy+28, 2, 4, C.headlamp);
    rect(ctx, ox+44, oy+36, 2, 4, C.red);

    // SECURITY text area (stripe)
    rect(ctx, ox+6, oy+34, 30, 3, C.gold);

    // Roof light
    rect(ctx, ox+38, oy+18, 6, 3, C.blue);
    px(ctx, ox+40, oy+17, C.blue);

    // Shadow
    rect(ctx, ox+4, oy+58, 42, 2, C.outline);
  }

  // 4. Dron (drone)
  function drawDron(ox, oy) {
    // Body
    rect(ctx, ox+16, oy+28, 16, 8, C.grayDk);
    rect(ctx, ox+17, oy+29, 14, 6, C.gray);

    // Camera
    rect(ctx, ox+22, oy+36, 4, 4, C.outline);
    rect(ctx, ox+23, oy+37, 2, 2, C.blue);

    // Arms
    rect(ctx, ox+8, oy+26, 10, 2, C.grayDk);
    rect(ctx, ox+30, oy+26, 10, 2, C.grayDk);

    // Propellers (motion blur)
    rect(ctx, ox+4, oy+22, 12, 2, C.propBlur);
    rect(ctx, ox+5, oy+23, 10, 1, C.propBlur);
    rect(ctx, ox+32, oy+22, 12, 2, C.propBlur);
    rect(ctx, ox+33, oy+23, 10, 1, C.propBlur);

    // Prop centers
    rect(ctx, ox+9, oy+24, 3, 3, C.grayDk);
    rect(ctx, ox+36, oy+24, 3, 3, C.grayDk);

    // Red LEDs
    px(ctx, ox+16, oy+28, C.ledRed);
    px(ctx, ox+31, oy+28, C.ledRed);
    px(ctx, ox+16, oy+35, C.ledRed);
    px(ctx, ox+31, oy+35, C.ledRed);

    // LED glow
    px(ctx, ox+15, oy+28, '#661122');
    px(ctx, ox+32, oy+28, '#661122');
  }

  drawBor(0, 0);
  drawKamen(48, 0);
  drawKamion(96, 0);
  drawDron(144, 0);

  saveCanvas(canvas, 'obstacles.png');
}

// ── C) Collectibles (168x24, 7x1 grid of 24x24) ──
function generateCollectibles() {
  const canvas = createCanvas(168, 24);
  const ctx = canvas.getContext('2d');

  function drawArrow(ox, oy, up) {
    const color = up ? '#44CC44' : '#CC4444';
    if (up) {
      px(ctx, ox+19, oy+4, color);
      rect(ctx, ox+18, oy+5, 3, 1, color);
      rect(ctx, ox+17, oy+6, 5, 1, color);
      rect(ctx, ox+19, oy+7, 1, 3, color);
    } else {
      rect(ctx, ox+19, oy+4, 1, 3, color);
      rect(ctx, ox+17, oy+7, 5, 1, color);
      rect(ctx, ox+18, oy+8, 3, 1, color);
      px(ctx, ox+19, oy+9, color);
    }
  }

  // 1. Karta (golden ticket)
  function drawKarta(ox, oy) {
    rect(ctx, ox+4, oy+5, 16, 14, C.gold);
    rect(ctx, ox+5, oy+6, 14, 12, C.goldDark);
    rect(ctx, ox+6, oy+7, 12, 10, C.gold);
    // Star in center
    px(ctx, ox+11, oy+10, C.white);
    px(ctx, ox+12, oy+9, C.white);
    px(ctx, ox+13, oy+10, C.white);
    px(ctx, ox+12, oy+11, C.white);
    px(ctx, ox+12, oy+10, C.goldDark);
    // Shine
    px(ctx, ox+5, oy+6, C.white);
    px(ctx, ox+6, oy+6, C.white);
    px(ctx, ox+5, oy+7, C.white);
    // Outline
    rect(ctx, ox+3, oy+5, 1, 14, C.outline);
    rect(ctx, ox+20, oy+5, 1, 14, C.outline);
    rect(ctx, ox+4, oy+4, 16, 1, C.outline);
    rect(ctx, ox+4, oy+19, 16, 1, C.outline);
  }

  // 2-3. Limenka (can)
  function drawCan(ox, oy) {
    rect(ctx, ox+7, oy+5, 10, 15, C.can);
    rect(ctx, ox+8, oy+6, 8, 13, C.canDark);
    // Tab
    rect(ctx, ox+10, oy+4, 4, 2, C.grayLt);
    // Label stripe
    rect(ctx, ox+8, oy+10, 8, 4, C.red);
    // Highlight
    px(ctx, ox+8, oy+6, C.grayLt);
    px(ctx, ox+8, oy+7, C.grayLt);
    // Outline
    rect(ctx, ox+6, oy+5, 1, 15, C.outline);
    rect(ctx, ox+17, oy+5, 1, 15, C.outline);
    rect(ctx, ox+7, oy+4, 10, 1, C.outline);
    rect(ctx, ox+7, oy+20, 10, 1, C.outline);
  }

  // 4-5. Flasa (bottle)
  function drawBottle(ox, oy) {
    // Neck
    rect(ctx, ox+10, oy+3, 4, 5, C.bottle);
    rect(ctx, ox+11, oy+2, 2, 2, C.bottleDk);
    // Body
    rect(ctx, ox+7, oy+8, 10, 13, C.bottle);
    rect(ctx, ox+8, oy+9, 8, 11, C.bottleDk);
    // Label
    rect(ctx, ox+8, oy+12, 8, 4, C.paper);
    rect(ctx, ox+9, oy+13, 6, 2, C.paperDk);
    // Highlight
    px(ctx, ox+8, oy+9, C.gold);
    px(ctx, ox+8, oy+10, C.gold);
    // Outline
    rect(ctx, ox+6, oy+8, 1, 13, C.outline);
    rect(ctx, ox+17, oy+8, 1, 13, C.outline);
    rect(ctx, ox+7, oy+21, 10, 1, C.outline);
    rect(ctx, ox+9, oy+2, 1, 6, C.outline);
    rect(ctx, ox+14, oy+2, 1, 6, C.outline);
  }

  // 6-7. Papir (paper)
  function drawPaper(ox, oy) {
    rect(ctx, ox+5, oy+5, 14, 15, C.paper);
    rect(ctx, ox+6, oy+6, 12, 13, C.paperDk);
    rect(ctx, ox+7, oy+7, 10, 11, C.paper);
    // Crumple lines
    px(ctx, ox+9, oy+9, C.paperDk);
    px(ctx, ox+13, oy+11, C.paperDk);
    px(ctx, ox+10, oy+14, C.paperDk);
    px(ctx, ox+14, oy+10, C.paperDk);
    // Folded corner
    rect(ctx, ox+15, oy+5, 3, 3, C.paperDk);
    rect(ctx, ox+16, oy+5, 2, 2, C.paper);
    // Outline
    rect(ctx, ox+4, oy+5, 1, 15, C.outline);
    rect(ctx, ox+19, oy+5, 1, 15, C.outline);
    rect(ctx, ox+5, oy+4, 14, 1, C.outline);
    rect(ctx, ox+5, oy+20, 14, 1, C.outline);
  }

  drawKarta(0, 0);
  drawCan(24, 0); drawArrow(24, 0, true);   // limenka_high
  drawCan(48, 0); drawArrow(48, 0, false);   // limenka_low
  drawBottle(72, 0); drawArrow(72, 0, true);  // flasa_high
  drawBottle(96, 0); drawArrow(96, 0, false);  // flasa_low
  drawPaper(120, 0); drawArrow(120, 0, true);  // papir_high
  drawPaper(144, 0); drawArrow(144, 0, false); // papir_low

  saveCanvas(canvas, 'collectibles.png');
}

// ── D) Background (256x128) ──
function generateBackground() {
  const canvas = createCanvas(256, 128);
  const ctx = canvas.getContext('2d');

  // Sky gradient (manual)
  for (let y = 0; y < 64; y++) {
    const t = y / 64;
    const r = Math.floor(21 * (1-t) + 26 * t);
    const g = Math.floor(8 * (1-t) + 16 * t);
    const b = Math.floor(37 * (1-t) + 68 * t);
    rect(ctx, 0, y, 256, 1, `rgb(${r},${g},${b})`);
  }

  // Stars
  const stars = [[20,5],[50,12],[80,3],[120,8],[160,15],[200,6],[230,10],[40,20],[140,18],[180,4],[100,22],[60,8]];
  stars.forEach(([x,y]) => px(ctx, x, y, C.white));

  // Mountain silhouette (Avala)
  for (let x = 0; x < 256; x++) {
    // Mountain profile
    const center = 128;
    const dist = Math.abs(x - center);
    let h;
    if (dist < 60) {
      h = 30 - (dist * dist) / 200;
    } else {
      h = 12 - (dist - 60) * 0.08;
    }
    h = Math.max(2, Math.floor(h));
    const baseY = 50 - h;
    rect(ctx, x, baseY, 1, h + 14, C.mountain);
    if (h > 10) {
      rect(ctx, x, baseY, 1, Math.floor(h/2), C.mountLt);
    }
  }

  // Avala tower
  rect(ctx, 125, 14, 6, 26, C.tower);
  rect(ctx, 126, 15, 4, 24, C.towerLt);
  // Tower top
  rect(ctx, 127, 10, 2, 5, C.tower);
  px(ctx, 127, 9, C.grayLt);
  // Antenna
  px(ctx, 128, 6, C.gray);
  px(ctx, 128, 7, C.gray);
  px(ctx, 128, 8, C.gray);
  // Red blinking light
  px(ctx, 128, 5, C.ledRed);

  // Party lights (scattered glow dots on mountain)
  const partyLights = [
    [105, 38, C.partyPnk], [115, 35, C.partyBlu], [135, 36, C.partyGrn],
    [145, 38, C.partyPnk], [120, 40, C.partyBlu], [140, 39, C.partyGrn],
    [110, 42, C.partyPnk], [150, 41, C.partyBlu], [125, 37, C.gold],
    [130, 42, C.partyGrn],
  ];
  partyLights.forEach(([x,y,c]) => {
    px(ctx, x, y, c);
    // Glow
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.3;
    px(ctx, x-1, y, c); px(ctx, x+1, y, c);
    px(ctx, x, y-1, c); px(ctx, x, y+1, c);
    ctx.globalAlpha = 1.0;
  });

  // Lower half: 4 pine tree variants (each 64x64)
  function drawPineVariant(ox, oy, scale, shade) {
    const darkG = shade === 0 ? C.greenDk : '#0B3010';
    const midG = shade === 0 ? C.green : '#1A5020';
    const ltG = shade === 0 ? C.greenLt : '#2A6030';

    const trunkW = 4 + scale;
    const trunkH = 16 + scale * 2;
    const tx = ox + 32 - Math.floor(trunkW/2);

    // Trunk
    rect(ctx, tx, oy+44-scale, trunkW, trunkH, C.brown);
    rect(ctx, tx+1, oy+45-scale, trunkW-2, trunkH-2, C.brownDk);

    // Canopy layers
    for (let layer = 0; layer < 3; layer++) {
      const layerY = oy + 10 + layer * 10 - scale * 2;
      const maxW = 20 + layer * 8 + scale * 3;
      for (let row = 0; row < 10; row++) {
        const w = maxW - row * 2;
        if (w <= 0) continue;
        const x = ox + 32 - Math.floor(w/2);
        const c = row < 3 ? ltG : row < 6 ? midG : darkG;
        rect(ctx, x, layerY + row, w, 1, c);
      }
    }

    // Top point
    px(ctx, ox+32, oy+6-scale*2, ltG);
    rect(ctx, ox+31, oy+7-scale*2, 3, 2, ltG);
  }

  drawPineVariant(0, 64, 0, 0);
  drawPineVariant(64, 64, 1, 1);
  drawPineVariant(128, 64, 0, 1);
  drawPineVariant(192, 64, 2, 0);

  saveCanvas(canvas, 'background.png');
}

// ── Atlas JSON ──────────────────────────────────────
function generateAtlas() {
  const atlas = {
    player: {
      image: 'sprites/player.png',
      frameWidth: 32,
      frameHeight: 32,
      frames: {
        run_0: { x: 0, y: 0 },
        run_1: { x: 32, y: 0 },
        run_2: { x: 64, y: 0 },
        run_3: { x: 96, y: 0 },
        jump:  { x: 0, y: 32 },
        duck:  { x: 32, y: 32 },
        idle:  { x: 64, y: 32 },
        dead:  { x: 96, y: 32 },
      }
    },
    obstacles: {
      image: 'sprites/obstacles.png',
      frameWidth: 48,
      frameHeight: 64,
      frames: {
        bor:    { x: 0, y: 0 },
        kamen:  { x: 48, y: 0 },
        kamion: { x: 96, y: 0 },
        dron:   { x: 144, y: 0 },
      }
    },
    collectibles: {
      image: 'sprites/collectibles.png',
      frameWidth: 24,
      frameHeight: 24,
      frames: {
        karta:       { x: 0, y: 0 },
        limenka_high: { x: 24, y: 0 },
        limenka_low:  { x: 48, y: 0 },
        flasa_high:   { x: 72, y: 0 },
        flasa_low:    { x: 96, y: 0 },
        papir_high:   { x: 120, y: 0 },
        papir_low:    { x: 144, y: 0 },
      }
    },
    background: {
      image: 'sprites/background.png',
      width: 256,
      height: 128,
      sections: {
        skyline: { x: 0, y: 0, w: 256, h: 64 },
        tree_0:  { x: 0, y: 64, w: 64, h: 64 },
        tree_1:  { x: 64, y: 64, w: 64, h: 64 },
        tree_2:  { x: 128, y: 64, w: 64, h: 64 },
        tree_3:  { x: 192, y: 64, w: 64, h: 64 },
      }
    }
  };

  const p = path.join(OUT, 'atlas.json');
  fs.writeFileSync(p, JSON.stringify(atlas, null, 2));
  console.log('  ✓ atlas.json');
}

// ── Main ────────────────────────────────────────────
console.log('Generating Avala Run sprites...');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

generatePlayer();
generateObstacles();
generateCollectibles();
generateBackground();
generateAtlas();

console.log('\nDone! All sprites generated in sprites/');
