export async function shareResult(title, score, url) {
  const text = `Položio/la DJ Akademiju — ${title} 🎛️\nSpreman/a za Štrand 13. jun?\n${url}\n#kluboslavija #strand #djAkademija`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'DJ Akademija', text });
      return;
    } catch (e) {
      // User cancelled or share failed — fall through to clipboard
    }
  }
  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(text);
    showToast('Kopirano u clipboard!');
  } catch (e) {
    showToast('Share nije podržan na ovom uređaju.');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => {
    t.style.display = 'none';
  }, 2500);
}
