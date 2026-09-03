/** @fileoverview html2canvas screenshot + Web Share API, Final Score share card */

/**
 * Share the final score
 * @param {string} scoreText - formatted score text
 * @param {Object} state - game state
 */
export async function shareScore(scoreText, state) {
  const shareData = {
    title: 'Guncati Grand',
    text: `${scoreText}\n\n🌄 Guncati Grand — Festival Manager\n🎮 mkdsl.github.io/gari-daily-games`,
    url: 'https://mkdsl.github.io/gari-daily-games/games/2026-07-26-guncati-grand/'
  };

  // Try screenshot first (html2canvas is loaded via CDN)
  let screenshotBlob = null;
  try {
    screenshotBlob = await captureScreenshot();
  } catch (e) {
    console.warn('Screenshot failed, sharing text only:', e);
  }

  // Try Web Share API with file (if screenshot worked and navigator.share supports files)
  if (screenshotBlob && navigator.canShare) {
    const file = new File([screenshotBlob], 'guncati-grand-score.png', { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          ...shareData,
          files: [file]
        });
        return { success: true, method: 'share_with_file' };
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('Share with file failed:', e);
      }
    }
  }

  // Try Web Share API without file
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'share_text' };
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('Share failed:', e);
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    return { success: true, method: 'clipboard' };
  } catch (e) {
    console.warn('Clipboard failed:', e);
  }

  // Final fallback: prompt
  prompt('Kopiraj i podeli:', `${scoreText}\n${shareData.url}`);
  return { success: true, method: 'prompt' };
}

/**
 * Capture a screenshot of the current screen state
 * @returns {Promise<Blob>}
 */
async function captureScreenshot() {
  if (typeof html2canvas === 'undefined') {
    throw new Error('html2canvas not loaded');
  }

  const target = document.querySelector('#screen-container') || document.querySelector('#app');
  if (!target) throw new Error('No target element');

  const canvas = await html2canvas(target, {
    backgroundColor: '#1a1208',
    scale: 1,
    useCORS: false,
    logging: false
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas to blob failed'));
    }, 'image/png');
  });
}

/**
 * Create a score card element for sharing
 * @param {Object} breakdown - score breakdown
 * @param {Object} winCond - win condition
 * @returns {HTMLElement}
 */
export function createShareCard(breakdown, winCond) {
  const card = document.createElement('div');
  card.className = 'share-card';
  card.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 400px;
    height: 300px;
    background: #1a1208;
    color: #E8D5B0;
    font-family: monospace;
    padding: 24px;
    border: 2px solid #FFD700;
    border-radius: 12px;
  `;

  card.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:48px">${winCond.emoji}</div>
      <h2 style="color:#FFD700;margin:8px 0">${winCond.message}</h2>
      <div style="font-size:64px;color:#FF6B35;font-weight:bold">${breakdown.finalScore}/10</div>
      <div style="color:#aaa;font-size:14px">
        Sreća ${breakdown.crowdHappiness}% · Prihod ${breakdown.totalRevenue} GC · Zajednica ${breakdown.communityVibe}%
      </div>
      <div style="margin-top:16px;font-size:12px;color:#888">
        🌄 Guncati Grand — mkdsl.github.io/gari-daily-games
      </div>
    </div>
  `;

  return card;
}

/**
 * Build and share a branded IG Story-style Season Report card (9:16 ratio)
 * @param {Object} breakdown - score breakdown
 * @param {Object} state - game state
 * @param {Object} winCond - win condition with tier, emoji, message
 */
export async function shareSeasonReport(breakdown, state, winCond) {
  const card = createSeasonReportCard(breakdown, state, winCond);
  document.body.appendChild(card);

  let blob = null;
  try {
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(card, {
        backgroundColor: '#1a1208',
        scale: 1,
        useCORS: false,
        logging: false
      });
      blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
      });
    }
  } catch (e) {
    console.warn('IG report screenshot failed:', e);
  } finally {
    document.body.removeChild(card);
  }

  const topVolunteer = getTopVolunteer(state);
  const shareText = [
    `${winCond.emoji} Guncati Grand — Sezonski Izveštaj`,
    `Score: ${breakdown.finalScore}/10`,
    `Sreća publike: ${breakdown.crowdHappiness}%`,
    `Prihod: ${breakdown.totalRevenue} GC`,
    `Community Vibe: ${breakdown.communityVibe}%`,
    topVolunteer ? `MVP volonter: ${topVolunteer}` : '',
    '',
    '🌄 Guncati Grand — mkdsl.github.io/gari-daily-games'
  ].filter(Boolean).join('\n');

  const shareData = {
    title: 'Guncati Grand — Sezonski Izveštaj',
    text: shareText,
    url: 'https://mkdsl.github.io/gari-daily-games/games/2026-07-26-guncati-grand/'
  };

  if (blob && navigator.canShare) {
    const file = new File([blob], 'guncati-season-report.png', { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ ...shareData, files: [file] });
        return { success: true, method: 'share_with_file' };
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('Share with file failed:', e);
      }
    }
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'share_text' };
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('Share failed:', e);
    }
  }

  await navigator.clipboard.writeText(`${shareText}\n${shareData.url}`).catch(() => {});
  return { success: true, method: 'clipboard' };
}

/** @param {Object} state */
function getTopVolunteer(state) {
  if (!state.volunteers || state.volunteers.length === 0) return null;
  const best = state.volunteers.reduce((a, b) => {
    const aScore = (a.energija || 0) + (a.vibe || 0);
    const bScore = (b.energija || 0) + (b.vibe || 0);
    return aScore >= bScore ? a : b;
  });
  return best.name || null;
}

/**
 * Build an off-screen IG Story-style (9:16 ratio) Season Report card
 * @param {Object} breakdown
 * @param {Object} state
 * @param {Object} winCond
 * @returns {HTMLElement}
 */
export function createSeasonReportCard(breakdown, state, winCond) {
  const card = document.createElement('div');
  card.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 360px; height: 640px;
    background: linear-gradient(180deg, #1a1208 0%, #0d0a04 100%);
    color: #E8D5B0; font-family: monospace;
    padding: 32px 24px; box-sizing: border-box;
    border: 2px solid #8B4513; border-radius: 16px;
    display: flex; flex-direction: column; gap: 16px;
  `;

  const topVolunteer = getTopVolunteer(state);
  const volunteersCount = (state.volunteers || []).length;

  card.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:40px">${winCond.emoji}</div>
      <div style="color:#FFD700;font-size:18px;font-weight:bold;margin:4px 0">Guncati Grand</div>
      <div style="color:#aaa;font-size:12px">Sezonski Izveštaj</div>
    </div>
    <div style="text-align:center;margin:8px 0">
      <span style="font-size:56px;color:#FF6B35;font-weight:bold">${breakdown.finalScore}</span>
      <span style="color:#888;font-size:20px">/10</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="background:#2a1a08;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px">😄</div>
        <div style="font-size:18px;color:#4caf50;font-weight:bold">${breakdown.crowdHappiness}%</div>
        <div style="font-size:10px;color:#888">Sreća publike</div>
      </div>
      <div style="background:#2a1a08;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px">💰</div>
        <div style="font-size:18px;color:#FFD700;font-weight:bold">${breakdown.totalRevenue}</div>
        <div style="font-size:10px;color:#888">Prihod (GC)</div>
      </div>
      <div style="background:#2a1a08;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px">🌱</div>
        <div style="font-size:18px;color:#8bc34a;font-weight:bold">${breakdown.communityVibe}%</div>
        <div style="font-size:10px;color:#888">Community Vibe</div>
      </div>
      <div style="background:#2a1a08;border-radius:8px;padding:10px;text-align:center">
        <div style="font-size:20px">👥</div>
        <div style="font-size:18px;color:#E8D5B0;font-weight:bold">${volunteersCount}</div>
        <div style="font-size:10px;color:#888">Volonteri</div>
      </div>
    </div>
    ${topVolunteer ? `
    <div style="background:#2a1a08;border-radius:8px;padding:10px;text-align:center">
      <span style="color:#FFD700;font-size:12px">⭐ MVP Volonter: ${topVolunteer}</span>
    </div>` : ''}
    <div style="text-align:center;margin-top:auto;padding-top:16px;border-top:1px solid #3a2a10">
      <div style="color:#8B4513;font-size:11px">🌄 Guncati Grand</div>
      <div style="color:#555;font-size:10px">mkdsl.github.io/gari-daily-games</div>
    </div>
  `;

  return card;
}

/**
 * Download screenshot as file
 * @param {string} filename
 */
export async function downloadScreenshot(filename = 'guncati-grand.png') {
  try {
    const blob = await captureScreenshot();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn('Download failed:', e);
  }
}
