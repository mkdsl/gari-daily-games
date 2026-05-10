// share.js — html2canvas screenshot, Web Share API, export/import JSON
import { persistFullState, importState } from './state.js';
import { renderPassport } from './ui.js';
import { playExport } from './audio.js';

export function initShare() {
  document.getElementById('btn-export-json').addEventListener('click', exportJSON);
  document.getElementById('btn-share-screenshot').addEventListener('click', shareScreenshot);
  document.getElementById('import-file').addEventListener('change', onImportFile);
}

// ─── Export JSON ────────────────────────────────────────────────────────────────────

function exportJSON() {
  const state = persistFullState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `kluboslavija-pasos-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  playExport();
}

// ─── Import JSON ────────────────────────────────────────────────────────────────────

function onImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const json = JSON.parse(ev.target.result);
      importState(json);
      renderPassport();
      document.getElementById('export-modal').classList.add('hidden');
      alert('Pasoš importovan! Postojeći pečati su sačuvani.');
    } catch {
      alert('Greška: fajl nije validan pasoš JSON.');
    }
  };
  reader.readAsText(file);
  // Reset input za ponovni import
  e.target.value = '';
}

// ─── Share status helper ────────────────────────────────────────────────────────────

function showShareFallback(msg) {
  let status = document.getElementById('share-status');
  if (!status) {
    status = document.createElement('p');
    status.id = 'share-status';
    status.style.cssText = 'color:#c00; font-size:0.7rem; margin-top:8px; text-align:center;';
    const btn = document.getElementById('btn-share-screenshot');
    if (btn) btn.parentNode.insertBefore(status, btn.nextSibling);
    else document.body.appendChild(status);
  }
  status.textContent = msg;
  setTimeout(() => status.remove(), 3000);
}

// ─── Screenshot share ───────────────────────────────────────────────────────────────

async function shareScreenshot() {
  if (typeof html2canvas === 'undefined') {
    showShareFallback('Napravi screenshot ručno — dugme ne radi bez interneta.');
    return;
  }

  const target = document.querySelector('.passport-main');
  if (!target) return;

  const btn = document.getElementById('btn-share-screenshot');
  btn.textContent = 'Generisem...';
  btn.disabled = true;

  await document.fonts.ready; // obavezno pre html2canvas
  try {
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#f5f0e8' });
    canvas.toBlob(async blob => {
      if (!blob) throw new Error('canvas blob null');
      const file = new File([blob], 'moj-pasos.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Kluboslavija Pasoš — GDG 2026',
          text: 'Moji pečati iz GDG 2026!',
          files: [file]
        });
      } else {
        // Fallback: download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'moj-pasos.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (err) {
    console.warn('[share] html2canvas failed:', err);
    showShareFallback('Screenshot ne radi u ovom browser-u — napravi ručno.');
  } finally {
    btn.textContent = '📷 Podeli screenshot';
    btn.disabled = false;
  }
}
