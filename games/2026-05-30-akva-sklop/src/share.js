export function initShare() {
  document.getElementById('btnShare')?.addEventListener('click', handleShare);
  document.getElementById('btnDownload')?.addEventListener('click', handleDownload);
}

async function handleShare() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  try {
    // Pokušaj Web Share API
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], 'akva-sklop-rezultat.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Akva-Sklop — Guncati Imanje',
        text: 'Upravljam vodom na permakulturnom imanju! 🌿💧',
        files: [file],
        url: 'https://mkdsl.github.io/gari-daily-games/games/2026-05-30-akva-sklop/'
      });
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText('https://mkdsl.github.io/gari-daily-games/games/2026-05-30-akva-sklop/');
      showShareFeedback('Link kopiran u clipboard! 📋');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      showShareFeedback('Share nije uspeo — probaj Download');
    }
  }
}

async function handleDownload() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  try {
    const link = document.createElement('a');
    link.download = 'akva-sklop-rezultat.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch {}
}

function showShareFeedback(msg) {
  const existing = document.getElementById('shareToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'shareToast';
  toast.textContent = msg;
  toast.style.cssText = 'position:fixed;bottom:6rem;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:0.5rem 1rem;border-radius:6px;z-index:100;font-size:0.85rem';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function hideShareOverlay() {
  document.getElementById('shareOverlay').style.display = 'none';
}
