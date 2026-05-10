// ui.js — DOM rendering: passport pages, stamps, rewards, onboarding
import { STAMPS, REWARD_META, REWARD_THRESHOLDS } from './config.js';
import {
  loadProfile, isStampClaimed, loadStampRecord,
  claimStamp, getClaimedCount, loadRewards, updateRewards
} from './state.js';
import { onStampClick, setState } from './main.js';
import { playStamp, playUnlock } from './audio.js';
import { animateStampClaim, showRewardUnlock } from './animations.js';

// ─── Passport main render ─────────────────────────────────────────────────────────────

export function renderPassport() {
  const profile = loadProfile();
  const rewards = loadRewards();
  const claimedCount = getClaimedCount();

  // Profil
  document.getElementById('profile-name').textContent = profile?.name || 'Klubnik';
  document.getElementById('profile-date').textContent =
    profile?.created ? `član od ${profile.created}` : '';

  // Avatar frame ako je reward otključan
  const avatar = document.getElementById('profile-avatar');
  avatar.classList.toggle('has-frame', !!rewards.avatar_frame);

  // Badges
  renderBadges(rewards);

  // Pečati grid
  renderStampsGrid();

  // Progress
  const total = STAMPS.length;
  const pct = total ? (claimedCount / total) * 100 : 0;
  document.getElementById('progress-bar').style.width = `${pct}%`;
  document.getElementById('progress-label').textContent = `${claimedCount} / ${total} pečata`;

  // Rewards sekcija
  renderRewardsSection(rewards, claimedCount);
}

function renderBadges(rewards) {
  const container = document.getElementById('profile-badges');
  container.innerHTML = '';
  for (const [key, unlocked] of Object.entries(rewards)) {
    if (unlocked) {
      const meta = REWARD_META[key];
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = meta.label.toUpperCase();
      container.appendChild(badge);
    }
  }
}

function renderStampsGrid() {
  const grid = document.getElementById('stamps-grid');
  grid.innerHTML = '';

  STAMPS.forEach(stamp => {
    const claimed = isStampClaimed(stamp.slug);
    const record = loadStampRecord(stamp.slug);

    const item = document.createElement('div');
    item.className = 'stamp-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `${stamp.display_name}${claimed ? ' — pečat utisnut' : ''}`);

    const circle = document.createElement('div');
    circle.className = `stamp ${claimed ? 'claimed' : 'empty'}`;
    circle.id = `stamp-${stamp.slug}`;
    circle.style.color = stamp.color;
    if (claimed) {
      circle.style.background = stamp.color + '33'; // 20% opacity
      circle.style.borderColor = stamp.color;
      circle.textContent = '✓';
    }

    const name = document.createElement('div');
    name.className = 'stamp-name';
    name.textContent = stamp.display_name;

    const dateEl = document.createElement('div');
    dateEl.className = 'stamp-date';
    dateEl.textContent = claimed && record?.date ? record.date : stamp.event_date;

    item.appendChild(circle);
    item.appendChild(name);
    item.appendChild(dateEl);

    item.addEventListener('click', () => onStampClick(stamp.slug));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') onStampClick(stamp.slug);
    });

    grid.appendChild(item);
  });
}

function renderRewardsSection(rewards, count) {
  const section = document.getElementById('rewards-section');
  section.innerHTML = '<div class="rewards-title">DOSTIGNUĆA</div>';

  for (const [key, threshold] of Object.entries(REWARD_THRESHOLDS)) {
    const meta = REWARD_META[key];
    const unlocked = rewards[key];
    const item = document.createElement('div');
    item.className = `reward-item ${unlocked ? 'unlocked' : 'locked'}`;
    item.id = `reward-${key}`;
    item.innerHTML = `
      <span class="reward-item-icon">${meta.icon}</span>
      <span class="reward-item-label">${meta.label}</span>
      <span class="reward-item-req">${unlocked ? '✓ Otključano' : `${threshold} pečata`}</span>
    `;
    section.appendChild(item);
  }
}

// ─── Stamp Detail ───────────────────────────────────────────────────────────────────

export function showStampDetail(slug) {
  const stamp = STAMPS.find(s => s.slug === slug);
  if (!stamp) return;

  const claimed = isStampClaimed(slug);
  const record = loadStampRecord(slug);

  const content = document.getElementById('stamp-detail-content');
  content.innerHTML = `
    <div class="detail-stamp-row">
      <div class="detail-stamp-big ${claimed ? 'claimed' : 'empty'}"
           style="color:${stamp.color}; ${claimed ? `background:${stamp.color}22; border-color:${stamp.color}` : 'border-style:dashed; opacity:0.4'}">
        ${claimed ? '✓' : '?'}
      </div>
      <div>
        <div class="detail-title">${stamp.display_name}</div>
        <div class="detail-date">${stamp.event_date}</div>
      </div>
    </div>
    <div class="detail-description" style="border-color:${stamp.color}">
      ${stamp.description}
    </div>
    ${claimed
      ? `<div class="detail-claimed-badge">✓ Pečat utisnut ${record?.date || ''}</div>`
      : `<button class="claim-btn" id="claim-btn-${slug}">
           Odigrao/la sam ovo
         </button>
         <small class="claim-warning">Ovo je na tvoju savest — pečat se ne može poništiti.</small>`
    }
    <a class="detail-game-link" href="${stamp.game_url}" target="_blank" rel="noopener">
      → Otvori igru
    </a>
  `;

  if (!claimed) {
    document.getElementById(`claim-btn-${slug}`).addEventListener('click', () => {
      handleClaim(slug);
    });
  }

  document.getElementById('stamp-detail').classList.remove('hidden');
}

async function handleClaim(slug) {
  const result = claimStamp(slug);
  if (!result.success) return;

  // Pečat utisnut — animiraj u gridu
  playStamp();
  const stampEl = document.getElementById(`stamp-${slug}`);
  const stamp = STAMPS.find(s => s.slug === slug);
  if (stampEl && stamp) {
    stampEl.className = 'stamp claimed just-claimed';
    stampEl.style.background = stamp.color + '33';
    stampEl.style.borderColor = stamp.color;
    stampEl.style.borderStyle = 'solid';
    stampEl.textContent = '✓';
    animateStampClaim(stampEl);
  }

  // Zatvori detail
  document.getElementById('stamp-detail').classList.add('hidden');
  setState('PASSPORT_MAIN');

  // Re-render passport
  renderPassport();

  // Provjeri rewards
  const { newlyUnlocked } = updateRewards();
  if (newlyUnlocked.length) {
    const key = newlyUnlocked[0];
    playUnlock();
    setState('REWARD_UNLOCK');
    showRewardUnlock(key, () => {
      setState('PASSPORT_MAIN');
      renderPassport(); // refresh badges
    });
  }
}

// ─── Onboarding render ─────────────────────────────────────────────────────────────────

export function renderOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
}
