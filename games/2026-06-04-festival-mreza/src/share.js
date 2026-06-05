/** @module share — Share karta builder, html2canvas, Web Share API */

import { randomAforizam } from './content/aforizmi.js';
import { getCareerTierInfo } from './systems/progression.js';
import { CITIES, CITY_ORDER } from './content/cities_data.js';

const CARD_W = 405;
const CARD_H = 720;

/**
 * Build share card DOM element
 * @param {import('./state.js').MacroState} macro
 * @param {import('./state.js').MetaState} meta
 */
export function buildShareCard(macro, meta) {
  const container = document.getElementById('share-card-container');
  if (!container) return;

  const tierInfo = getCareerTierInfo(meta.career_tier);
  const aforizam = randomAforizam();
  const avalaResult = macro.event_results.find(r => r.cityId === 'avala');
  const avalaScore = avalaResult ? Math.round(avalaResult.satisfactionScore) : '?';

  container.innerHTML = `
    <div id="share-card" style="
      width: ${CARD_W}px; height: ${CARD_H}px;
      background: linear-gradient(160deg, #0d1b2e 0%, #1a0a2e 60%, #08080f 100%);
      font-family: 'Courier New', monospace;
      color: #f0f0f5;
      position: relative;
      overflow: hidden;
      padding: 32px;
      box-sizing: border-box;
    ">
      <!-- Background network lines -->
      <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.15" viewBox="0 0 405 720">
        <line x1="73" y1="518" x2="154" y2="324" stroke="#c44dff" stroke-width="1"/>
        <line x1="154" y1="324" x2="235" y2="230" stroke="#c44dff" stroke-width="1"/>
        <line x1="235" y1="230" x2="292" y2="446" stroke="#c44dff" stroke-width="1"/>
        <line x1="235" y1="230" x2="345" y2="158" stroke="#c44dff" stroke-width="1"/>
        <line x1="292" y1="446" x2="345" y2="158" stroke="#c44dff" stroke-width="1"/>
      </svg>

      <!-- Header -->
      <div style="font-size:11px;letter-spacing:3px;color:#c44dff;margin-bottom:4px;text-transform:uppercase">
        Kluboslavija 2026
      </div>
      <div style="font-size:26px;font-weight:bold;line-height:1.1;margin-bottom:24px">
        Festival Mreža
      </div>

      <!-- Career tier badge -->
      <div style="
        display:inline-block;
        border:1px solid ${tierInfo.color};
        color:${tierInfo.color};
        font-size:10px;
        letter-spacing:2px;
        padding:4px 12px;
        border-radius:2px;
        margin-bottom:24px;
        text-transform:uppercase;
      ">${tierInfo.label}</div>

      <!-- City results -->
      <div style="margin-bottom:24px">
        ${buildCityResults(macro)}
      </div>

      <!-- Avala score highlight -->
      <div style="
        border-top:1px solid rgba(196,77,255,0.4);
        padding-top:16px;
        margin-bottom:24px;
        text-align:center;
      ">
        <div style="font-size:11px;letter-spacing:2px;color:#c44dff;margin-bottom:4px">AVALA FINALE</div>
        <div style="font-size:52px;font-weight:bold;color:${avalaScore >= 90 ? '#4df5ff' : avalaScore >= 70 ? '#ffb830' : '#ff4444'}">
          ${avalaScore}%
        </div>
      </div>

      <!-- Prestige info -->
      ${meta.prestige_count > 0 ? `
        <div style="font-size:11px;color:#6a6a9a;margin-bottom:16px;letter-spacing:1px">
          ✦ Prestige ×${meta.prestige_count} | Multiplier ×${meta.prestige_multiplier.toFixed(2)}
        </div>
      ` : ''}

      <!-- Aforizam -->
      <div style="
        font-size:13px;
        font-style:italic;
        color:#c44dff;
        line-height:1.5;
        border-left:2px solid #c44dff;
        padding-left:12px;
        margin-bottom:24px;
        flex:1;
      ">"${aforizam}"</div>

      <!-- Footer -->
      <div style="
        position:absolute;
        bottom:24px;
        left:32px;
        right:32px;
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
      ">
        <div style="font-size:10px;color:#6a6a9a">#Kluboslavija2026</div>
        <div style="font-size:9px;color:#6a6a9a">mkdsl.github.io/gari-daily-games</div>
      </div>
    </div>
  `;
}

function buildCityResults(macro) {
  return CITY_ORDER.map(cityId => {
    const result = macro.event_results.find(r => r.cityId === cityId);
    const city = CITIES[cityId];
    const score = result ? Math.round(result.satisfactionScore) : null;
    const color = score === null ? '#6a6a9a' : score >= 70 ? '#4a7c59' : '#ff4444';

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.05)">
        <div style="font-size:12px;color:#f0f0f5">${city.name}</div>
        <div style="font-size:14px;font-weight:bold;color:${color}">
          ${score !== null ? score + '%' : '—'}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Trigger share flow
 * @param {import('./state.js').MacroState} macro
 * @param {import('./state.js').MetaState} meta
 */
export async function shareResult(macro, meta) {
  buildShareCard(macro, meta);

  const container = document.getElementById('share-card-container');
  const card = document.getElementById('share-card');
  if (!card) return;

  // Try html2canvas if available, otherwise fallback to text share
  try {
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(card, { width: CARD_W, height: CARD_H, scale: 2 });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

      if (navigator.share && blob) {
        await navigator.share({
          title: 'Festival Mreža — Moj rezultat',
          text: `Festival Mreža Kluboslavija 2026 | ${getCareerTierInfo(meta.career_tier).label}`,
          files: [new File([blob], 'festival-mreza.png', { type: 'image/png' })],
        });
      } else {
        // Download fallback
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'festival-mreza-rezultat.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      // Text-only share fallback
      const avalaResult = macro.event_results.find(r => r.cityId === 'avala');
      const score = avalaResult ? Math.round(avalaResult.satisfactionScore) : 0;
      const text = `🎵 Festival Mreža Kluboslavija 2026\n${getCareerTierInfo(meta.career_tier).label}\nAvala: ${score}%\n#Kluboslavija2026\nhttps://mkdsl.github.io/gari-daily-games/games/2026-06-04-festival-mreza/`;

      if (navigator.share) {
        await navigator.share({ title: 'Festival Mreža', text });
      } else {
        navigator.clipboard?.writeText(text);
        alert('Rezultat kopiran u clipboard!');
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') console.warn('Share failed:', err);
  }
}
