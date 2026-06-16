import { CONFIG } from '../config.js';

let bioParticles = [];
let leafParticles = [];
let particleTimer = 0;

function initParticles() {
  bioParticles = Array.from({ length: 15 }, () => ({
    x: Math.random(),
    y: Math.random(),
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.5,
    r: 1 + Math.random() * 2
  }));
  leafParticles = [];
}
initParticles();

export const SUMA_FLAVOR_TEXTS = [
  'Tišina šume nije tišina.',
  'Korenovi pamte ono što mi zaboravimo.',
  'Svetlo prodire na mesta koja biraš.',
  'Bioluminiscencija — jezik koji ne učimo.',
  'Đorđe kaže: sve počinje ovde.',
  'Noćna šuma diše drugačije od dnevne.',
  'Ispod lišća, stariji svet.',
  'Gljive šapuću, mi slušamo.',
  'Put se nastavlja i kad ga ne vidiš.',
  'Šuma ne prašta — ali uvek prihvata.'
];

export const SUMA_STORIES = [
  'Mara kaže: ako slušaš šumu dovoljno dugo, čuješ frekvencije koje se ne snimaju.',
  'Stari puteljak je zatravao. Ispod njega su stari koreni koji pamte drugačije vreme.',
  'Bioluminiscencija nije samo efekt. To je jezik koji gljive pričaju u mraku.',
  'Đorđe je ovde posadio prve biljke. Kaže: sve počinje u šumi, sve se i vraća tu.',
  'Noć u šumi nije crna. Noć u šumi ima 47 nijansi zelene.'
];

export const SUMA_NPC = {
  id: 'mara',
  name: 'Mara',
  title: 'Park Ranger',
  relX: 0.7,
  relY: 0.5
};

export function updateSumaAnimation(dt) {
  particleTimer += dt;

  // Update bio particles
  bioParticles.forEach(p => {
    p.phase += p.speed * dt;
    // Slow drift
    p.x += Math.sin(p.phase * 0.3) * 0.001;
    p.y += Math.cos(p.phase * 0.2) * 0.001;
    if (p.x < 0) p.x = 1;
    if (p.x > 1) p.x = 0;
    if (p.y < 0) p.y = 1;
    if (p.y > 1) p.y = 0;
  });

  // Spawn leaf particles occasionally
  if (particleTimer > 0.8 && leafParticles.length < 8) {
    particleTimer = 0;
    leafParticles.push({
      x: Math.random(),
      y: 0,
      vx: (Math.random() - 0.5) * 0.003,
      vy: 0.003 + Math.random() * 0.004,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      alpha: 0.7 + Math.random() * 0.3
    });
  }

  // Update leaf particles
  leafParticles = leafParticles.filter(l => l.y < 1.1);
  leafParticles.forEach(l => {
    l.x += l.vx;
    l.y += l.vy;
    l.rotation += l.rotSpeed;
    l.alpha *= 0.998;
  });
}

export function renderSuma(ctx, rect, zoneState, hoverState, time) {
  const { x, y, w, h } = rect;
  const accent = CONFIG.COLORS.SUMA_ACCENT;

  // Base tile - dark forest green
  ctx.fillStyle = '#0a1a0e';
  ctx.fillRect(x, y, w, h);

  // Border
  ctx.strokeStyle = accent;
  ctx.lineWidth = hoverState ? 2.5 : 1.5;
  ctx.globalAlpha = hoverState ? 0.9 : 0.5;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.globalAlpha = 1;

  // Bioluminescent particles
  bioParticles.forEach(p => {
    const px = x + p.x * w;
    const py = y + p.y * h;
    const pulse = 0.3 + 0.7 * Math.abs(Math.sin(p.phase));
    ctx.globalAlpha = pulse * 0.7;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(px, py, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Falling leaves
  leafParticles.forEach(l => {
    const lx = x + l.x * w;
    const ly = y + l.y * h;
    ctx.save();
    ctx.globalAlpha = l.alpha * 0.6;
    ctx.translate(lx, ly);
    ctx.rotate(l.rotation);
    ctx.fillStyle = '#2d6b3a';
    ctx.fillRect(-3, -1.5, 6, 3);
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  // Tree silhouette lines
  ctx.strokeStyle = '#1a3321';
  ctx.lineWidth = 2;
  for (let t = 0; t < 5; t++) {
    const tx = x + 15 + t * 28;
    ctx.beginPath();
    ctx.moveTo(tx, y + h - 5);
    ctx.lineTo(tx, y + 25);
    ctx.stroke();
    // Simple triangle tree top
    ctx.fillStyle = '#1a3321';
    ctx.beginPath();
    ctx.moveTo(tx, y + 10);
    ctx.lineTo(tx - 10, y + 35);
    ctx.lineTo(tx + 10, y + 35);
    ctx.closePath();
    ctx.fill();
  }

  // Lampioni
  const lampPositions = [
    { rx: 0.05, ry: 0.3  },
    { rx: 0.95, ry: 0.25 },
    { rx: 0.5,  ry: 0.1  },
    { rx: 0.3,  ry: 0.6  }
  ];
  lampPositions.forEach((lp, i) => {
    const lx = x + lp.rx * w;
    const ly = y + lp.ry * h;
    const pulse = 0.4 + 0.6 * Math.sin(time * 1.5 + i * 0.8);
    ctx.globalAlpha = 0.4 + pulse * 0.35;
    ctx.fillStyle = '#CCF5A0';
    ctx.beginPath();
    ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // NPC Mara silueta (with flashlight)
  const npcX = x + w * SUMA_NPC.relX;
  const npcY = y + h * SUMA_NPC.relY;
  ctx.fillStyle = '#000';
  ctx.fillRect(npcX - 2, npcY - 8, 4, 8);
  ctx.beginPath();
  ctx.arc(npcX, npcY - 10, 3, 0, Math.PI * 2);
  ctx.fill();
  // Flashlight cone
  ctx.fillStyle = 'rgba(255,255,200,0.15)';
  ctx.beginPath();
  ctx.moveTo(npcX + 3, npcY - 6);
  ctx.lineTo(npcX + 18, npcY - 12);
  ctx.lineTo(npcX + 18, npcY);
  ctx.closePath();
  ctx.fill();

  // Zone label
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = 'bold 11px monospace';
  ctx.globalAlpha = 0.9;
  ctx.fillText('ŠUMA', x + 8, y + 14);
  ctx.globalAlpha = 1;

  // Level progress bar
  const level = zoneState?.level || 1;
  const xp = zoneState?.xp || 0;
  const barFill = Math.min(1, xp / (level * 30));
  ctx.fillStyle = '#0a1a0e';
  ctx.fillRect(x + 4, y + h - 8, w - 8, 5);
  ctx.fillStyle = accent;
  ctx.fillRect(x + 4, y + h - 8, Math.floor((w - 8) * barFill), 5);

  ctx.fillStyle = accent;
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`Lv${level}`, x + w - 24, y + 14);
}

export function getSumaFlavorText() {
  return SUMA_FLAVOR_TEXTS[Math.floor(Math.random() * SUMA_FLAVOR_TEXTS.length)];
}

export function getSumaStory(index) {
  return SUMA_STORIES[Math.min(index, SUMA_STORIES.length - 1)];
}
