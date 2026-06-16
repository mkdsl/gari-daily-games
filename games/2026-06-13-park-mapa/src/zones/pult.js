import { CONFIG } from '../config.js';

// Equalizer bars animation state
let eqBars = [0.3, 0.7, 0.5, 0.9, 0.4];
let eqTimer = 0;

export const PULT_FLAVOR_TEXTS = [
  'Miris dima i starih ploča. Pult čeka.',
  'Neon trepće u ritmu basa.',
  'Iza pulta se pišu istorije.',
  'Tri dugmeta, beskonačno mogućnosti.',
  'Ovde počinju setovi koji traju celu noć.',
  'Čaša vode, slušalice, i ti.',
  'Prve pesme uvek idu lagano.',
  'Masa i pult — razgovor bez reči.',
  'Frekvencija koja probija zid.',
  'Ovaj sto je pamtio svaki set.'
];

export const PULT_STORIES = [
  'Ovde je počelo sve. Jedan miks, tri seta, puno ljudi koji nisu znali za šta su došli.',
  'Rekli su da neon ne gori kad je mokro. Grešili su. Pult svetli i kad kiša pada.',
  'DJevi dolaze i odlaze. Pult ostaje. Stara škola kaže: šank je svedok.',
  'Neko je zaboravio torbicu pod barom. Unutra: trakasti rekorder i kaseta bez natpisa.',
  'Poslednji set te noći trajao je 4 sata. Niko nije otišao kući.'
];

export const PULT_NPC = {
  id: 'vlado',
  name: 'Vlado',
  title: 'Kurator',
  // Position relative to zone tile (0-1 normalized)
  relX: 0.75,
  relY: 0.55
};

export function updatePultAnimation(dt) {
  // Update equalizer bar animation
  eqTimer += dt;
  if (eqTimer > 0.08) {
    eqTimer = 0;
    eqBars = eqBars.map(b => {
      const delta = (Math.random() - 0.5) * 0.4;
      return Math.max(0.1, Math.min(1.0, b + delta));
    });
  }
}

export function renderPult(ctx, rect, zoneState, hoverState, time) {
  const { x, y, w, h } = rect;

  // Base tile
  const accent = CONFIG.COLORS.PULT_ACCENT;
  ctx.fillStyle = '#1a0d2e';
  ctx.fillRect(x, y, w, h);

  // Border glow
  const glowAlpha = hoverState ? 0.9 : 0.5;
  ctx.strokeStyle = accent;
  ctx.lineWidth = hoverState ? 2.5 : 1.5;
  ctx.globalAlpha = glowAlpha;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.globalAlpha = 1;

  // Equalizer bars (5 bars)
  const barW = 8;
  const barSpacing = 12;
  const barsStartX = x + 12;
  const barsBaseY = y + h - 18;
  const maxBarH = 30;

  eqBars.forEach((val, i) => {
    const barH = Math.floor(val * maxBarH);
    const barX = barsStartX + i * barSpacing;
    const alpha = 0.6 + val * 0.4;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = accent;
    ctx.fillRect(barX, barsBaseY - barH, barW, barH);
  });
  ctx.globalAlpha = 1;

  // Lampioni (4 small circles)
  const lampPositions = [
    { rx: 0.15, ry: 0.2 },
    { rx: 0.4,  ry: 0.15 },
    { rx: 0.65, ry: 0.25 },
    { rx: 0.85, ry: 0.18 }
  ];
  lampPositions.forEach((lp, i) => {
    const lx = x + lp.rx * w;
    const ly = y + lp.ry * h;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2 + i * 1.3);
    ctx.globalAlpha = 0.4 + pulse * 0.4;
    ctx.fillStyle = '#FFE066';
    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // NPC silueta (Vlado)
  const npcX = x + w * PULT_NPC.relX;
  const npcY = y + h * PULT_NPC.relY;
  ctx.fillStyle = '#000';
  ctx.fillRect(npcX - 2, npcY - 8, 4, 8); // body
  ctx.beginPath();
  ctx.arc(npcX, npcY - 10, 3, 0, Math.PI * 2); // head
  ctx.fill();
  // Naočare (glasses)
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(npcX - 2, npcY - 10, 1.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(npcX + 2, npcY - 10, 1.5, 0, Math.PI * 2);
  ctx.stroke();

  // Zone label
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = 'bold 11px monospace';
  ctx.globalAlpha = 0.9;
  ctx.fillText('PULT', x + 8, y + 14);
  ctx.globalAlpha = 1;

  // Level progress bar
  const level = zoneState?.level || 1;
  const xp = zoneState?.xp || 0;
  const xpForNext = level * 30;
  const barFill = Math.min(1, xp / xpForNext);
  ctx.fillStyle = '#1a0d2e';
  ctx.fillRect(x + 4, y + h - 8, w - 8, 5);
  ctx.fillStyle = accent;
  ctx.fillRect(x + 4, y + h - 8, Math.floor((w - 8) * barFill), 5);

  // Level badge
  ctx.fillStyle = accent;
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`Lv${level}`, x + w - 24, y + 14);
}

export function getPultFlavorText() {
  return PULT_FLAVOR_TEXTS[Math.floor(Math.random() * PULT_FLAVOR_TEXTS.length)];
}

export function getPultStory(index) {
  return PULT_STORIES[Math.min(index, PULT_STORIES.length - 1)];
}
