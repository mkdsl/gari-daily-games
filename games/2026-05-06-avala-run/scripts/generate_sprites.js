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
  goldLt:   '#FFE84D',
  red:      '#cc2244',
  redDark:  '#881133',
  redBright:'#FF3355',
  blue:     '#5577BB',
  blueDark: '#334477',
  blueLt:   '#88AADD',
  can:      '#8899AA',
  canDark:  '#667788',
  canLt:    '#AABBCC',
  bottle:   '#7A5C3A',
  bottleDk: '#5A3C1A',
  bottleLt: '#9A7C5A',
  paper:    '#D0D0C0',
  paperDk:  '#A0A090',
  paperLt:  '#E8E8D8',
  green:    '#1B5E20',
  greenDk:  '#0D3810',
  greenLt:  '#2E7D32',
  greenBr:  '#44AA44',
  brown:    '#5D4037',
  brownDk:  '#3E2723',
  brownLt:  '#8D6E63',
  gray:     '#78909C',
  grayDk:   '#455A64',
  grayLt:   '#B0BEC5',
  grayXLt:  '#CFD8DC',
  white:    '#E0E0E0',
  whiteBr:  '#FFFFFF',
  black:    '#000000',
  outline:  '#0a0a12',
  skin:     '#C9A882',
  skinDk:   '#9C7A5A',
  skinLt:   '#DFCAA8',
  hoodie:   '#1a1a2e',
  hoodieLt: '#2a2a4e',
  hoodiePurp:'#3a2a5e',
  hoodieHL: '#4a3a6e',
  shoe:     '#333355',
  shoeLt:   '#444466',
  shoeHL:   '#555588',
  tire:     '#222222',
  headlamp: '#FFEE88',
  headlampBr:'#FFFFCC',
  propBlur: '#88AACC',
  propBlur2:'#AACCEE',
  ledRed:   '#FF2244',
  ledRedGlow:'#FF668888',
  skyPurp:  '#150825',
  skyPurp2: '#1F0F35',
  mountain: '#1a1030',
  mountLt:  '#2a1a40',
  mountHL:  '#3a2a50',
  tower:    '#444466',
  towerLt:  '#666688',
  towerDk:  '#333355',
  partyPnk: '#FF44AA',
  partyBlu: '#44AAFF',
  partyGrn: '#44FF88',
  partyYlw: '#FFEE44',
  partyOrg: '#FF8844',
  moonGlow: '#8888CC',
  moonBright:'#CCCCFF',
  dronBody: '#556677',
  dronBodyLt:'#778899',
  truckRed: '#993333',
  truckRedLt:'#BB4444',
  truckGray:'#556666',
  uiWhite:  '#FFFFFF',
  uiGreen:  '#44CC44',
  uiRed:    '#CC4444',
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

// Pixel circle helper for round shapes
function circle(ctx, cx, cy, r, color) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x*x + y*y <= r*r) {
        px(ctx, cx+x, cy+y, color);
      }
    }
  }
}

// ── A) Player sprite sheet (128x64, 4x2 grid of 32x32) ──
function generatePlayer() {
  const canvas = createCanvas(128, 64);
  const ctx = canvas.getContext('2d');

  function drawBase(ox, oy, opts = {}) {
    const { legPhase = 0, jumping = false, ducking = false, dead = false } = opts;

    if (dead) {
      // Fallen sideways — more detail
      // Body horizontal
      rect(ctx, ox+6, oy+20, 20, 6, C.hoodie);
      rect(ctx, ox+7, oy+21, 18, 4, C.hoodieLt);
      rect(ctx, ox+8, oy+22, 16, 2, C.hoodiePurp);
      // Head
      rect(ctx, ox+3, oy+17, 6, 6, C.skin);
      rect(ctx, ox+4, oy+18, 4, 4, C.skinDk);
      // Hair
      rect(ctx, ox+3, oy+16, 6, 2, C.outline);
      // Headphones fallen
      px(ctx, ox+3, oy+19, C.blue);
      px(ctx, ox+8, oy+19, C.blue);
      rect(ctx, ox+3, oy+17, 6, 1, C.blueDark);
      // X eyes
      px(ctx, ox+4, oy+19, C.red);
      px(ctx, ox+5, oy+20, C.red);
      px(ctx, ox+6, oy+19, C.red);
      px(ctx, ox+7, oy+20, C.red);
      px(ctx, ox+5, oy+19, C.red);
      px(ctx, ox+6, oy+20, C.red);
      // Bag
      rect(ctx, ox+22, oy+17, 5, 7, C.brown);
      rect(ctx, ox+23, oy+18, 3, 5, C.brownDk);
      // Legs horizontal
      rect(ctx, ox+26, oy+21, 4, 3, C.hoodie);
      rect(ctx, ox+26, oy+23, 4, 2, C.shoe);
      // Ground shadow
      rect(ctx, ox+2, oy+26, 28, 1, C.outline);
      ctx.globalAlpha = 0.3;
      rect(ctx, ox+3, oy+27, 26, 1, C.outline);
      ctx.globalAlpha = 1.0;
      return;
    }

    if (ducking) {
      // Crouching — compact, detailed
      // Legs (wider stance)
      rect(ctx, ox+9, oy+25, 5, 5, C.shoe);
      rect(ctx, ox+10, oy+26, 3, 3, C.shoeLt);
      rect(ctx, ox+18, oy+25, 5, 5, C.shoe);
      rect(ctx, ox+19, oy+26, 3, 3, C.shoeLt);
      // Knee area
      rect(ctx, ox+9, oy+22, 5, 3, C.hoodie);
      rect(ctx, ox+18, oy+22, 5, 3, C.hoodie);
      // Body (low, squished)
      rect(ctx, ox+8, oy+17, 16, 6, C.hoodie);
      rect(ctx, ox+9, oy+18, 14, 4, C.hoodieLt);
      rect(ctx, ox+10, oy+19, 12, 2, C.hoodiePurp);
      // Hoodie pocket
      rect(ctx, ox+12, oy+21, 8, 1, C.hoodie);
      // Head (ducked forward)
      rect(ctx, ox+7, oy+13, 8, 6, C.skin);
      rect(ctx, ox+8, oy+14, 6, 4, C.skinDk);
      // Hair
      rect(ctx, ox+7, oy+12, 8, 2, C.outline);
      px(ctx, ox+7, oy+11, C.outline);
      // Headphones (around head)
      rect(ctx, ox+6, oy+13, 2, 4, C.blue);
      px(ctx, ox+6, oy+13, C.blueLt);
      rect(ctx, ox+14, oy+13, 2, 4, C.blue);
      px(ctx, ox+15, oy+13, C.blueLt);
      rect(ctx, ox+7, oy+11, 8, 2, C.blueDark);
      // Eyes (looking forward, alert)
      px(ctx, ox+9, oy+15, C.white);
      px(ctx, ox+10, oy+15, C.outline);
      px(ctx, ox+12, oy+15, C.white);
      px(ctx, ox+13, oy+15, C.outline);
      // Bag on back (angled)
      rect(ctx, ox+21, oy+14, 5, 7, C.brown);
      rect(ctx, ox+22, oy+15, 3, 5, C.brownDk);
      px(ctx, ox+22, oy+15, C.brownLt);
      // Bag strap
      px(ctx, ox+20, oy+17, C.brownDk);
      px(ctx, ox+20, oy+18, C.brownDk);
      // Arms tucked
      rect(ctx, ox+6, oy+18, 2, 4, C.hoodie);
      px(ctx, ox+6, oy+22, C.skin);
      // Shadow
      rect(ctx, ox+7, oy+30, 20, 1, C.outline);
      ctx.globalAlpha = 0.2;
      rect(ctx, ox+8, oy+31, 18, 1, C.outline);
      ctx.globalAlpha = 1.0;
      return;
    }

    const bodyY = jumping ? oy - 2 : oy;

    // Shoes / Legs
    if (jumping) {
      // Legs tucked up dynamically
      // Left leg bent back
      rect(ctx, ox+10, oy+24, 4, 4, C.hoodie);
      rect(ctx, ox+9, oy+26, 4, 3, C.shoe);
      rect(ctx, ox+10, oy+27, 2, 1, C.shoeLt);
      // Right leg bent forward
      rect(ctx, ox+18, oy+23, 4, 4, C.hoodie);
      rect(ctx, ox+19, oy+25, 4, 3, C.shoe);
      rect(ctx, ox+20, oy+26, 2, 1, C.shoeLt);
    } else {
      // Running legs with more detail
      const legOff1 = legPhase === 0 ? -2 : legPhase === 2 ? 2 : 0;
      const legOff2 = legPhase === 0 ? 2 : legPhase === 2 ? -2 : 0;

      // Left leg
      rect(ctx, ox+10+legOff1, oy+24, 4, 4, C.hoodie);
      rect(ctx, ox+11+legOff1, oy+25, 2, 2, C.hoodieLt);
      rect(ctx, ox+10+legOff1, oy+28, 5, 3, C.shoe);
      rect(ctx, ox+11+legOff1, oy+29, 3, 1, C.shoeLt);
      px(ctx, ox+14+legOff1, oy+28, C.shoeHL); // shoe highlight

      // Right leg
      rect(ctx, ox+18+legOff2, oy+24, 4, 4, C.hoodie);
      rect(ctx, ox+19+legOff2, oy+25, 2, 2, C.hoodieLt);
      rect(ctx, ox+18+legOff2, oy+28, 5, 3, C.shoe);
      rect(ctx, ox+19+legOff2, oy+29, 3, 1, C.shoeLt);
      px(ctx, ox+22+legOff2, oy+28, C.shoeHL);
    }

    // Torso with hoodie detail
    rect(ctx, ox+9, bodyY+14, 14, 11, C.hoodie);
    rect(ctx, ox+10, bodyY+15, 12, 9, C.hoodieLt);
    rect(ctx, ox+11, bodyY+16, 10, 7, C.hoodiePurp);
    // Hoodie pocket
    rect(ctx, ox+12, bodyY+20, 8, 2, C.hoodie);
    rect(ctx, ox+13, bodyY+21, 6, 1, C.hoodieLt);
    // Hoodie string
    px(ctx, ox+14, bodyY+14, C.grayLt);
    px(ctx, ox+14, bodyY+15, C.grayLt);
    px(ctx, ox+17, bodyY+14, C.grayLt);
    px(ctx, ox+17, bodyY+15, C.grayLt);
    // Zipper line
    for (let i = 14; i <= 24; i++) {
      px(ctx, ox+16, bodyY+i, C.hoodie);
    }

    // Bag on back (DJ bag with detail)
    rect(ctx, ox+21, bodyY+12, 6, 11, C.brown);
    rect(ctx, ox+22, bodyY+13, 4, 9, C.brownDk);
    // Bag zipper
    px(ctx, ox+24, bodyY+14, C.gold);
    px(ctx, ox+24, bodyY+18, C.gold);
    // Bag highlight
    px(ctx, ox+22, bodyY+13, C.brownLt);
    px(ctx, ox+22, bodyY+14, C.brownLt);
    // Bag strap (diagonal)
    px(ctx, ox+20, bodyY+13, C.brownDk);
    px(ctx, ox+20, bodyY+14, C.brownDk);
    px(ctx, ox+19, bodyY+15, C.brownDk);

    // Head with more detail
    rect(ctx, ox+10, bodyY+5, 9, 9, C.skin);
    rect(ctx, ox+11, bodyY+6, 7, 7, C.skinDk);
    // Forehead highlight
    rect(ctx, ox+12, bodyY+6, 3, 2, C.skinLt);
    // Hair (messy, under headphones)
    rect(ctx, ox+10, bodyY+4, 9, 2, C.outline);
    px(ctx, ox+10, bodyY+3, C.outline);
    px(ctx, ox+18, bodyY+4, C.outline);
    // Stubble
    px(ctx, ox+12, bodyY+12, '#8A7A6A');
    px(ctx, ox+14, bodyY+12, '#8A7A6A');
    px(ctx, ox+16, bodyY+12, '#8A7A6A');

    // Headphones (detailed, over-ear)
    rect(ctx, ox+8, bodyY+5, 3, 6, C.blue);
    px(ctx, ox+9, bodyY+6, C.blueLt);
    px(ctx, ox+8, bodyY+5, C.blueLt);
    rect(ctx, ox+18, bodyY+5, 3, 6, C.blue);
    px(ctx, ox+19, bodyY+6, C.blueLt);
    px(ctx, ox+20, bodyY+5, C.blueLt);
    // Headband
    rect(ctx, ox+10, bodyY+3, 9, 2, C.blueDark);
    rect(ctx, ox+11, bodyY+2, 7, 2, C.blueDark);
    px(ctx, ox+14, bodyY+2, C.blue); // highlight center

    // Eyes (more expressive)
    // Eye whites
    px(ctx, ox+12, bodyY+8, C.white);
    px(ctx, ox+13, bodyY+8, C.white);
    px(ctx, ox+15, bodyY+8, C.white);
    px(ctx, ox+16, bodyY+8, C.white);
    // Pupils
    px(ctx, ox+12, bodyY+9, C.outline);
    px(ctx, ox+15, bodyY+9, C.outline);
    // Eyebrow
    px(ctx, ox+12, bodyY+7, C.outline);
    px(ctx, ox+15, bodyY+7, C.outline);

    // Mouth
    if (jumping) {
      // Open mouth (excited)
      px(ctx, ox+13, bodyY+11, C.outline);
      px(ctx, ox+14, bodyY+11, C.outline);
      px(ctx, ox+15, bodyY+11, C.outline);
      px(ctx, ox+14, bodyY+12, C.red);
    } else {
      // Slight smile
      px(ctx, ox+13, bodyY+11, C.outline);
      px(ctx, ox+14, bodyY+12, C.outline);
      px(ctx, ox+15, bodyY+11, C.outline);
    }

    // Arms
    if (jumping) {
      // Arms raised dynamically
      rect(ctx, ox+6, bodyY+8, 3, 7, C.hoodie);
      rect(ctx, ox+7, bodyY+9, 1, 5, C.hoodieLt);
      px(ctx, ox+6, bodyY+8, C.skin);
      px(ctx, ox+7, bodyY+7, C.skin);
      // Right arm with bag
      rect(ctx, ox+23, bodyY+8, 3, 7, C.hoodie);
      rect(ctx, ox+24, bodyY+9, 1, 5, C.hoodieLt);
      px(ctx, ox+25, bodyY+8, C.skin);
    } else {
      const armSwing = legPhase === 1 || legPhase === 3 ? 0 : legPhase === 0 ? -1 : 1;
      // Left arm
      rect(ctx, ox+7, bodyY+15+armSwing, 3, 7, C.hoodie);
      rect(ctx, ox+8, bodyY+16+armSwing, 1, 5, C.hoodieLt);
      // Hand
      rect(ctx, ox+7, bodyY+21+armSwing, 3, 2, C.skin);
      px(ctx, ox+7, bodyY+21+armSwing, C.skinLt);
    }

    // Shadow on ground
    rect(ctx, ox+8, oy+30, 16, 1, C.outline);
    ctx.globalAlpha = 0.2;
    rect(ctx, ox+9, oy+31, 14, 1, C.outline);
    ctx.globalAlpha = 1.0;
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

  // 1. Bor (pine tree) — layered, moonlit
  function drawBor(ox, oy) {
    // Trunk with bark texture
    rect(ctx, ox+21, oy+42, 6, 20, C.brown);
    rect(ctx, ox+22, oy+43, 4, 18, C.brownDk);
    // Bark lines
    px(ctx, ox+22, oy+45, C.brownLt);
    px(ctx, ox+24, oy+48, C.brownLt);
    px(ctx, ox+23, oy+52, C.brownLt);
    px(ctx, ox+22, oy+55, C.brownLt);
    // Root flare
    px(ctx, ox+20, oy+60, C.brownDk);
    px(ctx, ox+27, oy+60, C.brownDk);
    px(ctx, ox+19, oy+61, C.brownDk);
    px(ctx, ox+28, oy+61, C.brownDk);

    // Canopy — bottom layer (darkest, widest)
    for (let row = 0; row < 12; row++) {
      const w = 28 - row * 2;
      const x = ox + 10 + row;
      if (w > 0) rect(ctx, x, oy+34+row, w, 1, C.greenDk);
    }
    // Middle layer
    for (let row = 0; row < 11; row++) {
      const w = 24 - row * 2;
      const x = ox + 12 + row;
      if (w > 0) rect(ctx, x, oy+22+row, w, 1, C.green);
    }
    // Top layer (brightest)
    for (let row = 0; row < 10; row++) {
      const w = 18 - Math.floor(row * 1.8);
      const x = ox + 15 + Math.floor(row * 0.9);
      if (w > 0) rect(ctx, Math.floor(x), oy+12+row, Math.ceil(w), 1, C.greenLt);
    }
    // Tip
    rect(ctx, ox+23, oy+8, 2, 5, C.greenLt);
    px(ctx, ox+24, oy+7, C.greenBr);
    px(ctx, ox+23, oy+6, C.greenBr);

    // Moonlight highlights (right side)
    px(ctx, ox+30, oy+26, C.moonGlow);
    px(ctx, ox+31, oy+28, C.moonGlow);
    px(ctx, ox+32, oy+30, C.moonGlow);
    px(ctx, ox+33, oy+34, C.moonGlow);
    px(ctx, ox+29, oy+24, C.moonGlow);
    // Snow/frost dots
    px(ctx, ox+18, oy+24, C.grayXLt);
    px(ctx, ox+26, oy+28, C.grayXLt);
    px(ctx, ox+15, oy+36, C.grayXLt);
    px(ctx, ox+30, oy+34, C.grayXLt);
    px(ctx, ox+20, oy+30, C.grayXLt);
    px(ctx, ox+22, oy+16, C.grayXLt);

    // Subtle dark outline left
    for (let i = 8; i < 46; i++) {
      if (i < 12) px(ctx, ox+23, oy+i, C.outline);
    }

    // Ground shadow
    ctx.globalAlpha = 0.3;
    rect(ctx, ox+10, oy+62, 28, 2, C.outline);
    ctx.globalAlpha = 1.0;
  }

  // 2. Kamen (rock) — more 3D, better shading
  function drawKamen(ox, oy) {
    // Base shape — irregular polygon approximation
    // Main body
    rect(ctx, ox+14, oy+44, 20, 16, C.grayDk);
    rect(ctx, ox+12, oy+46, 24, 12, C.grayDk);
    rect(ctx, ox+16, oy+40, 16, 6, C.gray);
    rect(ctx, ox+18, oy+38, 12, 4, C.gray);
    // Top bump
    rect(ctx, ox+20, oy+36, 8, 4, C.grayLt);

    // 3D highlights (top-left light source)
    rect(ctx, ox+14, oy+44, 8, 3, C.grayLt);
    rect(ctx, ox+16, oy+40, 6, 3, C.grayXLt);
    rect(ctx, ox+18, oy+38, 5, 2, C.grayXLt);
    rect(ctx, ox+20, oy+36, 4, 2, '#D4DDE3');

    // Dark underside
    rect(ctx, ox+14, oy+56, 20, 4, '#334455');
    rect(ctx, ox+12, oy+54, 24, 3, C.grayDk);

    // Cracks (more natural)
    px(ctx, ox+20, oy+46, C.outline);
    px(ctx, ox+21, oy+47, C.outline);
    px(ctx, ox+21, oy+48, C.outline);
    px(ctx, ox+22, oy+49, C.outline);
    px(ctx, ox+22, oy+50, C.outline);

    px(ctx, ox+28, oy+44, C.outline);
    px(ctx, ox+29, oy+45, C.outline);
    px(ctx, ox+29, oy+46, C.outline);

    // Small detail stones
    rect(ctx, ox+10, oy+58, 3, 2, C.grayDk);
    rect(ctx, ox+36, oy+57, 2, 3, C.grayDk);

    // Moss patches
    px(ctx, ox+16, oy+42, C.greenDk);
    px(ctx, ox+17, oy+42, C.greenDk);
    px(ctx, ox+15, oy+43, C.greenDk);

    // Ground shadow
    ctx.globalAlpha = 0.4;
    rect(ctx, ox+10, oy+60, 28, 2, C.outline);
    ctx.globalAlpha = 0.2;
    rect(ctx, ox+8, oy+62, 32, 2, C.outline);
    ctx.globalAlpha = 1.0;
  }

  // 3. Kamion (truck/van) — more detailed, threatening
  function drawKamion(ox, oy) {
    // Main body (cargo area)
    rect(ctx, ox+4, oy+22, 36, 28, C.truckGray);
    rect(ctx, ox+5, oy+23, 34, 26, '#445566');
    // Body panel lines
    rect(ctx, ox+5, oy+35, 34, 1, C.grayDk);
    rect(ctx, ox+5, oy+28, 34, 1, C.grayDk);

    // Cabin front
    rect(ctx, ox+36, oy+18, 10, 32, C.truckRed);
    rect(ctx, ox+37, oy+19, 8, 30, C.truckRedLt);
    // Windshield
    rect(ctx, ox+38, oy+22, 7, 10, '#223344');
    rect(ctx, ox+39, oy+23, 5, 8, '#112233');
    // Windshield reflection
    px(ctx, ox+40, oy+24, '#334466');
    px(ctx, ox+41, oy+25, '#334466');
    // Roof
    rect(ctx, ox+37, oy+17, 8, 3, C.truckRedLt);

    // Wheels with more detail
    // Front wheel
    rect(ctx, ox+8, oy+48, 10, 10, C.tire);
    rect(ctx, ox+9, oy+49, 8, 8, '#333333');
    rect(ctx, ox+10, oy+50, 6, 6, C.grayDk);
    rect(ctx, ox+12, oy+52, 2, 2, C.gray);
    // Hubcap highlight
    px(ctx, ox+12, oy+51, C.grayLt);
    // Rear wheel
    rect(ctx, ox+30, oy+48, 10, 10, C.tire);
    rect(ctx, ox+31, oy+49, 8, 8, '#333333');
    rect(ctx, ox+32, oy+50, 6, 6, C.grayDk);
    rect(ctx, ox+34, oy+52, 2, 2, C.gray);
    px(ctx, ox+34, oy+51, C.grayLt);

    // Headlights (bright, facing player)
    rect(ctx, ox+44, oy+26, 3, 5, C.headlamp);
    px(ctx, ox+45, oy+27, C.headlampBr);
    px(ctx, ox+45, oy+28, C.headlampBr);
    // Headlight glow
    ctx.globalAlpha = 0.3;
    rect(ctx, ox+44, oy+24, 4, 9, C.headlamp);
    ctx.globalAlpha = 1.0;

    // Tail lights
    rect(ctx, ox+2, oy+28, 2, 4, C.red);
    rect(ctx, ox+2, oy+36, 2, 4, C.red);

    // SECURITY text stripe
    rect(ctx, ox+6, oy+32, 28, 3, C.gold);
    rect(ctx, ox+7, oy+33, 26, 1, C.goldDark);

    // Roof emergency light
    rect(ctx, ox+38, oy+15, 6, 3, C.blue);
    rect(ctx, ox+39, oy+14, 4, 2, C.blueLt);
    px(ctx, ox+40, oy+13, C.blueLt);
    // Light flash effect
    ctx.globalAlpha = 0.2;
    rect(ctx, ox+36, oy+12, 10, 4, C.blue);
    ctx.globalAlpha = 1.0;

    // Bumper
    rect(ctx, ox+44, oy+40, 2, 10, '#666666');
    rect(ctx, ox+44, oy+46, 3, 4, '#555555');

    // Shadow
    ctx.globalAlpha = 0.4;
    rect(ctx, ox+4, oy+58, 42, 2, C.outline);
    ctx.globalAlpha = 0.2;
    rect(ctx, ox+2, oy+60, 46, 2, C.outline);
    ctx.globalAlpha = 1.0;
  }

  // 4. Dron (drone) — more tech detail, LEDs
  function drawDron(ox, oy) {
    // Arms (X pattern)
    // Diagonal arms approximated
    rect(ctx, ox+8, oy+26, 12, 2, C.grayDk);
    rect(ctx, ox+28, oy+26, 12, 2, C.grayDk);
    rect(ctx, ox+8, oy+32, 12, 2, C.grayDk);
    rect(ctx, ox+28, oy+32, 12, 2, C.grayDk);

    // Main body (center)
    rect(ctx, ox+16, oy+26, 16, 10, C.dronBody);
    rect(ctx, ox+17, oy+27, 14, 8, C.dronBodyLt);
    // Body highlight
    rect(ctx, ox+18, oy+28, 12, 2, '#8899AA');
    // Body panel line
    rect(ctx, ox+17, oy+31, 14, 1, C.grayDk);

    // Camera gimbal
    rect(ctx, ox+21, oy+36, 6, 5, '#333344');
    rect(ctx, ox+22, oy+37, 4, 3, '#222233');
    // Camera lens
    rect(ctx, ox+23, oy+38, 2, 2, C.blue);
    px(ctx, ox+23, oy+38, C.blueLt);
    // Camera light
    px(ctx, ox+22, oy+40, C.ledRed);

    // Propellers (motion blur effect — transparent)
    ctx.globalAlpha = 0.5;
    rect(ctx, ox+3, oy+22, 14, 3, C.propBlur);
    rect(ctx, ox+31, oy+22, 14, 3, C.propBlur);
    rect(ctx, ox+3, oy+28, 14, 3, C.propBlur);
    rect(ctx, ox+31, oy+28, 14, 3, C.propBlur);
    ctx.globalAlpha = 0.3;
    rect(ctx, ox+2, oy+23, 16, 1, C.propBlur2);
    rect(ctx, ox+30, oy+23, 16, 1, C.propBlur2);
    rect(ctx, ox+2, oy+29, 16, 1, C.propBlur2);
    rect(ctx, ox+30, oy+29, 16, 1, C.propBlur2);
    ctx.globalAlpha = 1.0;

    // Prop motors (circles at ends)
    rect(ctx, ox+8, oy+24, 4, 4, C.grayDk);
    rect(ctx, ox+9, oy+25, 2, 2, C.gray);
    rect(ctx, ox+36, oy+24, 4, 4, C.grayDk);
    rect(ctx, ox+37, oy+25, 2, 2, C.gray);
    rect(ctx, ox+8, oy+30, 4, 4, C.grayDk);
    rect(ctx, ox+9, oy+31, 2, 2, C.gray);
    rect(ctx, ox+36, oy+30, 4, 4, C.grayDk);
    rect(ctx, ox+37, oy+31, 2, 2, C.gray);

    // Red LED lights on corners
    px(ctx, ox+9, oy+24, C.ledRed);
    px(ctx, ox+37, oy+24, C.ledRed);
    px(ctx, ox+9, oy+33, C.ledRed);
    px(ctx, ox+37, oy+33, C.ledRed);
    // LED glow
    ctx.globalAlpha = 0.3;
    rect(ctx, ox+8, oy+23, 3, 3, C.ledRed);
    rect(ctx, ox+36, oy+23, 3, 3, C.ledRed);
    rect(ctx, ox+8, oy+32, 3, 3, C.ledRed);
    rect(ctx, ox+36, oy+32, 3, 3, C.ledRed);
    ctx.globalAlpha = 1.0;

    // Green LED on front
    px(ctx, ox+16, oy+29, C.partyGrn);
    px(ctx, ox+31, oy+29, C.partyGrn);

    // Landing legs
    px(ctx, ox+19, oy+41, C.grayDk);
    px(ctx, ox+18, oy+42, C.grayDk);
    px(ctx, ox+28, oy+41, C.grayDk);
    px(ctx, ox+29, oy+42, C.grayDk);
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
    const color = up ? C.uiGreen : C.uiRed;
    if (up) {
      px(ctx, ox+19, oy+3, color);
      rect(ctx, ox+18, oy+4, 3, 1, color);
      rect(ctx, ox+17, oy+5, 5, 1, color);
      rect(ctx, ox+16, oy+6, 7, 1, color);
      rect(ctx, ox+19, oy+7, 1, 3, color);
    } else {
      rect(ctx, ox+19, oy+3, 1, 3, color);
      rect(ctx, ox+16, oy+6, 7, 1, color);
      rect(ctx, ox+17, oy+7, 5, 1, color);
      rect(ctx, ox+18, oy+8, 3, 1, color);
      px(ctx, ox+19, oy+9, color);
    }
  }

  // 1. Karta (golden ticket) — shiny, premium feel
  function drawKarta(ox, oy) {
    // Outer border
    rect(ctx, ox+3, oy+4, 18, 16, C.goldDark);
    // Inner body
    rect(ctx, ox+4, oy+5, 16, 14, C.gold);
    // Bright inner area
    rect(ctx, ox+5, oy+6, 14, 12, C.goldLt);
    rect(ctx, ox+6, oy+7, 12, 10, C.gold);
    // Star in center (bigger, better)
    px(ctx, ox+12, oy+9, C.white);
    px(ctx, ox+11, oy+10, C.white);
    px(ctx, ox+12, oy+10, C.goldDark);
    px(ctx, ox+13, oy+10, C.white);
    px(ctx, ox+10, oy+11, C.white);
    px(ctx, ox+11, oy+11, C.goldDark);
    px(ctx, ox+12, oy+11, C.whiteBr);
    px(ctx, ox+13, oy+11, C.goldDark);
    px(ctx, ox+14, oy+11, C.white);
    px(ctx, ox+11, oy+12, C.white);
    px(ctx, ox+12, oy+12, C.goldDark);
    px(ctx, ox+13, oy+12, C.white);
    px(ctx, ox+12, oy+13, C.white);
    // Shine corner
    px(ctx, ox+4, oy+5, C.whiteBr);
    px(ctx, ox+5, oy+5, C.whiteBr);
    px(ctx, ox+4, oy+6, C.whiteBr);
    px(ctx, ox+5, oy+6, C.goldLt);
    // Perforated edge (ticket feel)
    for (let i = 0; i < 7; i++) {
      px(ctx, ox+3, oy+5+i*2, C.outline);
      px(ctx, ox+20, oy+5+i*2, C.outline);
    }
    // Outline
    rect(ctx, ox+2, oy+4, 1, 16, C.outline);
    rect(ctx, ox+21, oy+4, 1, 16, C.outline);
    rect(ctx, ox+3, oy+3, 18, 1, C.outline);
    rect(ctx, ox+3, oy+20, 18, 1, C.outline);
  }

  // 2-3. Limenka (can) — crushed soda can
  function drawCan(ox, oy) {
    // Can body
    rect(ctx, ox+7, oy+4, 10, 16, C.can);
    rect(ctx, ox+8, oy+5, 8, 14, C.canDark);
    // Highlight stripe (left)
    rect(ctx, ox+8, oy+6, 2, 12, C.canLt);
    // Pull tab
    rect(ctx, ox+10, oy+3, 4, 2, C.grayLt);
    px(ctx, ox+11, oy+3, C.grayXLt);
    // Ring hole
    px(ctx, ox+11, oy+4, C.grayDk);
    // Label (red stripe with text area)
    rect(ctx, ox+8, oy+9, 8, 5, C.red);
    rect(ctx, ox+9, oy+10, 6, 3, C.redDark);
    // Label text dots
    px(ctx, ox+10, oy+11, C.white);
    px(ctx, ox+12, oy+11, C.white);
    px(ctx, ox+14, oy+11, C.white);
    // Bottom rim
    rect(ctx, ox+7, oy+19, 10, 1, C.grayDk);
    // Dent (crushed effect)
    px(ctx, ox+14, oy+15, C.grayDk);
    px(ctx, ox+15, oy+14, C.grayDk);
    // Outline
    rect(ctx, ox+6, oy+4, 1, 16, C.outline);
    rect(ctx, ox+17, oy+4, 1, 16, C.outline);
    rect(ctx, ox+7, oy+3, 10, 1, C.outline);
    rect(ctx, ox+7, oy+20, 10, 1, C.outline);
  }

  // 4-5. Flasa (bottle) — glass bottle
  function drawBottle(ox, oy) {
    // Neck
    rect(ctx, ox+10, oy+2, 4, 6, C.bottle);
    rect(ctx, ox+11, oy+1, 2, 2, C.bottleDk);
    // Cap
    rect(ctx, ox+10, oy+1, 4, 1, C.gold);
    // Neck highlight
    px(ctx, ox+11, oy+3, C.bottleLt);
    // Body (wider)
    rect(ctx, ox+7, oy+8, 10, 13, C.bottle);
    rect(ctx, ox+8, oy+9, 8, 11, C.bottleDk);
    // Shoulder taper
    px(ctx, ox+8, oy+7, C.bottle);
    px(ctx, ox+9, oy+7, C.bottle);
    px(ctx, ox+14, oy+7, C.bottle);
    px(ctx, ox+15, oy+7, C.bottle);
    // Highlight (glass reflection)
    rect(ctx, ox+8, oy+9, 2, 8, C.bottleLt);
    px(ctx, ox+8, oy+9, '#BBA888');
    // Label
    rect(ctx, ox+8, oy+13, 8, 4, C.paper);
    rect(ctx, ox+9, oy+14, 6, 2, C.paperDk);
    // Label text
    px(ctx, ox+10, oy+14, C.green);
    px(ctx, ox+12, oy+14, C.green);
    px(ctx, ox+14, oy+14, C.green);
    // Bottom
    rect(ctx, ox+7, oy+20, 10, 1, C.brownDk);
    // Outline
    rect(ctx, ox+6, oy+8, 1, 13, C.outline);
    rect(ctx, ox+17, oy+8, 1, 13, C.outline);
    rect(ctx, ox+7, oy+21, 10, 1, C.outline);
    rect(ctx, ox+9, oy+1, 1, 7, C.outline);
    rect(ctx, ox+14, oy+1, 1, 7, C.outline);
    rect(ctx, ox+10, oy+0, 4, 1, C.outline);
  }

  // 6-7. Papir (crumpled paper)
  function drawPaper(ox, oy) {
    // Irregular crumpled shape
    rect(ctx, ox+5, oy+5, 14, 14, C.paper);
    rect(ctx, ox+6, oy+6, 12, 12, C.paperLt);
    rect(ctx, ox+7, oy+7, 10, 10, C.paper);
    // Crumple shadows (more natural)
    px(ctx, ox+8, oy+8, C.paperDk);
    px(ctx, ox+9, oy+9, C.paperDk);
    px(ctx, ox+13, oy+10, C.paperDk);
    px(ctx, ox+14, oy+11, C.paperDk);
    px(ctx, ox+10, oy+13, C.paperDk);
    px(ctx, ox+11, oy+14, C.paperDk);
    px(ctx, ox+7, oy+12, C.paperDk);
    // Folded corner (top-right)
    rect(ctx, ox+15, oy+5, 4, 4, C.paperDk);
    rect(ctx, ox+16, oy+5, 3, 3, C.paper);
    rect(ctx, ox+17, oy+5, 2, 2, C.paperLt);
    // Crumple fold (bottom-left)
    px(ctx, ox+5, oy+16, C.paperDk);
    px(ctx, ox+6, oy+17, C.paperDk);
    px(ctx, ox+7, oy+16, C.paperDk);
    // Subtle text lines
    rect(ctx, ox+8, oy+9, 5, 1, '#B8B8A8');
    rect(ctx, ox+8, oy+11, 6, 1, '#B8B8A8');
    rect(ctx, ox+9, oy+15, 4, 1, '#B8B8A8');
    // Outline
    rect(ctx, ox+4, oy+5, 1, 14, C.outline);
    rect(ctx, ox+19, oy+5, 1, 14, C.outline);
    rect(ctx, ox+5, oy+4, 14, 1, C.outline);
    rect(ctx, ox+5, oy+19, 14, 1, C.outline);
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

// ── D) Background (256x192) — expanded for tower ──
function generateBackground() {
  const canvas = createCanvas(256, 192);
  const ctx = canvas.getContext('2d');

  // Sky gradient (richer, more depth)
  for (let y = 0; y < 64; y++) {
    const t = y / 64;
    const r = Math.floor(15 * (1-t) + 30 * t);
    const g = Math.floor(5 * (1-t) + 12 * t);
    const b = Math.floor(30 * (1-t) + 55 * t);
    rect(ctx, 0, y, 256, 1, `rgb(${r},${g},${b})`);
  }

  // Moon (top-right area)
  const moonX = 210, moonY = 15;
  circle(ctx, moonX, moonY, 6, C.moonBright);
  circle(ctx, moonX, moonY, 5, '#BBBBEE');
  circle(ctx, moonX+1, moonY-1, 4, C.moonBright);
  // Moon craters
  px(ctx, moonX-2, moonY+1, '#AAAACC');
  px(ctx, moonX+1, moonY+2, '#AAAACC');
  px(ctx, moonX+2, moonY-1, '#AAAACC');
  // Moon glow
  ctx.globalAlpha = 0.08;
  circle(ctx, moonX, moonY, 12, C.moonBright);
  ctx.globalAlpha = 0.04;
  circle(ctx, moonX, moonY, 18, C.moonBright);
  ctx.globalAlpha = 1.0;

  // Stars (more variety — big, small, colored)
  const starsBig = [[20,5],[80,3],[160,15],[230,10],[100,22]];
  const starsSmall = [[50,12],[120,8],[200,6],[40,20],[140,18],[180,4],[60,8],[30,28],[170,25],[245,8],[10,15]];
  const starsColor = [[90,10,C.partyBlu],[150,5,C.partyPnk],[70,18,C.partyGrn]];

  // Twinkling big stars (cross shape)
  starsBig.forEach(([x,y]) => {
    px(ctx, x, y, C.whiteBr);
    ctx.globalAlpha = 0.5;
    px(ctx, x-1, y, C.white);
    px(ctx, x+1, y, C.white);
    px(ctx, x, y-1, C.white);
    px(ctx, x, y+1, C.white);
    ctx.globalAlpha = 1.0;
  });
  starsSmall.forEach(([x,y]) => px(ctx, x, y, C.white));
  starsColor.forEach(([x,y,c]) => {
    px(ctx, x, y, c);
    ctx.globalAlpha = 0.3;
    px(ctx, x-1, y, c);
    px(ctx, x+1, y, c);
    ctx.globalAlpha = 1.0;
  });

  // Distant clouds (wispy, dark)
  ctx.globalAlpha = 0.06;
  rect(ctx, 30, 24, 40, 3, C.moonBright);
  rect(ctx, 33, 23, 34, 2, C.moonBright);
  rect(ctx, 150, 20, 50, 3, C.moonBright);
  rect(ctx, 155, 19, 40, 2, C.moonBright);
  ctx.globalAlpha = 1.0;

  // Mountain silhouette (Avala — more detailed profile)
  for (let x = 0; x < 256; x++) {
    const center = 128;
    const dist = Math.abs(x - center);
    let h;
    if (dist < 50) {
      // Main peak
      h = 34 - (dist * dist) / 150;
    } else if (dist < 80) {
      // Shoulder
      h = 20 - (dist - 50) * 0.3;
    } else {
      // Foothills
      h = 11 - (dist - 80) * 0.06;
      // Small bump for secondary hill
      const bump = Math.sin((x - 40) * 0.05) * 3;
      h += Math.max(0, bump);
    }
    h = Math.max(2, Math.floor(h));
    const baseY = 50 - h;

    // Mountain body
    rect(ctx, x, baseY, 1, h + 14, C.mountain);
    // Top half lighter (moonlit side)
    if (h > 8 && x > center - 20) {
      rect(ctx, x, baseY, 1, Math.floor(h/3), C.mountHL);
    }
    if (h > 5) {
      rect(ctx, x, baseY + Math.floor(h/3), 1, Math.floor(h/3), C.mountLt);
    }
  }

  // ── Avalski TV Toranj (detailed, ~50px tall) ──
  const towerBaseX = 124;
  const towerBaseY = 20;

  // Main tower structure (triangular lattice)
  // Base width = 12, narrows to 2 at top
  for (let row = 0; row < 36; row++) {
    const t = row / 36;
    const w = Math.max(2, Math.floor(12 * (1 - t * 0.85)));
    const x = towerBaseX + 6 - Math.floor(w / 2);
    const y = towerBaseY + 36 - row;
    // Lattice effect (alternating fill)
    if (row % 3 === 0) {
      // Horizontal struts
      rect(ctx, x, y, w, 1, C.tower);
    } else {
      // Vertical edges only (lattice look)
      px(ctx, x, y, C.tower);
      px(ctx, x + w - 1, y, C.towerLt);
      // Cross bracing every few pixels
      if (row % 2 === 0 && w > 3) {
        const mid = x + Math.floor(w / 2);
        px(ctx, mid, y, C.towerDk);
      }
    }
  }

  // Tower platform/observation deck
  rect(ctx, towerBaseX + 1, towerBaseY + 36, 10, 2, C.tower);
  rect(ctx, towerBaseX + 2, towerBaseY + 37, 8, 1, C.towerLt);

  // Antenna mast (top)
  const antennaX = towerBaseX + 6;
  rect(ctx, antennaX, towerBaseY - 6, 1, 7, C.gray);
  // Antenna cross piece
  rect(ctx, antennaX - 1, towerBaseY - 3, 3, 1, C.grayDk);
  // Aviation warning light (red, blinking)
  px(ctx, antennaX, towerBaseY - 7, C.ledRed);
  // Red light glow
  ctx.globalAlpha = 0.4;
  px(ctx, antennaX - 1, towerBaseY - 7, C.ledRed);
  px(ctx, antennaX + 1, towerBaseY - 7, C.ledRed);
  px(ctx, antennaX, towerBaseY - 8, C.ledRed);
  px(ctx, antennaX, towerBaseY - 6, C.ledRed);
  ctx.globalAlpha = 0.15;
  circle(ctx, antennaX, towerBaseY - 7, 3, C.ledRed);
  ctx.globalAlpha = 1.0;

  // Tower highlight (moonlight on right side)
  for (let row = 0; row < 36; row += 2) {
    const t = row / 36;
    const w = Math.max(2, Math.floor(12 * (1 - t * 0.85)));
    const x = towerBaseX + 6 + Math.floor(w / 2) - 1;
    const y = towerBaseY + 36 - row;
    px(ctx, x, y, C.towerLt);
  }

  // ── Party lights around tower base (colorful, festive) ──
  const partyLights = [
    // Near tower base
    [118, 42, C.partyPnk], [122, 40, C.partyBlu], [126, 43, C.partyGrn],
    [130, 41, C.partyYlw], [134, 43, C.partyOrg], [138, 40, C.partyPnk],
    // Spreading out
    [112, 44, C.partyBlu], [142, 44, C.partyGrn],
    [108, 46, C.partyYlw], [146, 45, C.partyOrg],
    // On the mountain slopes
    [100, 44, C.partyPnk], [150, 42, C.partyBlu],
    [105, 42, C.partyGrn], [148, 44, C.gold],
    // Scattered further
    [95, 46, C.partyOrg], [155, 46, C.partyPnk],
    [115, 38, C.partyYlw], [135, 38, C.partyBlu],
  ];
  partyLights.forEach(([x, y, c]) => {
    px(ctx, x, y, c);
    // Glow effect
    ctx.globalAlpha = 0.35;
    px(ctx, x-1, y, c); px(ctx, x+1, y, c);
    px(ctx, x, y-1, c); px(ctx, x, y+1, c);
    ctx.globalAlpha = 0.12;
    px(ctx, x-1, y-1, c); px(ctx, x+1, y-1, c);
    px(ctx, x-1, y+1, c); px(ctx, x+1, y+1, c);
    ctx.globalAlpha = 1.0;
  });

  // ── Lower section: 4 pine tree variants (each 64x64) ──
  function drawPineVariant(ox, oy, scale, shade) {
    const darkG = shade === 0 ? C.greenDk : '#0B3010';
    const midG = shade === 0 ? C.green : '#1A5020';
    const ltG = shade === 0 ? C.greenLt : '#2A6030';

    const trunkW = 4 + scale;
    const trunkH = 16 + scale * 2;
    const tx = ox + 32 - Math.floor(trunkW / 2);

    // Trunk with bark texture
    rect(ctx, tx, oy + 44 - scale, trunkW, trunkH, C.brown);
    rect(ctx, tx + 1, oy + 45 - scale, trunkW - 2, trunkH - 2, C.brownDk);
    // Bark highlights
    px(ctx, tx + 1, oy + 48, C.brownLt);
    px(ctx, tx + 2, oy + 52, C.brownLt);

    // Canopy layers (3 tiers)
    for (let layer = 0; layer < 3; layer++) {
      const layerY = oy + 10 + layer * 10 - scale * 2;
      const maxW = 20 + layer * 8 + scale * 3;
      for (let row = 0; row < 10; row++) {
        const w = maxW - row * 2;
        if (w <= 0) continue;
        const x = ox + 32 - Math.floor(w / 2);
        const c = row < 3 ? ltG : row < 6 ? midG : darkG;
        rect(ctx, x, layerY + row, w, 1, c);
      }
    }

    // Top point
    px(ctx, ox + 32, oy + 6 - scale * 2, ltG);
    rect(ctx, ox + 31, oy + 7 - scale * 2, 3, 2, ltG);

    // Moonlight edge highlights
    const edgeX = ox + 32 + Math.floor((20 + scale * 3) / 2) - 2;
    for (let i = 0; i < 5; i++) {
      px(ctx, edgeX - i * 0, oy + 20 + i * 4, C.moonGlow);
    }
  }

  // Third row: pine variants
  drawPineVariant(0, 64, 0, 0);
  drawPineVariant(64, 64, 1, 1);
  drawPineVariant(128, 64, 0, 1);
  drawPineVariant(192, 64, 2, 0);

  // ── Fourth row: clouds (each 64x64) ──
  function drawCloud(ox, oy, variant) {
    ctx.globalAlpha = 0.08;
    // Different cloud shapes
    if (variant === 0) {
      rect(ctx, ox+10, oy+28, 44, 6, C.moonBright);
      rect(ctx, ox+14, oy+25, 36, 4, C.moonBright);
      rect(ctx, ox+20, oy+23, 24, 4, C.moonBright);
    } else if (variant === 1) {
      rect(ctx, ox+8, oy+30, 48, 5, C.moonBright);
      rect(ctx, ox+12, oy+27, 40, 4, C.moonBright);
      rect(ctx, ox+18, oy+24, 28, 5, C.moonBright);
      rect(ctx, ox+24, oy+22, 16, 4, C.moonBright);
    } else if (variant === 2) {
      rect(ctx, ox+6, oy+28, 52, 8, C.moonBright);
      rect(ctx, ox+10, oy+25, 44, 5, C.moonBright);
      rect(ctx, ox+16, oy+22, 32, 5, C.moonBright);
    } else {
      rect(ctx, ox+14, oy+30, 36, 5, C.moonBright);
      rect(ctx, ox+18, oy+27, 28, 5, C.moonBright);
      rect(ctx, ox+22, oy+25, 20, 4, C.moonBright);
    }
    ctx.globalAlpha = 1.0;
  }

  drawCloud(0, 128, 0);
  drawCloud(64, 128, 1);
  drawCloud(128, 128, 2);
  drawCloud(192, 128, 3);

  saveCanvas(canvas, 'background.png');
}

// ── E) UI Icons sprite sheet (96x12, 8x1 grid of 12x12) ──
function generateUI() {
  const canvas = createCanvas(96, 12);
  const ctx = canvas.getContext('2d');
  const W = C.uiWhite;
  const G = C.uiGreen;

  // 1. Arrow Up (12x12 cell at 0,0)
  function drawArrowUp(ox, oy) {
    px(ctx, ox+5, oy+2, W);
    rect(ctx, ox+4, oy+3, 3, 1, W);
    rect(ctx, ox+3, oy+4, 5, 1, W);
    rect(ctx, ox+2, oy+5, 7, 1, W);
    rect(ctx, ox+4, oy+6, 3, 4, W);
  }

  // 2. Arrow Down (12x12 cell at 12,0)
  function drawArrowDown(ox, oy) {
    rect(ctx, ox+4, oy+2, 3, 4, W);
    rect(ctx, ox+2, oy+6, 7, 1, W);
    rect(ctx, ox+3, oy+7, 5, 1, W);
    rect(ctx, ox+4, oy+8, 3, 1, W);
    px(ctx, ox+5, oy+9, W);
  }

  // 3. Phone/Mobile (12x12 cell at 24,0)
  function drawPhone(ox, oy) {
    rect(ctx, ox+3, oy+1, 6, 10, C.grayDk);
    rect(ctx, ox+4, oy+2, 4, 7, '#334466');
    rect(ctx, ox+4, oy+3, 4, 5, '#112233');
    // Home button
    px(ctx, ox+5, oy+9, C.grayLt);
    px(ctx, ox+6, oy+9, C.grayLt);
    // Screen content dot
    px(ctx, ox+5, oy+5, C.partyBlu);
    px(ctx, ox+6, oy+5, C.partyGrn);
  }

  // 4. Tree/Bor (12x12 cell at 36,0)
  function drawTreeIcon(ox, oy) {
    // Trunk
    rect(ctx, ox+5, oy+8, 2, 3, C.brown);
    // Canopy triangle layers
    rect(ctx, ox+3, oy+6, 6, 2, C.greenDk);
    rect(ctx, ox+4, oy+4, 4, 2, C.green);
    rect(ctx, ox+5, oy+2, 2, 2, C.greenLt);
    px(ctx, ox+5, oy+1, C.greenLt);
  }

  // 5. Kamen/Rock (12x12 cell at 48,0)
  function drawRockIcon(ox, oy) {
    rect(ctx, ox+2, oy+6, 8, 4, C.grayDk);
    rect(ctx, ox+3, oy+4, 6, 3, C.gray);
    rect(ctx, ox+4, oy+3, 4, 2, C.grayLt);
    // Highlight
    px(ctx, ox+4, oy+4, C.grayXLt);
    // Crack
    px(ctx, ox+6, oy+7, C.outline);
    px(ctx, ox+7, oy+8, C.outline);
  }

  // 6. Dron/Helicopter (12x12 cell at 60,0)
  function drawDronIcon(ox, oy) {
    // Body
    rect(ctx, ox+4, oy+5, 4, 3, C.grayDk);
    rect(ctx, ox+5, oy+6, 2, 1, C.gray);
    // Arms
    rect(ctx, ox+2, oy+5, 2, 1, C.grayDk);
    rect(ctx, ox+8, oy+5, 2, 1, C.grayDk);
    // Propellers
    ctx.globalAlpha = 0.6;
    rect(ctx, ox+1, oy+4, 4, 1, C.propBlur);
    rect(ctx, ox+7, oy+4, 4, 1, C.propBlur);
    ctx.globalAlpha = 1.0;
    // LEDs
    px(ctx, ox+2, oy+4, C.ledRed);
    px(ctx, ox+9, oy+4, C.ledRed);
    // Camera
    px(ctx, ox+5, oy+8, C.blue);
    px(ctx, ox+6, oy+8, C.blue);
  }

  // 7. Kamion/Truck (12x12 cell at 72,0)
  function drawTruckIcon(ox, oy) {
    // Cargo body
    rect(ctx, ox+1, oy+4, 7, 5, C.truckGray);
    // Cabin
    rect(ctx, ox+7, oy+3, 4, 6, C.truckRed);
    rect(ctx, ox+8, oy+4, 2, 3, '#223344');
    // Wheels
    rect(ctx, ox+2, oy+9, 2, 2, C.tire);
    rect(ctx, ox+7, oy+9, 2, 2, C.tire);
    // Headlight
    px(ctx, ox+10, oy+5, C.headlamp);
    // Stripe
    rect(ctx, ox+2, oy+6, 5, 1, C.gold);
    // Roof light
    px(ctx, ox+8, oy+2, C.blue);
  }

  // 8. Empty/spare (12x12 cell at 84,0) — draw nothing, reserve

  drawArrowUp(0, 0);
  drawArrowDown(12, 0);
  drawPhone(24, 0);
  drawTreeIcon(36, 0);
  drawRockIcon(48, 0);
  drawDronIcon(60, 0);
  drawTruckIcon(72, 0);

  saveCanvas(canvas, 'ui.png');
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
      height: 192,
      sections: {
        skyline: { x: 0, y: 0, w: 256, h: 64 },
        tree_0:  { x: 0, y: 64, w: 64, h: 64 },
        tree_1:  { x: 64, y: 64, w: 64, h: 64 },
        tree_2:  { x: 128, y: 64, w: 64, h: 64 },
        tree_3:  { x: 192, y: 64, w: 64, h: 64 },
        cloud_0: { x: 0, y: 128, w: 64, h: 64 },
        cloud_1: { x: 64, y: 128, w: 64, h: 64 },
        cloud_2: { x: 128, y: 128, w: 64, h: 64 },
        cloud_3: { x: 192, y: 128, w: 64, h: 64 },
      }
    },
    ui: {
      image: 'sprites/ui.png',
      frameWidth: 12,
      frameHeight: 12,
      frames: {
        arrow_up:   { x: 0, y: 0 },
        arrow_down: { x: 12, y: 0 },
        phone:      { x: 24, y: 0 },
        tree:       { x: 36, y: 0 },
        rock:       { x: 48, y: 0 },
        drone:      { x: 60, y: 0 },
        truck:      { x: 72, y: 0 },
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
generateUI();
generateAtlas();

console.log('\nDone! All sprites generated in sprites/');
