import { CONFIG } from './config.js';
import { showToast } from './ui.js';

export function shareAforizam(text) {
  const fullText = text + CONFIG.SHARE_SUFFIX;

  if (navigator.share) {
    navigator.share({
      text: fullText,
    }).catch(() => {
      copyToClipboard(fullText);
    });
  } else {
    copyToClipboard(fullText);
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast("Kopirano! Nalepi u IG story.", 2000))
      .catch(() => execCommandFallback(text));
  } else {
    execCommandFallback(text);
  }
}

function execCommandFallback(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    showToast("Kopirano! Nalepi u IG story.", 2000);
  } catch {
    showToast("Kopiraj ručno — selekcija je aktivna.", 2000);
  }
  document.body.removeChild(ta);
}
