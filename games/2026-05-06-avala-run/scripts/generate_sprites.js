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

// ── A) Player sprite sheet (192x128, 4x2 grid of 48x64) ──
function generatePlayer() {
  const canvas = createCanvas(192, 128);
  const ctx = canvas.getContext('2d');

  function drawBase(ox, oy, opts = {}) {
    const { legPhase = 0, jumping = false, ducking = false, dead = false } = opts;

    // Frame is 48x64. Character centered roughly in the frame.

    if (dead) {
      // Fallen sideways
      // Body horizontal
      rect(ctx, ox+6, oy+36, 32, 10, C.hoodie);
      rect(ctx, ox+7, oy+37, 30, 8, C.hoodieLt);
      rect(ctx, ox+8, oy+38, 28, 6, C.hoodiePurp);
      // Zipper
      for (let i = 0; i < 28; i += 2) px(ctx, ox+8+i, oy+41, C.hoodie);
      // Head
      rect(ctx, ox+2, oy+30, 10, 10, C.skin);
      rect(ctx, ox+3, oy+31, 8, 8, C.skinDk);
      rect(ctx, ox+4, oy+32, 4, 3, C.skinLt);
      // Hair
      rect(ctx, ox+2, oy+28, 10, 3, C.outline);
      px(ctx, ox+2, oy+27, C.outline);
      // Headphones fallen off
      rect(ctx, ox+1, oy+33, 3, 5, C.blue);
      px(ctx, ox+1, oy+33, C.blueLt);
      rect(ctx, ox+11, oy+33, 3, 5, C.blue);
      px(ctx, ox+13, oy+33, C.blueLt);
      rect(ctx, ox+2, oy+28, 10, 2, C.blueDark);
      // X eyes
      px(ctx, ox+4, oy+34, C.red); px(ctx, ox+5, oy+35, C.red);
      px(ctx, ox+5, oy+34, C.red); px(ctx, ox+4, oy+35, C.red);
      px(ctx, ox+7, oy+34, C.red); px(ctx, ox+8, oy+35, C.red);
      px(ctx, ox+8, oy+34, C.red); px(ctx, ox+7, oy+35, C.red);
      // DJ Bag
      rect(ctx, ox+34, oy+30, 8, 12, C.brown);
      rect(ctx, ox+35, oy+31, 6, 10, C.brownDk);
      px(ctx, ox+37, oy+33, C.gold);
      px(ctx, ox+37, oy+37, C.gold);
      // Legs horizontal
      rect(ctx, ox+38, oy+37, 6, 5, C.hoodie);
      rect(ctx, ox+38, oy+42, 6, 4, C.shoe);
      rect(ctx, ox+39, oy+43, 4, 2, C.shoeLt);
      // Ground shadow
      rect(ctx, ox+2, oy+46, 42, 2, C.outline);
      ctx.globalAlpha = 0.3;
      rect(ctx, ox+4, oy+48, 38, 1, C.outline);
      ctx.globalAlpha = 1.0;
      return;
    }

    if (ducking) {
      // Crouching — compact, pognuti
      // Legs (wider stance, bent knees)
      // Left leg
      rect(ctx, ox+10, oy+48, 7, 6, C.hoodie);
      rect(ctx, ox+11, oy+49, 5, 4, C.hoodieLt);
      rect(ctx, ox+9, oy+54, 8, 6, C.shoe);
      rect(ctx, ox+10, oy+55, 6, 4, C.shoeLt);
      px(ctx, ox+11, oy+56, C.shoeHL);
      // Shoe sole
      rect(ctx, ox+9, oy+59, 8, 1, C.outline);
      // Right leg
      rect(ctx, ox+26, oy+48, 7, 6, C.hoodie);
      rect(ctx, ox+27, oy+49, 5, 4, C.hoodieLt);
      rect(ctx, ox+25, oy+54, 8, 6, C.shoe);
      rect(ctx, ox+26, oy+55, 6, 4, C.shoeLt);
      px(ctx, ox+27, oy+56, C.shoeHL);
      rect(ctx, ox+25, oy+59, 8, 1, C.outline);

      // Body (low, squished)
      rect(ctx, ox+9, oy+36, 24, 13, C.hoodie);
      rect(ctx, ox+10, oy+37, 22, 11, C.hoodieLt);
      rect(ctx, ox+11, oy+38, 20, 9, C.hoodiePurp);
      // Hoodie pocket
      rect(ctx, ox+14, oy+44, 14, 3, C.hoodie);
      rect(ctx, ox+15, oy+45, 12, 1, C.hoodieLt);
      // Zipper
      for (let i = 37; i <= 48; i++) px(ctx, ox+21, oy+i, C.hoodie);

      // Head (ducked forward)
      rect(ctx, ox+6, oy+24, 14, 12, C.skin);
      rect(ctx, ox+7, oy+25, 12, 10, C.skinDk);
      rect(ctx, ox+8, oy+26, 6, 4, C.skinLt);
      // Face area oval (~16x14 placeholder)
      // Hair
      rect(ctx, ox+6, oy+22, 14, 3, C.outline);
      px(ctx, ox+6, oy+21, C.outline);
      px(ctx, ox+19, oy+22, C.outline);

      // Headphones
      rect(ctx, ox+4, oy+25, 4, 7, C.blue);
      rect(ctx, ox+5, oy+26, 2, 5, C.blueLt);
      rect(ctx, ox+18, oy+25, 4, 7, C.blue);
      rect(ctx, ox+19, oy+26, 2, 5, C.blueLt);
      // Headband
      rect(ctx, ox+6, oy+21, 14, 3, C.blueDark);
      rect(ctx, ox+8, oy+20, 10, 2, C.blueDark);
      px(ctx, ox+13, oy+20, C.blue);

      // Eyes
      px(ctx, ox+9, oy+29, C.white); px(ctx, ox+10, oy+29, C.white);
      px(ctx, ox+11, oy+29, C.outline);
      px(ctx, ox+14, oy+29, C.white); px(ctx, ox+15, oy+29, C.white);
      px(ctx, ox+16, oy+29, C.outline);
      // Eyebrows
      rect(ctx, ox+9, oy+28, 3, 1, C.outline);
      rect(ctx, ox+14, oy+28, 3, 1, C.outline);

      // Bag above (torba iznad)
      rect(ctx, ox+28, oy+26, 10, 14, C.brown);
      rect(ctx, ox+29, oy+27, 8, 12, C.brownDk);
      px(ctx, ox+31, oy+29, C.gold);
      px(ctx, ox+31, oy+35, C.gold);
      px(ctx, ox+29, oy+27, C.brownLt);
      // Strap
      px(ctx, ox+27, oy+36, C.brownDk);
      px(ctx, ox+27, oy+37, C.brownDk);
      px(ctx, ox+26, oy+38, C.brownDk);

      // Arms tucked
      rect(ctx, ox+5, oy+37, 4, 8, C.hoodie);
      rect(ctx, ox+6, oy+38, 2, 6, C.hoodieLt);
      rect(ctx, ox+5, oy+45, 4, 3, C.skin);
      px(ctx, ox+5, oy+45, C.skinLt);

      // Shadow
      rect(ctx, ox+7, oy+60, 30, 2, C.outline);
      ctx.globalAlpha = 0.2;
      rect(ctx, ox+9, oy+62, 26, 1, C.outline);
      ctx.globalAlpha = 1.0;
      return;
    }

    const bodyY = jumping ? oy - 4 : oy;

    // ── Legs / Shoes ──
    if (jumping) {
      // Legs tucked up, dynamic jump pose
      // Left leg bent back
      rect(ctx, ox+12, oy+48, 6, 6, C.hoodie);
      rect(ctx, ox+13, oy+49, 4, 4, C.hoodieLt);
      rect(ctx, ox+10, oy+52, 7, 5, C.shoe);
      rect(ctx, ox+11, oy+53, 5, 3, C.shoeLt);
      px(ctx, ox+12, oy+54, C.shoeHL);
      // Right leg bent forward
      rect(ctx, ox+26, oy+46, 6, 6, C.hoodie);
      rect(ctx, ox+27, oy+47, 4, 4, C.hoodieLt);
      rect(ctx, ox+27, oy+50, 7, 5, C.shoe);
      rect(ctx, ox+28, oy+51, 5, 3, C.shoeLt);
      px(ctx, ox+29, oy+52, C.shoeHL);
    } else {
      // Running legs — 4 distinct phases
      // legPhase: 0=left forward, 1=transition, 2=right forward, 3=transition back
      let lLegX, lLegY, rLegX, rLegY;  // offsets for each leg
      let lFootX, lFootY, rFootX, rFootY;

      if (legPhase === 0) {
        // Left leg forward, right leg back
        // Left leg (forward, extended)
        lLegX = -4; lLegY = 0;
        rLegX = 4;  rLegY = -1;
        // Left thigh
        rect(ctx, ox+10+lLegX, oy+44, 6, 8, C.hoodie);
        rect(ctx, ox+11+lLegX, oy+45, 4, 6, C.hoodieLt);
        // Left shin
        rect(ctx, ox+9+lLegX, oy+52, 6, 5, C.hoodie);
        rect(ctx, ox+10+lLegX, oy+53, 4, 3, C.hoodieLt);
        // Left shoe (forward)
        rect(ctx, ox+8+lLegX, oy+57, 8, 4, C.shoe);
        rect(ctx, ox+9+lLegX, oy+58, 6, 2, C.shoeLt);
        px(ctx, ox+15+lLegX, oy+57, C.shoeHL);
        rect(ctx, ox+8+lLegX, oy+60, 8, 1, C.outline); // sole

        // Right thigh (back, higher)
        rect(ctx, ox+26+rLegX, oy+44, 6, 7, C.hoodie);
        rect(ctx, ox+27+rLegX, oy+45, 4, 5, C.hoodieLt);
        // Right shin (back, angled up)
        rect(ctx, ox+27+rLegX, oy+51, 6, 5, C.hoodie);
        rect(ctx, ox+28+rLegX, oy+52, 4, 3, C.hoodieLt);
        // Right shoe (back)
        rect(ctx, ox+28+rLegX, oy+56, 8, 4, C.shoe);
        rect(ctx, ox+29+rLegX, oy+57, 6, 2, C.shoeLt);
        px(ctx, ox+35+rLegX, oy+56, C.shoeHL);
        rect(ctx, ox+28+rLegX, oy+59, 8, 1, C.outline);

      } else if (legPhase === 1) {
        // Transition: legs passing through middle
        // Left leg (coming back, middle)
        rect(ctx, ox+13, oy+44, 6, 8, C.hoodie);
        rect(ctx, ox+14, oy+45, 4, 6, C.hoodieLt);
        rect(ctx, ox+13, oy+52, 6, 5, C.hoodie);
        rect(ctx, ox+14, oy+53, 4, 3, C.hoodieLt);
        rect(ctx, ox+12, oy+57, 8, 4, C.shoe);
        rect(ctx, ox+13, oy+58, 6, 2, C.shoeLt);
        px(ctx, ox+19, oy+57, C.shoeHL);
        rect(ctx, ox+12, oy+60, 8, 1, C.outline);

        // Right leg (coming forward, middle — slightly ahead)
        rect(ctx, ox+25, oy+44, 6, 8, C.hoodie);
        rect(ctx, ox+26, oy+45, 4, 6, C.hoodieLt);
        rect(ctx, ox+25, oy+52, 6, 5, C.hoodie);
        rect(ctx, ox+26, oy+53, 4, 3, C.hoodieLt);
        rect(ctx, ox+24, oy+57, 8, 4, C.shoe);
        rect(ctx, ox+25, oy+58, 6, 2, C.shoeLt);
        px(ctx, ox+31, oy+57, C.shoeHL);
        rect(ctx, ox+24, oy+60, 8, 1, C.outline);

      } else if (legPhase === 2) {
        // Right leg forward, left leg back (mirror of 0)
        // Right leg (forward, extended)
        rect(ctx, ox+24, oy+44, 6, 8, C.hoodie);
        rect(ctx, ox+25, oy+45, 4, 6, C.hoodieLt);
        rect(ctx, ox+23, oy+52, 6, 5, C.hoodie);
        rect(ctx, ox+24, oy+53, 4, 3, C.hoodieLt);
        rect(ctx, ox+22, oy+57, 8, 4, C.shoe);
        rect(ctx, ox+23, oy+58, 6, 2, C.shoeLt);
        px(ctx, ox+29, oy+57, C.shoeHL);
        rect(ctx, ox+22, oy+60, 8, 1, C.outline);

        // Left leg (back)
        rect(ctx, ox+14, oy+44, 6, 7, C.hoodie);
        rect(ctx, ox+15, oy+45, 4, 5, C.hoodieLt);
        rect(ctx, ox+15, oy+51, 6, 5, C.hoodie);
        rect(ctx, ox+16, oy+52, 4, 3, C.hoodieLt);
        rect(ctx, ox+16, oy+56, 8, 4, C.shoe);
        rect(ctx, ox+17, oy+57, 6, 2, C.shoeLt);
        px(ctx, ox+23, oy+56, C.shoeHL);
        rect(ctx, ox+16, oy+59, 8, 1, C.outline);

      } else {
        // legPhase === 3: Transition back — legs passing through middle (reverse)
        // Right leg (coming back)
        rect(ctx, ox+26, oy+44, 6, 8, C.hoodie);
        rect(ctx, ox+27, oy+45, 4, 6, C.hoodieLt);
        rect(ctx, ox+26, oy+52, 6, 5, C.hoodie);
        rect(ctx, ox+27, oy+53, 4, 3, C.hoodieLt);
        rect(ctx, ox+25, oy+57, 8, 4, C.shoe);
        rect(ctx, ox+26, oy+58, 6, 2, C.shoeLt);
        px(ctx, ox+32, oy+57, C.shoeHL);
        rect(ctx, ox+25, oy+60, 8, 1, C.outline);

        // Left leg (coming forward)
        rect(ctx, ox+12, oy+44, 6, 8, C.hoodie);
        rect(ctx, ox+13, oy+45, 4, 6, C.hoodieLt);
        rect(ctx, ox+12, oy+52, 6, 5, C.hoodie);
        rect(ctx, ox+13, oy+53, 4, 3, C.hoodieLt);
        rect(ctx, ox+11, oy+57, 8, 4, C.shoe);
        rect(ctx, ox+12, oy+58, 6, 2, C.shoeLt);
        px(ctx, ox+18, oy+57, C.shoeHL);
        rect(ctx, ox+11, oy+60, 8, 1, C.outline);
      }
    }

    // ── Torso / Hoodie ──
    rect(ctx, ox+11, bodyY+24, 22, 20, C.hoodie);
    rect(ctx, ox+12, bodyY+25, 20, 18, C.hoodieLt);
    rect(ctx, ox+13, bodyY+26, 18, 16, C.hoodiePurp);
    // Hoodie pocket (kangaroo pocket)
    rect(ctx, ox+15, bodyY+36, 14, 4, C.hoodie);
    rect(ctx, ox+16, bodyY+37, 12, 2, C.hoodieLt);
    // Pocket opening
    rect(ctx, ox+18, bodyY+36, 8, 1, C.hoodiePurp);
    // Hoodie strings
    px(ctx, ox+19, bodyY+24, C.grayLt);
    px(ctx, ox+19, bodyY+25, C.grayLt);
    px(ctx, ox+19, bodyY+26, C.grayLt);
    px(ctx, ox+24, bodyY+24, C.grayLt);
    px(ctx, ox+24, bodyY+25, C.grayLt);
    px(ctx, ox+24, bodyY+26, C.grayLt);
    // Zipper line (center)
    for (let i = 24; i <= 43; i++) {
      px(ctx, ox+22, bodyY+i, C.hoodie);
    }
    // Zip pull
    px(ctx, ox+22, bodyY+24, C.gray);
    px(ctx, ox+23, bodyY+25, C.gray);
    // Seam lines (sides)
    for (let i = 26; i <= 42; i += 3) {
      px(ctx, ox+12, bodyY+i, C.hoodie);
      px(ctx, ox+32, bodyY+i, C.hoodie);
    }
    // Hood (behind head, visible collar)
    rect(ctx, ox+12, bodyY+18, 20, 7, C.hoodiePurp);
    rect(ctx, ox+13, bodyY+19, 18, 5, C.hoodieLt);

    // ── DJ Bag on back/side ──
    rect(ctx, ox+31, bodyY+20, 10, 18, C.brown);
    rect(ctx, ox+32, bodyY+21, 8, 16, C.brownDk);
    // Bag zipper
    px(ctx, ox+35, bodyY+24, C.gold);
    px(ctx, ox+35, bodyY+28, C.gold);
    px(ctx, ox+35, bodyY+32, C.gold);
    // Bag highlight
    rect(ctx, ox+32, bodyY+21, 2, 4, C.brownLt);
    // Bag strap (diagonal across chest)
    px(ctx, ox+30, bodyY+22, C.brownDk);
    px(ctx, ox+29, bodyY+23, C.brownDk);
    px(ctx, ox+28, bodyY+24, C.brownDk);
    px(ctx, ox+27, bodyY+25, C.brownDk);
    // Bag flap
    rect(ctx, ox+31, bodyY+20, 10, 3, C.brown);
    rect(ctx, ox+32, bodyY+20, 8, 1, C.brownLt);
    // Bag bottom corner detail
    px(ctx, ox+39, bodyY+36, C.brownDk);
    px(ctx, ox+40, bodyY+35, C.brownDk);

    // ── Head ──
    // Face area: roughly 16x14 pixels for face upload zone
    rect(ctx, ox+12, bodyY+5, 16, 14, C.skin);
    rect(ctx, ox+13, bodyY+6, 14, 12, C.skinDk);
    // Face upload zone highlight (lighter center)
    rect(ctx, ox+14, bodyY+7, 12, 10, C.skin);
    // Forehead highlight
    rect(ctx, ox+15, bodyY+7, 6, 3, C.skinLt);
    // Chin
    rect(ctx, ox+16, bodyY+17, 8, 1, C.skinDk);
    // Stubble
    px(ctx, ox+16, bodyY+16, '#8A7A6A');
    px(ctx, ox+18, bodyY+17, '#8A7A6A');
    px(ctx, ox+20, bodyY+16, '#8A7A6A');
    px(ctx, ox+22, bodyY+17, '#8A7A6A');
    px(ctx, ox+24, bodyY+16, '#8A7A6A');

    // Hair (messy, under headphones)
    rect(ctx, ox+12, bodyY+3, 16, 3, C.outline);
    px(ctx, ox+12, bodyY+2, C.outline);
    px(ctx, ox+13, bodyY+2, C.outline);
    px(ctx, ox+27, bodyY+3, C.outline);
    px(ctx, ox+27, bodyY+4, C.outline);
    // Hair wisps
    px(ctx, ox+14, bodyY+5, C.outline);
    px(ctx, ox+25, bodyY+5, C.outline);

    // ── Headphones (detailed, over-ear) ──
    // Left ear cup
    rect(ctx, ox+9, bodyY+7, 5, 8, C.blue);
    rect(ctx, ox+10, bodyY+8, 3, 6, C.blueLt);
    px(ctx, ox+9, bodyY+7, C.blueLt);
    // Ear cup padding
    rect(ctx, ox+11, bodyY+9, 2, 4, C.blueDark);
    // Right ear cup
    rect(ctx, ox+26, bodyY+7, 5, 8, C.blue);
    rect(ctx, ox+27, bodyY+8, 3, 6, C.blueLt);
    px(ctx, ox+30, bodyY+7, C.blueLt);
    rect(ctx, ox+27, bodyY+9, 2, 4, C.blueDark);
    // Headband
    rect(ctx, ox+12, bodyY+2, 16, 3, C.blueDark);
    rect(ctx, ox+14, bodyY+1, 12, 2, C.blueDark);
    rect(ctx, ox+16, bodyY+0, 8, 2, C.blueDark);
    // Headband highlight
    px(ctx, ox+19, bodyY+0, C.blue);
    px(ctx, ox+20, bodyY+0, C.blue);
    px(ctx, ox+21, bodyY+1, C.blue);

    // ── Eyes ──
    // Eye whites (larger, more expressive)
    rect(ctx, ox+15, bodyY+10, 4, 3, C.white);
    rect(ctx, ox+21, bodyY+10, 4, 3, C.white);
    // Pupils
    rect(ctx, ox+16, bodyY+11, 2, 2, C.outline);
    rect(ctx, ox+22, bodyY+11, 2, 2, C.outline);
    // Pupil highlight
    px(ctx, ox+16, bodyY+11, '#333355');
    px(ctx, ox+22, bodyY+11, '#333355');
    // Eyebrows
    rect(ctx, ox+15, bodyY+9, 4, 1, C.outline);
    rect(ctx, ox+21, bodyY+9, 4, 1, C.outline);

    // ── Mouth ──
    if (jumping) {
      // Open mouth (excited)
      rect(ctx, ox+17, bodyY+15, 6, 2, C.outline);
      rect(ctx, ox+18, bodyY+15, 4, 1, C.red);
    } else {
      // Slight smile
      px(ctx, ox+17, bodyY+15, C.outline);
      px(ctx, ox+18, bodyY+16, C.outline);
      px(ctx, ox+19, bodyY+16, C.outline);
      px(ctx, ox+20, bodyY+16, C.outline);
      px(ctx, ox+21, bodyY+16, C.outline);
      px(ctx, ox+22, bodyY+15, C.outline);
    }

    // ── Arms ──
    if (jumping) {
      // Arms raised up
      // Left arm up
      rect(ctx, ox+7, bodyY+12, 5, 12, C.hoodie);
      rect(ctx, ox+8, bodyY+13, 3, 10, C.hoodieLt);
      // Left hand up
      rect(ctx, ox+6, bodyY+10, 5, 4, C.skin);
      rect(ctx, ox+7, bodyY+11, 3, 2, C.skinLt);
      // Right arm up
      rect(ctx, ox+32, bodyY+12, 5, 12, C.hoodie);
      rect(ctx, ox+33, bodyY+13, 3, 10, C.hoodieLt);
      // Right hand up
      rect(ctx, ox+33, bodyY+10, 5, 4, C.skin);
      rect(ctx, ox+34, bodyY+11, 3, 2, C.skinLt);
    } else {
      // Arm swing matches leg phase (opposite arm/leg)
      const armSwing = legPhase === 0 ? -3 : legPhase === 2 ? 3 : legPhase === 1 ? 1 : -1;
      // Left arm
      rect(ctx, ox+7, bodyY+26+armSwing, 5, 12, C.hoodie);
      rect(ctx, ox+8, bodyY+27+armSwing, 3, 10, C.hoodieLt);
      // Left hand
      rect(ctx, ox+7, bodyY+37+armSwing, 5, 3, C.skin);
      px(ctx, ox+7, bodyY+37+armSwing, C.skinLt);
      // Wrist
      px(ctx, ox+8, bodyY+36+armSwing, C.skinDk);

      // Right arm (opposite swing, partially behind bag)
      const rArmSwing = -armSwing;
      rect(ctx, ox+33, bodyY+26+rArmSwing, 5, 10, C.hoodie);
      rect(ctx, ox+34, bodyY+27+rArmSwing, 3, 8, C.hoodieLt);
      rect(ctx, ox+33, bodyY+35+rArmSwing, 5, 3, C.skin);
      px(ctx, ox+34, bodyY+35+rArmSwing, C.skinLt);
    }

    // ── Ground shadow ──
    rect(ctx, ox+10, oy+61, 24, 2, C.outline);
    ctx.globalAlpha = 0.2;
    rect(ctx, ox+12, oy+62, 20, 1, C.outline);
    ctx.globalAlpha = 1.0;
  }

  // Row 0: run_0, run_1, run_2, run_3
  drawBase(0, 0, { legPhase: 0 });
  drawBase(48, 0, { legPhase: 1 });
  drawBase(96, 0, { legPhase: 2 });
  drawBase(144, 0, { legPhase: 3 });

  // Row 1: jump, duck, idle, dead
  drawBase(0, 64, { jumping: true });
  drawBase(48, 64, { ducking: true });
  drawBase(96, 64, { legPhase: 1 }); // idle = standing
  drawBase(144, 64, { dead: true });

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
      frameWidth: 48,
      frameHeight: 64,
      frames: {
        run_0: { x: 0, y: 0 },
        run_1: { x: 48, y: 0 },
        run_2: { x: 96, y: 0 },
        run_3: { x: 144, y: 0 },
        jump:  { x: 0, y: 64 },
        duck:  { x: 48, y: 64 },
        idle:  { x: 96, y: 64 },
        dead:  { x: 144, y: 64 },
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
