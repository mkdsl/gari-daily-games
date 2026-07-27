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
