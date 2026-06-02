// input.js — click + touch handler sa debounce-om i normalizacijom
import { CONFIG } from './config.js';

/**
 * Inicijalizuje input handlere na canvasu.
 * Svaki klik/tap poziva onAction(normX) gdje je normX
 * normalizovana X pozicija na timing baru (0 = lijevi rub, 1 = desni rub).
 *
 * @param {HTMLCanvasElement} canvas
 * @param {function(number): void} onAction
 * @returns {function(): void} cleanup funkcija
 */
export function initInput(canvas, onAction) {
  let lastActionTime = 0;

  /**
   * Pretvara apsolutnu X koordinatu klijenta u normalizovanu poziciju
   * na timing baru (0-1), clampovanu na [0, 1].
   */
  function clientXToNorm(clientX) {
    const rect    = canvas.getBoundingClientRect();
    // Skaliranje: logički piksel = rect.width / CONFIG.CANVAS_W
    const scaleX  = CONFIG.CANVAS_W / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;

    // Timing bar bounds u logičkim pikselima
    const barW    = CONFIG.CANVAS_W * CONFIG.TIMING_BAR.width;
    const barLeft = (CONFIG.CANVAS_W - barW) / 2;

    const normX = (canvasX - barLeft) / barW;
    return Math.max(0, Math.min(1, normX));
  }

  function handle(e) {
    const now = performance.now();
    if (now - lastActionTime < CONFIG.DEBOUNCE_MS) return;
    lastActionTime = now;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const normX   = clientXToNorm(clientX);
    onAction(normX);
  }

  // Touch handler koji ne koristimo na touchend (handle-ujemo na touchstart)
  function touchHandler(e) {
    e.preventDefault();
    handle(e);
  }

  canvas.addEventListener('click',      handle);
  canvas.addEventListener('touchstart', touchHandler, { passive: false });

  // Cleanup
  return () => {
    canvas.removeEventListener('click',      handle);
    canvas.removeEventListener('touchstart', touchHandler);
  };
}
