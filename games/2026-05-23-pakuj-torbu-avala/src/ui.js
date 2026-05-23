// DOM UI — screens, HUD, item panel
import { PANEL_CELL_SIZE } from './config.js';
import { drawItemShape } from './render.js';
import { loadHighscores } from './systems/highscore.js';
import { BRAND } from './content/brand_hooks.js';

const $ = id => document.getElementById(id);

// --- Screen management ---
export function showScreen(name) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
    s.style.display = '';
  });
  const target = document.getElementById(`screen-${name}`);
  if (target) {
    target.style.display = 'flex';
    target.classList.remove('hidden');
    target.classList.add('active');
  }
}

export function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.add('hidden');
    s.classList.remove('active');
    s.style.display = 'none';
  });
}

export function showHUD(visible) {
  const hud = $('hud');
  if (hud) hud.classList.toggle('hidden', !visible);
}

export function showGameArea(visible) {
  const ga = $('game-area');
  if (ga) ga.classList.toggle('hidden', !visible);
}

// --- HUD updates ---
export function updateHUDTimer(timeLeft, urgent) {
  const el = $('hud-timer');
  if (!el) return;
  el.textContent = Math.ceil(timeLeft);
  el.classList.toggle('urgent', urgent);
}

export function updateHUDScore(score) {
  const el = $('hud-score');
  if (el) el.textContent = score;
}

export function updateHUDLevel(level) {
  const el = $('hud-level');
  if (el) el.textContent = level;
}

// --- Item Panel ---
export function renderItemPanel(items, selectedItem, onItemClick) {
  const list = $('items-list');
  if (!list) return;
  list.innerHTML = '';

  for (const item of items) {
    const card = document.createElement('div');
    card.className = `item-card ${item.required ? 'required' : 'bonus'}${item.placed ? ' placed' : ''}${selectedItem === item ? ' selected' : ''}`;
    card.dataset.itemId = item.id;

    // Mini canvas for shape preview
    const cv = document.createElement('canvas');
    const cellPx = PANEL_CELL_SIZE;
    cv.width = item.cols * cellPx;
    cv.height = item.rows * cellPx;
    cv.className = 'item-canvas';
    const cvCtx = cv.getContext('2d');
    drawItemShape(cvCtx, item, 0, 0, cellPx);
    card.appendChild(cv);

    // Label
    const lbl = document.createElement('div');
    lbl.className = `item-label${item.required ? ' required-label' : ''}`;
    lbl.textContent = `${item.emoji} ${item.label}`;
    card.appendChild(lbl);

    // Points
    const pts = document.createElement('div');
    pts.className = 'item-pts';
    pts.textContent = `+${item.points}pts`;
    card.appendChild(pts);

    if (!item.placed) {
      card.addEventListener('click', () => onItemClick(item));
      card.addEventListener('touchend', (e) => {
        e.preventDefault();
        onItemClick(item);
      }, { passive: false });
    }

    list.appendChild(card);
  }
}

// --- Start Screen ---
export function renderStartScreen(highscores) {
  // Event countdown
  const cdEl = $('event-countdown');
  if (cdEl) {
    const eventDate = new Date('2026-06-20');
    const today = new Date();
    const diffMs = eventDate - today;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    cdEl.textContent = days > 0 ? `Za ${days} dana do Avale!` : 'Avala je danas!';
  }

  // HS preview
  const preview = $('hs-preview');
  if (preview) {
    if (highscores.length > 0) {
      preview.innerHTML = `<div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Danas:</div>`;
      const ul = document.createElement('ul');
      ul.className = 'hs-list';
      highscores.slice(0, 3).forEach((hs, i) => {
        const li = document.createElement('li');
        li.className = 'hs-item';
        li.innerHTML = `<span class="hs-rank">#${i + 1}</span><span class="hs-score">${hs.score}</span><span class="hs-grade">${hs.grade}</span>`;
        ul.appendChild(li);
      });
      preview.appendChild(ul);
    }
  }
}

// --- Level Complete Screen ---
export function renderLevelComplete(levelScore, totalScore, breakdown) {
  const lc = $('lc-level-score');
  const tc = $('lc-total-score');
  const bd = $('level-breakdown');

  if (lc) lc.textContent = levelScore;
  if (tc) tc.textContent = totalScore;
  if (bd) {
    bd.innerHTML = '';
    breakdown.forEach(line => {
      const div = document.createElement('div');
      div.className = 'score-line';
      const ptsColor = line.points >= 0 ? 'var(--color-success)' : 'var(--color-error)';
      div.innerHTML = `<span>${line.label}</span><span class="pts" style="color:${ptsColor}">${line.points >= 0 ? '+' : ''}${line.points}</span>`;
      bd.appendChild(div);
    });
  }
}

// --- Game Over Screen ---
export function renderGameOver(totalScore, gradeObj, breakdown, packedItems, missedRequired, allLevelItems, highscores) {
  const gradeEl = $('go-grade-title');
  if (gradeEl) {
    gradeEl.textContent = `${gradeObj.emoji} ${gradeObj.grade}`;
    gradeEl.style.color = gradeObj.color;
  }

  // Packed summary
  const summaryEl = $('go-packed-summary');
  if (summaryEl) {
    summaryEl.innerHTML = '';
    for (const item of packedItems) {
      const span = document.createElement('span');
      span.className = 'packed-item success';
      span.textContent = `${item.emoji} ${item.label} ✓`;
      summaryEl.appendChild(span);
    }
    for (const item of missedRequired) {
      const span = document.createElement('span');
      span.className = 'packed-item missed';
      span.textContent = `${item.emoji} ${item.label} ✗`;
      summaryEl.appendChild(span);
    }
  }

  // Score
  const scoreEl = $('go-score');
  if (scoreEl) scoreEl.textContent = totalScore;

  // Breakdown
  const bdEl = $('go-breakdown');
  if (bdEl) {
    bdEl.innerHTML = '';
    breakdown.forEach(line => {
      const div = document.createElement('div');
      div.className = 'score-line';
      const ptsColor = line.points >= 0 ? 'var(--color-success)' : 'var(--color-error)';
      div.innerHTML = `<span>${line.label}</span><span class="pts" style="color:${ptsColor}">${line.points >= 0 ? '+' : ''}${line.points}</span>`;
      bdEl.appendChild(div);
    });
  }

  // Highscore list
  const hsList = $('go-highscore-list');
  if (hsList) {
    hsList.innerHTML = '';
    if (highscores.length === 0) {
      hsList.innerHTML = '<div style="font-size:12px;color:var(--text-muted);text-align:center;">Nema rezultata za danas.</div>';
    } else {
      highscores.forEach((hs, i) => {
        const li = document.createElement('div');
        li.className = 'hs-item';
        const time = new Date(hs.ts).toLocaleTimeString('sr', { hour: '2-digit', minute: '2-digit' });
        li.innerHTML = `<span class="hs-rank">#${i + 1}</span><span class="hs-score">${hs.score}</span><span class="hs-grade">${hs.grade}</span><span style="font-size:10px;color:var(--text-muted);margin-left:auto">${time}</span>`;
        hsList.appendChild(li);
      });
    }
  }
}

// --- Score pop animation ---
export function spawnScorePop(container, x, y, points) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.position = 'absolute';
  el.textContent = `+${points}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 750);
}
