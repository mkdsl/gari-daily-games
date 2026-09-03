/** @fileoverview End screen: Final Score display, achievement badges, prestige unlock CTA */

import { getState, setState, clearSave, prestigeReset } from '../state.js';
import { calcFinalScore, getWinCondition, checkAchievements, getAchievementInfo, formatScoreCard } from '../systems/scoring.js';
import { calcReputationGain, formatReputation, getNextPrestigeThreshold, buildSeasonJournal } from '../systems/prestige.js';
import { calcCommunityVibe } from '../systems/wellbeing.js';
import { BRAND_NARRATIVES, getScoreNarrative, getGuncatiBrandEnding, getGuncatiEventCTA } from '../content/brand_hooks.js';
import { shareScore, shareSeasonReport } from '../share.js';

/** @type {Function|null} */
let _onNewGame = null;
let _onPrestige = null;

/**
 * Render the Score screen
 * @param {HTMLElement} container
 * @param {{ onNewGame: Function, onPrestige: Function }} callbacks
 */
export function renderScore(container, callbacks) {
  _onNewGame = callbacks.onNewGame;
  _onPrestige = callbacks.onPrestige;

  const state = getState();

  // Calculate score if not already done
  let breakdown = state.scoreBreakdown;
  if (!breakdown) {
    breakdown = calcFinalScore(state);
    setState({ finalScore: breakdown.finalScore, scoreBreakdown: breakdown });
  }

  const winCond = getWinCondition(breakdown.finalScore);
  const achievements = checkAchievements(state, breakdown);

  // Calculate reputation gain
  const communityVibe = calcCommunityVibe(state.weeklyWB || []);
  const repGain = calcReputationGain(breakdown.finalScore, state.prestigeRuns || 0, communityVibe);
  const newRep = (state.reputation || 0) + repGain;
  const nextThreshold = getNextPrestigeThreshold(newRep);
  const narrative = getScoreNarrative(breakdown.finalScore, state);

  container.innerHTML = buildScoreHTML(breakdown, winCond, achievements, repGain, newRep, nextThreshold, narrative, state);
  bindScoreEvents(container, winCond, achievements, breakdown);

  // Animate score count-up
  animateScoreCount(container, breakdown.finalScore);
}

function buildScoreHTML(breakdown, winCond, achievements, repGain, newRep, nextThreshold, narrative, state) {
  const achHTML = achievements.length > 0
    ? achievements.map(id => {
        const info = getAchievementInfo(id);
        return `<div class="achievement-badge" title="${info.desc}">
          <span class="ach-emoji">${info.emoji}</span>
          <span class="ach-name">${info.name}</span>
        </div>`;
      }).join('')
    : '<p class="no-ach">Nema postignuća ovog puta. Naredna sezona!</p>';

  const barHTML = buildScoreBreakdown(breakdown);
  const retroHTML = buildVolunteerRetroHTML(state);
  const keyMomentsHTML = buildKeyMomentsHTML(state);
  const brandNarrative = getBrandEndingNarrative(state, winCond.tier);
  const guncatiBrandEnding = getGuncatiBrandEnding(winCond.tier);

  const eventCTA = getGuncatiEventCTA();
  const eventCTAHTML = eventCTA.active ? `
    <div class="event-cta-banner">
      <p class="event-headline">${eventCTA.headline}</p>
      <a class="event-cta-link" href="${eventCTA.url}" target="_blank" rel="noopener">
        ${eventCTA.cta}
      </a>
    </div>
  ` : '';

  const volunteerCTAHTML = breakdown.finalScore >= 7.5 ? `
    <div class="volunteer-cta panel">
      <p class="volunteer-cta-text">🌱 Spreman za pravi Guncati?</p>
      <a class="volunteer-cta-link" href="https://guncati.rs" target="_blank" rel="noopener">
        Postani pravi volonter Guncatija →
      </a>
    </div>
  ` : '';

  const seasonReportHTML = `
    <div class="season-report panel">
      <h4>📊 Sezonski izveštaj</h4>
      <div class="report-grid">
        <div class="report-item"><span class="report-label">Sreća publike</span><span class="report-val">${breakdown.crowdHappiness}%</span></div>
        <div class="report-item"><span class="report-label">Prihod</span><span class="report-val">${breakdown.totalRevenue} GC</span></div>
        <div class="report-item"><span class="report-label">Community Vibe</span><span class="report-val">${breakdown.communityVibe}%</span></div>
        <div class="report-item"><span class="report-label">Volonteri</span><span class="report-val">${(state.volunteers || []).length}</span></div>
      </div>
      <button class="btn-secondary btn-ig-report" id="btn-ig-report">📲 Podeli IG izveštaj</button>
    </div>
  `;

  const seasonJournalHTML = winCond.canPrestige
    ? buildSeasonJournal(state).map(line => `<p class="retro-fragment">${line}</p>`).join('')
    : '';

  const prestigeHTML = winCond.canPrestige ? `
    <div class="prestige-cta panel">
      <h3>🌟 Stara Šaraga Mode</h3>
      <p>Igraš ponovo — sa Reputacijom ali bez infrastrukture.</p>
      <p>Teže. Vrednije. Prava legenda se dokazuje dvaput.</p>
      <h4>📖 Sezonski dnevnik</h4>
      ${seasonJournalHTML}
      <button class="btn-prestige" id="btn-prestige">
        ⚡ Idi u Stara Šaraga (${newRep} rep)
      </button>
    </div>
  ` : '';

  return `
    <div class="score-layout">
      <div class="score-header">
        <div class="win-emoji">${winCond.emoji}</div>
        <h1 class="score-headline">${winCond.message}</h1>
        <p class="score-subtitle">${winCond.subtitle}</p>
      </div>

      <div class="score-main">
        <div class="score-number-wrap">
          <span class="score-number" id="score-display">0.0</span>
          <span class="score-denom">/10</span>
        </div>
      </div>

      <div class="score-breakdown panel">
        <h3>📊 Breakdown</h3>
        ${barHTML}
      </div>

      ${keyMomentsHTML}

      ${retroHTML}

      <div class="narrative-panel">
        <p class="narrative-headline">${narrative.headline}</p>
        <p class="narrative-body">${narrative.body}</p>
        <p class="narrative-brand">🌄 ${narrative.brand}</p>
      </div>

      <div class="reputation-panel panel">
        <h3>🏅 Reputacija</h3>
        <p>Ovaj run: <strong>+${repGain}</strong> → Ukupno: <strong>${formatReputation(newRep)}</strong></p>
        <p class="rep-next">${nextThreshold.label}</p>
        <div class="rep-bar-track">
          <div class="rep-bar-fill" style="width:${Math.min((newRep / 120) * 100, 100)}%"></div>
        </div>
      </div>

      <div class="achievements-panel panel">
        <h3>🏆 Postignuća</h3>
        <div class="achievements-grid">${achHTML}</div>
      </div>

      ${prestigeHTML}

      <div class="brand-ending panel">
        <h4>${guncatiBrandEnding.title}</h4>
        <p class="brand-ending-body">${guncatiBrandEnding.body}</p>
        ${brandNarrative ? `<p class="brand-ending-sub">${brandNarrative}</p>` : ''}
      </div>

      ${volunteerCTAHTML}

      ${eventCTAHTML}

      ${seasonReportHTML}

      <div class="score-actions">
        <button class="btn-share" id="btn-share">📤 Podeli rezultat</button>
        ${winCond.canPrestige
          ? ''
          : `<button class="btn-secondary" id="btn-new-game">🌱 Nova sezona</button>`
        }
        <button class="btn-danger btn-small" id="btn-reset">🗑️ Obriši napredak</button>
      </div>
    </div>
  `;
}

function buildVolunteerRetroHTML(state) {
  const volunteers = state.volunteers;
  if (!volunteers || volunteers.length === 0) return '';

  const fragments = {
    ana: 'Ana je ćutala ceo poslednji dan. Previše je traženo od nje.',
    mika: 'Mika je spavao između testanja. Nije rekao ništa — ali sve je rekao.',
    jovana: 'Jovana je kuvala praznu čorbu na kraju. Kada je Jovana bez ideja, ekipa to oseti.',
    dragan: 'Dragan je odložio kameru. Nije snimio finale. To je rečito.',
    djule: 'Đule je ostao sedeći na kamenu. Telo kaže šta reči ne mogu.',
    maja: 'Maja je isključila muziku sat pre finala. Kada DJ stišava, nešto je pogrešno.',
    biljana: 'Biljana je napustila svoju listu. Kad ona odustane od rasporeda — stvari su ozbiljne.'
  };

  const cards = volunteers.map(vol => {
    const isGreen = vol.energija >= 60 && vol.vibe >= 60;
    const isRed = vol.energija < 30 && vol.vibe < 30;
    const cls = isGreen ? 'retro-green' : isRed ? 'retro-red' : 'retro-yellow';
    const statusEmoji = isGreen ? '🟢' : isRed ? '🔴' : '🟡';
    const fragment = isRed && fragments[vol.typeId]
      ? `<p class="retro-fragment">${fragments[vol.typeId]}</p>`
      : '';
    return `<div class="retro-vol ${cls}">
      <span class="retro-emoji">${vol.emoji}</span>
      <span class="retro-name">${vol.name}</span>
      <span class="retro-status">${statusEmoji}</span>
      ${fragment}
    </div>`;
  }).join('');

  return `<div class="volunteer-retro panel">
    <h3>👥 Ko je izdržao</h3>
    <div class="retro-grid">${cards}</div>
  </div>`;
}

function buildKeyMomentsHTML(state) {
  const eventLog = state.eventLog;
  if (!eventLog || eventLog.length === 0) return '';

  const rows = eventLog
    .filter(entry => entry.event && entry.event.title)
    .map(entry => {
      const min = Math.floor((entry.time || 0) / 60);
      const choice = entry.optionText || 'auto-rešeno';
      const effectSummary = buildEffectSummary(entry.effects);
      const effectPart = effectSummary ? ` → ${effectSummary}` : '';
      return `<div class="key-moment-row">
        <span class="key-moment-time">Min ${min}</span>
        <span class="key-moment-text">${entry.event.title} — ${choice}${effectPart}</span>
      </div>`;
    })
    .join('');

  if (!rows) return '';

  return `<div class="key-moments panel">
    <h3>🎬 Ključni momenti</h3>
    <div class="key-moments-list">${rows}</div>
  </div>`;
}

function buildEffectSummary(effects) {
  if (!effects) return '';
  const parts = [];
  if (effects.moodDelta) parts.push(`${effects.moodDelta > 0 ? '+' : ''}${effects.moodDelta} Crowd Mood`);
  if (effects.hypeDelta) parts.push(`${effects.hypeDelta > 0 ? '+' : ''}${effects.hypeDelta} DJ Hype`);
  if (effects.revenueDelta) parts.push(`${effects.revenueDelta > 0 ? '+' : ''}${Math.round(effects.revenueDelta * 100)}% Prihod`);
  return parts.join(', ');
}

function buildScoreBreakdown(breakdown) {
  const rows = [
    {
      label: '😄 Sreća publike',
      value: breakdown.crowdHappiness,
      max: 100,
      weight: '40%',
      color: moodColor(breakdown.crowdHappiness)
    },
    {
      label: `💰 Prihod (${breakdown.totalRevenue} GC)`,
      value: breakdown.revenueScore,
      max: 150,
      weight: '35%',
      color: '#FFD700'
    },
    {
      label: '🌱 Community Vibe',
      value: breakdown.communityVibe,
      max: 100,
      weight: '25%',
      color: '#4caf50'
    }
  ];

  return rows.map(row => `
    <div class="breakdown-row">
      <div class="breakdown-label">
        <span>${row.label}</span>
        <span class="breakdown-weight">(${row.weight})</span>
      </div>
      <div class="breakdown-bar-track">
        <div class="breakdown-bar-fill" style="width:${Math.min(row.value, row.max) / row.max * 100}%;background:${row.color}"></div>
      </div>
      <span class="breakdown-pct">${Math.min(row.value, row.max)}%</span>
    </div>
  `).join('');
}

function moodColor(val) {
  if (val >= 80) return '#4caf50';
  if (val >= 60) return '#8bc34a';
  if (val >= 40) return '#ff9800';
  return '#f44336';
}

function getBrandEndingNarrative(state, tier) {
  const brands = state.seasonBrands || ['guncati'];
  const brand = brands[0] || 'guncati';
  return BRAND_NARRATIVES[brand]?.winTexts?.[tier] || BRAND_NARRATIVES.guncati.winTexts[tier] || '';
}

function bindScoreEvents(container, winCond, achievements, breakdown) {
  container.querySelector('#btn-share')?.addEventListener('click', async () => {
    const state = getState();
    const card = formatScoreCard(breakdown);
    const brandEnding = getGuncatiBrandEnding(winCond.tier);
    const shareText = `${card}\n\n${brandEnding.shareMessage}`;
    try {
      await shareScore(shareText, state);
    } catch (e) {
      alert('Share nije dostupan na ovom uređaju.');
    }
  });

  container.querySelector('#btn-prestige')?.addEventListener('click', () => {
    if (confirm('Idemo u Stara Šaraga mode? Sve se resetuje osim Reputacije.')) {
      const state = getState();
      const repGain = calcReputationGain(
        breakdown.finalScore, state.prestigeRuns || 0,
        calcCommunityVibe(state.weeklyWB || [])
      );
      setState({ reputation: (state.reputation || 0) + repGain });
      prestigeReset();
      _onPrestige?.();
    }
  });

  container.querySelector('#btn-new-game')?.addEventListener('click', () => {
    if (confirm('Počni novu sezonu? Ovaj napredak se briše.')) {
      clearSave();
      _onNewGame?.();
    }
  });

  container.querySelector('#btn-reset')?.addEventListener('click', () => {
    if (confirm('Obriši SVE podatke? Ova akcija je nepovratna.')) {
      clearSave();
      _onNewGame?.();
    }
  });

  container.querySelector('#btn-ig-report')?.addEventListener('click', async () => {
    const state = getState();
    try {
      await shareSeasonReport(breakdown, state, winCond);
    } catch (e) {
      alert('IG share nije dostupan na ovom uređaju.');
    }
  });
}

function animateScoreCount(container, finalScore) {
  const el = container.querySelector('#score-display');
  if (!el) return;

  let current = 0;
  const step = finalScore / 40;
  const interval = setInterval(() => {
    current = Math.min(current + step, finalScore);
    el.textContent = current.toFixed(1);
    if (current >= finalScore) {
      clearInterval(interval);
      el.textContent = finalScore.toFixed(1);
    }
  }, 40);
}
