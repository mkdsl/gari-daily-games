import { CONFIG } from '../config.js';

let waveOffset = 0;
let setlistData = null;

export const BINA_FLAVOR_TEXTS = [
  'Bina čeka. Masa dolazi.',
  'Zvuk koji zaostaje u drveću.',
  'Avala sa Bine izgleda drugačije.',
  'Svetla su ugašena. Setlist ostaje.',
  'U jutro posle — samo ona tišina.',
  'Subwoofer vibrira tlo pod nogama.',
  'Tu su nastupali i oni što nisi video.',
  'Kabla za mikrofon je i dalje tamo.',
  'Bina prima sve. Sve shvata.',
  'Iza sebe — šuma. Ispred — sve.'
];

export const BINA_STORIES = [
  'Bina je prazna u jutro. Ali zvuk koji ostane — taj ostane danima.',
  'Avala čeka. Šuma iza bine pamti svakog ko je stajao tamo pre tebe.',
  'Setlist se nikad ne zna unapred. To je tajna. Znaju samo oni koji su bili tu.',
  'Zvučni sistem se proverava u podne. Proba u 18. Show u 21. Sve je ritual.',
  'Jedan ton u Avala šumi putuje drugačije. Biolozi bi rekli akustika. Mi kažemo magija.'
];

export const BINA_NPC = {
  id: 'ace',
  name: 'Ace',
  title: 'DJ',
  relX: 0.5,
  relY: 0.6
};

export function setSetlistData(data) { setlistData = data; }
export function getSetlistData() { return setlistData; }

export function isAvalaWeek() {
  const avalaDate = new Date('2026-06-20');
  const now = new Date();
  const diffMs = Math.abs(now - avalaDate);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 3;
}

export function getNextEvent() {
  if (!setlistData) return null;
  const now = new Date();
  const upcoming = setlistData.dates
    .map(d => ({ ...d, dateObj: new Date(d.date) }))
    .filter(d => d.dateObj >= now)
    .sort((a, b) => a.dateObj - b.dateObj);
  return upcoming[0] || null;
}

export function updateBinaAnimation(dt) {
  waveOffset += dt * 40;
  if (waveOffset > 1000) waveOffset = 0;
}

export function renderBina(ctx, rect, zoneState, hoverState, time) {
  const { x, y, w, h } = rect;
  const accent = CONFIG.COLORS.BINA_ACCENT;

  // Base tile
  ctx.fillStyle = '#1f1500';
  ctx.fillRect(x, y, w, h);

  // Border
  ctx.strokeStyle = accent;
  ctx.lineWidth = hoverState ? 2.5 : 1.5;
  ctx.globalAlpha = hoverState ? 0.9 : 0.5;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.globalAlpha = 1;

  // Acoustic wave lines (horizontal)
  for (let wi = 0; wi < 3; wi++) {
    const lineY = y + 30 + wi * 12;
    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25 + wi * 0.1;
    for (let px = x + 5; px < x + w - 5; px += 2) {
      const waveY = lineY + Math.sin((px + waveOffset + wi * 20) * 0.08) * 4;
      if (px === x + 5) ctx.moveTo(px, waveY);
      else ctx.lineTo(px, waveY);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Lampioni
  const lampPositions = [
    { rx: 0.1,  ry: 0.15 },
    { rx: 0.9,  ry: 0.15 },
    { rx: 0.2,  ry: 0.45 },
    { rx: 0.8,  ry: 0.45 }
  ];
  lampPositions.forEach((lp, i) => {
    const lx = x + lp.rx * w;
    const ly = y + lp.ry * h;
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.8 + i * 1.5);
    ctx.globalAlpha = 0.4 + pulse * 0.5;
    ctx.fillStyle = '#FFE066';
    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Setlist tabla (next event)
  const nextEvent = getNextEvent();
  if (nextEvent) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x + 6, y + 22, w - 12, 22);
    ctx.fillStyle = accent;
    ctx.font = 'bold 8px monospace';
    const dateStr = nextEvent.date.slice(5); // MM-DD
    ctx.fillText(`${dateStr} — ${nextEvent.venue}`, x + 10, y + 36);
    if (nextEvent.avala_exclusive || isAvalaWeek()) {
      ctx.fillStyle = CONFIG.COLORS.GOLD;
      ctx.fillText('★ AVALA EXCLUSIVE', x + 10, y + 44);
    }
  }

  // NPC Ace silueta (DJ with headphones, back turned)
  const npcX = x + w * BINA_NPC.relX;
  const npcY = y + h * BINA_NPC.relY;
  ctx.fillStyle = '#000';
  ctx.fillRect(npcX - 3, npcY - 8, 6, 8); // body
  ctx.beginPath();
  ctx.arc(npcX, npcY - 10, 3, 0, Math.PI * 2); // head
  ctx.fill();
  // Headphones arc
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(npcX, npcY - 10, 4.5, Math.PI, 0);
  ctx.stroke();

  // Zone label
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = 'bold 11px monospace';
  ctx.globalAlpha = 0.9;
  ctx.fillText('BINA', x + 8, y + 14);
  ctx.globalAlpha = 1;

  // Level progress bar
  const level = zoneState?.level || 1;
  const xp = zoneState?.xp || 0;
  const barFill = Math.min(1, xp / (level * 30));
  ctx.fillStyle = '#1f1500';
  ctx.fillRect(x + 4, y + h - 8, w - 8, 5);
  ctx.fillStyle = accent;
  ctx.fillRect(x + 4, y + h - 8, Math.floor((w - 8) * barFill), 5);

  ctx.fillStyle = accent;
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`Lv${level}`, x + w - 24, y + 14);
}

export function getBinaFlavorText() {
  return BINA_FLAVOR_TEXTS[Math.floor(Math.random() * BINA_FLAVOR_TEXTS.length)];
}

export function getBinaStory(index) {
  return BINA_STORIES[Math.min(index, BINA_STORIES.length - 1)];
}
